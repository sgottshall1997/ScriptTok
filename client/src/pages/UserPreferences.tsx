import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { toast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '../lib/queryClient';
import { Loader2 } from 'lucide-react';

// Mock user ID for testing without full auth system
const MOCK_USER_ID = 1;

// Simple function to create a test user if needed
const createTestUser = async () => {
  try {
    console.log("Creating test user for preferences demo...");
    await apiRequest('POST', '/api/test-login', {});
    console.log("Test user created/logged in successfully");
    return true;
  } catch (error) {
    console.error("Failed to create test user:", error);
    return false;
  }
};

// Define the form schema
const formSchema = z.object({
  defaultNiche: z.string().min(1, { message: 'Please select a niche' }),
  defaultContentType: z.string().min(1, { message: 'Please select a content type' }),
  defaultTone: z.string().min(1, { message: 'Please select a tone' }),
  defaultModel: z.string().min(1, { message: 'Please select an AI model' }),
});

type FormValues = z.infer<typeof formSchema>;

const UserPreferences: React.FC = () => {
  // Options for dropdowns
  const [niches, setNiches] = useState([
    'skincare', 'tech', 'fashion', 'fitness', 'food', 'travel', 'pets'
  ]);
  const [contentTypes, setContentTypes] = useState([
    'social_post', 'product_description', 'article', 'email', 'ad_copy'
  ]);
  const [tones, setTones] = useState([
    'professional', 'casual', 'enthusiastic', 'informative', 'persuasive'
  ]);
  const [models, setModels] = useState([
    'gpt-4o', 'claude-3-7-sonnet-20250219'
  ]);

  // State to track if user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Function to log in test user
  const loginTestUser = async () => {
    setIsLoggingIn(true);
    try {
      await createTestUser();
      setIsLoggedIn(true);
      toast({
        title: "Test Login Successful",
        description: "You're now logged in as a test user.",
      });
    } catch (error) {
      console.error("Login failed:", error);
      toast({
        title: "Login Failed",
        description: "Could not create test user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Fetch user preferences
  const { data: preferences, isLoading } = useQuery({
    queryKey: ['/api/preferences'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', `/api/preferences?userId=${MOCK_USER_ID}`);
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Failed to fetch preferences:', error);
        return null;
      }
    },
    enabled: isLoggedIn // Only run query when logged in
  });

  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      defaultNiche: '',
      defaultContentType: '',
      defaultTone: '',
      defaultModel: '',
    },
  });

  // Update form values when preferences are loaded
  useEffect(() => {
    if (preferences) {
      form.reset({
        defaultNiche: preferences.defaultNiche || '',
        defaultContentType: preferences.defaultContentType || '',
        defaultTone: preferences.defaultTone || '',
        defaultModel: preferences.defaultModel || '',
      });
    }
  }, [preferences, form]);

  // Save preferences mutation
  const savePreferences = useMutation({
    mutationFn: async (values: FormValues) => {
      const payload = {
        userId: MOCK_USER_ID,
        ...values
      };
      
      // Check if we're updating or creating
      const method = preferences ? 'PATCH' : 'POST';
      const endpoint = '/api/preferences';
      
      const response = await apiRequest(method, endpoint, payload);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Preferences saved',
        description: 'Your preferences have been updated successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/preferences'] });
    },
    onError: (error) => {
      toast({
        title: 'Failed to save preferences',
        description: 'There was a problem saving your preferences. Please try again.',
        variant: 'destructive',
      });
      console.error('Error saving preferences:', error);
    },
  });

  const onSubmit = (values: FormValues) => {
    savePreferences.mutate(values);
  };

  // Show login screen if not logged in
  if (!isLoggedIn) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>User Preferences</CardTitle>
            <CardDescription>
              Log in with a test account to set your default preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Click the button below to create a test user and access the preferences page.
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={loginTestUser}
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Log in as Test User'
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading your preferences...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>User Preferences</CardTitle>
          <CardDescription>
            Set your default preferences for content generation. These settings will be applied automatically when you create new content.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="defaultNiche"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Niche</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your preferred niche" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {niches.map((niche) => (
                          <SelectItem key={niche} value={niche}>
                            {niche.charAt(0).toUpperCase() + niche.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The default industry to focus on when generating content.
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your preferred content type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {contentTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The default type of content you want to generate.
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your preferred tone" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {tones.map((tone) => (
                          <SelectItem key={tone} value={tone}>
                            {tone.charAt(0).toUpperCase() + tone.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The default tone or voice for your generated content.
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
                    <FormLabel>Preferred AI Model</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your preferred AI model" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {models.map((model) => (
                          <SelectItem key={model} value={model}>
                            {model === 'gpt-4o' ? 'GPT-4o (OpenAI)' : 'Claude 3.7 Sonnet (Anthropic)'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Your preferred AI model for generating content.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button
                type="submit"
                className="w-full"
                disabled={savePreferences.isPending}
              >
                {savePreferences.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Preferences'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserPreferences;