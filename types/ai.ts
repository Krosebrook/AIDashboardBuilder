/**
 * Core AI model types and interfaces
 */

export type AIProvider = 'anthropic' | 'openai' | 'vllm' | 'triton';

export type ModelName = 
  | 'claude-3-5-sonnet-20241022'
  | 'claude-3-opus-20240229'
  | 'gpt-4-turbo-preview'
  | 'gpt-4'
  | 'gpt-3.5-turbo';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ModelRequest {
  messages: Message[];
  model: ModelName;
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
  systemPrompt?: string;
}

export interface ModelResponse {
  content: string;
  model: ModelName;
  provider: AIProvider;
  usage: TokenUsage;
  finishReason: 'stop' | 'length' | 'content_filter' | 'error';
  cached?: boolean;
  latencyMs: number;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCost?: number;
}

export interface StreamChunk {
  delta: string;
  usage?: Partial<TokenUsage>;
  done: boolean;
}

export interface CacheOptions {
  ttl: number; // seconds
  key: string;
  enabled: boolean;
}

export interface RetryOptions {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

export interface ModelConfig {
  provider: AIProvider;
  model: ModelName;
  apiKey: string;
  baseURL?: string;
  maxTokens: number;
  temperature: number;
  enableStreaming: boolean;
  cache?: CacheOptions;
  retry?: RetryOptions;
}

export interface UsageMetrics {
  sessionId: string;
  requestId: string;
  timestamp: number;
  model: ModelName;
  provider: AIProvider;
  usage: TokenUsage;
  latencyMs: number;
  cached: boolean;
  error?: string;
}

export interface PromptTemplate {
  id: string;
  name: string;
  template: string;
  variables: string[];
  fingerprint: string;
}

export interface ModelError {
  code: string;
  message: string;
  provider: AIProvider;
  retryable: boolean;
  originalError?: unknown;
}
