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
          return `Create a ${duration}-second TikTok video script for ${product} in the ${niche} niche. 
          Use trending hooks, viral elements, and engaging storytelling. Include trending hashtags and make it highly shareable.
          Format as a script with clear scene directions and hooks.
          ${baseContext}
          
          Format:
          HOOK: [Opening line]
          SCENE 1: [Description]
          SCENE 2: [Description]
          SCENE 3: [Description]
          CTA: [Call to action]
          HASHTAGS: [List of hashtags]`;
          
        case "Instagram":
          return `Create a ${duration}-second Instagram Reel script for ${product} in the ${niche} niche.
          Focus on aesthetic visuals, engaging storytelling, and Instagram-native content style.
          ${baseContext}
          
          Format:
          HOOK: [Opening line]
          MAIN CONTENT: [Core message]
          VISUAL CUES: [What to show]
          CTA: [Call to action]
          HASHTAGS: [Instagram hashtags]`;
          
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
  
  private formatResponse(platform: string, contentType: "video" | "photo" | "other", aiResponse: string): PlatformContentResponse {
    const label = `${platform} (${contentType === "video" ? "Video Content" : contentType === "photo" ? "Photo Content" : "Text Content"})`;
    
    // Parse AI response based on content type
    if (contentType === "video") {
      const scriptMatch = aiResponse.match(/SCRIPT:|HOOK:|INTRO:[\s\S]*?(?=HASHTAGS:|$)/i);
      const hashtagsMatch = aiResponse.match(/HASHTAGS?:\s*(.+)/i);
      
      return {
        platform,
        type: contentType,
        label,
        script: scriptMatch ? scriptMatch[0] : aiResponse,
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
      results[platform] = result;
    });
    
    await Promise.all(promises);
    return results;
  }
}

export const multiPlatformGenerator = new MultiPlatformContentGenerator();