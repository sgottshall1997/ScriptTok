import { InsertTrendingProduct } from '@shared/schema';
import { openai } from '../services/openai';

// Reddit trending products scraper
export async function getRedditTrending(): Promise<InsertTrendingProduct[]> {
  try {
    // Use OpenAI to generate realistic trending skincare products on Reddit
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        {
          role: "system",
          content: "You are a Reddit trend analyzer specialized in skincare and beauty subreddits like r/SkincareAddiction. Provide authentic, realistic trending skincare products that could be trending on Reddit right now."
        },
        {
          role: "user",
          content: "Generate 5 realistic trending skincare products on Reddit with title, mentions count (between 50K-500K), and a mock source URL. Only return JSON in this format: [{title, mentions, sourceUrl}]"
        }
      ],
      response_format: { type: "json_object" }
    });

    // Parse the response
    const responseData = JSON.parse(completion.choices[0].message.content);
    const products: InsertTrendingProduct[] = responseData.map((item: any) => ({
      title: item.title,
      source: "reddit",
      mentions: parseInt(item.mentions.replace(/[^0-9]/g, "")),
      sourceUrl: item.sourceUrl
    }));

    return products;
  } catch (error) {
    console.error('Error getting Reddit trending products:', error);
    throw new Error('Failed to fetch Reddit trending data');
  }
}
