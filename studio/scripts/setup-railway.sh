#!/bin/bash

# Railway Deployment Setup Script
# Prepares your project for Railway deployment using Nixpacks

set -e

echo "🚂 Railway Deployment Setup"
echo "=========================="
echo ""
echo "This script prepares your project for Railway deployment."
echo "Railway will use Nixpacks (automatic build) instead of Docker."
echo ""

# Check if we're in the right directory
if [ ! -f "backend/requirements.txt" ]; then
    echo "❌ Error: Run this from your project root (where backend/ folder is)"
    exit 1
fi

# Create Procfile if it doesn't exist
if [ ! -f "Procfile" ]; then
    echo "📝 Creating Procfile..."
    echo 'web: cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT' > Procfile
    echo "✅ Procfile created"
else
    echo "✅ Procfile already exists"
fi

# Create runtime.txt if it doesn't exist
if [ ! -f "runtime.txt" ]; then
    echo "📝 Creating runtime.txt..."
    echo "python-3.11" > runtime.txt
    echo "✅ runtime.txt created"
else
    echo "✅ runtime.txt already exists"
fi

# Create requirements.txt symlink or copy
if [ ! -f "requirements.txt" ]; then
    echo "📝 Creating requirements.txt in root..."
    # Try symlink first (preferred)
    if ln -s backend/requirements.txt requirements.txt 2>/dev/null; then
        echo "✅ Created symlink to backend/requirements.txt"
    else
        # Fall back to copying if symlink fails (Windows)
        cp backend/requirements.txt requirements.txt
        echo "✅ Copied requirements.txt from backend/"
        echo "⚠️  Note: You'll need to keep this in sync with backend/requirements.txt"
    fi
else
    echo "✅ requirements.txt already exists in root"
fi

# Check for conflicting Docker configuration
if [ -f "railway.json" ]; then
    echo ""
    echo "⚠️  Found railway.json - this will force Docker builds"
    read -p "Remove railway.json to use Nixpacks? (recommended) [y/N]: " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        mv railway.json railway.json.backup
        echo "✅ Moved railway.json to railway.json.backup"
    fi
fi

echo ""
echo "✅ Railway setup complete!"
echo ""
echo "Next steps:"
echo "1. Commit these files:"
echo "   git add Procfile runtime.txt requirements.txt"
echo "   git commit -m 'Add Railway Nixpacks configuration'"
echo "   git push"
echo ""
echo "2. Deploy on Railway:"
echo "   - Go to https://railway.app"
echo "   - New Project → Deploy from GitHub"
echo "   - Railway will auto-detect Python and use Nixpacks"
echo ""
echo "3. Add environment variables in Railway dashboard"
echo ""
echo "📚 See docs/DEPLOYMENT_QUICKSTART.md for detailed instructions"