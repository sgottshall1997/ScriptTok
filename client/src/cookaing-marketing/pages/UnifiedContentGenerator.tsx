import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChefHat, Layers, CheckCircle, TrendingUp, Package, PlayCircle, Wand2, Volume2, Image, Video, Type, BookOpen, Mail, Instagram, Youtube } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import CookaingBulkGenerationForm from '../components/CookaingBulkGenerationForm';
import CookaingAutomatedGenerator from '../components/CookaingAutomatedGenerator';
import CookaingJobsList from '../components/CookaingJobsList';

const CookaingUnifiedContentGenerator: React.FC = () => {
  const [activeTab, setActiveTab] = useState('automated');
  const [generationResults, setGenerationResults] = useState<any[]>([]);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch CookAIng content jobs for stats
  const { data: contentJobs, isLoading: jobsLoading } = useQuery({
    queryKey: ['/api/cookaing-marketing/content/jobs'],
    staleTime: 30000,
  });

  // Fetch content stats from unified system
  const { data: contentStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/cookaing-marketing/unified-content/stats', { source_app: 'cookAIng' }],
    staleTime: 30000,
  });

  // Calculate summary stats
  const totalJobs = contentJobs?.jobs?.length || 0;
  const generatedJobs = contentJobs?.jobs?.filter((j: any) => j.status === 'generated').length || 0;
  const pendingJobs = contentJobs?.jobs?.filter((j: any) => j.status === 'pending').length || 0;
  const failedJobs = contentJobs?.jobs?.filter((j: any) => j.status === 'failed').length || 0;

  // Content stats from unified system
  const totalContent = contentStats?.stats?.total || 0;
  const recentContent = contentStats?.stats?.recent_count || 0;
  const avgRating = contentStats?.stats?.avg_rating || 0;
  const favoriteContent = contentStats?.stats?.favorites_count || 0;

  const handleContentGenerated = (results: any[]) => {
    setGenerationResults(results);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-orange-100 rounded-lg">
            <ChefHat className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900" data-testid="heading-unified-generator">
              CookAIng Content Generator
            </h1>
            <p className="text-gray-600">
              Generate recipe content variations automatically across multiple platforms and formats
            </p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card data-testid="stat-card-total-jobs">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Content</p>
                  <p className="text-2xl font-bold">{totalContent}</p>
                </div>
                <Package className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-card-recent">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Recent (7 days)</p>
                  <p className="text-2xl font-bold text-blue-600">{recentContent}</p>
                </div>
                <PlayCircle className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-card-favorites">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Favorites</p>
                  <p className="text-2xl font-bold text-green-600">{favoriteContent}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-card-rating">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {avgRating ? avgRating.toFixed(1) : '0.0'}
                  </p>
                </div>
                <Layers className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-orange-900">Recipe Content Generation</h3>
              <p className="text-sm text-orange-700">
                Transform recipes into engaging content across blogs, social media, emails, and video scripts
              </p>
            </div>
            <div className="flex gap-4 text-center">
              <div>
                <p className="text-lg font-bold text-orange-800">{totalJobs}</p>
                <p className="text-xs text-orange-600">Generation Jobs</p>
              </div>
              <div>
                <p className="text-lg font-bold text-orange-800">{totalContent}</p>
                <p className="text-xs text-orange-600">Content Pieces</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Tabs 
        value={activeTab} 
        onValueChange={(value) => {
          setActiveTab(value);
          window.scrollTo(0, 0);
        }}
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="automated" className="flex items-center gap-2" data-testid="tab-automated">
            <TrendingUp className="h-4 w-4" />
            🚀 Smart Generate
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-2" data-testid="tab-manual">
            <ChefHat className="h-4 w-4" />
            Recipe Templates
          </TabsTrigger>
          <TabsTrigger value="jobs" className="flex items-center gap-2" data-testid="tab-jobs">
            <Layers className="h-4 w-4" />
            Jobs ({totalJobs})
          </TabsTrigger>
          <TabsTrigger value="enhance" className="flex items-center gap-2" data-testid="tab-enhance">
            <Wand2 className="h-4 w-4" />
            ✨ Enhance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="automated" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Smart Recipe Content Generation
              </CardTitle>
              <CardDescription>
                AI-powered content generation that automatically selects trending recipes and creates multi-platform content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CookaingAutomatedGenerator 
                onJobCreated={(jobData) => {
                  setActiveTab('jobs');
                  queryClient.invalidateQueries({ queryKey: ['/api/cookaing-marketing/content/jobs'] });
                }} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChefHat className="h-5 w-5" />
                Recipe Template Generation
              </CardTitle>
              <CardDescription>
                Generate content from specific recipes using customizable templates and content formats
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CookaingBulkGenerationForm onContentGenerated={handleContentGenerated} />
            </CardContent>
          </Card>

          {/* Show generation results if any */}
          {generationResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Generated Content</CardTitle>
                <CardDescription>Latest content generation results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {generationResults.map((result, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">{result.blueprint?.name}</h4>
                      <div className="text-sm text-gray-600">
                        <p><strong>Recipe:</strong> {result.sourceData?.title}</p>
                        <p><strong>Platform:</strong> {result.options?.platform}</p>
                        <p><strong>Persona:</strong> {result.options?.persona}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="jobs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Content Generation Jobs
              </CardTitle>
              <CardDescription>
                Track and manage all your recipe content generation jobs and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CookaingJobsList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="enhance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5" />
                Content Enhancement Suite
              </CardTitle>
              <CardDescription>
                Enhance your recipe content with AI-powered tools for different media formats
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recipe Blog Enhancement */}
                <Card className="hover:shadow-md transition-shadow cursor-pointer" data-testid="card-enhance-blog">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Blog Enhancement</CardTitle>
                        <CardDescription className="text-sm">Optimize recipes for blog posts and SEO</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="text-sm text-gray-600">
                        • SEO optimization<br/>
                        • Nutritional information<br/>
                        • Cooking tips and variations
                      </div>
                      <Button 
                        className="w-full" 
                        variant="outline"
                        data-testid="button-blog-enhance"
                        onClick={() => {
                          toast({
                            title: "Coming Soon",
                            description: "Recipe blog enhancement is being implemented."
                          });
                        }}
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        Enhance for Blog
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Social Media Enhancement */}
                <Card className="hover:shadow-md transition-shadow cursor-pointer" data-testid="card-enhance-social">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-pink-100 rounded-lg">
                        <Instagram className="h-5 w-5 text-pink-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Social Media Posts</CardTitle>
                        <CardDescription className="text-sm">Create engaging social media content</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="text-sm text-gray-600">
                        • Instagram-ready captions<br/>
                        • Trending hashtags<br/>
                        • Multiple platform formats
                      </div>
                      <Button 
                        className="w-full" 
                        variant="outline"
                        data-testid="button-social-enhance"
                        onClick={() => {
                          toast({
                            title: "Coming Soon",
                            description: "Social media enhancement is being implemented."
                          });
                        }}
                      >
                        <Instagram className="h-4 w-4 mr-2" />
                        Create Social Posts
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Email Campaign Enhancement */}
                <Card className="hover:shadow-md transition-shadow cursor-pointer" data-testid="card-enhance-email">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Mail className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Email Campaigns</CardTitle>
                        <CardDescription className="text-sm">Transform recipes into email newsletters</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="text-sm text-gray-600">
                        • Newsletter formatting<br/>
                        • Compelling subject lines<br/>
                        • Call-to-action optimization
                      </div>
                      <Button 
                        className="w-full" 
                        variant="outline"
                        data-testid="button-email-enhance"
                        onClick={() => {
                          toast({
                            title: "Coming Soon",
                            description: "Email campaign enhancement is being implemented."
                          });
                        }}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Create Email Campaign
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Video Script Enhancement */}
                <Card className="hover:shadow-md transition-shadow cursor-pointer" data-testid="card-enhance-video">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <Youtube className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Video Scripts</CardTitle>
                        <CardDescription className="text-sm">Create cooking video scripts and instructions</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="text-sm text-gray-600">
                        • Step-by-step narration<br/>
                        • Engaging introductions<br/>
                        • YouTube optimization
                      </div>
                      <Button 
                        className="w-full" 
                        variant="outline"
                        data-testid="button-video-enhance"
                        onClick={() => {
                          toast({
                            title: "Coming Soon",
                            description: "Video script enhancement is being implemented."
                          });
                        }}
                      >
                        <Youtube className="h-4 w-4 mr-2" />
                        Generate Video Script
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CookaingUnifiedContentGenerator;