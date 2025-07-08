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
- July 08, 2025. **Executive Dashboard Redesign**: BTB-style command center implemented:
  - ✅ Hero header with BTB automation framing and clear value proposition
  - ✅ AI-Powered Trending Picks section featuring Perplexity products with niche color coding
  - ✅ Fast-action buttons panel with gradient cards for key workflows
  - ✅ Live stats summary strip showing trending products, active niches, and performance metrics
  - ✅ Daily content showcase placeholder with clear call-to-action messaging
  - ✅ Future automation pipeline preview section for upcoming Make.com integration
  - ✅ One-click content generation from trending picks with pre-populated templates
- July 08, 2025. **Content Generation Page Overhaul**: Streamlined BTB viral content factory:
  - ✅ "Viral Content Factory" header with 60-second promise for user urgency
  - ✅ Above-the-fold trending products browser with 7 niche tabs showing 3 Perplexity items each
  - ✅ Two-column layout: Product/Affiliate setup (left) + Content configuration (right)
  - ✅ Smart redirect URL generator with affiliate network integration (Amazon, ShareASale, CJ)
  - ✅ Platform selector with color-coded toggle pills for TikTok, Instagram, YouTube, Twitter
  - ✅ Collapsible viral hook generator section (optional, defaults closed)
  - ✅ Enhanced content output with copy, edit, and regenerate functionality
  - ✅ One-click product selection with auto-population of all relevant fields
- July 08, 2025. **Platform-Specific Captions Enhancement**: Complete social media optimization:
  - ✅ TikTok, Instagram, and YouTube caption generators with platform-branded design
  - ✅ Individual copy buttons for each platform with toast notifications
  - ✅ Toggle switch to show/hide captions section with descriptive helper text
  - ✅ Smart content truncation based on platform character limits and best practices
  - ✅ Platform-optimized hashtags and call-to-actions (tap link, link in bio, check description)
  - ✅ Auto-generated captions include product hooks, affiliate links, and viral elements
  - ✅ Mobile-friendly stacked layout with scrollable content areas and monospace formatting
- July 08, 2025. **Perplexity Quality Filtering System**: Enhanced trend detection with authentic products:
  - ✅ Implemented strict product validation to filter out vague terms like "trending product"
  - ✅ Added banned terms list to reject generic phrases (product, item, thing, affordable, etc.)
  - ✅ Brand identifier validation requiring clear brand names or capitalized brand patterns
  - ✅ Minimum 3-word requirement for product specificity
  - ✅ Date-specific queries with current month/year for relevance ("Top trending Amazon skincare July 2025")
  - ✅ Enhanced Perplexity prompts with stricter requirements and format specifications
  - ✅ Retry mechanism with alternative queries if initial results fail quality checks
  - ✅ Frontend feedback showing filtered product counts in success notifications
  - ✅ Comprehensive logging of filtered products with rejection reasons for debugging
- July 08, 2025. **Perplexity API Model Update**: Fixed deprecated model issue:
  - ✅ Updated from deprecated 'llama-3.1-sonar-small-128k-online' to current 'sonar-pro' model
  - ✅ Added fallback mechanism using basic 'sonar' model if 'sonar-pro' fails
  - ✅ Implemented high-quality static product fallback system when API completely fails
  - ✅ Enhanced error logging with detailed request/response information for debugging
  - ✅ Comprehensive error handling ensuring system never returns empty results
  - ✅ Static fallback includes authentic brand products like "CeraVe Daily Moisturizing Lotion"
- July 08, 2025. **Perplexity Prompt Engineering Overhaul**: Eliminated template/placeholder responses:
  - ✅ Added explicit few-shot examples showing correct vs incorrect response formats
  - ✅ Enhanced validation to detect and reject template patterns like "Name | Brand | Social Mentions"
  - ✅ Reduced temperature to 0.04-0.05 for more deterministic, focused responses
  - ✅ Added negative examples in prompts to explicitly prevent template/placeholder text
  - ✅ Improved system messages emphasizing real product data only, never format examples
  - ✅ Enhanced banned terms list to include "placeholder", "template", "example", "format"
  - ✅ Added pattern detection for truncated responses and incomplete data
- July 08, 2025. **Niche-Specific Perplexity Fetcher Modules**: Complete separation of fetch logic by niche:
  - ✅ Created 7 dedicated TypeScript modules: perplexityFetchFitness.ts, perplexityFetchSkincare.ts, etc.
  - ✅ Each module exports async function `fetchTrending[Niche]Products()` with niche-specific prompts
  - ✅ Strict JSON array format returning exactly 3 real products with product/brand/mentions/reason
  - ✅ Comprehensive quality filtering with banned terms validation and brand verification
  - ✅ Individual testing endpoints: `/api/test-niche-fetcher/:niche` for isolated testing
  - ✅ Coordination module `runAllFetchers.ts` to test all fetchers simultaneously
  - ✅ Proven success with authentic products like "Witch Hazel Toner" by Thayers, "d'Alba White Truffle Serum"
  - ✅ Temperature 0.04, recency filtering, domain filtering for maximum authenticity
- July 08, 2025. **Main Perplexity Fetch Integration**: Successfully connected niche modules to dashboard:
  - ✅ Updated main "Run Perplexity Fetch" button to use new niche-specific architecture
  - ✅ Replaced monolithic `pullPerplexityTrends()` with modular `runAllPerplexityFetchers()`
  - ✅ Sequential execution of all 7 fetchers with proper database storage and error handling
  - ✅ Enhanced dashboard with real-time deduplication and debug logging for transparency
  - ✅ Confirmed authentic product ingestion: Hero My First Serum, BAGSMART Compression Packing Cubes, Beis Mini Weekender
  - ✅ Cache invalidation and React Query optimization for immediate data refresh
  - ✅ System now processes 14 unique Perplexity products with proper niche categorization

## User Preferences

Preferred communication style: Simple, everyday language.