import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { TrendingUp, RefreshCw, Sparkles, ExternalLink, Target, Clock, Zap } from 'lucide-react';
import { useLocation } from 'wouter';

interface PerplexityProduct {
  id: number;
  niche: string;
  productName: string;
  benefit: string;
  viralMetric: string;
  priceRange: string;
  affiliateReason: string;
  amazonLink?: string;
  createdAt: string;
}

const NICHES = [
  { id: 'all', name: 'All Niches', icon: '🔥' },
  { id: 'skincare', name: 'Skincare', icon: '✨' },
  { id: 'tech', name: 'Tech', icon: '📱' },
  { id: 'fashion', name: 'Fashion', icon: '👗' },
  { id: 'fitness', name: 'Fitness', icon: '💪' },
  { id: 'food', name: 'Food', icon: '🍳' },
  { id: 'travel', name: 'Travel', icon: '✈️' },
  { id: 'pet', name: 'Pet', icon: '🐾' }
];

export default function TrendingAIPicks() {
  const [selectedNiche, setSelectedNiche] = useState('all');
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch trending products
  const { data: productsData, isLoading, error } = useQuery({
    queryKey: ['/api/perplexity-trending/all'],
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Refresh mutation
  const refreshMutation = useMutation({
    mutationFn: async (niche?: string) => {
      const endpoint = niche && niche !== 'all' 
        ? `/api/perplexity-trending/refresh/${niche}`
        : '/api/perplexity-trending/refresh';
      
      const response = await apiRequest('POST', endpoint);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/perplexity-trending/all'] });
      toast({
        title: "Trends Updated",
        description: "Latest trending products fetched from Perplexity AI"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Refresh Failed",
        description: error.message || "Failed to refresh trending products",
        variant: "destructive"
      });
    }
  });

  const handleGenerateContent = (product: PerplexityProduct) => {
    const params = new URLSearchParams({
      product: product.productName,
      niche: product.niche
    });
    setLocation(`/generate-content?${params.toString()}`);
  };

  const filteredProducts = React.useMemo(() => {
    if (!productsData?.productsByNiche) return [];
    
    if (selectedNiche === 'all') {
      return Object.values(productsData.productsByNiche).flat();
    }
    
    return productsData.productsByNiche[selectedNiche] || [];
  }, [productsData, selectedNiche]);

  const getTimeSinceUpdate = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffInHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just updated';
    if (diffInHours === 1) return '1 hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return diffInDays === 1 ? '1 day ago' : `${diffInDays} days ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              🔥 Trending AI Picks
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Real-time viral product discoveries powered by Perplexity AI. Find the hottest affiliate-ready products trending on TikTok and Instagram.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 max-w-2xl mx-auto">
          <div className="flex-1">
            <Select value={selectedNiche} onValueChange={setSelectedNiche}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select niche" />
              </SelectTrigger>
              <SelectContent>
                {NICHES.map((niche) => (
                  <SelectItem key={niche.id} value={niche.id}>
                    <div className="flex items-center gap-2">
                      <span>{niche.icon}</span>
                      <span>{niche.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button
            onClick={() => refreshMutation.mutate(selectedNiche)}
            disabled={refreshMutation.isPending}
            className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
          >
            <RefreshCw className={`h-4 w-4 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
            {refreshMutation.isPending ? 'Updating...' : 'Refresh Trends'}
          </Button>
        </div>

        {/* Status */}
        {productsData && (
          <div className="text-center mb-8">
            <Badge variant="outline" className="px-4 py-2 text-sm">
              <Sparkles className="h-4 w-4 mr-2" />
              {filteredProducts.length} trending products found
              {filteredProducts.length > 0 && (
                <span className="ml-2 text-gray-500">
                  • Updated {getTimeSinceUpdate(filteredProducts[0].createdAt)}
                </span>
              )}
            </Badge>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="max-w-2xl mx-auto mb-8 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-red-800 mb-4">
                  Failed to load trending products. This could be due to:
                </p>
                <ul className="text-sm text-red-700 space-y-1 mb-4">
                  <li>• Perplexity API key not configured</li>
                  <li>• Rate limiting or API issues</li>
                  <li>• Network connectivity problems</li>
                </ul>
                <Button
                  onClick={() => refreshMutation.mutate()}
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-100"
                >
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-4" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && filteredProducts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product, index) => (
              <Card key={product.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-bold text-white line-clamp-2">
                        {product.productName}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="bg-white/20 text-white border-0">
                          #{index + 1}
                        </Badge>
                        <Badge variant="secondary" className="bg-white/20 text-white border-0">
                          {NICHES.find(n => n.id === product.niche)?.icon} {product.niche}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <Zap className="h-4 w-4 text-orange-500" />
                      Key Benefit
                    </h4>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {product.benefit}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-red-500" />
                      Viral Traction
                    </h4>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {product.viralMetric}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1 text-xs">Price Range</h4>
                      <p className="text-green-600 font-bold text-sm">{product.priceRange}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1 text-xs">Updated</h4>
                      <p className="text-gray-500 text-xs">{getTimeSinceUpdate(product.createdAt)}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <Target className="h-4 w-4 text-blue-500" />
                      Affiliate Opportunity
                    </h4>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {product.affiliateReason}
                    </p>
                  </div>

                  <div className="pt-4 border-t space-y-3">
                    <Button
                      onClick={() => handleGenerateContent(product)}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Content for this Product
                    </Button>
                    
                    {product.amazonLink && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => window.open(product.amazonLink, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View on Amazon
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredProducts.length === 0 && (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-16 pb-16 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">No Trending Products Yet</h3>
              <p className="text-gray-600 mb-6">
                {selectedNiche === 'all' 
                  ? "No trending products have been discovered yet. Click refresh to fetch the latest viral products from Perplexity AI."
                  : `No trending products found for ${NICHES.find(n => n.id === selectedNiche)?.name}. Try refreshing or select a different niche.`
                }
              </p>
              <Button
                onClick={() => refreshMutation.mutate(selectedNiche)}
                disabled={refreshMutation.isPending}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
                {refreshMutation.isPending ? 'Fetching Trends...' : 'Fetch Trending Products'}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}