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
  ExternalLink,
  Star,
  Filter,
  Search,
  Trophy,
  Download,
  ThumbsUp,
  ThumbsDown,
  BarChart3,
  Target,
  Zap,
  Brain
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

// CookAIng Content History & Rating interfaces
interface ContentVersion {
  id: number;
  campaignId?: number;
  recipeId?: number;
  sourceJobId?: number;
  channel: string;
  platform?: string;
  title?: string;
  summary?: string;
  niche?: string;
  template?: string;
  model?: string;
  metadataJson: any;
  payloadJson: any;
  createdBy?: string;
  createdAt: string;
  version: number;
}

interface ContentRating {
  id: number;
  versionId: number;
  userScore?: number; // 1-100
  aiVirality?: number; // 1-10
  aiClarity?: number; // 1-10
  aiPersuasiveness?: number; // 1-10
  aiCreativity?: number; // 1-10
  thumb?: 'up' | 'down';
  reasons?: string[];
  notes?: string;
  isWinner: boolean;
  createdBy?: string;
  createdAt: string;
}

interface ContentVersionWithRating extends ContentVersion {
  ratings?: ContentRating[];
  avgUserScore?: number;
  ratingCount?: number;
}

// Content History & Rating Panel Component
const ContentHistoryPanel = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for filters
  const [nicheFilter, setNicheFilter] = useState("");
  const [templateFilter, setTemplateFilter] = useState("");
  const [platformFilter, setPlatformFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnlyWinners, setShowOnlyWinners] = useState(false);
  
  // State for rating modal
  const [selectedVersion, setSelectedVersion] = useState<ContentVersion | null>(null);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [userScore, setUserScore] = useState<number>(80);
  const [ratingNotes, setRatingNotes] = useState("");
  
  // Fetch content versions with filters
  const { data: contentVersions, isLoading: versionsLoading } = useQuery({
    queryKey: ["content-versions", { niche: nicheFilter, template: templateFilter, platform: platformFilter, winners: showOnlyWinners, search: searchQuery }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (nicheFilter && nicheFilter !== "all") params.append("niche", nicheFilter);
      if (templateFilter && templateFilter !== "all") params.append("template", templateFilter);
      if (platformFilter && platformFilter !== "all") params.append("platform", platformFilter);
      if (showOnlyWinners) params.append("winners", "true");
      if (searchQuery.trim()) params.append("search", searchQuery.trim());
      params.append("limit", "50");
      
      const response = await fetch(`/api/cookaing-marketing/content/versions?${params}`);
      if (!response.ok) throw new Error("Failed to fetch content versions");
      return response.json();
    }
  });
  
  // Fetch top-rated content
  const { data: topRatedContent } = useQuery({
    queryKey: ["top-rated-content", { limit: 10 }],
    queryFn: async () => {
      const response = await fetch("/api/cookaing-marketing/content/top-rated?limit=10");
      if (!response.ok) throw new Error("Failed to fetch top-rated content");
      return response.json();
    }
  });
  
  // Create content rating mutation
  const createRatingMutation = useMutation({
    mutationFn: async (ratingData: any) => {
      return apiRequest("/api/cookaing-marketing/content/ratings", {
        method: "POST",
        body: JSON.stringify(ratingData)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content-versions"] });
      queryClient.invalidateQueries({ queryKey: ["top-rated-content"] });
      toast({
        title: "Rating Saved",
        description: "Your content rating has been saved successfully"
      });
      setRatingModalOpen(false);
      setSelectedVersion(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to save rating: " + (error.message || "Unknown error"),
        variant: "destructive"
      });
    }
  });
  
  // Handle rating submission
  const handleSubmitRating = () => {
    if (!selectedVersion) return;
    
    const ratingData = {
      versionId: selectedVersion.id,
      userScore,
      notes: ratingNotes || undefined,
      isWinner: userScore >= 90,
      createdBy: "user"
    };
    
    createRatingMutation.mutate(ratingData);
  };
  
  // Handle export
  const handleExport = async (format: 'json' | 'csv' | 'markdown') => {
    try {
      const versionIds = contentVersions?.contentVersions?.map((v: ContentVersion) => v.id) || [];
      
      const response = await apiRequest("/api/cookaing-marketing/content/bulk-export", {
        method: "POST",
        body: JSON.stringify({ versionIds, format })
      });
      
      // Create and download file
      const blob = new Blob([response.exportData], { 
        type: format === 'json' ? 'application/json' : 'text/plain' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `content-history.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export Complete",
        description: `Content exported as ${format.toUpperCase()}`
      });
    } catch (error: any) {
      toast({
        title: "Export Failed", 
        description: error.message || "Unknown error",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Filters & Search */}
      <Card data-testid="card-content-filters">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Content History & Rating System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <Label htmlFor="niche-filter">Niche</Label>
              <Select value={nicheFilter} onValueChange={setNicheFilter}>
                <SelectTrigger data-testid="select-niche-filter">
                  <SelectValue placeholder="All niches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All niches</SelectItem>
                  <SelectItem value="fitness">Fitness</SelectItem>
                  <SelectItem value="beauty">Beauty</SelectItem>
                  <SelectItem value="tech">Tech</SelectItem>
                  <SelectItem value="food">Food</SelectItem>
                  <SelectItem value="travel">Travel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="template-filter">Template</Label>
              <Select value={templateFilter} onValueChange={setTemplateFilter}>
                <SelectTrigger data-testid="select-template-filter">
                  <SelectValue placeholder="All templates" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All templates</SelectItem>
                  <SelectItem value="tiktok_script">TikTok Script</SelectItem>
                  <SelectItem value="instagram_post">Instagram Post</SelectItem>
                  <SelectItem value="youtube_script">YouTube Script</SelectItem>
                  <SelectItem value="blog_post">Blog Post</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="platform-filter">Platform</Label>
              <Select value={platformFilter} onValueChange={setPlatformFilter}>
                <SelectTrigger data-testid="select-platform-filter">
                  <SelectValue placeholder="All platforms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All platforms</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="twitter">Twitter</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end gap-2">
              <Button
                variant="outline"
                onClick={() => handleExport('json')}
                className="flex-1"
                data-testid="button-export-json"
              >
                <Download className="w-4 h-4 mr-2" />
                Export JSON
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="search-query">Search Content</Label>
              <Input
                id="search-query"
                placeholder="Search by title, content, or niche..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search-query"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="show-winners"
                checked={showOnlyWinners}
                onCheckedChange={(checked) => setShowOnlyWinners(!!checked)}
                data-testid="checkbox-show-winners"
              />
              <Label htmlFor="show-winners" className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-500" />
                Show only winners
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Content Versions List */}
      <Card data-testid="card-content-versions">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Content Versions
            </span>
            <Badge variant="secondary">
              {contentVersions?.count || 0} versions
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {versionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="ml-2">Loading content history...</span>
            </div>
          ) : contentVersions?.contentVersions?.length > 0 ? (
            <div className="space-y-4">
              {contentVersions.contentVersions.map((version: ContentVersionWithRating) => (
                <div
                  key={version.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  data-testid={`content-version-${version.id}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{version.title || `${version.channel} Content`}</h3>
                        {version.avgUserScore && version.avgUserScore >= 90 && (
                          <Trophy className="w-4 h-4 text-yellow-500" />
                        )}
                        <Badge variant="outline">v{version.version}</Badge>
                        {version.platform && (
                          <Badge variant="secondary">{version.platform}</Badge>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Channel:</span> {version.channel}
                        {version.niche && (
                          <>
                            {' • '}
                            <span className="font-medium">Niche:</span> {version.niche}
                          </>
                        )}
                        {version.template && (
                          <>
                            {' • '}
                            <span className="font-medium">Template:</span> {version.template}
                          </>
                        )}
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        Created: {new Date(version.createdAt).toLocaleDateString()} • 
                        Model: {version.model || 'Unknown'}
                      </div>
                      
                      {/* Rating Summary */}
                      {version.avgUserScore && (
                        <div className="flex items-center gap-4 mt-3 p-2 bg-blue-50 rounded-lg">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="font-medium">{version.avgUserScore}/100</span>
                          </div>
                          <span className="text-sm text-gray-600">
                            {version.ratingCount} rating{version.ratingCount !== 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedVersion(version);
                          setRatingModalOpen(true);
                        }}
                        data-testid={`button-rate-${version.id}`}
                      >
                        <Star className="w-4 h-4 mr-1" />
                        Rate
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const content = JSON.stringify(version.payloadJson, null, 2);
                          navigator.clipboard.writeText(content);
                          toast({
                            title: "Copied",
                            description: "Content copied to clipboard"
                          });
                        }}
                        data-testid={`button-copy-${version.id}`}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No content versions found</p>
              <p className="text-sm">Generate some content to see it here</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Top Rated Content */}
      {topRatedContent?.topRatedContent?.length > 0 && (
        <Card data-testid="card-top-rated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Top Rated Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topRatedContent.topRatedContent.slice(0, 4).map((content: any) => (
                <div
                  key={content.id}
                  className="p-3 border rounded-lg bg-gradient-to-br from-yellow-50 to-orange-50"
                  data-testid={`top-rated-${content.id}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{content.title || content.channel}</h4>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="font-bold text-sm">{content.avgUserScore}</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600">
                    {content.niche} • {content.platform} • {content.ratingCount} ratings
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Rating Modal */}
      {ratingModalOpen && selectedVersion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Rate Content</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRatingModalOpen(false)}
                data-testid="button-close-rating-modal"
              >
                <XCircle className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="user-score">User Score (1-100)</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="range"
                    id="user-score"
                    min="1"
                    max="100"
                    value={userScore}
                    onChange={(e) => setUserScore(parseInt(e.target.value))}
                    className="flex-1"
                    data-testid="slider-user-score"
                  />
                  <span className="font-bold text-lg min-w-[3rem]">{userScore}</span>
                </div>
              </div>
              
              <div>
                <Label htmlFor="rating-notes">Notes (Optional)</Label>
                <Textarea
                  id="rating-notes"
                  placeholder="Add any notes about this content..."
                  value={ratingNotes}
                  onChange={(e) => setRatingNotes(e.target.value)}
                  className="mt-1"
                  data-testid="textarea-rating-notes"
                />
              </div>
              
              {/* AI Evaluation Preview */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  AI Evaluation (Auto-generated on save)
                </h4>
                <div className="text-xs text-gray-600">
                  AI will automatically evaluate this content for virality, clarity, persuasiveness, and creativity when you save your rating.
                </div>
              </div>
              
              <div className="flex items-center gap-2 pt-2">
                <Button
                  onClick={handleSubmitRating}
                  disabled={createRatingMutation.isPending}
                  className="flex-1"
                  data-testid="button-submit-rating"
                >
                  {createRatingMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Star className="w-4 h-4 mr-2" />
                      Save Rating
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setRatingModalOpen(false)}
                  data-testid="button-cancel-rating"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

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
          <ContentHistoryPanel />
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