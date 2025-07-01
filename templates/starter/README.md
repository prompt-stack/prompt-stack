# Prompt Stack Starter

🚀 **Turn Your Prompts Into Products**

This is a minimal starter template that mirrors the full Prompt Stack architecture.

## Quick Start

**Note**: If you see duplicate files in the root directory (app/, lib/, *.config.js files), 
please delete them manually. All Next.js files should be in the frontend/ directory.

```bash
# Install dependencies
npm run install:all

# Set up environment
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env

# Run development servers
npm run dev          # Frontend only
npm run dev:backend  # Backend only (requires Python)
npm run dev:all      # Frontend + Backend together
```

## Architecture Overview

```
prompt-stack-starter/
├── frontend/          # Next.js 14 app
│   ├── app/          # App router pages
│   ├── components/   # React components
│   └── lib/          # Utilities
├── backend/          # FastAPI server (minimal)
│   ├── app/          # Python app
│   └── requirements.txt
├── supabase/         # Database setup
│   └── migrations/   # SQL schemas
└── scripts/          # Helper scripts
```

## What's Included (Minimal Versions)

### Frontend
- ✅ Next.js 14 with TypeScript
- ✅ Authentication UI (not functional)
- ✅ AI Chat interface (demo only)
- ✅ Dashboard layout
- ⚠️ No real authentication
- ⚠️ No AI provider connections
- ⚠️ No payment processing

### Backend
- ✅ FastAPI structure
- ✅ Basic health endpoint
- ⚠️ No real API endpoints
- ⚠️ No database connections
- ⚠️ No authentication logic

### Database
- ✅ Supabase migration example
- ⚠️ No RLS policies
- ⚠️ No actual schema

## Comparison: Starter vs Full Codebase

| Feature | Starter | Full Codebase ($97) |
|---------|---------|---------------------|
| Files | ~30 | 300+ |
| AI Providers | 0 | 4 (OpenAI, Anthropic, etc) |
| Authentication | UI only | Complete with Supabase |
| Payment Processing | None | Stripe + LemonSqueezy |
| API Endpoints | 1 (health) | 15+ production endpoints |
| Database Schema | Example | Production-ready |
| Deployment Scripts | None | One-command deploy |
| Vector Database | None | Full RAG support |
| Rate Limiting | None | Built-in |
| Admin Panel | None | Complete |
| Setup Video | None | Included |
| Commercial License | No | Yes |

## Get the Full Experience

### 🚀 [Prompt Stack Codebase](https://promptstack.com/code) - $97
The complete production-ready codebase with everything you need to ship.

### 📚 [Prompt Stack Studio](https://promptstack.com/studio) - $197  
Learn the VIBE Framework with video courses, workshops, and community.

### 💰 [Bundle Deal](https://promptstack.com/bundle) - $247
Get both and save $47!

---

Built with ❤️ by [@hoffdigital](https://tiktok.com/@hoffdigital)