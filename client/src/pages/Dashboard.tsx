import React, { useState, useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingProductCard } from "@/components/TrendingProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import { ArrowRight, TrendingUp, BarChart3, Clock, Loader2, RefreshCw } from "lucide-react";
import { DashboardTrendingResponse, TrendingProduct } from "@/lib/types";
import DailyContentShowcase from "@/components/DailyContentShowcase";
import DailyBatchButton from "@/components/DailyBatchButton";
import { EnhancedAmazonAffiliateSection } from "@/components/EnhancedAmazonAffiliateSection";

const Dashboard = () => {
  const [loadingTimeElapsed, setLoadingTimeElapsed] = useState(0);
  const [, setLocation] = useLocation();
  const [nextRefreshIn, setNextRefreshIn] = useState<string>("");

  // Fetch trending products for all niches
  const { data: trendingProducts, isLoading: trendingLoading } = useQuery<DashboardTrendingResponse>({
    queryKey: ['/api/trending'],
    retry: false,
  });

  // Timer for loading time elapsed
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (trendingLoading) {
      interval = setInterval(() => {
        setLoadingTimeElapsed(prev => prev + 1);
      }, 1000);
    } else {
      setLoadingTimeElapsed(0);
    }
    return () => clearInterval(interval);
  }, [trendingLoading]);

  // Calculate time until next refresh (midnight)
  useEffect(() => {
    const updateNextRefresh = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0); // Next midnight
      
      const timeDiff = midnight.getTime() - now.getTime();
      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      
      setNextRefreshIn(`${hours}h ${minutes}m`);
    };

    updateNextRefresh();
    const interval = setInterval(updateNextRefresh, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  // Format loading time
  const formatLoadingTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // Pre-define niche data for consistent display
  const niches = [
    { id: 'skincare', name: 'Skincare', icon: '✨', color: 'from-pink-500 to-rose-500' },
    { id: 'tech', name: 'Technology', icon: '💻', color: 'from-blue-500 to-cyan-500' },
    { id: 'fashion', name: 'Fashion', icon: '👗', color: 'from-purple-500 to-indigo-500' },
    { id: 'fitness', name: 'Fitness', icon: '💪', color: 'from-green-500 to-emerald-500' },
    { id: 'food', name: 'Food & Kitchen', icon: '🍲', color: 'from-orange-500 to-amber-500' },
    { id: 'travel', name: 'Travel', icon: '✈️', color: 'from-sky-500 to-blue-500' },
    { id: 'pet', name: 'Pets', icon: '🐶', color: 'from-yellow-500 to-amber-500' }
  ];

  // Format the last refresh time
  const lastRefreshTime = trendingProducts?.lastRefresh 
    ? new Date(trendingProducts.lastRefresh).toLocaleString() 
    : "Not available";
    
  // Safely access trending products with defaults
  const productCount = trendingProducts?.count || 0;
  const nicheProducts: Record<string, TrendingProduct[]> = {};
  
  // Prepare niche products with proper fallbacks for each niche
  niches.forEach(niche => {
    if (trendingProducts?.data && trendingProducts.data[niche.id]) {
      nicheProducts[niche.id] = trendingProducts.data[niche.id];
    } else {
      nicheProducts[niche.id] = [];
    }
  });

  // Handler for when user clicks "Use Product" button
  const handleUseProduct = (product: TrendingProduct) => {
    // Navigate to Content Generator with product data
    const params = new URLSearchParams({
      product: product.title,
      niche: product.niche || 'general'
    });
    setLocation(`/generate?${params.toString()}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col space-y-8">
        
        {/* Dashboard Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">GlowBot Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of trending products across all niches for your content creation.
          </p>
        </div>

        {/* Top Row - Trending Products and Data Freshness */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Trending Products</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {trendingLoading ? <Skeleton className="h-7 w-16" /> : productCount}
              </div>
              <p className="text-xs text-muted-foreground">High-conversion products tracked</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Data Freshness</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-md font-medium truncate">
                {trendingLoading ? <Skeleton className="h-7 w-full" /> : lastRefreshTime}
              </div>
              <p className="text-xs text-muted-foreground">Real-time data updates</p>
            </CardContent>
          </Card>
        </div>

        {/* Amazon Affiliate Picks Section */}
        <EnhancedAmazonAffiliateSection />

        {/* Quick Actions Section */}
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3 text-blue-800">
              <BarChart3 className="h-6 w-6" />
              Multi-Niche Generator
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-700 text-sm mb-4">
              Generate content for all 7 niches with AI-powered optimization and platform-specific formatting.
            </p>
            <Link href="/generate">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Generate Multi-Niche Content
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Content Generation Section - Full Width */}
        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-medium">Generate Content</CardTitle>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/generate">
              <Button className="w-full" size="lg">Start Creating with our AI Content Generator</Button>
            </Link>
            <DailyBatchButton />
            <p className="text-sm text-muted-foreground text-center">Create high-converting content in seconds</p>
          </CardContent>
        </Card>

        {/* Daily Content Showcase */}
        <DailyContentShowcase />

        {/* Trending Products By Niche */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold tracking-tight">Trending Products By Niche</h2>
              {trendingLoading && (
                <Badge variant="secondary" className="flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Loading... {formatLoadingTime(loadingTimeElapsed)}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 text-xs"
              >
                <Clock className="h-3 w-3" />
                Refresh
              </Button>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">
                  Top 3 products from each category
                </p>
                {!trendingLoading && nextRefreshIn && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3" />
                    Next refresh in {nextRefreshIn}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <Tabs defaultValue="skincare" className="w-full">
            <TabsList className="grid grid-cols-4 md:grid-cols-7 mb-8 h-auto p-1">
              {niches.map(niche => (
                <TabsTrigger 
                  key={niche.id} 
                  value={niche.id}
                  className="text-xs md:text-sm flex flex-col md:flex-row items-center gap-1 md:gap-2 py-3 px-2 md:px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <span className="text-lg md:text-base">{niche.icon}</span>
                  <span className="text-xs md:text-sm font-medium">{niche.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            
            {niches.map(niche => (
              <TabsContent key={niche.id} value={niche.id} className="mt-6">
                <div className="space-y-4">
                  {/* Niche Header */}
                  <div className="flex items-center gap-3 pb-4 border-b">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${niche.color} flex items-center justify-center text-white text-xl font-bold`}>
                      {niche.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{niche.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {nicheProducts[niche.id]?.length || 0} trending products
                      </p>
                    </div>
                  </div>
                  
                  {/* Products Grid */}
                  <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {trendingLoading ? (
                      // Intelligent loading cards with detailed progress - show 4 cards
                      Array(4).fill(0).map((_, i) => {
                        const platforms = ['TikTok', 'Instagram', 'YouTube', 'Reddit', 'Amazon', 'Google Trends'];
                        const currentPlatform = platforms[Math.floor(loadingTimeElapsed / 5) % platforms.length];
                        const progress = Math.min(95, (loadingTimeElapsed / 180) * 100); // Max 3 min estimate
                        
                        return (
                          <Card key={i} className="overflow-hidden shadow-sm border-2 border-dashed border-primary/30">
                            <CardContent className="p-0">
                              <div className="p-6 space-y-4">
                                <div className="flex items-center gap-2 mb-4">
                                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                  <div className="flex flex-col">
                                    <span className="text-sm font-medium text-foreground">
                                      Analyzing trends...
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      Scanning {currentPlatform}
                                    </span>
                                  </div>
                                </div>
                                
                                {/* Progress bar */}
                                <div className="w-full bg-muted rounded-full h-2 mb-2">
                                  <div 
                                    className="bg-primary h-2 rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${progress}%` }}
                                  ></div>
                                </div>
                                
                                <Skeleton className="h-6 w-2/3" />
                                <Skeleton className="h-4 w-1/2" />
                                <div className="flex gap-2">
                                  <Skeleton className="h-5 w-16 rounded-full" />
                                  <Skeleton className="h-5 w-24 rounded-full" />
                                </div>
                                
                                <div className="flex justify-between text-xs text-muted-foreground">
                                  <span>{Math.round(progress)}% complete</span>
                                  <span>Est. {Math.max(1, 3 - Math.floor(loadingTimeElapsed / 60))} min remaining</span>
                                </div>
                              </div>
                              <div className="bg-muted/50 p-4 flex justify-between items-center">
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatLoadingTime(loadingTimeElapsed)} elapsed
                                </span>
                                <Skeleton className="h-9 w-28 rounded-md" />
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })
                    ) : nicheProducts[niche.id]?.length > 0 ? (
                      // Actual trending products for this niche - show exactly 4
                      nicheProducts[niche.id].slice(0, 4).map((product, idx) => (
                        <TrendingProductCard 
                          key={product.id || idx} 
                          product={product} 
                          rank={idx + 1} 
                          gradientClass={niche.color}
                          onUseProduct={handleUseProduct}
                        />
                      ))
                    ) : (
                      // No products for this niche
                      <div className="col-span-3 py-12 text-center">
                        <div className="max-w-sm mx-auto space-y-4">
                          <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                            <TrendingUp className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-lg font-medium text-muted-foreground">No trending products found</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Data will be refreshed automatically
                            </p>
                          </div>
                          <Link href="/generate">
                            <Button variant="outline" size="sm" className="mt-4">
                              Generate Content Anyway
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;