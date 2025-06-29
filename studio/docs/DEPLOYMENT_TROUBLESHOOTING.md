# 🔧 Deployment Troubleshooting Guide

> When deployment goes wrong, this guide has your back.

## 🚨 Railway Issues

### Build Fails: "requirements.txt not found"

**Error**:
```
failed to compute cache key: failed to calculate checksum of ref
"/requirements.txt": not found
```

**Cause**: Railway builds from repository root, not backend folder

**Fix (Use Nixpacks instead of Docker)**: 
1. Add these files to your repository root:
   - `Procfile`: `web: cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - `requirements.txt`: Copy or symlink from `backend/requirements.txt`
   - `runtime.txt`: `python-3.11`
2. Delete `railway.json` to let Railway auto-detect Python
3. Redeploy - Railway will use Nixpacks automatically

**Alternative Fix (Keep using Docker)**:
1. Ensure `Dockerfile.railway` exists in root
2. Check `railway.json` uses `"dockerfilePath": "Dockerfile.railway"`

---

### Build Fails: "Multiple services found"

**Error**:
```
Multiple services found. Please specify a service via the --service flag.
```

**Cause**: Multiple failed deployments created multiple services

**Fix**:
1. Go to Railway dashboard
2. Delete all services except one
3. Or create new project and start fresh

---

### Runtime Error: "PORT is not defined"

**Error**: Backend crashes immediately after starting

**Fix**: 
1. Railway provides PORT automatically
2. Make sure Dockerfile uses: `CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]`
3. Don't hardcode port 8000

---

## 🚨 Vercel Issues

### Build Fails: TypeScript Errors

**Error**:
```
Type error: Parameter '_event' implicitly has an 'any' type.
```

**Fix**:
1. Run locally first: `cd frontend && npm run build`
2. Fix all TypeScript errors
3. Common fix: Add `any` type to parameters
4. Redeploy

---

### Environment Variables Not Working

**Symptom**: Frontend can't connect to backend

**Fix**:
1. Vercel requires `NEXT_PUBLIC_` prefix for client-side vars
2. Correct: `NEXT_PUBLIC_API_URL=https://...`
3. Wrong: `API_URL=https://...`
4. Add to Vercel dashboard → Settings → Environment Variables

---

## 🚨 Connection Issues

### CORS Errors

**Error**: 
```
Access to fetch at 'https://backend.railway.app' from origin 
'https://frontend.vercel.app' has been blocked by CORS policy
```

**Fix in Railway**:
```env
CORS_ORIGINS=["https://your-frontend.vercel.app"]
FRONTEND_URL=https://your-frontend.vercel.app
```

**Note**: Include the full URL with https://

---

### "Network request failed" or 404

**Causes & Fixes**:

1. **Wrong backend URL**: 
   - Check `NEXT_PUBLIC_API_URL` in frontend
   - Must match your Railway domain exactly
   - Include `https://` 
   - No trailing slash

2. **Backend not running**:
   - Check Railway logs
   - Look for crash/restart loops
   - Usually missing env vars

3. **Path mismatch**:
   - Frontend expects `/api/health`
   - Backend serves at `/health`
   - Check API route prefixes

---

## 🚨 Database Issues

### "Invalid API key" from Supabase

**Fix**: Add to Railway:
```env
SUPABASE_URL=your-project-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
```

### "relation does not exist"

**Cause**: Database migrations not run

**Fix**:
1. Go to Supabase dashboard → SQL Editor
2. Run migrations from `supabase/migrations/`
3. Start with `001_initial_schema.sql`

---

## 🛠️ Quick Diagnostic Commands

### Check if backend is alive:
```bash
curl https://your-backend.railway.app/health
# Should return: {"status":"healthy"}
```

### Check CORS headers:
```bash
curl -H "Origin: https://your-frontend.vercel.app" \
     -I https://your-backend.railway.app/health
# Look for: Access-Control-Allow-Origin
```

### Test from frontend:
```javascript
// Run in browser console on your Vercel site
fetch(process.env.NEXT_PUBLIC_API_URL + '/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

---

## 🎯 Platform-Specific Gotchas

### Railway
- ✅ Auto-injects PORT env var
- ✅ Supports Dockerfile from root
- ❌ Builds from repo root (not subdirectory)
- ❌ Requires explicit domain generation

### Render
- ✅ More stable/predictable than Railway
- ❌ Slower cold starts on free tier
- ❌ Requires render.yaml configuration
- ❌ Different env var format

### Vercel
- ✅ Great Next.js integration
- ✅ Automatic deployments
- ❌ Requires NEXT_PUBLIC_ prefix
- ❌ Build cache can cause issues (clear it)

---

## 🆘 Still Stuck?

1. **Check example deployment**: [DEPLOYMENT_LOG.md](../DEPLOYMENT_LOG.md)
2. **Common issues**: 90% are environment variables
3. **Run diagnostics**: `./scripts/diagnose.sh`
4. **Nuclear option**: Delete everything, start fresh with the guide

---

## 📝 Deployment Checklist

Before deploying, ensure:

- [ ] All environment variables copied to deployment platform
- [ ] `ENVIRONMENT=production` set
- [ ] `FRONTEND_URL` points to Vercel URL  
- [ ] `CORS_ORIGINS` includes Vercel URL
- [ ] Database migrations run (if using Supabase)
- [ ] TypeScript builds without errors
- [ ] API health check works locally