# GlowBot - Multi-Niche AI Content Engine

## Overview

GlowBot is a comprehensive AI-powered content generation platform designed for affiliate marketing across multiple niches including skincare, tech, fashion, fitness, food, travel, and pets. The application combines real-time trend detection with intelligent content generation to create platform-optimized social media content with built-in affiliate tracking and analytics.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript and Vite for development
- **UI Library**: Shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom theme variables
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite with custom configuration for monorepo structure

### Backend Architecture
- **Runtime**: Node.js with Express server
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **AI Services**: OpenAI GPT-4 and Anthropic Claude integration for content generation
- **Caching**: In-memory caching for trending data and frequently accessed content

### Database Design
- **ORM**: Drizzle ORM with schema-first approach
- **Schema Location**: `shared/schema.ts` for type sharing between frontend and backend
- **Migration Strategy**: Drizzle Kit for schema migrations
- **Connection**: Neon serverless PostgreSQL with connection pooling

## Key Components

### Content Generation Engine
- **Multi-AI Support**: Integrated OpenAI GPT-4 and Anthropic Claude models
- **Template System**: Dynamic prompt templates organized by niche and content type
- **Tone Customization**: 11 different tone options (friendly, professional, enthusiastic, etc.)
- **Platform Optimization**: Content tailored for TikTok, Instagram, YouTube, and other platforms

### Trend Detection System
- **Multi-Platform Scrapers**: Amazon, TikTok, YouTube, Instagram, Reddit, and Google Trends
- **Perplexity Intelligence**: Real-time trend data from Perplexity API with authentic product research
- **AI Fallback**: When scrapers fail, GPT generates realistic trending products
- **Cache Management**: Smart caching to avoid rate limits and improve performance
- **Real-time Updates**: Configurable refresh intervals for trending data

### Affiliate Marketing Infrastructure
- **Link Management**: Smart redirect system with click tracking
- **Amazon Integration**: Built-in Amazon affiliate link generation
- **Performance Analytics**: Click tracking, conversion monitoring, and ROI analysis
- **Batch Processing**: Automated daily content generation for multiple niches

### Webhook Integration
- **Make.com Integration**: Automated content distribution to external platforms
- **Batch Webhooks**: Support for sending multiple content pieces simultaneously
- **Error Handling**: Robust retry logic and error reporting for webhook failures

## Data Flow

1. **Trend Collection**: Scrapers collect trending products from multiple platforms
2. **Content Generation**: AI models create niche-specific content using trending data
3. **Content Optimization**: Platform-specific formatting and hashtag generation
4. **Distribution**: Webhook integration sends content to Make.com for publishing
5. **Analytics**: Click tracking and performance monitoring feed back into the system

## External Dependencies

### Required Services
- **Database**: Neon PostgreSQL (configured via DATABASE_URL)
- **AI Services**: OpenAI API (OPENAI_API_KEY) and Anthropic Claude (ANTHROPIC_API_KEY)
- **Analytics**: Google Analytics (VITE_GA_MEASUREMENT_ID)
- **Automation**: Make.com webhook integration (MAKE_WEBHOOK_URL)

### Optional Services
- **Perplexity API**: For enhanced trend analysis (PERPLEXITY_API_KEY)
- **Amazon Affiliate**: For affiliate link generation
- **Social Platform APIs**: For direct posting capabilities

### External Libraries
- **UI Components**: Radix UI primitives for accessible component foundation
- **Styling**: Tailwind CSS for utility-first styling approach
- **Validation**: Zod for runtime type validation
- **HTTP Client**: Axios for external API communications
- **Scraping**: Cheerio for web scraping functionality

## Deployment Strategy

### Docker Support
- **Multi-stage Build**: Optimized Docker builds for production deployment
- **Environment Configuration**: Comprehensive environment variable management
- **Production Optimization**: Vite production builds with asset optimization

### Development Workflow
- **Hot Reload**: Vite development server with HMR support
- **Type Safety**: Shared TypeScript types between frontend and backend
- **Database Migrations**: Drizzle Kit for schema management
- **Error Handling**: Runtime error overlays for development debugging

### Scaling Considerations
- **Connection Pooling**: Neon serverless connection management
- **Caching Strategy**: In-memory caching with planned Redis integration
- **Rate Limiting**: Built-in rate limiting for content generation endpoints
- **Monitoring**: Comprehensive logging and analytics integration

## Changelog

- July 08, 2025. Initial setup
- July 08, 2025. Perplexity API integration completed - Real-time trending product data with authentic social media metrics now operational
- July 08, 2025. **Major Enhancement**: Complete Perplexity automation framework implemented:
  - ✅ `pullPerplexityTrends()` backend function created with comprehensive product parsing
  - ✅ `/api/pull-perplexity-trends` API route for manual triggering
  - ✅ Trending AI Picks page enhanced with Perplexity fetch button and real-time updates
  - ✅ Daily cron job scheduled for 5:00 AM ET automatic trend fetching
  - ✅ Frontend filters updated to default to Perplexity-sourced products
  - ✅ Database schema verified with source column for tracking data origin
  - ✅ Comprehensive error handling, toast notifications, and loading states implemented
- July 08, 2025. **Major UI Enhancement**: Full-featured sidebar navigation system implemented:
  - ✅ Complete sidebar component with 25+ pages organized into 7 logical categories
  - ✅ Layout wrapper component providing consistent application structure
  - ✅ Mobile-responsive design with collapsible sidebar and hamburger menu
  - ✅ Active page highlighting with visual indicators and smooth transitions
  - ✅ Lucide React icons for intuitive navigation and visual differentiation
  - ✅ Template routing system with niche-specific content generator integration

## User Preferences

Preferred communication style: Simple, everyday language.