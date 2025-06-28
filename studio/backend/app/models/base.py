"""Base models with built-in security."""

from pydantic import BaseModel as PydanticBaseModel, validator
import html
from typing import Any


class BaseModel(PydanticBaseModel):
    """Base model with automatic HTML escaping for string fields."""
    
    @validator('*', pre=True)
    def escape_html_strings(cls, v: Any) -> Any:
        """Automatically escape HTML in string fields to prevent XSS."""
        if isinstance(v, str):
            # Only escape if it contains potential HTML
            if '<' in v or '>' in v or '&' in v:
                return html.escape(v)
        return v
    
    class Config:
        # Your existing config
        anystr_strip_whitespace = True