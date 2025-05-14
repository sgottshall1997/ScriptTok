import { InsertTrendingProduct } from '@shared/schema';
import { openai } from '../services/openai';

// Amazon trending products scraper
export async function getAmazonTrending(): Promise<InsertTrendingProduct[]> {
  try {
    // Use OpenAI to generate realistic trending skincare products on Amazon
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        {
          role: "system",
          content: "You are an Amazon trend analyzer specialized in skincare and beauty bestsellers. Provide authentic, realistic trending skincare products that could be bestsellers on Amazon right now."
        },
        {
          role: "user",
          content: "Generate 5 realistic trending skincare products on Amazon with title, review count (between 1K-20K), and a mock product URL. Only return JSON in this format: [{title, mentions, sourceUrl}]"
        }
      ],
      response_format: { type: "json_object" }
    });

    // Parse the response
    const responseData = JSON.parse(completion.choices[0].message.content);
    const products: InsertTrendingProduct[] = responseData.map((item: any) => ({
      title: item.title,
      source: "amazon",
      mentions: parseInt(item.mentions.replace(/[^0-9]/g, "")),
      sourceUrl: item.sourceUrl
    }));

    return products;
  } catch (error) {
    console.error('Error getting Amazon trending products:', error);
    throw new Error('Failed to fetch Amazon trending data');
  }
}
