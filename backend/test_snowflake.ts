/**
 * Test script for Snowflake functionality
 * Run with: npx ts-node --project tsconfig.json test_snowflake.ts
 */

import { initSnowflake, execute, closeConnection } from './src/database/snowflake';
import { logDecision } from './src/services/snowflake/decisionLogger';
import { createTradeSignal, updateTradeExecution } from './src/services/snowflake/tradeLogger';
import { getLatestDecisions, getTradesByStatus, getMarketHistory } from './src/services/snowflake/dashboard';
import { v4 as uuidv4 } from 'uuid';

async function testSnowflake() {
  console.log('🧪 Starting Snowflake functionality tests...\n');
  const startTime = Date.now();

  try {
    // Test 1: Initialize connection
    console.log('📡 Test 1: Initializing Snowflake connection...');
    await initSnowflake();
    console.log('✅ Connection initialized successfully\n');

    // Test 2: Test basic query (quick verification)
    console.log('📊 Test 2: Testing basic query execution...');
    const testQuery = 'SELECT CURRENT_DATABASE() as db, CURRENT_SCHEMA() as schema';
    const result = await execute(testQuery);
    console.log(`✅ Connected to: ${result[0]?.DB}.${result[0]?.SCHEMA}\n`);

    // Test 3-5: Run write operations in parallel
    console.log('💾 Test 3-5: Running write operations...');
    const decisionId = uuidv4();
    const testDecision = {
      id: decisionId,
      market_id: 'test-market-123',
      market_question: 'Will this test pass?',
      final_direction: 'YES' as const,
      final_size: 1000.50,
      agent_outputs: [
        {
          agent: 'FundamentalAgent',
          decision: {
            direction: 'YES',
            confidence: 85,
            size: 1000,
            reasoning: 'Test reasoning.',
          },
        },
      ],
      consensus_reasoning: 'Test consensus.',
      raw_market_data: {
        symbol: 'TEST',
        price: 0.65,
      },
    };

    // Run writes in parallel
    const [loggedDecisionId, tradeId] = await Promise.all([
      logDecision(testDecision),
      createTradeSignal(decisionId, 'test-market-123', 'BUY', 1000.50),
    ]);

    console.log(`✅ Decision logged: ${loggedDecisionId}`);
    console.log(`✅ Trade signal created: ${tradeId}\n`);

    // Test 5: Update trade execution
    console.log('🔄 Test 5: Updating trade execution...');
    await updateTradeExecution(
      tradeId,
      'test-solana-tx-hash-abc123',
      'EXECUTED',
      'Successfully executed'
    );
    console.log('✅ Trade execution updated\n');

    // Test 6-8: Run read operations in parallel
    console.log('📋 Test 6-8: Running read operations in parallel...');
    const [latestDecisions, executedTrades, marketHistory] = await Promise.all([
      getLatestDecisions(5),
      getTradesByStatus('EXECUTED'),
      getMarketHistory('test-market-123'),
    ]);

    console.log(`✅ Retrieved ${latestDecisions.length} decisions`);
    console.log(`✅ Retrieved ${executedTrades.length} executed trades`);
    console.log(`✅ Retrieved ${marketHistory.length} market snapshots\n`);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`🎉 All tests passed successfully! (${duration}s)`);
  } catch (error) {
    console.error('❌ Test failed:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    process.exit(1);
  } finally {
    // Close connection
    console.log('\n🔌 Closing Snowflake connection...');
    closeConnection();
    console.log('✅ Connection closed');
  }
}

// Run tests
testSnowflake().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

