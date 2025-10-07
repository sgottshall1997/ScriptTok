Please create a comprehensive and professional README.md file for the ScriptTok project (or update the existing one if it exists) that accurately reflects the current state of the application based on the codebase. The README should include:

Essential Sections:

Project Title & Description

Clear project name: ScriptTok
Tagline: "AI-powered dual content generator for viral and affiliate TikTok scripts"
Brief description of the two content studios (Viral Content Studio and Affiliate Content Studio)
Features Overview

Dual content generation modes (viral trending topics vs affiliate products)
AI-powered trend discovery using Perplexity API
Multiple content templates for both viral and affiliate content
Real-time viral score analysis
Content history and performance tracking
Multi-platform optimization (TikTok, Instagram, YouTube, etc.)
AI model routing (OpenAI, Claude)
Tech Stack

Frontend: React with TypeScript, Vite, Tailwind CSS, Shadcn/ui
Backend: Node.js, Express.js, TypeScript
Database: PostgreSQL with Drizzle ORM (Neon serverless)
AI Services: OpenAI, Anthropic Claude, Perplexity API
State Management: TanStack React Query
Routing: Wouter
Project Structure

Brief overview of the main directories (client, server, shared, tests)
Key components and services
Installation & Setup

Prerequisites (Node.js version)
Clone repository instructions
Environment variables setup (reference .env.example)
Database setup with Drizzle
Package installation commands
Running the Application

Development server startup
Available scripts from package.json
Port information (default ports used)
API Endpoints

Brief overview of main API routes
Content generation endpoints
Trending data endpoints
Analytics and history endpoints
Environment Variables

List of required environment variables
Brief description of each (OpenAI API key, Claude API key, Perplexity API key, database URL, etc.)
Reference to secrets management in Replit
Content Generation Modes

Detailed explanation of Viral Content Studio
Detailed explanation of Affiliate Content Studio
Available templates for each mode
How the AI routing works
Key Features Detail

Trend forecasting and analysis
Content evaluation and scoring
Template system
Multi-platform content adaptation
Analytics and performance tracking
Development

Testing setup (Playwright, Vitest)
Code structure and conventions
Database migrations with Drizzle
Deployment

Replit deployment instructions
Production considerations
Environment setup for production
Contributing

Basic contribution guidelines
Code style preferences
How to report issues
License

Appropriate license information
Technical Requirements:

Use proper markdown formatting with headers, code blocks, and lists
Include badges if appropriate (build status, license, etc.)
Make sure all code examples use proper syntax highlighting
Keep explanations clear and concise but comprehensive
Ensure the README reflects the actual current functionality based on the codebase
Include any important notes about API limitations or setup requirements
Style Guidelines:

Professional and clean formatting
Use emojis sparingly but effectively for section headers
Include proper code formatting for commands and configuration
Make it beginner-friendly while being technically accurate
Ensure consistency in terminology (use "ScriptTok" consistently)
Please make this README comprehensive enough for new developers to understand the project and get it running, while also serving as good documentation for the current functionality.