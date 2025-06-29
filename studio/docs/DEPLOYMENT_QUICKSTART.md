# 🚀 Deployment Quick Start

> **Time Required**: 10-15 minutes  
> **Difficulty**: Easy (copy & paste commands)

## Prerequisites

1. **Accounts** (free tiers work):
   - [Vercel](https://vercel.com) - Frontend hosting
   - [Railway](https://railway.app) OR [Render](https://render.com) - Backend hosting
   - [Supabase](https://supabase.com) - Database (if using auth)

2. **Your API Keys** in `backend/.env` (optional, demo mode works without them)

## 🎯 Quick Deploy (Railway + Vercel)

### Step 1: Deploy Backend to Railway

1. **Push to GitHub** (if not already):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_URL
   git push -u origin main
   ```

2. **Deploy on Railway** (Two Options):

   **Option A: Nixpacks (Recommended - Automatic)**
   - Go to [railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Railway detects Python and uses Nixpacks automatically ✅
   - No Docker configuration needed!

   **Option B: Docker (If you need custom setup)**
   - Delete the `Procfile` from root
   - Railway will use `railway.json` and Dockerfile

3. **Add Environment Variables**:
   - Click on your service → "Variables" tab
   - Click "Raw Editor" and paste:
   ```env
   # Copy ALL variables from your backend/.env file
   # Plus these Railway-specific ones:
   ENVIRONMENT=production
   PORT=8000
   
   # After deploying frontend, add:
   FRONTEND_URL=https://your-app.vercel.app
   CORS_ORIGINS=https://your-app.vercel.app
   ```

4. **Get your Backend URL**:
   - Click "Settings" → "Domains" → "Generate Domain"
   - Copy the URL (like `https://your-app-production.up.railway.app`)

### Step 2: Deploy Frontend to Vercel

1. **Update Frontend Config**:
   ```bash
   cd frontend
   cp .env.local .env.production.local
   # Edit .env.production.local:
   # NEXT_PUBLIC_API_URL=https://your-railway-backend.up.railway.app
   ```

2. **Deploy to Vercel**:
   ```bash
   npx vercel --prod
   # Follow prompts, accept defaults
   ```

3. **Get your Frontend URL** (shown after deployment)

### Step 3: Final Configuration

1. **Update Railway** with your Vercel URL:
   - Go back to Railway → Variables
   - Update:
   ```env
   FRONTEND_URL=https://your-app.vercel.app
   CORS_ORIGINS=https://your-app.vercel.app
   ```

2. **Redeploy Railway** (happens automatically after env changes)

✅ **Done!** Visit your Vercel URL to see your live app.

---

## 🚨 Common Issues & Fixes

### "Build failed: requirements.txt not found"
- **Fix**: Railway is using the wrong Dockerfile
- **Solution**: Make sure `railway.json` points to `Dockerfile.railway`

### "CORS error" or "Network failed"  
- **Fix**: Backend URL is wrong or CORS not configured
- **Solution**: 
  1. Check `NEXT_PUBLIC_API_URL` in frontend/.env.production.local
  2. Check `CORS_ORIGINS` in Railway includes your Vercel URL

### "500 Internal Server Error"
- **Fix**: Environment variables missing
- **Solution**: Make sure ALL variables from backend/.env are in Railway

### "Cannot connect to Supabase"
- **Fix**: Supabase keys not set in Railway
- **Solution**: Add `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY`

---

## 📋 Platform Comparison

| Platform | Best For | Free Tier | Deploy Time |
|----------|----------|-----------|-------------|
| **Railway** | Fast deploys, great DX | $5 credit/month | 2-3 min |
| **Render** | Stable, predictable | 750 hrs/month | 5-10 min |
| **Fly.io** | Global edge, advanced | 3 VMs free | 5-10 min |

---

## 🎉 Next Steps

1. **Custom Domain**: Add your domain in Vercel/Railway settings
2. **Monitoring**: Railway shows logs, metrics, and errors
3. **Scaling**: Both platforms auto-scale with traffic

Need help? Check [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.