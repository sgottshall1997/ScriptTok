/**
 * GPT Templates for Content Generation
 * This file contains all the templates for generating different types of content using OpenAI
 * based on the original GlowBot content generation templates
 */

import OpenAI from "openai";
import { ToneOption, TemplateType } from "../../shared/constants";
import { TrendingProduct } from "../../shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

/**
 * Generate an original review of a product
 */
export async function generateOriginalReview(
  openai: OpenAI,
  product: string,
  tone: ToneOption,
  trendingProducts?: TrendingProduct[]
): Promise<string> {
  const contextPrompt = trendingProducts 
    ? getTrendContext(product, trendingProducts)
    : '';

  const toneDescription = getToneDescription(tone);
  
  const [intro, content, outro] = await Promise.all([
    gptPrompt(
      openai,
      `In 1–2 short sentences, write a hook-style intro for "${product}" in a ${toneDescription} tone for a 30-60 second video. Keep it under 30 words.`
    ),
    gptPrompt(
      openai,
      `Write a helpful product description for "${product}" in a ${toneDescription} tone, specifically for a 30-60 second video script. Keep it between 80-120 words total.
      ${contextPrompt}`
    ),
    gptPrompt(
      openai,
      `In 1 sentence, write a confident outro that encourages people to try "${product}". Keep it under 20 words.`
    )
  ]);

  return formatContent(intro, content, outro);
}

/**
 * Generate a product comparison
 */
export async function generateProductComparison(
  openai: OpenAI,
  product: string,
  tone: ToneOption,
  trendingProducts?: TrendingProduct[]
): Promise<string> {
  const contextPrompt = trendingProducts 
    ? getTrendContext(product, trendingProducts)
    : '';

  const toneDescription = getToneDescription(tone);
  
  const [intro, content, outro] = await Promise.all([
    gptPrompt(
      openai,
      `In 1-2 short sentences, introduce a product comparison for "${product}" in a ${toneDescription} tone for a 30-60 second video. Keep it under 20 words.`
    ),
    gptPrompt(
      openai,
      `Compare "${product}" to its most popular alternative in a ${toneDescription} tone. Focus on key differences, and keep it between 80-120 words total to fit within a 30-60 second video script.
      ${contextPrompt}`
    ),
    gptPrompt(
      openai,
      `Give a recommendation about "${product}" versus its alternative in 1 sentence. Keep it under 20 words.`
    )
  ]);

  return formatContent(intro, content, outro);
}

/**
 * Generate a social media caption
 */
export async function generateCaption(
  openai: OpenAI,
  product: string,
  tone: ToneOption
): Promise<string> {
  const toneDescription = getToneDescription(tone);
  
  const [intro, content, outro] = await Promise.all([
    gptPrompt(
      openai,
      `In 1–2 short sentences, introduce a ${toneDescription} caption for "${product}" that would work for a 30-60 second video. Keep it under 30 words.`
    ),
    gptPrompt(
      openai,
      `Write a punchy social media caption for "${product}" in a ${toneDescription} tone, optimized for a 30-60 second video. Include 1-2 emojis and keep it between 80-120 words total.`
    ),
    gptPrompt(
      openai,
      `In 1 sentence, write a short outro with a clear call to action that encourages followers to try "${product}". Keep it under 20 words.`
    )
  ]);

  return formatContent(intro, content, outro);
}

/**
 * Generate pros and cons
 */
export async function generateProsAndCons(
  openai: OpenAI,
  product: string,
  tone: ToneOption
): Promise<string> {
  const toneDescription = getToneDescription(tone);
  
  const [intro, content, outro] = await Promise.all([
    gptPrompt(
      openai,
      `In 1–2 short sentences, introduce a pros and cons breakdown for "${product}" in a ${toneDescription} tone for a 30-60 second video. Keep it under 30 words.`
    ),
    gptPrompt(
      openai,
      `List 3 pros and 3 cons of "${product}" in a ${toneDescription} tone. Be concise with 80-120 words total to fit within a 30-60 second video, but remain insightful.`
    ),
    gptPrompt(
      openai,
      `In 1 sentence, wrap up the pros and cons and recommend who should try "${product}". Keep it under 20 words.`
    )
  ]);

  return formatContent(intro, content, outro);
}

/**
 * Generate a skincare routine
 */
export async function generateRoutine(
  openai: OpenAI,
  product: string,
  tone: ToneOption
): Promise<string> {
  const toneDescription = getToneDescription(tone);
  
  const [intro, content, outro] = await Promise.all([
    gptPrompt(
      openai,
      `In 1–2 short sentences, introduce a simple skincare routine with "${product}" in a ${toneDescription} tone for a 30-60 second video. Keep it under 30 words.`
    ),
    gptPrompt(
      openai,
      `Create a basic 4-step skincare routine in a ${toneDescription} tone that includes "${product}". For each step, include the step name and a short note. Ensure the total content is 80-120 words to fit in a 30-60 second video. Format like this:
      
      1. Cleanser – Gently removes dirt and oil.`
    ),
    gptPrompt(
      openai,
      `In 1 sentence, encourage consistency in the routine and remind viewers of long-term benefits. Keep it under 20 words.`
    )
  ]);

  return formatContent(intro, content, outro);
}

/**
 * Generate a beginner skincare kit
 */
export async function generateBeginnerKit(
  openai: OpenAI,
  product: string,
  tone: ToneOption
): Promise<string> {
  const toneDescription = getToneDescription(tone);
  
  const [intro, content, outro] = await Promise.all([
    gptPrompt(
      openai,
      `In 1–2 short sentences, introduce a beginner skincare kit that includes "${product}" in a ${toneDescription} tone for a 30-60 second video. Keep it under 30 words.`
    ),
    gptPrompt(
      openai,
      `List exactly 5 essential skincare products that belong in a beginner's kit, including "${product}", in a ${toneDescription} tone. Use this format:
      
      1. ${product} – Brief description of its benefits.
      
      Keep the total content between 80-120 words to fit within a 30-60 second video.`
    ),
    gptPrompt(
      openai,
      `In 1 sentence, encourage beginners to stick with their routine and stay consistent. Keep it under 20 words.`
    )
  ]);

  return formatContent(intro, content, outro);
}

/**
 * Generate a demo script
 */
export async function generateDemoScript(
  openai: OpenAI,
  product: string,
  tone: ToneOption
): Promise<string> {
  const toneDescription = getToneDescription(tone);
  
  const [intro, content, outro] = await Promise.all([
    gptPrompt(
      openai,
      `In 1–2 short sentences, write a punchy intro for a demo video featuring "${product}" in a ${toneDescription} tone. Keep it under 30 words.`
    ),
    gptPrompt(
      openai,
      `Write a demo script for "${product}" in a ${toneDescription} tone. It should walk the viewer through how to use it and what it feels like. Keep it between 80-120 words total to fit within a 30-60 second video.`
    ),
    gptPrompt(
      openai,
      `In 1 sentence, write a confident outro that encourages viewers to try "${product}". Keep it under 20 words.`
    )
  ]);

  return formatContent(intro, content, outro);
}

/**
 * Generate a drugstore dupe review
 */
export async function generateDrugstoreDupe(
  openai: OpenAI,
  product: string,
  tone: ToneOption
): Promise<string> {
  const toneDescription = getToneDescription(tone);
  
  const [intro, content, outro] = await Promise.all([
    gptPrompt(
      openai,
      `In 1–2 short sentences, introduce "${product}" as a great drugstore dupe for a high-end product in a ${toneDescription} tone for a 30-60 second video. Keep it under 30 words.`
    ),
    gptPrompt(
      openai,
      `Describe how "${product}" is a great drugstore dupe for a more expensive product in a ${toneDescription} tone. Compare the key ingredients, performance, and results. Keep it between 80-120 words total to fit within a 30-60 second video.`
    ),
    gptPrompt(
      openai,
      `In 1 sentence, encourage readers to try "${product}" and save money. Keep it under 20 words.`
    )
  ]);

  return formatContent(intro, content, outro);
}

/**
 * Generate a personal review
 */
export async function generatePersonalReview(
  openai: OpenAI,
  product: string,
  tone: ToneOption
): Promise<string> {
  const toneDescription = getToneDescription(tone);
  
  const [intro, content, outro] = await Promise.all([
    gptPrompt(
      openai,
      `In 1–2 short sentences, introduce your personal review of "${product}" in a ${toneDescription} tone for a 30-60 second video. Keep it under 20 words.`
    ),
    gptPrompt(
      openai,
      `Write a detailed, authentic-sounding personal review of "${product}" in a ${toneDescription} tone. Include how long it was used, what results were seen, and how it felt during use. Keep it between 80-120 words total to fit within a 30-60 second video.`
    ),
    gptPrompt(
      openai,
      `In 1 sentence, conclude your review and recommend who would benefit from using "${product}". Keep it under 20 words.`
    )
  ]);

  return formatContent(intro, content, outro);
}

/**
 * Generate a "Surprise Me" creative content
 */
export async function generateSurpriseMe(
  openai: OpenAI,
  product: string,
  tone: ToneOption
): Promise<string> {
  const toneDescription = getToneDescription(tone);
  
  const [intro, content, outro] = await Promise.all([
    gptPrompt(
      openai,
      `Write a playful, mysterious intro that teases a surprise piece of content about "${product}" in a ${toneDescription} tone for a 30-60 second video. Keep it under 30 words.`
    ),
    gptPrompt(
      openai,
      `Generate a fun and unexpected piece of skincare content about "${product}" in a ${toneDescription} tone. It could be a weird tip, a story, or a bold claim - surprise the viewer in a positive way. Keep it between 80-120 words total to fit within a 30-60 second video.`
    ),
    gptPrompt(
      openai,
      `End with a quirky or clever outro that makes the viewer smile or want to share the post in a ${toneDescription} tone. Keep it under 20 words.`
    )
  ]);

  return formatContent(intro, content, outro);
}

/**
 * Generate a TikTok trend breakdown
 */
export async function generateTikTokBreakdown(
  openai: OpenAI,
  product: string,
  tone: ToneOption
): Promise<string> {
  const toneDescription = getToneDescription(tone);
  
  const [intro, content, outro] = await Promise.all([
    gptPrompt(
      openai,
      `In 1–2 short sentences, introduce why "${product}" is trending on TikTok in a ${toneDescription} tone for a 30-60 second video. Keep it under 30 words.`
    ),
    gptPrompt(
      openai,
      `Break down why "${product}" is popular on TikTok in a ${toneDescription} tone. Mention key creators, viral claims, and results people are seeing. Keep it between 80-120 words total to fit within a 30-60 second video.`
    ),
    gptPrompt(
      openai,
      `In 1 sentence, encourage viewers to try "${product}" and share their thoughts. Keep it under 20 words.`
    )
  ]);

  return formatContent(intro, content, outro);
}

/**
 * Generate a "dry skin products list"
 */
export async function generateDrySkinList(
  openai: OpenAI,
  product: string,
  tone: ToneOption
): Promise<string> {
  const toneDescription = getToneDescription(tone);
  
  const [intro, content, outro] = await Promise.all([
    gptPrompt(
      openai,
      `In 1–2 short sentences, introduce a list of top skincare products for dry skin including "${product}" in a ${toneDescription} tone for a 30-60 second video. Keep it under 30 words.`
    ),
    gptPrompt(
      openai,
      `List the top 5 skincare products for dry skin, including "${product}", in a ${toneDescription} tone. For each, include the product name and a short benefit in this format:
      
      1. ${product} – Brief description of benefits for dry skin.
      
      Keep the total content between 80-120 words to fit in a 30-60 second video. Ensure you provide exactly 5 products.`
    ),
    gptPrompt(
      openai,
      `In 1 sentence, encourage viewers to try these products and maintain a consistent routine for dry skin. Keep it under 20 words.`
    )
  ]);

  return formatContent(intro, content, outro);
}

/**
 * Generate a "top 5 under $25" list
 */
export async function generateTop5Under25(
  openai: OpenAI,
  product: string,
  tone: ToneOption
): Promise<string> {
  const toneDescription = getToneDescription(tone);
  
  const [intro, content, outro] = await Promise.all([
    gptPrompt(
      openai,
      `In 1–2 short sentences, introduce a list of affordable skincare products under $25 including "${product}" in a ${toneDescription} tone for a 30-60 second video. Keep it under 30 words.`
    ),
    gptPrompt(
      openai,
      `List 5 great skincare products that cost less than $25, including "${product}", in a ${toneDescription} tone. For each, include the product name, approximate price, and a short benefit in this format:
      
      1. ${product} ($XX) – Brief description of benefits.
      
      Keep the total content between 80-120 words to fit in a 30-60 second video. Ensure you provide exactly 5 products.`
    ),
    gptPrompt(
      openai,
      `In 1 sentence, remind viewers that effective skincare doesn't have to be expensive. Keep it under 20 words.`
    )
  ]);

  return formatContent(intro, content, outro);
}

/**
 * Generate an "influencer caption"
 */
export async function generateInfluencerCaption(
  openai: OpenAI,
  product: string,
  tone: ToneOption
): Promise<string> {
  const toneDescription = getToneDescription(tone);
  
  const [intro, content, outro] = await Promise.all([
    gptPrompt(
      openai,
      `In 1–2 short sentences, introduce an influencer-style caption for "${product}" in a ${toneDescription} tone for a 30-60 second video. Keep it under 30 words.`
    ),
    gptPrompt(
      openai,
      `Write a short, punchy influencer-style caption for "${product}" in a ${toneDescription} tone. Include 1-2 emojis and a light call to action. Keep it between 80-120 words total to fit within a 30-60 second video.`
    ),
    gptPrompt(
      openai,
      `In 1 sentence, write a short outro that encourages followers to try "${product}" and engage with the post. Keep it under 20 words.`
    )
  ]);

  return formatContent(intro, content, outro);
}

/**
 * Helper function to generate content using OpenAI
 */
async function gptPrompt(openai: OpenAI, prompt: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { 
          role: "system", 
          content: "You are a skincare content expert specialized in creating engaging, concise video scripts optimized for 30-60 second social media videos."
        },
        { 
          role: "user", 
          content: prompt 
        }
      ],
      temperature: 0.85
    });

    return response.choices[0].message.content?.trim() || "";
  } catch (error: any) {
    console.error("Error calling OpenAI:", error);
    throw new Error(`Failed to generate content: ${error.message}`);
  }
}

/**
 * Get the context about trending products
 */
function getTrendContext(product: string, trendingProducts: TrendingProduct[]): string {
  // Find related trend information
  const productTrend = trendingProducts.find(
    p => p.title.toLowerCase().includes(product.toLowerCase())
  );

  if (!productTrend) return '';

  return `
    Context: This product "${product}" is trending on ${productTrend.source}. 
    This information may be helpful for creating more relevant content.
  `;
}

/**
 * Convert tone options to descriptive prompts
 */
function getToneDescription(tone: ToneOption): string {
  switch (tone) {
    case 'friendly':
      return 'warm, conversational, and approachable';
    case 'professional':
      return 'authoritative, informative, and expert';
    case 'enthusiastic':
      return 'excited, passionate, and energetic';
    case 'minimalist':
      return 'straightforward, concise, and to-the-point';
    default:
      return tone;
  }
}

/**
 * Format the content sections
 */
function formatContent(intro: string, content: string, outro: string): string {
  return `<p><strong>${intro}</strong></p>
  
  <p>${content}</p>
  
  <p><em>${outro}</em></p>`;
}