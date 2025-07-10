import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Zap, Calculator, Clock, Send } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

const TONES = [
  { id: 'friendly', name: 'Friendly', description: 'Warm and approachable' },
  { id: 'professional', name: 'Professional', description: 'Business-focused and credible' },
  { id: 'enthusiastic', name: 'Enthusiastic', description: 'Excited and energetic' },
  { id: 'casual', name: 'Casual', description: 'Relaxed and conversational' },
  { id: 'luxury', name: 'Luxury', description: 'Premium and sophisticated' },
  { id: 'educational', name: 'Educational', description: 'Informative and helpful' },
];

// Templates will be fetched dynamically based on selected niche

const PLATFORMS = [
  { id: 'tiktok', name: 'TikTok' },
  { id: 'instagram', name: 'Instagram' },
  { id: 'youtube', name: 'YouTube' },
  { id: 'twitter', name: 'Twitter' },
  { id: 'other', name: 'Other' },
];

const NICHES = [
  'beauty', 'tech', 'fashion', 'fitness', 'food', 'travel', 'pets'
];

export default function BulkGenerationForm() {
  const [formData, setFormData] = useState({
    productName: '',
    niche: 'beauty',
    selectedTones: ['friendly', 'enthusiastic'],
    selectedTemplates: ['product_review', 'viral_hook'],
    selectedPlatforms: ['tiktok', 'instagram'],
    scheduleAfterGeneration: false,
    scheduledDateTime: '',
    makeWebhookUrl: '',
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch trending products for suggestions
  const { data: trendingProducts } = useQuery({
    queryKey: ['/api/trending/products'],
    staleTime: 60000,
  });

  // Fetch templates for selected niche
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

  // Start bulk generation mutation
  const startBulkMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/bulk/start-generation', { 
      method: 'POST', 
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    }),
    onSuccess: (data) => {
      toast({
        title: 'Bulk Generation Started',
        description: `Job ${data.jobId} created with ${data.bulkJob.totalVariations} variations`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/bulk/jobs'] });
      // Reset form
      setFormData({
        productName: '',
        niche: 'beauty',
        selectedTones: ['friendly', 'enthusiastic'],
        selectedTemplates: ['product_review', 'viral_hook'],
        selectedPlatforms: ['tiktok', 'instagram'],
        scheduleAfterGeneration: false,
        scheduledDateTime: '',
        makeWebhookUrl: '',
      });
    },
    onError: (error) => {
      toast({
        title: 'Generation Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleToneToggle = (toneId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedTones: prev.selectedTones.includes(toneId)
        ? prev.selectedTones.filter(id => id !== toneId)
        : [...prev.selectedTones, toneId]
    }));
  };

  const handleTemplateToggle = (templateId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedTemplates: prev.selectedTemplates.includes(templateId)
        ? prev.selectedTemplates.filter(id => id !== templateId)
        : [...prev.selectedTemplates, templateId]
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.productName.trim()) {
      toast({
        title: 'Product Name Required',
        description: 'Please enter a product name',
        variant: 'destructive',
      });
      return;
    }

    if (formData.selectedTones.length === 0) {
      toast({
        title: 'Tones Required',
        description: 'Please select at least one tone',
        variant: 'destructive',
      });
      return;
    }

    if (formData.selectedTemplates.length === 0) {
      toast({
        title: 'Templates Required',
        description: 'Please select at least one template',
        variant: 'destructive',
      });
      return;
    }

    if (formData.selectedPlatforms.length === 0) {
      toast({
        title: 'Platforms Required',
        description: 'Please select at least one platform',
        variant: 'destructive',
      });
      return;
    }

    const bulkData = {
      productName: formData.productName.trim(),
      niche: formData.niche,
      platforms: formData.selectedPlatforms,
      tones: formData.selectedTones,
      templates: formData.selectedTemplates,
      scheduleAfterGeneration: formData.scheduleAfterGeneration,
      scheduledTime: formData.scheduleAfterGeneration && formData.scheduledDateTime 
        ? new Date(formData.scheduledDateTime).toISOString()
        : undefined,
      makeWebhookUrl: 'https://hook.us2.make.com/rkemtdx2hmy4tpd0to9bht6dg23s8wjw',
    };

    startBulkMutation.mutate(bulkData);
  };

  // Calculate total variations
  const totalVariations = formData.selectedTones.length * formData.selectedTemplates.length;

  // Generate minimum datetime (1 hour from now for bulk generation)
  const minDateTime = new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Product Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="product-name" className="text-base font-medium">
            Product Name
          </Label>
          <Input
            id="product-name"
            value={formData.productName}
            onChange={(e) => setFormData(prev => ({ ...prev, productName: e.target.value }))}
            placeholder="Enter product name..."
            required
          />
          
          {/* Trending product suggestions */}
          {trendingProducts?.slice(0, 3).map((product: any) => (
            <Button
              key={product.id}
              type="button"
              variant="ghost"
              size="sm"
              className="h-auto p-2 justify-start text-left"
              onClick={() => setFormData(prev => ({ 
                ...prev, 
                productName: product.title,
                niche: product.niche 
              }))}
            >
              <div>
                <p className="text-sm font-medium">{product.title}</p>
                <p className="text-xs text-gray-500">{product.niche}</p>
              </div>
            </Button>
          ))}
        </div>

        <div className="space-y-2">
          <Label htmlFor="niche-select" className="text-base font-medium">
            Niche
          </Label>
          <select
            id="niche-select"
            value={formData.niche}
            onChange={(e) => setFormData(prev => ({ ...prev, niche: e.target.value }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {NICHES.map(niche => (
              <option key={niche} value={niche}>
                {niche.charAt(0).toUpperCase() + niche.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tones Selection */}
      <div className="space-y-3">
        <Label className="text-base font-medium">
          Select Tones ({formData.selectedTones.length} selected)
        </Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {TONES.map((tone) => {
            const isSelected = formData.selectedTones.includes(tone.id);
            return (
              <Card 
                key={tone.id}
                className={`cursor-pointer transition-all duration-200 ${
                  isSelected 
                    ? 'ring-2 ring-purple-500 bg-purple-50 border-purple-200' 
                    : 'hover:bg-gray-50 border-gray-200'
                }`}
                onClick={() => handleToneToggle(tone.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox checked={isSelected} onChange={() => {}} className="mt-1" />
                    <div>
                      <h3 className="font-medium">{tone.name}</h3>
                      <p className="text-sm text-gray-600">{tone.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Templates Selection */}
      <div className="space-y-3">
        <Label className="text-base font-medium">
          Select Templates ({formData.selectedTemplates.length} selected)
          {templatesLoading && <span className="text-sm text-gray-500 ml-2">(Loading...)</span>}
        </Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {templatesLoading ? (
            <div className="col-span-2 text-center text-gray-500 py-4">Loading templates...</div>
          ) : availableTemplates.length > 0 ? (
            availableTemplates.map((template: any) => {
              const isSelected = formData.selectedTemplates.includes(template.id);
              return (
                <Card 
                  key={template.id}
                  className={`cursor-pointer transition-all duration-200 ${
                    isSelected 
                      ? 'ring-2 ring-purple-500 bg-purple-50 border-purple-200' 
                      : 'hover:bg-gray-50 border-gray-200'
                  }`}
                  onClick={() => handleTemplateToggle(template.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Checkbox checked={isSelected} onChange={() => {}} className="mt-1" />
                      <div>
                        <h3 className="font-medium">{template.name}</h3>
                        <p className="text-sm text-gray-600">{template.description}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {template.category}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {template.estimatedLength}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="col-span-2 text-center text-gray-500 py-4">No templates available for {formData.niche}</div>
          )}
        </div>
      </div>

      {/* Platforms Selection */}
      <div className="space-y-3">
        <Label className="text-base font-medium">
          Target Platforms ({formData.selectedPlatforms.length} selected)
        </Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {PLATFORMS.map((platform) => {
            const isSelected = formData.selectedPlatforms.includes(platform.id);
            return (
              <Card 
                key={platform.id}
                className={`cursor-pointer transition-all duration-200 ${
                  isSelected 
                    ? 'ring-2 ring-purple-500 bg-purple-50 border-purple-200' 
                    : 'hover:bg-gray-50 border-gray-200'
                }`}
                onClick={() => handlePlatformToggle(platform.id)}
              >
                <CardContent className="p-3 text-center">
                  <Checkbox checked={isSelected} onChange={() => {}} className="mb-2" />
                  <p className="text-sm font-medium">{platform.name}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Calculation Summary */}
      <Card className="bg-gray-50 border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Calculator className="h-5 w-5 text-gray-600" />
            <div>
              <p className="font-medium text-gray-900">
                Total Variations: {totalVariations}
              </p>
              <p className="text-sm text-gray-600">
                {formData.selectedTones.length} tones × {formData.selectedTemplates.length} templates = {totalVariations} unique content pieces
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scheduling Options */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="schedule-toggle"
            checked={formData.scheduleAfterGeneration}
            onCheckedChange={(checked) => setFormData(prev => ({ 
              ...prev, 
              scheduleAfterGeneration: checked 
            }))}
          />
          <Label htmlFor="schedule-toggle" className="text-base font-medium">
            Schedule content after generation
          </Label>
        </div>

        {formData.scheduleAfterGeneration && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
            <div className="space-y-2">
              <Label htmlFor="schedule-datetime" className="text-sm font-medium">
                Schedule Date & Time
              </Label>
              <Input
                id="schedule-datetime"
                type="datetime-local"
                value={formData.scheduledDateTime}
                min={minDateTime}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  scheduledDateTime: e.target.value 
                }))}
                required={formData.scheduleAfterGeneration}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="webhook-url" className="text-sm font-medium">
                Make.com Webhook URL (Optional)
              </Label>
              <Input
                id="webhook-url"
                type="url"
                value={formData.makeWebhookUrl}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  makeWebhookUrl: e.target.value 
                }))}
                placeholder="https://hook.integromat.com/..."
              />
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button 
          type="submit" 
          disabled={startBulkMutation.isPending || totalVariations === 0}
          className="bg-purple-600 hover:bg-purple-700 px-6"
        >
          <Zap className="h-4 w-4 mr-2" />
          {startBulkMutation.isPending ? 'Starting...' : `Generate ${totalVariations} Variations`}
        </Button>
      </div>
    </form>
  );
}