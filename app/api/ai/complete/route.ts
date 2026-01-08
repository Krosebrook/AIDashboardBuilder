/**
 * AI Completion API Route
 * POST /api/ai/complete
 */

import { NextRequest, NextResponse } from 'next/server';
import { AIOrchestrator } from '@/services/orchestrator';
import { validateAndSanitizeRequest } from '@/utils/sanitize';
import { sanitizeErrorMessage } from '@/utils/sanitize';

// Initialize orchestrator
const orchestrator = new AIOrchestrator({
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  openaiApiKey: process.env.OPENAI_API_KEY,
  primaryModel: (process.env.DEFAULT_MODEL as any) || 'claude-3-5-sonnet-20241022',
  fallbackModel: (process.env.FALLBACK_MODEL as any) || 'gpt-4-turbo-preview',
  enableCaching: process.env.ENABLE_CACHING !== 'false',
  enableStreaming: process.env.ENABLE_STREAMING !== 'false',
  cacheTTL: parseInt(process.env.CACHE_TTL || '3600', 10) * 1000,
});

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate and sanitize
    const validation = validateAndSanitizeRequest(body);
    if (!validation.success || !validation.data) {
      return NextResponse.json(
        { error: validation.error || 'Invalid request' },
        { status: 400 }
      );
    }

    // Generate completion
    const response = await orchestrator.complete({
      messages: validation.data.messages,
      model: validation.data.model as any,
      maxTokens: validation.data.maxTokens,
      temperature: validation.data.temperature,
    });

    return NextResponse.json({
      success: true,
      data: {
        content: response.content,
        model: response.model,
        provider: response.provider,
        usage: response.usage,
        cached: response.cached,
        latencyMs: response.latencyMs,
      },
    });
  } catch (error) {
    const errorMessage = sanitizeErrorMessage(error);
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'AI API is running',
  });
}
