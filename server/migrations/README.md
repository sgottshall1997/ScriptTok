# Database Migrations

## Tier Migration to 4-Tier Structure

This migration updates the subscription tier system from the legacy 2-tier (free/pro) to the new 4-tier structure (starter/creator/pro/agency).

### Migration Script: `migrate-tiers-to-4-tier.ts`

**Purpose**: Updates all users with `subscriptionTier = 'free'` to `subscriptionTier = 'starter'`

**Features**:
- ✅ Idempotent (safe to run multiple times)
- ✅ Logs the number of users migrated
- ✅ Can be run directly via Node.js or through the admin API endpoint

### Running the Migration

#### Option 1: Direct Execution
```bash
npx tsx server/migrations/migrate-tiers-to-4-tier.ts
```

#### Option 2: Via API (Recommended for Production)
```bash
curl -X POST http://localhost:5000/api/billing/admin/migrate-tiers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>"
```

**Note**: The API endpoint requires admin authentication.

### Required Environment Variables

For the 4-tier pricing structure to work with Stripe, you need to add the following environment variables:

```bash
# Stripe Price IDs for all tiers
STRIPE_PRICE_STARTER_MONTHLY=price_xxx  # $7/mo
STRIPE_PRICE_STARTER_ANNUAL=price_xxx   # $5/mo (billed annually)
STRIPE_PRICE_CREATOR_MONTHLY=price_xxx  # $15/mo
STRIPE_PRICE_CREATOR_ANNUAL=price_xxx   # $10/mo (billed annually)
STRIPE_PRICE_PRO_MONTHLY=price_xxx      # $35/mo
STRIPE_PRICE_PRO_ANNUAL=price_xxx       # $25/mo (billed annually)
STRIPE_PRICE_AGENCY_MONTHLY=price_xxx   # $69/mo
STRIPE_PRICE_AGENCY_ANNUAL=price_xxx    # $50/mo (billed annually)
```

**To create these price IDs**:
1. Log in to your Stripe Dashboard
2. Go to Products → Create Product
3. Add pricing for each tier (monthly and annual)
4. Copy the Price ID (starts with `price_`)
5. Add to your environment variables

### Tier Comparison

| Tier     | Monthly | Annual | GPT Limit | Claude Limit | Trend Analyses |
|----------|---------|--------|-----------|--------------|----------------|
| Starter  | $7      | $5/mo  | 15        | 10           | 10             |
| Creator  | $15     | $10/mo | 50        | 30           | 25             |
| Pro      | $35     | $25/mo | 300       | 150          | 100            |
| Agency   | $69     | $50/mo | 1000      | 500          | Unlimited      |

### API Changes

The following endpoints have been updated to support the 4-tier structure:

1. **POST /api/billing/create-checkout**
   - Now accepts `tier` parameter: 'starter' | 'creator' | 'pro' | 'agency'
   - Now accepts `billingPeriod` parameter: 'monthly' | 'annual'

2. **GET /api/billing/usage**
   - Returns comprehensive tier-specific features and limits
   - Includes all quota service methods for feature checking

3. **GET /api/billing/tiers** (NEW)
   - Returns complete tier comparison data for pricing pages
   - Includes all features and limits for each tier

4. **POST /api/billing/admin/migrate-tiers** (NEW)
   - Admin-only endpoint to run the tier migration
   - Returns the number of users migrated

### Backward Compatibility

The system maintains backward compatibility:
- Legacy 'free' tier is automatically mapped to 'starter' in `quotaService.getUserTier()`
- Existing 'pro' users are unaffected
- No database schema changes required
