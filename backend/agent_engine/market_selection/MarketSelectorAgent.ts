/**
 * Market Selector Agent
 * Uses Gemini to analyze Polymarket markets and select the best opportunities
 */

import { generateJSON } from '../services/gemini';
import { PolymarketMarket } from './polymarket';

export interface SelectedMarket {
  market_id: string;
  market_question: string;
  condition_id: string;
  reasoning: string;
  confidence: number;
  expected_value?: number;
  liquidity_score?: number;
}

/**
 * Select the best market(s) from a list of Polymarket markets
 * Uses Gemini to analyze and rank markets
 */
export async function selectBestMarkets(
  markets: PolymarketMarket[],
  topN: number = 1
): Promise<SelectedMarket[]> {
  try {
    // Prepare market summary for Gemini (limit to top 50 by volume for efficiency)
    const sortedMarkets = [...markets]
      .sort((a, b) => (b.volume || 0) - (a.volume || 0))
      .slice(0, 50);
    
    const marketSummary = sortedMarkets.map(market => ({
      question: market.question,
      conditionId: market.condition_id || market.conditionId,
      slug: market.market_slug || market.slug,
      volume: market.volume || market.total_volume || 0,
      liquidity: market.liquidity || market.total_liquidity || 0,
      endDate: market.end_date_iso || market.endDate,
      active: market.active,
      closed: market.closed,
      outcomes: market.outcomes?.map(o => ({
        name: o.name,
        price: o.price,
      })),
    }));

    const prompt = `You are a professional prediction market analyst. Analyze the following Polymarket markets and select the ${topN} best trading opportunity.

CRITERIA FOR SELECTION:
1. Information Edge: Can we find data/insights others might miss?
2. Liquidity: High volume and liquidity for sizeable positions
3. Time Horizon: Reasonable time to resolution (not too soon, not too far)
4. Market Clarity: Well-defined resolution criteria
5. Expected Value: Positive expected value based on current prices
6. Market Inefficiency: Price seems mispriced relative to fundamentals

MARKETS TO ANALYZE:
${JSON.stringify(marketSummary, null, 2)}

Return a JSON array of exactly ${topN} selected market(s) in this format:
[
  {
    "market_id": "condition_id_or_slug",
    "market_question": "full question text",
    "condition_id": "condition_id",
    "reasoning": "detailed explanation of why this market is attractive",
    "confidence": 0.85,
    "expected_value": 0.15,
    "liquidity_score": 0.8
  }
]

IMPORTANT: 
- Return ONLY valid JSON, no text before or after
- Select markets with the highest expected value and information edge
- Prioritize markets where you can find external data to inform the decision
- confidence should be 0-1 (how confident you are this is a good opportunity)
- expected_value should be 0-1 (estimated edge)
- liquidity_score should be 0-1 (how liquid/tradeable)`;

    const response = await generateJSON(prompt, 'google/gemini-2.0-flash-lite-001');
    
    // Validate response
    if (!Array.isArray(response)) {
      throw new Error('Market selector response must be an array');
    }

    const selected = response as SelectedMarket[];
    
    // Validate each selected market
    for (const market of selected) {
      if (!market.market_id || !market.market_question || !market.condition_id) {
        throw new Error('Invalid market selection format');
      }
    }

    console.log(`[MarketSelector] Selected ${selected.length} market(s) from ${markets.length} candidates`);
    
    return selected.slice(0, topN);
  } catch (error) {
    console.error('[MarketSelector] Error selecting markets:', error);
    throw error;
  }
}

