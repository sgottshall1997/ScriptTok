import React, { useState, FC } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, TrendingUp, DollarSign, Clock, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Area, AreaChart
} from 'recharts';

// Type definitions
interface AnalyticsData {
  templateUsage: Array<{templateType: string, count: number}>;
  toneUsage: Array<{tone: string, count: number}>;
  generationTrends: Array<{date: string, count: number}>;
  popularProducts: Array<{product: string, count: number}>;
  nicheUsage: Array<{niche: string, count: number}>;
}

interface AIProviderMetrics {
  provider: string;
  totalRequests: number;
  totalTokens: number;
  avgTokens: number;
  avgResponseTime: number;
  successRate: number;
  errorCount: number;
  uniqueModels: number;
  lastUsed: string;
}

interface AIOverviewData {
  providerMetrics: AIProviderMetrics[];
  costData: Array<{
    provider: string;
    model: string;
    estimatedCost: number;
    tokenCount: number;
    requestCount: number;
  }>;
  providerCostSummary: Record<string, {
    totalCost: number;
    totalTokens: number;
    totalRequests: number;
  }>;
}

interface AIHealthStatus {
  provider: string;
  status: 'healthy' | 'warning' | 'critical';
  successRate: number;
  avgResponseTime: number;
  totalRequests: number;
  errorCount: number;
  lastRequest: string;
  lastError: string;
}

interface AIModelBreakdown {
  model: string;
  count: number;
  totalTokens: number;
  avgTokens: number;
  avgResponseTime: number;
  successRate: number;
  errorCount: number;
  lastUsed: string;
}

interface AIAnalyticsData {
  modelBreakdown: AIModelBreakdown[];
  dailyTrends: Array<{
    date: string;
    requests: number;
    tokens: number;
    avgResponseTime: number;
    errors: number;
  }>;
  nicheUsage?: Array<{
    niche: string;
    count: number;
    avgTokens: number;
    avgResponseTime: number;
    successRate: number;
  }>;
  totalCost: number;
}

// Helper functions
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 4
  }).format(amount);
};

const formatTime = (ms: number): string => {
  if (ms < 1000) return `${ms.toFixed(0)}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'healthy': return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    case 'critical': return <AlertCircle className="h-4 w-4 text-red-600" />;
    default: return <Activity className="h-4 w-4 text-gray-600" />;
  }
};

// Color palette for charts
const COLORS = ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c', '#d0ed57', '#ffc658', '#ff8042', '#ff6b6b', '#c38cff'];

const AI_COLORS = {
  Claude: '#FF6B35',
  OpenAI: '#10B981',
  Perplexity: '#3B82F6',
  Other: '#6B7280'
};

const AnalyticsDashboard: FC = () => {
  const [activeTab, setActiveTab] = useState('ai-models');
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedNiche, setSelectedNiche] = useState<string | null>(null);
  const [selectedContentType, setSelectedContentType] = useState<string | null>(null);
  
  // Fetch AI analytics overview
  const { data: aiOverview, isLoading: isAiOverviewLoading } = useQuery<AIOverviewData>({
    queryKey: ['/api/ai-analytics/overview', timeRange, selectedNiche, selectedContentType],
    retry: 1,
  });

  // Fetch AI health status
  const { data: aiHealth, isLoading: isAiHealthLoading } = useQuery<AIHealthStatus[]>({
    queryKey: ['/api/ai-analytics/health', timeRange],
    retry: 1,
  });

  // Fetch Claude analytics
  const { data: claudeAnalytics, isLoading: isClaudeLoading } = useQuery<{data: AIAnalyticsData}>({
    queryKey: ['/api/ai-analytics/claude', timeRange, selectedNiche, selectedContentType],
    retry: 1,
  });

  // Fetch OpenAI analytics
  const { data: openAiAnalytics, isLoading: isOpenAiLoading } = useQuery<{data: AIAnalyticsData}>({
    queryKey: ['/api/ai-analytics/openai', timeRange, selectedNiche, selectedContentType],
    retry: 1,
  });

  // Fetch Perplexity analytics
  const { data: perplexityAnalytics, isLoading: isPerplexityLoading } = useQuery<{data: AIAnalyticsData}>({
    queryKey: ['/api/ai-analytics/perplexity', timeRange, selectedNiche, selectedContentType],
    retry: 1,
  });

  // Export function
  const exportData = (format: 'csv' | 'json', provider?: string) => {
    const exportUrl = provider 
      ? `/api/ai-analytics/export?format=${format}&provider=${provider}&timeRange=${timeRange}${selectedNiche ? `&niche=${selectedNiche}` : ''}${selectedContentType ? `&contentType=${selectedContentType}` : ''}`
      : `/api/ai-analytics/export?format=${format}&timeRange=${timeRange}${selectedNiche ? `&niche=${selectedNiche}` : ''}${selectedContentType ? `&contentType=${selectedContentType}` : ''}`;
    
    window.open(exportUrl, '_blank');
  };

  // Loading state
  if (isAiOverviewLoading || isAiHealthLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-2/3 mb-4" />
                <Skeleton className="h-8 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <div className="flex flex-wrap gap-4 items-center">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24 Hours</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="90d">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedNiche || 'all'} onValueChange={(value) => setSelectedNiche(value === 'all' ? null : value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Niches" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Niches</SelectItem>
            <SelectItem value="beauty">Beauty</SelectItem>
            <SelectItem value="tech">Tech</SelectItem>
            <SelectItem value="fitness">Fitness</SelectItem>
            <SelectItem value="food">Food</SelectItem>
            <SelectItem value="travel">Travel</SelectItem>
            <SelectItem value="fashion">Fashion</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedContentType || 'all'} onValueChange={(value) => setSelectedContentType(value === 'all' ? null : value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Content Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Content Types</SelectItem>
            <SelectItem value="social_media">Social Media</SelectItem>
            <SelectItem value="video_script">Video Script</SelectItem>
            <SelectItem value="product_review">Product Review</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ai-models">AI Models</TabsTrigger>
          <TabsTrigger value="claude">Claude Analytics</TabsTrigger>
          <TabsTrigger value="openai">OpenAI Analytics</TabsTrigger>
          <TabsTrigger value="perplexity">Perplexity Analytics</TabsTrigger>
        </TabsList>

        {/* AI Models Overview Tab */}
        <TabsContent value="ai-models" className="space-y-6">
          {/* AI Health Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {aiHealth?.map((provider) => (
              <Card key={provider.provider}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">{provider.provider}</h3>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(provider.status)}
                      <Badge variant={provider.status === 'healthy' ? 'default' : provider.status === 'warning' ? 'secondary' : 'destructive'}>
                        {provider.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Success Rate</span>
                      <span className="text-sm font-medium">{provider.successRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Avg Response Time</span>
                      <span className="text-sm font-medium">{formatTime(provider.avgResponseTime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Requests</span>
                      <span className="text-sm font-medium">{formatNumber(provider.totalRequests)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )) || []}
          </div>

          {/* Provider Metrics Overview */}
          {aiOverview?.providerMetrics && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Provider Performance Comparison
                </CardTitle>
                <div className="flex gap-2">
                  <Button onClick={() => exportData('csv')} size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button onClick={() => exportData('json')} size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export JSON
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={aiOverview.providerMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="provider" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="totalRequests" fill="#8884d8" name="Total Requests" />
                    <Bar dataKey="avgResponseTime" fill="#82ca9d" name="Avg Response Time (ms)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Claude Analytics Tab */}
        <TabsContent value="claude" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Requests</p>
                    <p className="text-2xl font-bold">{formatNumber(claudeAnalytics?.data?.modelBreakdown?.reduce((acc, model) => acc + model.count, 0) || 0)}</p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Tokens</p>
                    <p className="text-2xl font-bold">{formatNumber(claudeAnalytics?.data?.modelBreakdown?.reduce((acc, model) => acc + model.totalTokens, 0) || 0)}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Estimated Cost</p>
                    <p className="text-2xl font-bold">{formatCurrency(claudeAnalytics?.data?.totalCost || 0)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Response Time</p>
                    <p className="text-2xl font-bold">{formatTime(claudeAnalytics?.data?.modelBreakdown?.reduce((acc, model, _, arr) => acc + model.avgResponseTime / arr.length, 0) || 0)}</p>
                  </div>
                  <Clock className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => exportData('csv', 'claude')} size="sm" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Claude Data (CSV)
            </Button>
            <Button onClick={() => exportData('json', 'claude')} size="sm" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Claude Data (JSON)
            </Button>
          </div>

          {/* Claude Model Breakdown */}
          {claudeAnalytics?.data?.modelBreakdown && (
            <Card>
              <CardHeader>
                <CardTitle>Claude Model Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 p-2 text-left">Model</th>
                        <th className="border border-gray-300 p-2 text-left">Requests</th>
                        <th className="border border-gray-300 p-2 text-left">Tokens</th>
                        <th className="border border-gray-300 p-2 text-left">Avg Tokens</th>
                        <th className="border border-gray-300 p-2 text-left">Response Time</th>
                        <th className="border border-gray-300 p-2 text-left">Success Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {claudeAnalytics.data.modelBreakdown.map((model) => (
                        <tr key={model.model}>
                          <td className="border border-gray-300 p-2">{model.model}</td>
                          <td className="border border-gray-300 p-2">{formatNumber(model.count)}</td>
                          <td className="border border-gray-300 p-2">{formatNumber(model.totalTokens)}</td>
                          <td className="border border-gray-300 p-2">{formatNumber(model.avgTokens)}</td>
                          <td className="border border-gray-300 p-2">{formatTime(model.avgResponseTime)}</td>
                          <td className="border border-gray-300 p-2">{model.successRate.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* OpenAI Analytics Tab */}
        <TabsContent value="openai" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Requests</p>
                    <p className="text-2xl font-bold">{formatNumber(openAiAnalytics?.data?.modelBreakdown?.reduce((acc, model) => acc + model.count, 0) || 0)}</p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Tokens</p>
                    <p className="text-2xl font-bold">{formatNumber(openAiAnalytics?.data?.modelBreakdown?.reduce((acc, model) => acc + model.totalTokens, 0) || 0)}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Estimated Cost</p>
                    <p className="text-2xl font-bold">{formatCurrency(openAiAnalytics?.data?.totalCost || 0)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Response Time</p>
                    <p className="text-2xl font-bold">{formatTime(openAiAnalytics?.data?.modelBreakdown?.reduce((acc, model, _, arr) => acc + model.avgResponseTime / arr.length, 0) || 0)}</p>
                  </div>
                  <Clock className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => exportData('csv', 'openai')} size="sm" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export OpenAI Data (CSV)
            </Button>
            <Button onClick={() => exportData('json', 'openai')} size="sm" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export OpenAI Data (JSON)
            </Button>
          </div>

          {/* OpenAI Model Breakdown */}
          {openAiAnalytics?.data?.modelBreakdown && (
            <Card>
              <CardHeader>
                <CardTitle>OpenAI Model Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 p-2 text-left">Model</th>
                        <th className="border border-gray-300 p-2 text-left">Requests</th>
                        <th className="border border-gray-300 p-2 text-left">Tokens</th>
                        <th className="border border-gray-300 p-2 text-left">Avg Tokens</th>
                        <th className="border border-gray-300 p-2 text-left">Response Time</th>
                        <th className="border border-gray-300 p-2 text-left">Success Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {openAiAnalytics.data.modelBreakdown.map((model) => (
                        <tr key={model.model}>
                          <td className="border border-gray-300 p-2">{model.model}</td>
                          <td className="border border-gray-300 p-2">{formatNumber(model.count)}</td>
                          <td className="border border-gray-300 p-2">{formatNumber(model.totalTokens)}</td>
                          <td className="border border-gray-300 p-2">{formatNumber(model.avgTokens)}</td>
                          <td className="border border-gray-300 p-2">{formatTime(model.avgResponseTime)}</td>
                          <td className="border border-gray-300 p-2">{model.successRate.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Perplexity Analytics Tab */}
        <TabsContent value="perplexity" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Requests</p>
                    <p className="text-2xl font-bold">{formatNumber(perplexityAnalytics?.data?.modelBreakdown?.reduce((acc, model) => acc + model.count, 0) || 0)}</p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Tokens</p>
                    <p className="text-2xl font-bold">{formatNumber(perplexityAnalytics?.data?.modelBreakdown?.reduce((acc, model) => acc + model.totalTokens, 0) || 0)}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Estimated Cost</p>
                    <p className="text-2xl font-bold">{formatCurrency(perplexityAnalytics?.data?.totalCost || 0)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Response Time</p>
                    <p className="text-2xl font-bold">{formatTime(perplexityAnalytics?.data?.modelBreakdown?.reduce((acc, model, _, arr) => acc + model.avgResponseTime / arr.length, 0) || 0)}</p>
                  </div>
                  <Clock className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => exportData('csv', 'perplexity')} size="sm" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Perplexity Data (CSV)
            </Button>
            <Button onClick={() => exportData('json', 'perplexity')} size="sm" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Perplexity Data (JSON)
            </Button>
          </div>

          {/* Perplexity Model Breakdown */}
          {perplexityAnalytics?.data?.modelBreakdown && (
            <Card>
              <CardHeader>
                <CardTitle>Perplexity Model Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 p-2 text-left">Model</th>
                        <th className="border border-gray-300 p-2 text-left">Requests</th>
                        <th className="border border-gray-300 p-2 text-left">Tokens</th>
                        <th className="border border-gray-300 p-2 text-left">Avg Tokens</th>
                        <th className="border border-gray-300 p-2 text-left">Response Time</th>
                        <th className="border border-gray-300 p-2 text-left">Success Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {perplexityAnalytics.data.modelBreakdown.map((model) => (
                        <tr key={model.model}>
                          <td className="border border-gray-300 p-2">{model.model}</td>
                          <td className="border border-gray-300 p-2">{formatNumber(model.count)}</td>
                          <td className="border border-gray-300 p-2">{formatNumber(model.totalTokens)}</td>
                          <td className="border border-gray-300 p-2">{formatNumber(model.avgTokens)}</td>
                          <td className="border border-gray-300 p-2">{formatTime(model.avgResponseTime)}</td>
                          <td className="border border-gray-300 p-2">{model.successRate.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;