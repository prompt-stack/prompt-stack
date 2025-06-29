# PromptStack Backend Function Reference

## Complete Function Inventory

### 📁 `app/main.py`

#### Classes
- **OptionsMiddleware**
  - `dispatch()` - Handles OPTIONS requests for CORS

- **SecurityHeadersMiddleware**
  - `dispatch()` - Adds security headers to all responses

#### Functions
- `root()` - Main health check endpoint

---

### 📁 `app/api/endpoints/auth.py`

- `sign_up()` - Create new user account
- `sign_in()` - User login with email/password
- `sign_out()` - Logout current user
- `get_user()` - Get current user information
- `demo_sign_in()` - Demo mode login (no Supabase)
- `demo_sign_up()` - Demo mode registration
- `demo_check_auth()` - Check demo availability

---

### 📁 `app/api/endpoints/admin.py`

- `get_admin_stats()` - Dashboard statistics
- `list_users()` - List all users with pagination
- `promote_user()` - Promote user to admin
- `get_role_audit_log()` - Role change history
- `delete_user()` - Delete user (super_admin only)
- `get_system_config()` - System configuration

---

### 📁 `app/api/endpoints/health.py`

- `health_check()` - Basic health check
- `detailed_health_check()` - Service-by-service status
- `_get_tips()` - Configuration tips
- `feature_configuration()` - Feature status

---

### 📁 `app/api/endpoints/llm.py`

- `get_providers()` - List available AI providers
- `generate_text()` - Generate AI text (auth required)
- `generate_text_demo()` - Demo text generation
- `demo_generate()` - Demo alias
- `create_embedding()` - Create embeddings (auth required)
- `create_embedding_demo()` - Demo embeddings

---

### 📁 `app/api/endpoints/upload.py`

- `validate_file_type()` - Check allowed file types
- `generate_safe_filename()` - Create unique filenames
- `upload_image()` - Upload images (5MB limit)
- `upload_document()` - Upload documents (10MB limit)
- `upload_avatar()` - Upload profile picture (2MB limit)
- `delete_file()` - Delete uploaded file
- `upload_multiple_files()` - Bulk upload (10 max)

---

### 📁 `app/api/endpoints/vectordb.py`

- `add_documents()` - Store documents with embeddings
- `search_documents()` - Semantic search
- `delete_documents()` - Remove documents
- `health_check()` - Vector DB status

---

### 📁 `app/api/endpoints/payments.py`

- `stripe_status()` - Stripe configuration check
- `lemonsqueezy_status()` - LemonSqueezy check

---

### 📁 `app/api/endpoints/system.py`

- `get_capabilities()` - System capabilities matrix
- `get_system_status()` - Simple status check

---

### 📁 `app/api/endpoints/dev.py`

- `health_check()` - Comprehensive dev health check
- `reset_demo_data()` - Reset demo environment
- `get_config()` - Show configuration
- `test_error_handling()` - Test error scenarios

---

### 📁 `app/core/auth.py`

#### Classes
- **AuthUser**
  - `is_admin` (property) - Admin role check
  - `is_super_admin` (property) - Super admin check

#### Functions
- `get_current_user()` - JWT validation
- `get_current_user_optional()` - Optional auth
- `require_role()` - Role requirement factory

#### Constants
- `require_admin` - Admin dependency
- `require_super_admin` - Super admin dependency

---

### 📁 `app/core/capabilities.py`

#### Classes
- **CapabilityMatrix**
  - `__init__()` - Initialize capability detection
  - `_detect_capability()` - Check service availability
  - `_infer_mode()` - Determine operation mode
  - `get_capability()` - Get specific capability
  - `is_available()` - Check if service available
  - `get_missing_config()` - List missing configs
  - `get_available_services()` - List active services
  - `to_dict()` - Export as dictionary

---

### 📁 `app/core/config.py`

#### Classes
- **Settings** (Pydantic BaseSettings)
  - `is_demo_mode` (property) - Check demo mode

---

### 📁 `app/services/llm/llm_service.py`

#### Abstract Base Class
- **LLMService**
  - `generate_text()` (abstract) - Text generation interface

#### Service Implementations
- **OpenAIService**
  - `__init__()` - Initialize OpenAI
  - `generate_text()` - OpenAI generation

- **AnthropicService**
  - `__init__()` - Initialize Anthropic
  - `generate_text()` - Claude generation

- **GeminiService**
  - `__init__()` - Initialize Gemini
  - `generate_text()` - Gemini generation

- **DeepSeekService**
  - `__init__()` - Initialize DeepSeek
  - `generate_text()` - DeepSeek generation

#### Factory
- **LLMServiceFactory**
  - `get_service()` (static) - Create service instance

#### Functions
- `get_llm_service()` - Service dependency

---

### 📁 `app/services/llm/embedding_service.py`

#### Classes
- **EmbeddingService**
  - `__init__()` - Initialize with provider
  - `create_embedding()` - Generate embeddings
  - `create_embeddings_batch()` - Batch embeddings

---

### 📁 `app/services/supabase/auth.py`

#### Classes
- **SupabaseAuthService**
  - `__init__()` - Initialize Supabase
  - `get_user()` - Get user from JWT
  - `sign_in_with_provider_token()` - Provider auth

#### Functions
- `get_auth_service()` - Get service instance
- `require_auth()` - Auth dependency

---

### 📁 `app/services/supabase/database.py`

#### Classes
- **SupabaseDatabaseService**
  - `__init__()` - Initialize DB client
  - `get_user_count()` - Count total users
  - `get_user_count_by_role()` - Count by role
  - `get_users()` - List users paginated
  - `update_user_role()` - Change user role
  - `get_role_audit_log()` - Get role changes
  - `delete_user()` - Remove user

#### Functions
- `get_database_service()` - Get service instance

---

### 📁 `app/services/supabase/storage.py`

#### Classes
- **SupabaseStorageService**
  - `__init__()` - Initialize storage
  - `upload_file()` - Upload to bucket
  - `delete_file()` - Delete from bucket
  - `get_public_url()` - Get file URL
  - `list_files()` - List bucket contents

#### Functions
- `get_storage_service()` - Get service instance

---

### 📁 `app/services/vectordb/supabase_vector_service.py`

#### Classes
- **SupabaseVectorService**
  - `__init__()` - Initialize vector DB
  - `add_documents()` - Store with embeddings
  - `search()` - Semantic search
  - `delete_documents()` - Remove by IDs
  - `health_check()` - Check DB health

#### Functions
- `get_vector_service()` - Get service instance

---

### 📁 `app/services/auth/role_service.py`

#### Classes
- **RoleService**
  - `__init__()` - Initialize with admin emails
  - `get_user_role_for_signup()` - Determine signup role
  - `check_is_first_user()` - First user check
  - `update_user_role_after_signup()` - Post-signup role update
  - `check_user_role()` - Get user's role
  - `is_admin()` - Admin role check
  - `has_role()` - Role hierarchy check

#### Global Instance
- `role_service` - Singleton instance

---

### 📁 `app/middleware/request_logging.py`

#### Classes
- **RequestLoggingMiddleware**
  - `dispatch()` - Log requests with timing and trace ID

---

### 📁 `app/core/demo.py`

#### Functions
- `create_demo_jwt()` - Generate demo JWT token
- `verify_demo_jwt()` - Validate demo token
- `get_demo_user()` - Get demo user info

---

### 📁 `app/core/exceptions.py`

#### Classes
- **AppException** - Base exception
- **AuthException** - Authentication errors
- **PermissionException** - Authorization errors
- **ValidationException** - Validation errors
- **ServiceException** - Service failures

#### Functions
- `app_exception_handler()` - Handle AppException
- `http_exception_handler()` - Handle HTTPException
- `validation_exception_handler()` - Handle validation
- `generic_exception_handler()` - Catch-all handler

---

### 📁 `app/core/rate_limiter.py`

#### Functions
- `get_settings()` - Get rate limit settings
- `default_identifier()` - Get client identifier
- `custom_key_func()` - Generate rate limit key

#### Instances
- `limiter` - Slowapi limiter instance

---

## Function Categories

### 🔐 Authentication Functions
- User signup/signin/signout
- JWT validation
- Role checking
- Demo authentication

### 🤖 AI/LLM Functions
- Text generation
- Embeddings
- Provider management
- Streaming responses

### 📁 File Management
- Upload validation
- Storage operations
- File deletion
- Bulk uploads

### 👮 Admin Functions
- User management
- Role promotion
- Audit logging
- System stats

### 🏥 Health & Monitoring
- Service health checks
- Capability detection
- System status
- Feature availability

### 🔧 Middleware & Utils
- Request logging
- Security headers
- Rate limiting
- Exception handling

### 💾 Database Operations
- User queries
- Role management
- Vector search
- Document storage

This reference provides a complete inventory of all functions in the backend, making it easy to understand what functionality exists and where to find it.