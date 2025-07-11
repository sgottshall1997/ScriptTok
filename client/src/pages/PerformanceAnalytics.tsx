import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, MousePointer, Eye, Users, Calendar, Download, Filter, Plus, Save } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

// Form schema for data input
const metricsSchema = z.object({
  contentId: z.string().min(1, 'Content ID is required'),
  platform: z.string().min(1, 'Platform is required'),
  views: z.number().min(0).optional(),
  likes: z.number().min(0).optional(),
  shares: z.number().min(0).optional(),
  comments: z.number().min(0).optional(),
  clickThrough: z.number().min(0).optional(),
  conversions: z.number().min(0).optional(),
  revenue: z.number().min(0).optional(),
});

type MetricsForm = z.infer<typeof metricsSchema>;

export default function PerformanceAnalytics() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [timeRange, setTimeRange] = useState('7d');
  const [nicheFilter, setNicheFilter] = useState('all');
  const [showInputForm, setShowInputForm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch analytics data
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ['/api/analytics/dashboard', timeRange, nicheFilter],
    staleTime: 60000,
  });

  const { data: trendsData, isLoading: trendsLoading } = useQuery({
    queryKey: ['/api/analytics/trends', timeRange],
    staleTime: 60000,
  });

  const { data: comparisonData, isLoading: comparisonLoading } = useQuery({
    queryKey: ['/api/analytics/comparison'],
    staleTime: 120000,
  });

  // AI Analytics data
  const { data: aiAnalyticsData, isLoading: aiAnalyticsLoading } = useQuery({
    queryKey: ['/api/ai-analytics/model-usage', timeRange],
    staleTime: 30000,
  });

  const { data: perplexityStats, isLoading: perplexityLoading } = useQuery({
    queryKey: ['/api/ai-analytics/perplexity-stats', timeRange],
    staleTime: 30000,
  });

  const { data: aiComparison, isLoading: aiComparisonLoading } = useQuery({
    queryKey: ['/api/ai-analytics/comparison', timeRange],
    staleTime: 30000,
  });

  // Form for manual data input
  const form = useForm<MetricsForm>({
    resolver: zodResolver(metricsSchema),
    defaultValues: {
      contentId: '',
      platform: '',
      views: 0,
      likes: 0,
      shares: 0,
      comments: 0,
      clickThrough: 0,
      conversions: 0,
      revenue: 0,
    },
  });

  // Add metrics mutation
  const addMetricsMutation = useMutation({
    mutationFn: async (data: MetricsForm) => {
      const response = await apiRequest('POST', '/api/metrics/manual', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Metrics Added",
        description: "Performance data has been successfully recorded.",
      });
      form.reset();
      setShowInputForm(false);
      // Invalidate and refetch analytics data
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/trends'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add performance metrics. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: MetricsForm) => {
    addMetricsMutation.mutate(data);
  };

  // Show empty state when no data
  const hasData = dashboardData && (
    dashboardData.totalRevenue > 0 || 
    dashboardData.totalClicks > 0 || 
    dashboardData.topPerformingContent?.length > 0
  );

  const EmptyState = ({ title, description }: { title: string; description: string }) => (
    <Card>
      <CardContent className="p-8 text-center">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <TrendingUp className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        <Button onClick={() => setShowInputForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Performance Data
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Performance Analytics</h1>
              <p className="text-gray-600">Track ROI, conversions, and content performance across all platforms</p>
            </div>
          </div>
          <Button onClick={() => setShowInputForm(true)} className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Data
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={nicheFilter} onValueChange={setNicheFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Niches</SelectItem>
                <SelectItem value="beauty">Beauty & Personal Care</SelectItem>
                <SelectItem value="tech">Tech</SelectItem>
                <SelectItem value="fashion">Fashion</SelectItem>
                <SelectItem value="fitness">Fitness</SelectItem>
                <SelectItem value="food">Food</SelectItem>
                <SelectItem value="travel">Travel</SelectItem>
                <SelectItem value="pets">Pets</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button variant="outline" className="ml-auto">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Data Input Form Modal */}
      {showInputForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Add Performance Metrics</CardTitle>
            <CardDescription>Manually input performance data for your content</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content ID</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter content identifier" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="platform"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Platform</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select platform" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="tiktok">TikTok</SelectItem>
                            <SelectItem value="instagram">Instagram</SelectItem>
                            <SelectItem value="youtube">YouTube</SelectItem>
                            <SelectItem value="twitter">Twitter</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="views"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Views</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="likes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Likes</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="shares"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shares</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="comments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Comments</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="conversions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Conversions</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="revenue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Revenue ($)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            {...field} 
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={addMetricsMutation.isPending}>
                    <Save className="h-4 w-4 mr-2" />
                    {addMetricsMutation.isPending ? 'Adding...' : 'Add Metrics'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowInputForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={(value) => {
        setActiveTab(value);
        window.scrollTo(0, 0);
      }}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">ROI Dashboard</TabsTrigger>
          <TabsTrigger value="trends">Performance Trends</TabsTrigger>
          <TabsTrigger value="content">Content Analysis</TabsTrigger>
          <TabsTrigger value="platforms">Platform Comparison</TabsTrigger>
          <TabsTrigger value="ai-analytics">AI Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {!hasData ? (
            <EmptyState 
              title="No Performance Data Yet" 
              description="Start tracking your content performance by adding your first metrics data point."
            />
          ) : (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                        <p className="text-2xl font-bold text-green-600">
                          ${dashboardData?.totalRevenue?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                      <DollarSign className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Clicks</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {dashboardData?.totalClicks?.toLocaleString() || '0'}
                        </p>
                      </div>
                      <MousePointer className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {dashboardData?.conversionRate?.toFixed(1) || '0.0'}%
                        </p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                        <p className="text-2xl font-bold text-orange-600">
                          ${dashboardData?.averageOrderValue?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                      <Users className="h-8 w-8 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Top Performing Content */}
              {dashboardData?.topPerformingContent?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Top Performing Content</CardTitle>
                    <CardDescription>Content pieces generating the highest revenue</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {dashboardData.topPerformingContent.map((item: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">#{index + 1}</span>
                            </div>
                            <div>
                              <p className="font-medium">{item.product}</p>
                              <p className="text-sm text-gray-600">{item.clicks} clicks • {item.conversionRate}% conversion</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">${item.revenue.toFixed(2)}</p>
                            <p className="text-xs text-gray-500">Revenue</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Platform Performance */}
              {dashboardData?.platformBreakdown?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Platform Performance</CardTitle>
                    <CardDescription>Revenue and engagement by platform</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={dashboardData.platformBreakdown}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="platform" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="revenue" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          {!trendsData || trendsData.length === 0 ? (
            <EmptyState 
              title="No Trend Data Available" 
              description="Add performance metrics over time to view trend analysis and growth patterns."
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>Track clicks, conversions, and revenue over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={trendsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="clicks" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="conversions" stroke="#82ca9d" strokeWidth={2} />
                    <Line type="monotone" dataKey="revenue" stroke="#ffc658" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <EmptyState 
            title="Content Analysis Coming Soon" 
            description="Detailed content performance analysis will be available once you add performance data."
          />
        </TabsContent>

        <TabsContent value="platforms" className="space-y-6">
          {!comparisonData || comparisonData.length === 0 ? (
            <EmptyState 
              title="No Platform Comparison Data" 
              description="Add metrics from multiple platforms to compare their performance side by side."
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Platform Comparison</CardTitle>
                <CardDescription>Compare performance across different platforms</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={comparisonData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label
                    >
                      {comparisonData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="ai-analytics" className="space-y-6">
          {aiAnalyticsLoading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading AI analytics...</p>
              </CardContent>
            </Card>
          ) : !aiAnalyticsData || aiAnalyticsData.data?.providerUsage?.length === 0 ? (
            <EmptyState 
              title="No AI Usage Data" 
              description="Start generating content to track OpenAI vs Perplexity usage analytics and performance metrics."
            />
          ) : (
            <>
              {/* AI Provider Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {aiAnalyticsData.data.providerUsage.map((provider: any, index: number) => (
                  <Card key={provider.provider}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">{provider.provider}</p>
                          <p className="text-2xl font-bold" style={{ color: provider.provider === 'OpenAI' ? '#10B981' : provider.provider === 'Perplexity' ? '#8B5CF6' : '#F59E0B' }}>
                            {provider.count.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{provider.totalTokens?.toLocaleString() || '0'} tokens</p>
                        </div>
                        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ 
                          backgroundColor: provider.provider === 'OpenAI' ? '#10B981' : provider.provider === 'Perplexity' ? '#8B5CF6' : '#F59E0B',
                          opacity: 0.1
                        }}>
                          {provider.provider === 'OpenAI' && <span className="text-lg">🤖</span>}
                          {provider.provider === 'Perplexity' && <span className="text-lg">🔍</span>}
                          {provider.provider === 'Anthropic' && <span className="text-lg">🧠</span>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* AI Usage Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>AI Provider Distribution</CardTitle>
                  <CardDescription>Content generation breakdown by AI provider</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={aiAnalyticsData.data.providerUsage}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="count"
                        label={({ provider, count }) => `${provider}: ${count}`}
                      >
                        {aiAnalyticsData.data.providerUsage.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.provider === 'OpenAI' ? '#10B981' : entry.provider === 'Perplexity' ? '#8B5CF6' : '#F59E0B'} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Detailed Model Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Model Usage Details</CardTitle>
                  <CardDescription>Detailed breakdown of specific AI models used</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {aiAnalyticsData.data.modelBreakdown.map((model: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{
                            backgroundColor: model.model.includes('gpt') ? '#10B981' : 
                                           model.model.includes('sonar') || model.model.includes('perplexity') ? '#8B5CF6' : 
                                           model.model.includes('claude') ? '#F59E0B' : '#6B7280',
                            opacity: 0.2
                          }}>
                            <span className="text-sm font-medium" style={{
                              color: model.model.includes('gpt') ? '#10B981' : 
                                    model.model.includes('sonar') || model.model.includes('perplexity') ? '#8B5CF6' : 
                                    model.model.includes('claude') ? '#F59E0B' : '#6B7280'
                            }}>
                              {model.model.includes('gpt') ? 'AI' : 
                               model.model.includes('sonar') || model.model.includes('perplexity') ? 'PX' : 
                               model.model.includes('claude') ? 'CL' : 'UN'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{model.model}</p>
                            <p className="text-sm text-gray-600">{model.count} generations • Avg: {Math.round(model.avgTokens || 0)} tokens</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-blue-600">{(model.totalTokens || 0).toLocaleString()}</p>
                          <p className="text-xs text-gray-500">Total tokens</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Daily Usage Trends */}
              {aiAnalyticsData.data.dailyTrends && aiAnalyticsData.data.dailyTrends.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Daily AI Usage Trends</CardTitle>
                    <CardDescription>Track daily content generation by AI provider</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={aiAnalyticsData.data.dailyTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" stackId="a" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* Perplexity Specific Stats */}
              {perplexityStats && perplexityStats.data?.perplexityUsage?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-2xl">🔍</span>
                      Perplexity Intelligence Analytics
                    </CardTitle>
                    <CardDescription>Detailed Perplexity usage statistics and trending data quality</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Perplexity Models */}
                    <div>
                      <h4 className="font-semibold mb-3 text-purple-700">Perplexity Models Used</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {perplexityStats.data.perplexityUsage.map((model: any, index: number) => (
                          <div key={index} className="bg-purple-50 p-4 rounded-lg">
                            <p className="font-medium text-purple-900">{model.model}</p>
                            <p className="text-sm text-purple-700">{model.count} generations</p>
                            <p className="text-xs text-purple-600">{(model.totalTokens || 0).toLocaleString()} tokens</p>
                            <p className="text-xs text-purple-500 mt-1">Niches: {model.byNiche}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recent Perplexity Generations */}
                    <div>
                      <h4 className="font-semibold mb-3 text-purple-700">Recent Perplexity Generations</h4>
                      <div className="space-y-2">
                        {perplexityStats.data.recentGenerations.slice(0, 5).map((gen: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-purple-50 rounded">
                            <div>
                              <p className="font-medium text-purple-900">{gen.productName}</p>
                              <p className="text-sm text-purple-600">{gen.niche} • {gen.model}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-purple-700">{gen.tokenCount} tokens</p>
                              <p className="text-xs text-purple-500">{new Date(gen.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Content Type Usage for Perplexity */}
                    <div>
                      <h4 className="font-semibold mb-3 text-purple-700">Perplexity Content Types</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {perplexityStats.data.contentTypeUsage.map((type: any, index: number) => (
                          <div key={index} className="bg-purple-50 p-4 rounded-lg text-center">
                            <p className="text-2xl font-bold text-purple-600">{type.count}</p>
                            <p className="text-sm text-purple-700">{type.contentType}</p>
                            <p className="text-xs text-purple-500">{Math.round(type.avgTokens || 0)} avg tokens</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* AI Comparison */}
              {aiComparison && aiComparison.data?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>OpenAI vs Perplexity Comparison</CardTitle>
                    <CardDescription>Side-by-side performance comparison of AI providers</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {aiComparison.data.map((provider: any, index: number) => (
                        <div key={index} className="border rounded-lg p-4" style={{
                          borderColor: provider.provider === 'OpenAI' ? '#10B981' : '#8B5CF6',
                          backgroundColor: provider.provider === 'OpenAI' ? '#F0FDF4' : '#FAF5FF'
                        }}>
                          <h4 className="font-semibold mb-3 flex items-center gap-2" style={{
                            color: provider.provider === 'OpenAI' ? '#10B981' : '#8B5CF6'
                          }}>
                            {provider.provider === 'OpenAI' ? '🤖' : '🔍'} {provider.provider}
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Total Generations:</span>
                              <span className="font-medium">{provider.totalGenerations.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Total Tokens:</span>
                              <span className="font-medium">{(provider.totalTokens || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Avg Tokens/Gen:</span>
                              <span className="font-medium">{Math.round(provider.avgTokensPerGeneration || 0)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Unique Niches:</span>
                              <span className="font-medium">{provider.uniqueNiches}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Content Types:</span>
                              <span className="font-medium">{provider.uniqueContentTypes}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}