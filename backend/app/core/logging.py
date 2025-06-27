"""
Centralized logging configuration for the application.
Provides structured logging with request tracing.
"""

import logging
import sys
import json
from datetime import datetime
from typing import Dict, Any

from app.core.config import settings


class StructuredFormatter(logging.Formatter):
    """Custom formatter for structured JSON logging."""
    
    def format(self, record: logging.LogRecord) -> str:
        # Base log entry
        log_entry = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        
        # Add exception info if present
        if record.exc_info:
            log_entry["exception"] = self.formatException(record.exc_info)
        
        # Add any extra fields
        for key, value in record.__dict__.items():
            if key not in ("name", "msg", "args", "levelname", "levelno", "pathname", 
                          "filename", "module", "lineno", "funcName", "created", 
                          "msecs", "relativeCreated", "thread", "threadName", 
                          "processName", "process", "message", "exc_info", "exc_text", 
                          "stack_info"):
                log_entry[key] = value
        
        return json.dumps(log_entry, default=str)


def setup_logging():
    """Configure application logging."""
    
    # Root logger configuration
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO if settings.ENVIRONMENT == "production" else logging.DEBUG)
    
    # Clear existing handlers
    root_logger.handlers.clear()
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    
    if settings.ENVIRONMENT == "production":
        # Structured JSON logging for production
        console_handler.setFormatter(StructuredFormatter())
    else:
        # Human-readable logging for development
        formatter = logging.Formatter(
            "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
        )
        console_handler.setFormatter(formatter)
    
    root_logger.addHandler(console_handler)
    
    # Set levels for noisy libraries
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    
    return root_logger


class RequestLogger:
    """Helper for request-specific logging with tracing."""
    
    def __init__(self, request_id: str = None):
        self.request_id = request_id or "unknown"
        self.logger = logging.getLogger("request")
    
    def info(self, message: str, **kwargs):
        self.logger.info(message, extra={"request_id": self.request_id, **kwargs})
    
    def warning(self, message: str, **kwargs):
        self.logger.warning(message, extra={"request_id": self.request_id, **kwargs})
    
    def error(self, message: str, **kwargs):
        self.logger.error(message, extra={"request_id": self.request_id, **kwargs})
    
    def debug(self, message: str, **kwargs):
        self.logger.debug(message, extra={"request_id": self.request_id, **kwargs})


def get_request_logger(request_id: str = None) -> RequestLogger:
    """Get a request-specific logger."""
    return RequestLogger(request_id)