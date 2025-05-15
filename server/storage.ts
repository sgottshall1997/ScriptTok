import {
  User, InsertUser,
  ContentGeneration, InsertContentGeneration,
  TrendingProduct, InsertTrendingProduct,
  ScraperStatus, InsertScraperStatus,
  ApiUsage, InsertApiUsage,
  AiModelConfig, InsertAiModelConfig,
  Team, InsertTeam,
  TeamMember, InsertTeamMember,
  ContentOptimization, InsertContentOptimization,
  ContentPerformance, InsertContentPerformance,
  ContentVersion, InsertContentVersion,
  ApiIntegration, InsertApiIntegration,
  users, contentGenerations, trendingProducts, scraperStatus, apiUsage,
  aiModelConfigs, teams, teamMembers, contentOptimizations, 
  contentPerformance, contentVersions, apiIntegrations
} from "@shared/schema";
import { SCRAPER_PLATFORMS, ScraperPlatform, ScraperStatusType, NICHES } from "@shared/constants";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  
  // Teams & User Roles operations
  createTeam(team: InsertTeam): Promise<Team>;
  getTeams(): Promise<Team[]>;
  getTeam(id: number): Promise<Team | undefined>;
  updateTeam(id: number, updates: Partial<InsertTeam>): Promise<Team | undefined>;
  deleteTeam(id: number): Promise<boolean>;
  addTeamMember(teamMember: InsertTeamMember): Promise<TeamMember>;
  removeTeamMember(teamId: number, userId: number): Promise<boolean>;
  getTeamMembers(teamId: number): Promise<TeamMember[]>;
  getUserTeams(userId: number): Promise<Team[]>;
  
  // Content generation operations
  saveContentGeneration(generation: InsertContentGeneration): Promise<ContentGeneration>;
  getContentGenerations(limit?: number): Promise<ContentGeneration[]>;
  getContentGenerationById(id: number): Promise<ContentGeneration | undefined>;
  
  // Content versioning operations
  saveContentVersion(version: InsertContentVersion): Promise<ContentVersion>;
  getContentVersions(contentId: number): Promise<ContentVersion[]>;
  getLatestContentVersion(contentId: number): Promise<ContentVersion | undefined>;
  
  // Content optimization operations
  saveContentOptimization(optimization: InsertContentOptimization): Promise<ContentOptimization>;
  getContentOptimization(contentId: number): Promise<ContentOptimization | undefined>;
  
  // Content performance operations
  saveContentPerformance(performance: InsertContentPerformance): Promise<ContentPerformance>;
  getContentPerformanceById(contentId: number): Promise<ContentPerformance[]>;
  getContentPerformanceByPlatform(platform: string, limit?: number): Promise<ContentPerformance[]>;
  
  // Trending products operations
  saveTrendingProduct(product: InsertTrendingProduct): Promise<TrendingProduct>;
  getTrendingProducts(limit?: number): Promise<TrendingProduct[]>;
  getTrendingProductsByNiche(niche: string, limit?: number): Promise<TrendingProduct[]>;
  clearTrendingProducts(): Promise<void>;
  clearTrendingProductsByPlatform(platform: ScraperPlatform): Promise<void>;
  clearTrendingProductsByNiche(niche: string): Promise<void>;
  
  // Scraper status operations
  updateScraperStatus(name: ScraperPlatform, status: ScraperStatusType, errorMessage?: string): Promise<ScraperStatus>;
  getScraperStatus(): Promise<ScraperStatus[]>;
  
  // API usage operations
  incrementApiUsage(templateType?: string, tone?: string, niche?: string, userId?: number): Promise<void>;
  getApiUsage(): Promise<ApiUsage[]>;
  getTodayApiUsage(): Promise<number>;
  getWeeklyApiUsage(): Promise<number>;
  getMonthlyApiUsage(): Promise<number>;
  
  // AI Model Config operations
  saveAiModelConfig(config: InsertAiModelConfig): Promise<AiModelConfig>;
  getAiModelConfig(niche: string, templateType: string, tone: string): Promise<AiModelConfig | undefined>;
  getAiModelConfigsByNiche(niche: string): Promise<AiModelConfig[]>;
  deleteAiModelConfig(id: number): Promise<boolean>;
  
  // API Integration operations
  saveApiIntegration(integration: InsertApiIntegration): Promise<ApiIntegration>;
  getApiIntegrationsByUser(userId: number): Promise<ApiIntegration[]>;
  getApiIntegrationByProvider(userId: number, provider: string): Promise<ApiIntegration | undefined>;
  deleteApiIntegration(id: number): Promise<boolean>;
  
  // Analytics operations
  getTemplateUsageStats(): Promise<Array<{templateType: string, count: number}>>;
  getTemplateUsageByNiche(niche: string): Promise<Array<{templateType: string, count: number}>>;
  getToneUsageStats(): Promise<Array<{tone: string, count: number}>>;
  getToneUsageByNiche(niche: string): Promise<Array<{tone: string, count: number}>>;
  getGenerationTrends(): Promise<Array<{date: string, count: number}>>;
  getGenerationTrendsByNiche(niche: string): Promise<Array<{date: string, count: number}>>;
  getPopularProducts(): Promise<Array<{product: string, count: number}>>;
  getPopularProductsByNiche(niche: string): Promise<Array<{product: string, count: number}>>;
  getNicheUsageStats(): Promise<Array<{niche: string, count: number}>>;
  getCustomTemplates(): Promise<Array<{id: number, name: string, content: string, niche: string}>>;
  saveCustomTemplate(template: {name: string, content: string, niche: string}): Promise<{id: number, name: string, content: string, niche: string}>;
  deleteCustomTemplate(id: number): Promise<boolean>;
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
  private nicheUsage: Map<string, number>;
  
  // Niche-specific tracking maps
  private templateUsageByNiche: Map<string, Map<string, number>>;
  private toneUsageByNiche: Map<string, Map<string, number>>;
  private productUsageByNiche: Map<string, Map<string, number>>;
  private generationsByNicheDate: Map<string, Map<string, number>>;
  
  // Custom templates
  private customTemplates: Map<number, {id: number, name: string, content: string, niche: string}>;
  
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
    this.nicheUsage = new Map();
    
    // Initialize niche-specific tracking maps
    this.templateUsageByNiche = new Map();
    this.toneUsageByNiche = new Map();
    this.productUsageByNiche = new Map();
    this.generationsByNicheDate = new Map();
    
    // Initialize custom templates
    this.customTemplates = new Map();
    
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
        sourceUrl: "https://tiktok.com/tag/cerave",
        niche: "skincare"
      },
      {
        title: "The Ordinary Niacinamide 10% + Zinc 1%",
        source: "instagram",
        mentions: 840000,
        sourceUrl: "https://instagram.com/explore/tags/theordinary",
        niche: "skincare"
      },
      {
        title: "Drunk Elephant C-Firma Fresh Day Serum",
        source: "youtube",
        mentions: 720000,
        sourceUrl: "https://youtube.com/results?search_query=drunk+elephant+serum",
        niche: "skincare"
      },
      {
        title: "Summer Fridays Jet Lag Mask",
        source: "reddit",
        mentions: 530000,
        sourceUrl: "https://reddit.com/r/SkincareAddiction",
        niche: "skincare"
      },
      {
        title: "Paula's Choice 2% BHA Liquid Exfoliant",
        source: "amazon",
        mentions: 450000,
        sourceUrl: "https://amazon.com/Paulas-Choice-SKIN-PERFECTING-Exfoliant/dp/B00949CTQQ/",
        niche: "skincare"
      },
      {
        title: "La Roche-Posay Toleriane Double Repair Face Moisturizer",
        source: "tiktok",
        mentions: 380000,
        sourceUrl: "https://tiktok.com/tag/laroche",
        niche: "skincare"
      },
      {
        title: "Glow Recipe Watermelon Glow Niacinamide Dew Drops",
        source: "google-trends",
        mentions: 890000,
        sourceUrl: "https://trends.google.com/trends/explore?q=glow%20recipe",
        niche: "skincare"
      },
      // Tech niche examples
      {
        title: "Apple AirPods Pro (2nd Generation)",
        source: "youtube",
        mentions: 920000,
        sourceUrl: "https://youtube.com/results?search_query=airpods+pro+2",
        niche: "tech"
      },
      {
        title: "Sony WH-1000XM5 Headphones",
        source: "instagram",
        mentions: 780000,
        sourceUrl: "https://instagram.com/explore/tags/sonywh1000xm5",
        niche: "tech"
      },
      // Fashion niche examples
      {
        title: "Levi's 501 Original Fit Jeans",
        source: "tiktok",
        mentions: 850000,
        sourceUrl: "https://tiktok.com/tag/levis501",
        niche: "fashion"
      },
      {
        title: "Nike Air Force 1 Sneakers",
        source: "instagram",
        mentions: 950000,
        sourceUrl: "https://instagram.com/explore/tags/airforce1",
        niche: "fashion"
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
      niche: insertGeneration.niche || 'skincare', // Ensure niche is always set 
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
    
    // Track analytics for niche
    const currentNicheCount = this.nicheUsage.get(generation.niche) || 0;
    this.nicheUsage.set(generation.niche, currentNicheCount + 1);
    
    // Track niche-specific template usage
    if (!this.templateUsageByNiche.has(generation.niche)) {
      this.templateUsageByNiche.set(generation.niche, new Map());
    }
    const templatesByNiche = this.templateUsageByNiche.get(generation.niche)!;
    const currentTemplateNicheCount = templatesByNiche.get(generation.templateType) || 0;
    templatesByNiche.set(generation.templateType, currentTemplateNicheCount + 1);
    
    // Track niche-specific tone usage
    if (!this.toneUsageByNiche.has(generation.niche)) {
      this.toneUsageByNiche.set(generation.niche, new Map());
    }
    const tonesByNiche = this.toneUsageByNiche.get(generation.niche)!;
    const currentToneNicheCount = tonesByNiche.get(generation.tone) || 0;
    tonesByNiche.set(generation.tone, currentToneNicheCount + 1);
    
    // Track niche-specific product usage
    if (!this.productUsageByNiche.has(generation.niche)) {
      this.productUsageByNiche.set(generation.niche, new Map());
    }
    const productsByNiche = this.productUsageByNiche.get(generation.niche)!;
    const currentProductNicheCount = productsByNiche.get(generation.product) || 0;
    productsByNiche.set(generation.product, currentProductNicheCount + 1);
    
    // Track niche-specific generation trends by date
    const today = new Date().toISOString().split('T')[0];
    if (!this.generationsByNicheDate.has(generation.niche)) {
      this.generationsByNicheDate.set(generation.niche, new Map());
    }
    const datesByNiche = this.generationsByNicheDate.get(generation.niche)!;
    const currentDateNicheCount = datesByNiche.get(today) || 0;
    datesByNiche.set(today, currentDateNicheCount + 1);
    
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
      niche: insertProduct.niche || 'skincare', // Ensure niche is always set
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
  
  async getTrendingProductsByNiche(niche: string, limit = 10): Promise<TrendingProduct[]> {
    const products = Array.from(this.trendingProducts.values())
      .filter(product => product.niche === niche)
      .sort((a, b) => {
        if (a.mentions && b.mentions) {
          return b.mentions - a.mentions;
        }
        return 0;
      });
    
    return products.slice(0, limit);
  }
  
  async clearTrendingProductsByNiche(niche: string): Promise<void> {
    // Filter out products from the specific niche
    const productsToKeep = new Map<number, TrendingProduct>();
    
    this.trendingProducts.forEach((product, id) => {
      if (product.niche !== niche) {
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

  async getTemplateUsageByNiche(niche: string): Promise<Array<{templateType: string, count: number}>> {
    const stats: Array<{templateType: string, count: number}> = [];
    const templatesByNiche = this.templateUsageByNiche.get(niche);
    
    if (templatesByNiche) {
      templatesByNiche.forEach((count, templateType) => {
        stats.push({ templateType, count });
      });
    }
    
    // Sort by most used first
    return stats.sort((a, b) => b.count - a.count);
  }
  
  async getToneUsageByNiche(niche: string): Promise<Array<{tone: string, count: number}>> {
    const stats: Array<{tone: string, count: number}> = [];
    const tonesByNiche = this.toneUsageByNiche.get(niche);
    
    if (tonesByNiche) {
      tonesByNiche.forEach((count, tone) => {
        stats.push({ tone, count });
      });
    }
    
    // Sort by most used first
    return stats.sort((a, b) => b.count - a.count);
  }
  
  async getGenerationTrendsByNiche(niche: string): Promise<Array<{date: string, count: number}>> {
    const last30Days: Array<{date: string, count: number}> = [];
    const today = new Date();
    const datesByNiche = this.generationsByNicheDate.get(niche);
    
    // Create entries for the last 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      const count = datesByNiche ? (datesByNiche.get(dateString) || 0) : 0;
      last30Days.push({
        date: dateString,
        count
      });
    }
    
    // Sort by date ascending
    return last30Days.sort((a, b) => a.date.localeCompare(b.date));
  }
  
  async getPopularProductsByNiche(niche: string): Promise<Array<{product: string, count: number}>> {
    const stats: Array<{product: string, count: number}> = [];
    const productsByNiche = this.productUsageByNiche.get(niche);
    
    if (productsByNiche) {
      productsByNiche.forEach((count, product) => {
        stats.push({ product, count });
      });
    }
    
    // Return top 10 products
    return stats.sort((a, b) => b.count - a.count).slice(0, 10);
  }
  
  async getNicheUsageStats(): Promise<Array<{niche: string, count: number}>> {
    const stats: Array<{niche: string, count: number}> = [];
    this.nicheUsage.forEach((count, niche) => {
      stats.push({ niche, count });
    });
    
    // Sort by most used first
    return stats.sort((a, b) => b.count - a.count);
  }
  
  // Custom templates management
  async getCustomTemplates(): Promise<Array<{id: number, name: string, content: string, niche: string}>> {
    return Array.from(this.customTemplates.values());
  }
  
  async saveCustomTemplate(template: {name: string, content: string, niche: string}): Promise<{id: number, name: string, content: string, niche: string}> {
    const id = Date.now(); // Use timestamp as ID
    const customTemplate = { id, ...template };
    this.customTemplates.set(id, customTemplate);
    return customTemplate;
  }
  
  async deleteCustomTemplate(id: number): Promise<boolean> {
    return this.customTemplates.delete(id);
  }
}

// Export a single instance of the storage
// Database storage implementation
export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const now = new Date();
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        role: insertUser.role || 'writer',
        createdAt: now,
        updatedAt: now
      })
      .returning();
    return user;
  }
  
  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }
  
  async deleteUser(id: number): Promise<boolean> {
    const result = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning({ deleted: users.id });
    return result.length > 0;
  }
  
  // Teams & User Roles operations
  async createTeam(team: InsertTeam): Promise<Team> {
    const [newTeam] = await db
      .insert(teams)
      .values(team)
      .returning();
    return newTeam;
  }
  
  async getTeams(): Promise<Team[]> {
    return await db
      .select()
      .from(teams)
      .orderBy(teams.name);
  }
  
  async getTeam(id: number): Promise<Team | undefined> {
    const [team] = await db
      .select()
      .from(teams)
      .where(eq(teams.id, id));
    return team;
  }
  
  async updateTeam(id: number, updates: Partial<InsertTeam>): Promise<Team | undefined> {
    const [updatedTeam] = await db
      .update(teams)
      .set(updates)
      .where(eq(teams.id, id))
      .returning();
    return updatedTeam;
  }
  
  async deleteTeam(id: number): Promise<boolean> {
    const result = await db
      .delete(teams)
      .where(eq(teams.id, id))
      .returning({ deleted: teams.id });
    return result.length > 0;
  }
  
  async addTeamMember(teamMember: InsertTeamMember): Promise<TeamMember> {
    const [newMember] = await db
      .insert(teamMembers)
      .values(teamMember)
      .returning();
    return newMember;
  }
  
  async removeTeamMember(teamId: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(teamMembers)
      .where(
        and(
          eq(teamMembers.teamId, teamId),
          eq(teamMembers.userId, userId)
        )
      )
      .returning({ deleted: teamMembers.id });
    return result.length > 0;
  }
  
  async getTeamMembers(teamId: number): Promise<TeamMember[]> {
    return await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.teamId, teamId));
  }
  
  async getUserTeams(userId: number): Promise<Team[]> {
    const result = await db
      .select({
        team: teams
      })
      .from(teamMembers)
      .innerJoin(teams, eq(teamMembers.teamId, teams.id))
      .where(eq(teamMembers.userId, userId));
      
    return result.map(r => r.team);
  }
  
  // Content generation operations
  async saveContentGeneration(insertGeneration: InsertContentGeneration): Promise<ContentGeneration> {
    const [generation] = await db
      .insert(contentGenerations)
      .values(insertGeneration)
      .returning();
    return generation;
  }
  
  async getContentGenerations(limit = 10): Promise<ContentGeneration[]> {
    return await db
      .select()
      .from(contentGenerations)
      .orderBy(desc(contentGenerations.createdAt))
      .limit(limit);
  }
  
  async getContentGenerationById(id: number): Promise<ContentGeneration | undefined> {
    const [generation] = await db
      .select()
      .from(contentGenerations)
      .where(eq(contentGenerations.id, id));
    return generation;
  }
  
  // Content versioning operations
  async saveContentVersion(version: InsertContentVersion): Promise<ContentVersion> {
    const [newVersion] = await db
      .insert(contentVersions)
      .values(version)
      .returning();
    return newVersion;
  }
  
  async getContentVersions(contentId: number): Promise<ContentVersion[]> {
    return await db
      .select()
      .from(contentVersions)
      .where(eq(contentVersions.contentId, contentId))
      .orderBy(desc(contentVersions.version));
  }
  
  async getLatestContentVersion(contentId: number): Promise<ContentVersion | undefined> {
    const [latestVersion] = await db
      .select()
      .from(contentVersions)
      .where(eq(contentVersions.contentId, contentId))
      .orderBy(desc(contentVersions.version))
      .limit(1);
    return latestVersion;
  }
  
  // Content optimization operations
  async saveContentOptimization(optimization: InsertContentOptimization): Promise<ContentOptimization> {
    // See if there's already an optimization for this content
    const [existingOptimization] = await db
      .select()
      .from(contentOptimizations)
      .where(eq(contentOptimizations.contentId, optimization.contentId));
    
    if (existingOptimization) {
      // Update existing optimization
      const [updatedOptimization] = await db
        .update(contentOptimizations)
        .set(optimization)
        .where(eq(contentOptimizations.id, existingOptimization.id))
        .returning();
      return updatedOptimization;
    } else {
      // Create new optimization
      const [newOptimization] = await db
        .insert(contentOptimizations)
        .values(optimization)
        .returning();
      return newOptimization;
    }
  }
  
  async getContentOptimization(contentId: number): Promise<ContentOptimization | undefined> {
    const [optimization] = await db
      .select()
      .from(contentOptimizations)
      .where(eq(contentOptimizations.contentId, contentId));
    return optimization;
  }
  
  // Content performance operations
  async saveContentPerformance(performance: InsertContentPerformance): Promise<ContentPerformance> {
    const [newPerformance] = await db
      .insert(contentPerformance)
      .values(performance)
      .returning();
    return newPerformance;
  }
  
  async getContentPerformanceById(contentId: number): Promise<ContentPerformance[]> {
    return await db
      .select()
      .from(contentPerformance)
      .where(eq(contentPerformance.contentId, contentId))
      .orderBy(desc(contentPerformance.recordedAt));
  }
  
  async getContentPerformanceByPlatform(platform: string, limit = 10): Promise<ContentPerformance[]> {
    return await db
      .select()
      .from(contentPerformance)
      .where(eq(contentPerformance.platform, platform))
      .orderBy(desc(contentPerformance.recordedAt))
      .limit(limit);
  }
  
  // Trending products operations
  async saveTrendingProduct(insertProduct: InsertTrendingProduct): Promise<TrendingProduct> {
    const [product] = await db
      .insert(trendingProducts)
      .values(insertProduct)
      .returning();
    return product;
  }
  
  async getTrendingProducts(limit = 10): Promise<TrendingProduct[]> {
    return await db
      .select()
      .from(trendingProducts)
      .orderBy(desc(trendingProducts.mentions))
      .limit(limit);
  }
  
  async getTrendingProductsByNiche(niche: string, limit = 10): Promise<TrendingProduct[]> {
    return await db
      .select()
      .from(trendingProducts)
      .where(eq(trendingProducts.niche, niche))
      .orderBy(desc(trendingProducts.mentions))
      .limit(limit);
  }
  
  async clearTrendingProducts(): Promise<void> {
    await db.delete(trendingProducts);
  }
  
  async clearTrendingProductsByPlatform(platform: ScraperPlatform): Promise<void> {
    await db
      .delete(trendingProducts)
      .where(eq(trendingProducts.source, platform));
  }
  
  async clearTrendingProductsByNiche(niche: string): Promise<void> {
    await db
      .delete(trendingProducts)
      .where(eq(trendingProducts.niche, niche));
  }
  
  // Scraper status operations
  async updateScraperStatus(
    name: ScraperPlatform, 
    status: ScraperStatusType, 
    errorMessage?: string
  ): Promise<ScraperStatus> {
    // Try to update first
    const [updated] = await db
      .update(scraperStatus)
      .set({ 
        status, 
        lastCheck: new Date(), 
        errorMessage: errorMessage || null 
      })
      .where(eq(scraperStatus.name, name))
      .returning();
    
    if (updated) {
      return updated;
    }
    
    // If no rows were updated, insert a new record
    const [newStatus] = await db
      .insert(scraperStatus)
      .values({
        name,
        status,
        errorMessage: errorMessage || null,
      })
      .returning();
    
    return newStatus;
  }
  
  async getScraperStatus(): Promise<ScraperStatus[]> {
    return await db.select().from(scraperStatus);
  }
  
  // API usage operations
  async incrementApiUsage(templateType?: string, tone?: string, niche?: string, userId?: number): Promise<void> {
    const today = new Date();
    
    // Check if there's an entry for today with same template and tone
    const [todayEntry] = await db
      .select()
      .from(apiUsage)
      .where(
        and(
          gte(apiUsage.date, new Date(today.setHours(0, 0, 0, 0))),
          lte(apiUsage.date, new Date(today.setHours(23, 59, 59, 999))),
          templateType ? eq(apiUsage.templateType, templateType) : sql`TRUE`,
          tone ? eq(apiUsage.tone, tone) : sql`TRUE`,
          niche ? eq(apiUsage.niche, niche) : sql`TRUE`,
          userId ? eq(apiUsage.userId, userId) : sql`TRUE`
        )
      );
    
    if (todayEntry) {
      await db
        .update(apiUsage)
        .set({ count: todayEntry.count + 1 })
        .where(eq(apiUsage.id, todayEntry.id));
    } else {
      await db
        .insert(apiUsage)
        .values({
          date: new Date(),
          count: 1,
          templateType: templateType || null,
          tone: tone || null,
          niche: niche || null,
          userId: userId || null
        });
    }
  }
  
  async getApiUsage(): Promise<ApiUsage[]> {
    return await db
      .select()
      .from(apiUsage)
      .orderBy(desc(apiUsage.date));
  }
  
  async getTodayApiUsage(): Promise<number> {
    const today = new Date();
    
    const [result] = await db
      .select({ 
        totalCount: sql<number>`SUM(${apiUsage.count})` 
      })
      .from(apiUsage)
      .where(
        and(
          gte(apiUsage.date, new Date(today.setHours(0, 0, 0, 0))),
          lte(apiUsage.date, new Date(today.setHours(23, 59, 59, 999)))
        )
      );
    
    return result?.totalCount || 0;
  }
  
  async getWeeklyApiUsage(): Promise<number> {
    const today = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const [result] = await db
      .select({ 
        totalCount: sql<number>`SUM(${apiUsage.count})` 
      })
      .from(apiUsage)
      .where(
        and(
          gte(apiUsage.date, weekAgo),
          lte(apiUsage.date, today)
        )
      );
    
    return result?.totalCount || 0;
  }
  
  async getMonthlyApiUsage(): Promise<number> {
    const today = new Date();
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    
    const [result] = await db
      .select({ 
        totalCount: sql<number>`SUM(${apiUsage.count})` 
      })
      .from(apiUsage)
      .where(
        and(
          gte(apiUsage.date, monthAgo),
          lte(apiUsage.date, today)
        )
      );
    
    return result?.totalCount || 0;
  }

  // Analytics operations
  async getTemplateUsageStats(): Promise<Array<{templateType: string, count: number}>> {
    const results = await db
      .select({
        templateType: contentGenerations.templateType,
        count: sql<number>`COUNT(*)`,
      })
      .from(contentGenerations)
      .groupBy(contentGenerations.templateType)
      .orderBy(desc(sql<number>`COUNT(*)`));
    
    return results;
  }
  
  async getTemplateUsageByNiche(niche: string): Promise<Array<{templateType: string, count: number}>> {
    const results = await db
      .select({
        templateType: contentGenerations.templateType,
        count: sql<number>`COUNT(*)`,
      })
      .from(contentGenerations)
      .where(eq(contentGenerations.niche, niche))
      .groupBy(contentGenerations.templateType)
      .orderBy(desc(sql<number>`COUNT(*)`));
    
    return results;
  }
  
  async getToneUsageStats(): Promise<Array<{tone: string, count: number}>> {
    const results = await db
      .select({
        tone: contentGenerations.tone,
        count: sql<number>`COUNT(*)`,
      })
      .from(contentGenerations)
      .groupBy(contentGenerations.tone)
      .orderBy(desc(sql<number>`COUNT(*)`));
    
    return results;
  }
  
  async getToneUsageByNiche(niche: string): Promise<Array<{tone: string, count: number}>> {
    const results = await db
      .select({
        tone: contentGenerations.tone,
        count: sql<number>`COUNT(*)`,
      })
      .from(contentGenerations)
      .where(eq(contentGenerations.niche, niche))
      .groupBy(contentGenerations.tone)
      .orderBy(desc(sql<number>`COUNT(*)`));
    
    return results;
  }
  
  async getGenerationTrends(): Promise<Array<{date: string, count: number}>> {
    const results = await db
      .select({
        date: sql<string>`TO_CHAR(${contentGenerations.createdAt}, 'YYYY-MM-DD')`,
        count: sql<number>`COUNT(*)`,
      })
      .from(contentGenerations)
      .groupBy(sql`TO_CHAR(${contentGenerations.createdAt}, 'YYYY-MM-DD')`)
      .orderBy(sql`TO_CHAR(${contentGenerations.createdAt}, 'YYYY-MM-DD')`);
    
    return results;
  }
  
  async getGenerationTrendsByNiche(niche: string): Promise<Array<{date: string, count: number}>> {
    const results = await db
      .select({
        date: sql<string>`TO_CHAR(${contentGenerations.createdAt}, 'YYYY-MM-DD')`,
        count: sql<number>`COUNT(*)`,
      })
      .from(contentGenerations)
      .where(eq(contentGenerations.niche, niche))
      .groupBy(sql`TO_CHAR(${contentGenerations.createdAt}, 'YYYY-MM-DD')`)
      .orderBy(sql`TO_CHAR(${contentGenerations.createdAt}, 'YYYY-MM-DD')`);
    
    return results;
  }
  
  async getPopularProducts(): Promise<Array<{product: string, count: number}>> {
    const results = await db
      .select({
        product: contentGenerations.product,
        count: sql<number>`COUNT(*)`,
      })
      .from(contentGenerations)
      .groupBy(contentGenerations.product)
      .orderBy(desc(sql<number>`COUNT(*)`))
      .limit(10);
    
    return results;
  }
  
  async getPopularProductsByNiche(niche: string): Promise<Array<{product: string, count: number}>> {
    const results = await db
      .select({
        product: contentGenerations.product,
        count: sql<number>`COUNT(*)`,
      })
      .from(contentGenerations)
      .where(eq(contentGenerations.niche, niche))
      .groupBy(contentGenerations.product)
      .orderBy(desc(sql<number>`COUNT(*)`))
      .limit(10);
    
    return results;
  }
  
  async getNicheUsageStats(): Promise<Array<{niche: string, count: number}>> {
    const results = await db
      .select({
        niche: contentGenerations.niche,
        count: sql<number>`COUNT(*)`,
      })
      .from(contentGenerations)
      .groupBy(contentGenerations.niche)
      .orderBy(desc(sql<number>`COUNT(*)`));
    
    return results;
  }
  
  // Custom templates
  async getCustomTemplates(): Promise<Array<{id: number, name: string, content: string, niche: string}>> {
    // This would typically be its own table, but for now we'll just return empty
    // Will be implemented with actual table in upcoming code
    return [];
  }
  
  async saveCustomTemplate(template: {name: string, content: string, niche: string}): Promise<{id: number, name: string, content: string, niche: string}> {
    // This would typically be its own table, but for now we'll return a mock
    // Will be implemented with actual table in upcoming code
    return { id: 1, ...template };
  }
  
  async deleteCustomTemplate(id: number): Promise<boolean> {
    // This would typically be its own table, but for now we'll return success
    // Will be implemented with actual table in upcoming code
    return true;
  }

  // AI Model Config operations
  async saveAiModelConfig(config: InsertAiModelConfig): Promise<AiModelConfig> {
    const [savedConfig] = await db
      .insert(aiModelConfigs)
      .values(config)
      .onConflictDoUpdate({
        target: [aiModelConfigs.niche, aiModelConfigs.templateType, aiModelConfigs.tone],
        set: {
          temperature: config.temperature,
          frequencyPenalty: config.frequencyPenalty,
          presencePenalty: config.presencePenalty,
          modelName: config.modelName,
          updatedAt: new Date()
        }
      })
      .returning();
    
    return savedConfig;
  }
  
  async getAiModelConfig(niche: string, templateType: string, tone: string): Promise<AiModelConfig | undefined> {
    const [config] = await db
      .select()
      .from(aiModelConfigs)
      .where(
        and(
          eq(aiModelConfigs.niche, niche),
          eq(aiModelConfigs.templateType, templateType),
          eq(aiModelConfigs.tone, tone)
        )
      );
    
    return config;
  }
  
  async getAiModelConfigsByNiche(niche: string): Promise<AiModelConfig[]> {
    return await db
      .select()
      .from(aiModelConfigs)
      .where(eq(aiModelConfigs.niche, niche));
  }
  
  async deleteAiModelConfig(id: number): Promise<boolean> {
    const result = await db
      .delete(aiModelConfigs)
      .where(eq(aiModelConfigs.id, id))
      .returning({ deleted: aiModelConfigs.id });
    
    return result.length > 0;
  }
  
  // API Integration operations
  async saveApiIntegration(integration: InsertApiIntegration): Promise<ApiIntegration> {
    // Check if this user already has an integration for this provider
    const [existingIntegration] = await db
      .select()
      .from(apiIntegrations)
      .where(
        and(
          eq(apiIntegrations.userId, integration.userId),
          eq(apiIntegrations.provider, integration.provider)
        )
      );
    
    if (existingIntegration) {
      // Update existing integration
      const [updatedIntegration] = await db
        .update(apiIntegrations)
        .set({
          ...integration,
          updatedAt: new Date()
        })
        .where(eq(apiIntegrations.id, existingIntegration.id))
        .returning();
      return updatedIntegration;
    } else {
      // Create new integration
      const [newIntegration] = await db
        .insert(apiIntegrations)
        .values({
          ...integration,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      return newIntegration;
    }
  }
  
  async getApiIntegrationsByUser(userId: number): Promise<ApiIntegration[]> {
    return await db
      .select()
      .from(apiIntegrations)
      .where(eq(apiIntegrations.userId, userId))
      .orderBy(apiIntegrations.provider);
  }
  
  async getApiIntegrationByProvider(userId: number, provider: string): Promise<ApiIntegration | undefined> {
    const [integration] = await db
      .select()
      .from(apiIntegrations)
      .where(
        and(
          eq(apiIntegrations.userId, userId),
          eq(apiIntegrations.provider, provider)
        )
      );
    return integration;
  }
  
  async deleteApiIntegration(id: number): Promise<boolean> {
    const result = await db
      .delete(apiIntegrations)
      .where(eq(apiIntegrations.id, id))
      .returning({ deleted: apiIntegrations.id });
    return result.length > 0;
  }
}

// Switch to database storage
export const storage = new DatabaseStorage();
