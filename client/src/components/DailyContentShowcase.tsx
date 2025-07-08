import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Star, Copy, Check, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ContentVariant {
  id: number;
  content: string;
  gptPick: boolean;
  feedbackId: number;
}

interface ShowcaseItem {
  product: string;
  niche: string;
  templateType: string;
  tone: string;
  variants: ContentVariant[];
  gptChoice: number;
  gptConfidence: number;
  gptReasoning: string;
}

interface UserInteraction {
  feedbackId: number;
  action: 'post' | 'helpful' | 'copy';
}

export default function DailyContentShowcase() {
  const [interactions, setInteractions] = useState<Set<number>>(new Set());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch today's automated content showcase
  const { data: showcaseData, isLoading } = useQuery({
    queryKey: ['/api/daily-showcase'],
    refetchInterval: 1000 * 60 * 60, // Refresh every hour
  });

  // Mutation for logging user interactions
  const feedbackMutation = useMutation({
    mutationFn: async ({ feedbackId, updates }: { 
      feedbackId: number; 
      updates: { userPick?: boolean; starRating?: number; clickCount?: number } 
    }) => {
      const response = await fetch(`/api/feedback/${feedbackId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to log feedback');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gpt-analytics'] });
    },
  });

  const handleInteraction = async (
    feedbackId: number, 
    action: 'post' | 'helpful' | 'copy',
    content: string
  ) => {
    if (interactions.has(feedbackId)) return;

    try {
      let updates = {};
      let toastMessage = '';

      switch (action) {
        case 'post':
          updates = { userPick: true };
          toastMessage = 'Marked for posting! 📱';
          break;
        case 'helpful':
          updates = { starRating: 5 };
          toastMessage = 'Thanks for the feedback! ⭐';
          break;
        case 'copy':
          await navigator.clipboard.writeText(content);
          updates = { clickCount: 1 };
          toastMessage = 'Content copied to clipboard! 📋';
          break;
      }

      await feedbackMutation.mutateAsync({ feedbackId, updates });
      setInteractions(prev => new Set(prev).add(feedbackId));
      
      toast({
        title: "Success",
        description: toastMessage,
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log interaction. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getBadgeColor = (niche: string) => {
    const colors: Record<string, string> = {
      beauty: 'bg-pink-100 text-pink-800',
      tech: 'bg-blue-100 text-blue-800',
      fashion: 'bg-purple-100 text-purple-800',
      fitness: 'bg-green-100 text-green-800',
      food: 'bg-orange-100 text-orange-800',
      travel: 'bg-teal-100 text-teal-800',
      pet: 'bg-yellow-100 text-yellow-800',
    };
    return colors[niche] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Daily Content Showcase
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <span className="ml-3 text-gray-600">Generating today's showcase content...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!showcaseData?.success || !showcaseData?.data?.length) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Daily Content Showcase
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No showcase content available today.</p>
            <p className="text-sm text-gray-500 mt-2">Check back later for AI-generated content samples!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          Daily Content Showcase
          <Badge variant="secondary" className="ml-auto">
            AI-Powered
          </Badge>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Auto-generated content from trending products. Rate and interact to help improve our AI!
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {showcaseData.data.map((item: ShowcaseItem, index: number) => (
          <div key={index} className="border rounded-lg p-4 bg-gray-50/50">
            {/* Product Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg mb-1">{item.product}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Badge className={getBadgeColor(item.niche)}>
                    {item.niche}
                  </Badge>
                  <span>•</span>
                  <span className="capitalize">{item.templateType.replace('_', ' ')}</span>
                  <span>•</span>
                  <span className="capitalize">{item.tone} tone</span>
                </div>
              </div>
              {item.gptConfidence > 0 && (
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm">
                    <Zap className="h-4 w-4 text-purple-600" />
                    <span className="font-medium">AI Pick #{item.gptChoice}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {item.gptConfidence}% confidence
                  </div>
                </div>
              )}
            </div>

            {/* GPT Reasoning */}
            {item.gptReasoning && (
              <div className="mb-4 p-3 bg-purple-50 rounded-md">
                <p className="text-sm text-purple-800">
                  <strong>AI Analysis:</strong> {item.gptReasoning}
                </p>
              </div>
            )}

            {/* Content Variants */}
            <div className="space-y-4">
              {item.variants.map((variant) => (
                <div 
                  key={variant.id}
                  className={`border rounded-lg p-4 transition-all ${
                    variant.gptPick 
                      ? 'border-purple-200 bg-purple-50/50' 
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  {variant.gptPick && (
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-800">
                        GPT's Viral Pick
                      </span>
                    </div>
                  )}
                  
                  <div className="mb-4 text-gray-800 leading-relaxed">
                    {variant.content}
                  </div>

                  <Separator className="my-3" />

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3">
                    <Button
                      size="sm"
                      variant={interactions.has(variant.feedbackId) ? "secondary" : "default"}
                      onClick={() => handleInteraction(variant.feedbackId, 'post', variant.content)}
                      disabled={interactions.has(variant.feedbackId) || feedbackMutation.isPending}
                      className="flex items-center gap-2"
                    >
                      {interactions.has(variant.feedbackId) ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <TrendingUp className="h-4 w-4" />
                      )}
                      {interactions.has(variant.feedbackId) ? 'Marked for Post' : 'Post This'}
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleInteraction(variant.feedbackId, 'helpful', variant.content)}
                      disabled={interactions.has(variant.feedbackId) || feedbackMutation.isPending}
                      className="flex items-center gap-2"
                    >
                      <Star className="h-4 w-4" />
                      Helpful
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleInteraction(variant.feedbackId, 'copy', variant.content)}
                      disabled={feedbackMutation.isPending}
                      className="flex items-center gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      Copy
                    </Button>

                    <div className="ml-auto text-sm text-gray-500">
                      Variant #{variant.id}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}