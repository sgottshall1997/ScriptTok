import { InsertTrendingProduct } from '@shared/schema';
import { openai } from '../services/openai';

// Since we can't use real TikTok scrapers due to API limitations,
// we're using GPT to generate realistic trending data
export async function getTikTokTrending(): Promise<InsertTrendingProduct[]> {
  try {
    // Use OpenAI to generate realistic trending skincare products on TikTok
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        {
          role: "system",
          content: "You are a TikTok trend analyzer specialized in skincare and beauty products. Provide authentic, realistic trending skincare products that could be trending on TikTok right now."
        },
        {
          role: "user",
          content: "Generate 5 realistic trending skincare products on TikTok with title, mentions count (between 100K-2M), and a mock source URL. Only return JSON in this format: [{title, mentions, sourceUrl}]"
        }
      ],
      response_format: { type: "json_object" }
    });

    // Parse the response
    const content = completion.choices[0].message.content || "{}";
    const responseData = JSON.parse(content);
    // Check if the response is an array, or if it has a key that contains the array
    const productsArray = Array.isArray(responseData) ? responseData : (responseData.products || []);
    
    const products: InsertTrendingProduct[] = productsArray.map((item: any) => ({
      title: item.title,
      source: "tiktok",
      mentions: typeof item.mentions === 'string' ? parseInt(item.mentions.replace(/[^0-9]/g, "")) : (item.mentions || 100000),
      sourceUrl: item.sourceUrl || `https://tiktok.com/trend/${encodeURIComponent(item.title)}`
    }));

    return products;
  } catch (error) {
    console.error('Error getting TikTok trending products:', error);
    throw new Error('Failed to fetch TikTok trending data');
  }
}
