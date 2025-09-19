import { Request, Response, Router } from "express";
import { z } from "zod";
import { db } from "../../../db";
import { contentBlueprints, contentJobs, campaignArtifacts, campaigns } from "../../../../shared/schema";
import { eq, desc, and } from "drizzle-orm";
import { contentProvider } from "../../../cookaing-marketing/content/provider";
import { renderRecipeContent } from "../../../cookaing-marketing/content/render";
import { postprocessContent } from "../../../cookaing-marketing/content/postprocess";
import { seedContentBlueprints } from "./blueprints";

const router = Router();

// Content preview request schema
const previewSchema = z.object({
  sourceType: z.enum(["recipe", "freeform"]).default("recipe"),
  recipeId: z.number().optional(),
  freeformText: z.string().optional(),
  blueprintId: z.number(),
  options: z.object({
    persona: z.enum(["Chef", "Busy Parent", "College", "Vegan", "Athlete"]).default("Chef"),
    tone: z.enum(["Friendly", "Expert", "Playful"]).default("Friendly"),
    platform: z.enum(["TikTok", "Reel", "Shorts", "YouTubeLong", "Instagram", "Blog", "Email", "Push"]).default("TikTok"),
    duration: z.enum(["15s", "30s", "60s", "3m", "8m"]).default("30s"),
    cta: z.enum(["App install", "Pantry feature", "Affiliate pick"]).default("App install")
  })
});

// Content generation request schema  
const generateSchema = previewSchema.extend({
  persist: z.boolean().default(true),
  linkToCampaignId: z.number().optional()
});

// Mock recipe data for demo purposes
const getMockRecipe = (recipeId?: number) => {
  const recipes = [
    {
      id: 1,
      title: "10-Minute Vegan Buddha Bowl",
      yield: "2 servings",
      time: "10 minutes",
      ingredients: [
        { name: "quinoa", qty: "1 cup cooked" },
        { name: "chickpeas", qty: "1/2 cup" },
        { name: "avocado", qty: "1 medium" },
        { name: "cherry tomatoes", qty: "1 cup" },
        { name: "tahini", qty: "2 tbsp" }
      ],
      steps: [
        "Prepare quinoa according to package directions",
        "Drain and rinse chickpeas",
        "Slice avocado and halve cherry tomatoes",
        "Combine all ingredients in bowls",
        "Drizzle with tahini dressing"
      ],
      dietTags: ["vegan", "gluten-free"],
      pantry: { has: ["quinoa", "tahini", "chickpeas"] }
    },
    {
      id: 2,
      title: "Family Pasta Night Special",
      yield: "4 servings", 
      time: "30 minutes",
      ingredients: [
        { name: "pasta", qty: "1 lb" },
        { name: "ground turkey", qty: "1 lb" },
        { name: "marinara sauce", qty: "2 cups" },
        { name: "mozzarella cheese", qty: "1 cup shredded" }
      ],
      steps: [
        "Boil pasta according to package directions",
        "Brown ground turkey in large skillet",
        "Add marinara sauce and simmer",
        "Drain pasta and combine with sauce", 
        "Top with cheese and serve"
      ],
      dietTags: ["high-protein"],
      pantry: { has: ["pasta", "marinara sauce"] }
    },
    {
      id: 3,
      title: "Athlete Power Smoothie",
      yield: "1 serving",
      time: "5 minutes", 
      ingredients: [
        { name: "protein powder", qty: "1 scoop" },
        { name: "banana", qty: "1 large" },
        { name: "spinach", qty: "2 cups" },
        { name: "almond milk", qty: "1 cup" },
        { name: "chia seeds", qty: "1 tbsp" }
      ],
      steps: [
        "Add all ingredients to blender",
        "Blend on high for 60 seconds",
        "Pour into glass and enjoy immediately"
      ],
      dietTags: ["high-protein", "low-carb"],
      pantry: { has: ["protein powder", "chia seeds"] }
    }
  ];
  
  if (recipeId) {
    return recipes.find(r => r.id === recipeId) || recipes[0];
  }
  return recipes[0];
};

// POST /api/cookaing-marketing/content/preview
router.post("/preview", async (req: Request, res: Response) => {
  try {
    console.log("🔍 Content preview request:", req.body);
    
    const validatedData = previewSchema.parse(req.body);
    
    // Get blueprint details
    const blueprint = await db.select()
      .from(contentBlueprints)
      .where(eq(contentBlueprints.id, validatedData.blueprintId))
      .limit(1);
      
    if (!blueprint.length) {
      return res.status(404).json({ error: "Blueprint not found" });
    }
    
    // Prepare source data
    let sourceData: any = {};
    if (validatedData.sourceType === "recipe") {
      sourceData = getMockRecipe(validatedData.recipeId);
    } else {
      sourceData = { freeformText: validatedData.freeformText || "" };
    }
    
    // Generate content using provider
    const generatedContent = await contentProvider.generateContent({
      blueprint: blueprint[0],
      sourceData,
      options: validatedData.options
    });
    
    // Apply post-processing
    const processedContent = await postprocessContent(generatedContent, {
      blueprint: blueprint[0],
      sourceData,
      options: validatedData.options
    });
    
    res.json({
      success: true,
      blueprint: blueprint[0],
      sourceData,
      options: validatedData.options,
      outputs: processedContent,
      mockMode: !process.env.OPENAI_API_KEY
    });
    
  } catch (error) {
    console.error("Content preview error:", error);
    res.status(500).json({ 
      error: "Failed to generate content preview",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// POST /api/cookaing-marketing/content/generate
router.post("/generate", async (req: Request, res: Response) => {
  try {
    console.log("🚀 Content generation request:", req.body);
    
    const validatedData = generateSchema.parse(req.body);
    
    // Get blueprint details
    const blueprint = await db.select()
      .from(contentBlueprints)
      .where(eq(contentBlueprints.id, validatedData.blueprintId))
      .limit(1);
      
    if (!blueprint.length) {
      return res.status(404).json({ error: "Blueprint not found" });
    }
    
    // Prepare source data
    let sourceData: any = {};
    if (validatedData.sourceType === "recipe") {
      sourceData = getMockRecipe(validatedData.recipeId);
    } else {
      sourceData = { freeformText: validatedData.freeformText || "" };
    }
    
    // Generate content using provider
    const generatedContent = await contentProvider.generateContent({
      blueprint: blueprint[0],
      sourceData,
      options: validatedData.options
    });
    
    // Apply post-processing
    const processedContent = await postprocessContent(generatedContent, {
      blueprint: blueprint[0],
      sourceData,
      options: validatedData.options
    });
    
    let contentJob = null;
    
    // Persist if requested
    if (validatedData.persist) {
      const [job] = await db.insert(contentJobs).values({
        recipeId: validatedData.recipeId,
        sourceType: validatedData.sourceType,
        blueprintId: validatedData.blueprintId,
        status: "generated",
        inputsJson: {
          sourceData,
          options: validatedData.options
        },
        outputsJson: processedContent
      }).returning();
      
      contentJob = job;
      
      // Link to campaign if specified
      if (validatedData.linkToCampaignId) {
        await attachToCampaign(validatedData.linkToCampaignId, processedContent, blueprint[0]);
      }
    }
    
    res.json({
      success: true,
      blueprint: blueprint[0],
      sourceData,
      options: validatedData.options,
      outputs: processedContent,
      contentJob,
      mockMode: !process.env.OPENAI_API_KEY,
      message: validatedData.persist ? "Content generated and saved" : "Content generated (not saved)"
    });
    
  } catch (error) {
    console.error("Content generation error:", error);
    res.status(500).json({ 
      error: "Failed to generate content",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// GET /api/cookaing-marketing/content/blueprints  
router.get("/blueprints", async (req: Request, res: Response) => {
  try {
    const blueprints = await db.select()
      .from(contentBlueprints)
      .orderBy(contentBlueprints.name);
    
    res.json({
      success: true,
      blueprints: blueprints.map(bp => ({
        ...bp,
        inputSchema: bp.inputSchemaJson,
        outputSchema: bp.outputSchemaJson,
        defaults: bp.defaultsJson
      }))
    });
    
  } catch (error) {
    console.error("Get blueprints error:", error);
    res.status(500).json({ 
      error: "Failed to get blueprints",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// POST /api/cookaing-marketing/content/blueprints/seed
router.post("/blueprints/seed", async (req: Request, res: Response) => {
  try {
    console.log("🌱 Seeding content blueprints...");
    
    await seedContentBlueprints();
    
    res.json({
      success: true,
      message: "Content blueprints seeded successfully"
    });
    
  } catch (error) {
    console.error("Seed blueprints error:", error);
    res.status(500).json({ 
      error: "Failed to seed blueprints",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// GET /api/cookaing-marketing/content/jobs
router.get("/jobs", async (req: Request, res: Response) => {
  try {
    const { status, recipeId, limit = "20" } = req.query;
    
    let whereConditions = [];
    
    if (status) {
      whereConditions.push(eq(contentJobs.status, status as string));
    }
    
    if (recipeId) {
      whereConditions.push(eq(contentJobs.recipeId, parseInt(recipeId as string)));
    }
    
    let query = db.select({
      id: contentJobs.id,
      recipeId: contentJobs.recipeId,
      sourceType: contentJobs.sourceType,
      blueprintId: contentJobs.blueprintId,
      status: contentJobs.status,
      inputsJson: contentJobs.inputsJson,
      outputsJson: contentJobs.outputsJson,
      errorsJson: contentJobs.errorsJson,
      createdAt: contentJobs.createdAt,
      updatedAt: contentJobs.updatedAt,
      blueprintName: contentBlueprints.name,
      blueprintKind: contentBlueprints.kind
    })
    .from(contentJobs)
    .leftJoin(contentBlueprints, eq(contentJobs.blueprintId, contentBlueprints.id))
    .orderBy(desc(contentJobs.createdAt))
    .limit(parseInt(limit as string));
    
    if (whereConditions.length > 0) {
      query = query.where(and(...whereConditions));
    }
    
    const jobs = await query;
    
    res.json({
      success: true,
      jobs,
      count: jobs.length
    });
    
  } catch (error) {
    console.error("Get content jobs error:", error);
    res.status(500).json({ 
      error: "Failed to get content jobs",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Helper function to attach generated content to campaign
async function attachToCampaign(campaignId: number, content: any, blueprint: any) {
  try {
    // Verify campaign exists
    const campaign = await db.select()
      .from(campaigns) 
      .where(eq(campaigns.id, campaignId))
      .limit(1);
      
    if (!campaign.length) {
      throw new Error("Campaign not found");
    }
    
    // Map blueprint kinds to campaign artifact channels
    const channelMap: Record<string, string> = {
      "video_script_short": "video_script",
      "video_script_long": "video_script", 
      "blog_recipe": "blog",
      "email_campaign": "email",
      "push_notification": "push",
      "carousel_step": "social",
      "affiliate_insert": "affiliate"
    };
    
    const channel = channelMap[blueprint.kind] || "content";
    
    // Create campaign artifact
    await db.insert(campaignArtifacts).values({
      campaignId,
      channel,
      variant: "A",
      payloadJson: {
        content: typeof content === 'string' ? content : content,
        metadata: {
          blueprintId: blueprint.id,
          blueprintName: blueprint.name,
          blueprintKind: blueprint.kind,
          generatedAt: new Date().toISOString()
        }
      }
    });
    
    console.log(`📎 Content attached to campaign ${campaignId} as ${channel} artifact`);
    
  } catch (error) {
    console.error("Error attaching to campaign:", error);
    throw error;
  }
}

export default router;