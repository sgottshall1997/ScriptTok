import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import {
  ArrowLeft,
  Calendar,
  Share2,
  Target,
  Users,
  Hash,
  Clock,
  Send,
  Eye,
  Loader2,
  ChevronRight,
  TrendingUp,
  MessageSquare,
  Heart,
  UserPlus,
  Copy,
  Settings
} from "lucide-react";

// Import types from schema
interface Campaign {
  id: number;
  orgId: number;
  type: string;
  name: string;
  status: string;
  scheduledAt?: string | null;
  metaJson?: any;
  createdAt: string;
  updatedAt: string;
}

interface CampaignArtifact {
  id: number;
  campaignId: number;
  channel: string;
  payloadJson: any;
  variant: string;
  createdAt: string;
}

// Social Action form schemas
const socialPostSchema = z.object({
  platform: z.enum(['instagram', 'twitter', 'youtube', 'facebook']),
  caption: z.string().min(1, "Caption is required").max(2000, "Caption too long"),
  hashtags: z.string().optional(),
  scheduledAt: z.string().optional(),
});

const hashtagResearchSchema = z.object({
  topic: z.string().min(1, "Topic is required"),
  platform: z.enum(['instagram', 'twitter', 'youtube', 'facebook']),
  category: z.string().optional(),
});

type SocialPostForm = z.infer<typeof socialPostSchema>;
type HashtagResearchForm = z.infer<typeof hashtagResearchSchema>;

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const variants: Record<string, string> = {
    draft: "bg-gray-100 text-gray-800",
    scheduled: "bg-blue-100 text-blue-800", 
    sent: "bg-green-100 text-green-800",
    active: "bg-green-100 text-green-800",
    paused: "bg-yellow-100 text-yellow-800",
    completed: "bg-purple-100 text-purple-800"
  };

  return (
    <Badge className={variants[status] || "bg-gray-100 text-gray-800"}>
      {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}
    </Badge>
  );
};

// Platform icon component
const PlatformIcon = ({ platform }: { platform: string }) => {
  // Use simple colored circles with platform initials as fallback
  const platformConfig: Record<string, { initial: string; color: string }> = {
    instagram: { initial: 'IG', color: 'bg-pink-500' },
    twitter: { initial: 'X', color: 'bg-blue-500' },
    youtube: { initial: 'YT', color: 'bg-red-500' },
    facebook: { initial: 'FB', color: 'bg-blue-600' },
  };
  
  const config = platformConfig[platform];
  
  if (config) {
    return (
      <div className={`w-4 h-4 rounded-full ${config.color} flex items-center justify-center text-white text-xs font-bold`}>
        {config.initial}
      </div>
    );
  }
  
  return <Share2 className="w-4 h-4" />;
};

// Social Actions Panel Component
const SocialActionsPanel = ({ campaign }: { campaign: Campaign }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form setup
  const socialPostForm = useForm<SocialPostForm>({
    resolver: zodResolver(socialPostSchema),
    defaultValues: {
      platform: 'instagram',
      caption: '',
      hashtags: '',
      scheduledAt: '',
    },
  });

  const hashtagForm = useForm<HashtagResearchForm>({
    resolver: zodResolver(hashtagResearchSchema),
    defaultValues: {
      topic: campaign.name,
      platform: 'instagram',
      category: 'food',
    },
  });

  // Social post queue mutation
  const queuePostMutation = useMutation({
    mutationFn: async (data: SocialPostForm) => {
      // Convert hashtags string to array for backend
      const hashtags = data.hashtags 
        ? data.hashtags.split(/[,#\s]+/).filter(tag => tag.trim().length > 0).map(tag => tag.replace(/^#/, ''))
        : [];
      
      return apiRequest('POST', '/api/cookaing-marketing/social-automation/publish', {
        ...data,
        hashtags,
        campaignId: campaign.id,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Social post queued successfully!"
      });
      socialPostForm.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/cookaing-marketing/social-automation/recent-posts'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to queue post",
        variant: "destructive"
      });
    }
  });

  // Hashtag research mutation
  const hashtagMutation = useMutation({
    mutationFn: async (data: HashtagResearchForm) => {
      return apiRequest('POST', '/api/cookaing-marketing/social-automation/hashtags', {
        ...data,
        campaignId: campaign.id,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Hashtag research completed!"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cookaing-marketing/social-automation/hashtags/trending'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to research hashtags",
        variant: "destructive"
      });
    }
  });

  // Recent queued posts for this campaign (mock data)
  const recentPosts = [
    { id: '1', platform: 'instagram', caption: 'Amazing campaign content!', status: 'queued', scheduledAt: '2 hours' },
    { id: '2', platform: 'twitter', caption: 'Check out this campaign...', status: 'published', scheduledAt: '1 hour' },
  ];

  return (
    <Card className="mt-6" data-testid="card-social-actions">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="w-5 h-5" />
          Social Actions
        </CardTitle>
        <CardDescription>
          Queue social posts and research hashtags for this campaign
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="queue" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="queue" data-testid="tab-social-queue">Queue Post</TabsTrigger>
            <TabsTrigger value="hashtags" data-testid="tab-social-hashtags">Hashtags</TabsTrigger>
            <TabsTrigger value="activity" data-testid="tab-social-activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="queue" className="space-y-4">
            <Form {...socialPostForm}>
              <form onSubmit={socialPostForm.handleSubmit((data) => queuePostMutation.mutate(data))} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={socialPostForm.control}
                    name="platform"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Platform</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-social-platform">
                              <SelectValue placeholder="Select platform" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="instagram">Instagram</SelectItem>
                            <SelectItem value="twitter">Twitter</SelectItem>
                            <SelectItem value="youtube">YouTube</SelectItem>
                            <SelectItem value="facebook">Facebook</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={socialPostForm.control}
                    name="scheduledAt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Schedule (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="datetime-local"
                            placeholder="Schedule for later"
                            {...field}
                            data-testid="input-schedule-time"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={socialPostForm.control}
                  name="caption"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Caption</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Write your social media caption for this campaign..."
                          className="min-h-[100px]"
                          {...field}
                          data-testid="textarea-social-caption"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={socialPostForm.control}
                  name="hashtags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hashtags (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="#campaign #food #marketing"
                          {...field}
                          data-testid="input-social-hashtags"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={queuePostMutation.isPending}
                  className="w-full"
                  data-testid="button-queue-post"
                >
                  {queuePostMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Queuing...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Queue Post
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="hashtags" className="space-y-4">
            <Form {...hashtagForm}>
              <form onSubmit={hashtagForm.handleSubmit((data) => hashtagMutation.mutate(data))} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={hashtagForm.control}
                    name="topic"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Research Topic</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Campaign topic or keyword"
                            {...field}
                            data-testid="input-hashtag-topic"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={hashtagForm.control}
                    name="platform"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Platform</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-hashtag-platform">
                              <SelectValue placeholder="Select platform" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="instagram">Instagram</SelectItem>
                            <SelectItem value="twitter">Twitter</SelectItem>
                            <SelectItem value="youtube">YouTube</SelectItem>
                            <SelectItem value="facebook">Facebook</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={hashtagMutation.isPending}
                  className="w-full"
                  data-testid="button-research-hashtags"
                >
                  {hashtagMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Researching...
                    </>
                  ) : (
                    <>
                      <Hash className="w-4 h-4 mr-2" />
                      Research Hashtags
                    </>
                  )}
                </Button>
              </form>
            </Form>

            {/* Hashtag suggestions */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Trending Hashtags</h4>
              <div className="flex flex-wrap gap-2">
                {['#food', '#campaign', '#marketing', '#delicious', '#organic', '#healthy'].map((tag, i) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className="cursor-pointer hover:bg-gray-100"
                    data-testid={`hashtag-suggestion-${i}`}
                    onClick={() => {
                      const current = hashtagForm.getValues('topic');
                      hashtagForm.setValue('topic', current ? `${current} ${tag}` : tag);
                    }}
                  >
                    {tag}
                    <Copy className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-medium">Recent Campaign Posts</h4>
              {recentPosts.map((post, i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-lg" data-testid={`social-activity-${i}`}>
                  <div className="flex items-center gap-3">
                    <PlatformIcon platform={post.platform} />
                    <div>
                      <p className="text-sm font-medium">{post.caption}</p>
                      <p className="text-xs text-muted-foreground">Scheduled for {post.scheduledAt} ago</p>
                    </div>
                  </div>
                  <StatusBadge status={post.status} />
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h5 className="font-medium text-blue-900 mb-2">Quick Actions</h5>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" data-testid="button-view-analytics">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
                <Button variant="outline" size="sm" data-testid="button-engagement-boost">
                  <Heart className="w-4 h-4 mr-2" />
                  Boost Engagement
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

// Main Campaign Detail Component
const CampaignDetailPage = () => {
  const { id } = useParams();
  const { toast } = useToast();

  // Fetch campaign details
  const { data: campaign, isLoading, error } = useQuery<Campaign>({
    queryKey: ['/api/cookaing-marketing/campaigns', id],
    enabled: !!id,
  });

  // Fetch campaign artifacts
  const { data: artifacts } = useQuery<CampaignArtifact[]>({
    queryKey: ['/api/cookaing-marketing/campaigns', id, 'artifacts'],
    enabled: !!id,
    queryFn: () => Promise.resolve([
      {
        id: 1,
        campaignId: parseInt(id!),
        channel: 'email',
        payloadJson: { subject: 'Campaign Email', content: 'Email content...' },
        variant: 'A',
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        campaignId: parseInt(id!),
        channel: 'social',
        payloadJson: { caption: 'Social media post', hashtags: '#campaign #food' },
        variant: 'A',
        createdAt: new Date().toISOString()
      }
    ])
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2 text-gray-500">Loading campaign...</span>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-red-600 mb-2">Campaign Not Found</h2>
        <p className="text-gray-600 mb-4">The campaign you're looking for doesn't exist or you don't have access to it.</p>
        <Link href="/cookaing/campaigns">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Campaigns
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="page-campaign-detail">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/campaigns">
            <Button variant="ghost" size="sm" data-testid="button-back-to-campaigns">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Campaigns
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-campaign-name">{campaign.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge status={campaign.status} />
              <Badge variant="outline">{campaign.type}</Badge>
              {campaign.scheduledAt && (
                <Badge variant="outline">
                  <Calendar className="w-3 h-3 mr-1" />
                  {new Date(campaign.scheduledAt).toLocaleDateString()}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" data-testid="button-edit-campaign">
            <Settings className="w-4 h-4 mr-2" />
            Edit Campaign
          </Button>
          <Button size="sm" data-testid="button-view-analytics">
            <Eye className="w-4 h-4 mr-2" />
            View Analytics
          </Button>
        </div>
      </div>

      <Separator />

      {/* Campaign Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card data-testid="card-campaign-overview">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Campaign Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Campaign Type</label>
              <p className="text-lg">{campaign.type ? campaign.type.charAt(0).toUpperCase() + campaign.type.slice(1) : '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <p className="text-lg">{campaign.status ? campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1) : '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Created</label>
              <p className="text-lg">{new Date(campaign.createdAt).toLocaleDateString()}</p>
            </div>
            {campaign.scheduledAt && (
              <div>
                <label className="text-sm font-medium text-gray-500">Scheduled</label>
                <p className="text-lg">{new Date(campaign.scheduledAt).toLocaleDateString()}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-campaign-stats">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Performance Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">Sent</span>
              <span className="font-semibold">1,247</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">Opened</span>
              <span className="font-semibold">523 (41.9%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">Clicked</span>
              <span className="font-semibold">189 (15.2%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">Conversions</span>
              <span className="font-semibold">47 (3.8%)</span>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-campaign-channels">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Active Channels
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {artifacts?.map((artifact, i) => (
              <div key={i} className="flex items-center justify-between" data-testid={`channel-artifact-${i}`}>
                <div className="flex items-center gap-2">
                  <PlatformIcon platform={artifact.channel} />
                  <span className="capitalize">{artifact.channel}</span>
                </div>
                <Badge variant="outline">Variant {artifact.variant}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Social Actions Panel */}
      <SocialActionsPanel campaign={campaign} />

      {/* Campaign Content/Artifacts */}
      <Card data-testid="card-campaign-content">
        <CardHeader>
          <CardTitle>Campaign Content</CardTitle>
          <CardDescription>Generated content and artifacts for this campaign</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="artifacts" className="space-y-4">
            <TabsList>
              <TabsTrigger value="artifacts" data-testid="tab-artifacts">Artifacts</TabsTrigger>
              <TabsTrigger value="metadata" data-testid="tab-metadata">Metadata</TabsTrigger>
            </TabsList>

            <TabsContent value="artifacts" className="space-y-4">
              {artifacts?.length ? (
                <div className="grid gap-4">
                  {artifacts.map((artifact, i) => (
                    <Card key={i} data-testid={`artifact-card-${i}`}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <PlatformIcon platform={artifact.channel} />
                          {artifact.channel.charAt(0).toUpperCase() + artifact.channel.slice(1)} Content
                          <Badge variant="outline">Variant {artifact.variant}</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <pre className="bg-gray-50 p-3 rounded text-sm overflow-auto">
                          {JSON.stringify(artifact.payloadJson, null, 2)}
                        </pre>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No artifacts generated yet for this campaign.
                </div>
              )}
            </TabsContent>

            <TabsContent value="metadata" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Metadata</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-gray-50 p-3 rounded text-sm overflow-auto">
                    {JSON.stringify(campaign.metaJson || {}, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default CampaignDetailPage;