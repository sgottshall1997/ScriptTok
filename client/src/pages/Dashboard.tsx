import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingProductCard } from "@/components/TrendingProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, TrendingUp, BarChart3, Clock } from "lucide-react";
import { DashboardTrendingResponse, TrendingProduct } from "@/lib/types";

const Dashboard = () => {
  // Fetch trending products for all niches
  const { data: trendingProducts, isLoading: trendingLoading } = useQuery<DashboardTrendingResponse>({
    queryKey: ['/api/trending/products'],
    retry: false,
    // Add a fallback if the server response fails
    placeholderData: () => {
      console.log("Using mock trending products as fallback");
      import { getMockDashboardData } from '@/components/MockTrendingProducts';
      return getMockDashboardData();
    }
  });

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
    if (trendingProducts?.byNiche && trendingProducts.byNiche[niche.id]) {
      nicheProducts[niche.id] = trendingProducts.byNiche[niche.id];
    } else {
      nicheProducts[niche.id] = [];
    }
  });

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

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Niches</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{niches.length}</div>
              <p className="text-xs text-muted-foreground">Specialized content categories</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Trending Products</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {trendingLoading ? <Skeleton className="h-7 w-16" /> : productCount}
              </div>
              <p className="text-xs text-muted-foreground">Across all platforms</p>
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
              <p className="text-xs text-muted-foreground">Last data refresh</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Generate Content</CardTitle>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Link href="/niche/skincare">
                <Button className="w-full">Start Creating</Button>
              </Link>
              <p className="text-xs text-muted-foreground mt-1">Go to content generator</p>
            </CardContent>
          </Card>
        </div>

        {/* Trending Products Tabs */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Trending Products By Niche</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="skincare" className="w-full">
              <TabsList className="grid grid-cols-2 md:grid-cols-7 mb-4">
                {niches.map(niche => (
                  <TabsTrigger 
                    key={niche.id} 
                    value={niche.id}
                    className="text-xs md:text-sm flex items-center"
                  >
                    <span className="mr-1.5">{niche.icon}</span>
                    <span className="hidden md:inline">{niche.name}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {niches.map(niche => (
                <TabsContent key={niche.id} value={niche.id}>
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                    {trendingLoading ? (
                      // Loading skeletons
                      Array(3).fill(0).map((_, i) => (
                        <Card key={i} className="overflow-hidden">
                          <CardContent className="p-0">
                            <div className="p-4">
                              <Skeleton className="h-6 w-2/3 mb-2" />
                              <Skeleton className="h-4 w-1/2 mb-4" />
                              <div className="flex gap-2">
                                <Skeleton className="h-5 w-16 rounded-full" />
                                <Skeleton className="h-5 w-24 rounded-full" />
                              </div>
                            </div>
                            <div className="bg-muted p-3 flex justify-end">
                              <Skeleton className="h-8 w-24 rounded-md" />
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : nicheProducts[niche.id]?.length > 0 ? (
                      // Actual trending products for this niche
                      nicheProducts[niche.id].slice(0, 3).map((product, idx) => (
                        <TrendingProductCard 
                          key={product.id || idx} 
                          product={product} 
                          rank={idx + 1} 
                          gradientClass={niche.color}
                        />
                      ))
                    ) : (
                      // No products for this niche
                      <div className="col-span-3 py-10 text-center border rounded-lg border-dashed">
                        <p className="text-gray-500">No trending products found for this niche</p>
                        <Link href={`/niche/${niche.id}`}>
                          <Button variant="outline" size="sm" className="mt-4">
                            Generate Content Anyway
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;