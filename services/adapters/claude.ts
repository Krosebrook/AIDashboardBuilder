/**
 * Anthropic Claude adapter with streaming support
 */

import Anthropic from '@anthropic-ai/sdk';
import type { ModelRequest, ModelResponse, StreamChunk, ModelName } from '@/types/ai';
import { BaseModelAdapter } from './base';
import { countMessageTokens } from '@/utils/tokens';

export class ClaudeAdapter extends BaseModelAdapter {
  readonly provider = 'anthropic' as const;
  readonly supportedModels: ModelName[] = [
    'claude-3-5-sonnet-20241022',
    'claude-3-opus-20240229',
  ];

  private client: Anthropic;

  constructor(apiKey: string, baseURL?: string) {
    super(apiKey, baseURL);
    this.client = new Anthropic({
      apiKey,
      baseURL,
    });
  }

  async complete(request: ModelRequest): Promise<ModelResponse> {
    this.validateRequest(request);

    const startTime = Date.now();

    try {
      const systemPrompt = request.systemPrompt || 
        request.messages.find(m => m.role === 'system')?.content;
      
      const messages = request.messages.filter(m => m.role !== 'system');

      const response = await this.client.messages.create({
        model: request.model,
        max_tokens: request.maxTokens || 4096,
        temperature: request.temperature ?? 0.7,
        messages: messages.map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
        system: systemPrompt,
      });

      const latencyMs = Date.now() - startTime;
      
      const content = response.content
        .filter(block => block.type === 'text')
        .map(block => (block as any).text)
        .join('');

      const promptTokens = countMessageTokens(request.messages, request.model);
      const completionTokens = response.usage.output_tokens;
      const totalTokens = promptTokens + completionTokens;

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
        finishReason: response.stop_reason === 'end_turn' ? 'stop' : 'length',
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
      const systemPrompt = request.systemPrompt || 
        request.messages.find(m => m.role === 'system')?.content;
      
      const messages = request.messages.filter(m => m.role !== 'system');

      const stream = await this.client.messages.create({
        model: request.model,
        max_tokens: request.maxTokens || 4096,
        temperature: request.temperature ?? 0.7,
        messages: messages.map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
        system: systemPrompt,
        stream: true,
      });

      for await (const event of stream) {
        if (event.type === 'content_block_delta') {
          const delta = (event.delta as any).text || '';
          fullContent += delta;
          
          onChunk({
            delta,
            done: false,
          });
        } else if (event.type === 'message_delta') {
          completionTokens = (event.usage as any)?.output_tokens || 0;
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

  private handleError(error: unknown): Error {
    if (error instanceof Anthropic.APIError) {
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
