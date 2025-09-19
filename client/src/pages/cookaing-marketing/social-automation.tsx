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
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Share2,
  Heart,
  MessageCircle, 
  Hash,
  Clock,
  Play,
  Pause,
  Send,
  Loader2,
  Calendar,
  Target,
  TrendingUp,
  BarChart3,
  Users,
  Zap,
  Bot,
  Eye,
  CheckCircle2,
  AlertCircle,
  Instagram,
  Twitter,
  Youtube,
  Facebook,
  ExternalLink,
  Copy,
  RefreshCw,
  Plus,
  Search,
  Filter,
  Settings,
  Globe,
  Star,
  Sparkles,
  Timer,
  Activity
} from "lucide-react";
import InstructionFooter from '@/cookaing-marketing/components/InstructionFooter';

// Schema definitions for form validation
const publishFormSchema = z.object({
  platform: z.string().min(1, 'Platform is required'),
  caption: z.string().min(1, 'Caption is required').max(2000, 'Caption too long'),
  hashtags: z.string().optional(),
  scheduledAt: z.string().optional(),
  isQueued: z.boolean().default(false)
});

const engagementFormSchema = z.object({
  platform: z.string().min(1, 'Platform is required'),
  actionType: z.enum(['like', 'comment', 'reply', 'share', 'follow']),
  targetUrl: z.string().url('Invalid URL'),
  commentText: z.string().optional(),
  quantity: z.number().min(1).max(100).default(5)
});

const hashtagFormSchema = z.object({
  topic: z.string().min(1, 'Topic is required'),
  platform: z.string().optional(),
  limit: z.number().min(1).max(50).default(20)
});

const timingFormSchema = z.object({
  platform: z.string().min(1, 'Platform is required'),
  contentType: z.string().optional(),
  targetAudience: z.string().optional()
});

type PublishForm = z.infer<typeof publishFormSchema>;
type EngagementForm = z.infer<typeof engagementFormSchema>;
type HashtagForm = z.infer<typeof hashtagFormSchema>;
type TimingForm = z.infer<typeof timingFormSchema>;

// API Response Types
interface SocialStats {
  published: number;
  queued: number;
  engagements: number;
  reach: number;
}

interface RecentPost {
  id: string;
  platform: string;
  caption: string;
  status: string;
  publishedAt: string;
}

interface EngagementAction {
  id: string;
  platform: string;
  type: string;
  quantity: number;
  status: string;
  createdAt: string;
}

interface HashtagSuggestion {
  tag: string;
  posts: number;
  engagement: number;
}

interface HealthStatus {
  overall: 'healthy' | 'degraded' | 'down';
  providers: Record<string, 'up' | 'down'>;
}

interface OptimalTimesData {
  bestTimes: string[];
  weeklyPattern: Array<{ day: string; score: number }>;
  platform: string;
  analyzed_days: number;
}

// Platform icons mapping
const PlatformIcon = ({ platform }: { platform: string }) => {
  switch (platform.toLowerCase()) {
    case 'instagram': return <Instagram className="w-4 h-4" />;
    case 'twitter': return <Twitter className="w-4 h-4" />;
    case 'youtube': return <Youtube className="w-4 h-4" />;
    case 'facebook': return <Facebook className="w-4 h-4" />;
    default: return <Globe className="w-4 h-4" />;
  }
};

// Status badge component  
const StatusBadge = ({ status }: { status: 'published' | 'queued' | 'failed' | 'processing' }) => {
  const statusConfig: Record<string, { color: string; icon: any }> = {
    'published': { color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
    'queued': { color: 'bg-blue-100 text-blue-800', icon: Clock },
    'failed': { color: 'bg-red-100 text-red-800', icon: AlertCircle },
    'processing': { color: 'bg-yellow-100 text-yellow-800', icon: Loader2 }
  };
  
  const config = statusConfig[status] || statusConfig['queued'];
  const IconComponent = config.icon;
  
  return (
    <Badge className={`${config.color} flex items-center gap-1`}>
      <IconComponent className="w-3 h-3" />
      {status}
    </Badge>
  );
};

// Main Social Automation Component
export default function SocialAutomationPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('publish');

  // Forms initialization
  const publishForm = useForm<PublishForm>({
    resolver: zodResolver(publishFormSchema),
    defaultValues: {
      platform: '',
      caption: '',
      hashtags: '',
      scheduledAt: '',
      isQueued: false
    }
  });

  const engagementForm = useForm<EngagementForm>({
    resolver: zodResolver(engagementFormSchema),
    defaultValues: {
      platform: '',
      actionType: 'like',
      targetUrl: '',
      commentText: '',
      quantity: 5
    }
  });

  const hashtagForm = useForm<HashtagForm>({
    resolver: zodResolver(hashtagFormSchema),
    defaultValues: {
      topic: '',
      platform: 'instagram',
      limit: 20
    }
  });

  const timingForm = useForm<TimingForm>({
    resolver: zodResolver(timingFormSchema),
    defaultValues: {
      platform: '',
      contentType: 'post',
      targetAudience: 'general'
    }
  });

  // Mutations for API calls
  const publishMutation = useMutation({
    mutationFn: async (data: PublishForm) => {
      const endpoint = data.isQueued ? '/api/cookaing-marketing/social-automation/queue' : '/api/cookaing-marketing/social-automation/publish';
      return apiRequest(endpoint, 'POST', {
        platform: data.platform,
        caption: data.caption,
        hashtags: data.hashtags ? data.hashtags.split(',').map(h => h.trim()) : [],
        scheduledAt: data.scheduledAt || undefined
      });
    },
    onSuccess: (data, variables) => {
      toast({
        title: "Success",
        description: variables.isQueued ? "Post queued successfully!" : "Post published successfully!"
      });
      publishForm.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/cookaing-marketing/social-automation/stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to publish post",
        variant: "destructive"
      });
    }
  });

  const engagementMutation = useMutation({
    mutationFn: async (data: EngagementForm) => {
      return apiRequest('/api/cookaing-marketing/social-automation/engage', 'POST', {
        platform: data.platform,
        actions: [{
          type: data.actionType,
          targetUrl: data.targetUrl,
          text: data.commentText,
          quantity: data.quantity
        }]
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Engagement actions started successfully!"
      });
      engagementForm.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/cookaing-marketing/social-automation/stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to start engagement",
        variant: "destructive"
      });
    }
  });

  const hashtagMutation = useMutation({
    mutationFn: async (data: HashtagForm) => {
      return apiRequest('/api/cookaing-marketing/social-automation/hashtags', 'POST', data);
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

  const timingMutation = useMutation({
    mutationFn: async (data: TimingForm) => {
      return apiRequest('/api/cookaing-marketing/social-automation/optimal-times', 'POST', data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Optimal timing analysis completed!"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cookaing-marketing/social-automation/optimal-times/analyze/instagram'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to analyze timing",
        variant: "destructive"
      });
    }
  });

  // Data queries with proper typing
  const { data: stats, isLoading: statsLoading } = useQuery<{ success: boolean; data: SocialStats }>({
    queryKey: ['/api/cookaing-marketing/social-automation/stats'],
    staleTime: 30000
  });

  const { data: recentPosts, isLoading: postsLoading } = useQuery<{ success: boolean; data: RecentPost[] }>({
    queryKey: ['/api/cookaing-marketing/social-automation/recent-posts'],
    staleTime: 30000
  });

  const { data: engagementHistory, isLoading: engagementLoading } = useQuery<{ success: boolean; data: EngagementAction[] }>({
    queryKey: ['/api/cookaing-marketing/social-automation/engagement-history'],
    staleTime: 60000
  });

  const { data: hashtags, isLoading: hashtagsLoading } = useQuery<{ success: boolean; data: HashtagSuggestion[] }>({
    queryKey: ['/api/cookaing-marketing/social-automation/hashtags/trending'],
    staleTime: 300000
  });

  const { data: optimalTimes, isLoading: timingLoading } = useQuery<{ success: boolean; data: OptimalTimesData }>({
    queryKey: ['/api/cookaing-marketing/social-automation/optimal-times/analyze/instagram'],
    staleTime: 300000
  });

  const { data: health, isLoading: healthLoading } = useQuery<{ success: boolean; data: HealthStatus }>({
    queryKey: ['/api/cookaing-marketing/social-automation/health'],
    staleTime: 60000
  });

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2" data-testid="heading-social-automation">Social Automation</h1>
          <p className="text-muted-foreground">
            Automate your social media publishing, engagement, and optimization workflows
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Bot className="w-3 h-3" />
            Mock Mode
          </Badge>
          {health?.data && (
            <Badge variant={health.data.overall === 'healthy' ? 'default' : 'destructive'}>
              {health.data.overall}
            </Badge>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card data-testid="card-posts-published">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Posts Published</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : stats?.data?.published || 0}
            </div>
            <p className="text-xs text-muted-foreground">+12% from last week</p>
          </CardContent>
        </Card>

        <Card data-testid="card-posts-queued">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Posts Queued</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : stats?.data?.queued || 0}
            </div>
            <p className="text-xs text-muted-foreground">Next in 2 hours</p>
          </CardContent>
        </Card>

        <Card data-testid="card-engagement-actions">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Engagement Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : stats?.data?.engagements || 0}
            </div>
            <p className="text-xs text-muted-foreground">+5% engagement rate</p>
          </CardContent>
        </Card>

        <Card data-testid="card-hashtag-reach">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Hashtag Reach</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "2.4M"}
            </div>
            <p className="text-xs text-muted-foreground">Average per post</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="publish" className="flex items-center gap-2" data-testid="tab-publish">
            <Share2 className="w-4 h-4" />
            Publish
          </TabsTrigger>
          <TabsTrigger value="engagement" className="flex items-center gap-2" data-testid="tab-engagement">
            <Heart className="w-4 h-4" />
            Engagement
          </TabsTrigger>
          <TabsTrigger value="hashtags" className="flex items-center gap-2" data-testid="tab-hashtags">
            <Hash className="w-4 h-4" />
            Hashtags
          </TabsTrigger>
          <TabsTrigger value="timing" className="flex items-center gap-2" data-testid="tab-timing">
            <Clock className="w-4 h-4" />
            Optimal Times
          </TabsTrigger>
        </TabsList>

        {/* Publish Tab */}
        <TabsContent value="publish" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Publish Form */}
            <Card data-testid="card-publish-form">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  Create Post
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...publishForm}>
                  <form onSubmit={publishForm.handleSubmit((data) => publishMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={publishForm.control}
                      name="platform"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Platform</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-platform">
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
                      control={publishForm.control}
                      name="caption"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Caption</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Write your post caption..."
                              className="min-h-[100px]"
                              data-testid="textarea-caption"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={publishForm.control}
                      name="hashtags"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hashtags (comma-separated)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="#food, #cooking, #recipe"
                              data-testid="input-hashtags"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={publishForm.control}
                      name="isQueued"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Schedule for later</FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Queue this post instead of publishing immediately
                            </div>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="switch-queue"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {publishForm.watch('isQueued') && (
                      <FormField
                        control={publishForm.control}
                        name="scheduledAt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Schedule Time</FormLabel>
                            <FormControl>
                              <Input 
                                type="datetime-local"
                                data-testid="input-schedule-time"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={publishMutation.isPending}
                      data-testid="button-submit-post"
                    >
                      {publishMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : publishForm.watch('isQueued') ? (
                        <Clock className="w-4 h-4 mr-2" />
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      {publishForm.watch('isQueued') ? 'Queue Post' : 'Publish Now'}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Recent Posts */}
            <Card data-testid="card-recent-posts">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Posts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  {postsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentPosts?.data?.map((post) => (
                        <div key={post.id} className="flex items-start justify-between p-3 border rounded-lg" data-testid={`post-item-${post.id}`}>
                          <div className="flex items-start gap-3">
                            <PlatformIcon platform={post.platform} />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{post.caption}</p>
                              <p className="text-xs text-muted-foreground">{post.publishedAt}</p>
                            </div>
                          </div>
                          <StatusBadge status={post.status} />
                        </div>
                      )) || []}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Engagement Tab */}
        <TabsContent value="engagement" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Engagement Form */}
            <Card data-testid="card-engagement-form">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  Engagement Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...engagementForm}>
                  <form onSubmit={engagementForm.handleSubmit((data) => engagementMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={engagementForm.control}
                      name="platform"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Platform</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-engagement-platform">
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
                      control={engagementForm.control}
                      name="actionType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Action Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-action-type">
                                <SelectValue placeholder="Select action" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="like">Like Posts</SelectItem>
                              <SelectItem value="comment">Comment</SelectItem>
                              <SelectItem value="reply">Reply to Comments</SelectItem>
                              <SelectItem value="share">Share Posts</SelectItem>
                              <SelectItem value="follow">Follow Users</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={engagementForm.control}
                      name="targetUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target URL</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="https://instagram.com/p/example"
                              data-testid="input-target-url"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {engagementForm.watch('actionType') === 'comment' && (
                      <FormField
                        control={engagementForm.control}
                        name="commentText"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Comment Text</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Write your comment..."
                                data-testid="textarea-comment"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={engagementForm.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity (1-100)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              min="1"
                              max="100"
                              data-testid="input-quantity"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={engagementMutation.isPending}
                      data-testid="button-start-engagement"
                    >
                      {engagementMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Zap className="w-4 h-4 mr-2" />
                      )}
                      Start Engagement
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Engagement History */}
            <Card data-testid="card-engagement-history">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Engagement History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  {engagementLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {engagementHistory?.data?.map((action) => (
                        <div key={action.id} className="flex items-center justify-between p-3 border rounded-lg" data-testid={`engagement-item-${action.id}`}>
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-full">
                              <Heart className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{action.type} {action.quantity} posts</p>
                              <p className="text-xs text-muted-foreground">{action.platform} • {action.createdAt}</p>
                            </div>
                          </div>
                          <Badge variant="outline">{action.status}</Badge>
                        </div>
                      )) || []}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Hashtags Tab */}
        <TabsContent value="hashtags" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Hashtag Research Form */}
            <Card data-testid="card-hashtag-research">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="w-5 h-5" />
                  Hashtag Research
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...hashtagForm}>
                  <form onSubmit={hashtagForm.handleSubmit((data) => hashtagMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={hashtagForm.control}
                      name="topic"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Topic</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., cooking, fitness, travel"
                              data-testid="input-hashtag-topic"
                              {...field}
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
                          <FormLabel>Platform</FormLabel>
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

                    <FormField
                      control={hashtagForm.control}
                      name="limit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of hashtags (1-50)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              min="1"
                              max="50"
                              data-testid="input-hashtag-limit"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={hashtagMutation.isPending}
                      data-testid="button-research-hashtags"
                    >
                      {hashtagMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Search className="w-4 h-4 mr-2" />
                      )}
                      Research Hashtags
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Trending Hashtags */}
            <Card data-testid="card-trending-hashtags">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Trending Hashtags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  {hashtagsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {hashtags?.data?.map((hashtagItem, i) => (
                        <div key={i} className="flex items-center justify-between p-2 border rounded" data-testid={`hashtag-item-${i}`}>
                          <span className="text-sm font-mono">{hashtagItem.tag}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {Math.floor(hashtagItem.posts / 1000)}K posts
                            </Badge>
                            <Button size="sm" variant="ghost" data-testid={`button-copy-hashtag-${i}`}>
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      )) || []}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Optimal Times Tab */}
        <TabsContent value="timing" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Timing Analysis Form */}
            <Card data-testid="card-timing-analysis">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Timing Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...timingForm}>
                  <form onSubmit={timingForm.handleSubmit((data) => timingMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={timingForm.control}
                      name="platform"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Platform</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-timing-platform">
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
                      control={timingForm.control}
                      name="contentType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Content Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-content-type">
                                <SelectValue placeholder="Select content type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="post">Post</SelectItem>
                              <SelectItem value="story">Story</SelectItem>
                              <SelectItem value="reel">Reel</SelectItem>
                              <SelectItem value="video">Video</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={timingForm.control}
                      name="targetAudience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Audience</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-target-audience">
                                <SelectValue placeholder="Select audience" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="general">General</SelectItem>
                              <SelectItem value="young-adults">Young Adults</SelectItem>
                              <SelectItem value="professionals">Professionals</SelectItem>
                              <SelectItem value="parents">Parents</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={timingMutation.isPending}
                      data-testid="button-analyze-timing"
                    >
                      {timingMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Timer className="w-4 h-4 mr-2" />
                      )}
                      Analyze Optimal Times
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Optimal Times Results */}
            <Card data-testid="card-optimal-times-results">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Optimal Times
                </CardTitle>
              </CardHeader>
              <CardContent>
                {timingLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Best Times */}
                    <div>
                      <h4 className="font-medium mb-2">Best Times Today</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {optimalTimes?.data?.bestTimes?.map((time, i) => (
                          <div key={i} className="p-3 border rounded-lg text-center" data-testid={`optimal-time-${i}`}>
                            <div className="font-medium">{time}</div>
                            <div className="text-xs text-muted-foreground">
                              {85 + Math.floor(Math.random() * 15)}% engagement
                            </div>
                          </div>
                        )) || ['9:00 AM', '1:00 PM', '7:00 PM'].map((time, i) => (
                          <div key={i} className="p-3 border rounded-lg text-center" data-testid={`optimal-time-${i}`}>
                            <div className="font-medium">{time}</div>
                            <div className="text-xs text-muted-foreground">
                              {85 + Math.floor(Math.random() * 15)}% engagement
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Weekly Pattern */}
                    <div>
                      <h4 className="font-medium mb-2">Weekly Pattern</h4>
                      <div className="space-y-2">
                        {(optimalTimes?.data?.weeklyPattern || [
                          { day: 'Monday', score: 85 },
                          { day: 'Tuesday', score: 78 },
                          { day: 'Wednesday', score: 92 },
                          { day: 'Thursday', score: 88 },
                          { day: 'Friday', score: 76 },
                          { day: 'Saturday', score: 94 },
                          { day: 'Sunday', score: 81 }
                        ]).map((item, i) => (
                          <div key={i} className="flex items-center justify-between" data-testid={`weekly-pattern-${i}`}>
                            <span className="text-sm">{item.day}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${item.score}%` }}
                                ></div>
                              </div>
                              <Star className="w-3 h-3 text-yellow-500" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <InstructionFooter 
        title="Social Automation"
        whatIsIt="A comprehensive social media automation platform that helps you schedule posts, automate engagement, research hashtags, and optimize posting times across multiple social platforms including Instagram, Twitter, YouTube, and Facebook."
        setupSteps={[
          "Navigate to Social Automation from the CookAIng Marketing sidebar",
          "Select your preferred social media platform for automation",
          "Configure your automation preferences in each tab",
          "Start with the Publish tab to create and schedule content"
        ]}
        usageSteps={[
          "Use the Publish tab to create posts and schedule them for later",
          "Configure engagement automation in the Engagement tab to like, comment, and interact with content",
          "Research trending hashtags in the Hashtags tab to improve reach",
          "Analyze optimal posting times in the Timing tab for maximum engagement",
          "Monitor your automation stats and health status from the overview cards"
        ]}
        relatedLinks={[
          { label: "Campaigns", href: "/cookaing-marketing/campaigns" },
          { label: "Reports", href: "/cookaing-marketing/reports" },
          { label: "Dashboard", href: "/cookaing-marketing" }
        ]}
        notes={[
          "All social automation runs in mock mode for testing and demonstration",
          "Real social media integrations would require API keys and OAuth setup",
          "Stats and analytics are generated using deterministic mock data",
          "Each platform has different rate limits and posting requirements"
        ]}
      />
    </div>
  );
}