import { Router, Request, Response } from 'express';
import { TicketService } from '../services/ticket.service';
import { TicketInput, TeamQueue } from '../models/ticket.model';

export function createTicketRouter(ticketService: TicketService): Router {
  const router = Router();

  router.post('/', async (req: Request, res: Response) => {
    try {
      const input: TicketInput = req.body;

      if (!input.title || !input.description || !input.customerType) {
        return res.status(400).json({
          error: 'Missing required fields: title, description, customerType'
        });
      }

      const validCustomerTypes = ['free', 'paid', 'enterprise'];
      if (!validCustomerTypes.includes(input.customerType)) {
        return res.status(400).json({
          error: 'Invalid customerType. Must be: free, paid, or enterprise'
        });
      }

      const ticket = await ticketService.createTicket(input);

      res.status(201).json({
        ticket,
        message: 'Ticket created and processed successfully'
      });
    } catch (error) {
      console.error('Error creating ticket:', error);
      res.status(500).json({
        error: 'Failed to create ticket',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  router.get('/', async (req: Request, res: Response) => {
    try {
      const { status, queue, customerType } = req.query;

      const filter: any = {};
      if (status) filter.status = status;
      if (queue) filter.queue = queue;
      if (customerType) filter.customerType = customerType;

      const tickets = await ticketService.getAllTickets(filter);

      res.json({
        tickets,
        total: tickets.length,
        filter: Object.keys(filter).length > 0 ? filter : undefined
      });
    } catch (error) {
      console.error('Error fetching tickets:', error);
      res.status(500).json({
        error: 'Failed to fetch tickets',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const ticket = await ticketService.getTicket(id);

      if (!ticket) {
        return res.status(404).json({
          error: 'Ticket not found'
        });
      }

      res.json({ ticket });
    } catch (error) {
      console.error('Error fetching ticket:', error);
      res.status(500).json({
        error: 'Failed to fetch ticket',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  router.post('/:id/override', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { newQueue, reason, overriddenBy } = req.body;

      if (!newQueue || !reason || !overriddenBy) {
        return res.status(400).json({
          error: 'Missing required fields: newQueue, reason, overriddenBy'
        });
      }

      const validQueues: TeamQueue[] = [
        'billing', 
        'engineering', 
        'product', 
        'support', 
        'manual_review'
      ];
      
      if (!validQueues.includes(newQueue)) {
        return res.status(400).json({
          error: `Invalid queue. Must be one of: ${validQueues.join(', ')}`
        });
      }

      const ticket = await ticketService.overrideRouting(
        id, 
        newQueue, 
        reason, 
        overriddenBy
      );

      if (!ticket) {
        return res.status(404).json({
          error: 'Ticket not found'
        });
      }

      res.json({
        ticket,
        message: 'Routing overridden successfully'
      });
    } catch (error) {
      console.error('Error overriding routing:', error);
      res.status(500).json({
        error: 'Failed to override routing',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  return router;
}

