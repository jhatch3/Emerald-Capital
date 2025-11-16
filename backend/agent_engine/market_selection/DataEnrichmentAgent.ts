/**
 * Data Enrichment Agent
 * Uses Gemini to research and enrich market data with external information
 */

import { generateJSON } from '../services/gemini';
import { PolymarketMarket } from './polymarket';
import { SelectedMarket } from './MarketSelectorAgent';

export interface EnrichedMarketData {
  market_id: string;
  question: string;
  condition_id: string;
  key_facts: string[];
  recent_events: string[];
  historical_context: string[];
  relevant_links: string[];
  sentiment_indicators: {
    bullish: number;
    bearish: number;
    neutral: number;
  };
  price_drivers: string[];
  datasets: {
    [key: string]: any;
  };
}

/**
 * Enrich a selected market with external research and context
 */
export async function enrichMarketData(
  market: SelectedMarket,
  fullMarketData: PolymarketMarket
): Promise<EnrichedMarketData> {
  try {
    const prompt = `You are a research analyst. Conduct comprehensive research on this Polymarket market and provide enriched data for trading analysis.

MARKET INFORMATION:
Question: ${market.market_question}
Condition ID: ${market.condition_id}
Current Prices: ${JSON.stringify(fullMarketData.outcomes || [])}
Volume: ${fullMarketData.volume || fullMarketData.total_volume || 0}
Liquidity: ${fullMarketData.liquidity || fullMarketData.total_liquidity || 0}
End Date: ${fullMarketData.end_date_iso || fullMarketData.endDate}
Active: ${fullMarketData.active}
Closed: ${fullMarketData.closed}

RESEARCH TASKS:
1. Identify key facts and data points relevant to this market
2. Find recent news, events, or developments that could affect the outcome
3. Provide historical context (similar past events, patterns)
4. Suggest relevant data sources, links, or APIs to monitor
5. Assess sentiment indicators (bullish/bearish/neutral)
6. Identify key price drivers and factors

Return a JSON object in this exact format:
{
  "market_id": "${market.market_id}",
  "question": "${market.market_question}",
  "condition_id": "${market.condition_id}",
  "key_facts": ["fact 1", "fact 2", ...],
  "recent_events": ["event 1", "event 2", ...],
  "historical_context": ["context 1", "context 2", ...],
  "relevant_links": ["url1", "url2", ...],
  "sentiment_indicators": {
    "bullish": 0.6,
    "bearish": 0.2,
    "neutral": 0.2
  },
  "price_drivers": ["driver 1", "driver 2", ...],
  "datasets": {
    "suggested_apis": ["api1", "api2"],
    "monitoring_keywords": ["keyword1", "keyword2"]
  }
}

IMPORTANT:
- Return ONLY valid JSON, no text before or after
- Be specific and actionable
- Focus on data that can inform trading decisions
- sentiment_indicators should sum to 1.0
- Include real, verifiable facts and events`;

    const response = await generateJSON(prompt, 'google/gemini-2.0-flash-lite-001');
    
    // Validate response structure
    const enriched = response as EnrichedMarketData;
    
    if (!enriched.market_id || !enriched.question || !enriched.key_facts) {
      throw new Error('Invalid enriched market data format');
    }

    // Ensure arrays exist
    enriched.key_facts = enriched.key_facts || [];
    enriched.recent_events = enriched.recent_events || [];
    enriched.historical_context = enriched.historical_context || [];
    enriched.relevant_links = enriched.relevant_links || [];
    enriched.price_drivers = enriched.price_drivers || [];
    enriched.datasets = enriched.datasets || {};

    // Normalize sentiment indicators
    if (enriched.sentiment_indicators) {
      const total = enriched.sentiment_indicators.bullish + 
                    enriched.sentiment_indicators.bearish + 
                    enriched.sentiment_indicators.neutral;
      if (total > 0) {
        enriched.sentiment_indicators.bullish /= total;
        enriched.sentiment_indicators.bearish /= total;
        enriched.sentiment_indicators.neutral /= total;
      }
    } else {
      enriched.sentiment_indicators = { bullish: 0.33, bearish: 0.33, neutral: 0.34 };
    }

    console.log(`[DataEnricher] Enriched market: ${enriched.question.substring(0, 50)}...`);
    console.log(`[DataEnricher] Found ${enriched.key_facts.length} key facts, ${enriched.recent_events.length} events`);
    
    return enriched;
  } catch (error) {
    console.error('[DataEnricher] Error enriching market data:', error);
    throw error;
  }
}

