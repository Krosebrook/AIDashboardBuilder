/**
 * Health Check API Route
 * GET /api/health
 */

import { NextResponse } from 'next/server';
import { AIOrchestrator } from '@/services/orchestrator';

const orchestrator = new AIOrchestrator({
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  openaiApiKey: process.env.OPENAI_API_KEY,
});

export async function GET() {
  try {
    const adaptersHealth = await orchestrator.healthCheck();
    const usageStats = orchestrator.getUsageStats();

    const allHealthy = Object.values(adaptersHealth).every(status => status);

    return NextResponse.json({
      status: allHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      adapters: adaptersHealth,
      stats: usageStats,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}
