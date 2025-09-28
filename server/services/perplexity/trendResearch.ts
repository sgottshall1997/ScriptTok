import { Niche } from "@shared/constants";

export interface TrendResearch {
  viralHooks: string[];
  painPoints: string[];
  targetAudience: string;
  socialProof: {
    totalVideos: number;
    topCreators: string[];
  };
  trendingAngles: string[];
  bestTimeToPost: string[];
  trendInsights: {
    popularityScore: number;
    peakTime: string;
    relatedTrends: string[];
  };
}

export interface TrendCompetitorVideo {
  creator: string;
  hook: string;
  structure: string;
  views: string;
  engagement: string;
  whatWorked: string;
  trendElement: string; // What part of the trend they used
}

export async function getTrendResearch(topic: string, niche?: string): Promise<TrendResearch> {
  try {
    const nicheContext = niche && niche !== 'universal' ? ` in ${niche} niche` : '';
    const prompt = `Research the viral trend/topic "${topic}"${nicheContext} on TikTok and social media. Analyze current viral content, audience insights, and successful hooks around this topic. Return ONLY valid JSON with this exact structure:

{
  "viralHooks": ["Hook 1", "Hook 2", "Hook 3"],
  "painPoints": ["Pain point 1", "Pain point 2", "Pain point 3"],
  "targetAudience": "Demographics and psychographics who engage with this trend",
  "socialProof": {
    "totalVideos": 25000,
    "topCreators": ["@creator1", "@creator2", "@creator3"]
  },
  "trendingAngles": ["Angle 1", "Angle 2", "Angle 3"],
  "bestTimeToPost": ["Day/time 1", "Day/time 2"],
  "trendInsights": {
    "popularityScore": 85,
    "peakTime": "Peak popularity period",
    "relatedTrends": ["Related trend 1", "Related trend 2"]
  }
}

Focus on actual data from recent TikTok and social media content about this topic.`;

    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "sonar-pro",
        messages: [
          { role: "system", content: "You are a viral trend research analyst. Return ONLY valid JSON, no markdown formatting." },
          { role: "user", content: prompt }
        ],
        temperature: 0.2,
        max_tokens: 1200,
        search_domain_filter: ["tiktok.com", "instagram.com", "youtube.com"],
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
    console.error('Error fetching trend research:', error);
    
    // Return fallback trend research data
    return getFallbackTrendResearch(topic, niche);
  }
}

export async function getTrendCompetitors(topic: string, niche?: string): Promise<TrendCompetitorVideo[]> {
  try {
    const nicheContext = niche && niche !== 'universal' ? ` in ${niche} niche` : '';
    const prompt = `Find top 5 viral TikTok videos about the trend/topic "${topic}"${nicheContext}. Return ONLY valid JSON array with this exact structure:

[
  {
    "creator": "@username",
    "hook": "Opening hook text",
    "structure": "Content structure pattern",
    "views": "X.XM views",
    "engagement": "XXK likes",
    "whatWorked": "Key success factor",
    "trendElement": "How they used the trend"
  }
]

Focus on videos with highest engagement from the past month that effectively use this trend.`;

    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "sonar-pro",
        messages: [
          { role: "system", content: "You are a viral trend competitor analyst. Return ONLY valid JSON array, no markdown formatting." },
          { role: "user", content: prompt }
        ],
        temperature: 0.2,
        max_tokens: 1000,
        search_domain_filter: ["tiktok.com", "instagram.com", "youtube.com"],
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
    console.error('Error fetching trend competitors:', error);
    
    // Return fallback competitor data
    return getFallbackTrendCompetitors(topic, niche);
  }
}

function getFallbackTrendResearch(topic: string, niche?: string): TrendResearch {
  const nicheContext = niche && niche !== 'universal' ? ` (${niche})` : '';
  
  return {
    viralHooks: [
      `"${topic} is everywhere right now..."`,
      `"Everyone's talking about ${topic} but here's what they're missing..."`,
      `"The ${topic} trend explained in 60 seconds"`
    ],
    painPoints: [
      "Fear of missing out on trends",
      "Not understanding viral concepts",
      "Difficulty creating engaging content"
    ],
    targetAudience: `Young adults aged 18-35 interested in ${topic}${nicheContext}, active on social media, trend-conscious`,
    socialProof: {
      totalVideos: 15000,
      topCreators: ["@trendsetterofficial", "@viralcreator", "@trendhunter"]
    },
    trendingAngles: [
      `Personal experience with ${topic}`,
      `Expert breakdown of ${topic}`,
      `Behind-the-scenes of ${topic}`
    ],
    bestTimeToPost: [
      "Tuesday-Thursday 7-9 PM EST",
      "Friday 6-8 PM EST"
    ],
    trendInsights: {
      popularityScore: 75,
      peakTime: "Currently trending",
      relatedTrends: ["viral content", "trending topics", "social media trends"]
    }
  };
}

function getFallbackTrendCompetitors(topic: string, niche?: string): TrendCompetitorVideo[] {
  return [
    {
      creator: "@trendexpert",
      hook: `"${topic} is taking over TikTok and here's why..."`,
      structure: "Hook → explanation → personal take → call to action",
      views: "2.1M views",
      engagement: "150K likes",
      whatWorked: "Clear explanation with personal perspective",
      trendElement: `Direct discussion of ${topic} with unique angle`
    },
    {
      creator: "@viralcontent",
      hook: `"Everyone's doing ${topic} wrong..."`,
      structure: "Contrarian hook → common mistakes → correct approach",
      views: "1.8M views", 
      engagement: "125K likes",
      whatWorked: "Contrarian approach that sparked discussion",
      trendElement: `Challenged popular ${topic} assumptions`
    }
  ];
}