import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { authGuard } from '../middleware/authGuard';
import { storage } from '../storage';
import { getQuotaService } from '../services/quotaService';

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
    const userId = req.user?.userId;
    
    if (!userId) {
      console.error('[BillingAPI] ❌ No userId found in request');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log(`[BillingAPI] Getting subscription for user: ${userId}`);

    if (DISABLE_BILLING || !stripe) {
      console.log('[BillingAPI:Mock] Returning mock subscription data');
      return res.json({
        tier: 'free',
        status: 'active',
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false
      });
    }

    const userIdNum = parseInt(userId);
    const subscription = await storage.getUserSubscription(userIdNum);

    if (!subscription) {
      console.log(`[BillingAPI] No subscription found for user ${userId}, returning free tier`);
      return res.json({
        tier: 'free',
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

// POST /api/billing/create-checkout - Create Stripe checkout session for Pro upgrade
router.post('/create-checkout', authGuard, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { tier } = req.body;

    if (!userId) {
      console.error('[BillingAPI] ❌ No userId found in request');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (tier !== 'pro') {
      console.error('[BillingAPI] ❌ Invalid tier requested:', tier);
      return res.status(400).json({ error: 'Invalid tier. Only "pro" tier is supported.' });
    }

    console.log(`[BillingAPI] Creating checkout session for user ${userId}, tier: ${tier}`);

    if (DISABLE_BILLING || !stripe) {
      console.log('[BillingAPI:Mock] Returning mock checkout session');
      return res.json({
        sessionId: 'mock_checkout_session_' + Date.now(),
        url: `${APP_URL}/billing/success?mock=true`
      });
    }

    const userIdNum = parseInt(userId);
    const user = await storage.getUser(userIdNum);
    
    if (!user) {
      console.error('[BillingAPI] ❌ User not found:', userId);
      return res.status(404).json({ error: 'User not found' });
    }

    let customerId = '';
    const subscription = await storage.getUserSubscription(userIdNum);
    
    if (subscription?.stripeCustomerId) {
      customerId = subscription.stripeCustomerId;
      console.log(`[BillingAPI] Using existing Stripe customer: ${customerId}`);
    } else {
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        metadata: {
          userId: userId
        }
      });
      customerId = customer.id;
      console.log(`[BillingAPI] ✅ Created new Stripe customer: ${customerId}`);
      
      if (subscription) {
        await storage.updateSubscription(userIdNum, {
          stripeCustomerId: customerId
        });
      }
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Pro Plan',
              description: '500 generations per month'
            },
            unit_amount: 2000,
            recurring: {
              interval: 'month'
            }
          },
          quantity: 1
        }
      ],
      success_url: `${APP_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/billing/cancel`,
      metadata: {
        userId: userId,
        tier: 'pro'
      }
    });

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
    const userId = req.user?.userId;

    if (!userId) {
      console.error('[BillingAPI] ❌ No userId found in request');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log(`[BillingAPI] Cancelling subscription for user: ${userId}`);

    if (DISABLE_BILLING || !stripe) {
      console.log('[BillingAPI:Mock] Returning mock cancellation response');
      return res.json({
        success: true,
        message: 'Subscription will be cancelled at period end (mock)',
        cancelAtPeriodEnd: true
      });
    }

    const userIdNum = parseInt(userId);
    const subscription = await storage.getUserSubscription(userIdNum);

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

// GET /api/billing/usage - Get current month's usage stats
router.get('/usage', authGuard, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      console.error('[BillingAPI] ❌ No userId found in request');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log(`[BillingAPI] Getting usage stats for user: ${userId}`);

    const userIdNum = parseInt(userId);
    const quota = await quotaService.checkQuota(userIdNum);
    const tier = await quotaService.getUserTier(userIdNum);

    console.log(`[BillingAPI] ✅ Usage stats:`, {
      used: quota.used,
      limit: quota.limit,
      remaining: quota.remaining,
      tier
    });

    res.json({
      used: quota.used,
      limit: quota.limit,
      remaining: quota.remaining,
      tier
    });

  } catch (error: any) {
    console.error('[BillingAPI] ❌ Error getting usage:', error);
    res.status(500).json({ error: 'Failed to get usage stats', message: error.message });
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
