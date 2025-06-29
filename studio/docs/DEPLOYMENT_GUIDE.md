# Deployment Guide

> **Purpose**: This guide covers deploying Prompt-Stack to production environments including Railway, Vercel, and custom Docker deployments.

## Deployment Options

### Recommended Setup
- **Frontend**: Vercel (automatic builds, edge optimization)
- **Backend**: Railway (container deployment, automatic scaling)
- **Database**: Supabase (managed PostgreSQL with pgvector)

### Alternative Platforms
- **All-in-one**: Render, Fly.io, DigitalOcean App Platform
- **Custom**: Docker Compose on VPS, Kubernetes
- **Serverless**: Vercel Functions + Supabase Edge Functions

## Pre-Deployment Checklist

### Environment Configuration

```bash
# ✅ Required for production
ENVIRONMENT=production
DEMO_MODE=false

# ✅ Authentication (Supabase)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# ✅ AI Provider (choose one or more)
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
GEMINI_API_KEY=your-gemini-key
DEEPSEEK_API_KEY=sk-your-deepseek-key

# ✅ Security
CORS_ORIGINS=https://your-domain.com  # No brackets in production!
FRONTEND_URL=https://your-domain.com

# 🔄 Optional features
STRIPE_SECRET_KEY=sk_live_your-stripe-key
LEMONSQUEEZY_API_KEY=your-ls-key
RESEND_API_KEY=re_your-resend-key
```

### Database Migration

```bash
# Run database migrations before deployment
supabase db push

# Or manually run migrations
psql $DATABASE_URL -f supabase/migrations/all_migrations_combined.sql
```

## Railway Deployment (Backend)

### Setup Railway Project

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login and create project
railway login
railway init

# 3. Deploy backend
cd backend
railway up
```

### Railway Configuration

```json
// railway.json (already configured)
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "backend/Dockerfile.prod"
  },
  "deploy": {
    "numReplicas": 1,
    "startCommand": "cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Environment Variables in Railway

Add these in Railway dashboard → Settings → Environment:

```bash
# Core settings
ENVIRONMENT=production
DEMO_MODE=false
PORT=8000

# Database & Auth
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# AI Providers
OPENAI_API_KEY=sk-your-openai-key
DEEPSEEK_API_KEY=sk-your-deepseek-key

# Security
CORS_ORIGINS=["https://your-frontend-domain.vercel.app"]
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

## Vercel Deployment (Frontend)

### Setup Vercel Project

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy frontend
cd frontend
vercel

# 3. Set production domain
vercel --prod
```

### Vercel Configuration

```json
// frontend/vercel.json (already configured)
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next"
}
```

### Environment Variables in Vercel

Add these in Vercel dashboard → Settings → Environment Variables:

```bash
# API Connection
NEXT_PUBLIC_API_URL=https://your-backend.railway.app

# Authentication (must match backend)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional: Payment providers
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-key
NEXT_PUBLIC_LEMONSQUEEZY_STORE_ID=your-store-id
```

## Supabase Setup

### Create Supabase Project

1. Visit [supabase.com](https://supabase.com)
2. Create new project
3. Wait for database provisioning
4. Note down project URL and keys

### Run Database Migrations

```bash
# Option 1: Use Supabase CLI
supabase link --project-ref your-project-ref
supabase db push

# Option 2: Manual SQL execution
# Copy content from supabase/migrations/all_migrations_combined.sql
# Run in Supabase SQL Editor
```

### Enable Required Extensions

```sql
-- Enable pgvector for embeddings (if using AI features)
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Configure Row Level Security

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Example policy: Users can only see their own data
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

## Docker Deployment (Custom)

### Production Docker Compose

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - ./frontend/.env.local
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    ports:
      - "8000:8000"
    environment:
      - PYTHONUNBUFFERED=1
      - ENVIRONMENT=production
    env_file:
      - ./backend/.env
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Optional: Add reverse proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl
    depends_on:
      - frontend
      - backend
    restart: unless-stopped
```

### Nginx Configuration

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream frontend {
        server frontend:3000;
    }
    
    upstream backend {
        server backend:8000;
    }
    
    server {
        listen 80;
        server_name your-domain.com;
        
        # Redirect HTTP to HTTPS
        return 301 https://$server_name$request_uri;
    }
    
    server {
        listen 443 ssl;
        server_name your-domain.com;
        
        # SSL configuration
        ssl_certificate /etc/ssl/cert.pem;
        ssl_certificate_key /etc/ssl/key.pem;
        
        # Frontend routes
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        # Backend API routes
        location /api/ {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        # Health checks
        location /health {
            proxy_pass http://backend/health;
        }
    }
}
```

## Environment-Specific Configurations

### Development vs Production

```python
# backend/app/core/config.py
class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    
    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"
    
    @property
    def log_level(self) -> str:
        return "INFO" if self.is_production else "DEBUG"
    
    @property
    def cors_origins(self) -> List[str]:
        if self.is_production:
            return ["https://your-domain.com"]
        return ["http://localhost:3000", "http://localhost:3001"]
```

### Production Security Headers

```python
# backend/app/main.py
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

if settings.is_production:
    # Restrict allowed hosts in production
    app.add_middleware(
        TrustedHostMiddleware, 
        allowed_hosts=["your-domain.com", "*.your-domain.com"]
    )
    
    # Strict CORS in production
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE"],
        allow_headers=["*"],
    )
```

## Monitoring and Logging

### Health Check Endpoints

```python
# backend/app/api/endpoints/health.py
@router.get("/")
async def basic_health():
    """Basic health check for load balancers."""
    return {"status": "healthy", "timestamp": datetime.utcnow()}

@router.get("/detailed")
async def detailed_health():
    """Detailed health check with service status."""
    checks = {
        "database": await check_database_connection(),
        "ai_providers": await check_ai_providers(),
        "external_services": await check_external_services()
    }
    
    overall_status = "healthy" if all(checks.values()) else "degraded"
    
    return {
        "status": overall_status,
        "checks": checks,
        "timestamp": datetime.utcnow(),
        "version": "1.0.0"
    }
```

### Structured Logging

```python
# backend/app/core/logging.py
import logging
import json
from datetime import datetime

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "message": record.getMessage(),
            "module": record.module,
        }
        
        if hasattr(record, 'user_id'):
            log_entry['user_id'] = record.user_id
        if hasattr(record, 'request_id'):
            log_entry['request_id'] = record.request_id
            
        return json.dumps(log_entry)

# Configure logging for production
if settings.is_production:
    logging.basicConfig(
        level=logging.INFO,
        format='%(message)s',
        handlers=[logging.StreamHandler()]
    )
    
    for handler in logging.root.handlers:
        handler.setFormatter(JSONFormatter())
```

## Performance Optimization

### Frontend Optimization

```typescript
// next.config.js - Production optimizations
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable compression
  compress: true,
  
  // Optimize images
  images: {
    domains: ['your-domain.com'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Bundle analyzer in development
  ...(process.env.ANALYZE === 'true' && {
    bundleAnalyzer: {
      enabled: true,
    },
  }),
  
  // Production optimizations
  ...(process.env.NODE_ENV === 'production' && {
    swcMinify: true,
    experimental: {
      optimizeCss: true,
    },
  }),
}

module.exports = nextConfig
```

### Backend Optimization

```python
# backend/app/main.py - Production optimizations
from fastapi import FastAPI
from fastapi.middleware.gzip import GZipMiddleware

app = FastAPI(
    title="Prompt-Stack API",
    version="1.0.0",
    docs_url="/docs" if not settings.is_production else None,  # Disable docs in prod
    redoc_url=None if settings.is_production else "/redoc",
)

# Enable compression
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Connection pooling for database
from app.services.supabase import configure_connection_pool
configure_connection_pool(
    min_connections=5,
    max_connections=20 if settings.is_production else 5
)
```

## SSL/TLS Configuration

### Let's Encrypt with Certbot

```bash
# Install certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Generate SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### SSL Configuration for Nginx

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # SSL settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
}
```

## Backup and Recovery

### Database Backups

```bash
# Automated backup script
#!/bin/bash
DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/backups"
DATABASE_URL="your-supabase-connection-string"

# Create backup
pg_dump $DATABASE_URL > "$BACKUP_DIR/backup_$DATE.sql"

# Compress backup
gzip "$BACKUP_DIR/backup_$DATE.sql"

# Clean old backups (keep 30 days)
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

# Upload to cloud storage (optional)
aws s3 cp "$BACKUP_DIR/backup_$DATE.sql.gz" s3://your-backup-bucket/
```

### Environment Backup

```bash
# Backup environment variables
#!/bin/bash
echo "# Backup created on $(date)" > env_backup.txt
echo "# Backend environment" >> env_backup.txt
cat backend/.env >> env_backup.txt
echo "" >> env_backup.txt
echo "# Frontend environment" >> env_backup.txt
cat frontend/.env.local >> env_backup.txt

# Encrypt backup
gpg --symmetric --cipher-algo AES256 env_backup.txt
rm env_backup.txt
```

## Scaling Considerations

### Horizontal Scaling

```yaml
# kubernetes/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: prompt-stack-backend
spec:
  replicas: 3  # Scale to 3 instances
  selector:
    matchLabels:
      app: prompt-stack-backend
  template:
    metadata:
      labels:
        app: prompt-stack-backend
    spec:
      containers:
      - name: backend
        image: your-registry/prompt-stack-backend:latest
        ports:
        - containerPort: 8000
        env:
        - name: ENVIRONMENT
          value: "production"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi" 
            cpu: "500m"
```

### Load Balancing

```nginx
# nginx load balancing
upstream backend_pool {
    server backend-1:8000;
    server backend-2:8000;
    server backend-3:8000;
}

server {
    location /api/ {
        proxy_pass http://backend_pool;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Troubleshooting Deployment

### Common Issues

1. **"CORS errors in production"**
   ```bash
   # Check CORS_ORIGINS includes your frontend domain
   CORS_ORIGINS=["https://your-frontend-domain.vercel.app"]
   ```

2. **"Environment variables not loading"**
   ```bash
   # Verify all required variables are set
   ./scripts/check-env-vars.sh
   ```

3. **"Database connection failed"**
   ```bash
   # Test database connection
   psql $SUPABASE_URL -c "SELECT 1;"
   ```

4. **"SSL certificate errors"**
   ```bash
   # Check certificate validity
   openssl x509 -in /path/to/cert.pem -text -noout
   ```

### Debug Commands

```bash
# Check service health
curl https://your-backend-domain.railway.app/health

# Check frontend build
curl https://your-frontend-domain.vercel.app

# Test API endpoint
curl -X POST https://your-backend-domain.railway.app/api/llm/demo \
  -H "Content-Type: application/json" \
  -d '{"prompt": "test", "model": "demo"}'

# Check logs
railway logs  # Railway logs
vercel logs   # Vercel logs
```

---

**Next Steps**:
- Monitor application performance and errors
- Set up automated backups
- Configure monitoring and alerting
- Plan for scaling based on usage patterns