/**
 * Transformers
 * Convert Polymarket/Enriched data to format expected by agent system
 */

import { MarketData, AgentData } from '../agents/baseAgent';
import { EnrichedMarketData } from './DataEnrichmentAgent';
import { PolymarketMarket } from './polymarket';

/**
 * Transform enriched Polymarket market data into MarketData format
 */
export function transformToMarketData(
  enriched: EnrichedMarketData,
  polymarket: PolymarketMarket
): MarketData {
  // Calculate average price (for YES outcome typically)
  const yesOutcome = polymarket.outcomes?.find(o => 
    o.name.toLowerCase().includes('yes') || 
    o.name.toLowerCase().includes('true') ||
    o.price > 0.5
  );
  
  const avgPrice = yesOutcome?.price || 
                   (polymarket.outcomes?.[0]?.price || 0.5);

  return {
    symbol: enriched.condition_id,
    price: avgPrice,
    volume24h: polymarket.volume || polymarket.total_volume || 0,
    marketCap: polymarket.liquidity || polymarket.total_liquidity || 0,
    // Additional Polymarket-specific fields
    question: enriched.question,
    marketId: enriched.market_id,
    endDate: polymarket.end_date_iso || polymarket.endDate,
    outcomes: polymarket.outcomes,
  };
}

/**
 * Transform enriched market data into AgentData format
 */
export function transformToAgentData(
  enriched: EnrichedMarketData,
  polymarket: PolymarketMarket
): AgentData {
  // Calculate sentiment score from indicators
  const sentimentScore = enriched.sentiment_indicators.bullish - 
                         enriched.sentiment_indicators.bearish;
  
  let sentimentTrend: 'bullish' | 'bearish' | 'neutral' = 'neutral';
  if (sentimentScore > 0.2) sentimentTrend = 'bullish';
  else if (sentimentScore < -0.2) sentimentTrend = 'bearish';

  return {
    marketData: transformToMarketData(enriched, polymarket),
    sentiment: {
      socialScore: sentimentScore,
      newsScore: sentimentScore,
      trend: sentimentTrend,
    },
    // Include enriched research data
    keyFacts: enriched.key_facts,
    recentEvents: enriched.recent_events,
    historicalContext: enriched.historical_context,
    priceDrivers: enriched.price_drivers,
    relevantLinks: enriched.relevant_links,
    datasets: enriched.datasets,
    // Polymarket-specific metadata
    polymarket: {
      conditionId: enriched.condition_id,
      volume: polymarket.volume || polymarket.total_volume || 0,
      liquidity: polymarket.liquidity || polymarket.total_liquidity || 0,
      outcomes: polymarket.outcomes || [],
      active: polymarket.active,
      closed: polymarket.closed,
    },
  };
}

/**
 * Combine transformations into a single function
 */
export function transformPolymarketToAgentFormat(
  enriched: EnrichedMarketData,
  polymarket: PolymarketMarket
): { market: MarketData; data: AgentData } {
  return {
    market: transformToMarketData(enriched, polymarket),
    data: transformToAgentData(enriched, polymarket),
  };
}

