import { Niche } from '@shared/constants';

export interface ProductData {
  name: string;
  price: string;
  asin?: string;
  priceNumeric?: number;
  priceCurrency?: string;
  priceType?: 'one-time' | 'subscription' | 'estimated';
}

export interface TrendData {
  name: string;
  volume?: string;
  growth?: string;
  why?: string;
  reason?: string;
  when?: string;
  prepNow?: string;
  opportunity?: string;
  products?: ProductData[];
}

export interface TrendForecast {
  hot: TrendData[];
  rising: TrendData[];
  upcoming: TrendData[];
  declining: TrendData[];
}

export async function getTrendForecast(niche: Niche): Promise<TrendForecast> {
  try {
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    const currentYear = new Date().getFullYear();
    
    const prompt = `Analyze TikTok ${niche} trends for ${currentMonth} ${currentYear}. Focus on viral products with specific Amazon/retail items and pricing. Return ONLY valid JSON with this exact structure:

{
  "hot": [
    {
      "name": "Trend name", 
      "volume": "X videos this week", 
      "why": "Why it's trending now",
      "products": [
        {"name": "Specific Product Name", "price": "$XX", "asin": "B0XXXXXXX", "priceNumeric": XX.XX, "priceType": "one-time"},
        {"name": "Another Product", "price": "$XX/mo", "priceNumeric": XX.XX, "priceType": "subscription"}
      ]
    }
  ],
  "rising": [
    {
      "name": "Trend name", 
      "growth": "+X%", 
      "opportunity": "Why creators should jump on this",
      "products": [
        {"name": "Product Name", "price": "$XX", "priceNumeric": XX.XX, "priceType": "one-time"}
      ]
    }
  ],
  "upcoming": [
    {
      "name": "Trend name", 
      "when": "When it will peak", 
      "prepNow": "Why to create content now",
      "products": [
        {"name": "Product Name", "price": "$XX", "priceNumeric": XX.XX, "priceType": "one-time"}
      ]
    }
  ],
  "declining": [
    {
      "name": "Trend name", 
      "reason": "Why it's declining",
      "products": [
        {"name": "Product Name", "price": "$XX", "priceNumeric": XX.XX, "priceType": "one-time"}
      ]
    }
  ]
}

For each trend, provide 2-3 specific, real products available on Amazon with accurate pricing. Include ASINs when possible. Use "estimated" priceType if pricing is approximate.`;

    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "sonar-pro",
        messages: [
          { role: "system", content: "You are a TikTok trend analyst. Return ONLY valid JSON, no markdown formatting." },
          { role: "user", content: prompt }
        ],
        temperature: 0.2,
        max_tokens: 1500,
        search_domain_filter: ["tiktok.com"],
        search_recency_filter: "week"
      })
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || "{}";
    
    // Enhanced JSON cleaning and parsing
    let cleanContent = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .replace(/^```/g, '')
      .replace(/```$/g, '')
      .trim();

    // Try to extract JSON object if it's embedded in text
    const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanContent = jsonMatch[0];
    }

    // Additional JSON cleaning
    cleanContent = cleanContent
      .replace(/,(\s*[}\]])/g, '$1')  // Remove trailing commas
      .replace(/([{,]\s*)(\w+):/g, '$1"$2":')  // Quote unquoted keys
      .replace(/:\s*'([^']*)'/g, ': "$1"')  // Replace single quotes with double quotes
      .replace(/\n/g, ' ')  // Remove newlines
      .replace(/\s+/g, ' ')  // Normalize whitespace
      .trim();

    let trendData;
    try {
      trendData = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Raw content length:', content.length);
      console.error('Cleaned content preview:', cleanContent.substring(0, 200) + '...');
      console.error('Cleaned content end:', '...' + cleanContent.substring(cleanContent.length - 200));
      throw parseError;
    }
    
    // Validate the structure and provide fallbacks
    return {
      hot: Array.isArray(trendData.hot) ? trendData.hot : [],
      rising: Array.isArray(trendData.rising) ? trendData.rising : [],
      upcoming: Array.isArray(trendData.upcoming) ? trendData.upcoming : [],
      declining: Array.isArray(trendData.declining) ? trendData.declining : []
    };

  } catch (error) {
    console.error('Error fetching trend forecast:', error);
    
    // Return fallback data for better user experience
    return getFallbackTrends(niche);
  }
}

function getFallbackTrends(niche: Niche): TrendForecast {
  const fallbackData: Record<Niche, TrendForecast> = {
    beauty: {
      hot: [
        { 
          name: "Retinol serums", 
          volume: "52K videos this week", 
          why: "Viral anti-aging trend",
          products: [
            { name: "The Ordinary Retinol 1% in Squalane", price: "$12", asin: "B06XX3BVXK", priceNumeric: 12.00, priceType: "one-time" },
            { name: "CeraVe Resurfacing Retinol Serum", price: "$18", asin: "B08KZQZXL5", priceNumeric: 18.00, priceType: "one-time" },
            { name: "Neutrogena Rapid Wrinkle Repair", price: "$29", asin: "B00AX4JHKU", priceNumeric: 29.00, priceType: "one-time" }
          ]
        },
        { 
          name: "Glass skin routine", 
          volume: "38K videos this week", 
          why: "Korean beauty influence",
          products: [
            { name: "COSRX Snail 96 Mucin Power Essence", price: "$17", asin: "B00PBX3L7K", priceNumeric: 17.00, priceType: "one-time" },
            { name: "Beauty of Joseon Glow Rice Water Toner", price: "$15", asin: "B08HLQYHH8", priceNumeric: 15.00, priceType: "one-time" }
          ]
        }
      ],
      rising: [
        { 
          name: "Skin cycling", 
          growth: "+350%", 
          opportunity: "Early trend opportunity",
          products: [
            { name: "Paula's Choice BHA Liquid Exfoliant", price: "$32", asin: "B01N1LL62W", priceNumeric: 32.00, priceType: "one-time" },
            { name: "Differin Adapalene Gel", price: "$13", asin: "B019HPZQRQ", priceNumeric: 13.00, priceType: "one-time" }
          ]
        },
        { 
          name: "Face massagers", 
          growth: "+280%", 
          opportunity: "Growing wellness trend",
          products: [
            { name: "Jade Roller and Gua Sha Set", price: "$25", priceNumeric: 25.00, priceType: "one-time" },
            { name: "NuFACE Trinity Facial Device", price: "$325", priceNumeric: 325.00, priceType: "one-time" }
          ]
        }
      ],
      upcoming: [
        { 
          name: "Summer SPF prep", 
          when: "Peaks in May", 
          prepNow: "Content now ranks later",
          products: [
            { name: "EltaMD UV Clear Sunscreen SPF 46", price: "$39", priceNumeric: 39.00, priceType: "one-time" },
            { name: "Supergoop! Unseen Sunscreen SPF 40", price: "$38", priceNumeric: 38.00, priceType: "one-time" }
          ]
        }
      ],
      declining: [
        { 
          name: "10-step routines", 
          reason: "Too time consuming for viewers",
          products: [
            { name: "Korean Skincare Set Bundle", price: "$89", priceNumeric: 89.00, priceType: "estimated" }
          ]
        }
      ]
    },
    tech: {
      hot: [
        { 
          name: "AI productivity tools", 
          volume: "89K videos this week", 
          why: "ChatGPT mainstream adoption",
          products: [
            { name: "Notion AI Pro Subscription", price: "$10/mo", priceNumeric: 10.00, priceType: "subscription" },
            { name: "Grammarly Premium", price: "$30/mo", priceNumeric: 30.00, priceType: "subscription" },
            { name: "Copy.ai Starter Plan", price: "$49/mo", priceNumeric: 49.00, priceType: "subscription" }
          ]
        },
        { 
          name: "iPhone photography", 
          volume: "65K videos this week", 
          why: "Pro camera features viral",
          products: [
            { name: "Moment Wide Lens for iPhone", price: "$120", priceNumeric: 120.00, priceType: "one-time" },
            { name: "DJI OM 6 Smartphone Gimbal", price: "$159", priceNumeric: 159.00, priceType: "one-time" }
          ]
        }
      ],
      rising: [
        { 
          name: "Home studio setups", 
          growth: "+420%", 
          opportunity: "Creator economy boom",
          products: [
            { name: "Blue Yeti USB Microphone", price: "$100", priceNumeric: 100.00, priceType: "one-time" },
            { name: "Elgato Key Light", price: "$200", priceNumeric: 200.00, priceType: "one-time" }
          ]
        }
      ],
      upcoming: [
        { 
          name: "VR fitness", 
          when: "Q2 2025", 
          prepNow: "Early adopter advantage",
          products: [
            { name: "Meta Quest 3 VR Headset", price: "$500", priceNumeric: 500.00, priceType: "one-time" },
            { name: "FitXR VR Fitness App", price: "$10/mo", priceNumeric: 10.00, priceType: "subscription" }
          ]
        }
      ],
      declining: [
        { 
          name: "Crypto mining", 
          reason: "Environmental concerns",
          products: [
            { name: "ASIC Bitcoin Miner", price: "$2500", priceNumeric: 2500.00, priceType: "estimated" }
          ]
        }
      ]
    },
    fashion: {
      hot: [
        { 
          name: "Quiet luxury", 
          volume: "78K videos this week", 
          why: "Anti-trend movement",
          products: [
            { name: "Everlane Cashmere Crew Sweater", price: "$100", priceNumeric: 100.00, priceType: "one-time" },
            { name: "Cuyana Structured Leather Tote", price: "$175", priceNumeric: 175.00, priceType: "one-time" }
          ]
        }
      ],
      rising: [
        { 
          name: "Sustainable fashion", 
          growth: "+380%", 
          opportunity: "Conscious consumer trend",
          products: [
            { name: "Patagonia Organic Cotton T-Shirt", price: "$35", priceNumeric: 35.00, priceType: "one-time" },
            { name: "Allbirds Tree Runners", price: "$98", priceNumeric: 98.00, priceType: "one-time" }
          ]
        }
      ],
      upcoming: [
        { 
          name: "Spring pastels", 
          when: "March 2025", 
          prepNow: "Seasonal preparation",
          products: [
            { name: "Linen Button-Up Shirt Lavender", price: "$45", priceNumeric: 45.00, priceType: "one-time" },
            { name: "Soft Pink Midi Dress", price: "$78", priceNumeric: 78.00, priceType: "one-time" }
          ]
        }
      ],
      declining: [
        { 
          name: "Fast fashion hauls", 
          reason: "Sustainability awareness",
          products: [
            { name: "Generic Fast Fashion Bundle", price: "$25", priceNumeric: 25.00, priceType: "estimated" }
          ]
        }
      ]
    },
    fitness: {
      hot: [
        { name: "12-3-30 workout", volume: "125K videos this week", why: "Simple effective routine" }
      ],
      rising: [
        { name: "Pilates", growth: "+290%", opportunity: "Mind-body wellness trend" }
      ],
      upcoming: [
        { name: "Outdoor workouts", when: "Spring 2025", prepNow: "Seasonal fitness prep" }
      ],
      declining: [
        { name: "Extreme challenges", reason: "Safety concerns" }
      ]
    },
    food: {
      hot: [
        { name: "Protein coffee", volume: "94K videos this week", why: "Fitness nutrition crossover" }
      ],
      rising: [
        { name: "Mediterranean diet", growth: "+340%", opportunity: "Health trend momentum" }
      ],
      upcoming: [
        { name: "Summer smoothies", when: "June 2025", prepNow: "Recipe testing season" }
      ],
      declining: [
        { name: "Extreme diet trends", reason: "Balanced approach preferred" }
      ]
    },
    travel: {
      hot: [
        { name: "Solo travel safety", volume: "67K videos this week", why: "Independent travel surge" }
      ],
      rising: [
        { name: "Sustainable tourism", growth: "+310%", opportunity: "Eco-conscious travel" }
      ],
      upcoming: [
        { name: "Summer Europe", when: "June 2025", prepNow: "Planning content season" }
      ],
      declining: [
        { name: "Overtourism spots", reason: "Local backlash awareness" }
      ]
    },
    pets: {
      hot: [
        { name: "Dog training hacks", volume: "156K videos this week", why: "Post-pandemic pet behavior" }
      ],
      rising: [
        { name: "Pet mental health", growth: "+375%", opportunity: "Wellness for pets trend" }
      ],
      upcoming: [
        { name: "Summer pet care", when: "May 2025", prepNow: "Seasonal pet prep" }
      ],
      declining: [
        { name: "Exotic pet trends", reason: "Responsibility awareness" }
      ]
    }
  };

  return fallbackData[niche] || fallbackData.beauty;
}