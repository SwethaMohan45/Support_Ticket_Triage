import { IAIService } from './ai.interface';
import { 
  TicketInput, 
  AIAnalysis, 
  TicketCategory, 
  UrgencyLevel,
  TeamQueue,
  CustomerType
} from '../models/ticket.model';

export class MockAIService implements IAIService {
  
  async analyzeTicket(input: TicketInput): Promise<AIAnalysis> {
    await this.delay(300);

    const text = `${input.title} ${input.description}`.toLowerCase();
    
    const category = this.classifyCategory(text);
    const urgency = this.determineUrgency(text, input.customerType);
    const suggestedTeam = this.suggestTeam(category);
    const confidence = this.calculateConfidence(text, category, urgency);
    const reasoningFactors = this.getReasoningFactors(text, input, category, urgency);
    const explanation = this.generateExplanation(category, urgency, confidence, input);

    return {
      category,
      urgency,
      suggestedTeam,
      explanation,
      confidence,
      reasoningFactors,
      timestamp: new Date()
    };
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }

  private classifyCategory(text: string): TicketCategory {
    if (this.containsAny(text, ['payment', 'invoice', 'billing', 'charge', 'refund', 'subscription', 'price', 'cost'])) {
      return 'billing';
    }

    if (this.containsAny(text, ['down', 'outage', 'not working', 'cant access', 'cannot login', 'crash', 'error 500'])) {
      return 'outage';
    }

    if (this.containsAny(text, ['bug', 'error', 'broken', 'issue', 'problem', 'not working', 'glitch', 'incorrect'])) {
      return 'bug';
    }

    if (this.containsAny(text, ['feature', 'request', 'enhancement', 'suggestion', 'would like', 'add support', 'integrate'])) {
      return 'feature_request';
    }

    return 'other';
  }

  private determineUrgency(text: string, customerType: CustomerType): UrgencyLevel {
    if (this.containsAny(text, ['urgent', 'critical', 'emergency', 'production down', 'outage', 'data loss'])) {
      return 'critical';
    }

    if (this.containsAny(text, ['asap', 'important', 'broken', 'not working', 'blocked', 'cant access'])) {
      return customerType === 'enterprise' ? 'critical' : 'high';
    }

    if (this.containsAny(text, ['issue', 'problem', 'error', 'bug'])) {
      return customerType === 'free' ? 'low' : 'medium';
    }

    if (customerType === 'enterprise') return 'high';
    if (customerType === 'paid') return 'medium';
    return 'low';
  }

  private suggestTeam(category: TicketCategory): TeamQueue {
    const mapping: Record<TicketCategory, TeamQueue> = {
      billing: 'billing',
      bug: 'engineering',
      outage: 'engineering',
      feature_request: 'product',
      other: 'support'
    };
    return mapping[category];
  }

  private calculateConfidence(
    text: string, 
    category: TicketCategory, 
    urgency: UrgencyLevel
  ): number {
    let confidence = 0.5;

    const categoryKeywords = this.getCategoryKeywords(category);
    const matchCount = categoryKeywords.filter(kw => text.includes(kw)).length;
    confidence += Math.min(matchCount * 0.1, 0.3);

    const wordCount = text.split(/\s+/).length;
    if (wordCount > 50) confidence += 0.1;
    if (wordCount > 100) confidence += 0.1;

    if (this.containsAny(text, ['help', 'issue', 'problem']) && wordCount < 20) {
      confidence -= 0.2;
    }

    const categories = ['billing', 'bug', 'outage', 'feature'];
    const categoryMatches = categories.filter(cat => text.includes(cat)).length;
    if (categoryMatches > 1) {
      confidence -= 0.15;
    }

    return Math.max(0.3, Math.min(0.95, confidence));
  }

  private generateExplanation(
    category: TicketCategory, 
    urgency: UrgencyLevel,
    confidence: number,
    input: TicketInput
  ): string {
    const categoryDesc = category.replace('_', ' ');
    const customerDesc = input.customerType === 'enterprise' ? 'enterprise customer' :
                        input.customerType === 'paid' ? 'paid customer' : 'free tier customer';
    
    let explanation = `Classified as ${categoryDesc} with ${urgency} urgency for ${customerDesc}. `;
    
    if (confidence > 0.8) {
      explanation += 'High confidence based on clear indicators in the ticket description.';
    } else if (confidence > 0.6) {
      explanation += 'Moderate confidence - ticket contains relevant keywords but may need review.';
    } else {
      explanation += 'Lower confidence - ticket description is ambiguous or lacks clear indicators.';
    }

    return explanation;
  }

  private getReasoningFactors(
    text: string, 
    input: TicketInput,
    category: TicketCategory,
    urgency: UrgencyLevel
  ): string[] {
    const factors: string[] = [];

    factors.push(`Customer type: ${input.customerType}`);
    factors.push(`Category classification: ${category}`);
    factors.push(`Urgency level: ${urgency}`);

    const wordCount = text.split(/\s+/).length;
    factors.push(`Description length: ${wordCount} words`);

    const categoryKeywords = this.getCategoryKeywords(category);
    const foundKeywords = categoryKeywords.filter(kw => text.includes(kw));
    if (foundKeywords.length > 0) {
      factors.push(`Key indicators: ${foundKeywords.slice(0, 3).join(', ')}`);
    }

    if (input.metadata?.previousTickets) {
      factors.push(`Previous tickets: ${input.metadata.previousTickets}`);
    }

    return factors;
  }

  private containsAny(text: string, keywords: string[]): boolean {
    return keywords.some(keyword => text.includes(keyword));
  }

  private getCategoryKeywords(category: TicketCategory): string[] {
    const keywords: Record<TicketCategory, string[]> = {
      billing: ['payment', 'invoice', 'billing', 'charge', 'refund'],
      bug: ['bug', 'error', 'broken', 'issue'],
      outage: ['down', 'outage', 'not working'],
      feature_request: ['feature', 'request', 'enhancement'],
      other: []
    };
    return keywords[category] || [];
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

