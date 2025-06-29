# prompt-stack: The AI Development Studio

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/docker-ready-blue.svg)](https://www.docker.com/)
[![AI](https://img.shields.io/badge/AI-native-green.svg)](https://github.com/prompt-stack/prompt-stack)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-latest-009688.svg)](https://fastapi.tiangolo.com/)

**Everything you need to build and ship AI products. From prototype to production in minutes.**

🚀 **Real-World Tested**: 100% setup success rate with live users  
🔒 **Enterprise Security**: Bank-level authentication and data protection  
🤖 **AI-Native**: Built for OpenAI, Anthropic, Gemini, and DeepSeek  
⚡ **Instant Demo**: Works without any API keys or configuration

## 🤖 For AI Assistants

- **[LLM_NAVIGATION.md](./LLM_NAVIGATION.md)** - Quick navigation and actions
- **[CLAUDE.md](./CLAUDE.md)** - Operating manual for AI assistants
- **[AI_ASSISTANT_GUIDE.md](./AI_ASSISTANT_GUIDE.md)** - Common prompts and patterns

## 🚀 Quick Start

```bash
# 1. Clone and setup (instant demo mode)
git clone https://github.com/prompt-stack/prompt-stack.git
cd prompt-stack/template
./setup.sh

# 2. Visit your app (already working!)
open http://localhost:3000

# Optional: Using custom ports?
# If ports 3000 or 8000 are busy:
./scripts/check-ports.sh
# See docs/CUSTOM_PORTS.md for details
```

**That's it!** You have a working app in demo mode.

## 🔧 Add Real Features (Progressive Enhancement)

```bash
# Add authentication & database
./setup.sh supabase
# (Auto-restarts Docker, shows migration instructions)

# Add AI providers
./setup.sh ai
# (Auto-restarts Docker, AI is ready!)

# Or configure everything at once
./setup.sh configure

# Check what's configured
./setup.sh status
```

Each step builds on the previous one. Start simple, add features as needed.

📖 See the [detailed quick start guide](docs/GETTING_STARTED.md) for step-by-step instructions.

## ✨ Features

### Works Out of the Box (Demo Mode)
- 🔐 **Authentication** - Demo auth that works without configuration
- 🤖 **AI Chat** - Demo responses to test your UI
- 💳 **Payments** - Test payment flows with mock data
- 🔍 **Vector Search** - In-memory vector operations
- 📚 **API Docs** - Auto-generated at /docs

### Production Ready
- 🏗️ **Next.js 15** - Latest React framework
- 🐍 **FastAPI** - High-performance Python backend
- 🗄️ **Supabase** - Database, auth, storage, vectors
- 🤖 **Multi-AI** - OpenAI, Anthropic, Gemini, DeepSeek
- 💰 **Payments** - Stripe & Lemon Squeezy
- 📧 **Email** - Resend integration
- 🐳 **Docker** - Development & production ready

## 📁 Project Structure

```
├── frontend/          # Next.js app
├── backend/           # FastAPI app
├── supabase/          # Database migrations
├── scripts/           # Utility scripts
├── docs/              # Documentation
└── docker-compose.yml # Local development
```

## 🛠️ Configuration

### Option 1: Demo Mode (Default)
No configuration needed! Everything works with mock data.

### Option 2: Real Services

**⚠️ Important: Configure in this order!**
1. **Supabase first** (required for auth)
2. **Then AI providers** (at least one)
3. **Optional:** Payments, Email

**Backend** (`backend/.env`):
```bash
# 1️⃣ FIRST: Supabase (required!)
SUPABASE_URL=your_url
SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_KEY=your_service_key

# 2️⃣ SECOND: Add at least one AI provider
DEEPSEEK_API_KEY=your_key  # Recommended - $0.14/million tokens!
# Or use: OPENAI_API_KEY, ANTHROPIC_API_KEY, GEMINI_API_KEY

# 3️⃣ OPTIONAL: Admin emails (first user is admin by default)
ADMIN_EMAILS=["admin@company.com","rose@company.com"]
```

**Frontend** (`frontend/.env.local`):
```bash
# Copy from frontend/.env.example
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

> ⚠️ **CRITICAL: Environment Variable Changes**
> 
> After changing ANY environment variables:
> 
> **1. FULL RESTART Required:**
> ```bash
> docker-compose down && docker-compose up -d
> ```
> (Simple `restart` is NOT sufficient - env vars load at container creation!)
> 
> **2. REFRESH Authentication:**
> - If you're logged into the app, **log out and log back in**
> - This refreshes your authentication tokens with the new configuration
> - **Required after adding API keys or changing Supabase settings**

## 📝 Common Commands

```bash
make dev              # Start everything
make dev-frontend     # Frontend only
make dev-backend      # Backend only
make test-api         # Test API endpoints
make clean            # Stop and cleanup
./scripts/diagnose.sh # 🔍 Diagnose issues (NEW!)
```

### 🩺 Troubleshooting

```bash
# Quick health check
./scripts/diagnose.sh

# Check detailed system status
curl http://localhost:8000/health/detailed | jq

# View feature configuration
curl http://localhost:8000/health/features | jq
```

## 🚀 Deployment

Ready to deploy in 10 minutes:

```bash
# 1. Prepare for Railway (creates Nixpacks files)
./scripts/setup-railway.sh

# 2. Deploy backend to Railway
# Go to railway.app → New Project → Deploy from GitHub
# Railway auto-detects Python and deploys with Nixpacks

# 3. Deploy frontend to Vercel
cd frontend && vercel --prod
```

See [Deployment Quick Start](docs/DEPLOYMENT_QUICKSTART.md) for detailed instructions.

## 📖 Documentation

- [Getting Started](docs/GETTING_STARTED.md) - Complete setup guide
- [Architecture Overview](docs/ARCHITECTURE_OVERVIEW.md) - System design
- [Authentication Guide](docs/AUTHENTICATION_GUIDE.md) - Auth implementation
- [AI/LLM Integration](docs/AI_LLM_INTEGRATION.md) - AI features
- [Development Patterns](docs/DEVELOPMENT_PATTERNS.md) - Code patterns
- [Deployment Guide](docs/DEPLOYMENT_GUIDE.md) - Production deployment
- [Security Guide](docs/SECURITY_GUIDE.md) - Security best practices
- [Email Integration](docs/EMAIL_INTEGRATION.md) - Email setup (optional)
- [Payment Integration](docs/PAYMENT_INTEGRATION.md) - Payment setup (optional)
- [Troubleshooting](docs/TROUBLESHOOTING.md) - Common issues
- [API Documentation](http://localhost:8000/docs) - Interactive API docs
- [Changelog](CHANGELOG.md) - Release history

## 🧪 Testing

```bash
# Test API endpoints
./scripts/test-api-simple.sh

# Comprehensive test
./scripts/test-api-comprehensive.sh
```

## 🎯 Quick Wins

1. **Demo First**: Start with demo mode, upgrade when ready
2. **DeepSeek**: Most cost-effective AI ($0.14/M tokens)
3. **Test Keys**: Use Stripe test mode for development
4. **Local Dev**: Full stack runs on your machine
5. **Clean Start**: Delete `/app/prompt-stack` folder to remove all demos
6. **Custom Ports**: Set `FRONTEND_PORT=3001` and `BACKEND_PORT=8002` in `.env` file

## ⚠️ Important: Where to Build

- ✅ **Build your app in**: `frontend/app/`
- ❌ **NOT in**: `frontend/app/prompt-stack/` (demo pages only!)
- 🗑️ **When ready**: Delete the entire `prompt-stack` folder

## 📦 What's Included

### API Endpoints
- ✅ Authentication (JWT + Demo auth)
- ✅ User profiles with roles ([Admin Setup Guide](docs/ADMIN_SETUP.md))
- ✅ LLM chat/completion
- ✅ Vector search
- ✅ File uploads
- ✅ Payment processing
- ✅ Webhooks

### Demo Mode Endpoints
These work without any configuration:
- `POST /api/auth/demo/signin` - Demo sign in
- `POST /api/auth/demo/signup` - Demo sign up
- `GET /api/auth/demo/check` - Check demo auth availability
- `POST /api/llm/generate-demo` - Generate text with demo AI
- `POST /api/llm/embedding-demo` - Create demo embeddings
- `GET /api/llm/providers` - List available AI providers
- `GET /api/payments-demo/stripe/status` - Stripe configuration status
- `GET /api/payments-demo/lemonsqueezy/status` - Lemon Squeezy status
- `GET /api/examples/` - Example data endpoints
- `GET /api/dev/health` - Comprehensive health check (dev mode)

### Frontend Pages

**Core Pages** (keep these):
- ✅ Homepage with service status (`/`)
- ✅ Auth pages (`/auth/*`)

**Demo Pages** (in `/prompt-stack` folder - safe to delete):
- ✅ Prompt-Stack hub (`/prompt-stack`)
- ✅ Developer guide (`/prompt-stack/guide`)
- ✅ Form components showcase (`/prompt-stack/guide/forms`)
- ✅ LLM demo page (`/prompt-stack/demo`)
- ✅ API test page (`/prompt-stack/api-test`)
- ✅ Example dashboard (`/prompt-stack/dashboard`)
- ✅ Example profile (`/prompt-stack/profile`)
- ✅ Example settings (`/prompt-stack/settings`)

### Developer Tools
- ✅ Hot reload
- ✅ Type safety
- ✅ API documentation
- ✅ Error handling
- ✅ Rate limiting
- ✅ GitHub Actions CI/CD
- ✅ Database migrations
- ✅ Test framework ready

## 🤝 Contributing

Contributions welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md).

- [Bug Reports](.github/ISSUE_TEMPLATE/bug_report.yml) - Report issues
- [Feature Requests](.github/ISSUE_TEMPLATE/feature_request.yml) - Suggest improvements  
- [Setup Help](.github/ISSUE_TEMPLATE/setup_help.yml) - Get assistance

## 📄 License

MIT License - use this template for anything! See [LICENSE](LICENSE) for details.

## 👥 Authors

See [AUTHORS.md](AUTHORS.md) for contributors and acknowledgments.

---

Built for developers who want to ship fast with AI 🚀