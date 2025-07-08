import OpenAI from "openai";
import Anthropic from '@anthropic-ai/sdk';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface PlatformContentRequest {
  product: string;
  niche: string;
  platforms: string[];
  contentType: "video" | "photo";
  templateType: string;
  tone: string;
  videoDuration?: string;
  trendingData?: any;
}

interface PlatformSpecificContent {
  videoScript?: string;
  photoDescription?: string;
  socialCaptions: {
    [platform: string]: {
      caption: string;
      postInstructions: string;
    };
  };
}

export async function generatePlatformSpecificContent(
  request: PlatformContentRequest
): Promise<PlatformSpecificContent> {
  const { product, niche, platforms, contentType, templateType, tone, videoDuration, trendingData } = request;

  // Build platform-specific prompt
  const platformPrompt = buildPlatformPrompt(request);

  try {
    // Use GPT-4o for platform-specific content generation
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are a social media content expert specializing in platform-specific content optimization. Generate tailored content for multiple platforms with precise formatting and engagement strategies.

Always respond with valid JSON in this exact format:
{
  "videoScript": "string (only if contentType is video)",
  "photoDescription": "string (only if contentType is photo)", 
  "socialCaptions": {
    "platformName": {
      "caption": "string",
      "postInstructions": "string"
    }
  }
}`
        },
        {
          role: "user",
          content: platformPrompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
      max_tokens: 2000
    });

    const generatedContent = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      videoScript: contentType === "video" ? generatedContent.videoScript : undefined,
      photoDescription: contentType === "photo" ? generatedContent.photoDescription : undefined,
      socialCaptions: generatedContent.socialCaptions || {}
    };

  } catch (error) {
    console.error("Platform content generation error:", error);
    
    // Fallback to Claude if GPT fails
    try {
      const claudeResponse = await anthropic.messages.create({
        model: 'claude-3-7-sonnet-20250219', // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: `${platformPrompt}\n\nRespond with valid JSON only.`
          }
        ],
      });

      const claudeContent = JSON.parse(claudeResponse.content[0].text);
      
      return {
        videoScript: contentType === "video" ? claudeContent.videoScript : undefined,
        photoDescription: contentType === "photo" ? claudeContent.photoDescription : undefined,
        socialCaptions: claudeContent.socialCaptions || {}
      };

    } catch (claudeError) {
      console.error("Claude fallback error:", claudeError);
      
      // Return default structure if all AI fails
      return generateFallbackContent(request);
    }
  }
}

// Platform ID to display name mapping
function getPlatformDisplayName(platformId: string): string {
  const platformMap: { [key: string]: string } = {
    'tiktok': 'TikTok',
    'instagram': 'Instagram', 
    'youtube': 'YouTube Shorts',
    'twitter': 'X (Twitter)',
    'other': 'Other'
  };
  return platformMap[platformId] || platformId;
}

function buildPlatformPrompt(request: PlatformContentRequest): string {
  const { product, niche, platforms, contentType, templateType, tone, videoDuration, trendingData } = request;

  const platformInstructions = {
    "Instagram": {
      video: {
        captionStyle: "Aesthetic, lifestyle-driven language focusing on visuals and routines. Clean CTA with light emoji use.",
        postInstructions: "Post between 6-9 PM, use trending audio, add CTA in caption, create story highlights, tag product location",
        audienceContext: "Lifestyle enthusiasts who value aesthetics and personal branding",
        examplePattern: "Your new skincare shelf essential. ✨ #skincaregoals"
      },
      photo: {
        captionStyle: "Story-style caption emphasizing aesthetic appeal and lifestyle integration with strategic emoji placement",
        postInstructions: "Best posting time: 11 AM-1 PM and 6-9 PM, use carousel for multiple angles, add story highlights",
        audienceContext: "Visual-focused audience seeking lifestyle inspiration",
        examplePattern: "Morning routine upgrade with this game-changer ✨"
      }
    },
    "TikTok": {
      video: {
        captionStyle: "Hook-driven, uses slang, emojis, and short punchy sentences. Encourages trends, humor, or urgency.",
        postInstructions: "Hook in first 3 seconds, use trending sounds, quick cuts, text overlays, post 6-10 PM",
        audienceContext: "Gen Z audience that responds to viral trends, authenticity, and quick entertainment",
        examplePattern: "✨ TikTok made me buy it — again. #acnehack"
      },
      photo: {
        captionStyle: "Viral, conversational tone with trending slang and emojis that sparks immediate engagement",
        postInstructions: "Use carousel format, trending audio for slideshow, text overlays on images",
        audienceContext: "Young, trend-conscious users seeking authentic product recommendations",
        examplePattern: "POV: You found the holy grail product 😍 #fyp"
      }
    },
    "YouTube Shorts": {
      video: {
        captionStyle: "Slightly longer, informative tone that sounds like a voiceover or quick script snippet.",
        postInstructions: "Strong thumbnail, subscribe CTA, vertical format 9:16, end screen with related videos",
        audienceContext: "Viewers seeking educational content and detailed product information",
        examplePattern: "This patch pulls the gunk out *overnight*. Let me show you why it's viral."
      },
      photo: {
        captionStyle: "Educational, informative captions that provide value and encourage subscriptions",
        postInstructions: "Use slideshow format with audio, clear thumbnail text, subscribe reminder",
        audienceContext: "Content seekers who want to learn and discover new products",
        examplePattern: "Here's exactly why dermatologists recommend this specific ingredient"
      }
    },
    "X (Twitter)": {
      video: {
        captionStyle: "Short, punchy, clever. Lean into hot takes, jokes, or bold claims with minimal hashtags.",
        postInstructions: "Tweet during trending times 8-10 AM, retweet for reach, use Twitter polls, engage with replies",
        audienceContext: "Quick-witted audience that appreciates humor, hot takes, and concise insights",
        examplePattern: "Amazon has no business selling skincare this good for $11."
      },
      photo: {
        captionStyle: "Witty, controversial, or bold statements that spark conversation and engagement",
        postInstructions: "Tweet 8-10 AM or 7-9 PM, use alt text for accessibility, retweet with comment",
        audienceContext: "Engagement-focused users who enjoy debates and quick insights",
        examplePattern: "Plot twist: The $12 drugstore buy works better than my $60 serum"
      }
    },
    "Pinterest": {
      video: {
        captionStyle: "Product benefits summary, keyword-rich, seasonal context with search optimization focus",
        postInstructions: "Vertical 9:16 format, text overlay on video, seasonal board placement",
        audienceContext: "Users actively searching for solutions and product recommendations",
        examplePattern: "5 Winter Skincare Must-Haves for Dry Skin Solutions"
      },
      photo: {
        captionStyle: "SEO-optimized, benefit-focused descriptions that help users find solutions",
        postInstructions: "Vertical 2:3 ratio, text overlay on image, seasonal keywords, create themed boards",
        audienceContext: "Goal-oriented users seeking specific solutions and inspiration",
        examplePattern: "DIY Skincare Routine: Budget-Friendly Products That Actually Work"
      }
    },
    "Facebook": {
      video: {
        captionStyle: "Conversational, community-focused with personal storytelling and minimal hashtags",
        postInstructions: "Native video upload, engage in comments, post during peak hours 1-3 PM, use Facebook Groups",
        audienceContext: "Community-oriented users who value detailed discussions and personal experiences",
        examplePattern: "Let me tell you about this product that completely changed my routine..."
      },
      photo: {
        captionStyle: "Community-focused with storytelling approach that encourages meaningful conversations",
        postInstructions: "Upload high-res images, post 1-3 PM, encourage comments, share in relevant groups",
        audienceContext: "Users seeking genuine community connections and detailed product discussions",
        examplePattern: "Has anyone else tried this? I'm curious about your experience because..."
      }
    },
    "Other": {
      video: {
        captionStyle: "Professional, versatile content suitable for blogs, newsletters, or general purpose use",
        postInstructions: "Optimize for readability, include clear call-to-action, focus on value proposition",
        audienceContext: "General audience seeking informative and engaging content about products",
        examplePattern: "Discover why this product is making waves in the industry..."
      },
      photo: {
        captionStyle: "Informative, professional tone perfect for blog posts, articles, or email content",
        postInstructions: "Include descriptive alt text, optimize for SEO, maintain professional formatting",
        audienceContext: "Readers seeking detailed product information and honest recommendations",
        examplePattern: "A comprehensive look at this trending product and what makes it special"
      }
    }
  };

  let prompt = `CRITICAL: You must create UNIQUE, PLATFORM-SPECIFIC captions that are completely independent from each other and from any main content. DO NOT reuse, summarize, or adapt content across platforms.

Product: "${product}" (${niche} niche)
Template Type: ${templateType}
Tone: ${tone}
Target Platforms: ${platforms.join(", ")}`;

  if (contentType === "video" && videoDuration) {
    prompt += `\nVideo Duration: ${videoDuration} seconds`;
  }

  if (trendingData) {
    prompt += `\nTrending Context: ${JSON.stringify(trendingData, null, 2)}`;
  }

  prompt += `\n\n🚨 PLATFORM CAPTION REQUIREMENTS:
Each platform caption must be:
1. ORIGINAL and written from scratch for that specific platform
2. Tailored to that platform's unique audience and engagement style  
3. Different in structure, tone, and approach from other platforms
4. Maximized for that platform's specific algorithm and user behavior

PLATFORM-SPECIFIC GUIDELINES:

`;

  platforms.forEach(platform => {
    const displayName = getPlatformDisplayName(platform);
    const platformData = platformInstructions[displayName as keyof typeof platformInstructions];
    const instructions = platformData?.[contentType] || {
      captionStyle: "Platform-appropriate style for " + contentType,
      postInstructions: "Follow platform best practices",
      audienceContext: "Platform-specific audience",
      examplePattern: "Platform-appropriate example"
    };
    
    prompt += `📱 ${displayName.toUpperCase()} CAPTION:
- Audience: ${instructions.audienceContext}
- Style: ${instructions.captionStyle}
- Example Pattern: "${instructions.examplePattern}"
- Post Strategy: ${instructions.postInstructions}
- REQUIREMENT: Write a completely original caption that feels native to ${displayName}, NOT adapted from other content

`;
  });

  if (contentType === "video") {
    prompt += `\n🎥 VIDEO SCRIPT REQUIREMENTS:
Create a detailed video script optimized for ${videoDuration} seconds that:
- Opens with a platform-appropriate hook (differs by platform audience)
- Highlights key product benefits in engaging way
- Includes clear, compelling call-to-action
- Uses current trending language and phrases
- Sounds natural when spoken aloud`;
  } else {
    prompt += `\n📸 PHOTO DESCRIPTION REQUIREMENTS:
Create a detailed photo description that:
- Describes ideal shot composition for maximum engagement
- Suggests optimal lighting and styling approach
- Recommends props and background that enhance product appeal
- Optimizes visual storytelling for the product showcase`;
  }

  prompt += `\n\n⚠️ FINAL VALIDATION:
- Each platform caption should be 70%+ different from others
- Captions should NOT summarize or reuse the main video script/photo description
- Each caption should feel like it was written by a native user of that platform
- Focus on platform-specific engagement tactics and audience preferences`;

  return prompt;
}

function generateFallbackContent(request: PlatformContentRequest): PlatformSpecificContent {
  const { product, platforms, contentType } = request;
  
  const fallbackCaptions: { [key: string]: { caption: string; postInstructions: string } } = {};
  
  platforms.forEach(platform => {
    fallbackCaptions[platform] = {
      caption: `Check out this amazing ${product}! Perfect for anyone looking to upgrade their lifestyle. #trending #${product.toLowerCase().replace(/\s+/g, '')}`,
      postInstructions: `Post during peak hours for ${platform}, engage with your audience, and use platform-specific features for maximum reach.`
    };
  });

  return {
    videoScript: contentType === "video" ? `Introducing the incredible ${product}! In this video, we'll show you why this product is trending and how it can transform your routine. Don't forget to like and follow for more amazing finds!` : undefined,
    photoDescription: contentType === "photo" ? `High-quality product shot of ${product} with clean background, natural lighting, and lifestyle context to showcase its benefits.` : undefined,
    socialCaptions: fallbackCaptions
  };
}