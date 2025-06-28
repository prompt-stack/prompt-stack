# 🤔 Frequently Asked Questions

## Getting Started

### Q: How many users can I support with the default setup?
**A: 100-1,000 users comfortably**

The default Docker setup can handle:
- **Demo mode**: 50-100 concurrent users
- **With Supabase**: 500-1,000 concurrent users
- **With Redis**: 5,000+ concurrent users

Most apps don't hit these limits until they're making real money.

### Q: Do I need all those API keys to start?
**A: No! Start with demo mode**

```bash
# This works immediately, no API keys needed:
prompt-stack create my-app
cd my-app
prompt-stack dev
```

Add real services only when you need them:
- **0-100 users**: Demo mode is fine
- **100-1,000 users**: Add Supabase for real auth
- **1,000+ users**: Add Redis, monitoring, etc.

### Q: Which AI provider should I use?
**A: DeepSeek for cost, OpenAI for quality**

| Provider | Best For | Cost | Speed |
|----------|----------|------|-------|
| **DeepSeek** | Most apps | $0.14/M tokens | Fast |
| **OpenAI** | Premium features | $3-60/M tokens | Fast |
| **Anthropic** | Long context | $3-15/M tokens | Medium |
| **Gemini** | Free tier | $0-7/M tokens | Fast |
| **Demo** | Development | Free | Instant |

**Pro tip**: Start with DeepSeek. It's 95% as good as GPT-4 at 2% of the cost.

---

## Architecture & Scaling

### Q: When should I move from Docker to cloud hosting?
**A: When you have paying customers**

| Stage | Users | Setup | Monthly Cost |
|-------|-------|-------|--------------|
| **Building** | 0-10 | Local Docker | $0 |
| **Launch** | 10-100 | Single VPS + Docker | $20-50 |
| **Growth** | 100-1,000 | Vercel + Railway | $50-200 |
| **Scale** | 1,000+ | AWS/GCP + k8s | $200+ |

Don't optimize for scale before you have users to scale for.

### Q: Is this production-ready?
**A: Yes, with 30 minutes of setup**

Out of the box:
- ✅ Secure authentication
- ✅ Payment processing
- ✅ Rate limiting
- ✅ Error handling
- ✅ CORS configured
- ⚠️ Needs HTTPS setup (use Cloudflare)
- ⚠️ Needs backup strategy
- ⚠️ Needs monitoring (after 100+ users)

### Q: How do I handle file uploads?
**A: Use Supabase Storage or S3**

```python
# Already integrated in the template:
# backend/app/api/endpoints/upload.py
@router.post("/upload")
async def upload_file(file: UploadFile):
    # Validates file type and size
    # Stores in Supabase Storage
    # Returns secure URL
```

Limits by default:
- Max file size: 50MB
- Allowed types: images, documents, text

---

## Development Workflow

### Q: Why do I need to log out/in after adding API keys?
**A: JWT tokens cache the old configuration**

When you add API keys and restart Docker, your browser still has tokens from demo mode. Quick fix:
1. Add API keys
2. Restart Docker
3. **Log out and log back in** ← This refreshes tokens

### Q: Should I delete the `/prompt-stack` demo folder?
**A: Yes, after you understand the patterns**

The demo shows:
- How to structure pages
- How to call APIs
- How to handle auth
- UI component examples

Once you've learned the patterns, delete it and build your own features.

### Q: How do I run frontend and backend separately?
**A: Use the make commands**

```bash
# Backend only (port 8000)
make dev-backend

# Frontend only (port 3000)  
make dev-frontend

# View logs
make logs-backend
make logs-frontend
```

This is faster for frontend development since you skip Docker overhead.

---

## Common Issues

### Q: Why am I getting "Pydantic validation error"?
**A: Environment variable name mismatch**

The backend Settings class expects exact names:
```bash
# ❌ Wrong
OPENAI_KEY=sk-...

# ✅ Correct  
OPENAI_API_KEY=sk-...
```

Check `backend/app/core/config.py` for exact field names.

### Q: Can I use this with an existing database?
**A: Yes, just point to your Supabase instance**

1. Use your existing Supabase project URL and keys
2. Run migrations: `supabase/migrations/` 
3. Or adapt the schema to your needs

### Q: How do I add a new AI model?
**A: Add it to the capabilities system**

```python
# backend/app/services/capabilities.py
AVAILABLE_MODELS = {
    "new-model": {
        "provider": "openai",
        "name": "New Model",
        "context": 128000
    }
}
```

The UI automatically picks it up.

---

## Production & Deployment

### Q: What's the cheapest way to deploy this?
**A: Railway.app ($5-20/month)**

1. Frontend → Vercel (free)
2. Backend → Railway ($5/month)
3. Database → Supabase (free tier)
4. Redis → Railway ($5/month)

Total: ~$10-20/month for a real app.

### Q: Do I need Redis?
**A: Not until 1,000+ users**

Redis helps with:
- Distributed rate limiting
- Session management
- Caching

The in-memory rate limiter works fine for single-instance deployments.

### Q: How do I monitor errors in production?
**A: Add Sentry (after you have users)**

```python
# Quick setup (don't do this until you need it):
pip install sentry-sdk
sentry_sdk.init(dsn="your-dsn")
```

But seriously, don't add monitoring until users are actually using your app.

---

## Best Practices

### Q: Should I write tests?
**A: Only for what breaks**

Don't write tests for:
- UI that will change next week
- Features you're experimenting with
- Anything you might delete

Do write tests for:
- Payment webhooks
- Auth flows (after they're stable)
- Anything that broke in production

### Q: How should I structure my features?
**A: Follow the existing patterns**

```
frontend/app/
├── (authenticated)/
│   └── your-feature/    # Protected pages
│       └── page.tsx
└── your-public-page/    # Public pages
    └── page.tsx

backend/app/
├── api/endpoints/
│   └── your_endpoint.py # API routes
└── services/
    └── your_service.py  # Business logic
```

### Q: When should I optimize performance?
**A: When users complain**

Signs you need optimization:
- Pages take >3 seconds to load
- API calls timeout
- Users actually complain
- You have >1,000 daily active users

Until then, ship features.

---

## Philosophy

### Q: Is this "enterprise-ready"?
**A: It's "startup-ready", which is better**

Enterprise-ready often means:
- Over-engineered
- Slow to develop
- Expensive to run
- Hard to change

Startup-ready means:
- Ships fast
- Changes easily  
- Costs little
- Scales when needed

### Q: Why TypeScript strict mode off by default?
**A: Speed of development**

You can enable it anytime:
```json
// tsconfig.json
"strict": true
```

But many successful apps shipped with `any` types and fixed them later.

### Q: What's "Vibe Coding"?
**A: Building by feel, not by spec**

Traditional: Requirements → Design → Build → Test → Ship (6 months)
Vibe Coding: Idea → Build → Ship → Learn → Iterate (6 days)

It's about trusting your instincts and shipping fast to learn what users actually want.

---

## Still Have Questions?

- **GitHub Issues**: [github.com/prompt-stack/prompt-stack/issues](https://github.com/prompt-stack/prompt-stack/issues)
- **Documentation**: Check `/studio/docs/` for deep dives
- **Source Code**: Everything is documented inline

Remember: The best way to learn is to build something and ship it! 🚀