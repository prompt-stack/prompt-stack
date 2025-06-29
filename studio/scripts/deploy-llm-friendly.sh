#!/bin/bash

# 🤖 LLM-Friendly Deployment Script
# Designed to be run by AI assistants with minimal user interaction

set -e

echo "🚀 Starting automated deployment..."

# Install CLIs if needed
npm install -g vercel @railway/cli --silent

# Deploy Backend
echo "Deploying backend to Railway..."
railway init --name prompt-stack-backend 2>/dev/null || true
railway up --detach
BACKEND_URL=$(railway domain 2>&1 | grep -o 'https://[^ ]*' | head -1)
[ -z "$BACKEND_URL" ] && railway domain && BACKEND_URL=$(railway domain 2>&1 | grep -o 'https://[^ ]*' | head -1)

# Configure Frontend
cd frontend
cp .env.local .env.production.local 2>/dev/null || echo "NEXT_PUBLIC_API_URL=$BACKEND_URL" > .env.production.local
sed -i.bak "s|NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=$BACKEND_URL|" .env.production.local 2>/dev/null || true

# Deploy Frontend  
VERCEL_OUTPUT=$(vercel --prod --yes 2>&1)
FRONTEND_URL=$(echo "$VERCEL_OUTPUT" | grep -o 'https://[^[:space:]]*vercel.app' | tail -1)

# Output Results
cd ..
cat > DEPLOYMENT_COMPLETE.md << EOF
# 🎉 Deployment Successful!

## URLs
- **Frontend**: $FRONTEND_URL
- **Backend**: $BACKEND_URL

## ⚠️ Final Step Required
Add these environment variables to Railway:
1. Go to Railway dashboard
2. Click Variables tab
3. Add:
   - FRONTEND_URL=$FRONTEND_URL
   - CORS_ORIGINS=["$FRONTEND_URL"]
   - All API keys from backend/.env

## Test Commands
\`\`\`bash
curl $BACKEND_URL/health
curl $FRONTEND_URL
\`\`\`
EOF

echo "✅ Deployment complete! See DEPLOYMENT_COMPLETE.md for details."