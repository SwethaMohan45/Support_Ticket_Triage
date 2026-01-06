import OpenAI from 'openai';
import { IAIService } from './ai.interface';
import { 
  TicketInput, 
  AIAnalysis, 
  TicketCategory, 
  UrgencyLevel,
  TeamQueue
} from '../models/ticket.model';

export class OpenAIService implements IAIService {
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model = 'gpt-4-turbo-preview') {
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  async analyzeTicket(input: TicketInput): Promise<AIAnalysis> {
    try {
      const prompt = this.buildPrompt(input);
      
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt()
          },
          {
            role: 'user',
            content: prompt
          }
        ],
          temperature: 0.3,
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('Empty response from OpenAI');
      }

      const parsed = JSON.parse(content);
      return this.parseAIResponse(parsed);
    } catch (error) {
      console.error('OpenAI analysis failed:', error);
      throw new Error(`AI analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.client.models.list();
      return true;
    } catch {
      return false;
    }
  }

  private buildPrompt(input: TicketInput): string {
    return `Analyze this support ticket and provide structured output in JSON format.

Ticket Details:
Title: ${input.title}
Description: ${input.description}
Customer Type: ${input.customerType}
${input.metadata?.tags ? `Tags: ${input.metadata.tags.join(', ')}` : ''}
${input.metadata?.previousTickets ? `Previous Tickets: ${input.metadata.previousTickets}` : ''}

Provide analysis in this exact JSON structure:
{
  "category": "billing|bug|feature_request|outage|other",
  "urgency": "low|medium|high|critical",
  "suggestedTeam": "billing|engineering|product|support|manual_review",
  "explanation": "Brief explanation of your classification",
  "confidence": 0.0-1.0,
  "reasoningFactors": ["factor1", "factor2", ...]
}

Guidelines:
- Choose ONE category that best fits
- Urgency should consider customer type (enterprise = higher priority)
- Confidence should reflect certainty (0.5 = uncertain, 0.9+ = very confident)
- Include 3-5 reasoning factors explaining your decision
- Be honest about uncertainty - low confidence is better than wrong high confidence`;
  }

  private getSystemPrompt(): string {
    return `You are an expert support ticket classifier for a SaaS company.
Your job is to analyze tickets and provide structured classification.

Important guidelines:
- Be conservative with confidence scores - prefer lower confidence when uncertain
- Consider customer type in urgency assessment (enterprise customers need faster response)
- Outages and critical issues should always be flagged as high/critical urgency
- Provide clear, actionable reasoning factors
- You are ADVISORY only - humans will make final routing decisions
- When in doubt, suggest manual_review as the team

Return only valid JSON matching the requested structure.`;
  }

  private parseAIResponse(parsed: any): AIAnalysis {
    const category = this.normalizeCategory(parsed.category);
    const urgency = this.normalizeUrgency(parsed.urgency);
    const suggestedTeam = this.normalizeTeam(parsed.suggestedTeam);
    const confidence = Math.max(0, Math.min(1, parsed.confidence || 0.5));

    return {
      category,
      urgency,
      suggestedTeam,
      explanation: parsed.explanation || 'No explanation provided',
      confidence,
      reasoningFactors: Array.isArray(parsed.reasoningFactors) 
        ? parsed.reasoningFactors 
        : [],
      timestamp: new Date()
    };
  }

  private normalizeCategory(value: string): TicketCategory {
    const valid: TicketCategory[] = ['billing', 'bug', 'feature_request', 'outage', 'other'];
    return valid.includes(value as TicketCategory) ? value as TicketCategory : 'other';
  }

  private normalizeUrgency(value: string): UrgencyLevel {
    const valid: UrgencyLevel[] = ['low', 'medium', 'high', 'critical'];
    return valid.includes(value as UrgencyLevel) ? value as UrgencyLevel : 'medium';
  }

  private normalizeTeam(value: string): TeamQueue {
    const valid: TeamQueue[] = ['billing', 'engineering', 'product', 'support', 'manual_review'];
    return valid.includes(value as TeamQueue) ? value as TeamQueue : 'manual_review';
  }
}

