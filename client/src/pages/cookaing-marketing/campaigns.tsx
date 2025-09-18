import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { insertCampaignSchema, campaigns, organizations } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

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

  const handleSegmentToggle = (segmentId: number) => {
    setSelectedSegments(prev => 
      prev.includes(segmentId) 
        ? prev.filter(id => id !== segmentId)
        : [...prev, segmentId]
    );
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
                  <div className="flex justify-between">
                    <div className="flex space-x-1">
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
    </div>
  );
};

export default CampaignsPage;