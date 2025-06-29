#!/bin/bash

# Railway Environment Setup Script
# This sets all environment variables for the Railway backend

echo "Setting Railway environment variables..."

# Core settings
railway variables --set "ENVIRONMENT=production"
railway variables --set "DEMO_MODE=auto"
railway variables --set "FRONTEND_URL=https://frontend-q7wnjs9dt-rudi-jetsons-projects.vercel.app"
railway variables --set 'CORS_ORIGINS=["https://frontend-q7wnjs9dt-rudi-jetsons-projects.vercel.app","https://prompt-stack.com"]'

# Read from backend .env file
if [ -f backend/.env ]; then
    echo "Reading API keys from backend/.env..."
    
    # Function to get env value
    get_env_value() {
        grep "^$1=" backend/.env | cut -d '=' -f2- | tr -d '"' | tr -d "'"
    }
    
    # Set API keys if they exist
    for key in DEEPSEEK_API_KEY OPENAI_API_KEY ANTHROPIC_API_KEY GEMINI_API_KEY SUPABASE_URL SUPABASE_ANON_KEY SUPABASE_SERVICE_KEY DEMO_JWT_SECRET STRIPE_SECRET_KEY LEMONSQUEEZY_API_KEY RESEND_API_KEY; do
        value=$(get_env_value $key)
        if [ ! -z "$value" ] && [ "$value" != "" ]; then
            echo "Setting $key..."
            railway variables --set "$key=$value"
        fi
    done
else
    echo "Warning: backend/.env not found. Please set environment variables manually in Railway dashboard."
fi

echo "Environment variables set! Deploying changes..."
railway up --detach

echo "✅ Railway backend configured and redeploying!"
echo "Backend URL: https://prompt-stack-backend-production.up.railway.app"
echo "Frontend URL: https://frontend-q7wnjs9dt-rudi-jetsons-projects.vercel.app"