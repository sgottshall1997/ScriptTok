# Replit.md

## Overview

This is a comprehensive content generation platform that leverages multiple AI models (OpenAI, Anthropic Claude, Perplexity) to create social media content across various niches and platforms. The application uses a full-stack TypeScript architecture with React frontend, Express backend, and PostgreSQL database with Drizzle ORM.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite with HMR support
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom theming
- **State Management**: TanStack React Query for server state
- **Routing**: Wouter for lightweight client-side routing
- **Path Aliases**: Configured for clean imports (@/components, @/lib, etc.)

### Backend Architecture
- **Runtime**: Node.js with ES modules
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle with PostgreSQL
- **Database Provider**: Neon serverless PostgreSQL
- **API Design**: RESTful endpoints with comprehensive route organization
- **Rate Limiting**: Express rate limiter for content generation endpoints
- **Middleware**: Request logging, error handling, CORS support

### Key Components

#### Content Generation System
- **Multi-AI Provider Support**: OpenAI GPT models, Anthropic Claude, Perplexity for trend data
- **Template System**: Niche-specific and universal templates (beauty, tech, fitness, etc.)
- **Platform-Specific Generation**: TikTok, Instagram, YouTube, Twitter optimized content
- **Bulk Generation**: Automated content creation with job queue system
- **Safeguards**: Generation limits and validation to prevent abuse

#### Data Storage Solutions
- **Primary Database**: PostgreSQL via Neon serverless
- **Schema Management**: Drizzle migrations in ./migrations directory
- **Content History**: Comprehensive logging of all generated content
- **Trending Products**: Scraped and AI-generated product data storage
- **User Management**: Role-based access control with teams and permissions

#### External Service Integrations
- **Trend Data Sources**: Perplexity AI for real-time trending product discovery
- **Affiliate Networks**: Amazon Associates, ShareASale, Commission Junction
- **Webhook System**: Integration with Make.com and other automation platforms
- **Analytics**: Google Analytics integration with custom event tracking

## Data Flow

1. **Content Request**: User selects product, niche, template, and platforms
2. **AI Processing**: Request routed to appropriate AI model (GPT/Claude) based on configuration
3. **Platform Optimization**: Generated content adapted for each selected platform
4. **Compliance Enhancement**: FTC-compliant disclosures added for affiliate content
5. **Storage**: Results saved to content history with full audit trail
6. **Webhook Delivery**: Optional webhook notifications to external systems

## External Dependencies

### AI Services
- **OpenAI API**: Primary content generation (GPT-3.5, GPT-4)
- **Anthropic Claude**: Alternative AI provider for content diversity
- **Perplexity API**: Trend discovery and viral content inspiration

### Database & Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting
- **WebSocket Support**: Real-time features via ws package
- **Caching**: Redis-compatible caching layer for performance

### Frontend Libraries
- **@radix-ui/***: Accessible UI component primitives
- **@tanstack/react-query**: Server state management and caching
- **tailwindcss**: Utility-first CSS framework
- **react-hook-form**: Form validation and management

## Deployment Strategy

### Development Environment
- **Dev Server**: `npm run dev` starts both Vite dev server and Express API
- **Hot Reload**: Full-stack hot reloading with Vite HMR
- **Database**: Drizzle push for schema synchronization (`npm run db:push`)

### Production Build
- **Frontend**: Vite build outputs to `dist/public`
- **Backend**: esbuild bundles server to `dist/index.js`
- **Database**: Drizzle migrations manage schema changes
- **Environment**: Production mode with optimized AI model routing

### Configuration Management
- **Environment Variables**: Database URL, API keys for all AI services
- **Drizzle Config**: Configured for PostgreSQL dialect with proper migrations
- **TypeScript**: Strict mode enabled with comprehensive path mapping
- **Build Pipeline**: Single command builds both frontend and backend assets

## Recent Changes

### January 13, 2025 - Major Architectural Refactoring Completed
- **MODULAR ARCHITECTURE IMPLEMENTED**: Successfully created unified content generation system with:
  - `promptFactory.ts` - Centralized prompt generation
  - `unifiedContentGenerator.ts` - Main content generation engine  
  - `aiModelRouter.ts` - AI model selection with Claude supremacy
  - `scheduler.ts` - Scheduled content generation management
  - `webhookDispatcher.ts` - Webhook delivery system
  - `amazonAffiliate.ts` - Affiliate link generation

- **MASSIVE CLEANUP EXECUTED**: Removed hundreds of duplicate files including:
  - 30+ test files (test-*.sql, test-*.js, test-*.html)
  - 100+ screenshot assets and duplicate images
  - Legacy debug files and unused markdown documents
  - Broken import references and unused code

- **CLAUDE AI ENFORCEMENT MAINTAINED**: All generation modes continue using Claude as primary AI model
- **SERVER STABILITY ACHIEVED**: Fixed all import issues and maintained operational status throughout refactoring
- **PRODUCTION SAFEGUARDS ACTIVE**: Security measures and generation limits properly configured

### July 13, 2025 - Complete ChatGPT Removal and Claude-Only System Implementation
- **CHATGPT COMPLETELY REMOVED**: Eliminated all ChatGPT references from the entire unified generator system
- **CLAUDE-ONLY ARCHITECTURE**: System now exclusively uses Claude AI with no fallback options
- **CRITICAL BUGS FIXED**: Resolved infinite recursion in AI model router and frontend API compatibility issues
- **FRONTEND UPDATED**: Modified UI to only show Claude as available AI model option
- **API ENDPOINTS CLEANED**: Updated all model availability and testing endpoints to be Claude-only
- **TYPE SAFETY IMPROVED**: Updated TypeScript interfaces to reflect Claude-only constraints
- **SPARTAN FORMAT COMPLETED**: Fixed critical boolean-to-string mapping bug in Spartan format implementation
- **UNIFIED GENERATOR INTEGRATION**: Successfully integrated new modular content generator with proper Spartan support
- **PRODUCTION READY**: System now operates as a pure Claude AI content generation platform with fully functional Spartan mode