import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Sector
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface UsageSummary {
  totalGenerations: number;
  totalTokens: number;
  byModel: {
    model: string;
    generations: number;
    tokens: number;
  }[];
  last7Days: {
    date: string;
    generations: number;
    tokens: number;
  }[];
}

// Custom colors for charts
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const AnalyticsDashboard: React.FC = () => {
  const { toast } = useToast();
  
  const { data, isLoading, isError, error } = useQuery<{ success: boolean; summary: UsageSummary }>({
    queryKey: ['/api/usage-summary'],
    refetchInterval: 60000, // Refresh every minute
  });

  // Format date strings for chart display
  const formatChartData = (data: UsageSummary['last7Days']) => {
    return data.map(day => ({
      ...day,
      date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }));
  };

  // Calculate total cost based on token usage (approximate cost)
  const calculateCost = (tokens: number, model: string) => {
    // Simplified pricing model (this can be expanded based on actual pricing)
    const rates: Record<string, { input: number; output: number }> = {
      'gpt-4o': { input: 0.00001, output: 0.00003 }, // $10/million input, $30/million output
      'gpt-4': { input: 0.00003, output: 0.00006 },  // $30/million input, $60/million output
      'gpt-3.5-turbo': { input: 0.000001, output: 0.000002 }, // $1/million input, $2/million output
      'claude-3-opus': { input: 0.00001, output: 0.00003 }, // $15/million input, $75/million output
      'claude-3-sonnet': { input: 0.000003, output: 0.000015 }, // $3/million input, $15/million output
      'default': { input: 0.00001, output: 0.00003 } // Default fallback rate
    };
    
    // Assuming a 1:4 input:output token ratio for estimation
    const inputTokens = tokens * 0.2;
    const outputTokens = tokens * 0.8;
    
    const modelRates = rates[model] || rates['default'];
    return (inputTokens * modelRates.input) + (outputTokens * modelRates.output);
  };

  // If data is loading, show skeleton UI
  if (isLoading) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="shadow-md">
              <CardHeader className="pb-2">
                <CardTitle><Skeleton className="h-6 w-1/2" /></CardTitle>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-12 w-2/3 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <Card key={i} className="shadow-md">
              <CardHeader>
                <CardTitle><Skeleton className="h-6 w-1/2" /></CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <Skeleton className="h-full w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // If there's an error, show error message
  if (isError) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    toast({
      title: "Error loading analytics data",
      description: errorMessage,
      variant: "destructive"
    });
    
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load analytics data. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const summary = data?.summary;
  
  if (!summary) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>
        <Alert>
          <AlertTitle>No data available</AlertTitle>
          <AlertDescription>
            No usage data is available yet. Try generating some content first.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Calculate total estimated cost
  const totalCost = summary.byModel.reduce((acc, model) => {
    return acc + calculateCost(model.tokens, model.model);
  }, 0);

  // Prepare data for daily usage chart
  const dailyData = summary.last7Days.length > 0 
    ? formatChartData(summary.last7Days) 
    : [{ date: 'No data', generations: 0, tokens: 0 }];

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Total Generations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{summary.totalGenerations}</p>
            <p className="text-sm text-muted-foreground">Content pieces generated</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Total Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{summary.totalTokens.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">API tokens consumed</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Avg. Tokens/Generation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {summary.totalGenerations > 0 
                ? Math.round(summary.totalTokens / summary.totalGenerations).toLocaleString() 
                : 0}
            </p>
            <p className="text-sm text-muted-foreground">Average tokens per content</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Est. Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${totalCost.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">Approximate API cost</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Daily Usage</CardTitle>
            <CardDescription>Content generations and token consumption over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={dailyData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="generations" 
                    name="Generations" 
                    stroke="#8884d8" 
                    activeDot={{ r: 8 }} 
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="tokens" 
                    name="Tokens" 
                    stroke="#82ca9d" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>AI Model Usage</CardTitle>
            <CardDescription>Distribution of generations and tokens by AI model</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {summary.byModel.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={summary.byModel}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="model" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="generations" name="Generations" fill="#8884d8" />
                    <Bar dataKey="tokens" name="Tokens" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">No model data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Additional future chart for token usage by niche could go here */}
      
      <Separator className="my-6" />
      
      <div className="text-sm text-muted-foreground">
        <p>
          <strong>Note:</strong> Estimated costs are calculated based on approximate pricing 
          and may not reflect actual billing. Token counts include both prompt and completion tokens.
        </p>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;