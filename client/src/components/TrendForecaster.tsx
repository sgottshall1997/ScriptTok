import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Flame, TrendingUp, Clock, TrendingDown, Loader2, RefreshCw } from 'lucide-react';
import { useLocation } from 'wouter';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const NICHES = [
  { id: 'beauty', name: 'Beauty', icon: '💄' },
  { id: 'tech', name: 'Tech', icon: '📱' },
  { id: 'fashion', name: 'Fashion', icon: '👗' },
  { id: 'fitness', name: 'Fitness', icon: '💪' },
  { id: 'food', name: 'Food', icon: '🍽️' },
  { id: 'travel', name: 'Travel', icon: '✈️' },
  { id: 'pet', name: 'Pets', icon: '🐾' }
];

export default function TrendForecaster() {
  const [, setLocation] = useLocation();
  const [selectedNiche, setSelectedNiche] = useState('beauty');
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: forecast, isLoading, isFetching, dataUpdatedAt } = useQuery({
    queryKey: ['/api/trend-forecast', selectedNiche],
    queryFn: async () => {
      console.log(`🔮 TrendForecaster: Fetching ${selectedNiche} trends from Perplexity...`);
      const response = await fetch(`/api/trend-forecast/${selectedNiche}`);
      if (!response.ok) {
        throw new Error('Failed to fetch trend forecast');
      }
      const data = await response.json();
      
      // Console logging for full visibility
      console.log(`🎯 TrendForecaster: ${selectedNiche.toUpperCase()} Response:`, data);
      console.log(`📊 Raw Trends Data for ${selectedNiche}:`, data.data?.trends);
      
      if (data.data?.trends) {
        const trends = data.data.trends;
        console.log(`🔥 HOT ${selectedNiche} trends (${trends.hot?.length || 0}):`, trends.hot);
        console.log(`📈 RISING ${selectedNiche} trends (${trends.rising?.length || 0}):`, trends.rising);
        console.log(`🕐 UPCOMING ${selectedNiche} trends (${trends.upcoming?.length || 0}):`, trends.upcoming);
        console.log(`📉 DECLINING ${selectedNiche} trends (${trends.declining?.length || 0}):`, trends.declining);
      }
      
      return data;
    },
    staleTime: Infinity, // Never auto-refresh
    gcTime: 1000 * 60 * 60 * 24, // Cache for 24 hours
    enabled: !!selectedNiche
  });

  const handleProductClick = (productName: string, niche: string) => {
    setLocation(`/generate?product=${encodeURIComponent(productName)}&niche=${niche}`);
  };

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ 
      queryKey: ['/api/trend-forecast', selectedNiche] 
    });
    toast({
      title: "Trends Refreshed",
      description: `Updated ${selectedNiche} trends from Perplexity`,
    });
  };

  const lastUpdated = dataUpdatedAt ? new Date(dataUpdatedAt) : null;
  const timeSinceUpdate = lastUpdated ? getTimeSince(lastUpdated) : 'Never';

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              🔮 Trend Forecaster - All Niches
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Real-time TikTok trends powered by Perplexity AI
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right mr-2">
              <p className="text-xs text-gray-500">Last updated</p>
              <p className="text-xs font-semibold text-gray-700">{timeSinceUpdate}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isFetching}
              className="border-purple-300 text-purple-700 hover:bg-purple-100"
            >
              {isFetching ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedNiche} onValueChange={setSelectedNiche} className="w-full">
          <TabsList className="grid w-full grid-cols-7 mb-4">
            {NICHES.map((niche) => (
              <TabsTrigger key={niche.id} value={niche.id} className="text-xs">
                <span className="hidden sm:inline">{niche.icon} {niche.name}</span>
                <span className="sm:hidden">{niche.icon}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {NICHES.map((niche) => (
            <TabsContent key={niche.id} value={niche.id}>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                  <span className="ml-2 text-gray-600">Loading {niche.name} trends...</span>
                </div>
              ) : (
                <TrendCategories 
                  forecast={forecast?.data} 
                  niche={niche.id}
                  onProductClick={handleProductClick}
                />
              )}
            </TabsContent>
          ))}
        </Tabs>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800">
            💡 <strong>Tip:</strong> Trends are cached to save API credits. Click "Refresh" to get latest trends from Perplexity (uses 1 API call).
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function getTimeSince(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  
  return date.toLocaleDateString();
}

function TrendCategories({ 
  forecast, 
  niche, 
  onProductClick 
}: { 
  forecast: any; 
  niche: string;
  onProductClick: (product: string, niche: string) => void;
}) {
  if (!forecast) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No trends available</p>
        <p className="text-xs mt-2">Click "Refresh" to fetch trends</p>
      </div>
    );
  }

  return (
    <Tabs defaultValue="hot" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="hot">
          <Flame className="h-4 w-4 mr-1" /> Hot
        </TabsTrigger>
        <TabsTrigger value="rising">
          <TrendingUp className="h-4 w-4 mr-1" /> Rising
        </TabsTrigger>
        <TabsTrigger value="upcoming">
          <Clock className="h-4 w-4 mr-1" /> Upcoming
        </TabsTrigger>
        <TabsTrigger value="declining">
          <TrendingDown className="h-4 w-4 mr-1" /> Avoid
        </TabsTrigger>
      </TabsList>

      <TabsContent value="hot" className="space-y-3 mt-4">
        {forecast.trends?.hot?.map((item: any, i: number) => (
          <TrendCard key={i} item={item} type="hot" niche={niche} onProductClick={onProductClick} />
        ))}
      </TabsContent>

      <TabsContent value="rising" className="space-y-3 mt-4">
        {forecast.trends?.rising?.map((item: any, i: number) => (
          <TrendCard key={i} item={item} type="rising" niche={niche} onProductClick={onProductClick} />
        ))}
      </TabsContent>

      <TabsContent value="upcoming" className="space-y-3 mt-4">
        {forecast.trends?.upcoming?.map((item: any, i: number) => (
          <TrendCard key={i} item={item} type="upcoming" niche={niche} onProductClick={onProductClick} />
        ))}
      </TabsContent>

      <TabsContent value="declining" className="space-y-3 mt-4">
        {forecast.trends?.declining?.map((item: any, i: number) => (
          <TrendCard key={i} item={item} type="declining" niche={niche} onProductClick={onProductClick} />
        ))}
      </TabsContent>
    </Tabs>
  );
}

function TrendCard({ 
  item, 
  type, 
  niche, 
  onProductClick 
}: { 
  item: any; 
  type: 'hot' | 'rising' | 'upcoming' | 'declining';
  niche: string;
  onProductClick: (product: string, niche: string) => void;
}) {
  const styles = {
    hot: {
      border: 'border-red-200',
      title: 'text-red-700',
      badge: 'text-red-600 border-red-300',
      button: 'bg-red-500 hover:bg-red-600'
    },
    rising: {
      border: 'border-green-200',
      title: 'text-green-700',
      badge: 'text-green-600 border-green-300',
      button: 'bg-green-500 hover:bg-green-600'
    },
    upcoming: {
      border: 'border-blue-200',
      title: 'text-blue-700',
      badge: 'text-blue-600 border-blue-300',
      button: 'bg-blue-500 hover:bg-blue-600'
    },
    declining: {
      border: 'border-gray-200',
      title: 'text-gray-700',
      badge: 'text-gray-600 border-gray-300',
      button: 'bg-gray-500 hover:bg-gray-600'
    }
  };

  const style = styles[type];

  return (
    <div className={`bg-white rounded-lg p-4 border ${style.border}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className={`font-semibold ${style.title}`}>{item.name}</h4>
          <p className="text-sm text-gray-600 mt-1">
            {item.why || item.opportunity || item.prepNow || item.reason}
          </p>
          <Badge variant="outline" className={`mt-2 ${style.badge}`}>
            {item.volume || item.growth || item.when || 'Declining'}
          </Badge>
          
          {/* Product Details */}
          {item.products && item.products.length > 0 && (
            <div className="mt-3 space-y-2">
              <h6 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Featured Products:
              </h6>
              {item.products.map((product: any, idx: number) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between p-2 bg-gray-50 rounded border cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => onProductClick(product.name, niche)}
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800 line-clamp-1">
                      {product.name}
                    </p>
                    {product.asin && (
                      <p className="text-xs text-gray-500">
                        ASIN: {product.asin}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <span className={`text-sm font-semibold ${style.title}`}>
                      {product.price}
                    </span>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className={`text-xs px-2 py-1 h-auto ${style.badge} hover:bg-opacity-20`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onProductClick(product.name, niche);
                      }}
                    >
                      Generate
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {type !== 'declining' && (
          <Button 
            size="sm" 
            onClick={() => onProductClick(item.name, niche)}
            className={style.button}
          >
            Generate →
          </Button>
        )}
      </div>
    </div>
  );
}