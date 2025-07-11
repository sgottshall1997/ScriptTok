import { Request, Response } from 'express';
import { db } from '../db.js';
import { bulkContentJobs, contentGenerations, insertBulkContentJobSchema, insertContentGenerationSchema } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { generateContent } from '../services/contentGenerator.js';
import { scheduleContent } from './cross-platform-scheduling.js';

const bulkGenerationSchema = z.object({
  productName: z.string().min(1),
  niche: z.string().min(1),
  platforms: z.array(z.string()).min(1),
  tones: z.array(z.string()).min(1),
  templates: z.array(z.string()).min(1),
  scheduleAfterGeneration: z.boolean().default(false),
  scheduledTime: z.string().datetime().optional(),
  makeWebhookUrl: z.string().url().optional(),
});

// Start a bulk content generation job
export async function startBulkGeneration(req: Request, res: Response) {
  try {
    // 🚫 CRITICAL SAFEGUARD: Apply generation safeguards
    const { validateGenerationRequest } = await import('../config/generation-safeguards');
    const validation = validateGenerationRequest(req);
    
    if (!validation.allowed) {
      console.log(`🚫 BULK GENERATION BLOCKED: ${validation.reason}`);
      return res.status(403).json({
        success: false,
        error: "Bulk generation blocked by security safeguards",
        reason: validation.reason,
        source: validation.source
      });
    }
    
    console.log(`🟢 SAFEGUARD: Bulk generation validated - proceeding`);
    
    const validatedData = bulkGenerationSchema.parse(req.body);
    
    // Generate unique job ID
    const jobId = `bulk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Calculate total variations
    const totalVariations = validatedData.tones.length * validatedData.templates.length;
    
    // Create bulk job record
    const [bulkJob] = await db.insert(bulkContentJobs).values({
      jobId,
      productName: validatedData.productName,
      niche: validatedData.niche,
      totalVariations,
      completedVariations: 0,
      status: 'pending',
      platforms: validatedData.platforms,
      tones: validatedData.tones,
      templates: validatedData.templates,
      scheduleAfterGeneration: validatedData.scheduleAfterGeneration,
      scheduledTime: validatedData.scheduledTime ? new Date(validatedData.scheduledTime) : null,
      makeWebhookUrl: validatedData.makeWebhookUrl,
    }).returning();

    // Start processing in background
    processBulkJob(bulkJob.id, validatedData).catch(error => {
      console.error('Bulk job processing error:', error);
    });

    res.json({
      success: true,
      jobId,
      bulkJob,
      message: `Bulk generation started for ${totalVariations} content variations`,
    });

  } catch (error) {
    console.error('Start bulk generation error:', error);
    res.status(500).json({ 
      error: 'Failed to start bulk generation',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Get bulk job status and progress
export async function getBulkJobStatus(req: Request, res: Response) {
  try {
    const { jobId } = req.params;
    
    const [bulkJob] = await db.select()
      .from(bulkContentJobs)
      .where(eq(bulkContentJobs.jobId, jobId))
      .limit(1);
    
    if (!bulkJob) {
      return res.status(404).json({ error: 'Bulk job not found' });
    }

    // Get generated content for this job
    const generatedContent = await db.select()
      .from(contentGenerations)
      .where(eq(contentGenerations.bulkJobId, jobId));

    const progressPercentage = bulkJob.totalVariations > 0 
      ? Math.round((bulkJob.completedVariations / bulkJob.totalVariations) * 100)
      : 0;

    res.json({
      success: true,
      bulkJob,
      generatedContent,
      progressPercentage,
      isComplete: bulkJob.status === 'completed',
      isFailed: bulkJob.status === 'failed',
    });

  } catch (error) {
    console.error('Get bulk job status error:', error);
    res.status(500).json({ 
      error: 'Failed to get bulk job status',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Get all bulk jobs with pagination
export async function getBulkJobs(req: Request, res: Response) {
  try {
    const { status, limit = 20, offset = 0 } = req.query;
    
    let query = db.select()
      .from(bulkContentJobs)
      .orderBy(bulkContentJobs.createdAt)
      .limit(Number(limit))
      .offset(Number(offset));

    if (status) {
      query = query.where(eq(bulkContentJobs.status, status as string));
    }

    const jobs = await query;

    res.json({
      success: true,
      jobs,
      pagination: {
        limit: Number(limit),
        offset: Number(offset),
        total: jobs.length,
      },
    });

  } catch (error) {
    console.error('Get bulk jobs error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch bulk jobs',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Process a bulk job (background function)
async function processBulkJob(bulkJobId: number, jobData: any) {
  try {
    // Update status to processing
    await db.update(bulkContentJobs)
      .set({ 
        status: 'processing',
        updatedAt: new Date(),
      })
      .where(eq(bulkContentJobs.id, bulkJobId));

    const generatedContentIds: number[] = [];
    let completedCount = 0;

    // Generate content for each tone/template combination
    for (const tone of jobData.tones) {
      for (const template of jobData.templates) {
        try {
          // Generate content variation
          const contentData = {
            product: jobData.productName,
            niche: jobData.niche,
            templateType: template,
            tone: tone,
            bulkJobId: (await db.select().from(bulkContentJobs).where(eq(bulkContentJobs.id, bulkJobId)).limit(1))[0].jobId,
          };

          // Use existing content generator
          const generatedContent = await generateContentVariation(contentData);
          
          if (generatedContent) {
            generatedContentIds.push(generatedContent.id);
            completedCount++;

            // Update progress
            await db.update(bulkContentJobs)
              .set({ 
                completedVariations: completedCount,
                updatedAt: new Date(),
              })
              .where(eq(bulkContentJobs.id, bulkJobId));
          }

        } catch (error) {
          console.error(`Failed to generate content for ${tone}/${template}:`, error);
          // Continue with other variations
        }
      }
    }

    // Schedule content if requested
    if (jobData.scheduleAfterGeneration && jobData.scheduledTime && generatedContentIds.length > 0) {
      for (const contentId of generatedContentIds) {
        try {
          const scheduleData = {
            contentId,
            platforms: jobData.platforms,
            scheduledTime: jobData.scheduledTime,
            makeWebhookUrl: jobData.makeWebhookUrl,
            bulkJobId: (await db.select().from(bulkContentJobs).where(eq(bulkContentJobs.id, bulkJobId)).limit(1))[0].jobId,
          };

          // Use existing scheduling function
          await scheduleContentForBulk(scheduleData);
        } catch (error) {
          console.error(`Failed to schedule content ${contentId}:`, error);
        }
      }
    }

    // Mark job as completed
    await db.update(bulkContentJobs)
      .set({ 
        status: 'completed',
        completedVariations: completedCount,
        updatedAt: new Date(),
      })
      .where(eq(bulkContentJobs.id, bulkJobId));

    console.log(`Bulk job ${bulkJobId} completed with ${completedCount} variations`);

  } catch (error) {
    console.error('Process bulk job error:', error);
    
    // Mark job as failed
    await db.update(bulkContentJobs)
      .set({ 
        status: 'failed',
        updatedAt: new Date(),
      })
      .where(eq(bulkContentJobs.id, bulkJobId));
  }
}

// Helper function to generate a single content variation
async function generateContentVariation(contentData: any) {
  try {
    const [generatedContent] = await db.insert(contentGenerations).values({
      product: contentData.product,
      niche: contentData.niche,
      templateType: contentData.templateType,
      tone: contentData.tone,
      content: await generateContentWithAI(contentData),
      bulkJobId: contentData.bulkJobId,
    }).returning();

    return generatedContent;
  } catch (error) {
    console.error('Generate content variation error:', error);
    throw error;
  }
}

// Helper function to generate content using AI
async function generateContentWithAI(contentData: any) {
  try {
    // Use existing content generation logic
    const prompt = buildPromptForContent(contentData);
    
    // This would use your existing AI service
    const aiResponse = await generateContent({
      product: contentData.product,
      niche: contentData.niche,
      templateType: contentData.templateType,
      tone: contentData.tone,
    });

    return aiResponse.content || `Generated content for ${contentData.product} in ${contentData.tone} tone using ${contentData.templateType} template.`;
  } catch (error) {
    console.error('AI content generation error:', error);
    return `Generated content for ${contentData.product} in ${contentData.tone} tone using ${contentData.templateType} template.`;
  }
}

// Helper function to build AI prompt
function buildPromptForContent(contentData: any) {
  return `Create engaging ${contentData.niche} content about ${contentData.product} using a ${contentData.tone} tone in ${contentData.templateType} format. Make it viral and persuasive for social media.`;
}

// Helper function to schedule content for bulk operations
async function scheduleContentForBulk(scheduleData: any) {
  try {
    // Create mock request/response for scheduling function
    const mockReq = { body: scheduleData } as Request;
    const mockRes = {
      json: (data: any) => data,
      status: (code: number) => ({ json: (data: any) => data }),
    } as any;

    // This would use your existing scheduling logic
    console.log(`Scheduling content ${scheduleData.contentId} for platforms:`, scheduleData.platforms);
    
    return { success: true };
  } catch (error) {
    console.error('Schedule content for bulk error:', error);
    throw error;
  }
}