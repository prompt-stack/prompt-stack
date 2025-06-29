#!/bin/bash
# Part 1: Create and deploy (fully automated)

set -euo pipefail

echo "🚀 Railway Deployment - Part 1"
echo "=============================="
echo ""

# Check prerequisites
command -v railway >/dev/null || { echo "❌ Install Railway CLI first"; exit 1; }
railway whoami >/dev/null || { echo "❌ Run 'railway login' first"; exit 1; }

# Clean up any existing config
[ -d ".railway" ] && rm -rf .railway

# Create project and deploy
echo "📦 Creating Railway project..."
PROJECT_NAME="prompt-stack-backend-${RANDOM}"
railway init -n "$PROJECT_NAME"

echo "⬆️  Deploying to Railway..."
railway up

echo "🌐 Generating domain..."
DOMAIN=$(railway domain)

echo ""
echo "✅ Part 1 Complete!"
echo "=================="
echo "Project: $PROJECT_NAME"
echo "Domain: $DOMAIN"
echo ""
echo "⚠️  MANUAL STEP REQUIRED:"
echo "Run this command to link the service:"
echo ""
echo "    railway link"
echo ""
echo "Then run ./deploy-part2.sh to continue"