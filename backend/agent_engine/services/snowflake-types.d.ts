/**
 * Type declarations for snowflake-sdk
 * This is a temporary fix until proper types are available
 */
declare module 'snowflake-sdk' {
  export interface Connection {
    connect(callback: (err: any, conn: any) => void): void;
    execute(options: {
      sqlText: string;
      binds?: any[];
      complete: (err: any, stmt: any, rows: any) => void;
    }): void;
    destroy(callback: (err: any) => void): void;
  }

  export interface ConnectionOptions {
    account: string;
    username: string;
    password: string;
    warehouse: string;
    database: string;
    schema: string;
  }

  export function createConnection(options: ConnectionOptions): Connection;
}

