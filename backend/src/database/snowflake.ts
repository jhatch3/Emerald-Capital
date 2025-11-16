/**
 * Snowflake Database Client
 * Singleton connection with connection pooling
 */

import * as snowflake from 'snowflake-sdk';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables
const rootEnvPath = path.resolve(__dirname, '../../../.env');
const backendEnvPath = path.resolve(__dirname, '../../.env');
const cwdEnvPath = path.resolve(process.cwd(), '.env');

if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
} else if (fs.existsSync(cwdEnvPath)) {
  dotenv.config({ path: cwdEnvPath });
} else if (fs.existsSync(backendEnvPath)) {
  dotenv.config({ path: backendEnvPath });
}

let connection: snowflake.Connection | null = null;
let isInitialized = false;

/**
 * Initialize Snowflake connection (singleton)
 */
export async function initSnowflake(): Promise<void> {
  if (isInitialized && connection) {
    console.log('[Snowflake] Connection already initialized');
    return;
  }

  let account = process.env.SNOWFLAKE_ACCOUNT;
  const username = process.env.SNOWFLAKE_USERNAME;
  const password = process.env.SNOWFLAKE_PASSWORD;
  const warehouse = process.env.SNOWFLAKE_WAREHOUSE || 'COMPUTE_WH';
  const database = process.env.SNOWFLAKE_DATABASE || 'QUACK_DB';
  const schema = process.env.SNOWFLAKE_SCHEMA || 'PUBLIC';
  const region = process.env.SNOWFLAKE_REGION; // Optional region override

  if (!account || !username || !password) {
    throw new Error(
      'Snowflake credentials not found in environment variables. ' +
      'Required: SNOWFLAKE_ACCOUNT, SNOWFLAKE_USERNAME, SNOWFLAKE_PASSWORD'
    );
  }

  // Handle account identifier format
  // For accounts with region suffix (e.g., "qqokucp.jc54941"), use the full identifier
  // The SDK will handle the hostname construction correctly
  // If region is provided separately, use account name only
  let accountIdentifier = account;
  
  if (account.includes('.') && region) {
    // If both account.region format AND separate region env var exist, use just account name
    const parts = account.split('.');
    accountIdentifier = parts[0];
    console.log(`[Snowflake] Using account name "${accountIdentifier}" with region "${region}" from env`);
  } else if (account.includes('.') && !region) {
    // If account has dot but no separate region, use full identifier as-is
    console.log(`[Snowflake] Using full account identifier: ${account}`);
  }

  console.log('[Snowflake] Initializing connection...');
  console.log(`[Snowflake] Account: ${accountIdentifier}, Database: ${database}, Schema: ${schema}`);

  const connectionOptions: any = {
    account: accountIdentifier,
    username,
    password,
    warehouse,
    database,
    schema,
  };

  // Only add region if provided separately (not extracted from account)
  if (region && !account.includes('.')) {
    connectionOptions.region = region;
  }

  connection = snowflake.createConnection(connectionOptions);

  return new Promise((resolve, reject) => {
    connection!.connect((err: any, conn: any) => {
      if (err) {
        console.error('[Snowflake] Connection error:', err);
        connection = null;
        reject(err);
        return;
      }
      isInitialized = true;
      console.log('[Snowflake] Connection established successfully');
      resolve();
    });
  });
}

/**
 * Execute a SQL query with optional bind parameters
 * @param query SQL query string
 * @param binds Optional array of bind parameters
 * @returns Promise resolving to query results
 */
export async function execute(query: string, binds?: any[]): Promise<any[]> {
  if (!connection || !isInitialized) {
    await initSnowflake();
  }

  return new Promise((resolve, reject) => {
    if (!connection) {
      reject(new Error('[Snowflake] Connection not initialized'));
      return;
    }

    console.log('[Snowflake] Executing query:', query.substring(0, 100) + (query.length > 100 ? '...' : ''));
    if (binds && binds.length > 0) {
      console.log('[Snowflake] Bind parameters:', binds);
    }

    connection.execute(
      {
        sqlText: query,
        binds: binds || [],
        complete: (err: any, stmt: any, rows: any) => {
          if (err) {
            console.error('[Snowflake] Query execution error:', err);
            reject(err);
            return;
          }
          console.log(`[Snowflake] Query executed successfully. Rows affected: ${rows?.length || 0}`);
          resolve(rows || []);
        },
      }
    );
  });
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
    isInitialized = false;
  }
}

/**
 * Get connection status
 */
export function isConnected(): boolean {
  return isInitialized && connection !== null;
}

