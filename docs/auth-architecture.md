# Authentication Architecture

## Complete Auth Flow Diagram

```mermaid
graph TB
    %% Frontend Components
    subgraph "Frontend (Next.js)"
        UI[User Interface]
        AuthProvider[AuthProvider Component]
        Navigation[Navigation Component]
        ProtectedPages["(authenticated)/ Pages"]
        AuthPages[Auth Pages<br/>login/register/logout]
        
        UI --> AuthProvider
        AuthProvider --> Navigation
        AuthProvider --> ProtectedPages
        AuthProvider --> AuthPages
    end

    %% Auth States
    subgraph "Auth Context State"
        AuthState[Auth State]
        User[User Object]
        Loading[Loading State]
        DemoMode[Demo Mode Flag]
        GetToken[getAuthToken Function]
        
        AuthState --> User
        AuthState --> Loading
        AuthState --> DemoMode
        AuthState --> GetToken
    end

    %% Token Storage
    subgraph "Client Storage"
        LocalStorage[localStorage<br/>supabase.auth.token<br/>supabase.auth.user]
        SessionStorage[Browser Session]
        
        LocalStorage --> SessionStorage
    end

    %% Backend API
    subgraph "Backend (FastAPI)"
        APIEndpoints[API Endpoints]
        AuthMiddleware[Auth Middleware<br/>get_current_user]
        JWTValidation[JWT Validation]
        UserLookup[User Lookup<br/>profiles table]
        
        APIEndpoints --> AuthMiddleware
        AuthMiddleware --> JWTValidation
        JWTValidation --> UserLookup
    end

    %% Supabase Services
    subgraph "Supabase"
        SupabaseAuth[Supabase Auth]
        UserManagement[User Management]
        JWTIssuing[JWT Token Issuing]
        
        SupabaseAuth --> UserManagement
        SupabaseAuth --> JWTIssuing
    end

    %% Database
    subgraph "Database (PostgreSQL)"
        AuthUsers[auth.users<br/>Supabase managed]
        ProfilesTable[public.profiles<br/>App managed]
        RLSPolicies[Row Level Security<br/>Policies]
        
        AuthUsers --> ProfilesTable
        ProfilesTable --> RLSPolicies
    end

    %% Demo Mode
    subgraph "Demo Mode"
        DemoAuth[Demo Auth Service]
        DemoTokens[Demo JWT Tokens]
        MockUsers[Mock User Data]
        
        DemoAuth --> DemoTokens
        DemoAuth --> MockUsers
    end

    %% Auth Flow Connections
    UI -->|Sign In/Up| SupabaseAuth
    UI -->|Demo Mode| DemoAuth
    
    SupabaseAuth -->|Success| AuthProvider
    DemoAuth -->|Success| AuthProvider
    
    AuthProvider -->|Store| LocalStorage
    AuthProvider -->|Update| AuthState
    
    ProtectedPages -->|Request| APIEndpoints
    APIEndpoints -->|Validate| SupabaseAuth
    
    UserLookup -->|Query| ProfilesTable
    ProfilesTable -->|Enforce| RLSPolicies
    
    GetToken -->|Retrieve| LocalStorage
    GetToken -->|Fallback| SupabaseAuth

    %% Styling
    classDef frontend fill:#e1f5fe
    classDef backend fill:#f3e5f5
    classDef database fill:#e8f5e8
    classDef supabase fill:#fff3e0
    classDef demo fill:#fce4ec
    
    class UI,AuthProvider,Navigation,ProtectedPages,AuthPages frontend
    class APIEndpoints,AuthMiddleware,JWTValidation,UserLookup backend
    class AuthUsers,ProfilesTable,RLSPolicies database
    class SupabaseAuth,UserManagement,JWTIssuing supabase
    class DemoAuth,DemoTokens,MockUsers demo
```

## Detailed Component Breakdown

### Frontend Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant UI
    participant AuthProvider
    participant Supabase
    participant LocalStorage
    participant Backend

    User->>UI: Click Login
    UI->>AuthProvider: signIn(email, password)
    
    alt Production Mode
        AuthProvider->>Supabase: POST /auth/signin
        Supabase->>AuthProvider: {user, session, access_token}
    else Demo Mode  
        AuthProvider->>AuthProvider: Generate demo token
    end
    
    AuthProvider->>LocalStorage: Store user + token
    AuthProvider->>AuthProvider: Update state
    UI->>UI: Redirect to dashboard
    
    User->>UI: Visit protected page
    UI->>AuthProvider: getAuthToken()
    AuthProvider->>LocalStorage: Retrieve stored token
    AuthProvider->>UI: Return token
    UI->>Backend: API call with Bearer token
    Backend->>Supabase: Validate token
    Backend->>Backend: Lookup user profile
    Backend->>UI: Return authorized data
```

### Backend Authentication Middleware

```mermaid
graph TD
    Request[Incoming Request] --> Security[HTTPBearer Security]
    Security --> ExtractToken[Extract JWT Token]
    
    ExtractToken --> DemoCheck{Demo Mode?}
    
    DemoCheck -->|Yes| DemoValidation[Validate Demo Token<br/>HS256 with demo secret]
    DemoCheck -->|No| SupabaseValidation[Validate with Supabase<br/>supabase.auth.get_user]
    
    DemoValidation --> DemoUser[Create AuthUser<br/>role='admin', is_demo=true]
    
    SupabaseValidation --> UserValid{User Valid?}
    UserValid -->|No| Unauthorized[401 Unauthorized]
    UserValid -->|Yes| ProfileLookup[Query profiles table<br/>SELECT role FROM profiles]
    
    ProfileLookup --> ProfileExists{Profile Exists?}
    ProfileExists -->|No| DefaultRole[Default role='user']
    ProfileExists -->|Yes| UserRole[Use profile role]
    
    DefaultRole --> AuthUser[Create AuthUser Object]
    UserRole --> AuthUser
    DemoUser --> AuthUser
    
    AuthUser --> Endpoint[Continue to API Endpoint]
    Unauthorized --> ErrorResponse[Return Error]

    %% Styling
    classDef process fill:#e3f2fd
    classDef decision fill:#fff3e0
    classDef success fill:#e8f5e8
    classDef error fill:#ffebee
    
    class ExtractToken,DemoValidation,SupabaseValidation,ProfileLookup process
    class DemoCheck,UserValid,ProfileExists decision
    class AuthUser,Endpoint success
    class Unauthorized,ErrorResponse error
```

### Database Schema & Security

```mermaid
erDiagram
    AUTH_USERS {
        uuid id PK
        string email
        string encrypted_password
        jsonb raw_user_meta_data
        jsonb raw_app_meta_data
        timestamp created_at
        timestamp updated_at
    }
    
    PROFILES {
        uuid id PK,FK
        string email
        string full_name
        string avatar_url
        string role
        timestamp created_at
        timestamp updated_at
    }
    
    ROLE_AUDIT {
        uuid id PK
        uuid user_id FK
        uuid changed_by FK
        string old_role
        string new_role
        string reason
        timestamp created_at
    }

    AUTH_USERS ||--|| PROFILES : "id"
    PROFILES ||--o{ ROLE_AUDIT : "user_id"
    PROFILES ||--o{ ROLE_AUDIT : "changed_by"
```

### Row Level Security Policies

```mermaid
graph TB
    subgraph "Profiles Table RLS"
        ViewPolicy[Public profiles viewable by everyone<br/>POLICY FOR SELECT USING true]
        UpdateOwnPolicy[Users can update own profile<br/>POLICY FOR UPDATE USING auth.uid() = id]
        AdminUpdatePolicy[Admins can update any profile<br/>POLICY FOR UPDATE USING is_admin()]
        DeletePolicy[Admins can delete other profiles<br/>POLICY FOR DELETE USING auth.uid() != id AND is_admin()]
    end
    
    subgraph "Role Audit RLS"
        AdminViewAudit[Only admins can view audit logs<br/>POLICY FOR SELECT USING is_admin()]
    end
    
    subgraph "Security Functions"
        IsAdmin["is_admin(user_id) → boolean<br/>Check if user has admin/super_admin role"]
        HasRole["has_role(role, user_id) → boolean<br/>Check specific role permissions"]
        CheckAdminEmail["check_admin_email(email, admin_emails[]) → boolean<br/>Validate against ADMIN_EMAILS config"]
    end

    ViewPolicy --> IsAdmin
    UpdateOwnPolicy --> IsAdmin
    AdminUpdatePolicy --> IsAdmin
    DeletePolicy --> IsAdmin
    AdminViewAudit --> IsAdmin
    
    IsAdmin --> HasRole
    HasRole --> CheckAdminEmail
```

### Token Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Unauthenticated
    
    Unauthenticated --> SigningIn: User submits credentials
    SigningIn --> Authenticated: Valid credentials
    SigningIn --> AuthError: Invalid credentials
    AuthError --> Unauthenticated: Retry
    
    Authenticated --> TokenStored: Store in localStorage
    TokenStored --> APICall: Make authenticated request
    
    APICall --> TokenValid: Backend validates token
    APICall --> TokenExpired: Token expired/invalid
    
    TokenValid --> APISuccess: Return data
    TokenExpired --> RefreshToken: Attempt refresh
    
    RefreshToken --> TokenRefreshed: Success
    RefreshToken --> ForceSignOut: Refresh failed
    
    TokenRefreshed --> TokenStored: Update stored token
    ForceSignOut --> Unauthenticated: Clear storage
    
    APISuccess --> APICall: Next request
    
    Authenticated --> SignOut: User logs out
    SignOut --> Unauthenticated: Clear storage
```

## Key Security Features

### 1. **JWT Token Validation**
- Production: Supabase validates tokens with proper cryptographic verification
- Demo: HS256 with demo secret key (development only)
- Automatic expiry handling with refresh token flow

### 2. **Role-Based Access Control**
- Three roles: `user`, `admin`, `super_admin`
- Hierarchical permissions (admin includes user permissions)
- Database-enforced with RLS policies

### 3. **Row Level Security**
- All user data protected by RLS policies
- Users can only access their own data
- Admins have elevated permissions where appropriate
- Audit trail for sensitive operations (role changes)

### 4. **Defense in Depth**
- Frontend auth state management
- Backend JWT validation
- Database RLS enforcement
- Service key vs anon key separation

### 5. **Demo Mode Security**
- Completely isolated from production auth
- Uses separate token validation
- All demo users get admin privileges
- No real data exposure

## Environment Configuration

```mermaid
graph LR
    subgraph "Backend .env"
        SupabaseURL[SUPABASE_URL]
        AnonKey[SUPABASE_ANON_KEY]
        ServiceKey[SUPABASE_SERVICE_KEY]
        DemoMode[DEMO_MODE=auto]
    end
    
    subgraph "Frontend .env.local"
        PublicURL[NEXT_PUBLIC_SUPABASE_URL]
        PublicAnonKey[NEXT_PUBLIC_SUPABASE_ANON_KEY]
        ApiURL[NEXT_PUBLIC_API_URL]
    end
    
    subgraph "Usage"
        ClientAuth[Client Authentication<br/>Uses anon key]
        ServerAuth[Server Operations<br/>Uses service key]
        TokenValidation[Token Validation<br/>Uses service key]
    end
    
    AnonKey --> ClientAuth
    PublicAnonKey --> ClientAuth
    ServiceKey --> ServerAuth
    ServiceKey --> TokenValidation
    
    SupabaseURL --> PublicURL
```

This architecture provides:
- **Secure by default** with RLS and JWT validation
- **Flexible role management** with audit trails  
- **Development-friendly** with demo mode
- **Scalable** with proper separation of concerns
- **Production-ready** with comprehensive security layers