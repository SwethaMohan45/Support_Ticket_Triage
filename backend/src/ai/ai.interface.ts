import { TicketInput, AIAnalysis } from '../models/ticket.model';

export interface IAIService {
  analyzeTicket(input: TicketInput): Promise<AIAnalysis>;
  healthCheck(): Promise<boolean>;
}

