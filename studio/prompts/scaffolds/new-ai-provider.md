# Scaffold: Add New AI Provider

## Prompt Template
```
You are my lead developer. Add support for [PROVIDER_NAME] to the Prompt-Stack application.

Requirements:
1. Add provider configuration to backend/app/core/config.py
2. Implement client in backend/app/services/llm/llm_service.py following existing patterns
3. Add provider to frontend dropdown in app/(authenticated)/test-ai/page.tsx
4. Add environment variable to .env.example files
5. Update health check to include new provider

Follow these patterns:
- Backend: Use same async pattern as OpenAI/Anthropic implementations
- Frontend: Add to providers array with proper display_name
- Config: Use same naming convention as existing providers
- Error handling: Match existing try/catch patterns

Return only the code diffs needed.
```

## Variables to Replace
- `[PROVIDER_NAME]`: The name of the new provider (e.g., "cohere", "mistral")

## Example Usage
"Add support for Cohere to the Prompt-Stack application..."

## Files That Will Be Modified
- `backend/app/core/config.py`
- `backend/app/services/llm/llm_service.py`
- `frontend/app/(authenticated)/test-ai/page.tsx`
- `backend/.env.example`
- `frontend/.env.example`

## Testing
After implementation, test via:
1. Add API key to backend/.env
2. Restart Docker containers
3. Visit /test-ai page
4. Verify provider appears in dropdown
5. Test generation with new provider