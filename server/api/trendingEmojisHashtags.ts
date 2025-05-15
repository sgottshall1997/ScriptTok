/**
 * Trending Emojis and Hashtags API Endpoint
 * Used to fetch trending emojis and hashtags for different niches and content types
 */

import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { NICHES } from '@shared/constants';
import { aiModelClient } from '../services/aiModelClient';

export const trendingEmojisHashtagsRouter = Router();

// Default hashtag sets for different niches
const DEFAULT_HASHTAGS: Record<string, string[]> = {
  skincare: ['#skincare', '#beauty', '#skincareroutine', '#selfcare', '#skincareproducts', '#glowingskin'],
  tech: ['#tech', '#technology', '#gadgets', '#innovation', '#smartphone', '#techreview'],
  fashion: ['#fashion', '#style', '#ootd', '#fashionstyle', '#trendy', '#outfitinspo'],
  fitness: ['#fitness', '#workout', '#fitnessmotivation', '#gym', '#healthylifestyle', '#fitfam'],
  food: ['#food', '#foodie', '#foodporn', '#yummy', '#homemade', '#instafood'],
  travel: ['#travel', '#wanderlust', '#travelgram', '#adventure', '#explore', '#vacation'],
  pet: ['#pets', '#petsofinstagram', '#dogsofinstagram', '#catsofinstagram', '#petsarefamily', '#adoptdontshop']
};

// Default emoji sets for different niches
const DEFAULT_EMOJIS: Record<string, string[]> = {
  skincare: ['✨', '💫', '💆‍♀️', '🧴', '💦', '🌿', '💯', '🌟'],
  tech: ['📱', '💻', '🔋', '🔌', '📡', '🖥️', '⌨️', '🖱️'],
  fashion: ['👗', '👠', '👜', '🧣', '👢', '👚', '👒', '🕶️'],
  fitness: ['💪', '🏋️‍♀️', '🧘‍♀️', '🏃‍♂️', '🥗', '🍎', '⚡', '🔥'],
  food: ['🍕', '🍔', '🥗', '🍰', '🍷', '🍳', '👨‍🍳', '😋'],
  travel: ['✈️', '🏝️', '🗺️', '🧳', '🏞️', '🚂', '🚗', '🧭'],
  pet: ['🐶', '🐱', '🐾', '🦮', '🐕', '🐈', '❤️', '🏠']
};

// New endpoint for the Scraper Console to get all trends for all niches
trendingEmojisHashtagsRouter.get('/', async (req: Request, res: Response) => {
  try {
    // Get trends for all niches
    const allTrends = [];
    
    for (const niche of NICHES) {
      const trendingData = await storage.getTrendingEmojisHashtags(niche);
      
      if (trendingData) {
        allTrends.push(trendingData);
      } else {
        // Fall back to default data
        allTrends.push({
          niche,
          hashtags: DEFAULT_HASHTAGS[niche as keyof typeof DEFAULT_HASHTAGS] || [],
          emojis: DEFAULT_EMOJIS[niche as keyof typeof DEFAULT_EMOJIS] || [],
          lastUpdated: new Date(),
          isDefault: true
        });
      }
    }
    
    res.json(allTrends);
  } catch (error) {
    console.error('Error fetching all trending emojis and hashtags:', error);
    res.status(500).json({ message: 'Failed to fetch trending emojis and hashtags' });
  }
});

/**
 * GET /api/trending-emojis-hashtags/:niche
 * Get trending emojis and hashtags for a specific niche
 */
trendingEmojisHashtagsRouter.get('/:niche', async (req: Request, res: Response) => {
  try {
    const { niche } = req.params;
    
    if (!NICHES.includes(niche as any)) {
      return res.status(400).json({ message: `Invalid niche: ${niche}` });
    }
    
    // Try to get custom trending hashtags and emojis from DB
    const trendingData = await storage.getTrendingEmojisHashtags(niche);
    
    if (trendingData) {
      return res.json(trendingData);
    }
    
    // Fall back to default hashtags and emojis if nothing found in DB
    const defaultData = {
      niche,
      hashtags: DEFAULT_HASHTAGS[niche as keyof typeof DEFAULT_HASHTAGS] || [],
      emojis: DEFAULT_EMOJIS[niche as keyof typeof DEFAULT_EMOJIS] || [],
      lastUpdated: new Date(),
      isDefault: true
    };
    
    res.json(defaultData);
  } catch (error) {
    console.error('Error fetching trending emojis and hashtags:', error);
    res.status(500).json({ message: 'Failed to fetch trending emojis and hashtags' });
  }
});

/**
 * POST /api/trending-emojis-hashtags/refresh/:niche
 * Force refresh trending emojis and hashtags for a specific niche
 */
trendingEmojisHashtagsRouter.post('/refresh/:niche', async (req: Request, res: Response) => {
  try {
    const { niche } = req.params;
    
    if (!NICHES.includes(niche as any)) {
      return res.status(400).json({ message: `Invalid niche: ${niche}` });
    }
    
    // Get trending products for context
    const trendingProducts = await storage.getTrendingProductsByNiche(niche, 5);
    
    // Generate trending hashtags and emojis based on niche and trending products
    const trendingData = await generateTrendingEmojisHashtags(niche, trendingProducts);
    
    // Save to DB
    const savedData = await storage.saveTrendingEmojisHashtags({
      niche,
      hashtags: trendingData.hashtags,
      emojis: trendingData.emojis
    });
    
    res.json(savedData);
  } catch (error) {
    console.error('Error refreshing trending emojis and hashtags:', error);
    res.status(500).json({ message: 'Failed to refresh trending emojis and hashtags' });
  }
});

/**
 * POST /api/trending-emojis-hashtags/smart-suggest
 * Smart suggest emojis and hashtags based on content, niche, and template type
 */
trendingEmojisHashtagsRouter.post('/smart-suggest', async (req: Request, res: Response) => {
  try {
    const { niche, templateType, content } = req.body;
    
    if (!niche || !templateType || !content) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }
    
    if (!NICHES.includes(niche)) {
      return res.status(400).json({ message: `Invalid niche: ${niche}` });
    }
    
    // Get trending emojis and hashtags for context
    const trendingData = await storage.getTrendingEmojisHashtags(niche);
    
    // Generate smart suggestions based on content and trending data
    const suggestions = await generateSmartSuggestions(content, niche, templateType, trendingData);
    
    // Track the suggestion request
    await storage.incrementApiUsage(templateType, undefined, niche);
    
    res.json(suggestions);
  } catch (error) {
    console.error('Error generating smart suggestions:', error);
    res.status(500).json({ message: 'Failed to generate smart suggestions' });
  }
});

/**
 * Generate trending emojis and hashtags based on niche and trending products
 */
async function generateTrendingEmojisHashtags(niche: string, trendingProducts: any[]) {
  try {
    // Format trending product titles as context
    const productContext = trendingProducts.map(p => p.title).join(', ');
    
    // Use AI model to generate trending hashtags and emojis
    const systemPrompt = `You are a trending hashtag and emoji expert for the ${niche} niche. 
    Based on recent trending products and current social media trends, suggest the most effective and relevant hashtags and emojis.`;
    
    const userPrompt = `Generate 15 trending hashtags and 10 popular emojis for the ${niche} niche based on these trending products: ${productContext}.
    The hashtags should include a mix of popular, niche-specific, and product-related tags that would perform well on social media.
    The emojis should be relevant to the niche and help convey the right tone for social media content.
    Format your response as a JSON object with two arrays: "hashtags" and "emojis".`;
    
    const response = await aiModelClient.generateContent({
      systemPrompt,
      userPrompt,
      temperature: 0.7,
      model: 'gpt-4'
    });
    
    // Parse and validate the response
    let result;
    try {
      result = JSON.parse(response);
    } catch (e) {
      console.error('Failed to parse AI response as JSON:', e);
      // Create a simple regex-based parser for extracting arrays
      const hashtagRegex = /"hashtags":\s*\[(.*?)\]/;
      const emojiRegex = /"emojis":\s*\[(.*?)\]/;
      
      const hashtagMatch = response.match(hashtagRegex);
      const emojiMatch = response.match(emojiRegex);
      
      const hashtags = hashtagMatch ? 
        hashtagMatch[1].split(',').map((tag: string) => tag.trim().replace(/"/g, '')) : 
        DEFAULT_HASHTAGS[niche as keyof typeof DEFAULT_HASHTAGS];
        
      const emojis = emojiMatch ? 
        emojiMatch[1].split(',').map((emoji: string) => emoji.trim().replace(/"/g, '')) : 
        DEFAULT_EMOJIS[niche as keyof typeof DEFAULT_EMOJIS];
      
      result = { hashtags, emojis };
    }
    
    // Ensure we have hashtags and emojis
    if (!Array.isArray(result.hashtags) || !Array.isArray(result.emojis)) {
      return {
        hashtags: DEFAULT_HASHTAGS[niche as keyof typeof DEFAULT_HASHTAGS] || [],
        emojis: DEFAULT_EMOJIS[niche as keyof typeof DEFAULT_EMOJIS] || []
      };
    }
    
    return {
      hashtags: result.hashtags.filter(Boolean).slice(0, 15),
      emojis: result.emojis.filter(Boolean).slice(0, 10)
    };
  } catch (error) {
    console.error('Error generating trending emojis and hashtags:', error);
    return {
      hashtags: DEFAULT_HASHTAGS[niche as keyof typeof DEFAULT_HASHTAGS] || [],
      emojis: DEFAULT_EMOJIS[niche as keyof typeof DEFAULT_EMOJIS] || []
    };
  }
}

/**
 * Generate smart suggestions for emojis and hashtags based on content
 */
async function generateSmartSuggestions(content: string, niche: string, templateType: string, trendingData: any) {
  try {
    // Get default or trending hashtags and emojis for context
    const hashtagOptions = trendingData?.hashtags || DEFAULT_HASHTAGS[niche as keyof typeof DEFAULT_HASHTAGS] || [];
    const emojiOptions = trendingData?.emojis || DEFAULT_EMOJIS[niche as keyof typeof DEFAULT_EMOJIS] || [];
    
    // Use AI model to generate smart suggestions
    const systemPrompt = `You are a social media content optimization expert specialized in the ${niche} niche.
    Your task is to suggest the most relevant emojis and hashtags for the given content based on the context and current trends.`;
    
    const userPrompt = `Analyze this ${templateType} content for the ${niche} niche and suggest the most relevant emojis and hashtags:
    
    CONTENT:
    ${content.substring(0, 1000)} ${content.length > 1000 ? '...' : ''}
    
    AVAILABLE HASHTAGS:
    ${hashtagOptions.join(', ')}
    
    AVAILABLE EMOJIS:
    ${emojiOptions.join(' ')}
    
    Based on the semantic meaning of the content, suggest:
    1. 5-8 most relevant hashtags (choose from the available ones or suggest new ones if needed)
    2. 3-5 most appropriate emojis (choose from the available ones or suggest new ones if needed)
    3. Provide a brief explanation of why these are appropriate for this specific content
    
    Format your response as a JSON object with three properties: "hashtags" (array), "emojis" (array), and "explanation" (string).`;
    
    const response = await aiModelClient.generateContent({
      systemPrompt,
      userPrompt,
      temperature: 0.7,
      model: 'gpt-4'
    });
    
    // Parse and validate the response
    let result;
    try {
      result = JSON.parse(response);
    } catch (e) {
      console.error('Failed to parse AI response as JSON:', e);
      // Create a simple regex-based parser for extracting arrays and explanation
      const hashtagRegex = /"hashtags":\s*\[(.*?)\]/;
      const emojiRegex = /"emojis":\s*\[(.*?)\]/;
      const explanationRegex = /"explanation":\s*"(.*?)"/;
      
      const hashtagMatch = response.match(hashtagRegex);
      const emojiMatch = response.match(emojiRegex);
      const explanationMatch = response.match(explanationRegex);
      
      const hashtags = hashtagMatch ? 
        hashtagMatch[1].split(',').map((tag: string) => tag.trim().replace(/"/g, '')) : 
        hashtagOptions.slice(0, 5);
        
      const emojis = emojiMatch ? 
        emojiMatch[1].split(',').map((emoji: string) => emoji.trim().replace(/"/g, '')) : 
        emojiOptions.slice(0, 3);
      
      const explanation = explanationMatch ? 
        explanationMatch[1] : 
        "These suggestions are based on the content and current trends in this niche.";
      
      result = { hashtags, emojis, explanation };
    }
    
    // Ensure we have hashtags, emojis, and explanation
    if (!Array.isArray(result.hashtags)) {
      result.hashtags = hashtagOptions.slice(0, 5);
    }
    
    if (!Array.isArray(result.emojis)) {
      result.emojis = emojiOptions.slice(0, 3);
    }
    
    if (!result.explanation) {
      result.explanation = "These suggestions are based on the content and current trends in this niche.";
    }
    
    return {
      hashtags: result.hashtags.filter(Boolean).slice(0, 8),
      emojis: result.emojis.filter(Boolean).slice(0, 5),
      explanation: result.explanation
    };
  } catch (error) {
    console.error('Error generating smart suggestions:', error);
    return {
      hashtags: trendingData?.hashtags?.slice(0, 5) || DEFAULT_HASHTAGS[niche as keyof typeof DEFAULT_HASHTAGS]?.slice(0, 5) || [],
      emojis: trendingData?.emojis?.slice(0, 3) || DEFAULT_EMOJIS[niche as keyof typeof DEFAULT_EMOJIS]?.slice(0, 3) || [],
      explanation: "Default suggestions based on niche trends. Smart suggestions unavailable at the moment."
    };
  }
}