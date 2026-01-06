import { Router, Request, Response } from 'express';
import { TicketService } from '../services/ticket.service';
import { TeamQueue, QueueStats } from '../models/ticket.model';

export function createQueueRouter(ticketService: TicketService): Router {
  const router = Router();

  router.get('/', async (req: Request, res: Response) => {
    try {
      const queues: TeamQueue[] = [
        'billing',
        'engineering', 
        'product',
        'support',
        'manual_review'
      ];

      const queueStats: QueueStats[] = await Promise.all(
        queues.map(async (queueName) => {
          const tickets = await ticketService.getTicketsByQueue(queueName);
          
          const autoRoutedCount = tickets.filter(
            t => t.routingDecision?.decisionType === 'auto'
          ).length;
          
          const manualRoutedCount = tickets.filter(
            t => t.routingDecision?.decisionType === 'manual'
          ).length;

          const totalConfidence = tickets.reduce(
            (sum, t) => sum + (t.aiAnalysis?.confidence || 0), 
            0
          );
          const avgConfidence = tickets.length > 0 
            ? totalConfidence / tickets.length 
            : 0;

          return {
            queueName,
            ticketCount: tickets.length,
            avgConfidence: Math.round(avgConfidence * 100) / 100,
            autoRoutedCount,
            manualRoutedCount
          };
        })
      );

      res.json({
        queues: queueStats,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error fetching queue stats:', error);
      res.status(500).json({
        error: 'Failed to fetch queue statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  router.get('/:queueName', async (req: Request, res: Response) => {
    try {
      const { queueName } = req.params;

      const validQueues: TeamQueue[] = [
        'billing',
        'engineering',
        'product',
        'support',
        'manual_review'
      ];

      if (!validQueues.includes(queueName as TeamQueue)) {
        return res.status(400).json({
          error: `Invalid queue. Must be one of: ${validQueues.join(', ')}`
        });
      }

      const tickets = await ticketService.getTicketsByQueue(queueName as TeamQueue);

      res.json({
        queue: queueName,
        tickets,
        count: tickets.length
      });
    } catch (error) {
      console.error('Error fetching queue tickets:', error);
      res.status(500).json({
        error: 'Failed to fetch queue tickets',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  return router;
}

