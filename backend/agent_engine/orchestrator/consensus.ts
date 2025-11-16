import { AgentDecision } from '../agents/baseAgent';

export interface AgentOutput {
  agent: string;
  decision: AgentDecision;
}

export interface ConsensusDecision {
  direction: 'YES' | 'NO';
  size: number;
  reasoning: string;
}

/**
 * Agent weights for consensus calculation
 */
const AGENT_WEIGHTS: Record<string, number> = {
  QuantAgent: 0.30,
  FundamentalAgent: 0.25,
  RiskAgent: 0.25,
  SentimentAgent: 0.10,
  StrategistAgent: 0.10,
};

/**
 * Calculate weighted consensus from all agent decisions
 */
export function calculateConsensus(agentOutputs: AgentOutput[]): ConsensusDecision {
  // Separate YES and NO votes with weights
  let yesWeightedConfidence = 0;
  let noWeightedConfidence = 0;
  let totalYesSize = 0;
  let totalNoSize = 0;
  const reasoningParts: string[] = [];

  for (const output of agentOutputs) {
    const weight = AGENT_WEIGHTS[output.agent] || 0.1; // Default weight if agent not found
    const weightedConfidence = output.decision.confidence * weight;

    if (output.decision.direction === 'YES') {
      yesWeightedConfidence += weightedConfidence;
      totalYesSize += output.decision.size * weight;
      reasoningParts.push(
        `${output.agent} (${(weight * 100).toFixed(0)}% weight): ${output.decision.direction} with ${output.decision.confidence}% confidence - ${output.decision.reasoning}`
      );
    } else {
      noWeightedConfidence += weightedConfidence;
      totalNoSize += output.decision.size * weight;
      reasoningParts.push(
        `${output.agent} (${(weight * 100).toFixed(0)}% weight): ${output.decision.direction} with ${output.decision.confidence}% confidence - ${output.decision.reasoning}`
      );
    }
  }

  // Determine direction based on weighted confidence
  const direction: 'YES' | 'NO' = yesWeightedConfidence > noWeightedConfidence ? 'YES' : 'NO';
  
  // Calculate weighted average size
  const size = direction === 'YES' ? totalYesSize : totalNoSize;
  
  // Build consensus reasoning
  const consensusReasoning = `Consensus: ${direction} (Weighted Confidence: YES=${yesWeightedConfidence.toFixed(1)}%, NO=${noWeightedConfidence.toFixed(1)}%)\n\nAgent Decisions:\n${reasoningParts.join('\n\n')}`;

  return {
    direction,
    size: Math.max(0, size), // Ensure non-negative
    reasoning: consensusReasoning,
  };
}

