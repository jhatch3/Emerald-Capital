/**
 * Snowflake Database Type Definitions
 */

export interface DecisionRecord {
  id: string;
  created_at: Date;
  market_id: string;
  market_question: string | null;
  final_direction: 'YES' | 'NO';
  final_size: number;
  agent_outputs: any; // VARIANT type in Snowflake (JSON array)
  consensus_reasoning: string | null;
  raw_market_data: any; // VARIANT type in Snowflake (JSON object)
}

export interface TradeSignalRecord {
  id: string;
  created_at: Date;
  decision_id: string;
  market_id: string;
  signal: 'BUY' | 'SELL' | 'SKIP';
  size_usd: number;
  solana_tx_hash: string | null;
  status: 'PENDING' | 'EXECUTED' | 'FAILED';
  execution_reasoning: string | null;
}

export interface MarketSnapshotRecord {
  id: string;
  created_at: Date;
  market_id: string;
  source: string;
  snapshot: any; // VARIANT type in Snowflake (JSON object)
}

export interface DecisionLogPayload {
  id: string;
  market_id: string;
  market_question?: string;
  final_direction: 'YES' | 'NO';
  final_size: number;
  agent_outputs: any[];
  consensus_reasoning?: string;
  raw_market_data?: any;
}

