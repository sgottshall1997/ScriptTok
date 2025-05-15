import { FC, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { NICHES, TEMPLATE_TYPES, TONE_OPTIONS } from '@shared/constants';
import { InfoIcon, Save, RefreshCw } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Define the schema for AI model configuration
const configSchema = z.object({
  niche: z.enum(NICHES),
  templateType: z.enum(TEMPLATE_TYPES),
  tone: z.enum(TONE_OPTIONS),
  temperature: z.number().min(0).max(1),
  frequencyPenalty: z.number().min(0).max(2),
  presencePenalty: z.number().min(0).max(2),
  modelName: z.string(),
});

type ModelConfiguration = z.infer<typeof configSchema>;

interface AIConfigurationPanelProps {
  onConfigChange?: (config: ModelConfiguration) => void;
}

const AIConfigurationPanel: FC<AIConfigurationPanelProps> = ({ onConfigChange }) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  // Default configuration values
  const defaultValues: ModelConfiguration = {
    niche: "skincare",
    templateType: "original",
    tone: "friendly",
    temperature: 0.7,
    frequencyPenalty: 0.2,
    presencePenalty: 0.1,
    modelName: "gpt-4o",
  };

  const form = useForm<ModelConfiguration>({
    resolver: zodResolver(configSchema),
    defaultValues,
  });

  // Fetch the current AI model configuration
  const { data: currentConfig, isLoading } = useQuery({
    queryKey: ['/api/ai-model-config'],
    queryFn: async () => {
      const response = await apiRequest('POST', '/api/ai-model-config', {
        niche: form.getValues('niche'),
        templateType: form.getValues('templateType'),
        tone: form.getValues('tone'),
      });
      const data = await response.json();
      return data as ModelConfiguration;
    },
    enabled: open,
  });

  // Effect to update form when currentConfig changes
  useEffect(() => {
    if (currentConfig) {
      form.reset(currentConfig);
    }
  }, [currentConfig, form]);

  // Effect to notify parent component when config changes
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (onConfigChange && value.niche && value.templateType && value.tone) {
        onConfigChange(value as ModelConfiguration);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, onConfigChange]);

  // Save the AI model configuration
  const saveConfigMutation = useMutation({
    mutationFn: async (values: ModelConfiguration) => {
      return await apiRequest('POST', '/api/ai-model-config/save', values);
    },
    onSuccess: () => {
      toast({
        title: "Configuration saved",
        description: "Your AI model configuration has been saved successfully.",
      });
      setOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to save configuration",
        description: "There was an error saving your AI model configuration.",
        variant: "destructive",
      });
      console.error("Configuration save error:", error);
    },
  });

  const onSubmit = (values: ModelConfiguration) => {
    saveConfigMutation.mutate(values);
  };

  // Get a fresh configuration from the server
  const refreshConfiguration = () => {
    if (form.getValues('niche') && form.getValues('templateType') && form.getValues('tone')) {
      fetch('/api/ai-model-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          niche: form.getValues('niche'),
          templateType: form.getValues('templateType'),
          tone: form.getValues('tone'),
        }),
      })
        .then(res => res.json())
        .then(data => {
          form.reset(data);
          toast({
            title: "Configuration refreshed",
            description: "AI model parameters have been updated.",
          });
        })
        .catch(err => {
          toast({
            title: "Refresh failed",
            description: "Could not fetch the latest configuration.",
            variant: "destructive",
          });
          console.error("Configuration refresh error:", err);
        });
    } else {
      toast({
        title: "Cannot refresh",
        description: "Please select a niche, template type, and tone first.",
        variant: "destructive",
      });
    }
  };

  const getTemperatureDescription = (value: number): string => {
    if (value < 0.3) return "Very deterministic and factual responses";
    if (value < 0.5) return "Focused and precise outputs with minimal variation";
    if (value < 0.7) return "Balanced outputs with some creative elements";
    if (value < 0.9) return "Creative and varied responses";
    return "Highly unpredictable and creative outputs";
  };

  const getFrequencyPenaltyDescription = (value: number): string => {
    if (value < 0.5) return "Some repetition of phrases is allowed";
    if (value < 1.0) return "Reduced repetition of the same phrases";
    if (value < 1.5) return "Strongly discourages phrase repetition";
    return "Maximum diversity in language patterns";
  };

  const getPresencePenaltyDescription = (value: number): string => {
    if (value < 0.5) return "May focus on similar topics throughout the text";
    if (value < 1.0) return "Encourages some topical diversity";
    if (value < 1.5) return "Promotes exploration of different topics";
    return "Maximizes topic diversity and exploration";
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">AI Configuration</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>AI Model Configuration</DialogTitle>
          <DialogDescription>
            Fine-tune AI parameters for different combinations of niches, templates, and tones.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="parameters" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="parameters">Parameters</TabsTrigger>
            <TabsTrigger value="help">Help & Explanations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="parameters">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="niche"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Niche</FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(value);
                            setTimeout(refreshConfiguration, 100);
                          }} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a niche" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {NICHES.map((niche) => (
                              <SelectItem key={niche} value={niche}>
                                {niche.charAt(0).toUpperCase() + niche.slice(1)}
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
                    name="templateType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Template Type</FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(value);
                            setTimeout(refreshConfiguration, 100);
                          }} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select template type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TEMPLATE_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
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
                    name="tone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tone</FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(value);
                            setTimeout(refreshConfiguration, 100);
                          }} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select tone" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TONE_OPTIONS.map((tone) => (
                              <SelectItem key={tone} value={tone}>
                                {tone.charAt(0).toUpperCase() + tone.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={refreshConfiguration}
                    disabled={isLoading}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Defaults
                  </Button>
                </div>
                
                <Card className="border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">AI Generation Parameters</CardTitle>
                    <CardDescription>
                      Adjust these values to control how the AI generates content
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="modelName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            AI Model
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <InfoIcon className="h-4 w-4 ml-1 inline-block" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[300px]">
                                  <p>The AI model used for content generation. gpt-4o is the newest and most capable model.</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select AI model" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="gpt-4o">GPT-4o (Latest & Most Capable)</SelectItem>
                              <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo (Faster, Less Accurate)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="temperature"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex justify-between">
                            <FormLabel>
                              Temperature
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <InfoIcon className="h-4 w-4 ml-1 inline-block" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-[300px]">
                                    <p>Controls randomness: Lower values are more deterministic, higher values are more creative and varied.</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </FormLabel>
                            <span className="text-sm font-medium">{field.value.toFixed(2)}</span>
                          </div>
                          <FormControl>
                            <Slider
                              min={0}
                              max={1}
                              step={0.01}
                              value={[field.value]}
                              onValueChange={(value) => field.onChange(value[0])}
                              className="py-4"
                            />
                          </FormControl>
                          <FormDescription>
                            {getTemperatureDescription(field.value)}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="frequencyPenalty"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex justify-between">
                            <FormLabel>
                              Frequency Penalty
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <InfoIcon className="h-4 w-4 ml-1 inline-block" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-[300px]">
                                    <p>Reduces repetition of specific phrases and words. Higher values mean less repetition.</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </FormLabel>
                            <span className="text-sm font-medium">{field.value.toFixed(2)}</span>
                          </div>
                          <FormControl>
                            <Slider
                              min={0}
                              max={2}
                              step={0.01}
                              value={[field.value]}
                              onValueChange={(value) => field.onChange(value[0])}
                              className="py-4"
                            />
                          </FormControl>
                          <FormDescription>
                            {getFrequencyPenaltyDescription(field.value)}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="presencePenalty"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex justify-between">
                            <FormLabel>
                              Presence Penalty
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <InfoIcon className="h-4 w-4 ml-1 inline-block" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-[300px]">
                                    <p>Encourages talking about new topics. Higher values make the model more likely to cover diverse subjects.</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </FormLabel>
                            <span className="text-sm font-medium">{field.value.toFixed(2)}</span>
                          </div>
                          <FormControl>
                            <Slider
                              min={0}
                              max={2}
                              step={0.01}
                              value={[field.value]}
                              onValueChange={(value) => field.onChange(value[0])}
                              className="py-4"
                            />
                          </FormControl>
                          <FormDescription>
                            {getPresencePenaltyDescription(field.value)}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
                
                <DialogFooter>
                  <Button 
                    type="submit" 
                    disabled={saveConfigMutation.isPending || isLoading}
                  >
                    {saveConfigMutation.isPending ? "Saving..." : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Configuration
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="help">
            <Card>
              <CardHeader>
                <CardTitle>Understanding AI Parameters</CardTitle>
                <CardDescription>Learn how each parameter affects content generation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="temperature">
                    <AccordionTrigger>
                      <div className="flex items-center">
                        <span>Temperature</span>
                        <Badge variant="outline" className="ml-2">Creativity Control</Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                          Temperature controls randomness and creativity in the AI's responses. Think of it as a dial between predictable and unpredictable outputs.
                        </p>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-xs">
                            <span>0.1 - Very Deterministic</span>
                            <span>1.0 - Highly Creative</span>
                          </div>
                          <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full">
                            <div 
                              className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                              style={{ width: '100%' }}
                            ></div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div className="p-2 border rounded-md">
                              <h4 className="font-medium text-sm">Low Temperature (0.1-0.4)</h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                More focused, precise, factual content. Best for technical documentation, factual reports, and instructional content.
                              </p>
                            </div>
                            <div className="p-2 border rounded-md">
                              <h4 className="font-medium text-sm">High Temperature (0.7-1.0)</h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                More varied, creative, and surprising outputs. Better for storytelling, creative writing, and brainstorming ideas.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="frequencyPenalty">
                    <AccordionTrigger>
                      <div className="flex items-center">
                        <span>Frequency Penalty</span>
                        <Badge variant="outline" className="ml-2">Repetition Control</Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                          Frequency penalty reduces repetition of specific phrases. Higher values discourage the model from repeating the same words and phrases.
                        </p>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div className="p-2 border rounded-md">
                            <h4 className="font-medium text-sm">Low Penalty (0.0-0.5)</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              Allows repeated phrases and language patterns. May create more rhythmic, consistent content but risks redundancy.
                            </p>
                          </div>
                          <div className="p-2 border rounded-md">
                            <h4 className="font-medium text-sm">High Penalty (1.0-2.0)</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              Strongly discourages repetition, creating more linguistically diverse text with varied vocabulary and phrasing.
                            </p>
                          </div>
                        </div>
                        <div className="p-2 bg-muted rounded-md text-xs">
                          <p className="font-medium">Use Cases:</p>
                          <ul className="list-disc pl-4 mt-1 space-y-1">
                            <li>Higher for long-form content to avoid repetitive language</li>
                            <li>Lower for short-form where consistent messaging is important</li>
                            <li>Higher for creative writing and storytelling</li>
                            <li>Lower for technical documentation with specific terminology</li>
                          </ul>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="presencePenalty">
                    <AccordionTrigger>
                      <div className="flex items-center">
                        <span>Presence Penalty</span>
                        <Badge variant="outline" className="ml-2">Topic Diversity</Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                          Presence penalty encourages the model to talk about new topics. Higher values increase the likelihood of exploring different themes and concepts.
                        </p>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div className="p-2 border rounded-md">
                            <h4 className="font-medium text-sm">Low Penalty (0.0-0.5)</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              Stays focused on core topics and themes. Content remains tightly centered around the initial subject.
                            </p>
                          </div>
                          <div className="p-2 border rounded-md">
                            <h4 className="font-medium text-sm">High Penalty (1.0-2.0)</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              Explores a wider range of topics and themes. Content may cover more ground but risk straying from the core subject.
                            </p>
                          </div>
                        </div>
                        <div className="p-2 bg-muted rounded-md text-xs">
                          <p className="font-medium">Recommended Settings by Content Type:</p>
                          <table className="w-full text-xs mt-1">
                            <thead>
                              <tr>
                                <th className="text-left">Content Type</th>
                                <th className="text-left">Recommended Value</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>Product descriptions</td>
                                <td>0.1-0.3</td>
                              </tr>
                              <tr>
                                <td>Blog articles</td>
                                <td>0.3-0.7</td>
                              </tr>
                              <tr>
                                <td>Creative writing</td>
                                <td>0.7-1.2</td>
                              </tr>
                              <tr>
                                <td>Brainstorming</td>
                                <td>1.0-2.0</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="modelChoice">
                    <AccordionTrigger>
                      <div className="flex items-center">
                        <span>Model Choice</span>
                        <Badge variant="outline" className="ml-2">AI Engine</Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                          The model you choose affects overall quality, capabilities, and cost of generation.
                        </p>
                        <div className="space-y-2">
                          <div className="p-2 border rounded-md">
                            <h4 className="font-medium text-sm">GPT-4o (Latest & Most Capable)</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              The newest and most advanced model with multimodal capabilities. Offers highest quality for all content types.
                            </p>
                            <div className="mt-2 grid grid-cols-3 gap-1 text-xs">
                              <div>
                                <span className="font-medium">Quality:</span>
                                <span className="ml-1">★★★★★</span>
                              </div>
                              <div>
                                <span className="font-medium">Cost:</span>
                                <span className="ml-1">★★★★☆</span>
                              </div>
                              <div>
                                <span className="font-medium">Speed:</span>
                                <span className="ml-1">★★★★☆</span>
                              </div>
                            </div>
                          </div>
                          <div className="p-2 border rounded-md">
                            <h4 className="font-medium text-sm">GPT-3.5 Turbo (Faster, Less Accurate)</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              A more economical model that's faster but less capable. Good for drafts or high-volume, less complex content.
                            </p>
                            <div className="mt-2 grid grid-cols-3 gap-1 text-xs">
                              <div>
                                <span className="font-medium">Quality:</span>
                                <span className="ml-1">★★★☆☆</span>
                              </div>
                              <div>
                                <span className="font-medium">Cost:</span>
                                <span className="ml-1">★★☆☆☆</span>
                              </div>
                              <div>
                                <span className="font-medium">Speed:</span>
                                <span className="ml-1">★★★★★</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="presets">
                    <AccordionTrigger>Recommended Presets by Content Type</AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-3 border rounded-md">
                          <h4 className="font-medium">Factual Content</h4>
                          <div className="mt-2 text-xs space-y-1">
                            <p><strong>Temperature:</strong> 0.3-0.5</p>
                            <p><strong>Frequency Penalty:</strong> 0.2-0.4</p>
                            <p><strong>Presence Penalty:</strong> 0.1-0.3</p>
                            <p><strong>Model:</strong> GPT-4o</p>
                            <p className="mt-2 text-muted-foreground">Best for technical documents, detailed reviews, how-to guides</p>
                          </div>
                        </div>
                        
                        <div className="p-3 border rounded-md">
                          <h4 className="font-medium">Creative Content</h4>
                          <div className="mt-2 text-xs space-y-1">
                            <p><strong>Temperature:</strong> 0.7-0.9</p>
                            <p><strong>Frequency Penalty:</strong> 0.4-0.7</p>
                            <p><strong>Presence Penalty:</strong> 0.5-0.8</p>
                            <p><strong>Model:</strong> GPT-4o</p>
                            <p className="mt-2 text-muted-foreground">Best for social media, stories, scripts, promotional content</p>
                          </div>
                        </div>
                        
                        <div className="p-3 border rounded-md">
                          <h4 className="font-medium">Balanced Content</h4>
                          <div className="mt-2 text-xs space-y-1">
                            <p><strong>Temperature:</strong> 0.6-0.7</p>
                            <p><strong>Frequency Penalty:</strong> 0.3-0.5</p>
                            <p><strong>Presence Penalty:</strong> 0.3-0.5</p>
                            <p><strong>Model:</strong> GPT-4o</p>
                            <p className="mt-2 text-muted-foreground">Best for blog posts, product descriptions, email content</p>
                          </div>
                        </div>
                        
                        <div className="p-3 border rounded-md">
                          <h4 className="font-medium">High-volume Draft Content</h4>
                          <div className="mt-2 text-xs space-y-1">
                            <p><strong>Temperature:</strong> 0.7</p>
                            <p><strong>Frequency Penalty:</strong> 0.3</p>
                            <p><strong>Presence Penalty:</strong> 0.3</p>
                            <p><strong>Model:</strong> GPT-3.5 Turbo</p>
                            <p className="mt-2 text-muted-foreground">Best for first drafts, outlines, idea generation, bulk content</p>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <p className="text-xs text-muted-foreground">
                  These parameters can be saved for different combinations of niche, template type, and tone to ensure consistent content generation across your organization.
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AIConfigurationPanel;