import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, TrendingUp } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Hook {
  id: number;
  hookText: string;
  score: number;
  product: string;
  niche: string;
}

interface HookGeneratorProps {
  product?: string;
  niche?: string;
  onHookSelect?: (hook: string) => void;
}

export function HookGenerator({ product = '', niche = '', onHookSelect }: HookGeneratorProps) {
  const [productInput, setProductInput] = useState(product);
  const [nicheInput, setNicheInput] = useState(niche);
  const [hooks, setHooks] = useState<Hook[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedHook, setSelectedHook] = useState<string | null>(null);
  const { toast } = useToast();

  const generateHooks = async () => {
    if (!productInput.trim() || !nicheInput.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both product and niche",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await apiRequest('POST', '/api/hooks/generate', {
        product: productInput,
        niche: nicheInput,
        count: 5
      });

      const data = await response.json();
      if (data.success) {
        setHooks(data.hooks);
        toast({
          title: "Hooks generated",
          description: `Generated ${data.hooks.length} viral hooks`
        });
      }
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "Failed to generate hooks. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const selectHook = (hookText: string) => {
    setSelectedHook(hookText);
    if (onHookSelect) {
      onHookSelect(hookText);
    }
    toast({
      title: "Hook selected",
      description: "Hook has been applied to your content"
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          Viral Hook Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Product</label>
            <Input
              placeholder="e.g. iPhone 15 Pro"
              value={productInput}
              onChange={(e) => setProductInput(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Niche</label>
            <Input
              placeholder="e.g. tech"
              value={nicheInput}
              onChange={(e) => setNicheInput(e.target.value)}
            />
          </div>
        </div>

        <Button 
          onClick={generateHooks} 
          disabled={isGenerating}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating Hooks...
            </>
          ) : (
            <>
              <TrendingUp className="h-4 w-4 mr-2" />
              Generate Viral Hooks
            </>
          )}
        </Button>

        {hooks.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium text-sm">Generated Hooks (ranked by viral potential)</h3>
            {hooks.map((hook, index) => (
              <div 
                key={hook.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedHook === hook.hookText 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => selectHook(hook.hookText)}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm flex-1">{hook.hookText}</p>
                  <Badge className={getScoreColor(hook.score)}>
                    {hook.score}/100
                  </Badge>
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                  <span>Rank #{index + 1}</span>
                  {selectedHook === hook.hookText && (
                    <span className="text-purple-600 font-medium">Selected</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}