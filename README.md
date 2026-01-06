# Support Ticket Triage & Routing System

An AI-powered system that automatically triages and routes customer support tickets. Uses AI for analysis but applies business rules for final routing decisions to ensure safety and correctness.

## The Problem

Support teams manually sort through hundreds of tickets daily. It's slow, tickets get misrouted, urgent issues get buried, and response times suffer. This system automates the triage process while keeping humans in control.

## How It Works

```
Ticket → AI Analysis → Decision Engine → Route to Queue
         (suggests)    (decides)          (with audit trail)
```

The AI analyzes tickets and provides recommendations. The decision engine applies business rules to make the final routing decision. Humans can override any decision.

### Core Components

- **AI Service**: Analyzes tickets, classifies category and urgency, provides confidence scores
- **Decision Engine**: Applies business rules to AI recommendations (never auto-routes on low confidence)
- **Storage**: Keeps full audit trail of every decision and override
- **API**: REST endpoints for ticket management
- **UI**: React interface for viewing and overriding decisions

## Decision Rules

The system applies rules in this order:

1. Critical urgency or outages get escalated immediately
2. Low AI confidence (< 0.60) goes to manual review
3. Ambiguous content (short descriptions, unclear category) goes to manual review
4. High confidence (>= 0.85) can be auto-routed
5. Everything else goes to manual review


## Setup

### Prerequisites

- Node.js 18+
- npm

### Backend

```bash
cd backend
npm install

# Create .env file
echo "PORT=3001
USE_MOCK_AI=true
HIGH_CONFIDENCE_THRESHOLD=0.85
LOW_CONFIDENCE_THRESHOLD=0.60
ENABLE_AUTO_ROUTING=true
CORS_ORIGIN=http://localhost:3000" > .env

npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Access the UI at http://localhost:3000

## API Reference

### Create Ticket

```http
POST /api/tickets
{
  "title": "Cannot access account",
  "description": "Getting 500 error when trying to login",
  "customerType": "enterprise"
}
```

### Get Tickets

```http
GET /api/tickets
GET /api/tickets/:id
GET /api/tickets?status=pending_review
```

### Override Routing

```http
POST /api/tickets/:id/override
{
  "newQueue": "billing",
  "reason": "This is actually a billing issue",
  "overriddenBy": "support@example.com"
}
```

### Queues

```http
GET /api/queues
GET /api/queues/:queueName
```

Available queues: `billing`, `engineering`, `product`, `support`, `manual_review`

### System

```http
GET /api/system/health
GET /api/system/stats
GET /api/system/rules
```

## Project Structure

```
backend/
  src/
    models/          - TypeScript types
    ai/              - AI service (mock + OpenAI)
    decision-engine/ - Business rules
    services/        - Ticket orchestration
    storage/         - Persistence layer
    routes/          - API endpoints
    
frontend/
  src/
    pages/           - React components
    api.ts           - API client
```

## AI Analysis

The AI analyzes each ticket and returns:

- **Category**: billing, bug, feature_request, outage, other
- **Urgency**: low, medium, high, critical
- **Confidence**: 0 to 1 score
- **Explanation**: Why it made this classification
- **Reasoning Factors**: What it considered

Example output:

```json
{
  "category": "billing",
  "urgency": "high",
  "suggestedTeam": "billing",
  "confidence": 0.87,
  "explanation": "Classified as billing with high urgency for enterprise customer",
  "reasoningFactors": [
    "Customer type: enterprise",
    "Key indicators: payment, invoice",
    "Description length: 85 words"
  ]
}
```

## Configuration

Adjust thresholds in `.env`:

```bash
HIGH_CONFIDENCE_THRESHOLD=0.85
LOW_CONFIDENCE_THRESHOLD=0.60
ENABLE_AUTO_ROUTING=true
```

## Testing

Try these examples:

**High confidence billing:**
```json
{
  "title": "Cannot process payment",
  "description": "Card keeps getting declined when updating billing info",
  "customerType": "paid"
}
```

**Critical escalation:**
```json
{
  "title": "Production system down",
  "description": "URGENT: All users getting 500 errors",
  "customerType": "enterprise"
}
```

**Ambiguous (manual review):**
```json
{
  "title": "Help needed",
  "description": "Having issues",
  "customerType": "free"
}
```

## Limitations

- English only
- No authentication
- In-memory storage (data lost on restart unless using JSON)
- No real-time updates
- 5 categories only
- No SLA tracking


## Future Enhancements

- Real database (PostgreSQL)
- User authentication
- Real-time updates via WebSocket
- Analytics dashboard
- Multi-language support
- Integration with existing ticketing systems

---

This is a reference implementation showing how to build a production-quality AI system with proper safeguards and human oversight.
