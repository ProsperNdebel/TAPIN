# Stripe Integration for School Payments - ForSchools.jsx

## Overview
This document outlines the Stripe payment integration added to the ForSchools page for schools to subscribe to the $299/year School plan.

## Files Modified

### 1. Frontend - API Service
**File:** `frontend_new/src/services/api.js`

**Changes:**
- Added `createCheckoutSession()` function to handle Stripe checkout session creation
- Accepts options object with:
  - `planType`: 'school', 'individual', or 'district'
  - `schoolName`: Optional school name for context
  - `adminEmail`: Optional admin email for customer tracking
  - `uid`: Optional Firebase UID for user linking

```javascript
export function createCheckoutSession(options = {}) {
  return request('/stripe/create-checkout-session', {
    method: 'POST',
    body: JSON.stringify(options),
  })
}
```

### 2. Frontend - ForSchools Component
**File:** `frontend_new/src/pages/ForSchools.jsx`

**Changes:**
- Imported `createCheckoutSession` from API service
- Added state management:
  - `showCheckoutModal`: Controls modal visibility
  - `checkoutLoading`: Manages loading state during checkout
  - `checkoutError`: Displays error messages
  - `formData`: Stores school name and admin email

- Added `handleSchoolCheckout()` function:
  - Validates form data
  - Calls API to create Stripe session
  - Redirects to Stripe checkout on success
  - Displays error messages on failure

- Modified School plan card:
  - "Contact us" link now opens checkout modal
  - Modal collects school name and admin email
  - Form validates before submission

- Added modal component with:
  - Clean, professional design
  - Email and school name input fields
  - Error handling and validation
  - Loading state feedback
  - Privacy note about Stripe redirect

### 3. Frontend - Styles
**File:** `frontend_new/src/pages/ForSchools.module.css`

**Changes:**
- Added modal overlay styles (`.modalOverlay`)
- Added modal content styles (`.modalContent`) with slide-up animation
- Added modal close button (`.modalClose`)
- Added form styles (`.formGroup`, `.formGroup input`, etc.)
- Added submit button with hover effects (`.submitBtn`)
- Added error message styling (`.errorMessage`)
- Added responsive design for mobile devices
- Added smooth animations and transitions

### 4. Backend - Stripe Route
**File:** `backend/app/api/routes/stripe.py`

**Changes:**
- Added plan pricing configuration:
  ```python
  PLAN_PRICES = {
      "individual": "price_1SqlE6AnZO4xYeTnr4jldL5T",
      "school": "price_1SqlE6AnZO4xYeTnr4jldL5T",
      "district": "price_1SqlE6AnZO4xYeTnr4jldL5T",
  }
  ```

- Updated `create_checkout_session()` endpoint:
  - Accepts `planType` parameter (defaults to 'individual')
  - Extracts school name and admin email from request
  - Builds rich metadata for webhook processing
  - Sets customer email for Stripe invoicing
  - Handles different plan types with appropriate pricing

- Enhanced webhook handler:
  - Extracts plan type from metadata
  - Stores school-specific data (name, email, plan type)
  - For school purchases without Firebase UID:
    - Creates new document in `schools` collection
    - Stores school details for CRM purposes
  - For users with Firebase UID:
    - Updates user document with plan type and school info

## Environment Variables Required

Add these to your `.env` files:

**Backend** (`.env` or config):
```
STRIPE_SECRET_KEY=sk_live_xxxxx      # Your Stripe secret key
STRIPE_WEBHOOK_SECRET=whsec_xxxxx    # Your webhook signing secret
STRIPE_SUCCESS_URL=https://yourdomain.com/subscribeSuccess
STRIPE_CANCEL_URL=https://yourdomain.com/subscribeCancel
```

**Important:** Replace placeholder price IDs with actual Stripe price IDs from your dashboard.

## Stripe Setup Checklist

1. **Create Product and Price:**
   - Create a product called "School Plan"
   - Add a price of $299/year
   - Copy the price ID to `PLAN_PRICES["school"]`

2. **Set Up Webhooks:**
   - Go to Stripe Dashboard → Developers → Webhooks
   - Add endpoint for checkout completion
   - Events: `checkout.session.completed`
   - Endpoint URL: `https://yourdomain.com/api/stripe/webhook`
   - Copy signing secret to `STRIPE_WEBHOOK_SECRET`

3. **Configure CORS:**
   - Update `backend/app/main.py` CORS origins if needed for production domain

## Data Flow

### Checkout Flow
```
User clicks "Contact us" on School plan
         ↓
Modal opens with school name & email form
         ↓
User submits form
         ↓
Frontend calls createCheckoutSession({ planType: 'school', ... })
         ↓
Backend creates Stripe checkout session
         ↓
Frontend redirects to Stripe checkout page
         ↓
User completes payment on Stripe
         ↓
Stripe sends webhook to backend
         ↓
Backend stores school/user data in Firestore
         ↓
User redirected to success page
```

### Firestore Collections

**For Firebase UID users:**
- Collection: `users/{uid}`
- Updates:
  - `isSubscribed: true`
  - `planType: "school"`
  - `schoolName: "..."`
  - `adminEmail: "..."`

**For non-authenticated school purchases:**
- Collection: `schools`
- New document with:
  - `name`: School name
  - `adminEmail`: Admin email
  - `planType`: "school"
  - `stripeSessionId`: Session ID
  - `active: true`

## Testing

### Local Testing
1. Use Stripe test API keys
2. Use test card: `4242 4242 4242 4242`
3. Any future date for expiry
4. Any CVC

### Production Deployment
1. Switch to live Stripe API keys
2. Update environment variables
3. Set correct webhook URL
4. Test webhook delivery in Stripe Dashboard

## Success/Cancel Pages

The integration redirects to:
- **Success:** `/subscribeSuccess`
- **Cancel:** `/subscribeCancel`

Ensure these routes exist in your frontend and handle accordingly.

## Future Enhancements

1. **District Plans:**
   - Add separate district checkout flow
   - Support custom pricing negotiation
   - Multi-school management

2. **Account Portal:**
   - Stripe customer portal for subscription management
   - Usage analytics dashboard
   - Invoice management

3. **Email Notifications:**
   - Send welcome email to admin
   - Send renewal reminders
   - Send usage reports

4. **Validation Improvements:**
   - School domain verification
   - Admin email verification
   - Duplicate school prevention

## Error Handling

The implementation includes:
- Form validation (required fields)
- API error capture and display
- Network error handling
- Loading state feedback
- User-friendly error messages

## Security Notes

1. Always use HTTPS in production
2. Never expose Stripe secret keys in frontend
3. Validate all webhook signatures
4. Use environment variables for sensitive data
5. Implement rate limiting on checkout endpoint
6. Consider CSRF protection for forms
