import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, TrendingUp, Activity, Calendar, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type TrendingProduct = {
  id: number;
  title: string;
  source: string;
  mentions: number;
  niche: string;
  dataSource: string;
  createdAt: string;
};

type SortOption = 'viral' | 'recent' | 'niche';
type SourceFilter = 'all' | 'gpt' | 'perplexity';

interface TrendingPicksWidgetProps {
  showFetchButton?: boolean;
  maxItems?: number;
  title?: string;
}

export default function TrendingPicksWidget({ 
  showFetchButton = true, 
  maxItems = 50,
  title = "🔥 AI-Powered Trending Picks"
}: TrendingPicksWidgetProps) {
  const [selectedNiche, setSelectedNiche] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('perplexity');
  const [sortBy, setSortBy] = useState<SortOption>('viral');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery<TrendingProduct[]>({
    queryKey: ['/api/trending/products'],
  });

  const perplexityMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/pull-perplexity-trends', {
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
        title: "✅ Perplexity Fetch Complete",
        description: data.message || "Fresh trending products loaded successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/trending/products'] });
    },
    onError: (error) => {
      console.error('Perplexity fetch error:', error);
      toast({
        title: "❌ Fetch Failed",
        description: "Could not fetch new trends. Please try again.",
        variant: "destructive",
      });
    },
  });

  const niches = ['all', 'beauty', 'tech', 'fashion', 'fitness', 'food', 'travel', 'pet'];

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
    return source === 'perplexity' ? '🌐' : '🤖';
  };

  const formatMentions = (mentions: number) => {
    if (mentions >= 1000000) return `${(mentions / 1000000).toFixed(1)}M`;
    if (mentions >= 1000) return `${(mentions / 1000).toFixed(0)}K`;
    return mentions.toLocaleString();
  };

  const getRandomColor = (index: number) => {
    const colors = [
      'bg-gradient-to-r from-pink-100 to-rose-100 border-pink-200',
      'bg-gradient-to-r from-blue-100 to-cyan-100 border-blue-200',
      'bg-gradient-to-r from-green-100 to-emerald-100 border-green-200',
      'bg-gradient-to-r from-purple-100 to-violet-100 border-purple-200',
      'bg-gradient-to-r from-yellow-100 to-amber-100 border-yellow-200',
      'bg-gradient-to-r from-indigo-100 to-blue-100 border-indigo-200',
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        {showFetchButton && (
          <Button
            onClick={() => perplexityMutation.mutate()}
            disabled={perplexityMutation.isPending}
            variant="outline"
            className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-blue-50 border-green-200 hover:from-green-100 hover:to-blue-100"
          >
            {perplexityMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Database className="h-4 w-4" />
            )}
            {perplexityMutation.isPending ? 'Fetching...' : '🔄 Run Perplexity Fetch'}
          </Button>
        )}
      </div>
      
      {showFetchButton && (
        <div className="mb-4 text-center">
          <p className="text-red-600 font-semibold text-sm">
            (PLEASE DO NOT PRESS)
          </p>
        </div>
      )}

      <div className="mb-4 text-sm text-muted-foreground">
        🔍 High-converting affiliate products selected by real-time trend analysis from Perplexity AI.
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <Select value={selectedNiche} onValueChange={setSelectedNiche}>
          <SelectTrigger className="w-[180px]">
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
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Data source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="perplexity">🌐 Perplexity AI</SelectItem>
            <SelectItem value="gpt">🤖 GPT Fallback</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="viral">🔥 Most Viral</SelectItem>
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
        <Card className="p-8 text-center">
          <div className="text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No trending products found</p>
            <p className="text-sm">Try adjusting your filters or run a Perplexity fetch to get fresh data.</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product, index) => (
            <Card key={product.id} className={`hover:shadow-md transition-shadow ${getRandomColor(index)}`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold line-clamp-2">
                  {getSourceIcon(product.dataSource)} {product.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">
                    {product.niche}
                  </Badge>
                  <Badge variant="outline" className="text-xs flex items-center gap-1">
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
                  <span className="text-yellow-600">✨ Why it's hot:</span>
                  <span className="ml-1">{product.reason ? (product.reason.length > 100 ? product.reason.slice(0, 100) + '...' : product.reason) : 'Trending across social platforms'}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}