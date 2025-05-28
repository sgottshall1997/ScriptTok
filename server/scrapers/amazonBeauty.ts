import axios from 'axios';
import * as cheerio from 'cheerio';

interface AmazonProduct {
  niche: string;
  productName: string;
  productUrl: string;
  asin?: string;
}

interface NicheConfig {
  name: string;
  amazonUrl: string;
  fallbackProducts: Array<{
    productName: string;
    productUrl: string;
    asin?: string;
  }>;
}

// Amazon Beauty & Grooming Categories Configuration
const BEAUTY_NICHES: NicheConfig[] = [
  {
    name: "Skincare",
    amazonUrl: "https://www.amazon.com/Best-Sellers-Beauty-Skin-Care/zgbs/beauty/11055981",
    fallbackProducts: [
      {
        productName: "CeraVe Hydrating Facial Cleanser",
        productUrl: "https://www.amazon.com/CeraVe-Hydrating-Facial-Cleanser-Washing/dp/B01MSSDEPK",
        asin: "B01MSSDEPK"
      },
      {
        productName: "The Ordinary Niacinamide 10% + Zinc 1%",
        productUrl: "https://www.amazon.com/Ordinary-Niacinamide-Zinc-Brighten-Blemishes/dp/B06Y2GLD9X",
        asin: "B06Y2GLD9X"
      },
      {
        productName: "Neutrogena Ultra Gentle Daily Cleanser",
        productUrl: "https://www.amazon.com/Neutrogena-Ultra-Gentle-Daily-Cleanser/dp/B00NR1YKD8",
        asin: "B00NR1YKD8"
      },
      {
        productName: "Olay Regenerist Moisturizer Face Cream",
        productUrl: "https://www.amazon.com/Olay-Regenerist-Moisturizer-Firming-Fragrance/dp/B00027DMSI",
        asin: "B00027DMSI"
      }
    ]
  },
  {
    name: "Haircare",
    amazonUrl: "https://www.amazon.com/Best-Sellers-Beauty-Hair-Care/zgbs/beauty/11055981",
    fallbackProducts: [
      {
        productName: "Olaplex No. 3 Hair Perfector",
        productUrl: "https://www.amazon.com/Olaplex-Hair-Perfector-No-3/dp/B00SNM5US4",
        asin: "B00SNM5US4"
      },
      {
        productName: "Moroccanoil Treatment Hair Oil",
        productUrl: "https://www.amazon.com/Moroccanoil-Treatment-3-4-fl-oz/dp/B002H0F38C",
        asin: "B002H0F38C"
      },
      {
        productName: "Pantene Pro-V Daily Moisture Renewal Shampoo",
        productUrl: "https://www.amazon.com/Pantene-Moisture-Renewal-Shampoo-25-4/dp/B004Q8R8LI",
        asin: "B004Q8R8LI"
      },
      {
        productName: "TRESemmé Keratin Smooth Deep Smoothing Mask",
        productUrl: "https://www.amazon.com/TRESemme-Keratin-Smooth-Smoothing-Conditioner/dp/B071G1HZ2Q",
        asin: "B071G1HZ2Q"
      }
    ]
  },
  {
    name: "Makeup",
    amazonUrl: "https://www.amazon.com/Best-Sellers-Beauty-Makeup/zgbs/beauty/11055981",
    fallbackProducts: [
      {
        productName: "Maybelline Instant Age Rewind Concealer",
        productUrl: "https://www.amazon.com/Maybelline-Instant-Rewind-Eraser-Concealer/dp/B004Y9GYES",
        asin: "B004Y9GYES"
      },
      {
        productName: "L'Oreal Paris Voluminous Original Mascara",
        productUrl: "https://www.amazon.com/LOreal-Paris-Voluminous-Original-Mascara/dp/B002R0DG8W",
        asin: "B002R0DG8W"
      },
      {
        productName: "NYX Professional Makeup Epic Ink Liner",
        productUrl: "https://www.amazon.com/NYX-PROFESSIONAL-MAKEUP-Waterproof-Liquid/dp/B01NAGQE3F",
        asin: "B01NAGQE3F"
      },
      {
        productName: "ELF Pure Skin Super Serum",
        productUrl: "https://www.amazon.com/Pure-Skin-Super-Serum/dp/B08MVYF5TF",
        asin: "B08MVYF5TF"
      }
    ]
  },
  {
    name: "Body Care",
    amazonUrl: "https://www.amazon.com/Best-Sellers-Beauty-Body/zgbs/beauty/11055981",
    fallbackProducts: [
      {
        productName: "Bath & Body Works A Thousand Wishes Body Lotion",
        productUrl: "https://www.amazon.com/Bath-Body-Works-Thousand-Wishes/dp/B07MFKGZ8T",
        asin: "B07MFKGZ8T"
      },
      {
        productName: "Jergens Ultra Healing Extra Dry Skin Moisturizer",
        productUrl: "https://www.amazon.com/Jergens-Ultra-Healing-Extra-Moisturizer/dp/B000052YI5",
        asin: "B000052YI5"
      },
      {
        productName: "Dove Deep Moisture Body Wash",
        productUrl: "https://www.amazon.com/Dove-Moisture-Sulfate-Moisturizing-Effectively/dp/B077GJBQZP",
        asin: "B077GJBQZP"
      },
      {
        productName: "Tree Hut Shea Sugar Scrub Moroccan Rose",
        productUrl: "https://www.amazon.com/Tree-Hut-Sugar-Moroccan-Scrub/dp/B01BMTEPRQ",
        asin: "B01BMTEPRQ"
      }
    ]
  },
  {
    name: "Men's Grooming",
    amazonUrl: "https://www.amazon.com/Best-Sellers-Beauty-Mens-Grooming/zgbs/beauty/11055981",
    fallbackProducts: [
      {
        productName: "Cremo Bourbon & Oak Beard Oil",
        productUrl: "https://www.amazon.com/Cremo-Bourbon-Beard-Oil-Ounce/dp/B019OZPXCM",
        asin: "B019OZPXCM"
      },
      {
        productName: "Gillette Fusion5 ProGlide Razors for Men",
        productUrl: "https://www.amazon.com/Gillette-Fusion5-ProGlide-Razors-Handle/dp/B007MXF4XA",
        asin: "B007MXF4XA"
      },
      {
        productName: "Jack Black Turbo Wash Energizing Hair & Body Cleanser",
        productUrl: "https://www.amazon.com/Jack-Black-Turbo-Energizing-Cleanser/dp/B000FKRQTQ",
        asin: "B000FKRQTQ"
      },
      {
        productName: "Baxter of California Clay Pomade",
        productUrl: "https://www.amazon.com/Baxter-California-Clay-Pomade-2oz/dp/B002RJM6LI",
        asin: "B002RJM6LI"
      }
    ]
  },
  {
    name: "K-Beauty",
    amazonUrl: "https://www.amazon.com/Best-Sellers-Beauty-K-Beauty/zgbs/beauty/11055981",
    fallbackProducts: [
      {
        productName: "COSRX Advanced Snail 96 Mucin Power Essence",
        productUrl: "https://www.amazon.com/COSRX-Advanced-Snail-Mucin-Essence/dp/B00PBX3L7K",
        asin: "B00PBX3L7K"
      },
      {
        productName: "Beauty of Joseon Dynasty Cream",
        productUrl: "https://www.amazon.com/Beauty-Joseon-Dynasty-Cream-50ml/dp/B072BHX547",
        asin: "B072BHX547"
      },
      {
        productName: "Innisfree Green Tea Seed Serum",
        productUrl: "https://www.amazon.com/innisfree-Green-Seed-Serum-80ml/dp/B06XBTK9HP",
        asin: "B06XBTK9HP"
      },
      {
        productName: "Etude House SoonJung pH 6.5 Whip Cleanser",
        productUrl: "https://www.amazon.com/ETUDE-HOUSE-SoonJung-Whip-Cleanser/dp/B06X3TGCVG",
        asin: "B06X3TGCVG"
      }
    ]
  },
  {
    name: "Anti-Aging",
    amazonUrl: "https://www.amazon.com/Best-Sellers-Beauty-Anti-Aging/zgbs/beauty/11055981",
    fallbackProducts: [
      {
        productName: "Retinol Serum 2.5% with Hyaluronic Acid",
        productUrl: "https://www.amazon.com/Retinol-Serum-Hyaluronic-Acid-Anti-Aging/dp/B01M4P6T33",
        asin: "B01M4P6T33"
      },
      {
        productName: "Neutrogena Rapid Wrinkle Repair Regenerating Cream",
        productUrl: "https://www.amazon.com/Neutrogena-Rapid-Wrinkle-Regenerating-Cream/dp/B004D2C9E8",
        asin: "B004D2C9E8"
      },
      {
        productName: "RoC Retinol Correxion Deep Wrinkle Night Cream",
        productUrl: "https://www.amazon.com/RoC-Retinol-Correxion-Wrinkle-Cream/dp/B00027DDPG",
        asin: "B00027DDPG"
      },
      {
        productName: "LilyAna Naturals Eye Cream Moisturizer",
        productUrl: "https://www.amazon.com/LilyAna-Naturals-Eye-Cream-Moisturizer/dp/B019S544ZC",
        asin: "B019S544ZC"
      }
    ]
  }
];

/**
 * Scrape Amazon best sellers for a specific beauty niche
 */
async function scrapeAmazonNiche(config: NicheConfig): Promise<AmazonProduct[]> {
  try {
    console.log(`🛒 Scraping Amazon ${config.name} best sellers...`);

    const response = await axios.get(config.amazonUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': 'https://www.amazon.com/',
        'Connection': 'keep-alive',
        'Cache-Control': 'max-age=0',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);
    const products: AmazonProduct[] = [];

    // Try multiple selectors for Amazon best seller products
    const productSelectors = [
      '[data-asin]',
      '.zg-item-immersion',
      '.s-result-item',
      '.sg-col-inner .s-widget-container'
    ];

    for (const selector of productSelectors) {
      const elements = $(selector).slice(0, 6); // Get more than needed to filter

      elements.each((index, element) => {
        if (products.length >= 4) return false; // Stop when we have 4 products

        const $element = $(element);
        
        // Extract product title
        let title = $element.find('h3 a span, .s-title-instructions-style h3 a span, [data-cy="title-recipe-1"] span').first().text().trim();
        if (!title) {
          title = $element.find('h2 a span, .a-link-normal span').first().text().trim();
        }

        // Extract product URL and ASIN
        let productUrl = '';
        let asin = '';
        
        const linkElement = $element.find('h3 a, h2 a, .a-link-normal').first();
        if (linkElement.length) {
          const href = linkElement.attr('href');
          if (href) {
            productUrl = href.startsWith('http') ? href : `https://www.amazon.com${href}`;
            
            // Extract ASIN from URL or data attribute
            const asinMatch = href.match(/\/dp\/([A-Z0-9]{10})/);
            if (asinMatch) {
              asin = asinMatch[1];
            }
          }
        }

        // Also try to get ASIN from data attribute
        if (!asin) {
          asin = $element.attr('data-asin') || '';
        }

        if (title && productUrl && title.length > 10) {
          products.push({
            niche: config.name,
            productName: title.substring(0, 100), // Limit title length
            productUrl,
            asin: asin || undefined
          });
        }
      });

      if (products.length >= 4) break; // Found enough products
    }

    console.log(`✅ Found ${products.length} products for ${config.name}`);
    return products;

  } catch (error) {
    console.error(`❌ Failed to scrape Amazon ${config.name}:`, error);
    return [];
  }
}

/**
 * Get trending Amazon beauty products across all 7 niches
 * Returns exactly 28 products (4 per niche) with fallback support
 */
export async function getTrendingAmazonProducts(): Promise<AmazonProduct[]> {
  console.log('🎯 Starting Amazon beauty product scraping for 7 niches...');
  
  const allProducts: AmazonProduct[] = [];
  
  // Process each niche
  for (const niche of BEAUTY_NICHES) {
    try {
      // Try to scrape real Amazon data first
      let nicheProducts = await scrapeAmazonNiche(niche);
      
      // If we don't have enough products, supplement with fallbacks
      if (nicheProducts.length < 4) {
        console.log(`⚠️ Only found ${nicheProducts.length} products for ${niche.name}, using fallbacks`);
        
        const fallbacksNeeded = 4 - nicheProducts.length;
        const fallbackProducts = niche.fallbackProducts.slice(0, fallbacksNeeded).map(fallback => ({
          niche: niche.name,
          productName: fallback.productName,
          productUrl: fallback.productUrl,
          asin: fallback.asin
        }));
        
        nicheProducts = [...nicheProducts, ...fallbackProducts];
      }
      
      // Ensure exactly 4 products per niche
      const finalProducts = nicheProducts.slice(0, 4);
      allProducts.push(...finalProducts);
      
      console.log(`📝 Added ${finalProducts.length} products for ${niche.name}`);
      
      // Small delay between requests to be respectful
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ Error processing ${niche.name}:`, error);
      
      // Use all fallback products for this niche
      const fallbackProducts = niche.fallbackProducts.map(fallback => ({
        niche: niche.name,
        productName: fallback.productName,
        productUrl: fallback.productUrl,
        asin: fallback.asin
      }));
      
      allProducts.push(...fallbackProducts);
      console.log(`🔄 Used fallback products for ${niche.name}`);
    }
  }
  
  console.log(`🎉 Amazon beauty scraping complete! Total products: ${allProducts.length}`);
  console.log(`📊 Products per niche: ${allProducts.length / 7}`);
  
  return allProducts;
}

/**
 * Get products for a specific niche only
 */
export async function getTrendingAmazonProductsByNiche(nicheName: string): Promise<AmazonProduct[]> {
  const niche = BEAUTY_NICHES.find(n => n.name.toLowerCase() === nicheName.toLowerCase());
  
  if (!niche) {
    console.error(`❌ Unknown niche: ${nicheName}`);
    return [];
  }
  
  let products = await scrapeAmazonNiche(niche);
  
  // Use fallbacks if needed
  if (products.length < 4) {
    const fallbacksNeeded = 4 - products.length;
    const fallbackProducts = niche.fallbackProducts.slice(0, fallbacksNeeded).map(fallback => ({
      niche: niche.name,
      productName: fallback.productName,
      productUrl: fallback.productUrl,
      asin: fallback.asin
    }));
    
    products = [...products, ...fallbackProducts];
  }
  
  return products.slice(0, 4);
}