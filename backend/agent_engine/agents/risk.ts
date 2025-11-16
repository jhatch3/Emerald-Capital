import { BaseAgent, MarketData, AgentData, AgentDecision } from './baseAgent';

/**
 * Risk Agent
 * Conservative, tail-risk-aware, limits position size
 * Focuses on risk management and portfolio protection
 */
export class RiskAgent extends BaseAgent {
  constructor() {
    super(
      'RiskAgent',
      `You are a Risk Manager specializing in conservative, tail-risk-aware position sizing and portfolio protection for cryptocurrency trading decisions.

Your approach:
- PRIORITIZE capital preservation over returns
- Limit position sizes to manage portfolio heat
- Consider tail risks and black swan events
- Evaluate correlation with existing positions
- Set maximum drawdown limits
- Use conservative position sizing (typically 5-15% of portfolio per position)
- Reject high-risk opportunities even if profitable
- Consider liquidity and slippage risks
- Evaluate worst-case scenarios

You must return a JSON object with:
- direction: "YES" or "NO" (whether risk parameters allow this position)
- confidence: number 0-100 (confidence in risk assessment)
- size: number (CONSERVATIVE position size in USD, typically 5-15% of portfolio, 0 if direction is NO)
- reasoning: string (your risk-based reasoning with specific risk metrics)`
    );
  }

  protected buildPrompt(market: MarketData, data: AgentData): string {
    const portfolioInfo = data.portfolio
      ? `Current Portfolio Risk Metrics:
- Total Portfolio Value: $${data.portfolio.totalValue.toLocaleString()}
- Portfolio Heat: ${data.portfolio.heat}% ${data.portfolio.heat > 75 ? '(⚠️ HIGH - near limit)' : data.portfolio.heat > 50 ? '(⚠️ Moderate)' : '(✅ Low)'}
- Current Positions: ${data.portfolio.positions.length}
- Maximum Recommended Heat: 75%
${data.portfolio.positions.map(p => `  - ${p.symbol}: $${p.size.toLocaleString()} (${((p.size / data.portfolio!.totalValue) * 100).toFixed(1)}% of portfolio)`).join('\n')}

Risk Constraints:
- Maximum position size: ${Math.min(data.portfolio.totalValue * 0.15, data.portfolio.totalValue * (0.75 - data.portfolio.heat / 100))} USD (15% of portfolio or remaining heat capacity)
- Maximum portfolio heat: 75%`
      : 'No portfolio data - use conservative defaults (max 10% position size)';

    const marketInfo = `Market Opportunity:
- Symbol: ${market.symbol}
- Current Price: $${market.price}
${market.volume24h ? `- 24h Volume: $${market.volume24h.toLocaleString()} ${market.volume24h < 100000 ? '(⚠️ Low liquidity risk)' : ''}` : ''}
${market.marketCap ? `- Market Cap: $${market.marketCap.toLocaleString()}` : ''}`;

    const correlationRisk = data.portfolio && data.portfolio.positions.length > 0
      ? `Correlation Risk: ${data.portfolio.positions.some(p => p.symbol === market.symbol) ? 'HIGH - Already holding this asset' : 'Medium - Different asset'}`
      : '';

    return `${this.persona}

${marketInfo}

${portfolioInfo}

${correlationRisk}

Based on your risk management approach, evaluate this trading opportunity. Consider:
1. Portfolio heat and remaining capacity
2. Position size limits (conservative sizing)
3. Correlation with existing positions
4. Liquidity and slippage risks
5. Tail risk and worst-case scenarios
6. Maximum drawdown limits

IMPORTANT: Be conservative with position sizing. Reject if risk is too high, even if opportunity seems profitable.

Return your decision as JSON with direction, confidence, size, and reasoning. Your reasoning must be EXACTLY 4 sentences, each providing a distinct risk analysis point supporting your decision. Focus on risk metrics and capital preservation.`;
  }
}

