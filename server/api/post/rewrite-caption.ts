import type { Request, Response } from "express";
import OpenAI from "openai";
import Anthropic from '@anthropic-ai/sdk';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025

export async function rewriteCaption(req: Request, res: Response) {
  try {
    const { originalCaption, tone, templateType } = req.body;

    if (!originalCaption || (!tone && !templateType)) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: originalCaption and either tone or templateType"
      });
    }

    // Define tone-specific prompts
    const tonePrompts = {
      funny: "Rewrite this caption to be funny and humorous. Add witty remarks, puns, or light-hearted jokes while keeping the core message intact.",
      serious: "Rewrite this caption to be professional and serious. Use formal language and focus on the key benefits and facts.",
      clickbaity: "Rewrite this caption to be clickbait-style. Make it attention-grabbing with compelling hooks and urgent language that makes people want to engage.",
      genZ: "Rewrite this caption in Gen Z style. Use modern slang, casual language, and trending expressions that resonate with younger audiences."
    };

    // Define template-specific prompts
    const templatePrompts = {
      question_hook: "Rewrite this caption to start with an engaging question that hooks the reader and makes them want to learn more.",
      storytelling: "Rewrite this caption in storytelling format. Create a narrative that connects emotionally with the reader.",
      before_after: "Rewrite this caption to emphasize transformation and results. Focus on the before/after benefits of the product.",
      testimonial_review: "Rewrite this caption in testimonial/review style. Make it sound like a genuine personal recommendation from someone who loves the product."
    };

    let selectedPrompt = '';
    let method = '';

    if (templateType) {
      selectedPrompt = templatePrompts[templateType as keyof typeof templatePrompts];
      method = templateType;
      if (!selectedPrompt) {
        return res.status(400).json({
          success: false,
          error: "Invalid template type. Must be one of: question_hook, storytelling, before_after, testimonial_review"
        });
      }
    } else if (tone) {
      selectedPrompt = tonePrompts[tone as keyof typeof tonePrompts];
      method = tone;
      if (!selectedPrompt) {
        return res.status(400).json({
          success: false,
          error: "Invalid tone. Must be one of: funny, serious, clickbaity, genZ"
        });
      }
    }

    const systemPrompt = `${selectedPrompt}

Keep the same length approximately and maintain any important product information or calls to action. Don't add hashtags unless they were in the original.

Original caption: "${originalCaption}"`;

    let rewrittenCaption;

    try {
      // Try OpenAI first
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user", 
            content: "Rewrite this caption with the specified tone:"
          }
        ],
        max_tokens: 500,
        temperature: 0.8
      });

      rewrittenCaption = response.choices[0].message.content?.trim();

    } catch (openaiError) {
      console.log('OpenAI failed, trying Anthropic:', openaiError);
      
      try {
        // Fallback to Anthropic
        const response = await anthropic.messages.create({
          model: "claude-3-7-sonnet-20250219",
          max_tokens: 500,
          messages: [
            {
              role: "user",
              content: systemPrompt + "\n\nRewrite this caption with the specified tone."
            }
          ]
        });

        rewrittenCaption = response.content[0].type === 'text' ? response.content[0].text.trim() : '';

      } catch (anthropicError) {
        console.error('Both AI services failed:', { openaiError, anthropicError });
        return res.status(500).json({
          success: false,
          error: "AI rewriting service temporarily unavailable"
        });
      }
    }

    if (!rewrittenCaption) {
      return res.status(500).json({
        success: false,
        error: "Failed to generate rewritten caption"
      });
    }

    return res.json({
      success: true,
      data: {
        originalCaption,
        rewrittenCaption,
        method,
        tone: tone || null,
        templateType: templateType || null
      }
    });

  } catch (error) {
    console.error('Caption rewrite error:', error);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
}