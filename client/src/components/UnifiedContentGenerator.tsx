import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Zap, Layers, CheckCircle, TrendingUp, Package, PlayCircle } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import GeneratedContentCard from './GeneratedContentCard';
import BulkGenerationForm from './BulkGenerationForm';
import AutomatedBulkGenerator from './AutomatedBulkGenerator';
import BulkJobsList from './BulkJobsList';
import AutomatedBulkJobsList from './AutomatedBulkJobsList';
import { ComplianceWrapper } from './ComplianceWrapper';
import WebhookDebugPanel from './WebhookDebugPanel';

const UnifiedContentGenerator: React.FC = () => {
  const [activeTab, setActiveTab] = useState('automated');
  const [generationResults, setGenerationResults] = useState<any[]>([]);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch bulk jobs for stats
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

  const handleContentGenerated = (results: any[]) => {
    setGenerationResults(results);
  };

  return (
    <ComplianceWrapper 
      hasAffiliateLinks={true} 
      showDetailedDisclosure={true}
      className="container mx-auto px-4 py-8 max-w-7xl"
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Zap className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bulk Content Generation</h1>
            <p className="text-gray-600">Generate content variations automatically across multiple niches and platforms</p>
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
              <p className="text-sm text-purple-700">Create dozens of content variations in minutes with customizable product selection</p>
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
      <Tabs value={activeTab} onValueChange={(value) => {
        setActiveTab(value);
        // Scroll to top when changing tabs
        window.scrollTo(0, 0);
      }}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="automated" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            🚀 Automated
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Manual Bulk
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
                Manual Bulk Generation
              </CardTitle>
              <CardDescription>Generate content for multiple products with custom tone and template combinations</CardDescription>
            </CardHeader>
            <CardContent>
              <BulkGenerationForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Automated Jobs
                </CardTitle>
                <CardDescription>AI-powered bulk generation with trending product auto-selection</CardDescription>
              </CardHeader>
              <CardContent>
                <AutomatedBulkJobsList />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Manual Bulk Jobs
                </CardTitle>
                <CardDescription>Custom bulk generation jobs with user-defined products</CardDescription>
              </CardHeader>
              <CardContent>
                <BulkJobsList />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Webhook Debug Panel */}
      <div className="mt-8">
        <WebhookDebugPanel />
      </div>

      {/* Results Display */}
      {generationResults.length > 0 && (
        <div className="mt-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Generated Content</h2>
            <p className="text-gray-600">
              {generationResults.length} content piece{generationResults.length > 1 ? 's' : ''} generated successfully
            </p>
          </div>
          
          <div className="space-y-6">
            {generationResults.map((result, index) => (
              <GeneratedContentCard
                key={index}
                result={result}
                contentIndex={index}
                showRating={true}
              />
            ))}
          </div>
        </div>
      )}
    </ComplianceWrapper>
  );
};

export default UnifiedContentGenerator;