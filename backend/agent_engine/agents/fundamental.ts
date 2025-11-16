import { BaseAgent, MarketData, AgentData, AgentDecision } from './baseAgent';

/**
 * Fundamental Agent
 * Focuses on logical, factual, event-based reasoning
 * Analyzes fundamentals, news, events, and long-term value
 */
export class FundamentalAgent extends BaseAgent {
  constructor() {
    super(
      'FundamentalAgent',
      `You are a Fundamental Analyst specializing in logical, factual, and event-based reasoning for cryptocurrency trading decisions.

Your approach:
- Focus on fundamental value, real-world utility, and adoption metrics
- Analyze news events, partnerships, protocol upgrades, and ecosystem developments
- Consider tokenomics, supply dynamics, and long-term sustainability
- Evaluate market fundamentals: user growth, transaction volume, developer activity
- Ignore short-term price movements and technical indicators
- Base decisions on factual information and logical analysis

You must return a JSON object with:
- direction: "YES" or "NO" (whether to take the position)
- confidence: number 0-100 (your confidence level)
- size: number (position size in USD, 0 if direction is NO)
- reasoning: string (your logical reasoning based on fundamentals)`
    );
  }

  protected buildPrompt(market: MarketData, data: AgentData): string {
    const portfolioInfo = data.portfolio
      ? `Current Portfolio:
- Total Value: $${data.portfolio.totalValue.toLocaleString()}
- Portfolio Heat: ${data.portfolio.heat}%
- Current Positions: ${data.portfolio.positions.length}
${data.portfolio.positions.map(p => `  - ${p.symbol}: $${p.size.toLocaleString()} (PnL: ${p.pnl > 0 ? '+' : ''}${p.pnl.toFixed(2)}%)`).join('\n')}`
      : 'No portfolio data available';

    const marketInfo = `Market Opportunity:
- Symbol: ${market.symbol}
- Current Price: $${market.price}
${market.marketCap ? `- Market Cap: $${market.marketCap.toLocaleString()}` : ''}
${market.volume24h ? `- 24h Volume: $${market.volume24h.toLocaleString()}` : ''}`;

    const sentimentInfo = data.sentiment
      ? `Sentiment Data:
- Social Score: ${data.sentiment.socialScore}/100
- News Score: ${data.sentiment.newsScore}/100
- Trend: ${data.sentiment.trend}`
      : 'No sentiment data available';

    return `${this.persona}

${marketInfo}

${portfolioInfo}

${sentimentInfo}

${data.marketData ? `Additional Market Data: ${JSON.stringify(data.marketData, null, 2)}` : ''}

Based on your fundamental analysis approach, evaluate this trading opportunity. Consider:
1. Fundamental value and utility
2. Recent news and events
3. Ecosystem developments
4. Long-term sustainability
5. Market fundamentals

Return your decision as JSON with direction, confidence, size, and reasoning. Your reasoning must be EXACTLY 4 sentences, each providing a distinct fundamental analysis point supporting your decision.`;
  }
}

