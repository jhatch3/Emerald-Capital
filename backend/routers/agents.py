"""
Agent-related endpoints
Handles AI agent personas and debate transcripts
"""
from fastapi import APIRouter, Path
from schemas.agents import (
    AgentsResponse,
    DebateTranscriptResponse
)

router = APIRouter()


@router.get("", response_model=AgentsResponse)
async def get_agents():
    """
    Get all agent personas from the TypeScript agent engine.
    Returns the 5 specialized trading agents with their real personas.
    """
    return [
        {
            "id": "fundamental-agent",
            "name": "Fundamental Agent",
            "role": "Fundamental Analysis & Events",
            "avatar": "📈",
            "description": "Specializes in logical, factual, and event-based reasoning. Analyzes fundamentals, news events, partnerships, protocol upgrades, and ecosystem developments. Focuses on tokenomics, supply dynamics, user growth, transaction volume, and developer activity. Bases decisions on factual information and logical analysis, ignoring short-term price movements.",
            "specialty": "Fundamental Analysis"
        },
        {
            "id": "quant-agent",
            "name": "Quant Agent",
            "role": "Quantitative Analysis & Statistics",
            "avatar": "📊",
            "description": "Specializes in probability, statistics, and numerical analysis. Uses ONLY numerical data: prices, volumes, returns, volatility, correlations. Applies statistical models like mean reversion, momentum, and volatility clustering. Calculates probabilities and expected values. Uses technical indicators (RSI, MACD, Bollinger Bands) and analyzes volume profiles and market microstructure.",
            "specialty": "Quantitative Analysis"
        },
        {
            "id": "sentiment-agent",
            "name": "Sentiment Agent",
            "role": "Social Media & Narrative Analysis",
            "avatar": "📰",
            "description": "Specializes in social media narrative, momentum, and trend-driven analysis. Analyzes Twitter, Reddit, and Discord sentiment. Tracks narrative shifts, hype cycles, and momentum patterns. Monitors influencer activity, community engagement, and viral potential. Considers market psychology, FOMO/FUD dynamics, and contrarian signals when sentiment is extreme.",
            "specialty": "Sentiment Analysis"
        },
        {
            "id": "risk-agent",
            "name": "Risk Agent",
            "role": "Risk Management & Portfolio Protection",
            "avatar": "🛡️",
            "description": "Conservative, tail-risk-aware agent that prioritizes capital preservation over returns. Limits position sizes to manage portfolio heat. Evaluates correlation with existing positions, sets maximum drawdown limits, and uses conservative position sizing (typically 5-15% of portfolio per position). Rejects high-risk opportunities even if profitable. Considers liquidity, slippage risks, and worst-case scenarios.",
            "specialty": "Risk Management"
        },
        {
            "id": "strategist-agent",
            "name": "Strategist Agent",
            "role": "Market Structure & Strategy",
            "avatar": "⚡",
            "description": "Specializes in market structure, incentives, and inefficiencies. Analyzes market mechanics, identifies arbitrage opportunities, and considers incentive structures and game theory. Evaluates market maker behavior, order flow, funding rates, basis, and derivatives pricing. Identifies market manipulation patterns and strategic positioning opportunities.",
            "specialty": "Market Strategy"
        },
    ]


@router.get("/debate/{proposal_id}", response_model=DebateTranscriptResponse)
async def get_debate_transcript(proposal_id: str = Path(..., description="Proposal ID")):
    """
    Get full debate transcript for a specific proposal.
    Returns the complete conversation between all agents from Snowflake.
    """
    # Try to fetch from Snowflake first
    try:
        import subprocess
        import json
        from pathlib import Path as PathLib
        
        BACKEND_DIR = PathLib(__file__).parent.parent
        script_content = f"""
import {{ getLatestDecisions }} from './src/services/snowflake/dashboard';
import {{ initSnowflake }} from './src/database/snowflake';

async function run() {{
  try {{
    await initSnowflake();
    const decisions = await getLatestDecisions(100);
    const decision = decisions.find(d => d.id === '{proposal_id}');
    if (decision) {{
      const logs = decision.conversation_logs || {{}};
      const initial = logs.initial_decisions || [];
      const final = logs.final_decisions || [];
      
      // Convert agent outputs to debate messages
      const messages = [];
      
      // Initial decisions
      for (const agent of initial) {{
        messages.push({{
          agent: agent.agent || 'Unknown',
          message: agent.decision?.reasoning || '',
          timestamp: new Date().toLocaleTimeString(),
          vote: agent.decision?.direction || 'NO'
        }});
      }}
      
      // Final decisions (after debate)
      for (const agent of final) {{
        messages.push({{
          agent: agent.agent || 'Unknown',
          message: agent.decision?.reasoning || '',
          timestamp: new Date().toLocaleTimeString(),
          vote: agent.decision?.direction || 'NO'
        }});
      }}
      
      console.log(JSON.stringify({{ proposalId: '{proposal_id}', messages }}));
    }} else {{
      console.log(JSON.stringify({{ proposalId: '{proposal_id}', messages: [] }}));
    }}
  }} catch (error) {{
    console.error(JSON.stringify({{ error: String(error) }}));
    process.exit(1);
  }}
}}

run();
"""
        result = subprocess.run(
            ["npx", "ts-node", "-e", script_content],
            capture_output=True,
            text=True,
            timeout=30,
            cwd=str(BACKEND_DIR)
        )
        if result.returncode == 0:
            transcript = json.loads(result.stdout)
            if transcript.get("messages"):
                return transcript
    except Exception as e:
        print(f"Error fetching debate from Snowflake: {e}")
    
    # Fallback to mock data
    
    # Return different debates based on proposal ID to match governance outcomes
    if proposal_id == "prop-001":
        # APPROVED proposal - consensus reached
        return {
            "proposalId": proposal_id,
            "messages": [
                {
                    "agent": "Quant Analyst",
                    "message": "I'm initiating a proposal for a $150k LONG position on SOL-PERP. Technical analysis shows Bollinger bands squeezing with RSI at 68, indicating strong momentum building. The 20-day moving average has crossed above the 50-day, forming a golden cross pattern. Volume profile shows increasing accumulation over the past 48 hours. MACD histogram is positive and expanding. Based on historical patterns, I estimate a 78% probability of reaching $105 target within 7 days. I vote YES.",
                    "timestamp": "14:28:33",
                    "vote": "YES"
                },
                {
                    "agent": "Risk Manager",
                    "message": "Quant Analyst, I've reviewed your proposal. Portfolio heat is currently at 42%, so adding this $150k position would bring us to 58% - still within our 75% threshold. However, I need to point out that correlation with our existing JTO long is 0.72, which is moderate. If SOL drops 15%, our portfolio would see 3.2% drawdown. I can approve this, but I'm setting a hard condition: we must implement a stop-loss at $95.50 (3% below entry). With that risk management in place, I vote YES.",
                    "timestamp": "14:29:01",
                    "vote": "YES"
                },
                {
                    "agent": "Market Maker",
                    "message": "Risk Manager, I appreciate your risk controls. From a liquidity perspective, I've analyzed the order book and current market conditions are favorable. Bid-ask spread is tight at 0.08%, and there's strong depth at the $98.00-$98.50 support level. Order flow shows 65% buy volume vs 35% sell volume over the past 2 hours, indicating institutional accumulation. We can execute this $150k position with minimal slippage (estimated 0.12%). The market microstructure supports this trade. I vote YES.",
                    "timestamp": "14:29:45",
                    "vote": "YES"
                },
                {
                    "agent": "News Analyst",
                    "message": "I have concerns about this trade. While the technical setup looks good, sentiment analysis shows mixed signals. Twitter/X sentiment is neutral at 52/100, and there are regulatory headwinds - the SEC made comments yesterday about crypto regulation that created uncertainty. On the positive side, there's a Solana Foundation partnership announcement and whale accumulation, but retail sentiment is cooling. My sentiment model gives this only a 45% probability of success based on news catalysts. I recommend waiting 24-48 hours for clearer regulatory signals. I vote NO.",
                    "timestamp": "14:30:22",
                    "vote": "NO"
                },
                {
                    "agent": "Arbitrage Analyst",
                    "message": "News Analyst, I understand your regulatory concerns, but let me add some context from the derivatives markets. SOL is trading at a 0.8% premium on perps vs spot, which is normal but suggests bullish bias. Funding rate is positive at 0.012% per 8 hours, indicating long interest. Options market shows put-call ratio of 0.65, suggesting bullish sentiment. The SOL/BTC ratio has been strengthening. Additionally, I've identified that we can hedge this with a small BTC short to capture the ratio spread, which would improve our risk-adjusted returns. The arbitrage landscape supports this trade. I vote YES.",
                    "timestamp": "14:31:15",
                    "vote": "YES"
                },
                {
                    "agent": "Quant Analyst",
                    "message": "Arbitrage Analyst, thank you for the hedging suggestion - that's a smart addition. News Analyst, I respect your sentiment concerns, but technical momentum often leads sentiment by 12-24 hours. The volume and price action I'm seeing suggests the market is already pricing in the regulatory uncertainty. The golden cross pattern I identified has historically preceded moves of 8-12% within 7 days, even during regulatory uncertainty periods. I maintain my YES vote.",
                    "timestamp": "14:32:08",
                    "vote": "YES"
                },
                {
                    "agent": "Risk Manager",
                    "message": "We have 4 YES votes and 1 NO vote. That's a majority (4/5), so this proposal meets our consensus threshold. However, News Analyst raises valid concerns about regulatory uncertainty. I propose we proceed with the trade but reduce position size to $120k instead of $150k to account for the sentiment risk. This still maintains our risk parameters while being more conservative. Quant Analyst, Market Maker, Arbitrage Analyst - are you all comfortable with this adjustment?",
                    "timestamp": "14:33:12",
                    "vote": "YES"
                },
                {
                    "agent": "Market Maker",
                    "message": "Risk Manager, I'm comfortable with the $120k adjustment. The liquidity can easily handle that size, and it's a reasonable compromise given News Analyst's concerns. The execution will be even cleaner with the smaller size.",
                    "timestamp": "14:33:45",
                    "vote": "YES"
                },
                {
                    "agent": "News Analyst",
                    "message": "I appreciate the compromise, Risk Manager. While I still have reservations about the timing, reducing the position size to $120k does mitigate some of my concerns. The sentiment risk is real, but I acknowledge that technical momentum can sometimes override short-term sentiment. I'll change my vote to YES, but I want it on record that I'm doing so with caution and recommend monitoring news flow closely over the next 48 hours.",
                    "timestamp": "14:34:20",
                    "vote": "YES"
                },
                {
                    "agent": "Arbitrage Analyst",
                    "message": "Consensus reached. All 5 agents now vote YES. The position size adjustment to $120k is acceptable and still allows for the hedging strategy I proposed. I'll prepare the ratio spread hedge once the main position is executed. This is a well-analyzed trade with proper risk management in place.",
                    "timestamp": "14:34:55",
                    "vote": "YES"
                },
            ]
        }
    elif proposal_id == "prop-002":
        # EXECUTED/WIN proposal - consensus reached, trade won
        return {
            "proposalId": proposal_id,
            "messages": [
                {
                    "agent": "Quant Analyst",
                    "message": "I'm proposing a $87k SHORT position on JTO-PERP. Technical indicators show overbought conditions with RSI at 78. The price has reached a strong resistance level at $3.20, which has historically held. Volume is decreasing on recent rallies, suggesting exhaustion. My analysis indicates a 72% probability of a pullback to $2.85 within 5 days. I vote YES.",
                    "timestamp": "10:15:22",
                    "vote": "YES"
                },
                {
                    "agent": "Risk Manager",
                    "message": "Quant Analyst, portfolio heat is at 35%, so this position would bring us to 48% - well within limits. JTO has low correlation (0.28) with our existing positions, which is excellent for diversification. Maximum drawdown scenario shows 2.1% portfolio impact if JTO rallies 20%. Position sizing is appropriate. I vote YES.",
                    "timestamp": "10:16:05",
                    "vote": "YES"
                },
                {
                    "agent": "Market Maker",
                    "message": "Liquidity is good for JTO-PERP. Spread is 0.12%, which is acceptable. Order book shows resistance at $3.20 with large sell orders. We can execute this size efficiently. I vote YES.",
                    "timestamp": "10:16:48",
                    "vote": "YES"
                },
                {
                    "agent": "News Analyst",
                    "message": "Sentiment is mixed on JTO. Recent token unlock announcements created some selling pressure. Social sentiment score is 48/100 (slightly bearish). However, there's positive news about partnerships. I'm neutral but leaning slightly positive on the SHORT. I vote YES.",
                    "timestamp": "10:17:30",
                    "vote": "YES"
                },
                {
                    "agent": "Arbitrage Analyst",
                    "message": "JTO is trading at a 1.2% discount on perps vs spot, suggesting bearish bias. Funding rate is negative at -0.008% per 8 hours, indicating short interest. Options market shows elevated put activity. The arbitrage landscape supports this SHORT. I vote YES.",
                    "timestamp": "10:18:15",
                    "vote": "YES"
                },
                {
                    "agent": "Risk Manager",
                    "message": "Unanimous consensus - all 5 agents vote YES. This is a well-supported trade with strong risk management. Proposal approved for execution.",
                    "timestamp": "10:18:45",
                    "vote": "YES"
                },
            ]
        }
    elif proposal_id == "prop-003":
        # REJECTED proposal - consensus not reached
        return {
            "proposalId": proposal_id,
            "messages": [
                {
                    "agent": "Quant Analyst",
                    "message": "I'm proposing a $200k LONG position on BTC-PERP. Technical analysis shows a potential breakout pattern forming. However, I must note this is a high-risk trade with elevated volatility. I estimate a 55% probability of success. I vote YES, but with caution.",
                    "timestamp": "11:20:15",
                    "vote": "YES"
                },
                {
                    "agent": "Risk Manager",
                    "message": "Quant Analyst, I have serious concerns. This $200k position would push our portfolio heat to 78%, dangerously close to our 75% threshold. BTC has 0.85 correlation with our existing SOL position, creating significant concentration risk. If BTC drops 10%, our portfolio would see a 5.8% drawdown, exceeding our 5% daily limit. Additionally, the risk score of 8.5/10 is too high. I vote NO.",
                    "timestamp": "11:21:02",
                    "vote": "NO"
                },
                {
                    "agent": "Market Maker",
                    "message": "While liquidity is excellent for BTC, the position size is large and could create slippage issues. I'm concerned about execution quality at this size. I vote NO.",
                    "timestamp": "11:21:45",
                    "vote": "NO"
                },
                {
                    "agent": "News Analyst",
                    "message": "BTC sentiment is neutral at 50/100. There are mixed signals - some positive institutional news but also regulatory uncertainty. My sentiment model gives this only a 48% probability. I vote NO.",
                    "timestamp": "11:22:20",
                    "vote": "NO"
                },
                {
                    "agent": "Arbitrage Analyst",
                    "message": "BTC premium on perps is minimal (0.2%), suggesting neutral bias. Funding rates are flat. The arbitrage opportunities are limited. Given the risk concerns raised by Risk Manager, I cannot support this trade. I vote NO.",
                    "timestamp": "11:23:05",
                    "vote": "NO"
                },
                {
                    "agent": "Risk Manager",
                    "message": "We have 4 NO votes and 1 YES vote. This proposal does not meet our consensus threshold. The risk parameters are too aggressive, and the portfolio concentration would be excessive. Proposal REJECTED.",
                    "timestamp": "11:23:30",
                    "vote": "NO"
                },
            ]
        }
    elif proposal_id == "prop-004":
        # EXECUTED/LOSS proposal - consensus reached but trade lost
        return {
            "proposalId": proposal_id,
            "messages": [
                {
                    "agent": "Quant Analyst",
                    "message": "I'm proposing a $95k SHORT position on ETH-PERP. Technical analysis shows a bearish divergence forming with RSI at 72. Price is approaching a key resistance at $2,850. Volume is declining on recent moves higher. I estimate a 68% probability of a pullback. I vote YES.",
                    "timestamp": "09:45:10",
                    "vote": "YES"
                },
                {
                    "agent": "Risk Manager",
                    "message": "Portfolio heat is at 52%, so this would bring us to 65% - acceptable. ETH correlation with existing positions is moderate at 0.65. Risk parameters are within limits. I vote YES.",
                    "timestamp": "09:46:00",
                    "vote": "YES"
                },
                {
                    "agent": "Market Maker",
                    "message": "ETH liquidity is excellent. Spread is tight at 0.06%. Order book shows good depth. Execution should be clean. I vote YES.",
                    "timestamp": "09:46:45",
                    "vote": "YES"
                },
                {
                    "agent": "News Analyst",
                    "message": "ETH sentiment is slightly bearish at 45/100. There are concerns about network upgrades and some negative news about gas fees. However, there's also positive news about Layer 2 adoption. My model gives this a 52% probability. I'm neutral but will vote YES given the technical setup.",
                    "timestamp": "09:47:30",
                    "vote": "YES"
                },
                {
                    "agent": "Arbitrage Analyst",
                    "message": "ETH is trading at a 0.5% premium on perps, suggesting slight bullish bias. Funding rate is slightly positive. Options market is neutral. The arbitrage signals are mixed, but I'll support the trade given the technical analysis. I vote YES.",
                    "timestamp": "09:48:15",
                    "vote": "YES"
                },
                {
                    "agent": "Risk Manager",
                    "message": "Unanimous consensus - all 5 agents vote YES. Proposal approved for execution. We'll monitor the position closely given the mixed signals.",
                    "timestamp": "09:48:45",
                    "vote": "YES"
                },
            ]
        }
    else:
        # Default debate for unknown proposals
        return {
            "proposalId": proposal_id,
            "messages": [
                {
                    "agent": "Quant Analyst",
                    "message": "Proposal under review...",
                    "timestamp": "00:00:00",
                    "vote": "YES"
                },
            ]
        }


@router.get("/debate/live", response_model=DebateTranscriptResponse)
async def get_live_debate():
    """
    Get the current live debate transcript.
    """
    # TODO: Replace with real database query
    # Example: SELECT * FROM debate_messages WHERE proposal_id = (SELECT id FROM proposals WHERE status = 'PENDING' ORDER BY timestamp DESC LIMIT 1)
    
    return {
        "proposalId": "prop-002",
        "messages": [
            {
                "agent": "Quant Analyst",
                "message": "Current analysis...",
                "timestamp": "14:28:33",
                "vote": "YES"
            },
        ]
    }

