import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Zap, Layers, CheckCircle, Clock, XCircle, TrendingUp, Package, PlayCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import BulkGenerationForm from '@/components/BulkGenerationForm';
import BulkJobsList from '@/components/BulkJobsList';
import AutomatedBulkGenerator from '@/components/AutomatedBulkGenerator';
import AutomatedBulkJobsList from '@/components/AutomatedBulkJobsList';
import { useToast } from '@/hooks/use-toast';

export default function BulkContentGeneration() {
  const [activeTab, setActiveTab] = useState('automated');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch bulk jobs
  const { data: bulkJobs, isLoading: jobsLoading } = useQuery({
    queryKey: ['/api/bulk/jobs'],
    staleTime: 30000,
  });

  // Calculate summary stats
  const totalJobs = bulkJobs?.jobs?.length || 0;
  const runningJobs = bulkJobs?.jobs?.filter((j: any) => j.status === 'processing').length || 0;
  const completedJobs = bulkJobs?.jobs?.filter((j: any) => j.status === 'completed').length || 0;
  const failedJobs = bulkJobs?.jobs?.filter((j: any) => j.status === 'failed').length || 0;

  // Calculate total content generated
  const totalContentGenerated = bulkJobs?.jobs?.reduce((sum: number, job: any) => {
    return sum + (job.completedVariations || 0);
  }, 0) || 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Zap className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bulk Content Generation</h1>
            <p className="text-gray-600">Generate multiple content variations automatically across tones and templates</p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                  <p className="text-2xl font-bold">{totalJobs}</p>
                </div>
                <Package className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Running</p>
                  <p className="text-2xl font-bold text-blue-600">{runningJobs}</p>
                </div>
                <PlayCircle className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{completedJobs}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Content Generated</p>
                  <p className="text-2xl font-bold text-purple-600">{totalContentGenerated}</p>
                </div>
                <Layers className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-purple-900">Bulk Generation Benefits</h3>
              <p className="text-sm text-purple-700">Create dozens of content variations in minutes</p>
            </div>
            <div className="flex gap-4 text-center">
              <div>
                <p className="text-lg font-bold text-purple-800">{runningJobs > 0 ? runningJobs : totalJobs}</p>
                <p className="text-xs text-purple-600">Active Jobs</p>
              </div>
              <div>
                <p className="text-lg font-bold text-purple-800">{totalContentGenerated}</p>
                <p className="text-xs text-purple-600">Total Variations</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="automated" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            🚀 Automated
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Manual
          </TabsTrigger>
          <TabsTrigger value="jobs" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Jobs ({totalJobs})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="automated" className="space-y-6">
          <AutomatedBulkGenerator onJobCreated={(jobData) => {
            setActiveTab('jobs');
            queryClient.invalidateQueries({ queryKey: ['/api/bulk/jobs'] });
          }} />
        </TabsContent>

        <TabsContent value="manual" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Generate Content Variations
              </CardTitle>
              <CardDescription>
                Create multiple content variations by combining different tones and templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BulkGenerationForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Bulk Generation Jobs
              </CardTitle>
              <CardDescription>
                Monitor progress and manage your bulk content generation jobs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BulkJobsList 
                jobs={bulkJobs?.jobs || []}
                isLoading={jobsLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Template Matrix Visualization
              </CardTitle>
              <CardDescription>
                Understand how tones and templates combine to create content variations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Template Matrix */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 p-3 text-left font-medium">Tone</th>
                      <th className="border border-gray-300 p-3 text-center font-medium">Product Review</th>
                      <th className="border border-gray-300 p-3 text-center font-medium">Viral Hook</th>
                      <th className="border border-gray-300 p-3 text-center font-medium">Unboxing</th>
                      <th className="border border-gray-300 p-3 text-center font-medium">Comparison</th>
                    </tr>
                  </thead>
                  <tbody>
                    {['friendly', 'professional', 'enthusiastic', 'casual', 'luxury'].map((tone) => (
                      <tr key={tone} className="hover:bg-gray-50">
                        <td className="border border-gray-300 p-3 font-medium capitalize">
                          <Badge variant="secondary">{tone}</Badge>
                        </td>
                        {['product_review', 'viral_hook', 'unboxing', 'comparison'].map((template) => (
                          <td key={template} className="border border-gray-300 p-3 text-center">
                            <div className="flex items-center justify-center">
                              <Badge variant="outline" className="text-xs">
                                {tone}_{template}
                              </Badge>
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Explanation */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">How Bulk Generation Works</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Each cell represents one content variation</li>
                  <li>• 5 tones × 4 templates = 20 unique variations per product</li>
                  <li>• Content is automatically optimized for each platform</li>
                  <li>• Variations can be scheduled for automatic posting</li>
                </ul>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-600">3-5x</p>
                    <p className="text-sm text-gray-600">More Content</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-600">90%</p>
                    <p className="text-sm text-gray-600">Time Saved</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <CheckCircle className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-purple-600">20+</p>
                    <p className="text-sm text-gray-600">Variations/Product</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}