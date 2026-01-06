import express from 'express';
import cors from 'cors';
import { config } from './config/config';
import { AIServiceFactory } from './ai/ai.factory';
import { DecisionEngine } from './decision-engine/decision-engine.service';
import { TicketService } from './services/ticket.service';
import { createTicketRouter } from './routes/ticket.routes';
import { createQueueRouter } from './routes/queue.routes';
import { createSystemRouter } from './routes/system.routes';

function createApp() {
  const app = express();

  app.use(cors({ origin: config.cors.origin }));
  app.use(express.json());

  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });

  const aiService = AIServiceFactory.create({
    useMock: config.ai.useMock,
    openaiApiKey: config.ai.openaiApiKey,
    model: config.ai.model
  });

  const decisionEngine = new DecisionEngine({
    highConfidenceThreshold: config.decisionEngine.highConfidenceThreshold,
    lowConfidenceThreshold: config.decisionEngine.lowConfidenceThreshold,
    enableAutoRouting: config.decisionEngine.enableAutoRouting
  });

  const ticketService = new TicketService(aiService, decisionEngine);

  app.use('/api/tickets', createTicketRouter(ticketService));
  app.use('/api/queues', createQueueRouter(ticketService));
  app.use('/api/system', createSystemRouter(aiService, decisionEngine, ticketService));

  app.get('/', (req, res) => {
    res.json({
      name: 'Support Ticket Triage & Routing System',
      version: '1.0.0',
      status: 'running',
      endpoints: {
        tickets: '/api/tickets',
        queues: '/api/queues',
        system: '/api/system'
      }
    });
  });

  app.use((req, res) => {
    res.status(404).json({
      error: 'Not found',
      path: req.path
    });
  });

  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
      error: 'Internal server error',
      details: config.nodeEnv === 'development' ? err.message : undefined
    });
  });

  return app;
}

function start() {
  const app = createApp();
  
  app.listen(config.port, () => {
    console.log('\n===========================================');
    console.log('Support Ticket Triage & Routing System');
    console.log('===========================================');
    console.log(`Server: http://localhost:${config.port}`);
    console.log(`Environment: ${config.nodeEnv}`);
    console.log(`AI Mode: ${config.ai.useMock ? 'Mock' : 'OpenAI'}`);
    console.log(`Auto-routing: ${config.decisionEngine.enableAutoRouting ? 'Enabled' : 'Disabled'}`);
    console.log('===========================================\n');
  });
}

if (require.main === module) {
  start();
}

export { createApp };

