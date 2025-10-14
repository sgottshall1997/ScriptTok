# 🎬 Pheme

**AI-powered content creation for social media**

Pheme is a comprehensive AI-powered content generation platform designed to create high-quality social media content across various niches and platforms. The platform features **Dual Studios**: a **Viral Content Studio** for trend-based viral content and an **Affiliate Content Studio** for product-focused content with affiliate integration, all powered by advanced AI models (OpenAI GPT-4, Anthropic Claude, and Perplexity AI).

---

## ✨ Features Overview

### 🔥 Dual Content Studios

#### Viral Content Studio
- **Trend-based viral content** without product requirements
- Powered by Perplexity API for real-time trend discovery
- Templates: Viral Hooks, Short Scripts, Storytime, Duet/Reaction, Listicles, Challenges, Caption + Hashtags

#### Affiliate Content Studio (Pro+ Tier)
- **Product-focused content** with affiliate integration
- Intelligent product research capabilities
- Templates: Affiliate Email, Influencer Caption, Product Comparison, Routine Guide, SEO Blog, Short Video Scripts

### 🚀 Core Capabilities

- **AI-Powered Trend Discovery**: Real-time trending topic analysis using Perplexity API
- **Multi-Template System**: 14+ diverse content templates for viral and affiliate content
- **Real-Time Viral Score Analysis**: Dual AI evaluation (Claude + GPT-4) for comprehensive quality assessment
- **Content History & Analytics**: Track performance and export data (CSV/JSON based on tier)
- **Multi-Platform Optimization**: Content adapted for TikTok, Instagram, YouTube, Twitter, and Facebook
- **Smart AI Model Routing**: Intelligent routing between OpenAI, Claude, and Perplexity
- **Trend Forecasting**: Advanced trend prediction and analysis (Creator+ tier)
- **Bulk Content Generation**: Automated batch creation with scheduling (Pro: 10 items, Agency: 50 items)
- **Content Evaluation System**: Dual AI evaluation for comprehensive quality assessment

### 🛠️ Available Tools

1. **Script Generator Tool** - Generate viral and affiliate content with AI
2. **Trend Discovery Tool** - Discover trending topics and products
3. **Template Library Tool** - Browse and use content templates
4. **History Tool** - View and manage content history
5. **Viral Score Analyzer Tool** - Analyze content viral potential

---

## 💰 Pricing & Subscription Tiers

### Starter - $7/month (or $5/month annual)
Perfect for individuals getting started with AI content creation.

**Generation Limits:**
- 15 GPT-4 generations/month
- 10 Claude generations/month
- 10 trend analyses/month
- Basic Viral Score (GPT-4 only)

**Features:**
- ✅ 3 templates per category (hooks, storytelling, educational)
- ✅ 3 niches (beauty, tech, fashion)
- ✅ Last 10 content items in history
- ✅ Viral Score preview (number only, no breakdown)
- ❌ Bulk generation
- ❌ Content export
- ❌ Trend forecasting
- ❌ Affiliate Studio

### Creator - $15/month (or $10/month annual) ⭐ Most Popular
Perfect for aspiring influencers and content creators.

**Generation Limits:**
- 50 GPT-4 generations/month
- 30 Claude generations/month
- 25 trend analyses/month
- Full Viral Score + basic AI suggestions

**Features:**
- ✅ All viral templates (unlimited)
- ✅ All 7 niches
- ✅ Full history (last 50 items)
- ✅ Content export (CSV)
- ✅ Trend forecasting (basic - hot/rising only)
- ✅ Viral score with AI tips
- ❌ Bulk generation
- ❌ Affiliate Studio
- ❌ Custom prompts

### Pro - $35/month (or $25/month annual)
For power users and agencies needing unlimited creation.

**Generation Limits:**
- 300 GPT-4 generations/month
- 150 Claude generations/month
- 100 trend analyses/month
- Advanced Viral Score (dual AI - Claude + GPT)

**Features:**
- ✅ BOTH Studios (Viral + Affiliate)
- ✅ Bulk generation (10 items at once)
- ✅ Full trend forecasting (hot/rising/upcoming/declining)
- ✅ Custom prompts (save & reuse)
- ✅ Unlimited history with filters
- ✅ Priority support (24hr response)
- ✅ Make.com webhook integration
- ✅ Brand templates (save & reuse)
- ❌ Team features
- ❌ API access

### Agency - Custom Pricing
For teams and creators managing multiple brands.

**Generation Limits:**
- 1,000 GPT-4 generations/month (custom volume available)
- 500 Claude generations/month (custom volume available)
- Unlimited trend analyses
- Full dual AI scoring system

**Features:**
- ✅ Everything in Pro
- ✅ Bulk generation (50 items at once)
- ✅ JSON export for workflows
- ✅ API access for custom integrations
- ✅ Team management features
- ✅ Dedicated account manager
- ✅ Custom integrations
- ✅ White-label options

### Free Tier (Deprecated, Trial Only)
- 3 total AI generations (combined GPT + Claude)
- Automatically assigned to new users as trial
- Limited feature access

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite (fast, modern build tool)
- **UI Library**: Shadcn/ui (built on Radix UI primitives)
- **Styling**: Tailwind CSS with custom design system
- **State Management**: TanStack React Query v5
- **Routing**: Wouter (lightweight router)
- **Form Handling**: React Hook Form with Zod validation
- **Analytics**: Custom analytics with GA integration

### Backend
- **Runtime**: Node.js with ES modules
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL (Neon serverless provider)
- **ORM**: Drizzle ORM for type-safe database interactions
- **Middleware**: Morgan logging, CORS, Express rate limiter
- **API Design**: RESTful endpoints with comprehensive error handling

### AI Services
- **OpenAI API**: GPT-4 and GPT-3.5 for content generation
- **Anthropic Claude**: Primary AI provider for content generation and evaluation
- **Perplexity API**: Real-time trend discovery and viral content research

### Billing & Payments
- **Stripe Integration**: Production-ready checkout sessions
- **Webhook Handling**: Automated subscription lifecycle management
- **Price IDs**: Configured for Starter/Creator/Pro tiers (monthly/annual)

### Authentication
- **Development Mode**: Auto-login with DEV_USER_ID/EMAIL, unlimited quotas
- **Production Mode**: Replit Auth with header-based authentication
- **Session Management**: PostgreSQL-backed session storage

---

## 📁 Project Structure

```
pheme/
├── client/                     # React frontend application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── ui/           # Shadcn/ui components
│   │   │   ├── features/     # Feature-specific components
│   │   │   ├── marketing/    # Marketing components
│   │   │   └── tools/        # Tool-specific components
│   │   ├── pages/            # Page components
│   │   │   ├── features/     # Feature pages
│   │   │   └── tools/        # Tool pages
│   │   ├── hooks/            # Custom React hooks
│   │   └── lib/              # Utilities and configurations
├── server/                    # Express.js backend
│   ├── api/                  # API route handlers
│   │   ├── billing.ts        # Stripe billing endpoints
│   │   ├── generateContent.ts # Content generation
│   │   ├── trending.ts       # Trending products
│   │   ├── history.ts        # Content history
│   │   ├── auth.ts           # Authentication
│   │   ├── perplexity-trends.ts # Perplexity integration
│   │   ├── product-research.ts # Product research
│   │   ├── trend-forecast.ts  # Trend forecasting
│   │   └── trend-history.ts   # Trend history
│   ├── services/             # Business logic
│   │   ├── quotaService.ts   # Quota management
│   │   ├── identityService.ts # User identity
│   │   ├── contentGenerator.ts # Content generation
│   │   ├── viralScoreAnalyzer.ts # Viral scoring
│   │   └── perplexity/       # Perplexity services
│   ├── middleware/           # Express middleware
│   │   ├── authGuard.ts      # Authentication guard
│   │   ├── checkQuota.ts     # Quota checking
│   │   └── checkFeatureAccess.ts # Feature gating
│   └── prompts/              # AI prompt templates
├── shared/                    # Shared types and schemas
│   ├── schema.ts             # Database schema (Drizzle)
│   ├── constants.ts          # Application constants
│   └── templateMetadata.ts   # Template definitions
├── tests/                     # Test suites
│   ├── e2e/                  # Playwright E2E tests
│   ├── integration/          # Integration tests
│   └── unit/                 # Vitest unit tests
└── migrations/               # Database migrations
```

---

## 🎨 Content Templates

### Viral Content Templates (No Product Required)
1. **Viral Hooks** - 10 scroll-stopping hooks (3-8 words each)
2. **Viral Short Script** - 15-30s scripts (Hook/Build/Payoff/Button structure)
3. **Viral Storytime** - 90-150 word authentic story scripts
4. **Viral Duet/Reaction** - Script outlines for stitching/reacting
5. **Viral Listicle** - Top 3-5 format with titles and explanations
6. **Viral Challenge** - Participation ideas with steps and variations
7. **Viral Caption + Hashtags** - 3 captions plus broad/niche hashtag sets

### Affiliate Content Templates (Product-Focused, Pro+ Only)
1. **Affiliate Email** - Persuasive email sections (100-150 words)
2. **Influencer Caption** - Authentic social media posts (100-200 words)
3. **Product Comparison** - Comprehensive comparison guides (600-800 words)
4. **Routine Guide** - Step-by-step routine guides (500-700 words)
5. **SEO Blog Post** - Search-optimized blog posts (1000+ words)
6. **Short Video Script** - Viral-optimized scripts for TikTok/Reels/Shorts (15-60s)
7. **Universal Short Video** - Comprehensive video scripts

---

## 🌍 Supported Niches

Pheme supports **7 specialized niches**:

1. 💄 **Beauty** - Beauty and personal care products
2. ⚡ **Tech** - Technology and gadgets
3. 👗 **Fashion** - Clothing and accessories
4. 💪 **Fitness** - Fitness equipment and supplements
5. 🍎 **Food** - Food and cooking products
6. ✈️ **Travel** - Travel gear and accessories
7. 🐾 **Pets** - Pet products and accessories

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18+
- PostgreSQL database (or Neon account)
- API keys for OpenAI, Anthropic Claude, and Perplexity

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/pheme.git
   cd pheme
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   ```
   
   Configure your environment variables (see [Environment Variables](#-environment-variables) section)

4. **Database setup**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5000`

---

## 🔧 Environment Variables

### Core Application Settings

```bash
# Application Environment
APP_ENV=development                    # "development" or "production"
APP_URL=http://localhost:5000         # Application URL

# Frontend API Base (for Vite)
VITE_API_BASE_URL=http://localhost:5000/api
```

### Development Mode Flags

```bash
# Bypass usage limits in development (1=enabled, 0=disabled)
BYPASS_LIMITS=1                        # Dev: 1 = unlimited | Prod: 0 = enforce limits

# Disable billing in development (1=disabled, 0=enabled)
DISABLE_BILLING=1                      # Dev: 1 = mock billing | Prod: 0 = Stripe billing

# Development user credentials (DEV MODE ONLY)
DEV_USER_ID=00000000-0000-0000-0000-000000000001
DEV_USER_EMAIL=dev@pheme.local
DEV_USER_NAME=Dev User
```

### Database Configuration

```bash
# PostgreSQL connection string
DATABASE_URL=postgresql://username:password@host:port/database

# Session secret for authentication
SESSION_SECRET=your_secure_session_secret
```

### AI Service Keys

```bash
# OpenAI API Key
OPENAI_API_KEY=your_openai_api_key_here

# Anthropic Claude API Key
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Perplexity API Key (for trend discovery)
PERPLEXITY_API_KEY=your_perplexity_api_key
```

### Stripe Billing (Production Only)

```bash
# Stripe Secret Key (live key in prod, test key in dev)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key

# Stripe Publishable Key (for frontend)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Stripe Webhook Secret (for webhook signature verification)
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Stripe Price IDs for subscription tiers
STRIPE_PRICE_ID_STARTER_MONTHLY=price_xxx
STRIPE_PRICE_ID_STARTER_ANNUAL=price_xxx
STRIPE_PRICE_ID_CREATOR_MONTHLY=price_xxx
STRIPE_PRICE_ID_CREATOR_ANNUAL=price_xxx
STRIPE_PRICE_ID_PRO_MONTHLY=price_xxx
STRIPE_PRICE_ID_PRO_ANNUAL=price_xxx
```

### Replit Auth (Production Only)

Replit Auth is automatically configured in production via headers:
- `X-Replit-User-Id`
- `X-Replit-User-Name`
- `X-Replit-User-Email`
- `X-Replit-User-Profile-Image`

No additional configuration needed.

### Integration Webhooks

```bash
# Make.com Webhook Integration
MAKE_WEBHOOK_URL=https://hook.us2.make.com/your_webhook_url

# Email Service (CookAIng Marketing Engine)
BREVO_API_KEY=your_brevo_api_key_here
RESEND_API_KEY=your_resend_api_key_here
```

---

## 📡 API Endpoints

### Authentication Endpoints

```
GET  /api/auth/me              # Get current user
POST /api/auth/logout          # Logout user
```

### Billing & Subscription Endpoints

```
GET  /api/billing/subscription        # Get user subscription details
GET  /api/billing/usage              # Get usage statistics
POST /api/billing/create-checkout    # Create Stripe checkout session
POST /api/billing/webhook            # Stripe webhook handler
GET  /api/billing/cancel             # Cancel subscription
POST /api/billing/update             # Update subscription
```

### Content Generation Endpoints

```
POST /api/generate-content           # Generate content
GET  /api/history                    # Get content history
GET  /api/history/:id                # Get specific content item
DELETE /api/history/:id              # Delete content item
```

### Trending & Research Endpoints

```
GET  /api/trending/products          # Get trending products
POST /api/trending/refresh           # Refresh trending data
GET  /api/perplexity-trends          # Get Perplexity trends
POST /api/perplexity-trends/analyze  # Analyze trends
GET  /api/product-research           # Research products
GET  /api/trend-forecast             # Get trend forecasts (Creator+ tier)
GET  /api/trending-categorized       # Get categorized trends
```

### Trend History Endpoints

```
GET  /api/trend-history              # Get trend history
POST /api/trend-history              # Save trend to history
GET  /api/trend-history/:id          # Get specific trend
DELETE /api/trend-history/:id        # Delete trend from history
```

### Statistics & Monitoring

```
GET  /api/statistics                 # Get platform statistics
GET  /api/scraper-status            # Get scraper health status
GET  /api/perplexity-status         # Get Perplexity service status
```

---

## 🔐 Authentication & Authorization

### Development Mode
- **Auto-login** with `DEV_USER_ID` and `DEV_USER_EMAIL`
- **Unlimited quotas** when `BYPASS_LIMITS=1`
- **Mock billing** when `DISABLE_BILLING=1`
- No authentication required for testing

### Production Mode
- **Replit Auth** via HTTP headers
- **Tier-based quotas** enforced by `quotaService`
- **Stripe billing** for subscription management
- Session-based authentication with PostgreSQL storage

### Quota System

**Model-Specific Limits by Tier:**

| Tier     | GPT-4/month | Claude/month | Trends/month | Viral Score       |
|----------|-------------|--------------|--------------|-------------------|
| Free     | 3 (combined total)      |              |              | Basic             |
| Starter  | 15          | 10           | 10           | Basic (GPT-4 only)|
| Creator  | 50          | 30           | 25           | Full + AI tips    |
| Pro      | 300         | 150          | 100          | Advanced (Dual AI)|
| Agency   | 1,000       | 500          | Unlimited    | Advanced (Dual AI)|

### Feature Gates

**Tier-Based Feature Access:**

| Feature              | Starter | Creator | Pro | Agency |
|----------------------|---------|---------|-----|--------|
| Viral Studio         | ✅      | ✅      | ✅  | ✅     |
| Affiliate Studio     | ❌      | ❌      | ✅  | ✅     |
| Bulk Generation      | ❌      | ❌      | ✅ (10) | ✅ (50) |
| Trend Forecasting    | ❌      | ✅ (basic) | ✅ (full) | ✅ (full) |
| Content Export       | ❌      | ✅ (CSV) | ✅ (CSV) | ✅ (JSON) |
| API Access           | ❌      | ❌      | ❌  | ✅     |
| Custom Prompts       | ❌      | ❌      | ✅  | ✅     |
| Make.com Webhook     | ❌      | ❌      | ✅  | ✅     |

---

## 📊 Quota Management

### How Quotas Work

1. **Monthly Reset**: Quotas reset on the 1st of each month
2. **Model-Specific Tracking**: GPT-4 and Claude tracked separately
3. **Trend Analysis Limits**: Perplexity API calls tracked independently
4. **Soft Limits**: Users notified at 80% usage
5. **Hard Limits**: Generation blocked at 100% usage

### Checking Quotas

```javascript
// Frontend: Check quota before generation
const { data: usage } = useQuery({
  queryKey: ['/api/billing/usage'],
});

// Backend: Automatic quota check via middleware
app.use('/api/generate-content', authGuard, checkQuota, generateContentRouter);
```

---

## 🧪 Testing

### End-to-End Tests (Playwright)

```bash
npm run test:e2e              # Run all E2E tests
npm run test:e2e:ui           # Run with UI mode
npm run test:e2e:debug        # Debug mode
```

### Unit Tests (Vitest)

```bash
npm run test                  # Run all unit tests
npm run test:unit             # Run unit tests only
npm run test:coverage         # Generate coverage report
```

### Integration Tests

```bash
npm run test:integration      # Run integration tests
```

---

## 🚢 Deployment

### Replit Deployment (Recommended)

Pheme is optimized for Replit deployment:

1. **Automatic Database**: Neon PostgreSQL auto-configured
2. **Environment Variables**: Set via Replit Secrets
3. **Authentication**: Replit Auth auto-enabled in production
4. **Zero Configuration**: No additional setup required

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set environment variables**
   - `APP_ENV=production`
   - Configure all production API keys
   - Set Stripe keys and webhook secrets

3. **Run database migrations**
   ```bash
   npm run db:push
   ```

4. **Start the production server**
   ```bash
   npm start
   ```

---

## 🔗 Webhook Integrations

### Make.com Integration

Pheme integrates with Make.com for content distribution:

1. **Content Distribution**: Auto-send generated content to social platforms
2. **Scheduling**: Schedule content posts across platforms
3. **Analytics**: Track performance metrics
4. **Custom Workflows**: Create custom automation workflows

**Setup:**
```bash
MAKE_WEBHOOK_URL=https://hook.us2.make.com/your_webhook_url
```

### Stripe Webhooks

Automated subscription lifecycle management:

1. **subscription.created** - New subscription started
2. **subscription.updated** - Subscription tier changed
3. **subscription.deleted** - Subscription cancelled
4. **invoice.payment_succeeded** - Payment successful
5. **invoice.payment_failed** - Payment failed

**Setup:**
```bash
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

---

## 📧 CookAIng Marketing Engine

Comprehensive multi-channel marketing platform integrated into Pheme:

### Email Marketing (Brevo)
- Automated email campaigns
- Subscriber management
- A/B testing
- Analytics and reporting

### Social Media (Buffer)
- Multi-platform scheduling
- Content calendar
- Performance analytics
- Team collaboration

### Blog Publishing (Notion)
- SEO-optimized blog posts
- Content management
- Publishing automation
- Performance tracking

### Push Notifications (OneSignal)
- Real-time notifications
- Segmented campaigns
- Engagement tracking
- Multi-platform delivery

**Configuration:**
```bash
BREVO_API_KEY=your_brevo_api_key_here
BUFFER_ACCESS_TOKEN=your_buffer_token
NOTION_API_KEY=your_notion_key
ONESIGNAL_APP_ID=your_onesignal_app_id
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Generation Quota Exceeded
**Error**: "Monthly quota exceeded for GPT-4"
**Solution**: 
- Check usage: `GET /api/billing/usage`
- Upgrade tier or wait for monthly reset
- Use Claude as alternative (separate quota)

#### 2. Stripe Webhook Verification Failed
**Error**: "Webhook signature verification failed"
**Solution**:
- Verify `STRIPE_WEBHOOK_SECRET` is correct
- Check webhook endpoint URL in Stripe dashboard
- Ensure endpoint is `/api/billing/webhook`

#### 3. Database Connection Failed
**Error**: "Cannot connect to database"
**Solution**:
- Verify `DATABASE_URL` is correct
- Check database is running
- Run migrations: `npm run db:push`

#### 4. Development Mode Not Working
**Error**: "Authentication required"
**Solution**:
- Set `APP_ENV=development`
- Set `DEV_USER_ID` and `DEV_USER_EMAIL`
- Restart server: `npm run dev`

#### 5. Perplexity API Rate Limit
**Error**: "Perplexity API rate limit exceeded"
**Solution**:
- Check API key quota
- Reduce trend analysis frequency
- Upgrade Perplexity plan

### Debug Mode

Enable detailed logging:

```bash
DEBUG=pheme:* npm run dev
```

View logs:
```bash
tail -f logs/info.log      # Info logs
tail -f logs/error.log     # Error logs
tail -f logs/warn.log      # Warning logs
```

---

## 📝 Development Scripts

```bash
npm run dev                # Start development server (port 5000)
npm run build              # Build for production
npm start                  # Start production server
npm run check              # TypeScript type checking
npm run db:push            # Push schema changes to database
npm run db:studio          # Open Drizzle Studio (database GUI)
npm run test               # Run all tests
npm run test:e2e           # Run E2E tests (Playwright)
npm run test:unit          # Run unit tests (Vitest)
npm run lint               # Run ESLint
npm run format             # Format code with Prettier
```

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write tests for new features
- Update documentation
- Follow existing code style
- Add meaningful commit messages

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **OpenAI** - GPT-4 and GPT-3.5 models
- **Anthropic** - Claude AI models
- **Perplexity** - Trend discovery API
- **Stripe** - Payment processing
- **Neon** - Serverless PostgreSQL
- **Replit** - Deployment platform
- **Shadcn/ui** - UI component library

---

## 📞 Support

- **Documentation**: [https://docs.pheme.ai](https://docs.pheme.ai)
- **Email**: support@pheme.ai
- **Discord**: [Join our community](https://discord.gg/pheme)
- **Twitter**: [@PhemeAI](https://twitter.com/PhemeAI)

---

## 🗺️ Roadmap

### Q1 2025
- [ ] Team collaboration features (Agency tier)
- [ ] Video content generation (integration with Pictory.ai)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support

### Q2 2025
- [ ] Mobile app (iOS/Android)
- [ ] Chrome extension
- [ ] LinkedIn content optimization
- [ ] AI voice-over generation

### Q3 2025
- [ ] Zapier integration
- [ ] Custom AI model training
- [ ] White-label solution
- [ ] Enterprise SSO

---

**Built with ❤️ by the Pheme Team**
