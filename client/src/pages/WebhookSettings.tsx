import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Loader2, TestTube2 } from 'lucide-react';

// Form validation schema
const webhookFormSchema = z.object({
  url: z.string()
    .url('Please enter a valid URL')
    .min(1, 'Webhook URL is required'),
  enabled: z.boolean().default(true),
  secret: z.string().optional(),
});

type WebhookFormValues = z.infer<typeof webhookFormSchema>;

const WebhookSettings = () => {
  const { toast } = useToast();
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);

  // Fetch current webhook configuration
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/webhooks/config'],
  });

  // Setup the form with Zod validation
  const form = useForm<WebhookFormValues>({
    resolver: zodResolver(webhookFormSchema),
    defaultValues: {
      url: '',
      enabled: true,
      secret: '',
    },
  });

  // Update form when data is loaded
  React.useEffect(() => {
    if (data?.config) {
      form.reset({
        url: data.config.url || '',
        enabled: data.config.enabled ?? true,
        secret: data.config.secret ? '' : undefined, // We don't receive actual secret back from API
      });
    }
  }, [data, form]);

  // Mutation for updating webhook configuration
  const updateWebhookMutation = useMutation({
    mutationFn: async (values: WebhookFormValues) => {
      const response = await fetch('/api/webhooks/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update webhook');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Webhook updated',
        description: 'Your webhook configuration has been saved successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/webhooks/config'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to update webhook',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    },
  });

  // Handle form submission
  const onSubmit = (values: WebhookFormValues) => {
    updateWebhookMutation.mutate(values);
  };

  // Test webhook by sending a test notification
  const testWebhook = async () => {
    const currentUrl = form.getValues('url');
    
    if (!currentUrl) {
      toast({
        title: 'No webhook URL',
        description: 'Please enter a webhook URL before testing',
        variant: 'destructive',
      });
      return;
    }
    
    setIsTestingWebhook(true);
    
    try {
      // First save the current configuration
      await updateWebhookMutation.mutateAsync(form.getValues());
      
      // Then send a test notification
      const response = await fetch('/api/webhooks/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send test webhook');
      }
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: 'Test webhook sent',
          description: 'The test notification was sent successfully',
        });
      } else {
        throw new Error(result.message || 'Failed to send test webhook');
      }
    } catch (error: any) {
      toast({
        title: 'Test failed',
        description: error.message || 'Failed to send test webhook',
        variant: 'destructive',
      });
    } finally {
      setIsTestingWebhook(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Webhook Settings</h1>
        <p className="text-muted-foreground">
          Configure webhooks to send content generation events to external systems
        </p>
      </div>
      
      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Make.com Integration</CardTitle>
            <CardDescription>
              Configure your webhook URL to send real-time content generation data to Make.com
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-6">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="bg-destructive/10 text-destructive p-4 rounded-md">
                Failed to load webhook configuration: {error instanceof Error ? error.message : 'Unknown error'}
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="enabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Enable Webhook
                          </FormLabel>
                          <FormDescription>
                            When enabled, content generation events will be sent to your webhook URL
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Webhook URL</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://hook.make.com/yourwebhookid"
                            {...field}
                            disabled={!form.watch('enabled')}
                          />
                        </FormControl>
                        <FormDescription>
                          Enter your Make.com webhook URL to receive real-time content generation events
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="secret"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Secret Key (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Leave blank to keep existing secret"
                            {...field}
                            value={field.value || ''}
                            disabled={!form.watch('enabled')}
                          />
                        </FormControl>
                        <FormDescription>
                          Optional shared secret for securing your webhook
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                    <Button 
                      type="submit" 
                      disabled={updateWebhookMutation.isPending}
                    >
                      {updateWebhookMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Configuration'
                      )}
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={testWebhook}
                      disabled={isTestingWebhook || !form.watch('url') || !form.watch('enabled')}
                    >
                      {isTestingWebhook ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <TestTube2 className="mr-2 h-4 w-4" />
                          Test Webhook
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col items-start border-t px-6 py-4">
            <h3 className="text-lg font-medium mb-2">Webhook Data</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Each content generation will send the following data to your webhook URL:
            </p>
            <div className="bg-muted p-4 rounded-md text-xs font-mono w-full overflow-auto">
              {JSON.stringify({
                event_type: "content_generated",
                timestamp: new Date().toISOString(),
                content_metadata: {
                  id: 123,
                  niche: "skincare",
                  contentType: "instagram_post",
                  tone: "professional",
                  productName: "Example Product",
                  modelUsed: "gpt-4o",
                  tokenCount: 450,
                  createdAt: new Date().toISOString()
                },
                content: {
                  prompt: "Generate content for Example Product...",
                  output: "Generated content will appear here..."
                }
              }, null, 2)}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default WebhookSettings;