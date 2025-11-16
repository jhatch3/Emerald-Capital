#!/bin/bash
# Quick test script for the Agent Decision Engine

echo "🧪 Testing Agent Decision Engine"
echo "================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found"
    echo "   Make sure you're in the backend/ directory"
    exit 1
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js first."
    exit 1
fi
echo "✅ Node.js found: $(node --version)"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "⚠️  Dependencies not installed. Installing now..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
fi
echo "✅ Dependencies installed"

# Check for .env file
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found"
    echo "   Create it with: echo 'GEMINI_API_KEY=your_key' > .env"
    echo "   Get your key from: https://makersuite.google.com/app/apikey"
    exit 1
fi

# Check if GEMINI_API_KEY is set
if ! grep -q "GEMINI_API_KEY" .env 2>/dev/null; then
    echo "⚠️  GEMINI_API_KEY not found in .env file"
    exit 1
fi
echo "✅ .env file found"

echo ""
echo "🚀 Running test with sample data..."
echo ""

# Test with minimal data
TEST_INPUT='{"market":{"symbol":"SOL","price":98.45},"data":{}}'

echo "$TEST_INPUT" | npx ts-node agent_engine/services/decisionService.ts

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Test completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Start Python backend: uvicorn app.main:app --reload --port 8000"
    echo "2. Test API: curl -X POST http://localhost:8000/api/agents/decision -H 'Content-Type: application/json' -d '$TEST_INPUT'"
else
    echo ""
    echo "❌ Test failed. Check the error messages above."
    exit 1
fi

