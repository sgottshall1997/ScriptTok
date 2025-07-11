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
              Each content generation will send the following complete data structure to your webhook URL:
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-4 text-sm">
              <p className="font-medium text-blue-800 mb-2">Webhook Payload Fields:</p>
              <ul className="text-blue-700 space-y-1 text-xs">
                <li><strong>event_type:</strong> Always "content_generated"</li>
                <li><strong>platform:</strong> Target platform (tiktok, instagram, youtube, twitter, other)</li>
                <li><strong>niche:</strong> Content niche (beauty, tech, fashion, fitness, food, travel, pets)</li>
                <li><strong>script:</strong> Main content/video script</li>
                <li><strong>instagramCaption:</strong> Instagram-optimized caption with hashtags</li>
                <li><strong>tiktokCaption:</strong> TikTok-optimized caption with viral language</li>
                <li><strong>youtubeCaption:</strong> YouTube Shorts voiceover-style caption</li>
                <li><strong>xCaption:</strong> Twitter/X optimized short caption</li>
                <li><strong>facebookCaption:</strong> Facebook-optimized caption</li>
                <li><strong>affiliateLink:</strong> Amazon affiliate link with tracking</li>
                <li><strong>product:</strong> Product name</li>
                <li><strong>imageUrl:</strong> Product image URL or placeholder</li>
                <li><strong>tone:</strong> Content tone (enthusiastic, professional, etc.)</li>
                <li><strong>template:</strong> Content template used</li>
                <li><strong>model:</strong> AI model used (ChatGPT or Claude)</li>
                <li><strong>contentFormat:</strong> Format type (Regular Format or Spartan Format)</li>
                <li><strong>postType:</strong> Content type (reel, post, etc.)</li>
                <li><strong>topRatedStyleUsed:</strong> Whether smart style learning was enabled</li>
                <li><strong>timestamp:</strong> Generation timestamp</li>
              </ul>
            </div>
            <div className="bg-muted p-4 rounded-md text-xs font-mono w-full overflow-auto">
              {JSON.stringify({
                event_type: "content_generated",
                platform: "tiktok",
                niche: "beauty",
                script: "Transform your skincare routine with this Hero serum! This beginner-friendly formula delivers visible results in just 7 days. Perfect for anyone starting their glow-up journey ✨",
                instagramCaption: "This Hero serum has been my skincare game-changer ✨ Perfect for beginners who want real results without the guesswork #skincare #beauty #glowup",
                tiktokCaption: "POV: You found the perfect beginner serum 🌟 Hero My First Serum is literally changing my skin game! Who else is obsessed? #skincare #hero #glowup",
                youtubeCaption: "*This serum has completely transformed my skincare routine* If you're a beginner looking for real results, Hero My First Serum is the perfect starting point #skincare",
                xCaption: "Plot twist: the best beginner serum was from Hero all along 💫 This changed my entire skincare game #skincare",
                facebookCaption: "Discovering this Hero serum has been such a game-changer for my skincare journey ✨ Perfect for anyone starting their glow-up routine #skincare #beauty #selfcare",
                affiliateLink: "https://www.amazon.com/s?k=Hero+My+First+Serum+1.69+fl+oz&tag=sgottshall107-20",
                product: "Hero My First Serum 1.69 fl oz",
                imageUrl: "https://via.placeholder.com/400x400?text=Hero%20My%20First%20Serum%201.69%20fl%20oz",
                tone: "enthusiastic",
                template: "short_video_script",
                model: "Claude",
                contentFormat: "Regular Format",
                postType: "reel",
                topRatedStyleUsed: true,
                timestamp: new Date().toISOString()
              }, null, 2)}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default WebhookSettings;