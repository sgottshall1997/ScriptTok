import { Request, Response } from 'express';
import { z } from 'zod';
import { generateSpartanContent, shouldUseSpartanFormat, getSpartanAutoNiches } from '../services/spartanContentGenerator.js';

const spartanRequestSchema = z.object({
  productName: z.string().min(1, "Product name is required"),
  niche: z.string().min(1, "Niche is required"),
  contentType: z.enum(['shortCaptionSpartan', 'spartanVideoScript']),
  useSpartanFormat: z.boolean().optional().default(false),
  additionalContext: z.string().optional(),
});

// Generate Spartan format content
export async function generateSpartanFormatContent(req: Request, res: Response) {
  try {
    const validatedData = spartanRequestSchema.parse(req.body);
    
    console.log(`🏛️ Spartan content request for ${validatedData.productName} - Type: ${validatedData.contentType}`);
    
    const result = await generateSpartanContent(validatedData);
    
    if (!result.success) {
      return res.status(400).json({
        error: result.error,
        spartanFormatAvailable: shouldUseSpartanFormat(validatedData.niche, validatedData.useSpartanFormat)
      });
    }
    
    res.json({
      success: true,
      content: result.content,
      contentType: validatedData.contentType,
      productName: validatedData.productName,
      niche: validatedData.niche,
      spartanMode: true
    });
    
  } catch (error) {
    console.error('❌ Spartan content API error:', error);
    res.status(500).json({ 
      error: 'Failed to generate Spartan content',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Check if Spartan format is available for a niche
export async function checkSpartanAvailability(req: Request, res: Response) {
  try {
    const { niche, manualMode } = req.query;
    
    if (!niche || typeof niche !== 'string') {
      return res.status(400).json({ error: 'Niche parameter is required' });
    }
    
    const isManual = manualMode === 'true';
    const isAvailable = shouldUseSpartanFormat(niche, isManual);
    const autoNiches = getSpartanAutoNiches();
    
    res.json({
      success: true,
      spartanAvailable: isAvailable,
      autoSpartanNiches: autoNiches,
      niche,
      reason: isAvailable 
        ? (autoNiches.includes(niche.toLowerCase()) ? 'Auto-enabled for this niche' : 'Manually enabled')
        : 'Not available for this niche'
    });
    
  } catch (error) {
    console.error('❌ Spartan availability check error:', error);
    res.status(500).json({ 
      error: 'Failed to check Spartan availability',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}