import { Ticket } from './models/ticket.model';

export const seedTickets: Ticket[] = [
  {
    id: 'seed-1',
    input: {
      title: 'Cannot process payment for premium upgrade',
      description: 'My credit card keeps getting declined when I try to upgrade to the premium plan. The card works fine on other websites. I need access to premium features for my project deadline.',
      customerType: 'paid',
      metadata: {
        previousTickets: 1
      }
    },
    status: 'routed',
    aiAnalysis: {
      category: 'billing',
      urgency: 'high',
      suggestedTeam: 'billing',
      explanation: 'Classified as billing with high urgency for paid customer.',
      confidence: 0.92,
      reasoningFactors: [
        'Customer type: paid',
        'Category classification: billing',
        'Key indicators: payment, credit card, upgrade',
        'Description length: 145 words'
      ],
      timestamp: new Date()
    },
    routingDecision: {
      targetQueue: 'billing',
      decisionType: 'auto',
      reason: 'Auto-routed with high confidence (0.92): Classified as billing with high urgency for paid customer.',
      confidence: 0.92,
      requiresReview: false,
      timestamp: new Date()
    },
    overrideHistory: [],
    createdAt: new Date(Date.now() - 3600000),
    updatedAt: new Date(Date.now() - 3600000)
  },
  {
    id: 'seed-2',
    input: {
      title: 'Production system showing 500 errors',
      description: 'URGENT: Our production application started showing 500 errors about 10 minutes ago. All users are affected and cannot access the system. This is impacting our business operations.',
      customerType: 'enterprise',
      metadata: {
        previousTickets: 5
      }
    },
    status: 'escalated',
    aiAnalysis: {
      category: 'outage',
      urgency: 'critical',
      suggestedTeam: 'engineering',
      explanation: 'Classified as outage with critical urgency for enterprise customer.',
      confidence: 0.95,
      reasoningFactors: [
        'Customer type: enterprise',
        'Category classification: outage',
        'Urgency level: critical',
        'Key indicators: 500 errors, production, urgent'
      ],
      timestamp: new Date()
    },
    routingDecision: {
      targetQueue: 'engineering',
      decisionType: 'escalated',
      reason: 'Escalated due to critical urgency (critical) - requires immediate attention',
      confidence: 0.95,
      requiresReview: false,
      timestamp: new Date()
    },
    overrideHistory: [],
    createdAt: new Date(Date.now() - 7200000),
    updatedAt: new Date(Date.now() - 7200000)
  },
  {
    id: 'seed-3',
    input: {
      title: 'Request to add dark mode feature',
      description: 'I would like to suggest adding a dark mode option to the application. Many users work late at night and would benefit from a dark theme. This would improve user experience significantly.',
      customerType: 'paid',
      metadata: {
        previousTickets: 0
      }
    },
    status: 'routed',
    aiAnalysis: {
      category: 'feature_request',
      urgency: 'low',
      suggestedTeam: 'product',
      explanation: 'Classified as feature request with low urgency for paid customer.',
      confidence: 0.88,
      reasoningFactors: [
        'Customer type: paid',
        'Category classification: feature_request',
        'Key indicators: suggest, adding, feature',
        'Description length: 98 words'
      ],
      timestamp: new Date()
    },
    routingDecision: {
      targetQueue: 'product',
      decisionType: 'auto',
      reason: 'Auto-routed with high confidence (0.88): Classified as feature request with low urgency for paid customer.',
      confidence: 0.88,
      requiresReview: false,
      timestamp: new Date()
    },
    overrideHistory: [],
    createdAt: new Date(Date.now() - 10800000),
    updatedAt: new Date(Date.now() - 10800000)
  },
  {
    id: 'seed-4',
    input: {
      title: 'Help needed',
      description: 'Having some issues',
      customerType: 'free'
    },
    status: 'pending_review',
    aiAnalysis: {
      category: 'other',
      urgency: 'low',
      suggestedTeam: 'support',
      explanation: 'Lower confidence - ticket description is ambiguous or lacks clear indicators.',
      confidence: 0.35,
      reasoningFactors: [
        'Customer type: free',
        'Category classification: other',
        'Description length: 3 words'
      ],
      timestamp: new Date()
    },
    routingDecision: {
      targetQueue: 'manual_review',
      decisionType: 'manual',
      reason: 'Ticket appears ambiguous or contains conflicting signals',
      confidence: 0.35,
      requiresReview: true,
      timestamp: new Date()
    },
    overrideHistory: [],
    createdAt: new Date(Date.now() - 14400000),
    updatedAt: new Date(Date.now() - 14400000)
  },
  {
    id: 'seed-5',
    input: {
      title: 'Search functionality not working correctly',
      description: 'When I search for products, the results are not accurate. For example, searching for "laptop" returns phone accessories. This has been happening since the last update.',
      customerType: 'paid',
      metadata: {
        previousTickets: 2
      }
    },
    status: 'routed',
    aiAnalysis: {
      category: 'bug',
      urgency: 'medium',
      suggestedTeam: 'engineering',
      explanation: 'Classified as bug with medium urgency for paid customer.',
      confidence: 0.86,
      reasoningFactors: [
        'Customer type: paid',
        'Category classification: bug',
        'Key indicators: not working, issue',
        'Description length: 112 words'
      ],
      timestamp: new Date()
    },
    routingDecision: {
      targetQueue: 'engineering',
      decisionType: 'auto',
      reason: 'Auto-routed with high confidence (0.86): Classified as bug with medium urgency for paid customer.',
      confidence: 0.86,
      requiresReview: false,
      timestamp: new Date()
    },
    overrideHistory: [],
    createdAt: new Date(Date.now() - 18000000),
    updatedAt: new Date(Date.now() - 18000000)
  }
];

