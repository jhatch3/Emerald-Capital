# Testing Guide for Agent Decision Engine

## Quick Test Checklist

- [ ] Node.js installed (`node --version`)
- [ ] Dependencies installed (`npm install` in backend/)
- [ ] Gemini API key set (`.env` file)
- [ ] TypeScript compiles (`npm run build`)
- [ ] Direct test works (TypeScript service)
- [ ] API endpoint works (Python → TypeScript)

## Step 1: Verify Prerequisites

### Check Node.js

```bash
node --version
# Should show v18+ or v20+
```

### Check if dependencies are installed

```bash
cd backend
ls node_modules 2>/dev/null && echo "✅ Dependencies installed" || echo "❌ Run: npm install"
```

## Step 2: Install Dependencies (if needed)

```bash
cd backend
npm install
```

This should install:

- `@google/generative-ai`
- `typescript`
- `ts-node`
- `dotenv`
- And others...

## Step 3: Set Up Gemini API Key

### Get API Key

1. Go to: https://makersuite.google.com/app/apikey
2. Sign in with Google
3. Click "Create API Key"
4. Copy the key

### Create .env file

```bash
cd backend
echo "GEMINI_API_KEY=your_actual_key_here" > .env
```

Replace `your_actual_key_here` with your real key.

## Step 4: Test TypeScript Service Directly

This is the fastest way to verify everything works:

```bash
cd backend

# Test with minimal data
echo '{"market":{"symbol":"SOL","price":98.45},"data":{}}' | npx ts-node agent_engine/services/decisionService.ts
```

### Expected Output

You should see JSON output like:

```json
{
  "status": "ok",
  "decision": {
    "direction": "YES" or "NO",
    "size": 12345.67,
    "reasoning": "Consensus: ..."
  },
  "agents": [
    {
      "agent": "FundamentalAgent",
      "decision": {
        "direction": "YES",
        "confidence": 75,
        "size": 20000,
        "reasoning": "..."
      }
    },
    ... (4 more agents)
  ]
}
```

### If You See Errors

**Error: "GEMINI_API_KEY environment variable is not set"**

- Check that `.env` file exists in `backend/` directory
- Verify the key is correct (no quotes, no spaces)

**Error: "Cannot find module '@google/generative-ai'"**

- Run: `npm install`

**Error: "ts-node: command not found"**

- Run: `npm install` (installs ts-node locally)
- Or: `npm install -g ts-node`

## Step 5: Test with More Complete Data

```bash
cd backend

cat > test_request.json << 'EOF'
{
  "market": {
    "symbol": "SOL",
    "price": 98.45,
    "volume24h": 1500000,
    "marketCap": 45000000
  },
  "data": {
    "portfolio": {
      "totalValue": 100000,
      "heat": 42,
      "positions": [
        {
          "symbol": "SOL",
          "size": 50000,
          "pnl": 2.5
        }
      ]
    },
    "historicalData": [
      {
        "date": "2024-02-19",
        "price": 97.20,
        "volume": 1200000
      },
      {
        "date": "2024-02-18",
        "price": 96.50,
        "volume": 1100000
      }
    ],
    "sentiment": {
      "socialScore": 75,
      "newsScore": 68,
      "trend": "bullish"
    }
  }
}
EOF

cat test_request.json | npx ts-node agent_engine/services/decisionService.ts
```

## Step 6: Test via Python API Endpoint

### Start Python Backend

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

Keep this running in one terminal.

### Test in Another Terminal

#### Using curl:

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

#### Using Python:

```bash
python3 << 'EOF'
import requests
import json

response = requests.post(
    "http://localhost:8000/api/agents/decision",
    json={
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
    }
)

print(json.dumps(response.json(), indent=2))
EOF
```

### Expected Response

Status 200 with JSON:

```json
{
  "status": "ok",
  "decision": {
    "direction": "YES",
    "size": 15000.0,
    "reasoning": "Consensus: YES (Weighted Confidence: YES=65.2%, NO=34.8%)..."
  },
  "agents": [...]
}
```

## Step 7: Verify All 5 Agents Responded

Check that the response includes all 5 agents:

```bash
# Using jq (if installed)
curl -X POST http://localhost:8000/api/agents/decision \
  -H "Content-Type: application/json" \
  -d '{"market":{"symbol":"SOL","price":98.45},"data":{}}' | jq '.agents | length'

# Should output: 5
```

Or check manually - the `agents` array should have:

1. FundamentalAgent
2. QuantAgent
3. SentimentAgent
4. RiskAgent
5. StrategistAgent

## Step 8: Check Logs

When testing, watch the console output. You should see:

```
[DecisionService] Running agents for market: SOL
[FundamentalAgent] Evaluating...
[QuantAgent] Evaluating...
...
[DecisionService] Initial agent outputs received: 5
[DecisionService] Running debate round...
[DecisionService] Debate round completed
[DecisionService] Calculating consensus...
[DecisionService] Consensus: YES with size $15,000
```

## Common Issues & Solutions

### Issue: "TypeScript service not available"

**Solution:** Make sure you're in the `backend/` directory and `npm install` has been run.

### Issue: Python can't find TypeScript

**Solution:**

- Make sure you're running Python from the `backend/` directory
- Or compile TypeScript: `npm run build`

### Issue: Timeout errors

**Solution:**

- Gemini API calls can take 10-30 seconds
- Check your internet connection
- Verify API key is valid

### Issue: Invalid JSON response

**Solution:**

- Check Gemini API key is correct
- Check that you have API quota remaining
- Look at error logs for details

## Performance Expectations

- **First call:** 20-40 seconds (cold start + 5 Gemini API calls)
- **Subsequent calls:** 15-30 seconds (5 Gemini API calls in parallel)
- **Debate round:** 5-10 seconds (1 additional Gemini API call)

Total: ~20-50 seconds per decision request.

## Success Criteria

✅ All 5 agents return decisions
✅ Consensus is calculated correctly
✅ Response includes direction (YES/NO), size, and reasoning
✅ No errors in console
✅ API returns 200 status code

## Next Steps After Testing

Once it's working:

1. Integrate with your frontend
2. Add caching for repeated requests
3. Set up monitoring/logging
4. Fine-tune agent personas if needed
5. Adjust consensus weights if needed
