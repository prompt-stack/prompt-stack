from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Prompt Stack API",
    version="0.1.0",
    description="Minimal starter API - Get the full version at https://promptstack.com/code"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "Welcome to Prompt Stack API",
        "status": "healthy",
        "note": "This is a minimal starter. The full codebase includes 15+ endpoints, authentication, AI providers, payments, and more!"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Note: The full codebase includes:
# - /api/auth/* - Complete authentication endpoints
# - /api/ai/chat - Multi-provider AI chat
# - /api/payments/* - Stripe & LemonSqueezy webhooks
# - /api/admin/* - Admin panel endpoints
# - /api/vectors/* - Vector database operations
# - And much more!