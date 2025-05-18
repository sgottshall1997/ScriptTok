import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
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
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Loader2, Save, Settings } from 'lucide-react';
import { queryClient, apiRequest } from '@/lib/queryClient';

// Form schema definition for user preferences
const formSchema = z.object({
  defaultNiche: z.string().nullable(),
  defaultContentType: z.string().nullable(),
  defaultTone: z.string().nullable(),
  defaultModel: z.string().nullable(),
});

type FormData = z.infer<typeof formSchema>;

// List of available options
const niches = [
  { label: 'Skincare', value: 'skincare' },
  { label: 'Tech', value: 'tech' },
  { label: 'Fashion', value: 'fashion' },
  { label: 'Home', value: 'home' },
  { label: 'Food', value: 'food' },
  { label: 'Fitness', value: 'fitness' },
  { label: 'Travel', value: 'travel' },
  { label: 'Pet', value: 'pet' },
];

const contentTypes = [
  { label: 'Instagram Post', value: 'instagram_post' },
  { label: 'TikTok Script', value: 'tiktok_script' },
  { label: 'YouTube Description', value: 'youtube_description' },
  { label: 'Product Review', value: 'product_review' },
  { label: 'Blog Post', value: 'blog_post' },
  { label: 'Tweet Thread', value: 'tweet_thread' },
];

const tones = [
  { label: 'Professional', value: 'professional' },
  { label: 'Casual', value: 'casual' },
  { label: 'Enthusiastic', value: 'enthusiastic' },
  { label: 'Funny', value: 'funny' },
  { label: 'Informative', value: 'informative' },
  { label: 'Persuasive', value: 'persuasive' },
];

const models = [
  { label: 'GPT-4o', value: 'gpt-4o' },
  { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
  { label: 'Claude 3.7 Sonnet', value: 'claude-3-7-sonnet' },
];

const UserPreferences: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [usePreferences, setUsePreferences] = useState<boolean>(true);

  // Fetch user preferences
  const { data: preferences, isLoading } = useQuery({
    queryKey: ['/api/preferences'],
    queryFn: async () => {
      const response = await fetch('/api/preferences');
      if (!response.ok) {
        throw new Error('Failed to fetch preferences');
      }
      return response.json();
    },
    enabled: !!user, // Only run query if user is authenticated
  });

  // Form setup
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      defaultNiche: null,
      defaultContentType: null,
      defaultTone: null,
      defaultModel: null,
    },
  });

  // Update form values when preferences are loaded
  useEffect(() => {
    if (preferences) {
      form.reset({
        defaultNiche: preferences.defaultNiche || null,
        defaultContentType: preferences.defaultContentType || null,
        defaultTone: preferences.defaultTone || null,
        defaultModel: preferences.defaultModel || null,
      });
    }
  }, [preferences, form]);

  // Save preferences mutation
  const savePreferences = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest('POST', '/api/preferences/update', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Preferences saved",
        description: "Your default settings have been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/preferences'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to save preferences",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = (data: FormData) => {
    savePreferences.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading your preferences...</span>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl mx-auto py-8">
      <div className="flex items-center mb-6">
        <Settings className="h-6 w-6 mr-2 text-primary" />
        <h1 className="text-3xl font-bold">User Preferences</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Default Content Settings</CardTitle>
          <CardDescription>
            Set your preferred defaults for content generation. These settings will be applied automatically unless overridden.
          </CardDescription>
          <div className="flex items-center mt-2">
            <Switch 
              id="use-preferences" 
              checked={usePreferences}
              onCheckedChange={setUsePreferences}
              className="mr-2"
            />
            <label htmlFor="use-preferences" className="text-sm text-muted-foreground cursor-pointer">
              Apply these preferences automatically when generating content
            </label>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="defaultNiche"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Niche</FormLabel>
                      <Select
                        disabled={!usePreferences}
                        onValueChange={field.onChange}
                        value={field.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a niche" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {niches.map((niche) => (
                            <SelectItem key={niche.value} value={niche.value}>
                              {niche.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The default content niche to pre-select
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="defaultContentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Content Type</FormLabel>
                      <Select
                        disabled={!usePreferences}
                        onValueChange={field.onChange}
                        value={field.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a content type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {contentTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Your preferred content format
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="defaultTone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Tone</FormLabel>
                      <Select
                        disabled={!usePreferences}
                        onValueChange={field.onChange}
                        value={field.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a tone" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {tones.map((tone) => (
                            <SelectItem key={tone.value} value={tone.value}>
                              {tone.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Your preferred writing tone
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="defaultModel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default AI Model</FormLabel>
                      <Select
                        disabled={!usePreferences}
                        onValueChange={field.onChange}
                        value={field.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an AI model" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {models.map((model) => (
                            <SelectItem key={model.value} value={model.value}>
                              {model.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Your preferred AI model
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <CardFooter className="flex justify-end pt-6 px-0">
                <Button 
                  type="submit"
                  disabled={savePreferences.isPending || !usePreferences}
                  className="flex items-center"
                >
                  {savePreferences.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Preferences
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserPreferences;