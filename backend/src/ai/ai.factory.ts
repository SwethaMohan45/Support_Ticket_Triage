import { IAIService } from './ai.interface';
import { MockAIService } from './mock-ai.service';
import { OpenAIService } from './openai.service';

export class AIServiceFactory {
  static create(config: {
    useMock: boolean;
    openaiApiKey?: string;
    model?: string;
  }): IAIService {
    if (config.useMock) {
      console.log('Using Mock AI Service');
      return new MockAIService();
    }

    if (!config.openaiApiKey) {
      console.warn('OpenAI API key not provided, falling back to Mock AI');
      return new MockAIService();
    }

    console.log('Using OpenAI Service');
    return new OpenAIService(config.openaiApiKey, config.model);
  }
}

