/**
 * AI Orchestration Service
 * Handles model routing, caching, retries, and fallbacks
 */

import { nanoid } from 'nanoid';
import type {
  ModelRequest,
  ModelResponse,
  StreamChunk,
  ModelConfig,
  UsageMetrics,
  ModelName,
  AIProvider,
} from '@/types/ai';
import { ClaudeAdapter } from './adapters/claude';
import { OpenAIAdapter } from './adapters/openai';
import type { ModelAdapter } from './adapters/base';
import { MemoryCache, generateCacheKey } from '@/lib/cache';
import { retryWithBackoff } from '@/lib/retry';
import { logAIRequest, logAIResponse, logCacheEvent } from '@/lib/logger';
import { countMessageTokens, validateTokenCount, truncateMessages } from '@/utils/tokens';
import { sanitizePromptInput, sanitizeMarkdownOutput } from '@/utils/sanitize';

export class AIOrchestrator {
  private adapters: Map<AIProvider, ModelAdapter>;
  private cache: MemoryCache<ModelResponse>;
  private usageMetrics: UsageMetrics[] = [];
  private primaryModel: ModelName;
  private fallbackModel: ModelName;
  private enableCaching: boolean;
  private enableStreaming: boolean;

  constructor(config: {
    anthropicApiKey?: string;
    openaiApiKey?: string;
    primaryModel?: ModelName;
    fallbackModel?: ModelName;
    enableCaching?: boolean;
    enableStreaming?: boolean;
    cacheTTL?: number;
  }) {
    this.adapters = new Map();
    
    // Initialize adapters
    if (config.anthropicApiKey) {
      this.adapters.set('anthropic', new ClaudeAdapter(config.anthropicApiKey));
    }
    
    if (config.openaiApiKey) {
      this.adapters.set('openai', new OpenAIAdapter(config.openaiApiKey));
    }

    // Initialize cache
    this.cache = new MemoryCache<ModelResponse>(
      1000,
      config.cacheTTL || 3600000
    );

    this.primaryModel = config.primaryModel || 'claude-3-5-sonnet-20241022';
    this.fallbackModel = config.fallbackModel || 'gpt-4-turbo-preview';
    this.enableCaching = config.enableCaching ?? true;
    this.enableStreaming = config.enableStreaming ?? true;
  }

  /**
   * Get adapter for a model
   */
  private getAdapter(model: ModelName): ModelAdapter {
    for (const adapter of this.adapters.values()) {
      if (adapter.supportsModel(model)) {
        return adapter;
      }
    }
    
    throw new Error(`No adapter found for model: ${model}`);
  }

  /**
   * Generate completion with caching and retry
   */
  async complete(request: ModelRequest): Promise<ModelResponse> {
    const requestId = nanoid();
    const sessionId = nanoid();
    
    // Sanitize input
    const sanitizedRequest: ModelRequest = {
      ...request,
      messages: request.messages.map(m => ({
        ...m,
        content: sanitizePromptInput(m.content),
      })),
    };

    // Validate and truncate if needed
    const model = sanitizedRequest.model || this.primaryModel;
    let messages = sanitizedRequest.messages;
    
    const tokenCount = countMessageTokens(messages, model);
    const maxTokens = sanitizedRequest.maxTokens || 4096;
    const validation = validateTokenCount(tokenCount, model, maxTokens);
    
    if (!validation.valid) {
      // Truncate messages to fit
      messages = truncateMessages(messages, maxTokens / 2, model);
    }

    // Check cache
    if (this.enableCaching) {
      const cacheKey = generateCacheKey({ messages, model });
      const cached = await this.cache.get(cacheKey);
      
      if (cached) {
        logCacheEvent({ key: cacheKey, hit: true });
        return { ...cached, cached: true };
      }
      
      logCacheEvent({ key: cacheKey, hit: false });
    }

    // Log request
    logAIRequest({
      requestId,
      model,
      provider: this.getAdapter(model).provider,
      promptTokens: tokenCount,
      cached: false,
    });

    // Execute with retry and fallback
    let response: ModelResponse;
    
    try {
      response = await this.executeWithRetryAndFallback(
        { ...sanitizedRequest, messages, model },
        requestId
      );
    } catch (error) {
      throw error;
    }

    // Sanitize output
    response.content = sanitizeMarkdownOutput(response.content);

    // Cache response
    if (this.enableCaching) {
      const cacheKey = generateCacheKey({ messages, model });
      await this.cache.set(cacheKey, response);
    }

    // Log response
    logAIResponse({
      requestId,
      model: response.model,
      provider: response.provider,
      completionTokens: response.usage.completionTokens,
      totalTokens: response.usage.totalTokens,
      latencyMs: response.latencyMs,
      cached: false,
      finishReason: response.finishReason,
    });

    // Track usage
    this.trackUsage({
      sessionId,
      requestId,
      timestamp: Date.now(),
      model: response.model,
      provider: response.provider,
      usage: response.usage,
      latencyMs: response.latencyMs,
      cached: false,
    });

    return response;
  }

  /**
   * Generate streaming completion
   */
  async streamComplete(
    request: ModelRequest,
    onChunk: (chunk: StreamChunk) => void
  ): Promise<ModelResponse> {
    if (!this.enableStreaming) {
      // Fall back to non-streaming
      const response = await this.complete(request);
      onChunk({ delta: response.content, done: true });
      return response;
    }

    const requestId = nanoid();
    const model = request.model || this.primaryModel;
    const adapter = this.getAdapter(model);

    // Sanitize input
    const sanitizedRequest: ModelRequest = {
      ...request,
      messages: request.messages.map(m => ({
        ...m,
        content: sanitizePromptInput(m.content),
      })),
      model,
    };

    const response = await adapter.streamComplete(sanitizedRequest, (chunk) => {
      // Sanitize each chunk
      const sanitizedChunk = {
        ...chunk,
        delta: sanitizeMarkdownOutput(chunk.delta),
      };
      onChunk(sanitizedChunk);
    });

    return response;
  }

  /**
   * Execute request with retry and fallback
   */
  private async executeWithRetryAndFallback(
    request: ModelRequest,
    requestId: string
  ): Promise<ModelResponse> {
    const model = request.model;
    const adapter = this.getAdapter(model);

    try {
      // Try primary model with retry
      return await retryWithBackoff(
        () => adapter.complete(request),
        {
          requestId,
          model,
          provider: adapter.provider,
        }
      );
    } catch (error) {
      // Try fallback model
      if (this.fallbackModel !== model) {
        try {
          const fallbackAdapter = this.getAdapter(this.fallbackModel);
          return await fallbackAdapter.complete({
            ...request,
            model: this.fallbackModel,
          });
        } catch (fallbackError) {
          throw fallbackError;
        }
      }
      
      throw error;
    }
  }

  /**
   * Track usage metrics
   */
  private trackUsage(metrics: UsageMetrics): void {
    this.usageMetrics.push(metrics);
    
    // Keep only last 1000 entries
    if (this.usageMetrics.length > 1000) {
      this.usageMetrics = this.usageMetrics.slice(-1000);
    }
  }

  /**
   * Get usage statistics
   */
  getUsageStats(): {
    totalRequests: number;
    totalTokens: number;
    totalCost: number;
    averageLatency: number;
    cacheHitRate: number;
  } {
    const totalRequests = this.usageMetrics.length;
    const totalTokens = this.usageMetrics.reduce((sum, m) => sum + m.usage.totalTokens, 0);
    const totalCost = this.usageMetrics.reduce(
      (sum, m) => sum + (m.usage.estimatedCost || 0),
      0
    );
    const averageLatency = totalRequests > 0
      ? this.usageMetrics.reduce((sum, m) => sum + m.latencyMs, 0) / totalRequests
      : 0;
    
    const cacheHitRate = this.cache.getHitRate();

    return {
      totalRequests,
      totalTokens,
      totalCost,
      averageLatency,
      cacheHitRate,
    };
  }

  /**
   * Health check all adapters
   */
  async healthCheck(): Promise<Record<AIProvider, boolean>> {
    const results: Record<string, boolean> = {};
    
    for (const [provider, adapter] of this.adapters.entries()) {
      results[provider] = await adapter.healthCheck();
    }
    
    return results as Record<AIProvider, boolean>;
  }
}
