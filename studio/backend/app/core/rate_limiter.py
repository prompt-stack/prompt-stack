"""
Simple rate limiting for early-stage apps.
"""

from slowapi import Limiter
from slowapi.util import get_remote_address

# In-memory rate limiting is PERFECT for 1-1000 users
# Don't add Redis until you actually need it
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["100 per minute"],
    storage_uri="memory://"
)

# Specific limits for different endpoint types
auth_limiter = limiter.limit("3 per minute")   # Strict for auth
admin_limiter = limiter.limit("10 per minute") # Admin operations  
api_limiter = limiter.limit("30 per minute")   # General API
upload_limiter = limiter.limit("5 per hour")   # File uploads