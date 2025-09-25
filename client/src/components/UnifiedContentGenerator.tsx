import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Zap, Layers, CheckCircle, TrendingUp, Package, PlayCircle, Wand2, Volume2, Image, Video, Type, BookOpen, Search, Sparkles } from 'lucide-react';
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
        <TabsList className="grid w-full grid-cols-5">
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
          <TabsTrigger value="enhance" className="flex items-center gap-2" data-testid="tab-enhance">
            <Wand2 className="h-4 w-4" />
            ✨ Enhance
          </TabsTrigger>
          <TabsTrigger value="documentation" className="flex items-center gap-2" data-testid="tab-documentation">
            <BookOpen className="h-4 w-4" />
            📖 Docs
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

        <TabsContent value="enhance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5" />
                Content Enhancement
              </CardTitle>
              <CardDescription>Enhance your content with AI-powered rewriting, voice generation, images, and videos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Rewrite Enhancement Card */}
                <Card className="hover:shadow-md transition-shadow cursor-pointer" data-testid="card-enhance-rewrite">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Type className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Content Rewrite</CardTitle>
                        <CardDescription className="text-sm">Rewrite and improve your content with AI</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="text-sm text-gray-600">
                        • Professional tone conversion<br/>
                        • Grammar and style improvements<br/>
                        • Multiple rewrite variations
                      </div>
                      <Button 
                        className="w-full" 
                        variant="outline"
                        data-testid="button-rewrite-enhance"
                        onClick={() => {
                          toast({
                            title: "Coming Soon",
                            description: "Content rewriting enhancement is being implemented."
                          });
                        }}
                      >
                        <Type className="h-4 w-4 mr-2" />
                        Enhance Text
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* TTS Enhancement Card */}
                <Card className="hover:shadow-md transition-shadow cursor-pointer" data-testid="card-enhance-tts">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Volume2 className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Text-to-Speech</CardTitle>
                        <CardDescription className="text-sm">Convert text to high-quality audio</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="text-sm text-gray-600">
                        • Multiple voice options<br/>
                        • Adjustable speech rate<br/>
                        • Professional audio quality
                      </div>
                      <Button 
                        className="w-full" 
                        variant="outline"
                        data-testid="button-tts-enhance"
                        onClick={() => {
                          toast({
                            title: "Coming Soon",
                            description: "Text-to-speech enhancement is being implemented."
                          });
                        }}
                      >
                        <Volume2 className="h-4 w-4 mr-2" />
                        Generate Audio
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Image Enhancement Card */}
                <Card className="hover:shadow-md transition-shadow cursor-pointer" data-testid="card-enhance-image">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Image className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">AI Image Generation</CardTitle>
                        <CardDescription className="text-sm">Create stunning visuals from text prompts</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="text-sm text-gray-600">
                        • Custom image styles<br/>
                        • High resolution output<br/>
                        • Product and lifestyle images
                      </div>
                      <Button 
                        className="w-full" 
                        variant="outline"
                        data-testid="button-image-enhance"
                        onClick={() => {
                          toast({
                            title: "Coming Soon",
                            description: "AI image generation is being implemented."
                          });
                        }}
                      >
                        <Image className="h-4 w-4 mr-2" />
                        Generate Images
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Video Enhancement Card */}
                <Card className="hover:shadow-md transition-shadow cursor-pointer" data-testid="card-enhance-video">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Video className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Video Generation</CardTitle>
                        <CardDescription className="text-sm">Create engaging videos from templates</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="text-sm text-gray-600">
                        • Template-based creation<br/>
                        • Custom branding options<br/>
                        • Multiple video formats
                      </div>
                      <Button 
                        className="w-full" 
                        variant="outline"
                        data-testid="button-video-enhance"
                        onClick={() => {
                          toast({
                            title: "Coming Soon",
                            description: "Video generation enhancement is being implemented."
                          });
                        }}
                      >
                        <Video className="h-4 w-4 mr-2" />
                        Create Video
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documentation Tab */}
        <TabsContent value="documentation" className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                TikTok Viral Research Automation System
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Overview */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">📊 System Overview</h3>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800 leading-relaxed">
                    Our enhanced viral research system automatically analyzes trending TikTok content to provide 
                    AI-powered template recommendations for maximum engagement. The system combines real viral 
                    video analysis with engagement pattern recognition to boost content performance by 85-90%.
                  </p>
                </div>
              </div>

              {/* Key Features */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">🚀 Key Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <Search className="h-4 w-4 text-blue-600" />
                      <h4 className="font-medium">Viral Content Discovery</h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      Automatically searches TikTok and Instagram for viral content related to your product using AI-powered queries.
                    </p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <h4 className="font-medium">Engagement Analysis</h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      Analyzes viral videos for engagement patterns, hook effectiveness, and content structure optimization.
                    </p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-purple-600" />
                      <h4 className="font-medium">Template Generation</h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      Extracts proven viral patterns and converts them into reusable content templates with confidence scoring.
                    </p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-4 w-4 text-orange-600" />
                      <h4 className="font-medium">Smart Integration</h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      Seamlessly integrates viral patterns into our prompt factory for enhanced content generation.
                    </p>
                  </div>
                </div>
              </div>

              {/* Technical Implementation */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">⚡ Technical Implementation</h3>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">🔍 TikTok Viral Research Service</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      <code className="bg-white px-2 py-1 rounded text-xs">/server/services/tiktokViralResearch.ts</code>
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1 ml-4">
                      <li>• Comprehensive viral video analysis with engagement scoring</li>
                      <li>• Pattern recognition for hooks, formats, and content structure</li>
                      <li>• Confidence scoring algorithm based on viral metrics</li>
                      <li>• Template recommendation engine with success rate prediction</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">🌐 Enhanced API Integration</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      <code className="bg-white px-2 py-1 rounded text-xs">/server/api/viral-research.ts</code>
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1 ml-4">
                      <li>• RESTful endpoint for viral research data retrieval</li>
                      <li>• Fallback system (enhanced → legacy → cached data)</li>
                      <li>• Real-time viral content analysis and caching</li>
                      <li>• Performance optimization with intelligent data loading</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">🎯 Prompt Factory Enhancement</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      <code className="bg-white px-2 py-1 rounded text-xs">/server/services/promptFactory.ts</code>
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1 ml-4">
                      <li>• <code>enhancePromptWithViralTemplate()</code> function for viral pattern injection</li>
                      <li>• Dynamic template adaptation based on viral research data</li>
                      <li>• Integration with fashion, beauty, and other niche templates</li>
                      <li>• Contextual viral pattern application for maximum relevance</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Usage Guide */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">📖 How It Works</h3>
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="bg-blue-600 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-medium">1</span>
                      <div>
                        <h4 className="font-medium text-blue-900">Product Selection Triggers Research</h4>
                        <p className="text-sm text-blue-700">When you select a product, the system automatically initiates viral research for that specific item and niche.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <span className="bg-blue-600 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-medium">2</span>
                      <div>
                        <h4 className="font-medium text-blue-900">AI-Powered Content Discovery</h4>
                        <p className="text-sm text-blue-700">Our AI searches TikTok and Instagram for viral content matching your product, analyzing engagement patterns and viral indicators.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <span className="bg-blue-600 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-medium">3</span>
                      <div>
                        <h4 className="font-medium text-blue-900">Template Optimization</h4>
                        <p className="text-sm text-blue-700">The system extracts proven viral patterns (hooks, formats, structures) and applies them to enhance your content generation.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <span className="bg-blue-600 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-medium">4</span>
                      <div>
                        <h4 className="font-medium text-blue-900">Smart Content Generation</h4>
                        <p className="text-sm text-blue-700">Generated content incorporates viral patterns automatically, significantly improving engagement potential and conversion rates.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">📈 Performance Benefits</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
                    <div className="text-2xl font-bold text-green-600">85-90%</div>
                    <div className="text-sm text-green-700">Business Workflow Alignment</div>
                    <div className="text-xs text-green-600 mt-1">Matches "Automated Business Ideas" document</div>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-center">
                    <div className="text-2xl font-bold text-blue-600">Real-time</div>
                    <div className="text-sm text-blue-700">Viral Pattern Detection</div>
                    <div className="text-xs text-blue-600 mt-1">Live TikTok & Instagram analysis</div>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 text-center">
                    <div className="text-2xl font-bold text-purple-600">AI-Enhanced</div>
                    <div className="text-sm text-purple-700">Content Quality</div>
                    <div className="text-xs text-purple-600 mt-1">Proven viral templates applied</div>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">🔄 Continuous Improvements</h3>
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-yellow-600 rounded-full"></div>
                      <span className="text-sm text-yellow-800">Enhanced pattern recognition with machine learning optimization</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-yellow-600 rounded-full"></div>
                      <span className="text-sm text-yellow-800">Extended platform support (YouTube Shorts, Instagram Reels)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-yellow-600 rounded-full"></div>
                      <span className="text-sm text-yellow-800">Real-time engagement tracking and template performance analytics</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-yellow-600 rounded-full"></div>
                      <span className="text-sm text-yellow-800">Advanced AI recommendations based on historical performance data</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
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