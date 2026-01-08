# 🚀 AI Dashboard Builder

> Production-grade AI orchestration platform with GPU acceleration, streaming support, and intelligent caching

[![CI/CD](https://github.com/Krosebrook/AIDashboardBuilder/actions/workflows/ci.yml/badge.svg)](https://github.com/Krosebrook/AIDashboardBuilder/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.1-black.svg)](https://nextjs.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

---

## ✨ Features

### 🧠 AI Orchestration
- **Multi-Provider Support**: Claude (Anthropic) and OpenAI with automatic fallback
- **GPU Acceleration**: Ready for vLLM, Triton inference servers
- **Streaming Responses**: Real-time token streaming with Server-Sent Events
- **Intelligent Caching**: Redis + LRU cache with TTL management
- **Token Management**: Accurate counting, validation, and truncation
- **Cost Tracking**: Per-request token usage and cost estimation
- **Retry Logic**: Exponential backoff with configurable retry strategies

### 🖼️ Frontend Components
- **HeroSection**: Smooth parallax scrolling with framer-motion
- **Diagrams**: Lazy-loaded, modular diagram components
  - Flowchart diagrams
  - Sequence diagrams
  - Architecture diagrams
  - Mindmap visualizations
- **Performance Optimized**: Code splitting, lazy loading, memoization
- **Fully Accessible**: ARIA compliant, keyboard navigation, reduced motion support

### 🔒 Security
- **Input Sanitization**: Prompt injection detection and prevention
- **Output Encoding**: XSS protection with HTML/Markdown sanitization
- **API Key Security**: Server-side only, environment-based configuration
- **Request Validation**: Zod schema validation on all API endpoints
- **OWASP Compliant**: Following security best practices

### ⚡ Performance
- **Bundle Optimization**: Tree-shaking, code splitting, dynamic imports
- **Efficient Rendering**: Memoization, IntersectionObserver, requestAnimationFrame
- **Caching Strategy**: Multi-layer caching with cache-hit tracking
- **Monitoring**: Structured logging with Winston, metrics tracking

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend Layer                        │
│  Next.js 14 + React + TypeScript + Tailwind CSS         │
│  - HeroSection (Parallax)                               │
│  - Diagrams (Lazy Loaded)                               │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                   API Layer (Next.js)                    │
│  - /api/ai/complete (Standard completions)              │
│  - /api/ai/stream (Streaming SSE)                       │
│  - /api/health (Health checks)                          │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│               AI Orchestration Service                   │
│  - Model Adapters (Claude, OpenAI)                      │
│  - Retry + Fallback Logic                               │
│  - Token Counting & Validation                          │
│  - Input/Output Sanitization                            │
└────────────────────┬────────────────────────────────────┘
                     │
      ┌──────────────┴──────────────┐
      │                             │
┌─────▼──────┐              ┌──────▼─────┐
│   Cache    │              │  AI Models  │
│  Redis/LRU │              │ Claude/GPT  │
└────────────┘              └─────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm 9+
- Docker (optional, for containerized deployment)
- Redis (optional, for distributed caching)

### Installation

```bash
# Clone the repository
git clone https://github.com/Krosebrook/AIDashboardBuilder.git
cd AIDashboardBuilder

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env and add your API keys
# ANTHROPIC_API_KEY=your_key_here
# OPENAI_API_KEY=your_key_here
```

### Development

```bash
# Run development server
npm run dev

# Open http://localhost:3000
```

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build Docker image only
docker build -t ai-dashboard-builder .

# Run with GPU support
docker run --gpus all -p 3000:3000 ai-dashboard-builder
```

---

## 📚 Documentation

- [Production Optimization Checklist](./PRODUCTION_OPTIMIZATION_CHECKLIST.md)
- [API Documentation](./docs/API.md)
- [Architecture Overview](./docs/ARCHITECTURE.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)

---

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run E2E tests
npm run test:e2e

# Type checking
npm run type-check

# Linting
npm run lint
```

---

## 📊 Performance Metrics

- **Bundle Size**: Optimized with code splitting
- **Time to Interactive**: < 3s on 3G
- **Lighthouse Score**: 95+ across all categories
- **Cache Hit Rate**: 70%+ on repeated queries
- **API Latency**: < 200ms (cached), < 2s (uncached)

---

## 🔧 Configuration

Key environment variables:

```env
# AI Provider Keys
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...

# Model Configuration
DEFAULT_MODEL=claude-3-5-sonnet-20241022
FALLBACK_MODEL=gpt-4-turbo-preview
MAX_TOKENS=4096

# Cache Configuration
REDIS_URL=redis://localhost:6379
CACHE_TTL=3600
ENABLE_CACHING=true

# Feature Flags
ENABLE_STREAMING=true
ENABLE_LOGGING=true
LOG_LEVEL=info

# GPU Inference (Optional)
VLLM_ENDPOINT=http://localhost:8000
TRITON_ENDPOINT=http://localhost:8001
```

---

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- AI powered by [Anthropic Claude](https://www.anthropic.com/) and [OpenAI](https://openai.com/)
- Animations by [Framer Motion](https://www.framer.com/motion/)
- UI styling with [Tailwind CSS](https://tailwindcss.com/)

---

## 📞 Support

For support, email support@aidashboard.dev or open an issue on GitHub.

---

<div align="center">
  <p>Built with ❤️ for production AI applications</p>
</div>
