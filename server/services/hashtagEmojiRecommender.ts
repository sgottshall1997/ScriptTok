/**
 * Smart Hashtag and Emoji Recommender Service
 * 
 * This service generates relevant hashtags and emojis for social media content
 * based on:
 * - The content niche (skincare, tech, fashion, etc.)
 * - Current trending topics and products
 * - The specific content being generated
 * - Smart analysis using OpenAI
 */

import { openai } from './openai';
import { Niche } from '@shared/constants';
import { TrendingProduct } from '@shared/schema';
import { storage } from '../storage';

interface HashtagEmojiRecommendations {
  hashtags: string[];
  emojis: string[];
  cta: string; // Call-to-action suggestion
}

/**
 * Generate content-specific and trending hashtags and emojis
 * 
 * @param content The content text to analyze
 * @param niche The content niche (skincare, tech, fashion, etc.)
 * @param productName The product the content is about
 * @returns Recommended hashtags and emojis with context
 */
export async function getRecommendedHashtagsAndEmojis(
  content: string,
  niche: Niche,
  productName: string
): Promise<HashtagEmojiRecommendations> {
  try {
    // Get trending products for this niche for additional context
    const trendingProducts = await storage.getTrendingProductsByNiche(niche);
    
    // Extract product titles for simpler context
    const trendingTitles = trendingProducts
      .map(p => p.title)
      .slice(0, 5)
      .join(", ");
    
    // Create a sample of the content (first 500 chars) to avoid token limits
    const contentSample = content.slice(0, 500) + (content.length > 500 ? "..." : "");
    
    // Use OpenAI to generate smart recommendations
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        {
          role: "system",
          content: `You are a social media marketing expert specializing in ${niche} content. 
          Your task is to recommend relevant, trending, and engaging hashtags and emojis for social media content.
          Include a mix of popular/trending hashtags and specific niche hashtags.
          For emojis, select ones that are visually appealing and relevant to the content.
          Also suggest a short, engaging call-to-action that would work well with this content.
          
          Base your recommendations on:
          1. The content provided
          2. The specific product mentioned
          3. Current trending products in the ${niche} niche
          4. Social media best practices for ${niche} content`
        },
        {
          role: "user",
          content: `Generate hashtag and emoji recommendations for this ${niche} content about ${productName}.
          
          Content sample: "${contentSample}"
          
          Current trending products in ${niche}: ${trendingTitles}
          
          Provide exactly 10 hashtags, 8 emojis, and 1 call-to-action suggestion. Format your response as a JSON object with keys: "hashtags", "emojis", and "cta".`
        }
      ],
      response_format: { type: "json_object" }
    });

    // Parse the response
    const responseText = completion.choices[0].message.content || "{}";
    const recommendations = JSON.parse(responseText) as HashtagEmojiRecommendations;
    
    // Ensure we have valid arrays
    const result: HashtagEmojiRecommendations = {
      hashtags: Array.isArray(recommendations.hashtags) ? recommendations.hashtags.slice(0, 10) : [],
      emojis: Array.isArray(recommendations.emojis) ? recommendations.emojis.slice(0, 8) : [],
      cta: recommendations.cta || "Try it now!"
    };
    
    // Ensure hashtags have # prefix
    result.hashtags = result.hashtags.map(tag => 
      tag.startsWith('#') ? tag : `#${tag.replace(/\s+/g, '')}`
    );
    
    return result;
  } catch (error) {
    console.error('Error generating hashtag and emoji recommendations:', error);
    
    // Return fallback recommendations if AI generation fails
    return getFallbackRecommendations(niche);
  }
}

/**
 * Provide fallback recommendations if AI generation fails
 */
function getFallbackRecommendations(niche: Niche): HashtagEmojiRecommendations {
  // Niche-specific fallback hashtags and emojis
  const nicheFallbacks: Record<Niche, HashtagEmojiRecommendations> = {
    'skincare': {
      hashtags: ['#skincare', '#beauty', '#selfcare', '#glowingskin', '#skincareproducts', '#skincareregimen', '#skincareroutine', '#skincaretips', '#skincareaddict', '#skincarecommunity'],
      emojis: ['✨', '💦', '🧴', '💆‍♀️', '🌿', '🌱', '🌸', '⭐'],
      cta: 'Treat your skin today!'
    },
    'tech': {
      hashtags: ['#tech', '#technology', '#gadgets', '#innovation', '#techreview', '#newtech', '#techlover', '#techtrends', '#techdaily', '#techworld'],
      emojis: ['🔋', '📱', '💻', '🖥️', '⌚', '🎧', '🎮', '🤖'],
      cta: 'Upgrade your tech now!'
    },
    'fashion': {
      hashtags: ['#fashion', '#style', '#ootd', '#outfitinspo', '#fashiontrends', '#fashionista', '#trendy', '#styleinspo', '#fashionstyle', '#fashionlover'],
      emojis: ['👗', '👜', '👠', '🧥', '👕', '🕶️', '💄', '👒'],
      cta: 'Elevate your style!'
    },
    'fitness': {
      hashtags: ['#fitness', '#workout', '#fitnessmotivation', '#gymlife', '#fitfam', '#training', '#healthylifestyle', '#exercise', '#fitnessjourney', '#strongnotskinny'],
      emojis: ['💪', '🏋️‍♀️', '🏃‍♂️', '🧘‍♀️', '🥗', '🍎', '⚡', '🔥'],
      cta: 'Level up your fitness game!'
    },
    'food': {
      hashtags: ['#food', '#foodie', '#cooking', '#homemade', '#foodphotography', '#foodlover', '#instafood', '#delicious', '#foodblogger', '#foodgram'],
      emojis: ['🍽️', '🍳', '🥘', '🍲', '🌮', '🍗', '🥑', '🧁'],
      cta: 'Try this delicious recipe!'
    },
    'pet': {
      hashtags: ['#pets', '#petsofinstagram', '#dogsofinstagram', '#catsofinstagram', '#petsagram', '#petstagram', '#doglife', '#catlife', '#petlover', '#animallovers'],
      emojis: ['🐶', '🐱', '🐾', '🦮', '🐈', '🐕', '🦴', '❤️'],
      cta: 'Treat your furry friend!'
    },
    'travel': {
      hashtags: ['#travel', '#wanderlust', '#travelgram', '#travelphotography', '#explore', '#adventure', '#traveltheworld', '#travelblogger', '#instatravel', '#traveler'],
      emojis: ['✈️', '🧳', '🏝️', '🗺️', '🏔️', '🌍', '🚗', '🧭'],
      cta: 'Start your adventure now!'
    }
  };
  
  return nicheFallbacks[niche] || nicheFallbacks['skincare'];
}