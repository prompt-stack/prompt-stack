"""
Request logging middleware for tracing and monitoring.
"""

import time
import uuid
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request, Response

from app.core.logging import get_request_logger


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware to log all requests with timing and trace ID."""
    
    async def dispatch(self, request: Request, call_next):
        # Generate request ID for tracing
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id
        
        # Create request logger
        logger = get_request_logger(request_id)
        
        # Log request start
        start_time = time.time()
        logger.info(
            "Request started",
            method=request.method,
            url=str(request.url),
            client_ip=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent"),
        )
        
        try:
            # Process request
            response = await call_next(request)
            
            # Calculate duration
            duration = time.time() - start_time
            
            # Log successful request
            logger.info(
                "Request completed",
                status_code=response.status_code,
                duration_ms=round(duration * 1000, 2),
            )
            
            # Add request ID to response headers for debugging
            response.headers["X-Request-ID"] = request_id
            
            return response
            
        except Exception as exc:
            # Calculate duration for failed requests
            duration = time.time() - start_time
            
            # Log failed request
            logger.error(
                "Request failed",
                error=str(exc),
                duration_ms=round(duration * 1000, 2),
                exc_info=True,
            )
            
            # Re-raise the exception
            raise exc