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
  "improvementSuggestions": "<specific suggestions for improvement>"
}`;

export async function evaluateContentWithChatGPT(content: string): Promise<EvaluationResult> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Latest OpenAI model
      messages: [
        {
          role: "system",
          content: "You are a professional social media content evaluator. Provide detailed, constructive feedback in valid JSON format only."
        },
        {
          role: "user",
          content: EVALUATION_PROMPT.replace('{content}', content)
        }
      ],
      temperature: 0.3,
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
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514", // Latest Claude model
      max_tokens: 1000,
      temperature: 0.3,
      messages: [
        {
          role: "user",
          content: EVALUATION_PROMPT.replace('{content}', content)
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