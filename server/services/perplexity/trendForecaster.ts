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
  // Data source metadata
  dataSource: {
    type: 'api' | 'fallback' | 'mixed';
    apiCallsAttempted: number;
    apiCallsSucceeded: number;
    fallbackCategoriesUsed: string[];
    lastUpdated: string;
    reliability: 'high' | 'medium' | 'low';
  };
}

export async function getTrendForecast(niche: Niche): Promise<TrendForecast> {
  console.log('🔍 Generating comprehensive trend forecast for:', niche);

  if (!process.env.PERPLEXITY_API_KEY) {
    console.log('⚠️ Perplexity API key not found, using fallback data');
    return getFallbackTrends(niche, 'no_api_key');
  }

  try {
    // Use the new retry system with validation and smart fallback
    const trendData = await getTrendForecastWithRetry(niche);
    
    // Final validation to ensure we return complete data
    const validation = validateTrendCompleteness(trendData, niche);
    if (!validation.isComplete) {
      console.log('🔧 Final supplement required for:', niche, {
        missing: validation.missingCategories,
        insufficient: validation.insufficientCategories,
        invalid: validation.invalidTrends.length
      });
      return supplementTrendData(trendData, niche);
    }
    
    console.log('✅ Successfully generated complete trend forecast for:', niche);
    return trendData;
  } catch (error) {
    console.error('❌ Error generating trend forecast:', error);
    console.log('🛡️ Using complete fallback data due to error');
    return getFallbackTrends(niche, 'api_error');
  }
}

function getFallbackTrends(niche: Niche, reason: 'no_api_key' | 'api_error' | 'validation_failure' = 'api_error'): TrendForecast {
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
        },
        { 
          name: "Blue light protection", 
          when: "September 2025", 
          prepNow: "Back-to-school screen time increase",
          products: [
            { name: "Blue Light Blocking Glasses", price: "$25", priceNumeric: 25.00, priceType: "one-time" },
            { name: "Screen Time Skincare Set", price: "$55", priceNumeric: 55.00, priceType: "estimated" }
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
        },
        { 
          name: "Heavy contouring", 
          reason: "Natural beauty trend taking over",
          products: [
            { name: "Heavy Contour Kit", price: "$45", priceNumeric: 45.00, priceType: "estimated" },
            { name: "Full Coverage Foundation", price: "$38", priceNumeric: 38.00, priceType: "one-time" }
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
        },
        { 
          name: "Smart wearables", 
          growth: "+340%", 
          opportunity: "Health tech integration",
          products: [
            { name: "Apple Watch Series 9", price: "$399", priceNumeric: 399.00, priceType: "one-time" },
            { name: "Fitbit Charge 6", price: "$160", priceNumeric: 160.00, priceType: "one-time" }
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
        },
        { 
          name: "5G mobile experiences", 
          when: "Late 2025", 
          prepNow: "Network infrastructure expansion",
          products: [
            { name: "iPhone 16 Pro 5G", price: "$999", priceNumeric: 999.00, priceType: "one-time" },
            { name: "Samsung Galaxy S25 5G", price: "$900", priceNumeric: 900.00, priceType: "one-time" }
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
        },
        { 
          name: "NFT collectibles", 
          reason: "Market speculation cooled",
          products: [
            { name: "Digital Art NFT Collection", price: "$100", priceNumeric: 100.00, priceType: "estimated" }
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
        },
        { 
          name: "Oversized blazers", 
          volume: "92K videos this week", 
          why: "Power dressing revival",
          products: [
            { name: "Zara Oversized Blazer", price: "$89", priceNumeric: 89.00, priceType: "one-time" },
            { name: "& Other Stories Structured Blazer", price: "$129", priceNumeric: 129.00, priceType: "one-time" }
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
        },
        { 
          name: "Y2K revival", 
          growth: "+420%", 
          opportunity: "Nostalgic trend cycle",
          products: [
            { name: "Low-Rise Jeans", price: "$65", priceNumeric: 65.00, priceType: "one-time" },
            { name: "Butterfly Hair Clips Set", price: "$12", priceNumeric: 12.00, priceType: "one-time" }
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
        },
        { 
          name: "Summer maxi dresses", 
          when: "June 2025", 
          prepNow: "Warm weather prep",
          products: [
            { name: "Flowy Floral Maxi Dress", price: "$85", priceNumeric: 85.00, priceType: "one-time" },
            { name: "Boho Sleeveless Maxi Dress", price: "$72", priceNumeric: 72.00, priceType: "one-time" }
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
        },
        { 
          name: "Ultra-tight skinny jeans", 
          reason: "Comfort-focused fashion shift",
          products: [
            { name: "Super Skinny Jeans", price: "$45", priceNumeric: 45.00, priceType: "one-time" }
          ]
        }
      ]
    },
    fitness: {
      hot: [
        { 
          name: "12-3-30 workout", 
          volume: "125K videos this week", 
          why: "Simple effective routine",
          products: [
            { name: "NordicTrack Commercial 1750 Treadmill", price: "$1799", asin: "B08T8KLQY5", priceNumeric: 1799.00, priceType: "one-time" },
            { name: "Sunny Health Incline Treadmill", price: "$699", asin: "B07T8KLQ92", priceNumeric: 699.00, priceType: "one-time" },
            { name: "Fitbit Charge 5 Fitness Tracker", price: "$150", asin: "B09DLSK4R1", priceNumeric: 150.00, priceType: "one-time" }
          ]
        },
        { 
          name: "Protein powder trends", 
          volume: "89K videos this week", 
          why: "Post-workout nutrition focus",
          products: [
            { name: "Optimum Nutrition Gold Standard Whey", price: "$58", asin: "B000QSNYGI", priceNumeric: 58.00, priceType: "one-time" },
            { name: "Dymatize ISO100 Whey Protein", price: "$65", asin: "B00JG8SF4E", priceNumeric: 65.00, priceType: "one-time" },
            { name: "Orgain Organic Plant Based Protein", price: "$45", asin: "B00J074W94", priceNumeric: 45.00, priceType: "one-time" }
          ]
        },
        { 
          name: "Home gym essentials", 
          volume: "78K videos this week", 
          why: "Convenience fitness trend",
          products: [
            { name: "Bowflex SelectTech 552 Adjustable Dumbbells", price: "$349", asin: "B001ARYU58", priceNumeric: 349.00, priceType: "one-time" },
            { name: "Resistance Bands Set", price: "$25", asin: "B08MVBF8VX", priceNumeric: 25.00, priceType: "one-time" }
          ]
        }
      ],
      rising: [
        { 
          name: "Pilates", 
          growth: "+290%", 
          opportunity: "Mind-body wellness trend",
          products: [
            { name: "AeroPilates Reformer 287", price: "$199", asin: "B0014CWRR8", priceNumeric: 199.00, priceType: "one-time" },
            { name: "Gaiam Essentials Thick Yoga Mat", price: "$35", asin: "B01AUU7IW2", priceNumeric: 35.00, priceType: "one-time" },
            { name: "Pilates Ball Exercise Ball", price: "$15", asin: "B07RGQV8T4", priceNumeric: 15.00, priceType: "one-time" }
          ]
        },
        { 
          name: "Functional fitness", 
          growth: "+310%", 
          opportunity: "Real-world movement patterns",
          products: [
            { name: "TRX ALL-IN-ONE Suspension Trainer", price: "$165", asin: "B018WPXCNU", priceNumeric: 165.00, priceType: "one-time" },
            { name: "Yes4All Kettlebell Set", price: "$80", asin: "B01A7CSSN6", priceNumeric: 80.00, priceType: "one-time" }
          ]
        }
      ],
      upcoming: [
        { 
          name: "Outdoor workouts", 
          when: "Spring 2025", 
          prepNow: "Seasonal fitness prep",
          products: [
            { name: "Nike Free Run 5.0 Running Shoes", price: "$100", asin: "B08N5GQ5K3", priceNumeric: 100.00, priceType: "one-time" },
            { name: "Hydro Flask Water Bottle 32oz", price: "$45", asin: "B077JBQZPX", priceNumeric: 45.00, priceType: "one-time" },
            { name: "Under Armour HeatGear Shirt", price: "$30", asin: "B07MDHQGN8", priceNumeric: 30.00, priceType: "one-time" }
          ]
        },
        { 
          name: "Summer body prep", 
          when: "April 2025", 
          prepNow: "Beach season motivation",
          products: [
            { name: "Abs Stimulator EMS Trainer", price: "$40", asin: "B07VL8T3R5", priceNumeric: 40.00, priceType: "one-time" },
            { name: "Meal Prep Containers Set", price: "$30", asin: "B01GC8GQHK", priceNumeric: 30.00, priceType: "one-time" }
          ]
        }
      ],
      declining: [
        { 
          name: "Extreme challenges", 
          reason: "Safety concerns",
          products: [
            { name: "Extreme Workout Challenge Guide", price: "$25", priceNumeric: 25.00, priceType: "estimated" }
          ]
        },
        { 
          name: "Fad workout equipment", 
          reason: "Proven methods preferred",
          products: [
            { name: "Ab Coaster Exercise Machine", price: "$250", priceNumeric: 250.00, priceType: "estimated" }
          ]
        }
      ]
    },
    food: {
      hot: [
        { 
          name: "Protein coffee", 
          volume: "94K videos this week", 
          why: "Fitness nutrition crossover",
          products: [
            { name: "Vital Proteins Collagen Peptides", price: "$43", asin: "B00K2ND2QM", priceNumeric: 43.00, priceType: "one-time" },
            { name: "Premier Protein Powder Vanilla", price: "$35", asin: "B072JBQ434", priceNumeric: 35.00, priceType: "one-time" },
            { name: "Bulletproof Brain Octane MCT Oil", price: "$30", asin: "B00P8E0QQG", priceNumeric: 30.00, priceType: "one-time" }
          ]
        },
        { 
          name: "Air fryer recipes", 
          volume: "156K videos this week", 
          why: "Healthy convenience cooking",
          products: [
            { name: "COSORI Air Fryer 5.8 Quart", price: "$120", asin: "B07VJBF8Y4", priceNumeric: 120.00, priceType: "one-time" },
            { name: "Ninja Air Fryer AF101", price: "$80", asin: "B07VT23JDM", priceNumeric: 80.00, priceType: "one-time" },
            { name: "Air Fryer Cookbook for Beginners", price: "$12", asin: "B08KJQM7F3", priceNumeric: 12.00, priceType: "one-time" }
          ]
        },
        { 
          name: "Sourdough bread making", 
          volume: "78K videos this week", 
          why: "Artisan home baking revival",
          products: [
            { name: "Lodge Cast Iron Dutch Oven", price: "$60", asin: "B000LEXR0K", priceNumeric: 60.00, priceType: "one-time" },
            { name: "King Arthur Bread Flour", price: "$25", asin: "B07H8KLCQ1", priceNumeric: 25.00, priceType: "one-time" }
          ]
        }
      ],
      rising: [
        { 
          name: "Mediterranean diet", 
          growth: "+340%", 
          opportunity: "Health trend momentum",
          products: [
            { name: "California Olive Ranch Extra Virgin Oil", price: "$15", asin: "B0019GW7S4", priceNumeric: 15.00, priceType: "one-time" },
            { name: "Kirkland Signature Greek Yogurt", price: "$8", asin: "B08LKQP7R3", priceNumeric: 8.00, priceType: "one-time" },
            { name: "Mediterranean Diet Cookbook", price: "$16", asin: "B071SGQJ4D", priceNumeric: 16.00, priceType: "one-time" }
          ]
        },
        { 
          name: "Plant-based proteins", 
          growth: "+380%", 
          opportunity: "Sustainable nutrition trend",
          products: [
            { name: "Beyond Meat Plant-Based Patties", price: "$9", asin: "B07KQBX3R5", priceNumeric: 9.00, priceType: "one-time" },
            { name: "Impossible Burger Plant-Based Meat", price: "$8", asin: "B083QV5H8L", priceNumeric: 8.00, priceType: "one-time" }
          ]
        }
      ],
      upcoming: [
        { 
          name: "Summer smoothies", 
          when: "June 2025", 
          prepNow: "Recipe testing season",
          products: [
            { name: "Vitamix A3500 Ascent Series Blender", price: "$450", asin: "B077HBQZPX", priceNumeric: 450.00, priceType: "one-time" },
            { name: "NutriBullet Pro 900 Series", price: "$100", asin: "B071JVP8G8", priceNumeric: 100.00, priceType: "one-time" },
            { name: "Frozen Fruit Smoothie Mix", price: "$15", asin: "B07RGQV8T4", priceNumeric: 15.00, priceType: "one-time" }
          ]
        },
        { 
          name: "BBQ and grilling", 
          when: "May 2025", 
          prepNow: "Summer prep content",
          products: [
            { name: "Weber Spirit II E-210 Gas Grill", price: "$399", asin: "B01MS19G4G", priceNumeric: 399.00, priceType: "one-time" },
            { name: "ThermoPro TP20 Wireless Meat Thermometer", price: "$60", asin: "B01GE77QT0", priceNumeric: 60.00, priceType: "one-time" }
          ]
        }
      ],
      declining: [
        { 
          name: "Extreme diet trends", 
          reason: "Balanced approach preferred",
          products: [
            { name: "Extreme Diet Plan Book", price: "$20", priceNumeric: 20.00, priceType: "estimated" }
          ]
        },
        { 
          name: "Meal replacement shakes", 
          reason: "Whole foods preferred",
          products: [
            { name: "Generic Meal Replacement Shake", price: "$40", priceNumeric: 40.00, priceType: "estimated" }
          ]
        }
      ]
    },
    travel: {
      hot: [
        { 
          name: "Solo travel safety", 
          volume: "67K videos this week", 
          why: "Independent travel surge",
          products: [
            { name: "Travelon Anti-Theft Classic Crossbody Bag", price: "$65", asin: "B004W8S3YW", priceNumeric: 65.00, priceType: "one-time" },
            { name: "Personal Safety Alarm Keychain", price: "$12", asin: "B07K8SJFTZ", priceNumeric: 12.00, priceType: "one-time" },
            { name: "Portable Door Lock Security Device", price: "$25", asin: "B07QRQZG7H", priceNumeric: 25.00, priceType: "one-time" }
          ]
        },
        { 
          name: "Travel tech essentials", 
          volume: "89K videos this week", 
          why: "Digital nomad lifestyle",
          products: [
            { name: "Anker Portable Charger PowerCore 10000", price: "$25", asin: "B019GJLER8", priceNumeric: 25.00, priceType: "one-time" },
            { name: "Universal Travel Adapter", price: "$20", asin: "B078N47LPL", priceNumeric: 20.00, priceType: "one-time" },
            { name: "Noise Cancelling Headphones", price: "$80", asin: "B08PZHYWJS", priceNumeric: 80.00, priceType: "one-time" }
          ]
        },
        { 
          name: "Travel packing hacks", 
          volume: "78K videos this week", 
          why: "Minimalist travel trend",
          products: [
            { name: "Compression Packing Cubes Set", price: "$30", asin: "B014VBQP9S", priceNumeric: 30.00, priceType: "one-time" },
            { name: "Samsonite Winfield 3 DLX Luggage", price: "$180", asin: "B07DMQX5GY", priceNumeric: 180.00, priceType: "one-time" }
          ]
        }
      ],
      rising: [
        { 
          name: "Sustainable tourism", 
          growth: "+310%", 
          opportunity: "Eco-conscious travel",
          products: [
            { name: "Hydro Flask Reusable Water Bottle", price: "$45", asin: "B077JBQZPX", priceNumeric: 45.00, priceType: "one-time" },
            { name: "Patagonia Black Hole Duffel Bag", price: "$149", asin: "B07D7DN1RQ", priceNumeric: 149.00, priceType: "one-time" },
            { name: "Solar Power Bank Charger", price: "$35", asin: "B07PVGWMTY", priceNumeric: 35.00, priceType: "one-time" }
          ]
        },
        { 
          name: "Digital detox travel", 
          growth: "+280%", 
          opportunity: "Wellness travel trend",
          products: [
            { name: "Moleskine Travel Journal", price: "$25", asin: "B01FDQX1XY", priceNumeric: 25.00, priceType: "one-time" },
            { name: "Offline Travel Maps Book", price: "$20", asin: "B086T7K9ZL", priceNumeric: 20.00, priceType: "one-time" }
          ]
        }
      ],
      upcoming: [
        { 
          name: "Summer Europe", 
          when: "June 2025", 
          prepNow: "Planning content season",
          products: [
            { name: "Rick Steves Europe Through the Back Door", price: "$20", asin: "B08D8WSHPQ", priceNumeric: 20.00, priceType: "one-time" },
            { name: "European Rail Pass Guide", price: "$15", asin: "B01N8U8ML4", priceNumeric: 15.00, priceType: "one-time" },
            { name: "Portable Luggage Scale", price: "$10", asin: "B0146BBEI4", priceNumeric: 10.00, priceType: "one-time" }
          ]
        },
        { 
          name: "Adventure travel gear", 
          when: "Spring 2025", 
          prepNow: "Outdoor season preparation",
          products: [
            { name: "Osprey Atmos AG 65 Backpack", price: "$270", asin: "B01MQ18Q5C", priceNumeric: 270.00, priceType: "one-time" },
            { name: "REI Co-op Merino Wool Travel Socks", price: "$22", asin: "B07H8KLCQ1", priceNumeric: 22.00, priceType: "one-time" }
          ]
        }
      ],
      declining: [
        { 
          name: "Overtourism spots", 
          reason: "Local backlash awareness",
          products: [
            { name: "Mass Tourism Destination Guide", price: "$18", priceNumeric: 18.00, priceType: "estimated" }
          ]
        },
        { 
          name: "All-inclusive resorts", 
          reason: "Authentic experiences preferred",
          products: [
            { name: "Resort Vacation Package", price: "$1200", priceNumeric: 1200.00, priceType: "estimated" }
          ]
        }
      ]
    },
    pet: {
      hot: [
        { 
          name: "Dog training hacks", 
          volume: "156K videos this week", 
          why: "Post-pandemic pet behavior",
          products: [
            { name: "PetSafe Gentle Leader Dog Headcollar", price: "$21", asin: "B00074L4RW", priceNumeric: 21.00, priceType: "one-time" },
            { name: "KONG Classic Dog Toy", price: "$13", asin: "B0002AR0I8", priceNumeric: 13.00, priceType: "one-time" },
            { name: "Zak George's Dog Training Revolution Book", price: "$16", asin: "B01N0TDUG8", priceNumeric: 16.00, priceType: "one-time" }
          ]
        },
        { 
          name: "Pet camera monitors", 
          volume: "89K videos this week", 
          why: "Remote pet monitoring trend",
          products: [
            { name: "Furbo 360° Dog Camera", price: "$210", asin: "B074ZDYRK4", priceNumeric: 210.00, priceType: "one-time" },
            { name: "Wyze Cam Pet Camera", price: "$36", asin: "B076H3SRXG", priceNumeric: 36.00, priceType: "one-time" }
          ]
        },
        { 
          name: "Interactive pet toys", 
          volume: "67K videos this week", 
          why: "Mental stimulation for pets",
          products: [
            { name: "Outward Hound Hide-A-Squirrel Puzzle Toy", price: "$15", asin: "B0719Q89XX", priceNumeric: 15.00, priceType: "one-time" },
            { name: "KONG Wobbler Treat Dispensing Dog Toy", price: "$18", asin: "B003ALMW0M", priceNumeric: 18.00, priceType: "one-time" }
          ]
        }
      ],
      rising: [
        { 
          name: "Pet mental health", 
          growth: "+375%", 
          opportunity: "Wellness for pets trend",
          products: [
            { name: "ThunderShirt Classic Dog Anxiety Jacket", price: "$40", asin: "B0028QS5OY", priceNumeric: 40.00, priceType: "one-time" },
            { name: "Adaptil Calming Collar for Dogs", price: "$25", asin: "B00520EJSA", priceNumeric: 25.00, priceType: "one-time" },
            { name: "Pet Naturals Calming Treats", price: "$17", asin: "B0017JHQT6", priceNumeric: 17.00, priceType: "one-time" }
          ]
        },
        { 
          name: "Smart pet feeders", 
          growth: "+290%", 
          opportunity: "Tech-savvy pet care",
          products: [
            { name: "PETLIBRO Automatic Cat Feeder", price: "$80", asin: "B07TSBB58Z", priceNumeric: 80.00, priceType: "one-time" },
            { name: "SureFeeder Microchip Pet Feeder", price: "$150", asin: "B00O0UIPTY", priceNumeric: 150.00, priceType: "one-time" }
          ]
        }
      ],
      upcoming: [
        { 
          name: "Summer pet care", 
          when: "May 2025", 
          prepNow: "Seasonal pet prep",
          products: [
            { name: "Ruffwear Swamp Cooler Cooling Vest", price: "$90", asin: "B004PVMHG0", priceNumeric: 90.00, priceType: "one-time" },
            { name: "Portable Dog Water Bottle", price: "$12", asin: "B075LMYDBJ", priceNumeric: 12.00, priceType: "one-time" },
            { name: "Pet Safe Paw Balm", price: "$15", asin: "B01N5B3QN4", priceNumeric: 15.00, priceType: "one-time" }
          ]
        },
        { 
          name: "Outdoor adventure gear", 
          when: "Spring 2025", 
          prepNow: "Hiking season preparation",
          products: [
            { name: "Ruffwear Front Range Dog Harness", price: "$40", asin: "B00TU8TCXG", priceNumeric: 40.00, priceType: "one-time" },
            { name: "Kurgo Dog Backpack", price: "$60", asin: "B004AQEHLE", priceNumeric: 60.00, priceType: "one-time" }
          ]
        }
      ],
      declining: [
        { 
          name: "Exotic pet trends", 
          reason: "Responsibility awareness",
          products: [
            { name: "Exotic Pet Care Guide", price: "$25", priceNumeric: 25.00, priceType: "estimated" }
          ]
        },
        { 
          name: "Designer pet clothing", 
          reason: "Practicality over fashion",
          products: [
            { name: "Luxury Pet Designer Outfit", price: "$80", priceNumeric: 80.00, priceType: "estimated" }
          ]
        }
      ]
    }
  };

  const trendData = fallbackData[niche] || fallbackData.beauty;
  
  // Add data source metadata
  return {
    ...trendData,
    dataSource: {
      type: 'fallback',
      apiCallsAttempted: reason === 'no_api_key' ? 0 : 1,
      apiCallsSucceeded: 0,
      fallbackCategoriesUsed: ['hot', 'rising', 'upcoming', 'declining'],
      lastUpdated: new Date().toISOString(),
      reliability: 'low'
    }
  };
}

// Enhanced validation function with strict trend structure and content validation
function validateTrendCompleteness(trends: TrendForecast, niche?: Niche): {
  isComplete: boolean;
  missingCategories: string[];
  insufficientCategories: string[];
  invalidTrends: string[];
  details: Record<string, any>;
} {
  const requiredCategories = ['hot', 'rising', 'upcoming', 'declining'] as const;
  const minTrendsPerCategory = 2;
  
  const missingCategories: string[] = [];
  const insufficientCategories: string[] = [];
  const invalidTrends: string[] = [];
  const details: Record<string, any> = {};

  for (const category of requiredCategories) {
    const categoryData = trends[category];
    details[category] = { count: 0, valid: 0, issues: [] };
    
    if (!categoryData || !Array.isArray(categoryData)) {
      missingCategories.push(category);
      details[category].issues.push('Category missing or not an array');
      continue;
    }

    details[category].count = categoryData.length;

    // Validate each trend in the category
    let validTrendsCount = 0;
    for (let i = 0; i < categoryData.length; i++) {
      const trend = categoryData[i];
      const trendValidation = validateSingleTrend(trend, category);
      
      if (trendValidation.isValid) {
        validTrendsCount++;
      } else {
        invalidTrends.push(`${category}[${i}]: ${trendValidation.issues.join(', ')}`);
        details[category].issues.push(`Trend ${i}: ${trendValidation.issues.join(', ')}`);
      }
    }

    details[category].valid = validTrendsCount;

    // Check if we have enough valid trends
    if (validTrendsCount < minTrendsPerCategory) {
      insufficientCategories.push(category);
    }
  }

  const isComplete = missingCategories.length === 0 && 
                    insufficientCategories.length === 0 && 
                    invalidTrends.length === 0;

  // Enhanced logging
  if (!isComplete) {
    console.log(`🔍 Validation failed for ${niche || 'unknown niche'}:`, {
      missing: missingCategories,
      insufficient: insufficientCategories,
      invalid: invalidTrends.slice(0, 3), // Show first 3 issues
      summary: Object.keys(details).map(cat => 
        `${cat}: ${details[cat].valid}/${details[cat].count} valid`
      ).join(', ')
    });
  } else {
    console.log(`✅ Validation passed for ${niche || 'unknown niche'}: All categories complete`);
  }
  
  return {
    isComplete,
    missingCategories,
    insufficientCategories,
    invalidTrends,
    details
  };
}

// Validate individual trend structure and content
function validateSingleTrend(trend: any, category: string): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Basic structure validation
  if (!trend || typeof trend !== 'object') {
    issues.push('Not a valid object');
    return { isValid: false, issues };
  }

  // Required name field
  if (!trend.name || typeof trend.name !== 'string' || trend.name.trim().length < 3) {
    issues.push('Invalid or missing name');
  }

  // Category-specific field validation
  switch (category) {
    case 'hot':
      if (!trend.volume || !trend.why) {
        issues.push('Missing volume or why fields for hot trend');
      }
      break;
    case 'rising':
      if (!trend.growth || !trend.opportunity) {
        issues.push('Missing growth or opportunity fields for rising trend');
      }
      break;
    case 'upcoming':
      if (!trend.when || !trend.prepNow) {
        issues.push('Missing when or prepNow fields for upcoming trend');
      }
      break;
    case 'declining':
      if (!trend.reason) {
        issues.push('Missing reason field for declining trend');
      }
      break;
  }

  // Products validation
  if (!trend.products || !Array.isArray(trend.products) || trend.products.length === 0) {
    issues.push('Missing or empty products array');
  } else {
    // Validate each product
    const validProducts = trend.products.filter((product: any) => 
      product && 
      typeof product.name === 'string' && 
      product.name.length > 3 &&
      typeof product.price === 'string' &&
      product.price.includes('$') &&
      typeof product.priceNumeric === 'number' &&
      product.priceNumeric > 0
    );

    if (validProducts.length === 0) {
      issues.push('No valid products found');
    } else if (validProducts.length < trend.products.length) {
      issues.push(`${trend.products.length - validProducts.length} invalid products`);
    }
  }

  return {
    isValid: issues.length === 0,
    issues
  };
}

// Enhanced smart supplement function with detailed validation and logging
function supplementTrendData(trends: TrendForecast, niche: Niche): TrendForecast {
  const fallback = getFallbackTrends(niche);
  const validation = validateTrendCompleteness(trends, niche);

  // If data is already complete, return as-is
  if (validation.isComplete) {
    console.log(`✅ Data already complete for ${niche}, no supplementation needed`);
    return trends;
  }

  console.log(`🔧 Supplementing ${niche} data:`, {
    missing: validation.missingCategories,
    insufficient: validation.insufficientCategories,
    invalidCount: validation.invalidTrends.length
  });

  const supplemented = { ...trends };

  // Fill missing categories entirely from fallback
  for (const category of validation.missingCategories) {
    if (fallback[category as keyof TrendForecast]) {
      supplemented[category as keyof TrendForecast] = fallback[category as keyof TrendForecast];
      console.log(`➕ Added complete ${category} category from fallback (${fallback[category as keyof TrendForecast]?.length} trends)`);
    }
  }

  // Supplement insufficient categories with additional fallback data
  for (const category of validation.insufficientCategories) {
    const existing = supplemented[category as keyof TrendForecast] || [];
    const fallbackCategory = fallback[category as keyof TrendForecast] || [];
    const needed = Math.max(2 - existing.length, 0);
    
    if (needed > 0 && fallbackCategory.length > 0) {
      // Add fallback trends that aren't already present (smart name matching)
      const existingNames = existing.map((trend: any) => trend.name?.toLowerCase().trim());
      const additionalTrends = fallbackCategory
        .filter((trend: any) => !existingNames.includes(trend.name?.toLowerCase().trim()))
        .slice(0, needed);
      
      if (additionalTrends.length > 0) {
        supplemented[category as keyof TrendForecast] = [...existing, ...additionalTrends];
        console.log(`➕ Added ${additionalTrends.length} trends to ${category} category (now ${existing.length + additionalTrends.length} total)`);
      }
    }
  }

  // Final validation after supplementation
  const finalValidation = validateTrendCompleteness(supplemented, niche);
  if (finalValidation.isComplete) {
    console.log(`✅ Supplementation successful for ${niche}`);
  } else {
    console.warn(`⚠️ Supplementation incomplete for ${niche}:`, {
      remaining: {
        missing: finalValidation.missingCategories,
        insufficient: finalValidation.insufficientCategories,
        invalid: finalValidation.invalidTrends.length
      }
    });
  }

  // Preserve existing dataSource metadata or create mixed metadata
  const existingDataSource = trends.dataSource;
  const fallbackUsed = validation.missingCategories.concat(validation.insufficientCategories);
  
  return {
    ...supplemented,
    dataSource: existingDataSource ? {
      ...existingDataSource,
      type: 'mixed',
      fallbackCategoriesUsed: fallbackUsed,
      reliability: 'medium'
    } : {
      type: 'mixed',
      apiCallsAttempted: 1,
      apiCallsSucceeded: 1,
      fallbackCategoriesUsed: fallbackUsed,
      lastUpdated: new Date().toISOString(),
      reliability: 'medium'
    }
  };
}

// Enhanced API call with retry and validation logic
async function getTrendForecastWithRetry(niche: Niche): Promise<TrendForecast> {
  const maxRetries = 2;
  let lastError: any = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Trend forecast attempt ${attempt}/${maxRetries} for ${niche}`);
      
      // Try main API call
      const result = await callPerplexityAPI(niche);
      
      if (result && typeof result === 'object') {
        // Validate completeness
        const validation = validateTrendCompleteness(result, niche);
        
        if (validation.isComplete) {
          console.log(`✅ Complete trend data received for ${niche}`);
          return {
            ...result,
            dataSource: {
              type: 'api',
              apiCallsAttempted: attempt,
              apiCallsSucceeded: 1,
              fallbackCategoriesUsed: [],
              lastUpdated: new Date().toISOString(),
              reliability: 'high'
            }
          };
        }
        
        console.log(`⚠️ Incomplete data for ${niche}:`, {
          missing: validation.missingCategories,
          insufficient: validation.insufficientCategories
        });
        
        // If this is our last attempt or we have partial data, supplement it
        if (attempt === maxRetries || validation.missingCategories.length < 2) {
          const supplemented = supplementTrendData(result, niche);
          console.log(`🔧 Supplemented trend data for ${niche}`);
          // supplementTrendData now handles dataSource metadata, just return it
          return supplemented;
        }
        
        // Otherwise, try again with enhanced prompt
        continue;
      }
    } catch (error) {
      console.error(`❌ Trend forecast attempt ${attempt} failed for ${niche}:`, error);
      lastError = error;
    }
  }

  // If all retries failed, use complete fallback data
  console.log(`🛡️ Using complete fallback data for ${niche} after ${maxRetries} attempts`);
  return getFallbackTrends(niche, 'api_error');
}

// Enhanced API calling function with better prompting
async function callPerplexityAPI(niche: Niche): Promise<TrendForecast | null> {
  const enhancedPrompt = `You are a TikTok viral trend expert analyzing ${niche} niche trends. 

CRITICAL REQUIREMENTS:
- You MUST provide exactly 4 categories: hot, rising, upcoming, declining
- Each category MUST contain minimum 2-3 comprehensive trends
- Each trend MUST include relevant product recommendations with pricing
- Your response MUST be valid JSON only, no explanation text

Current niche: ${niche}

For ${niche} trends, provide a complete JSON response with this exact structure:

{
  "hot": [
    {
      "name": "trend name",
      "volume": "X videos this week", 
      "why": "brief explanation",
      "products": [
        {
          "name": "product name",
          "price": "$XX",
          "asin": "B0XXXXXXXX",
          "priceNumeric": XX.XX,
          "priceType": "one-time"
        }
      ]
    }
    // Include 2-3 trends minimum
  ],
  "rising": [
    // Same structure, 2-3 trends minimum
  ],
  "upcoming": [
    // Same structure, 2-3 trends minimum
  ],
  "declining": [
    // Same structure, 2-3 trends minimum
  ]
}

ALL 4 CATEGORIES ARE MANDATORY. If you cannot fill a category, use relevant placeholder trends rather than omitting the category.`;

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          {
            role: 'system',
            content: 'You are a TikTok trend analysis expert. Respond only with valid JSON data, no additional text or explanations.'
          },
          {
            role: 'user',
            content: enhancedPrompt
          }
        ],
        temperature: 0.1,
        max_tokens: 2000,
        top_p: 0.8,
        search_domain_filter: ["tiktok.com", "instagram.com", "amazon.com"],
        return_images: false,
        return_related_questions: false,
        search_recency_filter: 'week',
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content received from Perplexity API');
    }

    // Enhanced JSON parsing with better error handling
    try {
      // Clean the content in case there are markdown code blocks
      const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleanedContent);
      
      // Basic structure validation
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed as TrendForecast;
      } else {
        throw new Error('Invalid JSON structure received');
      }
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      throw new Error(`Failed to parse API response as JSON: ${parseError}`);
    }
  } catch (error) {
    console.error('Perplexity API call failed:', error);
    throw error;
  }
}