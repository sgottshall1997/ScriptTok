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
  TrendingEmojisHashtags, InsertTrendingEmojisHashtags,
  SocialMediaPlatform, InsertSocialMediaPlatform,
  PublishedContent, InsertPublishedContent,
  IntegrationWebhook, InsertIntegrationWebhook,
  ContentHistory, InsertContentHistory,
  // CookAIng Marketing Engine types
  Organization, InsertOrganization,
  Contact, InsertContact,
  Campaign, InsertCampaign,
  Workflow, InsertWorkflow,
  Form, InsertForm,
  FormSubmission, InsertFormSubmission,
  AffiliateProduct, InsertAffiliateProduct,
  AnalyticsEvent, InsertAnalyticsEvent,
  ABTest, InsertABTest,
  ABAssignment, InsertABAssignment,
  users, contentGenerations, trendingProducts, scraperStatus, apiUsage,
  aiModelConfigs, teams, teamMembers, contentOptimizations, 
  contentPerformance, contentVersions, apiIntegrations, trendingEmojisHashtags,
  socialMediaPlatforms, publishedContent, integrationWebhooks, userActivityLogs,
  contentHistory,
  // CookAIng Marketing Engine tables
  organizations, contacts, campaigns, workflows, forms, formSubmissions, affiliateProducts,
  analyticsEvents, abTests, abAssignments
} from "@shared/schema";
import { SCRAPER_PLATFORMS, ScraperPlatform, ScraperStatusType, NICHES } from "@shared/constants";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql, asc } from "drizzle-orm";

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
  getAllTrendingProducts(): Promise<TrendingProduct[]>;
  getLastTrendingRefresh(): Promise<string | null>;
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
  getApiIntegrationById(id: number): Promise<ApiIntegration | undefined>;
  deleteApiIntegration(id: number): Promise<boolean>;
  
  // Social Media Platforms operations
  getSocialMediaPlatforms(): Promise<SocialMediaPlatform[]>;
  getSocialMediaPlatformById(id: number): Promise<SocialMediaPlatform | undefined>;
  saveSocialMediaPlatform(platform: InsertSocialMediaPlatform): Promise<SocialMediaPlatform>;
  
  // Published Content operations
  getPublishedContentByUser(userId: number, limit?: number, offset?: number): Promise<PublishedContent[]>;
  
  // Integration Webhooks operations
  saveIntegrationWebhook(webhook: InsertIntegrationWebhook): Promise<IntegrationWebhook>;
  getIntegrationWebhooksByUser(userId: number): Promise<IntegrationWebhook[]>;
  getIntegrationWebhooksByIntegration(integrationId: number): Promise<IntegrationWebhook[]>;
  
  // User Activity operations
  logUserActivity(activityData: { userId: number, action: string, metadata?: any, ipAddress?: string, userAgent?: string }): Promise<void>;
  
  // Trending Emojis and Hashtags operations
  getTrendingEmojisHashtags(niche: string): Promise<TrendingEmojisHashtags | undefined>;
  saveTrendingEmojisHashtags(data: InsertTrendingEmojisHashtags): Promise<TrendingEmojisHashtags>;
  getAllTrendingEmojisHashtags(): Promise<TrendingEmojisHashtags[]>;
  
  // Content History operations
  saveContentHistory(history: InsertContentHistory): Promise<ContentHistory>;
  getContentHistoryById(id: number): Promise<ContentHistory | undefined>;
  getContentHistoryByUserId(userId: number, limit?: number, offset?: number): Promise<ContentHistory[]>;
  getAllContentHistory(limit?: number, offset?: number): Promise<ContentHistory[]>;
  getContentHistoryByNiche(niche: string, limit?: number, offset?: number): Promise<ContentHistory[]>;
  deleteContentHistory(id: number): Promise<void>;
  
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
  
  // CookAIng Marketing Engine operations
  // Organization operations
  createOrganization(organization: InsertOrganization): Promise<Organization>;
  getOrganization(id: number): Promise<Organization | undefined>;
  getOrganizations(): Promise<Organization[]>;
  updateOrganization(id: number, updates: Partial<InsertOrganization>): Promise<Organization | undefined>;
  deleteOrganization(id: number): Promise<boolean>;
  
  // Contact operations
  createContact(contact: InsertContact): Promise<Contact>;
  getContact(id: number): Promise<Contact | undefined>;
  getContactsByOrganization(organizationId: number): Promise<Contact[]>;
  getContacts(limit?: number): Promise<Contact[]>;
  updateContact(id: number, updates: Partial<InsertContact>): Promise<Contact | undefined>;
  deleteContact(id: number): Promise<boolean>;
  
  // Campaign operations
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  getCampaign(id: number): Promise<Campaign | undefined>;
  getCampaignsByOrganization(organizationId: number): Promise<Campaign[]>;
  getCampaigns(limit?: number): Promise<Campaign[]>;
  updateCampaign(id: number, updates: Partial<InsertCampaign>): Promise<Campaign | undefined>;
  deleteCampaign(id: number): Promise<boolean>;
  
  // Workflow operations
  createWorkflow(workflow: InsertWorkflow): Promise<Workflow>;
  getWorkflow(id: number): Promise<Workflow | undefined>;
  getWorkflowsByOrganization(organizationId: number): Promise<Workflow[]>;
  getWorkflows(limit?: number): Promise<Workflow[]>;
  updateWorkflow(id: number, updates: Partial<InsertWorkflow>): Promise<Workflow | undefined>;
  deleteWorkflow(id: number): Promise<boolean>;
  
  // Form operations
  createForm(form: InsertForm): Promise<Form>;
  getForm(id: number): Promise<Form | undefined>;
  getFormsByOrganization(organizationId: number): Promise<Form[]>;
  getForms(limit?: number): Promise<Form[]>;
  updateForm(id: number, updates: Partial<InsertForm>): Promise<Form | undefined>;
  deleteForm(id: number): Promise<boolean>;
  
  // Form submission operations
  createFormSubmission(submission: InsertFormSubmission): Promise<FormSubmission>;
  getFormSubmission(id: number): Promise<FormSubmission | undefined>;
  getFormSubmissionsByForm(formId: number): Promise<FormSubmission[]>;
  getFormSubmissions(limit?: number): Promise<FormSubmission[]>;
  
  // Affiliate product operations
  createAffiliateProduct(product: InsertAffiliateProduct): Promise<AffiliateProduct>;
  getAffiliateProduct(id: number): Promise<AffiliateProduct | undefined>;
  getAffiliateProductsByOrganization(organizationId: number): Promise<AffiliateProduct[]>;
  getAffiliateProducts(limit?: number): Promise<AffiliateProduct[]>;
  updateAffiliateProduct(id: number, updates: Partial<InsertAffiliateProduct>): Promise<AffiliateProduct | undefined>;
  deleteAffiliateProduct(id: number): Promise<boolean>;

  // Campaign Artifact operations
  getCampaignArtifacts(campaignId: number): Promise<any[]>;
  
  // Segment operations
  getSegment(id: number): Promise<any | undefined>;
  getContactsBySegment(segmentId: number): Promise<Contact[]>;
  
  // Campaign Recipient operations  
  createCampaignRecipient(recipient: any): Promise<any>;
  getCampaignRecipientsByEmail(email: string): Promise<any[]>;
  updateCampaignRecipient(id: number, updates: any): Promise<any>;
  
  // Analytics Event operations
  createAnalyticsEvent(event: InsertAnalyticsEvent): Promise<AnalyticsEvent>;
  
  // A/B Testing operations
  createABTest(test: InsertABTest): Promise<ABTest>;
  getABTest(id: number): Promise<ABTest | undefined>;
  getABTestsByEntity(entity: string, contextJson: any): Promise<ABTest[]>;
  updateABTest(id: number, updates: Partial<InsertABTest>): Promise<ABTest | undefined>;
  deleteABTest(id: number): Promise<boolean>;
  
  // A/B Assignment operations  
  createABAssignment(assignment: InsertABAssignment): Promise<ABAssignment>;
  getABAssignment(testId: number, contactId?: number, anonId?: string): Promise<ABAssignment | undefined>;
  getABAssignmentsByTest(testId: number): Promise<ABAssignment[]>;
  getABTestResults(testId: number): Promise<{ variantA: number; variantB: number }>;
  updateContactAttribution(contactId: number, utmData: any, touchType: 'first' | 'last'): Promise<Contact | undefined>;
}

// In-memory storage implementation (not actively used - DatabaseStorage is the active implementation)
export class MemStorage {
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
  
  // CookAIng Marketing Engine storage maps
  private organizations: Map<number, Organization>;
  private contacts: Map<number, Contact>;
  private campaigns: Map<number, Campaign>;
  private workflows: Map<number, Workflow>;
  private forms: Map<number, Form>;
  private formSubmissions: Map<number, FormSubmission>;
  private affiliateProducts: Map<number, AffiliateProduct>;
  
  // Trending products refresh tracking
  private lastTrendingRefresh: string | null = null;
  
  private userId: number;
  private contentGenerationId: number;
  private trendingProductId: number;
  private scraperStatusId: number;
  private apiUsageId: number;
  
  // CookAIng Marketing Engine ID counters
  private organizationId: number;
  private contactId: number;
  private campaignId: number;
  private workflowId: number;
  private formId: number;
  private formSubmissionId: number;
  private affiliateProductId: number;
  
  constructor() {
    this.users = new Map();
    this.contentGenerations = new Map();
    this.trendingProducts = new Map();
    this.scraperStatuses = new Map();
    this.apiUsage = new Map();
    
    // Initialize CookAIng Marketing Engine maps
    this.organizations = new Map();
    this.contacts = new Map();
    this.campaigns = new Map();
    this.workflows = new Map();
    this.forms = new Map();
    this.formSubmissions = new Map();
    this.affiliateProducts = new Map();
    
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
    
    // Initialize CookAIng Marketing Engine ID counters
    this.organizationId = 1;
    this.contactId = 1;
    this.campaignId = 1;
    this.workflowId = 1;
    this.formId = 1;
    this.formSubmissionId = 1;
    this.affiliateProductId = 1;
    
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
      niche: insertGeneration.niche || 'beauty', // Ensure niche is always set 
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
      niche: insertProduct.niche || 'beauty', // Ensure niche is always set
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

  async getAllTrendingProducts(): Promise<TrendingProduct[]> {
    return Array.from(this.trendingProducts.values());
  }

  async getLastTrendingRefresh(): Promise<string | null> {
    // For memory storage, we'll store this as a simple variable
    return this.lastTrendingRefresh || null;
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
  
  async getTrendingProductsByNiche(niche: string, limit = 3): Promise<TrendingProduct[]> {
    // First get products matching the specific niche, prioritizing newest with reasons
    let nicheProducts = Array.from(this.trendingProducts.values())
      .filter(product => product.niche === niche)
      .sort((a, b) => {
        // First priority: products with reasons (newest first)
        const aHasReason = a.reason && a.reason.trim() !== '';
        const bHasReason = b.reason && b.reason.trim() !== '';
        
        if (aHasReason && !bHasReason) return -1;
        if (!aHasReason && bHasReason) return 1;
        
        // Second priority: newest products first (by createdAt)
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        
        // Third priority: mentions count
        if (a.mentions && b.mentions) {
          return b.mentions - a.mentions;
        }
        return 0;
      })
      .slice(0, limit);
    
    // If we have exactly the requested number of products, return them
    if (nicheProducts.length === limit) {
      return nicheProducts;
    }
    
    // If we don't have enough products, get additional trending products
    if (nicheProducts.length < limit) {
      // Get all trending products not already included
      const nicheProductIds = new Set(nicheProducts.map(p => p.id));
      const additionalProducts = Array.from(this.trendingProducts.values())
        .filter(product => 
          // Exclude products we already have
          !nicheProductIds.has(product.id) &&
          // Exclude products from this niche (we already got those)
          product.niche !== niche
        )
        .sort((a, b) => {
          if (a.mentions && b.mentions) {
            return b.mentions - a.mentions;
          }
          return 0;
        })
        .slice(0, limit - nicheProducts.length);
      
      // Combine the specific niche products with additional trending products
      return [...nicheProducts, ...additionalProducts].slice(0, limit);
    }
    
    // If we have more products than requested, return only the top ones
    return nicheProducts.slice(0, limit);
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
  
  // CookAIng Marketing Engine implementations
  // Organization operations
  async createOrganization(organization: InsertOrganization): Promise<Organization> {
    const id = this.organizationId++;
    const newOrg: Organization = { ...organization, id, createdAt: new Date(), updatedAt: new Date() };
    this.organizations.set(id, newOrg);
    return newOrg;
  }
  
  async getOrganization(id: number): Promise<Organization | undefined> {
    return this.organizations.get(id);
  }
  
  async getOrganizations(): Promise<Organization[]> {
    return Array.from(this.organizations.values());
  }
  
  async updateOrganization(id: number, updates: Partial<InsertOrganization>): Promise<Organization | undefined> {
    const org = this.organizations.get(id);
    if (!org) return undefined;
    const updated: Organization = { ...org, ...updates, updatedAt: new Date() };
    this.organizations.set(id, updated);
    return updated;
  }
  
  async deleteOrganization(id: number): Promise<boolean> {
    return this.organizations.delete(id);
  }
  
  // Contact operations
  async createContact(contact: InsertContact): Promise<Contact> {
    const id = this.contactId++;
    const newContact: Contact = { ...contact, id, createdAt: new Date(), updatedAt: new Date() };
    this.contacts.set(id, newContact);
    return newContact;
  }
  
  async getContact(id: number): Promise<Contact | undefined> {
    return this.contacts.get(id);
  }
  
  async getContactsByOrganization(organizationId: number): Promise<Contact[]> {
    return Array.from(this.contacts.values()).filter(contact => contact.organizationId === organizationId);
  }
  
  async getContacts(limit = 50): Promise<Contact[]> {
    const contacts = Array.from(this.contacts.values());
    return contacts.slice(0, limit);
  }
  
  async updateContact(id: number, updates: Partial<InsertContact>): Promise<Contact | undefined> {
    const contact = this.contacts.get(id);
    if (!contact) return undefined;
    const updated: Contact = { ...contact, ...updates, updatedAt: new Date() };
    this.contacts.set(id, updated);
    return updated;
  }
  
  async deleteContact(id: number): Promise<boolean> {
    return this.contacts.delete(id);
  }
  
  // Campaign operations
  async createCampaign(campaign: InsertCampaign): Promise<Campaign> {
    const id = this.campaignId++;
    const newCampaign: Campaign = { ...campaign, id, createdAt: new Date(), updatedAt: new Date() };
    this.campaigns.set(id, newCampaign);
    return newCampaign;
  }
  
  async getCampaign(id: number): Promise<Campaign | undefined> {
    return this.campaigns.get(id);
  }
  
  async getCampaignsByOrganization(organizationId: number): Promise<Campaign[]> {
    return Array.from(this.campaigns.values()).filter(campaign => campaign.organizationId === organizationId);
  }
  
  async getCampaigns(limit = 50): Promise<Campaign[]> {
    const campaigns = Array.from(this.campaigns.values());
    return campaigns.slice(0, limit);
  }
  
  async updateCampaign(id: number, updates: Partial<InsertCampaign>): Promise<Campaign | undefined> {
    const campaign = this.campaigns.get(id);
    if (!campaign) return undefined;
    const updated: Campaign = { ...campaign, ...updates, updatedAt: new Date() };
    this.campaigns.set(id, updated);
    return updated;
  }
  
  async deleteCampaign(id: number): Promise<boolean> {
    return this.campaigns.delete(id);
  }
  
  // Workflow operations
  async createWorkflow(workflow: InsertWorkflow): Promise<Workflow> {
    const id = this.workflowId++;
    const newWorkflow: Workflow = { ...workflow, id, createdAt: new Date(), updatedAt: new Date() };
    this.workflows.set(id, newWorkflow);
    return newWorkflow;
  }
  
  async getWorkflow(id: number): Promise<Workflow | undefined> {
    return this.workflows.get(id);
  }
  
  async getWorkflowsByOrganization(organizationId: number): Promise<Workflow[]> {
    return Array.from(this.workflows.values()).filter(workflow => workflow.organizationId === organizationId);
  }
  
  async getWorkflows(limit = 50): Promise<Workflow[]> {
    const workflows = Array.from(this.workflows.values());
    return workflows.slice(0, limit);
  }
  
  async updateWorkflow(id: number, updates: Partial<InsertWorkflow>): Promise<Workflow | undefined> {
    const workflow = this.workflows.get(id);
    if (!workflow) return undefined;
    const updated: Workflow = { ...workflow, ...updates, updatedAt: new Date() };
    this.workflows.set(id, updated);
    return updated;
  }
  
  async deleteWorkflow(id: number): Promise<boolean> {
    return this.workflows.delete(id);
  }
  
  // Form operations
  async createForm(form: InsertForm): Promise<Form> {
    const id = this.formId++;
    const newForm: Form = { ...form, id, createdAt: new Date(), updatedAt: new Date() };
    this.forms.set(id, newForm);
    return newForm;
  }
  
  async getForm(id: number): Promise<Form | undefined> {
    return this.forms.get(id);
  }
  
  async getFormsByOrganization(organizationId: number): Promise<Form[]> {
    return Array.from(this.forms.values()).filter(form => form.organizationId === organizationId);
  }
  
  async getForms(limit = 50): Promise<Form[]> {
    const forms = Array.from(this.forms.values());
    return forms.slice(0, limit);
  }
  
  async updateForm(id: number, updates: Partial<InsertForm>): Promise<Form | undefined> {
    const form = this.forms.get(id);
    if (!form) return undefined;
    const updated: Form = { ...form, ...updates, updatedAt: new Date() };
    this.forms.set(id, updated);
    return updated;
  }
  
  async deleteForm(id: number): Promise<boolean> {
    return this.forms.delete(id);
  }
  
  // Form submission operations
  async createFormSubmission(submission: InsertFormSubmission): Promise<FormSubmission> {
    const id = this.formSubmissionId++;
    const newSubmission: FormSubmission = { ...submission, id, createdAt: new Date() };
    this.formSubmissions.set(id, newSubmission);
    return newSubmission;
  }
  
  async getFormSubmission(id: number): Promise<FormSubmission | undefined> {
    return this.formSubmissions.get(id);
  }
  
  async getFormSubmissionsByForm(formId: number): Promise<FormSubmission[]> {
    return Array.from(this.formSubmissions.values()).filter(submission => submission.formId === formId);
  }
  
  async getFormSubmissions(limit = 50): Promise<FormSubmission[]> {
    const submissions = Array.from(this.formSubmissions.values());
    return submissions.slice(0, limit);
  }
  
  // Affiliate product operations
  async createAffiliateProduct(product: InsertAffiliateProduct): Promise<AffiliateProduct> {
    const id = this.affiliateProductId++;
    const newProduct: AffiliateProduct = { ...product, id, createdAt: new Date(), updatedAt: new Date() };
    this.affiliateProducts.set(id, newProduct);
    return newProduct;
  }
  
  async getAffiliateProduct(id: number): Promise<AffiliateProduct | undefined> {
    return this.affiliateProducts.get(id);
  }
  
  async getAffiliateProductsByOrganization(organizationId: number): Promise<AffiliateProduct[]> {
    return Array.from(this.affiliateProducts.values()).filter(product => product.organizationId === organizationId);
  }
  
  async getAffiliateProducts(limit = 50): Promise<AffiliateProduct[]> {
    const products = Array.from(this.affiliateProducts.values());
    return products.slice(0, limit);
  }
  
  async updateAffiliateProduct(id: number, updates: Partial<InsertAffiliateProduct>): Promise<AffiliateProduct | undefined> {
    const product = this.affiliateProducts.get(id);
    if (!product) return undefined;
    const updated: AffiliateProduct = { ...product, ...updates, updatedAt: new Date() };
    this.affiliateProducts.set(id, updated);
    return updated;
  }
  
  async deleteAffiliateProduct(id: number): Promise<boolean> {
    return this.affiliateProducts.delete(id);
  }
}

// Export a single instance of the storage
// Database storage implementation
export class DatabaseStorage implements IStorage {
  // Content History operations
  async saveContentHistory(history: InsertContentHistory): Promise<ContentHistory> {
    const [result] = await db.insert(contentHistory).values(history).returning();
    return result;
  }
  
  async getContentHistoryById(id: number): Promise<ContentHistory | undefined> {
    const [result] = await db.select().from(contentHistory).where(eq(contentHistory.id, id));
    return result;
  }
  
  async getContentHistoryByUserId(userId: number, limit: number = 50, offset: number = 0): Promise<ContentHistory[]> {
    return await db.select()
      .from(contentHistory)
      .where(eq(contentHistory.userId, userId))
      .orderBy(desc(contentHistory.createdAt))
      .limit(limit)
      .offset(offset);
  }
  
  async getAllContentHistory(limit: number = 50, offset: number = 0): Promise<ContentHistory[]> {
    return await db.select()
      .from(contentHistory)
      .orderBy(desc(contentHistory.createdAt))
      .limit(limit)
      .offset(offset);
  }
  
  async getContentHistoryByNiche(niche: string, limit: number = 50, offset: number = 0): Promise<ContentHistory[]> {
    return await db.select()
      .from(contentHistory)
      .where(eq(contentHistory.niche, niche))
      .orderBy(desc(contentHistory.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async deleteContentHistory(id: number): Promise<void> {
    await db.delete(contentHistory)
      .where(eq(contentHistory.id, id));
  }

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
  
  async getTrendingProductsByNiche(niche: string, limit = 3): Promise<TrendingProduct[]> {
    // Get all products for this niche ordered by created date (most recent first)
    const allNicheProducts = await db
      .select()
      .from(trendingProducts)
      .where(eq(trendingProducts.niche, niche))
      .orderBy(desc(trendingProducts.createdAt));
    
    console.log(`🔍 Debug getTrendingProductsByNiche(${niche}): Found ${allNicheProducts.length} total products`);
    if (allNicheProducts.length > 0) {
      console.log(`   First product: ${allNicheProducts[0].title} (${allNicheProducts[0].createdAt})`);
      console.log(`   Last product: ${allNicheProducts[allNicheProducts.length - 1].title} (${allNicheProducts[allNicheProducts.length - 1].createdAt})`);
    }
    
    // Manual deduplication by title, keeping the most recent version
    const seenTitles = new Set<string>();
    const uniqueProducts: typeof allNicheProducts = [];
    
    for (const product of allNicheProducts) {
      if (!seenTitles.has(product.title)) {
        seenTitles.add(product.title);
        uniqueProducts.push(product);
      }
    }
    
    // Prioritize recent products with good reasons, then sort by mentions
    const nicheProducts = uniqueProducts
      .sort((a, b) => {
        // First priority: products with good reasons (non-empty, meaningful)
        const aHasGoodReason = a.reason && a.reason.trim().length > 10;
        const bHasGoodReason = b.reason && b.reason.trim().length > 10;
        
        if (aHasGoodReason && !bHasGoodReason) return -1;
        if (!aHasGoodReason && bHasGoodReason) return 1;
        
        // Second priority: newer products first (within last 24 hours get priority)
        const now = new Date();
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const aIsRecent = a.createdAt && new Date(a.createdAt) > twentyFourHoursAgo;
        const bIsRecent = b.createdAt && new Date(b.createdAt) > twentyFourHoursAgo;
        
        if (aIsRecent && !bIsRecent) return -1;
        if (!aIsRecent && bIsRecent) return 1;
        
        // Third priority: sort by created date (newest first)
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        
        // Fourth priority: mentions count
        return (b.mentions || 0) - (a.mentions || 0);
      })
      .slice(0, limit);
    
    // If we have exactly the requested number of products, return them
    if (nicheProducts.length === limit) {
      return nicheProducts;
    }
    
    // If we don't have enough products, get additional trending products
    // that might be relevant but not specifically tagged for this niche
    if (nicheProducts.length < limit) {
      // Get all remaining products
      const additionalProducts = await db
        .select()
        .from(trendingProducts)
        .where(and(
          // Exclude products we already have
          ...nicheProducts.map(p => (p.id ? sql`${trendingProducts.id} != ${p.id}` : sql`1=1`)),
          // Exclude products from this niche (we already got those)
          sql`${trendingProducts.niche} != ${niche}`
        ))
        .orderBy(desc(trendingProducts.mentions))
        .limit(limit - nicheProducts.length);
      
      // Combine the specific niche products with additional trending products
      return [...nicheProducts, ...additionalProducts].slice(0, limit);
    }
    
    // If we have more products than requested, return only the top ones
    return nicheProducts.slice(0, limit);
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
  
  // CookAIng Marketing Engine implementations using Drizzle ORM
  // Organization operations
  async createOrganization(organization: InsertOrganization): Promise<Organization> {
    const [result] = await db.insert(organizations).values(organization).returning();
    return result;
  }
  
  async getOrganization(id: number): Promise<Organization | undefined> {
    const [result] = await db.select().from(organizations).where(eq(organizations.id, id));
    return result;
  }
  
  async getOrganizations(): Promise<Organization[]> {
    return await db.select().from(organizations);
  }
  
  async updateOrganization(id: number, updates: Partial<InsertOrganization>): Promise<Organization | undefined> {
    const [result] = await db.update(organizations).set(updates).where(eq(organizations.id, id)).returning();
    return result;
  }
  
  async deleteOrganization(id: number): Promise<boolean> {
    const result = await db.delete(organizations).where(eq(organizations.id, id));
    return result.rowCount > 0;
  }
  
  // Contact operations
  async createContact(contact: InsertContact): Promise<Contact> {
    const [result] = await db.insert(contacts).values(contact).returning();
    return result;
  }
  
  async getContact(id: number): Promise<Contact | undefined> {
    const [result] = await db.select().from(contacts).where(eq(contacts.id, id));
    return result;
  }
  
  async getContactsByOrganization(organizationId: number): Promise<Contact[]> {
    return await db.select().from(contacts).where(eq(contacts.orgId, organizationId));
  }
  
  async getContacts(limit = 50): Promise<Contact[]> {
    return await db.select().from(contacts).limit(limit);
  }
  
  async updateContact(id: number, updates: Partial<InsertContact>): Promise<Contact | undefined> {
    const [result] = await db.update(contacts).set(updates).where(eq(contacts.id, id)).returning();
    return result;
  }
  
  async deleteContact(id: number): Promise<boolean> {
    const result = await db.delete(contacts).where(eq(contacts.id, id));
    return result.rowCount > 0;
  }
  
  // Campaign operations
  async createCampaign(campaign: InsertCampaign): Promise<Campaign> {
    const [result] = await db.insert(campaigns).values(campaign).returning();
    return result;
  }
  
  async getCampaign(id: number): Promise<Campaign | undefined> {
    const [result] = await db.select().from(campaigns).where(eq(campaigns.id, id));
    return result;
  }
  
  async getCampaignsByOrganization(organizationId: number): Promise<Campaign[]> {
    return await db.select().from(campaigns).where(eq(campaigns.orgId, organizationId));
  }
  
  async getCampaigns(limit = 50): Promise<Campaign[]> {
    return await db.select().from(campaigns).limit(limit);
  }
  
  async updateCampaign(id: number, updates: Partial<InsertCampaign>): Promise<Campaign | undefined> {
    const [result] = await db.update(campaigns).set(updates).where(eq(campaigns.id, id)).returning();
    return result;
  }
  
  async deleteCampaign(id: number): Promise<boolean> {
    const result = await db.delete(campaigns).where(eq(campaigns.id, id));
    return result.rowCount > 0;
  }
  
  // Workflow operations
  async createWorkflow(workflow: InsertWorkflow): Promise<Workflow> {
    const [result] = await db.insert(workflows).values(workflow).returning();
    return result;
  }
  
  async getWorkflow(id: number): Promise<Workflow | undefined> {
    const [result] = await db.select().from(workflows).where(eq(workflows.id, id));
    return result;
  }
  
  async getWorkflowsByOrganization(organizationId: number): Promise<Workflow[]> {
    return await db.select().from(workflows).where(eq(workflows.orgId, organizationId));
  }
  
  async getWorkflows(limit = 50): Promise<Workflow[]> {
    return await db.select().from(workflows).limit(limit);
  }
  
  async updateWorkflow(id: number, updates: Partial<InsertWorkflow>): Promise<Workflow | undefined> {
    const [result] = await db.update(workflows).set(updates).where(eq(workflows.id, id)).returning();
    return result;
  }
  
  async deleteWorkflow(id: number): Promise<boolean> {
    const result = await db.delete(workflows).where(eq(workflows.id, id));
    return result.rowCount > 0;
  }
  
  // Form operations
  async createForm(form: InsertForm): Promise<Form> {
    const [result] = await db.insert(forms).values(form).returning();
    return result;
  }
  
  async getForm(id: number): Promise<Form | undefined> {
    const [result] = await db.select().from(forms).where(eq(forms.id, id));
    return result;
  }
  
  async getFormsByOrganization(organizationId: number): Promise<Form[]> {
    return await db.select().from(forms).where(eq(forms.orgId, organizationId));
  }
  
  async getForms(limit = 50): Promise<Form[]> {
    return await db.select().from(forms).limit(limit);
  }
  
  async updateForm(id: number, updates: Partial<InsertForm>): Promise<Form | undefined> {
    const [result] = await db.update(forms).set(updates).where(eq(forms.id, id)).returning();
    return result;
  }
  
  async deleteForm(id: number): Promise<boolean> {
    const result = await db.delete(forms).where(eq(forms.id, id));
    return result.rowCount > 0;
  }
  
  // Form submission operations
  async createFormSubmission(submission: InsertFormSubmission): Promise<FormSubmission> {
    const [result] = await db.insert(formSubmissions).values(submission).returning();
    return result;
  }
  
  async getFormSubmission(id: number): Promise<FormSubmission | undefined> {
    const [result] = await db.select().from(formSubmissions).where(eq(formSubmissions.id, id));
    return result;
  }
  
  async getFormSubmissionsByForm(formId: number): Promise<FormSubmission[]> {
    return await db.select().from(formSubmissions).where(eq(formSubmissions.formId, formId));
  }
  
  async getFormSubmissions(limit = 50): Promise<FormSubmission[]> {
    return await db.select().from(formSubmissions).limit(limit);
  }
  
  // Affiliate product operations
  async createAffiliateProduct(product: InsertAffiliateProduct): Promise<AffiliateProduct> {
    const [result] = await db.insert(affiliateProducts).values(product).returning();
    return result;
  }
  
  async getAffiliateProduct(id: number): Promise<AffiliateProduct | undefined> {
    const [result] = await db.select().from(affiliateProducts).where(eq(affiliateProducts.id, id));
    return result;
  }
  
  async getAffiliateProductsByOrganization(organizationId: number): Promise<AffiliateProduct[]> {
    return await db.select().from(affiliateProducts).where(eq(affiliateProducts.orgId, organizationId));
  }
  
  async getAffiliateProducts(limit = 50): Promise<AffiliateProduct[]> {
    return await db.select().from(affiliateProducts).limit(limit);
  }
  
  async updateAffiliateProduct(id: number, updates: Partial<InsertAffiliateProduct>): Promise<AffiliateProduct | undefined> {
    const [result] = await db.update(affiliateProducts).set(updates).where(eq(affiliateProducts.id, id)).returning();
    return result;
  }
  
  async deleteAffiliateProduct(id: number): Promise<boolean> {
    const result = await db.delete(affiliateProducts).where(eq(affiliateProducts.id, id));
    return result.rowCount > 0;
  }

  // Campaign Artifact operations (stub implementations)
  async getCampaignArtifacts(campaignId: number): Promise<any[]> {
    // TODO: Implement with campaign_artifacts table
    return [];
  }
  
  // Segment operations (stub implementations)
  async getSegment(id: number): Promise<any | undefined> {
    // TODO: Implement with segments table
    return undefined;
  }
  
  async getContactsBySegment(segmentId: number): Promise<Contact[]> {
    // TODO: Implement with segment rules
    return [];
  }
  
  // Campaign Recipient operations (stub implementations)  
  async createCampaignRecipient(recipient: any): Promise<any> {
    // TODO: Implement with campaign_recipients table
    console.log('Creating campaign recipient (stub):', recipient);
    return { id: Date.now(), ...recipient };
  }
  
  async getCampaignRecipientsByEmail(email: string): Promise<any[]> {
    // TODO: Implement with campaign_recipients table
    return [];
  }
  
  async updateCampaignRecipient(id: number, updates: any): Promise<any> {
    // TODO: Implement with campaign_recipients table
    console.log('Updating campaign recipient (stub):', { id, updates });
    return { id, ...updates };
  }
  
  // Analytics Event operations
  async createAnalyticsEvent(event: InsertAnalyticsEvent): Promise<AnalyticsEvent> {
    const [result] = await db.insert(analyticsEvents).values(event).returning();
    return result;
  }

  // A/B Testing operations
  async createABTest(test: InsertABTest): Promise<ABTest> {
    const [result] = await db.insert(abTests).values(test).returning();
    return result;
  }

  async getABTest(id: number): Promise<ABTest | undefined> {
    const [result] = await db.select().from(abTests).where(eq(abTests.id, id));
    return result;
  }

  async getABTestsByEntity(entity: string, contextJson: any): Promise<ABTest[]> {
    const results = await db
      .select()
      .from(abTests)
      .where(
        and(
          eq(abTests.entity, entity),
          eq(abTests.status, "running")
        )
      );
    return results;
  }

  async updateABTest(id: number, updates: Partial<InsertABTest>): Promise<ABTest | undefined> {
    const [result] = await db
      .update(abTests)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(abTests.id, id))
      .returning();
    return result;
  }

  async deleteABTest(id: number): Promise<boolean> {
    const result = await db.delete(abTests).where(eq(abTests.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // A/B Assignment operations  
  async createABAssignment(assignment: InsertABAssignment): Promise<ABAssignment> {
    const [result] = await db.insert(abAssignments).values(assignment).returning();
    return result;
  }

  async getABAssignment(testId: number, contactId?: number, anonId?: string): Promise<ABAssignment | undefined> {
    const conditions = [eq(abAssignments.abTestId, testId)];
    
    if (contactId) {
      conditions.push(eq(abAssignments.contactId, contactId));
    } else if (anonId) {
      conditions.push(eq(abAssignments.anonId, anonId));
    }

    const [result] = await db
      .select()
      .from(abAssignments)
      .where(and(...conditions));
    return result;
  }

  async getABAssignmentsByTest(testId: number): Promise<ABAssignment[]> {
    const results = await db
      .select()
      .from(abAssignments)
      .where(eq(abAssignments.abTestId, testId));
    return results;
  }

  async getABTestResults(testId: number): Promise<{ variantA: number; variantB: number }> {
    const assignments = await this.getABAssignmentsByTest(testId);
    const variantA = assignments.filter(a => a.variant === 'A').length;
    const variantB = assignments.filter(a => a.variant === 'B').length;
    return { variantA, variantB };
  }

  async updateContactAttribution(contactId: number, utmData: any, touchType: 'first' | 'last'): Promise<Contact | undefined> {
    const updateData: any = {};
    const now = new Date();

    if (touchType === 'first') {
      updateData.firstTouchUtmSource = utmData.utm_source;
      updateData.firstTouchUtmMedium = utmData.utm_medium;
      updateData.firstTouchUtmCampaign = utmData.utm_campaign;
      updateData.firstTouchUtmTerm = utmData.utm_term;
      updateData.firstTouchUtmContent = utmData.utm_content;
      updateData.firstTouchGclid = utmData.gclid;
      updateData.firstTouchFbclid = utmData.fbclid;
      updateData.firstTouchAt = now;
    } else {
      updateData.lastTouchUtmSource = utmData.utm_source;
      updateData.lastTouchUtmMedium = utmData.utm_medium;
      updateData.lastTouchUtmCampaign = utmData.utm_campaign;
      updateData.lastTouchUtmTerm = utmData.utm_term;
      updateData.lastTouchUtmContent = utmData.utm_content;
      updateData.lastTouchGclid = utmData.gclid;
      updateData.lastTouchFbclid = utmData.fbclid;
      updateData.lastTouchAt = now;
    }

    updateData.updatedAt = now;

    const [result] = await db
      .update(contacts)
      .set(updateData)
      .where(eq(contacts.id, contactId))
      .returning();
    return result;
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
  
  async getApiIntegrationById(id: number): Promise<ApiIntegration | undefined> {
    const [integration] = await db
      .select()
      .from(apiIntegrations)
      .where(eq(apiIntegrations.id, id));
    return integration;
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
  
  async getSocialMediaPlatforms(): Promise<SocialMediaPlatform[]> {
    return db
      .select()
      .from(socialMediaPlatforms)
      .where(eq(socialMediaPlatforms.isActive, true))
      .orderBy(asc(socialMediaPlatforms.platformName));
  }
  
  async getSocialMediaPlatformById(id: number): Promise<SocialMediaPlatform | undefined> {
    const [platform] = await db
      .select()
      .from(socialMediaPlatforms)
      .where(eq(socialMediaPlatforms.id, id));
    return platform;
  }
  
  async saveSocialMediaPlatform(platform: InsertSocialMediaPlatform): Promise<SocialMediaPlatform> {
    const [savedPlatform] = await db
      .insert(socialMediaPlatforms)
      .values(platform)
      .returning();
    return savedPlatform;
  }
  
  async getPublishedContentByUser(userId: number, limit = 20, offset = 0): Promise<PublishedContent[]> {
    return db
      .select()
      .from(publishedContent)
      .where(eq(publishedContent.userId, userId))
      .orderBy(desc(publishedContent.publishedAt))
      .limit(limit)
      .offset(offset);
  }
  
  async savePublishedContent(content: InsertPublishedContent): Promise<PublishedContent> {
    const [savedContent] = await db
      .insert(publishedContent)
      .values(content)
      .returning();
    return savedContent;
  }
  
  async saveIntegrationWebhook(webhook: InsertIntegrationWebhook): Promise<IntegrationWebhook> {
    const [result] = await db
      .insert(integrationWebhooks)
      .values(webhook)
      .returning();
    return result;
  }
  
  async getIntegrationWebhooksByUser(userId: number): Promise<IntegrationWebhook[]> {
    return db
      .select()
      .from(integrationWebhooks)
      .where(eq(integrationWebhooks.userId, userId))
      .orderBy(asc(integrationWebhooks.name));
  }
  
  async getIntegrationWebhooksByIntegration(integrationId: number): Promise<IntegrationWebhook[]> {
    return db
      .select()
      .from(integrationWebhooks)
      .where(eq(integrationWebhooks.integrationId, integrationId))
      .orderBy(asc(integrationWebhooks.name));
  }
  
  async logUserActivity(activityData: { userId: number, action: string, metadata?: any, ipAddress?: string, userAgent?: string }): Promise<void> {
    await db
      .insert(userActivityLogs)
      .values({
        userId: activityData.userId,
        action: activityData.action,
        metadata: activityData.metadata || null,
        ipAddress: activityData.ipAddress || null,
        userAgent: activityData.userAgent || null
      });
  }
  
  // Trending Emojis and Hashtags operations
  async getTrendingEmojisHashtags(niche: string): Promise<TrendingEmojisHashtags | undefined> {
    const [result] = await db
      .select()
      .from(trendingEmojisHashtags)
      .where(eq(trendingEmojisHashtags.niche, niche))
      .orderBy(desc(trendingEmojisHashtags.lastUpdated))
      .limit(1);
    
    return result;
  }
  
  async saveTrendingEmojisHashtags(data: InsertTrendingEmojisHashtags): Promise<TrendingEmojisHashtags> {
    // Check if there's an existing entry for this niche
    const [existing] = await db
      .select()
      .from(trendingEmojisHashtags)
      .where(eq(trendingEmojisHashtags.niche, data.niche));
    
    if (existing) {
      // Update existing record
      const [updated] = await db
        .update(trendingEmojisHashtags)
        .set({
          emojis: data.emojis,
          hashtags: data.hashtags,
          lastUpdated: new Date()
        })
        .where(eq(trendingEmojisHashtags.id, existing.id))
        .returning();
      
      return updated;
    } else {
      // Insert new record
      const [newRecord] = await db
        .insert(trendingEmojisHashtags)
        .values({
          niche: data.niche,
          hashtags: data.hashtags,
          emojis: data.emojis,
          lastUpdated: new Date(),
          createdAt: new Date()
        })
        .returning();
      
      return newRecord;
    }
  }
  
  async getAllTrendingEmojisHashtags(): Promise<TrendingEmojisHashtags[]> {
    return await db
      .select()
      .from(trendingEmojisHashtags)
      .orderBy(desc(trendingEmojisHashtags.lastUpdated));
  }
}

// Switch to database storage
export const storage = new DatabaseStorage();
