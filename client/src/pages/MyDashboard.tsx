import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, FileText, PieChart, BarChart3, Calendar, Clock, Tag, FileType, Radio } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart as RePieChart, Pie, Cell } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link } from "wouter";

// Type definitions
interface ContentHistoryItem {
  id: number;
  niche: string;
  contentType: string;
  tone: string;
  productName: string;
  modelUsed: string;
  createdAt: string;
}

interface UserAnalytics {
  totalGenerations: number;
  totalTokens: number;
  byNiche: {
    niche: string;
    generations: number;
    tokens: number;
  }[];
  byContentType: {
    contentType: string;
    generations: number;
    tokens: number;
  }[];
  byTone: {
    tone: string;
    generations: number;
    tokens: number;
  }[];
  last7Days: {
    date: string;
    generations: number;
    tokens: number;
  }[];
  mostUsed: {
    niche: string;
    contentType: string;
    tone: string;
  };
  recentContent: ContentHistoryItem[];
}

const MyDashboard: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  
  // Fetch user-specific analytics
  const { data, isLoading, error } = useQuery<UserAnalytics>({
    queryKey: ['/api/analytics/user', timeRange],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/user?timeRange=${timeRange}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user analytics');
      }
      return response.json();
    },
    enabled: !!user, // Only run query if user is authenticated
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading your dashboard...</span>
      </div>
    );
  }

  if (error) {
    toast({
      title: "Error loading dashboard",
      description: (error as Error).message,
      variant: "destructive",
    });
    
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-4">My Dashboard</h1>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Unable to load dashboard data. Please try again later.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Helper function to format dates
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Content Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Track your content generation metrics and performance
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Select
            value={timeRange}
            onValueChange={(value) => setTimeRange(value as '7d' | '30d' | '90d')}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Total Generations</CardTitle>
            <CardDescription>Content pieces created</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-primary mr-3" />
              <span className="text-3xl font-bold">{data?.totalGenerations || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Token Usage</CardTitle>
            <CardDescription>Total AI tokens consumed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-primary mr-3" />
              <span className="text-3xl font-bold">{data?.totalTokens?.toLocaleString() || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Most Used</CardTitle>
            <CardDescription>Your preferred settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              <div className="flex items-center mb-1">
                <span className="text-sm font-medium mr-2">Niche:</span>
                <span className="text-sm text-muted-foreground">{data?.mostUsed?.niche || 'N/A'}</span>
              </div>
              <div className="flex items-center mb-1">
                <span className="text-sm font-medium mr-2">Content Type:</span>
                <span className="text-sm text-muted-foreground">{data?.mostUsed?.contentType || 'N/A'}</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium mr-2">Tone:</span>
                <span className="text-sm text-muted-foreground">{data?.mostUsed?.tone || 'N/A'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Daily Activity</CardTitle>
            <CardDescription>Content generations over the past 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {data?.last7Days && data.last7Days.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.last7Days.map(day => ({
                      ...day,
                      date: formatDate(day.date)
                    }))}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="generations" name="Generations" fill="#8884d8" />
                    <Bar yAxisId="right" dataKey="tokens" name="Tokens (÷100)" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">No data available for the selected period</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="niche">
          <Card>
            <CardHeader className="pb-0">
              <div className="flex justify-between items-center">
                <CardTitle>Content Distribution</CardTitle>
                <TabsList>
                  <TabsTrigger value="niche">Niche</TabsTrigger>
                  <TabsTrigger value="type">Type</TabsTrigger>
                  <TabsTrigger value="tone">Tone</TabsTrigger>
                </TabsList>
              </div>
              <CardDescription>Breakdown of your content generation patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] pt-6">
                <TabsContent value="niche" className="h-full">
                  {data?.byNiche && data.byNiche.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <Pie
                          data={data.byNiche}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="generations"
                          nameKey="niche"
                        >
                          {data.byNiche.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RePieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">No data available for niches</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="type" className="h-full">
                  {data?.byContentType && data.byContentType.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <Pie
                          data={data.byContentType}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="generations"
                          nameKey="contentType"
                        >
                          {data.byContentType.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RePieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">No data available for content types</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="tone" className="h-full">
                  {data?.byTone && data.byTone.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <Pie
                          data={data.byTone}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="generations"
                          nameKey="tone"
                        >
                          {data.byTone.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RePieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">No data available for tones</p>
                    </div>
                  )}
                </TabsContent>
              </div>
            </CardContent>
          </Card>
        </Tabs>
      </div>

      {/* Recent Activity Section - Could be added here */}
    </div>
  );
};

export default MyDashboard;