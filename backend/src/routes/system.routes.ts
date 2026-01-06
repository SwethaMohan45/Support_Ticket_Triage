import { Router, Request, Response } from 'express';
import { IAIService } from '../ai/ai.interface';
import { DecisionEngine } from '../decision-engine/decision-engine.service';
import { TicketService } from '../services/ticket.service';

export function createSystemRouter(
  aiService: IAIService,
  decisionEngine: DecisionEngine,
  ticketService: TicketService
): Router {
  const router = Router();

  router.get('/health', async (req: Request, res: Response) => {
    try {
      const aiHealthy = await aiService.healthCheck();
      
      res.json({
        status: 'healthy',
        timestamp: new Date(),
        services: {
          ai: aiHealthy ? 'healthy' : 'degraded',
          storage: 'healthy'
        }
      });
    } catch (error) {
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  router.get('/stats', async (req: Request, res: Response) => {
    try {
      const stats = await ticketService.getStats();
      
      res.json({
        ...stats,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({
        error: 'Failed to fetch statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  router.get('/rules', (req: Request, res: Response) => {
    try {
      const explanation = decisionEngine.explainRules();
      const config = decisionEngine.getConfig();
      
      res.json({
        explanation,
        config,
        timestamp: new Date()
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to fetch rules',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  return router;
}

