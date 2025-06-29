#!/bin/bash

# Main deployment script
echo "🚀 Prompt-Stack Deployment"
echo "========================="

# Check if git repo is clean
if [[ -n $(git status -s) ]]; then
    echo "⚠️  You have uncommitted changes. Commit them before deploying."
    exit 1
fi

# Deploy frontend
echo ""
echo "Step 1: Deploy Frontend"
echo "-----------------------"
./scripts/deploy-frontend.sh

# Get frontend URL
echo ""
read -p "Enter your Vercel frontend URL (e.g., https://myapp.vercel.app): " FRONTEND_URL

# Deploy backend
echo ""
echo "Step 2: Deploy Backend"
echo "----------------------"
./scripts/deploy-backend.sh

# Final instructions
echo ""
echo "🎉 Deployment Complete!"
echo ""
echo "Next steps:"
echo "1. Update your frontend .env.local with the backend URL"
echo "2. Redeploy frontend if needed: cd frontend && vercel --prod"
echo "3. Test your app at: $FRONTEND_URL"
echo ""
echo "After successful deployment:"
echo "  ./scripts/cleanup-deployment.sh - Remove unnecessary deployment files"
echo ""
echo "Having issues? Check:"
echo "  docs/DEPLOYMENT_TROUBLESHOOTING.md - Common problems and solutions"
echo "  docs/DEPLOYMENT_CLEANUP.md - What files to keep/remove"