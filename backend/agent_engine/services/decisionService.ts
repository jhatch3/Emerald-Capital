import { runAgents } from '../orchestrator/runAgents';
import { debate } from '../orchestrator/debate';
import { calculateConsensus } from '../orchestrator/consensus';
import { MarketData, AgentData } from '../agents/baseAgent';
import { AgentOutput, ConsensusDecision } from '../orchestrator/consensus';

export interface DecisionRequest {
  market: MarketData;
  data: AgentData;
}

export interface DecisionResponse {
  status: 'ok' | 'error';
  decision?: ConsensusDecision;
  agents?: AgentOutput[];
  error?: string;
}

/**
 * Main decision service function
 * Can be called from Python or used as a standalone service
 */
export async function processDecision(
  market: MarketData,
  data: AgentData
): Promise<DecisionResponse> {
  try {
    // Validate request
    if (!market || !market.symbol || typeof market.price !== 'number') {
      return {
        status: 'error',
        error: 'Invalid request: market must include symbol and price',
      };
    }

    if (!data) {
      return {
        status: 'error',
        error: 'Invalid request: data is required',
      };
    }

    // Step 1: Run all agents in parallel
    console.log(`[DecisionService] Running agents for market: ${market.symbol}`);
    let agentOutputs = await runAgents(market, data);
    console.log(`[DecisionService] Initial agent outputs received:`, agentOutputs.length);

    // Step 2: Run one debate round
    console.log(`[DecisionService] Running debate round...`);
    agentOutputs = await debate(agentOutputs);
    console.log(`[DecisionService] Debate round completed`);

    // Step 3: Calculate consensus
    console.log(`[DecisionService] Calculating consensus...`);
    const consensus = calculateConsensus(agentOutputs);
    console.log(`[DecisionService] Consensus: ${consensus.direction} with size $${consensus.size.toLocaleString()}`);

    // Return response
    return {
      status: 'ok',
      decision: consensus,
      agents: agentOutputs,
    };
  } catch (error) {
    console.error('[DecisionService] Error processing decision:', error);
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// If run as a standalone script (for testing or direct invocation)
// Read from stdin when called directly
if (typeof require !== 'undefined' && require.main === module) {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  let inputData = '';
  rl.on('line', (line: string) => {
    inputData += line;
  });

  rl.on('close', async () => {
    try {
      const request: DecisionRequest = JSON.parse(inputData);
      const result = await processDecision(request.market, request.data);
      console.log(JSON.stringify(result));
      process.exit(0);
    } catch (error) {
      console.error(JSON.stringify({
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
      process.exit(1);
    }
  });
}

// Alternative: Read all stdin at once (better for subprocess calls)
if (process.stdin.isTTY === false) {
  // Running in non-interactive mode (piped input)
  let inputData = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk: string) => {
    inputData += chunk;
  });
  process.stdin.on('end', async () => {
    try {
      const request: DecisionRequest = JSON.parse(inputData.trim());
      const result = await processDecision(request.market, request.data);
      console.log(JSON.stringify(result));
      process.exit(0);
    } catch (error) {
      console.error(JSON.stringify({
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
      process.exit(1);
    }
  });
}

