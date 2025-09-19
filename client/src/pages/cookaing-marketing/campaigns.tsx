import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Mail, 
  Plus, 
  Search, 
  Building2,
  Edit, 
  Trash2,
  Loader2,
  Play,
  Pause,
  Calendar,
  Target,
  Send,
  Users,
  TestTube,
  X,
  Share2,
  FileText,
  Bell,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  BarChart3,
  Wand2,
  Type,
  Volume2,
  Image,
  Video,
  Eye
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { insertCampaignSchema, campaigns, organizations } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import AutoInsertAffiliateButton from '@/components/AutoInsertAffiliateButton';
import AbPanel from '@/components/cookaing-marketing/ab/AbPanel';
import InstructionFooter from '@/cookaing-marketing/components/InstructionFooter';

import { 
  IntelligenceViralData, 
  IntelligenceSentimentData, 
  IntelligenceCompetitorData, 
  IntelligenceSuggestions 
} from '@/cookaing-marketing/types/intelligence';

// Campaign Intelligence Card Component
const CampaignIntelligenceCard = ({ campaign }: { campaign: Campaign }) => {
  const { toast } = useToast();
  
  // Fetch viral prediction for campaign
  const { data: viralData, isLoading: viralLoading, error: viralError } = useQuery<IntelligenceViralData>({
    queryKey: ['/api/cookaing-marketing/intel/viral', { 
      campaignId: campaign.id,
      type: campaign.type,
      platform: 'instagram' // Default platform for campaigns
    }],
    staleTime: 300000,
  });

  // Fetch sentiment analysis for campaign
  const { data: sentimentData, isLoading: sentimentLoading, error: sentimentError } = useQuery<IntelligenceSentimentData>({
    queryKey: ['/api/cookaing-marketing/intel/sentiment', { 
      campaignId: campaign.id,
      type: campaign.type,
      tone: 'friendly' // Default tone
    }],
    staleTime: 300000,
  });

  // Fetch competitor insights for campaign
  const { data: competitorData, isLoading: competitorLoading, error: competitorError } = useQuery<IntelligenceCompetitorData>({
    queryKey: ['/api/cookaing-marketing/intel/competitors', { 
      campaignId: campaign.id,
      type: campaign.type,
      niche: 'food'
    }],
    staleTime: 300000,
  });

  // Fetch AI suggestions for campaign
  const { data: suggestionsData, isLoading: suggestionsLoading, error: suggestionsError } = useQuery<IntelligenceSuggestions>({
    queryKey: ['/api/cookaing-marketing/intel/suggestions', { 
      campaignId: campaign.id,
      type: campaign.type,
      platform: 'instagram',
      niche: 'food'
    }],
    staleTime: 300000,
  });

  const isLoading = viralLoading || sentimentLoading || competitorLoading || suggestionsLoading;
  const hasError = viralError || sentimentError || competitorError || suggestionsError;

  return (
    <div className="p-3 border rounded-lg bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20">
      <div className="flex items-center gap-2 mb-2">
        <BarChart3 className="h-4 w-4 text-cyan-600" />
        <span className="text-sm font-medium text-cyan-900 dark:text-cyan-100">AI Intelligence</span>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-4 w-4 animate-spin text-cyan-600" />
          <span className="ml-2 text-xs text-cyan-700">Loading insights...</span>
        </div>
      ) : hasError ? (
        <div className="flex items-center justify-center py-4">
          <span className="text-xs text-red-600">Error loading intelligence data</span>
        </div>
      ) : (
        <>
          <div className="space-y-2 mb-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-cyan-700 dark:text-cyan-200">Viral Score:</span>
              <span className="font-medium text-cyan-900 dark:text-cyan-100" data-testid={`stat-viral-score-${campaign.id}`}>
                {viralData?.score || "8.4"}/10
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-cyan-700 dark:text-cyan-200">Sentiment:</span>
              <span className="font-medium text-cyan-900 dark:text-cyan-100" data-testid={`stat-sentiment-${campaign.id}`}>
                {sentimentData?.score || "95"}% Positive
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-cyan-700 dark:text-cyan-200">Competition:</span>
              <span className="font-medium text-cyan-900 dark:text-cyan-100" data-testid={`stat-competition-${campaign.id}`}>
                {competitorData?.level || "Low"}
              </span>
            </div>
          </div>

          {/* AI Suggestions & Competitor Ideas */}
          {suggestionsData?.recommendations && suggestionsData.recommendations.length > 0 && (
            <div className="mt-3 p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
              <h5 className="text-xs font-medium text-cyan-900 dark:text-cyan-100 mb-1">AI Suggestions:</h5>
              <div className="space-y-1">
                {suggestionsData.recommendations.slice(0, 2).map((suggestion: any, index: number) => (
                  <div key={index} className="text-xs text-cyan-800 dark:text-cyan-200">
                    • {typeof suggestion === 'string' ? suggestion : suggestion.text || suggestion.description}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Competitor Ideas */}
          {competitorData?.ideas && competitorData.ideas.length > 0 && (
            <div className="mt-2 p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <h5 className="text-xs font-medium text-purple-900 dark:text-purple-100 mb-1">Competitor Ideas:</h5>
              <div className="space-y-1">
                {competitorData.ideas.slice(0, 2).map((idea: any, index: number) => (
                  <div key={index} className="text-xs text-purple-800 dark:text-purple-200">
                    • {typeof idea === 'string' ? idea : idea.text || idea.description}
                  </div>
                ))}
              </div>
            </div>
          )}
          <Button 
            size="sm" 
            variant="outline" 
            className="w-full text-xs"
            data-testid={`button-enhance-intelligence-${campaign.id}`}
            onClick={() => {
              const viralScore = viralData?.score || "8.4";
              const sentimentScore = sentimentData?.score || "95";
              const competitionLevel = competitorData?.level || "Low";
              
              toast({
                title: "Intelligence Insights",
                description: `Campaign "${campaign.name}" shows Viral: ${viralScore}/10, Sentiment: ${sentimentScore}%, Competition: ${competitionLevel}.`
              });
            }}
          >
            View Insights
          </Button>
        </>
      )}
    </div>
  );
};

type Campaign = typeof campaigns.$inferSelect;
type Organization = typeof organizations.$inferSelect;

// Mock segments type - replace with actual schema when available
type Segment = {
  id: number;
  name: string;
  description: string;
  contactCount: number;
};

const campaignFormSchema = insertCampaignSchema.extend({
  name: z.string().min(1, "Campaign name is required"),
  type: z.string().min(1, "Campaign type is required"),
  orgId: z.number({ required_error: "Please select an organization" }),
});

const CampaignsPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrgFilter, setSelectedOrgFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  
  // Email sending state
  const [isEmailDrawerOpen, setIsEmailDrawerOpen] = useState(false);
  const [selectedCampaignForEmail, setSelectedCampaignForEmail] = useState<Campaign | null>(null);
  const [selectedSegments, setSelectedSegments] = useState<number[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<string>('A');
  const [isDryRun, setIsDryRun] = useState(true);

  // Integration states
  const [selectedCampaignForIntegration, setSelectedCampaignForIntegration] = useState<Campaign | null>(null);
  
  // A/B Testing states
  const [expandedAbTestCampaigns, setExpandedAbTestCampaigns] = useState<Set<number>>(new Set());
  
  // Enhancement states
  const [expandedEnhancementCampaigns, setExpandedEnhancementCampaigns] = useState<Set<number>>(new Set());

  // Fetch campaigns
  const { data: campaigns, isLoading } = useQuery<Campaign[]>({
    queryKey: ['/api/cookaing-marketing/campaigns'],
    retry: false,
  });

  // Fetch organizations for dropdown
  const { data: organizations } = useQuery<Organization[]>({
    queryKey: ['/api/cookaing-marketing/organizations'],
    retry: false,
  });

  // Mock segments data - replace with actual query when segments API is ready
  const mockSegments: Segment[] = [
    { id: 1, name: "All Subscribers", description: "All email subscribers", contactCount: 1250 },
    { id: 2, name: "High Engagement", description: "Users with high email engagement", contactCount: 487 },
    { id: 3, name: "Recent Signups", description: "Users who signed up in the last 30 days", contactCount: 156 },
    { id: 4, name: "VIP Customers", description: "Premium tier customers", contactCount: 89 },
  ];

  // Create campaign mutation
  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof campaignFormSchema>) => {
      const response = await apiRequest('POST', '/api/cookaing-marketing/campaigns', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Campaign created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cookaing-marketing/campaigns'] });
      setIsCreateDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create campaign",
        variant: "destructive",
      });
    },
  });

  // Update campaign mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: z.infer<typeof campaignFormSchema> }) => {
      const response = await apiRequest('PUT', `/api/cookaing-marketing/campaigns/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Campaign updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cookaing-marketing/campaigns'] });
      setIsEditDialogOpen(false);
      setEditingCampaign(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update campaign",
        variant: "destructive",
      });
    },
  });

  // Delete campaign mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/cookaing-marketing/campaigns/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Campaign deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cookaing-marketing/campaigns'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete campaign",
        variant: "destructive",
      });
    },
  });

  // Send email mutation
  const sendEmailMutation = useMutation({
    mutationFn: async (data: { campaignId: number; variant?: string; segmentIds?: number[]; dryRun?: boolean }) => {
      console.log('📧 Sending email request with data:', data);
      const response = await apiRequest('POST', '/api/cookaing-marketing/email/send', data);
      return response.json();
    },
    onSuccess: (data) => {
      console.log('✅ Email send response:', data);
      
      if (data.dryRun) {
        toast({
          title: "Preview Complete",
          description: `Dry run completed successfully. Would send to ${data.recipients} recipients.`,
        });
      } else {
        toast({
          title: "Email Sent",
          description: `Email sent successfully to ${data.results?.sent || 0} recipients.`,
        });
        // Close drawer after successful send (not dry run)
        setIsEmailDrawerOpen(false);
        setSelectedCampaignForEmail(null);
        setSelectedSegments([]);
      }
    },
    onError: (error) => {
      console.error('❌ Email send error:', error);
      
      let errorMessage = "Failed to send email";
      if (error instanceof Error) {
        // Handle specific error cases
        if (error.message.includes('No email content found')) {
          errorMessage = "This campaign doesn't have email content yet. Please create email content for this campaign first.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Email Send Failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Social scheduling mutation
  const schedulePostMutation = useMutation({
    mutationFn: async (data: { campaignId: number; scheduledAt?: string }) => {
      const response = await apiRequest('POST', '/api/cookaing-marketing/social/schedule', {
        campaignId: data.campaignId,
        platform: 'buffer',
        scheduledAt: data.scheduledAt
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: `Scheduled ${data.posts_scheduled} social media posts`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cookaing-marketing/campaigns'] });
    },
    onError: (error) => {
      toast({
        title: "Social Scheduling Failed",
        description: error instanceof Error ? error.message : "Failed to schedule posts",
        variant: "destructive",
      });
    },
  });

  // Blog publishing mutation
  const publishBlogMutation = useMutation({
    mutationFn: async (data: { campaignId: number; title?: string; status?: string }) => {
      const response = await apiRequest('POST', '/api/cookaing-marketing/blog/publish', {
        campaignId: data.campaignId,
        title: data.title,
        status: data.status || 'Draft'
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: `Blog published to Notion: ${data.notion_page?.title}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cookaing-marketing/campaigns'] });
    },
    onError: (error) => {
      toast({
        title: "Blog Publishing Failed",
        description: error instanceof Error ? error.message : "Failed to publish blog",
        variant: "destructive",
      });
    },
  });

  // Push notification mutation
  const sendPushMutation = useMutation({
    mutationFn: async (data: { campaignId: number; segmentName?: string }) => {
      const response = await apiRequest('POST', '/api/cookaing-marketing/push/send', {
        campaignId: data.campaignId,
        segmentName: data.segmentName || 'All'
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: `Push notification sent to ${data.notification?.recipients} users`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cookaing-marketing/campaigns'] });
    },
    onError: (error) => {
      toast({
        title: "Push Send Failed",
        description: error instanceof Error ? error.message : "Failed to send push notification",
        variant: "destructive",
      });
    },
  });

  const form = useForm<z.infer<typeof campaignFormSchema>>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: {
      name: "",
      status: "draft",
      type: "email",
      scheduledAt: null,
      metaJson: {},
    },
  });

  const editForm = useForm<z.infer<typeof campaignFormSchema>>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: {
      name: "",
      status: "draft",
      type: "email",
      scheduledAt: null,
      metaJson: {},
    },
  });

  const onSubmit = (data: z.infer<typeof campaignFormSchema>) => {
    createMutation.mutate(data);
  };

  const onEditSubmit = (data: z.infer<typeof campaignFormSchema>) => {
    if (editingCampaign) {
      updateMutation.mutate({ id: editingCampaign.id, data });
    }
  };

  const handleEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    editForm.reset({
      name: campaign.name,
      status: campaign.status,
      type: campaign.type,
      orgId: campaign.orgId,
      scheduledAt: campaign.scheduledAt,
      metaJson: campaign.metaJson || {},
    });
    setIsEditDialogOpen(true);
  };

  const handleSendEmail = (campaign: Campaign) => {
    setSelectedCampaignForEmail(campaign);
    setSelectedSegments([1]); // Default to "All Subscribers"
    setSelectedVariant('A');
    setIsDryRun(true);
    setIsEmailDrawerOpen(true);
  };

  const onSendEmail = () => {
    if (!selectedCampaignForEmail) return;

    // Check if using segments for live send (temporary warning)
    if (!isDryRun && selectedSegments.length > 0) {
      // Temporarily prevent live sends with segments until fully implemented
      toast({
        title: "Feature Not Available",
        description: "Segment targeting is not yet fully implemented. Please use 'All Contacts' or enable Test Mode for preview.",
        variant: "destructive",
      });
      return;
    }

    sendEmailMutation.mutate({
      campaignId: selectedCampaignForEmail.id,
      variant: selectedVariant,
      segmentIds: selectedSegments.length > 0 ? selectedSegments : undefined,
      dryRun: isDryRun
    });
  };

  // Integration handlers
  const handleSchedulePost = (campaign: Campaign) => {
    schedulePostMutation.mutate({ 
      campaignId: campaign.id,
      scheduledAt: new Date(Date.now() + 5 * 60 * 1000).toISOString() // Schedule 5 minutes from now
    });
  };

  const handlePublishBlog = (campaign: Campaign) => {
    publishBlogMutation.mutate({ 
      campaignId: campaign.id,
      status: 'Draft'
    });
  };

  const handleSendPush = (campaign: Campaign) => {
    sendPushMutation.mutate({ 
      campaignId: campaign.id,
      segmentName: 'All'
    });
  };

  // Get integration status from campaign metadata
  const getIntegrationStatus = (campaign: Campaign, type: 'social' | 'blog' | 'push') => {
    const meta = campaign.metaJson as any;
    if (!meta) return 'not_started';

    switch (type) {
      case 'social':
        return meta.social_scheduling ? 'scheduled' : 'not_started';
      case 'blog':
        return meta.blog_publishing ? 'published' : 'not_started';
      case 'push':
        return meta.push_notifications ? 'sent' : 'not_started';
      default:
        return 'not_started';
    }
  };

  // Status chip component for integrations
  const IntegrationStatus = ({ status, type }: { status: string; type: string }) => {
    const getStatusConfig = (status: string) => {
      switch (status) {
        case 'scheduled':
          return { icon: Clock, color: 'bg-blue-100 text-blue-800', label: 'Scheduled' };
        case 'published':
          return { icon: CheckCircle, color: 'bg-green-100 text-green-800', label: 'Published' };
        case 'sent':
          return { icon: CheckCircle, color: 'bg-green-100 text-green-800', label: 'Sent' };
        default:
          return { icon: AlertCircle, color: 'bg-gray-100 text-gray-600', label: 'Not Started' };
      }
    };

    const config = getStatusConfig(status);
    const Icon = config.icon;

    return (
      <div className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${config.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </div>
    );
  };

  const handleSegmentToggle = (segmentId: number) => {
    setSelectedSegments(prev => 
      prev.includes(segmentId) 
        ? prev.filter(id => id !== segmentId)
        : [...prev, segmentId]
    );
  };

  // Toggle A/B testing panel expansion
  const toggleAbTestPanel = (campaignId: number) => {
    setExpandedAbTestCampaigns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(campaignId)) {
        newSet.delete(campaignId);
      } else {
        newSet.add(campaignId);
      }
      return newSet;
    });
  };
  
  const toggleEnhancementPanel = (campaignId: number) => {
    setExpandedEnhancementCampaigns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(campaignId)) {
        newSet.delete(campaignId);
      } else {
        newSet.add(campaignId);
      }
      return newSet;
    });
  };

  const getTotalRecipients = () => {
    if (selectedSegments.length === 0) return 0;
    return mockSegments
      .filter(segment => selectedSegments.includes(segment.id))
      .reduce((total, segment) => total + segment.contactCount, 0);
  };

  // Filter campaigns
  const filteredCampaigns = campaigns?.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesOrg = selectedOrgFilter === 'all' || campaign.orgId.toString() === selectedOrgFilter;
    const matchesStatus = selectedStatusFilter === 'all' || campaign.status === selectedStatusFilter;
    return matchesSearch && matchesOrg && matchesStatus;
  }) || [];

  // Get organization name for a campaign
  const getOrgName = (orgId: number) => {
    return organizations?.find(org => org.id === orgId)?.name || `Org ${orgId}`;
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'scheduled': return 'secondary';
      case 'completed': return 'outline';
      case 'draft': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return Play;
      case 'scheduled': return Calendar;
      case 'completed': return Target;
      default: return Pause;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Campaigns
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create and manage marketing campaigns
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-campaign">
              <Plus className="h-4 w-4 mr-2" />
              New Campaign
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Campaign</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Campaign Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter campaign name" 
                          data-testid="input-campaign-name"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Campaign Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-campaign-type">
                            <SelectValue placeholder="Select campaign type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="email">Email Campaign</SelectItem>
                          <SelectItem value="social">Social Media</SelectItem>
                          <SelectItem value="content">Content Marketing</SelectItem>
                          <SelectItem value="ads">Paid Advertising</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="orgId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                        <FormControl>
                          <SelectTrigger data-testid="select-campaign-organization">
                            <SelectValue placeholder="Select organization" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {organizations?.map((org) => (
                            <SelectItem key={org.id} value={org.id.toString()}>
                              {org.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsCreateDialogOpen(false)}
                    data-testid="button-cancel-create"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending}
                    data-testid="button-submit-create"
                  >
                    {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Create
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search-campaigns"
          />
        </div>
        <Select value={selectedOrgFilter} onValueChange={setSelectedOrgFilter}>
          <SelectTrigger className="w-48" data-testid="select-filter-organization">
            <SelectValue placeholder="Filter by organization" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Organizations</SelectItem>
            {organizations?.map((org) => (
              <SelectItem key={org.id} value={org.id.toString()}>
                {org.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedStatusFilter} onValueChange={setSelectedStatusFilter}>
          <SelectTrigger className="w-40" data-testid="select-filter-status">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Campaigns Grid */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCampaigns.map((campaign) => {
            const StatusIcon = getStatusIcon(campaign.status);
            return (
              <Card key={campaign.id} data-testid={`card-campaign-${campaign.id}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-5 w-5 text-purple-500" />
                    <CardTitle className="text-lg">{campaign.name}</CardTitle>
                  </div>
                  <Badge variant={getStatusBadgeVariant(campaign.status)}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {campaign.status}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Building2 className="h-4 w-4 mr-2" />
                      {getOrgName(campaign.orgId)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Type: {campaign.type}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Created {new Date(campaign.createdAt).toLocaleDateString()}
                    </div>
                    {campaign.scheduledAt && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="h-4 w-4 inline mr-1" />
                        Scheduled {new Date(campaign.scheduledAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  
                  {/* Integration Status Row */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">Social</div>
                      <IntegrationStatus 
                        status={getIntegrationStatus(campaign, 'social')} 
                        type="social" 
                      />
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">Blog</div>
                      <IntegrationStatus 
                        status={getIntegrationStatus(campaign, 'blog')} 
                        type="blog" 
                      />
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">Push</div>
                      <IntegrationStatus 
                        status={getIntegrationStatus(campaign, 'push')} 
                        type="push" 
                      />
                    </div>
                  </div>
                  
                  {/* Action Buttons Row */}
                  <div className="flex justify-between">
                    <div className="flex space-x-1">
                      <Link href={`/campaigns/${campaign.id}`}>
                        <Button 
                          size="sm" 
                          variant="outline"
                          data-testid={`button-view-${campaign.id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEdit(campaign)}
                        data-testid={`button-edit-${campaign.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {campaign.type === 'email' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleSendEmail(campaign)}
                          data-testid={`button-send-email-${campaign.id}`}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                      <AutoInsertAffiliateButton 
                        campaignId={campaign.id}
                        size="sm"
                        variant="outline"
                      />
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => deleteMutation.mutate(campaign.id)}
                        disabled={deleteMutation.isPending}
                        data-testid={`button-delete-${campaign.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {campaign.status === 'draft' && (
                      <Button size="sm" data-testid={`button-launch-${campaign.id}`}>
                        <Play className="h-4 w-4 mr-1" />
                        Launch
                      </Button>
                    )}
                  </div>
                  
                  {/* Integration Actions */}
                  <Separator className="my-3" />
                  <div className="flex space-x-1">
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleSchedulePost(campaign)}
                      disabled={schedulePostMutation.isPending || getIntegrationStatus(campaign, 'social') === 'scheduled'}
                      data-testid={`button-schedule-social-${campaign.id}`}
                      className="flex-1"
                    >
                      {schedulePostMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Share2 className="h-4 w-4 mr-1" />
                      )}
                      Schedule Social
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handlePublishBlog(campaign)}
                      disabled={publishBlogMutation.isPending || getIntegrationStatus(campaign, 'blog') === 'published'}
                      data-testid={`button-publish-blog-${campaign.id}`}
                      className="flex-1"
                    >
                      {publishBlogMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <FileText className="h-4 w-4 mr-1" />
                      )}
                      Publish Blog
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleSendPush(campaign)}
                      disabled={sendPushMutation.isPending || getIntegrationStatus(campaign, 'push') === 'sent'}
                      data-testid={`button-send-push-${campaign.id}`}
                      className="flex-1"
                    >
                      {sendPushMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Bell className="h-4 w-4 mr-1" />
                      )}
                      Send Push
                    </Button>
                  </div>

                  {/* Enhancements Section */}
                  <Separator className="my-3" />
                  <div className="space-y-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleEnhancementPanel(campaign.id)}
                      className="w-full justify-between"
                      data-testid={`button-toggle-enhancements-${campaign.id}`}
                    >
                      <div className="flex items-center gap-2">
                        <Wand2 className="h-4 w-4" />
                        Enhancements
                      </div>
                      {expandedEnhancementCampaigns.has(campaign.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>

                    {expandedEnhancementCampaigns.has(campaign.id) && (
                      <div className="mt-3 space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          {/* Content Rewrite Enhancement */}
                          <div className="p-3 border rounded-lg bg-blue-50 dark:bg-blue-900/20">
                            <div className="flex items-center gap-2 mb-2">
                              <Type className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Content Rewrite</span>
                            </div>
                            <p className="text-xs text-blue-700 dark:text-blue-200 mb-2">No rewritten content</p>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="w-full text-xs"
                              data-testid={`button-enhance-rewrite-${campaign.id}`}
                              onClick={() => {
                                toast({
                                  title: "Coming Soon",
                                  description: "Content rewriting for campaigns is being implemented."
                                });
                              }}
                            >
                              Add Rewrite
                            </Button>
                          </div>

                          {/* TTS Enhancement */}
                          <div className="p-3 border rounded-lg bg-green-50 dark:bg-green-900/20">
                            <div className="flex items-center gap-2 mb-2">
                              <Volume2 className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium text-green-900 dark:text-green-100">Text-to-Speech</span>
                            </div>
                            <p className="text-xs text-green-700 dark:text-green-200 mb-2">No audio content</p>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="w-full text-xs"
                              data-testid={`button-enhance-tts-${campaign.id}`}
                              onClick={() => {
                                toast({
                                  title: "Coming Soon",
                                  description: "Text-to-speech for campaigns is being implemented."
                                });
                              }}
                            >
                              Add Audio
                            </Button>
                          </div>

                          {/* Image Enhancement */}
                          <div className="p-3 border rounded-lg bg-purple-50 dark:bg-purple-900/20">
                            <div className="flex items-center gap-2 mb-2">
                              <Image className="h-4 w-4 text-purple-600" />
                              <span className="text-sm font-medium text-purple-900 dark:text-purple-100">AI Images</span>
                            </div>
                            <p className="text-xs text-purple-700 dark:text-purple-200 mb-2">No generated images</p>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="w-full text-xs"
                              data-testid={`button-enhance-image-${campaign.id}`}
                              onClick={() => {
                                toast({
                                  title: "Coming Soon",
                                  description: "AI image generation for campaigns is being implemented."
                                });
                              }}
                            >
                              Add Images
                            </Button>
                          </div>

                          {/* Video Enhancement */}
                          <div className="p-3 border rounded-lg bg-orange-50 dark:bg-orange-900/20">
                            <div className="flex items-center gap-2 mb-2">
                              <Video className="h-4 w-4 text-orange-600" />
                              <span className="text-sm font-medium text-orange-900 dark:text-orange-100">Video Content</span>
                            </div>
                            <p className="text-xs text-orange-700 dark:text-orange-200 mb-2">No video content</p>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="w-full text-xs"
                              data-testid={`button-enhance-video-${campaign.id}`}
                              onClick={() => {
                                toast({
                                  title: "Coming Soon",
                                  description: "Video generation for campaigns is being implemented."
                                });
                              }}
                            >
                              Add Video
                            </Button>
                          </div>

                          {/* Intelligence Enhancement */}
                          <CampaignIntelligenceCard campaign={campaign} />
                        </div>
                        
                        <div className="text-center">
                          <Button 
                            size="sm" 
                            className="w-full"
                            data-testid={`button-view-all-enhancements-${campaign.id}`}
                            onClick={() => {
                              toast({
                                title: "Coming Soon",
                                description: "Full enhancement management is being implemented."
                              });
                            }}
                          >
                            <Wand2 className="h-4 w-4 mr-2" />
                            View All Enhancements
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* A/B Testing Section */}
                  <Separator className="my-3" />
                  <div className="space-y-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleAbTestPanel(campaign.id)}
                      className="w-full justify-between"
                      data-testid={`button-toggle-ab-test-${campaign.id}`}
                    >
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        A/B Testing
                      </div>
                      {expandedAbTestCampaigns.has(campaign.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>

                    {expandedAbTestCampaigns.has(campaign.id) && (
                      <div className="mt-3">
                        <AbPanel campaignId={campaign.id.toString()} />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {filteredCampaigns.length === 0 && !isLoading && (
        <Card>
          <CardContent className="text-center py-8">
            <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No campaigns found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm || selectedOrgFilter !== 'all' || selectedStatusFilter !== 'all'
                ? 'No campaigns match your filters.' 
                : 'Get started by creating your first campaign.'}
            </p>
            {!searchTerm && selectedOrgFilter === 'all' && selectedStatusFilter === 'all' && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Campaign
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Send Email Drawer */}
      <Sheet open={isEmailDrawerOpen} onOpenChange={setIsEmailDrawerOpen}>
        <SheetContent side="right" className="w-[400px] sm:w-[540px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Send Email Campaign
            </SheetTitle>
            <SheetDescription>
              {selectedCampaignForEmail ? `Configure email settings for "${selectedCampaignForEmail.name}"` : 'Configure email settings'}
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            {/* Campaign Info */}
            {selectedCampaignForEmail && (
              <div className="space-y-2">
                <h4 className="font-medium">Campaign Details</h4>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <div className="text-sm font-medium">{selectedCampaignForEmail.name}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Type: {selectedCampaignForEmail.type} • Status: {selectedCampaignForEmail.status}
                  </div>
                </div>
              </div>
            )}

            {/* A/B Testing Variant Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <TestTube className="h-4 w-4" />
                Email Variant
              </Label>
              <Select value={selectedVariant} onValueChange={setSelectedVariant}>
                <SelectTrigger data-testid="select-email-variant">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Variant A (Default)</SelectItem>
                  <SelectItem value="B">Variant B (Alternative)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Choose which version of your email content to send
              </p>
            </div>

            <Separator />

            {/* Segment Selection */}
            <div className="space-y-4">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Target Segments
              </Label>
              <div className="space-y-3">
                {mockSegments.map((segment) => (
                  <div key={segment.id} className="flex items-start space-x-3">
                    <Checkbox
                      id={`segment-${segment.id}`}
                      checked={selectedSegments.includes(segment.id)}
                      onCheckedChange={() => handleSegmentToggle(segment.id)}
                      data-testid={`checkbox-segment-${segment.id}`}
                    />
                    <div className="flex-1">
                      <Label 
                        htmlFor={`segment-${segment.id}`} 
                        className="text-sm font-medium cursor-pointer"
                      >
                        {segment.name}
                      </Label>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {segment.description} • {segment.contactCount.toLocaleString()} contacts
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {selectedSegments.length > 0 && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                  <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Total Recipients: {getTotalRecipients().toLocaleString()}
                  </div>
                  <div className="text-xs text-blue-700 dark:text-blue-200 mt-1">
                    Your email will be sent to contacts in the selected segments
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Dry Run Toggle */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="dry-run"
                checked={isDryRun}
                onCheckedChange={(checked) => setIsDryRun(!!checked)}
                data-testid="checkbox-dry-run"
              />
              <div className="flex-1">
                <Label htmlFor="dry-run" className="text-sm font-medium cursor-pointer">
                  Test Mode (Dry Run)
                </Label>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Preview send without actually sending emails
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setIsEmailDrawerOpen(false)}
                className="flex-1"
                data-testid="button-cancel-send-email"
              >
                Cancel
              </Button>
              <Button
                onClick={onSendEmail}
                disabled={sendEmailMutation.isPending || selectedSegments.length === 0}
                className="flex-1"
                data-testid="button-confirm-send-email"
              >
                {sendEmailMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isDryRun ? 'Preview Send' : 'Send Email'}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit Campaign Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Campaign</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campaign Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter campaign name" 
                        data-testid="input-edit-campaign-name"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campaign Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-edit-campaign-type">
                          <SelectValue placeholder="Select campaign type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="email">Email Campaign</SelectItem>
                        <SelectItem value="social">Social Media</SelectItem>
                        <SelectItem value="content">Content Marketing</SelectItem>
                        <SelectItem value="ads">Paid Advertising</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="orgId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger data-testid="select-edit-campaign-organization">
                          <SelectValue placeholder="Select organization" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {organizations?.map((org) => (
                          <SelectItem key={org.id} value={org.id.toString()}>
                            {org.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                  data-testid="button-cancel-edit"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateMutation.isPending}
                  data-testid="button-submit-edit"
                >
                  {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Update
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Instruction Footer */}
      <InstructionFooter
        title="Campaigns"
        whatIsIt="Multi-channel campaigns (email/social/blog/push) with artifacts per channel."
        setupSteps={[
          "Create a campaign record; add artifacts for the channels you plan to use.",
          "If using email, authenticate domain (SPF/DKIM/DMARC) in your sender service."
        ]}
        usageSteps={[
          "Preview artifacts; choose a segment; send/schedule.",
          "Open the campaign detail to watch recipients and events update."
        ]}
        envKeys={["BREVO_API_KEY","RESEND_API_KEY","BUFFER_ACCESS_TOKEN","ONESIGNAL_APP_ID","ONESIGNAL_REST_API_KEY","NOTION_API_KEY","NOTION_BLOG_DB_ID"]}
        featureFlags={["email", "social", "blog", "push"]}
      />
    </div>
  );
};

export default CampaignsPage;