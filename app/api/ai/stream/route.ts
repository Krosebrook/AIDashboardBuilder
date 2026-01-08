/**
 * AI Streaming API Route
 * POST /api/ai/stream
 */

import { NextRequest } from 'next/server';
import { AIOrchestrator } from '@/services/orchestrator';
import { validateAndSanitizeRequest } from '@/utils/sanitize';

// Initialize orchestrator
const orchestrator = new AIOrchestrator({
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  openaiApiKey: process.env.OPENAI_API_KEY,
  primaryModel: (process.env.DEFAULT_MODEL as any) || 'claude-3-5-sonnet-20241022',
  fallbackModel: (process.env.FALLBACK_MODEL as any) || 'gpt-4-turbo-preview',
  enableCaching: false, // Disable caching for streaming
  enableStreaming: true,
});

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate and sanitize
    const validation = validateAndSanitizeRequest(body);
    if (!validation.success || !validation.data) {
      return new Response(
        JSON.stringify({ error: validation.error || 'Invalid request' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create readable stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          await orchestrator.streamComplete(
            {
              messages: validation.data!.messages,
              model: validation.data!.model as any,
              maxTokens: validation.data!.maxTokens,
              temperature: validation.data!.temperature,
            },
            (chunk) => {
              // Send Server-Sent Events format
              const data = JSON.stringify(chunk);
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          );

          // Send done event
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          const errorData = JSON.stringify({
            error: error instanceof Error ? error.message : 'Stream error',
          });
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
