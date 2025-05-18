import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
import { Loader2 } from 'lucide-react';

// Define the form schema
const formSchema = z.object({
  defaultNiche: z.string().min(1, { message: 'Please select a niche' }),
  defaultContentType: z.string().min(1, { message: 'Please select a content type' }),
  defaultTone: z.string().min(1, { message: 'Please select a tone' }),
  defaultModel: z.string().min(1, { message: 'Please select an AI model' }),
});

type FormValues = z.infer<typeof formSchema>;

const TestPreferencesPage: React.FC = () => {
  // Options for dropdowns
  const niches = ['skincare', 'tech', 'fashion', 'fitness', 'food', 'travel', 'pets'];
  const contentTypes = ['social_post', 'product_description', 'article', 'email', 'ad_copy'];
  const tones = ['professional', 'casual', 'enthusiastic', 'informative', 'persuasive'];
  const models = ['gpt-4o', 'claude-3-7-sonnet-20250219'];

  const [isSaving, setIsSaving] = useState(false);

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

  const onSubmit = async (values: FormValues) => {
    setIsSaving(true);
    try {
      // Just simulate saving for this test
      console.log('Saved preferences:', values);
      
      toast({
        title: 'Preferences saved (TEST)',
        description: 'Your preferences would be saved in a real implementation.',
      });
      
      // Display the values that would be saved
      alert(
        'Test Mode: These preferences would be saved:\n\n' +
        `Niche: ${values.defaultNiche}\n` +
        `Content Type: ${values.defaultContentType}\n` +
        `Tone: ${values.defaultTone}\n` +
        `AI Model: ${values.defaultModel}`
      );
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Failed to save preferences',
        description: 'There was a problem saving your preferences. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Test User Preferences</CardTitle>
          <CardDescription>
            This is a test page for setting default preferences for content generation. 
            These settings would be applied automatically when you create new content.
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
                disabled={isSaving}
              >
                {isSaving ? (
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
        <CardFooter className="flex justify-center text-sm text-muted-foreground">
          This is a test page only. No data will be saved to the database.
        </CardFooter>
      </Card>
    </div>
  );
};

export default TestPreferencesPage;