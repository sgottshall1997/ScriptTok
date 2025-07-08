import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
  ChevronDown,
  ChevronRight,
  Sparkles,
  Users,
  BarChart3,
  Globe,
  DollarSign
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

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

const CONTENT_TEMPLATES = [
  'Product Review', 'Viral Hook', 'Short-Form Video Script', 
  'Instagram Story', 'YouTube Description', 'TikTok Caption',
  'Tutorial Guide', 'Before/After', 'Unboxing Experience'
];

const PLATFORMS = [
  { id: 'tiktok', name: 'TikTok', color: 'bg-black text-white' },
  { id: 'instagram', name: 'Instagram', color: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' },
  { id: 'youtube', name: 'YouTube', color: 'bg-red-600 text-white' },
  { id: 'twitter', name: 'Twitter', color: 'bg-blue-500 text-white' },
];

interface AutomatedBulkGeneratorProps {
  onJobCreated?: (jobData: any) => void;
}

export default function AutomatedBulkGenerator({ onJobCreated }: AutomatedBulkGeneratorProps) {
  const [selectedNiches, setSelectedNiches] = useState<string[]>(['beauty', 'fitness', 'tech']);
  const [selectedTones, setSelectedTones] = useState<string[]>(['Friendly', 'Enthusiastic']);
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>(['Product Review', 'Viral Hook', 'Short-Form Video Script']);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['tiktok', 'instagram', 'youtube']);
  const [useExistingProducts, setUseExistingProducts] = useState(true);
  const [generateAffiliateLinks, setGenerateAffiliateLinks] = useState(false);
  const [affiliateId, setAffiliateId] = useState('sgottshall107-20');
  const [useManualAffiliateLinks, setUseManualAffiliateLinks] = useState(false);
  const [manualAffiliateLinks, setManualAffiliateLinks] = useState<Record<string, string>>({});
  const [scheduleAfterGeneration, setScheduleAfterGeneration] = useState(false);
  const [makeWebhookUrl, setMakeWebhookUrl] = useState('');
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const startAutomatedBulkMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/automated-bulk/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

  const calculateTotalVariations = () => {
    return selectedNiches.length * selectedTones.length * selectedTemplates.length;
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

    if (selectedTones.length === 0 || selectedTemplates.length === 0 || selectedPlatforms.length === 0) {
      toast({
        title: "❌ Incomplete Selection",
        description: "Please select at least one tone, template, and platform",
        variant: "destructive",
      });
      return;
    }

    const bulkData = {
      selectedNiches,
      tones: selectedTones,
      templates: selectedTemplates,
      platforms: selectedPlatforms,
      useExistingProducts,
      generateAffiliateLinks,
      affiliateId: generateAffiliateLinks && !useManualAffiliateLinks ? affiliateId : undefined,
      useManualAffiliateLinks,
      manualAffiliateLinks: useManualAffiliateLinks ? manualAffiliateLinks : undefined,
      scheduleAfterGeneration,
      makeWebhookUrl: makeWebhookUrl || undefined,
    };

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
            </div>
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
              {CONTENT_TEMPLATES.map((template) => (
                <div key={template} className="flex items-center space-x-2">
                  <Checkbox
                    id={`template-${template}`}
                    checked={selectedTemplates.includes(template)}
                    onCheckedChange={() => handleTemplateToggle(template)}
                  />
                  <Label htmlFor={`template-${template}`} className="text-sm cursor-pointer">
                    {template}
                  </Label>
                </div>
              ))}
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
                <p className="text-2xl font-bold text-green-600">{selectedTones.length * selectedTemplates.length}</p>
                <p className="text-sm text-gray-600">Variations per Product</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">{calculateTotalVariations()}</p>
                <p className="text-sm text-gray-600">Total Content Pieces</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Options */}
        <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
          <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium hover:text-purple-600">
            {isAdvancedOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            Advanced Options
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="schedule-after"
                    checked={scheduleAfterGeneration}
                    onCheckedChange={setScheduleAfterGeneration}
                  />
                  <Label htmlFor="schedule-after">Schedule after generation</Label>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="webhook-url">Make.com Webhook URL</Label>
                <Input
                  id="webhook-url"
                  type="url"
                  placeholder="https://hook.make.com/..."
                  value={makeWebhookUrl}
                  onChange={(e) => setMakeWebhookUrl(e.target.value)}
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

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