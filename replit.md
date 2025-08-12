# Replit.md

## Overview

This project is a comprehensive content generation platform designed to create social media content across various niches and platforms using multiple AI models (OpenAI, Anthropic Claude, Perplexity). Its main purpose is to automate and streamline content creation, offering niche-specific and platform-optimized content. The application is built with a full-stack TypeScript architecture, featuring a React frontend, Express backend, and PostgreSQL database. The business vision is to provide an enterprise-grade solution for efficient and high-quality content production, aiming for significant improvements in content performance and ROI for users.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The platform employs a full-stack TypeScript architecture. The frontend leverages React with Vite for building, Shadcn/ui for UI components, Tailwind CSS for styling, TanStack React Query for state management, and Wouter for routing. The backend is built with Node.js and Express.js, using Drizzle ORM with PostgreSQL (Neon serverless) for data persistence. Key architectural decisions include a RESTful API design, multi-AI provider support with a unified content generation system, a flexible template system, and platform-specific content optimization. The system emphasizes modularity, with components like a centralized prompt factory, AI model router, and webhook dispatcher. Content generation is safeguarded with limits and validation. UI/UX design focuses on a clean interface using modern component libraries and a customizable theme.

Key technical implementations and features include:
- **Content Generation System**: Supports OpenAI, Anthropic Claude, and Perplexity APIs. Features niche-specific and universal templates, platform-specific content optimization (TikTok, Instagram, YouTube, Twitter), and bulk generation with a job queue.
- **Data Storage Solutions**: Utilizes PostgreSQL for storing generated content history, trending product data, and user management with role-based access control. Drizzle handles schema management.
- **Automated Systems**: Includes an automated bulk content generator, a persistent scheduling system for future content generation, and a cron job system for daily trending product updates via Perplexity.
- **Content Quality & Optimization**: Incorporates a "Spartan format" for content cleaning (removing filler words), an intelligent Claude AI suggestions system for content enhancement, and a dual AI evaluation system (ChatGPT and Claude) for quality assessment.
- **Affiliate Integration**: Supports integration with affiliate networks like Amazon Associates, ShareASale, and Commission Junction, with automatic FTC-compliant disclosures.
- **Webhook System**: Provides a consolidated webhook service for external automation platforms.

## External Dependencies

- **AI Services**:
    - **OpenAI API**: Used for content generation (GPT-3.5, GPT-4).
    - **Anthropic Claude**: Primary AI provider for content generation.
    - **Perplexity API**: Used for trend discovery and viral content inspiration.
- **Database & Infrastructure**:
    - **Neon Database**: Serverless PostgreSQL hosting.
    - **Redis**: Used for caching.
    - **ws**: Provides WebSocket support for real-time features.
- **Frontend Libraries**:
    - **@radix-ui/***: Accessible UI component primitives.
    - **@tanstack/react-query**: Server state management and caching.
    - **tailwindcss**: Utility-first CSS framework.
    - **react-hook-form**: Form validation and management.
- **Other Integrations**:
    - **Make.com**: For external automation via webhooks.
    - **Google Analytics**: For custom event tracking and analytics.
```