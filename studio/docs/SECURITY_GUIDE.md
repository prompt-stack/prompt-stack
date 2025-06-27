# Security Guide

> **Purpose**: This guide covers security best practices, authentication security, API protection, and data security for Prompt-Stack deployments.

## Security Overview

### Security Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Security Layers                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐ │
│  │   Network   │  │Application  │  │    Data     │  │  Access │ │
│  │  Security   │  │  Security   │  │  Security   │  │ Control │ │
│  │             │  │             │  │             │  │         │ │
│  │ • HTTPS/TLS │  │ • JWT Auth  │  │ • Encryption│  │ • RBAC  │ │
│  │ • CORS      │  │ • Input Val │  │ • RLS       │  │ • Admin │ │
│  │ • Headers   │  │ • Rate Lim  │  │ • Secrets   │  │ • Audit │ │
│  │ • Firewall  │  │ • XSS Prot  │  │ • Backups   │  │ • 2FA   │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Authentication Security

### JWT Token Security

```python
# backend/app/core/auth.py
import jwt
from datetime import datetime, timedelta
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

class TokenSecurity:
    """JWT token security implementation."""
    
    def __init__(self, secret_key: str):
        self.secret_key = secret_key
        self.algorithm = "HS256"
        self.access_token_expire_minutes = 30
        self.refresh_token_expire_days = 7
    
    def create_access_token(self, data: dict) -> str:
        """Create secure access token with expiration."""
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(minutes=self.access_token_expire_minutes)
        
        to_encode.update({
            "exp": expire,
            "iat": datetime.utcnow(),
            "type": "access"
        })
        
        return jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
    
    def create_refresh_token(self, data: dict) -> str:
        """Create secure refresh token."""
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(days=self.refresh_token_expire_days)
        
        to_encode.update({
            "exp": expire,
            "iat": datetime.utcnow(),
            "type": "refresh"
        })
        
        return jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
    
    def verify_token(self, token: str, token_type: str = "access") -> dict:
        """Verify and decode JWT token."""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            
            # Verify token type
            if payload.get("type") != token_type:
                raise jwt.InvalidTokenError("Invalid token type")
            
            return payload
            
        except jwt.ExpiredSignatureError:
            raise HTTPException(401, "Token has expired")
        except jwt.InvalidTokenError:
            raise HTTPException(401, "Invalid token")
```

### Password Security

```python
# backend/app/core/security.py
import bcrypt
import secrets
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class PasswordSecurity:
    """Password hashing and validation."""
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash password with bcrypt."""
        return pwd_context.hash(password)
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify password against hash."""
        return pwd_context.verify(plain_password, hashed_password)
    
    @staticmethod
    def generate_secure_token(length: int = 32) -> str:
        """Generate cryptographically secure token."""
        return secrets.token_urlsafe(length)
    
    @staticmethod
    def validate_password_strength(password: str) -> tuple[bool, str]:
        """Validate password meets security requirements."""
        if len(password) < 8:
            return False, "Password must be at least 8 characters"
        
        if not any(c.isupper() for c in password):
            return False, "Password must contain uppercase letter"
        
        if not any(c.islower() for c in password):
            return False, "Password must contain lowercase letter"
        
        if not any(c.isdigit() for c in password):
            return False, "Password must contain number"
        
        if not any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password):
            return False, "Password must contain special character"
        
        return True, "Password meets requirements"
```

### Session Security

```python
# backend/app/core/session.py
from fastapi import Request, Response
import redis
import json
from datetime import timedelta

class SessionManager:
    """Secure session management."""
    
    def __init__(self, redis_client):
        self.redis = redis_client
        self.session_timeout = timedelta(hours=24)
    
    async def create_session(self, user_id: str, user_data: dict) -> str:
        """Create secure session."""
        session_id = secrets.token_urlsafe(32)
        session_data = {
            "user_id": user_id,
            "user_data": user_data,
            "created_at": datetime.utcnow().isoformat(),
            "last_activity": datetime.utcnow().isoformat()
        }
        
        await self.redis.setex(
            f"session:{session_id}",
            self.session_timeout,
            json.dumps(session_data)
        )
        
        return session_id
    
    async def validate_session(self, session_id: str) -> dict | None:
        """Validate and refresh session."""
        session_data = await self.redis.get(f"session:{session_id}")
        if not session_data:
            return None
        
        data = json.loads(session_data)
        
        # Update last activity
        data["last_activity"] = datetime.utcnow().isoformat()
        await self.redis.setex(
            f"session:{session_id}",
            self.session_timeout,
            json.dumps(data)
        )
        
        return data
    
    async def invalidate_session(self, session_id: str):
        """Invalidate session."""
        await self.redis.delete(f"session:{session_id}")
```

## API Security

### Rate Limiting

```python
# backend/app/core/rate_limiter.py
from fastapi import Request, HTTPException
import asyncio
import time
from collections import defaultdict, deque

class AdvancedRateLimiter:
    """Advanced rate limiting with multiple strategies."""
    
    def __init__(self):
        self.requests = defaultdict(deque)
        self.blocked_ips = set()
        self.cleanup_interval = 60  # seconds
        
    async def check_rate_limit(
        self, 
        identifier: str, 
        limit: int = 60, 
        window: int = 60,
        burst_limit: int = 10,
        burst_window: int = 1
    ) -> bool:
        """Check if request is within rate limits."""
        now = time.time()
        
        # Check if IP is blocked
        if identifier in self.blocked_ips:
            return False
        
        # Clean old requests
        request_times = self.requests[identifier]
        while request_times and request_times[0] < now - window:
            request_times.popleft()
        
        # Check burst limit (short window)
        recent_requests = sum(1 for req_time in request_times if req_time > now - burst_window)
        if recent_requests >= burst_limit:
            return False
        
        # Check normal limit (longer window)
        if len(request_times) >= limit:
            # Block aggressive IPs
            if len(request_times) > limit * 2:
                self.blocked_ips.add(identifier)
                # Auto-unblock after 1 hour
                asyncio.create_task(self._unblock_ip_later(identifier, 3600))
            return False
        
        # Record this request
        request_times.append(now)
        return True
    
    async def _unblock_ip_later(self, ip: str, delay: int):
        """Unblock IP after delay."""
        await asyncio.sleep(delay)
        self.blocked_ips.discard(ip)

# Rate limiting middleware
rate_limiter = AdvancedRateLimiter()

async def rate_limit_middleware(request: Request, call_next):
    """Rate limiting middleware with user-specific limits."""
    client_ip = request.client.host
    user_agent = request.headers.get("user-agent", "")
    
    # Different limits for different endpoints
    if request.url.path.startswith("/api/llm/"):
        limit = 30  # 30 requests per minute for AI endpoints
    elif request.url.path.startswith("/api/auth/"):
        limit = 10  # 10 requests per minute for auth endpoints
    else:
        limit = 100  # 100 requests per minute for other endpoints
    
    # Identify potential bots
    if any(bot in user_agent.lower() for bot in ["bot", "crawler", "spider", "scraper"]):
        limit = limit // 2  # Reduce limit for bots
    
    identifier = f"{client_ip}:{user_agent[:50]}"  # IP + User-Agent fingerprint
    
    if not await rate_limiter.check_rate_limit(identifier, limit):
        raise HTTPException(
            status_code=429,
            detail={
                "error": "Rate limit exceeded",
                "retry_after": 60,
                "limit": limit
            }
        )
    
    response = await call_next(request)
    
    # Add rate limit headers
    response.headers["X-RateLimit-Limit"] = str(limit)
    response.headers["X-RateLimit-Remaining"] = str(max(0, limit - len(rate_limiter.requests[identifier])))
    
    return response
```

### Input Validation and Sanitization

```python
# backend/app/core/validation.py
import re
import html
from pydantic import BaseModel, validator, Field
from typing import Any

class SecureInput(BaseModel):
    """Base model with security validations."""
    
    @validator('*', pre=True)
    def sanitize_strings(cls, v):
        """Sanitize string inputs."""
        if isinstance(v, str):
            # Remove null bytes
            v = v.replace('\x00', '')
            # Limit length
            if len(v) > 10000:
                raise ValueError("Input too long")
            # HTML escape
            v = html.escape(v)
        return v

class UserInput(SecureInput):
    """Secure user input validation."""
    
    name: str = Field(..., min_length=1, max_length=100)
    email: str = Field(..., regex=r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    message: str = Field(..., min_length=1, max_length=1000)
    
    @validator('name')
    def validate_name(cls, v):
        # Allow only alphanumeric, spaces, and safe punctuation
        if not re.match(r'^[a-zA-Z0-9\s\-_.]+$', v):
            raise ValueError("Name contains invalid characters")
        return v.strip()
    
    @validator('message')
    def validate_message(cls, v):
        # Check for potential SQL injection patterns
        suspicious_patterns = [
            r'(union|select|insert|update|delete|drop|exec|script)',
            r'(<script|javascript:|vbscript:|onload=|onerror=)',
            r'(\.\.\/|\.\.\\)',  # Path traversal
        ]
        
        for pattern in suspicious_patterns:
            if re.search(pattern, v.lower()):
                raise ValueError("Message contains potentially harmful content")
        
        return v.strip()

def sanitize_sql_input(value: str) -> str:
    """Sanitize input for SQL queries."""
    if not isinstance(value, str):
        return value
    
    # Remove or escape potentially dangerous characters
    dangerous_chars = ["'", '"', ';', '--', '/*', '*/', 'xp_', 'sp_']
    for char in dangerous_chars:
        value = value.replace(char, '')
    
    return value

def validate_file_upload(file_content: bytes, allowed_types: list) -> bool:
    """Validate file upload security."""
    # Check file size (10MB limit)
    if len(file_content) > 10 * 1024 * 1024:
        raise ValueError("File too large")
    
    # Check file type by magic bytes
    magic_bytes = {
        'pdf': b'%PDF',
        'png': b'\x89PNG',
        'jpg': b'\xff\xd8\xff',
        'txt': None,  # Text files don't have magic bytes
    }
    
    if allowed_types:
        valid = False
        for file_type in allowed_types:
            magic = magic_bytes.get(file_type)
            if magic is None or file_content.startswith(magic):
                valid = True
                break
        
        if not valid:
            raise ValueError("Invalid file type")
    
    return True
```

### CORS and Security Headers

```python
# backend/app/main.py
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

def add_security_middleware(app: FastAPI):
    """Add security middleware to FastAPI app."""
    
    # Trusted host middleware (production only)
    if settings.ENVIRONMENT == "production":
        app.add_middleware(
            TrustedHostMiddleware,
            allowed_hosts=["your-domain.com", "*.your-domain.com"]
        )
    
    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["*"],
        expose_headers=["X-RateLimit-Limit", "X-RateLimit-Remaining"]
    )
    
    # Security headers middleware
    @app.middleware("http")
    async def add_security_headers(request: Request, call_next):
        response = await call_next(request)
        
        # Security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        
        # HSTS (production only)
        if settings.ENVIRONMENT == "production":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
        
        # CSP for additional XSS protection
        csp = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'"
        response.headers["Content-Security-Policy"] = csp
        
        return response
```

## Data Security

### Database Security (Row Level Security)

```sql
-- Enable RLS on all user tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE llm_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_documents ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "users_own_profile" ON profiles
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "users_own_llm_requests" ON llm_requests
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "users_own_documents" ON user_documents
    FOR ALL USING (auth.uid() = user_id);

-- Admin access policy
CREATE POLICY "admin_full_access" ON profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Audit table (admin read-only)
CREATE TABLE audit_log (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id),
    action varchar NOT NULL,
    table_name varchar NOT NULL,
    record_id varchar,
    old_data jsonb,
    new_data jsonb,
    ip_address inet,
    user_agent text,
    created_at timestamp DEFAULT now()
);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_audit_access" ON audit_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );
```

### Encryption at Rest

```python
# backend/app/core/encryption.py
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import base64
import os

class DataEncryption:
    """Encryption for sensitive data at rest."""
    
    def __init__(self, master_key: str):
        self.fernet = self._derive_key(master_key)
    
    def _derive_key(self, password: str) -> Fernet:
        """Derive encryption key from master password."""
        salt = b'prompt_stack_salt_2024'  # Use environment-specific salt
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
        )
        key = base64.urlsafe_b64encode(kdf.derive(password.encode()))
        return Fernet(key)
    
    def encrypt(self, data: str) -> str:
        """Encrypt sensitive data."""
        return self.fernet.encrypt(data.encode()).decode()
    
    def decrypt(self, encrypted_data: str) -> str:
        """Decrypt sensitive data."""
        return self.fernet.decrypt(encrypted_data.encode()).decode()

# Usage for API keys and sensitive data
encryption = DataEncryption(settings.ENCRYPTION_KEY)

def store_api_key(user_id: str, provider: str, api_key: str):
    """Store encrypted API key."""
    encrypted_key = encryption.encrypt(api_key)
    # Store encrypted_key in database
    
def get_api_key(user_id: str, provider: str) -> str:
    """Retrieve and decrypt API key."""
    encrypted_key = # Fetch from database
    return encryption.decrypt(encrypted_key)
```

### Secrets Management

```python
# backend/app/core/secrets.py
import os
from typing import Optional

class SecretsManager:
    """Secure secrets management."""
    
    @staticmethod
    def get_secret(key: str, default: Optional[str] = None) -> str:
        """Get secret from environment or external provider."""
        
        # Try environment variable first
        value = os.getenv(key, default)
        
        # In production, integrate with external secrets manager
        if settings.ENVIRONMENT == "production":
            # AWS Secrets Manager example
            if not value:
                value = get_from_aws_secrets(key)
            
            # Azure Key Vault example
            if not value:
                value = get_from_azure_keyvault(key)
        
        if not value:
            raise ValueError(f"Secret {key} not found")
        
        return value
    
    @staticmethod
    def validate_secrets():
        """Validate all required secrets are present."""
        required_secrets = [
            "SUPABASE_SERVICE_KEY",
            "JWT_SECRET_KEY",
            "ENCRYPTION_KEY"
        ]
        
        missing = []
        for secret in required_secrets:
            try:
                SecretsManager.get_secret(secret)
            except ValueError:
                missing.append(secret)
        
        if missing:
            raise ValueError(f"Missing required secrets: {missing}")

def get_from_aws_secrets(key: str) -> Optional[str]:
    """Get secret from AWS Secrets Manager."""
    try:
        import boto3
        client = boto3.client('secretsmanager')
        response = client.get_secret_value(SecretId=key)
        return response['SecretString']
    except Exception:
        return None

def get_from_azure_keyvault(key: str) -> Optional[str]:
    """Get secret from Azure Key Vault."""
    try:
        from azure.keyvault.secrets import SecretClient
        from azure.identity import DefaultAzureCredential
        
        credential = DefaultAzureCredential()
        client = SecretClient(vault_url=settings.AZURE_KEYVAULT_URL, credential=credential)
        secret = client.get_secret(key)
        return secret.value
    except Exception:
        return None
```

## Security Monitoring

### Audit Logging

```python
# backend/app/core/audit.py
from fastapi import Request
import json
from datetime import datetime

class AuditLogger:
    """Security audit logging."""
    
    @staticmethod
    async def log_security_event(
        event_type: str,
        user_id: Optional[str],
        details: dict,
        request: Optional[Request] = None,
        severity: str = "info"
    ):
        """Log security-related events."""
        
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "event_type": event_type,
            "user_id": user_id,
            "severity": severity,
            "details": details,
        }
        
        if request:
            log_entry.update({
                "ip_address": request.client.host,
                "user_agent": request.headers.get("user-agent"),
                "endpoint": str(request.url),
                "method": request.method,
            })
        
        # Log to file/database/external service
        logger.info(f"SECURITY_EVENT: {json.dumps(log_entry)}")
        
        # Store in database for admin review
        await store_audit_log(log_entry)
        
        # Alert on high severity events
        if severity in ["warning", "error", "critical"]:
            await send_security_alert(log_entry)

# Usage examples
async def log_failed_login(email: str, request: Request):
    await AuditLogger.log_security_event(
        event_type="failed_login",
        user_id=None,
        details={"email": email, "reason": "invalid_credentials"},
        request=request,
        severity="warning"
    )

async def log_suspicious_activity(user_id: str, activity: str, request: Request):
    await AuditLogger.log_security_event(
        event_type="suspicious_activity",
        user_id=user_id,
        details={"activity": activity},
        request=request,
        severity="error"
    )
```

### Security Metrics

```python
# backend/app/core/security_metrics.py
from collections import defaultdict, deque
import time

class SecurityMetrics:
    """Track security-related metrics."""
    
    def __init__(self):
        self.failed_logins = defaultdict(deque)
        self.rate_limit_violations = defaultdict(int)
        self.suspicious_ips = set()
        
    def record_failed_login(self, ip: str):
        """Record failed login attempt."""
        now = time.time()
        self.failed_logins[ip].append(now)
        
        # Clean old entries (last hour)
        while self.failed_logins[ip] and self.failed_logins[ip][0] < now - 3600:
            self.failed_logins[ip].popleft()
        
        # Mark as suspicious if too many failures
        if len(self.failed_logins[ip]) > 10:
            self.suspicious_ips.add(ip)
    
    def is_suspicious_ip(self, ip: str) -> bool:
        """Check if IP is marked as suspicious."""
        return ip in self.suspicious_ips
    
    def get_security_stats(self) -> dict:
        """Get current security statistics."""
        return {
            "suspicious_ips": len(self.suspicious_ips),
            "failed_login_ips": len(self.failed_logins),
            "total_failed_logins": sum(len(attempts) for attempts in self.failed_logins.values()),
            "rate_limit_violations": sum(self.rate_limit_violations.values())
        }

security_metrics = SecurityMetrics()
```

## Security Testing

### Penetration Testing Checklist

```python
# backend/tests/security/test_security.py
import pytest
from fastapi.testclient import TestClient

def test_sql_injection_protection(client: TestClient):
    """Test protection against SQL injection."""
    malicious_inputs = [
        "' OR '1'='1",
        "'; DROP TABLE users; --",
        "1' UNION SELECT * FROM users --"
    ]
    
    for payload in malicious_inputs:
        response = client.post("/api/search", json={"query": payload})
        assert response.status_code != 500  # Should not cause server error
        assert "error" not in response.json() or "SQL" not in response.json()["error"]

def test_xss_protection(client: TestClient):
    """Test protection against XSS attacks."""
    xss_payloads = [
        "<script>alert('xss')</script>",
        "javascript:alert('xss')",
        "<img src=x onerror=alert('xss')>"
    ]
    
    for payload in xss_payloads:
        response = client.post("/api/comments", json={"content": payload})
        # Should either reject or sanitize the input
        assert response.status_code in [400, 422] or "<script>" not in response.text

def test_rate_limiting(client: TestClient):
    """Test rate limiting works."""
    # Make many requests quickly
    responses = []
    for _ in range(100):
        response = client.get("/api/health")
        responses.append(response.status_code)
    
    # Should eventually get rate limited
    assert 429 in responses

def test_authentication_required(client: TestClient):
    """Test protected endpoints require authentication."""
    protected_endpoints = [
        "/api/llm/generate",
        "/api/user/profile",
        "/api/admin/users"
    ]
    
    for endpoint in protected_endpoints:
        response = client.get(endpoint)
        assert response.status_code == 401

def test_authorization_levels(authenticated_client: TestClient):
    """Test role-based access control."""
    # Regular user should not access admin endpoints
    response = authenticated_client.get("/api/admin/users")
    assert response.status_code == 403
```

### Security Headers Testing

```python
def test_security_headers(client: TestClient):
    """Test security headers are present."""
    response = client.get("/")
    headers = response.headers
    
    assert "X-Content-Type-Options" in headers
    assert headers["X-Content-Type-Options"] == "nosniff"
    
    assert "X-Frame-Options" in headers
    assert headers["X-Frame-Options"] == "DENY"
    
    assert "X-XSS-Protection" in headers
    assert headers["X-XSS-Protection"] == "1; mode=block"
    
    assert "Content-Security-Policy" in headers
    
    # HSTS should be present in production
    if settings.ENVIRONMENT == "production":
        assert "Strict-Transport-Security" in headers
```

## Security Checklist

### Pre-Production Security Checklist

- [ ] **Authentication Security**
  - [ ] Strong password requirements enforced
  - [ ] JWT tokens properly secured with expiration
  - [ ] Session management implemented
  - [ ] Multi-factor authentication available for admins

- [ ] **API Security**
  - [ ] Rate limiting implemented and tested
  - [ ] Input validation on all endpoints
  - [ ] SQL injection protection verified
  - [ ] XSS protection in place
  - [ ] CORS properly configured

- [ ] **Data Security**
  - [ ] Database Row Level Security (RLS) enabled
  - [ ] Sensitive data encrypted at rest
  - [ ] API keys and secrets properly managed
  - [ ] Regular database backups configured

- [ ] **Infrastructure Security**
  - [ ] HTTPS/TLS enabled with valid certificates
  - [ ] Security headers configured
  - [ ] Firewall rules configured
  - [ ] Regular security updates scheduled

- [ ] **Monitoring and Logging**
  - [ ] Security event logging implemented
  - [ ] Failed login attempt monitoring
  - [ ] Suspicious activity detection
  - [ ] Security metrics dashboard

- [ ] **Compliance**
  - [ ] GDPR compliance (if applicable)
  - [ ] Data retention policies
  - [ ] Privacy policy updated
  - [ ] Terms of service current

---

**Next Steps**:
- Regularly update dependencies for security patches
- Conduct periodic security audits
- Implement automated security testing in CI/CD
- Monitor security logs and metrics continuously