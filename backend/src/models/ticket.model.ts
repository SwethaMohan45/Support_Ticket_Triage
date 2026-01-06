export type CustomerType = 'free' | 'paid' | 'enterprise';

export type TicketCategory = 
  | 'billing' 
  | 'bug' 
  | 'feature_request' 
  | 'outage' 
  | 'other';

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';

export type TicketStatus = 
  | 'pending_analysis'
  | 'pending_review'
  | 'routed'
  | 'escalated';

export type RoutingDecisionType = 'auto' | 'manual' | 'escalated';

export type TeamQueue = 
  | 'billing' 
  | 'engineering' 
  | 'product' 
  | 'support' 
  | 'manual_review';

export interface TicketInput {
  title: string;
  description: string;
  customerType: CustomerType;
  metadata?: {
    tags?: string[];
    previousTickets?: number;
    customerId?: string;
  };
}

export interface AIAnalysis {
  category: TicketCategory;
  urgency: UrgencyLevel;
  suggestedTeam: TeamQueue;
  explanation: string;
  confidence: number;
  reasoningFactors: string[];
  timestamp: Date;
}

export interface RoutingDecision {
  targetQueue: TeamQueue;
  decisionType: RoutingDecisionType;
  reason: string;
  confidence: number;
  requiresReview: boolean;
  timestamp: Date;
}

export interface ManualOverride {
  previousQueue: TeamQueue;
  newQueue: TeamQueue;
  reason: string;
  overriddenBy: string;
  timestamp: Date;
}

export interface Ticket {
  id: string;
  input: TicketInput;
  status: TicketStatus;
  aiAnalysis?: AIAnalysis;
  routingDecision?: RoutingDecision;
  overrideHistory: ManualOverride[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TicketResponse {
  ticket: Ticket;
  message?: string;
}

export interface TicketListResponse {
  tickets: Ticket[];
  total: number;
}

export interface QueueStats {
  queueName: TeamQueue;
  ticketCount: number;
  avgConfidence: number;
  autoRoutedCount: number;
  manualRoutedCount: number;
}

export interface QueueStatsResponse {
  queues: QueueStats[];
  timestamp: Date;
}

