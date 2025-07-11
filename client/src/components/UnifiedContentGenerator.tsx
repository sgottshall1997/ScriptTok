import React, { useState, useEffect } from 'react';
import { trackEvent } from '@/lib/analytics';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Zap, Layers, CheckCircle, Clock, XCircle, TrendingUp, Package, PlayCircle, Sparkles } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import GeneratedContentCard from './GeneratedContentCard';
import BulkGenerationForm from './BulkGenerationForm';
import AutomatedBulkGenerator from './AutomatedBulkGenerator';
import BulkJobsList from './BulkJobsList';
import AutomatedBulkJobsList from './AutomatedBulkJobsList';
import { ComplianceWrapper } from './ComplianceWrapper';
import { FTCCompliantContentGenerator } from './FTCCompliantContentGenerator';
import WebhookDebugPanel from './WebhookDebugPanel';

// Single Product Generator Component (like original Content Generator but simpler)
const SingleProductGenerator: React.FC<{ onContentGenerated: (results: any[]) => void }> = ({ onContentGenerated }) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [viralInspo, setViralInspo] = useState<any>(null);
  const [viralInspoLoading, setViralInspoLoading] = useState(false);
  const [formData, setFormData] = useState({
    productName: '',
    niche: 'beauty',
    tone: 'Enthusiastic',
    template: 'Short-Form Video Script',
    platforms: ['tiktok', 'instagram'],
    useSmartStyle: false,
    useSpartanFormat: true,
    generateAffiliateLinks: false,
    affiliateId: 'sgottshall107-20',
    useManualAffiliateLink: false,
    manualAffiliateLink: '',
    sendToMakeWebhook: true,
    aiModel: 'claude' as 'chatgpt' | 'claude'
  });

  // Handle URL parameters for auto-population
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const productParam = urlParams.get('product');
    const nicheParam = urlParams.get('niche');
    
    if (productParam || nicheParam) {
      setFormData(prev => ({
        ...prev,
        ...(productParam && { 
          productName: (() => {
            try {
              return decodeURIComponent(productParam);
            } catch (error) {
              console.warn('Failed to decode product parameter:', error);
              return productParam; // Use original parameter if decoding fails
            }
          })()
        }),
        ...(nicheParam && { niche: nicheParam })
      }));
    }
  }, []);

  // Fetch viral inspiration for the product
  const fetchViralInspiration = async (productName: string, niche: string) => {
    if (!productName.trim()) {
      setViralInspo(null);
      setViralInspoLoading(false);
      return;
    }

    setViralInspoLoading(true);
    
    try {
      const response = await fetch('/api/perplexity-trends/viral-inspiration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: productName, niche: niche })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.inspiration) {
          setViralInspo(data.inspiration);
        } else {
          setViralInspo(null);
        }
      } else {
        setViralInspo(null);
      }
    } catch (error) {
      console.error('Error fetching viral inspiration:', error);
      setViralInspo(null);
    } finally {
      setViralInspoLoading(false);
    }
  };

  // Watch for product name and niche changes to fetch viral inspiration
  useEffect(() => {
    if (formData.productName && formData.niche) {
      fetchViralInspiration(formData.productName, formData.niche);
    } else {
      setViralInspo(null);
    }
  }, [formData.productName, formData.niche]);

  const NICHES = ['beauty', 'tech', 'fitness', 'fashion', 'food', 'travel', 'pets'];
  const TONES = ['Enthusiastic', 'Professional', 'Friendly', 'Educational', 'Humorous', 'Inspiring', 'Urgent', 'Casual', 'Authoritative', 'Empathetic', 'Trendy'];
  const PLATFORMS = [
    { id: 'tiktok', name: 'TikTok' },
    { id: 'instagram', name: 'Instagram' },
    { id: 'youtube', name: 'YouTube' },
    { id: 'twitter', name: 'X (Twitter)' },
    { id: 'other', name: 'Other' }
  ];

  // Fetch available AI models
  const { data: availableModels } = useQuery({
    queryKey: ['available-models'],
    queryFn: async () => {
      const response = await fetch('/api/ai-models/available');
      if (!response.ok) return [];
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch templates for selected niche
  // Check Spartan availability for selected niche
  const { data: spartanAvailability } = useQuery({
    queryKey: ['spartan-availability', formData.niche, formData.useSpartanFormat],
    queryFn: async () => {
      const response = await fetch(`/api/spartan/availability?niche=${formData.niche}&manualMode=${formData.useSpartanFormat}`);
      if (!response.ok) return null;
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: templatesData, isLoading: templatesLoading } = useQuery({
    queryKey: ['/api/templates', formData.niche],
    queryFn: async () => {
      const response = await fetch(`/api/templates?niche=${formData.niche}`);
      if (!response.ok) throw new Error('Failed to fetch templates');
      return response.json();
    },
    staleTime: 300000, // 5 minutes
  });

  const availableTemplates = templatesData?.templates || [];
  
  // Auto-select first template when niche changes
  useEffect(() => {
    if (availableTemplates.length > 0 && !availableTemplates.some((t: any) => t.name === formData.template)) {
      setFormData(prev => ({ ...prev, template: availableTemplates[0].name }));
    }
  }, [availableTemplates, formData.template]);

  const generateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/generate-unified', data);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        const results = Array.isArray(data.data.results) ? data.data.results : [data.data.results];
        onContentGenerated(results);
        
        // Track analytics
        try {
          trackEvent('content_generated', 'content', `${formData.niche}_${formData.template}`, 1);
          trackEvent('platform_selection', 'content', formData.platforms.join(','), formData.platforms.length);
        } catch (error) {
          console.warn('Analytics tracking failed:', error);
        }
        
        toast({
          title: "Content generated successfully",
          description: "Single product content created",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate content",
        variant: "destructive",
      });
    },
    onSettled: () => setIsGenerating(false)
  });

  const handleGenerate = () => {
    if (!formData.productName.trim()) {
      toast({
        title: "Product name required",
        description: "Please enter a product name",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    const requestData = {
      mode: 'manual',
      productName: formData.productName,
      niche: formData.niche,
      template: formData.template,
      tone: formData.tone,
      platforms: formData.platforms,
      contentType: 'video',
      affiliateUrl: formData.generateAffiliateLinks && !formData.useManualAffiliateLink 
        ? `https://www.amazon.com/s?k=${encodeURIComponent(formData.productName)}&tag=${formData.affiliateId}` 
        : formData.useManualAffiliateLink ? formData.manualAffiliateLink : undefined,
      useSmartStyle: formData.useSmartStyle,
      useSpartanFormat: formData.useSpartanFormat,
      aiModel: formData.aiModel,
      makeWebhookUrl: 'https://hook.us2.make.com/rkemtdx2hmy4tpd0to9bht6dg23s8wjw'
    };

    generateMutation.mutate(requestData);
  };

  const togglePlatform = (platformId: string) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platformId) 
        ? prev.platforms.filter(p => p !== platformId)
        : [...prev.platforms, platformId]
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Single Product Generator
        </CardTitle>
        <CardDescription>Generate content for one product with your selected tone and template</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Product Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Product Name</label>
            <input
              type="text"
              value={formData.productName}
              onChange={(e) => setFormData(prev => ({...prev, productName: e.target.value}))}
              className="w-full p-3 border rounded-lg"
              placeholder="Enter product name..."
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Niche</label>
            <select
              value={formData.niche}
              onChange={(e) => setFormData(prev => ({...prev, niche: e.target.value}))}
              className="w-full p-3 border rounded-lg"
            >
              {NICHES.map(niche => (
                <option key={niche} value={niche}>
                  {niche.charAt(0).toUpperCase() + niche.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Content Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Tone</label>
            <select
              value={formData.tone}
              onChange={(e) => setFormData(prev => ({...prev, tone: e.target.value}))}
              className="w-full p-3 border rounded-lg"
              disabled={formData.useSpartanFormat && spartanAvailability?.spartanAvailable}
            >
              {TONES.map(tone => (
                <option key={tone} value={tone}>{tone}</option>
              ))}
            </select>
            {formData.useSpartanFormat && spartanAvailability?.spartanAvailable && (
              <p className="text-xs text-amber-600 mt-1">Tone overridden by Spartan format</p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Template</label>
            <select
              value={formData.template}
              onChange={(e) => setFormData(prev => ({...prev, template: e.target.value}))}
              className="w-full p-3 border rounded-lg"
              disabled={templatesLoading}
            >
              {templatesLoading ? (
                <option>Loading templates...</option>
              ) : availableTemplates.length > 0 ? (
                availableTemplates.map((template: any) => (
                  <option key={template.id} value={template.name}>{template.name}</option>
                ))
              ) : (
                <option>No templates available</option>
              )}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">AI Model</label>
            <select
              value={formData.aiModel}
              onChange={(e) => setFormData(prev => ({...prev, aiModel: e.target.value as 'chatgpt' | 'claude'}))}
              className="w-full p-3 border rounded-lg"
            >
              {availableModels && availableModels.length > 0 ? (
                availableModels.map((model: any) => (
                  <option key={model.id} value={model.id} disabled={!model.available}>
                    {model.name} {!model.available && '(Unavailable)'}
                  </option>
                ))
              ) : (
                <option value="chatgpt">ChatGPT (OpenAI)</option>
              )}
            </select>
            {availableModels && availableModels.find((m: any) => m.id === formData.aiModel) && (
              <p className="text-xs text-gray-600 mt-1">
                {availableModels.find((m: any) => m.id === formData.aiModel)?.config?.tooltip}
              </p>
            )}
          </div>
        </div>

        {/* Platform Selection */}
        <div>
          <label className="text-sm font-medium mb-3 block">Target Platforms</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {PLATFORMS.map(platform => (
              <label key={platform.id} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.platforms.includes(platform.id)}
                  onChange={() => togglePlatform(platform.id)}
                  className="rounded"
                />
                <span className="text-sm">{platform.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Advanced Options */}
        <div className="space-y-4 border-t pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Use Smart Style</p>
              <p className="text-sm text-gray-600">Learn from your highest-rated content</p>
            </div>
            <input
              type="checkbox"
              checked={formData.useSmartStyle}
              onChange={(e) => setFormData(prev => ({...prev, useSmartStyle: e.target.checked}))}
              className="rounded"
              disabled={formData.useSpartanFormat && spartanAvailability?.spartanAvailable}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Use Spartan Format</p>
              <p className="text-sm text-gray-600">Direct, no-fluff content (overrides tone)</p>
            </div>
            <input
              type="checkbox"
              checked={formData.useSpartanFormat}
              onChange={(e) => setFormData(prev => ({...prev, useSpartanFormat: e.target.checked}))}
              className="rounded"
            />
          </div>

          {/* Spartan Availability Status */}
          {spartanAvailability && (
            <div className={`p-3 rounded-lg text-sm ${
              spartanAvailability.spartanAvailable 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-amber-50 border border-amber-200 text-amber-800'
            }`}>
              <div className="flex items-center gap-2">
                <Badge variant={spartanAvailability.spartanAvailable ? "default" : "secondary"}>
                  {spartanAvailability.spartanAvailable ? "Spartan Available" : "Standard Mode"}
                </Badge>
                <span>{spartanAvailability.reason}</span>
              </div>
              {spartanAvailability.autoSpartanNiches.length > 0 && (
                <div className="mt-2 text-xs">
                  Auto-enabled for: {spartanAvailability.autoSpartanNiches.join(', ')}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Generate Affiliate Links</p>
              <p className="text-sm text-gray-600">Auto-generate Amazon affiliate links</p>
            </div>
            <input
              type="checkbox"
              checked={formData.generateAffiliateLinks}
              onChange={(e) => setFormData(prev => ({...prev, generateAffiliateLinks: e.target.checked}))}
              className="rounded"
            />
          </div>

          {formData.generateAffiliateLinks && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Affiliate Link Method</p>
                  <p className="text-xs text-gray-500">Choose between auto-generation or manual entry</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">Auto-generate</span>
                  <input
                    type="checkbox"
                    checked={formData.useManualAffiliateLink}
                    onChange={(e) => setFormData(prev => ({...prev, useManualAffiliateLink: e.target.checked}))}
                    className="rounded"
                  />
                  <span className="text-xs text-gray-600">Manual entry</span>
                </div>
              </div>
              
              {!formData.useManualAffiliateLink ? (
                <div>
                  <label className="text-sm font-medium mb-2 block">Amazon Affiliate ID</label>
                  <input
                    type="text"
                    value={formData.affiliateId}
                    onChange={(e) => setFormData(prev => ({...prev, affiliateId: e.target.value}))}
                    className="w-full p-3 border rounded-lg"
                    placeholder="your-affiliate-id"
                  />
                </div>
              ) : (
                <div>
                  <label className="text-sm font-medium mb-2 block">Manual Affiliate Link</label>
                  <input
                    type="text"
                    value={formData.manualAffiliateLink}
                    onChange={(e) => setFormData(prev => ({...prev, manualAffiliateLink: e.target.value}))}
                    className="w-full p-3 border rounded-lg"
                    placeholder="https://amazon.com/product-link?tag=your-id"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter your complete Amazon affiliate link for this specific product
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Viral Inspiration Preview */}
        {formData.productName && (viralInspoLoading || viralInspo) && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              {viralInspoLoading ? (
                <>
                  <Clock className="h-4 w-4 animate-spin text-orange-600" />
                  <h4 className="font-medium text-orange-700">Analyzing Viral Trends...</h4>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-orange-600" />
                  <h4 className="font-medium text-orange-700">Viral Inspiration Found</h4>
                </>
              )}
            </div>
            
            {viralInspoLoading ? (
              <p className="text-sm text-orange-600">Searching TikTok and Instagram for viral content patterns...</p>
            ) : viralInspo ? (
              <div className="space-y-2 text-sm">
                <div><strong className="text-orange-800">Hook:</strong> <span className="text-orange-900">{viralInspo.hook}</span></div>
                <div><strong className="text-orange-800">Format:</strong> <span className="text-orange-900">{viralInspo.format}</span></div>
                <div><strong className="text-orange-800">Caption:</strong> <span className="text-orange-900">{viralInspo.caption}</span></div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {viralInspo.hashtags?.map((tag: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs bg-orange-100 text-orange-800 border-orange-300">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || formData.platforms.length === 0}
          className="w-full h-12 text-lg"
        >
          {isGenerating ? (
            <>
              <Clock className="h-5 w-5 mr-2 animate-spin" />
              Generating Content...
            </>
          ) : (
            <>
              <PlayCircle className="h-5 w-5 mr-2" />
              Generate Content
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

const UnifiedContentGenerator: React.FC = () => {
  const [activeTab, setActiveTab] = useState('single');
  const [generationResults, setGenerationResults] = useState<any[]>([]);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch bulk jobs for stats (same as original bulk generator)
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
            <h1 className="text-3xl font-bold text-gray-900">Unified Content Generation</h1>
            <p className="text-gray-600">Generate single or multiple content variations automatically across tones and templates</p>
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
              <h3 className="font-semibold text-purple-900">Unified Generation Benefits</h3>
              <p className="text-sm text-purple-700">Create single pieces or dozens of content variations in minutes</p>
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="single" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Single
          </TabsTrigger>
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

        <TabsContent value="single" className="space-y-6">
          <SingleProductGenerator onContentGenerated={handleContentGenerated} />
        </TabsContent>

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