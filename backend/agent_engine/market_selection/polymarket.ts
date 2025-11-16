/**
 * Polymarket API client
 * Fetches active markets from Polymarket
 */

const POLYMARKET_API_URL = 'https://clob.polymarket.com/markets';

export interface PolymarketMarket {
  question: string;
  question_id: string;
  market_slug: string;
  condition_id: string;
  end_date_iso: string;
  active: boolean;
  closed: boolean;
  archived: boolean;
  accepting_orders: boolean;
  minimum_order_size: number;
  minimum_tick_size: number;
  description?: string;
  // Volume/liquidity might be in different fields or need to be fetched separately
  volume?: number;
  liquidity?: number;
  total_volume?: number;
  total_liquidity?: number;
  outcomes?: Array<{
    name: string;
    price: number;
    volume: number;
  }>;
  [key: string]: any;
}

/**
 * Fetch all active Polymarket markets
 */
export async function fetchAllPolymarketMarkets(): Promise<PolymarketMarket[]> {
  try {
    const response = await fetch(POLYMARKET_API_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Polymarket API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as any;
    
    // Debug: Log response structure
    console.log('[Polymarket] Response type:', typeof data, Array.isArray(data) ? '(array)' : '(object)');
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      console.log('[Polymarket] Response keys:', Object.keys(data).slice(0, 10));
    }
    
    // Handle different response formats
    let markets: PolymarketMarket[];
    if (Array.isArray(data)) {
      markets = data as PolymarketMarket[];
    } else if (data && typeof data === 'object') {
      // Check if response has a 'data' or 'markets' property
      if (Array.isArray(data.data)) {
        markets = data.data as PolymarketMarket[];
      } else if (Array.isArray(data.markets)) {
        markets = data.markets as PolymarketMarket[];
      } else if (Array.isArray(data.results)) {
        markets = data.results as PolymarketMarket[];
      } else {
        // Try to extract array from object values
        const values = Object.values(data);
        const foundArray = values.find(v => Array.isArray(v));
        markets = (foundArray as PolymarketMarket[]) || [];
      }
    } else {
      markets = [];
    }
    
    if (!Array.isArray(markets)) {
      console.error('[Polymarket] Unexpected response format:', typeof data, Object.keys(data || {}));
      throw new Error('Polymarket API returned unexpected format');
    }
    
    // Debug: Log first market structure
    if (markets.length > 0) {
      console.log('[Polymarket] Sample market keys:', Object.keys(markets[0]).slice(0, 15));
      console.log('[Polymarket] Sample market:', JSON.stringify(markets[0]).substring(0, 200));
    }
    
    // Filter for active markets - use actual Polymarket field names
    const activeMarkets = markets.filter(market => {
      if (!market || typeof market !== 'object') return false;
      
      // Use actual Polymarket API field names
      const endDate = market.end_date_iso || market.endDate || market.end_date;
      const isActive = market.active === true;
      const isNotArchived = market.archived !== true;
      const hasQuestion = market.question && market.question.length > 0;
      const hasConditionId = market.condition_id || market.conditionId;
      
      // Must be active, not archived, have a question, and valid end date
      const hasValidEndDate = endDate && new Date(endDate) > new Date();
      
      return isActive && isNotArchived && hasQuestion && hasConditionId && hasValidEndDate;
    });

    console.log(`[Polymarket] Fetched ${markets.length} total markets, ${activeMarkets.length} active`);
    
    // If no active markets with strict filter, try looser filter
    if (activeMarkets.length === 0 && markets.length > 0) {
      console.log('[Polymarket] No markets passed strict filter, trying looser criteria...');
      const looseActive = markets.filter(market => {
        if (!market || typeof market !== 'object') return false;
        // Just need a question and some basic structure
        return (market.question || market.question_id) && 
               (market.condition_id || market.conditionId) &&
               market.active === true;
      });
      console.log(`[Polymarket] Found ${looseActive.length} markets with loose criteria`);
      return looseActive.slice(0, 100); // Limit to top 100 for processing
    }
    
    return activeMarkets;
  } catch (error) {
    console.error('[Polymarket] Error fetching markets:', error);
    throw error;
  }
}

/**
 * Fetch a specific market by condition ID
 */
export async function fetchMarketByConditionId(conditionId: string): Promise<PolymarketMarket | null> {
  try {
    const markets = await fetchAllPolymarketMarkets();
    return markets.find(m => 
      (m.condition_id === conditionId) || 
      (m.conditionId === conditionId)
    ) || null;
  } catch (error) {
    console.error(`[Polymarket] Error fetching market ${conditionId}:`, error);
    return null;
  }
}

