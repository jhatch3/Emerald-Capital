"""
Governance-related endpoints
Handles AI proposals, voting, and agent reasoning
"""
from fastapi import APIRouter, Path, Query, HTTPException
from typing import Optional
import random
from datetime import datetime
import subprocess
import json
from pathlib import Path as PathLib
from schemas.governance import (
    ProposalsResponse,
    ProposalResponse,
    ProposalReasoningResponse,
    VoteRequest,
    VoteResponse
)
from data.consistent_data import ALL_BETS

router = APIRouter()

# Path to the TypeScript dashboard service
BACKEND_DIR = PathLib(__file__).parent.parent
TS_DASHBOARD = BACKEND_DIR / "src" / "services" / "snowflake" / "dashboard.ts"


def call_typescript_dashboard(function_name: str, *args):
    """
    Call TypeScript dashboard functions via ts-node
    """
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
            return []
    except Exception as e:
        print(f"Error calling TypeScript dashboard: {e}")
        return []


@router.get("/proposals", response_model=ProposalsResponse)
async def get_proposals(
    status: Optional[str] = Query(None, description="Filter by status"),
    limit: int = Query(50, ge=1, le=100),
    use_real_data: bool = Query(True, description="Use real decisions from Snowflake")
):
    """
    Get all governance proposals.
    If use_real_data=True, fetches from Snowflake decisions.
    Otherwise, uses mock data from consistent_data.py
    """
    proposals = []
    
    if use_real_data:
        # Fetch real decisions from Snowflake
        try:
            decisions = call_typescript_dashboard("getLatestDecisions", limit * 2)  # Get more to filter
            
            for decision in decisions:
                # Extract agent outputs
                agent_outputs = decision.get("agent_outputs", [])
                if isinstance(agent_outputs, str):
                    try:
                        agent_outputs = json.loads(agent_outputs)
                    except:
                        agent_outputs = []
                
                # Calculate average confidence
                if agent_outputs:
                    total_confidence = sum(
                        agent.get("decision", {}).get("confidence", 0) 
                        for agent in agent_outputs
                    )
                    avg_confidence = total_confidence / len(agent_outputs) if agent_outputs else 0
                else:
                    avg_confidence = 0
                
                # Determine status
                direction = decision.get("final_direction", "NO")
                decision_status = "APPROVED" if direction == "YES" else "REJECTED"
                
                # Extract market data
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
                    "riskScore": 5.0,  # Could be calculated from agent outputs
                    "confidence": int(avg_confidence),
                    "status": decision_status,
                    "summary": decision.get("consensus_reasoning", "")[:200] + "..." if len(decision.get("consensus_reasoning", "")) > 200 else decision.get("consensus_reasoning", ""),
                    "timestamp": decision.get("created_at", datetime.now().isoformat()),
                    "dataSources": [f"https://polymarket.com/event/{decision.get('market_id', '')}"],
                    "betStatus": "OPEN",
                    "betResult": None,
                    "closedAt": None,
                    "vote": direction
                }
                proposals.append(proposal)
        except Exception as e:
            print(f"Error fetching real decisions: {e}, falling back to mock data")
            use_real_data = False
    
    # Fallback to mock data if real data fetch failed or use_real_data=False
    if not use_real_data or not proposals:
        for bet in ALL_BETS:
            proposal = {
                "id": bet["id"],
                "market": bet["betDescription"],
                "direction": "LONG" if bet["vote"] == "YES" else "SHORT",
                "positionSize": bet["positionSize"],
                "riskScore": bet["riskScore"],
                "confidence": bet["confidence"],
                "status": bet["status"],
                "summary": bet["betDescription"],
                "timestamp": bet["timestamp"],
                "dataSources": [f"https://polymarket.com/bet/{bet['id']}"],
                "betStatus": bet["betStatus"],
                "betResult": bet["betResult"],
                "closedAt": bet.get("closedAt"),
                "vote": bet["vote"]
            }
            proposals.append(proposal)
    
    if status:
        proposals = [p for p in proposals if p["status"] == status.upper()]
    
    return proposals[:limit]


@router.get("/proposals/{proposal_id}", response_model=ProposalResponse)
async def get_proposal(proposal_id: str = Path(..., description="Proposal ID")):
    """
    Get details for a single proposal.
    """
    # Find the proposal in ALL_BETS
    bet = next((b for b in ALL_BETS if b["id"] == proposal_id), None)
    
    if not bet:
        raise HTTPException(status_code=404, detail="Proposal not found")
    
    return {
        "id": bet["id"],
        "market": bet["betDescription"],  # Use betDescription as market (Polymarket bet)
        "direction": "LONG" if bet["vote"] == "YES" else "SHORT",
        "positionSize": bet["positionSize"],
        "riskScore": bet["riskScore"],
        "confidence": bet["confidence"],
        "status": bet["status"],
        "summary": bet["betDescription"],  # Use betDescription as summary
        "timestamp": bet["timestamp"],
        "dataSources": [f"https://polymarket.com/bet/{bet['id']}"],
        "betStatus": bet["betStatus"],
        "betResult": bet["betResult"],
        "closedAt": bet.get("closedAt"),
        "vote": bet["vote"]  # YES or NO
    }


@router.get("/proposals/{proposal_id}/reasoning", response_model=ProposalReasoningResponse)
async def get_proposal_reasoning(proposal_id: str = Path(..., description="Proposal ID")):
    """
    Get agent reasoning for a proposal.
    Returns all 5 agents with their full reasoning and votes.
    """
    # TODO: Replace with real database query
    # Example: SELECT * FROM proposal_reasoning WHERE proposal_id = proposal_id
    
    return [
        {
            "agent": "Quant Analyst",
            "vote": "YES",
            "rationale": "Bollinger bands squeezing with RSI at 68 indicates strong momentum building. The 20-day moving average has crossed above the 50-day, forming a golden cross pattern. Volume profile shows increasing accumulation over the past 48 hours, with large buy orders at $98.50 support level. MACD histogram is positive and expanding, suggesting continued upward momentum. Fibonacci retracement from recent swing high shows we're at 61.8% level, which historically acts as strong support before continuation moves. My technical analysis suggests a 78% probability of reaching $105 target within 7 days based on similar historical patterns."
        },
        {
            "agent": "Risk Manager",
            "vote": "YES",
            "rationale": "Portfolio heat check: currently at 42%, sufficient room for this $150k position which would bring us to 58% - still well within our 75% threshold. Correlation analysis shows SOL-PERP has 0.72 correlation with our existing JTO long position, which is manageable. Maximum drawdown scenario: if SOL drops 15% (worst case), our portfolio would see 3.2% drawdown, well within our 5% daily limit. Position sizing is appropriate at 5.3% of portfolio. Risk-adjusted return calculation shows Sharpe ratio improvement of 0.12 if this trade executes. I approve with the condition that we set a stop-loss at $95.50 (3% below entry) to limit downside exposure."
        },
        {
            "agent": "Market Maker",
            "vote": "YES",
            "rationale": "Order book depth analysis shows strong liquidity on both sides. Bid-ask spread is currently 0.08% which is tight for SOL-PERP, indicating healthy market conditions. Large limit orders visible at $98.00-$98.50 range provide natural support. Order flow data from the past 2 hours shows 65% buy volume vs 35% sell volume, indicating institutional accumulation. Market depth at current price level can absorb our $150k position without significant slippage (estimated 0.12% slippage). Liquidity providers are active, and we should be able to enter and exit efficiently. The market microstructure supports this trade execution."
        },
        {
            "agent": "News Analyst",
            "vote": "NO",
            "rationale": "Sentiment analysis from social media shows mixed signals. Twitter/X sentiment score is 52/100 (neutral), with recent mentions showing some concern about regulatory developments. News flow in the past 24 hours includes: (1) SEC comments on crypto regulation (slightly negative), (2) Solana Foundation partnership announcement (positive), (3) Major exchange listing rumors (positive). However, the regulatory uncertainty creates headwinds. On-chain metrics show whale accumulation (positive), but retail sentiment is cooling. My sentiment model gives this trade a 45% probability of success based on news catalysts. I recommend waiting 24-48 hours for clearer regulatory signals before entering this position."
        },
        {
            "agent": "Arbitrage Analyst",
            "vote": "YES",
            "rationale": "Cross-market analysis reveals SOL is trading at a 0.8% premium on perpetual futures vs spot markets, which is within normal range but suggests slight bullish bias. Funding rate is positive at 0.012% per 8 hours, indicating long interest. Options market shows put-call ratio of 0.65, suggesting bullish sentiment. The SOL/BTC ratio has been strengthening, indicating SOL outperformance. Statistical arbitrage opportunities are limited currently, but the directional trade has merit. I've identified that if we enter this position, we can hedge with a small BTC short to capture the ratio spread, improving our risk-adjusted returns. The arbitrage landscape supports this trade with additional hedging opportunities available."
        },
    ]


@router.post("/proposals/{proposal_id}/vote", response_model=VoteResponse)
async def vote_on_proposal(
    proposal_id: str = Path(..., description="Proposal ID"),
    vote_data: VoteRequest = ...
):
    """
    Submit a vote on a proposal.
    """
    # TODO: Implement voting logic
    # 1. Verify wallet signature
    # 2. Check if user has already voted
    # 3. Record vote in database
    # 4. Update proposal vote count
    
    if vote_data.vote not in ["YES", "NO"]:
        raise HTTPException(status_code=400, detail="Vote must be 'YES' or 'NO'")
    
    return {
        "success": True,
        "message": "Vote recorded",
        "voteId": f"vote-{proposal_id}-{vote_data.walletAddress}"
    }


@router.get("/random-bet", response_model=ProposalResponse)
async def get_random_polymarket_bet():
    """
    Get a random Polymarket bet with all values needed for the frontend.
    Returns a JSON object matching the Proposal interface.
    This endpoint is designed for AI systems to pull random bets with a side (YES/NO).
    """
    # Select a random bet from ALL_BETS
    if not ALL_BETS:
        raise HTTPException(status_code=404, detail="No bets available")
    
    bet = random.choice(ALL_BETS)
    
    # Generate a Polymarket URL (using the bet ID or slug)
    # In production, you would fetch this from Polymarket API
    polymarket_url = f"https://polymarket.com/event/{bet['id']}"
    
    # Return the proposal in the format expected by the frontend
    return {
        "id": bet["id"],
        "market": bet["betDescription"],  # Polymarket bet description/question
        "direction": "LONG" if bet["vote"] == "YES" else "SHORT",  # LONG for YES, SHORT for NO
        "positionSize": bet["positionSize"],  # Position size as string (e.g., "$150,000")
        "riskScore": bet["riskScore"],  # Risk score (0-10)
        "confidence": bet["confidence"],  # Confidence percentage (0-100)
        "status": bet["status"],  # PENDING, APPROVED, REJECTED, or EXECUTED
        "summary": bet["betDescription"],  # Summary/description of the bet
        "timestamp": bet["timestamp"],  # ISO timestamp string
        "dataSources": [polymarket_url],  # Array with Polymarket link
        "betStatus": bet["betStatus"],  # OPEN or CLOSED
        "betResult": bet.get("betResult"),  # WIN, LOSS, or None
        "closedAt": bet.get("closedAt"),  # ISO timestamp if closed, None if open
        "vote": bet["vote"]  # YES or NO - the side of the bet
    }

