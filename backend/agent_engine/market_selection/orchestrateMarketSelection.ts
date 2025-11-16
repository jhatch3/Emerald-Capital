/**
 * Market Selection Orchestrator
 * Main pipeline: Fetch markets → Select best → Enrich → Return for agent analysis
 */

import { fetchAllPolymarketMarkets, fetchMarketByConditionId, PolymarketMarket } from './polymarket';
import { selectBestMarkets, SelectedMarket } from './MarketSelectorAgent';
import { enrichMarketData, EnrichedMarketData } from './DataEnrichmentAgent';
import { transformPolymarketToAgentFormat } from './transformers';
import { MarketData, AgentData } from '../agents/baseAgent';

export interface MarketSelectionResult {
  market: MarketData;
  data: AgentData;
  enriched: EnrichedMarketData;
  selected: SelectedMarket;
  polymarket: PolymarketMarket;
}

/**
 * Run the complete market selection pipeline
 * Returns the best market ready for agent analysis
 */
export async function runMarketSelection(
  topN: number = 1
): Promise<MarketSelectionResult[]> {
  try {
    console.log('[MarketSelection] Starting pipeline...');
    
    // Step 1: Fetch all Polymarket markets
    console.log('[MarketSelection] Step 1: Fetching Polymarket markets...');
    const allMarkets = await fetchAllPolymarketMarkets();
    
    if (allMarkets.length === 0) {
      throw new Error('No active markets found on Polymarket');
    }

    // Step 2: Use Gemini to select best markets
    console.log('[MarketSelection] Step 2: Selecting best markets with AI...');
    const selectedMarkets = await selectBestMarkets(allMarkets, topN);
    
    if (selectedMarkets.length === 0) {
      throw new Error('No markets selected by AI selector');
    }

    // Step 3: Enrich each selected market
    console.log('[MarketSelection] Step 3: Enriching market data...');
    const results: MarketSelectionResult[] = [];

    for (const selected of selectedMarkets) {
      // Fetch full market data
      const fullMarket = await fetchMarketByConditionId(selected.condition_id);
      
      if (!fullMarket) {
        console.warn(`[MarketSelection] Market ${selected.condition_id} not found, skipping`);
        continue;
      }

      // Enrich with external research
      const enriched = await enrichMarketData(selected, fullMarket);

      // Transform to agent format
      const { market, data } = transformPolymarketToAgentFormat(enriched, fullMarket);

      results.push({
        market,
        data,
        enriched,
        selected,
        polymarket: fullMarket,
      });
    }

    console.log(`[MarketSelection] Pipeline complete. Prepared ${results.length} market(s) for agent analysis`);
    
    return results;
  } catch (error) {
    console.error('[MarketSelection] Error in pipeline:', error);
    throw error;
  }
}

/**
 * Run market selection and return only the best market
 */
export async function selectAndEnrichBestMarket(): Promise<MarketSelectionResult | null> {
  const results = await runMarketSelection(1);
  return results.length > 0 ? results[0] : null;
}

