import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';

if (!STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY not found in environment');
  process.exit(1);
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2025-09-30.clover',
});

// Payment link IDs from CSV
const paymentLinks = {
  'starter-monthly': 'plink_1SG5zVEmHXkjAFxS55aTmfXA',
  'starter-annual': 'plink_1SG6VSEmHXkjAFxSKY9jxYBv',
  'creator-monthly': 'plink_1SG5zVEmHXkjAFxSGIrh24VC',
  'creator-annual': 'plink_1SG6WSEmHXkjAFxSFq3fV33k',
  'pro-monthly': 'plink_1SG5zVEmHXkjAFxSWm6xgsq3',
  'pro-annual': 'plink_1SG5zWEmHXkjAFxSgDlETQz1',
};

async function fetchPriceIds() {
  console.log('🔍 Fetching price IDs from Stripe payment links...\n');

  const priceIds: Record<string, string> = {};

  for (const [key, linkId] of Object.entries(paymentLinks)) {
    try {
      const link = await stripe.paymentLinks.retrieve(linkId);
      
      // Payment links have line_items array, get the first price ID
      if (link.line_items && link.line_items.data.length > 0) {
        const priceId = link.line_items.data[0].price.id;
        priceIds[key] = priceId;
        console.log(`✅ ${key}: ${priceId}`);
      } else {
        console.error(`❌ ${key}: No line items found`);
      }
    } catch (error: any) {
      console.error(`❌ ${key}: ${error.message}`);
    }
  }

  console.log('\n📋 Environment variables to add:');
  console.log('─────────────────────────────────────────');
  console.log(`STRIPE_PRICE_STARTER_MONTHLY="${priceIds['starter-monthly'] || ''}"`);
  console.log(`STRIPE_PRICE_STARTER_ANNUAL="${priceIds['starter-annual'] || ''}"`);
  console.log(`STRIPE_PRICE_CREATOR_MONTHLY="${priceIds['creator-monthly'] || ''}"`);
  console.log(`STRIPE_PRICE_CREATOR_ANNUAL="${priceIds['creator-annual'] || ''}"`);
  console.log(`STRIPE_PRICE_PRO_MONTHLY="${priceIds['pro-monthly'] || ''}"`);
  console.log(`STRIPE_PRICE_PRO_ANNUAL="${priceIds['pro-annual'] || ''}"`);
  console.log('\n⚠️  Note: Agency tier not found in CSV. You may need to create it separately.');
}

fetchPriceIds().catch(console.error);
