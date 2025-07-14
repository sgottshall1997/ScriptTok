import { FC, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  DollarSign,
  Clock,
  AlertCircle,
  CheckCircle,
  Brain,
  Zap,
  Eye
} from 'lucide-react';
import CustomTemplateEditor from './CustomTemplateEditor';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ComposedChart,
  Area,
  AreaChart,
  RadialBarChart,
  RadialBar,
  Legend
} from 'recharts';

// Available niches for the dropdown
import { NICHES } from '@shared/constants';

// AI Provider Colors
const AI_COLORS = {
  'claude': '#FF6B35',
  'openai': '#10B981',
  'perplexity': '#3B82F6',
  'Claude': '#FF6B35',
  'OpenAI': '#10B981',
  'Perplexity': '#3B82F6'
};

// Helper Functions
const formatNumber = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
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
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'healthy': return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    case 'critical': return <AlertCircle className="h-4 w-4 text-red-500" />;
    default: return <Activity className="h-4 w-4 text-gray-600" />;
  }
};

// Define analytics data shape
interface AnalyticsData {
  templateUsage: Array<{templateType: string, count: number}>;
  toneUsage: Array<{tone: string, count: number}>;
  generationTrends: Array<{date: string, count: number}>;
  popularProducts: Array<{product: string, count: number}>;
  nicheUsage: Array<{niche: string, count: number}>;
}

interface NicheAnalyticsData {
  niche: string;
  templateUsage: Array<{templateType: string, count: number}>;
  toneUsage: Array<{tone: string, count: number}>;
  generationTrends: Array<{date: string, count: number}>;
  popularProducts: Array<{product: string, count: number}>;
}

interface CustomTemplate {
  id: number;
  name: string;
  content: string;
  niche: string;
}

// AI Analytics interfaces
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

interface AIProviderAnalytics {
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
  contentTypeUsage?: Array<{
    contentType: string;
    count: number;
    avgTokens: number;
    avgResponseTime: number;
    successRate: number;
  }>;
  templateUsage?: Array<{
    templateType: string;
    count: number;
    avgTokens: number;
    avgResponseTime: number;
    successRate: number;
  }>;
  totalCost: number;
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

// Color palette for charts
const COLORS = ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c', '#d0ed57', '#ffc658', '#ff8042', '#ff6b6b', '#c38cff'];

// AI provider specific colors
const AI_COLORS = {
  Claude: '#FF6B35',
  OpenAI: '#10B981',
  Perplexity: '#3B82F6',
  Other: '#6B7280'
};

// Helper function to format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 4,
    maximumFractionDigits: 4
  }).format(amount);
};

// Helper function to format large numbers
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

// Helper function to format time
const formatTime = (ms: number): string => {
  if (ms < 1000) return `${ms.toFixed(0)}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
};

// Helper function to get status color
const getStatusColor = (status: string): string => {
  switch (status) {
    case 'healthy': return 'text-green-600';
    case 'warning': return 'text-yellow-600';
    case 'critical': return 'text-red-600';
    default: return 'text-gray-600';
  }
};

// Helper function to get status icon
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'healthy': return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    case 'critical': return <AlertCircle className="h-4 w-4 text-red-600" />;
    default: return <Activity className="h-4 w-4 text-gray-600" />;
  }
};

const AnalyticsDashboard: FC = () => {
  const [activeTab, setActiveTab] = useState('templates');
  const [selectedNiche, setSelectedNiche] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedContentType, setSelectedContentType] = useState<string | null>(null);
  
  // Fetch overall analytics data
  const { data: analyticsData, isLoading } = useQuery<AnalyticsData>({
    queryKey: ['/api/analytics'],
    retry: 1,
  });
  
  // Fetch niche-specific analytics when a niche is selected
  const { 
    data: nicheAnalyticsData, 
    isLoading: isNicheLoading 
  } = useQuery<NicheAnalyticsData>({
    queryKey: ['/api/analytics/niche', selectedNiche],
    enabled: !!selectedNiche,
    retry: 1,
  });
  
  // Fetch custom templates
  const { 
    data: customTemplates 
  } = useQuery<CustomTemplate[]>({
    queryKey: ['/api/analytics/templates/custom'],
    retry: 1,
  });

  // Fetch AI analytics overview
  const { data: aiOverview, isLoading: isAiOverviewLoading } = useQuery<AIOverviewData>({
    queryKey: ['/api/ai-analytics/overview', timeRange, selectedNiche, selectedContentType],
    retry: 1,
  });

  // Fetch Claude analytics
  const { data: claudeAnalytics, isLoading: isClaudeLoading } = useQuery<AIProviderAnalytics>({
    queryKey: ['/api/ai-analytics/claude', timeRange, selectedNiche, selectedContentType],
    retry: 1,
  });

  // Fetch OpenAI analytics
  const { data: openAIAnalytics, isLoading: isOpenAILoading } = useQuery<AIProviderAnalytics>({
    queryKey: ['/api/ai-analytics/openai', timeRange, selectedNiche, selectedContentType],
    retry: 1,
  });

  // Fetch Perplexity analytics
  const { data: perplexityAnalytics, isLoading: isPerplexityLoading } = useQuery<AIProviderAnalytics>({
    queryKey: ['/api/ai-analytics/perplexity', timeRange, selectedNiche, selectedContentType],
    retry: 1,
  });

  // Fetch AI comparison data
  const { data: aiComparison, isLoading: isComparisonLoading } = useQuery({
    queryKey: ['/api/ai-analytics/comparison', timeRange, selectedNiche, selectedContentType],
    retry: 1,
  });

  // Fetch AI health status
  const { data: aiHealth, isLoading: isHealthLoading } = useQuery<{ data: { healthStatus: AIHealthStatus[] } }>({
    queryKey: ['/api/ai-analytics/health', '24h'],
    retry: 1,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Export functionality
  const handleExport = async (format: 'csv' | 'json', provider?: string) => {
    try {
      const params = new URLSearchParams({
        format,
        timeRange,
        ...(provider && { provider }),
        ...(selectedNiche && { niche: selectedNiche }),
        ...(selectedContentType && { contentType: selectedContentType })
      });
      
      const response = await fetch(`/api/ai-analytics/export?${params}`);
      
      if (format === 'csv') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-analytics-${timeRange}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-analytics-${timeRange}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Analytics Dashboard</CardTitle>
          <CardDescription>Loading analytics data...</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="animate-pulse flex flex-col space-y-2 w-full">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-[250px] bg-gray-100 rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Error/empty state
  if (!analyticsData) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Analytics Dashboard</CardTitle>
          <CardDescription>No analytics data available yet</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center text-center text-muted-foreground">
          Generate some content to start seeing analytics
        </CardContent>
      </Card>
    );
  }

  // Handle niche selection
  const handleNicheChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedNiche(value === "" ? null : value);
  };

  // Get the appropriate data based on whether a niche is selected
  const currentData = selectedNiche && nicheAnalyticsData 
    ? nicheAnalyticsData 
    : analyticsData;
  
  // Check if we're loading niche data
  const isCurrentlyLoading = isLoading || (selectedNiche && isNicheLoading);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Analytics Dashboard</CardTitle>
            <CardDescription>
              Track your content generation patterns and usage trends
            </CardDescription>
          </div>
          
          {/* Enhanced filtering controls */}
          <div className="flex items-center space-x-4">
            {/* Time range selector */}
            <div className="flex items-center space-x-2">
              <label htmlFor="time-range" className="text-sm font-medium">
                Time Range:
              </label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1d">Last 24h</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Niche selector */}
            <div className="flex items-center space-x-2">
              <label htmlFor="niche-select" className="text-sm font-medium">
                Niche:
              </label>
              <Select value={selectedNiche || ""} onValueChange={(value) => setSelectedNiche(value || null)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All Niches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Niches</SelectItem>
                  {NICHES.map((niche) => (
                    <SelectItem key={niche} value={niche}>
                      {niche.charAt(0).toUpperCase() + niche.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Content type selector */}
            <div className="flex items-center space-x-2">
              <label htmlFor="content-type" className="text-sm font-medium">
                Content Type:
              </label>
              <Select value={selectedContentType || ""} onValueChange={(value) => setSelectedContentType(value || null)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="video_script">Video Script</SelectItem>
                  <SelectItem value="platform_caption">Platform Caption</SelectItem>
                  <SelectItem value="product_review">Product Review</SelectItem>
                  <SelectItem value="viral_hook">Viral Hook</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Export button */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('csv')}
                className="flex items-center space-x-1"
              >
                <Download className="h-4 w-4" />
                <span>Export CSV</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('json')}
                className="flex items-center space-x-1"
              >
                <Download className="h-4 w-4" />
                <span>Export JSON</span>
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isCurrentlyLoading ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-pulse flex flex-col space-y-2 w-full">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-[250px] bg-gray-100 rounded w-full"></div>
            </div>
          </div>
        ) : (
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-10 mb-4">
              <TabsTrigger value="templates">Template Usage</TabsTrigger>
              <TabsTrigger value="tones">Tone Preferences</TabsTrigger>
              <TabsTrigger value="trends">Generation Trends</TabsTrigger>
              <TabsTrigger value="products">Popular Products</TabsTrigger>
              {!selectedNiche && <TabsTrigger value="niches">Niche Usage</TabsTrigger>}
              <TabsTrigger value="custom">Custom Templates</TabsTrigger>
              <TabsTrigger value="ai-models">AI Models</TabsTrigger>
              <TabsTrigger value="claude">Claude Analytics</TabsTrigger>
              <TabsTrigger value="openai">OpenAI Analytics</TabsTrigger>
              <TabsTrigger value="perplexity">Perplexity Analytics</TabsTrigger>
            </TabsList>
          
            {/* Templates Tab */}
            <TabsContent value="templates" className="mt-0">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={currentData?.templateUsage || []}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="templateType" 
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [`${value} uses`, 'Usage']}
                      labelFormatter={(label) => `Template: ${label}`}
                    />
                    <Bar 
                      dataKey="count" 
                      fill="#8884d8" 
                      radius={[4, 4, 0, 0]} 
                      name="Usage"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            
            {/* Tones Tab */}
            <TabsContent value="tones" className="mt-0">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={currentData?.toneUsage || []}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="tone"
                      label={(entry) => entry.tone}
                    >
                      {(currentData?.toneUsage || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`${value} uses`, 'Usage']}
                      labelFormatter={(label) => `Tone: ${label}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            
            {/* Trends Tab */}
            <TabsContent value="trends" className="mt-0">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={currentData?.generationTrends || []}
                    margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [`${value} generations`, 'Count']}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                      name="Generations"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            
            {/* Products Tab */}
            <TabsContent value="products" className="mt-0">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={(currentData?.popularProducts || []).slice(0, 10)} // Show top 10
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis 
                      type="category" 
                      dataKey="product" 
                      width={90}
                      tickFormatter={(value) => 
                        value.length > 15 ? `${value.substring(0, 15)}...` : value
                      }
                    />
                    <Tooltip 
                      formatter={(value: number) => [`${value} uses`, 'Usage']}
                      labelFormatter={(label) => `Product: ${label}`}
                    />
                    <Bar 
                      dataKey="count" 
                      fill="#82ca9d" 
                      radius={[0, 4, 4, 0]} 
                      name="Usage"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            
            {/* Niches Tab - Only shown when not filtering by a specific niche */}
            {!selectedNiche && (
              <TabsContent value="niches" className="mt-0">
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={analyticsData?.nicheUsage || []}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="niche" 
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        tickFormatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: number) => [`${value} uses`, 'Usage']}
                        labelFormatter={(label) => `Niche: ${label.charAt(0).toUpperCase() + label.slice(1)}`}
                      />
                      <Bar 
                        dataKey="count" 
                        fill="#ff8042" 
                        radius={[4, 4, 0, 0]} 
                        name="Usage"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            )}
            
            {/* Custom Templates Tab */}
            <TabsContent value="custom" className="mt-0">
              <div className="mb-6 flex justify-end">
                <CustomTemplateEditor />
              </div>
              
              {customTemplates && customTemplates.length > 0 ? (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {customTemplates.map(template => (
                    <div key={template.id} className="border rounded-lg p-4 shadow-sm">
                      <h3 className="font-semibold text-lg mb-1">{template.name}</h3>
                      <div className="text-sm text-muted-foreground mb-2">
                        Niche: {template.niche.charAt(0).toUpperCase() + template.niche.slice(1)}
                      </div>
                      <div className="text-sm truncate max-h-24 overflow-hidden">
                        {template.content.substring(0, 150)}...
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-center text-muted-foreground">
                  <div>
                    <p className="mb-2">No custom templates created yet</p>
                    <p className="text-sm">Use the "Create Custom Template" button to make your first template</p>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* AI Models Overview Tab */}
            <TabsContent value="ai-models" className="mt-0">
              {isAiOverviewLoading ? (
                <div className="h-[400px] flex items-center justify-center">
                  <div className="animate-pulse flex flex-col space-y-2 w-full">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-[350px] bg-gray-100 rounded w-full"></div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* AI Provider Health Status */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {aiHealth?.data?.healthStatus?.map((provider) => (
                      <Card key={provider.provider} className="relative">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg flex items-center space-x-2">
                              <Brain className="h-5 w-5" style={{ color: AI_COLORS[provider.provider as keyof typeof AI_COLORS] }} />
                              <span>{provider.provider}</span>
                            </CardTitle>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(provider.status)}
                              <Badge variant={provider.status === 'healthy' ? 'default' : provider.status === 'warning' ? 'secondary' : 'destructive'}>
                                {provider.status}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
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
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Errors</span>
                              <span className="text-sm font-medium text-red-600">{provider.errorCount}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* AI Provider Metrics Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <TrendingUp className="h-5 w-5" />
                          <span>Request Volume by Provider</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                          <PieChart>
                            <Pie
                              data={aiOverview?.data?.providerMetrics?.map(p => ({
                                name: p.provider,
                                value: p.totalRequests,
                                color: AI_COLORS[p.provider as keyof typeof AI_COLORS]
                              })) || []}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              dataKey="value"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                              {aiOverview?.data?.providerMetrics?.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={AI_COLORS[entry.provider as keyof typeof AI_COLORS]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => [formatNumber(value), 'Requests']} />
                          </PieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <DollarSign className="h-5 w-5" />
                          <span>Cost Breakdown by Provider</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart data={Object.entries(aiOverview?.data?.providerCostSummary || {}).map(([provider, data]) => ({
                            provider,
                            cost: data.totalCost,
                            fill: AI_COLORS[provider as keyof typeof AI_COLORS]
                          }))}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="provider" />
                            <YAxis />
                            <Tooltip formatter={(value: number) => [formatCurrency(value), 'Estimated Cost']} />
                            <Bar dataKey="cost" fill="#8884d8" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Provider Performance Comparison */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Activity className="h-5 w-5" />
                        <span>Performance Comparison</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={aiOverview?.data?.providerMetrics || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="provider" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="avgResponseTime" fill="#8884d8" name="Avg Response Time (ms)" />
                          <Bar dataKey="successRate" fill="#82ca9d" name="Success Rate %" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            {/* Claude Analytics Tab */}
            <TabsContent value="claude" className="mt-0">
              {isClaudeLoading ? (
                <div className="h-[400px] flex items-center justify-center">
                  <div className="animate-pulse flex flex-col space-y-2 w-full">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-[350px] bg-gray-100 rounded w-full"></div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Claude Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Requests</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                          {formatNumber(claudeAnalytics?.data?.modelBreakdown?.reduce((sum, model) => sum + model.count, 0) || 0)}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Tokens</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                          {formatNumber(claudeAnalytics?.data?.modelBreakdown?.reduce((sum, model) => sum + model.totalTokens, 0) || 0)}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Avg Response Time</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                          {formatTime(claudeAnalytics?.data?.modelBreakdown?.reduce((sum, model) => sum + model.avgResponseTime, 0) / (claudeAnalytics?.data?.modelBreakdown?.length || 1) || 0)}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Estimated Cost</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                          {formatCurrency(claudeAnalytics?.data?.totalCost || 0)}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Claude Usage Trends */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Daily Usage Trends</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                          <LineChart data={claudeAnalytics?.data?.dailyTrends || []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="requests" stroke="#FF6B35" name="Requests" />
                            <Line type="monotone" dataKey="tokens" stroke="#FFA500" name="Tokens" />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Usage by Niche</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart data={claudeAnalytics?.data?.nicheUsage || []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="niche" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#FF6B35" name="Requests" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Claude Model Breakdown */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Model Performance Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-2">Model</th>
                              <th className="text-left p-2">Requests</th>
                              <th className="text-left p-2">Tokens</th>
                              <th className="text-left p-2">Avg Response Time</th>
                              <th className="text-left p-2">Success Rate</th>
                              <th className="text-left p-2">Cost</th>
                            </tr>
                          </thead>
                          <tbody>
                            {claudeAnalytics?.data?.modelBreakdown?.map((model, index) => (
                              <tr key={index} className="border-b">
                                <td className="p-2 font-medium">{model.model}</td>
                                <td className="p-2">{formatNumber(model.count)}</td>
                                <td className="p-2">{formatNumber(model.totalTokens)}</td>
                                <td className="p-2">{formatTime(model.avgResponseTime)}</td>
                                <td className="p-2">{model.successRate.toFixed(1)}%</td>
                                <td className="p-2">{formatCurrency(claudeAnalytics?.data?.claudeCosts?.find(c => c.model === model.model)?.estimatedCost || 0)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            {/* OpenAI Analytics Tab */}
            <TabsContent value="openai" className="mt-0">
              {isOpenAILoading ? (
                <div className="h-[400px] flex items-center justify-center">
                  <div className="animate-pulse flex flex-col space-y-2 w-full">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-[350px] bg-gray-100 rounded w-full"></div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* OpenAI Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Requests</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                          {formatNumber(openAIAnalytics?.data?.modelBreakdown?.reduce((sum, model) => sum + model.count, 0) || 0)}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Tokens</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                          {formatNumber(openAIAnalytics?.data?.modelBreakdown?.reduce((sum, model) => sum + model.totalTokens, 0) || 0)}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Avg Response Time</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                          {formatTime(openAIAnalytics?.data?.modelBreakdown?.reduce((sum, model) => sum + model.avgResponseTime, 0) / (openAIAnalytics?.data?.modelBreakdown?.length || 1) || 0)}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Estimated Cost</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(openAIAnalytics?.data?.totalCost || 0)}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* OpenAI Usage Trends */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Daily Usage Trends</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                          <LineChart data={openAIAnalytics?.data?.dailyTrends || []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="requests" stroke="#10B981" name="Requests" />
                            <Line type="monotone" dataKey="tokens" stroke="#34D399" name="Tokens" />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Usage by Content Type</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart data={openAIAnalytics?.data?.contentTypeUsage || []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="contentType" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#10B981" name="Requests" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>

                  {/* OpenAI Model Breakdown */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Model Performance Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-2">Model</th>
                              <th className="text-left p-2">Requests</th>
                              <th className="text-left p-2">Tokens</th>
                              <th className="text-left p-2">Avg Response Time</th>
                              <th className="text-left p-2">Success Rate</th>
                              <th className="text-left p-2">Cost</th>
                            </tr>
                          </thead>
                          <tbody>
                            {openAIAnalytics?.data?.modelBreakdown?.map((model, index) => (
                              <tr key={index} className="border-b">
                                <td className="p-2 font-medium">{model.model}</td>
                                <td className="p-2">{formatNumber(model.count)}</td>
                                <td className="p-2">{formatNumber(model.totalTokens)}</td>
                                <td className="p-2">{formatTime(model.avgResponseTime)}</td>
                                <td className="p-2">{model.successRate.toFixed(1)}%</td>
                                <td className="p-2">{formatCurrency(openAIAnalytics?.data?.openAICosts?.find(c => c.model === model.model)?.estimatedCost || 0)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            {/* Perplexity Analytics Tab */}
            <TabsContent value="perplexity" className="mt-0">
              {isPerplexityLoading ? (
                <div className="h-[400px] flex items-center justify-center">
                  <div className="animate-pulse flex flex-col space-y-2 w-full">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-[350px] bg-gray-100 rounded w-full"></div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Perplexity Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Requests</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                          {formatNumber(perplexityAnalytics?.data?.modelBreakdown?.reduce((sum, model) => sum + model.count, 0) || 0)}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Tokens</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                          {formatNumber(perplexityAnalytics?.data?.modelBreakdown?.reduce((sum, model) => sum + model.totalTokens, 0) || 0)}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Avg Response Time</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                          {formatTime(perplexityAnalytics?.data?.modelBreakdown?.reduce((sum, model) => sum + model.avgResponseTime, 0) / (perplexityAnalytics?.data?.modelBreakdown?.length || 1) || 0)}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Estimated Cost</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                          {formatCurrency(perplexityAnalytics?.data?.totalCost || 0)}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Perplexity Usage Trends */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Daily Usage Trends</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                          <LineChart data={perplexityAnalytics?.data?.dailyTrends || []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="requests" stroke="#3B82F6" name="Requests" />
                            <Line type="monotone" dataKey="tokens" stroke="#60A5FA" name="Tokens" />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Usage by Template Type</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart data={perplexityAnalytics?.data?.templateUsage || []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="templateType" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#3B82F6" name="Requests" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Perplexity Model Breakdown */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Model Performance Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-2">Model</th>
                              <th className="text-left p-2">Requests</th>
                              <th className="text-left p-2">Tokens</th>
                              <th className="text-left p-2">Avg Response Time</th>
                              <th className="text-left p-2">Success Rate</th>
                              <th className="text-left p-2">Cost</th>
                            </tr>
                          </thead>
                          <tbody>
                            {perplexityAnalytics?.data?.modelBreakdown?.map((model, index) => (
                              <tr key={index} className="border-b">
                                <td className="p-2 font-medium">{model.model}</td>
                                <td className="p-2">{formatNumber(model.count)}</td>
                                <td className="p-2">{formatNumber(model.totalTokens)}</td>
                                <td className="p-2">{formatTime(model.avgResponseTime)}</td>
                                <td className="p-2">{model.successRate.toFixed(1)}%</td>
                                <td className="p-2">{formatCurrency(perplexityAnalytics?.data?.perplexityCosts?.find(c => c.model === model.model)?.estimatedCost || 0)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default AnalyticsDashboard;