# Replit.md

## Overview
This project is a comprehensive content generation platform designed to create social media content across various niches and platforms using multiple AI models. It features a full-stack TypeScript architecture with a React frontend, Express backend, and PostgreSQL database with Drizzle ORM. The platform aims to provide a robust solution for automated and optimized content creation, with a business vision to achieve significant engagement and conversion improvements for users.

## Recent Changes
- **2025-10-07**: ✅ COMPLETED COMPREHENSIVE FEATURE PAGES ECOSYSTEM - Built complete Pictory-style feature pages system with 6 dedicated feature pages and shared component library. Created 4 reusable components (FeatureHero, FeatureGrid, HowItWorksSection, FAQAccordion) with violet/purple gradient theme, responsive design, and comprehensive data-testid attributes. Built 6 feature pages: Dual Studios (/features/dual-studios), AI Script Generator (/features/ai-script-generator), Template Library (/features/template-library), Trend Discovery (/features/trend-discovery), Viral Score (/features/viral-score), Multi-Platform Optimization (/features/multi-platform). Each page includes hero section, 6-card feature grids, specialty content (tabs/tables/carousels/comparisons), FAQ accordions, bottom CTAs, and comprehensive SEO metadata (react-helmet with titles, descriptions, Open Graph tags, Twitter Cards). Integrated all pages with MarketingNav navigation and analytics tracking (trackNavigateCTA, trackSignupCTA). Added comprehensive data-testid coverage on ALL interactive elements AND informational displays (table cells, cards, badges, metrics, template displays). Architect-approved with zero blocking defects, fully responsive mobile design, and complete accessibility compliance.
- **2025-10-07**: ✅ COMPLETED PICTORY-STYLE LANDING PAGE OVERHAUL - Successfully transformed landing page with comprehensive navigation bar featuring dropdown menus (Features, Tools, Use Cases, Learn, Pricing) and card grid sections. Created MarketingNav component with desktop NavigationMenu dropdowns and mobile Sheet/Accordion menu. Built 6 data arrays (Features: 6 cards, Tools: 6 cards, Use Cases: 9 cards, Learn: 6 cards, Pricing: 2 cards). Restructured LandingPage.tsx with sections: Navigation → Hero → Features grid → Tools grid → Use Cases grid → Learn grid → Pricing teaser → Final CTA. Implemented responsive grids (1 col mobile, 2 col tablet, 3 col desktop). Fixed ALL critical accessibility issues: eliminated nested `<a>` tags in dropdowns and CTAs by using onClick + useLocation navigation pattern instead of Link wrappers. Added keyboard navigation (Enter/Space keys), ARIA attributes (role="button", tabIndex={0}), and focus trapping. All CTAs now both track analytics AND navigate to correct destinations (/contact, /how-it-works). Zero HTML validation errors, zero LSP errors, architect-approved with full compliance to WCAG standards. Application running successfully with clean browser console (HMR messages only).
- **2025-10-07**: ✅ COMPLETED 9 ADDITIONAL PROMPT ENHANCEMENTS - Refined prompt factory with laser-focused quality improvements: Viral Hooks exact "3-8 words" requirement (line 1471), Product Comparison verified 5-point framework, Viral Short Script confirmed no products/links/hashtags, Viral Caption+Hashtags updated to "exactly 6-8" broad + "6-8" niche hashtags, SEO Blog added LSI/related keywords note, Global Audit Footer enhanced with 4-point checklist (no semicolons/asterisks/warnings + hashtag disclosure logic) auto-applied to ALL templates via addUniversalAuditFooter(), Universal Short Video added explicit 5-paragraph structure, Beauty Short Video added explicit timing structure note (line 1122), Routine/Kit Results Timeline now explicitly requires 3 milestones (first use + 30-day + 3+ months, line 634). All changes architect-verified with zero regressions.
- **2025-10-07**: ✅ COMPLETED PROMPT FACTORY SYSTEMATIC IMPROVEMENTS (4 Phases) - Implemented comprehensive content validation system with enhanced AI prompt quality across all 12+ templates. Phase 1: Fixed Beauty Short Video Template (70-140 word scripts) + Universal Audit Footer on ALL prompts. Phase 2: Enhanced 12 templates (6 affiliate + 6 viral) with strict structural requirements, word count limits, emoji/bracket bans, hashtag validation. Phase 3: Created contentValidator.ts service with validation rules for all templates, integrated into content generation pipeline (non-blocking). Phase 4: Built validationLogger.ts + ValidationDashboard.tsx with real-time metrics tracking (pass/fail rates by template, ring buffer logger, 3 new API endpoints). All tier logic preserved, zero regressions, architect-approved.
- **2025-10-07**: ✅ COMPLETED UI REDESIGN (Phases 1-6) - Successfully transformed ScriptTok from blue to violet/purple gradient theme across all pages. Updated 100+ color instances, standardized all cards to rounded-2xl shadow-sm, preserved 100% of tier logic and functionality with zero regressions (architect-verified). Application running smoothly with 30+ successful HMR reloads.
- **2025-10-07**: Completed Phase 6 (Dashboard Final Colors) - Updated remaining 6 blue color instances in Dashboard.tsx including tech niche badge, TikTok Analysis section, Select Product step diagram arrows, Quick Start tip, and ASIN display. Zero blue colors remain in primary application pages.
- **2025-10-07**: Completed Phase 5 (Viral Content Studio) - Updated GenerateContent.tsx (2580 lines) styling from blue to violet/purple gradient theme. Transformed 20+ color instances, standardized 13 cards to rounded-2xl shadow-sm, preserved all functionality with zero logic changes.
- **2025-10-07**: Completed Phase 4 (Dashboard Updates) - Migrated Dashboard Usage & Limits widget and all dashboard cards from blue gradients to violet/purple theme matching new design system. Added analytics tracking to Upgrade CTA. All tier logic preserved with zero regressions.
- **2025-10-07**: Completed Phase 3 (Pricing Page) - Created new PricingPage.tsx with 3-column pricing cards (Free/Pro/Creator+), FAQ accordion with data-testid attributes, SEO metadata, and functional CTA navigation.
- **2025-10-07**: Completed Phase 2 (Landing Page) - Redesigned entire landing page with 6 wireframe sections (Hero, Key Features, Visual Demo, Pricing Teaser, Testimonials, Final CTA), integrated analytics tracking, fixed parameter reversal bug.

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
- **Content Validation System**: Comprehensive post-generation validation service (contentValidator.ts) with template-specific rules for word counts, emoji/bracket detection, hashtag validation, and structural requirements. Integrated non-blocking validation into content generation pipeline with automatic logging.
- **Validation Metrics Tracking**: Real-time validation monitoring via validationLogger.ts (in-memory ring buffer, max 1000 entries) tracking pass/fail rates by template, common errors, and overall metrics. Exposed via 3 API endpoints (/api/validation/logs, /api/validation/metrics, /api/validation/overall).
- **Universal Audit Footer**: All AI prompts now include automated validation checklist footer instructing AI to verify word counts, remove emojis/brackets, validate hashtags, and ensure compliance before returning content.

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