import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";

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
  RotateCcw
} from "lucide-react";
import { DashboardTrendingResponse, TrendingProduct } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isPerplexityLoading, setIsPerplexityLoading] = useState(false);
  const [selectedNicheFilter, setSelectedNicheFilter] = useState('all');

  // Fetch trending products for all niches
  const { data: trendingProducts, isLoading: trendingLoading, refetch: refetchTrending } = useQuery<DashboardTrendingResponse>({
    queryKey: ['/api/trending'],
    retry: false,
    staleTime: 0, // Always consider data stale
    cacheTime: 0, // Don't cache the data
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

  // Filter products based on selected niche
  const getFilteredPerplexityProducts = () => {
    const allProducts = getPerplexityProducts();
    if (selectedNicheFilter === 'all') {
      return allProducts;
    }
    return allProducts.filter(product => product.niche === selectedNicheFilter);
  };

  // Get available niches for dropdown
  const getAvailableNiches = () => {
    const allProducts = getPerplexityProducts();
    const niches = [...new Set(allProducts.map(product => product.niche))];
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

  const perplexityProducts = getPerplexityProducts();
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
      'pet': 'bg-yellow-100 text-yellow-800',
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
          Trend-to-traffic in under 10 minutes. Powered by Perplexity + GPT.
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

      {/* 2️⃣ AI-Powered Trending Picks (Perplexity) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-xl">🔥 AI-Powered Trending Picks</CardTitle>
            <p className="text-sm text-muted-foreground">Hottest products discovered by Perplexity AI</p>
          </div>
          <div className="flex items-center gap-3">
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
              <p className="text-red-600 font-semibold text-xs mb-1">
                (PLEASE DO NOT PRESS)
              </p>
              <Button 
                onClick={handlePerplexityFetch}
                disabled={isPerplexityLoading}
                variant="outline"
                size="sm"
              >
                {isPerplexityLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Run Perplexity Fetch
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {trendingLoading ? (
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
          ) : getFilteredPerplexityProducts().length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getFilteredPerplexityProducts().map((product) => (
                <Card key={product.id} className="border border-gray-200 bg-white hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      {/* Product Title */}
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-semibold text-base leading-tight text-gray-900">
                          {product.title}
                        </h3>
                        <Badge className={getNicheColor(product.niche)} variant="secondary">
                          {product.niche}
                        </Badge>
                      </div>
                      
                      {/* Mentions - Hidden for cleaner look */}
                      {/* <div className="flex items-center gap-1 text-sm text-orange-600">
                        🔥 {product.mentions?.toLocaleString() || '15,000'} mentions
                      </div> */}
                      
                      {/* Why it's hot */}
                      <div className="text-sm text-gray-600">
                        <span className="text-yellow-600">✨ Why it's hot:</span>
                        <span className="ml-1">{product.reason || 'Trending across social platforms'}</span>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <Link 
                          href={`/unified-generator?product=${encodeURIComponent(product.title)}&niche=${product.niche}`}
                          onClick={() => trackEvent('trending_product_click', 'research', `${product.niche}_${product.title}`, 1)}
                        >
                          <Button size="sm" className="flex-1 bg-red-500 hover:bg-red-600 text-white">
                            <Zap className="h-3 w-3 mr-1" />
                            Generate Content
                          </Button>
                        </Link>
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
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No Perplexity trends available. Click "Run Perplexity Fetch" to get started!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3️⃣ Fast-Action Buttons Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/unified-generator">
          <Card className="hover:shadow-md transition-shadow cursor-pointer bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6 text-center">
              <Wand2 className="h-8 w-8 mx-auto mb-3 text-blue-600" />
              <h3 className="font-semibold text-blue-900">🪄 Generate Content Now</h3>
              <p className="text-sm text-blue-700 mt-1">Create viral content in seconds</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/templates">
          <Card className="hover:shadow-md transition-shadow cursor-pointer bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="p-6 text-center">
              <Layers className="h-8 w-8 mx-auto mb-3 text-purple-600" />
              <h3 className="font-semibold text-purple-900">🧩 Manage Templates</h3>
              <p className="text-sm text-purple-700 mt-1">Browse and customize templates</p>
            </CardContent>
          </Card>
        </Link>

        <Card className="hover:shadow-md transition-shadow cursor-pointer bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6 text-center">
            <Zap className="h-8 w-8 mx-auto mb-3 text-green-600" />
            <h3 className="font-semibold text-green-900">⚡ Generate Daily Batch</h3>
            <p className="text-sm text-green-700 mt-1">Bulk content generation</p>
          </CardContent>
        </Card>
      </div>



      {/* 5️⃣ Daily Content Showcase */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">🧠 Daily Content Showcase</CardTitle>
          <p className="text-sm text-muted-foreground">Latest high-performing AI-generated content</p>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No showcase content yet today. Start by generating from a trending pick above!</p>
          </div>
        </CardContent>
      </Card>

      {/* 6️⃣ Future Automation Preview */}
      <Card className="bg-gradient-to-r from-gray-50 to-slate-50 border-dashed">
        <CardContent className="p-8 text-center">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">🧠 Automation Pipeline Preview</h3>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
              <span>Perplexity</span>
              <ArrowRight className="h-4 w-4" />
              <span>Content</span>
              <ArrowRight className="h-4 w-4" />
              <span>Make.com</span>
              <ArrowRight className="h-4 w-4" />
              <span>Performance Loop</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Coming Soon: Full automation pipeline for hands-free content marketing
            </p>
          </div>
        </CardContent>
      </Card>
      </div>
  );
};

export default Dashboard;