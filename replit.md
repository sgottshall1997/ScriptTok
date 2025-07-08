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
- July 08, 2025. **Dashboard Product Display Fix**: Resolved duplicate product filtering for balanced niche representation:
  - ✅ Fixed deduplication logic in `getTrendingProductsByNiche()` to prevent duplicate products by title
  - ✅ Enhanced database query to fetch unique products by title while keeping most recent versions
  - ✅ Implemented balanced dashboard algorithm ensuring exactly 3 products per niche are displayed
  - ✅ All 7 niches (skincare, tech, fashion, fitness, food, travel, pets) now properly visible on dashboard
  - ✅ Skincare niche now displays full 3 unique products instead of being limited to 2
  - ✅ Travel and pets products successfully integrated into dashboard display
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
- July 08, 2025. **Dashboard and Viral Content Factory UI Enhancements**: Streamlined product display and data freshness:
  - ✅ Updated dashboard trending products to match viral content factory design with cleaner card layout
  - ✅ Enhanced product cards with better typography, spacing, and red action buttons
  - ✅ Ensured viral content generator pulls fresh Perplexity data with staleTime: 0 and cacheTime: 0
  - ✅ Unified visual design between dashboard and content generator for consistent user experience
  - ✅ Improved trending products browser with updated styling and better product visibility
  - ✅ Fixed Template Explorer dropdown population with proper niche display and error handling
  - ✅ Added dashboard trending products dropdown filter with "All Niches" and individual niche options
- July 08, 2025. **Comprehensive Perplexity Data Quality Validation**: Complete elimination of broken/fake outputs:
  - ✅ Implemented enhanced `isValidProduct()` function with strict validation rules across all 7 fetchers
  - ✅ Added hard filters against template headers like "Name | Brand | Social Mentions"
  - ✅ Enhanced banned terms list including "trending product", "placeholder", "template", "format"
  - ✅ Added regex pattern detection for template formats and incomplete responses
  - ✅ Implemented brand validation requiring real company names, not generic terms
  - ✅ Updated all prompts with "EXACT FORMAT" instructions and "do NOT copy" examples
  - ✅ Added fallback mechanism ensuring exactly 3 valid products or error retry
  - ✅ Created comprehensive test suite `testPerplexityFetchers.ts` with colored CLI output and validation reports
  - ✅ Enhanced API endpoints with validation reporting for debugging and monitoring
- July 08, 2025. **Real Perplexity Viral Inspiration System**: Eliminated mock templates with authentic social media data:
  - ✅ Created `fetchViralVideoInspo.ts` utility for real Perplexity API calls searching TikTok and Instagram
  - ✅ Built `/api/perplexity-trends/viral-inspiration` endpoint with sonar-pro model, 0.04 temperature
  - ✅ Implemented domain filtering for tiktok.com and instagram.com with weekly recency
  - ✅ Added comprehensive error handling with fallback mechanism for API failures
  - ✅ Enhanced frontend with loading states, error messages, and real-time viral content display
  - ✅ Successfully tested with CeraVe: found 5 real TikTok videos with authentic hooks and hashtags
  - ✅ System now analyzes actual viral video patterns instead of using template/placeholder content
  - ✅ Viral inspiration loading takes 2-3 seconds to fetch real data vs instant mock responses
- July 08, 2025. **Product Auto-Fill Enhancement**: Fixed dashboard to viral content factory navigation:
  - ✅ Corrected URL parameter parsing in GenerateContent component using window.location.search
  - ✅ Added useEffect to update state when URL parameters change for proper navigation handling
  - ✅ Dashboard "Generate Content" buttons now automatically populate Product Name field
  - ✅ Both product name and niche are seamlessly transferred via URL parameters
  - ✅ Enhanced user experience with one-click content generation workflow
  - ✅ Fixed Wouter router compatibility issues with query parameter handling
- July 08, 2025. **Amazon Associates Links Section**: Added monetization section to dashboard:
  - ✅ Created dedicated Amazon Associates Links card positioned under main header
  - ✅ Added Hero Balancing Capsule Skin Toner for Face with full affiliate link integration
  - ✅ Added Mighty Patch™ Original patch from Hero Cosmetics with affiliate tracking
  - ✅ Implemented green-themed design indicating monetization opportunities
  - ✅ Two-column responsive grid layout with product descriptions and "View Product" buttons
  - ✅ Links open in new tabs to preserve user session on dashboard
  - ✅ Added FTC-compliant Amazon Associates disclosure statement for transparency
- July 08, 2025. **BTB Framework Completion and UI Text Updates**: Completed remaining 10% of BTB framework with branding changes:
  - ✅ Successfully implemented Cross-Platform Scheduling system with comprehensive content management
  - ✅ Built Bulk Content Generation with multi-tone and template combinations for scalable content creation
  - ✅ Created Performance Analytics dashboard with ROI tracking and conversion monitoring
  - ✅ Fixed sidebar layout issues with proper flex-based structure for independent scrolling
  - ✅ Updated dashboard header from "BTB Command Center" to "Content Command Center" 
  - ✅ Changed sidebar "BTB Framework" category to "Framework" for cleaner branding
  - ✅ Renamed "BTB Automation" to "Automation Checklist" in Integration section
  - ✅ All three BTB framework features now provide 100% feature parity with automated affiliate marketing capabilities
- July 08, 2025. **Complete Niche Migration**: Successfully migrated entire application from "Skincare" to "Beauty and Personal Care":
  - ✅ Database migration: 53 products successfully moved from 'skincare' to 'beauty' niche with full data integrity
  - ✅ Frontend updates: Updated 25+ components including dashboard, content generators, and navigation systems 
  - ✅ Backend API updates: Modified all server endpoints, trending APIs, and content generation systems
  - ✅ Template system: Expanded Beauty & Personal Care to include makeup, haircare, and grooming products
  - ✅ Perplexity integration: Updated fetcher to pull broader beauty/personal care trends beyond skincare-only
  - ✅ Comprehensive scope expansion: App now covers full beauty ecosystem vs limited skincare focus
- July 08, 2025. **Dashboard Display and Insight Issues Fixed**: Resolved trending products visibility and messaging problems:
  - ✅ Fixed dashboard niche filter array from ['skincare'...] to ['beauty'...] for proper product display
  - ✅ Removed perplexity-only source filter allowing all product sources (tiktok, perplexity, etc.) to display
  - ✅ Updated "No trending insight available" fallback message to "Trending across social platforms"
  - ✅ Dashboard now properly shows 3 beauty products instead of 1, with balanced niche representation
  - ✅ All trending products now display meaningful insights or appropriate fallback messaging
- July 08, 2025. **Enhanced Perplexity Fetcher Reason Validation**: Comprehensive upgrade to all seven niche-specific fetchers:
  - ✅ Updated prompts with mandatory specific reason requirements (4-12 words explaining WHY trending)
  - ✅ Added comprehensive few-shot examples for each niche with realistic trending reasons
  - ✅ Enhanced validation logic rejecting vague reasons like "trending", "popular", "viral"
  - ✅ Implemented strict reason length validation (10-80 characters) and banned terms filtering
  - ✅ All fetchers now enforce "Respond ONLY with valid JSON array" with no markdown/headers
  - ✅ Fitness, beauty, tech, fashion, food, travel, and pets fetchers completely upgraded
  - ✅ Strong reason validation prevents generic fallback messages in trending insights
- July 08, 2025. **Complete Viral Content Factory Niche Fix**: Final resolution of skincare to beauty migration:
  - ✅ Fixed hardcoded 'skincare' fallback in GenerateContent.tsx defaulting to 'beauty' instead
  - ✅ Updated all remaining API endpoints and template files to use 'beauty' consistently
  - ✅ Viral inspiration system now properly references "beauty" niche throughout entire application
  - ✅ Dashboard and content generator display consistent "beauty" niche across all components
  - ✅ Fixed hardcoded niches array in GenerateContent.tsx replacing 'skincare' with 'beauty'
  - ✅ Niche dropdown in viral content factory now shows "Beauty & Personal Care" instead of "Skincare"
  - ✅ Complete niche migration from "skincare" to "Beauty & Personal Care" successfully completed
- July 08, 2025. **Comprehensive Content History System Implementation**: Complete structured content generation tracking system:
  - ✅ Enhanced database schema with sessionId, platformsSelected, generatedOutput, affiliateLink, and viralInspo fields
  - ✅ Automatic content generation logging that captures every generation with full metadata
  - ✅ Enhanced Content History page (/content-history) with product name headers and expandable sections
  - ✅ Advanced filtering by niche, platform, and template with real-time search functionality
  - ✅ Copy functionality for content, hooks, hashtags, and affiliate links with toast notifications
  - ✅ Structured storage of viral inspiration data and platform-specific content
  - ✅ ContentHistoryManager utility class for local storage management and analytics
  - ✅ Database migration to add new content_history fields for comprehensive tracking
  - ✅ Individual entry deletion with confirmation and bulk "Clear All" functionality
  - ✅ Enhanced sidebar navigation with "Enhanced Content History" link for easy access
  - ✅ Removed original content history tab and consolidated to single enhanced version at /content-history
  - ✅ Auto-populated affiliate ID "sgottshall107-20" permanently in Content Generator for streamlined workflow
  - ✅ Fixed smart redirect functionality with proper backend API and affiliate link generation
  - ✅ Enhanced redirect URL display with copy functionality and click tracking analytics
  - ✅ Added platform-specific captions display in Content History with individual copy buttons for TikTok, Instagram, YouTube, and Twitter
- July 08, 2025. **Content Performance Tracker Removal**: Eliminated database error-causing component for system stability:
  - ✅ Removed problematic Content Performance Tracker page from sidebar navigation under "Analytics & Tracking"
  - ✅ Deleted performance-tracker.tsx page component and ContentPerformanceTracker.tsx component
  - ✅ Removed /performance-tracker route from App.tsx routing system
  - ✅ Eliminated performance-analytics.ts API module that required non-existent database tables
  - ✅ Cleaned up routes.ts by removing broken analytics endpoint registrations
  - ✅ Resolved "relation 'performance_analytics' does not exist" database errors in console logs
  - ✅ System now operates without dependency on unimplemented performance analytics database schema
  - ✅ Maintained existing Performance Analytics page (/performance-analytics) which works with current database structure
- July 08, 2025. **Platform Preview Page Removal**: Cleaned up unused multi-platform preview functionality:
  - ✅ Removed Platform Preview page from sidebar navigation under "Advanced Tools" section
  - ✅ Deleted platform-preview.tsx page component that was no longer actively used
  - ✅ Removed /platform-preview route from App.tsx routing system
  - ✅ Cleaned up Navbar.tsx by removing broken platform preview link references
  - ✅ Eliminated duplicate and unused navigation entries causing UI inconsistencies
  - ✅ Application now starts cleanly without syntax errors or broken route references
  - ✅ Streamlined navigation menu with only functional and actively maintained pages

## User Preferences

Preferred communication style: Simple, everyday language.