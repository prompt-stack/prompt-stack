"""
Enhanced rate limiting configuration with Redis support.
"""

import os
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.middleware import SlowAPIMiddleware
from slowapi.errors import RateLimitExceeded
from fastapi import Request, Response
from fastapi.responses import JSONResponse

# Check if Redis is available
REDIS_URL = os.getenv("REDIS_URL")

if REDIS_URL:
    # Use Redis for distributed rate limiting
    import redis
    from slowapi.extension import LimitStorage
    
    redis_client = redis.from_url(REDIS_URL)
    storage = LimitStorage(redis_client)
    limiter = Limiter(
        key_func=get_remote_address,
        storage=storage,
        default_limits=["100 per minute"]
    )
else:
    # Fallback to in-memory storage
    limiter = Limiter(
        key_func=get_remote_address,
        default_limits=["100 per minute"],
        storage_uri="memory://"
    )


def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded) -> Response:
    """Custom handler for rate limit exceeded errors."""
    retry_after = exc.retry_after if hasattr(exc, 'retry_after') else 60
    
    return JSONResponse(
        status_code=429,
        content={
            "success": False,
            "error": "Rate limit exceeded",
            "code": "RATE_LIMIT_EXCEEDED",
            "data": {
                "retry_after": retry_after,
                "message": f"Too many requests. Please try again in {retry_after} seconds."
            }
        },
        headers={
            "Retry-After": str(retry_after),
            "X-RateLimit-Limit": str(exc.limit),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": str(exc.reset)
        }
    )


# Specific rate limits for different endpoints
auth_limiter = limiter.limit("5 per minute")  # Strict for auth
api_limiter = limiter.limit("30 per minute")  # Standard API
llm_limiter = limiter.limit("10 per minute")  # AI endpoints
upload_limiter = limiter.limit("5 per hour")  # File uploads