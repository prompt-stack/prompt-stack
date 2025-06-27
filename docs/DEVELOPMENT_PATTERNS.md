# Development Patterns

> **Purpose**: This guide covers coding patterns, conventions, and best practices for developing with Prompt-Stack.

## Code Organization

### Backend Structure (FastAPI)

```
backend/app/
├── api/endpoints/     # API route handlers
├── core/             # Core utilities (auth, config, exceptions)
├── models/           # Pydantic data models
├── services/         # Business logic layer
└── middleware/       # Request/response processing
```

### Frontend Structure (Next.js)

```
frontend/
├── app/              # Next.js 15 App Router pages
├── components/       # Reusable React components
├── services/         # API client functions
├── lib/              # Utility functions and hooks
└── public/           # Static assets
```

## API Development Patterns

### Endpoint Structure

```python
# backend/app/api/endpoints/example.py
from fastapi import APIRouter, Depends, HTTPException
from app.core.auth import get_current_user, AuthUser
from app.models.example import ExampleRequest, ExampleResponse
from app.core.response_utils import success_response, create_response

router = APIRouter()

@router.post("/create", response_model=StandardResponse[ExampleResponse])
async def create_example(
    request: ExampleRequest,
    current_user: AuthUser = Depends(get_current_user)
) -> StandardResponse[ExampleResponse]:
    """
    Create a new example resource.
    
    - **request**: Example data to create
    - **current_user**: Authenticated user (auto-injected)
    
    Returns the created example with generated ID.
    """
    try:
        # Business logic
        result = await example_service.create(
            data=request.dict(),
            user_id=current_user.id
        )
        
        return success_response(result)
        
    except ValueError as e:
        return create_response(
            success=False,
            error=str(e),
            code="VALIDATION_ERROR",
            status_code=400
        )
    except Exception as e:
        logger.error(f"Failed to create example: {e}")
        return create_response(
            success=False,
            error="Internal server error",
            code="SERVER_ERROR", 
            status_code=500
        )
```

### Service Layer Pattern

```python
# backend/app/services/example_service.py
from abc import ABC, abstractmethod
from typing import List, Optional
from app.models.example import Example

class ExampleService(ABC):
    """Abstract base for example services."""
    
    @abstractmethod
    async def create(self, data: dict, user_id: str) -> Example:
        pass
    
    @abstractmethod
    async def get_by_id(self, example_id: str, user_id: str) -> Optional[Example]:
        pass

class DatabaseExampleService(ExampleService):
    """Database implementation of example service."""
    
    def __init__(self, db_client):
        self.db = db_client
    
    async def create(self, data: dict, user_id: str) -> Example:
        # Validate input
        if not data.get('name'):
            raise ValueError("Name is required")
        
        # Create in database
        result = await self.db.table('examples').insert({
            **data,
            'user_id': user_id,
            'created_at': datetime.utcnow()
        }).execute()
        
        return Example(**result.data[0])
    
    async def get_by_id(self, example_id: str, user_id: str) -> Optional[Example]:
        result = await self.db.table('examples').select('*').eq('id', example_id).eq('user_id', user_id).single().execute()
        return Example(**result.data) if result.data else None

# Dependency injection
def get_example_service() -> ExampleService:
    db_client = get_database_client()
    return DatabaseExampleService(db_client)
```

### Pydantic Models

```python
# backend/app/models/example.py
from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
from enum import Enum

class ExampleStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"

class ExampleRequest(BaseModel):
    """Request model for creating/updating examples."""
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    status: ExampleStatus = ExampleStatus.DRAFT
    tags: List[str] = Field(default_factory=list, max_items=10)
    
    @validator('tags')
    def validate_tags(cls, v):
        return [tag.strip().lower() for tag in v if tag.strip()]
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "My Example",
                "description": "An example resource",
                "status": "draft",
                "tags": ["ai", "template"]
            }
        }

class ExampleResponse(BaseModel):
    """Response model for example data."""
    id: str
    name: str
    description: Optional[str]
    status: ExampleStatus
    tags: List[str]
    user_id: str
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True
```

## Frontend Development Patterns

### Component Structure

```tsx
// components/example/ExampleCard.tsx
import { useState } from 'react'
import { Example } from '@/types/example'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ExampleCardProps {
  example: Example
  onUpdate?: (example: Example) => void
  onDelete?: (id: string) => void
  className?: string
}

export function ExampleCard({ 
  example, 
  onUpdate, 
  onDelete, 
  className 
}: ExampleCardProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/examples/${example.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (!response.ok) {
        throw new Error('Failed to update status')
      }
      
      const data = await response.json()
      onUpdate?.(data.data)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{example.name}</h3>
          {example.description && (
            <p className="text-gray-600 mt-1">{example.description}</p>
          )}
          
          <div className="flex gap-2 mt-2">
            {example.tags.map(tag => (
              <span 
                key={tag}
                className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        
        <div className="flex gap-2">
          <select
            value={example.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={loading}
            className="px-3 py-1 border rounded"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
          
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete?.(example.id)}
            disabled={loading}
          >
            Delete
          </Button>
        </div>
      </div>
      
      {error && (
        <div className="mt-2 text-red-600 text-sm">{error}</div>
      )}
    </Card>
  )
}
```

### Custom Hooks

```tsx
// lib/hooks/useExamples.ts
import { useState, useEffect } from 'react'
import { Example } from '@/types/example'
import { useAuth } from '@/components/providers/auth-provider'

interface UseExamplesResult {
  examples: Example[]
  loading: boolean
  error: string | null
  createExample: (data: Partial<Example>) => Promise<void>
  updateExample: (id: string, data: Partial<Example>) => Promise<void>
  deleteExample: (id: string) => Promise<void>
  refreshExamples: () => Promise<void>
}

export function useExamples(): UseExamplesResult {
  const [examples, setExamples] = useState<Example[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { getAuthToken } = useAuth()

  const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
    const token = await getAuthToken()
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    })
  }

  const refreshExamples = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await makeAuthenticatedRequest('/api/examples')
      if (!response.ok) throw new Error('Failed to fetch examples')
      
      const data = await response.json()
      setExamples(data.data)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load examples')
    } finally {
      setLoading(false)
    }
  }

  const createExample = async (data: Partial<Example>) => {
    const response = await makeAuthenticatedRequest('/api/examples', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    
    if (!response.ok) throw new Error('Failed to create example')
    
    const result = await response.json()
    setExamples(prev => [...prev, result.data])
  }

  const updateExample = async (id: string, data: Partial<Example>) => {
    const response = await makeAuthenticatedRequest(`/api/examples/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
    
    if (!response.ok) throw new Error('Failed to update example')
    
    const result = await response.json()
    setExamples(prev => prev.map(ex => ex.id === id ? result.data : ex))
  }

  const deleteExample = async (id: string) => {
    const response = await makeAuthenticatedRequest(`/api/examples/${id}`, {
      method: 'DELETE',
    })
    
    if (!response.ok) throw new Error('Failed to delete example')
    
    setExamples(prev => prev.filter(ex => ex.id !== id))
  }

  useEffect(() => {
    refreshExamples()
  }, [])

  return {
    examples,
    loading,
    error,
    createExample,
    updateExample,
    deleteExample,
    refreshExamples,
  }
}
```

### API Client Service

```typescript
// services/api-client.ts
class APIClient {
  private baseURL: string
  private getToken: () => Promise<string | null>

  constructor(baseURL: string, getToken: () => Promise<string | null>) {
    this.baseURL = baseURL
    this.getToken = getToken
  }

  async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    const token = await this.getToken()
    const url = `${this.baseURL}${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`)
    }

    return data
  }

  // Convenience methods
  get<T>(endpoint: string): Promise<{ success: boolean; data?: T }> {
    return this.request<T>(endpoint)
  }

  post<T>(endpoint: string, body: any): Promise<{ success: boolean; data?: T }> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }

  patch<T>(endpoint: string, body: any): Promise<{ success: boolean; data?: T }> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    })
  }

  delete<T>(endpoint: string): Promise<{ success: boolean; data?: T }> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

// Export singleton instance
import { useAuth } from '@/components/providers/auth-provider'

export const apiClient = new APIClient(
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  async () => {
    // This will be populated by auth context when used
    return null
  }
)
```

## Error Handling Patterns

### Backend Error Handling

```python
# backend/app/core/exceptions.py
from enum import Enum
from fastapi import HTTPException

class ErrorCodes(str, Enum):
    VALIDATION_ERROR = "VALIDATION_ERROR"
    AUTH_REQUIRED = "AUTH_REQUIRED"
    FORBIDDEN = "FORBIDDEN"
    NOT_FOUND = "NOT_FOUND"
    RATE_LIMITED = "RATE_LIMITED"
    SERVER_ERROR = "SERVER_ERROR"

class AppException(Exception):
    """Custom application exception with error code."""
    
    def __init__(self, message: str, code: ErrorCodes, status_code: int = 400):
        self.message = message
        self.code = code
        self.status_code = status_code
        super().__init__(message)

# Global exception handler
from fastapi import Request
from fastapi.responses import JSONResponse

async def app_exception_handler(request: Request, exc: AppException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": exc.message,
            "code": exc.code,
            "timestamp": datetime.utcnow().isoformat()
        }
    )
```

### Frontend Error Boundaries

```tsx
// components/ErrorBoundary.tsx
import React, { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // Report to error tracking service
    // reportError(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-boundary p-4 border border-red-300 rounded-md bg-red-50">
          <h2 className="text-lg font-semibold text-red-800">Something went wrong</h2>
          <p className="text-red-600 mt-2">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
```

## Testing Patterns

### Backend Testing

```python
# backend/tests/test_examples.py
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.auth import get_current_user
from app.models.auth import AuthUser

client = TestClient(app)

# Mock authenticated user
def mock_current_user():
    return AuthUser(
        id="test-user-123",
        email="test@example.com",
        role="user"
    )

@pytest.fixture
def authenticated_client():
    """Client with mocked authentication."""
    app.dependency_overrides[get_current_user] = mock_current_user
    yield client
    app.dependency_overrides.clear()

def test_create_example(authenticated_client):
    """Test creating a new example."""
    example_data = {
        "name": "Test Example",
        "description": "A test example",
        "status": "draft",
        "tags": ["test", "example"]
    }
    
    response = authenticated_client.post("/api/examples", json=example_data)
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["name"] == example_data["name"]
    assert "id" in data["data"]

def test_create_example_validation_error(authenticated_client):
    """Test validation error when creating example."""
    invalid_data = {"description": "Missing required name"}
    
    response = authenticated_client.post("/api/examples", json=invalid_data)
    
    assert response.status_code == 400
    data = response.json()
    assert data["success"] is False
    assert "name" in data["error"].lower()
```

### Frontend Testing

```tsx
// components/__tests__/ExampleCard.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ExampleCard } from '../ExampleCard'
import { Example } from '@/types/example'

// Mock fetch
global.fetch = jest.fn()

const mockExample: Example = {
  id: '123',
  name: 'Test Example',
  description: 'A test example',
  status: 'draft',
  tags: ['test'],
  user_id: 'user-123',
  created_at: '2024-01-01T00:00:00Z',
}

describe('ExampleCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders example information', () => {
    render(<ExampleCard example={mockExample} />)
    
    expect(screen.getByText('Test Example')).toBeInTheDocument()
    expect(screen.getByText('A test example')).toBeInTheDocument()
    expect(screen.getByText('test')).toBeInTheDocument()
  })

  it('calls onUpdate when status changes', async () => {
    const mockOnUpdate = jest.fn()
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: { ...mockExample, status: 'published' } })
    })

    render(<ExampleCard example={mockExample} onUpdate={mockOnUpdate} />)
    
    const statusSelect = screen.getByDisplayValue('draft')
    fireEvent.change(statusSelect, { target: { value: 'published' } })

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'published' })
      )
    })
  })

  it('displays error message on update failure', async () => {
    ;(fetch as jest.Mock).mockRejectedValueOnce(new Error('Update failed'))

    render(<ExampleCard example={mockExample} />)
    
    const statusSelect = screen.getByDisplayValue('draft')
    fireEvent.change(statusSelect, { target: { value: 'published' } })

    await waitFor(() => {
      expect(screen.getByText('Update failed')).toBeInTheDocument()
    })
  })
})
```

## Configuration Management

### Environment-Based Configuration

```python
# backend/app/core/config.py
from pydantic_settings import BaseSettings
from typing import List, Union

class Settings(BaseSettings):
    """Application settings with validation."""
    
    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = False
    
    # Demo mode detection
    DEMO_MODE: str = "auto"  # "auto", "true", "false"
    
    # External services
    OPENAI_API_KEY: str = ""
    SUPABASE_URL: str = ""
    
    @property
    def is_demo_mode(self) -> bool:
        """Auto-detect demo mode based on configuration."""
        if self.DEMO_MODE.lower() == "true":
            return True
        if self.DEMO_MODE.lower() == "false":
            return False
        
        # Auto detection - demo if no services configured
        has_auth = bool(self.SUPABASE_URL)
        has_ai = bool(self.OPENAI_API_KEY)
        return not (has_auth or has_ai)
    
    @property
    def cors_origins(self) -> List[str]:
        """Parse CORS origins."""
        origins = self.CORS_ORIGINS
        if isinstance(origins, str):
            return [origin.strip() for origin in origins.split(",")]
        return origins
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
```

### Feature Flags

```python
# backend/app/core/features.py
from app.core.config import settings

class FeatureFlags:
    """Feature flag configuration."""
    
    @property
    def ai_enabled(self) -> bool:
        return bool(settings.OPENAI_API_KEY or settings.ANTHROPIC_API_KEY)
    
    @property
    def payments_enabled(self) -> bool:
        return bool(settings.STRIPE_SECRET_KEY or settings.LEMONSQUEEZY_API_KEY)
    
    @property
    def email_enabled(self) -> bool:
        return bool(settings.RESEND_API_KEY)
    
    @property
    def vector_search_enabled(self) -> bool:
        return bool(settings.SUPABASE_URL)  # pgvector via Supabase

features = FeatureFlags()
```

## Security Patterns

### Input Validation

```python
# Always use Pydantic models for validation
class UserInput(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: str = Field(..., regex=r'^[^@]+@[^@]+\.[^@]+$')
    
    @validator('name')
    def sanitize_name(cls, v):
        # Remove potentially dangerous characters
        return ''.join(c for c in v if c.isalnum() or c in ' -._')
```

### Rate Limiting

```python
# backend/app/core/rate_limiter.py
from fastapi import Request, HTTPException
import time
from collections import defaultdict

class RateLimiter:
    def __init__(self, requests_per_minute: int = 60):
        self.requests_per_minute = requests_per_minute
        self.requests = defaultdict(list)
    
    def is_allowed(self, identifier: str) -> bool:
        now = time.time()
        minute_ago = now - 60
        
        # Clean old requests
        self.requests[identifier] = [
            req_time for req_time in self.requests[identifier] 
            if req_time > minute_ago
        ]
        
        # Check if under limit
        if len(self.requests[identifier]) >= self.requests_per_minute:
            return False
        
        # Record this request
        self.requests[identifier].append(now)
        return True

rate_limiter = RateLimiter(requests_per_minute=30)

async def rate_limit_middleware(request: Request, call_next):
    """Rate limiting middleware."""
    client_ip = request.client.host
    
    if not rate_limiter.is_allowed(client_ip):
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded"
        )
    
    return await call_next(request)
```

---

**Next Steps**:
- See `GETTING_STARTED.md` for project setup
- See `ARCHITECTURE_OVERVIEW.md` for system design
- See `AI_LLM_INTEGRATION.md` for AI implementation patterns