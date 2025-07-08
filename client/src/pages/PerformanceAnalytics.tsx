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
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">ROI Dashboard</TabsTrigger>
          <TabsTrigger value="trends">Performance Trends</TabsTrigger>
          <TabsTrigger value="content">Content Analysis</TabsTrigger>
          <TabsTrigger value="platforms">Platform Comparison</TabsTrigger>
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
      </Tabs>
    </div>
  );
}