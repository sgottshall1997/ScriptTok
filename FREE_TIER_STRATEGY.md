# Free Tier Strategy Documentation

## Overview

The **"Free" tier** is an **automatic trial tier**, NOT a publicly advertised pricing plan. It serves as an onboarding experience for new users to try the platform before upgrading to a paid tier.

---

## Tier System Architecture

### 5-Tier Structure:

| Tier | Type | Purpose | Quota |
|------|------|---------|-------|
| **Free** | Trial (Auto-assigned) | New user onboarding | 3 total generations (GPT + Claude combined) |
| **Starter** | Paid | Entry-level creators | 15 GPT + 10 Claude/month |
| **Creator** | Paid | Aspiring influencers | 50 GPT + 30 Claude/month |
| **Pro** | Paid | Power users & agencies | 300 GPT + 150 Claude/month |
| **Agency** | Custom | Teams & multi-brand | 1000 GPT + 500 Claude/month |

---

## Free Tier Details

### Assignment:
- **Automatic:** All new users receive the 'free' tier upon signup
- **Implementation:** `identityService.ts` sets `subscriptionTier = 'free'` for new accounts
- **Default:** Schema default is 'free' in `users.subscriptionTier`

### Quota:
```typescript
// Special combined quota for free tier
if (tier === 'free') {
  const totalUsed = gptGenerationsUsed + claudeGenerationsUsed;
  const limit = 3; // Total combined, not per model
}
```

### Quota Exceeded Message:
```
"Free trial complete! Your 3 free generations are complete. 
Upgrade to Starter for 15 GPT + 10 Claude generations/month."
```

### Feature Restrictions:
Free tier has the **same restrictions as Starter tier**:
- ✅ 3 templates per category
- ✅ 3 niches (beauty, tech, fashion)
- ✅ Last 10 content items in history
- ✅ Basic viral score (number only)
- ❌ No bulk generation
- ❌ No content export
- ❌ No trend forecasting
- ❌ No affiliate studio

---

## Why Free Tier Is NOT on Pricing Page

### Strategic Reasons:

1. **Trial, Not a Plan:**
   - Free tier is an automatic trial, not a purchasable option
   - Users don't "choose" free tier - they receive it automatically
   
2. **Conversion Optimization:**
   - Showing "Free" on pricing page could cannibalize Starter sales
   - Better to frame it as "3 free generations to try" rather than a tier
   
3. **Clear Value Ladder:**
   - Pricing page shows: Starter → Creator → Pro → Agency
   - Clean progression from $7/mo to custom pricing
   - Free trial is mentioned separately as an onboarding benefit

4. **User Psychology:**
   - "Free tier" sounds permanent
   - "Free trial" creates urgency to upgrade
   - Messaging focuses on trying before buying

---

## Implementation Locations

### Backend:
- **Identity Service** (`server/services/identityService.ts:39`)
  ```typescript
  const subscriptionTier = 'free'; // New users start here
  ```

- **Quota Service** (`server/services/quotaService.ts`)
  - `getGptLimit('free')` → 3
  - `getClaudeLimit('free')` → 3
  - Special combined quota logic on lines 212-227

- **Middleware** (`server/middleware/checkQuota.ts`)
  - Free tier quota enforcement on lines 142-154
  - Custom error message: "Free trial complete"

### Frontend:
- **Pricing Page** (`client/src/pages/PricingPage.tsx`)
  - Free trial banner added (lines 241-245)
  - Shows "New users get 3 free AI generations to try the platform!"
  - Sparkles icons for visual appeal

- **Generate Content** (`client/src/pages/GenerateContent.tsx`)
  - Free tier treated same as Starter for UI restrictions
  - Lines 1121, 1146, 1158, 1985, 2008, 2118, 2170

- **Dashboard** (`client/src/pages/Dashboard.tsx`)
  - Free tier has same UI limitations as Starter (line 235)

### Database:
- **Schema** (`shared/schema.ts:25`)
  ```typescript
  subscriptionTier: text("subscription_tier")
    .notNull()
    .default("free"), // Valid tiers: 'free' (trial), 'starter', 'creator', 'pro', 'agency'
  ```

---

## User Journey

### New User Flow:

1. **Signup** → Auto-assigned 'free' tier
2. **Try Platform** → 3 free AI generations (GPT + Claude combined)
3. **Quota Exceeded** → "Free trial complete!" message
4. **Upgrade Prompt** → Directed to Starter tier ($7/mo)

### Free Trial Messaging:

**On Pricing Page:**
```
"New users get 3 free AI generations to try the platform!"
```

**On Quota Exceeded:**
```
Free trial complete! Your 3 free generations are complete. 
Upgrade to Starter for 15 GPT + 10 Claude generations/month.
```

**In Dashboard (Free Users):**
- Shows tier badge: "Free Trial"
- Usage stats: "3 of 3 used"
- Upgrade CTA prominently displayed

---

## Migration & Legacy Support

### Historical Context:
- Originally had 'free' and 'pro' tiers only
- Expanded to 5-tier system: free, starter, creator, pro, agency
- Legacy 'free' users maintained for backward compatibility

### Migration Script:
```typescript
// server/migrations/migrate-tiers-to-4-tier.ts
// Note: This was considered but NOT executed
// Free tier users remain as 'free' for trial purposes
```

### Backward Compatibility:
- QuotaService properly handles 'free' tier
- All middleware recognizes 'free' tier
- UI components treat 'free' same as 'starter' restrictions

---

## Analytics & Tracking

### Events to Track:

1. **Free Trial Started**
   - When: User creates account
   - Tier: 'free'
   
2. **Free Trial Generation Used**
   - When: User generates content (1st, 2nd, 3rd)
   - Remaining count tracked
   
3. **Free Trial Complete**
   - When: All 3 generations used
   - Conversion opportunity: Upgrade to Starter
   
4. **Free to Starter Conversion**
   - When: Free user upgrades to Starter
   - Key conversion metric

---

## Best Practices

### DO:
✅ Auto-assign 'free' tier to new users  
✅ Show free trial messaging on pricing page  
✅ Use "trial complete" language, not "quota exceeded"  
✅ Direct free users to Starter tier first  
✅ Track conversion from free → starter  

### DON'T:
❌ Show 'free' as a pricing tier option  
❌ Allow users to "downgrade" to free  
❌ Use "Free Forever" language  
❌ Give free users advanced features  
❌ Let free trial bypass quota limits  

---

## Future Considerations

### Potential Enhancements:

1. **Time-Limited Trial:**
   - Add expiration date (7 or 14 days)
   - "3 generations OR 7 days, whichever comes first"
   
2. **Trial Extension:**
   - Reward users for completing profile
   - +2 generations for email verification
   
3. **Trial Analytics:**
   - Track which features free users explore
   - Optimize conversion funnel based on behavior
   
4. **Personalized Upgrade:**
   - Recommend tier based on usage patterns
   - "You used 3 generations in 2 days - Creator tier might be perfect!"

---

## Testing Checklist

When testing free tier functionality:

- [ ] New user receives 'free' tier automatically
- [ ] Free tier has 3 combined generations (GPT + Claude)
- [ ] Quota properly enforced (blocks on 4th generation)
- [ ] Error message shows "Free trial complete"
- [ ] Upgrade CTA directs to Starter tier
- [ ] Pricing page shows free trial banner
- [ ] Free users see same restrictions as Starter
- [ ] Database correctly stores 'free' tier
- [ ] Analytics track free trial conversions

---

## Summary

The **Free tier is a strategic trial mechanism**, not a permanent free plan:

- 🎯 **Purpose:** Convert trial users to Starter tier
- 🔢 **Quota:** 3 total AI generations (combined GPT + Claude)
- 🚫 **Not Advertised:** Hidden from pricing page tiers
- ✨ **Messaging:** Positioned as "free trial" benefit
- 📈 **Goal:** Maximize trial-to-paid conversion

**Key Takeaway:** Free tier exists to let users experience value before purchasing, optimizing for Starter tier conversions.
