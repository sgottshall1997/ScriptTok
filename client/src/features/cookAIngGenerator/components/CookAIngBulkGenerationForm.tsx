import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { ChefHat, Calculator, Clock, Send } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

const COOKING_METHODS = [
  { id: 'air_fryer', name: 'Air Fryer', description: 'Quick and crispy' },
  { id: 'oven_baked', name: 'Oven Baked', description: 'Traditional and reliable' },
  { id: 'grilled', name: 'Grilled', description: 'Smoky and flavorful' },
  { id: 'pan_seared', name: 'Pan Seared', description: 'Fast and delicious' },
  { id: 'slow_cooker', name: 'Slow Cooker', description: 'Set and forget' },
];

const RECIPE_TONES = [
  { id: 'beginner', name: 'Beginner', description: 'Simple and easy to follow' },
  { id: 'intermediate', name: 'Intermediate', description: 'Some cooking experience' },
  { id: 'advanced', name: 'Advanced', description: 'Skilled home chef' },
  { id: 'professional', name: 'Professional', description: 'Restaurant quality' },
];

const PLATFORMS = [
  { id: 'tiktok', name: 'TikTok' },
  { id: 'instagram', name: 'Instagram' },
  { id: 'youtube', name: 'YouTube Shorts' },
  { id: 'twitter', name: 'Twitter' },
  { id: 'linkedin', name: 'LinkedIn' },
];

interface CookAIngBulkGenerationFormProps {
  autoPopulateData?: {
    ingredient?: string;
    cookingMethod?: string;
    autopopulate?: boolean;
  };
  onJobCreated?: () => void;
}

export default function CookAIngBulkGenerationForm({ 
  autoPopulateData, 
  onJobCreated 
}: CookAIngBulkGenerationFormProps) {
  const [formData, setFormData] = useState({
    ingredient: autoPopulateData?.ingredient || '',
    selectedCookingMethods: autoPopulateData?.cookingMethod ? [autoPopulateData.cookingMethod] : ['air_fryer', 'oven_baked'],
    selectedTones: ['beginner', 'intermediate'],
    selectedPlatforms: ['tiktok', 'instagram'],
    scheduleAfterGeneration: false,
    scheduledDateTime: '',
    makeWebhookUrl: '',
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Start bulk recipe generation mutation
  const startBulkMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/cookAIng/generator/bulk/start', { 
      method: 'POST', 
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    }),
    onSuccess: (result) => {
      toast({
        title: 'Recipe Generation Started',
        description: `Bulk recipe generation job started with ${result.totalVariations} variations`,
      });
      onJobCreated?.();
      // Reset form
      setFormData({
        ingredient: '',
        selectedCookingMethods: ['air_fryer', 'oven_baked'],
        selectedTones: ['beginner', 'intermediate'],
        selectedPlatforms: ['tiktok', 'instagram'],
        scheduleAfterGeneration: false,
        scheduledDateTime: '',
        makeWebhookUrl: '',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Generation Failed',
        description: error?.message || 'Failed to start bulk recipe generation',
        variant: 'destructive',
      });
    }
  });

  const handleSubmit = () => {
    if (!formData.ingredient.trim()) {
      toast({
        title: 'Missing Ingredient',
        description: 'Please enter an ingredient to create recipes for',
        variant: 'destructive',
      });
      return;
    }

    if (formData.selectedCookingMethods.length === 0) {
      toast({
        title: 'No Cooking Methods',
        description: 'Please select at least one cooking method',
        variant: 'destructive',
      });
      return;
    }

    const jobData = {
      ingredient: formData.ingredient.trim(),
      cookingMethods: formData.selectedCookingMethods,
      tones: formData.selectedTones,
      platforms: formData.selectedPlatforms,
      scheduleAfterGeneration: formData.scheduleAfterGeneration,
      scheduledDateTime: formData.scheduledDateTime,
      makeWebhookUrl: formData.makeWebhookUrl,
      contentType: 'recipe',
      niche: 'cooking',
    };

    startBulkMutation.mutate(jobData);
  };

  const calculateVariations = () => {
    return formData.selectedCookingMethods.length * 
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

  const handleToneToggle = (toneId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedTones: prev.selectedTones.includes(toneId)
        ? prev.selectedTones.filter(id => id !== toneId)
        : [...prev.selectedTones, toneId]
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
    <div className="space-y-6" data-testid="cookaing-bulk-generation-form">
      {/* Ingredient Input */}
      <div className="space-y-3">
        <Label htmlFor="ingredient" className="text-sm font-semibold">
          Ingredient *
        </Label>
        <Input
          id="ingredient"
          type="text"
          placeholder="Enter main ingredient (e.g., chicken breast, salmon, broccoli)"
          value={formData.ingredient}
          onChange={(e) => setFormData(prev => ({ ...prev, ingredient: e.target.value }))}
          className="w-full"
          data-testid="input-ingredient"
        />
        <p className="text-xs text-gray-500">
          The main ingredient for your recipe variations
        </p>
      </div>

      {/* Cooking Methods */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">
          Cooking Methods ({formData.selectedCookingMethods.length} selected)
        </Label>
        <div className="grid grid-cols-2 gap-3">
          {COOKING_METHODS.map((method) => (
            <div
              key={method.id}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                formData.selectedCookingMethods.includes(method.id)
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleCookingMethodToggle(method.id)}
              data-testid={`cooking-method-${method.id}`}
            >
              <div className="flex items-center space-x-3">
                <Checkbox
                  checked={formData.selectedCookingMethods.includes(method.id)}
                  onChange={() => handleCookingMethodToggle(method.id)}
                />
                <div>
                  <div className="font-medium text-sm">{method.name}</div>
                  <div className="text-xs text-gray-500">{method.description}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recipe Complexity */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">
          Recipe Complexity ({formData.selectedTones.length} selected)
        </Label>
        <div className="grid grid-cols-2 gap-3">
          {RECIPE_TONES.map((tone) => (
            <div
              key={tone.id}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                formData.selectedTones.includes(tone.id)
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleToneToggle(tone.id)}
              data-testid={`tone-${tone.id}`}
            >
              <div className="flex items-center space-x-3">
                <Checkbox
                  checked={formData.selectedTones.includes(tone.id)}
                  onChange={() => handleToneToggle(tone.id)}
                />
                <div>
                  <div className="font-medium text-sm">{tone.name}</div>
                  <div className="text-xs text-gray-500">{tone.description}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Platforms */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">
          Platforms ({formData.selectedPlatforms.length} selected)
        </Label>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map((platform) => (
            <Badge
              key={platform.id}
              variant={formData.selectedPlatforms.includes(platform.id) ? "default" : "outline"}
              className={`cursor-pointer px-3 py-1 ${
                formData.selectedPlatforms.includes(platform.id) 
                  ? 'bg-orange-600 hover:bg-orange-700' 
                  : 'hover:bg-gray-100'
              }`}
              onClick={() => handlePlatformToggle(platform.id)}
              data-testid={`platform-${platform.id}`}
            >
              {platform.name}
            </Badge>
          ))}
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
        <p className="text-xs text-gray-500">
          Optional: Send generated recipes to Make.com for automation
        </p>
      </div>

      {/* Generation Summary */}
      <Card className="bg-orange-50 border-orange-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calculator className="h-5 w-5 text-orange-600" />
              <div>
                <div className="font-medium text-orange-900">Generation Summary</div>
                <div className="text-sm text-orange-700">
                  {calculateVariations()} total recipe variations will be generated
                </div>
              </div>
            </div>
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              {formData.selectedCookingMethods.length} × {formData.selectedTones.length} × {formData.selectedPlatforms.length}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={startBulkMutation.isPending || !formData.ingredient.trim()}
        className="w-full bg-orange-600 hover:bg-orange-700 text-white"
        data-testid="button-start-generation"
      >
        {startBulkMutation.isPending ? (
          <>
            <Clock className="h-4 w-4 mr-2 animate-spin" />
            Starting Recipe Generation...
          </>
        ) : (
          <>
            <Send className="h-4 w-4 mr-2" />
            Start Recipe Generation
          </>
        )}
      </Button>
    </div>
  );
}