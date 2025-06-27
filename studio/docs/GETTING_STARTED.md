# Getting Started Guide

> **Purpose**: This guide covers the complete setup process for Prompt-Stack, from initial installation to adding AI and authentication features.

## Quick Setup (Demo Mode)

Get a working application in under 2 minutes:

```bash
# Clone the repository
git clone https://github.com/your-username/prompt-stack.git
cd prompt-stack

# Start in demo mode (no configuration needed)
./setup.sh

# Visit your running application
open http://localhost:3000
```

**Result**: Working app with demo authentication, mock AI responses, and test payment flows.

## Progressive Enhancement

Add real features incrementally:

### Step 1: Add Authentication & Database
```bash
# Configure Supabase for real user accounts
./setup.sh supabase
```

**What this enables**:
- Real user registration/login
- User profiles and sessions  
- PostgreSQL database with pgvector
- Automatic database migrations

### Step 2: Add AI/LLM Providers
```bash
# Configure AI providers (OpenAI, Anthropic, etc.)
./setup.sh ai
```

**What this enables**:
- Real AI text generation
- Multiple LLM provider support
- Vector embeddings and search
- Rate limiting and usage tracking

### Step 3: Add Payments (Optional)
```bash
# Check payment configuration status
curl http://localhost:8000/api/payments/stripe/status
```

**What this enables**:
- Stripe or Lemon Squeezy integration
- One-time purchases and subscriptions
- Webhook handling for fulfillment

See `EXTENSION_PAYMENTS.md` for complete payment setup.

### Step 4: Add Email (Optional)
See `EXTENSION_EMAIL.md` for email integration setup.

## Configuration Files

### Backend Environment (`.env`)
```bash
# Core application settings
ENVIRONMENT=development
DEMO_MODE=auto

# Authentication (Supabase)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key

# AI Providers (choose one or more)
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GEMINI_API_KEY=your_gemini_key
DEEPSEEK_API_KEY=your_deepseek_key

# Payments (optional)
STRIPE_SECRET_KEY=your_stripe_key
LEMONSQUEEZY_API_KEY=your_ls_key
```

### Frontend Environment (`.env.local`)
```bash
# API connection
NEXT_PUBLIC_API_URL=http://localhost:8000

# Authentication (must match backend)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Development Commands

```bash
# Development (both frontend and backend)
make dev

# Individual services
make dev-frontend    # Next.js on port 3000
make dev-backend     # FastAPI on port 8000

# Logs and monitoring
make logs           # All service logs
make logs-backend   # Backend logs only
make logs-frontend  # Frontend logs only

# Maintenance
make stop           # Stop all services
make clean          # Clean containers and volumes
```

## Testing Your Setup

### 1. API Health Check
```bash
curl http://localhost:8000/health
```

### 2. Test Authentication
- Visit `/auth/register` to create account
- Visit `/auth/login` to sign in
- Visit `/dashboard` (requires authentication)

### 3. Test AI Features
- Visit `/test-ai` (requires authentication)
- Try different AI providers and models

### 4. Test API Integration
- Visit `/test-api` for API testing interface

## Common Issues

### Port Conflicts
```bash
# Check which ports are in use
./scripts/check-ports.sh

# Use custom ports if needed
FRONTEND_PORT=3001 BACKEND_PORT=8001 make dev
```

### Docker Issues
```bash
# Full restart after environment changes
docker-compose down && docker-compose up -d

# View detailed logs
docker-compose logs backend
docker-compose logs frontend
```

### Authentication Issues
After changing Supabase configuration:
1. Restart Docker containers
2. **Log out and log back in** (critical step)
3. Clear browser cache if needed

## Next Steps

- **Architecture**: Read `ARCHITECTURE_OVERVIEW.md` for system design
- **Authentication**: See `AUTHENTICATION_GUIDE.md` for auth patterns
- **AI Integration**: See `AI_LLM_INTEGRATION.md` for LLM features
- **Deployment**: See `DEPLOYMENT_GUIDE.md` for production setup
- **Troubleshooting**: See `TROUBLESHOOTING.md` for common issues

## Support

- **Issues**: GitHub Issues for bug reports
- **Documentation**: All guides in `/docs` folder
- **API Reference**: Visit `http://localhost:8000/docs` when running