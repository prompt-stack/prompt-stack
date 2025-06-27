# AI Guide: Prompt-Stack

## Repository Overview
This is a full-stack AI application template with authentication, multiple LLM providers, and vector search capabilities.

## Quick Prompts

### Add New AI Provider
```
You are my lead developer. Add support for [PROVIDER_NAME] in the backend LLM service.
- Add provider config to backend/app/core/config.py
- Implement client in backend/app/services/llm/llm_service.py
- Follow the existing OpenAI/Anthropic pattern
- Add provider to frontend dropdown in test-ai page
```

### Add New Protected Route
```
Create a new authenticated page at /[PAGE_NAME].
- Add file: frontend/app/(authenticated)/[PAGE_NAME]/page.tsx
- Use existing auth patterns from dashboard/page.tsx
- Include proper TypeScript interfaces
- Follow the component structure pattern
```

### Database Schema Changes
```
Add new table [TABLE_NAME] with Supabase migration.
- Create migration in supabase/migrations/
- Include RLS policies for user access
- Add TypeScript types
- Update profiles table if needed for relationships
```

## Architecture Constraints

1. **Authentication**: Always use Supabase auth with JWT validation
2. **Database**: PostgreSQL with Row Level Security (RLS) enabled
3. **API Responses**: Use standardized format via `create_response()`
4. **File Structure**: Domain-based grouping (`auth/`, `llm/`, `payments/`)
5. **Environment**: Separate demo and production modes

## Code Patterns

### Backend (FastAPI)
- Use dependency injection for auth: `current_user: AuthUser = Depends(get_current_user)`
- Async/await for all database operations
- Pydantic models for request/response validation
- Service layer separation (no direct DB calls in endpoints)

### Frontend (Next.js)
- Server components by default, add 'use client' only when needed
- Auth-protected routes in `(authenticated)/` directory
- Centralized auth via `useAuth()` hook
- TypeScript interfaces in same file or `/types` if shared

### Database
- All tables require RLS policies
- Use service key for backend operations, anon key for client
- Audit triggers for sensitive operations (role changes)
- UUID primary keys, proper foreign key relationships

## File Naming Conventions

- **React Components**: PascalCase (`AuthProvider.tsx`)
- **API Endpoints**: kebab-case (`llm-service.py`)
- **Database**: snake_case (`user_profiles`)
- **Directories**: kebab-case (`auth-provider/`)

## Testing Strategy

- **Backend**: pytest with async test client
- **Frontend**: Jest + React Testing Library
- **E2E**: Manual testing via `/test-api` and `/test-ai` pages
- **Integration**: Docker compose for full stack testing

## Common Patterns to Follow

### Error Handling
```typescript
try {
  const result = await apiCall()
  return { success: true, data: result }
} catch (error) {
  return { success: false, error: error.message }
}
```

### API Client Calls
```typescript
const response = await fetch(getApiEndpoint('/api/endpoint'), {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify(data)
})
```

### Database Queries (Backend)
```python
async def get_user_profile(user_id: str):
    supabase = get_supabase_client()
    response = supabase.table("profiles").select("*").eq("id", user_id).single().execute()
    return response.data
```

## Extension Points

- **New LLM Providers**: Extend `LLMService` class
- **Payment Providers**: Add to `PaymentService` 
- **Auth Providers**: Extend `AuthProvider` component
- **Database Tables**: Add migrations + RLS policies
- **UI Components**: Follow existing patterns in `/components/ui/`

## Security Checklist

- [ ] New routes are properly authenticated
- [ ] Database queries use RLS
- [ ] API keys stored in environment variables
- [ ] No secrets in frontend code
- [ ] Input validation on all endpoints
- [ ] CORS properly configured

## Return Format

Always return code changes as diff-style patches with file paths and line numbers.