import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, TrendingUp, Activity, Calendar, Database, Clock, ShoppingBag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type TrendingProduct = {
  id: number;
  title: string;
  source: string;
  mentions: number;
  niche: string;
  dataSource: string;
  createdAt: string;
  reason?: string;
  asin?: string;
  affiliateUrl?: string;
  price?: string;
  rating?: number;
};

type SortOption = 'viral' | 'recent' | 'niche';
type SourceFilter = 'all' | 'amazon';

interface AmazonTrendingPicksWidgetProps {
  showFetchButton?: boolean;
  maxItems?: number;
  title?: string;
}

export default function AmazonTrendingPicksWidget({ 
  showFetchButton = true, 
  maxItems = 50,
  title = "🛒 Amazon-Powered Trending Picks"
}: AmazonTrendingPicksWidgetProps) {
  const [selectedNiche, setSelectedNiche] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('amazon');
  const [sortBy, setSortBy] = useState<SortOption>('viral');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery<TrendingProduct[]>({
    queryKey: ['/api/trending/products'],
  });

  // Fetch Amazon status for last run display
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

  const niches = ['all', 'beauty', 'tech', 'fashion', 'fitness', 'food', 'travel', 'pets'];

  const filteredProducts = products
    .filter(product => selectedNiche === 'all' || product.niche === selectedNiche)
    .filter(product => sourceFilter === 'all' || product.dataSource === sourceFilter)
    .sort((a, b) => {
      if (sortBy === 'viral') return (b.mentions || 0) - (a.mentions || 0);
      if (sortBy === 'recent') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'niche') return a.niche.localeCompare(b.niche);
      return 0;
    })
    .slice(0, maxItems);

  const getSourceIcon = (source: string) => {
    return source === 'amazon' ? '🛒' : '🤖';
  };

  const formatMentions = (mentions: number) => {
    if (mentions >= 1000000) return `${(mentions / 1000000).toFixed(1)}M`;
    if (mentions >= 1000) return `${(mentions / 1000).toFixed(0)}K`;
    return mentions.toLocaleString();
  };

  const getRandomColor = (index: number) => {
    const colors = [
      'bg-gradient-to-r from-orange-100 to-yellow-100 border-orange-200',
      'bg-gradient-to-r from-blue-100 to-cyan-100 border-blue-200',
      'bg-gradient-to-r from-green-100 to-emerald-100 border-green-200',
      'bg-gradient-to-r from-purple-100 to-violet-100 border-purple-200',
      'bg-gradient-to-r from-red-100 to-pink-100 border-red-200',
      'bg-gradient-to-r from-indigo-100 to-blue-100 border-indigo-200',
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-6" data-testid="amazon-trending-picks-widget">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        {showFetchButton && (
          <Button
            onClick={() => amazonMutation.mutate()}
            disabled={amazonMutation.isPending}
            variant="outline"
            className="flex items-center gap-2 bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200 hover:from-orange-100 hover:to-yellow-100"
            data-testid="button-fetch-amazon"
          >
            {amazonMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ShoppingBag className="h-4 w-4" />
            )}
            {amazonMutation.isPending ? 'Fetching...' : '🔄 Run Amazon Fetch'}
          </Button>
        )}
      </div>

      {/* Amazon Last Run Status */}
      {showFetchButton && (
        <Card className="mb-4 bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200" data-testid="card-amazon-status">
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

      <div className="mb-4 text-sm text-muted-foreground">
        🛒 High-converting affiliate products discovered through Amazon PA-API real-time search.
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <Select value={selectedNiche} onValueChange={setSelectedNiche}>
          <SelectTrigger className="w-[180px]" data-testid="select-niche">
            <SelectValue placeholder="Select niche" />
          </SelectTrigger>
          <SelectContent>
            {niches.map(niche => (
              <SelectItem key={niche} value={niche}>
                {niche === 'all' ? 'All Niches' : niche.charAt(0).toUpperCase() + niche.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sourceFilter} onValueChange={(value: SourceFilter) => setSourceFilter(value)}>
          <SelectTrigger className="w-[180px]" data-testid="select-source">
            <SelectValue placeholder="Data source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="amazon">🛒 Amazon PA-API</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
          <SelectTrigger className="w-[180px]" data-testid="select-sort">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="viral">🔥 Most Popular</SelectItem>
            <SelectItem value="recent">📅 Most Recent</SelectItem>
            <SelectItem value="niche">📂 By Niche</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <Card className="p-8 text-center" data-testid="card-no-products">
          <div className="text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No Amazon products found</p>
            <p className="text-sm">Try adjusting your filters or run an Amazon fetch to get fresh data.</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="products-grid">
          {filteredProducts.map((product, index) => (
            <Card key={product.id} className={`hover:shadow-md transition-shadow ${getRandomColor(index)}`} data-testid={`card-product-${product.id}`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold line-clamp-2">
                  {getSourceIcon(product.dataSource)} {product.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs" data-testid={`badge-niche-${product.id}`}>
                    {product.niche}
                  </Badge>
                  <Badge variant="outline" className="text-xs flex items-center gap-1" data-testid={`badge-mentions-${product.id}`}>
                    <Activity className="h-3 w-3" />
                    {formatMentions(product.mentions || 0)}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {new Date(product.createdAt).toLocaleDateString()}
                </div>
                {/* Why it's hot */}
                <div className="text-xs text-gray-600">
                  <span className="text-orange-600">✨ Why it's hot:</span>
                  <span className="ml-1">{product.reason ? (product.reason.length > 100 ? product.reason.slice(0, 100) + '...' : product.reason) : 'Popular on Amazon marketplace'}</span>
                </div>
                {/* Amazon-specific info */}
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}