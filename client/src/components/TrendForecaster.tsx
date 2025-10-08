import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Flame, TrendingUp, Clock, TrendingDown, Loader2, RefreshCw, Lock, Crown, Rocket, Zap } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useLocation } from 'wouter';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useUsageData } from '@/hooks/useUsageData';
import { TierBadge } from '@/components/TierBadge';

const NICHES = [
  { id: 'beauty', name: 'Beauty', icon: '💄' },
  { id: 'tech', name: 'Tech', icon: '📱' },
  { id: 'fashion', name: 'Fashion', icon: '👗' },
  { id: 'fitness', name: 'Fitness', icon: '💪' },
  { id: 'food', name: 'Food', icon: '🍽️' },
  { id: 'travel', name: 'Travel', icon: '✈️' },
  { id: 'pet', name: 'Pets', icon: '🐾' }
];

// Niche access by tier
const STARTER_NICHES = ['beauty'];  // Starter tier gets 1 niche
const CREATOR_NICHES = ['beauty', 'tech', 'fashion'];  // Creator tier gets 3 niches
// Pro and Agency tiers get all 7 niches

export default function TrendForecaster() {
  const [, setLocation] = useLocation();
  const [selectedNiche, setSelectedNiche] = useState('beauty');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeTargetTier, setUpgradeTargetTier] = useState<string>('creator');
  
  // Fetch usage data to determine tier
  const { data: usageResponse, isLoading: usageLoading } = useUsageData();
  const usage = usageResponse?.data;
  const userTier = usage?.features?.tier || 'starter';
  const forecastingLevel = usage?.features?.trendForecastingLevel || 'none';
  
  // Determine if a niche is locked based on tier
  const isNicheLocked = (nicheId: string) => {
    if (userTier === 'agency' || userTier === 'pro') return false;
    if (userTier === 'creator') return !CREATOR_NICHES.includes(nicheId);
    if (userTier === 'starter') return !STARTER_NICHES.includes(nicheId);
    return true;
  };
  
  // Get the appropriate upgrade tier for locked niches
  const getUpgradeTier = (nicheId: string) => {
    if (userTier === 'starter' && !STARTER_NICHES.includes(nicheId)) {
      return 'creator';
    }
    if (userTier === 'creator' && !CREATOR_NICHES.includes(nicheId)) {
      return 'pro';
    }
    return 'pro';
  };
  
  // Handle niche selection with lock check
  const handleNicheChange = (nicheId: string) => {
    const locked = isNicheLocked(nicheId);
    if (locked) {
      setUpgradeTargetTier(getUpgradeTier(nicheId));
      setShowUpgradeModal(true);
      return;
    }
    setSelectedNiche(nicheId);
  };
  
  // Primary query: Read existing data from database first
  const { data: forecast, isLoading, isFetching, dataUpdatedAt } = useQuery({
    queryKey: ['/api/trend-history', 'forecaster', selectedNiche],
    queryFn: async () => {
      console.log(`💾 TrendForecaster: Reading ${selectedNiche} trends from database...`);
      const response = await fetch(`/api/trend-history/forecaster/${selectedNiche}`);
      if (!response.ok) {
        throw new Error('Failed to fetch trend forecast from database');
      }
      const data = await response.json();
      
      // Console logging for visibility
      console.log(`🎯 TrendForecaster Database: ${selectedNiche.toUpperCase()} Response:`, data);
      
      if (data.data?.trends) {
        const trends = data.data.trends;
        console.log(`🔥 HOT ${selectedNiche} trends from DB (${trends.hot?.length || 0}):`, trends.hot?.map((t: any) => t.name) || []);
        console.log(`📈 RISING ${selectedNiche} trends from DB (${trends.rising?.length || 0}):`, trends.rising?.map((t: any) => t.name) || []);
        console.log(`🕐 UPCOMING ${selectedNiche} trends from DB (${trends.upcoming?.length || 0}):`, trends.upcoming?.map((t: any) => t.name) || []);
        console.log(`📉 DECLINING ${selectedNiche} trends from DB (${trends.declining?.length || 0}):`, trends.declining?.map((t: any) => t.name) || []);
        
        // Log total trends found
        const totalTrends = (trends.hot?.length || 0) + (trends.rising?.length || 0) + (trends.upcoming?.length || 0) + (trends.declining?.length || 0);
        console.log(`📊 Total trends for ${selectedNiche}: ${totalTrends}`);
        
        if (totalTrends === 0) {
          console.warn(`⚠️ No trends found for ${selectedNiche}! Data structure:`, trends);
        }
      } else {
        console.warn(`⚠️ No trends data in response for ${selectedNiche}:`, data);
      }
      
      return data;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes to avoid excessive database calls
    gcTime: 1000 * 60 * 60 * 24, // Keep cache for 24 hours
    refetchOnMount: true, // Allow fetching on mount to get latest database data
    refetchOnWindowFocus: false, // Don't fetch when window gains focus
    refetchOnReconnect: false, // Don't fetch when reconnecting
    refetchInterval: false, // Disable interval refetching
  });

  const handleProductClick = (productName: string, niche: string) => {
    setLocation(`/generate?product=${encodeURIComponent(productName)}&niche=${niche}`);
  };

  // Use database timestamp from the response if available, otherwise fall back to React Query timestamp
  const databaseTimestamp = forecast?.data?.lastUpdated;
  const lastUpdated = databaseTimestamp ? new Date(databaseTimestamp) : (dataUpdatedAt ? new Date(dataUpdatedAt) : null);
  const timeSinceUpdate = lastUpdated ? getTimeSince(lastUpdated) : 'Never';

  return (
    <>
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                🔮 Trend Forecaster
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Real-time viral trends powered by Perplexity AI
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Last updated</p>
              <p className="text-xs font-semibold text-gray-700">{timeSinceUpdate}</p>
              <p className="text-xs text-purple-600 mt-1">
                Auto-refreshes daily at 5 AM ET
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedNiche} onValueChange={handleNicheChange} className="w-full">
            <TabsList className="grid w-full grid-cols-7 mb-4">
              {NICHES.map((niche) => {
                const locked = isNicheLocked(niche.id);
                return (
                  <TabsTrigger 
                    key={niche.id} 
                    value={niche.id} 
                    className={`text-xs relative ${locked ? 'opacity-60 cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                    data-testid={`tab-${niche.id}`}
                  >
                    <span className="hidden sm:inline flex items-center gap-1">
                      {niche.icon} {niche.name}
                      {locked && <Lock className="h-3 w-3 ml-1" data-testid={`lock-icon-${niche.id}`} />}
                    </span>
                    <span className="sm:hidden flex items-center gap-1">
                      {niche.icon}
                      {locked && <Lock className="h-3 w-3" data-testid={`lock-icon-mobile-${niche.id}`} />}
                    </span>
                    {locked && (
                      <Badge 
                        className="absolute -top-1 -right-1 h-4 px-1 text-[9px] bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0"
                        data-testid={`pro-badge-${niche.id}`}
                      >
                        Pro
                      </Badge>
                    )}
                  </TabsTrigger>
                );
              })}
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
                    userTier={userTier}
                  />
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Tier-Specific Upgrade Modal */}
      <AlertDialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <AlertDialogContent data-testid="upgrade-modal">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-xl">
              {upgradeTargetTier === 'creator' && <Crown className="h-5 w-5 text-purple-600" />}
              {upgradeTargetTier === 'pro' && <Rocket className="h-5 w-5 text-blue-600" />}
              {upgradeTargetTier === 'agency' && <Zap className="h-5 w-5 text-yellow-600" />}
              Unlock More Niches with {upgradeTargetTier.charAt(0).toUpperCase() + upgradeTargetTier.slice(1)}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base pt-2">
              {userTier === 'starter' && (
                <>
                  <p className="mb-2">Starter users get 1 niche (Beauty). Upgrade to:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li><strong>Creator ($15/mo):</strong> Get 3 niches + basic forecasting</li>
                    <li><strong>Pro ($35/mo):</strong> Get all 7 niches + full forecasting</li>
                    <li><strong>Agency ($69/mo):</strong> Everything + enterprise features</li>
                  </ul>
                </>
              )}
              {userTier === 'creator' && (
                <>
                  <p className="mb-2">Creator users get 3 niches (Beauty, Tech, Fashion). Upgrade to:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li><strong>Pro ($35/mo):</strong> Get all 7 niches + advanced forecasting</li>
                    <li><strong>Agency ($69/mo):</strong> Everything + enterprise features</li>
                  </ul>
                </>
              )}
              {userTier === 'pro' && (
                <p>Pro users get all 7 niches. Upgrade to Agency ($69/mo) for enterprise features including competitive analysis and unlimited trend analyses!</p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-maybe-later">Maybe Later</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowUpgradeModal(false);
                setLocation('/account');
              }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              data-testid="button-upgrade"
            >
              {upgradeTargetTier === 'creator' && <Crown className="h-4 w-4 mr-2" />}
              {upgradeTargetTier === 'pro' && <Rocket className="h-4 w-4 mr-2" />}
              {upgradeTargetTier === 'agency' && <Zap className="h-4 w-4 mr-2" />}
              Upgrade to {upgradeTargetTier.charAt(0).toUpperCase() + upgradeTargetTier.slice(1)}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
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
  onProductClick,
  userTier 
}: { 
  forecast: any; 
  niche: string;
  onProductClick: (product: string, niche: string) => void;
  userTier: 'free' | 'pro';
}) {
  if (!forecast) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No trends available</p>
        <p className="text-xs mt-2">Click "Refresh" to fetch trends</p>
      </div>
    );
  }

  // Find the first tab with data, fallback to "hot"
  const findFirstTabWithData = () => {
    const trends = forecast.trends || {};
    if (trends.hot?.length > 0) return "hot";
    if (trends.rising?.length > 0) return "rising";
    if (trends.upcoming?.length > 0) return "upcoming";
    if (trends.declining?.length > 0) return "declining";
    return "hot";
  };

  const getTrendCount = (category: string) => {
    return forecast.trends?.[category]?.length || 0;
  };

  // Check if this niche should have limited trends for free users
  const shouldLimitTrends = () => {
    return userTier === 'free' && FREE_NICHES.includes(niche);
  };

  // Get limited trends array for free users (only first item)
  const getLimitedTrends = (trends: any[] | undefined) => {
    if (!trends) return [];
    if (!shouldLimitTrends()) return trends;
    return trends.slice(0, 1);
  };

  // Check if there are more trends available for pro users
  const hasMoreTrends = (trends: any[] | undefined) => {
    if (!trends) return false;
    return shouldLimitTrends() && trends.length > 1;
  };

  // Data source information display
  const getDataSourceInfo = () => {
    const dataSource = forecast.trends?.dataSource;
    if (!dataSource) return null;
    
    const getSourceIcon = () => {
      switch (dataSource.type) {
        case 'api': return '🟢';
        case 'mixed': return '🟡';
        case 'fallback': return '🔴';
        default: return '⚪';
      }
    };

    const getSourceColor = () => {
      switch (dataSource.type) {
        case 'api': return 'bg-green-50 border-green-200 text-green-800';
        case 'mixed': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
        case 'fallback': return 'bg-red-50 border-red-200 text-red-800';
        default: return 'bg-gray-50 border-gray-200 text-gray-800';
      }
    };

    const getSourceLabel = () => {
      switch (dataSource.type) {
        case 'api': return 'Live API Data';
        case 'mixed': return 'Mixed Data (API + Fallback)';
        case 'fallback': return 'Fallback Data';
        default: return 'Unknown Source';
      }
    };

    return (
      <div className={`mb-4 p-2 rounded-lg border text-xs ${getSourceColor()}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>{getSourceIcon()}</span>
            <span className="font-medium">{getSourceLabel()}</span>
            <span className="px-1 py-0.5 rounded bg-black bg-opacity-10">
              {dataSource.reliability.toUpperCase()}
            </span>
          </div>
          <div className="text-right">
            <div>{getTimeSince(new Date(dataSource.lastUpdated))}</div>
            {dataSource.type === 'mixed' && dataSource.fallbackCategoriesUsed.length > 0 && (
              <div className="text-xs opacity-75">
                Fallback: {dataSource.fallbackCategoriesUsed.join(', ')}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Tabs defaultValue={findFirstTabWithData()} className="w-full">
      {getDataSourceInfo()}
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="hot">
          <Flame className="h-4 w-4 mr-1" /> Hot {getTrendCount('hot') > 0 && <span className="ml-1 text-xs bg-red-100 text-red-600 px-1 rounded">({getTrendCount('hot')})</span>}
        </TabsTrigger>
        <TabsTrigger value="rising">
          <TrendingUp className="h-4 w-4 mr-1" /> Rising {getTrendCount('rising') > 0 && <span className="ml-1 text-xs bg-green-100 text-green-600 px-1 rounded">({getTrendCount('rising')})</span>}
        </TabsTrigger>
        <TabsTrigger value="upcoming">
          <Clock className="h-4 w-4 mr-1" /> Upcoming {getTrendCount('upcoming') > 0 && <span className="ml-1 text-xs bg-blue-100 text-blue-600 px-1 rounded">({getTrendCount('upcoming')})</span>}
        </TabsTrigger>
        <TabsTrigger value="declining">
          <TrendingDown className="h-4 w-4 mr-1" /> Avoid {getTrendCount('declining') > 0 && <span className="ml-1 text-xs bg-gray-100 text-gray-600 px-1 rounded">({getTrendCount('declining')})</span>}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="hot" className="space-y-3 mt-4">
        {forecast.trends?.hot?.length > 0 ? (
          <>
            {getLimitedTrends(forecast.trends.hot).map((item: any, i: number) => (
              <TrendCard key={i} item={item} type="hot" niche={niche} onProductClick={onProductClick} />
            ))}
            {hasMoreTrends(forecast.trends.hot) && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-6 text-center">
                <Crown className="h-10 w-10 mx-auto mb-3 text-purple-600" />
                <h4 className="font-semibold text-gray-900 mb-2">
                  {forecast.trends.hot.length - 1} More Hot Trends Available
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Upgrade to Pro to unlock all trending insights for {niche}
                </p>
                <Button
                  onClick={() => window.location.href = '/account'}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  data-testid="upgrade-hot-trends"
                >
                  Upgrade to Pro
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Flame className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="font-medium">No hot trends right now</p>
            <p className="text-xs mt-1">Check other tabs for available trends</p>
          </div>
        )}
      </TabsContent>

      <TabsContent value="rising" className="space-y-3 mt-4">
        {forecast.trends?.rising?.length > 0 ? (
          <>
            {getLimitedTrends(forecast.trends.rising).map((item: any, i: number) => (
              <TrendCard key={i} item={item} type="rising" niche={niche} onProductClick={onProductClick} />
            ))}
            {hasMoreTrends(forecast.trends.rising) && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-6 text-center">
                <Crown className="h-10 w-10 mx-auto mb-3 text-purple-600" />
                <h4 className="font-semibold text-gray-900 mb-2">
                  {forecast.trends.rising.length - 1} More Rising Trends Available
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Upgrade to Pro to unlock all trending insights for {niche}
                </p>
                <Button
                  onClick={() => window.location.href = '/account'}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  data-testid="upgrade-rising-trends"
                >
                  Upgrade to Pro
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="font-medium">No rising trends detected</p>
            <p className="text-xs mt-1">Check other tabs for available trends</p>
          </div>
        )}
      </TabsContent>

      <TabsContent value="upcoming" className="space-y-3 mt-4">
        {forecast.trends?.upcoming?.length > 0 ? (
          <>
            {getLimitedTrends(forecast.trends.upcoming).map((item: any, i: number) => (
              <TrendCard key={i} item={item} type="upcoming" niche={niche} onProductClick={onProductClick} />
            ))}
            {hasMoreTrends(forecast.trends.upcoming) && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-6 text-center">
                <Crown className="h-10 w-10 mx-auto mb-3 text-purple-600" />
                <h4 className="font-semibold text-gray-900 mb-2">
                  {forecast.trends.upcoming.length - 1} More Upcoming Trends Available
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Upgrade to Pro to unlock all trending insights for {niche}
                </p>
                <Button
                  onClick={() => window.location.href = '/account'}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  data-testid="upgrade-upcoming-trends"
                >
                  Upgrade to Pro
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="font-medium">No upcoming trends found</p>
            <p className="text-xs mt-1">Check other tabs for available trends</p>
          </div>
        )}
      </TabsContent>

      <TabsContent value="declining" className="space-y-3 mt-4">
        {forecast.trends?.declining?.length > 0 ? (
          <>
            {getLimitedTrends(forecast.trends.declining).map((item: any, i: number) => (
              <TrendCard key={i} item={item} type="declining" niche={niche} onProductClick={onProductClick} />
            ))}
            {hasMoreTrends(forecast.trends.declining) && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-6 text-center">
                <Crown className="h-10 w-10 mx-auto mb-3 text-purple-600" />
                <h4 className="font-semibold text-gray-900 mb-2">
                  {forecast.trends.declining.length - 1} More Trends to Avoid
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Upgrade to Pro to unlock all trending insights for {niche}
                </p>
                <Button
                  onClick={() => window.location.href = '/account'}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  data-testid="upgrade-declining-trends"
                >
                  Upgrade to Pro
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <TrendingDown className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="font-medium">No declining trends to avoid</p>
            <p className="text-xs mt-1">Check other tabs for available trends</p>
          </div>
        )}
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
