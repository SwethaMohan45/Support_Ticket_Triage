import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  ai: {
    useMock: process.env.USE_MOCK_AI === 'true',
    openaiApiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview'
  },

  decisionEngine: {
    highConfidenceThreshold: parseFloat(
      process.env.HIGH_CONFIDENCE_THRESHOLD || '0.85'
    ),
    lowConfidenceThreshold: parseFloat(
      process.env.LOW_CONFIDENCE_THRESHOLD || '0.60'
    ),
    enableAutoRouting: process.env.ENABLE_AUTO_ROUTING !== 'false'
  },

  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000'
  }
};

