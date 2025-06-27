# Troubleshooting Guide

## Common Issues

### 🔴 "I added API keys but can't test my LLMs!"

**Common Cause**: Authentication token needs refresh after configuration changes.

**Solutions**:

1. **🎯 MOST COMMON FIX - Refresh Authentication**:
   - **Log out of the application**
   - **Log back in** 
   - This refreshes your authentication tokens with the new configuration
   - **Required after adding API keys or changing Supabase settings**

2. **Verify Docker restart** (required for env changes):
   ```bash
   docker-compose down && docker-compose up -d
   ```

3. **Add Supabase credentials first** (required for auth):
   ```bash
   # In backend/.env
   SUPABASE_URL=https://xxx.supabase.co
   SUPABASE_ANON_KEY=xxx
   SUPABASE_SERVICE_KEY=xxx
   ```

4. **Use demo endpoint for testing** (no auth required):
   ```bash
   curl -X POST http://localhost:8000/api/llm/generate-demo \
     -H "Content-Type: application/json" \
     -d '{"prompt": "Hello", "model": "gpt-4"}'
   ```

### 🔴 "Environment variables not loading"

**Cause**: Docker loads environment variables at container creation time.

**Solution**: Always do a FULL restart:
```bash
# ❌ Wrong
docker-compose restart

# ✅ Correct
docker-compose down && docker-compose up -d
```

### 🔴 "Getting validation errors about API keys"

**Cause**: Wrong environment variable names.

**Solution**: Use exact names with `_API_KEY` suffix:
```bash
# ❌ Wrong
OpenAI=sk-xxx
OPENAI=sk-xxx

# ✅ Correct
OPENAI_API_KEY=sk-xxx
```

### 🔴 "Can't access Supabase features"

**Cause**: Missing or incorrect Supabase configuration.

**Solution**:
1. Create project at https://supabase.com
2. Get credentials from Settings > API
3. Run database setup:
   ```bash
   make db-setup
   ```

## Quick Diagnostic Commands

```bash
# Check system status
./scripts/diagnose.sh

# Test API endpoints
./scripts/test-api-simple.sh

# View logs
docker-compose logs -f backend

# Check which providers are configured
curl http://localhost:8000/api/llm/providers | jq
```

## Setup Order Matters!

The correct order is:
1. **Supabase** → Enables authentication
2. **LLM Providers** → Can now test with auth
3. **Payments/Email** → Optional extras

Starting with LLMs first = Can't test them without auth!