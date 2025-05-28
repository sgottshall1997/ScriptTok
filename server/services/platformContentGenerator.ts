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

function buildPlatformPrompt(request: PlatformContentRequest): string {
  const { product, niche, platforms, contentType, templateType, tone, videoDuration, trendingData } = request;

  const platformInstructions = {
    "Instagram": {
      captionStyle: "Engaging with emojis, 2-3 hashtags max in caption, storytelling approach",
      postInstructions: "Use carousel format for product features, add story highlights, tag product location"
    },
    "TikTok": {
      captionStyle: "Short, catchy, trending keywords, 3-5 relevant hashtags",
      postInstructions: "Hook in first 3 seconds, trending sounds, quick cuts, text overlays"
    },
    "YouTube Shorts": {
      captionStyle: "SEO-optimized title, detailed description, 5-8 hashtags",
      postInstructions: "Strong thumbnail, subscribe CTA, vertical format 9:16"
    },
    "Pinterest": {
      captionStyle: "SEO-rich descriptions, keyword-heavy, 3-5 hashtags",
      postInstructions: "Vertical image 2:3 ratio, text overlay on image, seasonal keywords"
    },
    "Facebook": {
      captionStyle: "Conversational, community-focused, minimal hashtags",
      postInstructions: "Native video upload, engage in comments, post during peak hours"
    },
    "X (Twitter)": {
      captionStyle: "Concise, witty, 1-2 hashtags max, thread if needed",
      postInstructions: "Tweet during trending times, retweet for reach, use Twitter polls"
    }
  };

  let prompt = `Generate ${contentType} content for the product "${product}" in the ${niche} niche.

Template Type: ${templateType}
Tone: ${tone}
Target Platforms: ${platforms.join(", ")}`;

  if (contentType === "video" && videoDuration) {
    prompt += `\nVideo Duration: ${videoDuration} seconds`;
  }

  if (trendingData) {
    prompt += `\nTrending Context: ${JSON.stringify(trendingData, null, 2)}`;
  }

  prompt += `\n\nFor each platform, create optimized content following these guidelines:

`;

  platforms.forEach(platform => {
    const instructions = platformInstructions[platform] || {
      captionStyle: "Platform-appropriate style",
      postInstructions: "Follow platform best practices"
    };
    
    prompt += `${platform}:
- Caption Style: ${instructions.captionStyle}
- Post Instructions: ${instructions.postInstructions}

`;
  });

  if (contentType === "video") {
    prompt += `\nInclude a detailed video script optimized for ${videoDuration} seconds that:
- Starts with a strong hook (first 3 seconds)
- Highlights key product benefits
- Includes a clear call-to-action
- Uses trending language and phrases`;
  } else {
    prompt += `\nInclude a detailed photo description that:
- Describes the ideal shot composition
- Suggests lighting and styling
- Recommends props and background
- Optimizes for product showcase`;
  }

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