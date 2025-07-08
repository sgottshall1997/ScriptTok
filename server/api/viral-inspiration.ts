import { Request, Response } from 'express';

interface ViralInspirationRequest {
  product: string;
  niche: string;
}

interface ViralVideoInspo {
  hook: string;
  format: string;
  caption: string;
  hashtags: string[];
}

/**
 * Fetch real viral video inspiration using Perplexity API
 * Searches TikTok and Instagram for actual viral content
 */
export const fetchViralInspiration = async (req: Request, res: Response) => {
  try {
    const { product, niche }: ViralInspirationRequest = req.body;

    if (!product || !niche) {
      return res.status(400).json({
        success: false,
        error: 'Product name and niche are required'
      });
    }

    console.log(`🎯 Fetching viral inspiration for "${product}" in ${niche} niche`);

    // Construct Perplexity prompt for real viral video analysis
    const prompt = `You are a viral trend analyst. Find 1 real TikTok or Instagram video that went viral recently for a product like "${product}" in the ${niche} niche.

Return JSON only:
{
  "hook": "text used at the start of the video",
  "format": "e.g. Voiceover demo, On-screen captions, etc.",
  "caption": "the video's original caption",
  "hashtags": ["#tag1", "#tag2", "#tag3"]
}

Only return real, plausible video structures. No placeholders or templates.`;

    const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.04,
        search_domain_filter: ['tiktok.com', 'instagram.com'],
        search_recency_filter: 'week',
        return_images: false,
        return_related_questions: false
      })
    });

    if (!perplexityResponse.ok) {
      console.error('Perplexity API error:', perplexityResponse.status, perplexityResponse.statusText);
      
      // Fallback with less strict query
      return await fallbackViralInspiration(product, niche, res);
    }

    const perplexityData = await perplexityResponse.json();
    console.log('📊 Raw Perplexity response:', perplexityData);

    if (!perplexityData.choices?.[0]?.message?.content) {
      console.warn('⚠️ No content in Perplexity response');
      return await fallbackViralInspiration(product, niche, res);
    }

    try {
      const inspiration: ViralVideoInspo = JSON.parse(perplexityData.choices[0].message.content);
      
      // Validate the response structure
      if (!inspiration.hook || !inspiration.format || !inspiration.caption || !inspiration.hashtags) {
        throw new Error('Invalid response structure');
      }

      console.log('✅ Successfully parsed viral inspiration:', inspiration);

      res.json({
        success: true,
        inspiration: inspiration,
        source: 'perplexity_real_data'
      });

    } catch (parseError) {
      console.error('❌ Failed to parse Perplexity JSON response:', parseError);
      console.log('Raw content:', perplexityData.choices[0].message.content);
      
      return await fallbackViralInspiration(product, niche, res);
    }

  } catch (error) {
    console.error('❌ Error in fetchViralInspiration:', error);
    return await fallbackViralInspiration(req.body.product, req.body.niche, res);
  }
};

/**
 * Fallback inspiration with less strict query
 */
async function fallbackViralInspiration(product: string, niche: string, res: Response) {
  try {
    console.log('🔄 Attempting fallback viral inspiration query...');
    
    const fallbackPrompt = `Find viral content patterns for ${niche} products similar to "${product}". 

Return JSON format:
{
  "hook": "common opening phrase for ${niche} videos",
  "format": "typical video structure",
  "caption": "typical caption style",
  "hashtags": ["#${niche}", "#trending", "#viral"]
}`;

    const fallbackResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [{ role: 'user', content: fallbackPrompt }],
        temperature: 0.1,
        search_recency_filter: 'month'
      })
    });

    if (fallbackResponse.ok) {
      const fallbackData = await fallbackResponse.json();
      const inspiration = JSON.parse(fallbackData.choices[0].message.content);
      
      return res.json({
        success: true,
        inspiration: inspiration,
        source: 'perplexity_fallback'
      });
    }
  } catch (fallbackError) {
    console.error('❌ Fallback also failed:', fallbackError);
  }

  // Final fallback - return error state
  res.status(500).json({
    success: false,
    error: 'No recent viral examples found — try refreshing or selecting another product.',
    source: 'error'
  });
}