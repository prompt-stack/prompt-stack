# Authentication Setup Guide

## 🚨 Critical Discovery: Token Refresh Pattern

**Based on real-world user testing**, the most important setup step that causes confusion is authentication token refresh after configuration changes.

## The Problem

When users add API keys and restart Docker, their existing authentication tokens become invalid, leading to "API keys not working" errors even when everything is configured correctly.

## The Solution

### Required Steps After Any Configuration Change:

1. **Add API keys** to `.env` files
2. **Full Docker restart**: `docker-compose down && docker-compose up -d`
3. **🎯 CRITICAL**: Log out of the application
4. **Log back in** to refresh authentication tokens
5. **Test features** - they should now work properly

## When This Pattern Applies

### Always Required After:
- Adding any LLM provider API keys (OpenAI, Anthropic, etc.)
- Changing Supabase configuration
- Modifying authentication settings
- Any environment variable changes affecting auth

### Example User Journey:

```bash
# User adds OpenAI API key to backend/.env
OPENAI_API_KEY=sk-xxx

# User restarts Docker
docker-compose down && docker-compose up -d

# User tries to test LLM → Gets authentication errors
# User logs out of frontend app
# User logs back in
# User tries to test LLM → ✅ Works perfectly!
```

## Why This Happens

### Technical Explanation:
1. **JWT tokens are cached** in browser localStorage
2. **New configuration changes** the backend's auth validation
3. **Existing tokens become invalid** with new settings
4. **Frontend has stale tokens** that don't match backend
5. **Fresh login** gets new tokens that work with new config

### Browser Storage Impact:
- `localStorage.getItem('supabase.auth.token')` contains old token
- Backend validates against new configuration
- Mismatch causes authentication failures
- Fresh login replaces stale token with valid one

## Troubleshooting Authentication Issues

### Symptoms of Stale Token Problem:
- "API keys configured but LLM requests fail"
- "Authentication required" errors after adding keys
- 401/403 errors on previously working endpoints
- Setup script shows API keys configured, but testing fails

### Quick Diagnosis:
```bash
# Check if API keys are loaded
./setup.sh status

# Check if authentication is the issue
curl -X POST http://localhost:8000/api/llm/generate-demo \
  -H "Content-Type: application/json" \
  -d '{"prompt": "test", "model": "gpt-4"}'

# If demo works but authenticated doesn't → Token refresh needed
```

### Definitive Fix:
1. Verify Docker restart: `docker-compose down && docker-compose up -d`
2. **Log out and log back in**
3. Test authenticated endpoints

## Best Practices

### For Users:
- Always log out/in after major configuration changes
- Use demo endpoints for initial testing (no auth required)
- Check `./setup.sh status` before and after changes
- Keep this pattern in mind when troubleshooting

### For Developers:
- Document this pattern prominently in setup guides
- Consider adding automated token refresh detection
- Provide clear error messages about token refresh
- Test setup flows with fresh users regularly

## Related Documentation

- [Main README](../README.md) - Updated with token refresh warnings
- [Troubleshooting Guide](./TROUBLESHOOTING.md) - Token refresh as #1 solution
- [Quick Start](./QUICKSTART.md) - Includes token refresh in next steps
- [AI Guide](../AI_GUIDE.md) - Real-world setup experience

---

**Key Takeaway**: The authentication token refresh pattern is the single most important setup detail that determines user success vs frustration with Prompt-Stack.