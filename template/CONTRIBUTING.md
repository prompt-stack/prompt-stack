# Contributing to Prompt-Stack

Thank you for your interest in contributing to Prompt-Stack! This guide will help you get started.

## 🚀 Quick Start for Contributors

```bash
# 1. Fork the repository on GitHub
# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/prompt-stack.git
cd prompt-stack

# 3. Set up development environment (instant!)
./setup.sh

# 4. Visit the running app
open http://localhost:3000

# 5. Make your changes
# 6. Test thoroughly
./scripts/test-api-simple.sh
./scripts/diagnose.sh

# 7. Commit and push
git add .
git commit -m "feat: your descriptive message"
git push origin your-branch-name

# 8. Create Pull Request on GitHub
```

## 🎯 Development Guidelines

### Code Standards

**Backend (Python/FastAPI):**
- Follow existing patterns in `AI_GUIDE.md`
- Use async/await for all database operations
- Pydantic models for request/response validation
- Service layer separation (no direct DB calls in endpoints)
- Type hints required

**Frontend (TypeScript/Next.js):**
- Server components by default, `'use client'` only when needed
- Auth-protected routes in `(authenticated)/` directory
- Use existing UI components from `components/ui/`
- TypeScript interfaces required

**Database:**
- All tables require RLS (Row Level Security) policies
- UUID primary keys, proper foreign key relationships
- Include migrations for any schema changes

### Testing Requirements

- Test in both **demo mode** and **production mode**
- Verify authentication flows work properly
- Test API endpoints with provided scripts
- Ensure Docker setup works cleanly

### Documentation

- Update relevant docs in `/docs` if adding features
- Follow LLM-optimized documentation patterns
- Include code examples and clear explanations
- Update `CHANGELOG.md` with your changes

## 🛠️ Development Workflow

### Setting Up Your Environment

1. **Demo Mode (Default):** Everything works without configuration
2. **Production Mode:** Add real API keys for full testing
3. **Critical:** After environment changes, restart Docker AND log out/in

### Common Development Tasks

**Add New API Endpoint:**
```python
# 1. Create endpoint in backend/app/api/endpoints/
# 2. Add to router in backend/app/api/router.py
# 3. Test at http://localhost:8000/docs
```

**Add New Protected Page:**
```typescript
// 1. Create in frontend/app/(authenticated)/your-page/
// 2. Page automatically requires authentication
// 3. Use existing auth patterns
```

**Add New AI Provider:**
```python
# 1. Add config to backend/app/core/config.py
# 2. Implement in backend/app/services/llm/llm_service.py
# 3. Follow existing OpenAI/Anthropic patterns
```

## 🐛 Bug Reports

When reporting bugs, please include:

- **Environment:** Demo or production mode
- **Steps to reproduce:** Clear, numbered steps
- **Expected behavior:** What should happen
- **Actual behavior:** What actually happens
- **Logs:** Output from `./scripts/diagnose.sh`
- **Configuration:** Sanitized environment setup

## ✨ Feature Requests

For new features:

- **Use case:** Why is this needed?
- **Scope:** How big is this change?
- **Alternatives:** What other solutions exist?
- **Implementation:** Any ideas on approach?

## 📋 Pull Request Process

### Before Submitting

- [ ] Code follows existing patterns
- [ ] Tests pass in both demo and production modes
- [ ] Documentation updated if needed
- [ ] `CHANGELOG.md` updated
- [ ] Docker setup works cleanly
- [ ] No breaking changes (or clearly documented)

### PR Title Format

Use conventional commits:
- `feat: add new AI provider support`
- `fix: resolve authentication token refresh`
- `docs: improve setup instructions`
- `refactor: optimize database queries`

### PR Description Template

```markdown
## Changes
Brief description of what this PR does.

## Testing
- [ ] Tested in demo mode
- [ ] Tested in production mode
- [ ] API tests pass
- [ ] Docker setup works

## Documentation
- [ ] Updated relevant docs
- [ ] Added to CHANGELOG.md
- [ ] Code is self-documenting

## Breaking Changes
List any breaking changes and migration steps.
```

## 🎨 Code Style

### Python (Backend)
```python
# Use async/await
async def get_user_profile(user_id: str) -> UserProfile:
    """Get user profile with type hints."""
    pass

# Pydantic models
class UserRequest(BaseModel):
    name: str = Field(..., min_length=1)
    email: str = Field(..., regex=r'^[^@]+@[^@]+\.[^@]+$')

# Error handling
try:
    result = await operation()
    return success_response(result)
except Exception as e:
    return error_response(str(e))
```

### TypeScript (Frontend)
```typescript
// Interfaces
interface UserProfile {
  id: string
  name: string
  email: string
}

// Components
export function UserCard({ user }: { user: UserProfile }) {
  return <div>{user.name}</div>
}

// API calls
const response = await fetch(getApiEndpoint('/api/users'), {
  headers: { Authorization: `Bearer ${token}` }
})
```

## 🔒 Security Guidelines

- **Never commit secrets** or API keys
- **Validate all inputs** on both frontend and backend
- **Use RLS policies** for all database tables
- **Follow authentication patterns** from existing code
- **Test permission boundaries** thoroughly

## 📖 Resources

- [Architecture Overview](docs/ARCHITECTURE_OVERVIEW.md)
- [Development Patterns](docs/DEVELOPMENT_PATTERNS.md)
- [AI Integration Guide](docs/AI_LLM_INTEGRATION.md)
- [Security Guide](docs/SECURITY_GUIDE.md)

## 🤝 Community

- **GitHub Issues:** Bug reports and feature requests
- **GitHub Discussions:** Questions and community help
- **Pull Requests:** Code contributions

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Happy coding! 🚀**

*Remember: This project is designed for AI-native development. Feel free to use AI assistants to help with your contributions!*