import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  ChefHat, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  Sparkles,
  BarChart3,
  DollarSign,
  Target,
  Settings
} from 'lucide-react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

const COOKING_METHODS = [
  { id: 'air_fryer', name: 'Air Fryer', color: 'bg-blue-100 text-blue-800' },
  { id: 'oven_baked', name: 'Oven Baked', color: 'bg-orange-100 text-orange-800' },
  { id: 'grilled', name: 'Grilled', color: 'bg-red-100 text-red-800' },
  { id: 'pan_seared', name: 'Pan Seared', color: 'bg-green-100 text-green-800' },
  { id: 'slow_cooker', name: 'Slow Cooker', color: 'bg-purple-100 text-purple-800' },
];

const RECIPE_TONES = [
  'Beginner', 'Intermediate', 'Advanced', 'Professional', 'Quick & Easy',
  'Healthy', 'Comfort Food', 'Gourmet', 'Family-Friendly', 'Diet-Specific'
];

const PLATFORMS = [
  { id: 'tiktok', name: 'TikTok', color: 'bg-black text-white' },
  { id: 'instagram', name: 'Instagram', color: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' },
  { id: 'youtube', name: 'YouTube Shorts', color: 'bg-red-600 text-white' },
  { id: 'twitter', name: 'Twitter', color: 'bg-blue-500 text-white' },
  { id: 'linkedin', name: 'LinkedIn', color: 'bg-blue-700 text-white' },
];

interface AutomatedCookAIngBulkGeneratorProps {
  onJobCreated?: (jobData: any) => void;
}

export default function AutomatedCookAIngBulkGenerator({ 
  onJobCreated 
}: AutomatedCookAIngBulkGeneratorProps) {
  const [formData, setFormData] = useState({
    selectedCookingMethods: ['air_fryer', 'oven_baked', 'grilled'],
    selectedTones: ['Beginner', 'Intermediate', 'Advanced'],
    selectedPlatforms: ['tiktok', 'instagram', 'youtube'],
    recipeCount: 5,
    useTrendingIngredients: true,
    scheduleDaily: false,
    makeWebhookUrl: '',
    enableTopRatedStyle: true,
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch trending ingredients
  const { data: trendingIngredients } = useQuery({
    queryKey: ['/api/cookAIng/trending-ingredients'],
    staleTime: 300000, // 5 minutes
  });

  // Start automated bulk generation mutation
  const startAutomatedMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/cookAIng/generator/automated/start', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    }),
    onSuccess: (result) => {
      toast({
        title: 'Automated Generation Started',
        description: `Started generating ${result.estimatedRecipes} recipe variations automatically`,
      });
      onJobCreated?.(result);
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to Start',
        description: error?.message || 'Failed to start automated recipe generation',
        variant: 'destructive',
      });
    }
  });

  const handleSubmit = () => {
    if (formData.selectedCookingMethods.length === 0) {
      toast({
        title: 'No Cooking Methods',
        description: 'Please select at least one cooking method',
        variant: 'destructive',
      });
      return;
    }

    if (formData.selectedTones.length === 0) {
      toast({
        title: 'No Recipe Styles',
        description: 'Please select at least one recipe style',
        variant: 'destructive',
      });
      return;
    }

    if (formData.selectedPlatforms.length === 0) {
      toast({
        title: 'No Platforms',
        description: 'Please select at least one platform',
        variant: 'destructive',
      });
      return;
    }

    const jobData = {
      cookingMethods: formData.selectedCookingMethods,
      tones: formData.selectedTones,
      platforms: formData.selectedPlatforms,
      recipeCount: formData.recipeCount,
      useTrendingIngredients: formData.useTrendingIngredients,
      scheduleDaily: formData.scheduleDaily,
      makeWebhookUrl: formData.makeWebhookUrl,
      enableTopRatedStyle: formData.enableTopRatedStyle,
      source: 'automated',
      contentType: 'recipe',
      niche: 'cooking',
    };

    startAutomatedMutation.mutate(jobData);
  };

  const calculateEstimatedRecipes = () => {
    return formData.recipeCount * 
           formData.selectedCookingMethods.length * 
           formData.selectedTones.length * 
           formData.selectedPlatforms.length;
  };

  const handleCookingMethodToggle = (methodId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedCookingMethods: prev.selectedCookingMethods.includes(methodId)
        ? prev.selectedCookingMethods.filter(id => id !== methodId)
        : [...prev.selectedCookingMethods, methodId]
    }));
  };

  const handleToneToggle = (tone: string) => {
    setFormData(prev => ({
      ...prev,
      selectedTones: prev.selectedTones.includes(tone)
        ? prev.selectedTones.filter(t => t !== tone)
        : [...prev.selectedTones, tone]
    }));
  };

  const handlePlatformToggle = (platformId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedPlatforms: prev.selectedPlatforms.includes(platformId)
        ? prev.selectedPlatforms.filter(id => id !== platformId)
        : [...prev.selectedPlatforms, platformId]
    }));
  };

  return (
    <div className="space-y-6" data-testid="automated-cookaing-generator">
      {/* Trending Ingredients Info */}
      {trendingIngredients && (
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <div>
                <div className="font-medium text-orange-900">Today's Trending Ingredients</div>
                <div className="text-sm text-orange-700">
                  {trendingIngredients.slice(0, 3).map((ingredient: any) => ingredient.name).join(', ')}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recipe Count */}
      <div className="space-y-3">
        <Label htmlFor="recipeCount" className="text-sm font-semibold">
          Number of Ingredients to Process
        </Label>
        <Input
          id="recipeCount"
          type="number"
          min="1"
          max="20"
          value={formData.recipeCount}
          onChange={(e) => setFormData(prev => ({ ...prev, recipeCount: parseInt(e.target.value) || 1 }))}
          className="w-full"
          data-testid="input-recipe-count"
        />
        <p className="text-xs text-gray-500">
          How many trending ingredients to create recipes for (1-20)
        </p>
      </div>

      {/* Cooking Methods */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">
          Cooking Methods ({formData.selectedCookingMethods.length} selected)
        </Label>
        <div className="flex flex-wrap gap-2">
          {COOKING_METHODS.map((method) => (
            <Badge
              key={method.id}
              className={`cursor-pointer px-3 py-1 ${
                formData.selectedCookingMethods.includes(method.id) 
                  ? method.color 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => handleCookingMethodToggle(method.id)}
              data-testid={`method-${method.id}`}
            >
              {method.name}
            </Badge>
          ))}
        </div>
      </div>

      {/* Recipe Styles */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">
          Recipe Styles ({formData.selectedTones.length} selected)
        </Label>
        <div className="flex flex-wrap gap-2">
          {RECIPE_TONES.map((tone) => (
            <Badge
              key={tone}
              variant={formData.selectedTones.includes(tone) ? "default" : "outline"}
              className="cursor-pointer px-3 py-1"
              onClick={() => handleToneToggle(tone)}
              data-testid={`tone-${tone.toLowerCase().replace(' ', '-')}`}
            >
              {tone}
            </Badge>
          ))}
        </div>
      </div>

      {/* Platforms */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">
          Target Platforms ({formData.selectedPlatforms.length} selected)
        </Label>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map((platform) => (
            <Badge
              key={platform.id}
              className={`cursor-pointer px-3 py-1 ${
                formData.selectedPlatforms.includes(platform.id) 
                  ? platform.color 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => handlePlatformToggle(platform.id)}
              data-testid={`platform-${platform.id}`}
            >
              {platform.name}
            </Badge>
          ))}
        </div>
      </div>

      {/* Advanced Options */}
      <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
        <div className="flex items-center space-x-2">
          <Settings className="h-4 w-4 text-gray-600" />
          <Label className="text-sm font-semibold">Advanced Options</Label>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm">Use Trending Ingredients</Label>
              <p className="text-xs text-gray-500">Automatically select trending ingredients</p>
            </div>
            <Switch
              checked={formData.useTrendingIngredients}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, useTrendingIngredients: checked }))}
              data-testid="switch-trending-ingredients"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm">Enable Top-Rated Style</Label>
              <p className="text-xs text-gray-500">Use AI-optimized recipe formatting</p>
            </div>
            <Switch
              checked={formData.enableTopRatedStyle}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enableTopRatedStyle: checked }))}
              data-testid="switch-top-rated-style"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm">Schedule Daily Generation</Label>
              <p className="text-xs text-gray-500">Automatically run this generation daily</p>
            </div>
            <Switch
              checked={formData.scheduleDaily}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, scheduleDaily: checked }))}
              data-testid="switch-schedule-daily"
            />
          </div>
        </div>
      </div>

      {/* Webhook URL */}
      <div className="space-y-3">
        <Label htmlFor="webhookUrl" className="text-sm font-semibold">
          Make.com Webhook URL (Optional)
        </Label>
        <Input
          id="webhookUrl"
          type="url"
          placeholder="https://hook.make.com/your-webhook-url"
          value={formData.makeWebhookUrl}
          onChange={(e) => setFormData(prev => ({ ...prev, makeWebhookUrl: e.target.value }))}
          className="w-full"
          data-testid="input-webhook-url"
        />
      </div>

      {/* Generation Estimate */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BarChart3 className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-medium text-green-900">Estimated Output</div>
                <div className="text-sm text-green-700">
                  ~{calculateEstimatedRecipes()} total recipe variations
                </div>
              </div>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {formData.recipeCount} × {formData.selectedCookingMethods.length} × {formData.selectedTones.length} × {formData.selectedPlatforms.length}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Start Button */}
      <Button
        onClick={handleSubmit}
        disabled={startAutomatedMutation.isPending}
        className="w-full bg-orange-600 hover:bg-orange-700 text-white"
        data-testid="button-start-automated"
      >
        {startAutomatedMutation.isPending ? (
          <>
            <Clock className="h-4 w-4 mr-2 animate-spin" />
            Starting Automated Generation...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 mr-2" />
            Start Automated Recipe Generation
          </>
        )}
      </Button>
    </div>
  );
}