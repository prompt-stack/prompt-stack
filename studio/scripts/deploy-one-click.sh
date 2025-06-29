#!/bin/bash

# 🚀 One-Click Deployment Script for Prompt-Stack
# This script automates the entire deployment process

set -e  # Exit on error

echo "🚀 Prompt-Stack One-Click Deployment"
echo "===================================="
echo ""

# Check if CLIs are installed
check_cli() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ $1 CLI not found. Installing..."
        npm install -g $2
    else
        echo "✅ $1 CLI found"
    fi
}

# Step 1: Check/Install CLIs
echo "📦 Step 1: Checking deployment tools..."
check_cli "vercel" "vercel"
check_cli "railway" "@railway/cli"

# Step 2: Check authentication
echo ""
echo "🔐 Step 2: Checking authentication..."

# Check Vercel auth
if vercel whoami &> /dev/null; then
    echo "✅ Vercel: Logged in as $(vercel whoami)"
else
    echo "❌ Vercel: Not logged in"
    echo "   Running: vercel login"
    vercel login
fi

# Check Railway auth
if railway whoami &> /dev/null; then
    echo "✅ Railway: Logged in"
else
    echo "❌ Railway: Not logged in"
    echo "   Running: railway login"
    railway login
fi

# Step 3: Deploy Backend
echo ""
echo "🚂 Step 3: Deploying backend to Railway..."

# Check if already linked to a Railway project
if railway status &> /dev/null; then
    echo "✅ Using existing Railway project"
else
    echo "📝 Creating new Railway project..."
    read -p "Enter project name (default: prompt-stack-backend): " project_name
    project_name=${project_name:-prompt-stack-backend}
    railway init --name "$project_name"
fi

# Deploy to Railway
echo "🚀 Deploying backend..."
railway up --detach

# Get Railway domain
echo "🌐 Setting up domain..."
RAILWAY_URL=$(railway domain 2>&1 | grep -o 'https://[^ ]*' | head -1)
if [ -z "$RAILWAY_URL" ]; then
    railway domain
    RAILWAY_URL=$(railway domain 2>&1 | grep -o 'https://[^ ]*' | head -1)
fi

echo "✅ Backend URL: $RAILWAY_URL"

# Step 4: Update Frontend Configuration
echo ""
echo "🎨 Step 4: Configuring frontend..."

# Update production env
cd frontend
if [ -f .env.local ]; then
    cp .env.local .env.production.local
    
    # Update API URL
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=$RAILWAY_URL|" .env.production.local
    else
        # Linux
        sed -i "s|NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=$RAILWAY_URL|" .env.production.local
    fi
    
    echo "✅ Updated frontend configuration"
else
    echo "❌ .env.local not found. Creating .env.production.local..."
    echo "NEXT_PUBLIC_API_URL=$RAILWAY_URL" > .env.production.local
    
    # Copy Supabase config if exists
    if [ -f ../backend/.env ]; then
        grep "SUPABASE_URL" ../backend/.env | sed 's/SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL/' >> .env.production.local
        grep "SUPABASE_ANON_KEY" ../backend/.env | sed 's/SUPABASE_ANON_KEY/NEXT_PUBLIC_SUPABASE_ANON_KEY/' >> .env.production.local
    fi
fi

# Step 5: Deploy Frontend
echo ""
echo "▲ Step 5: Deploying frontend to Vercel..."
VERCEL_OUTPUT=$(vercel --prod --yes 2>&1)
VERCEL_URL=$(echo "$VERCEL_OUTPUT" | grep -o 'https://[^[:space:]]*vercel.app' | tail -1)
echo "✅ Frontend URL: $VERCEL_URL"

# Step 6: Update Railway Environment Variables
echo ""
echo "🔧 Step 6: Configuring Railway environment..."
cd ..

# Create env update script
cat > .env.railway << EOF
ENVIRONMENT=production
DEMO_MODE=auto
FRONTEND_URL=$VERCEL_URL
CORS_ORIGINS=["$VERCEL_URL"]
EOF

# Add API keys from backend/.env
if [ -f backend/.env ]; then
    grep -E "^(DEEPSEEK_API_KEY|OPENAI_API_KEY|ANTHROPIC_API_KEY|GEMINI_API_KEY|SUPABASE_URL|SUPABASE_ANON_KEY|SUPABASE_SERVICE_KEY|DEMO_JWT_SECRET|STRIPE_SECRET_KEY|LEMONSQUEEZY_API_KEY|RESEND_API_KEY)=" backend/.env >> .env.railway
fi

echo "📋 Environment variables prepared in .env.railway"
echo ""
echo "⚠️  IMPORTANT: You need to manually add these to Railway:"
echo "   1. Go to: https://railway.app/dashboard"
echo "   2. Select your project"
echo "   3. Go to Variables tab"
echo "   4. Add each variable from .env.railway"
echo ""
echo "   Or use Railway CLI (if it supports your version):"
echo "   while IFS='=' read -r key value; do"
echo "     railway variables --set \"\$key=\$value\""
echo "   done < .env.railway"

# Step 7: Summary
echo ""
echo "🎉 Deployment Complete!"
echo "======================="
echo "🚂 Backend:  $RAILWAY_URL"
echo "▲ Frontend: $VERCEL_URL"
echo ""
echo "📝 Next Steps:"
echo "1. Add environment variables to Railway (see above)"
echo "2. Wait 2-3 minutes for Railway deployment"
echo "3. Visit your frontend: $VERCEL_URL"
echo ""
echo "🔍 To check deployment status:"
echo "   Backend:  curl $RAILWAY_URL/health"
echo "   Frontend: curl $VERCEL_URL"

# Cleanup
rm -f .env.railway

# Save deployment info
cat > deployment-info.txt << EOF
Deployment Info - $(date)
========================
Backend URL:  $RAILWAY_URL
Frontend URL: $VERCEL_URL

To redeploy:
- Backend:  railway up
- Frontend: vercel --prod
EOF

echo ""
echo "💾 Deployment info saved to: deployment-info.txt"