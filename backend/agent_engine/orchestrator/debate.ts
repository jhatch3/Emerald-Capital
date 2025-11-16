import { generateJSON } from '../services/gemini';
import { AgentDecision } from '../agents/baseAgent';

export interface AgentOutput {
  agent: string;
  decision: AgentDecision;
}

/**
 * Run one debate round where agents can refine their decisions
 * based on seeing other agents' outputs
 */
export async function debate(
  agentOutputs: AgentOutput[]
): Promise<AgentOutput[]> {
  try {
    const debatePrompt = buildDebatePrompt(agentOutputs);

    const response = await generateJSON(debatePrompt, 'google/gemini-2.0-flash-lite-001');

    // Validate and parse the response
    if (!Array.isArray(response) || response.length !== 5) {
      throw new Error('Debate response must be an array of 5 agent outputs');
    }

    // Map response back to AgentOutput format
    const debatedOutputs: AgentOutput[] = response.map((item: any, index: number) => {
      // Validate structure
      if (!item.agent || !item.decision) {
        throw new Error(`Invalid agent output at index ${index}: missing agent or decision`);
      }
      if (!item.decision.direction || !['YES', 'NO'].includes(item.decision.direction)) {
        throw new Error(`Invalid direction in agent output at index ${index}`);
      }
      if (typeof item.decision.confidence !== 'number' || item.decision.confidence < 0 || item.decision.confidence > 100) {
        throw new Error(`Invalid confidence in agent output at index ${index}`);
      }
      if (typeof item.decision.size !== 'number' || item.decision.size < 0) {
        throw new Error(`Invalid size in agent output at index ${index}`);
      }
      if (typeof item.decision.reasoning !== 'string') {
        throw new Error(`Invalid reasoning in agent output at index ${index}`);
      }

      return {
        agent: item.agent,
        decision: {
          direction: item.decision.direction as 'YES' | 'NO',
          confidence: item.decision.confidence,
          size: item.decision.size,
          reasoning: item.decision.reasoning,
        },
      };
    });

    return debatedOutputs;
  } catch (error) {
    console.error('Error in debate round:', error);
    // Return original outputs if debate fails
    return agentOutputs;
  }
}

function buildDebatePrompt(agentOutputs: AgentOutput[]): string {
  const outputsText = agentOutputs
    .map(
      (output) => `
${output.agent}:
- Direction: ${output.decision.direction}
- Confidence: ${output.decision.confidence}%
- Size: $${output.decision.size.toLocaleString()}
- Reasoning: ${output.decision.reasoning}
`
    )
    .join('\n');

  return `You are facilitating a debate round for 5 AI trading agents. Each agent has made an initial decision, and now they can see all other agents' decisions and refine their own.

Current Agent Decisions:
${outputsText}

Your task:
1. Review all 5 agent decisions
2. Allow each agent to refine their decision based on seeing others' reasoning
3. Agents can strengthen their position, moderate it, or change direction if convinced
4. Each agent should provide updated reasoning that references other agents' points

Return a JSON array with exactly 5 objects, one for each agent:
[
  {
    "agent": "FundamentalAgent",
    "decision": {
      "direction": "YES" or "NO",
      "confidence": number 0-100,
      "size": number (position size in USD),
      "reasoning": "string (EXACTLY 4 sentences - updated reasoning that references debate and incorporates other agents' insights)"
    }
  },
  {
    "agent": "QuantAgent",
    "decision": { ... }
  },
  {
    "agent": "SentimentAgent",
    "decision": { ... }
  },
  {
    "agent": "RiskAgent",
    "decision": { ... }
  },
  {
    "agent": "StrategistAgent",
    "decision": { ... }
  }
]

Ensure all 5 agents are included and maintain their unique perspectives while incorporating insights from the debate.`;
}

