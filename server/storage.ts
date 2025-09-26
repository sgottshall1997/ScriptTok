import type {
  User, InsertUser,
  ContentGeneration, InsertContentGeneration,
  TrendingProduct, InsertTrendingProduct,
  ContentHistory, InsertContentHistory,
  AmazonProduct, InsertAmazonProduct,
  AffiliateLink, InsertAffiliateLink,
  TrendHistory, InsertTrendHistory,
} from "@shared/schema";

import {
  users, sessions, contentGenerations, trendingProducts,
  contentHistory, amazonProducts, affiliateLinks,
  trendHistory
} from "@shared/schema";

import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

// Simplified interface for storage operations
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

  // Trend history operations
  saveTrendHistory(history: InsertTrendHistory): Promise<TrendHistory>;
  getTrendHistory(limit?: number, offset?: number): Promise<TrendHistory[]>;
  getTrendHistoryBySource(sourceType: string, limit?: number, offset?: number): Promise<TrendHistory[]>;
  getTrendHistoryByNiche(niche: string, limit?: number, offset?: number): Promise<TrendHistory[]>;
  getTrendHistoryBySourceAndNiche(sourceType: string, niche: string, limit?: number, offset?: number): Promise<TrendHistory[]>;
  clearTrendHistory(): Promise<void>;
  clearTrendHistoryBySourceAndNiche(sourceType: string, niche: string): Promise<void>;
}

// In-memory storage implementation for development
export class MemStorage implements IStorage {
  private users: User[] = [];
  private contentGenerations: ContentGeneration[] = [];
  private contentHistoryData: ContentHistory[] = [];
  private trendingProducts: TrendingProduct[] = [];
  private amazonProducts: AmazonProduct[] = [];
  private affiliateLinks: AffiliateLink[] = [];
  private trendHistoryData: TrendHistory[] = [];

  private nextUserId = 1;
  private nextContentId = 1;
  private nextHistoryId = 1;
  private nextProductId = 1;
  private nextAmazonProductId = 1;
  private nextAffiliateLinkId = 1;
  private nextTrendHistoryId = 1;

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
      email: user.email || null,
      role: user.role || 'creator',
      firstName: user.firstName || null,
      lastName: user.lastName || null,
      profileImage: user.profileImage || null,
      status: user.status || 'active',
      lastLogin: user.lastLogin || null,
      preferences: user.preferences || null,
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
      niche: generation.niche || 'skincare',
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
      userId: history.userId || null,
      sessionId: history.sessionId || null,
      platformsSelected: history.platformsSelected || null,
      generatedOutput: history.generatedOutput || null,
      affiliateLink: history.affiliateLink || null,
      viralInspo: history.viralInspo || null,
      fallbackLevel: history.fallbackLevel || null,
      aiModel: history.aiModel || null,
      contentFormat: history.contentFormat || null,
      topRatedStyleUsed: history.topRatedStyleUsed || false,
      userOverallRating: history.userOverallRating || null,
      userTiktokRating: history.userTiktokRating || null,
      userInstagramRating: history.userInstagramRating || null,
      userYoutubeRating: history.userYoutubeRating || null,
      userComments: history.userComments || null,
      viralScore: history.viralScore || null,
      viralScoreOverall: history.viralScoreOverall || null,
      viralAnalysis: history.viralAnalysis || null,
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
    const reversed = this.contentHistoryData.slice().reverse();
    return reversed.slice(offset, offset + limit);
  }

  // Trending products operations
  async saveTrendingProduct(product: InsertTrendingProduct): Promise<TrendingProduct> {
    const newProduct: TrendingProduct = {
      ...product,
      id: this.nextProductId++,
      niche: product.niche || 'skincare',
      mentions: product.mentions || null,
      sourceUrl: product.sourceUrl || null,
      dataSource: product.dataSource || 'gpt',
      reason: product.reason || null,
      fetchedAt: new Date(),
      engagement: product.engagement || null,
      description: product.description || null,
      viralKeywords: product.viralKeywords || null,
      perplexityNotes: product.perplexityNotes || null,
      trendCategory: product.trendCategory || null,
      videoCount: product.videoCount || null,
      growthPercentage: product.growthPercentage || null,
      trendMomentum: product.trendMomentum || null,
      price: product.price || null,
      priceNumeric: product.priceNumeric || null,
      priceCurrency: product.priceCurrency || 'USD',
      priceType: product.priceType || 'one-time',
      asin: product.asin || null,
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
      price: product.price || null,
      currency: product.currency || null,
      imageUrl: product.imageUrl || null,
      category: product.category || null,
      rating: product.rating || null,
      reviewCount: product.reviewCount || null,
      availability: product.availability || null,
      lastUpdated: new Date(),
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
      contentId: link.contentId || null,
      network: link.network || 'amazon',
      commission: link.commission || null,
      clicks: link.clicks || 0,
      conversions: link.conversions || null,
      revenue: link.revenue || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.affiliateLinks.push(newLink);
    return newLink;
  }

  async getAffiliateLinks(limit = 50): Promise<AffiliateLink[]> {
    return this.affiliateLinks.slice(-limit).reverse();
  }

  // Trend history operations
  async saveTrendHistory(history: InsertTrendHistory): Promise<TrendHistory> {
    // Log pricing data for debugging
    if (history.productData && typeof history.productData === 'object') {
      const productData = history.productData as any;
      console.log(`💾 Saving trend history with pricing:`, {
        title: history.productTitle,
        price: productData.price,
        priceNumeric: productData.priceNumeric,
        asin: productData.asin
      });
    }

    const newHistory: TrendHistory = {
      ...history,
      id: this.nextTrendHistoryId++,
      fetchedAt: history.fetchedAt || new Date(),
      trendCategory: history.trendCategory || null,
      trendName: history.trendName || null,
      trendDescription: history.trendDescription || null,
      trendVolume: history.trendVolume || null,
      trendGrowth: history.trendGrowth || null,
      trendWhen: history.trendWhen || null,
      trendOpportunity: history.trendOpportunity || null,
      trendReason: history.trendReason || null,
      productTitle: history.productTitle || null,
      productMentions: history.productMentions || null,
      productEngagement: history.productEngagement || null,
      productSource: history.productSource || null,
      productReason: history.productReason || null,
      productDescription: history.productDescription || null,
      viralKeywords: history.viralKeywords || null,
      productData: history.productData || null,
      rawData: history.rawData || null,
      createdAt: new Date()
    };
    this.trendHistoryData.push(newHistory);
    return newHistory;
  }

  async getTrendHistory(limit = 50, offset = 0): Promise<TrendHistory[]> {
    const sorted = this.trendHistoryData.slice().reverse();
    return sorted.slice(offset, offset + limit);
  }

  async getTrendHistoryBySource(sourceType: string, limit = 50, offset = 0): Promise<TrendHistory[]> {
    const filtered = this.trendHistoryData
      .filter(h => h.sourceType === sourceType)
      .reverse();
    return filtered.slice(offset, offset + limit);
  }

  async getTrendHistoryByNiche(niche: string, limit = 50, offset = 0): Promise<TrendHistory[]> {
    const filtered = this.trendHistoryData
      .filter(h => h.niche === niche)
      .reverse();
    return filtered.slice(offset, offset + limit);
  }

  async getTrendHistoryBySourceAndNiche(sourceType: string, niche: string, limit = 50, offset = 0): Promise<TrendHistory[]> {
    const filtered = this.trendHistoryData
      .filter(h => h.sourceType === sourceType && h.niche === niche)
      .reverse();
    return filtered.slice(offset, offset + limit);
  }

  async clearTrendHistory(): Promise<void> {
    this.trendHistoryData = [];
  }

  async clearTrendHistoryBySourceAndNiche(sourceType: string, niche: string): Promise<void> {
    this.trendHistoryData = this.trendHistoryData.filter(
      h => !(h.sourceType === sourceType && h.niche === niche)
    );
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
    return (result.rowCount || 0) > 0;
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

  // Trend history operations
  async saveTrendHistory(history: InsertTrendHistory): Promise<TrendHistory> {
    const result = await db.insert(trendHistory).values(history).returning();
    return result[0];
  }

  async getTrendHistory(limit = 50, offset = 0): Promise<TrendHistory[]> {
    return await db.select().from(trendHistory)
      .orderBy(desc(trendHistory.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getTrendHistoryBySource(sourceType: string, limit = 50, offset = 0): Promise<TrendHistory[]> {
    return await db.select().from(trendHistory)
      .where(eq(trendHistory.sourceType, sourceType))
      .orderBy(desc(trendHistory.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getTrendHistoryByNiche(niche: string, limit = 50, offset = 0): Promise<TrendHistory[]> {
    return await db.select().from(trendHistory)
      .where(eq(trendHistory.niche, niche))
      .orderBy(desc(trendHistory.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getTrendHistoryBySourceAndNiche(sourceType: string, niche: string, limit = 50, offset = 0): Promise<TrendHistory[]> {
    return await db.select().from(trendHistory)
      .where(and(eq(trendHistory.sourceType, sourceType), eq(trendHistory.niche, niche)))
      .orderBy(desc(trendHistory.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async clearTrendHistory(): Promise<void> {
    await db.delete(trendHistory);
  }

  async clearTrendHistoryBySourceAndNiche(sourceType: string, niche: string): Promise<void> {
    await db.delete(trendHistory)
      .where(and(eq(trendHistory.sourceType, sourceType), eq(trendHistory.niche, niche)));
  }
}

// Create storage instance - Use PostgreSQL database storage
export const storage = new DatabaseStorage();