import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Sparkles, 
  Play, 
  Eye, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  FileText,
  Video,
  Mail,
  Bell,
  Image as ImageIcon,
  ShoppingBag,
  Link as LinkIcon,
  Loader2,
  Copy,
  ExternalLink
} from "lucide-react";
import InstructionFooter from '@/cookaing-marketing/components/InstructionFooter';

interface ContentBlueprint {
  id: number;
  name: string;
  kind: string;
  category: string;
  description: string;
  configJson: any;
}

interface ContentJob {
  id: number;
  recipeId?: number;
  sourceType: string;
  blueprintId: number;
  status: string;
  inputsJson: any;
  outputsJson?: any;
  errorsJson?: any;
  createdAt: string;
  updatedAt: string;
  blueprintName?: string;
  blueprintKind?: string;
}

interface Campaign {
  id: number;
  name: string;
  status: string;
  description?: string;
}

const CookAIngContentGenerator = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for form inputs
  const [sourceType, setSourceType] = useState<'recipe' | 'freeform'>('recipe');
  const [recipeId, setRecipeId] = useState<number>(0);
  const [freeformText, setFreeformText] = useState('');
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<number>(0);
  const [contentOptions, setContentOptions] = useState({
    persona: 'Chef' as const,
    tone: 'Friendly' as const,
    platform: 'TikTok' as const,
    duration: '30s' as const,
    cta: 'App install' as const,
  });
  const [linkToCampaignId, setLinkToCampaignId] = useState<number>(0);
  const [previewContent, setPreviewContent] = useState<string>('');

  // API queries
  const { data: blueprintsResponse, isLoading: blueprintsLoading } = useQuery<{success: boolean, blueprints: ContentBlueprint[]}>({
    queryKey: ['/api/cookaing-marketing/content/blueprints'],
  });

  const { data: jobsResponse, isLoading: jobsLoading, refetch: refetchJobs } = useQuery<{success: boolean, jobs: ContentJob[]}>({
    queryKey: ['/api/cookaing-marketing/content/jobs'],
  });

  const { data: campaigns } = useQuery<Campaign[]>({
    queryKey: ['/api/cookaing-marketing/campaigns'],
  });

  // Extract data from API responses
  const blueprints = blueprintsResponse?.blueprints || [];
  const jobs = jobsResponse?.jobs || [];

  // Mutations
  const previewMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/cookaing-marketing/content/preview', data);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setPreviewContent(data.content);
        toast({
          title: "Preview Generated",
          description: "Content preview generated successfully",
        });
      } else {
        toast({
          title: "Preview Failed",
          description: data.error || "Failed to generate preview",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Preview Error",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    },
  });

  const generateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/cookaing-marketing/content/generate', data);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        refetchJobs();
        toast({
          title: "Content Generated",
          description: "Content generation job created successfully",
        });
        // Clear form
        setPreviewContent('');
        setFreeformText('');
        setRecipeId(0);
        setSelectedBlueprintId(0);
      } else {
        toast({
          title: "Generation Failed",
          description: data.error || "Failed to generate content",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Generation Error", 
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    },
  });

  const handlePreview = () => {
    if (!selectedBlueprintId) {
      toast({
        title: "Blueprint Required",
        description: "Please select a content blueprint",
        variant: "destructive",
      });
      return;
    }

    if (sourceType === 'recipe' && !recipeId) {
      toast({
        title: "Recipe ID Required", 
        description: "Please enter a recipe ID",
        variant: "destructive",
      });
      return;
    }

    if (sourceType === 'freeform' && !freeformText.trim()) {
      toast({
        title: "Content Required",
        description: "Please enter some content for freeform generation", 
        variant: "destructive",
      });
      return;
    }

    const previewData = {
      sourceType,
      ...(sourceType === 'recipe' && { recipeId }),
      ...(sourceType === 'freeform' && { freeformText }),
      blueprintId: selectedBlueprintId,
      options: contentOptions,
    };

    previewMutation.mutate(previewData);
  };

  const handleGenerate = () => {
    if (!selectedBlueprintId) {
      toast({
        title: "Blueprint Required",
        description: "Please select a content blueprint",
        variant: "destructive",
      });
      return;
    }

    const generateData = {
      sourceType,
      ...(sourceType === 'recipe' && { recipeId }),
      ...(sourceType === 'freeform' && { freeformText }),
      blueprintId: selectedBlueprintId,
      options: contentOptions,
      persist: true,
      ...(linkToCampaignId && { linkToCampaignId }),
    };

    generateMutation.mutate(generateData);
  };

  const getBlueprintIcon = (kind: string) => {
    switch (kind) {
      case 'video_script_short':
      case 'video_script_long':
        return Video;
      case 'blog_recipe':
        return FileText;
      case 'email_campaign':
        return Mail;
      case 'push_notification':
        return Bell;
      case 'carousel_step':
        return ImageIcon;
      case 'affiliate_insert':
        return ShoppingBag;
      default:
        return Sparkles;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default' as const;
      case 'failed':
        return 'destructive' as const;
      case 'processing':
        return 'secondary' as const;
      default:
        return 'outline' as const;
    }
  };

  const mockRecipes = [
    { id: 1, title: "Classic Chocolate Chip Cookies" },
    { id: 2, title: "Creamy Chicken Alfredo Pasta" },
    { id: 3, title: "Homemade Pizza Margherita" },
    { id: 4, title: "Fresh Garden Salad with Vinaigrette" },
    { id: 5, title: "BBQ Pulled Pork Sandwiches" },
  ];

  return (
    <div className="space-y-6" data-testid="content-generator-page">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          CookAIng Unified Content Generator
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Transform recipes into engaging content across multiple formats and platforms
        </p>
      </div>

      <Tabs defaultValue="generate" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generate" data-testid="tab-generate">Generate Content</TabsTrigger>
          <TabsTrigger value="history" data-testid="tab-history">Content History</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Configuration Panel */}
            <div className="lg:col-span-2 space-y-6">
              {/* Source Selection */}
              <Card data-testid="card-source-selection">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Content Source
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="recipe"
                        checked={sourceType === 'recipe'}
                        onCheckedChange={() => setSourceType('recipe')}
                        data-testid="radio-recipe"
                      />
                      <Label htmlFor="recipe">Recipe-based</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="freeform"
                        checked={sourceType === 'freeform'}
                        onCheckedChange={() => setSourceType('freeform')}
                        data-testid="radio-freeform"
                      />
                      <Label htmlFor="freeform">Freeform Content</Label>
                    </div>
                  </div>

                  {sourceType === 'recipe' && (
                    <div className="space-y-2">
                      <Label htmlFor="recipeId">Recipe ID</Label>
                      <Select onValueChange={(value) => setRecipeId(parseInt(value))}>
                        <SelectTrigger data-testid="select-recipe">
                          <SelectValue placeholder="Select a recipe" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockRecipes.map((recipe) => (
                            <SelectItem key={recipe.id} value={recipe.id.toString()}>
                              {recipe.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {sourceType === 'freeform' && (
                    <div className="space-y-2">
                      <Label htmlFor="freeformText">Content Input</Label>
                      <Textarea
                        id="freeformText"
                        placeholder="Enter your content ideas, ingredients, cooking tips, or any food-related content..."
                        value={freeformText}
                        onChange={(e) => setFreeformText(e.target.value)}
                        className="min-h-24"
                        data-testid="textarea-freeform"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Blueprint Selection */}
              <Card data-testid="card-blueprint-selection">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Content Blueprint
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {blueprintsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {blueprints?.map((blueprint) => {
                        const Icon = getBlueprintIcon(blueprint.kind);
                        return (
                          <div
                            key={blueprint.id}
                            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                              selectedBlueprintId === blueprint.id
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setSelectedBlueprintId(blueprint.id)}
                            data-testid={`blueprint-${blueprint.id}`}
                          >
                            <div className="flex items-center gap-3">
                              <Icon className="w-5 h-5" />
                              <div className="flex-1">
                                <h3 className="font-medium">{blueprint.name}</h3>
                                <p className="text-sm text-gray-600">{blueprint.description}</p>
                              </div>
                              <Badge variant="outline">{blueprint.category}</Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Content Options */}
              <Card data-testid="card-content-options">
                <CardHeader>
                  <CardTitle>Content Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Persona</Label>
                      <Select value={contentOptions.persona} onValueChange={(value: any) => setContentOptions({...contentOptions, persona: value})}>
                        <SelectTrigger data-testid="select-persona">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Chef">Chef</SelectItem>
                          <SelectItem value="Busy Parent">Busy Parent</SelectItem>
                          <SelectItem value="College">College</SelectItem>
                          <SelectItem value="Vegan">Vegan</SelectItem>
                          <SelectItem value="Athlete">Athlete</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Tone</Label>
                      <Select value={contentOptions.tone} onValueChange={(value: any) => setContentOptions({...contentOptions, tone: value})}>
                        <SelectTrigger data-testid="select-tone">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Friendly">Friendly</SelectItem>
                          <SelectItem value="Expert">Expert</SelectItem>
                          <SelectItem value="Playful">Playful</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Platform</Label>
                      <Select value={contentOptions.platform} onValueChange={(value: any) => setContentOptions({...contentOptions, platform: value})}>
                        <SelectTrigger data-testid="select-platform">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TikTok">TikTok</SelectItem>
                          <SelectItem value="Reel">Instagram Reel</SelectItem>
                          <SelectItem value="Shorts">YouTube Shorts</SelectItem>
                          <SelectItem value="YouTubeLong">YouTube Long</SelectItem>
                          <SelectItem value="Instagram">Instagram</SelectItem>
                          <SelectItem value="Blog">Blog</SelectItem>
                          <SelectItem value="Email">Email</SelectItem>
                          <SelectItem value="Push">Push</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Duration</Label>
                      <Select value={contentOptions.duration} onValueChange={(value: any) => setContentOptions({...contentOptions, duration: value})}>
                        <SelectTrigger data-testid="select-duration">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15s">15 seconds</SelectItem>
                          <SelectItem value="30s">30 seconds</SelectItem>
                          <SelectItem value="60s">60 seconds</SelectItem>
                          <SelectItem value="3m">3 minutes</SelectItem>
                          <SelectItem value="8m">8 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Call to Action</Label>
                    <Select value={contentOptions.cta} onValueChange={(value: any) => setContentOptions({...contentOptions, cta: value})}>
                      <SelectTrigger data-testid="select-cta">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="App install">App Install</SelectItem>
                        <SelectItem value="Pantry feature">Pantry Feature</SelectItem>
                        <SelectItem value="Affiliate pick">Affiliate Pick</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {campaigns && campaigns.length > 0 && (
                    <div className="space-y-2">
                      <Label>Link to Campaign (Optional)</Label>
                      <Select onValueChange={(value) => setLinkToCampaignId(parseInt(value) || 0)}>
                        <SelectTrigger data-testid="select-campaign">
                          <SelectValue placeholder="Select a campaign" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">No campaign</SelectItem>
                          {campaigns.map((campaign) => (
                            <SelectItem key={campaign.id} value={campaign.id.toString()}>
                              {campaign.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  onClick={handlePreview}
                  variant="outline"
                  disabled={previewMutation.isPending}
                  className="flex items-center gap-2"
                  data-testid="button-preview"
                >
                  {previewMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                  Preview
                </Button>
                <Button
                  onClick={handleGenerate}
                  disabled={generateMutation.isPending}
                  className="flex items-center gap-2"
                  data-testid="button-generate"
                >
                  {generateMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  Generate Content
                </Button>
              </div>
            </div>

            {/* Preview Panel */}
            <div>
              <Card data-testid="card-preview">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Content Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {previewContent ? (
                    <div className="space-y-4">
                      <ScrollArea className="h-64 w-full rounded border p-4">
                        <pre className="text-sm whitespace-pre-wrap">{previewContent}</pre>
                      </ScrollArea>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigator.clipboard.writeText(previewContent)}
                        className="w-full"
                        data-testid="button-copy-preview"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Preview
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Click "Preview" to see generated content</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card data-testid="card-job-history">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Content Generation History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {jobsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : jobs && jobs.length > 0 ? (
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                      data-testid={`job-${job.id}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(job.status)}
                          <Badge variant={getStatusBadgeVariant(job.status)}>
                            {job.status}
                          </Badge>
                        </div>
                        <div>
                          <div className="font-medium">
                            {job.blueprintName || `Blueprint ${job.blueprintId}`}
                          </div>
                          <div className="text-sm text-gray-500">
                            {job.sourceType === 'recipe' ? `Recipe #${job.recipeId}` : 'Freeform content'}
                            {' • '}
                            {new Date(job.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      {job.status === 'completed' && job.outputsJson && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const content = typeof job.outputsJson === 'string' 
                              ? job.outputsJson 
                              : JSON.stringify(job.outputsJson, null, 2);
                            navigator.clipboard.writeText(content);
                            toast({
                              title: "Copied",
                              description: "Content copied to clipboard",
                            });
                          }}
                          data-testid={`button-copy-job-${job.id}`}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No content generation jobs yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <InstructionFooter 
        title="CookAIng Unified Content Generator"
        whatIsIt="Transform recipes into engaging multi-platform content using AI-powered blueprints and customizable options. Generate video scripts, blog posts, emails, push notifications, and social media content from recipe data or freeform input."
        setupSteps={[
          "Select content source (recipe-based or freeform text input)",
          "Choose a content blueprint that matches your desired output format",
          "Configure content options (persona, tone, platform, duration, CTA)",
          "Optionally link to an existing campaign for content organization"
        ]}
        usageSteps={[
          "Preview content before generating to verify it meets your needs",
          "Generate final content which will be saved to job history",
          "Monitor generation jobs in the Content History tab",
          "Copy completed content from the history for use in your campaigns",
          "Link generated content to campaigns for automated distribution"
        ]}
        envKeys={["OPENAI_API_KEY", "ANTHROPIC_API_KEY"]}
        featureFlags={["CONTENT_GENERATION_ENABLED", "CAMPAIGN_INTEGRATION_ENABLED"]}
        relatedLinks={[
          { label: "View Campaigns", href: "/cookaing-marketing/campaigns" },
          { label: "Affiliate Products", href: "/cookaing-marketing/affiliate-products" },
          { label: "Marketing Reports", href: "/cookaing-marketing/reports" }
        ]}
        notes={[
          "Content generation uses multiple AI models for optimal results",
          "Generated content is automatically optimized for each target platform",
          "Campaign integration allows for seamless content distribution workflows"
        ]}
      />
    </div>
  );
};

export default CookAIngContentGenerator;