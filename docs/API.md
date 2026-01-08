# API Documentation

## Overview

The AI Dashboard Builder provides RESTful API endpoints for AI model interaction, streaming responses, and health monitoring.

Base URL: `http://localhost:3000/api`

---

## Authentication

All API requests require valid API keys configured server-side. API keys are never exposed to the client.

```env
ANTHROPIC_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
```

---

## Endpoints

### POST /api/ai/complete

Generate a completion from an AI model.

**Request Body:**

```json
{
  "messages": [
    {
      "role": "user",
      "content": "What is the capital of France?"
    }
  ],
  "model": "claude-3-5-sonnet-20241022",
  "maxTokens": 1000,
  "temperature": 0.7
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "content": "The capital of France is Paris.",
    "model": "claude-3-5-sonnet-20241022",
    "provider": "anthropic",
    "usage": {
      "promptTokens": 15,
      "completionTokens": 8,
      "totalTokens": 23,
      "estimatedCost": 0.000069
    },
    "cached": false,
    "latencyMs": 1234
  }
}
```

**Error Response:**

```json
{
  "success": false,
  "error": "Token count exceeds limit"
}
```

---

### POST /api/ai/stream

Stream a completion from an AI model using Server-Sent Events.

**Request Body:** Same as `/api/ai/complete`

**Response:** Stream of Server-Sent Events

```
data: {"delta":"The","done":false}

data: {"delta":" capital","done":false}

data: [DONE]
```

---

### GET /api/health

Check the health status of the application and AI providers.

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2024-01-08T12:00:00.000Z",
  "adapters": {
    "anthropic": true,
    "openai": true
  },
  "stats": {
    "totalRequests": 1234,
    "totalTokens": 45678,
    "totalCost": 1.234,
    "averageLatency": 1456,
    "cacheHitRate": 0.72
  }
}
```

For full API documentation, see the complete guide in this file.
