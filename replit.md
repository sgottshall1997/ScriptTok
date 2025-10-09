## Overview
This project is a comprehensive content generation platform designed to create social media content across various niches and platforms using multiple AI models. It features a full-stack TypeScript architecture with a React frontend, Express backend, and PostgreSQL database with Drizzle ORM. The platform aims to provide a robust solution for automated and optimized content creation, with a business vision to achieve significant engagement and conversion improvements for users.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **UI Library**: Shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS
- **State Management**: TanStack React Query
- **Routing**: Wouter

### Backend Architecture
- **Runtime**: Node.js with ES modules
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle with PostgreSQL (Neon serverless provider)
- **API Design**: RESTful endpoints
- **Rate Limiting**: Express rate limiter
- **Middleware**: Request logging, error handling, CORS
- **Authentication**: Modern OpenID Connect (OIDC) flow with Passport.js and session-based authentication using PostgreSQL session storage. Supports legacy header-based authentication for backward compatibility.
- **Payment Processing**: Production Stripe integration with real checkout sessions. Configured price IDs for Starter/Creator/Pro tiers (monthly/annual). Stripe webhooks handle subscription lifecycle. Success/cancel pages provide user feedback. Agency tier configured for one-off payments.

### Key Components
- **4-Tier Subscription System**: Production-ready Starter/Creator/Pro/Agency tier system with granular quota tracking and feature gating.
- **Dual-Mode Content Generation**: Viral Content Studio for universal content and Affiliate Studio for product-focused content with affiliate links. Supports multi-AI providers, niche-specific and universal templates, platform-specific and bulk generation.
- **Data Storage Solutions**: PostgreSQL for primary storage, Drizzle for schema management, stores content history and trending products.
- **Smart Style System**: Integrates user ratings and AI evaluations for content quality assessment.
- **Automated Bulk Generator**: Supports scheduled and manual bulk content generation.
- **Perplexity Automation**: Scheduled cron job for fetching trending product data.
- **Webhook System**: Consolidates multiple platform captions into a single webhook payload.
- **Spartan Format Enforcement**: Transforms casual language into a professional tone.
- **Claude AI Suggestions System**: Stores and applies AI-generated recommendations by niche.
- **CookAIng Marketing Engine**: Comprehensive multi-channel marketing platform with a dedicated sidebar section.

### UI/UX Decisions
The platform utilizes Shadcn/ui components on Radix UI primitives, styled with Tailwind CSS, featuring a violet/purple gradient theme, neutral backgrounds, and consistent component styling. It includes a MarketingLayout for marketing pages, enhanced analytics, trending product auto-population, confirmation toasts, and integrated legal documentation.

### Technical Implementations
- **AI Model Routing**: Routes content generation requests to appropriate AI models, emphasizing Claude AI.
- **Platform Optimization**: Adapts content for specific platforms (TikTok, Instagram, YouTube, Twitter, Facebook) with strict length controls and prompt optimization.
- **Affiliate Link Streamlining**: Shortens affiliate links for caption optimization.
- **Dual AI Evaluation System**: Automatically evaluates generated content using both Claude and other AI models.
- **Parameter Unification**: Standardized `topRatedStyleUsed` parameter across all system layers.
- **Scheduled Jobs Persistence**: Scheduled jobs are stored in PostgreSQL for persistence.
- **Content Validation System**: Post-generation validation service with template-specific rules for word counts, emoji/bracket detection, hashtag validation, and structural requirements.
- **Validation Metrics Tracking**: Real-time validation monitoring via an in-memory ring buffer, exposed via 3 API endpoints.
- **Universal Audit Footer**: All AI prompts include an automated validation checklist footer for AI to verify content before returning.

## External Dependencies

### AI Services
- **OpenAI API**: For content generation (GPT-3.5, GPT-4).
- **Anthropic Claude**: Primary AI provider for content generation.
- **Perplexity API**: For trend discovery.

### Database & Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting.
- **Redis (compatible caching layer)**: For performance caching.

### Frontend Libraries
- **@radix-ui/***: Accessible UI component primitives.
- **@tanstack/react-query**: Server state management and caching.
- **tailwindcss**: Utility-first CSS framework.
- **react-hook-form**: Form validation and management.
- **wouter**: Fast and tiny client-side router.
- **react-helmet**: For managing document head tags, including SEO metadata.

### Integrations
- **Amazon Associates, ShareASale, Commission Junction**: Affiliate networks.
- **Make.com**: For webhook automation.
- **Google Analytics**: For custom event tracking.
- **Replit Auth**: For user authentication.