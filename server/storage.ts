import {
  User, InsertUser,
  ContentGeneration, InsertContentGeneration,
  TrendingProduct, InsertTrendingProduct,
  ScraperStatus, InsertScraperStatus,
  ApiUsage, InsertApiUsage
} from "@shared/schema";
import { SCRAPER_PLATFORMS, ScraperPlatform, ScraperStatusType } from "@shared/constants";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Content generation operations
  saveContentGeneration(generation: InsertContentGeneration): Promise<ContentGeneration>;
  getContentGenerations(limit?: number): Promise<ContentGeneration[]>;
  getContentGenerationById(id: number): Promise<ContentGeneration | undefined>;
  
  // Trending products operations
  saveTrendingProduct(product: InsertTrendingProduct): Promise<TrendingProduct>;
  getTrendingProducts(limit?: number): Promise<TrendingProduct[]>;
  clearTrendingProducts(): Promise<void>;
  clearTrendingProductsByPlatform(platform: ScraperPlatform): Promise<void>;
  
  // Scraper status operations
  updateScraperStatus(name: ScraperPlatform, status: ScraperStatusType, errorMessage?: string): Promise<ScraperStatus>;
  getScraperStatus(): Promise<ScraperStatus[]>;
  
  // API usage operations
  incrementApiUsage(templateType?: string, tone?: string): Promise<void>;
  getApiUsage(): Promise<ApiUsage[]>;
  getTodayApiUsage(): Promise<number>;
  getWeeklyApiUsage(): Promise<number>;
  getMonthlyApiUsage(): Promise<number>;
  
  // Analytics operations
  getTemplateUsageStats(): Promise<Array<{templateType: string, count: number}>>;
  getToneUsageStats(): Promise<Array<{tone: string, count: number}>>;
  getGenerationTrends(): Promise<Array<{date: string, count: number}>>;
  getPopularProducts(): Promise<Array<{product: string, count: number}>>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private contentGenerations: Map<number, ContentGeneration>;
  private trendingProducts: Map<number, TrendingProduct>;
  private scraperStatuses: Map<string, ScraperStatus>;
  private apiUsage: Map<string, ApiUsage>;
  
  // Analytics tracking maps
  private templateUsage: Map<string, number>;
  private toneUsage: Map<string, number>;
  private productUsage: Map<string, number>;
  
  private userId: number;
  private contentGenerationId: number;
  private trendingProductId: number;
  private scraperStatusId: number;
  private apiUsageId: number;
  
  constructor() {
    this.users = new Map();
    this.contentGenerations = new Map();
    this.trendingProducts = new Map();
    this.scraperStatuses = new Map();
    this.apiUsage = new Map();
    
    // Initialize analytics tracking
    this.templateUsage = new Map();
    this.toneUsage = new Map();
    this.productUsage = new Map();
    
    this.userId = 1;
    this.contentGenerationId = 1;
    this.trendingProductId = 1;
    this.scraperStatusId = 1;
    this.apiUsageId = 1;
    
    // Initialize scraper statuses
    this.initializeScraperStatuses();
    
    // Add initial trending products for demonstration
    this.addInitialTrendingProducts();
  }
  
  private initializeScraperStatuses(): void {
    SCRAPER_PLATFORMS.forEach((platform, index) => {
      // For demonstration purposes, set different statuses
      let statusType: ScraperStatusType = 'active';
      let errorMsg: string | null = null;
      
      // Set TikTok as GPT fallback
      if (platform === 'tiktok') {
        statusType = 'gpt-fallback';
        errorMsg = 'Scraping failed: Rate limit exceeded on TikTok API';
      }
      
      // Set YouTube as error
      if (platform === 'youtube') {
        statusType = 'error';
        errorMsg = 'Scraping and GPT fallback failed: Network timeout';
      }
      
      const status: ScraperStatus = {
        id: this.scraperStatusId++,
        name: platform,
        status: statusType,
        lastCheck: new Date(),
        errorMessage: errorMsg
      };
      this.scraperStatuses.set(platform, status);
    });
  }
  
  private addInitialTrendingProducts(): void {
    const initialProducts = [
      {
        title: "CeraVe Hydrating Cleanser",
        source: "tiktok",
        mentions: 980000,
        sourceUrl: "https://tiktok.com/tag/cerave"
      },
      {
        title: "The Ordinary Niacinamide 10% + Zinc 1%",
        source: "instagram",
        mentions: 840000,
        sourceUrl: "https://instagram.com/explore/tags/theordinary"
      },
      {
        title: "Drunk Elephant C-Firma Fresh Day Serum",
        source: "youtube",
        mentions: 720000,
        sourceUrl: "https://youtube.com/results?search_query=drunk+elephant+serum"
      },
      {
        title: "Summer Fridays Jet Lag Mask",
        source: "reddit",
        mentions: 530000,
        sourceUrl: "https://reddit.com/r/SkincareAddiction"
      },
      {
        title: "Paula's Choice 2% BHA Liquid Exfoliant",
        source: "amazon",
        mentions: 450000,
        sourceUrl: "https://amazon.com/Paulas-Choice-SKIN-PERFECTING-Exfoliant/dp/B00949CTQQ/"
      },
      {
        title: "La Roche-Posay Toleriane Double Repair Face Moisturizer",
        source: "tiktok",
        mentions: 380000,
        sourceUrl: "https://tiktok.com/tag/laroche"
      },
      {
        title: "Glow Recipe Watermelon Glow Niacinamide Dew Drops",
        source: "google-trends",
        mentions: 890000,
        sourceUrl: "https://trends.google.com/trends/explore?q=glow%20recipe"
      }
    ];
    
    initialProducts.forEach(product => {
      const id = this.trendingProductId++;
      const trendingProduct: TrendingProduct = {
        ...product,
        id,
        createdAt: new Date()
      };
      this.trendingProducts.set(id, trendingProduct);
    });
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      user => user.username === username
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Content generation operations
  async saveContentGeneration(insertGeneration: InsertContentGeneration): Promise<ContentGeneration> {
    const id = this.contentGenerationId++;
    const generation: ContentGeneration = { 
      ...insertGeneration, 
      id, 
      createdAt: new Date() 
    };
    
    // Track analytics for template type
    const currentTemplateCount = this.templateUsage.get(generation.templateType) || 0;
    this.templateUsage.set(generation.templateType, currentTemplateCount + 1);
    
    // Track analytics for tone
    const currentToneCount = this.toneUsage.get(generation.tone) || 0;
    this.toneUsage.set(generation.tone, currentToneCount + 1);
    
    // Track analytics for product
    const currentProductCount = this.productUsage.get(generation.product) || 0;
    this.productUsage.set(generation.product, currentProductCount + 1);
    
    this.contentGenerations.set(id, generation);
    return generation;
  }
  
  async getContentGenerations(limit = 10): Promise<ContentGeneration[]> {
    const generations = Array.from(this.contentGenerations.values());
    // Sort by newest first
    generations.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return generations.slice(0, limit);
  }
  
  async getContentGenerationById(id: number): Promise<ContentGeneration | undefined> {
    return this.contentGenerations.get(id);
  }
  
  // Trending products operations
  async saveTrendingProduct(insertProduct: InsertTrendingProduct): Promise<TrendingProduct> {
    const id = this.trendingProductId++;
    const product: TrendingProduct = {
      ...insertProduct,
      id,
      createdAt: new Date(),
      mentions: insertProduct.mentions || null,
      sourceUrl: insertProduct.sourceUrl || null
    };
    this.trendingProducts.set(id, product);
    return product;
  }
  
  async getTrendingProducts(limit = 10): Promise<TrendingProduct[]> {
    const products = Array.from(this.trendingProducts.values());
    // Sort by mentions (if available)
    products.sort((a, b) => {
      if (a.mentions && b.mentions) {
        return b.mentions - a.mentions;
      }
      return 0;
    });
    return products.slice(0, limit);
  }
  
  async clearTrendingProducts(): Promise<void> {
    this.trendingProducts.clear();
  }
  
  async clearTrendingProductsByPlatform(platform: ScraperPlatform): Promise<void> {
    // Filter out products from the specific platform
    const productsToKeep = new Map<number, TrendingProduct>();
    
    this.trendingProducts.forEach((product, id) => {
      if (product.source !== platform) {
        productsToKeep.set(id, product);
      }
    });
    
    // Replace the current map with the filtered map
    this.trendingProducts = productsToKeep;
  }
  
  // Scraper status operations
  async updateScraperStatus(
    name: ScraperPlatform, 
    status: ScraperStatusType, 
    errorMessage?: string
  ): Promise<ScraperStatus> {
    const existingStatus = this.scraperStatuses.get(name);
    
    if (existingStatus) {
      const updatedStatus: ScraperStatus = {
        ...existingStatus,
        status,
        lastCheck: new Date(),
        errorMessage: errorMessage || null
      };
      this.scraperStatuses.set(name, updatedStatus);
      return updatedStatus;
    } else {
      const newStatus: ScraperStatus = {
        id: this.scraperStatusId++,
        name,
        status,
        lastCheck: new Date(),
        errorMessage: errorMessage || null
      };
      this.scraperStatuses.set(name, newStatus);
      return newStatus;
    }
  }
  
  async getScraperStatus(): Promise<ScraperStatus[]> {
    return Array.from(this.scraperStatuses.values());
  }
  
  // API usage operations
  async incrementApiUsage(templateType?: string, tone?: string): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const existingUsage = this.apiUsage.get(today);
    
    if (existingUsage) {
      const updatedUsage: ApiUsage = {
        ...existingUsage,
        count: existingUsage.count + 1
      };
      this.apiUsage.set(today, updatedUsage);
    } else {
      const newUsage: ApiUsage = {
        id: this.apiUsageId++,
        date: new Date(),
        count: 1
      };
      this.apiUsage.set(today, newUsage);
    }
    
    // Track template and tone usage if provided
    if (templateType) {
      const currentTemplateCount = this.templateUsage.get(templateType) || 0;
      this.templateUsage.set(templateType, currentTemplateCount + 1);
    }
    
    if (tone) {
      const currentToneCount = this.toneUsage.get(tone) || 0;
      this.toneUsage.set(tone, currentToneCount + 1);
    }
  }
  
  async getApiUsage(): Promise<ApiUsage[]> {
    return Array.from(this.apiUsage.values());
  }
  
  async getTodayApiUsage(): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    const usage = this.apiUsage.get(today);
    return usage ? usage.count : 0;
  }
  
  async getWeeklyApiUsage(): Promise<number> {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    let total = 0;
    const usageValues = Array.from(this.apiUsage.values());
    for (let i = 0; i < usageValues.length; i++) {
      const usage = usageValues[i];
      if (usage.date >= weekAgo) {
        total += usage.count;
      }
    }
    
    return total;
  }
  
  async getMonthlyApiUsage(): Promise<number> {
    const today = new Date();
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    
    let total = 0;
    const usageValues = Array.from(this.apiUsage.values());
    for (let i = 0; i < usageValues.length; i++) {
      const usage = usageValues[i];
      if (usage.date >= monthAgo) {
        total += usage.count;
      }
    }
    
    return total;
  }
  
  // Analytics operations
  async getTemplateUsageStats(): Promise<Array<{templateType: string, count: number}>> {
    const stats: Array<{templateType: string, count: number}> = [];
    this.templateUsage.forEach((count, templateType) => {
      stats.push({ templateType, count });
    });
    
    // Sort by most used first
    return stats.sort((a, b) => b.count - a.count);
  }
  
  async getToneUsageStats(): Promise<Array<{tone: string, count: number}>> {
    const stats: Array<{tone: string, count: number}> = [];
    this.toneUsage.forEach((count, tone) => {
      stats.push({ tone, count });
    });
    
    // Sort by most used first
    return stats.sort((a, b) => b.count - a.count);
  }
  
  async getGenerationTrends(): Promise<Array<{date: string, count: number}>> {
    const last30Days: Array<{date: string, count: number}> = [];
    const today = new Date();
    
    // Create entries for the last 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      const usage = this.apiUsage.get(dateString);
      last30Days.push({
        date: dateString,
        count: usage ? usage.count : 0
      });
    }
    
    // Sort by date ascending
    return last30Days.sort((a, b) => a.date.localeCompare(b.date));
  }
  
  async getPopularProducts(): Promise<Array<{product: string, count: number}>> {
    const stats: Array<{product: string, count: number}> = [];
    this.productUsage.forEach((count, product) => {
      stats.push({ product, count });
    });
    
    // Return top 10 products
    return stats.sort((a, b) => b.count - a.count).slice(0, 10);
  }
}

// Export a single instance of the storage
export const storage = new MemStorage();
