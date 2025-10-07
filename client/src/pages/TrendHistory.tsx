import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  Clock, 
  TrendingUp, 
  Calendar,
  Search,
  Filter,
  RefreshCw,
  Eye,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Hash,
  Target,
  BarChart3,
  Zap,
  Package,
  Lock,
  Crown,
  ArrowRight
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useQuery } from '@tanstack/react-query';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";

interface TrendHistoryItem {
  id: number;
  sourceType: 'trend_forecaster' | 'ai_trending_picks';
  niche: string;
  fetchedAt: string;
  trendCategory?: string;
  trendName?: string;
  trendDescription?: string;
  trendVolume?: number;
  trendGrowth?: string;
  trendWhen?: string;
  trendOpportunity?: string;
  trendReason?: string;
  productTitle?: string;
  productMentions?: number;
  productEngagement?: string;
  productSource?: string;
  productReason?: string;
  productDescription?: string;
  viralKeywords?: string[];
  productData?: any;
  rawData?: any;
  createdAt: string;
}

interface UsageData {
  tier: 'free' | 'pro';
  gpt: { used: number; limit: number; remaining: number };
  claude: { used: number; limit: number; remaining: number };
  trendAnalyses: { used: number; limit: number; remaining: number };
  canBulkGenerate: boolean;
  templatesUnlocked: number;
}

const useUsageData = () => {
  return useQuery<{ success: boolean; data: UsageData }>({
    queryKey: ['/api/billing/usage'],
    refetchOnMount: true,
    staleTime: 0,
  });
};

const TrendHistory = () => {
  const { toast } = useToast();
  const { data: usageResponse, isLoading: usageLoading, isError: usageError } = useUsageData();
  const usage = usageResponse?.data;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNiche, setSelectedNiche] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});

  // Fetch trend history data
  const { data: trendHistory = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/trend-history'],
    queryFn: async () => {
      const response = await fetch('/api/trend-history');
      const data = await response.json();
      return data.success ? data.history : [];
    },
    staleTime: 30000, // 30 seconds
  });

  // Filter and sort data
  const filteredHistory = React.useMemo(() => {
    let filtered = (trendHistory as TrendHistoryItem[]).filter((item: TrendHistoryItem) => {
      const matchesSearch = !searchTerm || 
        item.trendName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.productTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.trendDescription?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesNiche = selectedNiche === 'all' || item.niche === selectedNiche;
      
      return matchesSearch && matchesNiche;
    });

    // Sort data
    switch (sortBy) {
      case 'newest':
        return filtered.sort((a: TrendHistoryItem, b: TrendHistoryItem) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case 'oldest':
        return filtered.sort((a: TrendHistoryItem, b: TrendHistoryItem) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case 'niche':
        return filtered.sort((a: TrendHistoryItem, b: TrendHistoryItem) => 
          a.niche.localeCompare(b.niche)
        );
      default:
        return filtered;
    }
  }, [trendHistory, searchTerm, selectedNiche, sortBy]);

  // Get unique niches for filter
  const availableNiches = React.useMemo(() => {
    const niches = new Set(
      (trendHistory as TrendHistoryItem[])
        .map((item: TrendHistoryItem) => item.niche)
        .filter((niche): niche is string => typeof niche === 'string')
    );
    return Array.from(niches).sort();
  }, [trendHistory]);

  // Filter by source type
  const forecasterHistory = filteredHistory.filter((item: TrendHistoryItem) => 
    item.sourceType === 'trend_forecaster'
  );
  
  const aiPicksHistory = filteredHistory.filter((item: TrendHistoryItem) => 
    item.sourceType === 'ai_trending_picks'
  );

  const toggleExpanded = (id: number) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTrendCategoryColor = (category: string | undefined) => {
    if (!category) return 'bg-gray-100 text-gray-800';
    
    switch (category.toLowerCase()) {
      case 'hot':
        return 'bg-red-100 text-red-800';
      case 'rising':
        return 'bg-orange-100 text-orange-800';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'declining':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-purple-100 text-purple-800';
    }
  };

  // Upgrade CTA Card Component
  const UpgradeCTACard = () => (
    <Card className="mb-4 border-2 border-transparent bg-gradient-to-r from-purple-50 to-pink-50 relative overflow-hidden" data-testid="upgrade-cta-card">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10" />
      <CardHeader className="relative">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
            <Crown className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Unlock Full Trend History with Pro
          </CardTitle>
        </div>
        <p className="text-gray-700 text-base">
          Trend history is a Pro-only feature. Upgrade to Pro to access unlimited trend history, export data, and track trends over time!
        </p>
      </CardHeader>
      <CardContent className="relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          <div className="flex items-start gap-2">
            <span className="text-xl">📊</span>
            <span className="text-gray-700">Unlimited trend history access</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-xl">📥</span>
            <span className="text-gray-700">Export trends to CSV</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-xl">📈</span>
            <span className="text-gray-700">Advanced trend analytics</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-xl">🔍</span>
            <span className="text-gray-700">Full search and filtering</span>
          </div>
        </div>
        <Link href="/account">
          <Button 
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-6 text-lg shadow-lg"
            data-testid="upgrade-button"
          >
            <Crown className="h-5 w-5 mr-2" />
            Upgrade to Pro
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );

  // Blurred locked item wrapper
  const LockedTrendItem = ({ item }: { item: TrendHistoryItem }) => (
    <div className="relative mb-4" data-testid={`locked-trend-${item.id}`}>
      <div className="blur-md pointer-events-none select-none">
        {renderTrendItem(item)}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-transparent via-white/60 to-white/80">
        <div className="bg-white border-2 border-purple-300 rounded-lg shadow-lg px-6 py-4 flex items-center gap-3">
          <Lock className="h-6 w-6 text-purple-600" />
          <div>
            <div className="font-semibold text-purple-900 text-lg">Pro Only</div>
            <div className="text-sm text-gray-600">Upgrade to unlock</div>
          </div>
        </div>
      </div>
    </div>
  );

  // Helper function to render trends with tier restrictions
  const renderTrendsWithRestrictions = (trends: TrendHistoryItem[]) => {
    // Conservative approach: Only unlock for confirmed Pro users
    const isPro = usage?.tier === 'pro';

    if (isPro) {
      // Pro users see everything
      return trends.map(renderTrendItem);
    }

    // Free users see NO content, only the upgrade CTA
    return (
      <div data-testid="free-user-gate">
        <UpgradeCTACard />
        <Card className="mt-4">
          <CardContent className="py-12">
            <div className="text-center">
              <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Trend History is a Pro Feature</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Upgrade to Pro to access your complete trend history, track patterns over time, and unlock advanced analytics.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Render individual trend history item
  const renderTrendItem = (item: TrendHistoryItem) => {
    const isExpanded = expandedItems[item.id];
    
    return (
      <Card key={item.id} className="mb-4 hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs">
                  {item.niche}
                </Badge>
                {item.trendCategory && (
                  <Badge className={`text-xs ${getTrendCategoryColor(item.trendCategory)}`}>
                    {item.trendCategory}
                  </Badge>
                )}
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(item.createdAt)}
                </span>
              </div>
              
              <CardTitle className="text-lg mb-1">
                {item.trendName || item.productTitle || 'Untitled Trend'}
              </CardTitle>
              
              {item.trendDescription && (
                <p className={`text-sm text-gray-600 ${isExpanded ? '' : 'line-clamp-3'}`}>
                  {item.trendDescription}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              {item.trendVolume && (
                <div className="text-right">
                  <div className="text-xs text-gray-500">Volume</div>
                  <div className="font-medium">{item.trendVolume.toLocaleString()}</div>
                </div>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleExpanded(item.id)}
                data-testid={`expand-trend-${item.id}`}
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>

        <Collapsible open={isExpanded}>
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-4">
              {/* Full Description */}
              {item.trendDescription && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-700 mb-2">Full Description</div>
                  <div className="text-sm text-gray-600">{item.trendDescription}</div>
                </div>
              )}

              {/* Product Data from JSON */}
              {item.productData && Array.isArray(item.productData) && item.productData.length > 0 && (
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="text-sm font-medium text-purple-700 mb-3 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Featured Products ({item.productData.length})
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {item.productData.map((product: any, index: number) => (
                      <div key={index} className="bg-white rounded-lg p-3 border border-purple-200">
                        <div className="font-medium text-sm text-gray-800">{product.name}</div>
                        <div className="text-purple-600 font-semibold">{product.price}</div>
                        {product.asin && (
                          <div className="text-xs text-gray-500 mt-1">ASIN: {product.asin}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trend Details */}
              {(item.trendGrowth || item.trendWhen || item.trendOpportunity) && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg">
                  {item.trendGrowth && (
                    <div>
                      <div className="text-xs font-medium text-blue-600 mb-1">Growth</div>
                      <div className="text-sm">{item.trendGrowth}</div>
                    </div>
                  )}
                  {item.trendWhen && (
                    <div>
                      <div className="text-xs font-medium text-blue-600 mb-1">Timeline</div>
                      <div className="text-sm">{item.trendWhen}</div>
                    </div>
                  )}
                  {item.trendOpportunity && (
                    <div>
                      <div className="text-xs font-medium text-blue-600 mb-1">Opportunity</div>
                      <div className="text-sm">{item.trendOpportunity}</div>
                    </div>
                  )}
                </div>
              )}

              {/* Product Details */}
              {(item.productTitle || item.productMentions || item.productEngagement) && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-sm font-medium text-green-700 mb-2">Product Information</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {item.productTitle && (
                      <div>
                        <div className="text-xs text-green-600 mb-1">Product</div>
                        <div className="text-sm font-medium">{item.productTitle}</div>
                      </div>
                    )}
                    {item.productMentions && (
                      <div>
                        <div className="text-xs text-green-600 mb-1">Mentions</div>
                        <div className="text-sm">{item.productMentions.toLocaleString()}</div>
                      </div>
                    )}
                    {item.productEngagement && (
                      <div className="col-span-full">
                        <div className="text-xs text-green-600 mb-1">Engagement</div>
                        <div className="text-sm">{item.productEngagement}</div>
                      </div>
                    )}
                  </div>
                  {item.productDescription && (
                    <div className="mt-3">
                      <div className="text-xs text-green-600 mb-1">Description</div>
                      <div className="text-sm">{item.productDescription}</div>
                    </div>
                  )}
                </div>
              )}

              {/* Viral Keywords */}
              {item.viralKeywords && item.viralKeywords.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    Viral Keywords
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.viralKeywords.map((keyword, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Reasoning */}
              {(item.trendReason || item.productReason) && (
                <div className="space-y-3">
                  {item.trendReason && (
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-1">Trend Analysis</div>
                      <div className="text-sm text-gray-600 italic">{item.trendReason}</div>
                    </div>
                  )}
                  {item.productReason && (
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-1">Product Analysis</div>
                      <div className="text-sm text-gray-600 italic">{item.productReason}</div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    );
  };

  // Show loading state ONLY while usage data is loading
  if (usageLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Skeleton className="h-12 w-12 rounded-lg" data-testid="skeleton-icon" />
            <div className="flex-1">
              <Skeleton className="h-8 w-64 mb-2" data-testid="skeleton-title" />
              <Skeleton className="h-5 w-96" data-testid="skeleton-subtitle" />
            </div>
          </div>
          <Card className="p-6" data-testid="loading-tier-card">
            <div className="flex items-center gap-3">
              <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
              <span className="text-gray-600">Loading tier information...</span>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading trend history...</span>
        </div>
      </div>
    );
  }

  const isPro = usage?.tier === 'pro';

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Clock className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Trend History</h1>
            <p className="text-gray-600">Historical trend data from Forecaster and AI Picks</p>
          </div>
        </div>

        {/* Show controls and stats only for Pro users */}
        {isPro && (
          <>
            {/* Controls */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search trends, products, or descriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="search-trends"
                />
              </div>

              {/* Niche Filter */}
              <Select value={selectedNiche} onValueChange={setSelectedNiche}>
                <SelectTrigger className="w-48" data-testid="filter-niche">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by niche" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Niches</SelectItem>
                  {availableNiches.map((niche) => (
                    <SelectItem key={niche} value={niche}>
                      {niche.charAt(0).toUpperCase() + niche.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40" data-testid="sort-trends">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="niche">By Niche</SelectItem>
                </SelectContent>
              </Select>

              {/* Refresh */}
              <Button 
                variant="outline" 
                onClick={() => refetch()}
                data-testid="refresh-trends"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="text-2xl font-bold">{trendHistory.length}</div>
                      <div className="text-xs text-gray-600">Total Records</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="text-2xl font-bold">{forecasterHistory.length}</div>
                      <div className="text-xs text-gray-600">Forecaster</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-purple-600" />
                    <div>
                      <div className="text-2xl font-bold">{aiPicksHistory.length}</div>
                      <div className="text-xs text-gray-600">AI Picks</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Hash className="h-5 w-5 text-orange-600" />
                    <div>
                      <div className="text-2xl font-bold">{availableNiches.length}</div>
                      <div className="text-xs text-gray-600">Niches</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all" data-testid="tab-all">
            All History ({filteredHistory.length})
          </TabsTrigger>
          <TabsTrigger value="forecaster" data-testid="tab-forecaster">
            Trend Forecaster ({forecasterHistory.length})
          </TabsTrigger>
          <TabsTrigger value="ai-picks" data-testid="tab-ai-picks">
            AI Trending Picks ({aiPicksHistory.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div data-testid="all-trends-list">
            {filteredHistory.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No trend history found</h3>
                    <p className="text-gray-600">
                      {searchTerm || selectedNiche !== 'all' 
                        ? 'Try adjusting your search or filters'
                        : 'Trend history will appear here as you use the forecasting features'
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              renderTrendsWithRestrictions(filteredHistory)
            )}
          </div>
        </TabsContent>

        <TabsContent value="forecaster" className="mt-6">
          <div data-testid="forecaster-trends-list">
            {forecasterHistory.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No forecaster history</h3>
                    <p className="text-gray-600">
                      Trend forecaster history will appear here after using the forecasting feature
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              renderTrendsWithRestrictions(forecasterHistory)
            )}
          </div>
        </TabsContent>

        <TabsContent value="ai-picks" className="mt-6">
          <div data-testid="ai-picks-trends-list">
            {aiPicksHistory.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No AI picks history</h3>
                    <p className="text-gray-600">
                      AI trending picks history will appear here after generating trends
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              renderTrendsWithRestrictions(aiPicksHistory)
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TrendHistory;