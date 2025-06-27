"""
Input validation and sanitization utilities.
"""

import re
import html
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, validator


def sanitize_html(text: str) -> str:
    """Sanitize HTML content to prevent XSS attacks."""
    return html.escape(text)


def sanitize_sql_identifier(identifier: str) -> str:
    """Sanitize SQL identifiers (table names, column names)."""
    # Only allow alphanumeric characters and underscores
    return re.sub(r'[^a-zA-Z0-9_]', '', identifier)


def validate_file_path(path: str) -> bool:
    """Validate file paths to prevent directory traversal."""
    # Check for path traversal patterns
    dangerous_patterns = ['..', '~', '/etc/', '/proc/', '/sys/']
    return not any(pattern in path for pattern in dangerous_patterns)


def validate_url(url: str) -> bool:
    """Validate URLs."""
    url_pattern = re.compile(
        r'^https?://'  # http:// or https://
        r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'  # domain...
        r'localhost|'  # localhost...
        r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # ...or ip
        r'(?::\d+)?'  # optional port
        r'(?:/?|[/?]\S+)$', re.IGNORECASE)
    return url_pattern.match(url) is not None


class SanitizedString(str):
    """A string type that automatically sanitizes HTML on creation."""
    
    def __new__(cls, value: str):
        return super().__new__(cls, sanitize_html(value))


class BaseRequestModel(BaseModel):
    """Base model with common validation for all requests."""
    
    class Config:
        # Strip whitespace from strings
        anystr_strip_whitespace = True
        # Limit string length by default
        max_anystr_length = 10000
        
    @validator('*', pre=True)
    def empty_str_to_none(cls, v):
        """Convert empty strings to None."""
        if isinstance(v, str) and v == '':
            return None
        return v


def validate_pagination(page: int = 1, limit: int = 20) -> tuple[int, int]:
    """Validate and sanitize pagination parameters."""
    # Ensure positive integers
    page = max(1, page)
    # Limit max page size to prevent DoS
    limit = min(max(1, limit), 100)
    return page, limit


def validate_sort_field(field: str, allowed_fields: List[str]) -> Optional[str]:
    """Validate sort field against allowed fields."""
    if field in allowed_fields:
        return field
    return None


def sanitize_filename(filename: str) -> str:
    """Sanitize filename to prevent security issues."""
    # Remove any path components
    filename = filename.split('/')[-1].split('\\')[-1]
    # Remove dangerous characters
    filename = re.sub(r'[^a-zA-Z0-9._-]', '_', filename)
    # Limit length
    name, ext = filename.rsplit('.', 1) if '.' in filename else (filename, '')
    if ext:
        return f"{name[:100]}.{ext[:10]}"
    return name[:100]