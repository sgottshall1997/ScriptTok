# Replit.md

## Overview
This project is a comprehensive content generation platform designed to create social media content across various niches and platforms using multiple AI models. It features a full-stack TypeScript architecture with a React frontend, Express backend, and PostgreSQL database with Drizzle ORM. The platform aims to provide a robust solution for automated and optimized content creation, with a business vision to achieve significant engagement and conversion improvements for users.

## Recent Changes
**October 7, 2025**: Successfully implemented Replit Auth with user isolation for ScriptTok content generator. Completed full authentication system using Google + Email login (users don't need Replit accounts), secured all content routes with isAuthenticated middleware, implemented user-scoped data filtering by userId across all storage methods, updated database schema with users/sessions tables and userId columns on content_generations, contentHistory, and apiUsage tables. Fixed critical security vulnerabilities to prevent cross-user data leakage. All TypeScript errors resolved across 6+ files. Application ready for multi-user deployment with proper content isolation.

**September 25, 2025**: Successfully completed comprehensive Amazon monetization infrastructure transformation. Implemented complete smart affiliate link injection system with intelligent product detection using advanced pattern matching algorithms, full database monetization infrastructure (4 core tables: amazon_products, affiliate_links, revenue_tracking, product_performance), extended storage interface with 26+ new methods covering Amazon product management and revenue analytics, comprehensive API ecosystem for affiliate link injection and tracking, and rich frontend testing component. System ready for immediate revenue generation once Amazon API access is restored from current rate limiting issues.

**September 20, 2025**: Achieved complete feature parity between CookAIng and GlowBot content persistence and rating systems. Successfully implemented comprehensive CookAIng content persistence with 5 new API endpoints (history listing, individual content retrieval, rating submission, rating retrieval, top-rated content discovery), extended database schema with 16 new fields in cookaingContentVersions table and 6 new fields in cookaingContentRatings table, and verified full functionality through comprehensive testing cycle covering content generation with persistence, history retrieval, and rating submission/retrieval with complete data integrity.

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
- **Authentication**: Replit Auth with Google + Email login, session-based authentication
- **Rate Limiting**: Express rate limiter
- **Middleware**: Request logging, error handling, CORS, authentication middleware

### Key Components
- **Authentication & User Isolation**: Replit Auth integration with Google + Email login, session-based authentication, protected routes with isAuthenticated middleware, and user-scoped data filtering to ensure each user sees only their own content history and generations.
- **Content Generation System**: Supports multi-AI providers (OpenAI, Anthropic Claude), uses niche-specific and universal templates, enables platform-specific and bulk generation, and includes safeguards against abuse.
- **Data Storage Solutions**: Utilizes PostgreSQL for primary storage, manages schema with Drizzle migrations, stores content history, trending products, and supports user management with role-based access control.
- **Smart Style System**: Integrates user ratings and AI evaluations for content quality assessment, with optimized threshold filtering and normalization for recommendations.
- **Automated Bulk Generator**: Supports scheduled and manual bulk content generation with customizable parameters (niche, template, tone, AI model, content format), robust error handling, and server restart resilience.
- **Perplexity Automation**: Scheduled cron job to automatically fetch trending product data daily.
- **Webhook System**: Consolidates multiple platform captions into a single webhook payload for efficient integration with external automation platforms like Make.com.
- **Spartan Format Enforcement**: A system that automatically cleans and transforms casual language into a professional tone, removing common filler words.
- **Claude AI Suggestions System**: Stores and applies AI-generated recommendations by niche during content creation to enhance quality.
- **CookAIng Marketing Engine**: Comprehensive multi-channel marketing platform with dedicated sidebar section featuring 15+ individual tool links including segments, A/B testing, personalization, form submissions, trends/seasonal campaigns, reports, cost tracking, attribution analysis, webhooks monitoring, email delivery testing, and developer tools. All pages are fully scaffolded with shadcn/ui components, mock data, responsive design, and consistent UX patterns.

### UI/UX Decisions
The platform utilizes Shadcn/ui components on Radix UI primitives, styled with Tailwind CSS for a modern and customizable interface. The user experience is enhanced with features like trending product auto-population, confirmation toasts, and clear display of generated content, including main content and platform-specific captions. Legal documentation and support pages are also integrated to provide transparency and assistance.

### Technical Implementations
- **AI Model Routing**: Logic to route content generation requests to appropriate AI models, with an emphasis on Claude AI.
- **Platform Optimization**: Adapts generated content for specific platforms (TikTok, Instagram, YouTube, Twitter, Facebook) with strict length controls and prompt optimization.
- **Affiliate Link Streamlining**: Shortens affiliate link formatting to optimize caption length.
- **Dual AI Evaluation System**: Automatically evaluates generated content using both Claude and other AI models for comprehensive quality assessment, saving scores to the database.
- **Parameter Unification**: Standardized `topRatedStyleUsed` parameter across frontend, backend, database, and webhooks for consistency.
- **Scheduled Jobs Persistence**: Scheduled jobs are stored in the PostgreSQL database to ensure persistence across server restarts, with automatic resumption of interrupted jobs.

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

### Integrations
- **Amazon Associates, ShareASale, Commission Junction**: Affiliate networks for monetization.
- **Make.com**: For webhook automation.
- **Google Analytics**: For custom event tracking and analytics.