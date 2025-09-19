import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useLocation } from "wouter";

import { 
  ArrowRight, 
  TrendingUp, 
  BarChart3, 
  Clock, 
  Loader2, 
  RefreshCw, 
  Sparkles,
  Wand2,
  Layers,
  Eye,
  Zap,
  Target,
  RotateCcw,
  ShoppingBag
} from "lucide-react";
import { DashboardTrendingResponse, TrendingProduct } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { trackEvent } from "@/lib/analytics";

const Dashboard = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location, setLocation] = useLocation();
  const [isPerplexityLoading, setIsPerplexityLoading] = useState(false);
  const [selectedNicheFilter, setSelectedNicheFilter] = useState('all');
  const [selectedDataSource, setSelectedDataSource] = useState<'perplexity' | 'amazon'>('perplexity');

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

  // Fetch Perplexity automation status
  const { data: automationStatus } = useQuery<{
    success: boolean;
    enabled: boolean;
    schedule: string;
    description: string;
    status: string;
  }>({
    queryKey: ['/api/perplexity-automation/status'],
    refetchInterval: 30000, // Refresh every 30 seconds
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

  // Toggle Perplexity automation mutation
  const toggleAutomationMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      const response = await fetch('/api/perplexity-automation/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enabled }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to toggle automation');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: data.enabled ? "Automation Enabled" : "Automation Disabled",
        description: data.message,
        variant: data.enabled ? "default" : "destructive",
      });
      // Refetch automation status
      queryClient.invalidateQueries({ queryKey: ['/api/perplexity-automation/status'] });
    },
    onError: (error) => {
      toast({
        title: "Toggle Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    },
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

  // Get available niches for dropdown
  const getAvailableNiches = () => {
    const products = getCurrentProducts();
    const niches = [...new Set(products.map(product => product.niche).filter(Boolean))];
    return niches.sort();
  };

  // Run Perplexity fetch
  const handlePerplexityFetch = async () => {
    setIsPerplexityLoading(true);
    try {
      const response = await fetch('/api/pull-perplexity-trends', {
        method: 'POST',
      });
      
      const result = await response.json();
      
      if (response.ok) {
        const filteredMessage = result.filtered > 0 ? 
          ` (${result.filtered} products filtered for quality)` : '';
        
        toast({
          title: "Success!",
          description: `Fresh trending data fetched from Perplexity${filteredMessage}`,
        });
        refetchTrending();
      } else {
        throw new Error(result.error || 'Failed to fetch');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch Perplexity trends",
        variant: "destructive",
      });
    } finally {
      setIsPerplexityLoading(false);
    }
  };

  const totalProducts = trendingProducts?.count || 0;
  const activeNiches = trendingProducts?.data ? Object.keys(trendingProducts.data).length : 0;

  // Niche color mapping
  const getNicheColor = (niche: string) => {
    const colors: Record<string, string> = {
      'beauty': 'bg-pink-100 text-pink-800',
      'tech': 'bg-blue-100 text-blue-800', 
      'fashion': 'bg-purple-100 text-purple-800',
      'fitness': 'bg-green-100 text-green-800',
      'food': 'bg-orange-100 text-orange-800',
      'travel': 'bg-cyan-100 text-cyan-800',
      'pets': 'bg-yellow-100 text-yellow-800',
    };
    return colors[niche] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* 1️⃣ Hero Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          🚀 GlowBot AI: Your Content Command Center
        </h1>
        <p className="text-lg text-muted-foreground">
          Trend-to-traffic in under 10 minutes. Powered by Perplexity + Claude + GPT.
        </p>
      </div>

      {/* Amazon Associates Links */}
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

      {/* 2️⃣ AI-Powered Trending Picks (Unified) */}
      <Card data-testid="card-unified-trending-picks">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-xl">🔥 AI-Powered Trending Picks</CardTitle>
            <p className="text-sm text-muted-foreground">
              {selectedDataSource === 'perplexity' 
                ? 'Hottest products discovered by Perplexity AI' 
                : 'Real-time product discovery via Amazon PA-API'
              }
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Data Source Toggle */}
            <Select value={selectedDataSource} onValueChange={(value: 'perplexity' | 'amazon') => setSelectedDataSource(value)}>
              <SelectTrigger className="w-[150px]" data-testid="select-data-source">
                <SelectValue placeholder="Data source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="perplexity">🤖 Perplexity</SelectItem>
                <SelectItem value="amazon">🛒 Amazon</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedNicheFilter} onValueChange={setSelectedNicheFilter}>
              <SelectTrigger className="w-[180px]">
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
            <div className="flex flex-col items-center">
              {selectedDataSource === 'perplexity' && (
                <p className="text-red-600 font-semibold text-xs mb-1">
                  (PLEASE DO NOT PRESS)
                </p>
              )}
              <Button 
                onClick={selectedDataSource === 'perplexity' ? handlePerplexityFetch : () => amazonMutation.mutate()}
                disabled={selectedDataSource === 'perplexity' ? isPerplexityLoading : amazonMutation.isPending}
                variant="outline"
                size="sm"
                className={selectedDataSource === 'amazon' ? "bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200 hover:from-orange-100 hover:to-yellow-100" : ""}
                data-testid={selectedDataSource === 'perplexity' ? "button-fetch-perplexity" : "button-fetch-amazon"}
              >
                {(selectedDataSource === 'perplexity' ? isPerplexityLoading : amazonMutation.isPending) ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : selectedDataSource === 'amazon' ? (
                  <ShoppingBag className="h-4 w-4 mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                {selectedDataSource === 'perplexity' ? 'Run Perplexity Fetch' : '🔄 Run Amazon Fetch'}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {/* Status Section - Conditional Based on Data Source */}
        <CardContent className="pt-0 pb-4">
          {selectedDataSource === 'perplexity' ? (
            <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-blue-900">Last Perplexity Run</span>
                      {perplexityStatus ? (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          {perplexityStatus.timeSince}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                          Loading...
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-blue-700 mt-1">
                      {perplexityStatus ? (
                        <>
                          <div><strong>Time:</strong> {perplexityStatus.lastRun}</div>
                          <div><strong>Next:</strong> {perplexityStatus.nextScheduled}</div>
                          <div><strong>Products:</strong> {perplexityStatus.totalProducts} total in database</div>
                        </>
                      ) : (
                        <div>Loading status...</div>
                      )}
                    </div>
                  
                    {/* Automation Toggle Switch */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-blue-200">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-blue-900">Daily 5:00 AM Automation</span>
                        <span className="text-xs text-blue-600">
                          {automationStatus?.enabled ? "Automatic trend fetching enabled" : "Manual fetching only"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-blue-600">
                          {automationStatus?.enabled ? "ON" : "OFF"}
                        </span>
                        <Switch
                          checked={automationStatus?.enabled || false}
                          onCheckedChange={(enabled) => {
                            toggleAutomationMutation.mutate(enabled);
                          }}
                          disabled={toggleAutomationMutation.isPending}
                          className="data-[state=checked]:bg-blue-600"
                        />
                      </div>
                    </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array(6).fill(0).map((_, i) => (
                <Card key={i} className="p-4">
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
                    <div className="h-8 bg-gray-200 rounded animate-pulse" />
                  </div>
                </Card>
              ))}
            </div>
          ) : getFilteredProducts().length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getFilteredProducts().map((product) => (
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

                      {/* Amazon-specific data */}
                      {selectedDataSource === 'amazon' && (
                        <>
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
                            <div className="text-xs text-blue-600">
                              📦 ASIN: {product.asin}
                            </div>
                          )}
                        </>
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
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>
                {selectedDataSource === 'perplexity' 
                  ? 'No Perplexity trends available. Click "Run Perplexity Fetch" to get started!'
                  : 'No Amazon products available. Click "Run Amazon Fetch" to discover trending products!'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3️⃣ Fast-Action Buttons Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/unified-generator" onClick={() => setTimeout(() => window.scrollTo(0, 0), 100)}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Wand2 className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-blue-900 mb-2">🎯 Unified Content Generator</h3>
              <p className="text-sm text-blue-700 mb-4">One-click content generation for all platforms</p>
              <div className="flex items-center justify-center text-blue-600">
                <span className="text-sm font-medium">Generate Now</span>
                <ArrowRight className="h-4 w-4 ml-1" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/bulk-content-generation" onClick={() => setTimeout(() => window.scrollTo(0, 0), 100)}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Layers className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-purple-900 mb-2">🚀 Bulk Content Generator</h3>
              <p className="text-sm text-purple-700 mb-4">Generate content at scale with automation</p>
              <div className="flex items-center justify-center text-purple-600">
                <span className="text-sm font-medium">Bulk Generate</span>
                <ArrowRight className="h-4 w-4 ml-1" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/content-history" onClick={() => setTimeout(() => window.scrollTo(0, 0), 100)}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-emerald-900 mb-2">📊 Content History & Analytics</h3>
              <p className="text-sm text-emerald-700 mb-4">Track performance and manage your content</p>
              <div className="flex items-center justify-center text-emerald-600">
                <span className="text-sm font-medium">View Analytics</span>
                <ArrowRight className="h-4 w-4 ml-1" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* 4️⃣ Platform Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{totalProducts}</div>
            <div className="text-sm text-muted-foreground">Total Products</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{activeNiches}</div>
            <div className="text-sm text-muted-foreground">Active Niches</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">∞</div>
            <div className="text-sm text-muted-foreground">Content Generated</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">24/7</div>
            <div className="text-sm text-muted-foreground">AI Monitoring</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;