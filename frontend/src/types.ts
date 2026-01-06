/**
 * TypeScript type definitions matching the backend models
 */

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
  timestamp: string;
}

export interface RoutingDecision {
  targetQueue: TeamQueue;
  decisionType: RoutingDecisionType;
  reason: string;
  confidence: number;
  requiresReview: boolean;
  timestamp: string;
}

export interface ManualOverride {
  previousQueue: TeamQueue;
  newQueue: TeamQueue;
  reason: string;
  overriddenBy: string;
  timestamp: string;
}

export interface Ticket {
  id: string;
  input: TicketInput;
  status: TicketStatus;
  aiAnalysis?: AIAnalysis;
  routingDecision?: RoutingDecision;
  overrideHistory: ManualOverride[];
  createdAt: string;
  updatedAt: string;
}

export interface QueueStats {
  queueName: TeamQueue;
  ticketCount: number;
  avgConfidence: number;
  autoRoutedCount: number;
  manualRoutedCount: number;
}

