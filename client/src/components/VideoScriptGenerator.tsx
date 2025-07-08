import { FC, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { NICHES, TONE_OPTIONS } from '@shared/constants';
import { Clock, Video, Film, ListChecks, Clapperboard } from 'lucide-react';

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
import { Textarea } from "@/components/ui/textarea";
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Define video platform types
const VIDEO_PLATFORMS = [
  'tiktok',
  'instagram_reels',
  'youtube_shorts',
  'youtube_long',
] as const;

// Define video script types
const SCRIPT_TYPES = [
  'tutorial',
  'product_review',
  'trending_topic',
  'storytelling',
  'educational',
] as const;

// Schema for form validation
const formSchema = z.object({
  productName: z.string().min(2, "Product name must be at least 2 characters."),
  niche: z.enum(NICHES),
  tone: z.enum(TONE_OPTIONS),
  platform: z.enum(VIDEO_PLATFORMS),
  scriptType: z.enum(SCRIPT_TYPES),
  duration: z.number().min(10).max(600),
  keypoints: z.string().min(5, "Key points must be at least 5 characters."),
  includeCTA: z.boolean().default(true),
  includeTimestamps: z.boolean().default(true),
  includeB_Roll: z.boolean().default(true),
  includeOnScreenText: z.boolean().default(true),
});

// Response type for video script generation
interface VideoScriptResponse {
  intro: string;
  body: string[];
  outro: string;
  b_roll?: string[];
  onscreen_text?: string[];
  script_with_timestamps?: string;
  thumbnail_ideas?: string[];
  duration_estimate: number;
  platform_specific_tips: string[];
}

interface VideoScriptGeneratorProps {
  onSuccess?: (script: VideoScriptResponse) => void;
}

const VideoScriptGenerator: FC<VideoScriptGeneratorProps> = ({ onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [scriptResult, setScriptResult] = useState<VideoScriptResponse | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productName: "",
      niche: "beauty",
      tone: "friendly",
      platform: "tiktok",
      scriptType: "product_review",
      duration: 60,
      keypoints: "",
      includeCTA: true,
      includeTimestamps: true,
      includeB_Roll: true,
      includeOnScreenText: true,
    },
  });

  const generateScriptMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const response = await apiRequest('POST', '/api/video-script', values);
      const data = await response.json();
      return data as VideoScriptResponse;
    },
    onSuccess: (data) => {
      setScriptResult(data);
      toast({
        title: "Script generated",
        description: "Your video script has been generated successfully.",
      });
      if (onSuccess) {
        onSuccess(data);
      }
    },
    onError: (error) => {
      toast({
        title: "Script generation failed",
        description: "There was an error generating your video script. Please try again.",
        variant: "destructive",
      });
      console.error("Script generation error:", error);
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    generateScriptMutation.mutate(values);
  };

  function formatToMMSS(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  function getPlatformIcon(platform: string) {
    switch (platform) {
      case 'tiktok':
        return <Badge variant="secondary" className="mr-2">TikTok</Badge>;
      case 'instagram_reels':
        return <Badge variant="secondary" className="mr-2">Instagram Reels</Badge>;
      case 'youtube_shorts':
        return <Badge variant="secondary" className="mr-2">YouTube Shorts</Badge>;
      case 'youtube_long':
        return <Badge variant="secondary" className="mr-2">YouTube</Badge>;
      default:
        return null;
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Video className="h-4 w-4 mr-2" />
          Video Script Generator
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Video Script Generator</DialogTitle>
          <DialogDescription>
            Create optimized video scripts for different platforms and formats.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="generate" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="generate">Generate Script</TabsTrigger>
            <TabsTrigger value="result" disabled={!scriptResult}>Script Result</TabsTrigger>
            <TabsTrigger value="tips">Platform Tips</TabsTrigger>
          </TabsList>
          
          <TabsContent value="generate">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="productName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., CeraVe Moisturizing Cream" {...field} />
                        </FormControl>
                        <FormDescription>
                          The main product featured in your video
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="niche"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Niche</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
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
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="tone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tone</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a tone" />
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
                  
                  <FormField
                    control={form.control}
                    name="platform"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Platform</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select platform" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="tiktok">
                              TikTok (15-60s)
                            </SelectItem>
                            <SelectItem value="instagram_reels">
                              Instagram Reels (15-90s)
                            </SelectItem>
                            <SelectItem value="youtube_shorts">
                              YouTube Shorts (15-60s)
                            </SelectItem>
                            <SelectItem value="youtube_long">
                              YouTube (2-10min)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Optimizes pacing and structure for each platform
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="scriptType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Script Type</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select script type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="product_review">
                              Product Review
                            </SelectItem>
                            <SelectItem value="tutorial">
                              Tutorial/How-To
                            </SelectItem>
                            <SelectItem value="trending_topic">
                              Trending Topic
                            </SelectItem>
                            <SelectItem value="storytelling">
                              Storytelling
                            </SelectItem>
                            <SelectItem value="educational">
                              Educational
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => {
                      const maxDuration = form.watch("platform") === 'youtube_long' ? 600 : 90;
                      return (
                        <FormItem>
                          <FormLabel>
                            Target Duration (seconds)
                            <span className="ml-2 text-sm text-muted-foreground">
                              {formatToMMSS(field.value)}
                            </span>
                          </FormLabel>
                          <FormControl>
                            <div className="flex items-center space-x-4">
                              <Input 
                                type="range" 
                                min="10" 
                                max={maxDuration}
                                step="5"
                                className="w-full"
                                value={field.value}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                              <Input 
                                type="number" 
                                className="w-20" 
                                value={field.value}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                                min="10"
                                max={maxDuration}
                              />
                            </div>
                          </FormControl>
                          <FormDescription>
                            Adjust based on your chosen platform's optimal length
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                  
                  <div className="grid grid-cols-2 gap-2">
                    <FormField
                      control={form.control}
                      name="includeCTA"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Include CTA</FormLabel>
                            <FormDescription className="text-xs">
                              Add call-to-action
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
                      name="includeTimestamps"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Timestamps</FormLabel>
                            <FormDescription className="text-xs">
                              Include timing marks
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
                      name="includeB_Roll"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>B-Roll Ideas</FormLabel>
                            <FormDescription className="text-xs">
                              Visual scene suggestions
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
                      name="includeOnScreenText"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>On-Screen Text</FormLabel>
                            <FormDescription className="text-xs">
                              Text overlay suggestions
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
                  </div>
                </div>
                
                <FormField
                  control={form.control}
                  name="keypoints"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Key Points</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter the main points you want to cover in your video, separated by new lines:" 
                          className="min-h-[120px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        List the key points, benefits, or ideas you want to highlight in your video
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter className="pt-2">
                  <Button 
                    type="submit" 
                    disabled={generateScriptMutation.isPending}
                    className="w-full md:w-auto"
                  >
                    {generateScriptMutation.isPending ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating Script...
                      </div>
                    ) : (
                      <>
                        <Clapperboard className="h-4 w-4 mr-2" />
                        Generate Video Script
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="result">
            {scriptResult ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <h3 className="text-lg font-semibold">
                      Script for: {form.getValues("productName")}
                    </h3>
                    {getPlatformIcon(form.getValues("platform"))}
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>
                      Est. Duration: {formatToMMSS(scriptResult.duration_estimate)}
                    </span>
                  </div>
                </div>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Complete Script</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium">Intro</h4>
                        <p className="mt-1 text-sm">{scriptResult.intro}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium">Body</h4>
                        <div className="mt-1 space-y-2">
                          {scriptResult.body.map((paragraph, index) => (
                            <p key={index} className="text-sm">{paragraph}</p>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium">Outro</h4>
                        <p className="mt-1 text-sm">{scriptResult.outro}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {scriptResult.script_with_timestamps && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          Script with Timestamps
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <pre className="whitespace-pre-wrap text-sm font-mono bg-muted p-4 rounded-md">
                          {scriptResult.script_with_timestamps}
                        </pre>
                      </CardContent>
                    </Card>
                  )}
                  
                  {scriptResult.b_roll && scriptResult.b_roll.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center">
                          <Film className="h-4 w-4 mr-2" />
                          B-Roll Suggestions
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="list-disc pl-5 space-y-1">
                          {scriptResult.b_roll.map((item, index) => (
                            <li key={index} className="text-sm">{item}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                  
                  {scriptResult.onscreen_text && scriptResult.onscreen_text.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center">
                          <ListChecks className="h-4 w-4 mr-2" />
                          On-Screen Text Ideas
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="list-disc pl-5 space-y-1">
                          {scriptResult.onscreen_text.map((item, index) => (
                            <li key={index} className="text-sm">{item}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                  
                  {scriptResult.thumbnail_ideas && scriptResult.thumbnail_ideas.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center">
                          <Video className="h-4 w-4 mr-2" />
                          Thumbnail Ideas
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="list-disc pl-5 space-y-1">
                          {scriptResult.thumbnail_ideas.map((item, index) => (
                            <li key={index} className="text-sm">{item}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </div>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      Platform-Specific Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-5 space-y-1">
                      {scriptResult.platform_specific_tips.map((tip, index) => (
                        <li key={index} className="text-sm">{tip}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline">Export as Text</Button>
                  <Button variant="outline">Copy to Clipboard</Button>
                </div>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center">
                <div className="text-center">
                  <Film className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="mt-4 text-muted-foreground">
                    Generate a script to see the results here
                  </p>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="tips">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Platform-Specific Tips</CardTitle>
                  <CardDescription>
                    Optimize your video content for each platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="tiktok">
                      <AccordionTrigger className="font-medium">
                        <div className="flex items-center">
                          <span>TikTok</span>
                          <Badge variant="outline" className="ml-2">15-60 seconds</Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3">
                        <p className="text-sm">TikTok rewards high-energy, concise content with an immediate hook.</p>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                          <li>Hook viewers in the first 2-3 seconds</li>
                          <li>Use trending sounds and hashtags</li>
                          <li>Keep text on screen brief and large</li>
                          <li>Incorporate trending transitions or effects</li>
                          <li>Speak quickly but clearly</li>
                          <li>End with a strong call-to-action</li>
                          <li>9:16 vertical format (1080x1920px)</li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="instagram_reels">
                      <AccordionTrigger className="font-medium">
                        <div className="flex items-center">
                          <span>Instagram Reels</span>
                          <Badge variant="outline" className="ml-2">15-90 seconds</Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3">
                        <p className="text-sm">Instagram Reels favor polished, visually appealing content that's both entertaining and informative.</p>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                          <li>Start with a visually striking scene</li>
                          <li>Maintain high production value and good lighting</li>
                          <li>Use Instagram's built-in text features</li>
                          <li>Incorporate product tags when relevant</li>
                          <li>Use trending audio but ensure voice is clearly audible</li>
                          <li>Include meaningful captions in your post</li>
                          <li>9:16 vertical format (1080x1920px)</li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="youtube_shorts">
                      <AccordionTrigger className="font-medium">
                        <div className="flex items-center">
                          <span>YouTube Shorts</span>
                          <Badge variant="outline" className="ml-2">15-60 seconds</Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3">
                        <p className="text-sm">YouTube Shorts can drive traffic to your long-form content and work well for educational quick tips.</p>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                          <li>Include a quick, curiosity-driven hook</li>
                          <li>Speak directly to the viewer</li>
                          <li>Use consistent on-screen text styling</li>
                          <li>Consider teasing longer content on your channel</li>
                          <li>Optimize for no sound (clear text) and with sound</li>
                          <li>Include subscribe reminder at the end</li>
                          <li>9:16 vertical format (1080x1920px)</li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="youtube_long">
                      <AccordionTrigger className="font-medium">
                        <div className="flex items-center">
                          <span>YouTube Long-Form</span>
                          <Badge variant="outline" className="ml-2">2-10 minutes</Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3">
                        <p className="text-sm">YouTube long-form content rewards depth, structure, and comprehensive coverage of topics.</p>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                          <li>Start with a compelling hook and clear value proposition</li>
                          <li>Structure content with clear sections</li>
                          <li>Include timestamps in description for navigation</li>
                          <li>Use b-roll footage to illustrate points</li>
                          <li>Include chapter markers for better navigation</li>
                          <li>Encourage engagement (comments, likes) throughout</li>
                          <li>End with clear call-to-action and subscribe reminder</li>
                          <li>16:9 horizontal format (1920x1080px)</li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Script Type Guidelines</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="border rounded-md p-4">
                      <h3 className="font-medium mb-2">Product Review</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Focus on authentic experiences and specific benefits
                      </p>
                      <ul className="list-disc pl-5 space-y-1 text-xs">
                        <li>Begin with product expectations</li>
                        <li>Show product in use with closeups</li>
                        <li>Discuss pros AND cons for authenticity</li>
                        <li>Compare to alternatives when relevant</li>
                        <li>End with clear recommendation</li>
                      </ul>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <h3 className="font-medium mb-2">Tutorial/How-To</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Clear, step-by-step instruction for viewer success
                      </p>
                      <ul className="list-disc pl-5 space-y-1 text-xs">
                        <li>Start with final result to motivate viewers</li>
                        <li>List required items/prerequisites</li>
                        <li>Break into clear, numbered steps</li>
                        <li>Anticipate common mistakes</li>
                        <li>Show variations or alternatives</li>
                      </ul>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <h3 className="font-medium mb-2">Trending Topic</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Connect your content to current trends and conversations
                      </p>
                      <ul className="list-disc pl-5 space-y-1 text-xs">
                        <li>Reference the trend explicitly</li>
                        <li>Explain why it's trending</li>
                        <li>Add your unique perspective/twist</li>
                        <li>Use trending hashtags and sounds</li>
                        <li>Keep content timely and relevant</li>
                      </ul>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <h3 className="font-medium mb-2">Storytelling</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Create emotional connection through narrative structure
                      </p>
                      <ul className="list-disc pl-5 space-y-1 text-xs">
                        <li>Begin with a compelling hook or problem</li>
                        <li>Establish clear narrative arc</li>
                        <li>Include conflict or challenge</li>
                        <li>Show transformation or resolution</li>
                        <li>End with takeaway or reflection</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default VideoScriptGenerator;