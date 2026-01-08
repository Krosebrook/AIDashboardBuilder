/**
 * Structured logging utility using Winston
 */

import winston from 'winston';

// Log levels
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

// Custom format for structured logs
const structuredFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: structuredFormat,
  transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
          return `${timestamp as string} [${level}]: ${message as string} ${metaStr}`;
        })
      ),
    }),
    // File transport for errors
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: structuredFormat,
    }),
    // File transport for all logs
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: structuredFormat,
    }),
  ],
});

/**
 * Log AI request
 */
export function logAIRequest(data: {
  requestId: string;
  model: string;
  provider: string;
  promptTokens: number;
  cached?: boolean;
}): void {
  logger.info('AI Request', {
    type: 'ai_request',
    ...data,
  });
}

/**
 * Log AI response
 */
export function logAIResponse(data: {
  requestId: string;
  model: string;
  provider: string;
  completionTokens: number;
  totalTokens: number;
  latencyMs: number;
  cached: boolean;
  finishReason: string;
}): void {
  logger.info('AI Response', {
    type: 'ai_response',
    ...data,
  });
}

/**
 * Log AI error
 */
export function logAIError(data: {
  requestId: string;
  model: string;
  provider: string;
  error: string;
  retryable: boolean;
  attempt?: number;
}): void {
  logger.error('AI Error', {
    type: 'ai_error',
    ...data,
  });
}

/**
 * Log cache hit/miss
 */
export function logCacheEvent(data: {
  key: string;
  hit: boolean;
  ttl?: number;
}): void {
  logger.debug('Cache Event', {
    type: 'cache_event',
    ...data,
  });
}

/**
 * Log performance metric
 */
export function logPerformance(data: {
  metric: string;
  value: number;
  unit: string;
  context?: Record<string, unknown>;
}): void {
  logger.info('Performance Metric', {
    type: 'performance',
    ...data,
  });
}

/**
 * Log security event
 */
export function logSecurityEvent(data: {
  event: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: string;
  ipAddress?: string;
}): void {
  logger.warn('Security Event', {
    type: 'security',
    ...data,
  });
}

/**
 * Log user interaction
 */
export function logUserInteraction(data: {
  event: string;
  component: string;
  metadata?: Record<string, unknown>;
}): void {
  logger.debug('User Interaction', {
    type: 'interaction',
    ...data,
  });
}

/**
 * Generic log function
 */
export function log(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
  logger.log(level, message, meta);
}

export default logger;
