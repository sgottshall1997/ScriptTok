# Replit.md

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

### Key Components
- **Dual-Tier Subscription System**: Production-ready Free/Pro tier system with granular quota tracking for AI models and trend analyses, comprehensive feature gating, and upgrade CTAs.
- **Content Generation System**: Supports multi-AI providers, uses niche-specific and universal templates, enables platform-specific and bulk generation.
- **Data Storage Solutions**: Utilizes PostgreSQL for primary storage, manages schema with Drizzle migrations, stores content history, trending products, and supports user management.
- **Smart Style System**: Integrates user ratings and AI evaluations for content quality assessment and recommendations.
- **Automated Bulk Generator**: Supports scheduled and manual bulk content generation with customizable parameters and robust error handling.
- **Perplexity Automation**: Scheduled cron job to automatically fetch trending product data daily.
- **Webhook System**: Consolidates multiple platform captions into a single webhook payload for efficient integration.
- **Spartan Format Enforcement**: Automatically cleans and transforms casual language into a professional tone.
- **Claude AI Suggestions System**: Stores and applies AI-generated recommendations by niche during content creation.
- **CookAIng Marketing Engine**: Comprehensive multi-channel marketing platform with dedicated sidebar section featuring 15+ individual tool links.

### UI/UX Decisions
The platform utilizes Shadcn/ui components on Radix UI primitives, styled with Tailwind CSS. The design incorporates a violet/purple gradient theme, neutral backgrounds, standardized spacing tokens, and consistent component styling (e.g., rounded-xl buttons, rounded-2xl cards). It includes a MarketingLayout for marketing pages and an enhanced analytics infrastructure for tracking conversions. UI/UX also features trending product auto-population, confirmation toasts, clear display of generated content, and integrated legal documentation.

### Technical Implementations
- **AI Model Routing**: Logic to route content generation requests to appropriate AI models, with an emphasis on Claude AI.
- **Platform Optimization**: Adapts generated content for specific platforms (TikTok, Instagram, YouTube, Twitter, Facebook) with strict length controls and prompt optimization.
- **Affiliate Link Streamlining**: Shortens affiliate link formatting for caption optimization.
- **Dual AI Evaluation System**: Automatically evaluates generated content using both Claude and other AI models for comprehensive quality assessment.
- **Parameter Unification**: Standardized `topRatedStyleUsed` parameter across all system layers for consistency.
- **Scheduled Jobs Persistence**: Scheduled jobs are stored in the PostgreSQL database for persistence across server restarts and automatic resumption.

## External Dependencies

### AI Services
- **OpenAI API**: For content generation (GPT-3.5, GPT-4).
- **Anthropic Claude**: Primary AI provider for content generation and diversity.
- **Perplexity API**: For trend discovery and viral content inspiration.

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
- **Amazon Associates, ShareASale, Commission Junction**: Affiliate networks for monetization (currently experiencing rate limiting issues).
- **Make.com**: For webhook automation.
- **Google Analytics**: For custom event tracking and analytics.
- **Replit Auth**: For user authentication.