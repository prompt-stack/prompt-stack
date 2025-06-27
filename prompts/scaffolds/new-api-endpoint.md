# Scaffold: New API Endpoint

## Prompt Template
```
You are my lead developer. Create a new REST API endpoint at /api/[ENDPOINT_NAME] in the Prompt-Stack backend.

Requirements:
1. Create file: backend/app/api/endpoints/[ENDPOINT_NAME].py
2. Add router to backend/app/api/router.py
3. Include proper authentication using get_current_user dependency
4. Add Pydantic models for request/response validation
5. Follow existing patterns from other endpoints

Endpoint should include:
- Proper HTTP methods (GET, POST, PUT, DELETE as needed)
- Input validation with Pydantic models
- Authentication and authorization checks
- Error handling with HTTPException
- Standardized response format using create_response()
- Database operations using Supabase client
- Async/await for all operations

Follow these patterns:
- Use dependency injection for auth: current_user: AuthUser = Depends(get_current_user)
- Service layer separation (no direct DB calls in endpoints)
- Type hints for all function parameters and returns
- Docstrings explaining endpoint purpose

Return the endpoint file and router update as separate code blocks.
```

## Variables to Replace
- `[ENDPOINT_NAME]`: The name of the endpoint (e.g., "reports", "analytics", "uploads")

## Example Usage
"Create a new REST API endpoint at /api/reports..."

## Files That Will Be Modified
- `backend/app/api/endpoints/[ENDPOINT_NAME].py` (new)
- `backend/app/api/router.py` (updated)
- `backend/app/models/[ENDPOINT_NAME].py` (optional, if complex models needed)

## Common Patterns

### Basic CRUD Endpoint
```python
from fastapi import APIRouter, Depends, HTTPException
from app.core.auth import get_current_user, AuthUser
from app.core.response_utils import create_response

router = APIRouter()

@router.get("/")
async def get_items(current_user: AuthUser = Depends(get_current_user)):
    # Implementation
    return create_response(success=True, data=items)

@router.post("/")
async def create_item(
    item_data: ItemCreate,
    current_user: AuthUser = Depends(get_current_user)
):
    # Implementation
    return create_response(success=True, data=new_item)
```

## Testing
After implementation:
1. Restart backend container
2. Visit http://localhost:8000/docs
3. Test endpoint in Swagger UI
4. Verify authentication required
5. Test with invalid inputs
6. Check error responses