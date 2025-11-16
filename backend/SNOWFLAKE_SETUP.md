# Snowflake Database Setup Guide

## Prerequisites

1. **Snowflake Account**: You need a Snowflake account (free trial available at https://signup.snowflake.com/)
2. **Credentials**: Your account identifier, username, and password

## Step 1: Access Snowflake Web UI

1. Go to your Snowflake account URL (usually: `https://<account>.snowflakecomputing.com`)
2. Log in with your username and password
3. You'll see the Snowflake web interface

## Step 2: Create Database and Schema

### Option A: Using SQL Worksheet (Recommended)

1. Click on **"Worksheets"** in the left sidebar
2. Click **"+"** to create a new worksheet
3. Copy and paste the following SQL:

```sql
-- Create database
CREATE DATABASE IF NOT EXISTS QUACK_DB;

-- Use the database
USE DATABASE QUACK_DB;

-- Create schema
CREATE SCHEMA IF NOT EXISTS PUBLIC;

-- Use the schema
USE SCHEMA PUBLIC;

-- Verify creation
SHOW DATABASES LIKE 'QUACK_DB';
SHOW SCHEMAS IN DATABASE QUACK_DB;
```

4. Click **"Run"** (or press Ctrl+Enter / Cmd+Enter)
5. You should see success messages

### Option B: Using UI

1. Click on **"Data"** → **"Databases"** in the left sidebar
2. Click **"Create"** button
3. Enter database name: `QUACK_DB`
4. Click **"Create"**
5. Expand `QUACK_DB` → Right-click on **"Schemas"** → **"Create Schema"**
6. Enter schema name: `PUBLIC`
7. Click **"Create"**

## Step 3: Create Tables

1. In the SQL Worksheet, open the file `backend/snowflake_schema.sql`
2. Copy the entire contents
3. **IMPORTANT**: Replace the placeholders:

    - Replace `${SNOWFLAKE_DATABASE}` with `QUACK_DB`
    - Replace `${SNOWFLAKE_SCHEMA}` with `PUBLIC`

    Or use this ready-to-run version:

```sql
-- Use the database and schema
USE DATABASE QUACK_DB;
USE SCHEMA PUBLIC;

-- ==================================================
-- TABLE: decisions
-- Stores agent decision outputs and consensus
-- ==================================================
CREATE TABLE IF NOT EXISTS decisions (
    id STRING PRIMARY KEY,
    created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
    market_id STRING NOT NULL,
    market_question STRING,
    final_direction STRING NOT NULL,  -- YES or NO
    final_size FLOAT NOT NULL,
    agent_outputs VARIANT NOT NULL,  -- JSON array of agent outputs
    consensus_reasoning STRING,
    raw_market_data VARIANT,          -- JSON object
    INDEX idx_market_id (market_id),
    INDEX idx_created_at (created_at)
);

-- ==================================================
-- TABLE: trade_signals
-- Stores trade execution signals and status
-- ==================================================
CREATE TABLE IF NOT EXISTS trade_signals (
    id STRING PRIMARY KEY,
    created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
    decision_id STRING NOT NULL,
    market_id STRING NOT NULL,
    signal STRING NOT NULL,           -- BUY / SELL / SKIP
    size_usd FLOAT NOT NULL,
    solana_tx_hash STRING,
    status STRING NOT NULL,            -- PENDING / EXECUTED / FAILED
    execution_reasoning STRING,
    INDEX idx_decision_id (decision_id),
    INDEX idx_market_id (market_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- ==================================================
-- TABLE: market_snapshots
-- Stores market data snapshots from various sources
-- ==================================================
CREATE TABLE IF NOT EXISTS market_snapshots (
    id STRING PRIMARY KEY,
    created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
    market_id STRING NOT NULL,
    source STRING NOT NULL,            -- e.g., 'polymarket', 'internal'
    snapshot VARIANT NOT NULL,         -- JSON object
    INDEX idx_market_id (market_id),
    INDEX idx_source (source),
    INDEX idx_created_at (created_at)
);
```

4. Click **"Run"** to execute
5. Verify tables were created:
    ```sql
    SHOW TABLES IN SCHEMA QUACK_DB.PUBLIC;
    ```

## Step 4: Configure Environment Variables

Make sure your `.env` file (in project root) has:

```env
SNOWFLAKE_ACCOUNT=YW51339
SNOWFLAKE_USERNAME=your_username
SNOWFLAKE_PASSWORD=your_password
SNOWFLAKE_WAREHOUSE=COMPUTE_WH
SNOWFLAKE_DATABASE=QUACK_DB
SNOWFLAKE_SCHEMA=PUBLIC
```

**Important Notes:**

-   `SNOWFLAKE_ACCOUNT`: Your account identifier (e.g., `YW51339` or `YW51339.us-east-1`)
-   `SNOWFLAKE_WAREHOUSE`: Default is `COMPUTE_WH`, but check your Snowflake account
-   If you don't have a warehouse, create one:
    ```sql
    CREATE WAREHOUSE IF NOT EXISTS COMPUTE_WH
    WITH WAREHOUSE_SIZE = 'X-SMALL'
    AUTO_SUSPEND = 60
    AUTO_RESUME = TRUE;
    ```

## Step 5: Verify Setup

Run the test script:

```bash
cd backend
npx ts-node --project tsconfig.json test_snowflake.ts
```

You should see:

-   ✅ Connection initialized successfully
-   ✅ Query result showing current database/schema
-   ✅ Decision logged
-   ✅ Trade signal created
-   ✅ All tests passing

## Troubleshooting

### Error: "Database does not exist"

-   Make sure you created the database: `CREATE DATABASE QUACK_DB;`
-   Check your account has permissions to create databases

### Error: "Schema does not exist"

-   Make sure you created the schema: `CREATE SCHEMA QUACK_DB.PUBLIC;`
-   Or use: `USE DATABASE QUACK_DB; CREATE SCHEMA IF NOT EXISTS PUBLIC;`

### Error: "Warehouse does not exist"

-   Create a warehouse:
    ```sql
    CREATE WAREHOUSE IF NOT EXISTS COMPUTE_WH
    WITH WAREHOUSE_SIZE = 'X-SMALL';
    ```

### Error: "Insufficient privileges"

-   Make sure your user has `CREATE DATABASE`, `CREATE SCHEMA`, and `CREATE TABLE` privileges
-   Contact your Snowflake admin if needed

### Error: 404 Not Found

-   Check your `SNOWFLAKE_ACCOUNT` format - it might need the region (e.g., `YW51339.us-east-1`)
-   Verify the database and schema names match exactly

## Quick Reference

**Check current database/schema:**

```sql
SELECT CURRENT_DATABASE(), CURRENT_SCHEMA();
```

**List all databases:**

```sql
SHOW DATABASES;
```

**List all schemas in current database:**

```sql
SHOW SCHEMAS;
```

**List all tables in current schema:**

```sql
SHOW TABLES;
```

**View table structure:**

```sql
DESCRIBE TABLE decisions;
```

**Test insert (optional):**

```sql
INSERT INTO decisions (
    id, market_id, final_direction, final_size, agent_outputs
) VALUES (
    'test-123',
    'test-market',
    'YES',
    100.0,
    '[]'::VARIANT
);

SELECT * FROM decisions WHERE id = 'test-123';
```
