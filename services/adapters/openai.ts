/**
 * OpenAI adapter with streaming support
 */

import OpenAI from 'openai';
import type { ModelRequest, ModelResponse, StreamChunk, ModelName } from '@/types/ai';
import { BaseModelAdapter } from './base';
import { countMessageTokens } from '@/utils/tokens';

export class OpenAIAdapter extends BaseModelAdapter {
  readonly provider = 'openai' as const;
  readonly supportedModels: ModelName[] = [
    'gpt-4-turbo-preview',
    'gpt-4',
    'gpt-3.5-turbo',
  ];

  private client: OpenAI;

  constructor(apiKey: string, baseURL?: string) {
    super(apiKey, baseURL);
    this.client = new OpenAI({
      apiKey,
      baseURL,
    });
  }

  async complete(request: ModelRequest): Promise<ModelResponse> {
    this.validateRequest(request);

    const startTime = Date.now();

    try {
      const response = await this.client.chat.completions.create({
        model: request.model,
        messages: request.messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
        max_tokens: request.maxTokens || 4096,
        temperature: request.temperature ?? 0.7,
      });

      const latencyMs = Date.now() - startTime;
      
      const content = response.choices[0]?.message?.content || '';
      const finishReason = response.choices[0]?.finish_reason || 'stop';

      const promptTokens = response.usage?.prompt_tokens || 
        countMessageTokens(request.messages, request.model);
      const completionTokens = response.usage?.completion_tokens || 0;
      const totalTokens = response.usage?.total_tokens || (promptTokens + completionTokens);

      return {
        content,
        model: request.model,
        provider: this.provider,
        usage: {
          promptTokens,
          completionTokens,
          totalTokens,
          estimatedCost: this.calculateCost(promptTokens, completionTokens, request.model),
        },
        finishReason: this.mapFinishReason(finishReason),
        latencyMs,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async streamComplete(
    request: ModelRequest,
    onChunk: (chunk: StreamChunk) => void
  ): Promise<ModelResponse> {
    this.validateRequest(request);

    const startTime = Date.now();
    let fullContent = '';
    let completionTokens = 0;

    try {
      const stream = await this.client.chat.completions.create({
        model: request.model,
        messages: request.messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
        max_tokens: request.maxTokens || 4096,
        temperature: request.temperature ?? 0.7,
        stream: true,
      });

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content || '';
        
        if (delta) {
          fullContent += delta;
          
          onChunk({
            delta,
            done: false,
          });
        }
        
        // OpenAI doesn't provide token counts in stream, estimate at end
        if (chunk.choices[0]?.finish_reason) {
          completionTokens = Math.ceil(fullContent.length / 4); // Rough estimate
        }
      }

      // Final chunk
      onChunk({
        delta: '',
        done: true,
        usage: {
          completionTokens,
        },
      });

      const latencyMs = Date.now() - startTime;
      const promptTokens = countMessageTokens(request.messages, request.model);
      const totalTokens = promptTokens + completionTokens;

      return {
        content: fullContent,
        model: request.model,
        provider: this.provider,
        usage: {
          promptTokens,
          completionTokens,
          totalTokens,
          estimatedCost: this.calculateCost(promptTokens, completionTokens, request.model),
        },
        finishReason: 'stop',
        latencyMs,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private mapFinishReason(reason: string): 'stop' | 'length' | 'content_filter' | 'error' {
    switch (reason) {
      case 'stop':
        return 'stop';
      case 'length':
        return 'length';
      case 'content_filter':
        return 'content_filter';
      default:
        return 'error';
    }
  }

  private handleError(error: unknown): Error {
    if (error instanceof OpenAI.APIError) {
      const retryable = error.status === 429 || error.status === 503 || error.status === 504;
      return {
        name: 'ModelError',
        message: error.message,
        code: error.status?.toString() || 'UNKNOWN',
        provider: this.provider,
        retryable,
        originalError: error,
      } as any;
    }
    
    return error as Error;
  }
}
