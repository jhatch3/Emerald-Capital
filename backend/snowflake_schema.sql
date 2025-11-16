-- Snowflake Table Creation Script
-- Database and Schema: QUACK_DB.PUBLIC
-- 
-- BEFORE RUNNING:
-- 1. Create the database: CREATE DATABASE IF NOT EXISTS QUACK_DB;
-- 2. Create the schema: USE DATABASE QUACK_DB; CREATE SCHEMA IF NOT EXISTS PUBLIC;
-- 3. Then run this script

USE DATABASE QUACK_DB;
USE SCHEMA PUBLIC;
USE WAREHOUSE COMPUTE_WH;

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
    raw_market_data VARIANT          -- JSON object
) CLUSTER BY (market_id, created_at);

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
    execution_reasoning STRING
) CLUSTER BY (status, created_at, market_id);

-- ==================================================
-- TABLE: market_snapshots
-- Stores market data snapshots from various sources
-- ==================================================
CREATE TABLE IF NOT EXISTS market_snapshots (
    id STRING PRIMARY KEY,
    created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
    market_id STRING NOT NULL,
    source STRING NOT NULL,            -- e.g., 'polymarket', 'internal'
    snapshot VARIANT NOT NULL         -- JSON object
) CLUSTER BY (market_id, source, created_at);

