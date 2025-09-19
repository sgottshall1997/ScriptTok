import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  ShoppingCart, 
  TrendingUp, 
  Star, 
  ExternalLink, 
  Copy, 
  Plus,
  Filter,
  RefreshCw,
  Package
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface AmazonProduct {
  asin: string;
  title: string;
  price?: {
    current: number;
    original?: number;
    currency: string;
    formatted: string;
  };
  images: {
    primary: string;
    thumbnails: string[];
  };
  rating: {
    value: number;
    count: number;
  };
  prime: boolean;
  availability: string;
  url: string;
  features?: string[];
  category?: string;
}

interface TrendingProduct {
  title: string;
  niche: string;
  trendScore: number;
  sources: string[];
  keywords: string[];
}

interface ProductPicksPanelProps {
  onProductSelect?: (product: AmazonProduct, insertType: 'link' | 'card' | 'list') => void;
  selectedNiche?: string;
}

const NICHES = [
  'tech', 'fitness', 'beauty', 'fashion', 'food', 'travel', 'pets'
];

export function ProductPicksPanel({ onProductSelect, selectedNiche }: ProductPicksPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [niche, setNiche] = useState(selectedNiche || 'tech');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [minRating, setMinRating] = useState<number>(0);
  const [primeOnly, setPrimeOnly] = useState(false);
  const [source, setSource] = useState<'hybrid' | 'amazon'>('hybrid');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch Amazon products
  const { data: amazonProducts, isLoading: amazonLoading, refetch: refetchAmazon } = useQuery({
    queryKey: ['/api/amazon/search', { 
      query: searchTerm || niche, 
      category: niche,
      minPrice: priceRange.includes('-') ? priceRange.split('-')[0] : undefined,
      maxPrice: priceRange.includes('-') ? priceRange.split('-')[1] : undefined,
      minRating: minRating > 0 ? minRating : undefined,
      primeOnly: primeOnly
    }],
    enabled: source === 'amazon' || source === 'hybrid'
  });

  // Fetch hybrid trending products
  const { data: hybridProducts, isLoading: hybridLoading, refetch: refetchHybrid } = useQuery({
    queryKey: ['/api/hybridTrends', {
      niche,
      limit: 20,
      minRating: minRating > 0 ? minRating : undefined,
      priceRange: priceRange !== 'all' ? priceRange : undefined
    }],
    enabled: source === 'hybrid'
  });

  // Copy affiliate link mutation
  const copyLinkMutation = useMutation({
    mutationFn: async (product: AmazonProduct) => {
      // Generate proper affiliate link with attribution
      const response = await apiRequest('/api/amazonLinks', {
        method: 'POST',
        body: JSON.stringify({
          productUrl: product.url,
          asin: product.asin,
          niche: niche
        })
      });
      return response.affiliateUrl;
    },
    onSuccess: (link) => {
      navigator.clipboard.writeText(link);
      toast({
        title: 'Link copied',
        description: 'Affiliate link copied to clipboard'
      });
    },
    onError: () => {
      toast({
        title: 'Copy failed',
        description: 'Unable to copy affiliate link',
        variant: 'destructive'
      });
    }
  });

  const handleSearch = () => {
    if (source === 'amazon' || source === 'hybrid') {
      refetchAmazon();
    }
    if (source === 'hybrid') {
      refetchHybrid();
    }
  };

  const handleProductSelect = (product: AmazonProduct, insertType: 'link' | 'card' | 'list') => {
    onProductSelect?.(product, insertType);
    toast({
      title: 'Product added',
      description: `${product.title} inserted as ${insertType}`
    });
  };

  const renderProductCard = (product: AmazonProduct) => (
    <Card key={product.asin} className="w-full" data-testid={`product-card-${product.asin}`}>
      <CardContent className="p-4">
        <div className="flex gap-3">
          <img
            src={product.images.primary}
            alt={product.title}
            className="w-20 h-20 object-cover rounded-md flex-shrink-0"
            data-testid={`product-image-${product.asin}`}
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm line-clamp-2 mb-2" data-testid={`product-title-${product.asin}`}>
              {product.title}
            </h3>
            
            <div className="flex items-center gap-2 mb-2">
              {product.price && (
                <Badge variant="secondary" data-testid={`product-price-${product.asin}`}>
                  {product.price.formatted}
                </Badge>
              )}
              {product.prime && (
                <Badge className="bg-blue-500 text-white text-xs">Prime</Badge>
              )}
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs" data-testid={`product-rating-${product.asin}`}>
                  {product.rating.value.toFixed(1)} ({product.rating.count})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 mb-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleProductSelect(product, 'link')}
                data-testid={`insert-link-${product.asin}`}
              >
                <Plus className="h-3 w-3 mr-1" />
                Link
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleProductSelect(product, 'card')}
                data-testid={`insert-card-${product.asin}`}
              >
                <Package className="h-3 w-3 mr-1" />
                Card
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyLinkMutation.mutate(product)}
                data-testid={`copy-link-${product.asin}`}
              >
                <Copy className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                asChild
                data-testid={`view-amazon-${product.asin}`}
              >
                <a href={product.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const displayProducts = source === 'hybrid' 
    ? (hybridProducts?.data?.products || [])
    : (amazonProducts?.data?.products || []);

  const isLoading = source === 'hybrid' 
    ? hybridLoading 
    : amazonLoading;

  return (
    <div className="space-y-4" data-testid="product-picks-panel">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Product Picks
          </CardTitle>
          <CardDescription>
            Discover and insert trending Amazon products into your content
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Source Toggle */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">Product Source</p>
              <p className="text-xs text-muted-foreground">
                Choose between trending products or direct Amazon search
              </p>
            </div>
            <Tabs 
              value={source} 
              onValueChange={(value: 'hybrid' | 'amazon') => setSource(value)}
              data-testid="source-tabs"
            >
              <TabsList>
                <TabsTrigger value="hybrid">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Trending
                </TabsTrigger>
                <TabsTrigger value="amazon">
                  <Search className="h-4 w-4 mr-1" />
                  Amazon
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <Separator className="mb-4" />

          {/* Search and Filters */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={source === 'hybrid' ? 'Search trending products...' : 'Search Amazon products...'}
                className="flex-1"
                data-testid="search-input"
              />
              <Button 
                onClick={handleSearch}
                disabled={isLoading}
                data-testid="search-button"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium">Niche</label>
                <Select value={niche} onValueChange={setNiche}>
                  <SelectTrigger data-testid="niche-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {NICHES.map(n => (
                      <SelectItem key={n} value={n}>
                        {n.charAt(0).toUpperCase() + n.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">Price Range</label>
                <Select value={priceRange} onValueChange={setPriceRange}>
                  <SelectTrigger data-testid="price-range-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Prices</SelectItem>
                    <SelectItem value="0-25">$0 - $25</SelectItem>
                    <SelectItem value="25-50">$25 - $50</SelectItem>
                    <SelectItem value="50-100">$50 - $100</SelectItem>
                    <SelectItem value="100-999">$100+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">Min Rating</label>
                <Select 
                  value={minRating.toString()} 
                  onValueChange={(value) => setMinRating(Number(value))}
                >
                  <SelectTrigger data-testid="min-rating-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Any Rating</SelectItem>
                    <SelectItem value="3">3+ Stars</SelectItem>
                    <SelectItem value="4">4+ Stars</SelectItem>
                    <SelectItem value="4.5">4.5+ Stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">Prime Only</label>
                <div className="flex items-center h-10">
                  <Switch
                    checked={primeOnly}
                    onCheckedChange={setPrimeOnly}
                    data-testid="prime-only-toggle"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product Results */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {source === 'hybrid' ? 'Trending Products' : 'Amazon Search Results'}
          </CardTitle>
          <CardDescription>
            {displayProducts.length} products found
            {source === 'hybrid' && ' • Updated from multiple trend sources'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              <span>Loading products...</span>
            </div>
          ) : displayProducts.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No products found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayProducts.map(renderProductCard)}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Instructions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <Plus className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium mb-1">How to use Product Picks</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• <strong>Link:</strong> Insert a simple affiliate link in your content</li>
                <li>• <strong>Card:</strong> Add a product card with image, price, and rating</li>
                <li>• <strong>Copy:</strong> Copy the affiliate link to use elsewhere</li>
                <li>• Toggle between trending products and direct Amazon search</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}