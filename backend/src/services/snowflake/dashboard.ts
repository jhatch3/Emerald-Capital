/**
 * Dashboard Query Service
 * Provides read-only queries for dashboard display
 */

import { execute } from '../../database/snowflake';
import { DecisionRecord, TradeSignalRecord, MarketSnapshotRecord } from '../../types/snowflake';

/**
 * Get the latest decisions
 * @param limit Maximum number of decisions to return (default: 20)
 * @returns Array of decision records
 */
export async function getLatestDecisions(limit: number = 20): Promise<DecisionRecord[]> {
  const query = `
    SELECT 
      id,
      created_at,
      market_id,
      market_question,
      final_direction,
      final_size,
      agent_outputs,
      consensus_reasoning,
      raw_market_data
    FROM decisions
    ORDER BY created_at DESC
    LIMIT ?
  `;

  try {
    const rows = await execute(query, [limit]);
    console.log(`[Snowflake] Retrieved ${rows.length} latest decisions`);
    return rows.map((row: any) => ({
      id: row.ID,
      created_at: row.CREATED_AT,
      market_id: row.MARKET_ID,
      market_question: row.MARKET_QUESTION,
      final_direction: row.FINAL_DIRECTION,
      final_size: row.FINAL_SIZE,
      agent_outputs: typeof row.AGENT_OUTPUTS === 'string' 
        ? JSON.parse(row.AGENT_OUTPUTS) 
        : row.AGENT_OUTPUTS,
      consensus_reasoning: row.CONSENSUS_REASONING,
      raw_market_data: typeof row.RAW_MARKET_DATA === 'string'
        ? JSON.parse(row.RAW_MARKET_DATA)
        : row.RAW_MARKET_DATA,
    }));
  } catch (error) {
    console.error('[Snowflake] Error fetching latest decisions:', error);
    throw error;
  }
}

/**
 * Get trades by status
 * @param status Trade status: PENDING, EXECUTED, or FAILED
 * @returns Array of trade signal records
 */
export async function getTradesByStatus(status: 'PENDING' | 'EXECUTED' | 'FAILED'): Promise<TradeSignalRecord[]> {
  const query = `
    SELECT 
      id,
      created_at,
      decision_id,
      market_id,
      signal,
      size_usd,
      solana_tx_hash,
      status,
      execution_reasoning
    FROM trade_signals
    WHERE status = ?
    ORDER BY created_at DESC
  `;

  try {
    const rows = await execute(query, [status]);
    console.log(`[Snowflake] Retrieved ${rows.length} trades with status: ${status}`);
    return rows.map((row: any) => ({
      id: row.ID,
      created_at: row.CREATED_AT,
      decision_id: row.DECISION_ID,
      market_id: row.MARKET_ID,
      signal: row.SIGNAL,
      size_usd: row.SIZE_USD,
      solana_tx_hash: row.SOLANA_TX_HASH,
      status: row.STATUS,
      execution_reasoning: row.EXECUTION_REASONING,
    }));
  } catch (error) {
    console.error('[Snowflake] Error fetching trades by status:', error);
    throw error;
  }
}

/**
 * Get market history for a specific market
 * @param marketId The market ID to query
 * @returns Array of market snapshot records
 */
export async function getMarketHistory(marketId: string): Promise<MarketSnapshotRecord[]> {
  const query = `
    SELECT 
      id,
      created_at,
      market_id,
      source,
      snapshot
    FROM market_snapshots
    WHERE market_id = ?
    ORDER BY created_at DESC
  `;

  try {
    const rows = await execute(query, [marketId]);
    console.log(`[Snowflake] Retrieved ${rows.length} snapshots for market: ${marketId}`);
    return rows.map((row: any) => ({
      id: row.ID,
      created_at: row.CREATED_AT,
      market_id: row.MARKET_ID,
      source: row.SOURCE,
      snapshot: typeof row.SNAPSHOT === 'string'
        ? JSON.parse(row.SNAPSHOT)
        : row.SNAPSHOT,
    }));
  } catch (error) {
    console.error('[Snowflake] Error fetching market history:', error);
    throw error;
  }
}

