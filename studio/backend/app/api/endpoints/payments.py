"""Payment configuration and status endpoints."""
from fastapi import APIRouter
from typing import Dict
from app.core.config import settings

router = APIRouter(tags=["payments"])

@router.get("/stripe/status")
async def stripe_status() -> Dict:
    """Check Stripe configuration status."""
    configured = bool(settings.STRIPE_SECRET_KEY)
    test_mode = settings.STRIPE_SECRET_KEY.startswith("sk_test_") if configured else None
    
    return {
        "configured": configured,
        "message": "Stripe is configured in LIVE mode!" if configured and not test_mode else 
                  "Stripe is configured in TEST mode" if configured else
                  "Add STRIPE_SECRET_KEY to .env to enable (see docs/PAYMENT_INTEGRATION.md)",
        "test_mode": test_mode,
        "webhook_configured": bool(settings.STRIPE_WEBHOOK_SECRET),
        "docs": "See docs/PAYMENT_INTEGRATION.md for implementation guide"
    }

@router.get("/lemonsqueezy/status")
async def lemonsqueezy_status() -> Dict:
    """Check Lemon Squeezy configuration status."""
    configured = bool(settings.LEMONSQUEEZY_API_KEY)
    
    return {
        "configured": configured,
        "message": "Lemon Squeezy is configured!" if configured else 
                  "Add LEMONSQUEEZY_API_KEY to .env to enable (see docs/PAYMENT_INTEGRATION.md)",
        "store_id": settings.LEMONSQUEEZY_STORE_ID if configured else None,
        "webhook_configured": bool(settings.LEMONSQUEEZY_WEBHOOK_SECRET),
        "member_discount_code": settings.LEMONSQUEEZY_MEMBER_DISCOUNT_CODE if configured else None,
        "docs": "See docs/PAYMENT_INTEGRATION.md for implementation guide"
    }

# Payment functionality disabled by default - see docs/PAYMENT_INTEGRATION.md to enable
# 
# Example endpoints to implement:
# @router.post("/create-checkout")
# @router.post("/webhook/stripe") 
# @router.post("/webhook/lemonsqueezy")