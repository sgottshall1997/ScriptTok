# 🎬 ScriptTok

**AI-powered dual content generator for viral and affiliate TikTok scripts**

ScriptTok is a comprehensive content generation platform designed to create high-quality social media content across various niches and platforms using multiple AI models. The platform features two distinct content studios: **Viral Content Studio** for trend-based viral content and **Affiliate Content Studio** for product-focused content, both powered by advanced AI research capabilities.

## ✨ Features Overview

### 🔥 Dual Content Generation Modes
- **Viral Content Studio**: Trend-based viral content with Perplexity-powered research
- **Affiliate Content Studio**: Product-focused content with intelligent research capabilities

### 🚀 Core Features
- **AI-Powered Trend Discovery**: Real-time trending topic analysis using Perplexity API
- **Multi-Template System**: Diverse content templates for both viral and affiliate content
- **Real-Time Viral Score Analysis**: AI-driven content quality assessment and scoring
- **Content History & Analytics**: Comprehensive tracking and performance monitoring
- **Multi-Platform Optimization**: Content adapted for TikTok, Instagram, YouTube, Twitter, and Facebook
- **Smart AI Model Routing**: Intelligent routing between OpenAI, Claude, and Perplexity
- **Trend Forecasting**: Advanced trend prediction and analysis system
- **Bulk Content Generation**: Automated batch content creation with scheduling
- **Content Evaluation System**: Dual AI evaluation for comprehensive quality assessment

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: Shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS with custom design system
- **State Management**: TanStack React Query v5
- **Routing**: Wouter
- **Form Handling**: React Hook Form with Zod validation

### Backend
- **Runtime**: Node.js with ES modules
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM (Neon serverless provider)
- **API Design**: RESTful endpoints with rate limiting
- **Caching**: Redis-compatible caching layer with file-based fallback
- **Middleware**: Morgan logging, CORS, Express rate limiter

### AI Services
- **OpenAI API**: GPT-4 and GPT-3.5 for content generation
- **Anthropic Claude**: Primary AI provider for content generation and diversity
- **Perplexity API**: Trend discovery and viral content inspiration

### Database & Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting
- **Drizzle ORM**: Type-safe database interactions
- **Redis Caching**: Performance optimization (optional)

## 📁 Project Structure

```
scripttok/
├── client/                    # React frontend application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── lib/             # Utilities and configurations
│   │   └── hooks/           # Custom React hooks
├── server/                   # Express.js backend
│   ├── api/                 # API route handlers
│   ├── services/            # Business logic and external API integrations
│   ├── cache/               # Caching layer implementation
│   └── amazon/              # Amazon PA-API integration (optional)
├── shared/                   # Shared types and schemas
│   ├── schema.ts            # Database schema definitions
│   └── constants.ts         # Shared constants
├── tests/                    # Test suites
│   ├── e2e/                 # End-to-end tests (Playwright)
│   ├── integration/         # Integration tests
│   └── unit/                # Unit tests (Vitest)
└── migrations/              # Database migration files
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (or Neon account)
- API keys for OpenAI, Claude, and Perplexity

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/scripttok.git
   cd scripttok
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   ```
   
   Configure your environment variables (see [Environment Variables](#environment-variables) section)

4. **Database setup**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`

## 🔧 Running the Application

### Development Scripts
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm start          # Start production server
npm run check      # Type checking
npm run db:push    # Push database schema changes
```

### Available Ports
- **Frontend & Backend**: Port 3000 (unified server)
- **Database**: Configured via `DATABASE_URL`

## 🔐 Authentication System

ScriptTok features a flexible two-environment authentication system designed to streamline development while maintaining production security. The system automatically detects the environment and applies the appropriate authentication strategy.

### Overview

The authentication system operates in two distinct modes:

- **Development Mode** (`APP_ENV=development` or not set): Auto-login with configurable dev user, bypassed quotas, and mock billing
- **Production Mode** (`APP_ENV=production`): Replit Auth integration with enforced quotas and Stripe billing

The system automatically detects the environment based on the `APP_ENV` variable and switches between modes seamlessly, requiring no code changes.

### Development Mode Setup

Development mode is designed for rapid iteration without authentication friction. When `APP_ENV` is set to `development` (or not set), the system automatically bypasses authentication requirements.

#### Required Environment Variables

```env
# Environment mode (triggers dev features)
APP_ENV=development

# Development user credentials (auto-injected on every request)
DEV_USER_ID=00000000-0000-0000-0000-000000000001
DEV_USER_EMAIL=dev@scripttok.local
DEV_USER_NAME=Dev User

# Development bypass flags
BYPASS_LIMITS=1        # Skip quota enforcement (unlimited generations)
DISABLE_BILLING=1      # Run billing in mock mode (no Stripe calls)
```

#### Auto-Login Behavior

In development mode:
1. Every API request automatically receives the dev user credentials from environment variables
2. No login flow or authentication UI is required
3. The dev user is created with **Pro tier** subscription automatically
4. All protected routes allow access without checking credentials

#### Creating Development Users

To create additional test users during development, use the test utilities:

```typescript
import { createTestUser } from './server/utils/testAuth';

// Create a test user with free tier
const freeUser = await createTestUser(storage, 'test@example.com', 'free');

// Create a test user with pro tier
const proUser = await createTestUser(storage, 'pro@example.com', 'pro');
```

The `createDevUser()` utility creates the default dev user from environment variables:

```typescript
import { createDevUser } from './server/utils/testAuth';

// Creates dev user with DEV_USER_ID, DEV_USER_EMAIL, DEV_USER_NAME
const devUser = await createDevUser(storage);
```

### Production Mode Setup

Production mode enforces full authentication and authorization with Replit Auth integration.

#### Required Environment Variables

```env
# Environment mode (enables production features)
APP_ENV=production

# Billing configuration (if using Stripe)
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Database (production instance)
DATABASE_URL=postgresql://user:pass@production-host:5432/scripttok

# Session configuration
SESSION_SECRET=your_secure_random_session_secret
```

#### Replit Auth Integration

Replit Auth is automatically enabled when deployed on Replit in production mode. The system reads authentication data from Replit-provided headers:

- `X-Replit-User-Id` - Unique user identifier
- `X-Replit-User-Name` - User's display name
- `X-Replit-User-Email` - User's email address
- `X-Replit-User-Profile-Image` - Profile image URL

**No additional configuration is required** - these headers are automatically provided by Replit's infrastructure.

#### Authentication Flow

1. User accesses the application (no manual login required on Replit)
2. Replit automatically provides user information via headers
3. The auth middleware (`authGuard`) verifies the headers
4. If user doesn't exist in the database, they are automatically created with **Free tier**
5. User identity is attached to the request (`req.user` and `req.internalUserId`)
6. Protected routes proceed with authenticated user context

#### Automatic User Creation

On first login, the system:
1. Reads user information from Replit headers
2. Creates a new user record in the database
3. Sets up a Free tier subscription (10 generations/month)
4. Associates the Replit user ID with the internal user ID

### Quota System

ScriptTok enforces tier-based monthly generation limits to manage AI costs and encourage upgrades.

#### Tier Limits

| Tier | Monthly Limit | Price |
|------|--------------|-------|
| **Free** | 10 generations | $0 |
| **Pro** | 500 generations | $20/month |

#### How Quota Tracking Works

1. **Monthly Periods**: Quotas reset on the 1st of each month
2. **Usage Tracking**: Each content generation increments the user's monthly usage counter
3. **Enforcement Point**: The `checkQuota` middleware runs before content generation endpoints
4. **Bypass Mode**: Set `BYPASS_LIMITS=1` in development to skip enforcement

#### Quota Enforcement

The quota check happens in this order:

```
Request → authGuard → checkQuota → Content Generation
          ↓           ↓
       Verify User  Check Limit
                     ↓
              Allow or Block (429)
```

When quota is exceeded, the API returns a `429 Too Many Requests` response:

```json
{
  "error": "Quota exceeded",
  "message": "You've used 10 of 10 generations this month. Upgrade to Pro for 500/month.",
  "used": 10,
  "limit": 10,
  "tier": "free",
  "upgradeUrl": "/billing/upgrade"
}
```

#### Checking Usage

Get current usage via the billing API:

```bash
GET /api/billing/usage

Response:
{
  "used": 7,
  "limit": 10,
  "remaining": 3,
  "tier": "free"
}
```

### Billing Integration

ScriptTok uses Stripe for Pro subscription payments, with a mock mode for development.

#### Stripe Configuration

To enable Stripe billing in production:

```env
DISABLE_BILLING=0                      # Enable real Stripe integration
STRIPE_SECRET_KEY=sk_live_...         # Stripe secret key
STRIPE_WEBHOOK_SECRET=whsec_...       # Webhook signing secret
APP_URL=https://your-domain.com       # For redirect URLs
```

#### Mock Mode (Development)

In development, set `DISABLE_BILLING=1` to run billing without Stripe:

```env
DISABLE_BILLING=1
```

Mock mode returns simulated responses for all billing operations:
- Checkout sessions return mock URLs
- Subscription queries return mock data
- No actual Stripe API calls are made

#### Available Billing Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/billing/subscription` | GET | Get current subscription status |
| `/api/billing/usage` | GET | Get monthly usage stats |
| `/api/billing/create-checkout` | POST | Create Stripe checkout session for Pro upgrade |
| `/api/billing/cancel-subscription` | POST | Cancel subscription at period end |
| `/api/billing/webhook` | POST | Stripe webhook handler (no auth) |

#### Webhook Setup

To handle subscription events from Stripe:

1. **Add Webhook Endpoint** in Stripe Dashboard:
   ```
   https://your-domain.com/api/billing/webhook
   ```

2. **Select Events to Listen For**:
   - `checkout.session.completed` - New subscription created
   - `customer.subscription.updated` - Subscription modified
   - `customer.subscription.deleted` - Subscription cancelled

3. **Copy Webhook Secret** and add to environment:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_abc123...
   ```

4. The webhook handler automatically:
   - Verifies webhook signatures
   - Updates user subscriptions in the database
   - Activates Pro tier access

### Environment Variables Reference

#### Authentication Variables

| Variable | Description | Required | Default | Example |
|----------|-------------|----------|---------|---------|
| `APP_ENV` | Environment mode | Optional | `development` | `production` |
| `DEV_USER_ID` | Dev user ID (dev only) | Dev Only | `00000000-0000-0000-0000-000000000001` | Any UUID |
| `DEV_USER_EMAIL` | Dev user email (dev only) | Dev Only | `dev@scripttok.local` | `dev@example.com` |
| `DEV_USER_NAME` | Dev user name (dev only) | Dev Only | `Dev User` | `John Developer` |
| `SESSION_SECRET` | Session encryption secret | Required | - | Random string 32+ chars |

#### Quota & Billing Variables

| Variable | Description | Required | Default | Example |
|----------|-------------|----------|---------|---------|
| `BYPASS_LIMITS` | Skip quota enforcement (dev) | Optional | `0` | `1` (dev), `0` (prod) |
| `DISABLE_BILLING` | Disable Stripe integration | Optional | `0` | `1` (dev), `0` (prod) |
| `STRIPE_SECRET_KEY` | Stripe API secret key | Prod Only | - | `sk_live_...` or `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | Prod Only | - | `whsec_...` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe public key (frontend) | Prod Only | - | `pk_live_...` or `pk_test_...` |
| `STRIPE_PRICE_ID_PRO` | Stripe price ID for Pro tier | Prod Only | - | `price_...` |
| `APP_URL` | Application base URL | Required | `http://localhost:5000` | `https://app.scripttok.com` |

#### Database Variables

| Variable | Description | Required | Default | Example |
|----------|-------------|----------|---------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required | - | `postgresql://user:pass@host:5432/db` |

### Testing & Development Utilities

The `server/utils/testAuth.ts` module provides utilities for testing authentication and quota systems.

#### Creating Test Users

```typescript
import { createTestUser, createDevUser } from './server/utils/testAuth';
import { storage } from './server/storage';

// Create a test user with specific tier
const freeUser = await createTestUser(storage, 'test@example.com', 'free');
const proUser = await createTestUser(storage, 'pro@test.com', 'pro');

// Create the default dev user from environment variables
const devUser = await createDevUser(storage);
```

#### Simulating Quota Usage

```typescript
import { simulateQuotaUsage, validateQuotaEnforcement } from './server/utils/testAuth';

// Simulate using 5 generations
const stats = await simulateQuotaUsage(storage, userId, 5);
console.log(`Used: ${stats.used}, Remaining: ${stats.remaining}`);

// Check quota status
const quota = await validateQuotaEnforcement(storage, userId);
if (quota.allowed) {
  console.log(`User can generate ${quota.remaining} more items`);
} else {
  console.log(`Quota exceeded: ${quota.used}/${quota.limit}`);
}
```

#### Resetting Quota for Testing

```typescript
import { resetUserQuota } from './server/utils/testAuth';

// Reset user's monthly usage to 0
const success = await resetUserQuota(storage, userId);
if (success) {
  console.log('Quota reset successfully');
}
```

#### Running in Different Modes

**Development Mode (Unrestricted)**:
```bash
# .env configuration
APP_ENV=development
BYPASS_LIMITS=1
DISABLE_BILLING=1
DEV_USER_ID=00000000-0000-0000-0000-000000000001
DEV_USER_EMAIL=dev@scripttok.local
DEV_USER_NAME=Dev User

# Start server
npm run dev
```

**Production Mode (Enforced)**:
```bash
# .env configuration
APP_ENV=production
BYPASS_LIMITS=0
DISABLE_BILLING=0
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
DATABASE_URL=postgresql://prod-connection-string

# Start server
npm start
```

**Hybrid Mode (Quota Testing in Development)**:
```bash
# .env configuration
APP_ENV=development
BYPASS_LIMITS=0        # Enforce quotas even in dev
DISABLE_BILLING=1      # But keep billing mocked
DEV_USER_EMAIL=dev@scripttok.local

# Start server
npm run dev
```

This hybrid mode is useful for testing quota enforcement logic without requiring full authentication or Stripe integration.

### Frontend Authentication Flow

The frontend implements a complete authentication UI with automatic dev/prod switching, protected routes, and seamless login experience.

#### Components

**LoginModal** (`client/src/components/LoginModal.tsx`)
- Dialog-based login UI using shadcn/ui components
- Opens Replit Auth in popup window (350x500)
- Listens for `auth_complete` message from popup
- Auto-reloads page to pick up authenticated state
- Props: `open: boolean`, `onOpenChange: (open: boolean) => void`

**ProtectedRoute** (`client/src/components/ProtectedRoute.tsx`)
- Wraps routes requiring authentication
- Shows loading skeleton while checking auth
- Shows login prompt if not authenticated
- Renders children when authenticated
- Usage: `<ProtectedRoute><Dashboard /></ProtectedRoute>`

**AuthProvider** (`client/src/components/AuthProvider.tsx`)
- React context providing auth state to entire app
- Calls `/api/auth/me` on mount to check authentication
- Provides `user`, `isLoading`, `isAuthenticated` state
- Provides `login()` and `logout()` functions
- Auto-detects dev/prod mode from environment

#### User Experience

**Development Mode (APP_ENV=development)**:
- No login required - user is auto-authenticated
- Dev mode badge visible in top-right corner
- Console logs show dev user details
- All features accessible immediately

**Production Mode (APP_ENV=production)**:
- Landing page shows "Start for Free" button
- Button opens LoginModal with Replit Auth
- After login, user redirected to dashboard
- Header shows user profile with logout option
- Protected routes require authentication

#### Protected Routes

The following routes require authentication:
- `/dashboard` - Main dashboard
- `/generate` - Content generation
- `/content-history` - Generated content history
- `/trend-history` - Trend analysis history
- `/account` - User account settings

Public routes (no auth required):
- `/` - Landing page
- `/about`, `/how-it-works`, `/faq`, `/contact`
- `/privacy`, `/terms`, `/compliance`
- All legal pages

#### Auth-Aware UI Components

**Landing Page** (`client/src/pages/LandingPage.tsx`)
- NOT authenticated: "Start for Free" button → opens login modal
- IS authenticated: "Go to Dashboard" button → navigates to /dashboard

**Layout Header** (`client/src/components/Layout.tsx`)
- NOT authenticated: "Sign In" button → opens login modal
- IS authenticated: User avatar/name with dropdown menu containing logout

**Dev Mode Indicator**
- Shows amber "Dev Mode" badge when `APP_ENV=development`
- Located in header area for visibility
- Helps developers identify current environment

#### Testing the Flow

**Test Dev Mode**:
1. Set `APP_ENV=development` in .env
2. Start app with `npm run dev`
3. You're automatically logged in as dev user
4. Dev mode badge visible in header
5. All routes accessible without login

**Test Production Mode**:
1. Set `APP_ENV=production` in .env (or don't set it on Replit)
2. Visit landing page - should see "Start for Free"
3. Click button to open login modal
4. Login with Replit Auth
5. Redirected to dashboard with user profile in header

**Test Protected Routes**:
1. In production mode (no auth), try visiting `/dashboard` directly
2. Should see login prompt: "Sign in to continue"
3. Click "Sign In" button to open login modal
4. After authentication, content displays

## 🌐 API Endpoints

### Content Generation
- `POST /api/generate-content` - Single content generation
- `POST /api/generate-content/unified` - Unified content generation system
- `GET /api/content-generation/templates` - List available templates
- `POST /api/content-generation/bulk/start` - Start bulk generation job

### Trending Data
- `GET /api/trending` - Fetch trending products by niche
- `GET /api/trend-forecast/:niche` - Get trend forecasts
- `POST /api/trending/refresh` - Refresh trending data
- `GET /api/trending-emojis-hashtags/:niche` - Get trending hashtags

### Analytics & Monitoring
- `GET /api/analytics/overview` - AI model metrics overview
- `GET /api/history` - Content generation history
- `GET /api/ai-analytics/claude` - Claude AI analytics
- `GET /api/ai-analytics/openai` - OpenAI analytics
- `GET /api/ai-analytics/perplexity` - Perplexity analytics

### System Status
- `GET /api/gatekeeper/status` - Generation gatekeeper status
- `GET /api/amazon/status` - Amazon PA-API status (if enabled)
- `GET /health` - General health check

## 🔐 Environment Variables

### Required Variables
```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/scripttok

# AI Service API Keys
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
PERPLEXITY_API_KEY=pplx-...

# Server Configuration
NODE_ENV=development
PORT=3000
```

### Optional Variables
```env
# Caching
REDIS_URL=redis://localhost:6379

# Amazon PA-API (if enabling Amazon features)
ENABLE_AMAZON_FEATURES=false
AMAZON_ACCESS_KEY_ID=your-access-key
AMAZON_SECRET_ACCESS_KEY=your-secret-key
AMAZON_PARTNER_TAG=your-partner-tag

# Analytics
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Webhooks
MAKE_WEBHOOK_URL=https://hook.make.com/...
```

### Replit Environment
When deploying on Replit, environment variables are managed through the Secrets tab in your Repl. The following secrets are automatically available:
- `ANTHROPIC_API_KEY`
- `OPENAI_API_KEY`
- Database credentials are auto-configured

## 📝 Content Generation Modes

### 🔥 Viral Content Studio
The Viral Content Studio focuses on creating trending, viral content by:
- **Trend Analysis**: Real-time trending topic discovery via Perplexity API
- **Viral Score Calculation**: AI-powered content evaluation for viral potential
- **Template Variety**: Multiple viral content templates (storytelling, hooks, trending formats)
- **Platform Optimization**: Content adapted for maximum engagement on each platform

### 💰 Affiliate Content Studio  
The Affiliate Content Studio specializes in product-focused content by:
- **Product Research**: Intelligent product discovery and analysis
- **Affiliate Integration**: Smart affiliate link integration and optimization
- **Conversion Optimization**: Content designed for maximum conversion rates
- **Product Templates**: Specialized templates for product reviews, comparisons, and promotions

### 🤖 AI Model Routing
The system intelligently routes requests between:
- **Claude (Primary)**: High-quality content generation and analysis
- **OpenAI GPT-4**: Creative content and diverse writing styles
- **Perplexity**: Research, trend discovery, and factual content

## 🎯 Key Features Detail

### Trend Forecasting & Analysis
- **Real-time Data**: Live trending topic discovery across multiple sources
- **Niche-Specific Trends**: Targeted trend analysis for beauty, tech, fashion, fitness, food, travel, and pets
- **Viral Prediction**: AI-powered viral potential scoring
- **Trend History**: Comprehensive trend tracking and historical analysis

### Content Evaluation & Scoring
- **Dual AI Evaluation**: Content assessed by both Claude and OpenAI
- **Quality Metrics**: Comprehensive scoring across multiple dimensions
- **Performance Tracking**: Historical performance data and insights
- **Smart Recommendations**: AI-generated improvement suggestions

### Template System
- **Dynamic Templates**: Adaptable content templates for various niches
- **Platform-Specific**: Optimized templates for each social media platform
- **Custom Variables**: Flexible template system with smart variable injection
- **Performance-Based**: Templates optimized based on historical performance data

### Multi-Platform Content Adaptation
- **TikTok**: Short-form video scripts with hooks and trending elements
- **Instagram**: Story, reel, and post content with hashtag optimization
- **YouTube**: Long-form content with SEO optimization
- **Twitter**: Concise, engaging tweet threads and single posts
- **Facebook**: Community-focused content with engagement drivers

## 🧪 Development

### Testing Setup
```bash
# Run all tests
npm test

# Run E2E tests
npx playwright test

# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration
```

### Code Structure & Conventions
- **TypeScript**: Strict type checking enabled
- **ESM Modules**: Modern ES module syntax
- **Drizzle ORM**: Type-safe database operations
- **Zod Validation**: Schema validation for API requests
- **Component Architecture**: Reusable component design patterns

### Database Migrations
```bash
# Push schema changes to database
npm run db:push

# Force push schema changes (if warnings)
npm run db:push --force
```

**⚠️ Important**: Always use `npm run db:push` for schema changes. Never manually write SQL migrations.

## 🚀 Deployment

### Replit Deployment
1. **Create New Repl**: Import from GitHub repository
2. **Configure Secrets**: Add required API keys in the Secrets tab
3. **Database Setup**: Use Replit's built-in PostgreSQL database
4. **Deploy**: Use Replit's one-click deployment

### Production Considerations
- **Environment Variables**: Ensure all required variables are set
- **Database**: Use a production PostgreSQL instance (Neon recommended)
- **Caching**: Configure Redis for production caching
- **Monitoring**: Set up logging and error tracking
- **Rate Limiting**: Configure appropriate rate limits for API endpoints

### Build Configuration
```bash
# Production build
npm run build

# Start production server
npm start
```

## 🤝 Contributing

### Development Guidelines
- **Code Style**: Follow existing TypeScript and React patterns
- **Testing**: Add tests for new features and bug fixes
- **Documentation**: Update documentation for significant changes
- **Type Safety**: Maintain strict TypeScript compliance

### How to Contribute
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Reporting Issues
- Use GitHub Issues for bug reports and feature requests
- Include detailed reproduction steps for bugs
- Provide environment information and error logs

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🔗 Links

- **Documentation**: [Full API Documentation](docs/api.md)
- **Support**: [GitHub Issues](https://github.com/your-username/scripttok/issues)
- **Contributing**: [Contributing Guidelines](CONTRIBUTING.md)

---

<div align="center">
  <strong>Built with ❤️ for content creators worldwide</strong>
</div>