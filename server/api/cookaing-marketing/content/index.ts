import { Request, Response, Router } from "express";
import { z } from "zod";
import { db } from "../../../db";
import { contentBlueprints, contentJobs, campaignArtifacts, campaigns, cookaingContentVersions, cookaingContentRatings, contentLinks, contentExports } from "../../../../shared/schema";
import { eq, desc, and } from "drizzle-orm";
import { storage } from "../../../storage";
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

// ===============================================================================
// CookAIng Content History & Rating API Endpoints
// ===============================================================================

// Validation schemas for content history endpoints
const contentVersionSchema = z.object({
  campaignId: z.number().int().positive().optional(),
  recipeId: z.number().int().positive().optional(),
  sourceJobId: z.number().int().positive().optional(),
  channel: z.string().min(1),
  platform: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  summary: z.string().optional(), 
  niche: z.string().min(1).optional(),
  template: z.string().min(1).optional(),
  model: z.string().min(1).optional(),
  metadataJson: z.record(z.any()),
  payloadJson: z.record(z.any()),
  createdBy: z.string().min(1).optional()
});

const contentRatingSchema = z.object({
  versionId: z.number().int().positive(),
  userScore: z.number().int().min(1).max(100).optional(),
  aiVirality: z.number().int().min(1).max(10).optional(),
  aiClarity: z.number().int().min(1).max(10).optional(),
  aiPersuasiveness: z.number().int().min(1).max(10).optional(),
  aiCreativity: z.number().int().min(1).max(10).optional(),
  thumb: z.enum(["up", "down"]).optional(),
  reasons: z.array(z.string()).optional(),
  notes: z.string().optional(),
  isWinner: z.boolean().default(false),
  createdBy: z.string().min(1).optional()
});

const contentLinkSchema = z.object({
  versionId: z.number().int().positive(),
  artifactId: z.number().int().positive().optional(),
  jobId: z.number().int().positive().optional(),
  type: z.enum(["artifact", "job"])
}).refine((data) => {
  if (data.type === "artifact" && !data.artifactId) {
    return false;
  }
  if (data.type === "job" && !data.jobId) {
    return false;
  }
  return true;
}, {
  message: "artifactId is required when type is 'artifact', jobId is required when type is 'job'"
});

const contentExportSchema = z.object({
  versionId: z.number().int().positive(),
  format: z.enum(["json", "csv", "markdown"]),
  payload: z.string().min(1)
});

// Query parameter schemas
const versionsQuerySchema = z.object({
  niche: z.string().optional(),
  template: z.string().optional(), 
  platform: z.string().optional(),
  channel: z.string().optional(),
  campaignId: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default("50")
});

const topRatedQuerySchema = z.object({
  niche: z.string().optional(),
  minRating: z.string().regex(/^\d+$/).transform(Number).optional().default("80"),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default("20")
});

const exportsQuerySchema = z.object({
  versionId: z.string().regex(/^\d+$/).transform(Number).optional(),
  format: z.enum(["json", "csv", "markdown"]).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default("50")
});

const bulkExportSchema = z.object({
  versionIds: z.array(z.number().int().positive()).min(1),
  format: z.enum(["json", "csv", "markdown"]).default("json")
});

// Helper function to handle validation errors
const handleValidationError = (error: any, res: Response) => {
  if (error instanceof z.ZodError) {
    return res.status(400).json({
      error: "Validation failed",
      issues: error.issues
    });
  }
  throw error; // Re-throw if not validation error
};

// Helper function to standardize error responses
const handleError = (error: any, res: Response, context: string) => {
  console.error(`${context} error:`, error);
  
  if (error instanceof z.ZodError) {
    return res.status(400).json({
      error: "Validation failed",
      issues: error.issues
    });
  }
  
  // Check for common database errors
  if (error.message?.includes("not found") || error.message?.includes("does not exist")) {
    return res.status(404).json({
      error: "Resource not found",
      details: error.message
    });
  }
  
  return res.status(500).json({
    error: `Failed to ${context}`,
    details: error instanceof Error ? error.message : "Unknown error"
  });
};

// POST /api/cookaing-marketing/content/versions - Create a new content version
router.post("/versions", async (req: Request, res: Response) => {
  try {
    console.log("📝 Creating content version");
    
    const validatedData = contentVersionSchema.parse(req.body);
    
    const contentVersion = await storage.saveCookaingContentVersion(validatedData);
    
    res.status(201).json({
      success: true,
      contentVersion,
      message: "Content version created successfully"
    });
    
  } catch (error) {
    return handleError(error, res, "create content version");
  }
});

// GET /api/cookaing-marketing/content/versions - Get content versions with filters
router.get("/versions", async (req: Request, res: Response) => {
  try {
    const validatedQuery = versionsQuerySchema.parse(req.query);
    
    const contentVersions = await storage.getCookaingContentVersions(validatedQuery);
    
    res.json({
      success: true,
      contentVersions,
      count: contentVersions.length,
      filter: validatedQuery
    });
    
  } catch (error) {
    return handleError(error, res, "get content versions");
  }
});

// GET /api/cookaing-marketing/content/versions/:id - Get specific content version
router.get("/versions/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    const contentVersion = await storage.getCookaingContentVersionById(id);
    
    if (!contentVersion) {
      return res.status(404).json({ error: "Content version not found" });
    }
    
    // Get associated ratings
    const ratings = await storage.getCookaingContentRatingsByVersion(id);
    
    res.json({
      success: true,
      contentVersion,
      ratings,
      ratingCount: ratings.length,
      avgUserScore: ratings.length > 0 ? 
        ratings.filter(r => r.userScore).reduce((sum, r) => sum + (r.userScore || 0), 0) / ratings.filter(r => r.userScore).length : 0
    });
    
  } catch (error) {
    console.error("Get content version error:", error);
    res.status(500).json({ 
      error: "Failed to get content version",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// DELETE /api/cookaing-marketing/content/versions/:id - Delete content version
router.delete("/versions/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    const deleted = await storage.deleteCookaingContentVersion(id);
    
    if (!deleted) {
      return res.status(404).json({ error: "Content version not found" });
    }
    
    res.json({
      success: true,
      message: "Content version deleted successfully"
    });
    
  } catch (error) {
    console.error("Delete content version error:", error);
    res.status(500).json({ 
      error: "Failed to delete content version",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// POST /api/cookaing-marketing/content/ratings - Create or update content rating
router.post("/ratings", async (req: Request, res: Response) => {
  try {
    console.log("⭐ Creating content rating");
    
    const validatedData = contentRatingSchema.parse(req.body);
    
    // Verify version exists
    const version = await storage.getCookaingContentVersionById(validatedData.versionId);
    if (!version) {
      return res.status(404).json({
        error: "Resource not found",
        details: "Content version not found"
      });
    }
    
    const rating = await storage.saveCookaingContentRating(validatedData);
    
    res.status(201).json({
      success: true,
      rating,
      message: "Content rating saved successfully"
    });
    
  } catch (error) {
    return handleError(error, res, "save content rating");
  }
});

// GET /api/cookaing-marketing/content/ratings/:versionId - Get ratings for a version
router.get("/ratings/:versionId", async (req: Request, res: Response) => {
  try {
    const versionId = parseInt(req.params.versionId);
    
    const ratings = await storage.getCookaingContentRatingsByVersion(versionId);
    
    res.json({
      success: true,
      ratings,
      count: ratings.length
    });
    
  } catch (error) {
    console.error("Get ratings error:", error);
    res.status(500).json({ 
      error: "Failed to get ratings",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// GET /api/cookaing-marketing/content/top-rated - Get top-rated content
router.get("/top-rated", async (req: Request, res: Response) => {
  try {
    const { niche, minRating = "80", limit = "20" } = req.query;
    
    const filter = {
      niche: niche as string,
      minRating: parseInt(minRating as string),
      limit: parseInt(limit as string)
    };
    
    // Remove undefined values
    Object.keys(filter).forEach(key => filter[key] === undefined && delete filter[key]);
    
    const topRatedContent = await storage.getTopRatedCookaingContent(filter);
    
    res.json({
      success: true,
      topRatedContent,
      count: topRatedContent.length,
      filter
    });
    
  } catch (error) {
    console.error("Get top-rated content error:", error);
    res.status(500).json({ 
      error: "Failed to get top-rated content",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// POST /api/cookaing-marketing/content/links - Create content link
router.post("/links", async (req: Request, res: Response) => {
  try {
    console.log("🔗 Creating content link:", req.body);
    
    const validatedData = contentLinkSchema.parse(req.body);
    
    const link = await storage.saveContentLink(validatedData);
    
    res.json({
      success: true,
      link,
      message: "Content link created successfully"
    });
    
  } catch (error) {
    console.error("Content link error:", error);
    res.status(500).json({ 
      error: "Failed to create content link",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// POST /api/cookaing-marketing/content/exports - Create content export
router.post("/exports", async (req: Request, res: Response) => {
  try {
    console.log("📤 Creating content export:", req.body);
    
    const validatedData = contentExportSchema.parse(req.body);
    
    const exportRecord = await storage.saveContentExport(validatedData);
    
    res.json({
      success: true,
      export: exportRecord,
      message: "Content export created successfully"
    });
    
  } catch (error) {
    console.error("Content export error:", error);
    res.status(500).json({ 
      error: "Failed to create content export",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// GET /api/cookaing-marketing/content/exports - Get content exports
router.get("/exports", async (req: Request, res: Response) => {
  try {
    const { versionId, format, limit = "50" } = req.query;
    
    const filter = {
      versionId: versionId ? parseInt(versionId as string) : undefined,
      format: format as string,
      limit: parseInt(limit as string)
    };
    
    // Remove undefined values
    Object.keys(filter).forEach(key => filter[key] === undefined && delete filter[key]);
    
    const exports = await storage.getContentExports(filter);
    
    res.json({
      success: true,
      exports,
      count: exports.length,
      filter
    });
    
  } catch (error) {
    console.error("Get content exports error:", error);
    res.status(500).json({ 
      error: "Failed to get content exports",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// POST /api/cookaing-marketing/content/bulk-export - Export multiple content versions
router.post("/bulk-export", async (req: Request, res: Response) => {
  try {
    console.log("📤 Bulk exporting content versions");
    
    const validatedData = bulkExportSchema.parse(req.body);
    
    // Fetch all versions in parallel
    const versionPromises = validatedData.versionIds.map(id => 
      storage.getCookaingContentVersionById(id)
    );
    
    const versions = await Promise.all(versionPromises);
    const contentVersions = versions.filter(v => v !== undefined);
    
    if (contentVersions.length === 0) {
      return res.status(404).json({
        error: "No content versions found",
        details: "None of the provided version IDs exist"
      });
    }
    
    // Create export records in parallel
    const exportPromises = contentVersions.map(version => 
      storage.saveContentExport({
        versionId: version.id,
        format: validatedData.format,
        payload: JSON.stringify(version)
      })
    );
    
    const exportRecords = await Promise.all(exportPromises);
    
    let exportData: any;
    
    if (validatedData.format === "csv") {
      // Convert to CSV format
      const headers = ["id", "channel", "platform", "title", "niche", "template", "createdAt"];
      const rows = contentVersions.map(v => [
        v.id,
        v.channel,
        v.platform || "",
        v.title || "",
        v.niche || "",
        v.template || "", 
        v.createdAt.toISOString()
      ]);
      
      exportData = [headers, ...rows].map(row => row.join(",")).join("\n");
    } else if (format === "markdown") {
      // Convert to Markdown format
      exportData = contentVersions.map(v => 
        `# ${v.title || "Untitled"}\n\n` +
        `**Channel:** ${v.channel}\n` +
        `**Platform:** ${v.platform || "N/A"}\n` +
        `**Niche:** ${v.niche || "N/A"}\n` +
        `**Template:** ${v.template || "N/A"}\n` +
        `**Created:** ${v.createdAt.toISOString()}\n\n` +
        `**Content:**\n${JSON.stringify(v.payloadJson, null, 2)}\n\n---\n\n`
      ).join("");
    } else {
      // JSON format (default)
      exportData = JSON.stringify(contentVersions, null, 2);
    }
    
    res.json({
      success: true,
      exportData,
      contentVersions,
      exportRecords,
      format,
      count: contentVersions.length,
      message: `${contentVersions.length} content versions exported as ${format.toUpperCase()}`
    });
    
  } catch (error) {
    console.error("Bulk export error:", error);
    res.status(500).json({ 
      error: "Failed to export content",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

export default router;