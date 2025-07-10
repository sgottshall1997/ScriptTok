import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Copy, Check, Zap } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SpartanContentResult {
  success: boolean;
  content?: string;
  contentType: 'shortCaptionSpartan' | 'spartanVideoScript';
  productName: string;
  niche: string;
  spartanMode: boolean;
}

interface SpartanAvailability {
  success: boolean;
  spartanAvailable: boolean;
  autoSpartanNiches: string[];
  niche: string;
  reason: string;
}

const NICHES = [
  'beauty', 'tech', 'fashion', 'fitness', 'food', 'travel', 'pets', 
  'finance', 'productivity'
];

export function SpartanContentGenerator() {
  const [formData, setFormData] = useState({
    productName: '',
    niche: '',
    contentType: 'shortCaptionSpartan' as 'shortCaptionSpartan' | 'spartanVideoScript',
    useSpartanFormat: false,
    additionalContext: ''
  });
  
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check Spartan availability for selected niche
  const { data: availability } = useQuery({
    queryKey: ['spartan-availability', formData.niche, formData.useSpartanFormat],
    queryFn: async (): Promise<SpartanAvailability> => {
      if (!formData.niche) return null;
      const response = await fetch(`/api/spartan/availability?niche=${formData.niche}&manualMode=${formData.useSpartanFormat}`);
      if (!response.ok) throw new Error('Failed to check Spartan availability');
      return response.json();
    },
    enabled: !!formData.niche
  });

  // Generate Spartan content mutation
  const generateMutation = useMutation({
    mutationFn: async (data: typeof formData): Promise<SpartanContentResult> => {
      const response = await fetch('/api/spartan/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate Spartan content');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedContent(data.content || '');
      toast({
        title: "Spartan Content Generated",
        description: `${data.contentType === 'shortCaptionSpartan' ? 'Caption' : 'Video Script'} created successfully`,
      });
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productName || !formData.niche) {
      toast({
        title: "Missing Information",
        description: "Please provide both product name and niche",
        variant: "destructive",
      });
      return;
    }
    generateMutation.mutate(formData);
  };

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates({ ...copiedStates, [key]: true });
      toast({
        title: "Copied to Clipboard",
        description: "Content copied successfully",
      });
      setTimeout(() => {
        setCopiedStates({ ...copiedStates, [key]: false });
      }, 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const isFormValid = formData.productName && formData.niche;
  const spartanEnabled = availability?.spartanAvailable || false;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Zap className="w-8 h-8 text-amber-500" />
          <h1 className="text-3xl font-bold">Spartan Content Generator</h1>
        </div>
        <p className="text-muted-foreground">
          Create direct, no-fluff content in strict Spartan format
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>Content Configuration</CardTitle>
            <CardDescription>
              Generate concise, direct content without fluff or filler
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Product Name */}
              <div className="space-y-2">
                <Label htmlFor="productName">Product/Topic Name</Label>
                <Input
                  id="productName"
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  placeholder="e.g., iPhone 15 Pro Max"
                  required
                />
              </div>

              {/* Niche Selection */}
              <div className="space-y-2">
                <Label htmlFor="niche">Niche</Label>
                <Select 
                  value={formData.niche} 
                  onValueChange={(value) => setFormData({ ...formData, niche: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select niche" />
                  </SelectTrigger>
                  <SelectContent>
                    {NICHES.map((niche) => (
                      <SelectItem key={niche} value={niche}>
                        {niche.charAt(0).toUpperCase() + niche.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Content Type */}
              <div className="space-y-2">
                <Label>Content Type</Label>
                <Tabs 
                  value={formData.contentType} 
                  onValueChange={(value) => setFormData({ ...formData, contentType: value as any })}
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="shortCaptionSpartan">Caption (50 words)</TabsTrigger>
                    <TabsTrigger value="spartanVideoScript">Script (120 words)</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Manual Spartan Toggle */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="spartan-manual"
                  checked={formData.useSpartanFormat}
                  onCheckedChange={(checked) => setFormData({ ...formData, useSpartanFormat: checked })}
                />
                <Label htmlFor="spartan-manual">Force Spartan Format</Label>
              </div>

              {/* Additional Context */}
              <div className="space-y-2">
                <Label htmlFor="context">Additional Context (Optional)</Label>
                <Textarea
                  id="context"
                  value={formData.additionalContext}
                  onChange={(e) => setFormData({ ...formData, additionalContext: e.target.value })}
                  placeholder="Any additional context or specific requirements..."
                  rows={3}
                />
              </div>

              {/* Spartan Availability Status */}
              {availability && (
                <Alert className={spartanEnabled ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex items-center gap-2">
                      <Badge variant={spartanEnabled ? "default" : "secondary"}>
                        {spartanEnabled ? "Spartan Available" : "Standard Mode"}
                      </Badge>
                      <span className="text-sm">{availability.reason}</span>
                    </div>
                    {availability.autoSpartanNiches.length > 0 && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        Auto-enabled for: {availability.autoSpartanNiches.join(', ')}
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {/* Generate Button */}
              <Button 
                type="submit" 
                className="w-full" 
                disabled={!isFormValid || generateMutation.isPending}
              >
                {generateMutation.isPending ? (
                  "Generating..."
                ) : (
                  `Generate ${formData.contentType === 'shortCaptionSpartan' ? 'Caption' : 'Script'}`
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Generated Content */}
        <Card>
          <CardHeader>
            <CardTitle>Generated Spartan Content</CardTitle>
            <CardDescription>
              Direct, no-fluff content in Spartan format
            </CardDescription>
          </CardHeader>
          <CardContent>
            {generatedContent ? (
              <div className="space-y-4">
                <div className="relative">
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                      {generatedContent}
                    </pre>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(generatedContent, 'content')}
                  >
                    {copiedStates.content ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div>Word Count: {generatedContent.split(' ').length}</div>
                  <div>Character Count: {generatedContent.length}</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Zap className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Configure your settings and generate Spartan content</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Format Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Spartan Format Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Caption Format (50 words max)</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• 2-3 sentence product summary</li>
                <li>• Friendly call-to-action</li>
                <li>• Link/bio encouragement</li>
                <li>• 5 relevant hashtags</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Script Format (120 words max)</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Single paragraph format</li>
                <li>• Strong opening hook</li>
                <li>• Direct call-to-action ending</li>
                <li>• No fluff or filler words</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t">
            <h4 className="font-semibold mb-2">Style Requirements</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-green-600 mb-1">✓ Use:</p>
                <ul className="text-muted-foreground space-y-1">
                  <li>• Clear, simple language</li>
                  <li>• Short, direct sentences</li>
                  <li>• Active voice only</li>
                  <li>• Factual statements</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-red-600 mb-1">✗ Avoid:</p>
                <ul className="text-muted-foreground space-y-1">
                  <li>• Emojis and asterisks</li>
                  <li>• Metaphors and clichés</li>
                  <li>• Filler words (very, really, just)</li>
                  <li>• Exaggerated language</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}