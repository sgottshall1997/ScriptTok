import { PromoObjective, Channel } from './schemas';

export interface PromoTemplate {
  hooks: string[];
  structure: string[];
  ctas: string[];
  complianceNote?: string;
  constraints: {
    maxWords?: number;
    maxCharacters?: number;
    format?: string;
  };
}

// Template registry mapping objective × channel → template
export const TEMPLATE_REGISTRY: Record<PromoObjective, Record<Channel, PromoTemplate>> = {
  feature_highlight: {
    tiktok_reel: {
      hooks: [
        "New CookAIng feature changes everything",
        "This CookAIng update saves hours",
        "CookAIng adds this meal-planning feature"
      ],
      structure: [
        "Hook: Feature announcement",
        "Demo: Show feature in action (3-5 beats)",
        "Benefit: What this means for users",
        "CTA: Try it now"
      ],
      ctas: ["Try CookAIng free", "Get CookAIng now", "Start cooking smarter"],
      constraints: { maxWords: 40, format: "20-40s video script" }
    },
    instagram_reel: {
      hooks: [
        "CookAIng's newest feature is here",
        "This feature makes cooking effortless",
        "See what CookAIng added this week"
      ],
      structure: [
        "Hook: Feature reveal",
        "Visual demo: Feature walkthrough",
        "User benefit: Time/effort saved",
        "CTA with text overlay"
      ],
      ctas: ["Link in bio", "Try free today", "Download CookAIng"],
      constraints: { maxWords: 40, format: "Visual-heavy reel script" }
    },
    x_thread: {
      hooks: [
        "CookAIng launched a feature that changes meal prep",
        "New CookAIng feature thread:",
        "This CookAIng update solves a major cooking problem"
      ],
      structure: [
        "Tweet 1: Hook + feature announcement",
        "Tweet 2-3: Feature breakdown",
        "Tweet 4-5: User benefits",
        "Tweet 6: CTA with link"
      ],
      ctas: ["Try CookAIng free", "Get early access", "Start meal planning"],
      constraints: { maxWords: 280, format: "6-10 tweet thread" }
    },
    linkedin_post: {
      hooks: [
        "CookAIng's latest feature addresses a common kitchen challenge",
        "Meal planning becomes easier with this CookAIng update",
        "Here's how CookAIng's new feature saves time"
      ],
      structure: [
        "Professional hook",
        "Feature context and problem",
        "Solution demonstration",
        "Business value proposition",
        "Question CTA"
      ],
      ctas: ["What's your biggest cooking challenge?", "Try CookAIng", "Thoughts?"],
      constraints: { maxWords: 200, format: "Professional tone" }
    },
    email: {
      hooks: [
        "New CookAIng Feature Inside",
        "Your Kitchen Got Smarter",
        "Feature Update: Cook Easier"
      ],
      structure: [
        "Subject line (5-7 words)",
        "Preview text (35-50 chars)",
        "Header: Feature announcement",
        "Body: Feature walkthrough",
        "CTA button"
      ],
      ctas: ["Try New Feature", "Update CookAIng", "Explore Feature"],
      constraints: { maxWords: 150, format: "HTML email" }
    },
    blog: {
      hooks: [
        "Introducing CookAIng's Latest Feature",
        "How This New Feature Changes Meal Prep",
        "CookAIng Feature Update: What You Need to Know"
      ],
      structure: [
        "H1: Feature announcement",
        "Intro: Problem context",
        "H2: Feature breakdown",
        "H3: User benefits",
        "Conclusion with CTA"
      ],
      ctas: ["Try CookAIng Free", "Upgrade Now", "Learn More"],
      constraints: { maxWords: 800, format: "SEO optimized" }
    },
    ads_google: {
      hooks: [
        "New CookAIng Feature",
        "Smarter Cooking App",
        "Meal Planning Made Easy"
      ],
      structure: [
        "Headlines (10 variations)",
        "Descriptions (4 variations)",
        "Long descriptions (3 variations)"
      ],
      ctas: ["Try Free", "Download App", "Start Cooking"],
      constraints: { maxWords: 30, format: "Ad copy variations" }
    },
    ads_meta: {
      hooks: [
        "New CookAIng feature makes cooking easier",
        "This cooking app feature saves time",
        "See CookAIng's latest update"
      ],
      structure: [
        "Primary text",
        "Headline",
        "Description", 
        "CTA button text"
      ],
      ctas: ["Try Now", "Download", "Learn More"],
      constraints: { maxWords: 125, format: "Visual ad copy" }
    },
    ads_tiktok: {
      hooks: [
        "This CookAIng feature transforms cooking",
        "New cooking app feature trending",
        "CookAIng released this feature"
      ],
      structure: [
        "Native video hook",
        "Quick feature demo",
        "User reaction/benefit",
        "Soft CTA"
      ],
      ctas: ["Try CookAIng", "Download Now", "Get App"],
      constraints: { maxWords: 40, format: "Native video ad" }
    }
  },
  
  how_to_demo: {
    tiktok_reel: {
      hooks: [
        "How to meal prep in 5 minutes with CookAIng",
        "CookAIng makes this cooking trick effortless",
        "Watch how CookAIng transforms meal planning"
      ],
      structure: [
        "Hook: Quick how-to promise",
        "Step 1-2: Setup in CookAIng",
        "Step 3-4: Execute the process",
        "Result: Final outcome + CTA"
      ],
      ctas: ["Try this method", "Get CookAIng", "Start cooking"],
      constraints: { maxWords: 40, format: "Tutorial script" }
    },
    instagram_reel: {
      hooks: [
        "How to use CookAIng for perfect meal prep",
        "CookAIng tutorial: Smart cooking",
        "Step by step CookAIng demo"
      ],
      structure: [
        "Hook: Tutorial preview",
        "Steps: Visual walkthrough",
        "Tips: Pro cooking advice",
        "CTA: Try yourself"
      ],
      ctas: ["Link in bio", "Try CookAIng", "Start meal prep"],
      constraints: { maxWords: 40, format: "Visual tutorial" }
    },
    x_thread: {
      hooks: [
        "How to master meal planning with CookAIng (thread)",
        "CookAIng tutorial thread:",
        "Step-by-step CookAIng guide:"
      ],
      structure: [
        "Tweet 1: Hook + overview",
        "Tweets 2-5: Step breakdown",
        "Tweet 6: Pro tips",
        "Tweet 7: CTA"
      ],
      ctas: ["Try these steps", "Get CookAIng", "Share results"],
      constraints: { maxWords: 280, format: "Tutorial thread" }
    },
    linkedin_post: {
      hooks: [
        "How CookAIng streamlines professional meal planning",
        "Efficient cooking for busy professionals",
        "CookAIng workflow for time management"
      ],
      structure: [
        "Professional context",
        "Challenge identification",
        "CookAIng solution steps",
        "Efficiency benefits",
        "Engagement question"
      ],
      ctas: ["How do you manage meal prep?", "Try CookAIng", "Share tips"],
      constraints: { maxWords: 200, format: "Professional advice" }
    },
    email: {
      hooks: [
        "Master CookAIng in 5 Steps",
        "Your CookAIng Tutorial",
        "How-To: Smart Cooking"
      ],
      structure: [
        "Subject: Tutorial offer",
        "Intro: Learning promise",
        "Steps: Numbered guide",
        "Summary: Key benefits",
        "CTA: Try now"
      ],
      ctas: ["Start Tutorial", "Try CookAIng", "Begin Cooking"],
      constraints: { maxWords: 200, format: "Educational email" }
    },
    blog: {
      hooks: [
        "Complete CookAIng Guide: From Setup to Mastery",
        "How to Transform Your Cooking with CookAIng",
        "Step-by-Step CookAIng Tutorial"
      ],
      structure: [
        "H1: Complete guide promise",
        "Intro: What you'll learn",
        "H2-H4: Detailed steps",
        "Tips section",
        "Conclusion + next steps"
      ],
      ctas: ["Start Your Journey", "Try CookAIng Free", "Download Guide"],
      constraints: { maxWords: 1200, format: "Comprehensive tutorial" }
    },
    ads_google: {
      hooks: [
        "Learn CookAIng Fast",
        "Cooking Tutorial App",
        "Master Meal Planning"
      ],
      structure: [
        "Headlines: Tutorial promise",
        "Descriptions: Quick learning",
        "Extensions: Step count"
      ],
      ctas: ["Start Learning", "Try Free", "Watch Demo"],
      constraints: { maxWords: 30, format: "Tutorial-focused ads" }
    },
    ads_meta: {
      hooks: [
        "Learn to cook smarter with CookAIng",
        "Master meal planning in minutes",
        "CookAIng tutorial for beginners"
      ],
      structure: [
        "Educational hook",
        "Learning promise",
        "Quick benefit",
        "Learn CTA"
      ],
      ctas: ["Watch Tutorial", "Try Free", "Learn Now"],
      constraints: { maxWords: 125, format: "Educational ad" }
    },
    ads_tiktok: {
      hooks: [
        "Learn this CookAIng trick",
        "CookAIng tutorial going viral",
        "How to cook like a pro"
      ],
      structure: [
        "Tutorial hook",
        "Quick demo",
        "Amazing result",
        "Learn more CTA"
      ],
      ctas: ["Try This", "Get App", "Learn More"],
      constraints: { maxWords: 40, format: "Tutorial video ad" }
    }
  },
  
  // Adding core objectives - abbreviated for space, following same pattern
  user_scenario: {
    tiktok_reel: {
      hooks: ["Real CookAIng user story", "This changed my cooking", "Before vs after CookAIng"],
      structure: ["Hook: User context", "Problem: Cooking struggle", "Solution: CookAIng impact", "Result: Success story"],
      ctas: ["Try CookAIng yourself", "Get the app", "Start cooking better"],
      constraints: { maxWords: 40, format: "Story-driven script" }
    },
    instagram_reel: {
      hooks: ["CookAIng user transformation", "My cooking journey", "How CookAIng changed everything"],
      structure: ["Story hook", "Before situation", "CookAIng solution", "After results"],
      ctas: ["Link in bio", "Try CookAIng", "Transform your cooking"],
      constraints: { maxWords: 40, format: "Personal story reel" }
    },
    x_thread: {
      hooks: ["My CookAIng story (thread)", "How CookAIng transformed my kitchen", "Real user experience:"],
      structure: ["Tweet 1: Setup", "Tweet 2-4: Journey", "Tweet 5-6: Results", "Tweet 7: Recommendation"],
      ctas: ["Try CookAIng", "Share your story", "Get the app"],
      constraints: { maxWords: 280, format: "Personal story thread" }
    },
    linkedin_post: {
      hooks: ["How CookAIng solved my meal planning challenge", "Professional cooking efficiency story", "Workplace productivity through better meal prep"],
      structure: ["Professional context", "Challenge faced", "CookAIng solution", "Measurable results", "Recommendation"],
      ctas: ["What's your experience?", "Try CookAIng", "Share insights"],
      constraints: { maxWords: 200, format: "Professional story" }
    },
    email: {
      hooks: ["Real CookAIng Success Story", "User Transformation", "Cooking Made Simple"],
      structure: ["Subject: Success story", "Personal intro", "Challenge description", "CookAIng solution", "Results + CTA"],
      ctas: ["Start Your Journey", "Try CookAIng", "Get Started"],
      constraints: { maxWords: 200, format: "Story-driven email" }
    },
    blog: {
      hooks: ["How CookAIng Transformed My Kitchen Routine", "Real User Story: From Chaos to Organized Cooking", "My 30-Day CookAIng Journey"],
      structure: ["H1: Story title", "Intro: Challenge setup", "H2: Discovery", "H3: Implementation", "H4: Results", "Conclusion: Recommendation"],
      ctas: ["Start Your Transformation", "Try CookAIng Free", "Share Your Story"],
      constraints: { maxWords: 1000, format: "Personal narrative" }
    },
    ads_google: {
      hooks: ["Real CookAIng Results", "User Success Stories", "Proven Cooking Solution"],
      structure: ["Headlines: Success focus", "Descriptions: User benefit", "Social proof elements"],
      ctas: ["Join Users", "Try Free", "Get Results"],
      constraints: { maxWords: 30, format: "Success-focused ads" }
    },
    ads_meta: {
      hooks: ["Real CookAIng users see amazing results", "Join thousands using CookAIng", "See how CookAIng transforms cooking"],
      structure: ["Social proof hook", "User benefit", "Success metric", "Join CTA"],
      ctas: ["Join Now", "Try Free", "Get App"],
      constraints: { maxWords: 125, format: "Social proof ad" }
    },
    ads_tiktok: {
      hooks: ["CookAIng users are loving this", "Real results with CookAIng", "User story: CookAIng success"],
      structure: ["User testimonial", "Result showcase", "Community feeling", "Join CTA"],
      ctas: ["Try CookAIng", "Join Community", "Get App"],
      constraints: { maxWords: 40, format: "User story ad" }
    }
  },

  // Continue pattern for other objectives - abbreviated for practical implementation
  before_after: {
    tiktok_reel: {
      hooks: ["Before CookAIng vs After", "My cooking transformation", "CookAIng changed everything"],
      structure: ["Before: Chaos/struggle", "Discovery: Finding CookAIng", "After: Success/ease", "CTA: Try transformation"],
      ctas: ["Get your transformation", "Try CookAIng", "Start now"],
      constraints: { maxWords: 40, format: "Transformation story" }
    },
    // Add other channels following same pattern...
    instagram_reel: {
      hooks: ["Before CookAIng vs After", "My cooking transformation", "CookAIng changed everything"],
      structure: ["Before: Chaos/struggle", "Discovery: Finding CookAIng", "After: Success/ease", "CTA: Try transformation"],
      ctas: ["Get your transformation", "Try CookAIng", "Start now"],
      constraints: { maxWords: 40, format: "Transformation story" }
    },
    x_thread: {
      hooks: ["Before CookAIng vs After", "My cooking transformation", "CookAIng changed everything"],
      structure: ["Before: Chaos/struggle", "Discovery: Finding CookAIng", "After: Success/ease", "CTA: Try transformation"],
      ctas: ["Get your transformation", "Try CookAIng", "Start now"],
      constraints: { maxWords: 280, format: "Transformation story" }
    },
    linkedin_post: {
      hooks: ["Before CookAIng vs After", "My cooking transformation", "CookAIng changed everything"],
      structure: ["Before: Chaos/struggle", "Discovery: Finding CookAIng", "After: Success/ease", "CTA: Try transformation"],
      ctas: ["Get your transformation", "Try CookAIng", "Start now"],
      constraints: { maxWords: 200, format: "Transformation story" }
    },
    email: {
      hooks: ["Before CookAIng vs After", "My cooking transformation", "CookAIng changed everything"],
      structure: ["Before: Chaos/struggle", "Discovery: Finding CookAIng", "After: Success/ease", "CTA: Try transformation"],
      ctas: ["Get your transformation", "Try CookAIng", "Start now"],
      constraints: { maxWords: 200, format: "Transformation story" }
    },
    blog: {
      hooks: ["Before CookAIng vs After", "My cooking transformation", "CookAIng changed everything"],
      structure: ["Before: Chaos/struggle", "Discovery: Finding CookAIng", "After: Success/ease", "CTA: Try transformation"],
      ctas: ["Get your transformation", "Try CookAIng", "Start now"],
      constraints: { maxWords: 1000, format: "Transformation story" }
    },
    ads_google: {
      hooks: ["Before CookAIng vs After", "My cooking transformation", "CookAIng changed everything"],
      structure: ["Before: Chaos/struggle", "Discovery: Finding CookAIng", "After: Success/ease", "CTA: Try transformation"],
      ctas: ["Get your transformation", "Try CookAIng", "Start now"],
      constraints: { maxWords: 30, format: "Transformation story" }
    },
    ads_meta: {
      hooks: ["Before CookAIng vs After", "My cooking transformation", "CookAIng changed everything"],
      structure: ["Before: Chaos/struggle", "Discovery: Finding CookAIng", "After: Success/ease", "CTA: Try transformation"],
      ctas: ["Get your transformation", "Try CookAIng", "Start now"],
      constraints: { maxWords: 125, format: "Transformation story" }
    },
    ads_tiktok: {
      hooks: ["Before CookAIng vs After", "My cooking transformation", "CookAIng changed everything"],
      structure: ["Before: Chaos/struggle", "Discovery: Finding CookAIng", "After: Success/ease", "CTA: Try transformation"],
      ctas: ["Get your transformation", "Try CookAIng", "Start now"],
      constraints: { maxWords: 40, format: "Transformation story" }
    }
  },

  // For brevity, I'll create a helper function that generates similar templates for remaining objectives
  launch_announcement: {
    tiktok_reel: {
      hooks: ["CookAIng is officially here", "Launch day for CookAIng", "The cooking app launch everyone's waiting for"],
      structure: ["Launch announcement", "Key features highlight", "Early adopter benefits", "Download CTA"],
      ctas: ["Download now", "Be first to try", "Get CookAIng"],
      constraints: { maxWords: 40, format: "Launch excitement" }
    },
    instagram_reel: {
      hooks: ["CookAIng is officially here", "Launch day for CookAIng", "The cooking app launch everyone's waiting for"],
      structure: ["Launch announcement", "Key features highlight", "Early adopter benefits", "Download CTA"],
      ctas: ["Download now", "Be first to try", "Get CookAIng"],
      constraints: { maxWords: 40, format: "Launch excitement" }
    },
    x_thread: {
      hooks: ["CookAIng is officially here", "Launch day for CookAIng", "The cooking app launch everyone's waiting for"],
      structure: ["Launch announcement", "Key features highlight", "Early adopter benefits", "Download CTA"],
      ctas: ["Download now", "Be first to try", "Get CookAIng"],
      constraints: { maxWords: 280, format: "Launch excitement" }
    },
    linkedin_post: {
      hooks: ["CookAIng is officially here", "Launch day for CookAIng", "The cooking app launch everyone's waiting for"],
      structure: ["Launch announcement", "Key features highlight", "Early adopter benefits", "Download CTA"],
      ctas: ["Download now", "Be first to try", "Get CookAIng"],
      constraints: { maxWords: 200, format: "Launch excitement" }
    },
    email: {
      hooks: ["CookAIng is officially here", "Launch day for CookAIng", "The cooking app launch everyone's waiting for"],
      structure: ["Launch announcement", "Key features highlight", "Early adopter benefits", "Download CTA"],
      ctas: ["Download now", "Be first to try", "Get CookAIng"],
      constraints: { maxWords: 200, format: "Launch excitement" }
    },
    blog: {
      hooks: ["CookAIng is officially here", "Launch day for CookAIng", "The cooking app launch everyone's waiting for"],
      structure: ["Launch announcement", "Key features highlight", "Early adopter benefits", "Download CTA"],
      ctas: ["Download now", "Be first to try", "Get CookAIng"],
      constraints: { maxWords: 1000, format: "Launch excitement" }
    },
    ads_google: {
      hooks: ["CookAIng is officially here", "Launch day for CookAIng", "The cooking app launch everyone's waiting for"],
      structure: ["Launch announcement", "Key features highlight", "Early adopter benefits", "Download CTA"],
      ctas: ["Download now", "Be first to try", "Get CookAIng"],
      constraints: { maxWords: 30, format: "Launch excitement" }
    },
    ads_meta: {
      hooks: ["CookAIng is officially here", "Launch day for CookAIng", "The cooking app launch everyone's waiting for"],
      structure: ["Launch announcement", "Key features highlight", "Early adopter benefits", "Download CTA"],
      ctas: ["Download now", "Be first to try", "Get CookAIng"],
      constraints: { maxWords: 125, format: "Launch excitement" }
    },
    ads_tiktok: {
      hooks: ["CookAIng is officially here", "Launch day for CookAIng", "The cooking app launch everyone's waiting for"],
      structure: ["Launch announcement", "Key features highlight", "Early adopter benefits", "Download CTA"],
      ctas: ["Download now", "Be first to try", "Get CookAIng"],
      constraints: { maxWords: 40, format: "Launch excitement" }
    }
  },

  // Quick template generation for remaining objectives to keep file manageable
  new_feature_alert: createTemplateSet("New feature alert", "Feature update available", ["Check it out", "Update now", "Try feature"]),
  newsletter: createTemplateSet("Newsletter content", "Weekly updates", ["Read more", "Subscribe", "Get updates"]),
  winback: createTemplateSet("Come back to CookAIng", "We miss you", ["Try again", "Come back", "Reactivate"]),
  seo_article: createTemplateSet("Comprehensive guide", "Complete resource", ["Learn more", "Read guide", "Get info"]),
  deep_dive: createTemplateSet("Deep analysis", "Detailed breakdown", ["Explore more", "Read full", "Learn details"]),
  comparison: createTemplateSet("CookAIng vs others", "Feature comparison", ["Choose CookAIng", "Compare now", "See difference"]),
  testimonial_script: createTemplateSet("User testimonial", "Success story", ["Try CookAIng", "Join users", "Get started"]),
  explainer_script: createTemplateSet("How CookAIng works", "Simple explanation", ["Try now", "Learn more", "Get started"]),
  ad_copy: createTemplateSet("CookAIng advertisement", "Promotional content", ["Try free", "Download", "Get app"]),
  challenge: createTemplateSet("Cooking challenge", "Join the challenge", ["Take challenge", "Join now", "Start challenge"]),
  quiz_poll: createTemplateSet("Cooking quiz", "Test your knowledge", ["Take quiz", "Vote now", "Share results"]),
  ugc_prompt: createTemplateSet("Share your CookAIng", "User content prompt", ["Share yours", "Post content", "Tag us"])
};

// Helper function to create consistent template sets for remaining objectives
function createTemplateSet(hookBase: string, structureBase: string, ctaOptions: string[]): Record<Channel, PromoTemplate> {
  return {
    tiktok_reel: {
      hooks: [`${hookBase}`, `${hookBase} trending`, `${hookBase} viral`],
      structure: [structureBase, "Quick demo", "User benefit", "CTA"],
      ctas: ctaOptions,
      constraints: { maxWords: 40, format: "Short video" }
    },
    instagram_reel: {
      hooks: [`${hookBase}`, `${hookBase} trending`, `${hookBase} viral`],
      structure: [structureBase, "Quick demo", "User benefit", "CTA"],
      ctas: ctaOptions,
      constraints: { maxWords: 40, format: "Short video" }
    },
    x_thread: {
      hooks: [`${hookBase}`, `${hookBase} thread`, `${hookBase} breakdown`],
      structure: [structureBase, "Point 1-2", "Point 3-4", "CTA"],
      ctas: ctaOptions,
      constraints: { maxWords: 280, format: "Thread" }
    },
    linkedin_post: {
      hooks: [`${hookBase}`, `Professional ${hookBase.toLowerCase()}`, `${hookBase} for professionals`],
      structure: [structureBase, "Professional context", "Business value", "CTA"],
      ctas: ctaOptions,
      constraints: { maxWords: 200, format: "Professional" }
    },
    email: {
      hooks: [`${hookBase}`, `Your ${hookBase.toLowerCase()}`, `${hookBase} update`],
      structure: [structureBase, "Email body", "Value prop", "CTA"],
      ctas: ctaOptions,
      constraints: { maxWords: 200, format: "Email" }
    },
    blog: {
      hooks: [`Complete ${hookBase.toLowerCase()} guide`, `Ultimate ${hookBase.toLowerCase()}`, `${hookBase}: Everything you need`],
      structure: [structureBase, "Detailed content", "Examples", "CTA"],
      ctas: ctaOptions,
      constraints: { maxWords: 1000, format: "Blog post" }
    },
    ads_google: {
      hooks: [`${hookBase}`, `${hookBase} app`, `${hookBase} solution`],
      structure: [structureBase, "Quick benefit", "CTA"],
      ctas: ctaOptions,
      constraints: { maxWords: 30, format: "Google ads" }
    },
    ads_meta: {
      hooks: [`${hookBase}`, `${hookBase} for you`, `${hookBase} available`],
      structure: [structureBase, "User benefit", "CTA"],
      ctas: ctaOptions,
      constraints: { maxWords: 125, format: "Meta ads" }
    },
    ads_tiktok: {
      hooks: [`${hookBase}`, `${hookBase} trending`, `${hookBase} viral`],
      structure: [structureBase, "Quick demo", "CTA"],
      ctas: ctaOptions,
      constraints: { maxWords: 40, format: "TikTok ads" }
    }
  };
}

export function getTemplate(objective: PromoObjective, channel: Channel): PromoTemplate {
  return TEMPLATE_REGISTRY[objective]?.[channel] || {
    hooks: ["CookAIng helps with cooking"],
    structure: ["Hook", "Body", "CTA"],
    ctas: ["Try CookAIng"],
    constraints: { maxWords: 100, format: "Default" }
  };
}