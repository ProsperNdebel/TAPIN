# backend/app/api/routes/trends.py

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional
from pydantic import BaseModel
from app.core.database import SessionLocal
from app.models.raw_data import RawData
from app.models.trend import Trend
from app.models.category import Category
from datetime import datetime, timedelta
from firebase_admin import auth, firestore

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ============================================================================
# AI-CURATED TRENDS ENDPOINTS (Use these!)
# ============================================================================

@router.get("/trends")
async def get_all_trends(
    category: str = None,
    search: str = None,
    db: Session = Depends(get_db)
):
    """Get AI-curated trends from the trends table"""
    
    query = db.query(Trend).join(Category, Trend.category_id == Category.id, isouter=True)
    
    # Filter by category
    if category and category != 'All':
        query = query.filter(Category.name == category)
    
    # Filter by search
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Trend.title.ilike(search_term),
                Trend.description.ilike(search_term)
            )
        )
    
    # Get trends ordered by relevance
    trends = query.order_by(
        Trend.relevance_score.desc(),
        Trend.created_at.desc()
    ).limit(20).all()
    
    return {
        "trends": [
            {
                "id": t.id,
                "title": t.title,
                "description": t.description,
                "why_it_matters": t.why_it_matters,
                "how_to_talk_about_it": t.how_to_talk_about_it,
                "category": {"name": t.category.name} if t.category else None,
                "relevance_score": t.relevance_score,
                "sources": t.sources,
                "week_start": t.week_start,
                "week_end": t.week_end,
                "created_at": t.created_at
            }
            for t in trends
        ]
    }


@router.get("/trends/weekly")
async def get_weekly_trends_curated(db: Session = Depends(get_db)):
    """Get this week's AI-curated trends"""
    
    week_start = datetime.utcnow() - timedelta(days=7)
    
    trends = db.query(Trend).join(
        Category, Trend.category_id == Category.id, isouter=True
    ).filter(
        Trend.week_start >= week_start
    ).order_by(
        Trend.relevance_score.desc()
    ).limit(10).all()
    
    return {
        "trends": [
            {
                "id": t.id,
                "title": t.title,
                "description": t.description,
                "why_it_matters": t.why_it_matters,
                "how_to_talk_about_it": t.how_to_talk_about_it,
                "category": {"name": t.category.name} if t.category else None,
                "relevance_score": t.relevance_score,
                "sources": t.sources,
                "week_start": t.week_start,
                "week_end": t.week_end,
                "created_at": t.created_at
            }
            for t in trends
        ]
    }


@router.get("/trends/{trend_id}")
async def get_trend_by_id(trend_id: int, db: Session = Depends(get_db)):
    """Get detailed information about a specific trend"""
    
    trend = db.query(Trend).join(
        Category, Trend.category_id == Category.id, isouter=True
    ).filter(Trend.id == trend_id).first()
    
    if not trend:
        raise HTTPException(status_code=404, detail="Trend not found")
    
    return {
        "id": trend.id,
        "title": trend.title,
        "description": trend.description,
        "why_it_matters": trend.why_it_matters,
        "how_to_talk_about_it": trend.how_to_talk_about_it,
        "category": {"name": trend.category.name} if trend.category else None,
        "relevance_score": trend.relevance_score,
        "sources": trend.sources,
        "week_start": trend.week_start,
        "week_end": trend.week_end,
        "created_at": trend.created_at
    }


@router.get("/trends/category/{category}")
async def get_trends_by_category(category: str, db: Session = Depends(get_db)):
    """Get AI-curated trends filtered by category"""
    
    trends = db.query(Trend).join(
        Category, Trend.category_id == Category.id
    ).filter(
        Category.name.ilike(category)
    ).order_by(
        Trend.relevance_score.desc()
    ).limit(20).all()
    
    return {
        "category": category,
        "trends": [
            {
                "id": t.id,
                "title": t.title,
                "description": t.description,
                "why_it_matters": t.why_it_matters,
                "how_to_talk_about_it": t.how_to_talk_about_it,
                "category": {"name": t.category.name} if t.category else None,
                "relevance_score": t.relevance_score,
                "sources": t.sources,
                "week_start": t.week_start,
                "week_end": t.week_end,
                "created_at": t.created_at
            }
            for t in trends
        ]
    }


@router.get("/trends/archive")
async def get_archive(db: Session = Depends(get_db), page: int = 1, limit: int = 10):
    """Get archive of past AI-curated trends"""
    
    offset = (page - 1) * limit
    
    trends = db.query(Trend).join(
        Category, Trend.category_id == Category.id, isouter=True
    ).order_by(
        Trend.created_at.desc()
    ).offset(offset).limit(limit).all()
    
    total = db.query(Trend).count()
    
    return {
        "page": page,
        "total_pages": (total + limit - 1) // limit,
        "trends": [
            {
                "id": t.id,
                "title": t.title,
                "description": t.description,
                "category": {"name": t.category.name} if t.category else None,
                "relevance_score": t.relevance_score,
                "week_start": t.week_start,
                "week_end": t.week_end,
                "created_at": t.created_at
            }
            for t in trends
        ]
    }


@router.get("/trends/archive/{week_start}")
async def get_archive_week(week_start: str, db: Session = Depends(get_db)):
    """Get AI-curated trends for a specific week"""
    
    try:
        start_date = datetime.strptime(week_start, "%Y-%m-%d")
        end_date = start_date + timedelta(days=7)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    trends = db.query(Trend).join(
        Category, Trend.category_id == Category.id, isouter=True
    ).filter(
        Trend.week_start >= start_date,
        Trend.week_start < end_date
    ).order_by(
        Trend.relevance_score.desc()
    ).all()
    
    return {
        "week_start": week_start,
        "week_end": end_date.strftime("%Y-%m-%d"),
        "trend_count": len(trends),
        "trends": [
            {
                "id": t.id,
                "title": t.title,
                "description": t.description,
                "why_it_matters": t.why_it_matters,
                "how_to_talk_about_it": t.how_to_talk_about_it,
                "category": {"name": t.category.name} if t.category else None,
                "relevance_score": t.relevance_score,
                "sources": t.sources,
                "week_start": t.week_start,
                "week_end": t.week_end,
                "created_at": t.created_at
            }
            for t in trends
        ]
    }


# ============================================================================
# EMAIL SUBSCRIPTION ENDPOINTS
# ============================================================================

class EmailSubscriptionRequest(BaseModel):
    email: str
    subscribe: bool


@router.post("/email/subscribe")
def subscribe_to_email_digest(request: EmailSubscriptionRequest):
    """Subscribe or unsubscribe from weekly email digest (Firestore)"""
    try:
        firestore_db = firestore.client()
        
        users_ref = firestore_db.collection('users').where('email', '==', request.email).stream()
        
        user_found = False
        for user_doc in users_ref:
            firestore_db.collection('users').document(user_doc.id).update({
                'email_notifications': request.subscribe
            })
            user_found = True
            break
        
        if not user_found:
            # Create new subscriber
            firestore_db.collection('users').add({
                'email': request.email,
                'email_notifications': request.subscribe,
                'created_at': firestore.SERVER_TIMESTAMP
            })
        
        status = "subscribed" if request.subscribe else "unsubscribed"
        return {
            "success": True,
            "message": f"Successfully {status} to email digest",
            "email": request.email,
            "email_notifications": request.subscribe
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update subscription: {str(e)}"
        )


@router.get("/email/subscription-status/{email}")
def get_subscription_status(email: str):
    """Get email subscription status for a user (Firestore)"""
    try:
        firestore_db = firestore.client()
        
        users_ref = firestore_db.collection('users').where('email', '==', email).stream()
        
        for user_doc in users_ref:
            user_data = user_doc.to_dict()
            return {
                "email": email,
                "email_notifications": user_data.get('email_notifications', True),
                "last_email_sent": user_data.get('last_email_sent').isoformat() if user_data.get('last_email_sent') else None
            }
        
        return {
            "email": email,
            "email_notifications": False,
            "last_email_sent": None
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get subscription status: {str(e)}"
        )


@router.post("/email/test-send/{email}")
def test_send_digest_email(email: str):
    """Test endpoint to send a digest email immediately (for testing purposes)"""
    try:
        from app.tasks.email_scheduler import test_send_digest_email as send_test
        
        success = send_test(email)
        
        if success:
            return {
                "success": True,
                "message": f"Test email sent successfully to {email}"
            }
        else:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to send test email to {email}"
            )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error sending test email: {str(e)}"
        )