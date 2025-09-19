import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChefHat, Layers, CheckCircle, Clock, XCircle, TrendingUp, Package, PlayCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import CookAIngBulkGenerationForm from './components/CookAIngBulkGenerationForm';
import CookAIngBulkJobsList from './components/CookAIngBulkJobsList';
import AutomatedCookAIngBulkGenerator from './components/AutomatedCookAIngBulkGenerator';
import AutomatedCookAIngBulkJobsList from './components/AutomatedCookAIngBulkJobsList';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

export default function CookAIngGeneratorPage() {
  const [activeTab, setActiveTab] = useState('automated');
  const [location] = useLocation();
  const [autoPopulateData, setAutoPopulateData] = useState<{
    ingredient?: string;
    cookingMethod?: string;
    autopopulate?: boolean;
  }>({});
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Parse URL parameters for auto-population
  useEffect(() => {
    console.log('🔍 CookAIngGeneratorPage - Current location:', location);
    console.log('🔍 Window location search:', window.location.search);
    
    // Use window.location.search directly instead of wouter location
    const urlParams = new URLSearchParams(window.location.search);
    const ingredient = urlParams.get('ingredient');
    const cookingMethod = urlParams.get('cookingMethod');
    const autopopulate = urlParams.get('autopopulate') === 'true';

    console.log('🔍 URL Parameters from window.location:', { ingredient, cookingMethod, autopopulate });

    if (autopopulate && ingredient && cookingMethod) {
      console.log('✅ Setting autoPopulateData:', { ingredient, cookingMethod, autopopulate });
      setAutoPopulateData({ ingredient, cookingMethod, autopopulate });
      toast({
        title: 'Recipe Auto-Selected',
        description: `"${ingredient}" with ${cookingMethod} method has been added to the bulk generator`,
        duration: 4000,
      });
    } else {
      console.log('❌ Auto-population conditions not met:', { autopopulate, ingredient, cookingMethod });
    }
  }, [location, toast]);

  // Fetch cookAIng bulk jobs
  const { data: bulkJobs, isLoading: jobsLoading } = useQuery({
    queryKey: ['/api/cookAIng/generator/bulk/jobs'],
    staleTime: 30000,
  });

  // Calculate summary stats
  const totalJobs = bulkJobs?.jobs?.length || 0;
  const runningJobs = bulkJobs?.jobs?.filter((j: any) => j.status === 'processing').length || 0;
  const completedJobs = bulkJobs?.jobs?.filter((j: any) => j.status === 'completed').length || 0;
  const failedJobs = bulkJobs?.jobs?.filter((j: any) => j.status === 'failed').length || 0;

  // Calculate total recipes generated
  const totalRecipesGenerated = bulkJobs?.jobs?.reduce((sum: number, job: any) => {
    return sum + (job.completedVariations || 0);
  }, 0) || 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl" data-testid="cookaing-generator-page">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-orange-100 rounded-lg">
            <ChefHat className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900" data-testid="page-title">CookAIng Recipe Generator</h1>
            <p className="text-gray-600">Generate multiple recipe variations automatically across cooking methods and platforms</p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card data-testid="total-jobs-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                  <p className="text-2xl font-bold" data-testid="total-jobs-count">{totalJobs}</p>
                </div>
                <Package className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card data-testid="running-jobs-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Running</p>
                  <p className="text-2xl font-bold text-blue-600" data-testid="running-jobs-count">{runningJobs}</p>
                </div>
                <PlayCircle className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card data-testid="completed-jobs-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600" data-testid="completed-jobs-count">{completedJobs}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card data-testid="recipes-generated-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Recipes Generated</p>
                  <p className="text-2xl font-bold text-orange-600" data-testid="recipes-generated-count">{totalRecipesGenerated}</p>
                </div>
                <Layers className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-orange-900">CookAIng Recipe Generation Benefits</h3>
              <p className="text-sm text-orange-700">Create dozens of recipe variations in minutes with customizable cooking methods</p>
            </div>
            <div className="flex gap-4 text-center">
              <div>
                <p className="text-lg font-bold text-orange-800">{runningJobs > 0 ? runningJobs : totalJobs}</p>
                <p className="text-xs text-orange-600">Active Jobs</p>
              </div>
              <div>
                <p className="text-lg font-bold text-orange-800">{totalRecipesGenerated}</p>
                <p className="text-xs text-orange-600">Recipes Created</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6" data-testid="main-tabs">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="automated" data-testid="tab-automated">
            <ChefHat className="h-4 w-4 mr-2" />
            Automated Recipe Generation
          </TabsTrigger>
          <TabsTrigger value="manual" data-testid="tab-manual">
            <Package className="h-4 w-4 mr-2" />
            Manual Recipe Generation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="automated" className="space-y-6" data-testid="automated-tab-content">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Automated Generator Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChefHat className="h-5 w-5" />
                  Automated Recipe Generation
                </CardTitle>
                <CardDescription>
                  Set up automated bulk recipe generation with trending ingredients and cooking methods
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AutomatedCookAIngBulkGenerator onJobCreated={() => queryClient.invalidateQueries({ queryKey: ['/api/cookAIng/generator/bulk/jobs'] })} />
              </CardContent>
            </Card>

            {/* Jobs List */}
            <Card>
              <CardHeader>
                <CardTitle>Active Recipe Jobs</CardTitle>
                <CardDescription>Monitor your automated recipe generation jobs</CardDescription>
              </CardHeader>
              <CardContent>
                <AutomatedCookAIngBulkJobsList />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="manual" className="space-y-6" data-testid="manual-tab-content">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Manual Generator Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Manual Recipe Generation
                </CardTitle>
                <CardDescription>
                  Create custom recipe variations with specific ingredients and cooking methods
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CookAIngBulkGenerationForm 
                  autoPopulateData={autoPopulateData}
                  onJobCreated={() => queryClient.invalidateQueries({ queryKey: ['/api/cookAIng/generator/bulk/jobs'] })}
                />
              </CardContent>
            </Card>

            {/* Jobs List */}
            <Card>
              <CardHeader>
                <CardTitle>Manual Recipe Jobs</CardTitle>
                <CardDescription>Track your manual recipe generation progress</CardDescription>
              </CardHeader>
              <CardContent>
                <CookAIngBulkJobsList />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}