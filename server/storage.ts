import type { 
  User, InsertUser,
  ContentGeneration, InsertContentGeneration,
  TrendingProduct, InsertTrendingProduct,
  ContentHistory, InsertContentHistory,
  AmazonProduct, InsertAmazonProduct,
  AffiliateLink, InsertAffiliateLink,
  ScraperStatus, InsertScraperStatus,
  ApiUsage, InsertApiUsage,
  AIModelConfig, InsertAIModelConfig,
} from "@shared/schema";

import { 
  users, sessions, contentGenerations, trendingProducts, 
  contentHistory, amazonProducts, affiliateLinks,
  scraperStatus, apiUsage, aiModelConfigs
} from "@shared/schema";

import { SCRAPER_PLATFORMS, ScraperPlatform, ScraperStatusType, NICHES } from "@shared/constants";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql, asc } from "drizzle-orm";

// Streamlined interface for TikTok Viral Product Generator storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  
  // Content generation operations
  saveContentGeneration(generation: InsertContentGeneration): Promise<ContentGeneration>;
  getContentGenerations(limit?: number): Promise<ContentGeneration[]>;
  getUserContentGenerations(userId: number, limit?: number): Promise<ContentGeneration[]>;
  
  // Content history operations
  saveContentHistory(history: InsertContentHistory): Promise<ContentHistory>;
  getContentHistory(limit?: number): Promise<ContentHistory[]>;
  getAllContentHistory(limit?: number, offset?: number): Promise<ContentHistory[]>;
  getUserContentHistory(userId: number, limit?: number): Promise<ContentHistory[]>;
  getContentHistoryById(id: number): Promise<ContentHistory | undefined>;
  
  // Trending products operations
  saveTrendingProduct(product: InsertTrendingProduct): Promise<TrendingProduct>;
  getTrendingProducts(limit?: number): Promise<TrendingProduct[]>;
  getTrendingProductsByNiche(niche: string, limit?: number): Promise<TrendingProduct[]>;
  clearTrendingProducts(): Promise<void>;
  
  // Amazon products and affiliate links
  saveAmazonProduct(product: InsertAmazonProduct): Promise<AmazonProduct>;
  getAmazonProducts(limit?: number): Promise<AmazonProduct[]>;
  saveAffiliateLink(link: InsertAffiliateLink): Promise<AffiliateLink>;
  getAffiliateLinks(limit?: number): Promise<AffiliateLink[]>;
  
  // API usage tracking
  incrementApiUsage(templateType: string, tone: string, niche: string, userId?: number): Promise<void>;
  getApiUsageStats(): Promise<ApiUsage[]>;
  getTodayApiUsage(): Promise<number>;
  getWeeklyApiUsage(): Promise<number>;
  getMonthlyApiUsage(): Promise<number>;
  
  // Scraper status operations
  updateScraperStatus(platform: ScraperPlatform, status: ScraperStatusType): Promise<void>;
  getScraperStatus(): Promise<ScraperStatus[]>;
  
  // AI model config operations
  getAIModelConfigs(): Promise<AIModelConfig[]>;
  updateAIModelConfig(id: number, config: Partial<InsertAIModelConfig>): Promise<AIModelConfig | undefined>;
}

// In-memory storage implementation for development
export class MemStorage implements IStorage {
  private users: User[] = [];
  private contentGenerations: ContentGeneration[] = [];
  private contentHistoryData: ContentHistory[] = [];
  private trendingProducts: TrendingProduct[] = [];
  private amazonProducts: AmazonProduct[] = [];
  private affiliateLinks: AffiliateLink[] = [];
  private apiUsageData: ApiUsage[] = [];
  private scraperStatusData: ScraperStatus[] = [];
  private aiModelConfigs: AIModelConfig[] = [];
  
  private nextUserId = 1;
  private nextContentId = 1;
  private nextHistoryId = 1;
  private nextProductId = 1;
  private nextAmazonProductId = 1;
  private nextAffiliateLinkId = 1;
  private nextApiUsageId = 1;

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(u => u.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(u => u.username === username);
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = {
      ...user,
      id: this.nextUserId++,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.push(newUser);
    return newUser;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex === -1) return undefined;
    
    this.users[userIndex] = {
      ...this.users[userIndex],
      ...updates,
      updatedAt: new Date()
    };
    return this.users[userIndex];
  }

  async deleteUser(id: number): Promise<boolean> {
    const initialLength = this.users.length;
    this.users = this.users.filter(u => u.id !== id);
    return this.users.length < initialLength;
  }

  // Content generation operations
  async saveContentGeneration(generation: InsertContentGeneration): Promise<ContentGeneration> {
    const newGeneration: ContentGeneration = {
      ...generation,
      id: this.nextContentId++,
      createdAt: new Date()
    };
    this.contentGenerations.push(newGeneration);
    return newGeneration;
  }

  async getContentGenerations(limit = 50): Promise<ContentGeneration[]> {
    return this.contentGenerations.slice(-limit).reverse();
  }

  async getUserContentGenerations(userId: number, limit = 50): Promise<ContentGeneration[]> {
    return this.contentGenerations
      .filter(c => c.userId === userId)
      .slice(-limit)
      .reverse();
  }

  // Content history operations
  async saveContentHistory(history: InsertContentHistory): Promise<ContentHistory> {
    const newHistory: ContentHistory = {
      ...history,
      id: this.nextHistoryId++,
      createdAt: new Date()
    };
    this.contentHistoryData.push(newHistory);
    return newHistory;
  }

  async getContentHistory(limit = 50): Promise<ContentHistory[]> {
    return this.contentHistoryData.slice(-limit).reverse();
  }

  async getUserContentHistory(userId: number, limit = 50): Promise<ContentHistory[]> {
    return this.contentHistoryData
      .filter(h => h.userId === userId)
      .slice(-limit)
      .reverse();
  }

  async getContentHistoryById(id: number): Promise<ContentHistory | undefined> {
    return this.contentHistoryData.find(h => h.id === id);
  }

  async getAllContentHistory(limit = 50, offset = 0): Promise<ContentHistory[]> {
    // First reverse to get newest-first order, then apply offset and limit
    const reversed = this.contentHistoryData.slice().reverse();
    return reversed.slice(offset, offset + limit);
  }

  // Trending products operations
  async saveTrendingProduct(product: InsertTrendingProduct): Promise<TrendingProduct> {
    const newProduct: TrendingProduct = {
      ...product,
      id: this.nextProductId++,
      createdAt: new Date()
    };
    this.trendingProducts.push(newProduct);
    return newProduct;
  }

  async getTrendingProducts(limit = 50): Promise<TrendingProduct[]> {
    return this.trendingProducts.slice(-limit).reverse();
  }

  async getTrendingProductsByNiche(niche: string, limit = 50): Promise<TrendingProduct[]> {
    return this.trendingProducts
      .filter(p => p.niche === niche)
      .slice(-limit)
      .reverse();
  }

  async clearTrendingProducts(): Promise<void> {
    this.trendingProducts = [];
  }

  // Amazon products and affiliate links
  async saveAmazonProduct(product: InsertAmazonProduct): Promise<AmazonProduct> {
    const newProduct: AmazonProduct = {
      ...product,
      id: this.nextAmazonProductId++,
      createdAt: new Date()
    };
    this.amazonProducts.push(newProduct);
    return newProduct;
  }

  async getAmazonProducts(limit = 50): Promise<AmazonProduct[]> {
    return this.amazonProducts.slice(-limit).reverse();
  }

  async saveAffiliateLink(link: InsertAffiliateLink): Promise<AffiliateLink> {
    const newLink: AffiliateLink = {
      ...link,
      id: this.nextAffiliateLinkId++,
      createdAt: new Date()
    };
    this.affiliateLinks.push(newLink);
    return newLink;
  }

  async getAffiliateLinks(limit = 50): Promise<AffiliateLink[]> {
    return this.affiliateLinks.slice(-limit).reverse();
  }

  // API usage tracking
  async incrementApiUsage(templateType: string, tone: string, niche: string, userId?: number): Promise<void> {
    const newUsage: ApiUsage = {
      id: this.nextApiUsageId++,
      templateType,
      tone,
      niche,
      userId,
      usageCount: 1,
      createdAt: new Date()
    };
    this.apiUsageData.push(newUsage);
  }

  async getApiUsageStats(): Promise<ApiUsage[]> {
    return this.apiUsageData;
  }

  async getTodayApiUsage(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.apiUsageData.filter(usage => 
      usage.createdAt >= today
    ).reduce((sum, usage) => sum + usage.usageCount, 0);
  }

  async getWeeklyApiUsage(): Promise<number> {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return this.apiUsageData.filter(usage => 
      usage.createdAt >= weekAgo
    ).reduce((sum, usage) => sum + usage.usageCount, 0);
  }

  async getMonthlyApiUsage(): Promise<number> {
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    return this.apiUsageData.filter(usage => 
      usage.createdAt >= monthAgo
    ).reduce((sum, usage) => sum + usage.usageCount, 0);
  }

  // Scraper status operations
  async updateScraperStatus(platform: ScraperPlatform, status: ScraperStatusType): Promise<void> {
    const existingIndex = this.scraperStatusData.findIndex(s => s.platform === platform);
    if (existingIndex >= 0) {
      this.scraperStatusData[existingIndex] = {
        ...this.scraperStatusData[existingIndex],
        status,
        lastUpdated: new Date()
      };
    } else {
      this.scraperStatusData.push({
        id: Math.random(), // Temporary ID for mem storage
        platform,
        status,
        lastUpdated: new Date(),
        createdAt: new Date()
      });
    }
  }

  async getScraperStatus(): Promise<ScraperStatus[]> {
    return this.scraperStatusData;
  }

  // AI model config operations
  async getAIModelConfigs(): Promise<AIModelConfig[]> {
    return this.aiModelConfigs;
  }

  async updateAIModelConfig(id: number, config: Partial<InsertAIModelConfig>): Promise<AIModelConfig | undefined> {
    const configIndex = this.aiModelConfigs.findIndex(c => c.id === id);
    if (configIndex === -1) return undefined;
    
    this.aiModelConfigs[configIndex] = {
      ...this.aiModelConfigs[configIndex],
      ...config,
      updatedAt: new Date()
    };
    return this.aiModelConfigs[configIndex];
  }
}

// PostgreSQL storage implementation using Drizzle ORM
export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const result = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return result[0];
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return result.rowCount > 0;
  }

  // Content generation operations
  async saveContentGeneration(generation: InsertContentGeneration): Promise<ContentGeneration> {
    const result = await db.insert(contentGenerations).values(generation).returning();
    return result[0];
  }

  async getContentGenerations(limit = 50): Promise<ContentGeneration[]> {
    return await db.select().from(contentGenerations).orderBy(desc(contentGenerations.createdAt)).limit(limit);
  }

  async getUserContentGenerations(userId: number, limit = 50): Promise<ContentGeneration[]> {
    return await db.select().from(contentGenerations)
      .where(eq(contentGenerations.userId, userId))
      .orderBy(desc(contentGenerations.createdAt))
      .limit(limit);
  }

  // Content history operations
  async saveContentHistory(history: InsertContentHistory): Promise<ContentHistory> {
    const result = await db.insert(contentHistory).values(history).returning();
    return result[0];
  }

  async getContentHistory(limit = 50): Promise<ContentHistory[]> {
    return await db.select().from(contentHistory).orderBy(desc(contentHistory.createdAt)).limit(limit);
  }

  async getAllContentHistory(limit = 50, offset = 0): Promise<ContentHistory[]> {
    return await db.select().from(contentHistory)
      .orderBy(desc(contentHistory.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getUserContentHistory(userId: number, limit = 50): Promise<ContentHistory[]> {
    return await db.select().from(contentHistory)
      .where(eq(contentHistory.userId, userId))
      .orderBy(desc(contentHistory.createdAt))
      .limit(limit);
  }

  async getContentHistoryById(id: number): Promise<ContentHistory | undefined> {
    const result = await db.select().from(contentHistory).where(eq(contentHistory.id, id));
    return result[0];
  }

  // Trending products operations
  async saveTrendingProduct(product: InsertTrendingProduct): Promise<TrendingProduct> {
    const result = await db.insert(trendingProducts).values(product).returning();
    return result[0];
  }

  async getTrendingProducts(limit = 50): Promise<TrendingProduct[]> {
    return await db.select().from(trendingProducts).orderBy(desc(trendingProducts.createdAt)).limit(limit);
  }

  async getTrendingProductsByNiche(niche: string, limit = 3): Promise<TrendingProduct[]> {
    return await db.select().from(trendingProducts)
      .where(eq(trendingProducts.niche, niche))
      .orderBy(desc(trendingProducts.createdAt))
      .limit(limit);
  }

  async clearTrendingProducts(): Promise<void> {
    await db.delete(trendingProducts);
  }

  // Amazon products and affiliate links
  async saveAmazonProduct(product: InsertAmazonProduct): Promise<AmazonProduct> {
    const result = await db.insert(amazonProducts).values(product).returning();
    return result[0];
  }

  async getAmazonProducts(limit = 50): Promise<AmazonProduct[]> {
    return await db.select().from(amazonProducts).orderBy(desc(amazonProducts.createdAt)).limit(limit);
  }

  async saveAffiliateLink(link: InsertAffiliateLink): Promise<AffiliateLink> {
    const result = await db.insert(affiliateLinks).values(link).returning();
    return result[0];
  }

  async getAffiliateLinks(limit = 50): Promise<AffiliateLink[]> {
    return await db.select().from(affiliateLinks).orderBy(desc(affiliateLinks.createdAt)).limit(limit);
  }

  // API usage tracking
  async incrementApiUsage(templateType: string, tone: string, niche: string, userId?: number): Promise<void> {
    await db.insert(apiUsage).values({
      templateType,
      tone,
      niche,
      userId,
      usageCount: 1,
      createdAt: new Date()
    });
  }

  async getApiUsageStats(): Promise<ApiUsage[]> {
    return await db.select().from(apiUsage).orderBy(desc(apiUsage.createdAt));
  }

  async getTodayApiUsage(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const result = await db.select({ total: sql<number>`sum(${apiUsage.usageCount})` })
      .from(apiUsage)
      .where(gte(apiUsage.createdAt, today));
    return result[0]?.total || 0;
  }

  async getWeeklyApiUsage(): Promise<number> {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const result = await db.select({ total: sql<number>`sum(${apiUsage.usageCount})` })
      .from(apiUsage)
      .where(gte(apiUsage.createdAt, weekAgo));
    return result[0]?.total || 0;
  }

  async getMonthlyApiUsage(): Promise<number> {
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    const result = await db.select({ total: sql<number>`sum(${apiUsage.usageCount})` })
      .from(apiUsage)
      .where(gte(apiUsage.createdAt, monthAgo));
    return result[0]?.total || 0;
  }

  // Scraper status operations
  async updateScraperStatus(platform: ScraperPlatform, status: ScraperStatusType): Promise<void> {
    const existingStatus = await db.select()
      .from(scraperStatus)
      .where(eq(scraperStatus.platform, platform));

    if (existingStatus.length > 0) {
      await db.update(scraperStatus)
        .set({ status, lastUpdated: new Date() })
        .where(eq(scraperStatus.platform, platform));
    } else {
      await db.insert(scraperStatus).values({
        platform,
        status,
        lastUpdated: new Date(),
        createdAt: new Date()
      });
    }
  }

  async getScraperStatus(): Promise<ScraperStatus[]> {
    return await db.select().from(scraperStatus).orderBy(desc(scraperStatus.lastUpdated));
  }

  // AI model config operations
  async getAIModelConfigs(): Promise<AIModelConfig[]> {
    return await db.select().from(aiModelConfigs);
  }

  async updateAIModelConfig(id: number, config: Partial<InsertAIModelConfig>): Promise<AIModelConfig | undefined> {
    const result = await db.update(aiModelConfigs).set(config).where(eq(aiModelConfigs.id, id)).returning();
    return result[0];
  }
}

// Create storage instance - Use PostgreSQL database storage
export const storage = new DatabaseStorage();