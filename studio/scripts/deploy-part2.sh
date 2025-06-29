#!/bin/bash
# Part 2: Configure and deploy frontend (after manual linking)

set -euo pipefail

echo "🚀 Railway Deployment - Part 2"
echo "=============================="
echo ""

# Check if linked
if ! railway status >/dev/null 2>&1; then
    echo "❌ Not linked to a Railway service"
    echo "   Run 'railway link' first"
    exit 1
fi

# Set environment variables
echo "📝 Setting environment variables..."

# Track problematic URLs
SUPABASE_URL_VALUE=""

while IFS= read -r line; do
    # Skip comments and empty lines
    [[ "$line" =~ ^[[:space:]]*# ]] && continue
    [[ -z "$line" ]] && continue
    
    # Split on first = only using regex
    if [[ "$line" =~ ^([^=]+)=(.*)$ ]]; then
        k="${BASH_REMATCH[1]}"
        v="${BASH_REMATCH[2]}"
        
        # Remove quotes if present
        v="${v%\"}"
        v="${v#\"}"
        v="${v%\'}"
        v="${v#\'}"
        
        # Store SUPABASE_URL for manual setting
        if [[ "$k" == "SUPABASE_URL" ]]; then
            SUPABASE_URL_VALUE="$v"
            echo "⚠️  SUPABASE_URL detected - will set manually after other vars"
            continue
        fi
        
        echo "Setting $k..."
        railway variables --set "$k=$v"
    fi
done < backend/.env

# Set production environment vars
railway variables --set "ENVIRONMENT=production"
railway variables --set "PORT=8000"

# Handle SUPABASE_URL separately due to Railway CLI bug
if [ -n "$SUPABASE_URL_VALUE" ]; then
    echo ""
    echo "⚠️  IMPORTANT: Setting SUPABASE_URL manually"
    echo "   Due to a Railway CLI bug, complex URLs may be truncated."
    echo "   If the deployment fails with Supabase errors:"
    echo "   1. Go to Railway dashboard → Variables"
    echo "   2. Set SUPABASE_URL=$SUPABASE_URL_VALUE"
    echo ""
    # Try to set it anyway, but warn user
    railway variables --set "SUPABASE_URL=$SUPABASE_URL_VALUE" || true
fi

# Get backend URL
BACKEND_URL=$(railway status | grep -Eo 'https://[^\"]+\.railway\.app' | head -n1)
if [ -z "$BACKEND_URL" ]; then
    echo "❌ Could not find Railway domain. Run 'railway domain' if needed."
    exit 1
fi

echo "✅ Backend configured: $BACKEND_URL"

# Check deployment health
echo ""
echo "🏥 Checking backend deployment status..."
sleep 5  # Give Railway a moment to deploy
HEALTH_CHECK=$(curl -s "$BACKEND_URL/api/deployment/status" || echo "failed")
if [[ "$HEALTH_CHECK" == *"success"* ]]; then
    echo "✅ Backend is healthy!"
else
    echo "⚠️  Backend health check failed - may still be deploying"
fi

# Deploy frontend
echo ""
echo "📦 Deploying frontend to Vercel..."
cd frontend

# Update production env
[ -f ".env.production.local" ] && rm .env.production.local
echo "NEXT_PUBLIC_API_URL=$BACKEND_URL" > .env.production.local
[ -f ".env.local" ] && grep "^NEXT_PUBLIC_SUPABASE" .env.local >> .env.production.local || true

# Add comment about CSP
echo "" >> .env.production.local
echo "# Note: CSP in next.config.js now uses these env vars automatically" >> .env.production.local

# Deploy to Vercel (must be run from frontend directory)
echo ""
echo "🚨 CRITICAL: You MUST be in the frontend directory for Vercel deployment!"
echo "   Current directory: $(pwd)"
echo ""
vercel --prod

echo ""
read -p "Enter your Vercel production URL (e.g., https://myapp.vercel.app): " FRONTEND_URL

cd ..

# Update Railway with frontend URL
echo ""
echo "🔄 Updating Railway with frontend URL..."
railway variables --set "FRONTEND_URL=$FRONTEND_URL"
# Remove brackets for production CORS
railway variables --set "CORS_ORIGINS=$FRONTEND_URL"

# Trigger Railway redeploy
echo "🔄 Redeploying Railway with updated CORS..."
railway up

echo ""
echo "🎉 Deployment Complete!"
echo "======================"
echo "Backend:  $BACKEND_URL"
echo "Frontend: $FRONTEND_URL"
echo ""
echo "📋 Post-Deployment Checklist:"
echo "1. ✅ Test your app at: $FRONTEND_URL"
echo "2. ✅ Check backend health: $BACKEND_URL/health/detailed"
echo "3. ✅ Verify deployment: $BACKEND_URL/api/deployment/status"
echo ""
echo "🚨 If you see authentication errors:"
echo "   - Log out and log back in (tokens need refresh after deployment)"
echo "   - Check Supabase redirect URLs include $FRONTEND_URL"
echo ""
echo "Having issues? Check:"
echo "  - docs/DEPLOYMENT_TROUBLESHOOTING.md"
echo "  - $BACKEND_URL/docs (API documentation)"