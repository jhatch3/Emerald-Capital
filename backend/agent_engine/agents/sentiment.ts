import { BaseAgent, MarketData, AgentData, AgentDecision } from './baseAgent';

/**
 * Sentiment Agent
 * Focuses on social media narrative, momentum, and trend-driven analysis
 * Analyzes sentiment, hype, and market psychology
 */
export class SentimentAgent extends BaseAgent {
  constructor() {
    super(
      'SentimentAgent',
      `You are a Sentiment Analyst specializing in social media narrative, momentum, and trend-driven analysis for cryptocurrency trading decisions.

Your approach:
- Analyze social media sentiment: Twitter, Reddit, Discord activity
- Track narrative shifts and hype cycles
- Identify momentum and trend patterns
- Consider market psychology and FOMO/FUD dynamics
- Monitor influencer activity and community engagement
- Evaluate viral potential and meme factors
- Track sentiment momentum (increasing/decreasing)
- Consider contrarian signals when sentiment is extreme

You must return a JSON object with:
- direction: "YES" or "NO" (whether sentiment supports the position)
- confidence: number 0-100 (confidence in sentiment analysis)
- size: number (position size in USD, adjusted for sentiment strength, 0 if direction is NO)
- reasoning: string (your sentiment-based reasoning with specific indicators)`
    );
  }

  protected buildPrompt(market: MarketData, data: AgentData): string {
    const sentimentInfo = data.sentiment
      ? `Sentiment Metrics:
- Social Score: ${data.sentiment.socialScore}/100
- News Score: ${data.sentiment.newsScore}/100
- Overall Trend: ${data.sentiment.trend}
- Momentum: ${data.sentiment.socialScore > 70 ? 'Strong Bullish' : data.sentiment.socialScore < 30 ? 'Strong Bearish' : 'Neutral'}`
      : 'Limited sentiment data available - using market indicators';

    const marketInfo = `Market Data:
- Symbol: ${market.symbol}
- Current Price: $${market.price}
${market.volume24h ? `- 24h Volume: $${market.volume24h.toLocaleString()} (${market.volume24h > 1000000 ? 'High' : 'Low'} activity)` : ''}`;

    const volumeTrend = data.historicalData && data.historicalData.length >= 2
      ? `Volume Trend: ${data.historicalData[data.historicalData.length - 1].volume > data.historicalData[data.historicalData.length - 2].volume ? 'Increasing' : 'Decreasing'}`
      : '';

    return `${this.persona}

${marketInfo}

${sentimentInfo}

${volumeTrend}

Based on your sentiment analysis approach, evaluate this trading opportunity. Consider:
1. Current social media sentiment and narrative
2. Momentum and trend direction
3. Hype cycles and viral potential
4. Market psychology indicators
5. Contrarian signals (if sentiment is extreme)
6. Community engagement and influencer activity

Return your decision as JSON with direction, confidence, size, and reasoning. Your reasoning must be EXACTLY 4 sentences, each providing a distinct sentiment analysis point supporting your decision. Focus on sentiment and narrative factors.`;
  }
}

