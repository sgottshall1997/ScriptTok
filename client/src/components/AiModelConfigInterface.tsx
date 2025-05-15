import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiRequest } from '@/lib/queryClient';
import { NICHES, TEMPLATE_TYPES, TONE_OPTIONS } from '../../../shared/constants';

interface ModelConfig {
  id?: number;
  niche: string;
  templateType: string;
  tone: string;
  temperature: number;
  frequencyPenalty: number;
  presencePenalty: number;
  modelName: string;
  isDefault?: boolean;
}

const MODEL_OPTIONS = [
  'gpt-4', 
  'gpt-3.5-turbo', 
  'claude-3-7-sonnet-20250219'
];

const AiModelConfigInterface: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [niche, setNiche] = useState<string>('');
  const [templateType, setTemplateType] = useState<string>('');
  const [tone, setTone] = useState<string>('');
  const [activeTab, setActiveTab] = useState('configure');

  const [config, setConfig] = useState<ModelConfig>({
    niche: '',
    templateType: '',
    tone: '',
    temperature: 0.7,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0,
    modelName: 'gpt-4'
  });

  // Get configurations for the selected niche
  const { 
    data: nicheConfigs,
    isLoading: isLoadingConfigs
  } = useQuery({
    queryKey: ['/api/ai-model-config/niche', niche],
    queryFn: () => apiRequest(`/api/ai-model-config/niche/${niche}`),
    enabled: !!niche
  });

  // Get specific configuration
  const { 
    data: specificConfig,
    isLoading: isLoadingSpecificConfig
  } = useQuery({
    queryKey: ['/api/ai-model-config', niche, templateType, tone],
    queryFn: () => apiRequest(`/api/ai-model-config/${niche}/${templateType}/${tone}`),
    enabled: !!niche && !!templateType && !!tone,
    onSuccess: (data) => {
      setConfig({
        ...data,
        niche,
        templateType,
        tone
      });
    }
  });

  // Save configuration mutation
  const saveConfigMutation = useMutation({
    mutationFn: (configToSave: ModelConfig) => 
      apiRequest('/api/ai-model-config/save', {
        method: 'POST',
        data: configToSave
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai-model-config/niche', niche] });
      queryClient.invalidateQueries({ queryKey: ['/api/ai-model-config', niche, templateType, tone] });
      toast({
        title: "Configuration Saved",
        description: `The AI model configuration for ${niche} / ${templateType} / ${tone} has been saved.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save the configuration. Please try again.",
        variant: "destructive",
      });
      console.error('Error saving config:', error);
    }
  });

  // Delete configuration mutation
  const deleteConfigMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest(`/api/ai-model-config/${id}`, {
        method: 'DELETE'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai-model-config/niche', niche] });
      toast({
        title: "Configuration Deleted",
        description: "The AI model configuration has been deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete the configuration. Please try again.",
        variant: "destructive",
      });
      console.error('Error deleting config:', error);
    }
  });

  const handleSaveConfig = () => {
    if (!niche || !templateType || !tone) {
      toast({
        title: "Missing Selection",
        description: "Please select a niche, template type, and tone before saving.",
        variant: "destructive",
      });
      return;
    }

    saveConfigMutation.mutate(config);
  };

  const handleDeleteConfig = (id: number) => {
    if (window.confirm('Are you sure you want to delete this configuration?')) {
      deleteConfigMutation.mutate(id);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">AI Model Configuration Interface</h1>
      
      <Tabs defaultValue="configure" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="configure">Configure Models</TabsTrigger>
          <TabsTrigger value="manage">Manage Configurations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="configure">
          <Card>
            <CardHeader>
              <CardTitle>AI Model Configuration</CardTitle>
              <CardDescription>
                Fine-tune AI generation parameters for specific niches, template types, and tones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="space-y-2">
                  <Label htmlFor="niche">Niche</Label>
                  <Select 
                    value={niche}
                    onValueChange={(val) => {
                      setNiche(val);
                      setTemplateType('');
                      setTone('');
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Niche" />
                    </SelectTrigger>
                    <SelectContent>
                      {NICHES.map((n) => (
                        <SelectItem key={n} value={n}>{n}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="templateType">Template Type</Label>
                  <Select 
                    value={templateType}
                    onValueChange={(val) => {
                      setTemplateType(val);
                      setTone('');
                    }}
                    disabled={!niche}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Template Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {TEMPLATE_TYPES.map((tt) => (
                        <SelectItem key={tt} value={tt}>{tt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tone">Tone</Label>
                  <Select 
                    value={tone}
                    onValueChange={setTone}
                    disabled={!templateType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Tone" />
                    </SelectTrigger>
                    <SelectContent>
                      {TONE_OPTIONS.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {niche && templateType && tone && (
                <div className="space-y-6 border rounded-lg p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="temperature">Temperature: {config.temperature}</Label>
                      <span className="text-sm text-muted-foreground">Creativity vs. Precision</span>
                    </div>
                    <Slider 
                      id="temperature"
                      min={0}
                      max={1}
                      step={0.1}
                      value={[config.temperature]}
                      onValueChange={(value) => setConfig({...config, temperature: value[0]})}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Lower values make output more deterministic and focused, higher values make it more random and creative.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="frequencyPenalty">Frequency Penalty: {config.frequencyPenalty}</Label>
                      <span className="text-sm text-muted-foreground">Repetition Control</span>
                    </div>
                    <Slider 
                      id="frequencyPenalty"
                      min={0}
                      max={2}
                      step={0.1}
                      value={[config.frequencyPenalty]}
                      onValueChange={(value) => setConfig({...config, frequencyPenalty: value[0]})}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Higher values reduce repetition of the same phrases in the generated content.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="presencePenalty">Presence Penalty: {config.presencePenalty}</Label>
                      <span className="text-sm text-muted-foreground">Topic Diversity</span>
                    </div>
                    <Slider 
                      id="presencePenalty"
                      min={0}
                      max={2}
                      step={0.1}
                      value={[config.presencePenalty]}
                      onValueChange={(value) => setConfig({...config, presencePenalty: value[0]})}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Higher values encourage the model to talk about new topics rather than repeating information.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="modelName">AI Model</Label>
                    <Select 
                      value={config.modelName}
                      onValueChange={(val) => setConfig({...config, modelName: val})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select AI Model" />
                      </SelectTrigger>
                      <SelectContent>
                        {MODEL_OPTIONS.map((model) => (
                          <SelectItem key={model} value={model}>{model}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Select the AI model that best suits your content needs. More advanced models may produce better content but can be slower.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <div>
                {specificConfig?.isDefault === false && (
                  <span className="text-sm text-blue-500">Using custom configuration</span>
                )}
                {specificConfig?.isDefault === true && (
                  <span className="text-sm text-gray-500">Using default configuration</span>
                )}
              </div>
              <Button 
                onClick={handleSaveConfig} 
                disabled={!niche || !templateType || !tone || saveConfigMutation.isPending}
              >
                {saveConfigMutation.isPending ? "Saving..." : "Save Configuration"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="manage">
          <Card>
            <CardHeader>
              <CardTitle>Manage AI Model Configurations</CardTitle>
              <CardDescription>
                View and manage all your custom AI model configurations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Label htmlFor="manageNiche">Select a Niche to View Configurations</Label>
                <Select 
                  value={niche}
                  onValueChange={setNiche}
                >
                  <SelectTrigger className="mt-2 w-full md:w-1/3">
                    <SelectValue placeholder="Select Niche" />
                  </SelectTrigger>
                  <SelectContent>
                    {NICHES.map((n) => (
                      <SelectItem key={n} value={n}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {niche && (
                <div className="mt-6">
                  {isLoadingConfigs ? (
                    <p>Loading configurations...</p>
                  ) : nicheConfigs?.length > 0 ? (
                    <Table>
                      <TableCaption>Custom AI model configurations for {niche}</TableCaption>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Template Type</TableHead>
                          <TableHead>Tone</TableHead>
                          <TableHead>Model</TableHead>
                          <TableHead>Temperature</TableHead>
                          <TableHead>Frequency Penalty</TableHead>
                          <TableHead>Presence Penalty</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {nicheConfigs.map((config: ModelConfig) => (
                          <TableRow key={`${config.templateType}-${config.tone}`}>
                            <TableCell>{config.templateType}</TableCell>
                            <TableCell>{config.tone}</TableCell>
                            <TableCell>{config.modelName}</TableCell>
                            <TableCell>{config.temperature}</TableCell>
                            <TableCell>{config.frequencyPenalty}</TableCell>
                            <TableCell>{config.presencePenalty}</TableCell>
                            <TableCell>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-red-500 hover:text-red-700"
                                onClick={() => config.id && handleDeleteConfig(config.id)}
                                disabled={deleteConfigMutation.isPending}
                              >
                                Delete
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p>No custom configurations found for {niche}. Go to Configure tab to create one.</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AiModelConfigInterface;