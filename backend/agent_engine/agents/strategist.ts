import { BaseAgent, MarketData, AgentData, AgentDecision } from './baseAgent';

/**
 * Strategist Agent
 * Focuses on market structure, incentives, and inefficiencies
 * Analyzes market mechanics and strategic opportunities
 */
export class StrategistAgent extends BaseAgent {
  constructor() {
    super(
      'StrategistAgent',
      `You are a Market Strategist specializing in market structure, incentives, and inefficiencies for cryptocurrency trading decisions.

Your approach:
- Analyze market structure and mechanics
- Identify arbitrage opportunities and inefficiencies
- Consider incentive structures and game theory
- Evaluate market maker behavior and order flow
- Look for structural advantages and edge cases
- Consider cross-market opportunities
- Analyze funding rates, basis, and derivatives pricing
- Identify market manipulation patterns
- Evaluate strategic positioning and timing

You must return a JSON object with:
- direction: "YES" or "NO" (whether market structure supports the position)
- confidence: number 0-100 (confidence in strategic analysis)
- size: number (position size in USD, 0 if direction is NO)
- reasoning: string (your strategic reasoning based on market structure and incentives)`
    );
  }

  protected buildPrompt(market: MarketData, data: AgentData): string {
    const marketInfo = `Market Structure Data:
- Symbol: ${market.symbol}
- Current Price: $${market.price}
${market.volume24h ? `- 24h Volume: $${market.volume24h.toLocaleString()}` : ''}
${market.marketCap ? `- Market Cap: $${market.marketCap.toLocaleString()}` : ''}`;

    const volumeAnalysis = data.historicalData && data.historicalData.length >= 5
      ? `Volume Analysis:
- Recent Volume Trend: ${this.analyzeVolumeTrend(data.historicalData)}
- Volume Profile: ${this.analyzeVolumeProfile(data.historicalData)}`
      : '';

    const portfolioInfo = data.portfolio
      ? `Current Portfolio:
- Total Value: $${data.portfolio.totalValue.toLocaleString()}
- Existing Positions: ${data.portfolio.positions.map(p => p.symbol).join(', ') || 'None'}`
      : '';

    return `${this.persona}

${marketInfo}

${volumeAnalysis}

${portfolioInfo}

Based on your strategic analysis approach, evaluate this trading opportunity. Consider:
1. Market structure and mechanics
2. Arbitrage opportunities and pricing inefficiencies
3. Incentive structures and game theory
4. Order flow and market maker behavior
5. Cross-market opportunities
6. Strategic timing and positioning
7. Funding rates and derivatives pricing (if applicable)

Return your decision as JSON with direction, confidence, size, and reasoning. Your reasoning must be EXACTLY 4 sentences, each providing a distinct strategic analysis point supporting your decision. Focus on market structure and strategic advantages.`;
  }

  private analyzeVolumeTrend(data: Array<{ date: string; price: number; volume: number }>): string {
    if (data.length < 2) return 'Insufficient data';
    const recent = data.slice(-3);
    const avgRecent = recent.reduce((sum, d) => sum + d.volume, 0) / recent.length;
    const earlier = data.slice(-6, -3);
    const avgEarlier = earlier.length > 0 ? earlier.reduce((sum, d) => sum + d.volume, 0) / earlier.length : avgRecent;
    
    if (avgRecent > avgEarlier * 1.2) return 'Increasing (bullish structure)';
    if (avgRecent < avgEarlier * 0.8) return 'Decreasing (bearish structure)';
    return 'Stable';
  }

  private analyzeVolumeProfile(data: Array<{ date: string; price: number; volume: number }>): string {
    if (data.length === 0) return 'No data';
    const volumes = data.map(d => d.volume);
    const maxVol = Math.max(...volumes);
    const minVol = Math.min(...volumes);
    const avgVol = volumes.reduce((a, b) => a + b, 0) / volumes.length;
    
    if (maxVol / avgVol > 2) return 'High volatility (opportunities present)';
    if (minVol / avgVol < 0.5) return 'Low liquidity periods (risk)';
    return 'Normal distribution';
  }
}

