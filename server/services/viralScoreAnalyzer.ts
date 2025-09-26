import { openai } from './openai';

interface ViralScoreAnalysis {
  overallSummary: string;
  hookFeedback: string;
  engagementFeedback: string;
  clarityFeedback: string;
  lengthFeedback: string;
  trendingFeedback: string;
  topActions: string[];
  improvementPrompt: string; // NEW: Prompt to regenerate with fixes
}

export async function analyzeViralScore(
  content: string,
  viralScore: {
    overall: number;
    breakdown: {
      hookStrength: number;
      engagement: number;
      clarity: number;
      length: number;
      trending: number;
    };
    suggestions: string[];
  },
  productName?: string,
  niche?: string
): Promise<ViralScoreAnalysis> {
  const prompt = `You are a TikTok viral content expert. Analyze this script and its viral score breakdown.

SCRIPT:
${content}

PRODUCT: ${productName || 'N/A'}
NICHE: ${niche || 'general'}

VIRAL SCORE: ${viralScore.overall}/100

BREAKDOWN:
- Hook Strength: ${viralScore.breakdown.hookStrength}/100
- Engagement: ${viralScore.breakdown.engagement}/100
- Clarity: ${viralScore.breakdown.clarity}/100
- Length: ${viralScore.breakdown.length}/100
- Trending: ${viralScore.breakdown.trending}/100

Provide analysis in this JSON format:
{
  "overallSummary": "2-3 sentence overview explaining the score and biggest strengths/weaknesses",
  "hookFeedback": "1 sentence on why hook scored this way, what's good/bad",
  "engagementFeedback": "1 sentence on engagement elements present/missing",
  "clarityFeedback": "1 sentence on readability and clarity",
  "lengthFeedback": "1 sentence on video length optimization",
  "trendingFeedback": "1 sentence on use of trending formats/phrases",
  "topActions": ["Action 1", "Action 2", "Action 3"],
  "improvementPrompt": "A specific instruction to regenerate this script with all improvements applied. Example: 'Rewrite this script starting with POV: format, add 4 emojis, include trending phrase tell me why, and add urgency word now in the CTA'"
}

Be specific, actionable, and reference the actual content. The improvementPrompt should be a complete instruction that can be used to regenerate the script.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a TikTok virality expert. Analyze scripts and provide specific, actionable feedback. Return ONLY valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: "json_object" }
    });

    const analysis = JSON.parse(response.choices[0].message.content || "{}");
    return analysis as ViralScoreAnalysis;
  } catch (error) {
    console.error("AI analysis error:", error);
    // Return fallback analysis
    return {
      overallSummary: "Your script has good potential with a viral score of " + viralScore.overall + "/100. Focus on the suggestions below to improve.",
      hookFeedback: viralScore.breakdown.hookStrength >= 70 ? "Strong hook that grabs attention" : "Hook could be more attention-grabbing",
      engagementFeedback: viralScore.breakdown.engagement >= 70 ? "Good engagement elements present" : "Add more calls-to-action and questions",
      clarityFeedback: viralScore.breakdown.clarity >= 70 ? "Clear and easy to understand" : "Simplify language for better clarity",
      lengthFeedback: viralScore.breakdown.length >= 70 ? "Optimal length for TikTok" : "Adjust length to 100-170 words",
      trendingFeedback: viralScore.breakdown.trending >= 70 ? "Uses trending phrases well" : "Add trending TikTok phrases like 'POV:' or 'tell me why'",
      topActions: viralScore.suggestions.slice(0, 3),
      improvementPrompt: "Rewrite this script incorporating: " + viralScore.suggestions.join(", ")
    };
  }
}