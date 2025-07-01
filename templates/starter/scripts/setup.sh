#!/bin/bash

echo "🚀 Prompt Stack Starter Setup"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "⚠️  Python 3 is not installed. Backend will not work without it."
    echo "   Install Python 3.9+ to run the backend."
fi

# Install dependencies
echo "📦 Installing frontend dependencies..."
cd frontend && npm install
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "📖 Next steps:"
echo "   1. Copy .env.example to .env.local in both frontend/ and backend/"
echo "   2. Add your API keys"
echo "   3. Run 'npm run dev' to start the frontend"
echo "   4. Run 'npm run dev:all' to start both frontend and backend"
echo ""
echo "💡 Want the full experience?"
echo "   Get the complete codebase: https://promptstack.com/code"
echo "   Learn the VIBE Framework: https://promptstack.com/studio"
echo ""