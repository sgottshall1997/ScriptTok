import { FC, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";

interface AnalyticsData {
  templateUsage: Array<{templateType: string, count: number}>;
  toneUsage: Array<{tone: string, count: number}>;
  generationTrends: Array<{date: string, count: number}>;
  popularProducts: Array<{product: string, count: number}>;
}

const COLORS = [
  '#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c', 
  '#d0ed57', '#ffc658', '#ff8042', '#ff5252', '#da70d6'
];

const AnalyticsDashboard: FC = () => {
  const [activeTab, setActiveTab] = useState("templates");
  
  const { data, isLoading, error } = useQuery<AnalyticsData>({
    queryKey: ['/api/analytics'],
    staleTime: 60 * 1000, // 1 minute
  });
  
  if (isLoading) {
    return (
      <Card className="shadow-md">
        <CardHeader className="bg-slate-50 py-4 px-5 border-b">
          <CardTitle className="text-xl text-blue-900">
            Analytics Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="space-y-4">
            <Skeleton className="h-[400px] w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="shadow-md">
        <CardHeader className="bg-slate-50 py-4 px-5 border-b">
          <CardTitle className="text-xl text-blue-900">
            Analytics Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-red-800">
            Error loading analytics data. Please try again later.
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Prepare template usage data for visualization
  const templateData = data?.templateUsage || [];
  const toneData = data?.toneUsage || [];
  const trendData = data?.generationTrends || [];
  const productData = data?.popularProducts || [];
  
  // Format date for display
  const formattedTrendData = trendData.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }));
  
  return (
    <Card className="shadow-md">
      <CardHeader className="bg-slate-50 py-4 px-5 border-b">
        <CardTitle className="text-xl text-blue-900">
          Analytics Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-4 gap-4">
            <TabsTrigger value="templates">Template Usage</TabsTrigger>
            <TabsTrigger value="tones">Tone Usage</TabsTrigger>
            <TabsTrigger value="trends">Generation Trends</TabsTrigger>
            <TabsTrigger value="products">Popular Products</TabsTrigger>
          </TabsList>
          
          <TabsContent value="templates" className="space-y-4">
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <h3 className="text-lg font-medium mb-4 text-blue-900">Most Used Templates</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={templateData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="templateType" 
                    tick={{ fill: '#4b5563' }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fill: '#4b5563' }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" name="Usage Count" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="tones" className="space-y-4">
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <h3 className="text-lg font-medium mb-4 text-blue-900">Tone Preferences</h3>
              <div className="flex flex-col md:flex-row items-center">
                <div className="w-full md:w-1/2 h-[400px]">
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={toneData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="tone"
                        label={({ tone, percent }) => `${tone}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {toneData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name, props) => [value, 'Count']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full md:w-1/2 pl-0 md:pl-8 mt-4 md:mt-0">
                  <h4 className="text-base font-medium mb-2 text-gray-700">Tone Usage Breakdown</h4>
                  <div className="space-y-2">
                    {toneData.map((item, index) => (
                      <div key={index} className="flex items-center">
                        <div 
                          className="w-4 h-4 rounded-full mr-2" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm text-gray-600 flex-1">{item.tone}</span>
                        <span className="text-sm font-medium">{item.count} uses</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="trends" className="space-y-4">
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <h3 className="text-lg font-medium mb-4 text-blue-900">Generation Trends (Last 30 Days)</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart
                  data={formattedTrendData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: '#4b5563' }}
                  />
                  <YAxis tick={{ fill: '#4b5563' }} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#8884d8" 
                    activeDot={{ r: 8 }}
                    name="Generations"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="products" className="space-y-4">
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <h3 className="text-lg font-medium mb-4 text-blue-900">Top 10 Products</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={productData}
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fill: '#4b5563' }} />
                  <YAxis 
                    dataKey="product" 
                    type="category" 
                    tick={{ fill: '#4b5563' }}
                    width={150}
                  />
                  <Tooltip />
                  <Bar dataKey="count" fill="#82ca9d" name="Usage Count" />
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