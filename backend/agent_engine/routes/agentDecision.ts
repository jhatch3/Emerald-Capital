/**
 * Express router for agent decision endpoint
 * This can be used if running TypeScript as a separate service
 */
import { Router, Request, Response } from 'express';
import { processDecision } from '../services/decisionService';

const router = Router();

/**
 * POST /api/agents/decision
 * Run the 5-agent decision engine and return consensus
 */
router.post('/decision', async (req: Request, res: Response) => {
  try {
    const { market, data } = req.body;
    const result = await processDecision(market, data);
    
    if (result.status === 'error') {
      return res.status(400).json(result);
    }
    
    return res.json(result);
  } catch (error) {
    console.error('[AgentDecision] Error processing decision:', error);
    return res.status(500).json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    });
  }
});

export default router;

