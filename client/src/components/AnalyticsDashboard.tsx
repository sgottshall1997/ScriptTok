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
} from 'recharts';

// Define analytics data shape
interface AnalyticsData {
  templateUsage: Array<{templateType: string, count: number}>;
  toneUsage: Array<{tone: string, count: number}>;
  generationTrends: Array<{date: string, count: number}>;
  popularProducts: Array<{product: string, count: number}>;
}

// Color palette for charts
const COLORS = ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c', '#d0ed57', '#ffc658', '#ff8042', '#ff6b6b', '#c38cff'];

const AnalyticsDashboard: FC = () => {
  const [activeTab, setActiveTab] = useState('templates');
  
  // Fetch analytics data
  const { data: analyticsData, isLoading } = useQuery<AnalyticsData>({
    queryKey: ['/api/analytics'],
    retry: 1,
  });
  
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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Analytics Dashboard</CardTitle>
        <CardDescription>
          Track your content generation patterns and usage trends
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="templates">Template Usage</TabsTrigger>
            <TabsTrigger value="tones">Tone Preferences</TabsTrigger>
            <TabsTrigger value="trends">Generation Trends</TabsTrigger>
            <TabsTrigger value="products">Popular Products</TabsTrigger>
          </TabsList>
          
          {/* Templates Tab */}
          <TabsContent value="templates" className="mt-0">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analyticsData.templateUsage}
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
                    data={analyticsData.toneUsage}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="tone"
                    label={(entry) => entry.tone}
                  >
                    {analyticsData.toneUsage.map((entry, index) => (
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
                  data={analyticsData.generationTrends}
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
                  data={analyticsData.popularProducts.slice(0, 10)} // Show top 10
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
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AnalyticsDashboard;