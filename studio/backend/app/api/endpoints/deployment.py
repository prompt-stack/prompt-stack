"""
DEPLOYMENT STATUS ENDPOINT

Provides deployment-specific information and diagnostics.
Useful for verifying configuration after deployment.

ENDPOINTS:
- GET /api/deployment/status - Deployment configuration status
"""

from fastapi import APIRouter
from datetime import datetime
from typing import Dict, Any
import os

from app.core.config import settings
from app.models.common import StandardResponse, create_success_response
from app.core.features import features

router = APIRouter()


@router.get("/status", response_model=StandardResponse[Dict[str, Any]])
async def deployment_status():
    """
    Get deployment status and configuration information.
    
    Helps verify that environment variables are properly set
    and services are configured correctly after deployment.
    
    Example response:
    {
        "success": true,
        "data": {
            "deployment": {
                "environment": "production",
                "api_url": "https://backend.railway.app",
                "frontend_url": "https://myapp.vercel.app",
                "cors_configured": true
            },
            "services": {
                "supabase": {
                    "configured": true,
                    "url_present": true,
                    "url_valid": true
                },
                "ai_providers": {
                    "configured": true,
                    "providers": ["openai", "anthropic"]
                }
            },
            "warnings": [],
            "checks_passed": true
        }
    }
    """
    warnings = []
    
    # Check CORS configuration
    cors_configured = False
    if settings.CORS_ORIGINS:
        if isinstance(settings.CORS_ORIGINS, list):
            cors_configured = len(settings.CORS_ORIGINS) > 0
        else:
            cors_configured = bool(settings.CORS_ORIGINS)
    
    # Check Supabase configuration
    supabase_url_present = bool(settings.SUPABASE_URL)
    supabase_url_valid = False
    if supabase_url_present:
        # Check if URL is not truncated (common Railway issue)
        supabase_url_valid = (
            settings.SUPABASE_URL.startswith("https://") and 
            ".supabase.co" in settings.SUPABASE_URL
        )
        if not supabase_url_valid:
            warnings.append("SUPABASE_URL appears truncated or invalid")
    
    # Check frontend URL
    if not settings.FRONTEND_URL:
        warnings.append("FRONTEND_URL not configured")
    
    # Check if CORS matches frontend URL
    if settings.FRONTEND_URL and cors_configured:
        if isinstance(settings.CORS_ORIGINS, list):
            if settings.FRONTEND_URL not in settings.CORS_ORIGINS:
                warnings.append("FRONTEND_URL not in CORS_ORIGINS list")
        elif settings.CORS_ORIGINS != settings.FRONTEND_URL:
            warnings.append("CORS_ORIGINS doesn't match FRONTEND_URL")
    
    # Build response
    deployment_info = {
        "environment": settings.ENVIRONMENT,
        "api_url": os.getenv("RAILWAY_PUBLIC_DOMAIN", "not_deployed"),
        "frontend_url": settings.FRONTEND_URL or "not_configured",
        "cors_configured": cors_configured,
        "cors_origins": settings.CORS_ORIGINS if cors_configured else None
    }
    
    services_info = {
        "supabase": {
            "configured": features.has_auth,
            "url_present": supabase_url_present,
            "url_valid": supabase_url_valid
        },
        "ai_providers": {
            "configured": features.has_real_providers,
            "providers": features.available_providers
        },
        "payments": {
            "configured": features.has_payments,
            "providers": []
        }
    }
    
    # Add payment providers if configured
    if settings.STRIPE_SECRET_KEY:
        services_info["payments"]["providers"].append("stripe")
    if settings.LEMONSQUEEZY_API_KEY:
        services_info["payments"]["providers"].append("lemonsqueezy")
    
    checks_passed = len(warnings) == 0
    
    return create_success_response({
        "deployment": deployment_info,
        "services": services_info,
        "warnings": warnings,
        "checks_passed": checks_passed,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    })