import { z } from 'zod';

export type PromoObjective =
  | "feature_highlight"
  | "how_to_demo" 
  | "user_scenario"
  | "before_after"
  | "launch_announcement"
  | "new_feature_alert"
  | "newsletter"
  | "winback"
  | "seo_article"
  | "deep_dive"
  | "comparison"
  | "testimonial_script"
  | "explainer_script"
  | "ad_copy"
  | "challenge"
  | "quiz_poll"
  | "ugc_prompt";

export type Channel =
  | "tiktok_reel"
  | "instagram_reel"
  | "x_thread"
  | "linkedin_post"
  | "email"
  | "blog"
  | "ads_google"
  | "ads_meta"
  | "ads_tiktok";

export interface PromoInput {
  appName: "CookAIng";
  audiencePersona: string;
  offer?: string;
  keyBenefits: string[];
  features: string[];
  proofPoints?: string[];
  seedTopic?: string;
  tone?: "friendly" | "expert" | "punchy" | "playful" | "urgent";
  channels: Channel[];
  objective: PromoObjective;
  ctaUrl: string;
  campaign: string;
  source?: string;
  medium?: string;
  brandGuidelines?: string;
  wordCountHint?: number;
}

export interface PromoOutput {
  id: string;
  timestamp: string;
  appName: "CookAIng";
  objective: PromoObjective;
  channel: Channel;
  title?: string;
  hook?: string;
  body: string;
  captions?: string[];
  hashtags?: string[];
  cta: { text: string; url: string; utmUrl: string };
  variants?: { label: string; body: string }[];
  metadata: {
    persona: string;
    tone: string;
    seedTopic?: string;
    featuresUsed: string[];
    benefitsUsed: string[];
    proofPointsUsed?: string[];
    wordCount?: number;
  };
}

// Zod schemas for validation
export const PromoInputSchema = z.object({
  appName: z.literal("CookAIng"),
  audiencePersona: z.string().min(1, "Audience persona is required"),
  offer: z.string().optional(),
  keyBenefits: z.array(z.string()).min(1, "At least one key benefit is required"),
  features: z.array(z.string()).min(1, "At least one feature is required"),
  proofPoints: z.array(z.string()).optional(),
  seedTopic: z.string().optional(),
  tone: z.enum(["friendly", "expert", "punchy", "playful", "urgent"]).optional(),
  channels: z.array(z.enum([
    "tiktok_reel", "instagram_reel", "x_thread", "linkedin_post", 
    "email", "blog", "ads_google", "ads_meta", "ads_tiktok"
  ])).min(1, "At least one channel is required"),
  objective: z.enum([
    "feature_highlight", "how_to_demo", "user_scenario", "before_after",
    "launch_announcement", "new_feature_alert", "newsletter", "winback",
    "seo_article", "deep_dive", "comparison", "testimonial_script",
    "explainer_script", "ad_copy", "challenge", "quiz_poll", "ugc_prompt"
  ]),
  ctaUrl: z.string().url("Valid CTA URL is required"),
  campaign: z.string().min(1, "Campaign name is required"),
  source: z.string().optional(),
  medium: z.string().optional(),
  brandGuidelines: z.string().optional(),
  wordCountHint: z.number().positive().optional(),
});

export const PromoOutputSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  appName: z.literal("CookAIng"),
  objective: z.enum([
    "feature_highlight", "how_to_demo", "user_scenario", "before_after",
    "launch_announcement", "new_feature_alert", "newsletter", "winback",
    "seo_article", "deep_dive", "comparison", "testimonial_script",
    "explainer_script", "ad_copy", "challenge", "quiz_poll", "ugc_prompt"
  ]),
  channel: z.enum([
    "tiktok_reel", "instagram_reel", "x_thread", "linkedin_post",
    "email", "blog", "ads_google", "ads_meta", "ads_tiktok"
  ]),
  title: z.string().optional(),
  hook: z.string().optional(),
  body: z.string(),
  captions: z.array(z.string()).optional(),
  hashtags: z.array(z.string()).optional(),
  cta: z.object({
    text: z.string(),
    url: z.string().url(),
    utmUrl: z.string().url()
  }),
  variants: z.array(z.object({
    label: z.string(),
    body: z.string()
  })).optional(),
  metadata: z.object({
    persona: z.string(),
    tone: z.string(),
    seedTopic: z.string().optional(),
    featuresUsed: z.array(z.string()),
    benefitsUsed: z.array(z.string()),
    proofPointsUsed: z.array(z.string()).optional(),
    wordCount: z.number().optional()
  })
});

// Bulk generation schemas
export const BulkPromoInputSchema = z.object({
  inputs: z.array(PromoInputSchema),
  scheduleType: z.enum(["now", "scheduled"]).default("now"),
  cronExpression: z.string().optional(),
  scheduledAt: z.string().optional()
});

export type BulkPromoInput = z.infer<typeof BulkPromoInputSchema>;
export type PromoInputType = z.infer<typeof PromoInputSchema>;
export type PromoOutputType = z.infer<typeof PromoOutputSchema>;