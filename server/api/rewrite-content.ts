import { Request, Response } from 'express';
import { z } from 'zod';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Validation schema for rewrite request
const rewriteSchema = z.object({
  originalContent: z.string().min(1, "Original content is required"),
  contentType: z.enum(["caption", "script"], {
    errorMap: () => ({ message: "Content type must be either 'caption' or 'script'" })
  }),
  newTone: z.enum(["funny", "clickbaity", "serious", "genZ"], {
    errorMap: () => ({ message: "Tone must be one of: funny, clickbaity, serious, genZ" })
  })
});

export async function rewriteContent(req: Request, res: Response) {
  try {
    // Validate request body
    const validation = rewriteSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: validation.error.errors[0].message
      });
    }

    const { originalContent, contentType, newTone } = validation.data;

    // Construct dynamic prompt based on content type
    let prompt = "";
    if (contentType === "caption") {
      prompt = `Rewrite the following **social media caption** in a ${newTone} tone: '${originalContent}'`;
    } else if (contentType === "script") {
      prompt = `Rewrite the following **UGC video script** in a ${newTone} tone. Keep it engaging and format it like a script: '${originalContent}'`;
    }

    // Generate rewritten content using GPT-4
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        {
          role: "system",
          content: `You are an expert content rewriter specializing in social media content. Your task is to rewrite content while maintaining its core message but adapting the tone as requested. For ${newTone} tone:
          
          - funny: Use humor, wordplay, and lighthearted language
          - clickbaity: Create urgency, curiosity gaps, and compelling hooks
          - serious: Use professional, authoritative, and trustworthy language
          - genZ: Use current slang, casual language, and trendy expressions
          
          Keep the same length and maintain the original structure while transforming the tone.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: contentType === "script" ? 600 : 400,
      temperature: 0.8,
    });

    const rewrittenContent = response.choices[0].message.content?.trim();

    if (!rewrittenContent) {
      throw new Error("Failed to generate rewritten content");
    }

    return res.json({
      success: true,
      rewritten: rewrittenContent
    });

  } catch (error: any) {
    console.error('Content rewriting error:', error);
    
    // Handle specific OpenAI errors
    if (error.code === 'insufficient_quota') {
      return res.status(429).json({
        success: false,
        error: "AI service quota exceeded. Please try again later."
      });
    }

    return res.status(500).json({
      success: false,
      error: "Failed to rewrite content. Please try again."
    });
  }
}