/**
 * Token counting and validation utilities
 * Uses tiktoken for accurate token counting
 */

import { encoding_for_model } from 'tiktoken';
import type { ModelName, Message } from '@/types/ai';

// Model to encoding map
const MODEL_ENCODINGS: Record<string, string> = {
  'gpt-4': 'cl100k_base',
  'gpt-4-turbo-preview': 'cl100k_base',
  'gpt-3.5-turbo': 'cl100k_base',
  'claude-3-5-sonnet-20241022': 'cl100k_base',
  'claude-3-opus-20240229': 'cl100k_base',
};

/**
 * Count tokens in a string for a specific model
 */
export function countTokens(text: string, model: ModelName): number {
  try {
    const encodingName = MODEL_ENCODINGS[model] || 'cl100k_base';
    const encoding = encoding_for_model(encodingName as Parameters<typeof encoding_for_model>[0]);
    const tokens = encoding.encode(text);
    encoding.free();
    return tokens.length;
  } catch (error) {
    // Fallback: rough approximation (1 token ≈ 4 characters)
    return Math.ceil(text.length / 4);
  }
}

/**
 * Count tokens for an array of messages
 */
export function countMessageTokens(messages: Message[], model: ModelName): number {
  let totalTokens = 0;
  
  for (const message of messages) {
    // Base tokens per message
    totalTokens += 4; // Every message has overhead
    
    // Role tokens
    totalTokens += countTokens(message.role, model);
    
    // Content tokens
    totalTokens += countTokens(message.content, model);
  }
  
  // Add tokens for message formatting
  totalTokens += 2;
  
  return totalTokens;
}

/**
 * Truncate text to fit within token limit
 */
export function truncateToTokenLimit(
  text: string,
  maxTokens: number,
  model: ModelName,
  suffix: string = '...'
): string {
  const currentTokens = countTokens(text, model);
  
  if (currentTokens <= maxTokens) {
    return text;
  }
  
  const suffixTokens = countTokens(suffix, model);
  const targetTokens = maxTokens - suffixTokens;
  
  // Binary search for the right length
  let left = 0;
  let right = text.length;
  let result = text;
  
  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    const truncated = text.slice(0, mid);
    const tokens = countTokens(truncated, model);
    
    if (tokens <= targetTokens) {
      result = truncated;
      left = mid + 1;
    } else {
      right = mid;
    }
  }
  
  return result + suffix;
}

/**
 * Truncate messages array to fit within token limit
 */
export function truncateMessages(
  messages: Message[],
  maxTokens: number,
  model: ModelName
): Message[] {
  const currentTokens = countMessageTokens(messages, model);
  
  if (currentTokens <= maxTokens) {
    return messages;
  }
  
  // Keep system message and most recent messages
  const systemMessages = messages.filter(m => m.role === 'system');
  const otherMessages = messages.filter(m => m.role !== 'system');
  
  let truncated = [...systemMessages];
  let tokenCount = countMessageTokens(truncated, model);
  
  // Add messages from the end (most recent first)
  for (let i = otherMessages.length - 1; i >= 0; i--) {
    const msg = otherMessages[i];
    const msgTokens = countTokens(msg.content, model) + 4;
    
    if (tokenCount + msgTokens <= maxTokens) {
      truncated.push(msg);
      tokenCount += msgTokens;
    } else {
      break;
    }
  }
  
  return truncated;
}

/**
 * Validate token count is within model limits
 */
export function validateTokenCount(
  tokenCount: number,
  model: ModelName,
  maxTokens?: number
): { valid: boolean; error?: string } {
  const limits: Record<string, number> = {
    'claude-3-5-sonnet-20241022': 200000,
    'claude-3-opus-20240229': 200000,
    'gpt-4-turbo-preview': 128000,
    'gpt-4': 8192,
    'gpt-3.5-turbo': 16385,
  };
  
  const modelLimit = limits[model] || 4096;
  const effectiveLimit = maxTokens ? Math.min(maxTokens, modelLimit) : modelLimit;
  
  if (tokenCount > effectiveLimit) {
    return {
      valid: false,
      error: `Token count (${tokenCount}) exceeds limit (${effectiveLimit}) for model ${model}`,
    };
  }
  
  return { valid: true };
}
