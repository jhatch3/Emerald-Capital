/**
 * Trade Logger Service
 * Logs trade signals and execution status to Snowflake trade_signals table
 */

import { execute } from '../../database/snowflake';

/**
 * Create a new trade signal record
 * @param decisionId The decision ID this trade signal is based on
 * @param marketId The market ID
 * @param signal Trade signal: BUY, SELL, or SKIP
 * @param sizeUsd Position size in USD
 * @returns Promise resolving to the created trade signal ID (UUID)
 */
export async function createTradeSignal(
  decisionId: string,
  marketId: string,
  signal: 'BUY' | 'SELL' | 'SKIP',
  sizeUsd: number
): Promise<string> {
  const id = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  
  const query = `
    INSERT INTO trade_signals (
      id,
      decision_id,
      market_id,
      signal,
      size_usd,
      status
    ) VALUES (?, ?, ?, ?, ?, ?)
  `;

  const binds = [
    id,
    decisionId,
    marketId,
    signal,
    sizeUsd,
    'PENDING', // Initial status
  ];

  try {
    await execute(query, binds);
    console.log(`[Snowflake] Trade signal created: ${id} (${signal}, $${sizeUsd})`);
    return id;
  } catch (error) {
    console.error('[Snowflake] Error creating trade signal:', error);
    throw error;
  }
}

/**
 * Update trade execution status with Solana transaction hash
 * @param tradeId The trade signal ID to update
 * @param solanaTxHash Solana transaction hash (if executed)
 * @param status New status: PENDING, EXECUTED, or FAILED
 * @param executionReasoning Optional reasoning for the execution status
 */
export async function updateTradeExecution(
  tradeId: string,
  solanaTxHash: string | null,
  status: 'PENDING' | 'EXECUTED' | 'FAILED',
  executionReasoning?: string
): Promise<void> {
  const query = `
    UPDATE trade_signals
    SET 
      solana_tx_hash = ?,
      status = ?,
      execution_reasoning = ?
    WHERE id = ?
  `;

  const binds = [
    solanaTxHash || null,
    status,
    executionReasoning || null,
    tradeId,
  ];

  try {
    await execute(query, binds);
    console.log(`[Snowflake] Trade execution updated: ${tradeId} -> ${status}`);
  } catch (error) {
    console.error('[Snowflake] Error updating trade execution:', error);
    throw error;
  }
}

