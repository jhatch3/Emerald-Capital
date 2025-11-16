import { runAgents } from '../orchestrator/runAgents';
import { debate } from '../orchestrator/debate';
import { calculateConsensus } from '../orchestrator/consensus';
import { MarketData, AgentData } from '../agents/baseAgent';
import { AgentOutput, ConsensusDecision } from '../orchestrator/consensus';
import { selectAndEnrichBestMarket } from '../market_selection/orchestrateMarketSelection';
import { storeDecision, DecisionRecord } from './snowflakeStore';
import { v4 as uuidv4 } from 'uuid';

export interface DecisionRequest {
  market: MarketData;
  data: AgentData;
}

export interface EnhancedDecisionResponse {
  status: 'ok' | 'error';
  decision_id?: string;
  investment_decision?: {
    direction: 'YES' | 'NO';
    size: number;
    confidence: number;
    summary: string; // Clean 4-sentence summary
  };
  agent_analysis?: Array<{
    agent_name: string;
    direction: 'YES' | 'NO';
    confidence: number;
    size: number;
    reasoning: string; // 4 sentences
  }>;
  conversation_logs?: {
    initial_decisions: AgentOutput[];
    debate_round: any;
    final_decisions: AgentOutput[];
  };
  market_info?: {
    symbol: string;
    question?: string;
    price: number;
    volume24h?: number;
    marketCap?: number;
  };
  error?: string;
}

/**
 * Helper to log to stderr when running as subprocess (so stdout only has JSON)
 */
const logToStderr = (...args: any[]) => {
  if (process.stdin.isTTY === false) {
    // Running as subprocess - log to stderr
    console.error(...args);
  } else {
    // Running interactively - log normally
    console.log(...args);
  }
};

/**
 * Main decision service function
 * Can be called from Python or used as a standalone service
 */
export async function processDecision(
  market: MarketData,
  data: AgentData,
  marketSelection?: { enriched: any; selected: any }
): Promise<EnhancedDecisionResponse> {
  const decisionId = uuidv4();
  const timestamp = new Date().toISOString();
  
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

    // Step 1: Run all agents in parallel (capture initial decisions)
    console.log(`[DecisionService] Running agents for market: ${market.symbol}`);
    const initialAgentOutputs = await runAgents(market, data);
    console.log(`[DecisionService] Initial agent outputs received:`, initialAgentOutputs.length);

    // Step 2: Run one debate round (capture final decisions)
    console.log(`[DecisionService] Running debate round...`);
    const finalAgentOutputs = await debate(initialAgentOutputs);
    console.log(`[DecisionService] Debate round completed`);

    // Step 3: Calculate consensus
    console.log(`[DecisionService] Calculating consensus...`);
    const consensus = calculateConsensus(finalAgentOutputs);
    console.log(`[DecisionService] Consensus: ${consensus.direction} with size $${consensus.size.toLocaleString()}`);

    // Step 4: Create clean investment decision summary (4 sentences)
    const investmentSummary = createInvestmentSummary(consensus, finalAgentOutputs);

    // Step 5: Prepare agent analysis with 4-sentence reasoning
    const agentAnalysis = finalAgentOutputs.map(output => ({
      agent_name: output.agent,
      direction: output.decision.direction,
      confidence: output.decision.confidence,
      size: output.decision.size,
      reasoning: output.decision.reasoning, // Already 4 sentences from updated prompts
    }));

    // Step 6: Prepare response
    const response: EnhancedDecisionResponse = {
      status: 'ok',
      decision_id: decisionId,
      investment_decision: {
        direction: consensus.direction,
        size: consensus.size,
        confidence: calculateWeightedConfidence(finalAgentOutputs),
        summary: investmentSummary,
      },
      agent_analysis: agentAnalysis,
      conversation_logs: {
        initial_decisions: initialAgentOutputs,
        debate_round: {
          timestamp,
          participants: finalAgentOutputs.map(a => a.agent),
        },
        final_decisions: finalAgentOutputs,
      },
      market_info: {
        symbol: market.symbol,
        question: market.question || (market as any).question,
        price: market.price,
        volume24h: market.volume24h,
        marketCap: market.marketCap,
      },
    };

    // Step 7: Store in Snowflake (non-blocking, log errors but don't fail)
    try {
      const record: DecisionRecord = {
        decision_id: decisionId,
        timestamp,
        market_symbol: market.symbol,
        market_question: market.question || (market as any).question,
        market_price: market.price,
        market_volume24h: market.volume24h,
        market_cap: market.marketCap,
        consensus_direction: consensus.direction,
        consensus_size: consensus.size,
        consensus_reasoning: consensus.reasoning,
        consensus_confidence: calculateWeightedConfidence(finalAgentOutputs),
        agent_decisions: finalAgentOutputs.map((final, idx) => ({
          agent_name: final.agent,
          initial_direction: initialAgentOutputs[idx]?.decision.direction || final.decision.direction,
          initial_confidence: initialAgentOutputs[idx]?.decision.confidence || final.decision.confidence,
          initial_size: initialAgentOutputs[idx]?.decision.size || final.decision.size,
          initial_reasoning: initialAgentOutputs[idx]?.decision.reasoning || final.decision.reasoning,
          final_direction: final.decision.direction,
          final_confidence: final.decision.confidence,
          final_size: final.decision.size,
          final_reasoning: final.decision.reasoning,
        })),
        conversation_logs: {
          initial_decisions: initialAgentOutputs,
          debate_round: {
            timestamp,
            participants: finalAgentOutputs.map(a => a.agent),
          },
          final_decisions: finalAgentOutputs,
        },
        market_selection: marketSelection ? {
          selected_market_id: marketSelection.selected?.condition_id || marketSelection.selected?.market_id,
          market_question: marketSelection.enriched?.question || marketSelection.selected?.market_question,
          enrichment_data: marketSelection.enriched,
        } : undefined,
        raw_json: JSON.stringify(response),
      };

      await storeDecision(record);
      logToStderr(`[DecisionService] Decision stored in Snowflake: ${record.decision_id}`);
    } catch (snowflakeError) {
      logToStderr('[DecisionService] Error storing in Snowflake (non-fatal):', snowflakeError);
      // Continue even if Snowflake storage fails
    }

    return response;
  } catch (error) {
    logToStderr('[DecisionService] Error processing decision:', error);
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Create a clean 4-sentence investment decision summary
 */
function createInvestmentSummary(consensus: ConsensusDecision, agents: AgentOutput[]): string {
  const yesAgents = agents.filter(a => a.decision.direction === 'YES');
  const noAgents = agents.filter(a => a.decision.direction === 'NO');
  
  const sentence1 = `The consensus decision is to ${consensus.direction === 'YES' ? 'take a long position' : 'avoid or take a short position'} with a position size of $${consensus.size.toLocaleString()} based on weighted analysis from 5 specialized AI agents.`;
  
  const sentence2 = `${consensus.direction === 'YES' ? `${yesAgents.length} agents` : `${noAgents.length} agents`} recommend ${consensus.direction === 'YES' ? 'YES' : 'NO'} with an average confidence of ${consensus.direction === 'YES' ? 
    (yesAgents.reduce((sum, a) => sum + a.decision.confidence, 0) / yesAgents.length).toFixed(1) :
    (noAgents.reduce((sum, a) => sum + a.decision.confidence, 0) / noAgents.length).toFixed(1)}%, while ${consensus.direction === 'YES' ? noAgents.length : yesAgents.length} agents recommend the opposite.`;
  
  const topAgent = agents.reduce((top, current) => 
    current.decision.confidence > top.decision.confidence ? current : top
  );
  const sentence3 = `The ${topAgent.agent} shows the highest confidence at ${topAgent.decision.confidence}% and recommends ${topAgent.decision.direction}, contributing significantly to the final decision.`;
  
  const sentence4 = `This decision reflects a balanced evaluation across fundamental analysis, quantitative metrics, sentiment indicators, risk management, and strategic market structure considerations.`;
  
  return `${sentence1} ${sentence2} ${sentence3} ${sentence4}`;
}

/**
 * Calculate weighted confidence from all agents
 */
function calculateWeightedConfidence(agents: AgentOutput[]): number {
  const weights: Record<string, number> = {
    QuantAgent: 0.30,
    FundamentalAgent: 0.25,
    RiskAgent: 0.25,
    SentimentAgent: 0.10,
    StrategistAgent: 0.10,
  };
  
  let weightedSum = 0;
  let totalWeight = 0;
  
  for (const agent of agents) {
    const weight = weights[agent.agent] || 0.1;
    weightedSum += agent.decision.confidence * weight;
    totalWeight += weight;
  }
  
  return totalWeight > 0 ? weightedSum / totalWeight : 0;
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
      
      let market: MarketData;
      let data: AgentData;
      
      // If market/data not provided, auto-select from Polymarket
      if (!request.market || !request.data || 
          (request.market && Object.keys(request.market).length === 0)) {
        logToStderr('[DecisionService] No market provided, running market selection...');
        const selected = await selectAndEnrichBestMarket();
        
        if (!selected) {
          // Output error as JSON to stdout
          console.log(JSON.stringify({
            status: 'error',
            error: 'Market selection failed: No suitable markets found',
          }));
          process.exit(1);
          return;
        }

        market = selected.market;
        data = selected.data;
        logToStderr(`[DecisionService] Selected market: ${selected.enriched.question.substring(0, 60)}...`);
        const result = await processDecision(market, data, {
          enriched: selected.enriched,
          selected: selected.selected,
        });
        // Output only JSON to stdout (no pretty printing to avoid extra newlines)
        console.log(JSON.stringify(result));
      } else {
        market = request.market;
        data = request.data;
        const result = await processDecision(market, data);
        // Output only JSON to stdout
        console.log(JSON.stringify(result));
      }
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
      
      let market: MarketData;
      let data: AgentData;
      
      // If market/data not provided, auto-select from Polymarket
      if (!request.market || !request.data || 
          (request.market && Object.keys(request.market).length === 0)) {
        logToStderr('[DecisionService] No market provided, running market selection...');
        const selected = await selectAndEnrichBestMarket();
        
        if (!selected) {
          // Output error as JSON to stdout (for API response)
          console.log(JSON.stringify({
            status: 'error',
            error: 'Market selection failed: No suitable markets found',
          }));
          process.exit(1);
          return;
        }

        market = selected.market;
        data = selected.data;
        logToStderr(`[DecisionService] Selected market: ${selected.enriched.question.substring(0, 60)}...`);
        const result = await processDecision(market, data, {
          enriched: selected.enriched,
          selected: selected.selected,
        });
        // Output only JSON to stdout
        console.log(JSON.stringify(result));
      } else {
        market = request.market;
        data = request.data;
        const result = await processDecision(market, data);
        // Output only JSON to stdout
        console.log(JSON.stringify(result));
      }
      process.exit(0);
    } catch (error) {
      // Output error as JSON to stdout
      console.log(JSON.stringify({
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
      process.exit(1);
    }
  });
}

