import React from 'react';
import { TrendingProduct } from '@/lib/types';

// Function to get trending products for a specific niche from our mock data
export function getMockTrendingProducts(niche: string): TrendingProduct[] {
  const mockProducts: Record<string, TrendingProduct[]> = {
    skincare: [
      {
        id: 1001,
        title: "GlowHydrate Hydrating Serum",
        source: "tiktok",
        mentions: 1800000,
        niche: "skincare"
      },
      {
        id: 1002,
        title: "LuminousSkin Vitamin C Boost",
        source: "instagram",
        mentions: 1430000,
        niche: "skincare"
      },
      {
        id: 1003,
        title: "EcoRadiance Vegan Collagen Cream",
        source: "youtube",
        mentions: 950000,
        niche: "skincare"
      }
    ],
    tech: [
      {
        id: 2001,
        title: "Glow Recipe Watermelon Glow Niacinamide Dew Drops",
        source: "tiktok",
        mentions: 1190800,
        niche: "tech"
      },
      {
        id: 2002,
        title: "The Ordinary Niacinamide 10% + Zinc 1%",
        source: "instagram",
        mentions: 750000,
        niche: "tech"
      },
      {
        id: 2003,
        title: "CeraVe Hydrating Facial Cleanser",
        source: "youtube",
        mentions: 500000,
        niche: "tech"
      }
    ],
    fashion: [
      {
        id: 3001,
        title: "Gildan Platinum Men's Crew T-Shirts",
        source: "tiktok",
        mentions: 90000,
        niche: "fashion"
      },
      {
        id: 3002,
        title: "ANRABESS Womens Short Sleeve Henley Tops",
        source: "instagram",
        mentions: 85000,
        niche: "fashion"
      },
      {
        id: 3003,
        title: "ATHMILE Womens Oversized T Shirts",
        source: "youtube",
        mentions: 75000,
        niche: "fashion"
      }
    ],
    home: [
      {
        id: 4001,
        title: "Our Place Always Pan",
        source: "tiktok",
        mentions: 15000,
        niche: "home"
      },
      {
        id: 4002,
        title: "Brooklinen Luxe Core Sheet Set",
        source: "instagram",
        mentions: 12000,
        niche: "home"
      },
      {
        id: 4003,
        title: "Levoit Core 300S Smart Air Purifier",
        source: "youtube",
        mentions: 13000,
        niche: "home"
      }
    ],
    food: [
      {
        id: 5001,
        title: "Instant Pot Duo Crisp + Air Fryer",
        source: "reddit",
        mentions: 1300,
        niche: "food"
      },
      {
        id: 5002,
        title: "Ooni Koda 16 Gas Pizza Oven",
        source: "youtube",
        mentions: 1200,
        niche: "food"
      },
      {
        id: 5003,
        title: "Breville Barista Express Espresso Machine",
        source: "reddit",
        mentions: 1100,
        niche: "food"
      }
    ],
    fitness: [
      {
        id: 6001,
        title: "Lululemon Align Leggings",
        source: "tiktok",
        mentions: 900,
        niche: "fitness"
      },
      {
        id: 6002,
        title: "Theragun PRO",
        source: "instagram",
        mentions: 850,
        niche: "fitness"
      },
      {
        id: 6003,
        title: "Oura Ring Gen 3",
        source: "youtube",
        mentions: 830,
        niche: "fitness"
      }
    ],
    travel: [
      {
        id: 7001,
        title: "Away The Bigger Carry-On",
        source: "instagram",
        mentions: 650,
        niche: "travel"
      },
      {
        id: 7002,
        title: "Bose QuietComfort Earbuds II",
        source: "youtube",
        mentions: 620,
        niche: "travel"
      },
      {
        id: 7003,
        title: "Patagonia Black Hole Duffel Bag",
        source: "reddit",
        mentions: 580,
        niche: "travel"
      }
    ],
    pet: [
      {
        id: 8001,
        title: "Furbo Dog Camera",
        source: "tiktok",
        mentions: 470,
        niche: "pet"
      },
      {
        id: 8002,
        title: "ChomChom Pet Hair Remover",
        source: "amazon",
        mentions: 430,
        niche: "pet"
      },
      {
        id: 8003,
        title: "KONG Classic Dog Toy",
        source: "instagram",
        mentions: 410,
        niche: "pet"
      }
    ]
  };

  return mockProducts[niche] || [];
}

// Export the full data structure for dashboard
export function getMockDashboardData() {
  const niches = ['skincare', 'tech', 'fashion', 'home', 'food', 'fitness', 'travel', 'pet'];
  const result = {
    byNiche: {} as Record<string, TrendingProduct[]>,
    count: 0,
    lastRefresh: new Date().toISOString(),
    nextScheduledRefresh: "Midnight (12:00 AM)"
  };
  
  niches.forEach(niche => {
    const products = getMockTrendingProducts(niche);
    result.byNiche[niche] = products;
    result.count += products.length;
  });
  
  return result;
}