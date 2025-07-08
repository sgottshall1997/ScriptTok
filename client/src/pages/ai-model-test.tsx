import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { NICHES, TONE_OPTIONS, TEMPLATE_TYPES } from '@shared/constants';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

// Define the response type for content generation
interface GenerationResponse {
  product: string;
  templateType: string;
  tone: string;
  niche: string;
  content: string;
  fromCache?: boolean;
  videoDuration?: {
    seconds: number;
    readableTime: string;
    wordCount: number;
    pacing: string;
    isIdealLength: boolean;
    lengthFeedback: string;
  };
}

// Interface for model config details
interface ModelConfigDetails {
  modelName: string;
  temperature: number;
  maxTokens: number;
  frequencyPenalty: number;
  presencePenalty: number;
}

function AIModelTestPage() {
  const [product, setProduct] = useState<string>('Test Product');
  const [niche, setNiche] = useState<string>('beauty');
  const [templateType, setTemplateType] = useState<string>('original');
  const [tone, setTone] = useState<string>('friendly');
  const [generatedContent, setGeneratedContent] = useState<GenerationResponse | null>(null);
  const [modelDetails, setModelDetails] = useState<ModelConfigDetails | null>(null);
  const { toast } = useToast();
  
  // Auto-update model config when parameters change
  useEffect(() => {
    // Clear previous model details when params change
    setModelDetails(null);
  }, [niche, templateType, tone, product]);

  // Format params for visualization
  const formatParamsForDisplay = () => {
    return {
      product,
      niche,
      templateType,
      tone
    };
  };
  
  // Get model configuration for the selected parameters
  const modelConfigMutation = useMutation<ModelConfigDetails, Error, void>({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/ai-model-config', {
        niche,
        templateType,
        tone,
        productName: product
      });
      return response.json();
    },
    onSuccess: (data) => {
      setModelDetails(data);
      toast({
        title: "Model configuration loaded",
        description: `Loaded configuration for ${niche} niche with ${templateType} template type.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to load model configuration",
        description: error.message || "An error occurred while fetching the model configuration.",
        variant: "destructive",
      });
    }
  });

  // Generate content with the selected parameters
  const generateMutation = useMutation<GenerationResponse, Error, void>({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/generate', {
        product,
        templateType,
        tone,
        niche
      });
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedContent(data);
      toast({
        title: "Content generated",
        description: data.fromCache 
          ? "Content was retrieved from cache." 
          : "Fresh content was generated with niche-specific AI settings.",
      });
    },
    onError: (error) => {
      toast({
        title: "Generation failed",
        description: error.message || "An error occurred during content generation.",
        variant: "destructive",
      });
    }
  });

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>AI Model Selector Test</CardTitle>
            <CardDescription>
              This page allows you to test how different parameters affect the AI model configuration for content generation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="product">Product</Label>
                  <Input 
                    id="product" 
                    value={product} 
                    onChange={(e) => setProduct(e.target.value)} 
                    placeholder="Product name" 
                  />
                </div>
                
                <div>
                  <Label htmlFor="niche">Niche</Label>
                  <Select value={niche} onValueChange={setNiche}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a niche" />
                    </SelectTrigger>
                    <SelectContent>
                      {NICHES.map((nicheOption) => (
                        <SelectItem key={nicheOption} value={nicheOption}>
                          {nicheOption.charAt(0).toUpperCase() + nicheOption.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="templateType">Template Type</Label>
                  <Select value={templateType} onValueChange={setTemplateType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template type" />
                    </SelectTrigger>
                    <SelectContent>
                      {TEMPLATE_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="tone">Tone</Label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a tone" />
                    </SelectTrigger>
                    <SelectContent>
                      {TONE_OPTIONS.map((toneOption) => (
                        <SelectItem key={toneOption} value={toneOption}>
                          {toneOption.charAt(0).toUpperCase() + toneOption.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex flex-col space-y-2">
                  <Button 
                    onClick={() => modelConfigMutation.mutate()} 
                    disabled={modelConfigMutation.isPending}
                    className="w-full"
                    variant="outline"
                  >
                    {modelConfigMutation.isPending ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading Config...
                      </div>
                    ) : "Get Model Configuration"}
                  </Button>
                  
                  <Button 
                    onClick={() => generateMutation.mutate()} 
                    disabled={generateMutation.isPending}
                    className="w-full"
                  >
                    {generateMutation.isPending ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating...
                      </div>
                    ) : "Generate Content"}
                  </Button>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Content Parameters</h3>
                <Card className="p-4 bg-muted/50">
                  <pre className="text-sm overflow-auto whitespace-pre-wrap">
                    {JSON.stringify(formatParamsForDisplay(), null, 2)}
                  </pre>
                </Card>
                
                {modelDetails && (
                  <div className="mt-4">
                    <h3 className="text-lg font-medium mb-2">AI Model Configuration</h3>
                    <Card className="p-4 bg-muted/50">
                      <div className="space-y-2">
                        <div>
                          <span className="font-semibold">Model Name:</span> {modelDetails.modelName}
                        </div>
                        <div>
                          <span className="font-semibold">Temperature:</span> {modelDetails.temperature}
                        </div>
                        <div>
                          <span className="font-semibold">Max Tokens:</span> {modelDetails.maxTokens}
                        </div>
                        <div>
                          <span className="font-semibold">Frequency Penalty:</span> {modelDetails.frequencyPenalty}
                        </div>
                        <div>
                          <span className="font-semibold">Presence Penalty:</span> {modelDetails.presencePenalty}
                        </div>
                      </div>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {generatedContent && (
          <Card>
            <CardHeader>
              <CardTitle>Generated Content</CardTitle>
              <CardDescription>
                {generatedContent.fromCache ? 
                  "This content was retrieved from cache." : 
                  "This content was freshly generated with niche-specific AI settings."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="content">
                <TabsList>
                  <TabsTrigger value="content">Content</TabsTrigger>
                  {generatedContent.videoDuration && (
                    <TabsTrigger value="metrics">Duration Metrics</TabsTrigger>
                  )}
                </TabsList>
                <TabsContent value="content" className="p-4">
                  <div className="whitespace-pre-wrap">
                    {generatedContent.content}
                  </div>
                </TabsContent>
                
                {generatedContent.videoDuration && (
                  <TabsContent value="metrics" className="p-4">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="p-4">
                          <div className="text-sm text-muted-foreground">Duration</div>
                          <div className="text-2xl font-bold">{generatedContent.videoDuration.readableTime}</div>
                        </Card>
                        <Card className="p-4">
                          <div className="text-sm text-muted-foreground">Word Count</div>
                          <div className="text-2xl font-bold">{generatedContent.videoDuration.wordCount}</div>
                        </Card>
                        <Card className="p-4">
                          <div className="text-sm text-muted-foreground">Pacing</div>
                          <div className="text-2xl font-bold capitalize">{generatedContent.videoDuration.pacing}</div>
                        </Card>
                      </div>
                      
                      <Card className="p-4">
                        <div className="text-sm text-muted-foreground mb-2">Length Analysis</div>
                        <div>{generatedContent.videoDuration.lengthFeedback}</div>
                      </Card>
                    </div>
                  </TabsContent>
                )}
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default AIModelTestPage;