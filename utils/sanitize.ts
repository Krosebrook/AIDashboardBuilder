/**
 * Input/output sanitization utilities
 * Prevents prompt injection and XSS attacks
 */

import { z } from 'zod';

/**
 * Sanitize user input to prevent prompt injection
 */
export function sanitizePromptInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  // Remove control characters
  let sanitized = input.replace(/[\x00-\x1F\x7F]/g, '');
  
  // Limit length to prevent abuse
  const MAX_INPUT_LENGTH = 50000;
  if (sanitized.length > MAX_INPUT_LENGTH) {
    sanitized = sanitized.slice(0, MAX_INPUT_LENGTH);
  }
  
  // Detect and warn about potential prompt injection patterns
  const injectionPatterns = [
    /ignore\s+previous\s+instructions/gi,
    /ignore\s+all\s+previous/gi,
    /system\s*:\s*you\s+are/gi,
    /assistant\s*:\s*sure/gi,
    /\[INST\]/gi,
    /<\|im_start\|>/gi,
  ];
  
  for (const pattern of injectionPatterns) {
    if (pattern.test(sanitized)) {
      // Log warning but allow through with sanitization
      console.warn('Potential prompt injection detected');
      // Escape the pattern
      sanitized = sanitized.replace(pattern, match => `[SANITIZED: ${match}]`);
    }
  }
  
  return sanitized.trim();
}

/**
 * Sanitize HTML output to prevent XSS
 */
export function sanitizeHtmlOutput(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }
  
  // Basic HTML escaping
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitize markdown output (allow safe markdown)
 */
export function sanitizeMarkdownOutput(markdown: string): string {
  if (!markdown || typeof markdown !== 'string') {
    return '';
  }
  
  // Remove script tags and event handlers
  let sanitized = markdown
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '');
  
  return sanitized;
}

/**
 * Validate API request data
 */
export const ApiRequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string().min(1).max(50000),
    })
  ).min(1).max(100),
  model: z.string().optional(),
  maxTokens: z.number().int().min(1).max(4096).optional(),
  temperature: z.number().min(0).max(2).optional(),
  stream: z.boolean().optional(),
});

export type ValidatedApiRequest = z.infer<typeof ApiRequestSchema>;

/**
 * Validate and sanitize API request
 */
export function validateAndSanitizeRequest(data: unknown): {
  success: boolean;
  data?: ValidatedApiRequest;
  error?: string;
} {
  try {
    const validated = ApiRequestSchema.parse(data);
    
    // Sanitize all message content
    const sanitized: ValidatedApiRequest = {
      ...validated,
      messages: validated.messages.map(msg => ({
        ...msg,
        content: sanitizePromptInput(msg.content),
      })),
    };
    
    return { success: true, data: sanitized };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
      };
    }
    return { success: false, error: 'Invalid request data' };
  }
}

/**
 * Sanitize error messages for client
 */
export function sanitizeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Remove sensitive information
    const message = error.message
      .replace(/api[_-]?key[:\s=]+[^\s]+/gi, 'API_KEY=***')
      .replace(/token[:\s=]+[^\s]+/gi, 'TOKEN=***')
      .replace(/password[:\s=]+[^\s]+/gi, 'PASSWORD=***');
    
    return message;
  }
  
  return 'An unexpected error occurred';
}

/**
 * Rate limiting key generation
 */
export function generateRateLimitKey(
  identifier: string,
  namespace: string = 'api'
): string {
  // Sanitize identifier
  const sanitized = identifier.replace(/[^a-zA-Z0-9_-]/g, '');
  return `ratelimit:${namespace}:${sanitized}`;
}
