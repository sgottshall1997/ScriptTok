import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Zap, Clock, ArrowRight } from 'lucide-react';
import { Niche } from '@shared/constants';
import { Link } from 'wouter';

interface TrendData {
  name: string;
  volume?: string;
  growth?: string;
  why?: string;
  reason?: string;
  when?: string;
  prepNow?: string;
  opportunity?: string;
}

interface TrendForecast {
  hot: TrendData[];
  rising: TrendData[];
  upcoming: TrendData[];
  declining: TrendData[];
}

interface TrendForecasterProps {
  niche: Niche;
}

export function TrendForecaster({ niche }: TrendForecasterProps) {
  const [selectedTab, setSelectedTab] = useState('hot');

  const { data: forecastData, isLoading, error } = useQuery({
    queryKey: ['trend-forecast', niche],
    queryFn: async () => {
      const response = await fetch(`/api/trend-forecast/${niche}`);
      if (!response.ok) {
        throw new Error('Failed to fetch trend forecast');
      }
      const result = await response.json();
      return result.data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 2
  });

  const trends: TrendForecast = forecastData?.trends || {
    hot: [],
    rising: [],
    upcoming: [],
    declining: []
  };

  const tabConfig = {
    hot: {
      icon: Zap,
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-950',
      borderColor: 'border-red-200 dark:border-red-800',
      title: 'Hot Now',
      description: 'Trending viral products right now'
    },
    rising: {
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950',
      borderColor: 'border-green-200 dark:border-green-800',
      title: 'Rising',
      description: 'Growing trends to jump on'
    },
    upcoming: {
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
      borderColor: 'border-blue-200 dark:border-blue-800',
      title: 'Upcoming',
      description: 'Future trends to prepare for'
    },
    declining: {
      icon: TrendingDown,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50 dark:bg-gray-950',
      borderColor: 'border-gray-200 dark:border-gray-800',
      title: 'Declining',
      description: 'Trends losing momentum'
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-600" />
            Trend Forecaster
          </CardTitle>
          <CardDescription>AI-powered trend analysis for {niche}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <span className="ml-3">🔍 Analyzing TikTok trends...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-600" />
            Trend Forecaster
          </CardTitle>
          <CardDescription>AI-powered trend analysis for {niche}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Unable to load trend data right now</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderTrendCard = (trend: TrendData, type: keyof TrendForecast) => {
    const config = tabConfig[type];
    
    return (
      <div
        key={trend.name}
        className={`p-4 rounded-lg border-2 ${config.bgColor} ${config.borderColor} hover:shadow-md transition-shadow`}
      >
        <div className="flex justify-between items-start mb-3">
          <h4 className="font-semibold text-lg">{trend.name}</h4>
          <config.icon className={`h-5 w-5 ${config.color}`} />
        </div>
        
        <div className="space-y-2 mb-4">
          {trend.volume && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                📈 {trend.volume}
              </Badge>
            </div>
          )}
          
          {trend.growth && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs bg-green-100 text-green-700">
                🚀 {trend.growth}
              </Badge>
            </div>
          )}
          
          {trend.when && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700">
                ⏰ {trend.when}
              </Badge>
            </div>
          )}
        </div>
        
        <div className="text-sm text-gray-700 dark:text-gray-300 mb-4">
          {trend.why && <p><strong>Why:</strong> {trend.why}</p>}
          {trend.opportunity && <p><strong>Opportunity:</strong> {trend.opportunity}</p>}
          {trend.prepNow && <p><strong>Prep now:</strong> {trend.prepNow}</p>}
          {trend.reason && <p><strong>Decline reason:</strong> {trend.reason}</p>}
        </div>
        
        {type !== 'declining' && (
          <Link href={`/generate?product=${encodeURIComponent(trend.name)}&niche=${niche}`}>
            <Button 
              size="sm" 
              className="w-full"
              data-testid={`button-generate-${trend.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              Generate Content <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        )}
      </div>
    );
  };

  return (
    <Card data-testid="trend-forecaster-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-purple-600" />
          Trend Forecaster
        </CardTitle>
        <CardDescription>
          AI-powered trend analysis for {niche} • Updated {forecastData?.timestamp ? new Date(forecastData.timestamp).toLocaleTimeString() : 'recently'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            {Object.entries(tabConfig).map(([key, config]) => (
              <TabsTrigger 
                key={key} 
                value={key} 
                className="flex items-center gap-1"
                data-testid={`tab-${key}`}
              >
                <config.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{config.title}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          
          {Object.entries(trends).map(([type, trendList]) => (
            <TabsContent key={type} value={type} className="mt-4">
              <div className="space-y-1 mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  {React.createElement(tabConfig[type as keyof typeof tabConfig].icon, {
                    className: `h-5 w-5 ${tabConfig[type as keyof typeof tabConfig].color}`
                  })}
                  {tabConfig[type as keyof typeof tabConfig].title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {tabConfig[type as keyof typeof tabConfig].description}
                </p>
              </div>
              
              {trendList.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  {trendList.map((trend) => renderTrendCard(trend, type as keyof TrendForecast))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No {type} trends available for {niche} right now</p>
                  <p className="text-sm mt-1">Check back later for updates</p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}