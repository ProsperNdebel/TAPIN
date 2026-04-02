import os
import stripe
from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse
from firebase_admin import firestore

router = APIRouter()

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
endpoint_secret = os.getenv("STRIPE_WEBHOOK_SECRET")

# Plan pricing configuration
PLAN_PRICES = {
    "individual": os.getenv("STRIPE_PRICE_INDIVIDUAL", "price_1SxMpfAnZO4xYeTn1jccjCUS"),  # $3.99/month
    "school": os.getenv("STRIPE_PRICE_SCHOOL", "price_1234567890"),  # $299/year
    "district": os.getenv("STRIPE_PRICE_DISTRICT", "price_0987654321"),  # Custom pricing
}

# Success and cancel URLs
SUCCESS_URL = os.getenv("STRIPE_SUCCESS_URL", "http://localhost:5173/subscribeSuccess")
CANCEL_URL = os.getenv("STRIPE_CANCEL_URL", "http://localhost:5173/subscribeCancel")

@router.post("/create-checkout-session")
async def create_checkout_session(request: Request):
    try:
        body = await request.json()
        plan_type = body.get("planType", "individual")
        uid = body.get("uid")
        school_name = body.get("schoolName", "")
        admin_email = body.get("adminEmail", "")

        # Get the appropriate price ID for the plan
        price_id = PLAN_PRICES.get(plan_type)
        if not price_id:
            raise ValueError(f"Invalid plan type: {plan_type}")

        # Build metadata
        metadata = {
            "planType": plan_type,
        }
        
        if uid:
            metadata["firebaseUID"] = uid
        if school_name:
            metadata["schoolName"] = school_name
        if admin_email:
            metadata["adminEmail"] = admin_email

        # Create checkout session
        session = stripe.checkout.Session.create(
            mode="subscription",
            line_items=[
                {
                    "price": price_id,
                    "quantity": 1,
                }
            ],
            success_url=SUCCESS_URL,
            cancel_url=CANCEL_URL,
            metadata=metadata,
            customer_email=admin_email if admin_email else None,
        )

        return {"url": session.url}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret
        )
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid webhook")

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        uid = session["metadata"].get("firebaseUID")
        plan_type = session["metadata"].get("planType")
        school_name = session["metadata"].get("schoolName")
        admin_email = session["metadata"].get("adminEmail")

        if uid:
            # Update user subscription status in Firestore
            db = firestore.client()
            update_data = {
                "isSubscribed": True,
                "planType": plan_type,
            }
            
            # Add school/district specific data if provided
            if school_name:
                update_data["schoolName"] = school_name
            if admin_email:
                update_data["adminEmail"] = admin_email
            
            db.collection("users").document(uid).update(update_data)
            print(f"✅ User {uid} subscription activated for plan: {plan_type}")
        elif admin_email and plan_type == "school":
            # For school purchases without Firebase UID, store in Firestore
            db = firestore.client()
            db.collection("schools").add({
                "name": school_name,
                "adminEmail": admin_email,
                "planType": plan_type,
                "stripeSessionId": session["id"],
                "active": True,
            })
            print(f"✅ School subscription activated: {school_name}")

    return JSONResponse(content={"status": "success"})
