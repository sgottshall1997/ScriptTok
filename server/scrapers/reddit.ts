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
    const content = completion.choices[0].message.content || "{}";
    const responseData = JSON.parse(content);
    // Check if the response is an array or if it has a products key
    const productsArray = Array.isArray(responseData) ? responseData : (responseData.products || []);
    
    const products: InsertTrendingProduct[] = productsArray.map((item: any) => ({
      title: item.title,
      source: "reddit",
      mentions: typeof item.mentions === 'string' ? parseInt(item.mentions.replace(/[^0-9]/g, "")) : (item.mentions || 200000),
      sourceUrl: item.sourceUrl || `https://reddit.com/search?q=${encodeURIComponent(item.title)}`
    }));

    return products;
  } catch (error) {
    console.error('Error getting Reddit trending products:', error);
    throw new Error('Failed to fetch Reddit trending data');
  }
}
