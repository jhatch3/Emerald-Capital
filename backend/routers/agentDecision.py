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
    symbol: str
    price: float
    volume24h: Optional[float] = None
    marketCap: Optional[float] = None


class AgentData(BaseModel):
    portfolio: Optional[Dict[str, Any]] = None
    marketData: Optional[Dict[str, Any]] = None
    historicalData: Optional[List[Dict[str, Any]]] = None
    sentiment: Optional[Dict[str, Any]] = None


class DecisionRequest(BaseModel):
    market: MarketData
    data: AgentData


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


class DecisionResponse(BaseModel):
    status: Literal["ok", "error"]
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
            ["npx", "ts-node", str(TS_SERVICE)],
            input=request_json,
            capture_output=True,
            text=True,
            timeout=60,
            cwd=str(BACKEND_DIR)
        )
        if result.returncode == 0:
            return json.loads(result.stdout)
        else:
            raise Exception(f"ts-node error: {result.stderr}")
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
    Run the 5-agent Gemini decision engine and return consensus.
    This endpoint calls the TypeScript decision engine.
    """
    try:
        # Convert request to dict
        request_data = {
            "market": request.market.dict(),
            "data": request.data.dict()
        }
        
        # Call TypeScript service
        result = call_typescript_service(request_data)
        
        return DecisionResponse(**result)
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing decision: {str(e)}"
        )

