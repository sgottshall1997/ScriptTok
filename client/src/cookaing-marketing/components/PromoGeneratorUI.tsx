import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Loader2, Plus, X, Copy, Download, Sparkles, Zap, History, Star, Clock } from 'lucide-react';

// Import shared schemas and types to prevent drift
import { PromoInputSchema, PromoInput, PromoOutput, CHANNEL_LABELS, OBJECTIVE_LABELS, TONE_LABELS } from '../../../../packages/cookaing-promo/schemas';

// Use shared schema without appName (added server-side)
const promoFormSchema = PromoInputSchema.omit({ appName: true });
type PromoFormData = Omit<PromoInput, 'appName'>;

// Use shared label constants to prevent drift
const channelLabels = CHANNEL_LABELS;
const objectiveLabels = OBJECTIVE_LABELS;

interface HistoryContent {
  id: number;
  title: string;
  channel: string;
  metadataJson: {
    niche?: string;
    platform?: string;
    tone?: string;
  };
  payloadJson: {
    platformCaptions?: Record<string, string>;
  };
  createdAt: string;
  topRatedStyleUsed: boolean;
}

interface RatingData {
  userScore: number;
  overallRating: number;
  instagramRating: number;
  tiktokRating: number;
  youtubeRating: number;
  twitterRating: number;
}

export default function PromoGeneratorUI() {
  const [generatedContent, setGeneratedContent] = useState<PromoOutput[]>([]);
  const [benefitsInput, setBenefitsInput] = useState('');
  const [featuresInput, setFeaturesInput] = useState('');
  const [proofsInput, setProofsInput] = useState('');
  const [activeTab, setActiveTab] = useState('generate');
  const [ratingContent, setRatingContent] = useState<{ [key: number]: RatingData }>({});
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<PromoFormData>({
    resolver: zodResolver(promoFormSchema),
    defaultValues: {
      audiencePersona: "home cooks and meal planning enthusiasts",
      keyBenefits: ["Save time cooking", "Plan meals easier", "Reduce food waste"],
      features: ["AI meal planning", "Recipe suggestions", "Shopping lists"],
      tone: "friendly",
      channels: ["tiktok_reel"],
      objective: "feature_highlight",
      ctaUrl: "https://cookaing.com",
      campaign: "cookaing-promo-campaign"
    }
  });

  // Query for content history
  const contentHistoryQuery = useQuery({
    queryKey: ['/api/cookaing-promo/history'],
    enabled: activeTab === 'history',
    staleTime: 30000 // 30 seconds
  });

  const generatePromoMutation = useMutation({
    mutationFn: async (data: PromoFormData) => {
      console.log('🚀 Sending promo generation request:', data);
      const response = await apiRequest('POST', `/api/cookaing-promo/generate`, {
        appName: "CookAIng",
        ...data
      });
      const result = await response.json() as PromoOutput[];
      console.log('✅ Promo generation response:', result);
      return result;
    },
    onSuccess: (data: PromoOutput[]) => {
      console.log('🎉 Generation successful:', data);
      setGeneratedContent(data);
      // Invalidate history query to refresh after new content generation
      queryClient.invalidateQueries({ queryKey: ['/api/cookaing-promo/history'] });
      toast({
        title: "✨ CookAIng Promo Generated!",
        description: `Successfully generated content for ${data.length} channel(s) using Spartan format.`
      });
    },
    onError: (error) => {
      toast({
        title: "❌ Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate promo content",
        variant: "destructive"
      });
    }
  });

  // Rating submission mutation
  const ratingMutation = useMutation({
    mutationFn: async ({ versionId, ratingData }: { versionId: number; ratingData: RatingData }) => {
      const response = await apiRequest('POST', `/api/cookaing-promo/rating`, {
        versionId,
        ratedBy: 'user',
        ...ratingData
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "⭐ Rating Saved!",
        description: "Your rating has been successfully recorded"
      });
      // Invalidate history query to refresh ratings
      queryClient.invalidateQueries({ queryKey: ['/api/cookaing-promo/history'] });
    },
    onError: (error) => {
      toast({
        title: "❌ Rating Failed",
        description: error instanceof Error ? error.message : "Failed to save rating",
        variant: "destructive"
      });
    }
  });

  const addArrayItem = (field: keyof PromoFormData, input: string, setInput: (value: string) => void) => {
    if (!input.trim()) return;
    
    const currentValue = form.getValues(field) as string[];
    const newValue = [...currentValue, input.trim()];
    form.setValue(field, newValue);
    setInput('');
  };

  const removeArrayItem = (field: keyof PromoFormData, index: number) => {
    const currentValue = form.getValues(field) as string[];
    const newValue = currentValue.filter((_, i) => i !== index);
    form.setValue(field, newValue);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "📋 Copied!",
      description: `${label} copied to clipboard`
    });
  };

  const downloadContent = () => {
    const dataStr = JSON.stringify(generatedContent, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `cookaing-promo-content-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const updateRating = (contentId: number, field: keyof RatingData, value: number) => {
    setRatingContent(prev => ({
      ...prev,
      [contentId]: {
        ...prev[contentId],
        [field]: value
      }
    }));
  };

  const submitRating = (contentId: number) => {
    const rating = ratingContent[contentId];
    if (!rating) return;
    
    ratingMutation.mutate({ versionId: contentId, ratingData: rating });
  };

  const RatingComponent = ({ contentId }: { contentId: number }) => {
    const rating = ratingContent[contentId] || {
      userScore: 0,
      overallRating: 0,
      instagramRating: 0,
      tiktokRating: 0,
      youtubeRating: 0,
      twitterRating: 0
    };

    return (
      <div className="border-t pt-3 mt-3">
        <h4 className="font-semibold text-sm text-muted-foreground mb-2">Rate this content:</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <label>Overall Score:</label>
            <Input
              type="number"
              min="0"
              max="100"
              value={rating.overallRating}
              onChange={(e) => updateRating(contentId, 'overallRating', parseInt(e.target.value) || 0)}
              className="h-6 text-xs"
            />
          </div>
          <div>
            <label>User Score:</label>
            <Input
              type="number"
              min="0"
              max="100"
              value={rating.userScore}
              onChange={(e) => updateRating(contentId, 'userScore', parseInt(e.target.value) || 0)}
              className="h-6 text-xs"
            />
          </div>
          <div>
            <label>Instagram:</label>
            <Input
              type="number"
              min="0"
              max="100"
              value={rating.instagramRating}
              onChange={(e) => updateRating(contentId, 'instagramRating', parseInt(e.target.value) || 0)}
              className="h-6 text-xs"
            />
          </div>
          <div>
            <label>TikTok:</label>
            <Input
              type="number"
              min="0"
              max="100"
              value={rating.tiktokRating}
              onChange={(e) => updateRating(contentId, 'tiktokRating', parseInt(e.target.value) || 0)}
              className="h-6 text-xs"
            />
          </div>
          <div>
            <label>YouTube:</label>
            <Input
              type="number"
              min="0"
              max="100"
              value={rating.youtubeRating}
              onChange={(e) => updateRating(contentId, 'youtubeRating', parseInt(e.target.value) || 0)}
              className="h-6 text-xs"
            />
          </div>
          <div>
            <label>Twitter:</label>
            <Input
              type="number"
              min="0"
              max="100"
              value={rating.twitterRating}
              onChange={(e) => updateRating(contentId, 'twitterRating', parseInt(e.target.value) || 0)}
              className="h-6 text-xs"
            />
          </div>
        </div>
        <Button
          size="sm"
          className="mt-2"
          onClick={() => submitRating(contentId)}
          disabled={ratingMutation.isPending}
          data-testid={`button-submit-rating-${contentId}`}
        >
          {ratingMutation.isPending ? (
            <>
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Star className="mr-1 h-3 w-3" />
              Save Rating
            </>
          )}
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-6" data-testid="promo-generator">
      <div className="flex items-center gap-2">
        <Sparkles className="h-6 w-6 text-orange-500" />
        <h2 className="text-2xl font-bold">CookAIng Promo Generator</h2>
        <Badge variant="secondary">Spartan Format</Badge>
      </div>
      
      <p className="text-muted-foreground">
        Generate professional promotional content for CookAIng using our proven Spartan format. 
        Create channel-specific content optimized for conversion and engagement.
      </p>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generate" data-testid="tab-generate">
            <Sparkles className="mr-2 h-4 w-4" />
            Generate Content
          </TabsTrigger>
          <TabsTrigger value="history" data-testid="tab-history">
            <History className="mr-2 h-4 w-4" />
            Content History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Content Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => generatePromoMutation.mutate(data))} className="space-y-4">
                
                {/* Audience Persona */}
                <FormField
                  control={form.control}
                  name="audiencePersona"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Audience</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="e.g., busy parents, meal prep enthusiasts"
                          data-testid="input-audience"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Objective */}
                <FormField
                  control={form.control}
                  name="objective"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marketing Objective</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-objective">
                            <SelectValue placeholder="Select objective" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(objectiveLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Channels */}
                <FormField
                  control={form.control}
                  name="channels"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Channels</FormLabel>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(channelLabels).map(([value, label]) => (
                          <div key={value} className="flex items-center space-x-2">
                            <Checkbox
                              id={value}
                              checked={field.value?.includes(value as any)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  field.onChange([...field.value, value]);
                                } else {
                                  field.onChange(field.value.filter(v => v !== value));
                                }
                              }}
                              data-testid={`checkbox-${value}`}
                            />
                            <label htmlFor={value} className="text-sm">{label}</label>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Tone */}
                <FormField
                  control={form.control}
                  name="tone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tone</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-tone">
                            <SelectValue placeholder="Select tone" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="friendly">Friendly</SelectItem>
                          <SelectItem value="expert">Expert</SelectItem>
                          <SelectItem value="punchy">Punchy</SelectItem>
                          <SelectItem value="playful">Playful</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Key Benefits */}
                <div className="space-y-2">
                  <FormLabel>Key Benefits</FormLabel>
                  <div className="flex gap-2">
                    <Input
                      value={benefitsInput}
                      onChange={(e) => setBenefitsInput(e.target.value)}
                      placeholder="Add a key benefit"
                      data-testid="input-benefits"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addArrayItem('keyBenefits', benefitsInput, setBenefitsInput);
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      onClick={() => addArrayItem('keyBenefits', benefitsInput, setBenefitsInput)}
                      data-testid="button-add-benefit"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {form.watch('keyBenefits')?.map((benefit, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {benefit}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => removeArrayItem('keyBenefits', index)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2">
                  <FormLabel>CookAIng Features</FormLabel>
                  <div className="flex gap-2">
                    <Input
                      value={featuresInput}
                      onChange={(e) => setFeaturesInput(e.target.value)}
                      placeholder="Add a CookAIng feature"
                      data-testid="input-features"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addArrayItem('features', featuresInput, setFeaturesInput);
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      onClick={() => addArrayItem('features', featuresInput, setFeaturesInput)}
                      data-testid="button-add-feature"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {form.watch('features')?.map((feature, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {feature}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => removeArrayItem('features', index)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Optional Fields */}
                <Separator />
                
                <FormField
                  control={form.control}
                  name="offer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Special Offer (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="e.g., 50% off first month, Free trial"
                          data-testid="input-offer"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ctaUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Call-to-Action URL</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="https://cookaing.com"
                          data-testid="input-cta-url"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="campaign"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Campaign Name</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="e.g., winter-2025-launch"
                          data-testid="input-campaign"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={generatePromoMutation.isPending}
                  data-testid="button-generate"
                >
                  {generatePromoMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating CookAIng Promo...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Promo Content
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Generated Content Display */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Generated Content</CardTitle>
            {generatedContent.length > 0 && (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={downloadContent}
                  data-testid="button-download"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {generatedContent.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Generated content will appear here</p>
                <p className="text-sm">Configure your promo settings and click generate</p>
              </div>
            ) : (
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {generatedContent.map((content, index) => (
                    <Card key={content.id} className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {channelLabels[content.channel as keyof typeof channelLabels]}
                          </Badge>
                          <Badge variant="secondary">
                            {objectiveLabels[content.objective as keyof typeof objectiveLabels]}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {content.metadata.wordCount} words
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(content.body, `${content.channel} content`)}
                          data-testid={`button-copy-${index}`}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {content.title && (
                        <div className="mb-2">
                          <h4 className="font-semibold text-sm text-muted-foreground">Title:</h4>
                          <p className="font-medium">{content.title}</p>
                        </div>
                      )}
                      
                      {content.hook && (
                        <div className="mb-2">
                          <h4 className="font-semibold text-sm text-muted-foreground">Hook:</h4>
                          <p className="font-medium text-orange-600">{content.hook}</p>
                        </div>
                      )}
                      
                      <div className="mb-3">
                        <h4 className="font-semibold text-sm text-muted-foreground mb-1">Content:</h4>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">{content.body}</p>
                      </div>
                      
                      {content.hashtags && content.hashtags.length > 0 && (
                        <div className="mb-2">
                          <h4 className="font-semibold text-sm text-muted-foreground">Hashtags:</h4>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {content.hashtags.map((tag, i) => (
                              <Badge key={i} variant="outline" className="text-xs">#{tag}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="border-t pt-3 mt-3">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                          <span>Call-to-Action</span>
                          <span>{new Date(content.timestamp).toLocaleString()}</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{content.cta.text}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(content.cta.utmUrl, 'UTM-tracked URL')}
                              data-testid={`button-copy-url-${index}`}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            <span className="font-mono bg-muted px-1 py-0.5 rounded">{content.cta.utmUrl}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Content History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {contentHistoryQuery.isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  Loading content history...
                </div>
              ) : contentHistoryQuery.error ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Failed to load content history</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => contentHistoryQuery.refetch()}
                  >
                    Retry
                  </Button>
                </div>
              ) : !(contentHistoryQuery.data as any)?.data || (contentHistoryQuery.data as any)?.data?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No content generated yet</p>
                  <p className="text-sm">Switch to the Generate tab to create your first content</p>
                </div>
              ) : (
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {((contentHistoryQuery.data as any)?.data || []).map((content: HistoryContent) => (
                      <Card key={content.id} className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {content.channel}
                            </Badge>
                            {content.metadataJson?.niche && (
                              <Badge variant="secondary">
                                {content.metadataJson.niche}
                              </Badge>
                            )}
                            {content.topRatedStyleUsed && (
                              <Badge variant="default" className="bg-green-500">
                                Top Rated Style
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {new Date(content.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const captionText = Object.values(content.payloadJson?.platformCaptions || {}).join('\n\n');
                              copyToClipboard(captionText, 'Content');
                            }}
                            data-testid={`button-copy-history-${content.id}`}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="mb-3">
                          <h4 className="font-semibold text-sm text-muted-foreground mb-1">Title:</h4>
                          <p className="font-medium">{content.title}</p>
                        </div>
                        
                        {content.payloadJson?.platformCaptions && (
                          <div className="mb-3">
                            <h4 className="font-semibold text-sm text-muted-foreground mb-1">Platform Content:</h4>
                            <div className="space-y-2">
                              {Object.entries(content.payloadJson.platformCaptions).map(([platform, caption]) => (
                                <div key={platform} className="border rounded p-2">
                                  <Badge variant="outline" className="mb-1 text-xs">{platform}</Badge>
                                  <p className="text-sm whitespace-pre-wrap">{caption}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <RatingComponent contentId={content.id} />
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}