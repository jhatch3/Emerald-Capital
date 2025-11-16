"""
Agent decision endpoint
Calls the TypeScript decision engine
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List, Literal, Optional
import subprocess
import json
import os
import sys
from pathlib import Path

router = APIRouter()

# Path to the TypeScript decision service
BACKEND_DIR = Path(__file__).parent.parent
TS_SERVICE = BACKEND_DIR / "agent_engine" / "services" / "decisionService.ts"
TS_SERVICE_JS = BACKEND_DIR / "dist" / "agent_engine" / "services" / "decisionService.js"


class MarketData(BaseModel):
    symbol: Optional[str] = None
    price: Optional[float] = None
    volume24h: Optional[float] = None
    marketCap: Optional[float] = None
    question: Optional[str] = None  # For Polymarket markets


class AgentData(BaseModel):
    portfolio: Optional[Dict[str, Any]] = None
    marketData: Optional[Dict[str, Any]] = None
    historicalData: Optional[List[Dict[str, Any]]] = None
    sentiment: Optional[Dict[str, Any]] = None


class DecisionRequest(BaseModel):
    market: Optional[MarketData] = None
    data: Optional[AgentData] = None


class AgentDecision(BaseModel):
    direction: Literal["YES", "NO"]
    confidence: float
    size: float
    reasoning: str


class AgentOutput(BaseModel):
    agent: str
    decision: AgentDecision


class ConsensusDecision(BaseModel):
    direction: Literal["YES", "NO"]
    size: float
    reasoning: str


class InvestmentDecision(BaseModel):
    direction: Literal["YES", "NO"]
    size: float
    confidence: float
    summary: str


class AgentAnalysis(BaseModel):
    agent_name: str
    direction: Literal["YES", "NO"]
    confidence: float
    size: float
    reasoning: str


class DecisionResponse(BaseModel):
    status: Literal["ok", "error"]
    decision_id: Optional[str] = None
    investment_decision: Optional[InvestmentDecision] = None
    agent_analysis: Optional[List[AgentAnalysis]] = None
    conversation_logs: Optional[Dict[str, Any]] = None
    market_info: Optional[Dict[str, Any]] = None
    # Legacy fields for backward compatibility
    decision: Optional[ConsensusDecision] = None
    agents: Optional[List[AgentOutput]] = None
    error: Optional[str] = None


def call_typescript_service(request_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Call the TypeScript decision service
    Tries compiled JS first, then falls back to ts-node
    """
    request_json = json.dumps(request_data)
    
    # Try compiled JavaScript first
    if TS_SERVICE_JS.exists():
        try:
            result = subprocess.run(
                ["node", str(TS_SERVICE_JS)],
                input=request_json,
                capture_output=True,
                text=True,
                timeout=60,
                cwd=str(BACKEND_DIR)
            )
            if result.returncode == 0:
                return json.loads(result.stdout)
        except Exception as e:
            print(f"Error running compiled JS: {e}")
    
    # Fall back to ts-node
    try:
        result = subprocess.run(
            ["npx", "ts-node", "--project", "tsconfig.json", str(TS_SERVICE)],
            input=request_json,
            capture_output=True,
            text=True,
            timeout=120,  # Increased timeout for full pipeline
            cwd=str(BACKEND_DIR)
        )
        if result.returncode == 0:
            # Log stderr for debugging (contains console.log output)
            if result.stderr:
                print(f"[TypeScript] Logs: {result.stderr[:500]}")  # First 500 chars of logs
            
            # Parse JSON from stdout (should be clean JSON now)
            stdout_lines = result.stdout.strip().split('\n')
            # Find the last line that looks like JSON (in case there are any stray logs)
            json_line = None
            for line in reversed(stdout_lines):
                line = line.strip()
                if line and (line.startswith('{') or line.startswith('[')):
                    json_line = line
                    break
            
            if json_line:
                return json.loads(json_line)
            else:
                # Fallback: try parsing entire stdout
                return json.loads(result.stdout.strip())
        else:
            error_msg = result.stderr or result.stdout or "Unknown error"
            raise Exception(f"ts-node error: {error_msg}")
    except FileNotFoundError:
        raise Exception(
            "TypeScript service not available. Please install dependencies:\n"
            "  cd backend && npm install\n"
            "Then either compile: npm run build\n"
            "Or ensure ts-node is available: npm install -g ts-node"
        )
    except json.JSONDecodeError as e:
        raise Exception(f"Invalid response from TypeScript service: {e}")
    except subprocess.TimeoutExpired:
        raise Exception("TypeScript service timed out after 60 seconds")


@router.post("/decision", response_model=DecisionResponse)
async def get_agent_decision(request: DecisionRequest):
    """
    Run the 5-agent Gemini decision engine and return enhanced consensus.
    This endpoint calls the TypeScript decision engine and returns:
    - Clean investment decision summary (4 sentences)
    - Agent analysis with 4-sentence reasoning from each agent
    - Full conversation logs (initial, debate, final)
    - Market information
    """
    try:
        # Convert request to dict, handling None/empty cases
        request_data = {}
        
        if request.market:
            market_dict = request.market.dict(exclude_none=True)
            # If market is empty or missing required fields, pass empty dict for auto-selection
            if not market_dict or (not market_dict.get("symbol") and not market_dict.get("question")):
                request_data["market"] = {}
            else:
                request_data["market"] = market_dict
        else:
            request_data["market"] = {}
        
        if request.data:
            request_data["data"] = request.data.dict(exclude_none=True)
        else:
            request_data["data"] = {}
        
        # Call TypeScript service
        result = call_typescript_service(request_data)
        
        # Map enhanced response to DecisionResponse
        response = DecisionResponse(
            status=result.get("status", "ok"),
            decision_id=result.get("decision_id"),
            investment_decision=result.get("investment_decision"),
            agent_analysis=result.get("agent_analysis"),
            conversation_logs=result.get("conversation_logs"),
            market_info=result.get("market_info"),
            # Legacy fields for backward compatibility
            decision=result.get("decision"),
            agents=result.get("agents"),
            error=result.get("error")
        )
        
        return response
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing decision: {str(e)}"
        )

