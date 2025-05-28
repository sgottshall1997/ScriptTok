import OpenAI from "openai";
import Anthropic from '@anthropic-ai/sdk';

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface PlatformContentRequest {
  platform: string;
  contentType: "video" | "photo" | "other";
  product: string;
  niche: string;
  tone: string;
  templateType: string;
  videoDuration?: string;
}

interface PlatformContentResponse {
  platform: string;
  type: "video" | "photo" | "other";
  label: string;
  content?: string;
  script?: string;
  caption?: string;
  hashtags?: string[];
  postInstructions?: string;
}

export class MultiPlatformContentGenerator {
  
  private getPromptForPlatform(request: PlatformContentRequest): string {
    const { platform, contentType, product, niche, tone, videoDuration } = request;
    
    const baseContext = `Product: ${product}\nNiche: ${niche}\nTone: ${tone}`;
    
    if (contentType === "video") {
      const duration = videoDuration || "30";
      switch (platform) {
        case "TikTok":
          return `Create engaging TikTok video content for ${product} in the ${niche} niche. Generate both a video script and caption.
          ${baseContext}
          
          Create a complete ${duration}-second video script that is engaging and viral-worthy:
          
          VIDEO SCRIPT:
          Start: "POV: You discover the skincare product that changes everything..."
          Middle: Explain why ${product} is amazing, show benefits, demonstrate results
          End: Strong call to action encouraging viewers to try it
          
          Write a natural, conversational script that flows smoothly from hook to conclusion. Make it feel authentic and engaging.
          
          CAPTION: Write a separate engaging caption with emojis for the video post
          HASHTAGS: List trending TikTok hashtags`;
          
        case "Instagram":
          return `Create engaging Instagram Reel content for ${product} in the ${niche} niche. Generate both a video script and caption.
          ${baseContext}
          
          Create a complete ${duration}-second Instagram Reel script that is aesthetic and engaging:
          
          VIDEO SCRIPT:
          Start with a visually appealing hook that stops scrolling
          Middle: Show the product beautifully, explain benefits with aesthetic visuals
          End: Encourage saves and shares with clear call to action
          
          Write a natural, flowing script that feels authentic and Instagram-native.
          
          CAPTION: Write a separate engaging caption with emojis for the Instagram post
          HASHTAGS: List relevant Instagram hashtags`;
          
        case "YouTube Shorts":
          return `Create a ${duration}-second YouTube Shorts script for ${product} in the ${niche} niche.
          Focus on educational value, quick tips, and YouTube audience preferences.
          ${baseContext}
          
          Format:
          INTRO: [Hook]
          CONTENT: [Main points]
          OUTRO: [Subscribe CTA]
          HASHTAGS: [YouTube tags]`;
          
        default:
          return `Create a ${duration}-second video script for ${platform} featuring ${product}.
          ${baseContext}
          Include script, visual directions, and relevant hashtags.`;
      }
    }
    
    if (contentType === "photo") {
      switch (platform) {
        case "Instagram":
          return `Create an Instagram photo caption for ${product} in the ${niche} niche.
          Use storytelling, emojis, and a strong call-to-action. Include relevant hashtags.
          ${baseContext}
          
          Format:
          CAPTION: [Main caption with emojis and story]
          CTA: [Clear call to action]
          HASHTAGS: [Instagram hashtags]
          POST INSTRUCTIONS: [Best posting time and strategy]`;
          
        case "Pinterest":
          return `Create a Pinterest pin description for ${product} in the ${niche} niche.
          Focus on SEO keywords, benefits, and Pinterest-specific formatting.
          ${baseContext}
          
          Format:
          TITLE: [SEO-optimized title]
          DESCRIPTION: [Detailed description]
          KEYWORDS: [Pinterest keywords]`;
          
        case "Facebook":
          return `Create a Facebook post for ${product} in the ${niche} niche.
          Use engaging storytelling, community-building language, and encourage comments.
          ${baseContext}
          
          Format:
          POST: [Main content]
          CTA: [Engagement-focused CTA]
          HASHTAGS: [Facebook hashtags]`;
          
        default:
          return `Create a photo post caption for ${platform} featuring ${product}.
          ${baseContext}
          Include engaging copy and relevant hashtags.`;
      }
    }
    
    // "other" content type
    switch (platform) {
      case "X (Twitter)":
        return `Create a Twitter/X post for ${product} in the ${niche} niche.
        Keep under 280 characters, use trending language, and include relevant hashtags.
        ${baseContext}
        
        Format:
        TWEET: [Under 280 characters]
        HASHTAGS: [Twitter hashtags]`;
        
      default:
        return `Create a ${contentType} post for ${platform} featuring ${product}.
        ${baseContext}
        Make it platform-appropriate and engaging.`;
    }
  }
  
  private formatResponse(platform: string, contentType: "video" | "photo" | "other", aiResponse: string, videoDuration?: string): PlatformContentResponse {
    let label: string;
    
    if (contentType === "video") {
      const duration = videoDuration || "30";
      label = `Video Script (${duration} seconds - ${platform})`;
    } else if (contentType === "photo") {
      label = `Photo Content (${platform})`;
    } else {
      label = `${platform} Content`;
    }
    
    // Parse AI response based on content type
    if (contentType === "video") {
      const hashtagsMatch = aiResponse.match(/HASHTAGS?:\s*(.+)/i);
      const captionMatch = aiResponse.match(/CAPTION:\s*([\s\S]*?)(?=HASHTAGS:|$)/i);
      
      // Extract video script (everything before CAPTION or HASHTAGS)
      let scriptContent = aiResponse.replace(/CAPTION:[\s\S]*$/i, '').replace(/HASHTAGS?:\s*.+/i, '').trim();
      
      // Debug logging
      console.log(`[${platform}] AI Response:`, aiResponse);
      console.log(`[${platform}] Extracted Script Content:`, scriptContent);
      console.log(`[${platform}] Script Length:`, scriptContent.length);
      
      // If script is still just "HOOK:" or very short, provide a better fallback
      if (scriptContent === "HOOK:" || scriptContent.length < 20) {
        console.log(`[${platform}] Triggering fallback for short content`);
        scriptContent = `Complete ${videoDuration || '30'}-second video script for ${request.product}:

Hook: "You need to see this ${request.product} transformation!"

Main content: Show the amazing benefits and results of using ${request.product}. Explain why it's perfect for the ${request.niche} niche and how it solves common problems.

Call to action: "Try this for yourself - link in bio!"`;
      }
      
      return {
        platform,
        type: contentType,
        label,
        script: scriptContent,
        caption: captionMatch ? captionMatch[1].trim() : `✨ Amazing ${product} content! Perfect for your ${niche} routine. #${niche}love`,
        hashtags: hashtagsMatch ? hashtagsMatch[1].split(/[,\s]+/).filter(tag => tag.startsWith('#')) : [],
      };
    }
    
    if (contentType === "photo") {
      const captionMatch = aiResponse.match(/CAPTION:\s*([\s\S]*?)(?=CTA:|HASHTAGS:|$)/i);
      const ctaMatch = aiResponse.match(/CTA:\s*(.*?)(?=HASHTAGS:|$)/i);
      const hashtagsMatch = aiResponse.match(/HASHTAGS?:\s*(.+)/i);
      const instructionsMatch = aiResponse.match(/POST INSTRUCTIONS?:\s*(.*?)(?=$)/i);
      
      return {
        platform,
        type: contentType,
        label,
        caption: captionMatch ? captionMatch[1].trim() : aiResponse,
        hashtags: hashtagsMatch ? hashtagsMatch[1].split(/[,\s]+/).filter(tag => tag.startsWith('#')) : [],
        postInstructions: instructionsMatch ? instructionsMatch[1] : "Post during peak engagement hours",
      };
    }
    
    // "other" content type
    const hashtagsMatch = aiResponse.match(/HASHTAGS?:\s*(.+)/i);
    const content = aiResponse.replace(/HASHTAGS?:\s*.+/i, '').trim();
    
    return {
      platform,
      type: contentType,
      label,
      content,
      hashtags: hashtagsMatch ? hashtagsMatch[1].split(/[,\s]+/).filter(tag => tag.startsWith('#')) : [],
    };
  }
  
  async generatePlatformContent(request: PlatformContentRequest): Promise<PlatformContentResponse> {
    const prompt = this.getPromptForPlatform(request);
    
    try {
      // Try OpenAI first
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1000,
        temperature: 0.7,
      });
      
      const aiResponse = response.choices[0].message.content || '';
      return this.formatResponse(request.platform, request.contentType, aiResponse);
      
    } catch (openaiError: any) {
      console.log('OpenAI failed, trying Anthropic:', openaiError.message);
      
      try {
        // Fallback to Anthropic
        const response = await anthropic.messages.create({
          model: "claude-3-7-sonnet-20250219",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        });
        
        const aiResponse = response.content[0].type === 'text' ? response.content[0].text : '';
        return this.formatResponse(request.platform, request.contentType, aiResponse);
        
      } catch (anthropicError: any) {
        console.error('Both AI services failed:', { openaiError: openaiError.message, anthropicError: anthropicError.message });
        throw new Error('AI content generation temporarily unavailable');
      }
    }
  }
  
  async generateMultiPlatformContent(
    platformContentMap: { [platform: string]: "video" | "photo" | "other" },
    baseRequest: Omit<PlatformContentRequest, 'platform' | 'contentType'>
  ): Promise<{ [platform: string]: PlatformContentResponse }> {
    
    const results: { [platform: string]: PlatformContentResponse } = {};
    
    // Generate content for each platform in parallel
    const promises = Object.entries(platformContentMap).map(async ([platform, contentType]) => {
      const request: PlatformContentRequest = {
        ...baseRequest,
        platform,
        contentType,
      };
      
      const result = await this.generatePlatformContent(request);
      // Update the label to include video duration if needed
      if (result.type === "video" && baseRequest.videoDuration) {
        result.label = `Video Script (${baseRequest.videoDuration} seconds - ${platform})`;
      }
      results[platform] = result;
    });
    
    await Promise.all(promises);
    return results;
  }
}

export const multiPlatformGenerator = new MultiPlatformContentGenerator();