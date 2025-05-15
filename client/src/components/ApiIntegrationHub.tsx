import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ApiIntegration, SocialMediaPlatform, PublishedContent } from '@shared/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { Loader2, RefreshCw, Plus, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';

// Form schema for API integration
const integrationSchema = z.object({
  name: z.string().min(3, { message: 'Name must be at least 3 characters long' }),
  provider: z.string().min(1, { message: 'Provider is required' }),
  apiKey: z.string().optional(),
  apiSecret: z.string().optional(),
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
  tokenExpiresAt: z.string().optional(),
  userId: z.number().default(1), // Default for demo
});

type IntegrationFormValues = z.infer<typeof integrationSchema>;

export function ApiIntegrationHub() {
  const [activeTab, setActiveTab] = useState('integrations');
  const [selectedPlatform, setSelectedPlatform] = useState<number | null>(null);
  const [isAddingIntegration, setIsAddingIntegration] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock user ID - in a real app this would come from auth
  const userId = 1;

  // Fetch platforms
  const {
    data: platforms,
    isLoading: platformsLoading,
    error: platformsError,
  } = useQuery({
    queryKey: ['/api/integrations/platforms'],
  });

  // Fetch user integrations
  const {
    data: integrations,
    isLoading: integrationsLoading,
    error: integrationsError,
  } = useQuery({
    queryKey: ['/api/integrations/integrations', { userId }],
  });

  // Fetch published content history
  const {
    data: publishedContent,
    isLoading: publishedContentLoading,
    error: publishedContentError,
  } = useQuery({
    queryKey: ['/api/integrations/published', { userId }],
  });

  // Create new integration mutation
  const createIntegrationMutation = useMutation({
    mutationFn: async (data: IntegrationFormValues) => {
      return apiRequest('/api/integrations/integrations', {
        method: 'POST',
        data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/integrations/integrations'] });
      toast({
        title: 'Integration created',
        description: 'Your new integration has been created successfully.',
      });
      setIsAddingIntegration(false);
    },
    onError: (error) => {
      toast({
        title: 'Failed to create integration',
        description: 'There was an error creating your integration. Please try again.',
        variant: 'destructive',
      });
      console.error('Integration creation error:', error);
    },
  });

  // Delete integration mutation
  const deleteIntegrationMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/integrations/integrations/${id}?userId=${userId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/integrations/integrations'] });
      toast({
        title: 'Integration deleted',
        description: 'The integration has been removed successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to delete integration',
        description: 'There was an error deleting the integration. Please try again.',
        variant: 'destructive',
      });
      console.error('Integration deletion error:', error);
    },
  });

  // Form setup
  const form = useForm<IntegrationFormValues>({
    resolver: zodResolver(integrationSchema),
    defaultValues: {
      name: '',
      provider: '',
      apiKey: '',
      apiSecret: '',
      accessToken: '',
      refreshToken: '',
      userId: 1,
    },
  });

  // Submit handler for the integration form
  function onSubmit(values: IntegrationFormValues) {
    createIntegrationMutation.mutate(values);
  }

  function handleDeleteIntegration(id: number) {
    if (window.confirm('Are you sure you want to delete this integration?')) {
      deleteIntegrationMutation.mutate(id);
    }
  }

  // Helper function to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  // Helper function to get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" /> Success
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" /> Failed
          </Badge>
        );
      case 'scheduled':
        return (
          <Badge variant="outline" className="border-amber-500 text-amber-500">
            <Clock className="h-3 w-3 mr-1" /> Scheduled
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" /> Pending
          </Badge>
        );
    }
  };

  // Reset form when adding a new integration
  useEffect(() => {
    if (isAddingIntegration) {
      form.reset();
    }
  }, [isAddingIntegration, form]);

  // Set platform when available
  useEffect(() => {
    if (platforms && platforms.length > 0 && !selectedPlatform) {
      setSelectedPlatform(platforms[0].id);
    }
  }, [platforms, selectedPlatform]);

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">API Integration Hub</h1>
      <p className="text-muted-foreground mb-8">
        Connect your content to social media platforms and publishing tools
      </p>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="integrations">My Integrations</TabsTrigger>
          <TabsTrigger value="platforms">Available Platforms</TabsTrigger>
          <TabsTrigger value="published">Published Content</TabsTrigger>
        </TabsList>

        {/* Integrations Tab */}
        <TabsContent value="integrations">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Your API Integrations</h2>
            <Button onClick={() => setIsAddingIntegration(true)}>
              <Plus className="h-4 w-4 mr-2" /> Add Integration
            </Button>
          </div>

          {integrationsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : integrationsError ? (
            <Card className="mb-6">
              <CardContent className="py-6">
                <p className="text-center text-destructive">
                  Error loading integrations. Please try again.
                </p>
              </CardContent>
            </Card>
          ) : integrations && integrations.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {integrations.map((integration: ApiIntegration) => (
                <Card key={integration.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle>{integration.name}</CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteIntegration(integration.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    <CardDescription>{integration.provider}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="font-medium text-xs text-muted-foreground">Created</p>
                        <p>{formatDate(integration.createdAt.toString())}</p>
                      </div>
                      <div>
                        <p className="font-medium text-xs text-muted-foreground">Updated</p>
                        <p>{formatDate(integration.updatedAt.toString())}</p>
                      </div>
                      {integration.tokenExpiresAt && (
                        <div className="col-span-2">
                          <p className="font-medium text-xs text-muted-foreground">
                            Token Expires
                          </p>
                          <p>{formatDate(integration.tokenExpiresAt.toString())}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="bg-muted/50 pt-3">
                    <Button variant="outline" size="sm" className="w-full">
                      Manage Integration
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="mb-6">
              <CardContent className="py-12 text-center">
                <p className="mb-4 text-muted-foreground">
                  You don't have any API integrations yet.
                </p>
                <Button onClick={() => setIsAddingIntegration(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Add Your First Integration
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Platforms Tab */}
        <TabsContent value="platforms">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Available Social Media Platforms</h2>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" /> Refresh
            </Button>
          </div>

          {platformsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : platformsError ? (
            <Card className="mb-6">
              <CardContent className="py-6">
                <p className="text-center text-destructive">
                  Error loading platforms. Please try again.
                </p>
              </CardContent>
            </Card>
          ) : platforms && platforms.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {platforms.map((platform: SocialMediaPlatform) => (
                <Card key={platform.id}>
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      {platform.logoUrl ? (
                        <img
                          src={platform.logoUrl}
                          alt={platform.platformName}
                          className="h-8 w-8 rounded"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
                          <span className="text-xs font-bold">
                            {platform.platformName.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <CardTitle>{platform.platformName}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 text-sm text-muted-foreground">
                      {platform.description || 'No description available.'}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="font-medium text-xs text-muted-foreground">
                          Character Limit
                        </p>
                        <p>{platform.postLengthLimit || 'Unlimited'}</p>
                      </div>
                      <div>
                        <p className="font-medium text-xs text-muted-foreground">Status</p>
                        <Badge variant={platform.isActive ? 'default' : 'secondary'}>
                          {platform.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setSelectedPlatform(platform.id);
                        setIsAddingIntegration(true);
                      }}
                    >
                      Connect
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="mb-6">
              <CardContent className="py-12 text-center">
                <p>No platforms available at the moment.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Published Content Tab */}
        <TabsContent value="published">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Published Content History</h2>
          </div>

          {publishedContentLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : publishedContentError ? (
            <Card className="mb-6">
              <CardContent className="py-6">
                <p className="text-center text-destructive">
                  Error loading published content. Please try again.
                </p>
              </CardContent>
            </Card>
          ) : publishedContent && publishedContent.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Content ID</TableHead>
                      <TableHead>Platform</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Published At</TableHead>
                      <TableHead>Scheduled Time</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {publishedContent.map((content: PublishedContent) => (
                      <TableRow key={content.id}>
                        <TableCell>{content.contentId}</TableCell>
                        <TableCell>{content.platformId}</TableCell>
                        <TableCell>{getStatusBadge(content.publishStatus)}</TableCell>
                        <TableCell>
                          {content.publishedAt
                            ? formatDate(content.publishedAt.toString())
                            : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {content.scheduledPublishTime
                            ? formatDate(content.scheduledPublishTime.toString())
                            : 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Card className="mb-6">
              <CardContent className="py-12 text-center">
                <p className="mb-4 text-muted-foreground">
                  You haven't published any content yet.
                </p>
                <Button
                  onClick={() => {
                    setActiveTab('integrations');
                  }}
                >
                  Setup an Integration First
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Integration Dialog */}
      <Dialog open={isAddingIntegration} onOpenChange={setIsAddingIntegration}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Add New API Integration</DialogTitle>
            <DialogDescription>
              Connect your account with a social media platform or external service.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Integration Name</FormLabel>
                    <FormControl>
                      <Input placeholder="My Instagram Account" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="provider"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Platform</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a platform" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {platforms &&
                          platforms.map((platform: SocialMediaPlatform) => (
                            <SelectItem
                              key={platform.id}
                              value={platform.platformName}
                            >
                              {platform.platformName}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="apiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Key</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="apiSecret"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Secret</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="accessToken"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Access Token (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddingIntegration(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createIntegrationMutation.isPending}>
                  {createIntegrationMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Integration
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ApiIntegrationHub;