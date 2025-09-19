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
    if (data && 'config' in data && data.config) {
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
              <p className="font-medium text-blue-800 mb-2">Webhook Payload Fields (36 Total):</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-700 text-xs">
                <div>
                  <p className="font-semibold text-blue-800 mb-1">Basic Content Fields:</p>
                  <ul className="space-y-1">
                    <li><strong>event_type:</strong> Always "content_generated"</li>
                    <li><strong>platform:</strong> Target platform (tiktok, instagram, youtube, twitter, other)</li>
                    <li><strong>niche:</strong> Content niche (beauty, tech, fashion, fitness, food, travel, pets)</li>
                    <li><strong>script:</strong> Main content/video script</li>
                    <li><strong>product:</strong> Product name</li>
                    <li><strong>imageUrl:</strong> Product image URL or placeholder</li>
                    <li><strong>tone:</strong> Content tone (enthusiastic, professional, etc.)</li>
                    <li><strong>template:</strong> Content template used</li>
                    <li><strong>postType:</strong> Content type (reel, post, etc.)</li>
                    <li><strong>timestamp:</strong> Generation timestamp</li>
                  </ul>
                </div>
                
                <div>
                  <p className="font-semibold text-blue-800 mb-1">Platform-Specific Captions:</p>
                  <ul className="space-y-1">
                    <li><strong>instagramCaption:</strong> Instagram-optimized caption with hashtags</li>
                    <li><strong>tiktokCaption:</strong> TikTok-optimized caption with viral language</li>
                    <li><strong>youtubeCaption:</strong> YouTube Shorts voiceover-style caption</li>
                    <li><strong>xCaption:</strong> Twitter/X optimized short caption</li>
                    <li><strong>facebookCaption:</strong> Facebook-optimized caption</li>
                  </ul>
                  
                  <p className="font-semibold text-blue-800 mb-1 mt-3">AI & Monetization:</p>
                  <ul className="space-y-1">
                    <li><strong>model:</strong> AI model used (ChatGPT or Claude)</li>
                    <li><strong>contentFormat:</strong> Format type (Regular Format or Spartan Format)</li>
                    <li><strong>topRatedStyleUsed:</strong> Whether smart style learning was enabled</li>
                    <li><strong>affiliateLink:</strong> Amazon affiliate link with tracking</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-t border-blue-200">
                <p className="font-semibold text-blue-800 mb-2">Viral Inspiration Data (from Perplexity API):</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ul className="space-y-1 text-xs">
                    <li><strong>viralHook:</strong> Trending hook from real social media analysis</li>
                    <li><strong>viralFormat:</strong> Video format recommendations</li>
                    <li><strong>viralCaption:</strong> Trending caption styles</li>
                  </ul>
                  <ul className="space-y-1 text-xs">
                    <li><strong>viralHashtags:</strong> Actual trending hashtags (comma-separated)</li>
                    <li><strong>viralInspirationFound:</strong> Boolean indicating if data was fetched</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-t border-blue-200">
                <p className="font-semibold text-blue-800 mb-2">Dual AI Evaluation Scores (1-10 Scale):</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium text-blue-700 mb-1">ChatGPT Analysis:</p>
                    <ul className="space-y-1 text-xs">
                      <li><strong>chatgptViralityScore:</strong> Viral potential rating</li>
                      <li><strong>chatgptClarityScore:</strong> Message clarity rating</li>
                      <li><strong>chatgptPersuasivenessScore:</strong> Persuasion effectiveness</li>
                      <li><strong>chatgptCreativityScore:</strong> Creative content rating</li>
                      <li><strong>chatgptOverallScore:</strong> Overall quality score</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-blue-700 mb-1">Claude Analysis:</p>
                    <ul className="space-y-1 text-xs">
                      <li><strong>claudeViralityScore:</strong> Viral potential rating</li>
                      <li><strong>claudeClarityScore:</strong> Message clarity rating</li>
                      <li><strong>claudePersuasivenessScore:</strong> Persuasion effectiveness</li>
                      <li><strong>claudeCreativityScore:</strong> Creative content rating</li>
                      <li><strong>claudeOverallScore:</strong> Overall quality score</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="font-medium text-blue-700 mb-1">Evaluation Summary:</p>
                  <ul className="space-y-1 text-xs">
                    <li><strong>averageOverallScore:</strong> Combined average of both AI evaluations</li>
                    <li><strong>evaluationCompleted:</strong> Boolean indicating if dual AI evaluation finished</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="bg-muted p-4 rounded-md text-xs font-mono w-full overflow-auto">
              <pre className="whitespace-pre-wrap">
{`{
  "event_type": "content_generated",
  "platform": "tiktok",
  "niche": "beauty",
  "script": "Transform your skincare routine with this Hero serum! Perfect for beginners.",
  "instagramCaption": "This Hero serum has been my skincare game-changer ✨ #skincare #beauty",
  "tiktokCaption": "POV: You found the perfect beginner serum 🌟 #skincare #hero #glowup",
  "youtubeCaption": "*This serum has completely transformed my skincare routine* #skincare",
  "xCaption": "Plot twist: the best beginner serum was from Hero all along 💫 #skincare",
  "facebookCaption": "Discovering this Hero serum has been such a game-changer ✨ #skincare",
  "affiliateLink": "https://www.amazon.com/s?k=Hero+Serum&tag=youraffiliateId-20",
  "product": "Hero My First Serum 1.69 fl oz",
  "imageUrl": "https://via.placeholder.com/400x400?text=Hero+Serum",
  "tone": "enthusiastic",
  "template": "Beauty Routine",
  "model": "ChatGPT",
  "contentFormat": "Regular Format",
  "postType": "reel",
  "topRatedStyleUsed": true,
  
  // VIRAL INSPIRATION DATA
  "viralHook": "POV: You finally found the holy grail moisturizer",
  "viralFormat": "Before/After transformation with trending audio",
  "viralCaption": "This moisturizer literally changed my skin game in 30 days",
  "viralHashtags": "#skincare, #cerave, #moisturizer, #skincareroutine, #glowup",
  "viralInspirationFound": true,
  
  // CHATGPT AI EVALUATION
  "chatgptViralityScore": 8.5,
  "chatgptClarityScore": 9.0,
  "chatgptPersuasivenessScore": 7.5,
  "chatgptCreativityScore": 8.0,
  "chatgptOverallScore": 8.2,
  
  // CLAUDE AI EVALUATION
  "claudeViralityScore": 7.8,
  "claudeClarityScore": 8.5,
  "claudePersuasivenessScore": 8.2,
  "claudeCreativityScore": 7.0,
  "claudeOverallScore": 7.9,
  
  // EVALUATION SUMMARY
  "averageOverallScore": 8.1,
  "evaluationCompleted": true,
  
  "timestamp": "2025-07-11T06:15:49.355Z"
}`}
              </pre>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default WebhookSettings;