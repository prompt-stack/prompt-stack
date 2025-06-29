# 🤖 LLM Quick Navigation

## File Tree (What Goes Where)

```
studio/
├── frontend/
│   ├── app/                     ← BUILD NEW PAGES HERE
│   │   ├── (authenticated)/     ← Protected pages
│   │   ├── page.tsx            ← Homepage
│   │   └── [name]/page.tsx     ← New pages
│   ├── components/             
│   │   ├── ui/                 ← Reusable UI components
│   │   └── providers/          ← Auth, theme providers
│   └── services/               ← API client functions
│
├── backend/
│   ├── app/
│   │   ├── api/endpoints/      ← ADD NEW ENDPOINTS HERE
│   │   ├── services/           ← Business logic
│   │   │   ├── llm/           ← AI providers
│   │   │   └── auth/          ← Authentication
│   │   └── core/
│   │       └── config.py      ← Environment variables
│   └── requirements.txt        ← Python dependencies
│
├── scripts/
│   ├── setup-railway.sh        ← Prepare for deployment
│   ├── diagnose.sh            ← Debug issues
│   └── test-api-simple.sh     ← Test the API
│
└── docs/                       ← All documentation
```

## Common Tasks (Copy-Paste Ready)

### Create a new page
```bash
# Choose one:
echo "Create: frontend/app/(authenticated)/dashboard/page.tsx"  # Protected
echo "Create: frontend/app/about/page.tsx"                      # Public
```

### Add API endpoint
```bash
echo "1. Create: backend/app/api/endpoints/widgets.py"
echo "2. Add to: backend/app/api/router.py"
echo "   Code: api_router.include_router(widgets.router, prefix='/widgets', tags=['widgets'])"
```

### Fix TypeScript error
```typescript
// Add to frontend/next.config.js:
typescript: {
  ignoreBuildErrors: true
}
```

### Deploy to production
```bash
./scripts/setup-railway.sh  # Creates Procfile, requirements.txt, runtime.txt
git add . && git commit -m "Deploy" && git push
cd frontend && vercel --prod
```

## Environment Variables

### Development (.env files)
- `backend/.env` - Backend config
- `frontend/.env.local` - Frontend config

### Production (Platform dashboards)
- Railway: Add all backend/.env variables
- Vercel: Add NEXT_PUBLIC_API_URL pointing to Railway

## Quick Fixes

| Problem | Solution |
|---------|----------|
| "Module not found: @/components/ui/alert" | Create the component in frontend/components/ui/ |
| "CORS error" | Set CORS_ORIGINS=https://your-app.vercel.app (no brackets!) |
| "useSearchParams error" | Wrap component in Suspense |
| "TypeScript build failed" | Add ignoreBuildErrors: true to next.config.js |
| "Can't find railway.json" | Good! Use Nixpacks instead (it's automatic) |

## Testing Commands

```bash
# Quick health check
curl http://localhost:8000/health

# Test with demo auth
curl -X POST http://localhost:8000/api/auth/demo/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"any"}'

# View API docs
open http://localhost:8000/docs
```