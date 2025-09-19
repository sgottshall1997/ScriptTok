import { db } from "../../../db";
import { contentBlueprints } from "../../../../shared/schema";
import { eq } from "drizzle-orm";

// Seed content blueprints with recipe-specific templates
export async function seedContentBlueprints() {
  console.log("🌱 Starting content blueprint seeding...");
  
  const blueprints = [
    // Video Script — TikTok/Reels/Shorts
    {
      name: "Video Script — TikTok/Reels",
      kind: "video_script_short",
      description: "Viral-optimized scripts for TikTok, Reels, and YouTube Shorts with beat-timed structure",
      inputSchemaJson: {
        fields: ["hookStyle", "timeCapSecs", "cameraStyle", "voiceover", "brollIdeas", "ctaStyle"]
      },
      outputSchemaJson: {
        hook: "string",
        beats: [
          {
            timecode: "string", // e.g., "0-3s"
            scene: "string",
            dialogue: "string", 
            action: "string",
            broll: "string",
            onScreenText: "string"
          }
        ],
        callToAction: {
          primary: "string",
          alt: ["string"]
        },
        captions: ["string"],
        hashtags: ["string"],
        thumbnailPrompts: ["string"]
      },
      defaultsJson: {
        hookStyle: "POV",
        timeCapSecs: 30,
        cameraStyle: "phone handheld",
        voiceover: true,
        ctaStyle: "AppOpen"
      }
    },
    
    // Video Script — YouTube Long
    {
      name: "Video Script — YouTube Long",
      kind: "video_script_long",
      description: "Comprehensive long-form video scripts for detailed recipe tutorials",
      inputSchemaJson: {
        fields: ["outlineDepth", "chapters", "gear", "pace"]
      },
      outputSchemaJson: {
        title: "string",
        description: "string",
        chapters: [
          {
            title: "string",
            keyPoints: ["string"]
          }
        ],
        broll: ["string"],
        callToAction: "string",
        timestamps: ["string"]
      },
      defaultsJson: {
        outlineDepth: "detailed",
        chapters: 5,
        gear: "basic",
        pace: "moderate"
      }
    },
    
    // Instagram Carousel — Step-by-Step  
    {
      name: "Instagram Carousel — Step-by-Step",
      kind: "carousel_step",
      description: "Multi-slide recipe tutorials perfect for Instagram carousel posts",
      inputSchemaJson: {
        fields: ["slideCount", "imageStyle", "textOverlay"]
      },
      outputSchemaJson: {
        slides: [
          {
            headline: "string",
            body: "string", 
            imagePrompt: "string"
          }
        ],
        caption: "string",
        hashtags: ["string"]
      },
      defaultsJson: {
        slideCount: 6,
        imageStyle: "clean food photography",
        textOverlay: true
      }
    },
    
    // Blog Recipe — SEO + Schema
    {
      name: "Blog Recipe — SEO + Schema",
      kind: "blog_recipe",
      description: "SEO-optimized recipe blog posts with structured data markup",
      inputSchemaJson: {
        fields: ["seoFocus", "wordCount", "includeNutrition", "recipeCard"]
      },
      outputSchemaJson: {
        title: "string",
        h2s: ["string"],
        meta: {
          title: "string",
          description: "string",
          keywords: ["string"]
        },
        faq: [
          {
            q: "string",
            a: "string"
          }
        ],
        schemaOrgJsonLd: "object"
      },
      defaultsJson: {
        seoFocus: "recipe name + benefits",
        wordCount: 800,
        includeNutrition: true,
        recipeCard: true
      }
    },
    
    // Email Campaign — Pantry to Plate
    {
      name: "Email Campaign — Pantry to Plate", 
      kind: "email_campaign",
      description: "Engaging recipe emails that connect pantry ingredients to delicious meals",
      inputSchemaJson: {
        fields: ["emailType", "personalization", "ctaFocus"]
      },
      outputSchemaJson: {
        subject: "string",
        preheader: "string",
        blocks: [
          {
            type: "string",
            content: "string"
          }
        ],
        affiliateProducts: [
          {
            name: "string",
            url: "string"
          }
        ]
      },
      defaultsJson: {
        emailType: "recipe feature",
        personalization: "medium", 
        ctaFocus: "try recipe"
      }
    },
    
    // Push Notification — Pantry Hack
    {
      name: "Push Notification — Pantry Hack",
      kind: "push_notification",
      description: "Quick cooking tips and recipe alerts for mobile app engagement",
      inputSchemaJson: {
        fields: ["urgency", "emoji", "timing"]
      },
      outputSchemaJson: {
        title: "string",
        body: "string", 
        deepLink: "string"
      },
      defaultsJson: {
        urgency: "medium",
        emoji: true,
        timing: "meal prep"
      }
    },
    
    // Shopping List + Substitutions
    {
      name: "Shopping List + Substitutions",
      kind: "shopping_list",
      description: "Smart shopping lists with ingredient substitution suggestions",
      inputSchemaJson: {
        fields: ["dietaryRestrictions", "budgetTier", "seasonality"]
      },
      outputSchemaJson: {
        list: [
          {
            item: "string",
            qty: "string", 
            notes: "string"
          }
        ],
        substitutions: [
          {
            ingredient: "string",
            swap: "string",
            reason: "string"
          }
        ]
      },
      defaultsJson: {
        dietaryRestrictions: [],
        budgetTier: "mid",
        seasonality: "current"
      }
    },
    
    // Affiliate Insert Pack
    {
      name: "Affiliate Insert Pack",
      kind: "affiliate_insert",
      description: "Seamlessly integrated product recommendations within recipe content",
      inputSchemaJson: {
        fields: ["insertType", "productFocus", "subtlety"]
      },
      outputSchemaJson: {
        blurbs: [
          {
            product: "string",
            oneLiner: "string",
            angle: "string"
          }
        ],
        placements: ["string"]
      },
      defaultsJson: {
        insertType: "natural",
        productFocus: "cooking tools",
        subtlety: "high"
      }
    }
  ];
  
  let seededCount = 0;
  
  for (const blueprint of blueprints) {
    try {
      // Check if blueprint already exists
      const existing = await db.select()
        .from(contentBlueprints)
        .where(eq(contentBlueprints.kind, blueprint.kind))
        .limit(1);
        
      if (existing.length === 0) {
        await db.insert(contentBlueprints).values(blueprint);
        console.log(`✅ Seeded blueprint: ${blueprint.name}`);
        seededCount++;
      } else {
        console.log(`⏭️ Blueprint already exists: ${blueprint.name}`);
      }
    } catch (error) {
      console.error(`❌ Failed to seed blueprint ${blueprint.name}:`, error);
    }
  }
  
  console.log(`🌱 Blueprint seeding complete: ${seededCount} new blueprints added`);
  return seededCount;
}