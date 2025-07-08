import React, { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Target
} from "lucide-react";
import { DashboardTrendingResponse, TrendingProduct } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { toast } = useToast();
  const [isPerplexityLoading, setIsPerplexityLoading] = useState(false);

  // Fetch trending products for all niches
  const { data: trendingProducts, isLoading: trendingLoading, refetch: refetchTrending } = useQuery<DashboardTrendingResponse>({
    queryKey: ['/api/trending'],
    retry: false,
  });

  // Get Perplexity products (limit 3 per niche)
  const getPerplexityProducts = () => {
    if (!trendingProducts?.data) return [];
    
    const perplexityProducts: TrendingProduct[] = [];
    Object.entries(trendingProducts.data).forEach(([niche, products]) => {
      const perplexityItems = products
        .filter(p => p.source === 'perplexity')
        .slice(0, 3);
      perplexityProducts.push(...perplexityItems);
    });
    
    return perplexityProducts.slice(0, 12); // Max 12 total
  };

  // Run Perplexity fetch
  const handlePerplexityFetch = async () => {
    setIsPerplexityLoading(true);
    try {
      const response = await fetch('/api/pull-perplexity-trends', {
        method: 'POST',
      });
      
      if (response.ok) {
        toast({
          title: "Success!",
          description: "Fresh trending data fetched from Perplexity",
        });
        refetchTrending();
      } else {
        throw new Error('Failed to fetch');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch Perplexity trends",
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
      'skincare': 'bg-pink-100 text-pink-800',
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
          🚀 GlowBot AI: Your BTB Command Center
        </h1>
        <p className="text-lg text-muted-foreground">
          Trend-to-traffic in under 10 minutes. Powered by Perplexity + GPT.
        </p>
      </div>

      {/* 2️⃣ AI-Powered Trending Picks (Perplexity) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-xl">🔥 AI-Powered Trending Picks</CardTitle>
            <p className="text-sm text-muted-foreground">Hottest products discovered by Perplexity AI</p>
          </div>
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
          ) : perplexityProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {perplexityProducts.map((product) => (
                <Card key={product.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-sm leading-tight line-clamp-2">
                          {product.title}
                        </h3>
                        <Badge className={getNicheColor(product.niche)} variant="secondary">
                          {product.niche}
                        </Badge>
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        🔥 {product.mentions?.toLocaleString() || '0'} mentions
                      </div>
                      
                      <p className="text-xs text-gray-600 line-clamp-2">
                        Why it's hot: Viral trend with massive social engagement
                      </p>
                      
                      <div className="flex gap-2">
                        <Link href={`/niche/${product.niche}?template=social_media_post&product=${encodeURIComponent(product.title)}`}>
                          <Button size="sm" className="flex-1 text-xs">
                            <Wand2 className="h-3 w-3 mr-1" />
                            Generate Content
                          </Button>
                        </Link>
                        <Button size="sm" variant="outline" className="text-xs">
                          <Eye className="h-3 w-3 mr-1" />
                          View
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
        <Link href="/generate">
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

      {/* 4️⃣ Stats Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{totalProducts}</div>
            <div className="text-xs text-muted-foreground">🔥 Trending Products</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{activeNiches}</div>
            <div className="text-xs text-muted-foreground">🧠 Niches Active</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">2,400</div>
            <div className="text-xs text-muted-foreground">✍️ AI Scripts Generated</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">97%</div>
            <div className="text-xs text-muted-foreground">✅ Success Rate</div>
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