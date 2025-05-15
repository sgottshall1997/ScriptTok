import { FC, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Clipboard, RefreshCcw, ExternalLink, Copy, Check } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { trackEvent } from "@/lib/analytics";
import { Niche } from "@shared/constants";
import { Skeleton } from "@/components/ui/skeleton";

interface HashtagEmojiRecommendationsProps {
  content: string;
  niche: Niche;
  product: string;
}

interface HashtagEmojiRecommendations {
  hashtags: string[];
  emojis: string[];
  cta: string;
}

interface RecommendationsResponse {
  niche: string;
  product: string;
  recommendations: HashtagEmojiRecommendations;
}

/**
 * Component to display and manage hashtag and emoji recommendations based on content
 */
const HashtagEmojiRecommender: FC<HashtagEmojiRecommendationsProps> = ({ content, niche, product }) => {
  const [activeTab, setActiveTab] = useState<string>("hashtags");
  const [copiedHashtags, setCopiedHashtags] = useState<boolean>(false);
  const [copiedEmojis, setCopiedEmojis] = useState<boolean>(false);
  const [copiedCTA, setCopiedCTA] = useState<boolean>(false);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);

  // Reset copied states after 2 seconds
  useEffect(() => {
    if (copiedHashtags) {
      const timer = setTimeout(() => setCopiedHashtags(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copiedHashtags]);

  useEffect(() => {
    if (copiedEmojis) {
      const timer = setTimeout(() => setCopiedEmojis(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copiedEmojis]);

  useEffect(() => {
    if (copiedCTA) {
      const timer = setTimeout(() => setCopiedCTA(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copiedCTA]);

  useEffect(() => {
    if (copiedAll) {
      const timer = setTimeout(() => setCopiedAll(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copiedAll]);

  // Fetch recommendations from API
  const { data, isLoading, isError, refetch } = useQuery<RecommendationsResponse>({
    queryKey: ['/api/hashtag-emoji', niche, product],
    queryFn: async () => {
      const response = await apiRequest(
        'POST',
        '/api/hashtag-emoji',
        { content, niche, product }
      );
      return await response.json() as RecommendationsResponse;
    },
    enabled: !!content && !!niche && !!product
  });

  // Copy functions for different content types
  const copyHashtags = () => {
    if (!data?.recommendations?.hashtags) return;
    
    const hashtags = data.recommendations.hashtags.join(' ');
    navigator.clipboard.writeText(hashtags);
    setCopiedHashtags(true);
    trackEvent('copy_hashtags', 'engagement', niche);
  };

  const copyEmojis = () => {
    if (!data?.recommendations?.emojis) return;
    
    const emojis = data.recommendations.emojis.join(' ');
    navigator.clipboard.writeText(emojis);
    setCopiedEmojis(true);
    trackEvent('copy_emojis', 'engagement', niche);
  };

  const copyCTA = () => {
    if (!data?.recommendations?.cta) return;
    
    navigator.clipboard.writeText(data.recommendations.cta);
    setCopiedCTA(true);
    trackEvent('copy_cta', 'engagement', niche);
  };

  const copyAll = () => {
    if (!data?.recommendations) return;
    
    const hashtags = data.recommendations.hashtags.join(' ');
    const emojis = data.recommendations.emojis.join(' ');
    const allContent = `${emojis}\n\n${data.recommendations.cta}\n\n${hashtags}`;
    
    navigator.clipboard.writeText(allContent);
    setCopiedAll(true);
    trackEvent('copy_all_recommendations', 'engagement', niche);
  };

  // Manual refresh function
  const handleRefresh = () => {
    refetch();
    trackEvent('refresh_recommendations', 'engagement', niche);
  };

  // Render loading state
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clipboard className="h-5 w-5 text-primary" />
            <span>Smart Recommendations</span>
          </CardTitle>
          <CardDescription>
            Loading trending hashtags, emojis, and call-to-actions...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render error state
  if (isError) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Clipboard className="h-5 w-5" />
            <span>Recommendations Unavailable</span>
          </CardTitle>
          <CardDescription>
            We couldn't generate recommendations at this time. Please try again later.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={handleRefresh} variant="outline" className="w-full">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clipboard className="h-5 w-5 text-primary" />
            <span>Smart Recommendations</span>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0" 
                  onClick={handleRefresh}
                >
                  <RefreshCcw className="h-4 w-4" />
                  <span className="sr-only">Refresh</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh recommendations</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        <CardDescription>
          Trending hashtags, emojis, and call-to-actions for your content
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="hashtags">Hashtags</TabsTrigger>
            <TabsTrigger value="emojis">Emojis</TabsTrigger>
            <TabsTrigger value="cta">Call-to-Action</TabsTrigger>
          </TabsList>
          
          <TabsContent value="hashtags" className="space-y-4 mt-4">
            <div className="flex flex-wrap gap-2">
              {data?.recommendations?.hashtags.map((hashtag: string, index: number) => (
                <Badge 
                  key={index} 
                  variant="secondary"
                  className="text-sm py-1 px-3 cursor-pointer hover:bg-secondary/80"
                  onClick={() => {
                    navigator.clipboard.writeText(hashtag);
                    trackEvent('copy_single_hashtag', 'engagement', niche);
                  }}
                >
                  {hashtag}
                </Badge>
              ))}
            </div>
            <Button onClick={copyHashtags} className="w-full mt-2" variant="outline">
              {copiedHashtags ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy All Hashtags
                </>
              )}
            </Button>
          </TabsContent>
          
          <TabsContent value="emojis" className="space-y-4 mt-4">
            <div className="flex flex-wrap gap-3">
              {data?.recommendations?.emojis.map((emoji: string, index: number) => (
                <div 
                  key={index} 
                  className="text-2xl cursor-pointer hover:scale-110 transition-transform"
                  onClick={() => {
                    navigator.clipboard.writeText(emoji);
                    trackEvent('copy_single_emoji', 'engagement', niche);
                  }}
                >
                  {emoji}
                </div>
              ))}
            </div>
            <Button onClick={copyEmojis} className="w-full mt-2" variant="outline">
              {copiedEmojis ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy All Emojis
                </>
              )}
            </Button>
          </TabsContent>
          
          <TabsContent value="cta" className="space-y-4 mt-4">
            <div className="bg-secondary/30 p-4 rounded-md text-center font-medium">
              {data?.recommendations?.cta}
            </div>
            <Button onClick={copyCTA} className="w-full mt-2" variant="outline">
              {copiedCTA ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Call-to-Action
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>
        
        <Separator className="my-4" />
        
        <Button onClick={copyAll} className="w-full" variant="default">
          {copiedAll ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              All Content Copied!
            </>
          ) : (
            <>
              <Clipboard className="mr-2 h-4 w-4" />
              Copy All Recommendations
            </>
          )}
        </Button>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        <div className="flex items-center justify-between w-full">
          <span>Based on current {niche} trends</span>
          <span className="flex items-center">
            <a 
              href={`https://www.instagram.com/explore/tags/${niche}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline flex items-center ml-2"
              onClick={() => trackEvent('view_trending_hashtags', 'external_link', niche)}
            >
              View Trending <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default HashtagEmojiRecommender;