# 🎬 ScriptTok

**AI-powered dual content generator for viral and affiliate TikTok scripts**

ScriptTok is a comprehensive content generation platform designed to create high-quality social media content across various niches and platforms using multiple AI models. The platform features two distinct content studios: **Viral Content Studio** for trend-based viral content and **Affiliate Content Studio** for product-focused content, both powered by advanced AI research capabilities.

## ✨ Features Overview

### 🔥 Dual Content Generation Modes
- **Viral Content Studio**: Trend-based viral content with Perplexity-powered research
- **Affiliate Content Studio**: Product-focused content with intelligent research capabilities

### 🚀 Core Features
- **AI-Powered Trend Discovery**: Real-time trending topic analysis using Perplexity API
- **Multi-Template System**: Diverse content templates for both viral and affiliate content
- **Real-Time Viral Score Analysis**: AI-driven content quality assessment and scoring
- **Content History & Analytics**: Comprehensive tracking and performance monitoring
- **Multi-Platform Optimization**: Content adapted for TikTok, Instagram, YouTube, Twitter, and Facebook
- **Smart AI Model Routing**: Intelligent routing between OpenAI, Claude, and Perplexity
- **Trend Forecasting**: Advanced trend prediction and analysis system
- **Bulk Content Generation**: Automated batch content creation with scheduling
- **Content Evaluation System**: Dual AI evaluation for comprehensive quality assessment

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: Shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS with custom design system
- **State Management**: TanStack React Query v5
- **Routing**: Wouter
- **Form Handling**: React Hook Form with Zod validation

### Backend
- **Runtime**: Node.js with ES modules
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM (Neon serverless provider)
- **API Design**: RESTful endpoints with rate limiting
- **Caching**: Redis-compatible caching layer with file-based fallback
- **Middleware**: Morgan logging, CORS, Express rate limiter

### AI Services
- **OpenAI API**: GPT-4 and GPT-3.5 for content generation
- **Anthropic Claude**: Primary AI provider for content generation and diversity
- **Perplexity API**: Trend discovery and viral content inspiration

### Database & Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting
- **Drizzle ORM**: Type-safe database interactions
- **Redis Caching**: Performance optimization (optional)

## 📁 Project Structure

```
scripttok/
├── client/                    # React frontend application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── lib/             # Utilities and configurations
│   │   └── hooks/           # Custom React hooks
├── server/                   # Express.js backend
│   ├── api/                 # API route handlers
│   ├── services/            # Business logic and external API integrations
│   ├── cache/               # Caching layer implementation
│   └── amazon/              # Amazon PA-API integration (optional)
├── shared/                   # Shared types and schemas
│   ├── schema.ts            # Database schema definitions
│   └── constants.ts         # Shared constants
├── tests/                    # Test suites
│   ├── e2e/                 # End-to-end tests (Playwright)
│   ├── integration/         # Integration tests
│   └── unit/                # Unit tests (Vitest)
└── migrations/              # Database migration files
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (or Neon account)
- API keys for OpenAI, Claude, and Perplexity

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/scripttok.git
   cd scripttok
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   ```
   
   Configure your environment variables (see [Environment Variables](#environment-variables) section)

4. **Database setup**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`

## 🔧 Running the Application

### Development Scripts
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm start          # Start production server
npm run check      # Type checking
npm run db:push    # Push database schema changes
```

### Available Ports
- **Frontend & Backend**: Port 3000 (unified server)
- **Database**: Configured via `DATABASE_URL`

## 🌐 API Endpoints

### Content Generation
- `POST /api/generate-content` - Single content generation
- `POST /api/generate-content/unified` - Unified content generation system
- `GET /api/content-generation/templates` - List available templates
- `POST /api/content-generation/bulk/start` - Start bulk generation job

### Trending Data
- `GET /api/trending` - Fetch trending products by niche
- `GET /api/trend-forecast/:niche` - Get trend forecasts
- `POST /api/trending/refresh` - Refresh trending data
- `GET /api/trending-emojis-hashtags/:niche` - Get trending hashtags

### Analytics & Monitoring
- `GET /api/analytics/overview` - AI model metrics overview
- `GET /api/history` - Content generation history
- `GET /api/ai-analytics/claude` - Claude AI analytics
- `GET /api/ai-analytics/openai` - OpenAI analytics
- `GET /api/ai-analytics/perplexity` - Perplexity analytics

### System Status
- `GET /api/gatekeeper/status` - Generation gatekeeper status
- `GET /api/amazon/status` - Amazon PA-API status (if enabled)
- `GET /health` - General health check

## 🔐 Environment Variables

### Required Variables
```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/scripttok

# AI Service API Keys
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
PERPLEXITY_API_KEY=pplx-...

# Server Configuration
NODE_ENV=development
PORT=3000
```

### Optional Variables
```env
# Caching
REDIS_URL=redis://localhost:6379

# Amazon PA-API (if enabling Amazon features)
ENABLE_AMAZON_FEATURES=false
AMAZON_ACCESS_KEY_ID=your-access-key
AMAZON_SECRET_ACCESS_KEY=your-secret-key
AMAZON_PARTNER_TAG=your-partner-tag

# Analytics
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Webhooks
MAKE_WEBHOOK_URL=https://hook.make.com/...
```

### Replit Environment
When deploying on Replit, environment variables are managed through the Secrets tab in your Repl. The following secrets are automatically available:
- `ANTHROPIC_API_KEY`
- `OPENAI_API_KEY`
- Database credentials are auto-configured

## 📝 Content Generation Modes

### 🔥 Viral Content Studio
The Viral Content Studio focuses on creating trending, viral content by:
- **Trend Analysis**: Real-time trending topic discovery via Perplexity API
- **Viral Score Calculation**: AI-powered content evaluation for viral potential
- **Template Variety**: Multiple viral content templates (storytelling, hooks, trending formats)
- **Platform Optimization**: Content adapted for maximum engagement on each platform

### 💰 Affiliate Content Studio  
The Affiliate Content Studio specializes in product-focused content by:
- **Product Research**: Intelligent product discovery and analysis
- **Affiliate Integration**: Smart affiliate link integration and optimization
- **Conversion Optimization**: Content designed for maximum conversion rates
- **Product Templates**: Specialized templates for product reviews, comparisons, and promotions

### 🤖 AI Model Routing
The system intelligently routes requests between:
- **Claude (Primary)**: High-quality content generation and analysis
- **OpenAI GPT-4**: Creative content and diverse writing styles
- **Perplexity**: Research, trend discovery, and factual content

## 🎯 Key Features Detail

### Trend Forecasting & Analysis
- **Real-time Data**: Live trending topic discovery across multiple sources
- **Niche-Specific Trends**: Targeted trend analysis for beauty, tech, fashion, fitness, food, travel, and pets
- **Viral Prediction**: AI-powered viral potential scoring
- **Trend History**: Comprehensive trend tracking and historical analysis

### Content Evaluation & Scoring
- **Dual AI Evaluation**: Content assessed by both Claude and OpenAI
- **Quality Metrics**: Comprehensive scoring across multiple dimensions
- **Performance Tracking**: Historical performance data and insights
- **Smart Recommendations**: AI-generated improvement suggestions

### Template System
- **Dynamic Templates**: Adaptable content templates for various niches
- **Platform-Specific**: Optimized templates for each social media platform
- **Custom Variables**: Flexible template system with smart variable injection
- **Performance-Based**: Templates optimized based on historical performance data

### Multi-Platform Content Adaptation
- **TikTok**: Short-form video scripts with hooks and trending elements
- **Instagram**: Story, reel, and post content with hashtag optimization
- **YouTube**: Long-form content with SEO optimization
- **Twitter**: Concise, engaging tweet threads and single posts
- **Facebook**: Community-focused content with engagement drivers

## 🧪 Development

### Testing Setup
```bash
# Run all tests
npm test

# Run E2E tests
npx playwright test

# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration
```

### Code Structure & Conventions
- **TypeScript**: Strict type checking enabled
- **ESM Modules**: Modern ES module syntax
- **Drizzle ORM**: Type-safe database operations
- **Zod Validation**: Schema validation for API requests
- **Component Architecture**: Reusable component design patterns

### Database Migrations
```bash
# Push schema changes to database
npm run db:push

# Force push schema changes (if warnings)
npm run db:push --force
```

**⚠️ Important**: Always use `npm run db:push` for schema changes. Never manually write SQL migrations.

## 🚀 Deployment

### Replit Deployment
1. **Create New Repl**: Import from GitHub repository
2. **Configure Secrets**: Add required API keys in the Secrets tab
3. **Database Setup**: Use Replit's built-in PostgreSQL database
4. **Deploy**: Use Replit's one-click deployment

### Production Considerations
- **Environment Variables**: Ensure all required variables are set
- **Database**: Use a production PostgreSQL instance (Neon recommended)
- **Caching**: Configure Redis for production caching
- **Monitoring**: Set up logging and error tracking
- **Rate Limiting**: Configure appropriate rate limits for API endpoints

### Build Configuration
```bash
# Production build
npm run build

# Start production server
npm start
```

## 🤝 Contributing

### Development Guidelines
- **Code Style**: Follow existing TypeScript and React patterns
- **Testing**: Add tests for new features and bug fixes
- **Documentation**: Update documentation for significant changes
- **Type Safety**: Maintain strict TypeScript compliance

### How to Contribute
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Reporting Issues
- Use GitHub Issues for bug reports and feature requests
- Include detailed reproduction steps for bugs
- Provide environment information and error logs

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🔗 Links

- **Documentation**: [Full API Documentation](docs/api.md)
- **Support**: [GitHub Issues](https://github.com/your-username/scripttok/issues)
- **Contributing**: [Contributing Guidelines](CONTRIBUTING.md)

---

<div align="center">
  <strong>Built with ❤️ for content creators worldwide</strong>
</div>