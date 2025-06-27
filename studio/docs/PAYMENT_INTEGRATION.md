# Payment Integration Guide

> **Note**: Payment functionality is currently disabled by default. This guide provides the complete configuration map to add payment processing when needed.

## 🎯 Payment System Architecture

The payment system is designed as **modular building blocks** - choose your provider and use case:

```
💳 Payment System Components
├── 🛒 One-time Purchases (products, courses, templates)
├── 🔄 Subscriptions (SaaS, memberships)  
├── 🎫 License Management (software licenses, API keys)
├── 🌍 Global Tax Handling (EU VAT, US sales tax)
└── 📊 Analytics & Reporting (revenue tracking, metrics)
```

## 🏆 Provider Comparison

### Stripe vs Lemon Squeezy Decision Matrix

| Factor | Stripe | Lemon Squeezy | Winner |
|--------|--------|---------------|---------|
| **Setup Time** | 2-4 hours | 15 minutes | 🍋 LS |
| **Transaction Fees** | 2.9% + $0.30 | 5% + $0.50 | 🔵 Stripe |
| **Tax Handling** | You manage | Automatic | 🍋 LS |
| **File Delivery** | You build | Built-in | 🍋 LS |
| **Subscription Control** | Full control | Basic | 🔵 Stripe |
| **Global Coverage** | 46+ countries | Worldwide | 🍋 LS |

## 🎯 Use Case Recommendations

### Choose Stripe When:
- Building a SaaS with complex subscription logic
- Need multi-party payments (marketplace)
- Want lowest transaction fees
- Need full control over payment flow
- Can handle tax compliance yourself

### Choose Lemon Squeezy When:
- Selling digital products/courses/templates
- Want zero tax complexity
- Need quick setup for MVP
- Selling globally from day one
- Value simplicity over fees

## 🔧 Quick Setup

### Stripe Configuration
```bash
# Backend (.env)
STRIPE_SECRET_KEY=sk_test_your_key_here          # Test mode
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Frontend (.env.local)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
```

### Lemon Squeezy Configuration
```bash
# Backend (.env)
LEMONSQUEEZY_API_KEY=your_api_key
LEMONSQUEEZY_STORE_ID=your_store_id
LEMONSQUEEZY_WEBHOOK_SECRET=your_webhook_secret
LEMONSQUEEZY_MEMBER_DISCOUNT_CODE=MEMBER20    # Optional member discount

# Frontend (.env.local)
NEXT_PUBLIC_LEMONSQUEEZY_STORE_ID=your_store_id
```

## 📁 Implementation Architecture

```
backend/
├── app/services/payments/
│   ├── __init__.py
│   ├── base.py                  # Abstract payment provider
│   ├── stripe_service.py        # Stripe implementation
│   └── lemonsqueezy_service.py  # Lemon Squeezy implementation
├── app/api/endpoints/
│   ├── payments.py              # Payment endpoints
│   └── webhooks.py              # Webhook handlers
└── app/models/
    ├── payment.py               # Already exists (Stripe models)
    └── payment_ls.py            # Already exists (LS models)

frontend/
├── components/payments/
│   ├── StripeCheckout.tsx       # Stripe checkout component
│   ├── LemonSqueezyButton.tsx   # LS buy button
│   └── PaymentSuccess.tsx       # Success page
├── services/
│   └── payments.ts              # Payment API client
└── app/
    ├── checkout/
    │   └── page.tsx             # Checkout page
    └── success/
        └── page.tsx             # Payment success page
```

## 🏗️ Implementation Blocks

### Block 1: Payment Service (Backend)
```python
# backend/app/services/payments/base.py
from abc import ABC, abstractmethod

class PaymentProvider(ABC):
    @abstractmethod
    async def create_checkout_session(self, amount: int, product_name: str) -> dict:
        pass
    
    @abstractmethod
    async def handle_webhook(self, payload: dict) -> bool:
        pass

# backend/app/services/payments/stripe_service.py
import stripe

class StripeService(PaymentProvider):
    def __init__(self, api_key: str):
        stripe.api_key = api_key
    
    async def create_checkout_session(self, amount: int, product_name: str):
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'usd',
                    'product_data': {'name': product_name},
                    'unit_amount': amount,
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url='https://yourapp.com/success',
            cancel_url='https://yourapp.com/cancel',
        )
        return {"checkout_url": session.url, "session_id": session.id}
```

### Block 2: API Endpoints
```python
# backend/app/api/endpoints/payments.py
from fastapi import APIRouter
from app.services.payments import get_payment_service

router = APIRouter()

@router.post("/create-checkout")
async def create_checkout(amount: int, product_name: str):
    payment_service = get_payment_service()  # Auto-detects provider
    return await payment_service.create_checkout_session(amount, product_name)

@router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    # Handle Stripe webhooks
    pass

@router.post("/webhook/lemonsqueezy")  
async def lemonsqueezy_webhook(request: Request):
    # Handle Lemon Squeezy webhooks
    pass
```

### Block 3: Frontend Components
```tsx
// frontend/components/payments/StripeCheckout.tsx
import { loadStripe } from '@stripe/stripe-js'

export function StripeCheckout({ amount, productName }: Props) {
  const handleCheckout = async () => {
    const response = await fetch('/api/payments/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, product_name: productName })
    })
    
    const { checkout_url } = await response.json()
    window.location.href = checkout_url
  }

  return (
    <button onClick={handleCheckout} className="bg-blue-600 text-white px-6 py-3 rounded">
      Buy Now - ${amount / 100}
    </button>
  )
}

// frontend/components/payments/LemonSqueezyButton.tsx
export function LemonSqueezyButton({ variantId }: Props) {
  const handleCheckout = () => {
    window.location.href = `https://store.lemonsqueezy.com/checkout/buy/${variantId}`
  }

  return (
    <button onClick={handleCheckout} className="bg-yellow-500 text-black px-6 py-3 rounded">
      Buy with Lemon Squeezy
    </button>
  )
}
```

## 🗄️ Database Schema

```sql
-- Payment transactions table
CREATE TABLE payment_transactions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  provider varchar NOT NULL,                    -- 'stripe' or 'lemonsqueezy'
  external_id varchar NOT NULL,                 -- Provider's transaction ID
  amount integer NOT NULL,                      -- Amount in cents
  currency varchar DEFAULT 'usd',
  product_name varchar NOT NULL,
  status varchar DEFAULT 'pending',             -- pending, completed, failed, refunded
  metadata jsonb DEFAULT '{}',                  -- Store provider-specific data
  created_at timestamp DEFAULT now(),
  completed_at timestamp,
  UNIQUE(provider, external_id)
);

-- Subscriptions table (for recurring payments)
CREATE TABLE subscriptions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  provider varchar NOT NULL,
  external_id varchar NOT NULL,
  plan_name varchar NOT NULL,
  status varchar DEFAULT 'active',              -- active, canceled, past_due, paused
  current_period_start timestamp,
  current_period_end timestamp,
  cancel_at_period_end boolean DEFAULT false,
  created_at timestamp DEFAULT now(),
  UNIQUE(provider, external_id)
);

-- License keys table (for software products)
CREATE TABLE license_keys (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  transaction_id uuid REFERENCES payment_transactions(id),
  license_key varchar UNIQUE NOT NULL,
  product_name varchar NOT NULL,
  max_activations integer DEFAULT 1,
  current_activations integer DEFAULT 0,
  expires_at timestamp,
  created_at timestamp DEFAULT now()
);
```

## 🚀 Activation Steps

### 1. Choose Your Provider
```bash
# For Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# For Lemon Squeezy  
LEMONSQUEEZY_API_KEY=...
LEMONSQUEEZY_STORE_ID=...
```

### 2. Create Payment Service
```python
# backend/app/services/payments/__init__.py
from app.core.config import settings
from .stripe_service import StripeService
from .lemonsqueezy_service import LemonSqueezyService

def get_payment_service():
    if settings.STRIPE_SECRET_KEY:
        return StripeService(settings.STRIPE_SECRET_KEY)
    elif settings.LEMONSQUEEZY_API_KEY:
        return LemonSqueezyService(settings.LEMONSQUEEZY_API_KEY)
    else:
        raise ValueError("No payment provider configured")
```

### 3. Add Database Tables
```bash
# Create new migration
supabase migration new add_payment_tables

# Add the SQL schema above to the migration file
supabase db push
```

### 4. Create Frontend Components
```bash
# Install payment dependencies
npm install @stripe/stripe-js  # For Stripe
# Lemon Squeezy uses direct links, no SDK needed
```

### 5. Test Your Setup
```bash
# Backend health check
curl http://localhost:8000/api/payments/status

# Test checkout creation
curl -X POST http://localhost:8000/api/payments/create-checkout \
  -H "Content-Type: application/json" \
  -d '{"amount": 2999, "product_name": "Premium Plan"}'
```

## 💼 Common Use Cases

### SaaS Subscription
```python
# Monthly subscription with Stripe
session = stripe.checkout.Session.create(
    payment_method_types=['card'],
    line_items=[{
        'price': 'price_1234567890',  # Stripe Price ID
        'quantity': 1,
    }],
    mode='subscription',
    success_url='https://yourapp.com/welcome',
    cancel_url='https://yourapp.com/pricing',
)
```

### Digital Product Sale
```python
# One-time purchase with Lemon Squeezy
checkout_url = f"https://store.lemonsqueezy.com/checkout/buy/{variant_id}?checkout[custom][user_id]={user.id}"
```

### Course/Template Sale
```tsx
// Course purchase component
<StripeCheckout 
  amount={9900}  // $99.00
  productName="AI Development Course"
  successUrl="/course/welcome"
/>
```

## 🔄 Webhook Handling

### Stripe Webhooks
```python
@router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')
    
    event = stripe.Webhook.construct_event(
        payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
    )
    
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        # Update database, send confirmation email, etc.
        await handle_successful_payment(session)
    
    return {"status": "success"}
```

### Lemon Squeezy Webhooks
```python
@router.post("/webhook/lemonsqueezy")
async def lemonsqueezy_webhook(request: Request):
    payload = await request.body()
    signature = request.headers.get('X-Signature')
    
    # Verify signature
    expected_signature = hmac.new(
        settings.LEMONSQUEEZY_WEBHOOK_SECRET.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()
    
    if hmac.compare_digest(expected_signature, signature):
        data = json.loads(payload)
        if data['meta']['event_name'] == 'order_created':
            await handle_lemonsqueezy_order(data['data'])
    
    return {"status": "success"}
```

## 🎨 UI Components

### Pricing Page Example
```tsx
// frontend/app/pricing/page.tsx
export default function PricingPage() {
  return (
    <div className="grid md:grid-cols-3 gap-8">
      <PricingCard
        name="Starter"
        price={29}
        features={["Basic AI access", "5 projects", "Email support"]}
        stripePriceId="price_starter_monthly"
      />
      <PricingCard
        name="Pro"
        price={99}
        features={["Unlimited AI access", "Unlimited projects", "Priority support"]}
        stripePriceId="price_pro_monthly"
        popular
      />
      <PricingCard
        name="Enterprise"
        price={299}
        features={["Custom AI models", "Team management", "Dedicated support"]}
        stripePriceId="price_enterprise_monthly"
      />
    </div>
  )
}
```

## 📋 Testing Checklist

- [ ] Stripe test payments work
- [ ] Lemon Squeezy test purchases work
- [ ] Webhooks update database correctly
- [ ] Failed payments are handled gracefully
- [ ] Success/cancel redirects work
- [ ] Email confirmations send
- [ ] Subscription cancellations work
- [ ] Refunds process correctly
- [ ] Tax calculations are accurate (LS only)

## 🌍 Environment Variables Reference

```bash
# === STRIPE CONFIGURATION ===
STRIPE_SECRET_KEY=sk_test_...                    # Test: sk_test_, Live: sk_live_
STRIPE_WEBHOOK_SECRET=whsec_...                  # From Stripe Dashboard
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...   # Frontend Stripe key

# === LEMON SQUEEZY CONFIGURATION ===
LEMONSQUEEZY_API_KEY=...                         # From LS Dashboard
LEMONSQUEEZY_STORE_ID=...                        # Your store ID
LEMONSQUEEZY_WEBHOOK_SECRET=...                  # For webhook verification
LEMONSQUEEZY_MEMBER_DISCOUNT_CODE=MEMBER20       # Optional member discount

# === PAYMENT SETTINGS ===
PAYMENT_CURRENCY=usd                             # Default currency
PAYMENT_SUCCESS_URL=https://yourapp.com/success  # After successful payment
PAYMENT_CANCEL_URL=https://yourapp.com/cancel    # After cancelled payment
```

## 🚨 Security Considerations

1. **Always verify webhooks** with provided signatures
2. **Never trust frontend payment data** - validate on backend
3. **Use HTTPS in production** for all payment endpoints
4. **Store minimal payment data** - let providers handle sensitive info
5. **Implement idempotency** for webhook processing
6. **Log all payment events** for debugging and compliance

---

**💡 Pro Tip**: Start with Lemon Squeezy for quick MVP validation, then migrate to Stripe when you need advanced features. Both providers can coexist in the same codebase.