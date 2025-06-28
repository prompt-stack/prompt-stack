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

# Rate limit decorators to use on specific endpoints
# Usage: @limiter.limit("10 per minute")
# 
# Common limits:
# - Auth endpoints: "3 per minute"
# - Admin operations: "10 per minute"
# - General API: "30 per minute"
# - File uploads: "5 per hour"