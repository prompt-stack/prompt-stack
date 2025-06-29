# PromptStack Backend Architecture 🏗️

## Overview

The PromptStack backend is a modern FastAPI application designed as a comprehensive API gateway that bridges your frontend with multiple AI providers, databases, and third-party services. Think of it as the Grand Central Station of your application - all requests flow through here to reach their destinations.

## 🚇 The Transit Map (Request Flow)

```
[Frontend] → [FastAPI] → [Middleware] → [Router] → [Endpoints] → [Services] → [External APIs]
     ↑                                                                              ↓
     └─────────────────────── [Response] ←──────────────────────────────────────┘
```

## 📍 Entry Points

### Main Application (`backend/app/main.py`)

The FastAPI application is the main entry point. Here's what happens when a request arrives:

1. **Request hits the server** at port 8000
2. **Middleware stack processes** (in reverse order):
   - CORS validation
   - Security headers injection
   - Request logging
   - Rate limiting checks
3. **Exception handlers** catch any errors
4. **Router dispatches** to appropriate endpoint

### Key Application Features:
- **Environment-aware**: Different behavior for dev/prod
- **Demo mode**: Full functionality without external services
- **Rate limiting**: Protects against abuse
- **Comprehensive logging**: Every request tracked

## 🛤️ API Routes (The Subway Lines)

### 1. Health Line (`/api/health/*`)
**Purpose**: System monitoring and status checks

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/health/` | GET | Basic alive check | No |
| `/health/detailed` | GET | Service-by-service status | No |
| `/health/features` | GET | Available features list | No |

### 2. Auth Line (`/api/auth/*`)
**Purpose**: User authentication and session management

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/auth/signup` | POST | Create new account | No |
| `/auth/signin` | POST | Login with credentials | No |
| `/auth/signout` | POST | Logout current user | Yes |
| `/auth/me` | GET | Get current user info | Yes |
| `/auth/demo/signin` | POST | Demo mode login | No |

**Authentication Flow**:
```
1. User signs up → Supabase creates account → First user becomes super_admin
2. User signs in → Supabase returns JWT → Frontend stores token
3. Subsequent requests → Include JWT → Backend validates → Role checked
```

### 3. Admin Line (`/api/admin/*`)
**Purpose**: Administrative operations (requires admin role)

| Endpoint | Method | Description | Required Role |
|----------|--------|-------------|---------------|
| `/admin/stats` | GET | Dashboard statistics | admin |
| `/admin/users` | GET | List all users | admin |
| `/admin/users/{id}/promote` | POST | Make user admin | admin |
| `/admin/users/{id}` | DELETE | Delete user | super_admin |
| `/admin/audit/roles` | GET | Role change history | admin |

### 4. LLM Line (`/api/llm/*`)
**Purpose**: AI text generation and embeddings

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/llm/providers` | GET | List available AI providers | No |
| `/llm/generate` | POST | Generate AI response | Yes |
| `/llm/generate-demo` | POST | Demo AI response | No |
| `/llm/embedding` | POST | Create text embeddings | Yes |

**LLM Request Flow**:
```
1. Check authentication (auth-first policy)
2. Validate provider availability
3. Route to appropriate service (OpenAI/Anthropic/etc)
4. Stream or return response
5. Handle errors gracefully
```

### 5. Vector DB Line (`/api/vectordb/*`)
**Purpose**: Document storage with semantic search

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/vectordb/documents` | POST | Store documents with embeddings | Yes |
| `/vectordb/search` | POST | Semantic search | Yes |
| `/vectordb/documents` | DELETE | Remove documents | Yes |

### 6. Upload Line (`/api/upload/*`)
**Purpose**: File management

| Endpoint | Method | Description | Limits |
|----------|--------|-------------|--------|
| `/upload/image` | POST | Upload images | 5MB |
| `/upload/document` | POST | Upload documents | 10MB |
| `/upload/avatar` | POST | Upload profile picture | 2MB |
| `/upload/bulk` | POST | Multiple files | 10 files |

### 7. Payment Line (`/api/payments/*`)
**Purpose**: Payment provider integration

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/payments/stripe/status` | GET | Stripe configuration |
| `/payments/lemonsqueezy/status` | GET | LemonSqueezy configuration |

## 🏭 Service Layer (The Power Stations)

### Core Services

#### 1. **Authentication Service** (`app/core/auth.py`)
- Validates JWTs
- Manages user sessions
- Enforces role-based access
- Handles demo mode authentication

#### 2. **Capabilities Matrix** (`app/core/capabilities.py`)
- Detects available services
- Manages feature flags
- Handles graceful degradation
- Enables demo mode when services unavailable

#### 3. **Configuration** (`app/core/config.py`)
- Environment variable management
- Service URL configuration
- API key management
- Feature toggles

### External Service Integrations

#### 1. **Supabase Services** (`app/services/supabase/`)
```
├── auth.py      → User authentication
├── database.py  → PostgreSQL operations
└── storage.py   → File storage
```

#### 2. **LLM Services** (`app/services/llm/`)
```
├── llm_service.py        → Factory pattern for providers
├── embedding_service.py  → Text embeddings
└── Providers:
    ├── OpenAI (GPT-3.5, GPT-4)
    ├── Anthropic (Claude)
    ├── Google (Gemini)
    └── DeepSeek
```

#### 3. **Vector Database** (`app/services/vectordb/`)
- Uses Supabase with pgvector extension
- Stores documents with embeddings
- Enables semantic search
- User-scoped data isolation

## 🔐 Security Architecture

### Authentication Flow
```
1. User provides credentials
2. Supabase validates
3. JWT issued with claims
4. Frontend stores token
5. Token sent with requests
6. Backend validates JWT
7. Role checked for authorization
```

### Security Layers
1. **CORS**: Restricts origins
2. **Rate Limiting**: Prevents abuse
3. **JWT Validation**: Ensures authenticity
4. **Role-Based Access**: Fine-grained permissions
5. **Security Headers**: XSS, clickjacking protection
6. **Input Validation**: Pydantic models

## 🎭 Demo Mode

When no external services are configured:
- Local JWT generation
- Mock AI responses
- In-memory data storage
- All features available
- No external API calls
- Perfect for development

## 📊 Data Models

### User Model
```python
class AuthUser:
    id: str
    email: str
    role: UserRole  # user, admin, super_admin
    is_demo: bool
    # Computed properties
    is_admin: bool
    is_super_admin: bool
```

### Request/Response Patterns
```python
# Standardized responses
class StandardResponse:
    success: bool
    data: Optional[Any]
    error: Optional[str]
    code: str
    headers: dict
```

## 🚦 Middleware Pipeline

Executed in this order for requests:
1. **Rate Limiter** - Checks request limits
2. **Request Logger** - Logs all activity
3. **Security Headers** - Adds protective headers
4. **CORS** - Validates origins

## 🔧 Configuration

### Environment Variables
```bash
# Core
ENVIRONMENT=development
BACKEND_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000

# Supabase
SUPABASE_URL=your-url
SUPABASE_SERVICE_KEY=your-key

# AI Providers
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Demo Mode
DEMO_MODE=true  # Enables full demo functionality
```

## 🏃 Running the Backend

### Development
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Production
```bash
docker build -f backend/Dockerfile.prod -t promptstack-backend .
docker run -p 8000:8000 promptstack-backend
```

## 🧪 Testing

### Test Structure
```
backend/tests/
├── test_health.py     # Health endpoint tests
├── test_auth.py       # Authentication tests
├── test_llm.py        # LLM service tests
└── test_capabilities.py # Capability detection tests
```

### Running Tests
```bash
cd backend
pytest tests/ -v
```

## 📈 Performance Considerations

1. **Streaming Responses**: LLM responses stream to avoid timeouts
2. **Connection Pooling**: Reuses database connections
3. **Async Operations**: Non-blocking I/O throughout
4. **Rate Limiting**: Prevents resource exhaustion
5. **Caching**: Response caching where appropriate

## 🔍 Debugging

### Useful Endpoints
- `/api/health/detailed` - Check all service statuses
- `/api/system/capabilities` - See what's available
- `/api/dev/config` - View configuration (dev only)
- `/api/dev/errors/test/{type}` - Test error handling

### Log Locations
- Request logs: Console output
- Error logs: Console with full traceback
- Audit logs: Database `role_audit_log` table

## 🚀 Next Steps

To understand the complete system:
1. **Frontend Architecture** - How the Next.js app connects
2. **Database Schema** - Supabase table structures
3. **Deployment Guide** - How to deploy everything
4. **API Testing** - Postman/curl examples

The backend serves as the central nervous system of PromptStack, handling all business logic, external integrations, and security. It's designed to be extensible, secure, and easy to understand.