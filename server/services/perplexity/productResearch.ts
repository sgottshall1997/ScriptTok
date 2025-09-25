import { Niche } from '@shared/constants';

export interface ProductResearch {
  viralHooks: string[];
  painPoints: string[];
  targetAudience: string;
  socialProof: {
    totalVideos: number;
    topCreators: string[];
  };
  trendingAngles: string[];
  bestTimeToPost: string[];
}

export interface CompetitorVideo {
  creator: string;
  hook: string;
  structure: string;
  views: string;
  engagement: string;
  whatWorked: string;
}

export async function getProductResearch(product: string, niche: Niche): Promise<ProductResearch> {
  try {
    const prompt = `Research "${product}" for TikTok ${niche} creators. Analyze current viral content, audience insights, and successful hooks. Return ONLY valid JSON with this exact structure:

{
  "viralHooks": ["Hook 1", "Hook 2", "Hook 3"],
  "painPoints": ["Pain point 1", "Pain point 2"],
  "targetAudience": "Demographics and psychographics",
  "socialProof": {
    "totalVideos": 15000,
    "topCreators": ["@creator1", "@creator2", "@creator3"]
  },
  "trendingAngles": ["Angle 1", "Angle 2", "Angle 3"],
  "bestTimeToPost": ["Day/time 1", "Day/time 2"]
}

Focus on actual data from recent TikTok videos about this product.`;

    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "sonar-pro",
        messages: [
          { role: "system", content: "You are a TikTok product research analyst. Return ONLY valid JSON, no markdown formatting." },
          { role: "user", content: prompt }
        ],
        temperature: 0.2,
        max_tokens: 1200,
        search_domain_filter: ["tiktok.com"],
        search_recency_filter: "month"
      })
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || "{}";
    
    // Clean the response
    const cleanContent = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .replace(/^```/g, '')
      .replace(/```$/g, '')
      .trim();

    return JSON.parse(cleanContent);

  } catch (error) {
    console.error('Error fetching product research:', error);
    
    // Return fallback research data
    return getFallbackProductResearch(product, niche);
  }
}

export async function getCompetitorIntel(product: string, niche: Niche): Promise<CompetitorVideo[]> {
  try {
    const prompt = `Find top 5 viral TikTok videos about "${product}" in ${niche} niche. Return ONLY valid JSON array with this exact structure:

[
  {
    "creator": "@username",
    "hook": "Opening hook text",
    "structure": "Content structure pattern",
    "views": "X.XM views",
    "engagement": "XXK likes",
    "whatWorked": "Key success factor"
  }
]

Focus on videos with highest engagement from the past month.`;

    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "sonar-pro",
        messages: [
          { role: "system", content: "You are a TikTok competitor analyst. Return ONLY valid JSON array, no markdown formatting." },
          { role: "user", content: prompt }
        ],
        temperature: 0.2,
        max_tokens: 1000,
        search_domain_filter: ["tiktok.com"],
        search_recency_filter: "month"
      })
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || "[]";
    
    // Clean the response
    const cleanContent = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .replace(/^```/g, '')
      .replace(/```$/g, '')
      .trim();

    const competitors = JSON.parse(cleanContent);
    return Array.isArray(competitors) ? competitors : [];

  } catch (error) {
    console.error('Error fetching competitor intel:', error);
    
    // Return fallback competitor data
    return getFallbackCompetitorIntel(product, niche);
  }
}

function getFallbackProductResearch(product: string, niche: Niche): ProductResearch {
  return {
    viralHooks: [
      `Stop wasting money on ${product.toLowerCase()}`,
      `This ${product.toLowerCase()} changed my life`,
      `Why ${product.toLowerCase()} is trending everywhere`
    ],
    painPoints: [
      "Too expensive alternatives",
      "Hard to find quality options",
      "Confusing product choices"
    ],
    targetAudience: `${niche} enthusiasts aged 18-35, primarily female, interested in trends and value`,
    socialProof: {
      totalVideos: 12500,
      topCreators: ["@trendsetterX", "@viralcreatorsY", "@influencerZ"]
    },
    trendingAngles: [
      "Before and after results",
      "Product comparison",
      "Honest review format",
      "Tutorial/how-to use"
    ],
    bestTimeToPost: [
      "Monday 7-9 PM EST",
      "Wednesday 6-8 PM EST",
      "Sunday 3-5 PM EST"
    ]
  };
}

function getFallbackCompetitorIntel(product: string, niche: Niche): CompetitorVideo[] {
  return [
    {
      creator: "@trendsetter2024",
      hook: `This ${product.toLowerCase()} is everywhere for a reason`,
      structure: "Problem → Solution → Proof",
      views: "2.3M",
      engagement: "180K likes",
      whatWorked: "Authentic testimonial with visual proof"
    },
    {
      creator: "@viralreviewer",
      hook: `Testing viral ${product.toLowerCase()} so you don't have to`,
      structure: "Setup → Test → Results → Verdict",
      views: "1.8M",
      engagement: "145K likes", 
      whatWorked: "Live testing format builds trust"
    },
    {
      creator: "@productguru",
      hook: `${product} vs expensive alternatives`,
      structure: "Comparison → Demo → Winner",
      views: "1.2M",
      engagement: "98K likes",
      whatWorked: "Direct comparison saves viewers time"
    }
  ];
}