/**
 * Snowflake Storage Utility
 * Stores investment decisions and full conversation logs in Snowflake database
 */

import * as snowflake from 'snowflake-sdk';

export interface DecisionRecord {
  decision_id: string;
  timestamp: string;
  market_symbol: string;
  market_question?: string;
  market_price: number;
  market_volume24h?: number;
  market_cap?: number;
  
  // Final consensus decision
  consensus_direction: 'YES' | 'NO';
  consensus_size: number;
  consensus_reasoning: string;
  consensus_confidence: number;
  
  // Agent decisions (initial and final after debate)
  agent_decisions: Array<{
    agent_name: string;
    initial_direction: 'YES' | 'NO';
    initial_confidence: number;
    initial_size: number;
    initial_reasoning: string;
    final_direction: 'YES' | 'NO';
    final_confidence: number;
    final_size: number;
    final_reasoning: string;
  }>;
  
  // Full conversation logs
  conversation_logs: {
    initial_decisions: any[];
    debate_round: any;
    final_decisions: any[];
  };
  
  // Market selection data (if auto-selected)
  market_selection?: {
    selected_market_id: string;
    market_question: string;
    enrichment_data?: any;
  };
  
  // Raw JSON for full data
  raw_json: string;
}

let connection: snowflake.Connection | null = null;
let isConnected = false;

/**
 * Initialize and connect to Snowflake (singleton pattern)
 */
async function ensureConnected(): Promise<snowflake.Connection> {
  // If already connected, return existing connection
  if (connection && isConnected) {
    return connection;
  }

  // If connection exists but not connected, connect it
  if (connection && !isConnected) {
    return new Promise((resolve, reject) => {
      connection!.connect((err: any, conn: any) => {
        if (err) {
          reject(err);
          return;
        }
        isConnected = true;
        resolve(connection!);
      });
    });
  }

  // Create new connection
  const account = process.env.SNOWFLAKE_ACCOUNT;
  const username = process.env.SNOWFLAKE_USERNAME;
  const password = process.env.SNOWFLAKE_PASSWORD;
  const warehouse = process.env.SNOWFLAKE_WAREHOUSE || 'COMPUTE_WH';
  const database = process.env.SNOWFLAKE_DATABASE || 'QUACK_DB';
  const schema = process.env.SNOWFLAKE_SCHEMA || 'PUBLIC';

  if (!account || !username || !password) {
    throw new Error('Snowflake credentials not found in environment variables. Required: SNOWFLAKE_ACCOUNT, SNOWFLAKE_USERNAME, SNOWFLAKE_PASSWORD');
  }

  connection = snowflake.createConnection({
    account,
    username,
    password,
    warehouse,
    database,
    schema,
  });

  // Connect and wait for connection
  return new Promise((resolve, reject) => {
    connection!.connect((err: any, conn: any) => {
      if (err) {
        connection = null;
        isConnected = false;
        reject(err);
        return;
      }
      isConnected = true;
      resolve(connection!);
    });
  });
}

/**
 * Ensure the decisions table exists
 */
async function ensureTableExists(): Promise<void> {
  const conn = await ensureConnected();

  return new Promise((resolve, reject) => {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS INVESTMENT_DECISIONS (
        DECISION_ID VARCHAR(255) PRIMARY KEY,
        TIMESTAMP TIMESTAMP_NTZ,
        MARKET_SYMBOL VARCHAR(255),
        MARKET_QUESTION TEXT,
        MARKET_PRICE NUMBER(20, 8),
        MARKET_VOLUME24H NUMBER(20, 2),
        MARKET_CAP NUMBER(20, 2),
        
        CONSENSUS_DIRECTION VARCHAR(3),
        CONSENSUS_SIZE NUMBER(20, 2),
        CONSENSUS_REASONING TEXT,
        CONSENSUS_CONFIDENCE NUMBER(5, 2),
        
        AGENT_DECISIONS VARIANT,
        CONVERSATION_LOGS VARIANT,
        MARKET_SELECTION VARIANT,
        RAW_JSON VARIANT,
        
        CREATED_AT TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
      )
    `;

    conn.execute({
      sqlText: createTableSQL,
      complete: (err: any, stmt: any, rows: any) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      },
    });
  });
}

/**
 * Store a decision record in Snowflake
 */
export async function storeDecision(record: DecisionRecord): Promise<void> {
  try {
    await ensureTableExists();
    const conn = await ensureConnected();

    return new Promise((resolve, reject) => {
      const insertSQL = `
        INSERT INTO INVESTMENT_DECISIONS (
          DECISION_ID, TIMESTAMP, MARKET_SYMBOL, MARKET_QUESTION,
          MARKET_PRICE, MARKET_VOLUME24H, MARKET_CAP,
          CONSENSUS_DIRECTION, CONSENSUS_SIZE, CONSENSUS_REASONING, CONSENSUS_CONFIDENCE,
          AGENT_DECISIONS, CONVERSATION_LOGS, MARKET_SELECTION, RAW_JSON
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const binds = [
        record.decision_id,
        record.timestamp,
        record.market_symbol,
        record.market_question || null,
        record.market_price,
        record.market_volume24h || null,
        record.market_cap || null,
        record.consensus_direction,
        record.consensus_size,
        record.consensus_reasoning,
        record.consensus_confidence,
        JSON.stringify(record.agent_decisions),
        JSON.stringify(record.conversation_logs),
        record.market_selection ? JSON.stringify(record.market_selection) : null,
        record.raw_json,
      ];

      conn.execute({
        sqlText: insertSQL,
        binds,
        complete: (err: any, stmt: any, rows: any) => {
          if (err) {
            console.error('[Snowflake] Error storing decision:', err);
            reject(err);
          } else {
            console.log(`[Snowflake] Successfully stored decision ${record.decision_id}`);
            resolve();
          }
        },
      });
    });
  } catch (error) {
    console.error('[Snowflake] Error in storeDecision:', error);
    throw error;
  }
}

/**
 * Close Snowflake connection
 */
export function closeConnection(): void {
  if (connection) {
    connection.destroy((err: any) => {
      if (err) {
        console.error('[Snowflake] Error closing connection:', err);
      } else {
        console.log('[Snowflake] Connection closed');
      }
    });
    connection = null;
    isConnected = false;
  }
}

