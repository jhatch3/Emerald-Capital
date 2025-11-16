import { BaseAgent, MarketData, AgentData, AgentDecision } from './baseAgent';

/**
 * Quant Agent
 * Focuses on probability, statistics, and numerical features only
 * Uses mathematical models and statistical analysis
 */
export class QuantAgent extends BaseAgent {
  constructor() {
    super(
      'QuantAgent',
      `You are a Quantitative Analyst specializing in probability, statistics, and numerical analysis for cryptocurrency trading decisions.

Your approach:
- Use ONLY numerical data: prices, volumes, returns, volatility, correlations
- Apply statistical models: mean reversion, momentum, volatility clustering
- Calculate probabilities and expected values
- Ignore news, sentiment, and qualitative information
- Focus on mathematical patterns and statistical significance
- Use technical indicators: RSI, MACD, Bollinger Bands, moving averages
- Analyze volume profiles, order flow, and market microstructure
- Consider risk-adjusted returns and Sharpe ratios

You must return a JSON object with:
- direction: "YES" or "NO" (whether to take the position based on statistical analysis)
- confidence: number 0-100 (statistical confidence level)
- size: number (position size in USD based on Kelly criterion or similar, 0 if direction is NO)
- reasoning: string (your quantitative reasoning with numbers and statistics)`
    );
  }

  protected buildPrompt(market: MarketData, data: AgentData): string {
    const historicalData = data.historicalData
      ? `Historical Price Data (last ${data.historicalData.length} periods):
${data.historicalData.slice(-20).map(d => `  ${d.date}: Price=$${d.price}, Volume=$${d.volume.toLocaleString()}`).join('\n')}

Statistical Metrics:
- Mean Price: $${(data.historicalData.reduce((sum, d) => sum + d.price, 0) / data.historicalData.length).toFixed(2)}
- Price Volatility: ${this.calculateVolatility(data.historicalData.map(d => d.price)).toFixed(4)}
- Average Volume: $${(data.historicalData.reduce((sum, d) => sum + d.volume, 0) / data.historicalData.length).toLocaleString()}`
      : 'No historical data available';

    const portfolioInfo = data.portfolio
      ? `Portfolio Metrics:
- Total Value: $${data.portfolio.totalValue.toLocaleString()}
- Portfolio Heat: ${data.portfolio.heat}%
- Correlation with existing positions: ${this.calculateCorrelation(market, data.portfolio.positions)}`
      : 'No portfolio data available';

    return `${this.persona}

Market Data:
- Symbol: ${market.symbol}
- Current Price: $${market.price}
${market.volume24h ? `- 24h Volume: $${market.volume24h.toLocaleString()}` : ''}
${market.marketCap ? `- Market Cap: $${market.marketCap.toLocaleString()}` : ''}

${historicalData}

${portfolioInfo}

Based on your quantitative analysis approach, evaluate this trading opportunity using ONLY numerical data and statistical methods. Calculate:
1. Expected return and volatility
2. Risk-adjusted metrics
3. Statistical significance
4. Optimal position sizing
5. Correlation with existing portfolio

Return your decision as JSON with direction, confidence, size, and reasoning. Your reasoning must be EXACTLY 4 sentences, each providing a distinct quantitative analysis point with specific numbers and calculations supporting your decision.`;
  }

  private calculateVolatility(prices: number[]): number {
    if (prices.length < 2) return 0;
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
    return Math.sqrt(variance);
  }

  private calculateCorrelation(market: MarketData, positions: Array<{ symbol: string; size: number; pnl: number }>): string {
    // Simplified correlation - in production, use actual price correlation data
    if (positions.length === 0) return 'N/A';
    const sameAsset = positions.find(p => p.symbol === market.symbol);
    if (sameAsset) return 'High (same asset)';
    return 'Medium';
  }
}

