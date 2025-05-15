import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Copy, RefreshCw } from "lucide-react";
import { queryClient } from '@/lib/queryClient';
import { useQuery, useMutation } from '@tanstack/react-query';

interface SmartEmojiHashtagSuggestionsProps {
  content: string;
  niche: string;
  templateType: string;
}

interface SuggestionResponse {
  hashtags: string[];
  emojis: string[];
  explanation: string;
}

interface TrendingResponse {
  niche: string;
  hashtags: string[];
  emojis: string[];
  lastUpdated: string;
  isDefault?: boolean;
}

const SmartEmojiHashtagSuggestions = ({ content, niche, templateType }: SmartEmojiHashtagSuggestionsProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'trending' | 'smart'>('trending');
  const [copiedEmojis, setCopiedEmojis] = useState(false);
  const [copiedHashtags, setCopiedHashtags] = useState(false);

  // Get trending emojis and hashtags for the selected niche
  const { 
    data: trendingData, 
    isLoading: isTrendingLoading, 
    error: trendingError,
    refetch: refetchTrending
  } = useQuery<TrendingResponse>({
    queryKey: ['/api/trending-emojis-hashtags', niche],
    enabled: !!niche
  });

  // Get smart suggestions based on content
  const { 
    data: smartData, 
    isLoading: isSmartLoading, 
    error: smartError,
    refetch: refetchSmart
  } = useQuery<SuggestionResponse>({
    queryKey: ['/api/trending-emojis-hashtags/smart-suggest', niche, templateType],
    enabled: false // Only load when user clicks the tab
  });

  // Force refresh trending data
  const refreshTrendingMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/trending-emojis-hashtags/refresh/${niche}`, {
        method: 'POST'
      });
      if (!response.ok) {
        throw new Error('Failed to refresh trending data');
      }
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Trending data refreshed',
        description: 'The latest trending emojis and hashtags have been loaded.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/trending-emojis-hashtags', niche] });
    },
    onError: (error) => {
      toast({
        title: 'Failed to refresh trending data',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Get smart suggestions when tab is switched
  useEffect(() => {
    if (activeTab === 'smart' && !smartData && content && niche && templateType) {
      const fetchSmartSuggestions = async () => {
        try {
          const response = await fetch('/api/trending-emojis-hashtags/smart-suggest', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              niche,
              templateType,
              content
            }),
          });
          
          if (!response.ok) {
            throw new Error('Failed to get smart suggestions');
          }
          
          const data = await response.json();
          queryClient.setQueryData(['/api/trending-emojis-hashtags/smart-suggest', niche, templateType], data);
        } catch (error) {
          console.error('Error fetching smart suggestions:', error);
        }
      };
      
      fetchSmartSuggestions();
    }
  }, [activeTab, smartData, content, niche, templateType]);

  // Handle copy to clipboard
  const copyToClipboard = (text: string, type: 'emojis' | 'hashtags') => {
    navigator.clipboard.writeText(text).then(() => {
      if (type === 'emojis') {
        setCopiedEmojis(true);
        setTimeout(() => setCopiedEmojis(false), 2000);
      } else {
        setCopiedHashtags(true);
        setTimeout(() => setCopiedHashtags(false), 2000);
      }
      
      toast({
        title: 'Copied to clipboard',
        description: `${type === 'emojis' ? 'Emojis' : 'Hashtags'} have been copied to your clipboard.`,
      });
    }).catch(err => {
      console.error('Failed to copy:', err);
      toast({
        title: 'Failed to copy',
        description: 'Could not copy to clipboard. Please try again.',
        variant: 'destructive',
      });
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Smart Emoji & Hashtag Suggestions</span>
          {activeTab === 'trending' && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refreshTrendingMutation.mutate()}
              disabled={refreshTrendingMutation.isPending || !niche}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshTrendingMutation.isPending ? 'animate-spin' : ''}`} />
              Refresh Trends
            </Button>
          )}
        </CardTitle>
        <CardDescription>
          {activeTab === 'trending' 
            ? 'Currently trending emojis and hashtags for your niche' 
            : 'Smart suggestions based on your content'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs 
          defaultValue="trending" 
          value={activeTab} 
          onValueChange={(value) => setActiveTab(value as 'trending' | 'smart')}
          className="w-full"
        >
          <TabsList className="w-full mb-4">
            <TabsTrigger value="trending" className="w-1/2">Trending</TabsTrigger>
            <TabsTrigger 
              value="smart" 
              className="w-1/2" 
              disabled={!content || !niche || !templateType}
            >
              Smart Suggestions
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="trending">
            {isTrendingLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : trendingError ? (
              <div className="flex items-center justify-center py-8 text-red-500">
                <AlertCircle className="mr-2 h-5 w-5" />
                <span>Error loading trending data</span>
              </div>
            ) : (
              <div className="space-y-6">
                {trendingData?.isDefault && (
                  <div className="text-amber-500 text-sm italic mb-4">
                    Using default suggestions. Click refresh to get the latest trends.
                  </div>
                )}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold">Trending Emojis</h3>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => copyToClipboard(trendingData?.emojis.join('') || '', 'emojis')}
                      disabled={!trendingData?.emojis.length}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      {copiedEmojis ? 'Copied!' : 'Copy All'}
                    </Button>
                  </div>
                  <div className="bg-muted p-3 rounded-md flex flex-wrap gap-2">
                    {trendingData?.emojis.map((emoji, index) => (
                      <span key={`emoji-${index}`} className="text-2xl cursor-pointer hover:scale-125 transition-transform" onClick={() => copyToClipboard(emoji, 'emojis')}>
                        {emoji}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold">Trending Hashtags</h3>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => copyToClipboard(trendingData?.hashtags.join(' ') || '', 'hashtags')}
                      disabled={!trendingData?.hashtags.length}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      {copiedHashtags ? 'Copied!' : 'Copy All'}
                    </Button>
                  </div>
                  <div className="bg-muted p-3 rounded-md flex flex-wrap gap-2">
                    {trendingData?.hashtags.map((hashtag, index) => (
                      <Badge key={`hashtag-${index}`} variant="secondary" className="cursor-pointer hover:bg-secondary/80" onClick={() => copyToClipboard(hashtag, 'hashtags')}>
                        {hashtag}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {trendingData?.lastUpdated && (
                  <div className="text-xs text-muted-foreground text-right">
                    Last updated: {new Date(trendingData.lastUpdated).toLocaleString()}
                  </div>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="smart">
            {isSmartLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
            ) : smartError ? (
              <div className="flex items-center justify-center py-8 text-red-500">
                <AlertCircle className="mr-2 h-5 w-5" />
                <span>Error loading smart suggestions</span>
              </div>
            ) : !smartData ? (
              <div className="py-10 text-center">
                <p className="text-muted-foreground">Generating smart suggestions based on your content...</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold">Suggested Emojis</h3>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => copyToClipboard(smartData?.emojis.join('') || '', 'emojis')}
                      disabled={!smartData?.emojis.length}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      {copiedEmojis ? 'Copied!' : 'Copy All'}
                    </Button>
                  </div>
                  <div className="bg-muted p-3 rounded-md flex flex-wrap gap-2">
                    {smartData?.emojis.map((emoji, index) => (
                      <span key={`smart-emoji-${index}`} className="text-2xl cursor-pointer hover:scale-125 transition-transform" onClick={() => copyToClipboard(emoji, 'emojis')}>
                        {emoji}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold">Suggested Hashtags</h3>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => copyToClipboard(smartData?.hashtags.join(' ') || '', 'hashtags')}
                      disabled={!smartData?.hashtags.length}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      {copiedHashtags ? 'Copied!' : 'Copy All'}
                    </Button>
                  </div>
                  <div className="bg-muted p-3 rounded-md flex flex-wrap gap-2">
                    {smartData?.hashtags.map((hashtag, index) => (
                      <Badge key={`smart-hashtag-${index}`} variant="secondary" className="cursor-pointer hover:bg-secondary/80" onClick={() => copyToClipboard(hashtag, 'hashtags')}>
                        {hashtag}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {smartData?.explanation && (
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2">Why These Suggestions?</h3>
                    <div className="bg-muted p-3 rounded-md text-sm">
                      {smartData.explanation}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SmartEmojiHashtagSuggestions;