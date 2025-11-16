import { generateJSON } from '../services/gemini';

export interface MarketData {
  symbol: string;
  price: number;
  volume24h?: number;
  marketCap?: number;
  [key: string]: any;
}

export interface AgentData {
  portfolio?: {
    totalValue: number;
    positions: Array<{ symbol: string; size: number; pnl: number }>;
    heat: number; // Portfolio heat percentage
  };
  marketData?: MarketData;
  historicalData?: Array<{ date: string; price: number; volume: number }>;
  sentiment?: {
    socialScore: number;
    newsScore: number;
    trend: 'bullish' | 'bearish' | 'neutral';
  };
  [key: string]: any;
}

export interface AgentDecision {
  direction: 'YES' | 'NO';
  confidence: number; // 0-100
  size: number; // Position size in USD
  reasoning: string;
}

/**
 * Base class for all AI trading agents
 * Each agent has a unique persona and evaluation method
 */
export abstract class BaseAgent {
  protected name: string;
  protected persona: string;
  protected model: string = 'google/gemini-2.0-flash-lite-001'; // OpenRouter model name

  constructor(name: string, persona: string) {
    this.name = name;
    this.persona = persona;
  }

  /**
   * Call OpenRouter API
   */
  private async callOpenRouter(prompt: string): Promise<any> {
    return await generateJSON(prompt, this.model);
  }

  /**
   * Evaluate a market opportunity and return a decision
   */
  async evaluate(market: MarketData, data: AgentData): Promise<AgentDecision> {
    try {
      const prompt = this.buildPrompt(market, data);
      
      // Use OpenRouter API directly
      const decision = await this.callOpenRouter(prompt) as AgentDecision;
      
      // Validate response structure
      this.validateDecision(decision);
      
      return decision;
    } catch (error) {
      console.error(`[${this.name}] Error in evaluate:`, error);
      // Return conservative default on error
      return {
        direction: 'NO',
        confidence: 0,
        size: 0,
        reasoning: `Error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Build the prompt for this agent based on its persona
   */
  protected abstract buildPrompt(market: MarketData, data: AgentData): string;

  /**
   * Validate the decision structure
   */
  private validateDecision(decision: any): void {
    if (!decision.direction || !['YES', 'NO'].includes(decision.direction)) {
      throw new Error('Invalid direction: must be YES or NO');
    }
    if (typeof decision.confidence !== 'number' || decision.confidence < 0 || decision.confidence > 100) {
      throw new Error('Invalid confidence: must be a number between 0 and 100');
    }
    if (typeof decision.size !== 'number' || decision.size < 0) {
      throw new Error('Invalid size: must be a non-negative number');
    }
    if (typeof decision.reasoning !== 'string') {
      throw new Error('Invalid reasoning: must be a string');
    }
  }

  getName(): string {
    return this.name;
  }

  getPersona(): string {
    return this.persona;
  }
}

