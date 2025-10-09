import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { authGuard } from '../middleware/authGuard';
import { storage } from '../storage';
import { getQuotaService } from '../services/quotaService';
import { migrateTo4Tier } from '../migrations/migrate-tiers-to-4-tier';

const router = Router();

const DISABLE_BILLING = process.env.DISABLE_BILLING === '1';
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';
const APP_URL = process.env.APP_URL || 'http://localhost:5000';

let stripe: Stripe | null = null;

if (!DISABLE_BILLING) {
  if (!STRIPE_SECRET_KEY) {
    console.warn('[BillingAPI] ⚠️ STRIPE_SECRET_KEY not found - billing will run in mock mode');
  } else {
    stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2025-09-30.clover',
    });
    console.log('[BillingAPI] ✅ Stripe initialized successfully');
  }
}

if (DISABLE_BILLING) {
  console.log('[BillingAPI] 🔧 Running in MOCK MODE (DISABLE_BILLING=1)');
} else {
  console.log('[BillingAPI] 💳 Running in PRODUCTION MODE with Stripe');
}

const quotaService = getQuotaService(storage);

// GET /api/billing/subscription - Get current user's subscription status
router.get('/subscription', authGuard, async (req: Request, res: Response) => {
  try {
    // Use internal user ID from auth middleware (set by authGuard/checkQuota)
    const internalUserId = (req as any).internalUserId;
    
    if (!internalUserId) {
      console.error('[BillingAPI] ❌ No internal userId found in request');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log(`[BillingAPI] Getting subscription for internal user ID: ${internalUserId}`);

    if (DISABLE_BILLING || !stripe) {
      console.log('[BillingAPI:Mock] Returning mock subscription data');
      return res.json({
        tier: 'starter',
        status: 'active',
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false
      });
    }

    const subscription = await storage.getUserSubscription(internalUserId);

    if (!subscription) {
      console.log(`[BillingAPI] No subscription found for user ${internalUserId}, returning starter tier`);
      return res.json({
        tier: 'starter',
        status: 'active',
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false
      });
    }

    console.log(`[BillingAPI] ✅ Subscription found:`, {
      tier: subscription.tier,
      status: subscription.status,
      endAt: subscription.endAt
    });

    let cancelAtPeriodEnd = false;
    if (subscription.stripeSubscriptionId && stripe) {
      try {
        const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);
        cancelAtPeriodEnd = stripeSubscription.cancel_at_period_end;
      } catch (error) {
        console.error('[BillingAPI] Error retrieving Stripe subscription:', error);
      }
    }

    res.json({
      tier: subscription.tier,
      status: subscription.status,
      currentPeriodEnd: subscription.endAt,
      cancelAtPeriodEnd
    });

  } catch (error: any) {
    console.error('[BillingAPI] ❌ Error getting subscription:', error);
    res.status(500).json({ error: 'Failed to get subscription', message: error.message });
  }
});

// POST /api/billing/create-checkout - Create Stripe checkout session for any tier
router.post('/create-checkout', authGuard, async (req: Request, res: Response) => {
  try {
    const internalUserId = (req as any).internalUserId;
    const { tier, billingPeriod = 'monthly' } = req.body;

    if (!internalUserId) {
      console.error('[BillingAPI] ❌ No internal userId found in request');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Validate tier
    const validTiers = ['free', 'starter', 'creator', 'pro', 'agency'];
    if (!validTiers.includes(tier)) {
      console.error('[BillingAPI] ❌ Invalid tier requested:', tier);
      return res.status(400).json({ error: 'Invalid tier. Must be one of: free, starter, creator, pro, agency' });
    }

    // Validate billing period
    if (billingPeriod !== 'monthly' && billingPeriod !== 'annual') {
      console.error('[BillingAPI] ❌ Invalid billing period:', billingPeriod);
      return res.status(400).json({ error: 'Invalid billing period. Must be "monthly" or "annual"' });
    }

    console.log(`[BillingAPI] Creating checkout session for internal user ID ${internalUserId}, tier: ${tier}, period: ${billingPeriod}`);

    if (DISABLE_BILLING || !stripe) {
      console.log('[BillingAPI:Mock] Returning mock checkout session');
      return res.json({
        sessionId: 'mock_checkout_session_' + Date.now(),
        url: `${APP_URL}/billing/success?mock=true`
      });
    }

    const user = await storage.getUser(internalUserId);
    
    if (!user) {
      console.error('[BillingAPI] ❌ User not found:', internalUserId);
      return res.status(404).json({ error: 'User not found' });
    }

    // Map tier to Stripe price ID
    const stripePriceIds: Record<string, Record<string, string | undefined>> = {
      starter: {
        monthly: process.env.STRIPE_PRICE_STARTER_MONTHLY,
        annual: process.env.STRIPE_PRICE_STARTER_ANNUAL
      },
      creator: {
        monthly: process.env.STRIPE_PRICE_CREATOR_MONTHLY,
        annual: process.env.STRIPE_PRICE_CREATOR_ANNUAL
      },
      pro: {
        monthly: process.env.STRIPE_PRICE_PRO_MONTHLY,
        annual: process.env.STRIPE_PRICE_PRO_ANNUAL
      },
      agency: {
        monthly: process.env.STRIPE_PRICE_AGENCY_MONTHLY,
        annual: process.env.STRIPE_PRICE_AGENCY_ANNUAL
      }
    };

    const priceId = stripePriceIds[tier]?.[billingPeriod];

    // Tier pricing for mock/fallback mode
    const tierPricing: Record<string, Record<string, { name: string; description: string; amount: number }>> = {
      starter: {
        monthly: { name: 'Starter Plan', description: '15 GPT generations, 10 Claude generations per month', amount: 700 },
        annual: { name: 'Starter Plan (Annual)', description: '15 GPT generations, 10 Claude generations per month', amount: 500 }
      },
      creator: {
        monthly: { name: 'Creator Plan', description: '50 GPT generations, 30 Claude generations per month', amount: 1500 },
        annual: { name: 'Creator Plan (Annual)', description: '50 GPT generations, 30 Claude generations per month', amount: 1000 }
      },
      pro: {
        monthly: { name: 'Pro Plan', description: '300 GPT generations, 150 Claude generations per month', amount: 3500 },
        annual: { name: 'Pro Plan (Annual)', description: '300 GPT generations, 150 Claude generations per month', amount: 2500 }
      },
      agency: {
        monthly: { name: 'Agency Plan', description: 'Unlimited generations, API access, team seats', amount: 6900 },
        annual: { name: 'Agency Plan (Annual)', description: 'Unlimited generations, API access, team seats', amount: 5000 }
      }
    };

    let customerId = '';
    const subscription = await storage.getUserSubscription(internalUserId);
    
    if (subscription?.stripeCustomerId) {
      customerId = subscription.stripeCustomerId;
      console.log(`[BillingAPI] Using existing Stripe customer: ${customerId}`);
    } else {
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        metadata: {
          userId: internalUserId.toString()
        }
      });
      customerId = customer.id;
      console.log(`[BillingAPI] ✅ Created new Stripe customer: ${customerId}`);
      
      if (subscription) {
        await storage.updateSubscription(internalUserId, {
          stripeCustomerId: customerId
        });
      }
    }

    const pricing = tierPricing[tier][billingPeriod];
    
    // Create session with either Stripe price ID or inline price data
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: priceId ? [
        {
          price: priceId,
          quantity: 1
        }
      ] : [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: pricing.name,
              description: pricing.description
            },
            unit_amount: pricing.amount,
            recurring: {
              interval: billingPeriod === 'annual' ? 'year' : 'month'
            }
          },
          quantity: 1
        }
      ],
      success_url: `${APP_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/billing/cancel`,
      metadata: {
        userId: internalUserId.toString(),
        tier,
        billingPeriod
      }
    };

    const session = await stripe.checkout.sessions.create(sessionConfig);

    console.log(`[BillingAPI] ✅ Checkout session created: ${session.id}`);

    res.json({
      sessionId: session.id,
      url: session.url
    });

  } catch (error: any) {
    console.error('[BillingAPI] ❌ Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session', message: error.message });
  }
});

// POST /api/billing/cancel-subscription - Cancel user's subscription at period end
router.post('/cancel-subscription', authGuard, async (req: Request, res: Response) => {
  try {
    const internalUserId = (req as any).internalUserId;

    if (!internalUserId) {
      console.error('[BillingAPI] ❌ No internal userId found in request');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log(`[BillingAPI] Cancelling subscription for internal user ID: ${internalUserId}`);

    if (DISABLE_BILLING || !stripe) {
      console.log('[BillingAPI:Mock] Returning mock cancellation response');
      return res.json({
        success: true,
        message: 'Subscription will be cancelled at period end (mock)',
        cancelAtPeriodEnd: true
      });
    }

    const subscription = await storage.getUserSubscription(internalUserId);

    if (!subscription || !subscription.stripeSubscriptionId) {
      console.error('[BillingAPI] ❌ No active subscription found');
      return res.status(404).json({ error: 'No active subscription found' });
    }

    const updatedSubscription = await stripe.subscriptions.update(
      subscription.stripeSubscriptionId,
      {
        cancel_at_period_end: true
      }
    );

    console.log(`[BillingAPI] ✅ Subscription cancelled at period end:`, updatedSubscription.id);

    res.json({
      success: true,
      message: 'Subscription will be cancelled at the end of the current billing period',
      cancelAtPeriodEnd: true
    });

  } catch (error: any) {
    console.error('[BillingAPI] ❌ Error cancelling subscription:', error);
    res.status(500).json({ error: 'Failed to cancel subscription', message: error.message });
  }
});

// GET /api/billing/usage - Get current month's usage stats with comprehensive tier-specific data
router.get('/usage', authGuard, async (req: Request, res: Response) => {
  try {
    const internalUserId = (req as any).internalUserId;

    if (!internalUserId) {
      console.error('[BillingAPI] ❌ No internal userId found in request');
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    console.log(`[BillingAPI] Getting comprehensive usage stats for internal user ID: ${internalUserId}`);

    const tier = await quotaService.getUserTier(internalUserId);
    const usage = await quotaService.getOrCreateMonthlyUsage(internalUserId);
    
    // Get tier-specific limits
    const limits = {
      gpt: quotaService.getGptLimit(tier),
      claude: quotaService.getClaudeLimit(tier),
      trends: quotaService.getTrendAnalysisLimit(tier)
    };

    // Get tier-specific features
    const features = {
      tier,
      viralScoreType: quotaService.getViralScoreType(tier),
      canBulkGenerate: quotaService.canBulkGenerate(tier),
      bulkGenerationLimit: quotaService.getBulkGenerationLimit(tier),
      unlockedNiches: quotaService.getUnlockedNiches(tier),
      historyLimit: quotaService.getHistoryLimit(tier),
      canExportContent: quotaService.canExportContent(tier),
      canAccessAffiliate: quotaService.canAccessAffiliate(tier),
      trendForecastingLevel: quotaService.getTrendForecastingLevel(tier),
      canUseAPI: quotaService.canUseAPI(tier),
      canUseBrandTemplates: quotaService.canUseBrandTemplates(tier),
      teamSeats: quotaService.getTeamSeats(tier),
      templatesUnlocked: quotaService.getUnlockedTemplateCount(tier)
    };

    const data = {
      usage: {
        gptGenerationsUsed: usage.gptGenerationsUsed,
        claudeGenerationsUsed: usage.claudeGenerationsUsed,
        trendAnalysesUsed: usage.trendAnalysesUsed,
        periodMonth: usage.periodMonth
      },
      limits,
      features,
      remaining: {
        gpt: Math.max(0, limits.gpt - usage.gptGenerationsUsed),
        claude: Math.max(0, limits.claude - usage.claudeGenerationsUsed),
        trends: Math.max(0, limits.trends - usage.trendAnalysesUsed)
      }
    };

    console.log(`[BillingAPI] ✅ Comprehensive usage stats retrieved for tier: ${tier}`);

    res.json({ success: true, data });

  } catch (error: any) {
    console.error('[BillingAPI] ❌ Error getting usage:', error);
    res.status(500).json({ success: false, error: 'Failed to get usage stats' });
  }
});

// POST /api/billing/upgrade - Upgrade user to pro tier
router.post('/upgrade', authGuard, async (req: Request, res: Response) => {
  try {
    const internalUserId = (req as any).internalUserId;

    if (!internalUserId) {
      console.error('[BillingAPI] ❌ No internal userId found in request');
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    console.log(`[BillingAPI] Upgrading user to pro tier for internal user ID: ${internalUserId}`);

    await storage.updateUserTier(internalUserId, 'pro');

    console.log(`[BillingAPI] ✅ User ${internalUserId} upgraded to pro tier`);

    res.json({ 
      success: true, 
      data: { 
        tier: 'pro',
        message: 'Successfully upgraded to Pro tier'
      } 
    });

  } catch (error: any) {
    console.error('[BillingAPI] ❌ Error upgrading user:', error);
    res.status(500).json({ success: false, error: 'Failed to upgrade user' });
  }
});

// GET /api/billing/tiers - Get tier comparison data for pricing page
router.get('/tiers', async (req: Request, res: Response) => {
  try {
    console.log('[BillingAPI] Getting tier comparison data');

    const tiers = [
      {
        id: 'starter',
        name: 'Starter',
        price: { monthly: 7, annual: 5 },
        limits: {
          gpt: 15,
          claude: 10,
          trends: 10
        },
        features: {
          viralScore: 'basic',
          templates: '3 per category',
          niches: ['beauty', 'tech', 'fashion'],
          nicheCount: 3,
          history: 10,
          bulkGeneration: false,
          bulkLimit: 0,
          export: false,
          forecasting: 'none',
          affiliateStudio: false,
          apiAccess: false,
          brandTemplates: false,
          teamSeats: 1
        }
      },
      {
        id: 'creator',
        name: 'Creator',
        price: { monthly: 15, annual: 10 },
        limits: {
          gpt: 50,
          claude: 30,
          trends: 25
        },
        features: {
          viralScore: 'full',
          templates: 'All templates',
          niches: ['beauty', 'tech', 'fashion', 'health', 'food', 'travel', 'fitness'],
          nicheCount: 7,
          history: 50,
          bulkGeneration: false,
          bulkLimit: 0,
          export: true,
          forecasting: 'basic',
          affiliateStudio: false,
          apiAccess: false,
          brandTemplates: false,
          teamSeats: 1
        }
      },
      {
        id: 'pro',
        name: 'Pro',
        price: { monthly: 35, annual: 25 },
        limits: {
          gpt: 300,
          claude: 150,
          trends: 100
        },
        features: {
          viralScore: 'advanced',
          templates: 'All templates',
          niches: ['beauty', 'tech', 'fashion', 'health', 'food', 'travel', 'fitness'],
          nicheCount: 7,
          history: 'Unlimited',
          bulkGeneration: true,
          bulkLimit: 10,
          export: true,
          forecasting: 'full',
          affiliateStudio: true,
          apiAccess: false,
          brandTemplates: false,
          teamSeats: 1
        }
      },
      {
        id: 'agency',
        name: 'Agency',
        price: { monthly: 69, annual: 50 },
        limits: {
          gpt: 1000,
          claude: 500,
          trends: Infinity
        },
        features: {
          viralScore: 'enterprise',
          templates: 'All templates + Brand templates',
          niches: ['beauty', 'tech', 'fashion', 'health', 'food', 'travel', 'fitness'],
          nicheCount: 7,
          history: 'Unlimited',
          bulkGeneration: true,
          bulkLimit: 50,
          export: true,
          forecasting: 'full',
          affiliateStudio: true,
          apiAccess: true,
          brandTemplates: true,
          teamSeats: 5
        }
      }
    ];

    res.json({ success: true, tiers });

  } catch (error: any) {
    console.error('[BillingAPI] ❌ Error getting tiers:', error);
    res.status(500).json({ success: false, error: 'Failed to get tier data' });
  }
});

// POST /api/billing/admin/migrate-tiers - Run tier migration (admin endpoint)
router.post('/admin/migrate-tiers', authGuard, async (req: Request, res: Response) => {
  try {
    const internalUserId = (req as any).internalUserId;

    if (!internalUserId) {
      console.error('[BillingAPI] ❌ No internal userId found in request');
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    // Check if user is admin (you may want to add role check here)
    const user = await storage.getUser(internalUserId);
    if (!user || user.role !== 'admin') {
      console.error('[BillingAPI] ❌ User is not admin:', internalUserId);
      return res.status(403).json({ success: false, error: 'Forbidden: Admin access required' });
    }

    console.log('[BillingAPI] Running tier migration by admin user:', internalUserId);

    const result = await migrateTo4Tier();

    console.log(`[BillingAPI] ✅ Migration completed:`, result);

    res.json({ 
      success: true, 
      message: `Successfully migrated ${result.usersUpdated} users from 'free' to 'starter'`,
      usersUpdated: result.usersUpdated
    });

  } catch (error: any) {
    console.error('[BillingAPI] ❌ Error running migration:', error);
    res.status(500).json({ success: false, error: 'Migration failed', message: error.message });
  }
});

// POST /api/billing/webhook - Stripe webhook handler (no auth required)
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    const sig = req.headers['stripe-signature'] as string;

    if (DISABLE_BILLING || !stripe) {
      console.log('[BillingAPI:Mock] Webhook received (mock mode), event:', req.body.type || 'unknown');
      return res.json({ received: true });
    }

    if (!sig) {
      console.error('[BillingAPI] ❌ No Stripe signature found');
      return res.status(400).json({ error: 'No signature found' });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
    } catch (err: any) {
      console.error('[BillingAPI] ❌ Webhook signature verification failed:', err.message);
      return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    console.log(`[BillingAPI] 📥 Webhook received: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const tier = session.metadata?.tier || 'pro';

        if (!userId) {
          console.error('[BillingAPI] ❌ No userId in checkout session metadata');
          break;
        }

        console.log(`[BillingAPI] Processing checkout.session.completed for user ${userId}`);

        const userIdNum = parseInt(userId);
        const stripeCustomerId = session.customer as string;
        const stripeSubscriptionId = session.subscription as string;

        const now = new Date();
        const periodEnd = new Date();
        periodEnd.setMonth(periodEnd.getMonth() + 1);

        const existingSubscription = await storage.getUserSubscription(userIdNum);

        if (existingSubscription) {
          await storage.updateSubscription(userIdNum, {
            tier,
            status: 'active',
            stripeCustomerId,
            stripeSubscriptionId,
            startAt: now,
            endAt: periodEnd
          });
          console.log(`[BillingAPI] ✅ Updated subscription for user ${userId}`);
        } else {
          await storage.createSubscription({
            userId: userIdNum,
            tier,
            status: 'active',
            stripeCustomerId,
            stripeSubscriptionId,
            startAt: now,
            endAt: periodEnd
          });
          console.log(`[BillingAPI] ✅ Created new subscription for user ${userId}`);
        }

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const stripeCustomerId = subscription.customer as string;

        const userSub = await storage.getUserSubscription(0);
        
        console.log(`[BillingAPI] Processing subscription.updated for customer ${stripeCustomerId}`);
        
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const stripeCustomerId = subscription.customer as string;

        console.log(`[BillingAPI] Processing subscription.deleted for customer ${stripeCustomerId}`);
        
        break;
      }

      default:
        console.log(`[BillingAPI] ⚠️ Unhandled webhook event type: ${event.type}`);
    }

    res.json({ received: true });

  } catch (error: any) {
    console.error('[BillingAPI] ❌ Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed', message: error.message });
  }
});

export default router;
