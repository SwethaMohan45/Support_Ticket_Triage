import { 
  AIAnalysis, 
  RoutingDecision, 
  TicketInput,
  TeamQueue
} from '../models/ticket.model';

interface DecisionEngineConfig {
  highConfidenceThreshold: number;
  lowConfidenceThreshold: number;
  enableAutoRouting: boolean;
}

export class DecisionEngine {
  private config: DecisionEngineConfig;

  constructor(config?: Partial<DecisionEngineConfig>) {
    this.config = {
      highConfidenceThreshold: config?.highConfidenceThreshold ?? 0.85,
      lowConfidenceThreshold: config?.lowConfidenceThreshold ?? 0.60,
      enableAutoRouting: config?.enableAutoRouting ?? true
    };
  }

  makeDecision(
    aiAnalysis: AIAnalysis, 
    ticketInput: TicketInput
  ): RoutingDecision {
    if (this.shouldEscalate(aiAnalysis, ticketInput)) {
      return this.createEscalationDecision(aiAnalysis);
    }

    if (aiAnalysis.confidence < this.config.lowConfidenceThreshold) {
      return this.createManualReviewDecision(
        aiAnalysis,
        `AI confidence (${aiAnalysis.confidence.toFixed(2)}) below threshold (${this.config.lowConfidenceThreshold})`
      );
    }

    if (this.isAmbiguous(aiAnalysis, ticketInput)) {
      return this.createManualReviewDecision(
        aiAnalysis,
        'Ticket appears ambiguous or contains conflicting signals'
      );
    }

    if (
      this.config.enableAutoRouting &&
      aiAnalysis.confidence >= this.config.highConfidenceThreshold
    ) {
      return this.createAutoRouteDecision(aiAnalysis);
    }

    return this.createManualReviewDecision(
      aiAnalysis,
      `AI confidence (${aiAnalysis.confidence.toFixed(2)}) in medium range - manual review recommended`
    );
  }

  private shouldEscalate(aiAnalysis: AIAnalysis, ticketInput: TicketInput): boolean {
    if (aiAnalysis.urgency === 'critical' && ticketInput.customerType === 'enterprise') {
      return true;
    }

    if (aiAnalysis.category === 'outage') {
      return true;
    }

    if (aiAnalysis.urgency === 'critical' && aiAnalysis.confidence > 0.75) {
      return true;
    }

    return false;
  }

  private isAmbiguous(aiAnalysis: AIAnalysis, ticketInput: TicketInput): boolean {
    const descriptionLength = ticketInput.description.length;
    if (descriptionLength < 50) {
      return true;
    }

    if (aiAnalysis.category === 'other') {
      return true;
    }

    if (aiAnalysis.suggestedTeam === 'manual_review') {
      return true;
    }

    if (
      aiAnalysis.urgency === 'low' && 
      (aiAnalysis.category === 'outage' || aiAnalysis.category === 'bug')
    ) {
      return true;
    }

    return false;
  }

  private createEscalationDecision(aiAnalysis: AIAnalysis): RoutingDecision {
    return {
      targetQueue: aiAnalysis.suggestedTeam,
      decisionType: 'escalated',
      reason: `Escalated due to critical urgency (${aiAnalysis.urgency}) - requires immediate attention`,
      confidence: aiAnalysis.confidence,
      requiresReview: false,
      timestamp: new Date()
    };
  }

  private createAutoRouteDecision(aiAnalysis: AIAnalysis): RoutingDecision {
    return {
      targetQueue: aiAnalysis.suggestedTeam,
      decisionType: 'auto',
      reason: `Auto-routed with high confidence (${aiAnalysis.confidence.toFixed(2)}): ${aiAnalysis.explanation}`,
      confidence: aiAnalysis.confidence,
      requiresReview: false,
      timestamp: new Date()
    };
  }

  private createManualReviewDecision(
    aiAnalysis: AIAnalysis,
    reason: string
  ): RoutingDecision {
    return {
      targetQueue: 'manual_review',
      decisionType: 'manual',
      reason: reason,
      confidence: aiAnalysis.confidence,
      requiresReview: true,
      timestamp: new Date()
    };
  }

  explainRules(): string {
    return `
Decision Engine Rules:
1. Critical urgency OR outages → Immediate escalation
2. AI confidence < ${this.config.lowConfidenceThreshold} → Manual review
3. Ambiguous tickets (short description, "other" category) → Manual review
4. High confidence (≥ ${this.config.highConfidenceThreshold}) + clear category → Auto-route
5. Medium confidence → Manual review (safety first)

Auto-routing is ${this.config.enableAutoRouting ? 'ENABLED' : 'DISABLED'}

Philosophy: Prefer correctness over automation. When in doubt, ask a human.
    `.trim();
  }

  updateConfig(config: Partial<DecisionEngineConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getConfig(): DecisionEngineConfig {
    return { ...this.config };
  }
}

