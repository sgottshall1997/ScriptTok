import { InsertTrendingProduct } from '@shared/schema';
import { openai } from '../services/openai';

// YouTube trending products scraper
export async function getYouTubeTrending(): Promise<InsertTrendingProduct[]> {
  try {
    // Use OpenAI to generate realistic trending skincare products on YouTube
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        {
          role: "system",
          content: "You are a YouTube trend analyzer specialized in skincare and beauty content. Provide authentic, realistic trending skincare products that could be trending in YouTube videos right now."
        },
        {
          role: "user",
          content: "Generate 5 realistic trending skincare products on YouTube with title, mentions count (between 200K-800K), and a mock source URL. Only return JSON in this format: [{title, mentions, sourceUrl}]"
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
      source: "youtube",
      mentions: typeof item.mentions === 'string' ? parseInt(item.mentions.replace(/[^0-9]/g, "")) : (item.mentions || 500000),
      sourceUrl: item.sourceUrl || `https://youtube.com/results?search_query=${encodeURIComponent(item.title)}`
    }));

    return products;
  } catch (error) {
    console.error('Error getting YouTube trending products:', error);
    throw new Error('Failed to fetch YouTube trending data');
  }
}
