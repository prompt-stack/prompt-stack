# 🧹 Deployment Cleanup Guide

> After struggling with deployment? Here's what files you actually need and what can be deleted.

## ✅ Files You MUST Keep

### For Railway (Nixpacks)
```
📁 Root Directory
├── Procfile                    # Tells Railway how to start your app
├── requirements.txt            # Python dependencies (symlink to backend/requirements.txt)
├── runtime.txt                 # Python version (python-3.11)
└── backend/                    # Your actual application code
    ├── app/                    # FastAPI application
    └── requirements.txt        # Source of truth for dependencies
```

### For Vercel (Frontend)
```
📁 frontend/
├── vercel.json                 # Vercel configuration
├── .env.production.local       # Production environment variables
└── package.json                # Node dependencies
```

---

## 🗑️ Files You Can DELETE After Successful Deployment

### Failed Docker Attempts
```bash
# Delete these if you're using Nixpacks (recommended)
rm -f railway.json              # Forces Docker builds - conflicts with Nixpacks
rm -f Dockerfile.railway         # Custom Docker config - not needed
rm -f backend/Dockerfile.railway # Backend Docker config - not needed
rm -f backend/Dockerfile.simple  # Simplified Docker - not needed
```

### Temporary Deployment Scripts
```bash
# These were created during debugging - safe to delete
rm -f deploy-cli.sh
rm -f deploy-railway.sh
rm -f DEPLOYMENT_INSTRUCTIONS.md
rm -f RAILWAY_DEPLOYMENT.md
```

### Build Artifacts
```bash
# Clean up Python cache
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null
find . -type f -name "*.pyc" -delete

# Clean up Node modules (if you need to)
cd frontend && rm -rf node_modules .next
```

---

## 🤔 When to Keep vs Delete

### Keep `railway.json` IF:
- You need custom Docker configuration
- You have complex build requirements
- You're NOT using standard Python/Node.js

### Delete `railway.json` IF:
- You want Railway to auto-detect your app (recommended)
- You're using standard Python with requirements.txt
- You keep getting Docker build errors

---

## 🚀 Clean Deployment Checklist

After cleanup, you should have:

```
prompt-stack/
├── Procfile                    ✅ (for Railway Nixpacks)
├── requirements.txt            ✅ (symlink to backend version)
├── runtime.txt                 ✅ (python-3.11)
├── backend/
│   ├── .env                    ✅ (your API keys)
│   ├── .env.example            ✅ (template for others)
│   ├── app/                    ✅ (your code)
│   └── requirements.txt        ✅ (Python deps)
├── frontend/
│   ├── .env.local              ✅ (local dev config)
│   ├── .env.production.local   ✅ (production config)
│   └── vercel.json             ✅ (Vercel settings)
└── docs/                       ✅ (keep all docs)
```

---

## 🎯 Quick Cleanup Script

Save this as `cleanup-deployment.sh`:

```bash
#!/bin/bash
echo "🧹 Cleaning up deployment files..."

# Backup first (just in case)
mkdir -p .backup-deployment
cp railway.json .backup-deployment/ 2>/dev/null
cp Dockerfile.* .backup-deployment/ 2>/dev/null
cp backend/Dockerfile.* .backup-deployment/ 2>/dev/null

# Remove Docker configs (if using Nixpacks)
read -p "Remove Docker files and use Nixpacks? [y/N] " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    rm -f railway.json
    rm -f Dockerfile.railway
    rm -f backend/Dockerfile.railway
    rm -f backend/Dockerfile.simple
    echo "✅ Docker files removed (backed up to .backup-deployment/)"
fi

# Remove temporary scripts
read -p "Remove temporary deployment scripts? [y/N] " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    rm -f deploy-*.sh
    rm -f DEPLOYMENT_INSTRUCTIONS.md
    rm -f RAILWAY_DEPLOYMENT.md
    echo "✅ Temporary scripts removed"
fi

# Clean Python cache
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null
find . -type f -name "*.pyc" -delete
echo "✅ Python cache cleaned"

echo ""
echo "🎉 Cleanup complete!"
echo "Run './scripts/diagnose.sh' to verify your setup"
```

---

## ⚠️ Common Mistakes to Avoid

1. **Don't delete `backend/requirements.txt`** - It's the source of truth
2. **Don't delete `.env` files** - They contain your API keys
3. **Don't commit `.env` or `.env.local`** - They should be in .gitignore
4. **Don't mix Nixpacks and Docker** - Choose one approach

---

## 📚 After Cleanup

1. Test locally: `make dev`
2. Run diagnostics: `./scripts/diagnose.sh`
3. Commit cleaned structure: `git add . && git commit -m "Clean deployment structure"`
4. Redeploy if needed

Remember: Simpler is better! Nixpacks requires just 3 files in root.