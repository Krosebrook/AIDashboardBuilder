/**
 * Base model adapter interface
 */

import type {
  ModelRequest,
  ModelResponse,
  StreamChunk,
  AIProvider,
  ModelName,
} from '@/types/ai';

export interface ModelAdapter {
  readonly provider: AIProvider;
  readonly supportedModels: ModelName[];
  
  /**
   * Generate completion
   */
  complete(request: ModelRequest): Promise<ModelResponse>;
  
  /**
   * Generate streaming completion
   */
  streamComplete(
    request: ModelRequest,
    onChunk: (chunk: StreamChunk) => void
  ): Promise<ModelResponse>;
  
  /**
   * Check if model is supported
   */
  supportsModel(model: ModelName): boolean;
  
  /**
   * Health check
   */
  healthCheck(): Promise<boolean>;
}

/**
 * Abstract base adapter with common functionality
 */
export abstract class BaseModelAdapter implements ModelAdapter {
  abstract readonly provider: AIProvider;
  abstract readonly supportedModels: ModelName[];
  
  protected apiKey: string;
  protected baseURL?: string;

  constructor(apiKey: string, baseURL?: string) {
    this.apiKey = apiKey;
    this.baseURL = baseURL;
  }

  abstract complete(request: ModelRequest): Promise<ModelResponse>;
  
  abstract streamComplete(
    request: ModelRequest,
    onChunk: (chunk: StreamChunk) => void
  ): Promise<ModelResponse>;

  supportsModel(model: ModelName): boolean {
    return this.supportedModels.includes(model);
  }

  async healthCheck(): Promise<boolean> {
    try {
      // Simple health check with minimal request
      await this.complete({
        messages: [{ role: 'user', content: 'test' }],
        model: this.supportedModels[0],
        maxTokens: 5,
      });
      return true;
    } catch {
      return false;
    }
  }

  protected validateRequest(request: ModelRequest): void {
    if (!this.supportsModel(request.model)) {
      throw new Error(
        `Model ${request.model} is not supported by ${this.provider} adapter`
      );
    }

    if (!request.messages || request.messages.length === 0) {
      throw new Error('Messages array cannot be empty');
    }
  }

  protected calculateCost(
    promptTokens: number,
    completionTokens: number,
    model: ModelName
  ): number {
    // Pricing per 1M tokens (as of 2024)
    const pricing: Record<string, { input: number; output: number }> = {
      'claude-3-5-sonnet-20241022': { input: 3.0, output: 15.0 },
      'claude-3-opus-20240229': { input: 15.0, output: 75.0 },
      'gpt-4-turbo-preview': { input: 10.0, output: 30.0 },
      'gpt-4': { input: 30.0, output: 60.0 },
      'gpt-3.5-turbo': { input: 0.5, output: 1.5 },
    };

    const modelPricing = pricing[model] || { input: 1.0, output: 2.0 };
    
    const inputCost = (promptTokens / 1_000_000) * modelPricing.input;
    const outputCost = (completionTokens / 1_000_000) * modelPricing.output;
    
    return inputCost + outputCost;
  }
}
