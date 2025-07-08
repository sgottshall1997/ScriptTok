import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  TrendingUp, 
  Sparkles, 
  Clock, 
  Copy, 
  RefreshCw, 
  Edit,
  ChevronDown,
  Zap,
  ExternalLink,
  Target
} from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { DashboardTrendingResponse, TrendingProduct } from "@/lib/types";
import { TemplateSelector } from "@/components/TemplateSelector";

interface GeneratedContent {
  content: string;
  hook: string;
  platform: string;
  niche: string;
}

const GenerateContent = () => {
  const [location] = useLocation();
  const { toast } = useToast();
  
  // Extract niche from URL path
  const urlParts = location.split('/');
  const nicheFromUrl = urlParts[2]; // /niche/skincare -> skincare
  
  // Extract template and product from query params
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const templateFromUrl = urlParams.get('template');
  const productFromUrl = urlParams.get('product');

  // State management
  const [selectedNiche, setSelectedNiche] = useState(nicheFromUrl || 'skincare');
  const [selectedProduct, setSelectedProduct] = useState(productFromUrl || '');
  const [productUrl, setProductUrl] = useState('');
  const [affiliateNetwork, setAffiliateNetwork] = useState('amazon');
  const [affiliateId, setAffiliateId] = useState('');
  const [smartRedirectUrl, setSmartRedirectUrl] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['tiktok']);
  const [scheduleTime, setScheduleTime] = useState('now');
  const [templateType, setTemplateType] = useState(templateFromUrl || 'social_media_post');
  const [tone, setTone] = useState('enthusiastic');
  const [isHookGeneratorOpen, setIsHookGeneratorOpen] = useState(false);
  const [customHook, setCustomHook] = useState('');
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch trending products
  const { data: trendingProducts, isLoading: trendingLoading } = useQuery<DashboardTrendingResponse>({
    queryKey: ['/api/trending'],
    retry: false,
  });

  // Get Perplexity products for current niche (limit 3)
  const getPerplexityProductsForNiche = (niche: string) => {
    if (!trendingProducts?.data?.[niche]) return [];
    return trendingProducts.data[niche]
      .filter(p => p.source === 'perplexity')
      .slice(0, 3);
  };

  // Handle product selection
  const handleUseProduct = (product: TrendingProduct) => {
    setSelectedProduct(product.title);
    setSelectedNiche(product.niche);
    setProductUrl(product.url || '');
    toast({
      title: "Product Selected",
      description: `Selected ${product.title} for content generation`,
    });
  };

  // Generate smart redirect URL
  const generateRedirectUrl = () => {
    if (!productUrl || !affiliateId) return;
    
    const baseUrl = window.location.origin;
    const redirectId = Math.random().toString(36).substr(2, 9);
    const url = `${baseUrl}/r/${redirectId}`;
    setSmartRedirectUrl(url);
  };

  // Handle content generation
  const handleGenerateContent = async () => {
    if (!selectedProduct) {
      toast({
        title: "Missing Product",
        description: "Please select a product first",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: selectedProduct,
          niche: selectedNiche,
          platforms: selectedPlatforms,
          templateType,
          tone,
          customHook,
          affiliateUrl: smartRedirectUrl || productUrl,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('API Response:', result); // Debug log
        
        if (result.success && result.data) {
          // Extract content from the API response structure
          const contentData: GeneratedContent = {
            content: result.data.content,
            hook: result.data.customHook || '',
            platform: selectedPlatforms[0] || 'tiktok',
            niche: selectedNiche,
          };
          
          setGeneratedContent(contentData);
          toast({
            title: "Content Generated!",
            description: `Your ${templateType} content is ready`,
          });
          
          // Show Surprise Me reasoning if available
          if (result.data.surpriseMeReasoning) {
            toast({
              title: "🎲 Surprise Me Selection",
              description: result.data.surpriseMeReasoning,
              duration: 5000,
            });
          }
        } else {
          console.error('API Response Error:', result);
          throw new Error(result.error || 'Generation failed');
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Generation failed');
      }
    } catch (error) {
      console.error('Content generation error:', error); // Debug log
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Platform toggle
  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  // Niche data
  const niches = [
    { id: 'skincare', name: 'Skincare', color: 'bg-pink-100 text-pink-800' },
    { id: 'tech', name: 'Tech', color: 'bg-blue-100 text-blue-800' },
    { id: 'fashion', name: 'Fashion', color: 'bg-purple-100 text-purple-800' },
    { id: 'fitness', name: 'Fitness', color: 'bg-green-100 text-green-800' },
    { id: 'food', name: 'Food', color: 'bg-orange-100 text-orange-800' },
    { id: 'travel', name: 'Travel', color: 'bg-cyan-100 text-cyan-800' },
    { id: 'pet', name: 'Pet', color: 'bg-yellow-100 text-yellow-800' },
  ];

  const platforms = [
    { id: 'tiktok', name: 'TikTok', color: 'bg-black text-white' },
    { id: 'instagram', name: 'Instagram', color: 'bg-gradient-to-r from-purple-400 to-pink-400 text-white' },
    { id: 'youtube', name: 'YouTube', color: 'bg-red-500 text-white' },
    { id: 'twitter', name: 'Twitter', color: 'bg-blue-400 text-white' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">⚡ Viral Content Factory</h1>
        <p className="text-lg text-muted-foreground">
          From trending product to viral content in under 60 seconds
        </p>
      </div>

      {/* 1️⃣ Browse Trending Products */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            🔥 Browse Trending Products
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Select a hot product to create viral content around
          </p>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedNiche} onValueChange={setSelectedNiche}>
            <TabsList className="grid w-full grid-cols-7">
              {niches.map((niche) => (
                <TabsTrigger key={niche.id} value={niche.id} className="text-xs">
                  {niche.name}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {niches.map((niche) => (
              <TabsContent key={niche.id} value={niche.id}>
                <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                  {trendingLoading ? (
                    Array(3).fill(0).map((_, i) => (
                      <Card key={i} className="p-4">
                        <Skeleton className="h-4 w-3/4 mb-2" />
                        <Skeleton className="h-3 w-1/2 mb-4" />
                        <Skeleton className="h-8 w-full" />
                      </Card>
                    ))
                  ) : (
                    getPerplexityProductsForNiche(niche.id).map((product, index) => (
                      <Card key={product.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <h3 className="font-semibold text-sm leading-tight line-clamp-2">
                                {product.title}
                              </h3>
                              <Badge className={niche.color} variant="secondary">
                                #{index + 1}
                              </Badge>
                            </div>
                            
                            <div className="text-xs text-muted-foreground">
                              🔥 {product.mentions?.toLocaleString() || '0'} mentions
                            </div>
                            
                            <Button 
                              size="sm" 
                              className="w-full"
                              onClick={() => handleUseProduct(product)}
                            >
                              <Target className="h-3 w-3 mr-1" />
                              Use Product
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* 2️⃣ Content Generation Module - Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column: Product & Affiliate Setup */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-500" />
              📄 Product & Affiliate Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Product Name */}
            <div>
              <Label htmlFor="product">Product Name</Label>
              <Input
                id="product"
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                placeholder="Enter product name..."
              />
            </div>

            {/* Niche */}
            <div>
              <Label htmlFor="niche">Niche</Label>
              <Select value={selectedNiche} onValueChange={setSelectedNiche}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {niches.map((niche) => (
                    <SelectItem key={niche.id} value={niche.id}>
                      {niche.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Affiliate Link Generator */}
            <div className="border rounded-lg p-4 space-y-3 bg-gray-50">
              <h4 className="font-medium text-sm">🔗 Affiliate Link Generator</h4>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="network" className="text-xs">Network</Label>
                  <Select value={affiliateNetwork} onValueChange={setAffiliateNetwork}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="amazon">Amazon</SelectItem>
                      <SelectItem value="shareasale">ShareASale</SelectItem>
                      <SelectItem value="cj">Commission Junction</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="affiliate-id" className="text-xs">Affiliate ID</Label>
                  <Input
                    id="affiliate-id"
                    className="h-8"
                    value={affiliateId}
                    onChange={(e) => setAffiliateId(e.target.value)}
                    placeholder="Your ID..."
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="product-url" className="text-xs">Product URL</Label>
                <Input
                  id="product-url"
                  className="h-8"
                  value={productUrl}
                  onChange={(e) => setProductUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <Button 
                size="sm" 
                variant="outline" 
                className="w-full h-8"
                onClick={generateRedirectUrl}
                disabled={!productUrl || !affiliateId}
              >
                ✅ Create Smart Redirect
              </Button>

              {smartRedirectUrl && (
                <div className="text-xs bg-white p-2 rounded border">
                  <span className="text-green-600">✅ Redirect URL:</span>
                  <code className="block mt-1">{smartRedirectUrl}</code>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Content Setup */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-500" />
              🚀 Content Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Platform Selector */}
            <div>
              <Label className="text-sm font-medium">Platforms</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {platforms.map((platform) => (
                  <Button
                    key={platform.id}
                    size="sm"
                    variant={selectedPlatforms.includes(platform.id) ? "default" : "outline"}
                    className={selectedPlatforms.includes(platform.id) ? platform.color : ""}
                    onClick={() => togglePlatform(platform.id)}
                  >
                    {platform.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Schedule */}
            <div>
              <Label htmlFor="schedule">Schedule</Label>
              <Select value={scheduleTime} onValueChange={setScheduleTime}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="now">Post Now</SelectItem>
                  <SelectItem value="1hour">1 Hour Later</SelectItem>
                  <SelectItem value="custom">Schedule Later</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Template Type */}
            <div>
              <Label htmlFor="template">Template Type</Label>
              <TemplateSelector 
                value={templateType} 
                onChange={setTemplateType}
                selectedNiche={selectedNiche}
              />
            </div>

            {/* Tone */}
            <div>
              <Label htmlFor="tone">Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Generate Button */}
            <Button 
              className="w-full h-12 text-lg font-semibold"
              onClick={handleGenerateContent}
              disabled={isGenerating || !selectedProduct}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                  Generating Content...
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5 mr-2" />
                  🚀 Generate Viral Content (60s)
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 3️⃣ Optional Hook Generator */}
      <Collapsible open={isHookGeneratorOpen} onOpenChange={setIsHookGeneratorOpen}>
        <Card className="shadow-lg">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-yellow-500" />
                  🎨 Viral Hook Generator (Optional)
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isHookGeneratorOpen ? 'rotate-180' : ''}`} />
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="custom-hook">Custom Hook</Label>
                  <Textarea
                    id="custom-hook"
                    value={customHook}
                    onChange={(e) => setCustomHook(e.target.value)}
                    placeholder="Enter a custom hook or leave blank for AI-generated..."
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* 4️⃣ Generated Content Output */}
      {generatedContent && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-green-500" />
              ✨ Generated Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Generated Content:</h4>
                <div className="text-sm text-gray-600 mb-2">
                  Template: {templateType} | Tone: {tone} | Niche: {selectedNiche}
                </div>
                <p className="whitespace-pre-wrap text-gray-900">{generatedContent.content}</p>
              </div>
              
              {generatedContent.hook && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Hook:</h4>
                  <p>{generatedContent.hook}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedContent.content);
                    toast({
                      title: "Copied!",
                      description: "Content copied to clipboard",
                    });
                  }}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy Content
                </Button>
                <Button size="sm" variant="outline">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit Hook
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleGenerateContent}
                  disabled={isGenerating}
                >
                  <RefreshCw className={`h-4 w-4 mr-1 ${isGenerating ? 'animate-spin' : ''}`} />
                  {isGenerating ? 'Generating...' : 'Regenerate'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GenerateContent;