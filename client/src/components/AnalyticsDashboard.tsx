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
} from 'recharts';

// Available niches for the dropdown
import { NICHES } from '@shared/constants';

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

// Color palette for charts
const COLORS = ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c', '#d0ed57', '#ffc658', '#ff8042', '#ff6b6b', '#c38cff'];

const AnalyticsDashboard: FC = () => {
  const [activeTab, setActiveTab] = useState('templates');
  const [selectedNiche, setSelectedNiche] = useState<string | null>(null);
  
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
          
          {/* Niche selector */}
          <div className="flex items-center space-x-2">
            <label htmlFor="niche-select" className="text-sm font-medium">
              Filter by Niche:
            </label>
            <select
              id="niche-select"
              className="rounded-md border border-gray-300 p-2 text-sm"
              value={selectedNiche || ""}
              onChange={handleNicheChange}
            >
              <option value="">All Niches</option>
              {NICHES.map((niche) => (
                <option key={niche} value={niche}>
                  {niche.charAt(0).toUpperCase() + niche.slice(1)}
                </option>
              ))}
            </select>
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
            <TabsList className="grid grid-cols-6 mb-4">
              <TabsTrigger value="templates">Template Usage</TabsTrigger>
              <TabsTrigger value="tones">Tone Preferences</TabsTrigger>
              <TabsTrigger value="trends">Generation Trends</TabsTrigger>
              <TabsTrigger value="products">Popular Products</TabsTrigger>
              {!selectedNiche && <TabsTrigger value="niches">Niche Usage</TabsTrigger>}
              <TabsTrigger value="custom">Custom Templates</TabsTrigger>
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
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default AnalyticsDashboard;