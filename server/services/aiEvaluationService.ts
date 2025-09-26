import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { InsertContentEvaluation } from '@shared/schema';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface EvaluationResult {
  viralityScore: number;
  clarityScore: number;
  persuasivenessScore: number;
  creativityScore: number;
  viralityJustification: string;
  clarityJustification: string;
  persuasivenessJustification: string;
  creativityJustification: string;
  needsRevision: boolean;
  improvementSuggestions: string;
  overallScore: number;
}

const EVALUATION_PROMPT = `You are an expert content evaluator for social media marketing. Please evaluate the following content on a scale of 1-10 for each metric:

**CONTENT TO EVALUATE:**
{content}

**EVALUATION CRITERIA:**

1. **VIRALITY (1-10)**: How likely is this content to be shared and go viral?
   - Consider trending elements, emotional triggers, shareability factor
   - Look for hooks, surprising elements, relatable content

2. **CLARITY (1-10)**: How clear and easy to understand is this content?
   - Message clarity, structure, readability
   - Avoiding confusion or ambiguity

3. **PERSUASIVENESS (1-10)**: How compelling is this content for driving action?
   - Call-to-action strength, persuasive language
   - Ability to convert viewers to buyers

4. **CREATIVITY (1-10)**: How original and creative is this approach?
   - Unique angles, fresh perspectives
   - Avoiding generic or overused formats

**IMPROVEMENT SUGGESTIONS GUIDELINES:**
Generate 3-5 specific, actionable improvement suggestions. Each suggestion should:
- Be immediately implementable
- Address the lowest-scoring metrics first
- Be specific to the content type and niche
- Include examples when possible
- Focus on what would most increase viral potential

Format suggestions as numbered list with clear action items:
1. [HOOK IMPROVEMENT]: Specific suggestion for opening
2. [ENGAGEMENT]: Specific suggestion for audience interaction
3. [CTA ENHANCEMENT]: Specific call-to-action improvement
4. [VISUAL/FORMAT]: Specific formatting or presentation tip
5. [NICHE-SPECIFIC]: Suggestion tailored to the product/niche

**RESPONSE FORMAT:**
Provide your evaluation in the following JSON format:
{
  "viralityScore": <1-10>,
  "clarityScore": <1-10>, 
  "persuasivenessScore": <1-10>,
  "creativityScore": <1-10>,
  "viralityJustification": "<2-3 sentence explanation>",
  "clarityJustification": "<2-3 sentence explanation>",
  "persuasivenessJustification": "<2-3 sentence explanation>",
  "creativityJustification": "<2-3 sentence explanation>",
  "needsRevision": <true/false>,
  "improvementSuggestions": "<numbered list of 3-5 specific, actionable improvements following the format above>"
}`;

export async function evaluateContentWithChatGPT(content: string): Promise<EvaluationResult> {
  try {
    // Extract content context for better suggestions
    const contentLines = content.split('\n');
    const niche = contentLines.find(line => line.startsWith('Niche:'))?.replace('Niche:', '').trim() || 'general';
    const contentType = contentLines.find(line => line.startsWith('Content Type:'))?.replace('Content Type:', '').trim() || 'social media';
    const platform = contentType.includes('video') ? 'TikTok/Instagram Reels' : 'Instagram/Facebook';

    const enhancedPrompt = EVALUATION_PROMPT.replace('{content}', content) + `

**ADDITIONAL CONTEXT FOR SUGGESTIONS:**
- Niche: ${niche}
- Content Type: ${contentType}  
- Target Platform: ${platform}
- Focus on ${niche}-specific improvements and ${platform} best practices
- Consider current trends in ${niche} content
- Provide platform-specific formatting suggestions for ${platform}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Latest OpenAI model
      messages: [
        {
          role: "system",
          content: "You are a professional social media content evaluator specializing in viral content optimization. Provide detailed, constructive feedback with specific, actionable improvement suggestions in valid JSON format only."
        },
        {
          role: "user",
          content: enhancedPrompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1500, // Increased for better suggestions
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content!);
    
    // Calculate overall score as weighted average
    const overallScore = (
      result.viralityScore * 0.3 +
      result.clarityScore * 0.2 +
      result.persuasivenessScore * 0.3 +
      result.creativityScore * 0.2
    );

    return {
      ...result,
      overallScore: parseFloat(overallScore.toFixed(1))
    };
  } catch (error) {
    console.error('Error evaluating content with ChatGPT:', error);
    throw new Error('Failed to evaluate content with ChatGPT');
  }
}

export async function evaluateContentWithClaude(content: string): Promise<EvaluationResult> {
  try {
    // Extract content context for better suggestions
    const contentLines = content.split('\n');
    const niche = contentLines.find(line => line.startsWith('Niche:'))?.replace('Niche:', '').trim() || 'general';
    const contentType = contentLines.find(line => line.startsWith('Content Type:'))?.replace('Content Type:', '').trim() || 'social media';
    const platform = contentType.includes('video') ? 'TikTok/Instagram Reels' : 'Instagram/Facebook';

    const enhancedPrompt = EVALUATION_PROMPT.replace('{content}', content) + `

**ADDITIONAL CONTEXT FOR SUGGESTIONS:**
- Niche: ${niche}
- Content Type: ${contentType}  
- Target Platform: ${platform}
- Focus on ${niche}-specific improvements and ${platform} best practices
- Consider current trends in ${niche} content
- Provide platform-specific formatting suggestions for ${platform}`;

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022", // Use latest Claude model
      max_tokens: 1500, // Increased for better suggestions
      temperature: 0.3,
      messages: [
        {
          role: "user",
          content: enhancedPrompt
        }
      ]
    });

    const responseText = response.content[0].type === 'text' ? response.content[0].text : '';
    
    // Extract JSON from Claude's response (might include extra text)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in Claude response');
    }
    
    const result = JSON.parse(jsonMatch[0]);
    
    // Calculate overall score as weighted average
    const overallScore = (
      result.viralityScore * 0.3 +
      result.clarityScore * 0.2 +
      result.persuasivenessScore * 0.3 +
      result.creativityScore * 0.2
    );

    return {
      ...result,
      overallScore: parseFloat(overallScore.toFixed(1))
    };
  } catch (error) {
    console.error('Error evaluating content with Claude:', error);
    throw new Error('Failed to evaluate content with Claude');
  }
}



export async function evaluateContentWithBothModels(content: string): Promise<{
  chatgptEvaluation: EvaluationResult;
  claudeEvaluation: EvaluationResult;
}> {
  console.log('🤖 Starting dual AI evaluation (ChatGPT + Claude)...');
  
  const [chatgptEvaluation, claudeEvaluation] = await Promise.all([
    evaluateContentWithChatGPT(content),
    evaluateContentWithClaude(content)
  ]);

  console.log(`✅ Dual AI evaluation completed - ChatGPT: ${chatgptEvaluation.overallScore}, Claude: ${claudeEvaluation.overallScore}`);
  
  return {
    chatgptEvaluation,
    claudeEvaluation
  };
}

export function createContentEvaluationData(
  contentHistoryId: number,
  evaluatorModel: 'chatgpt' | 'claude',
  evaluation: EvaluationResult
): InsertContentEvaluation {
  return {
    contentHistoryId,
    evaluatorModel,
    viralityScore: evaluation.viralityScore,
    clarityScore: evaluation.clarityScore,
    persuasivenessScore: evaluation.persuasivenessScore,
    creativityScore: evaluation.creativityScore,
    viralityJustification: evaluation.viralityJustification,
    clarityJustification: evaluation.clarityJustification,
    persuasivenessJustification: evaluation.persuasivenessJustification,
    creativityJustification: evaluation.creativityJustification,
    needsRevision: evaluation.needsRevision,
    improvementSuggestions: evaluation.improvementSuggestions,
    overallScore: evaluation.overallScore.toString()
  };
}