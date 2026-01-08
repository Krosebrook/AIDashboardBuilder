/**
 * Token utility tests
 */

import {
  countTokens,
  countMessageTokens,
  truncateToTokenLimit,
  validateTokenCount,
} from '@/utils/tokens';
import type { Message, ModelName } from '@/types/ai';

describe('Token Utilities', () => {
  const model: ModelName = 'gpt-4';

  describe('countTokens', () => {
    it('should count tokens in a string', () => {
      const text = 'Hello, world!';
      const count = countTokens(text, model);
      expect(count).toBeGreaterThan(0);
      expect(typeof count).toBe('number');
    });

    it('should return 0 for empty string', () => {
      const count = countTokens('', model);
      expect(count).toBe(0);
    });
  });

  describe('countMessageTokens', () => {
    it('should count tokens in messages', () => {
      const messages: Message[] = [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there!' },
      ];
      
      const count = countMessageTokens(messages, model);
      expect(count).toBeGreaterThan(0);
    });

    it('should handle empty messages array', () => {
      const count = countMessageTokens([], model);
      expect(count).toBeGreaterThan(0); // Still has overhead
    });
  });

  describe('truncateToTokenLimit', () => {
    it('should truncate text to fit token limit', () => {
      const text = 'This is a long text that needs to be truncated';
      const maxTokens = 5;
      
      const truncated = truncateToTokenLimit(text, maxTokens, model);
      const tokenCount = countTokens(truncated, model);
      
      expect(tokenCount).toBeLessThanOrEqual(maxTokens);
      expect(truncated).toContain('...');
    });

    it('should not truncate if within limit', () => {
      const text = 'Short text';
      const maxTokens = 100;
      
      const result = truncateToTokenLimit(text, maxTokens, model);
      expect(result).toBe(text);
    });
  });

  describe('validateTokenCount', () => {
    it('should validate token count within limits', () => {
      const result = validateTokenCount(100, model, 1000);
      expect(result.valid).toBe(true);
    });

    it('should reject token count exceeding limits', () => {
      const result = validateTokenCount(10000, model, 1000);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
