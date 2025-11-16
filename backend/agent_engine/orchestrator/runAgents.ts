import { FundamentalAgent } from '../agents/fundamental';
import { QuantAgent } from '../agents/quant';
import { SentimentAgent } from '../agents/sentiment';
import { RiskAgent } from '../agents/risk';
import { StrategistAgent } from '../agents/strategist';
import { BaseAgent, MarketData, AgentData, AgentDecision } from '../agents/baseAgent';

/**
 * Run all 5 agents in parallel and return their decisions
 */
export async function runAgents(
  market: MarketData,
  data: AgentData
): Promise<Array<{ agent: string; decision: AgentDecision }>> {
  // Instantiate all agents
  const agents: BaseAgent[] = [
    new FundamentalAgent(),
    new QuantAgent(),
    new SentimentAgent(),
    new RiskAgent(),
    new StrategistAgent(),
  ];

  // Run all agents in parallel
  const promises = agents.map(async (agent) => {
    try {
      const decision = await agent.evaluate(market, data);
      return {
        agent: agent.getName(),
        decision,
      };
    } catch (error) {
      console.error(`[${agent.getName()}] Error during evaluation:`, error);
      // Return conservative default on error
      return {
        agent: agent.getName(),
        decision: {
          direction: 'NO',
          confidence: 0,
          size: 0,
          reasoning: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        } as AgentDecision,
      };
    }
  });

  // Wait for all agents to complete
  const results = await Promise.all(promises);

  return results;
}

