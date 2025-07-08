import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'wouter';
import { Sparkles, TrendingUp, DollarSign, Zap, Star } from 'lucide-react';

interface TrendingProduct {
  id: number;
  title: string;
  content: string;
  niche: string;
  mentions: number;
  engagement: number;
  source: string;
  dataSource?: string;
  hashtags: string[];
  emojis: string[];
  createdAt?: string;
}

type SortOption = 'viral' | 'newest' | 'price';
type SourceFilter = 'all' | 'gpt' | 'perplexity';

export default function TrendingAIPicks() {
  const [selectedNiche, setSelectedNiche] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('viral');

  const { data: products = [], isLoading } = useQuery<TrendingProduct[]>({
    queryKey: ['/api/trending/products'],
  });

  // Get unique niches for filter dropdown
  const niches = useMemo(() => {
    const uniqueNiches = [...new Set(products.map(p => p.niche))];
    return ['all', ...uniqueNiches];
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filter by niche
    if (selectedNiche !== 'all') {
      filtered = filtered.filter(p => p.niche === selectedNiche);
    }

    // Filter by source
    if (sourceFilter !== 'all') {
      filtered = filtered.filter(p => {
        const source = p.dataSource || p.source || 'gpt';
        return source.toLowerCase().includes(sourceFilter);
      });
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'viral':
          return (b.mentions || 0) - (a.mentions || 0);
        case 'newest':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case 'price':
          // For now, sort by mentions as proxy for price popularity
          return (a.mentions || 0) - (b.mentions || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, selectedNiche, sourceFilter, sortBy]);

  // Identify top picks (highest viral metrics per niche)
  const topPicks = useMemo(() => {
    const topByNiche = new Map<string, number>();
    filteredProducts.forEach(product => {
      const current = topByNiche.get(product.niche);
      if (!current || (product.mentions || 0) > current) {
        topByNiche.set(product.niche, product.mentions || 0);
      }
    });
    
    return new Set(
      filteredProducts
        .filter(p => (p.mentions || 0) === topByNiche.get(p.niche))
        .map(p => p.id)
    );
  }, [filteredProducts]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const getSourceBadge = (product: TrendingProduct) => {
    const source = product.dataSource || product.source || 'gpt';
    const isPerplexity = source.toLowerCase().includes('perplexity');
    
    return (
      <Badge 
        variant={isPerplexity ? "default" : "secondary"}
        className={`text-xs ${isPerplexity ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}
      >
        {isPerplexity ? 'Perplexity' : 'GPT'}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Sparkles className="text-yellow-500" />
          AI-Powered Trending Picks
        </h1>
        <p className="text-gray-600">
          High-potential affiliate products powered by real-time trend intelligence
        </p>
      </div>

      {/* Controls */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Niche Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Niche:</label>
            <Select value={selectedNiche} onValueChange={setSelectedNiche}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {niches.map(niche => (
                  <SelectItem key={niche} value={niche}>
                    {niche === 'all' ? 'All Niches' : niche.charAt(0).toUpperCase() + niche.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Source Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Source:</label>
            <Tabs value={sourceFilter} onValueChange={(value) => setSourceFilter(value as SourceFilter)}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="gpt">GPT</TabsTrigger>
                <TabsTrigger value="perplexity">Perplexity</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Sort:</label>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viral">Most Viral</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price">Price Low to High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Count */}
        <div className="text-sm text-gray-600">
          Showing {filteredProducts.length} products
          {selectedNiche !== 'all' && ` in ${selectedNiche}`}
          {sourceFilter !== 'all' && ` from ${sourceFilter.toUpperCase()}`}
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <TrendingUp size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600">Try adjusting your filters to see more results.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card 
              key={product.id} 
              className={`relative transition-all duration-200 hover:shadow-lg ${
                topPicks.has(product.id) 
                  ? 'ring-2 ring-yellow-400 bg-gradient-to-br from-yellow-50 to-white' 
                  : 'hover:shadow-md'
              }`}
            >
              {topPicks.has(product.id) && (
                <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                  <Star size={12} />
                  Top Pick
                </div>
              )}
              
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <CardTitle className="text-lg font-semibold leading-tight line-clamp-2">
                    🔥 {product.title}
                  </CardTitle>
                  {getSourceBadge(product)}
                </div>
                <CardDescription className="line-clamp-2">
                  💡 "{product.content}"
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Metrics */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-red-600">
                    <TrendingUp size={14} />
                    <span className="font-medium">{formatNumber(product.mentions || 0)}</span>
                    <span className="text-gray-500">mentions</span>
                  </div>
                  <div className="flex items-center gap-1 text-green-600">
                    <Zap size={14} />
                    <span className="font-medium">{formatNumber(product.engagement || 0)}</span>
                    <span className="text-gray-500">engage</span>
                  </div>
                </div>

                {/* Price and Source */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-gray-600">
                    <DollarSign size={14} />
                    <span>Affiliate Ready</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {product.niche}
                  </Badge>
                </div>

                {/* Why it's hot */}
                <div className="text-sm text-gray-600">
                  <span className="text-yellow-600">✨ Why it's hot:</span>
                  <span className="ml-1">Trending on social media platforms</span>
                </div>

                {/* Hashtags */}
                <div className="flex flex-wrap gap-1">
                  {product.hashtags?.slice(0, 3).map((tag, idx) => (
                    <span key={idx} className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    asChild
                    size="sm" 
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Link href={`/generate?product=${encodeURIComponent(product.title)}&niche=${product.niche}`}>
                      Generate Content
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(`https://amazon.com/s?k=${encodeURIComponent(product.title)}`, '_blank')}
                  >
                    View Product
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}