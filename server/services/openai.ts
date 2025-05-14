import OpenAI from "openai";

// Initialize OpenAI client
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ""
});

// Helper function to check if API key is valid
export async function checkOpenAIApiKey(): Promise<boolean> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key is not set");
      return false;
    }
    
    // Make a small test request
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        { role: "user", content: "Test" }
      ],
      max_tokens: 5
    });
    
    return true;
  } catch (error) {
    console.error("OpenAI API key validation failed:", error);
    return false;
  }
}
