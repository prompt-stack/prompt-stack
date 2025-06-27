# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.1] - 2025-06-27

### 🔒 Security & Quality Improvements
- **CRITICAL**: Removed hardcoded JWT secrets in demo mode
- **FIXED**: Updated python-multipart from 0.0.9 to 0.0.12 (CVE-2024-37891)
- **ENABLED**: TypeScript strict mode for better type safety
- **ADDED**: React error boundary to prevent white screen crashes
- **ENHANCED**: API client with timeout, retry, and cancellation support
- **IMPROVED**: Rate limiting with Redis support when available
- **ADDED**: Input validation utilities to prevent XSS/injection
- **ADDED**: Basic test coverage for auth and LLM endpoints

### 📊 Developer Experience
- **ADDED**: Comprehensive developer assessment (DEVELOPER_ASSESSMENT.md)
- **INSIGHT**: Identified as mid-to-senior level codebase with strong DX focus
- **VALIDATED**: Security posture improved without adding bloat

## [1.1.0] - 2025-06-27

### 🚨 Critical Fixes
- **FIXED**: Missing `frontend/lib/api-url.ts` causing HTTP 500 errors on fresh clones
- **FIXED**: `.gitignore` blocking entire `frontend/lib/` directory 
- **ADDED**: All missing frontend utility files (api-url, demo-auth, supabase, etc.)

### 🎯 Real-World Tested
- **VALIDATED**: Complete setup flow with actual user testing
- **CONFIRMED**: ~20 minutes from clone to fully functional AI app
- **DISCOVERED**: Critical authentication token refresh pattern

### 📚 Documentation Improvements
- **ADDED**: Authentication token refresh requirement after config changes
- **UPDATED**: Setup guides with real-world testing insights
- **ENHANCED**: Troubleshooting with most common issues
- **IMPROVED**: All documentation with marketplace-ready polish

### 🔒 Production Security
- **ADDED**: Comprehensive security headers (CSP, HSTS, XSS protection)
- **IMPLEMENTED**: Request logging and tracing middleware
- **ENHANCED**: Error handling with environment-aware logging
- **SECURED**: Content Security Policy optimized for development

### 🤖 AI-Native Features
- **ADDED**: AI-powered code quality auditing with GPT-4o-mini
- **IMPLEMENTED**: GitHub Actions workflow for automated PR audits
- **CREATED**: Scaffold templates for rapid development
- **BUILT**: Complete AI development workflow and guides

### ⚡ Quality & Performance
- **ADDED**: Automated quality gates and reporting
- **IMPLEMENTED**: Comprehensive logging and monitoring
- **CREATED**: Production-ready CI/CD pipeline
- **OPTIMIZED**: Docker setup and environment handling

## [1.0.0] - 2025-06-26

### Added
- Initial release of Prompt-Stack template
- Next.js 15 frontend with TypeScript
- FastAPI backend with async support
- Demo mode - works without any API keys
- Authentication system (Supabase + Demo auth)
- Multi-provider AI support (OpenAI, Anthropic, Gemini, DeepSeek)
- Payment integration (Stripe & Lemon Squeezy)
- Vector search capabilities
- Docker Compose development environment
- Comprehensive health checks and diagnostics
- Rate limiting (10/min demo, 30/min authenticated)
- CORS configuration for local development
- API documentation with Swagger UI
- Example pages and components
- Centralized feature configuration
- Environment variable validation
- Quick setup script (3-minute setup)

### Security
- Environment variables properly isolated
- Secure authentication flow
- API key validation
- Rate limiting protection

## [1.0.0] - Coming Soon

### Planned
- Production deployment guides
- Advanced monitoring setup
- Team collaboration features
- Enhanced vector search
- More AI provider integrations

---

For upgrade guides and breaking changes, see [docs/UPGRADE.md](docs/UPGRADE.md)