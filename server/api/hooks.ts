import { Router, Request, Response } from 'express';
import { db } from '../db';
import { contentHooks } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { openai, OPENAI_MODELS } from '../services/openai';

const router = Router();

// Generate hooks for content
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { product, niche, count = 5 } = req.body;
    
    if (!product || !niche) {
      return res.status(400).json({ error: 'Product and niche required' });
    }

    const hooks = await generateHookVariations(product, niche, count);
    const scoredHooks = await Promise.all(
      hooks.map(async hook => ({
        text: hook,
        score: await scoreHook(hook, niche)
      }))
    );

    // Sort by score
    scoredHooks.sort((a, b) => b.score - a.score);

    // Store hooks in database
    const storedHooks = await Promise.all(
      scoredHooks.map(async ({ text, score }) => {
        const [hook] = await db.insert(contentHooks).values({
          product,
          niche,
          hookText: text,
          score,
          platform: 'universal',
          contentType: 'hook'
        }).returning();
        return hook;
      })
    );

    res.json({
      success: true,
      hooks: storedHooks
    });

  } catch (error) {
    console.error('Error generating hooks:', error);
    res.status(500).json({ error: 'Failed to generate hooks' });
  }
});

// Get hooks for product/niche
router.get('/:niche/:product', async (req: Request, res: Response) => {
  try {
    const { niche, product } = req.params;
    
    const hooks = await db
      .select()
      .from(contentHooks)
      .where(eq(contentHooks.product, product))
      .orderBy(contentHooks.score);

    res.json(hooks);
  } catch (error) {
    console.error('Error fetching hooks:', error);
    res.status(500).json({ error: 'Failed to fetch hooks' });
  }
});

// Score a hook manually
router.post('/score', async (req: Request, res: Response) => {
  try {
    const { hookText, niche } = req.body;
    const score = await scoreHook(hookText, niche);
    
    res.json({ score });
  } catch (error) {
    console.error('Error scoring hook:', error);
    res.status(500).json({ error: 'Failed to score hook' });
  }
});

async function generateHookVariations(product: string, niche: string, count: number): Promise<string[]> {
  const prompt = `Generate ${count} compelling, viral hooks for ${niche} content about "${product}". 

Requirements:
- Each hook should be under 10 words
- Focus on curiosity, emotion, and viral potential
- Use power words and psychological triggers
- Make them platform-agnostic but social media optimized
- Include numbers, questions, or shocking statements where appropriate

Examples of good hooks:
- "This $10 product changed my skincare routine forever"
- "Why everyone's obsessed with this travel hack"
- "The fitness tool trainers don't want you to know about"

Return as a JSON array of strings.`;

  const response = await openai.chat.completions.create({
    model: OPENAI_MODELS.PRIMARY,
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.8
  });

  const result = JSON.parse(response.choices[0].message.content || '{"hooks": []}');
  return result.hooks || [];
}

async function scoreHook(hook: string, niche: string): Promise<number> {
  const prompt = `Score this ${niche} content hook from 1-100 based on viral potential:

"${hook}"

Scoring criteria:
- Curiosity factor (25 points)
- Emotional impact (25 points) 
- Clarity and brevity (20 points)
- Niche relevance (15 points)
- Call-to-action strength (15 points)

Return only a JSON object with the score: {"score": number}`;

  const response = await openai.chat.completions.create({
    model: OPENAI_MODELS.PRIMARY,
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.3
  });

  const result = JSON.parse(response.choices[0].message.content || '{"score": 50}');
  return Math.max(1, Math.min(100, result.score));
}

export default router;