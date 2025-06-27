# Authentication Guide

> **Purpose**: This guide covers authentication implementation in Prompt-Stack, including demo mode, Supabase integration, and role-based access control.

## Authentication Modes

### Demo Mode (Default)
- **No configuration required** - works out of the box
- Mock user accounts (`test@example.com` / any password)
- No real authentication validation
- Perfect for development and testing

### Production Mode (Supabase)
- **Real user accounts** with email verification
- JWT token-based authentication
- PostgreSQL database with user profiles
- Role-based access control (RBAC)

## Quick Setup

### Enable Real Authentication

```bash
# 1. Add Supabase credentials to backend/.env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# 2. Add matching credentials to frontend/.env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# 3. Restart Docker containers
docker-compose down && docker-compose up -d

# 4. CRITICAL: Log out and log back in to refresh tokens
```

### Database Setup

The authentication system uses these core tables:

```sql
-- User profiles (extends auth.users)
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email varchar NOT NULL,
  full_name varchar,
  avatar_url varchar,
  role varchar DEFAULT 'user',
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Automatic profile creation trigger
CREATE OR REPLACE FUNCTION create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on user creation
CREATE TRIGGER create_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_profile_for_user();
```

## Frontend Authentication

### AuthProvider Component

```tsx
// components/providers/auth-provider.tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { getSupabase } from '@/services/supabase'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName?: string) => Promise<void>
  signOut: () => Promise<void>
  getAuthToken: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = getSupabase()
    
    if (!supabase) {
      // Demo mode - no real authentication
      setUser({ 
        id: 'demo-user',
        email: 'demo@example.com',
        // ... demo user properties
      } as User)
      setLoading(false)
      return
    }

    // Real Supabase authentication
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const supabase = getSupabase()
    if (!supabase) {
      // Demo mode sign in
      setUser({ id: 'demo-user', email } as User)
      return
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
  }

  const signUp = async (email: string, password: string, fullName?: string) => {
    const supabase = getSupabase()
    if (!supabase) {
      // Demo mode sign up
      setUser({ id: 'demo-user', email } as User)
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    })
    if (error) throw error
  }

  const signOut = async () => {
    const supabase = getSupabase()
    if (supabase) {
      await supabase.auth.signOut()
    }
    setUser(null)
  }

  const getAuthToken = async (): Promise<string | null> => {
    const supabase = getSupabase()
    if (!supabase) return 'demo-token'  // Demo mode

    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token ?? null
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signIn,
      signUp,
      signOut,
      getAuthToken
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
```

### Protected Routes

```tsx
// app/(authenticated)/layout.tsx
'use client'

import { useAuth } from '@/components/providers/auth-provider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return null  // Redirecting to login
  }

  return (
    <div className="authenticated-layout">
      {children}
    </div>
  )
}
```

### Login Form Component

```tsx
// components/auth/LoginForm.tsx
'use client'

import { useState } from 'react'
import { useAuth } from '@/components/providers/auth-provider'
import { useRouter } from 'next/navigation'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { signIn } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await signIn(email, password)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-2 border rounded"
        />
      </div>
      
      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full p-2 border rounded"
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white p-2 rounded disabled:opacity-50"
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
      
      <div className="text-sm text-gray-600">
        Demo mode: Use any email and password
      </div>
    </form>
  )
}
```

## Backend Authentication

### JWT Token Validation

```python
# backend/app/core/auth.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from app.core.config import settings
from app.services.supabase import get_client as get_supabase_client

security = HTTPBearer()

class AuthUser:
    """Authenticated user with role information."""
    
    def __init__(self, id: str, email: str, role: str, is_demo: bool = False):
        self.id = id
        self.email = email
        self.role = role
        self.is_demo = is_demo
    
    @property
    def is_admin(self) -> bool:
        return self.role in ["admin", "super_admin"]

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> AuthUser:
    """Validate JWT token and return current user."""
    
    token = credentials.credentials
    
    # Demo mode bypass
    if settings.is_demo_mode or token == "demo-token":
        return AuthUser(
            id="demo-user-123",
            email="demo@example.com", 
            role="user",
            is_demo=True
        )
    
    try:
        # Validate Supabase JWT token
        supabase = get_supabase_client()
        response = await supabase.auth.get_user(token)
        
        if response.user:
            # Get user profile with role information
            profile_response = await supabase.table('profiles').select('*').eq('id', response.user.id).single().execute()
            profile = profile_response.data
            
            return AuthUser(
                id=response.user.id,
                email=response.user.email,
                role=profile.get('role', 'user') if profile else 'user'
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token"
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed"
        )

# Optional: Admin-only decorator
async def get_admin_user(
    current_user: AuthUser = Depends(get_current_user)
) -> AuthUser:
    """Require admin role."""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user
```

### Protected API Endpoints

```python
# backend/app/api/endpoints/llm.py
from fastapi import APIRouter, Depends
from app.core.auth import get_current_user, AuthUser
from app.models.llm import LLMRequest, LLMResponse

router = APIRouter()

@router.post("/generate")
async def generate_text(
    request: LLMRequest,
    current_user: AuthUser = Depends(get_current_user)
) -> LLMResponse:
    """Generate AI text (requires authentication)."""
    
    # User is automatically authenticated by dependency
    llm_service = get_llm_service()
    response = await llm_service.generate_text(
        prompt=request.prompt,
        model=request.model,
        user_id=current_user.id  # Track usage per user
    )
    
    return success_response(response)

@router.post("/demo")
async def demo_generate(request: LLMRequest) -> LLMResponse:
    """Demo AI generation (no authentication required)."""
    
    # Public endpoint for testing
    demo_service = DemoService()
    response = await demo_service.generate_text(
        prompt=request.prompt,
        model=request.model or "demo"
    )
    
    return success_response(response)
```

## Role-Based Access Control (RBAC)

### User Roles

```python
# User role hierarchy
ROLES = {
    "user": {
        "permissions": ["read_own_data", "use_ai"],
        "ai_rate_limit": 30  # requests per minute
    },
    "premium": {
        "permissions": ["read_own_data", "use_ai", "advanced_features"],
        "ai_rate_limit": 100
    },
    "admin": {
        "permissions": ["*"],  # All permissions
        "ai_rate_limit": 1000
    },
    "super_admin": {
        "permissions": ["*"],
        "ai_rate_limit": None  # Unlimited
    }
}

def check_permission(user: AuthUser, permission: str) -> bool:
    """Check if user has specific permission."""
    user_role = ROLES.get(user.role, ROLES["user"])
    permissions = user_role["permissions"]
    return "*" in permissions or permission in permissions
```

### Admin Endpoints

```python
# backend/app/api/endpoints/admin.py
from fastapi import APIRouter, Depends
from app.core.auth import get_admin_user, AuthUser

router = APIRouter()

@router.get("/users")
async def list_users(
    admin_user: AuthUser = Depends(get_admin_user)
) -> List[UserProfile]:
    """List all users (admin only)."""
    
    supabase = get_supabase_client()
    response = await supabase.table('profiles').select('*').execute()
    return success_response(response.data)

@router.post("/users/{user_id}/role")
async def update_user_role(
    user_id: str,
    new_role: str,
    admin_user: AuthUser = Depends(get_admin_user)
) -> dict:
    """Update user role (admin only)."""
    
    if new_role not in ROLES:
        raise HTTPException(400, "Invalid role")
    
    supabase = get_supabase_client()
    await supabase.table('profiles').update({'role': new_role}).eq('id', user_id).execute()
    
    return success_response({"message": f"User role updated to {new_role}"})
```

## Demo Mode Details

### When Demo Mode is Active

Demo mode automatically activates when:
- No Supabase credentials are configured
- `DEMO_MODE=true` is explicitly set
- Any authentication call fails gracefully

### Demo User Accounts

```python
# Demo users for testing different scenarios
DEMO_USERS = {
    "test@example.com": {
        "id": "demo-user-123",
        "role": "user",
        "full_name": "Demo User"
    },
    "admin@example.com": {
        "id": "demo-admin-456", 
        "role": "admin",
        "full_name": "Demo Admin"
    },
    "premium@example.com": {
        "id": "demo-premium-789",
        "role": "premium", 
        "full_name": "Demo Premium User"
    }
}
```

### Demo Authentication Flow

```python
# backend/app/api/endpoints/auth.py
@router.post("/demo/signin")
async def demo_signin(credentials: DemoLoginRequest):
    """Demo authentication endpoint."""
    
    # Accept any email/password combination
    demo_user = DEMO_USERS.get(
        credentials.email, 
        DEMO_USERS["test@example.com"]  # Default demo user
    )
    
    # Generate demo JWT token
    demo_token = create_demo_jwt(demo_user)
    
    return success_response({
        "access_token": demo_token,
        "token_type": "bearer",
        "user": demo_user,
        "demo_mode": True
    })
```

## Common Authentication Patterns

### API Client with Auto-Authentication

```typescript
// frontend/services/api-client.ts
class APIClient {
  private baseURL: string
  private auth: AuthContextType

  constructor(baseURL: string, auth: AuthContextType) {
    this.baseURL = baseURL
    this.auth = auth
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // Automatically add auth header
    const token = await this.auth.getAuthToken()
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        // Redirect to login on auth failure
        window.location.href = '/auth/login'
      }
      throw new Error(`API error: ${response.status}`)
    }

    return response.json()
  }

  // Convenience methods
  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint)
  }

  post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }
}

// Usage in components
const apiClient = new APIClient('/api', useAuth())
const data = await apiClient.get('/llm/providers')
```

### Session Management

```python
# Session timeout and refresh logic
@router.post("/refresh")
async def refresh_token(
    current_user: AuthUser = Depends(get_current_user)
):
    """Refresh user session."""
    
    if current_user.is_demo:
        # Demo sessions don't expire
        return success_response({"message": "Demo session active"})
    
    supabase = get_supabase_client()
    session = await supabase.auth.refresh_session()
    
    return success_response({
        "access_token": session.access_token,
        "expires_at": session.expires_at
    })
```

## Troubleshooting Authentication

### Common Issues

1. **"Authentication tokens not working after adding API keys"**
   - **Solution**: Log out and log back in to refresh tokens
   - **Why**: Token validation changes when switching from demo to production mode

2. **"CORS errors when calling API"**
   - **Solution**: Check `CORS_ORIGINS` in backend `.env`
   - **Why**: Frontend URL must be whitelisted

3. **"Users can't access protected pages"**
   - **Solution**: Verify AuthProvider wraps the app properly
   - **Why**: Authentication context not available

4. **"Demo mode not working"**
   - **Solution**: Clear browser cache and restart Docker
   - **Why**: Cached tokens or outdated environment

### Debug Authentication

```bash
# Check authentication status
curl http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer your-token"

# Test demo authentication
curl -X POST http://localhost:8000/api/auth/demo/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"any"}'

# Verify token validation
curl http://localhost:8000/api/llm/generate \
  -H "Authorization: Bearer demo-token" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"test","model":"demo"}'
```

---

**Next Steps**:
- See `GETTING_STARTED.md` for initial setup
- See `ARCHITECTURE_OVERVIEW.md` for system design
- See `AI_LLM_INTEGRATION.md` for authenticated AI features