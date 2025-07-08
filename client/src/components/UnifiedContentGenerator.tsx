import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Sparkles, 
  Zap, 
  Clock, 
  Package,
  TrendingUp,
  PlayCircle,
  Plus,
  Minus,
  AlertCircle
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import GeneratedContentCard from './GeneratedContentCard';

const NICHES = [
  'beauty', 'tech', 'fitness', 'fashion', 'food', 'travel', 'pets'
];

const TONES = [
  'Enthusiastic', 'Professional', 'Friendly', 'Educational', 'Humorous',
  'Inspiring', 'Urgent', 'Casual', 'Authoritative', 'Empathetic', 'Trendy'
];

const TEMPLATES = [
  'Short-Form Video Script', 'Product Review Template', 'Unboxing Experience',
  'Tutorial Guide', 'Comparison Template', 'Problem-Solution Template',
  'Behind-the-Scenes', 'User Testimonial', 'Seasonal Content', 'Trend Analysis'
];

const PLATFORMS = [
  { id: 'tiktok', name: 'TikTok', icon: '📱' },
  { id: 'instagram', name: 'Instagram', icon: '📸' },
  { id: 'youtube', name: 'YouTube', icon: '▶️' },
  { id: 'twitter', name: 'X (Twitter)', icon: '🐦' },
  { id: 'other', name: 'Other', icon: '📄' }
];

interface Product {
  name: string;
  niche: string;
  affiliateUrl?: string;
}

const UnifiedContentGenerator: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Generation mode
  const [generationMode, setGenerationMode] = useState<'single' | 'bulk'>('single');
  
  // Single product fields
  const [singleProduct, setSingleProduct] = useState<Product>({ name: '', niche: 'beauty' });
  const [selectedTone, setSelectedTone] = useState('Enthusiastic');
  const [selectedTemplate, setSelectedTemplate] = useState('Short-Form Video Script');
  
  // Bulk generation fields
  const [bulkProducts, setBulkProducts] = useState<Product[]>([{ name: '', niche: 'beauty' }]);
  const [selectedTones, setSelectedTones] = useState<string[]>(['Enthusiastic']);
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>(['Short-Form Video Script']);
  
  // Common fields
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['tiktok', 'instagram']);
  const [useSmartStyle, setUseSmartStyle] = useState(false);
  const [generateAffiliateLinks, setGenerateAffiliateLinks] = useState(false);
  const [affiliateId, setAffiliateId] = useState('sgottshall107-20');
  
  // Results
  const [generationResults, setGenerationResults] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch trending products for suggestions
  const { data: trendingProducts } = useQuery({
    queryKey: ['/api/trending/products'],
    staleTime: 300000, // 5 minutes
  });

  // Add product to bulk list
  const addBulkProduct = () => {
    setBulkProducts([...bulkProducts, { name: '', niche: 'beauty' }]);
  };

  // Remove product from bulk list
  const removeBulkProduct = (index: number) => {
    if (bulkProducts.length > 1) {
      setBulkProducts(bulkProducts.filter((_, i) => i !== index));
    }
  };

  // Update bulk product
  const updateBulkProduct = (index: number, field: keyof Product, value: string) => {
    const updated = [...bulkProducts];
    updated[index] = { ...updated[index], [field]: value };
    setBulkProducts(updated);
  };

  // Toggle tone selection
  const toggleTone = (tone: string) => {
    setSelectedTones(prev => 
      prev.includes(tone) 
        ? prev.filter(t => t !== tone)
        : [...prev, tone]
    );
  };

  // Toggle template selection
  const toggleTemplate = (template: string) => {
    setSelectedTemplates(prev => 
      prev.includes(template) 
        ? prev.filter(t => t !== template)
        : [...prev, template]
    );
  };

  // Toggle platform selection
  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    );
  };

  // Generation mutation
  const generateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/generate-unified', data);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setGenerationResults(Array.isArray(data.data.results) ? data.data.results : [data.data]);
        toast({
          title: "Content generated successfully",
          description: `Generated ${data.data.successfulGenerations || 1} content piece${data.data.successfulGenerations > 1 ? 's' : ''}`,
        });
      } else {
        throw new Error(data.error || 'Generation failed');
      }
    },
    onError: (error: any) => {
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate content",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsGenerating(false);
    }
  });

  // Handle generation
  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerationResults([]);

    try {
      if (generationMode === 'single') {
        // Single product generation
        if (!singleProduct.name.trim()) {
          toast({
            title: "Product name required",
            description: "Please enter a product name",
            variant: "destructive",
          });
          setIsGenerating(false);
          return;
        }

        const requestData = {
          mode: 'manual',
          product: singleProduct.name,
          niche: singleProduct.niche,
          templateType: selectedTemplate,
          tone: selectedTone,
          platforms: selectedPlatforms,
          contentType: 'video',
          affiliateUrl: generateAffiliateLinks ? `https://amazon.com/dp/PRODUCT_ID?tag=${affiliateId}` : singleProduct.affiliateUrl,
          useSmartStyle
        };

        await generateMutation.mutateAsync(requestData);
      } else {
        // Bulk generation
        const validProducts = bulkProducts.filter(p => p.name.trim());
        
        if (validProducts.length === 0) {
          toast({
            title: "No valid products",
            description: "Please add at least one product",
            variant: "destructive",
          });
          setIsGenerating(false);
          return;
        }

        if (selectedTones.length === 0 || selectedTemplates.length === 0) {
          toast({
            title: "Selection required",
            description: "Please select at least one tone and template",
            variant: "destructive",
          });
          setIsGenerating(false);
          return;
        }

        const requestData = {
          mode: 'manual',
          products: validProducts.map(p => ({
            name: p.name,
            niche: p.niche,
            affiliateUrl: generateAffiliateLinks ? `https://amazon.com/dp/PRODUCT_ID?tag=${affiliateId}` : p.affiliateUrl
          })),
          tones: selectedTones,
          templates: selectedTemplates,
          platforms: selectedPlatforms,
          contentType: 'video',
          useSmartStyle
        };

        await generateMutation.mutateAsync(requestData);
      }
    } catch (error) {
      console.error('Generation error:', error);
      setIsGenerating(false);
    }
  };

  // Handle regeneration for a specific product
  const handleRegenerate = (productName: string) => {
    // Find the product and regenerate with same settings
    const product = generationMode === 'single' ? singleProduct : 
      bulkProducts.find(p => p.name === productName);
    
    if (product) {
      setSingleProduct(product);
      setGenerationMode('single');
      handleGenerate();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Sparkles className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Unified Content Generator</h1>
            <p className="text-gray-600">Generate single or multiple content pieces with platform-specific optimization</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Generation Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Mode Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Generation Mode
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup 
                value={generationMode} 
                onValueChange={(value: 'single' | 'bulk') => setGenerationMode(value)}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="single" id="single" />
                  <Label htmlFor="single" className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Single Product
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bulk" id="bulk" />
                  <Label htmlFor="bulk" className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Bulk Generation
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Product Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Product Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {generationMode === 'single' ? (
                // Single product form
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="product-name">Product Name</Label>
                    <Input
                      id="product-name"
                      value={singleProduct.name}
                      onChange={(e) => setSingleProduct({...singleProduct, name: e.target.value})}
                      placeholder="Enter product name..."
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="niche">Niche</Label>
                    <Select 
                      value={singleProduct.niche} 
                      onValueChange={(value) => setSingleProduct({...singleProduct, niche: value})}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {NICHES.map(niche => (
                          <SelectItem key={niche} value={niche}>
                            {niche.charAt(0).toUpperCase() + niche.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="affiliate-url">Affiliate URL (Optional)</Label>
                    <Input
                      id="affiliate-url"
                      value={singleProduct.affiliateUrl || ''}
                      onChange={(e) => setSingleProduct({...singleProduct, affiliateUrl: e.target.value})}
                      placeholder="https://amazon.com/..."
                      className="mt-1"
                    />
                  </div>
                </div>
              ) : (
                // Bulk products form
                <div className="space-y-4">
                  {bulkProducts.map((product, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="font-medium">Product {index + 1}</Label>
                        {bulkProducts.length > 1 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeBulkProduct(index)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label>Name</Label>
                          <Input
                            value={product.name}
                            onChange={(e) => updateBulkProduct(index, 'name', e.target.value)}
                            placeholder="Product name..."
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Niche</Label>
                          <Select 
                            value={product.niche} 
                            onValueChange={(value) => updateBulkProduct(index, 'niche', value)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {NICHES.map(niche => (
                                <SelectItem key={niche} value={niche}>
                                  {niche.charAt(0).toUpperCase() + niche.slice(1)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={addBulkProduct}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Content Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Content Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Tone Selection */}
              <div>
                <Label className="text-base font-medium">
                  {generationMode === 'single' ? 'Tone' : 'Tones (Select Multiple)'}
                </Label>
                {generationMode === 'single' ? (
                  <Select value={selectedTone} onValueChange={setSelectedTone}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TONES.map(tone => (
                        <SelectItem key={tone} value={tone}>{tone}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {TONES.map(tone => (
                      <div key={tone} className="flex items-center space-x-2">
                        <Checkbox
                          id={`tone-${tone}`}
                          checked={selectedTones.includes(tone)}
                          onCheckedChange={() => toggleTone(tone)}
                        />
                        <Label htmlFor={`tone-${tone}`} className="text-sm">{tone}</Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Template Selection */}
              <div>
                <Label className="text-base font-medium">
                  {generationMode === 'single' ? 'Template' : 'Templates (Select Multiple)'}
                </Label>
                {generationMode === 'single' ? (
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TEMPLATES.map(template => (
                        <SelectItem key={template} value={template}>{template}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    {TEMPLATES.map(template => (
                      <div key={template} className="flex items-center space-x-2">
                        <Checkbox
                          id={`template-${template}`}
                          checked={selectedTemplates.includes(template)}
                          onCheckedChange={() => toggleTemplate(template)}
                        />
                        <Label htmlFor={`template-${template}`} className="text-sm">{template}</Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Platform Selection */}
              <div>
                <Label className="text-base font-medium">Target Platforms</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {PLATFORMS.map(platform => (
                    <div key={platform.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`platform-${platform.id}`}
                        checked={selectedPlatforms.includes(platform.id)}
                        onCheckedChange={() => togglePlatform(platform.id)}
                      />
                      <Label htmlFor={`platform-${platform.id}`} className="text-sm flex items-center gap-1">
                        <span>{platform.icon}</span>
                        {platform.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Advanced Options */}
              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="smart-style" className="text-base font-medium">Use Smart Style</Label>
                    <p className="text-sm text-gray-600">Learn from your highest-rated content</p>
                  </div>
                  <Switch
                    id="smart-style"
                    checked={useSmartStyle}
                    onCheckedChange={setUseSmartStyle}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="affiliate-links" className="text-base font-medium">Generate Affiliate Links</Label>
                    <p className="text-sm text-gray-600">Auto-generate Amazon affiliate links</p>
                  </div>
                  <Switch
                    id="affiliate-links"
                    checked={generateAffiliateLinks}
                    onCheckedChange={setGenerateAffiliateLinks}
                  />
                </div>

                {generateAffiliateLinks && (
                  <div>
                    <Label htmlFor="affiliate-id">Affiliate ID</Label>
                    <Input
                      id="affiliate-id"
                      value={affiliateId}
                      onChange={(e) => setAffiliateId(e.target.value)}
                      placeholder="your-affiliate-id"
                      className="mt-1"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Generation Button */}
          <Card>
            <CardContent className="pt-6">
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || selectedPlatforms.length === 0}
                className="w-full h-12 text-lg"
                size="lg"
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
              
              {selectedPlatforms.length === 0 && (
                <div className="flex items-center gap-2 mt-2 text-sm text-amber-600">
                  <AlertCircle className="h-4 w-4" />
                  Please select at least one platform
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Generation Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Mode:</span>
                  <Badge variant="outline">
                    {generationMode === 'single' ? 'Single' : 'Bulk'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Products:</span>
                  <span>{generationMode === 'single' ? 1 : bulkProducts.filter(p => p.name.trim()).length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tones:</span>
                  <span>{generationMode === 'single' ? 1 : selectedTones.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Templates:</span>
                  <span>{generationMode === 'single' ? 1 : selectedTemplates.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Platforms:</span>
                  <span>{selectedPlatforms.length}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">Total Variations:</span>
                  <span className="font-medium">
                    {generationMode === 'single' 
                      ? 1 
                      : bulkProducts.filter(p => p.name.trim()).length * selectedTones.length * selectedTemplates.length
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
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
                onRegenerate={handleRegenerate}
                contentIndex={index}
                showRating={true}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedContentGenerator;