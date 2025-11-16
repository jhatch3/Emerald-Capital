"""
Decision-related endpoints
Fetches decisions from Snowflake database
"""
from fastapi import APIRouter, Query, HTTPException
from typing import Optional, List, Dict, Any
from datetime import datetime
import subprocess
import json
from pathlib import Path

router = APIRouter()

# Path to the TypeScript dashboard service
BACKEND_DIR = Path(__file__).parent.parent
TS_DASHBOARD = BACKEND_DIR / "src" / "services" / "snowflake" / "dashboard.ts"


def call_typescript_dashboard(function_name: str, *args) -> Any:
    """
    Call TypeScript dashboard functions via ts-node
    """
    # Create a temporary script to call the function
    script_content = f"""
import {{ {function_name} }} from './src/services/snowflake/dashboard';
import {{ initSnowflake }} from './src/database/snowflake';

async function run() {{
  try {{
    await initSnowflake();
    const result = await {function_name}({', '.join(map(str, args))});
    console.log(JSON.stringify(result));
  }} catch (error) {{
    console.error(JSON.stringify({{ error: str(error) }}));
    process.exit(1);
  }}
}}

run();
"""
    
    try:
        result = subprocess.run(
            ["npx", "ts-node", "-e", script_content],
            capture_output=True,
            text=True,
            timeout=30,
            cwd=str(BACKEND_DIR)
        )
        if result.returncode == 0:
            return json.loads(result.stdout)
        else:
            raise Exception(f"ts-node error: {result.stderr}")
    except Exception as e:
        # Fallback: return empty array on error
        print(f"Error calling TypeScript dashboard: {e}")
        return []


@router.get("/decisions")
async def get_decisions(
    limit: int = Query(20, ge=1, le=100, description="Maximum number of decisions to return")
):
    """
    Get the latest decisions from Snowflake.
    Returns decisions with full agent analysis and conversation logs.
    """
    try:
        decisions = call_typescript_dashboard("getLatestDecisions", limit)
        
        # Transform to frontend format
        proposals = []
        for decision in decisions:
            # Extract agent outputs
            agent_outputs = decision.get("agent_outputs", [])
            
            # Calculate consensus confidence from agent outputs
            if agent_outputs:
                total_confidence = sum(
                    agent.get("decision", {}).get("confidence", 0) 
                    for agent in agent_outputs
                )
                avg_confidence = total_confidence / len(agent_outputs) if agent_outputs else 0
            else:
                avg_confidence = 0
            
            # Determine status based on direction and execution
            direction = decision.get("final_direction", "NO")
            status = "APPROVED" if direction == "YES" else "REJECTED"
            
            # Extract market info
            market_data = decision.get("raw_market_data", {})
            if isinstance(market_data, str):
                try:
                    market_data = json.loads(market_data)
                except:
                    market_data = {}
            
            proposal = {
                "id": decision.get("id", ""),
                "market": decision.get("market_question", decision.get("market_id", "Unknown Market")),
                "direction": "LONG" if direction == "YES" else "SHORT",
                "positionSize": f"${decision.get('final_size', 0):,.0f}",
                "riskScore": 5.0,  # Default, could be calculated from agent outputs
                "confidence": int(avg_confidence),
                "status": status,
                "summary": decision.get("consensus_reasoning", ""),
                "timestamp": decision.get("created_at", datetime.now().isoformat()),
                "dataSources": [f"https://polymarket.com/event/{decision.get('market_id', '')}"],
                "betStatus": "OPEN",  # Default, could be determined from market data
                "betResult": None,
                "closedAt": None,
                "vote": direction,
                # Additional fields for enhanced display
                "decision_id": decision.get("id"),
                "agent_analysis": agent_outputs,
                "investment_summary": decision.get("consensus_reasoning", ""),
                "conversation_logs": {
                    "initial_decisions": decision.get("agent_outputs", []),
                    "final_decisions": decision.get("agent_outputs", []),
                }
            }
            proposals.append(proposal)
        
        return proposals
    except Exception as e:
        print(f"Error fetching decisions: {e}")
        return []


@router.get("/decisions/{decision_id}")
async def get_decision(decision_id: str):
    """
    Get a specific decision by ID.
    """
    try:
        # For now, get all and filter (inefficient but works)
        decisions = call_typescript_dashboard("getLatestDecisions", 100)
        decision = next((d for d in decisions if d.get("id") == decision_id), None)
        
        if not decision:
            raise HTTPException(status_code=404, detail="Decision not found")
        
        return decision
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching decision: {str(e)}")

