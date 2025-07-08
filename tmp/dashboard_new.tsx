import React, { useState, useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import { ArrowRight, TrendingUp, BarChart3, Clock, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { DashboardTrendingResponse, TrendingProduct } from "@/lib/types";
import DailyContentShowcase from "@/components/DailyContentShowcase";
import DailyBatchButton from "@/components/DailyBatchButton";
import { EnhancedAmazonAffiliateSection } from "@/components/EnhancedAmazonAffiliateSection";
import TrendingPicksWidget from "@/components/TrendingPicksWidget";

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

  // Calculate countdown to next automatic refresh
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const nextHour = new Date(now);
      nextHour.setHours(now.getHours() + 1, 0, 0, 0);
      
      const diffMs = nextHour.getTime() - now.getTime();
      const minutes = Math.floor(diffMs / 60000);
      const seconds = Math.floor((diffMs % 60000) / 1000);
      
      setNextRefreshIn(`${minutes}m ${seconds}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Format loading time nicely
  const formatLoadingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">GlowBot Dashboard</h1>
          <p className="text-muted-foreground">
            AI-powered content generation for multi-niche affiliate marketing
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Trending Products
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {trendingProducts?.count || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all niches
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Niches
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">
              Skincare, Tech, Fashion, etc.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Content Generated
            </CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4K</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Success Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">97%</div>
            <p className="text-xs text-muted-foreground">
              Content generation success
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Generate Content Card */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              Generate Content
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Create AI-powered affiliate content instantly
            </p>
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={() => setLocation('/templates')}
            >
              Start Creating
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Templates Card */}
        <Card className="bg-gradient-to-br from-purple-50 to-pink-100 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              Manage Templates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Customize content templates for each niche
            </p>
            <Button 
              variant="outline" 
              className="w-full border-purple-200 hover:bg-purple-50"
              onClick={() => setLocation('/templates')}
            >
              View Templates
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Daily Batch Generation */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-green-600" />
              Daily Batch
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DailyBatchButton />
            <p className="text-sm text-muted-foreground text-center">Create high-converting content in seconds</p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Content Showcase */}
      <DailyContentShowcase />

      {/* AI-Powered Trending Picks */}
      <TrendingPicksWidget 
        showFetchButton={true}
        maxItems={18}
        title="🔥 AI-Powered Trending Picks"
      />
      
      {/* Enhanced Amazon Affiliate Section */}
      <EnhancedAmazonAffiliateSection />
    </div>
  );
};

export default Dashboard;