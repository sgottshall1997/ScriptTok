import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Zap, 
  TrendingUp, 
  Target, 
  Clock, 
  CheckCircle,

  Sparkles,
  Users,
  BarChart3,
  Globe,
  DollarSign,
  Eye,
  ShoppingCart,
  Plus,
  RefreshCw,
  RotateCcw,
  X,
  Lightbulb
} from 'lucide-react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import ScheduleDailyBulkToggle from './ScheduleDailyBulkToggle';

const AVAILABLE_NICHES = [
  { id: 'beauty', name: 'Beauty & Personal Care', color: 'bg-pink-100 text-pink-800' },
  { id: 'fitness', name: 'Fitness & Wellness', color: 'bg-green-100 text-green-800' },
  { id: 'tech', name: 'Technology & Gadgets', color: 'bg-blue-100 text-blue-800' },
  { id: 'fashion', name: 'Fashion & Style', color: 'bg-purple-100 text-purple-800' },
  { id: 'food', name: 'Food & Nutrition', color: 'bg-orange-100 text-orange-800' },
  { id: 'travel', name: 'Travel & Adventure', color: 'bg-cyan-100 text-cyan-800' },
  { id: 'pets', name: 'Pet Care & Supplies', color: 'bg-yellow-100 text-yellow-800' },
];

const CONTENT_TONES = [
  'Friendly', 'Professional', 'Enthusiastic', 'Casual', 'Authoritative',
  'Playful', 'Inspirational', 'Educational', 'Trendy', 'Persuasive', 'Authentic'
];

// Templates will be fetched dynamically based on selected niches

const PLATFORMS = [
  { id: 'tiktok', name: 'TikTok', color: 'bg-black text-white' },
  { id: 'instagram', name: 'Instagram', color: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' },
  { id: 'youtube', name: 'YouTube', color: 'bg-red-600 text-white' },
  { id: 'twitter', name: 'Twitter', color: 'bg-blue-500 text-white' },
  { id: 'other', name: 'Other', color: 'bg-gray-600 text-white' },
];

const AI_MODELS = [
  { id: 'chatgpt', name: 'ChatGPT', color: 'bg-emerald-600 text-white' },
  { id: 'claude', name: 'Claude', color: 'bg-orange-600 text-white' },
];

const CONTENT_FORMATS = [
  { id: 'regular', name: 'Regular Format', color: 'bg-blue-600 text-white' },
  { id: 'spartan', name: 'Spartan Format', color: 'bg-gray-700 text-white' },
];

interface AutomatedBulkGeneratorProps {
  onJobCreated?: (jobData: any) => void;
  autoPopulateData?: {
    product?: string;
    niche?: string;
    autopopulate?: boolean;
  };
}

export default function AutomatedBulkGenerator({ onJobCreated, autoPopulateData }: AutomatedBulkGeneratorProps) {
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);
  const [selectedTones, setSelectedTones] = useState<string[]>([]);
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedAiModels, setSelectedAiModels] = useState<string[]>(['claude']); // 🚀 CLAUDE-FIRST: Superior AI quality for automated bulk generation
  const [selectedContentFormats, setSelectedContentFormats] = useState<string[]>(['spartan']); // 🏛️ SPARTAN DEFAULT: Clean, professional format
  const [useExistingProducts, setUseExistingProducts] = useState(true);
  const [generateAffiliateLinks, setGenerateAffiliateLinks] = useState(false);
  const [affiliateId, setAffiliateId] = useState('sgottshall107-20');
  const [useManualAffiliateLinks, setUseManualAffiliateLinks] = useState(false);
  const [manualAffiliateLinks, setManualAffiliateLinks] = useState<Record<string, string>>({});
  const [previewProducts, setPreviewProducts] = useState<Record<string, any>>({});
  const [showPreview, setShowPreview] = useState(false);
  const [scheduleAfterGeneration, setScheduleAfterGeneration] = useState(false);
  const [makeWebhookUrl, setMakeWebhookUrl] = useState('');
  const [topRatedStyleUsed, setTopRatedStyleUsed] = useState(false);
  const [useSpartanFormat, setUseSpartanFormat] = useState(true);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Handle auto-population from URL parameters
  useEffect(() => {
    if (autoPopulateData?.autopopulate && autoPopulateData.product && autoPopulateData.niche) {
      console.log('🔄 Auto-populating with:', autoPopulateData);
      
      // Auto-select the niche
      setSelectedNiches(prev => {
        if (!prev.includes(autoPopulateData.niche!)) {
          console.log('✅ Auto-selecting niche:', autoPopulateData.niche);
          return [autoPopulateData.niche!, ...prev];
        }
        return prev;
      });
      
      // Auto-add the product to preview products
      const productData = {
        id: Date.now(), // Temporary ID
        title: autoPopulateData.product!,
        niche: autoPopulateData.niche!,
        source: 'trending',
        mentions: 0,
        createdAt: new Date().toISOString()
      };
      
      setPreviewProducts(prev => {
        console.log('✅ Auto-adding product to preview:', productData);
        return {
          ...prev,
          [autoPopulateData.niche!]: productData
        };
      });
      
      // Enable preview mode to show the selected product
      setShowPreview(true);
      console.log('✅ Auto-population complete - preview enabled');
    }
  }, [autoPopulateData?.autopopulate, autoPopulateData?.product, autoPopulateData?.niche]);

  // Fetch trending products for preview
  const { data: trendingProducts } = useQuery({
    queryKey: ['/api/trending/products'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch templates for all selected niches combined
  const { data: allTemplatesData, isLoading: templatesLoading } = useQuery({
    queryKey: ['/api/templates/all-niches', selectedNiches],
    queryFn: async () => {
      if (selectedNiches.length === 0) return { templates: [] };
      
      // Fetch templates for all selected niches and combine them
      const templatePromises = selectedNiches.map(async (niche) => {
        const response = await fetch(`/api/templates?niche=${niche}`);
        if (!response.ok) throw new Error(`Failed to fetch templates for ${niche}`);
        const data = await response.json();
        return data.templates || [];
      });
      
      const allTemplateArrays = await Promise.all(templatePromises);
      const allTemplates = allTemplateArrays.flat();
      
      // Remove duplicates based on template id
      const uniqueTemplates = allTemplates.filter((template, index, self) => 
        index === self.findIndex(t => t.id === template.id)
      );
      
      return { templates: uniqueTemplates };
    },
    staleTime: 300000, // 5 minutes
    enabled: selectedNiches.length > 0,
  });

  const availableTemplates = allTemplatesData?.templates || [];

  // Preview products for selected niches (matches backend selection logic)
  const previewProductsForNiches = () => {
    if (!trendingProducts) return;
    
    const productsByNiche: Record<string, any> = {};
    
    selectedNiches.forEach(niche => {
      const nicheProducts = trendingProducts.filter((product: any) => product.niche === niche);
      if (nicheProducts.length > 0) {
        // Sort by creation date (newest first) to match backend selection logic
        const sortedProducts = nicheProducts.sort((a: any, b: any) => {
          const dateA = new Date(a.createdAt || '1970-01-01').getTime();
          const dateB = new Date(b.createdAt || '1970-01-01').getTime();
          return dateB - dateA; // Newest first
        });
        productsByNiche[niche] = sortedProducts[0];
        
        // Debug logging to see what's being selected
        console.log(`🔍 Preview selected for ${niche}:`, sortedProducts[0].title, 'Created:', sortedProducts[0].createdAt);
        console.log(`🔍 Preview product object for ${niche}:`, JSON.stringify(sortedProducts[0], null, 2));
      }
    });
    
    setPreviewProducts(productsByNiche);
    setShowPreview(true);
    
    console.log('🔍 Final preview products state:', JSON.stringify(productsByNiche, null, 2));
  };

  const startAutomatedBulkMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/automated-bulk/start', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-generation-source': 'automated_generator'
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start automated bulk generation');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "🚀 Automated Bulk Generation Started!",
        description: `${data.totalSelectedProducts} products auto-selected across ${data.selectedNiches?.length} niches. Generating ${data.totalVariations} content variations.`,
      });
      
      if (onJobCreated) {
        onJobCreated(data);
      }
      
      // Invalidate queries to refresh job list
      queryClient.invalidateQueries({ queryKey: ['/api/bulk/jobs'] });
    },
    onError: (error: any) => {
      toast({
        title: "❌ Generation Failed",
        description: error.message || "Failed to start automated bulk generation",
        variant: "destructive",
      });
    },
  });

  const handleNicheToggle = (nicheId: string) => {
    setSelectedNiches(prev => 
      prev.includes(nicheId) 
        ? prev.filter(id => id !== nicheId)
        : [...prev, nicheId]
    );
  };

  const handleToneToggle = (tone: string) => {
    setSelectedTones(prev => 
      prev.includes(tone) 
        ? prev.filter(t => t !== tone)
        : [...prev, tone]
    );
  };

  const handleTemplateToggle = (template: string) => {
    setSelectedTemplates(prev => 
      prev.includes(template) 
        ? prev.filter(t => t !== template)
        : [...prev, template]
    );
  };

  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const handleAiModelToggle = (modelId: string) => {
    setSelectedAiModels(prev => 
      prev.includes(modelId) 
        ? prev.filter(id => id !== modelId)
        : [...prev, modelId]
    );
  };

  const handleContentFormatToggle = (formatId: string) => {
    setSelectedContentFormats(prev => 
      prev.includes(formatId) 
        ? prev.filter(id => id !== formatId)
        : [...prev, formatId]
    );
  };

  const calculateTotalVariations = () => {
    return selectedNiches.length * selectedTones.length * selectedTemplates.length * selectedAiModels.length * selectedContentFormats.length;
  };

  const startAutomatedGeneration = () => {
    if (selectedNiches.length === 0) {
      toast({
        title: "❌ No Niches Selected",
        description: "Please select at least one niche for content generation",
        variant: "destructive",
      });
      return;
    }

    if (selectedTones.length === 0 || selectedTemplates.length === 0 || selectedPlatforms.length === 0 || selectedAiModels.length === 0 || selectedContentFormats.length === 0) {
      toast({
        title: "❌ Incomplete Selection",
        description: "Please select at least one tone, template, platform, AI model, and content format",
        variant: "destructive",
      });
      return;
    }

    const bulkData = {
      selectedNiches,
      tones: selectedTones,
      templates: selectedTemplates,
      platforms: selectedPlatforms,
      aiModels: selectedAiModels,
      contentFormats: selectedContentFormats,
      useExistingProducts,
      generateAffiliateLinks,
      affiliateId: generateAffiliateLinks && !useManualAffiliateLinks ? affiliateId : undefined,
      useManualAffiliateLinks,
      manualAffiliateLinks: useManualAffiliateLinks ? manualAffiliateLinks : undefined,
      scheduleAfterGeneration,
      makeWebhookUrl: 'https://hook.us2.make.com/rkemtdx2hmy4tpd0to9bht6dg23s8wjw',
      topRatedStyleUsed,
      useSpartanFormat,
      userId: 1, // Demo user ID for rating system
      previewedProducts: Object.keys(previewProducts).length > 0 ? previewProducts : undefined,
    };

    console.log('🔍 DEBUG: Frontend sending bulkData with previewedProducts:', bulkData.previewedProducts ? 'YES' : 'NO');
    console.log('🔍 DEBUG: showPreview state:', showPreview);
    console.log('🔍 DEBUG: previewProducts keys count:', Object.keys(previewProducts).length);
    if (bulkData.previewedProducts) {
      console.log('🔍 DEBUG: Frontend previewedProducts content:', JSON.stringify(bulkData.previewedProducts, null, 2));
    } else {
      console.log('🔍 DEBUG: No previewedProducts sent - will use backend auto-selection');
    }

    startAutomatedBulkMutation.mutate(bulkData);
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg">
            <Zap className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Automated Bulk Generator
            </CardTitle>
            <CardDescription className="text-base">
              Auto-select trending products and generate viral content across multiple niches simultaneously
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Product Selection Options */}
        <Card className="border-dashed border-2 border-blue-200 bg-blue-50">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-blue-800">Use Existing Trending Products</h3>
                  <p className="text-sm text-blue-600">Select products from your trending products database (recommended)</p>
                </div>
              </div>
              <Switch
                checked={useExistingProducts}
                onCheckedChange={setUseExistingProducts}
              />
            </div>
            
            {/* Affiliate Links Section */}
            <div className="flex items-center justify-between pt-2 border-t border-blue-200">
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-800">Generate Amazon Affiliate Links</h3>
                  <p className="text-sm text-green-600">Automatically add affiliate links for monetization</p>
                </div>
              </div>
              <Switch
                checked={generateAffiliateLinks}
                onCheckedChange={setGenerateAffiliateLinks}
              />
            </div>
            
            {generateAffiliateLinks && (
              <div className="mt-3 space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-green-700">
                    Affiliate Link Method
                  </Label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-green-600">Auto-generate</span>
                    <Switch
                      checked={useManualAffiliateLinks}
                      onCheckedChange={setUseManualAffiliateLinks}
                    />
                    <span className="text-xs text-green-600">Manual entry</span>
                  </div>
                </div>
                
                {!useManualAffiliateLinks ? (
                  <div>
                    <Label htmlFor="affiliateId" className="text-sm font-medium text-green-700">
                      Amazon Affiliate ID
                    </Label>
                    <Input
                      id="affiliateId"
                      value={affiliateId}
                      onChange={(e) => setAffiliateId(e.target.value)}
                      placeholder="your-affiliate-id"
                      className="mt-1 border-green-300 focus:border-green-500"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-green-700">
                      Manual Affiliate Links by Niche
                    </Label>
                    <div className="grid grid-cols-1 gap-2">
                      {selectedNiches.map(niche => (
                        <div key={niche} className="flex items-center gap-2">
                          <Badge variant="outline" className="min-w-[80px] justify-center">
                            {niche}
                          </Badge>
                          <Input
                            placeholder="https://amazon.com/product-link?tag=your-id"
                            value={manualAffiliateLinks[niche] || ''}
                            onChange={(e) => setManualAffiliateLinks(prev => ({
                              ...prev,
                              [niche]: e.target.value
                            }))}
                            className="text-xs border-green-300 focus:border-green-500"
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-green-600">
                      Enter specific Amazon affiliate links for each selected niche
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Niche Selection */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-600" />
            <h3 className="font-semibold">Select Niches ({selectedNiches.length}/7)</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedNiches(selectedNiches.length === AVAILABLE_NICHES.length ? [] : AVAILABLE_NICHES.map(n => n.id))}
            >
              {selectedNiches.length === AVAILABLE_NICHES.length ? 'Deselect All' : 'Select All'}
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {AVAILABLE_NICHES.map((niche) => (
              <div key={niche.id} className="flex items-center space-x-2">
                <Checkbox
                  id={niche.id}
                  checked={selectedNiches.includes(niche.id)}
                  onCheckedChange={() => handleNicheToggle(niche.id)}
                />
                <Label htmlFor={niche.id} className="text-sm font-medium cursor-pointer">
                  <Badge variant="secondary" className={niche.color}>
                    {niche.name}
                  </Badge>
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Preview Products Button */}
        <div className="flex justify-center">
          <Button 
            onClick={previewProductsForNiches}
            disabled={selectedNiches.length === 0 || !trendingProducts}
            variant="outline"
            size="lg"
            className="w-full md:w-auto border-blue-300 text-blue-700 hover:bg-blue-50"
          >
            <Eye className="mr-2 h-5 w-5" />
            Preview Selected Products ({selectedNiches.length} niches)
          </Button>
        </div>

        {/* Products Preview with Customization */}
        {showPreview && Object.keys(previewProducts).length > 0 && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-blue-600" />
                  <h4 className="font-semibold text-blue-800">Products to be Generated</h4>
                  <Badge variant="outline" className="text-xs">
                    {Object.keys(previewProducts).length} products
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Add new product functionality
                      const newNiche = selectedNiches.find(niche => !previewProducts[niche]);
                      if (newNiche && trendingProducts && trendingProducts[newNiche]?.length > 0) {
                        setPreviewProducts(prev => ({
                          ...prev,
                          [newNiche]: trendingProducts[newNiche][0]
                        }));
                      }
                    }}
                    disabled={Object.keys(previewProducts).length >= selectedNiches.length}
                    className="text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Product
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => previewProductsForNiches()}
                    className="text-xs"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Refresh All
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                {Object.entries(previewProducts).map(([niche, product]) => (
                  <div key={niche} className="p-3 bg-white rounded-lg border border-blue-200">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs bg-blue-100">
                            {niche}
                          </Badge>
                          <div className="text-xs text-gray-500">
                            {product.mentions?.toLocaleString()} mentions
                          </div>
                        </div>
                        
                        {/* Editable Product Name */}
                        <div className="space-y-1">
                          <input
                            type="text"
                            value={product.title}
                            onChange={(e) => setPreviewProducts(prev => ({
                              ...prev,
                              [niche]: { ...product, title: e.target.value }
                            }))}
                            className="w-full text-sm font-medium bg-transparent border-0 border-b border-blue-200 focus:border-blue-400 focus:outline-none p-1"
                            placeholder="Edit product name..."
                          />
                          <p className="text-xs text-gray-500">Click to edit product name</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // Switch to next product in this niche
                            if (trendingProducts && trendingProducts[niche]) {
                              const currentIndex = trendingProducts[niche].findIndex(p => p.title === product.title);
                              const nextIndex = (currentIndex + 1) % trendingProducts[niche].length;
                              setPreviewProducts(prev => ({
                                ...prev,
                                [niche]: trendingProducts[niche][nextIndex]
                              }));
                            }
                          }}
                          className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-100"
                          title="Switch to next product"
                        >
                          <RotateCcw className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newProducts = { ...previewProducts };
                            delete newProducts[niche];
                            setPreviewProducts(newProducts);
                          }}
                          className="h-8 w-8 p-0 text-red-500 hover:bg-red-100"
                          title="Remove product"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Add Product from Available Niches */}
                {selectedNiches.filter(niche => !previewProducts[niche]).length > 0 && (
                  <div className="p-3 border-2 border-dashed border-blue-300 rounded-lg bg-blue-25">
                    <div className="text-center space-y-2">
                      <p className="text-sm text-blue-600 font-medium">Add more products from selected niches</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {selectedNiches
                          .filter(niche => !previewProducts[niche])
                          .map(niche => (
                            <Button
                              key={niche}
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (trendingProducts && trendingProducts[niche]?.length > 0) {
                                  setPreviewProducts(prev => ({
                                    ...prev,
                                    [niche]: trendingProducts[niche][0]
                                  }));
                                }
                              }}
                              className="text-xs border-blue-300 text-blue-700 hover:bg-blue-50"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              {niche}
                            </Button>
                          ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Product Customization Tips</span>
                </div>
                <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                  <li>Click product names to edit them for better content generation</li>
                  <li>Use the refresh button to switch to different trending products</li>
                  <li>Remove products you don't want to include in the generation</li>
                  <li>Add products from remaining selected niches using the "+" buttons</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        <Separator />

        {/* Content Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tones */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold">Content Tones ({selectedTones.length})</h3>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {CONTENT_TONES.map((tone) => (
                <div key={tone} className="flex items-center space-x-2">
                  <Checkbox
                    id={`tone-${tone}`}
                    checked={selectedTones.includes(tone)}
                    onCheckedChange={() => handleToneToggle(tone)}
                  />
                  <Label htmlFor={`tone-${tone}`} className="text-sm cursor-pointer">
                    {tone}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Templates */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold">Content Templates ({selectedTemplates.length})</h3>
              {templatesLoading && <span className="text-sm text-gray-500">(Loading...)</span>}
            </div>
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
              {templatesLoading ? (
                <div className="text-center text-gray-500 py-4 text-sm">Loading templates...</div>
              ) : availableTemplates.length > 0 ? (
                availableTemplates.map((template: any) => (
                  <div key={template.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`template-${template.id}`}
                      checked={selectedTemplates.includes(template.id)}
                      onCheckedChange={() => handleTemplateToggle(template.id)}
                    />
                    <Label htmlFor={`template-${template.id}`} className="text-sm cursor-pointer">
                      <div className="flex items-center gap-2">
                        <span>{template.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {template.category}
                        </Badge>
                      </div>
                    </Label>
                  </div>
                ))
              ) : selectedNiches.length === 0 ? (
                <div className="text-center text-gray-500 py-4 text-sm">Select niches to see available templates</div>
              ) : (
                <div className="text-center text-gray-500 py-4 text-sm">No templates available for selected niches</div>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* Platform Selection */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-indigo-600" />
            <h3 className="font-semibold">Target Platforms ({selectedPlatforms.length})</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {PLATFORMS.map((platform) => (
              <div key={platform.id} className="flex items-center space-x-2">
                <Checkbox
                  id={platform.id}
                  checked={selectedPlatforms.includes(platform.id)}
                  onCheckedChange={() => handlePlatformToggle(platform.id)}
                />
                <Label htmlFor={platform.id} className="cursor-pointer">
                  <Badge className={platform.color}>
                    {platform.name}
                  </Badge>
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* AI Model Selection */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-600" />
            <h3 className="font-semibold">AI Models ({selectedAiModels.length})</h3>
            <span className="text-sm text-gray-500">Select multiple models to generate content with each</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {AI_MODELS.map((model) => (
              <div key={model.id} className="flex items-center space-x-2">
                <Checkbox
                  id={model.id}
                  checked={selectedAiModels.includes(model.id)}
                  onCheckedChange={() => handleAiModelToggle(model.id)}
                />
                <Label htmlFor={model.id} className="cursor-pointer">
                  <Badge className={model.color}>
                    {model.name}
                  </Badge>
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Content Format Selection */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            <h3 className="font-semibold">Content Formats ({selectedContentFormats.length})</h3>
            <span className="text-sm text-gray-500">Select formats to generate different content styles</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {CONTENT_FORMATS.map((format) => (
              <div key={format.id} className="flex items-center space-x-2">
                <Checkbox
                  id={format.id}
                  checked={selectedContentFormats.includes(format.id)}
                  onCheckedChange={() => handleContentFormatToggle(format.id)}
                />
                <Label htmlFor={format.id} className="cursor-pointer">
                  <Badge className={format.color}>
                    {format.name}
                  </Badge>
                </Label>
              </div>
            ))}
          </div>
          
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            <div className="font-medium mb-1">Format Descriptions:</div>
            <div className="space-y-1">
              <div><span className="font-medium">Regular Format:</span> Full-featured content with emojis, engaging language, and creative elements</div>
              <div><span className="font-medium">Spartan Format:</span> Clean, professional content with direct language and no fluff words</div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Smart Style Enhancement */}
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Lightbulb className="h-5 w-5 text-purple-600" />
              <h3 className="font-semibold text-gray-800">Smart Style Enhancement</h3>
            </div>
            
            <div className="flex items-center space-x-3">
              <Switch
                id="use-smart-style"
                checked={topRatedStyleUsed}
                onCheckedChange={setTopRatedStyleUsed}
              />
              <Label htmlFor="use-smart-style" className="text-sm cursor-pointer">
                <span className="font-medium">Use My Best-Rated Style</span>
                <p className="text-xs text-gray-500 mt-1">Apply patterns from your highest-rated content (69+ rating) for improved engagement</p>
              </Label>
            </div>
            
            {topRatedStyleUsed && (
              <div className="mt-3 p-3 bg-white rounded-lg border border-purple-200">
                <p className="text-xs text-purple-700">
                  <strong>Active:</strong> The system will analyze your top-performing content and apply successful patterns to new generations, including tone, structure, and engagement strategies.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Generation Summary */}
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className="h-5 w-5 text-yellow-600" />
              <h3 className="font-semibold text-gray-800">Generation Summary</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-purple-600">{selectedNiches.length}</p>
                <p className="text-sm text-gray-600">Niches</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{selectedNiches.length}</p>
                <p className="text-sm text-gray-600">Auto-Selected Products</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{selectedTones.length * selectedTemplates.length * selectedAiModels.length * selectedContentFormats.length}</p>
                <p className="text-sm text-gray-600">Variations per Product</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">{calculateTotalVariations()}</p>
                <p className="text-sm text-gray-600">Total Content Pieces</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Webhook Configuration */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Globe className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-gray-800">Webhook Integration</h3>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="webhook-url" className="text-sm font-medium">Make.com Webhook URL (Optional)</Label>
              <Input
                id="webhook-url"
                type="url"
                placeholder="https://hook.make.com/..."
                value={makeWebhookUrl}
                onChange={(e) => setMakeWebhookUrl(e.target.value)}
                className="bg-white border-blue-300 focus:border-blue-500"
              />
              <p className="text-xs text-blue-600">
                Add your Make.com webhook URL to automatically send generated content to your automation workflows
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Start Generation Button */}
        <div className="flex justify-center pt-4">
          <Button
            onClick={startAutomatedGeneration}
            disabled={startAutomatedBulkMutation.isPending || selectedNiches.length === 0}
            size="lg"
            className="w-full md:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {startAutomatedBulkMutation.isPending ? (
              <>
                <Clock className="mr-2 h-5 w-5 animate-spin" />
                Starting Automated Generation...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-5 w-5" />
                Start Bulk Generation ({calculateTotalVariations()} pieces)
              </>
            )}
          </Button>
        </div>

        {/* Schedule Daily Generation */}
        <Separator />
        <ScheduleDailyBulkToggle 
          formData={{
            selectedNiches,
            tones: selectedTones,
            templates: selectedTemplates,
            platforms: selectedPlatforms,
            useExistingProducts,
            generateAffiliateLinks,
            useSpartanFormat,
            topRatedStyleUsed,
            affiliateId: affiliateId || 'sgottshall107-20'
          }}
          isVisible={!startAutomatedBulkMutation.isPending}
        />

        {/* How It Works */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              How Automated Bulk Generation Works
            </h3>
            <div className="space-y-2 text-sm text-blue-700">
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                <span><strong>Auto-Select Products:</strong> Fetch 1 trending product per selected niche using Perplexity AI</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                <span><strong>Viral Inspiration:</strong> Query "What's going viral about [product]" on social platforms</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                <span><strong>Content Generation:</strong> Create product descriptions, viral hooks, scripts, and captions</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                <span><strong>Platform Optimization:</strong> Format content for TikTok, Instagram, YouTube, and Twitter</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold">5</span>
                <span><strong>Save & Track:</strong> Store all content in history with affiliate links and analytics</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}