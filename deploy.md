# GlowBot Deployment Guide

## Common Deployment Issues and Solutions

### 1. Environment Variables
Ensure all required environment variables are set:
- `DATABASE_URL` - PostgreSQL connection string
- `OPENAI_API_KEY` - OpenAI API key
- `ANTHROPIC_API_KEY` - Anthropic Claude API key
- `SESSION_SECRET` - Secure session secret
- `PORT` - Server port (optional, defaults to 5000)

### 2. Database Connection
The application uses Neon PostgreSQL with WebSocket support. Make sure:
- Database URL is properly formatted: `postgresql://username:password@host:port/database`
- Database is accessible from deployment environment
- WebSocket connections are allowed

### 3. Memory Requirements
The build process requires increased memory:
- Docker: Set memory limit to at least 4GB
- Node.js: Use `--max-old-space-size=8192` flag
- Recommended minimum: 8GB RAM for deployment

### 4. Health Check
Use the `/api/health` endpoint to verify deployment:
```bash
curl https://your-deployment-url/api/health
```

### 5. Common Port Issues
The application uses PORT environment variable or defaults to 5000.
Many platforms (Heroku, Railway, etc.) assign dynamic ports.

### 6. Build Optimization
- Dependencies are optimized for production
- Static assets are served efficiently
- Database connections are pooled

## Deployment Checklist
- [ ] All environment variables configured
- [ ] Database accessible and migrations run
- [ ] Health check endpoint returns 200
- [ ] Static assets loading correctly
- [ ] API endpoints responding
- [ ] WebSocket connections working (if applicable)

## Troubleshooting
1. Check `/api/health` endpoint for system status
2. Verify database connection string
3. Ensure all required API keys are set
4. Check memory limits and build configuration
5. Review application logs for specific errors