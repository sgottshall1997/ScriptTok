import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2, Search, Star, ShoppingCart, ExternalLink, CheckCircle, Package } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

/**
 * Amazon Product Search Component
 * Comprehensive search interface for Amazon PA-API with filters and real-time results
 */

interface AmazonProduct {
  asin: string;
  title: string;
  image: string | null;
  rating: number | null;
  reviewCount: number | null;
  price: string | null;
  isPrime: boolean | null;
  url: string;
}

interface SearchFilters {
  keywords: string;
  category: string;
  minRating: number;
  minReviews: number;
  primeOnly: boolean;
  sortBy: string;
  niche: string;
  platform: string;
}

const categoryOptions = [
  { value: '', label: 'All Categories' },
  { value: 'beauty', label: 'Beauty & Personal Care' },
  { value: 'tech', label: 'Electronics & Tech' },
  { value: 'fashion', label: 'Fashion & Apparel' },
  { value: 'fitness', label: 'Sports & Fitness' },
  { value: 'food', label: 'Grocery & Food' },
  { value: 'travel', label: 'Travel & Luggage' },
  { value: 'pets', label: 'Pet Supplies' },
  { value: 'home', label: 'Home & Kitchen' },
  { value: 'books', label: 'Books' },
  { value: 'automotive', label: 'Automotive' }
];

const sortOptions = [
  { value: 'Featured', label: 'Featured' },
  { value: 'Relevance', label: 'Relevance' },
  { value: 'Price:LowToHigh', label: 'Price: Low to High' },
  { value: 'Price:HighToLow', label: 'Price: High to Low' },
  { value: 'NewestArrivals', label: 'Newest Arrivals' },
  { value: 'AvgCustomerReviews', label: 'Customer Reviews' }
];

const nicheOptions = [
  { value: 'general', label: 'General' },
  { value: 'beauty', label: 'Beauty' },
  { value: 'tech', label: 'Technology' },
  { value: 'fashion', label: 'Fashion' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'food', label: 'Food & Nutrition' },
  { value: 'travel', label: 'Travel' },
  { value: 'pets', label: 'Pets' }
];

const platformOptions = [
  { value: 'web', label: 'Website' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'twitter', label: 'Twitter' },
  { value: 'facebook', label: 'Facebook' }
];

export function AmazonProductSearch() {
  const [filters, setFilters] = useState<SearchFilters>({
    keywords: '',
    category: '',
    minRating: 0,
    minReviews: 0,
    primeOnly: false,
    sortBy: 'Featured',
    niche: 'general',
    platform: 'web'
  });

  const [searchTrigger, setSearchTrigger] = useState<string>('');
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());

  // Amazon product search query
  const { data: searchResults, isLoading: isSearching, error: searchError } = useQuery({
    queryKey: ['amazon-search', searchTrigger, filters.category, filters.minRating, filters.minReviews, filters.primeOnly, filters.sortBy, filters.niche, filters.platform],
    queryFn: async () => {
      if (!searchTrigger.trim()) return null;
      
      const params = new URLSearchParams({
        keywords: searchTrigger,
        niche: filters.niche,
        platform: filters.platform,
        sortBy: filters.sortBy,
        primeOnly: filters.primeOnly.toString()
      });
      
      if (filters.category) params.set('category', filters.category);
      if (filters.minRating > 0) params.set('minRating', filters.minRating.toString());
      if (filters.minReviews > 0) params.set('minReviews', filters.minReviews.toString());
      
      const response = await fetch(`/api/amazon/search?${params}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Search failed with status ${response.status}`);
      }
      
      return response.json();
    },
    enabled: !!searchTrigger.trim(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on 503 (service unavailable) - likely Amazon API issues
      if (error?.message?.includes('503') || error?.message?.includes('Amazon temporarily unavailable')) {
        return false;
      }
      return failureCount < 2;
    }
  });

  const handleSearch = () => {
    if (!filters.keywords.trim()) {
      toast({
        title: "Search Required",
        description: "Please enter keywords to search for products.",
        variant: "destructive"
      });
      return;
    }
    
    setSearchTrigger(filters.keywords.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const toggleProductSelection = (asin: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(asin)) {
      newSelected.delete(asin);
    } else {
      newSelected.add(asin);
    }
    setSelectedProducts(newSelected);
  };

  const handleBulkAction = (action: 'copy-urls' | 'export-csv') => {
    if (selectedProducts.size === 0) {
      toast({
        title: "No Products Selected",
        description: "Please select products first.",
        variant: "destructive"
      });
      return;
    }

    const selectedItems = searchResults?.items?.filter((item: AmazonProduct) => 
      selectedProducts.has(item.asin)
    ) || [];

    if (action === 'copy-urls') {
      const urls = selectedItems.map((item: AmazonProduct) => item.url).join('\n');
      navigator.clipboard.writeText(urls);
      toast({
        title: "URLs Copied",
        description: `${selectedItems.length} affiliate URLs copied to clipboard.`
      });
    } else if (action === 'export-csv') {
      const csvContent = [
        'ASIN,Title,Price,Rating,Reviews,Prime,URL',
        ...selectedItems.map((item: AmazonProduct) => 
          `"${item.asin}","${item.title}","${item.price || ''}","${item.rating || ''}","${item.reviewCount || ''}","${item.isPrime}","${item.url}"`
        )
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `amazon-products-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export Complete",
        description: `${selectedItems.length} products exported to CSV.`
      });
    }
  };

  const products: AmazonProduct[] = searchResults?.items || [];
  const isAmazonConfigured = searchResults !== null || !searchError?.message?.includes('Amazon PA-API not configured');

  return (
    <div className="space-y-6" data-testid="amazon-product-search">
      {/* Configuration Notice */}
      {!isAmazonConfigured && searchError && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-yellow-800">
              <div className="h-4 w-4 rounded-full bg-yellow-500" />
              <div>
                <p className="font-medium">Amazon PA-API Configuration Required</p>
                <p className="text-sm text-yellow-700 mt-1">
                  To use Amazon product search, configure your Amazon PA-API credentials in the environment settings.
                  This enables real-time product data and affiliate link generation.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Amazon Product Search</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Main Search */}
          <div className="flex space-x-2">
            <Input
              placeholder="Search Amazon products (e.g., wireless headphones, skincare routine, yoga mat)"
              value={filters.keywords}
              onChange={(e) => setFilters({ ...filters, keywords: e.target.value })}
              onKeyPress={handleKeyPress}
              className="flex-1"
              data-testid="search-input"
            />
            <Button 
              onClick={handleSearch} 
              disabled={isSearching || !filters.keywords.trim()}
              data-testid="search-button"
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Advanced Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={filters.category} onValueChange={(value) => setFilters({ ...filters, category: value })}>
                <SelectTrigger data-testid="category-select">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sortBy">Sort By</Label>
              <Select value={filters.sortBy} onValueChange={(value) => setFilters({ ...filters, sortBy: value })}>
                <SelectTrigger data-testid="sort-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="niche">Content Niche</Label>
              <Select value={filters.niche} onValueChange={(value) => setFilters({ ...filters, niche: value })}>
                <SelectTrigger data-testid="niche-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {nicheOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="platform">Target Platform</Label>
              <Select value={filters.platform} onValueChange={(value) => setFilters({ ...filters, platform: value })}>
                <SelectTrigger data-testid="platform-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {platformOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Rating and Review Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Minimum Rating: {filters.minRating > 0 ? `${filters.minRating}+ stars` : 'Any'}</Label>
              <Slider
                value={[filters.minRating]}
                onValueChange={(value) => setFilters({ ...filters, minRating: value[0] })}
                max={5}
                min={0}
                step={0.5}
                className="w-full"
                data-testid="rating-slider"
              />
            </div>

            <div className="space-y-2">
              <Label>Minimum Reviews: {filters.minReviews > 0 ? `${filters.minReviews}+` : 'Any'}</Label>
              <Slider
                value={[filters.minReviews]}
                onValueChange={(value) => setFilters({ ...filters, minReviews: value[0] })}
                max={1000}
                min={0}
                step={10}
                className="w-full"
                data-testid="reviews-slider"
              />
            </div>
          </div>

          {/* Prime Filter */}
          <div className="flex items-center space-x-2">
            <Switch
              id="prime-only"
              checked={filters.primeOnly}
              onCheckedChange={(checked) => setFilters({ ...filters, primeOnly: checked })}
              data-testid="prime-switch"
            />
            <Label htmlFor="prime-only">Prime Eligible Only</Label>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchError && isAmazonConfigured && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-red-800">
              <p className="font-medium">Search Error</p>
              <p className="text-sm mt-1">{searchError.message}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {isSearching && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2 text-gray-600">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Searching Amazon products...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {products.length > 0 && (
        <>
          {/* Bulk Actions */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {products.length} products found • {selectedProducts.size} selected
            </p>
            {selectedProducts.size > 0 && (
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => handleBulkAction('copy-urls')}>
                  Copy URLs
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleBulkAction('export-csv')}>
                  Export CSV
                </Button>
              </div>
            )}
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.asin} className="relative hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  {/* Selection Checkbox */}
                  <div className="absolute top-2 left-2 z-10">
                    <Button
                      variant={selectedProducts.has(product.asin) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleProductSelection(product.asin)}
                      className="h-8 w-8 p-0"
                      data-testid={`select-product-${product.asin}`}
                    >
                      {selectedProducts.has(product.asin) ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <div className="h-4 w-4 border rounded-full" />
                      )}
                    </Button>
                  </div>

                  {/* Product Image */}
                  {product.image && (
                    <div className="mb-3">
                      <img 
                        src={product.image} 
                        alt={product.title}
                        className="w-full h-48 object-contain rounded-lg bg-gray-50"
                        loading="lazy"
                      />
                    </div>
                  )}

                  {/* Product Info */}
                  <div className="space-y-2">
                    <h3 className="font-medium text-sm line-clamp-2" title={product.title}>
                      {product.title}
                    </h3>

                    {/* Price and Prime */}
                    <div className="flex items-center justify-between">
                      {product.price && (
                        <span className="font-semibold text-lg text-green-600">
                          {product.price}
                        </span>
                      )}
                      {product.isPrime && (
                        <Badge variant="secondary" className="text-xs">
                          Prime
                        </Badge>
                      )}
                    </div>

                    {/* Rating and Reviews */}
                    {product.rating && (
                      <div className="flex items-center space-x-2 text-sm">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{product.rating}</span>
                        </div>
                        {product.reviewCount && (
                          <span className="text-gray-500">({product.reviewCount})</span>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => {
                          navigator.clipboard.writeText(product.url);
                          toast({
                            title: "URL Copied",
                            description: "Affiliate link copied to clipboard."
                          });
                        }}
                        data-testid={`copy-url-${product.asin}`}
                      >
                        Copy URL
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => window.open(product.url, '_blank')}
                        data-testid={`view-product-${product.asin}`}
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>

                    {/* ASIN */}
                    <p className="text-xs text-gray-500 mt-2">ASIN: {product.asin}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {searchTrigger && !isSearching && products.length === 0 && searchResults && (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600">No products found for "{searchTrigger}"</p>
            <p className="text-sm text-gray-500 mt-1">Try adjusting your search terms or filters.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}