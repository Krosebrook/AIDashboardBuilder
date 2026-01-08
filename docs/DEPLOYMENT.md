# Deployment Guide

## Quick Start

### Prerequisites

- Node.js 18+ or Docker
- Redis (optional, for distributed caching)
- GPU with NVIDIA drivers (optional, for GPU acceleration)

### Docker Deployment (Recommended)

```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f app
```

### Node.js Deployment

```bash
# Install and build
npm ci --production
npm run build

# Start server
npm start
```

---

## Environment Configuration

See `.env.example` for all available options.

**Essential Variables:**

```env
NODE_ENV=production
ANTHROPIC_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
REDIS_URL=redis://redis:6379
```

---

## Cloud Platforms

### Vercel

```bash
vercel --prod
```

### AWS/GCP/Azure

See full deployment guide for cloud-specific instructions.

---

## Security Checklist

- [ ] Use environment variables for secrets
- [ ] Enable HTTPS/TLS
- [ ] Set up firewall rules
- [ ] Enable rate limiting
- [ ] Regular security updates

For complete deployment instructions, troubleshooting, and scaling strategies, see the full documentation.
