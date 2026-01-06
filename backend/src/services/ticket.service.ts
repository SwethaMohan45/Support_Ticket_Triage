import { v4 as uuidv4 } from 'uuid';
import { 
  Ticket, 
  TicketInput, 
  TicketStatus,
  ManualOverride,
  TeamQueue
} from '../models/ticket.model';
import { IAIService } from '../ai/ai.interface';
import { DecisionEngine } from '../decision-engine/decision-engine.service';
import { storageService } from '../storage/storage.service';

export class TicketService {
  constructor(
    private aiService: IAIService,
    private decisionEngine: DecisionEngine
  ) {}

  async createTicket(input: TicketInput): Promise<Ticket> {
    const ticket: Ticket = {
      id: uuidv4(),
      input,
      status: 'pending_analysis',
      overrideHistory: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await storageService.saveTicket(ticket);

    try {
      await this.processTicket(ticket);
    } catch (error) {
      console.error(`Error processing ticket ${ticket.id}:`, error);
      await this.handleProcessingFailure(ticket, error);
    }

    return ticket;
  }

  private async processTicket(ticket: Ticket): Promise<void> {
    try {
      const aiAnalysis = await this.aiService.analyzeTicket(ticket.input);
      ticket.aiAnalysis = aiAnalysis;
      await storageService.saveTicket(ticket);
    } catch (error) {
      throw new Error(`AI analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    if (!ticket.aiAnalysis) {
      throw new Error('No AI analysis available');
    }

    const routingDecision = this.decisionEngine.makeDecision(
      ticket.aiAnalysis,
      ticket.input
    );
    ticket.routingDecision = routingDecision;

    if (routingDecision.decisionType === 'escalated') {
      ticket.status = 'escalated';
    } else if (routingDecision.requiresReview) {
      ticket.status = 'pending_review';
    } else {
      ticket.status = 'routed';
    }

    await storageService.saveTicket(ticket);
  }

  private async handleProcessingFailure(ticket: Ticket, error: unknown): Promise<void> {
    ticket.status = 'pending_review';
    ticket.routingDecision = {
      targetQueue: 'manual_review',
      decisionType: 'manual',
      reason: `Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}. Requires manual review.`,
      confidence: 0,
      requiresReview: true,
      timestamp: new Date()
    };
    await storageService.saveTicket(ticket);
  }

  async getTicket(id: string): Promise<Ticket | null> {
    return await storageService.getTicketById(id);
  }

  async getAllTickets(filter?: {
    status?: string;
    queue?: string;
    customerType?: string;
  }): Promise<Ticket[]> {
    return await storageService.getAllTickets(filter);
  }

  async overrideRouting(
    ticketId: string,
    newQueue: TeamQueue,
    reason: string,
    overriddenBy: string
  ): Promise<Ticket | null> {
    const ticket = await storageService.getTicketById(ticketId);
    if (!ticket) {
      return null;
    }

    const previousQueue = ticket.routingDecision?.targetQueue || 'manual_review';

    const override: ManualOverride = {
      previousQueue,
      newQueue,
      reason,
      overriddenBy,
      timestamp: new Date()
    };

    ticket.routingDecision = {
      targetQueue: newQueue,
      decisionType: 'manual',
      reason: `Manual override: ${reason}`,
      confidence: ticket.aiAnalysis?.confidence || 0,
      requiresReview: false,
      timestamp: new Date()
    };
    ticket.status = 'routed';
    ticket.overrideHistory.push(override);

    return await storageService.saveTicket(ticket);
  }

  async getTicketsByQueue(queue: TeamQueue): Promise<Ticket[]> {
    return await storageService.getTicketsByQueue(queue);
  }

  async getStats() {
    return await storageService.getStats();
  }
}

