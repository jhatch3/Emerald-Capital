# 5-Agent Gemini Decision Engine

## Overview

This is a complete 5-agent decision engine for the decentralized AI hedge fund. Each agent uses Gemini 1.5 Pro to evaluate trading opportunities from different perspectives, then they debate and reach consensus.

## Architecture

All agent-related code is now organized in `backend/agent_engine/`:

### Agents (`backend/agent_engine/agents/`)

1. **FundamentalAgent** (`fundamental.ts`)

   - Focus: Logical, factual, event-based reasoning
   - Analyzes fundamentals, news, events, and long-term value

2. **QuantAgent** (`quant.ts`)

   - Focus: Probability, statistics, numerical features only
   - Uses mathematical models and statistical analysis
   - Weight: 30% in consensus

3. **SentimentAgent** (`sentiment.ts`)

   - Focus: Social media narrative, momentum, trend-driven
   - Analyzes sentiment, hype, and market psychology
   - Weight: 10% in consensus

4. **RiskAgent** (`risk.ts`)

   - Focus: Conservative, tail-risk-aware, limits position size
   - Prioritizes capital preservation
   - Weight: 25% in consensus

5. **StrategistAgent** (`strategist.ts`)
   - Focus: Market structure, incentives, inefficiencies
   - Analyzes market mechanics and strategic opportunities
   - Weight: 10% in consensus

### Orchestrator (`backend/agent_engine/orchestrator/`)

- **runAgents.ts**: Runs all 5 agents in parallel
- **debate.ts**: One debate round where agents refine decisions
- **consensus.ts**: Calculates weighted consensus from agent outputs

### Services (`backend/agent_engine/services/`)

- **gemini.ts**: Gemini API integration using `@google/generative-ai`
- **decisionService.ts**: Main service function that orchestrates the decision process

### Routes

- **agent_engine/routes/agentDecision.ts**: Express router (for standalone TypeScript service)
- **routers/agentDecision.py**: FastAPI route that calls the TypeScript service

## Setup

### 1. Install Node.js Dependencies

```bash
cd backend
npm install
```

This installs:

- `@google/generative-ai` (Gemini API)
- `express` (for standalone service option)
- `typescript`, `ts-node` (for TypeScript execution)
- `dotenv` (for environment variables)

### 2. Set Up Gemini API Key

Create a `.env` file in the `backend/` directory:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

Get your API key from: https://makersuite.google.com/app/apikey

### 3. Compile TypeScript (Optional but Recommended)

```bash
cd backend
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` directory for faster execution.

### 4. Run the Backend

The Python FastAPI backend will automatically call the TypeScript service:

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

The endpoint will be available at:

```
POST http://localhost:8000/api/agents/decision
```

## API Usage

### Request

```json
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
        "price": 97.2,
        "volume": 1200000
      }
    ],
    "sentiment": {
      "socialScore": 75,
      "newsScore": 68,
      "trend": "bullish"
    }
  }
}
```

### Response

```json
{
  "status": "ok",
  "decision": {
    "direction": "YES",
    "size": 15000,
    "reasoning": "Consensus: YES (Weighted Confidence: YES=65.2%, NO=34.8%)\n\nAgent Decisions:\n..."
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
    ...
  ]
}
```

## How It Works

1. **Agent Evaluation**: All 5 agents evaluate the opportunity in parallel using Gemini 1.5 Pro
2. **Debate Round**: Agents see each other's decisions and refine their reasoning
3. **Consensus**: Weighted consensus is calculated:
   - QuantAgent: 30%
   - FundamentalAgent: 25%
   - RiskAgent: 25%
   - SentimentAgent: 10%
   - StrategistAgent: 10%

## Error Handling

- All errors are logged but don't crash the process
- Agents return conservative defaults (NO, 0 size) on error
- The service gracefully handles Gemini API failures
- Timeouts are set to 60 seconds for the entire decision process

## Development

### Running TypeScript Directly

You can test the TypeScript service directly:

```bash
cd backend
echo '{"market":{"symbol":"SOL","price":98.45},"data":{}}' | npx ts-node services/decisionService.ts
```

### Standalone Express Service

If you want to run the TypeScript service as a separate HTTP service:

```bash
cd backend
npm run dev
```

This runs the Express server (you'll need to set up the Express app separately).

## Notes

- All Gemini calls use `response_mime_type: "application/json"` for consistent JSON responses
- Model used: `gemini-1.5-pro`
- Temperature: 0.7 (balanced creativity/consistency)
- All responses are validated for correct structure before returning
