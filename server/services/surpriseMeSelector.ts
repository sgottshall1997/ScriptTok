import OpenAI from 'openai';
import { TemplateType, TEMPLATE_TYPES } from '@shared/constants';
import { TEMPLATE_METADATA } from '@shared/templateMetadata';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface SurpriseMeSelection {
  selectedTemplate: TemplateType;
  reasoning: string;
  confidence: number;
}

/**
 * Uses AI to intelligently select the best template for a given product and context
 */
export async function selectBestTemplate(
  product: string,
  niche: string,
  platforms: string[] = [],
  tone: string = 'enthusiastic'
): Promise<SurpriseMeSelection> {
  try {
    // Get relevant templates for the niche
    const nicheMap: Record<string, string[]> = {
      'skincare': ['Universal', 'Skincare'],
      'tech': ['Universal', 'Tech'],
      'fashion': ['Universal', 'Fashion'],
      'fitness': ['Universal', 'Fitness'],
      'food': ['Universal', 'Food', 'Home'],
      'travel': ['Universal', 'Travel'],
      'pet': ['Universal', 'Pet']
    };

    const relevantCategories = nicheMap[niche.toLowerCase()] || ['Universal'];
    const availableTemplates = Object.values(TEMPLATE_METADATA)
      .filter(template => 
        relevantCategories.includes(template.category) || 
        template.category === 'Legacy'
      )
      .slice(0, 15); // Limit for AI processing

    // Create a prompt for AI template selection
    const templateOptions = availableTemplates.map(template => 
      `${template.id}: ${template.name} - ${template.description} (${template.useCase})`
    ).join('\n');

    const prompt = `You are an expert content strategist. Analyze this product and context to select the most effective content template.

Product: "${product}"
Niche: ${niche}
Platforms: ${platforms.join(', ')}
Tone: ${tone}

Available templates:
${templateOptions}

Based on:
1. Product type and features
2. Target audience for this niche
3. Platform requirements
4. Current content trends
5. Conversion potential

Select the template that would generate the highest-performing content. Respond in JSON format:
{
  "selectedTemplate": "template_id",
  "reasoning": "Brief explanation of why this template is optimal",
  "confidence": 0.95
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are a content strategy expert who selects optimal templates for maximum engagement and conversion. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3, // Lower temperature for more consistent selections
      max_tokens: 300,
      response_format: { type: "json_object" }
    });

    const response = completion.choices[0].message.content;
    if (!response) {
      throw new Error('No response from AI');
    }

    const result = JSON.parse(response) as SurpriseMeSelection;
    
    // Validate the selected template exists
    if (!TEMPLATE_TYPES.includes(result.selectedTemplate)) {
      console.warn(`AI selected invalid template: ${result.selectedTemplate}, falling back to default`);
      return {
        selectedTemplate: 'influencer_caption',
        reasoning: 'AI selected invalid template, using popular fallback',
        confidence: 0.7
      };
    }

    // Ensure confidence is between 0 and 1
    result.confidence = Math.max(0, Math.min(1, result.confidence || 0.8));

    console.log(`🎲 Surprise Me selected: ${result.selectedTemplate} (confidence: ${result.confidence})`);
    console.log(`📝 Reasoning: ${result.reasoning}`);

    return result;

  } catch (error) {
    console.error('Error in Surprise Me selection:', error);
    
    // Fallback to simple heuristic selection
    const fallbackTemplates: Record<string, TemplateType> = {
      'skincare': 'skincare_routine',
      'tech': 'unboxing',
      'fashion': 'style_this',
      'fitness': 'supplement_stack',
      'food': 'product_recipe',
      'travel': 'packlist',
      'pet': 'dog_testimonial'
    };

    const fallbackTemplate = fallbackTemplates[niche.toLowerCase()] || 'influencer_caption';

    return {
      selectedTemplate: fallbackTemplate,
      reasoning: `Fallback selection for ${niche} niche after AI selection failed`,
      confidence: 0.6
    };
  }
}

/**
 * Get template recommendations based on product analysis
 */
export async function getSmartRecommendations(
  product: string,
  niche: string,
  limit: number = 5
): Promise<TemplateType[]> {
  try {
    const prompt = `Analyze this product and recommend the top ${limit} content templates for maximum engagement:

Product: "${product}"
Niche: ${niche}

Consider:
- Product type (physical/digital, price point, usage)
- Target audience demographics
- Content format preferences in this niche
- Viral potential and engagement factors

Respond with just the template IDs in order of recommendation (comma-separated):`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.4,
      max_tokens: 100
    });

    const response = completion.choices[0].message.content?.trim();
    if (!response) return [];

    const recommendations = response
      .split(',')
      .map(id => id.trim())
      .filter(id => TEMPLATE_TYPES.includes(id as TemplateType))
      .slice(0, limit) as TemplateType[];

    return recommendations;

  } catch (error) {
    console.error('Error getting smart recommendations:', error);
    return [];
  }
}