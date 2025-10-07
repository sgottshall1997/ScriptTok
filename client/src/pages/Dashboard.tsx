import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useLocation } from "wouter";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

import { 
  ArrowRight, 
  TrendingUp, 
  BarChart3, 
  Clock, 
  Loader2, 
  RefreshCw, 
  Sparkles,
  Wand2,
  Eye,
  Zap,
  Target,
  RotateCcw,
  ShoppingBag,
  ChevronDown,
  HelpCircle,
  Crown
} from "lucide-react";
import { DashboardTrendingResponse, TrendingProduct } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { trackEvent } from "@/lib/analytics";
import { isAmazonEnabled } from '@shared/constants';
import { useCTATracking } from "@/hooks/use-cta-tracking";
import TrendForecaster from "@/components/TrendForecaster";
import { useUsageData } from "@/hooks/useUsageData";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location, setLocation] = useLocation();
  const [selectedNicheFilter, setSelectedNicheFilter] = useState('all');
  const [selectedDataSource, setSelectedDataSource] = useState<'perplexity' | 'amazon'>('perplexity');
  const [isDashboardInfoOpen, setIsDashboardInfoOpen] = useState(false);
  const { trackUpgradeCTA } = useCTATracking();
  
  // Fetch usage data for the widget
  const { data: usageResponse, isLoading: usageLoading } = useUsageData();
  const usageData = usageResponse?.data;

  // Fetch trending products for all niches (Perplexity organized by niche)
  const { data: trendingProducts, isLoading: trendingLoading, refetch: refetchTrending } = useQuery<DashboardTrendingResponse>({
    queryKey: ['/api/trending'],
    retry: false,
    staleTime: 0, // Always consider data stale
    gcTime: 0, // Don't cache the data (updated from cacheTime)
  });

  // Fetch all trending products (includes Amazon products)
  const { data: allTrendingProducts = [], isLoading: allTrendingLoading } = useQuery<TrendingProduct[]>({
    queryKey: ['/api/trending/products'],
  });

  // Fetch Perplexity status for last run display
  const { data: perplexityStatus } = useQuery<{
    success: boolean;
    lastRun: string;
    timeSince: string;
    nextScheduled: string;
    totalProducts: number;
  }>({
    queryKey: ['/api/perplexity-status/last-run'],
    refetchInterval: 60000, // Refresh every minute
  });


  // Fetch Amazon status for integration display
  const { data: amazonStatus } = useQuery<{
    configured: boolean;
    partnerTag: string;
    region: string;
    apiHost: string;
    apiStatus: {
      connected: boolean;
      error: string | null;
    };
    cache: {
      type: string;
      keyCount: number;
      isHealthy: boolean;
    };
    timestamp: string;
  }>({
    queryKey: ['/api/amazon/status'],
    refetchInterval: 60000, // Refresh every minute
  });


  // Individual product refresh mutation
  const refreshIndividualMutation = useMutation({
    mutationFn: async ({ productId, niche }: { productId: number; niche: string }) => {
      const response = await fetch('/api/perplexity-trends/refresh-individual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, niche }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to refresh product');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Product Refreshed",
        description: `Updated "${data.originalTitle}" to "${data.newTitle}"`,
      });
      // Invalidate and refetch trending products
      queryClient.invalidateQueries({ queryKey: ['/api/trending'] });
    },
    onError: (error) => {
      toast({
        title: "Refresh Failed",
        description: error instanceof Error ? error.message : "Failed to refresh product",
        variant: "destructive",
      });
    },
  });

  // Amazon fetch mutation
  const amazonMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/pull-amazon-trends', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "✅ Amazon Fetch Complete",
        description: data.message || "Fresh trending products loaded from Amazon PA-API!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/trending/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/trending'] });
    },
    onError: (error) => {
      console.error('Amazon fetch error:', error);
      toast({
        title: "❌ Fetch Failed",
        description: "Could not fetch new trends from Amazon. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Get Perplexity products (exactly 3 per niche, balanced representation)
  const getPerplexityProducts = () => {
    if (!trendingProducts?.data) return [];
    
    const allNiches = ['beauty', 'tech', 'fashion', 'fitness', 'food', 'travel', 'pets'];
    const perplexityProducts: TrendingProduct[] = [];
    
    // Get exactly 3 products from each niche
    allNiches.forEach(niche => {
      const nicheProducts = trendingProducts.data[niche] || [];
      const uniqueProducts = nicheProducts
        .reduce((unique: TrendingProduct[], current) => {
          if (!unique.some(p => p.title === current.title)) {
            unique.push(current);
          }
          return unique;
        }, [])
        .slice(0, 3); // Take exactly 3 from each niche
      perplexityProducts.push(...uniqueProducts);
    });
    
    // Debug logging to see what products we're getting
    console.log('🔍 Dashboard Debug - Balanced Perplexity products:', perplexityProducts.length);
    perplexityProducts.forEach((p, i) => {
      console.log(`  ${i+1}. ${p.title} (${p.niche}) - Created: ${p.createdAt}`);
    });
    
    // Show products by niche for clarity
    const byNiche = perplexityProducts.reduce((acc, p) => {
      if (!acc[p.niche]) acc[p.niche] = [];
      acc[p.niche].push(p.title);
      return acc;
    }, {} as Record<string, string[]>);
    
    console.log('🎯 Products by niche on dashboard:', byNiche);
    console.log('📊 Products count by niche:', Object.entries(byNiche).map(([niche, products]) => `${niche}: ${products.length}`).join(', '));
    
    return perplexityProducts; // Return all products (up to 21)
  };

  // Get Amazon products from the unified products list
  const getAmazonProducts = () => {
    return allTrendingProducts.filter(product => product.dataSource === 'amazon');
  };

  // Get current products based on selected data source
  const getCurrentProducts = () => {
    if (selectedDataSource === 'perplexity') {
      return getPerplexityProducts();
    } else {
      return getAmazonProducts();
    }
  };

  // Filter products based on selected niche and data source
  const getFilteredProducts = () => {
    const products = getCurrentProducts();
    if (selectedNicheFilter === 'all') {
      return products;
    }
    return products.filter(product => product.niche === selectedNicheFilter);
  };

  // Group products by niche for tier-based display
  const getProductsByNiche = () => {
    const products = getFilteredProducts();
    const grouped: Record<string, TrendingProduct[]> = {};
    
    products.forEach(product => {
      if (!grouped[product.niche]) {
        grouped[product.niche] = [];
      }
      grouped[product.niche].push(product);
    });
    
    return grouped;
  };

  // Check if user should see limited products (free tier)
  const shouldLimitProducts = () => {
    return usageData?.tier === 'free';
  };

  // Get limited products for a niche (1 for free, all for pro)
  const getLimitedNicheProducts = (products: TrendingProduct[]) => {
    if (!shouldLimitProducts()) return products;
    return products.slice(0, 1);
  };

  // Check if niche has more products for pro
  const hasMoreProducts = (products: TrendingProduct[]) => {
    return shouldLimitProducts() && products.length > 1;
  };

  // Get available niches for dropdown
  const getAvailableNiches = () => {
    const products = getCurrentProducts();
    const niches = Array.from(new Set(products.map(product => product.niche).filter(Boolean)));
    return niches.sort();
  };

  // Niche color mapping
  const getNicheColor = (niche: string) => {
    const colors: Record<string, string> = {
      'beauty': 'bg-pink-100 text-pink-800',
      'tech': 'bg-purple-100 text-purple-800', 
      'fashion': 'bg-purple-100 text-purple-800',
      'fitness': 'bg-green-100 text-green-800',
      'food': 'bg-orange-100 text-orange-800',
      'travel': 'bg-cyan-100 text-cyan-800',
      'pets': 'bg-yellow-100 text-yellow-800',
    };
    return colors[niche] || 'bg-gray-100 text-gray-800';
  };

  // Helper function to determine progress bar color based on usage percentage
  const getProgressColor = (percentage: number): string => {
    if (percentage > 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Helper function to check if user is approaching limits
  const isApproachingLimit = (): boolean => {
    if (!usageData || usageData.tier !== 'free') return false;
    const gptPercentage = (usageData.gpt.used / usageData.gpt.limit) * 100;
    const claudePercentage = (usageData.claude.used / usageData.claude.limit) * 100;
    const trendPercentage = (usageData.trendAnalyses.used / usageData.trendAnalyses.limit) * 100;
    return gptPercentage > 70 || claudePercentage > 70 || trendPercentage > 70;
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* 1️⃣ Hero Header */}
      <div className="text-center space-y-3 px-2 py-6 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl border border-purple-100">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          🚀 ScriptTok AI: Your Viral Content Command Center
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-gray-700 max-w-3xl mx-auto">
          Discover trends → Generate viral content → Track performance. All powered by Perplexity AI + Claude + GPT.
        </p>
      </div>

      {/* 📊 Usage Widget */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200" data-testid="card-usage-widget">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-xl flex items-center gap-2">
              📊 Your Usage & Limits
            </CardTitle>
            {usageLoading ? (
              <Skeleton className="h-6 w-24" />
            ) : usageData ? (
              usageData.tier === 'free' ? (
                <Badge variant="secondary" className="bg-gray-200 text-gray-700 w-fit" data-testid="badge-tier-free">
                  Free Plan
                </Badge>
              ) : (
                <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white w-fit" data-testid="badge-tier-pro">
                  <Crown className="h-3 w-3 mr-1" />
                  Pro Plan
                </Badge>
              )
            ) : null}
          </div>
        </CardHeader>
        <CardContent>
          {usageLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-2 w-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          ) : usageData ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* GPT Generations */}
                <div className="space-y-2" data-testid="usage-stat-gpt">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">GPT Generations</span>
                    <span className="text-xs text-gray-500">
                      {usageData.gpt.used} / {usageData.gpt.limit}
                    </span>
                  </div>
                  <Progress 
                    value={(usageData.gpt.used / usageData.gpt.limit) * 100} 
                    className="h-2"
                    indicatorClassName={getProgressColor((usageData.gpt.used / usageData.gpt.limit) * 100)}
                  />
                  <p className="text-xs text-gray-600">
                    {usageData.gpt.remaining} remaining
                  </p>
                </div>

                {/* Claude Generations */}
                <div className="space-y-2" data-testid="usage-stat-claude">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Claude Generations</span>
                    <span className="text-xs text-gray-500">
                      {usageData.claude.used} / {usageData.claude.limit}
                    </span>
                  </div>
                  <Progress 
                    value={(usageData.claude.used / usageData.claude.limit) * 100} 
                    className="h-2"
                    indicatorClassName={getProgressColor((usageData.claude.used / usageData.claude.limit) * 100)}
                  />
                  <p className="text-xs text-gray-600">
                    {usageData.claude.remaining} remaining
                  </p>
                </div>

                {/* Trend Analyses */}
                <div className="space-y-2" data-testid="usage-stat-trends">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Trend Analyses</span>
                    <span className="text-xs text-gray-500">
                      {usageData.trendAnalyses.used} / {usageData.trendAnalyses.limit}
                    </span>
                  </div>
                  <Progress 
                    value={(usageData.trendAnalyses.used / usageData.trendAnalyses.limit) * 100} 
                    className="h-2"
                    indicatorClassName={getProgressColor((usageData.trendAnalyses.used / usageData.trendAnalyses.limit) * 100)}
                  />
                  <p className="text-xs text-gray-600">
                    {usageData.trendAnalyses.remaining} remaining
                  </p>
                </div>
              </div>

              {/* Upgrade CTA for free users approaching limits */}
              {isApproachingLimit() && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg" data-testid="upgrade-cta">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-2">
                      <span className="text-yellow-600 text-lg">⚠️</span>
                      <div>
                        <p className="text-sm font-semibold text-yellow-800">
                          Approaching your monthly limit
                        </p>
                        <p className="text-xs text-yellow-700 mt-1">
                          Upgrade to Pro for unlimited generations and advanced features
                        </p>
                      </div>
                    </div>
                    <Link href="/account">
                      <Button 
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white whitespace-nowrap"
                        data-testid="button-upgrade-to-pro"
                        onClick={() => trackUpgradeCTA('dashboard_usage_widget', 'pro')}
                      >
                        <Crown className="h-4 w-4 mr-2" />
                        Upgrade to Pro
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center text-gray-500">
              <p className="text-sm">Unable to load usage data</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dashboard Overview Dropdown */}
      <Collapsible open={isDashboardInfoOpen} onOpenChange={setIsDashboardInfoOpen} className="w-full">
        <CollapsibleTrigger asChild>
          <Card className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-purple-200 bg-purple-50 dark:bg-purple-950" data-testid="button-dashboard-info">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-purple-600" />
                  <CardTitle className="text-lg text-purple-900 dark:text-purple-100">
                    📱 What is ScriptTok? Click to learn about each section
                  </CardTitle>
                </div>
                <ChevronDown 
                  className={`h-4 w-4 text-purple-600 transition-transform duration-200 ${
                    isDashboardInfoOpen ? 'rotate-180' : ''
                  }`} 
                />
              </div>
            </CardHeader>
          </Card>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Card className="border-purple-200 bg-purple-50 dark:bg-purple-950 border-t-0 rounded-t-none">
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">
                    🚀 ScriptTok TikTok Viral Product Generator
                  </h3>
                  <p className="text-purple-800 dark:text-purple-200 text-sm leading-relaxed">
                    ScriptTok is your AI-powered command center for creating viral TikTok content from trending products. This streamlined dashboard gives you everything you need to discover trends, generate engaging content, and track performance - all powered by advanced AI models including Claude, GPT, and Perplexity.
                  </p>
                </div>

                {/* Perplexity AI Capabilities Section */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                  <h4 className="text-base font-semibold text-purple-900 dark:text-purple-100 mb-3 flex items-center">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Powered by Perplexity AI: Real-Time Intelligence
                  </h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="bg-white dark:bg-gray-800 p-3 rounded border border-purple-100 dark:border-purple-700">
                      <h5 className="text-xs font-semibold text-purple-800 dark:text-purple-200 mb-1">🔮 Trend Forecasting</h5>
                      <p className="text-xs text-purple-600 dark:text-purple-300">Real-time web analysis to predict viral trends before they explode. Categories trends as Hot, Rising, Upcoming, or Declining with specific product recommendations.</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded border border-pink-100 dark:border-pink-700">
                      <h5 className="text-xs font-semibold text-pink-800 dark:text-pink-200 mb-1">🔥 AI-Powered Trending Products</h5>
                      <p className="text-xs text-pink-600 dark:text-pink-300">Automatic discovery of viral products across all niches using live web research. Gets what's trending now, not what was trending last week.</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded border border-purple-100 dark:border-purple-700">
                      <h5 className="text-xs font-semibold text-purple-800 dark:text-purple-200 mb-1">📱 TikTok Trend Analysis</h5>
                      <p className="text-xs text-purple-600 dark:text-purple-300">Deep analysis of TikTok's viral patterns, hashtag performance, and content formats to align your content with platform trends.</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded border border-green-100 dark:border-green-700">
                      <h5 className="text-xs font-semibold text-green-800 dark:text-green-200 mb-1">📊 Viral Competitor Analysis</h5>
                      <p className="text-xs text-green-600 dark:text-green-300">Research successful competitor videos and viral strategies to understand what makes content go viral in your specific niche.</p>
                    </div>
                  </div>
                  <div className="mt-3 p-2 bg-white dark:bg-gray-800 rounded border border-purple-100 dark:border-purple-700">
                    <p className="text-xs text-purple-700 dark:text-purple-300">
                      <strong>Why this matters:</strong> While other tools show historical data, Perplexity gives you real-time web intelligence. 
                      This means you create content about trends as they emerge, not after they peak - giving you the competitive edge to go viral first.
                    </p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-3 gap-4 mt-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-purple-900 dark:text-purple-100 text-sm">🎯 Unified Content Generator</h4>
                    <p className="text-xs text-purple-700 dark:text-purple-300">Generate optimized content for TikTok, Instagram, YouTube, Twitter, and Facebook simultaneously. Create engaging captions with trending product data and integrated affiliate monetization.</p>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold text-purple-900 dark:text-purple-100 text-sm">📊 Content History & Analytics</h4>
                    <p className="text-xs text-purple-700 dark:text-purple-300">Track your content performance with comprehensive analytics and historical data. Monitor engagement metrics, view top-rated posts, and analyze generation patterns to optimize your viral content strategy.</p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-purple-900 dark:text-purple-100 text-sm">🤖 Advanced AI Integration</h4>
                    <p className="text-xs text-purple-700 dark:text-purple-300">Leverage multiple AI models with intelligent routing and optimization. Access Claude AI suggestions, model testing capabilities, and advanced configuration options for superior content quality.</p>
                  </div>
                </div>
                
                {/* ScriptTok Intelligence Flow Diagram */}
                <div className="mt-6">
                  <h4 className="text-base font-semibold text-purple-900 dark:text-purple-100 mb-4 text-center">How ScriptTok Creates Smart Content</h4>
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-2">
                      
                      {/* Step 1: Perplexity Discovery */}
                      <div className="flex-1 text-center p-3 bg-white dark:bg-gray-800 rounded-lg border-2 border-purple-300 dark:border-purple-700 shadow-sm">
                        <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <TrendingUp className="h-5 w-5 text-white" />
                        </div>
                        <h5 className="font-bold text-purple-800 dark:text-purple-200 mb-1 text-xs">Perplexity Discovery</h5>
                        <p className="text-xs text-purple-700 dark:text-purple-300">Finds trending products for each niche using real-time web research</p>
                      </div>

                      {/* Arrow 1 */}
                      <div className="hidden md:block">
                        <ArrowRight className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="md:hidden">
                        <div className="h-5 w-5 rotate-90">
                          <ArrowRight className="h-5 w-5 text-purple-600" />
                        </div>
                      </div>

                      {/* Step 2: Product Selection */}
                      <div className="flex-1 text-center p-3 bg-white dark:bg-gray-800 rounded-lg border-2 border-purple-300 dark:border-purple-700 shadow-sm">
                        <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <Target className="h-5 w-5 text-white" />
                        </div>
                        <h5 className="font-bold text-purple-800 dark:text-purple-200 mb-1 text-xs">Select Product</h5>
                        <p className="text-xs text-purple-700 dark:text-purple-300">Choose from AI-discovered trending products across all niches</p>
                      </div>

                      {/* Arrow 2 */}
                      <div className="hidden md:block">
                        <ArrowRight className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="md:hidden">
                        <div className="h-5 w-5 rotate-90">
                          <ArrowRight className="h-5 w-5 text-purple-600" />
                        </div>
                      </div>

                      {/* Step 3: TikTok Analysis */}
                      <div className="flex-1 text-center p-3 bg-white dark:bg-gray-800 rounded-lg border-2 border-pink-300 dark:border-pink-700 shadow-sm">
                        <div className="w-10 h-10 bg-pink-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <Eye className="h-5 w-5 text-white" />
                        </div>
                        <h5 className="font-bold text-pink-800 dark:text-pink-200 mb-1 text-xs">TikTok Analysis</h5>
                        <p className="text-xs text-pink-700 dark:text-pink-300">Analyzes viral competitors and TikTok trends for selected product</p>
                      </div>

                      {/* Arrow 3 */}
                      <div className="hidden md:block">
                        <ArrowRight className="h-5 w-5 text-pink-600" />
                      </div>
                      <div className="md:hidden">
                        <div className="h-5 w-5 rotate-90">
                          <ArrowRight className="h-5 w-5 text-pink-600" />
                        </div>
                      </div>

                      {/* Step 4: AI Generation */}
                      <div className="flex-1 text-center p-3 bg-white dark:bg-gray-800 rounded-lg border-2 border-green-300 dark:border-green-700 shadow-sm">
                        <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <Sparkles className="h-5 w-5 text-white" />
                        </div>
                        <h5 className="font-bold text-green-800 dark:text-green-200 mb-1 text-xs">AI Content Creation</h5>
                        <p className="text-xs text-green-700 dark:text-green-300">Passes all data to ChatGPT/Claude for intelligent content output</p>
                      </div>

                      {/* Arrow 4 */}
                      <div className="hidden md:block">
                        <ArrowRight className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="md:hidden">
                        <div className="h-5 w-5 rotate-90">
                          <ArrowRight className="h-5 w-5 text-green-600" />
                        </div>
                      </div>

                      {/* Step 5: Viral Score Analysis */}
                      <div className="flex-1 text-center p-3 bg-white dark:bg-gray-800 rounded-lg border-2 border-orange-300 dark:border-orange-700 shadow-sm">
                        <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <BarChart3 className="h-5 w-5 text-white" />
                        </div>
                        <h5 className="font-bold text-orange-800 dark:text-orange-200 mb-1 text-xs">Viral Score Rating</h5>
                        <p className="text-xs text-orange-700 dark:text-orange-300">AI analyzes and rates output based on viral potential and engagement</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-purple-200 dark:border-purple-800 mt-4">
                  <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                    💡 <strong>Quick Start:</strong> Use the Trend Forecaster to discover viral opportunities, explore trending picks, then generate content with the Unified Generator. Monitor performance through Content History & Analytics.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* DISABLED: Amazon Associates Links - Hidden when Amazon features are disabled */}
      {isAmazonEnabled() && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-lg text-green-800">💰 Amazon Associates Links</CardTitle>
            <p className="text-sm text-green-700">Quick access to your monetized affiliate links</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">Hero Balancing Capsule Skin Toner for Face</h4>
                  <p className="text-sm text-gray-600">Clear Collective skincare toner</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    window.open('https://www.amazon.com/Clear-Collective-Balancing-Capsule-Cosmetics/dp/B08ZC9TDK1?crid=3MOXKHJ60L9OO&dib=eyJ2IjoiMSJ9.t-qLuRQDg3jvZzYqGoZnJgWgpH04WhI4HjnM5D9VuWoUfMcbfznQ_jYuso0Smrpc.CYZuI41q95ZFy7oeuyyPkWXhd2wZkeIg_plh16oWNV0&dib_tag=se&keywords=Hero+My+First+Serum+1.69+fl+oz&qid=1751963188&sprefix=hero+my+first+serum+1.69+fl+oz%2Caps%2C86&sr=8-1-spons&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&psc=1&linkCode=ll1&tag=sgottshall107-20&linkId=9066da88b48cf8c3ecd45a95550bbaa8&language=en_US&ref_=as_li_ss_tl', '_blank');
                  }}
                  className="text-green-700 border-green-300 hover:bg-green-100"
                >
                  View Product
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">Mighty Patch™ Original patch from Hero Cosmetics</h4>
                  <p className="text-sm text-gray-600">Hydrocolloid acne patches</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    window.open('https://www.amazon.com/Mighty-Patch-Hydrocolloid-Absorbing-count/dp/B074PVTPBW?crid=L3MKDR9O518A&dib=eyJ2IjoiMSJ9.ZqkNz1mKqBfuWXjhTF80erAbYqDKd-5BZvwgUXNPN4ccey7JLc1B7pNY8H6e-HMn9OTSA2N0c2AZvg5rLuLUdxBPsUdWRvhySJEcvwH0VH83awIxKTR1R0kjbr1StNtbtKugjVluAT0w757UzdoHrPBmXyLLQgdCFZoLvdxuQ0X_HY-0tQa1i6KeI62kXW5zMvqerYgKjVxgzoGxjWRT2D9NU64glAoDSrO4OYIpU5PcS0I0l7tIS2UxL8x4i7MYHkw_cTtzSGY57KzkwaBcFmf8Ub1cmfa1CpxES0wOBlU.oOHtP44MOGQL4Ayq9g-5KuMKc-yjrINQ7Hp6FjzyKGM&dib_tag=se&keywords=might%2Bpatch&qid=1751963397&sprefix=might%2Bpatch%2Caps%2C126&sr=8-1-spons&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&th=1&linkCode=ll1&tag=sgottshall107-20&linkId=0c6ee4ac6ddb66dbe13b0d16dc1c3fda&language=en_US&ref_=as_li_ss_tl', '_blank');
                  }}
                  className="text-green-700 border-green-300 hover:bg-green-100"
                >
                  View Product
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 2️⃣ Trend Forecaster */}
      <TrendForecaster />

      {/* 3️⃣ AI-Powered Trending Picks (Unified) */}
      <Card data-testid="card-unified-trending-picks" className="border-purple-100">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 pb-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg">
          <div className="space-y-1">
            <CardTitle className="text-xl md:text-2xl font-bold text-purple-900">
              🔥 AI-Powered Trending Products
            </CardTitle>
            <p className="text-sm text-purple-700">
              {selectedDataSource === 'perplexity' 
                ? 'Hottest products discovered by Perplexity AI across all niches' 
                : 'Real-time product discovery via Amazon PA-API'
              }
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedNicheFilter} onValueChange={setSelectedNicheFilter}>
              <SelectTrigger className="w-[180px] border-purple-200">
                <SelectValue placeholder="Filter by niche" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Niches</SelectItem>
                {getAvailableNiches().map((niche) => (
                  <SelectItem key={niche} value={niche}>
                    {niche.charAt(0).toUpperCase() + niche.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        {/* Status Section - Conditional Based on Data Source */}
        <CardContent className="pt-0 pb-4">
          {selectedDataSource === 'perplexity' ? (
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    <span className="font-medium text-purple-900">AI-Powered Trending Picks</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Last updated</p>
                    <p className="text-xs font-semibold text-gray-700">
                      {perplexityStatus ? perplexityStatus.timeSince : 'Loading...'}
                    </p>
                    <p className="text-xs text-purple-600 mt-1">
                      Auto-refreshes daily at 5 AM ET
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200" data-testid="card-amazon-status">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="h-5 w-5 text-orange-600" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-orange-900">Amazon PA-API Status</span>
                      {amazonStatus ? (
                        <Badge 
                          variant="secondary" 
                          className={amazonStatus.apiStatus.connected ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                          data-testid="badge-api-status"
                        >
                          {amazonStatus.apiStatus.connected ? 'Connected' : 'Disconnected'}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                          Loading...
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-orange-700 mt-1">
                      {amazonStatus ? (
                        <>
                          <div><strong>Partner Tag:</strong> {amazonStatus.partnerTag}</div>
                          <div><strong>Region:</strong> {amazonStatus.region}</div>
                          <div><strong>Cache:</strong> {amazonStatus.cache.keyCount} items ({amazonStatus.cache.isHealthy ? 'healthy' : 'unhealthy'})</div>
                          {amazonStatus.apiStatus.error && (
                            <div className="text-red-600"><strong>Error:</strong> {amazonStatus.apiStatus.error}</div>
                          )}
                        </>
                      ) : (
                        <div>Loading Amazon status...</div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
        
        {/* Products Display Section */}
        <CardContent>
          {(selectedDataSource === 'perplexity' ? trendingLoading : allTrendingLoading) ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {Array(6).fill(0).map((_, i) => (
                <Card key={i} className="p-3 md:p-4">
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
                    <div className="h-8 bg-gray-200 rounded animate-pulse" />
                  </div>
                </Card>
              ))}
            </div>
          ) : getFilteredProducts().length > 0 ? (
            <div className="space-y-6">
              {Object.entries(getProductsByNiche()).map(([niche, nicheProducts]) => (
                <div key={niche} className="space-y-3">
                  {/* Niche Header */}
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className={getNicheColor(niche)} variant="secondary">
                      {niche.charAt(0).toUpperCase() + niche.slice(1)}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {shouldLimitProducts() ? `1 of ${nicheProducts.length}` : nicheProducts.length} products
                    </span>
                  </div>
                  
                  {/* Products Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                    {getLimitedNicheProducts(nicheProducts).map((product) => (
                      <Card key={product.id} className="border border-gray-200 bg-white hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="space-y-4">
                            {/* Product Title */}
                            <div className="flex items-start justify-between gap-3">
                              <h3 className="font-semibold text-base leading-tight text-gray-900">
                                {selectedDataSource === 'amazon' ? '🛒' : '🤖'} {product.title}
                              </h3>
                              <Badge className={getNicheColor(product.niche)} variant="secondary">
                                {product.niche}
                              </Badge>
                            </div>
                            
                            {/* Why it's hot */}
                            <div className="text-sm text-gray-600">
                              <span className="text-yellow-600">✨ Why it's hot:</span>
                              <span className="ml-1">{product.reason || 'Trending across social platforms'}</span>
                            </div>

                            {/* Product data */}
                            {product.price && (
                              <div className="text-xs text-green-600 font-medium">
                                💰 Price: {product.price}
                              </div>
                            )}
                            {product.rating && (
                              <div className="text-xs text-yellow-600">
                                ⭐ Rating: {product.rating}/5
                              </div>
                            )}
                            {product.asin && (
                              <div className="text-xs text-purple-600">
                                📦 ASIN: {product.asin}
                              </div>
                            )}
                            
                            {/* Action Buttons */}
                            <div className="flex gap-2 pt-2">
                              <Button 
                                size="sm" 
                                className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                                onClick={() => {
                                  const url = `/bulk-content-generation?product=${encodeURIComponent(product.title)}&niche=${product.niche}&autopopulate=true`;
                                  console.log('🔄 Navigating to:', url);
                                  trackEvent('trending_product_click', 'bulk_generator', `${product.niche}_${product.title}`, 1);
                                  setLocation(url);
                                  // Scroll to top after navigation
                                  setTimeout(() => window.scrollTo(0, 0), 100);
                                }}
                              >
                                <Zap className="h-3 w-3 mr-1" />
                                Generate Content
                              </Button>
                              {selectedDataSource === 'perplexity' && (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="border-gray-300"
                                  onClick={() => refreshIndividualMutation.mutate({ productId: product.id, niche: product.niche })}
                                  disabled={refreshIndividualMutation.isPending}
                                >
                                  {refreshIndividualMutation.isPending ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <RotateCcw className="h-3 w-3 mr-1" />
                                  )}
                                  Refresh
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  {/* Upgrade CTA for this niche */}
                  {hasMoreProducts(nicheProducts) && (
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-6 text-center">
                      <Crown className="h-10 w-10 mx-auto mb-3 text-purple-600" />
                      <h4 className="font-semibold text-gray-900 mb-2">
                        {nicheProducts.length - 1} More {niche.charAt(0).toUpperCase() + niche.slice(1)} Products Available
                      </h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Upgrade to Pro to unlock all trending products for {niche}
                      </p>
                      <Button
                        onClick={() => setLocation('/account')}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        data-testid={`upgrade-${niche}-products`}
                      >
                        Upgrade to Pro
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>
                {selectedDataSource === 'perplexity' 
                  ? 'No Perplexity trends available yet. Trends automatically refresh daily at 5 AM ET.'
                  : 'No Amazon products available yet. Products automatically refresh daily at 5 AM ET.'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3️⃣ Fast-Action Buttons Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <Link href="/unified-generator" onClick={() => setTimeout(() => window.scrollTo(0, 0), 100)}>
          <Card className="hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 hover:border-purple-300">
            <CardContent className="p-6 md:p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Wand2 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-purple-900 mb-2">🎯 AI Content Studio</h3>
              <p className="text-sm text-purple-700 mb-4">Generate viral content for all platforms in seconds</p>
              <div className="flex items-center justify-center text-purple-600 font-semibold">
                <span className="text-sm">Start Creating</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/content-history" onClick={() => setTimeout(() => window.scrollTo(0, 0), 100)}>
          <Card className="hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 hover:border-emerald-300">
            <CardContent className="p-6 md:p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-emerald-900 mb-2">📊 Performance Analytics</h3>
              <p className="text-sm text-emerald-700 mb-4">Track viral scores and optimize your content strategy</p>
              <div className="flex items-center justify-center text-emerald-600 font-semibold">
                <span className="text-sm">View Analytics</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

    </div>
  );
};

export default Dashboard;