/**
 * Decision Logger Service
 * Logs agent decisions to Snowflake decisions table
 */

import { execute } from '../../database/snowflake';
import { DecisionLogPayload } from '../../types/snowflake';

/**
 * Log a decision to the decisions table
 * @param payload Decision data to log
 * @returns Promise resolving to the inserted decision ID (UUID)
 */
export async function logDecision(payload: DecisionLogPayload): Promise<string> {
  const {
    id,
    market_id,
    market_question,
    final_direction,
    final_size,
    agent_outputs,
    consensus_reasoning,
    raw_market_data,
  } = payload;

  const query = `
    INSERT INTO decisions (
      id,
      market_id,
      market_question,
      final_direction,
      final_size,
      agent_outputs,
      consensus_reasoning,
      raw_market_data
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const binds = [
    id,
    market_id,
    market_question || null,
    final_direction,
    final_size,
    JSON.stringify(agent_outputs),
    consensus_reasoning || null,
    raw_market_data ? JSON.stringify(raw_market_data) : null,
  ];

  try {
    await execute(query, binds);
    console.log(`[Snowflake] Decision logged successfully: ${id}`);
    return id;
  } catch (error) {
    console.error('[Snowflake] Error logging decision:', error);
    throw error;
  }
}

