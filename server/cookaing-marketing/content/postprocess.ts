// Content post-processing: validation, sanitization, and enhancement
import { z } from "zod";

// Post-process generated content for quality and safety
export async function postprocessContent(
  rawContent: any,
  context: {
    blueprint: any;
    sourceData: any;
    options: any;
  }
): Promise<any> {
  console.log(`🔧 Post-processing content for blueprint: ${context.blueprint.kind}`);
  
  // Step 1: Validate content against output schema
  const validatedContent = validateAgainstSchema(rawContent, context.blueprint);
  
  // Step 2: Sanitize and clean content
  const sanitizedContent = sanitizeContent(validatedContent);
  
  // Step 3: Enhance with additional features
  const enhancedContent = await enhanceContent(sanitizedContent, context);
  
  // Step 4: Apply final quality checks
  const finalContent = applyQualityChecks(enhancedContent, context);
  
  console.log("✅ Content post-processing complete");
  return finalContent;
}

// Validate content against blueprint output schema
function validateAgainstSchema(content: any, blueprint: any): any {
  try {
    // For now, we'll do basic validation
    // TODO: Implement proper Zod schema validation based on blueprint.outputSchemaJson
    
    if (!content || typeof content !== 'object') {
      console.warn("⚠️ Content validation warning: Invalid content structure");
      return {
        error: "Invalid content structure",
        content: content
      };
    }
    
    console.log("✅ Content structure validation passed");
    return content;
    
  } catch (error) {
    console.error("❌ Content validation failed:", error);
    return {
      error: "Content validation failed",
      details: error instanceof Error ? error.message : "Unknown error",
      content: content
    };
  }
}

// Sanitize content for safety and quality
function sanitizeContent(content: any): any {
  if (typeof content === 'string') {
    return sanitizeString(content);
  } else if (Array.isArray(content)) {
    return content.map(item => sanitizeContent(item));
  } else if (content && typeof content === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(content)) {
      sanitized[key] = sanitizeContent(value);
    }
    return sanitized;
  }
  
  return content;
}

// Sanitize individual strings
function sanitizeString(text: string): string {
  if (typeof text !== 'string') return text;
  
  // Remove potentially harmful content
  let sanitized = text
    // Remove script tags and javascript
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    // Clean up excessive whitespace
    .replace(/\s+/g, ' ')
    .trim();
    
  // Limit length to prevent extremely long content
  if (sanitized.length > 10000) {
    sanitized = sanitized.substring(0, 9997) + '...';
    console.warn("⚠️ Content truncated due to excessive length");
  }
  
  return sanitized;
}

// Enhance content with additional features
async function enhanceContent(
  content: any, 
  context: {
    blueprint: any;
    sourceData: any;
    options: any;
  }
): Promise<any> {
  
  let enhanced = { ...content };
  
  // Add metadata
  enhanced._metadata = {
    generatedAt: new Date().toISOString(),
    blueprint: context.blueprint.name,
    blueprintKind: context.blueprint.kind,
    sourceType: context.sourceData.freeformText ? 'freeform' : 'recipe',
    options: context.options,
    mockMode: !process.env.OPENAI_API_KEY
  };
  
  // Enhance based on blueprint type
  switch (context.blueprint.kind) {
    case 'video_script_short':
      enhanced = enhanceVideoScript(enhanced, context);
      break;
    case 'blog_recipe':
      enhanced = enhanceBlogContent(enhanced, context);
      break;
    case 'email_campaign':
      enhanced = enhanceEmailContent(enhanced, context);
      break;
    default:
      // Apply general enhancements
      enhanced = applyGeneralEnhancements(enhanced, context);
  }
  
  return enhanced;
}

// Enhance video script content
function enhanceVideoScript(content: any, context: any): any {
  if (content.beats && Array.isArray(content.beats)) {
    // Ensure beats have proper timing
    content.beats = content.beats.map((beat: any, index: number) => ({
      ...beat,
      beatNumber: index + 1,
      isHook: index === 0,
      isCTA: index === content.beats.length - 1
    }));
    
    // Calculate total duration
    const lastBeat = content.beats[content.beats.length - 1];
    if (lastBeat && lastBeat.timecode) {
      const endTime = lastBeat.timecode.split('-')[1];
      content._metadata.estimatedDuration = endTime;
    }
  }
  
  // Ensure hashtags exist and are properly formatted
  if (content.hashtags && Array.isArray(content.hashtags)) {
    content.hashtags = content.hashtags.map((tag: string) => 
      tag.startsWith('#') ? tag : `#${tag}`
    );
  }
  
  return content;
}

// Enhance blog content
function enhanceBlogContent(content: any, context: any): any {
  // Add word count estimates
  if (content.h2s && Array.isArray(content.h2s)) {
    content._metadata.estimatedWordCount = content.h2s.length * 150; // ~150 words per section
  }
  
  // Ensure proper meta description length
  if (content.meta && content.meta.description) {
    if (content.meta.description.length > 160) {
      content.meta.description = content.meta.description.substring(0, 157) + '...';
    }
  }
  
  // Add structured data validation flag
  if (content.schemaOrgJsonLd) {
    content._metadata.hasStructuredData = true;
  }
  
  return content;
}

// Enhance email content
function enhanceEmailContent(content: any, context: any): any {
  // Validate subject line length
  if (content.subject && content.subject.length > 50) {
    console.warn("⚠️ Email subject line may be too long for optimal open rates");
    content._metadata.subjectLineWarning = true;
  }
  
  // Ensure preheader exists
  if (!content.preheader) {
    content.preheader = "Open to see this delicious recipe...";
  }
  
  // Add email deliverability score (simple heuristic)
  content._metadata.deliverabilityScore = calculateEmailDeliverabilityScore(content);
  
  return content;
}

// Apply general content enhancements
function applyGeneralEnhancements(content: any, context: any): any {
  // Add cooking-specific enhancements
  if (context.sourceData.title) {
    content._metadata.recipeTitle = context.sourceData.title;
  }
  
  if (context.sourceData.time) {
    content._metadata.cookingTime = context.sourceData.time;
  }
  
  return content;
}

// Apply final quality checks
function applyQualityChecks(content: any, context: any): any {
  const checks = {
    hasContent: !!content && typeof content === 'object',
    hasMetadata: !!content._metadata,
    contentNotEmpty: Object.keys(content).length > 1, // More than just metadata
    noErrors: !content.error
  };
  
  const passedChecks = Object.values(checks).filter(Boolean).length;
  const totalChecks = Object.keys(checks).length;
  
  content._metadata = content._metadata || {};
  content._metadata.qualityScore = (passedChecks / totalChecks) * 100;
  content._metadata.qualityChecks = checks;
  
  if (content._metadata.qualityScore < 75) {
    console.warn(`⚠️ Content quality score is low: ${content._metadata.qualityScore}%`);
  }
  
  return content;
}

// Calculate simple email deliverability score
function calculateEmailDeliverabilityScore(emailContent: any): number {
  let score = 100;
  
  // Penalize for spam-like characteristics
  const spamWords = ['free', 'urgent', 'limited time', 'act now', '!!!'];
  const text = JSON.stringify(emailContent).toLowerCase();
  
  spamWords.forEach(word => {
    if (text.includes(word)) {
      score -= 10;
    }
  });
  
  // Bonus for good practices
  if (emailContent.preheader) score += 5;
  if (emailContent.subject && emailContent.subject.length <= 50) score += 5;
  
  return Math.max(0, Math.min(100, score));
}