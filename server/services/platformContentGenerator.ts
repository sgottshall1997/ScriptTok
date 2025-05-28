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
      video: {
        captionStyle: "Story-style caption with emojis and line breaks, 2-3 hashtags max, engaging hook",
        postInstructions: "Post between 6-9 PM, use trending audio, add CTA in caption, create story highlights, tag product location"
      },
      photo: {
        captionStyle: "Short story-style caption with emojis, lifestyle context, 3-5 hashtags at end",
        postInstructions: "Best posting time: 11 AM-1 PM and 6-9 PM, use carousel for multiple angles, add story highlights"
      }
    },
    "TikTok": {
      video: {
        captionStyle: "Hook-driven short caption, 3 viral hashtags, trending keywords, mention trending audio",
        postInstructions: "Hook in first 3 seconds, use trending sounds, quick cuts, text overlays, post 6-10 PM"
      },
      photo: {
        captionStyle: "Short catchy caption, 3 viral hashtags, call-to-action",
        postInstructions: "Use carousel format, trending audio for slideshow, text overlays on images"
      }
    },
    "YouTube Shorts": {
      video: {
        captionStyle: "SEO-optimized title + detailed description + 5-8 hashtags",
        postInstructions: "Strong thumbnail, subscribe CTA, vertical format 9:16, end screen with related videos"
      },
      photo: {
        captionStyle: "SEO title + bullet-point description + hashtags",
        postInstructions: "Use slideshow format with audio, clear thumbnail text, subscribe reminder"
      }
    },
    "Pinterest": {
      video: {
        captionStyle: "Product benefits summary, keyword-rich, 3-5 hashtags, seasonal context",
        postInstructions: "Vertical 9:16 format, text overlay on video, seasonal board placement"
      },
      photo: {
        captionStyle: "Product pin summary focusing on benefits, keyword-heavy, seasonal relevance",
        postInstructions: "Vertical 2:3 ratio, text overlay on image, seasonal keywords, create themed boards"
      }
    },
    "Facebook": {
      video: {
        captionStyle: "Conversational tone, community-focused, minimal hashtags, personal story",
        postInstructions: "Native video upload, engage in comments, post during peak hours 1-3 PM, use Facebook Groups"
      },
      photo: {
        captionStyle: "Community-focused caption, storytelling approach, ask questions",
        postInstructions: "Upload high-res images, post 1-3 PM, encourage comments, share in relevant groups"
      }
    },
    "X (Twitter)": {
      video: {
        captionStyle: "Concise tweet, 1-2 hashtags max, witty or informative thread if needed",
        postInstructions: "Tweet during trending times 8-10 AM, retweet for reach, use Twitter polls, engage with replies"
      },
      photo: {
        captionStyle: "Single concise tweet, no line breaks, emojis optional, 1-2 hashtags",
        postInstructions: "Tweet 8-10 AM or 7-9 PM, use alt text for accessibility, retweet with comment"
      }
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
    const platformData = platformInstructions[platform as keyof typeof platformInstructions];
    const instructions = platformData?.[contentType] || {
      captionStyle: "Platform-appropriate style for " + contentType,
      postInstructions: "Follow platform best practices"
    };
    
    prompt += `${platform} (${contentType}):
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