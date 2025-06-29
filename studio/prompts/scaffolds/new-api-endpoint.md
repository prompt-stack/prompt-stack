# Scaffold: New API Endpoint

## Copy-Paste Template

### Step 1: Create endpoint file
Create `backend/app/api/endpoints/[ENDPOINT_NAME].py`:

```python
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional

from app.api.deps import get_current_user, get_supabase_client
from app.models.user import User
from app.core.response import create_response

router = APIRouter()

# Request/Response models
class CreateItemRequest(BaseModel):
    name: str
    description: Optional[str] = None

class ItemResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    user_id: str

@router.get("/")
async def list_items(
    current_user: User = Depends(get_current_user),
    supabase = Depends(get_supabase_client)
):
    """List all items for current user"""
    try:
        result = supabase.table("[ENDPOINT_NAME]") \
            .select("*") \
            .eq("user_id", current_user.id) \
            .execute()
        
        return create_response(data=result.data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/")
async def create_item(
    request: CreateItemRequest,
    current_user: User = Depends(get_current_user),
    supabase = Depends(get_supabase_client)
):
    """Create a new item"""
    try:
        result = supabase.table("[ENDPOINT_NAME]") \
            .insert({
                "name": request.name,
                "description": request.description,
                "user_id": current_user.id
            }) \
            .execute()
        
        return create_response(data=result.data[0])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

### Step 2: Add to router
Edit `backend/app/api/router.py`:

```python
from app.api.endpoints import [ENDPOINT_NAME]

api_router.include_router(
    [ENDPOINT_NAME].router, 
    prefix="/[ENDPOINT_NAME]", 
    tags=["[ENDPOINT_NAME]"]
)
```
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