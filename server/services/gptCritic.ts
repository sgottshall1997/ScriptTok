import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface CritiqueResult {
  chosenVariant: number;
  confidence: number;
  reasoning: string;
}

/**
 * GPT-based content critique that predicts which variation is most likely to go viral
 * Returns the number (1-based index) of the most viral-worthy content
 */
export async function getCritiqueFromGPT(
  contentVariations: string[],
  niche: string,
  productName: string,
  templateType: string
): Promise<CritiqueResult> {
  try {
    // Build numbered list of variations for GPT to analyze
    const numberedVariations = contentVariations
      .map((content, index) => `${index + 1}. ${content}`)
      .join('\n\n');

    // Create niche-specific critique prompt
    const nicheContext = getNicheContext(niche);
    
    const prompt = `You are a viral content expert specializing in ${niche} content for social media.

Analyze these ${contentVariations.length} variations for "${productName}" and determine which is most likely to go viral among ${nicheContext.audience}:

${numberedVariations}

Consider these viral factors:
${nicheContext.viralFactors.map(factor => `- ${factor}`).join('\n')}

Respond in JSON format with:
{
  "chosenVariant": <number 1-${contentVariations.length}>,
  "confidence": <number 0-100>,
  "reasoning": "<brief explanation why this will perform best>"
}

Focus on engagement potential, shareability, and ${nicheContext.specificFocus}.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are an expert at predicting viral social media content. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3, // Lower temperature for more consistent analysis
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    // Validate the response
    if (!result.chosenVariant || result.chosenVariant < 1 || result.chosenVariant > contentVariations.length) {
      throw new Error('Invalid variant choice from GPT');
    }

    console.log(`🤖 GPT Critic picked variant ${result.chosenVariant} with ${result.confidence}% confidence`);
    console.log(`💡 Reasoning: ${result.reasoning}`);

    return {
      chosenVariant: result.chosenVariant,
      confidence: result.confidence || 0,
      reasoning: result.reasoning || 'No reasoning provided'
    };

  } catch (error) {
    console.error('❌ GPT critique failed:', error);
    // Return random pick as fallback
    return {
      chosenVariant: Math.floor(Math.random() * contentVariations.length) + 1,
      confidence: 0,
      reasoning: 'GPT critique failed, random selection used'
    };
  }
}

/**
 * Get niche-specific context for better critique analysis
 */
function getNicheContext(niche: string): { audience: string; viralFactors: string[]; specificFocus: string } {
  const contexts: Record<string, { audience: string; viralFactors: string[]; specificFocus: string }> = {
    skincare: {
      audience: "Gen Z and millennial beauty enthusiasts",
      viralFactors: [
        "Before/after transformation potential",
        "Ingredient transparency and education",
        "Relatable skin struggles",
        "Quick tips and hacks",
        "Authentic testimonials"
      ],
      specificFocus: "authenticity and educational value"
    },
    tech: {
      audience: "tech-savvy early adopters and gadget enthusiasts",
      viralFactors: [
        "Innovation and uniqueness",
        "Problem-solving capabilities",
        "Future-forward thinking",
        "Practical demonstrations",
        "Value for money"
      ],
      specificFocus: "innovation and practical benefits"
    },
    fashion: {
      audience: "style-conscious millennials and Gen Z",
      viralFactors: [
        "Trend relevance",
        "Styling versatility",
        "Outfit inspiration",
        "Seasonal appropriateness",
        "Affordable luxury appeal"
      ],
      specificFocus: "trend awareness and styling potential"
    },
    fitness: {
      audience: "health and wellness enthusiasts",
      viralFactors: [
        "Transformation potential",
        "Workout efficiency",
        "Motivational messaging",
        "Accessibility for beginners",
        "Results-focused content"
      ],
      specificFocus: "motivation and achievable results"
    },
    food: {
      audience: "home cooks and food lovers",
      viralFactors: [
        "Visual appeal and presentation",
        "Easy preparation steps",
        "Comfort food appeal",
        "Dietary accommodations",
        "Time-saving benefits"
      ],
      specificFocus: "visual appeal and convenience"
    },
    travel: {
      audience: "adventure seekers and experience collectors",
      viralFactors: [
        "Wanderlust inspiration",
        "Practical travel tips",
        "Hidden gem discoveries",
        "Budget-friendly options",
        "Safety and convenience"
      ],
      specificFocus: "inspiration and practical value"
    },
    pet: {
      audience: "pet parents and animal lovers",
      viralFactors: [
        "Cuteness and emotional appeal",
        "Pet health and safety",
        "Training and behavior tips",
        "Bonding activities",
        "Problem-solving for pet issues"
      ],
      specificFocus: "emotional connection and pet wellness"
    }
  };

  return contexts[niche] || {
    audience: "general social media users",
    viralFactors: [
      "Engaging storytelling",
      "Clear value proposition",
      "Emotional connection",
      "Shareable content",
      "Actionable insights"
    ],
    specificFocus: "general engagement and shareability"
  };
}

/**
 * Compare GPT predictions vs actual user choices over time
 */
export async function getGPTvsUserAnalysis(): Promise<{
  totalComparisons: number;
  gptAccuracy: number;
  agreements: number;
  disagreements: number;
  topPerformingNiches: string[];
}> {
  const feedbackLogger = (await import('../database/feedbackLogger.js')).default;
  
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        COUNT(*) as totalComparisons,
        SUM(CASE WHEN (userPick = 1 AND gptPick = id) THEN 1 ELSE 0 END) as agreements,
        SUM(CASE WHEN (userPick = 1 AND gptPick != id) THEN 1 ELSE 0 END) as disagreements,
        productName,
        templateType
      FROM feedback_log 
      WHERE userPick IS NOT NULL AND gptPick IS NOT NULL
      GROUP BY productName, templateType
    `;

    feedbackLogger.db.all(sql, [], (err: any, rows: any[]) => {
      if (err) {
        reject(err);
        return;
      }

      const totalComparisons = rows.reduce((sum, row) => sum + row.totalComparisons, 0);
      const totalAgreements = rows.reduce((sum, row) => sum + row.agreements, 0);
      const totalDisagreements = rows.reduce((sum, row) => sum + row.disagreements, 0);
      
      const gptAccuracy = totalComparisons > 0 ? (totalAgreements / totalComparisons) * 100 : 0;

      // Get top performing niches (most agreements)
      const topPerformingNiches = rows
        .sort((a, b) => b.agreements - a.agreements)
        .slice(0, 3)
        .map(row => row.templateType);

      resolve({
        totalComparisons,
        gptAccuracy: Math.round(gptAccuracy * 100) / 100,
        agreements: totalAgreements,
        disagreements: totalDisagreements,
        topPerformingNiches
      });
    });
  });
}