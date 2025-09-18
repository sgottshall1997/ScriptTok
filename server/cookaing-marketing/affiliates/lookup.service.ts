import { storage } from '../../storage.js';
import { AffiliateProduct } from '@shared/schema.js';

export interface ProductLookupParams {
  tags?: string[];
  attributes?: Record<string, any>;
  category?: string;
  priceRange?: { min?: number; max?: number };
  limit?: number;
  contactPreferences?: {
    vegan?: boolean;
    glutenFree?: boolean;
    organic?: boolean;
    budgetFriendly?: boolean;
    [key: string]: any;
  };
}

export interface AmazonPAProduct {
  title: string;
  url: string;
  price: string;
  imageUrl: string;
  rating?: string;
  features?: string[];
}

export class AffiliateLookupService {
  private amazonAccessKey?: string;
  private amazonSecretKey?: string;
  private amazonAssociateTag?: string;

  constructor() {
    // Load Amazon PA API credentials from environment
    this.amazonAccessKey = process.env.AMAZON_ACCESS_KEY;
    this.amazonSecretKey = process.env.AMAZON_SECRET_KEY;
    this.amazonAssociateTag = process.env.AMAZON_ASSOCIATE_TAG;
  }

  async lookupProducts(params: ProductLookupParams): Promise<AffiliateProduct[]> {
    console.log(`🔍 Looking up affiliate products with params:`, params);

    try {
      // Step 1: Query existing affiliate_products by tags/attributes
      const dbProducts = await this.queryDatabaseProducts(params);
      
      if (dbProducts.length > 0) {
        console.log(`✅ Found ${dbProducts.length} products in database`);
        return this.filterByPreferences(dbProducts, params.contactPreferences).slice(0, params.limit || 3);
      }

      // Step 2: If empty and Amazon keys exist, call PA API
      if (this.hasAmazonCredentials()) {
        console.log('📡 Querying Amazon PA API for products...');
        const amazonProducts = await this.queryAmazonPA(params);
        if (amazonProducts.length > 0) {
          // Store products in database for future use
          const storedProducts = await this.storeAmazonProducts(amazonProducts, params);
          return this.filterByPreferences(storedProducts, params.contactPreferences).slice(0, params.limit || 3);
        }
      }

      // Step 3: Fallback to static suggestions
      console.log('🔄 Using static fallback suggestions');
      const staticProducts = this.getStaticSuggestions(params);
      return this.filterByPreferences(staticProducts, params.contactPreferences).slice(0, params.limit || 3);

    } catch (error) {
      console.error('❌ Error in affiliate product lookup:', error);
      // Return static suggestions as last resort
      const staticProducts = this.getStaticSuggestions(params);
      return this.filterByPreferences(staticProducts, params.contactPreferences).slice(0, params.limit || 3);
    }
  }

  private async queryDatabaseProducts(params: ProductLookupParams): Promise<AffiliateProduct[]> {
    try {
      // Get all affiliate products and filter by tags/attributes
      const allProducts = await storage.getAffiliateProducts(100);
      
      return allProducts.filter(product => {
        // Filter by category
        if (params.category) {
          const attributes = product.attributesJson as any || {};
          if (attributes.category && !attributes.category.toLowerCase().includes(params.category.toLowerCase())) {
            return false;
          }
        }

        // Filter by price range
        if (params.priceRange && product.price) {
          const price = parseFloat(product.price);
          if (params.priceRange.min && price < params.priceRange.min) return false;
          if (params.priceRange.max && price > params.priceRange.max) return false;
        }

        // Filter by tags
        if (params.tags && params.tags.length > 0) {
          const attributes = product.attributesJson as any || {};
          const productTags = attributes.tags || [];
          const hasMatchingTag = params.tags.some(tag => 
            productTags.includes(tag) || 
            product.name.toLowerCase().includes(tag.toLowerCase())
          );
          if (!hasMatchingTag) return false;
        }

        return true;
      });
    } catch (error) {
      console.error('❌ Database query error:', error);
      return [];
    }
  }

  private hasAmazonCredentials(): boolean {
    return !!(this.amazonAccessKey && this.amazonSecretKey && this.amazonAssociateTag);
  }

  private async queryAmazonPA(params: ProductLookupParams): Promise<AmazonPAProduct[]> {
    if (!this.hasAmazonCredentials()) {
      console.log('⚠️ Amazon PA API credentials not available');
      return [];
    }

    try {
      // For now, return mock Amazon PA API results
      // In production, this would call the actual Amazon Product Advertising API
      console.log('🔍 Amazon PA API call (mock implementation)');
      
      const mockAmazonProducts: AmazonPAProduct[] = [
        {
          title: "Premium Cast Iron Skillet 12-inch",
          url: `https://www.amazon.com/dp/B000MOCKSKU1?tag=${this.amazonAssociateTag}`,
          price: "39.99",
          imageUrl: "https://via.placeholder.com/300x300?text=Cast+Iron+Skillet",
          rating: "4.5",
          features: ["Pre-seasoned", "Heavy duty", "Oven safe"]
        },
        {
          title: "Organic Coconut Oil Extra Virgin 16oz",
          url: `https://www.amazon.com/dp/B000MOCKSKU2?tag=${this.amazonAssociateTag}`,
          price: "12.99",
          imageUrl: "https://via.placeholder.com/300x300?text=Coconut+Oil",
          rating: "4.7",
          features: ["Organic", "Cold-pressed", "Unrefined"]
        },
        {
          title: "Digital Kitchen Scale with Bowl",
          url: `https://www.amazon.com/dp/B000MOCKSKU3?tag=${this.amazonAssociateTag}`,
          price: "24.99",
          imageUrl: "https://via.placeholder.com/300x300?text=Kitchen+Scale",
          rating: "4.3",
          features: ["Precise measurements", "Removable bowl", "Easy cleanup"]
        }
      ];

      // Filter by category and tags
      return mockAmazonProducts.filter(product => {
        if (params.tags && params.tags.length > 0) {
          return params.tags.some(tag => 
            product.title.toLowerCase().includes(tag.toLowerCase()) ||
            product.features?.some(feature => 
              feature.toLowerCase().includes(tag.toLowerCase())
            )
          );
        }
        return true;
      });

    } catch (error) {
      console.error('❌ Amazon PA API error:', error);
      return [];
    }
  }

  private async storeAmazonProducts(amazonProducts: AmazonPAProduct[], params: ProductLookupParams): Promise<AffiliateProduct[]> {
    const storedProducts: AffiliateProduct[] = [];

    for (const amazonProduct of amazonProducts) {
      try {
        const affiliateProduct = await storage.createAffiliateProduct({
          orgId: 1, // Default org - should be passed as parameter in production
          source: 'amazon',
          sku: `amazon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: amazonProduct.title,
          url: amazonProduct.url,
          price: amazonProduct.price,
          imageUrl: amazonProduct.imageUrl,
          attributesJson: {
            rating: amazonProduct.rating,
            features: amazonProduct.features,
            category: params.category,
            tags: params.tags,
            source: 'amazon_pa_api',
            fetchedAt: new Date().toISOString()
          }
        });
        
        storedProducts.push(affiliateProduct);
        console.log(`✅ Stored Amazon product: ${affiliateProduct.name}`);
      } catch (error) {
        console.error('❌ Error storing Amazon product:', error);
      }
    }

    return storedProducts;
  }

  private getStaticSuggestions(params: ProductLookupParams): AffiliateProduct[] {
    // Static fallback suggestions organized by cooking category
    const staticSuggestions: Partial<AffiliateProduct>[] = [
      {
        id: -1,
        orgId: 1,
        source: 'static',
        sku: 'static_kitchen_basics_001',
        name: 'Professional Chef Knife Set',
        url: 'https://example.com/chef-knife-set',
        price: '89.99',
        imageUrl: 'https://via.placeholder.com/300x300?text=Chef+Knife+Set',
        attributesJson: {
          category: 'kitchen-tools',
          tags: ['knives', 'chef-tools', 'cooking-essentials'],
          rating: '4.6',
          features: ['Professional grade', 'Ergonomic handles', 'Dishwasher safe']
        }
      },
      {
        id: -2,
        orgId: 1,
        source: 'static',
        sku: 'static_cooking_002',
        name: 'Stainless Steel Mixing Bowl Set',
        url: 'https://example.com/mixing-bowls',
        price: '34.99',
        imageUrl: 'https://via.placeholder.com/300x300?text=Mixing+Bowls',
        attributesJson: {
          category: 'kitchen-tools',
          tags: ['bowls', 'mixing', 'baking-essentials'],
          rating: '4.4',
          features: ['Nested storage', 'Non-slip base', 'Easy to clean']
        }
      },
      {
        id: -3,
        orgId: 1,
        source: 'static',
        sku: 'static_organic_003',
        name: 'Organic Spice Collection',
        url: 'https://example.com/spice-collection',
        price: '49.99',
        imageUrl: 'https://via.placeholder.com/300x300?text=Spice+Collection',
        attributesJson: {
          category: 'ingredients',
          tags: ['spices', 'organic', 'seasoning', 'vegan'],
          rating: '4.8',
          features: ['Organic certified', '20 essential spices', 'Airtight containers']
        }
      },
      {
        id: -4,
        orgId: 1,
        source: 'static',
        sku: 'static_baking_004',
        name: 'Silicone Baking Mat Set',
        url: 'https://example.com/baking-mats',
        price: '19.99',
        imageUrl: 'https://via.placeholder.com/300x300?text=Baking+Mats',
        attributesJson: {
          category: 'baking-tools',
          tags: ['baking', 'silicone', 'non-stick'],
          rating: '4.5',
          features: ['Reusable', 'Non-stick surface', 'Easy cleanup']
        }
      }
    ];

    // Filter by category and tags
    const filtered = staticSuggestions.filter(product => {
      const attributes = product.attributesJson as any || {};
      
      // Filter by category
      if (params.category) {
        if (!attributes.category || !attributes.category.includes(params.category)) {
          return false;
        }
      }

      // Filter by tags
      if (params.tags && params.tags.length > 0) {
        const productTags = attributes.tags || [];
        const hasMatchingTag = params.tags.some(tag => 
          productTags.includes(tag) || 
          product.name!.toLowerCase().includes(tag.toLowerCase())
        );
        if (!hasMatchingTag) return false;
      }

      return true;
    });

    return filtered as AffiliateProduct[];
  }

  private filterByPreferences(products: AffiliateProduct[], preferences?: ProductLookupParams['contactPreferences']): AffiliateProduct[] {
    if (!preferences) return products;

    return products.filter(product => {
      const attributes = product.attributesJson as any || {};
      const tags = attributes.tags || [];

      // Filter by dietary preferences
      if (preferences.vegan && !tags.includes('vegan') && !tags.includes('plant-based')) {
        return false;
      }

      if (preferences.glutenFree && !tags.includes('gluten-free')) {
        return false;
      }

      if (preferences.organic && !tags.includes('organic') && !product.name.toLowerCase().includes('organic')) {
        return false;
      }

      // Filter by budget preference
      if (preferences.budgetFriendly && product.price) {
        const price = parseFloat(product.price);
        if (price > 30) return false; // Budget-friendly threshold
      }

      return true;
    });
  }

  // Helper method for campaign artifact enrichment
  async enrichRecipeCard(
    recipeCardData: any,
    contactPreferences?: Record<string, any>
  ): Promise<any> {
    try {
      console.log(`🔄 Enriching recipe card with affiliate products...`);

      // Extract relevant tags from recipe data
      const recipeTags: string[] = [];
      
      if (recipeCardData.ingredients) {
        // Extract ingredient-based tags
        const ingredients = recipeCardData.ingredients.toLowerCase();
        if (ingredients.includes('oil')) recipeTags.push('oil');
        if (ingredients.includes('spice') || ingredients.includes('seasoning')) recipeTags.push('spices');
        if (ingredients.includes('flour')) recipeTags.push('baking');
        if (ingredients.includes('knife') || ingredients.includes('cut')) recipeTags.push('knives');
      }

      if (recipeCardData.cookingMethod) {
        // Extract cooking method tags
        const method = recipeCardData.cookingMethod.toLowerCase();
        if (method.includes('bake')) recipeTags.push('baking');
        if (method.includes('grill')) recipeTags.push('grilling');
        if (method.includes('sauté') || method.includes('pan')) recipeTags.push('cookware');
      }

      // Default to kitchen-tools if no specific tags found
      if (recipeTags.length === 0) {
        recipeTags.push('cooking-essentials', 'kitchen-tools');
      }

      const lookupParams: ProductLookupParams = {
        tags: recipeTags,
        category: 'kitchen',
        limit: 3,
        contactPreferences: contactPreferences || {}
      };

      const affiliateProducts = await this.lookupProducts(lookupParams);

      return {
        ...recipeCardData,
        affiliateProducts: affiliateProducts.map(product => ({
          id: product.id,
          name: product.name,
          url: product.url,
          price: product.price,
          imageUrl: product.imageUrl,
          source: product.source
        }))
      };

    } catch (error) {
      console.error('❌ Error enriching recipe card:', error);
      return recipeCardData; // Return original data if enrichment fails
    }
  }
}

export const affiliateLookupService = new AffiliateLookupService();