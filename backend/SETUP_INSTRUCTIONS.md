# Setup Instructions for Agent Decision Engine

## What "Ready to Use" Means

The code is **structurally complete** - all files are created and the logic is implemented. However, you need to:

1. ✅ **Install Node.js dependencies** (npm packages)
2. ✅ **Get a Gemini API key** (from Google)
3. ✅ **Set up environment variables**
4. ✅ **Test that it works**

## Step-by-Step Setup

### 1. Install Node.js (if not already installed)

Check if you have Node.js:

```bash
node --version
npm --version
```

If not, install from: https://nodejs.org/

### 2. Install TypeScript Dependencies

```bash
cd backend
npm install
```

This installs:

- `@google/generative-ai` - Gemini API client
- `typescript` - TypeScript compiler
- `ts-node` - Run TypeScript directly
- `dotenv` - Environment variables
- `express` - (optional, for standalone service)

### 3. Get Gemini API Key

1. Go to: https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Create a new API key
4. Copy the key

### 4. Create `.env` File

In the `backend/` directory, create a file named `.env`:

```bash
cd backend
echo "GEMINI_API_KEY=your_actual_api_key_here" > .env
```

Replace `your_actual_api_key_here` with your actual key.

### 5. Compile TypeScript (Recommended)

```bash
cd backend
npm run build
```

This creates a `dist/` folder with compiled JavaScript (faster execution).

### 6. Test the TypeScript Service Directly

Test if it works:

```bash
cd backend
echo '{"market":{"symbol":"SOL","price":98.45},"data":{}}' | npx ts-node services/decisionService.ts
```

You should see JSON output with agent decisions.

### 7. Run Python Backend

The Python backend will call the TypeScript service:

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

### 8. Test the API Endpoint

```bash
curl -X POST http://localhost:8000/api/agents/decision \
  -H "Content-Type: application/json" \
  -d '{
    "market": {
      "symbol": "SOL",
      "price": 98.45,
      "volume24h": 1500000
    },
    "data": {
      "portfolio": {
        "totalValue": 100000,
        "heat": 42,
        "positions": []
      }
    }
  }'
```

## Troubleshooting

### Error: "TypeScript service not available"

**Solution:** Make sure you ran `npm install` in the `backend/` directory.

### Error: "GEMINI_API_KEY environment variable is not set"

**Solution:**

1. Create `backend/.env` file
2. Add: `GEMINI_API_KEY=your_key_here`
3. Make sure the file is in the `backend/` directory (not root)

### Error: "ts-node: command not found"

**Solution:**

```bash
cd backend
npm install
# Or install globally:
npm install -g ts-node
```

### Error: "Cannot find module '@google/generative-ai'"

**Solution:**

```bash
cd backend
npm install
```

### Python can't find the TypeScript service

**Solution:**

1. Make sure you're in the `backend/` directory when running Python
2. Or compile TypeScript: `npm run build`
3. Check that `services/decisionService.ts` exists

## What Happens When You Call the API

1. **Python receives request** → `routers/agentDecision.py`
2. **Python calls TypeScript** → Runs `services/decisionService.ts` via subprocess
3. **TypeScript runs 5 agents** → Each calls Gemini API in parallel
4. **Debate round** → Agents refine decisions based on others' outputs
5. **Consensus calculation** → Weighted average of all decisions
6. **Response returned** → JSON with consensus and all agent outputs

## Current Status

✅ **Code is complete** - All 11 files created
✅ **Logic implemented** - Agents, orchestrator, consensus all work
⏳ **Needs setup** - Dependencies and API key required
⏳ **Needs testing** - Verify it works with your Gemini API key

## Next Steps After Setup

1. Test with a simple request
2. Check the logs for any errors
3. Verify Gemini API calls are working
4. Adjust agent personas if needed
5. Fine-tune consensus weights if needed
