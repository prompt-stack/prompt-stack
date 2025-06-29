#!/bin/bash

# Deployment Cleanup Script
# Removes unnecessary files after successful deployment

echo "🧹 Deployment Cleanup Tool"
echo "========================="
echo ""
echo "This will help remove unnecessary deployment files."
echo "All files will be backed up first."
echo ""

# Create backup directory
BACKUP_DIR=".backup-deployment-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
echo "📁 Backup directory: $BACKUP_DIR"
echo ""

# Function to safely remove files
safe_remove() {
    local file=$1
    if [ -f "$file" ]; then
        cp "$file" "$BACKUP_DIR/" 2>/dev/null
        rm -f "$file"
        echo "  ✅ Removed: $file"
    fi
}

# Check current deployment method
echo "🔍 Detecting deployment configuration..."
if [ -f "Procfile" ] && [ -f "requirements.txt" ] && [ -f "runtime.txt" ]; then
    echo "✅ Nixpacks configuration detected (recommended)"
    USING_NIXPACKS=true
else
    echo "⚠️  Nixpacks files not found"
    USING_NIXPACKS=false
fi

if [ -f "railway.json" ]; then
    echo "📦 Docker configuration detected (railway.json)"
    USING_DOCKER=true
else
    USING_DOCKER=false
fi

echo ""

# Handle Docker files
if [ "$USING_NIXPACKS" = true ] && [ "$USING_DOCKER" = true ]; then
    echo "⚠️  Both Nixpacks and Docker configurations found!"
    echo "   Railway will use Docker (railway.json) and ignore Nixpacks"
    read -p "Remove Docker files to use Nixpacks instead? [y/N] " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        safe_remove "railway.json"
        safe_remove "Dockerfile.railway"
        safe_remove "backend/Dockerfile.railway"
        safe_remove "backend/Dockerfile.simple"
        echo "✅ Docker files removed - Railway will now use Nixpacks"
    fi
elif [ "$USING_DOCKER" = true ]; then
    echo "📦 Using Docker configuration"
    read -p "Remove unused Dockerfile variants? [y/N] " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Keep the one referenced in railway.json
        if grep -q "Dockerfile.railway" railway.json 2>/dev/null; then
            safe_remove "backend/Dockerfile.simple"
        else
            safe_remove "Dockerfile.railway"
            safe_remove "backend/Dockerfile.railway"
        fi
    fi
fi

echo ""

# Remove temporary deployment files
echo "🗑️  Temporary deployment files found:"
TEMP_FILES=(
    "deploy-cli.sh"
    "deploy-railway.sh"
    "deploy-vercel.sh"
    "DEPLOYMENT_INSTRUCTIONS.md"
    "RAILWAY_DEPLOYMENT.md"
    "deployment-files.md"
)

FOUND_TEMP=false
for file in "${TEMP_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  - $file"
        FOUND_TEMP=true
    fi
done

if [ "$FOUND_TEMP" = true ]; then
    read -p "Remove these temporary files? [y/N] " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        for file in "${TEMP_FILES[@]}"; do
            safe_remove "$file"
        done
    fi
else
    echo "  None found ✅"
fi

echo ""

# Clean build artifacts
echo "🧹 Cleaning build artifacts..."
read -p "Clean Python cache and build files? [y/N] " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null
    find . -type f -name "*.pyc" -delete
    find . -type f -name ".DS_Store" -delete 2>/dev/null
    echo "✅ Build artifacts cleaned"
fi

echo ""

# Summary
echo "📋 Current deployment configuration:"
echo ""
if [ "$USING_NIXPACKS" = true ] && [ ! -f "railway.json" ]; then
    echo "✅ Railway: Nixpacks (automatic builds)"
    echo "   - Procfile ✓"
    echo "   - requirements.txt ✓"  
    echo "   - runtime.txt ✓"
elif [ -f "railway.json" ]; then
    echo "📦 Railway: Docker (custom builds)"
    echo "   - railway.json ✓"
    echo "   - $(grep dockerfilePath railway.json | cut -d'"' -f4) ✓"
else
    echo "⚠️  No Railway configuration found"
    echo "   Run: ./scripts/setup-railway.sh"
fi

if [ -f "frontend/vercel.json" ]; then
    echo ""
    echo "✅ Vercel: Configured"
    echo "   - frontend/vercel.json ✓"
fi

echo ""
echo "🎉 Cleanup complete!"
echo ""
echo "Next steps:"
echo "1. Test locally: make dev"
echo "2. Commit changes: git add . && git commit -m 'Clean deployment structure'"
echo "3. Push to deploy: git push"

if [ -d "$BACKUP_DIR" ] && [ -z "$(ls -A $BACKUP_DIR)" ]; then
    rmdir "$BACKUP_DIR"
else
    echo ""
    echo "📁 Backed up files are in: $BACKUP_DIR"
fi