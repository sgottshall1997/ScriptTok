import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, MousePointer, Eye, Users, Calendar, Download, Filter } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

export default function PerformanceAnalytics() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [timeRange, setTimeRange] = useState('7d');
  const [nicheFilter, setNicheFilter] = useState('all');

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

  // Sample data for development (will be replaced by real API data)
  const sampleDashboard = {
    totalRevenue: 2847.50,
    totalClicks: 1543,
    conversionRate: 4.2,
    averageOrderValue: 68.25,
    topPerformingContent: [
      { product: 'CeraVe Daily Moisturizer', clicks: 234, revenue: 567.80, conversionRate: 5.1 },
      { product: 'Hero Patch Acne Dots', clicks: 189, revenue: 445.20, conversionRate: 4.8 },
      { product: 'Rare Beauty Blush', clicks: 156, revenue: 389.40, conversionRate: 3.9 },
    ],
    platformBreakdown: [
      { platform: 'TikTok', clicks: 687, revenue: 1245.60 },
      { platform: 'Instagram', clicks: 534, revenue: 956.30 },
      { platform: 'YouTube', clicks: 234, revenue: 445.20 },
      { platform: 'Twitter', clicks: 88, revenue: 200.40 },
    ]
  };

  const sampleTrends = [
    { date: '2025-07-01', clicks: 45, conversions: 2, revenue: 89.50 },
    { date: '2025-07-02', clicks: 67, conversions: 3, revenue: 156.75 },
    { date: '2025-07-03', clicks: 89, conversions: 4, revenue: 245.20 },
    { date: '2025-07-04', clicks: 123, conversions: 6, revenue: 378.40 },
    { date: '2025-07-05', clicks: 156, conversions: 8, revenue: 445.60 },
    { date: '2025-07-06', clicks: 134, conversions: 5, revenue: 356.80 },
    { date: '2025-07-07', clicks: 189, conversions: 9, revenue: 567.25 },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-100 rounded-lg">
            <TrendingUp className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Performance Analytics</h1>
            <p className="text-gray-600">Track ROI, conversions, and content performance across all platforms</p>
          </div>
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
                <SelectItem value="skincare">Skincare</SelectItem>
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

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">ROI Dashboard</TabsTrigger>
          <TabsTrigger value="trends">Performance Trends</TabsTrigger>
          <TabsTrigger value="content">Content Analysis</TabsTrigger>
          <TabsTrigger value="platforms">Platform Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${dashboardData?.totalRevenue?.toFixed(2) || sampleDashboard.totalRevenue.toFixed(2)}
                    </p>
                    <p className="text-xs text-green-500 mt-1">+12.5% vs last period</p>
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
                      {dashboardData?.totalClicks?.toLocaleString() || sampleDashboard.totalClicks.toLocaleString()}
                    </p>
                    <p className="text-xs text-blue-500 mt-1">+8.3% vs last period</p>
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
                      {dashboardData?.conversionRate?.toFixed(1) || sampleDashboard.conversionRate.toFixed(1)}%
                    </p>
                    <p className="text-xs text-purple-500 mt-1">+0.7% vs last period</p>
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
                      ${dashboardData?.averageOrderValue?.toFixed(2) || sampleDashboard.averageOrderValue.toFixed(2)}
                    </p>
                    <p className="text-xs text-orange-500 mt-1">+3.2% vs last period</p>
                  </div>
                  <Users className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Performing Content */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Content</CardTitle>
              <CardDescription>Content pieces generating the highest revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(dashboardData?.topPerformingContent || sampleDashboard.topPerformingContent).map((item: any, index: number) => (
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

          {/* Platform Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Performance</CardTitle>
              <CardDescription>Revenue and engagement by platform</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dashboardData?.platformBreakdown || sampleDashboard.platformBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="platform" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>Track clicks, conversions, and revenue over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={trendsData || sampleTrends}>
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

          {/* Daily Performance */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <Eye className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">32.5%</p>
                  <p className="text-sm text-gray-600">CTR Improvement</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">+$156</p>
                  <p className="text-sm text-gray-600">Daily Revenue Growth</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <Users className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">4.2%</p>
                  <p className="text-sm text-gray-600">Conversion Rate</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Performance Analysis</CardTitle>
              <CardDescription>Compare performance across different content types and niches</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Content Type Performance */}
              <div>
                <h3 className="font-medium mb-4">Performance by Content Type</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {['Product Review', 'Viral Hook', 'Unboxing', 'Comparison'].map((type, index) => (
                    <Card key={type} className="border-gray-200">
                      <CardContent className="p-4 text-center">
                        <Badge variant="secondary" className="mb-2">{type}</Badge>
                        <p className="text-lg font-bold text-blue-600">${(234.50 * (index + 1)).toFixed(2)}</p>
                        <p className="text-sm text-gray-600">Avg Revenue</p>
                        <p className="text-xs text-green-500 mt-1">+{5 + index * 2}% vs avg</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Niche Performance */}
              <div>
                <h3 className="font-medium mb-4">Performance by Niche</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Skincare', value: 35, revenue: 1234.50 },
                        { name: 'Tech', value: 25, revenue: 876.30 },
                        { name: 'Fashion', value: 20, revenue: 656.80 },
                        { name: 'Fitness', value: 12, revenue: 423.20 },
                        { name: 'Food', value: 8, revenue: 289.10 },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="platforms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Comparison</CardTitle>
              <CardDescription>Compare performance metrics across social media platforms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Platform</th>
                      <th className="text-center p-3">Total Clicks</th>
                      <th className="text-center p-3">Revenue</th>
                      <th className="text-center p-3">Conv. Rate</th>
                      <th className="text-center p-3">AOV</th>
                      <th className="text-center p-3">RPM</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(dashboardData?.platformBreakdown || sampleDashboard.platformBreakdown).map((platform: any) => (
                      <tr key={platform.platform} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <Badge variant="secondary" className={
                            platform.platform === 'TikTok' ? 'bg-pink-100 text-pink-700' :
                            platform.platform === 'Instagram' ? 'bg-purple-100 text-purple-700' :
                            platform.platform === 'YouTube' ? 'bg-red-100 text-red-700' :
                            'bg-blue-100 text-blue-700'
                          }>
                            {platform.platform}
                          </Badge>
                        </td>
                        <td className="text-center p-3 font-medium">{platform.clicks}</td>
                        <td className="text-center p-3 font-medium text-green-600">
                          ${platform.revenue.toFixed(2)}
                        </td>
                        <td className="text-center p-3">{(platform.revenue / platform.clicks * 100 / 50).toFixed(1)}%</td>
                        <td className="text-center p-3">${(platform.revenue / (platform.clicks * 0.04)).toFixed(2)}</td>
                        <td className="text-center p-3">${(platform.revenue / platform.clicks * 1000).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Platform Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Best Performing Platform</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <Badge className="bg-pink-100 text-pink-700 mb-3">TikTok</Badge>
                  <p className="text-2xl font-bold text-green-600">$1,245.60</p>
                  <p className="text-sm text-gray-600 mb-4">Total Revenue</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Highest engagement rate</li>
                    <li>• Strong viral potential</li>
                    <li>• Young audience demographic</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Growth Opportunities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">YouTube Shorts</span>
                    <Badge variant="outline" className="text-green-600">+23% potential</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Instagram Reels</span>
                    <Badge variant="outline" className="text-blue-600">+18% potential</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Twitter Threads</span>
                    <Badge variant="outline" className="text-purple-600">+12% potential</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}