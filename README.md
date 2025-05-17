# GlowBot - Multi-Niche AI Content Engine

A modular, trend-aware AI content engine for various niches including skincare, tech, fashion, fitness, food, travel, and pet products. GlowBot streamlines social media content creation through advanced AI technologies.

## Features

- Multi-platform social media trend scrapers
- AI-powered content generation
- Real-time trend detection
- Dynamic content templating
- Content history tracking
- Smart emoji and hashtag recommendations
- Multiple template types for each niche

## Docker Deployment

### Prerequisites

- Docker and Docker Compose installed on your system
- API keys for OpenAI and/or Anthropic Claude (depending on which AI models you want to use)

### Quick Start

1. **Clone the repository**

```bash
git clone <repository-url>
cd glowbot
```

2. **Set up environment variables**

Copy the example environment file and update it with your API keys:

```bash
cp .env.example .env
```

Edit the `.env` file with your actual API keys and settings:

```
# Required
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Optional
VITE_GA_MEASUREMENT_ID=your_google_analytics_id (if using analytics)
PERPLEXITY_API_KEY=your_perplexity_api_key (if using Perplexity API)
```

3. **Build and start the containers**

```bash
docker compose up -d
```

This will:
- Build the application container
- Start a PostgreSQL database container
- Configure the necessary networking between containers
- Make the application available on port 5000

4. **Access the application**

Open a web browser and navigate to:

```
http://localhost:5000
```

### Managing the Docker Environment

- **Stop the containers**

```bash
docker compose down
```

- **View logs**

```bash
docker compose logs -f
```

- **Restart after code changes**

```bash
docker compose down
docker compose up -d --build
```

### Production Deployment

For production deployments:

1. Ensure you use proper secrets management (not plain .env files)
2. Configure a reverse proxy like Nginx or Traefik for HTTPS
3. Consider using a managed database service instead of the containerized PostgreSQL

Example cloud deployment options:
- AWS ECS or Fargate
- Google Cloud Run
- Digital Ocean App Platform
- Heroku Container Registry

## Development Setup (Without Docker)

If you prefer to run the application directly on your machine:

1. Install Node.js 20 or later
2. Install PostgreSQL 15 or later
3. Clone the repository
4. Run `npm install`
5. Copy `.env.example` to `.env` and configure variables
6. Run `npm run dev` for development
7. Run `npm run build && npm start` for production

## License

MIT