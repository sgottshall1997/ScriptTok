/**
 * Retroactive Claude AI Suggestions Generator
 * Analyzes existing content history and generates targeted suggestions by niche and template type
 */

import { generateWithAI } from './aiModelRouter';
import { 
  storeSuggestion, 
  getSuggestionsForContent,
  type InsertClaudeAiSuggestion 
} from './claudeAiSuggestionsService';
import { storage } from '../storage';

interface ContentAnalysis {
  niche: string;
  templateType: string;
  tone: string;
  sampleContent: string[];
  commonPatterns: string[];
  averageLength: number;
  contentCount: number;
}

interface GeneratedSuggestion {
  category: 'structure' | 'engagement' | 'conversion' | 'formatting' | 'tone';
  suggestion: string;
  reasoning: string;
  effectiveness: number;
}

/**
 * Analyze content history and generate targeted Claude AI suggestions
 */
export async function generateRetroactiveClaudeSuggestions(): Promise<{
  success: boolean;
  analyzed: number;
  generated: number;
  suggestions: any[];
}> {
  console.log('🔍 Starting retroactive Claude AI suggestions generation...');
  
  try {
    // Get all content history
    const contentHistory = await storage.getAllContentHistory(1000, 0);
    console.log(`📊 Found ${contentHistory.length} content entries to analyze`);

    // Group content by niche and template type
    const contentGroups = groupContentByNicheAndTemplate(contentHistory);
    console.log(`🎯 Grouped content into ${Object.keys(contentGroups).length} niche-template combinations`);

    let totalGenerated = 0;
    const allSuggestions = [];

    // Process each group
    for (const [groupKey, analysis] of Object.entries(contentGroups)) {
      if (analysis.contentCount < 2) {
        console.log(`⚠️ Skipping ${groupKey} - insufficient content (${analysis.contentCount} entries)`);
        continue;
      }

      console.log(`🔄 Analyzing ${groupKey} (${analysis.contentCount} pieces of content)...`);
      
      // Check if we already have suggestions for this exact combination
      const existingSuggestions = await getSuggestionsForContent({
        niche: analysis.niche,
        templateType: analysis.templateType,
        tone: analysis.tone,
        limit: 1
      });

      if (existingSuggestions.length > 0) {
        console.log(`✅ ${groupKey} already has suggestions, skipping...`);
        continue;
      }

      // Generate AI suggestions for this specific niche-template combination
      const suggestions = await generateSuggestionsForGroup(analysis);
      
      // Store suggestions in database
      for (const suggestion of suggestions) {
        try {
          const storedSuggestion = await storeSuggestion({
            niche: analysis.niche,
            category: suggestion.category,
            suggestion: suggestion.suggestion,
            templateType: analysis.templateType,
            platform: 'universal', // Since we're analyzing general content
            tone: analysis.tone,
            effectiveness: suggestion.effectiveness,
            reasoning: suggestion.reasoning,
            usageCount: 0
          });
          
          allSuggestions.push(storedSuggestion);
          totalGenerated++;
          
          console.log(`✅ Stored ${suggestion.category} suggestion for ${groupKey}`);
        } catch (error) {
          console.error(`❌ Error storing suggestion for ${groupKey}:`, error);
        }
      }

      // Small delay to avoid overwhelming the AI service
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`🎉 Retroactive analysis complete: ${totalGenerated} suggestions generated`);
    
    return {
      success: true,
      analyzed: Object.keys(contentGroups).length,
      generated: totalGenerated,
      suggestions: allSuggestions
    };

  } catch (error) {
    console.error('❌ Error in retroactive Claude suggestions generation:', error);
    throw error;
  }
}

/**
 * Group content history by niche and template type for targeted analysis
 */
function groupContentByNicheAndTemplate(contentHistory: any[]): Record<string, ContentAnalysis> {
  const groups: Record<string, ContentAnalysis> = {};

  for (const content of contentHistory) {
    // Skip entries without required fields
    if (!content.niche || !content.script) {
      continue;
    }

    // Infer template type if not present
    let templateType = content.templateType;
    if (!templateType || templateType === null) {
      templateType = inferTemplateType(content.script, content.niche);
    }

    const groupKey = `${content.niche}-${templateType}-${content.tone || 'professional'}`;
    
    if (!groups[groupKey]) {
      groups[groupKey] = {
        niche: content.niche,
        templateType: templateType,
        tone: content.tone || 'professional',
        sampleContent: [],
        commonPatterns: [],
        averageLength: 0,
        contentCount: 0
      };
    }

    groups[groupKey].sampleContent.push(content.script);
    groups[groupKey].contentCount++;
  }

  // Calculate statistics for each group
  for (const analysis of Object.values(groups)) {
    analysis.averageLength = Math.round(
      analysis.sampleContent.reduce((sum, content) => sum + content.length, 0) / analysis.contentCount
    );
  }

  return groups;
}

/**
 * Infer template type from content patterns and niche
 */
function inferTemplateType(script: string, niche: string): string {
  if (!script) return 'general';
  
  const content = script.toLowerCase();
  const length = script.length;

  // Product review patterns
  if (content.includes('review') || content.includes('tested') || content.includes('honest opinion') || 
      content.includes('pros and cons') || content.includes('worth it')) {
    return 'product-review';
  }

  // Tutorial/How-to patterns
  if (content.includes('how to') || content.includes('tutorial') || content.includes('step by step') ||
      content.includes('guide') || content.includes('learn')) {
    return 'tutorial';
  }

  // Comparison patterns
  if (content.includes('vs') || content.includes('versus') || content.includes('compare') ||
      content.includes('better than') || content.includes('difference')) {
    return 'comparison';
  }

  // Recommendation/List patterns
  if (content.includes('top') || content.includes('best') || content.includes('must have') ||
      content.includes('favorites') || content.includes('recommend')) {
    return 'recommendation';
  }

  // Short-form video content (likely TikTok/Instagram)
  if (length < 300) {
    return 'short-video';
  }

  // Medium-form content (likely Instagram caption/Twitter thread)
  if (length < 800) {
    return 'social-caption';
  }

  // Long-form content (likely YouTube/blog)
  if (length > 1000) {
    return 'long-form';
  }

  // Default based on niche
  switch (niche) {
    case 'beauty':
    case 'fashion':
      return 'product-review';
    case 'tech':
      return 'tech-review';
    case 'fitness':
      return 'workout-guide';
    case 'food':
      return 'recipe';
    case 'travel':
      return 'travel-guide';
    case 'pets':
      return 'pet-care';
    default:
      return 'general';
  }
}

/**
 * Generate Claude AI suggestions for a specific content group
 */
async function generateSuggestionsForGroup(analysis: ContentAnalysis): Promise<GeneratedSuggestion[]> {
  const sampleContent = analysis.sampleContent.slice(0, 3).join('\n\n---\n\n');
  
  const analysisPrompt = `Analyze the following ${analysis.niche} content samples for ${analysis.templateType} template with ${analysis.tone} tone:

CONTENT SAMPLES (${analysis.contentCount} total pieces):
${sampleContent}

ANALYSIS CONTEXT:
- Niche: ${analysis.niche}
- Template Type: ${analysis.templateType}
- Tone: ${analysis.tone}
- Average Length: ${analysis.averageLength} characters
- Content Count: ${analysis.contentCount}

Generate 5 specific, actionable suggestions to improve content in this exact niche-template combination. Each suggestion should:
1. Be specifically tailored to ${analysis.niche} + ${analysis.templateType}
2. Address patterns you see in the content samples
3. Be immediately actionable for content creators
4. Include a brief reasoning for why it works

Format as JSON array with this structure:
[
  {
    "category": "structure|engagement|conversion|formatting|tone",
    "suggestion": "Specific actionable suggestion",
    "reasoning": "Why this works for this niche-template combination",
    "effectiveness": 0.75
  }
]

Focus on suggestions that are unique to this ${analysis.niche}-${analysis.templateType} combination, not generic advice.`;

  try {
    const aiResponse = await generateWithAI(analysisPrompt, {
      model: 'claude',
      temperature: 0.3,
      maxTokens: 1500,
      useJson: true
    });

    if (!aiResponse.success) {
      throw new Error(`AI generation failed: ${aiResponse.error}`);
    }

    // Parse AI response
    let suggestions: GeneratedSuggestion[];
    try {
      // Clean the response content before parsing
      let content = aiResponse.content?.content || aiResponse.data || '';
      
      // Remove any control characters that might interfere with JSON parsing
      content = content.replace(/[\x00-\x1F\x7F]/g, '');
      
      suggestions = JSON.parse(content);
    } catch (parseError) {
      console.error('❌ JSON parsing error for suggestions:', parseError);
      // Fallback: create a default suggestion if parsing fails
      suggestions = [{
        category: 'structure',
        suggestion: `Structure ${analysis.templateType} content for ${analysis.niche} with clear hook, main points, and call-to-action`,
        reasoning: `${analysis.templateType} in ${analysis.niche} performs better with structured approach`,
        effectiveness: 0.7
      }];
    }

    return suggestions.slice(0, 5); // Limit to 5 suggestions per group
    
  } catch (error) {
    console.error(`❌ Error generating suggestions for ${analysis.niche}-${analysis.templateType}:`, error);
    return [];
  }
}

/**
 * Get detailed report of content distribution by niche and template
 */
export async function getContentDistributionReport(): Promise<{
  summary: Record<string, number>;
  detailed: Record<string, ContentAnalysis>;
}> {
  const contentHistory = await storage.getAllContentHistory(1000, 0);
  const groups = groupContentByNicheAndTemplate(contentHistory);
  
  const summary: Record<string, number> = {};
  
  // Create summary by niche
  Object.values(groups).forEach(analysis => {
    if (!summary[analysis.niche]) {
      summary[analysis.niche] = 0;
    }
    summary[analysis.niche] += analysis.contentCount;
  });

  return {
    summary,
    detailed: groups
  };
}

/**
 * Enhanced function to get suggestions for specific niche-template combination
 */
export async function getTargetedSuggestions(
  niche: string, 
  templateType: string, 
  tone: string = 'professional'
): Promise<any[]> {
  // First try exact match
  let suggestions = await getSuggestionsForContent({
    niche,
    templateType,
    tone,
    limit: 5
  });

  // If no exact match, try niche + template (any tone)
  if (suggestions.length === 0) {
    suggestions = await getSuggestionsForContent({
      niche,
      templateType,
      limit: 3
    });
  }

  // If still no match, try niche only
  if (suggestions.length === 0) {
    suggestions = await getSuggestionsForContent({
      niche,
      limit: 2
    });
  }

  console.log(`🎯 Found ${suggestions.length} targeted suggestions for ${niche}-${templateType}-${tone}`);
  return suggestions;
}