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
  ChefHat, 
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

const RECIPE_CUISINES = [
  { id: 'italian', name: 'Italian Cuisine', color: 'bg-red-100 text-red-800' },
  { id: 'asian', name: 'Asian Fusion', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'mexican', name: 'Mexican & Latin', color: 'bg-green-100 text-green-800' },
  { id: 'american', name: 'American Comfort', color: 'bg-blue-100 text-blue-800' },
  { id: 'mediterranean', name: 'Mediterranean', color: 'bg-purple-100 text-purple-800' },
  { id: 'indian', name: 'Indian Spice', color: 'bg-orange-100 text-orange-800' },
  { id: 'desserts', name: 'Desserts & Sweets', color: 'bg-pink-100 text-pink-800' },
];

const CONTENT_TONES = [
  'Friendly', 'Professional', 'Enthusiastic', 'Casual', 'Authoritative',
  'Playful', 'Inspirational', 'Educational', 'Trendy', 'Persuasive', 'Authentic'
];

const CONTENT_FORMATS = [
  { id: 'blog_post', name: 'Blog Post', color: 'bg-blue-600 text-white' },
  { id: 'instagram_post', name: 'Instagram Post', color: 'bg-pink-600 text-white' },
  { id: 'youtube_script', name: 'YouTube Script', color: 'bg-red-600 text-white' },
  { id: 'email_campaign', name: 'Email Campaign', color: 'bg-green-600 text-white' },
];

const PLATFORMS = [
  { id: 'instagram', name: 'Instagram', color: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' },
  { id: 'youtube', name: 'YouTube', color: 'bg-red-600 text-white' },
  { id: 'tiktok', name: 'TikTok', color: 'bg-black text-white' },
  { id: 'pinterest', name: 'Pinterest', color: 'bg-red-500 text-white' },
  { id: 'blog', name: 'Blog', color: 'bg-blue-600 text-white' },
];

const AI_MODELS = [
  { id: 'claude', name: 'Claude', color: 'bg-orange-600 text-white' },
  { id: 'chatgpt', name: 'ChatGPT', color: 'bg-emerald-600 text-white' },
];

const CHEF_FORMATS = [
  { id: 'regular', name: 'Regular Format', color: 'bg-blue-600 text-white' },
  { id: 'spartan', name: 'Chef Spartan Format', color: 'bg-gray-700 text-white' },
];

interface CookaingAutomatedGeneratorProps {
  onJobCreated?: (jobData: any) => void;
  autoPopulateData?: {
    recipe?: string;
    cuisine?: string;
    autopopulate?: boolean;
  };
}

export default function CookaingAutomatedGenerator({ onJobCreated, autoPopulateData }: CookaingAutomatedGeneratorProps) {
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selectedTones, setSelectedTones] = useState<string[]>([]);
  const [selectedContentFormats, setSelectedContentFormats] = useState<string[]>(['blog_post']);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedAiModels, setSelectedAiModels] = useState<string[]>(['claude']);
  const [selectedChefFormats, setSelectedChefFormats] = useState<string[]>(['spartan']);
  const [useExistingRecipes, setUseExistingRecipes] = useState(true);
  const [generateAffiliateLinks, setGenerateAffiliateLinks] = useState(false);
  const [affiliateId, setAffiliateId] = useState('sgottshall107-20');
  const [useManualAffiliateLinks, setUseManualAffiliateLinks] = useState(false);
  const [manualAffiliateLinks, setManualAffiliateLinks] = useState<Record<string, string>>({});
  const [previewRecipes, setPreviewRecipes] = useState<Record<string, any>>({});
  const [showPreview, setShowPreview] = useState(false);
  const [scheduleAfterGeneration, setScheduleAfterGeneration] = useState(false);
  const [makeWebhookUrl, setMakeWebhookUrl] = useState('');
  const [topRatedStyleUsed, setTopRatedStyleUsed] = useState(false);
  const [useChefSpartanFormat, setUseChefSpartanFormat] = useState(true);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Handle auto-population from URL parameters
  useEffect(() => {
    if (autoPopulateData?.autopopulate && autoPopulateData.recipe && autoPopulateData.cuisine) {
      console.log('🍳 Auto-populating with:', autoPopulateData);
      
      // Auto-select the cuisine
      setSelectedCuisines(prev => {
        if (!prev.includes(autoPopulateData.cuisine!)) {
          console.log('✅ Auto-selecting cuisine:', autoPopulateData.cuisine);
          return [autoPopulateData.cuisine!, ...prev];
        }
        return prev;
      });
      
      // Auto-add the recipe to preview recipes
      const recipeData = {
        id: Date.now(),
        title: autoPopulateData.recipe!,
        cuisine: autoPopulateData.cuisine!,
        source: 'trending',
        mentions: 0,
        createdAt: new Date().toISOString()
      };
      
      setPreviewRecipes(prev => {
        console.log('✅ Auto-adding recipe to preview:', recipeData);
        return {
          ...prev,
          [autoPopulateData.cuisine!]: recipeData
        };
      });
      
      setShowPreview(true);
      console.log('✅ Auto-population complete - preview enabled');
    }
  }, [autoPopulateData?.autopopulate, autoPopulateData?.recipe, autoPopulateData?.cuisine]);

  // Fetch trending recipes for preview (using same API as trending products for demo)
  const { data: trendingRecipes } = useQuery({
    queryKey: ['/api/trending/products'],
    staleTime: 5 * 60 * 1000,
  });

  const startAutomatedBulkMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/cookaing-marketing/content/automated-bulk', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-generation-source': 'cookaing_automated_generator'
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start automated recipe content generation');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "🍳 Automated Recipe Content Generation Started!",
        description: `${data.totalSelectedRecipes} recipes auto-selected across ${data.selectedCuisines?.length} cuisines. Generating ${data.totalVariations} content variations.`,
      });
      
      if (onJobCreated) {
        onJobCreated(data);
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/cookaing-marketing/content/jobs'] });
    },
    onError: (error: any) => {
      toast({
        title: "❌ Generation Failed",
        description: error.message || "Failed to start automated recipe content generation",
        variant: "destructive",
      });
    },
  });

  const handleCuisineToggle = (cuisineId: string) => {
    setSelectedCuisines(prev => 
      prev.includes(cuisineId) 
        ? prev.filter(id => id !== cuisineId)
        : [...prev, cuisineId]
    );
  };

  const handleToneToggle = (tone: string) => {
    setSelectedTones(prev => 
      prev.includes(tone) 
        ? prev.filter(t => t !== tone)
        : [...prev, tone]
    );
  };

  const handleContentFormatToggle = (format: string) => {
    setSelectedContentFormats(prev => 
      prev.includes(format) 
        ? prev.filter(f => f !== format)
        : [...prev, format]
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

  const handleChefFormatToggle = (formatId: string) => {
    setSelectedChefFormats(prev => 
      prev.includes(formatId) 
        ? prev.filter(id => id !== formatId)
        : [...prev, formatId]
    );
  };

  // Preview recipes for selected cuisines
  const previewRecipesForCuisines = () => {
    if (!trendingRecipes || !Array.isArray(trendingRecipes)) return;
    
    const recipesByCuisine: Record<string, any> = {};
    
    selectedCuisines.forEach(cuisine => {
      const cuisineRecipes = (trendingRecipes || []).filter((recipe: any) => recipe.niche === cuisine);
      if (cuisineRecipes.length > 0) {
        const sortedRecipes = cuisineRecipes.sort((a: any, b: any) => {
          const dateA = new Date(a.createdAt || '1970-01-01').getTime();
          const dateB = new Date(b.createdAt || '1970-01-01').getTime();
          return dateB - dateA;
        });
        recipesByCuisine[cuisine] = sortedRecipes[0];
        
        console.log(`🍳 Preview selected for ${cuisine}:`, sortedRecipes[0].title);
      }
    });
    
    setPreviewRecipes(recipesByCuisine);
    setShowPreview(true);
    
    console.log('🍳 Final preview recipes state:', JSON.stringify(recipesByCuisine, null, 2));
  };

  const calculateTotalVariations = () => {
    const effectiveTones = selectedTones.length > 0 ? selectedTones.length : 1;
    const effectiveFormats = selectedChefFormats.length > 0 ? selectedChefFormats.length : 1;
    
    let totalVariations = 0;
    for (const cuisine of selectedCuisines) {
      const cuisineVariations = selectedContentFormats.length * effectiveTones * selectedAiModels.length * effectiveFormats;
      totalVariations += cuisineVariations;
    }
    
    return totalVariations;
  };

  const startAutomatedGeneration = () => {
    if (selectedCuisines.length === 0) {
      toast({
        title: "❌ No Cuisines Selected",
        description: "Please select at least one cuisine for content generation",
        variant: "destructive",
      });
      return;
    }

    if (selectedContentFormats.length === 0 || selectedPlatforms.length === 0 || selectedAiModels.length === 0) {
      toast({
        title: "❌ Incomplete Selection",
        description: "Please select at least one content format, platform, and AI model",
        variant: "destructive",
      });
      return;
    }

    const bulkData = {
      selectedCuisines,
      tones: selectedTones.length > 0 ? selectedTones : ['friendly'],
      contentFormats: selectedContentFormats,
      platforms: selectedPlatforms,
      aiModels: selectedAiModels,
      chefFormats: selectedChefFormats.length > 0 ? selectedChefFormats : ['regular'],
      useExistingRecipes,
      generateAffiliateLinks,
      affiliateId: generateAffiliateLinks && !useManualAffiliateLinks ? affiliateId : undefined,
      useManualAffiliateLinks,
      manualAffiliateLinks: useManualAffiliateLinks ? manualAffiliateLinks : undefined,
      scheduleAfterGeneration,
      makeWebhookUrl: 'https://hook.us2.make.com/rkemtdx2hmy4tpd0to9bht6dg23s8wjw',
      topRatedStyleUsed,
      useChefSpartanFormat,
      userId: 1,
      previewedRecipes: Object.keys(previewRecipes).length > 0 ? previewRecipes : undefined,
    };

    console.log('🍳 DEBUG: Frontend sending bulkData with previewedRecipes:', bulkData.previewedRecipes ? 'YES' : 'NO');

    startAutomatedBulkMutation.mutate(bulkData);
  };

  return (
    <Card className="w-full" data-testid="cookaing-automated-generator">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-orange-100 to-red-100 rounded-lg">
            <ChefHat className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Automated Recipe Content Generator
            </CardTitle>
            <CardDescription className="text-base">
              Auto-select trending recipes and generate engaging food content across multiple cuisines simultaneously
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Recipe Selection Options */}
        <Card className="border-dashed border-2 border-orange-200 bg-orange-50">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-orange-600" />
                <div>
                  <h3 className="font-semibold text-orange-800">Use Existing Recipe Database</h3>
                  <p className="text-sm text-orange-600">Select recipes from your trending recipes database (recommended)</p>
                </div>
              </div>
              <Switch
                checked={useExistingRecipes}
                onCheckedChange={setUseExistingRecipes}
                data-testid="switch-use-existing-recipes"
              />
            </div>
            
            {/* Affiliate Links Section */}
            <div className="flex items-center justify-between pt-2 border-t border-orange-200">
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-800">Generate Amazon Affiliate Links</h3>
                  <p className="text-sm text-green-600">Automatically add affiliate links for cooking equipment and ingredients</p>
                </div>
              </div>
              <Switch
                checked={generateAffiliateLinks}
                onCheckedChange={setGenerateAffiliateLinks}
                data-testid="switch-generate-affiliate-links"
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
                      data-testid="switch-manual-affiliate-links"
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
                      data-testid="input-affiliate-id"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-green-700">
                      Manual Affiliate Links by Cuisine
                    </Label>
                    <div className="grid grid-cols-1 gap-2">
                      {selectedCuisines.map(cuisine => (
                        <div key={cuisine} className="flex items-center gap-2">
                          <Badge variant="outline" className="min-w-[80px] justify-center">
                            {cuisine}
                          </Badge>
                          <Input
                            placeholder="https://amazon.com/cooking-equipment?tag=your-id"
                            value={manualAffiliateLinks[cuisine] || ''}
                            onChange={(e) => setManualAffiliateLinks(prev => ({
                              ...prev,
                              [cuisine]: e.target.value
                            }))}
                            className="text-xs border-green-300 focus:border-green-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cuisine Selection */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-orange-600" />
            <h3 className="font-semibold">Select Cuisines ({selectedCuisines.length}/7)</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedCuisines(selectedCuisines.length === RECIPE_CUISINES.length ? [] : RECIPE_CUISINES.map(c => c.id))}
              data-testid="button-toggle-all-cuisines"
            >
              {selectedCuisines.length === RECIPE_CUISINES.length ? 'Deselect All' : 'Select All'}
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {RECIPE_CUISINES.map((cuisine) => (
              <div key={cuisine.id} className="flex items-center space-x-2">
                <Checkbox
                  id={cuisine.id}
                  checked={selectedCuisines.includes(cuisine.id)}
                  onCheckedChange={() => handleCuisineToggle(cuisine.id)}
                  data-testid={`checkbox-cuisine-${cuisine.id}`}
                />
                <Label htmlFor={cuisine.id} className="text-sm font-medium cursor-pointer">
                  <Badge variant="secondary" className={cuisine.color}>
                    {cuisine.name}
                  </Badge>
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Preview Recipes Button */}
        <div className="flex justify-center">
          <Button 
            onClick={previewRecipesForCuisines}
            disabled={selectedCuisines.length === 0 || !trendingRecipes}
            variant="outline"
            size="lg"
            className="w-full md:w-auto border-orange-300 text-orange-700 hover:bg-orange-50"
            data-testid="button-preview-recipes"
          >
            <Eye className="mr-2 h-5 w-5" />
            Preview Selected Recipes ({selectedCuisines.length} cuisines)
          </Button>
        </div>

        {/* Recipes Preview */}
        {showPreview && Object.keys(previewRecipes).length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ChefHat className="h-4 w-4 text-orange-600" />
                  <h4 className="font-semibold text-orange-800">Recipes to be Generated</h4>
                  <Badge variant="outline" className="text-xs">
                    {Object.keys(previewRecipes).length} recipes
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(previewRecipes).map(([cuisine, recipe]) => (
                  <div key={cuisine} className="bg-white rounded-lg p-3 border border-orange-200">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {cuisine}
                      </Badge>
                    </div>
                    <h5 className="font-medium text-gray-900 mb-1">{recipe.title}</h5>
                    <p className="text-xs text-gray-600">
                      Created: {new Date(recipe.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Content Format Selection */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            <h3 className="font-semibold">Content Formats ({selectedContentFormats.length})</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {CONTENT_FORMATS.map((format) => (
              <div key={format.id} className="flex items-center space-x-2">
                <Checkbox
                  id={format.id}
                  checked={selectedContentFormats.includes(format.id)}
                  onCheckedChange={() => handleContentFormatToggle(format.id)}
                  data-testid={`checkbox-format-${format.id}`}
                />
                <Label htmlFor={format.id} className="text-sm font-medium cursor-pointer">
                  <Badge variant="secondary" className={format.color}>
                    {format.name}
                  </Badge>
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Tone Selection */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold">Content Tones ({selectedTones.length}) <span className="text-sm text-gray-500">(Optional)</span></h3>
          </div>
          
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {CONTENT_TONES.map((tone) => (
              <div key={tone} className="flex items-center space-x-2">
                <Checkbox
                  id={tone.toLowerCase()}
                  checked={selectedTones.includes(tone.toLowerCase())}
                  onCheckedChange={() => handleToneToggle(tone.toLowerCase())}
                  data-testid={`checkbox-tone-${tone.toLowerCase()}`}
                />
                <Label htmlFor={tone.toLowerCase()} className="text-xs cursor-pointer">
                  {tone}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Selection */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-green-600" />
            <h3 className="font-semibold">Target Platforms ({selectedPlatforms.length})</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {PLATFORMS.map((platform) => (
              <div key={platform.id} className="flex items-center space-x-2">
                <Checkbox
                  id={platform.id}
                  checked={selectedPlatforms.includes(platform.id)}
                  onCheckedChange={() => handlePlatformToggle(platform.id)}
                  data-testid={`checkbox-platform-${platform.id}`}
                />
                <Label htmlFor={platform.id} className="text-sm font-medium cursor-pointer">
                  <Badge variant="secondary" className={platform.color}>
                    {platform.name}
                  </Badge>
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* AI Model & Format Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-600" />
              <h3 className="font-semibold">AI Models ({selectedAiModels.length})</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {AI_MODELS.map((model) => (
                <div key={model.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={model.id}
                    checked={selectedAiModels.includes(model.id)}
                    onCheckedChange={() => handleAiModelToggle(model.id)}
                    data-testid={`checkbox-ai-${model.id}`}
                  />
                  <Label htmlFor={model.id} className="text-sm font-medium cursor-pointer">
                    <Badge variant="secondary" className={model.color}>
                      {model.name}
                    </Badge>
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-600" />
              <h3 className="font-semibold">Chef Formats ({selectedChefFormats.length})</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {CHEF_FORMATS.map((format) => (
                <div key={format.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={format.id}
                    checked={selectedChefFormats.includes(format.id)}
                    onCheckedChange={() => handleChefFormatToggle(format.id)}
                    data-testid={`checkbox-chef-format-${format.id}`}
                  />
                  <Label htmlFor={format.id} className="text-sm font-medium cursor-pointer">
                    <Badge variant="secondary" className={format.color}>
                      {format.name}
                    </Badge>
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Generation Summary */}
        <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-orange-600" />
                <div>
                  <h3 className="font-semibold text-orange-800">Ready to Generate</h3>
                  <p className="text-sm text-orange-600">
                    {calculateTotalVariations()} total content variations across {selectedCuisines.length} cuisines
                  </p>
                </div>
              </div>
              <Button 
                onClick={startAutomatedGeneration}
                disabled={startAutomatedBulkMutation.isPending || selectedCuisines.length === 0}
                className="bg-orange-600 hover:bg-orange-700"
                data-testid="button-start-generation"
              >
                {startAutomatedBulkMutation.isPending ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <ChefHat className="mr-2 h-4 w-4" />
                    Start Generation
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <h3 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              How Automated Recipe Content Works
            </h3>
            <div className="space-y-2 text-sm text-orange-700">
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 bg-orange-200 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                <span><strong>Auto-Select Recipes:</strong> Fetch 1 trending recipe per selected cuisine from our database</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 bg-orange-200 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                <span><strong>Chef Inspiration:</strong> Apply expert chef knowledge and culinary storytelling</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 bg-orange-200 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                <span><strong>Content Generation:</strong> Create blog posts, Instagram captions, YouTube scripts, and email campaigns</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 bg-orange-200 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                <span><strong>Platform Optimization:</strong> Format content for Instagram, YouTube, TikTok, Pinterest, and blogs</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 bg-orange-200 rounded-full flex items-center justify-center text-xs font-bold">5</span>
                <span><strong>Save & Track:</strong> Store all content with ingredient affiliate links and engagement analytics</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}