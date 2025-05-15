import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { 
  SiInstagram, 
  SiTiktok, 
  SiFacebook, 
  SiX, // Twitter is now X
  SiLinkedin 
} from 'react-icons/si';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Trophy,
  ThumbsUp,
  MessageCircle,
  Share2,
  Heart,
  BarChart,
  ArrowUp,
  ArrowUpRight,
  MessageSquare,
  Repeat2,
  Bookmark,
  ChevronDown,
  Info,
  Copy
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';
import { Niche } from '@shared/constants';

interface SocialMediaPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: string;
  niche: Niche;
  hashtagsAndEmojis?: {
    hashtags: string[];
    emojis: string[];
    callToActions: string[];
  };
}

interface OptimizationSuggestion {
  platform: string;
  score: number;
  suggestions: string[];
}

interface OptimizationResponse {
  suggestions: OptimizationSuggestion[];
  optimizedContent: {
    instagram: string;
    tiktok: string;
    facebook: string;
    twitter: string;
    linkedin: string;
  };
}

export function SocialMediaPreview({
  open,
  onOpenChange,
  content,
  niche,
  hashtagsAndEmojis
}: SocialMediaPreviewProps) {
  const [platform, setPlatform] = useState('instagram');
  const [optimizedContent, setOptimizedContent] = useState<{[key: string]: string}>({
    instagram: '',
    tiktok: '',
    facebook: '',
    twitter: '',
    linkedin: ''
  });
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  
  // Query to get optimization suggestions
  const { data, isLoading } = useQuery<OptimizationResponse>({
    queryKey: ['/api/social-media-optimization', niche, content],
    queryFn: async () => {
      const response = await apiRequest(
        'POST',
        '/api/social-media-optimization',
        { content, niche, hashtags: hashtagsAndEmojis?.hashtags || [] }
      );
      return await response.json() as OptimizationResponse;
    },
    enabled: open && !!content && !!niche,
  });

  useEffect(() => {
    if (data?.optimizedContent) {
      setOptimizedContent(data.optimizedContent);
    } else if (content) {
      // If no optimization data yet, use original content for all platforms
      setOptimizedContent({
        instagram: content,
        tiktok: content,
        facebook: content,
        twitter: content,
        linkedin: content
      });
    }
  }, [data, content]);

  useEffect(() => {
    setEditContent(optimizedContent[platform] || '');
  }, [platform, optimizedContent]);

  const handleSaveEdit = () => {
    setOptimizedContent({
      ...optimizedContent,
      [platform]: editContent
    });
    setEditing(false);
    toast({
      title: "Content updated",
      description: `Your ${platform} content has been updated.`,
      duration: 3000
    });
  };

  const handleCopyContent = () => {
    navigator.clipboard.writeText(optimizedContent[platform] || content);
    toast({
      title: "Copied to clipboard",
      description: `Content for ${platform} has been copied.`,
      duration: 3000
    });
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'instagram': return 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)';
      case 'tiktok': return '#000000';
      case 'facebook': return '#1877F2';
      case 'twitter': return '#1DA1F2';
      case 'linkedin': return '#0A66C2';
      default: return '#6E56CF'; // Default theme color
    }
  };

  const getPlatformIcon = (platform: string, size = 20) => {
    switch (platform) {
      case 'instagram': return <SiInstagram size={size} />;
      case 'tiktok': return <SiTiktok size={size} />;
      case 'facebook': return <SiFacebook size={size} />;
      case 'twitter': return <SiX size={size} />;
      case 'linkedin': return <SiLinkedin size={size} />;
      default: return null;
    }
  };

  // Renders the platform specific UI template
  const renderPlatformTemplate = () => {
    const displayContent = optimizedContent[platform] || content;
    const hashtags = hashtagsAndEmojis?.hashtags || [];
    const emojis = hashtagsAndEmojis?.emojis || [];
    
    switch (platform) {
      case 'instagram':
        return (
          <div className="max-w-[400px] mx-auto border rounded-md bg-white">
            {/* Instagram header */}
            <div className="flex items-center p-3 border-b">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>YB</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-semibold">yourbrand</p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
            {/* Post image placeholder */}
            <div className="aspect-square bg-gray-100 flex items-center justify-center border-b">
              <div className="text-gray-400 text-sm">Post Image</div>
            </div>
            {/* Actions */}
            <div className="p-3 flex justify-between">
              <div className="flex gap-4">
                <Heart className="h-6 w-6" />
                <MessageCircle className="h-6 w-6" />
                <Share2 className="h-6 w-6" />
              </div>
              <Bookmark className="h-6 w-6" />
            </div>
            {/* Likes */}
            <div className="px-3 py-1">
              <p className="text-sm font-semibold">1,234 likes</p>
            </div>
            {/* Caption */}
            <div className="p-3 pt-0">
              <p className="text-sm">
                <span className="font-semibold mr-1">yourbrand</span>
                <span dangerouslySetInnerHTML={{ __html: displayContent }} />
                {' '}
                {emojis.slice(0, 3).join(' ')}
                {' '}
                {hashtags.map((tag, i) => 
                  <span key={i} className="text-blue-500">#{tag} </span>
                )}
              </p>
              <p className="text-xs text-gray-500 mt-1">View all 42 comments</p>
              <p className="text-xs text-gray-400 mt-2">2 HOURS AGO</p>
            </div>
          </div>
        );
        
      case 'tiktok':
        return (
          <div className="max-w-[300px] mx-auto border rounded-md bg-black text-white">
            {/* TikTok vertical video container */}
            <div className="aspect-[9/16] bg-gray-800 flex items-center justify-center relative">
              <div className="text-gray-400 text-sm">Video Content</div>
              {/* Side icons */}
              <div className="absolute right-3 bottom-20 flex flex-col items-center gap-4">
                <div className="flex flex-col items-center">
                  <Avatar className="h-10 w-10 mb-1">
                    <AvatarFallback>YB</AvatarFallback>
                  </Avatar>
                  <div className="bg-[#F00044] rounded-full h-5 w-5 flex items-center justify-center text-xs mb-3">+</div>
                </div>
                <div className="flex flex-col items-center">
                  <Heart className="h-8 w-8 mb-1" fill="white" />
                  <span className="text-xs">123.4K</span>
                </div>
                <div className="flex flex-col items-center">
                  <MessageSquare className="h-8 w-8 mb-1" />
                  <span className="text-xs">1,234</span>
                </div>
                <div className="flex flex-col items-center">
                  <Bookmark className="h-8 w-8 mb-1" />
                  <span className="text-xs">5,678</span>
                </div>
                <div className="flex flex-col items-center">
                  <Share2 className="h-8 w-8 mb-1" />
                  <span className="text-xs">789</span>
                </div>
              </div>
              {/* Caption at bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black to-transparent">
                <p className="text-sm font-bold mb-1">@yourbrand</p>
                <p className="text-xs">
                  {displayContent.substring(0, 100)}
                  {displayContent.length > 100 ? '...' : ''}
                  {' '}
                  {emojis.slice(0, 2).join(' ')}
                </p>
                <p className="text-xs mt-2">
                  {hashtags.slice(0, 4).map((tag, i) => 
                    <span key={i}>#{tag} </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        );
        
      case 'facebook':
        return (
          <div className="max-w-[500px] mx-auto border rounded-md bg-white">
            {/* Facebook header */}
            <div className="flex items-center p-3">
              <Avatar className="h-10 w-10 mr-2">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>YB</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold">Your Brand</p>
                <div className="flex items-center text-xs text-gray-500">
                  <span>2h</span>
                  <span className="mx-1">·</span>
                  <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor"><path d="M8.5 0C4.36 0 1 3.36 1 7.5c0 4.14 3.36 7.5 7.5 7.5 4.14 0 7.5-3.36 7.5-7.5C16 3.36 12.64 0 8.5 0zm0 14c-3.59 0-6.5-2.91-6.5-6.5S4.91 1 8.5 1 15 3.91 15 7.5 12.09 14 8.5 14z"></path><path d="M8.5 3C7.67 3 7 3.67 7 4.5v3c0 .53.28 1.01.73 1.27l3 1.5c.15.07.31.11.47.11.61 0 1.1-.49 1.1-1.1 0-.39-.2-.74-.5-.94L9.5 7V4.5c0-.83-.67-1.5-1.5-1.5z"></path></svg>
                </div>
              </div>
            </div>
            {/* Post content */}
            <div className="px-3 pb-3">
              <p className="text-sm mb-3" dangerouslySetInnerHTML={{ __html: displayContent }} />
            </div>
            {/* Post image placeholder */}
            <div className="aspect-video bg-gray-100 flex items-center justify-center">
              <div className="text-gray-400 text-sm">Post Image</div>
            </div>
            {/* Engagement counts */}
            <div className="p-3 border-b border-gray-200">
              <div className="flex justify-between text-xs text-gray-500">
                <div className="flex items-center">
                  <div className="bg-blue-500 rounded-full p-1 mr-1">
                    <ThumbsUp className="h-3 w-3 text-white" />
                  </div>
                  <span>1.2K</span>
                </div>
                <div>
                  <span>42 comments</span>
                  <span className="mx-1">·</span>
                  <span>15 shares</span>
                </div>
              </div>
            </div>
            {/* Action buttons */}
            <div className="flex justify-around p-1">
              <Button variant="ghost" size="sm" className="flex-1 text-gray-600">
                <ThumbsUp className="h-5 w-5 mr-2" />
                Like
              </Button>
              <Button variant="ghost" size="sm" className="flex-1 text-gray-600">
                <MessageSquare className="h-5 w-5 mr-2" />
                Comment
              </Button>
              <Button variant="ghost" size="sm" className="flex-1 text-gray-600">
                <Share2 className="h-5 w-5 mr-2" />
                Share
              </Button>
            </div>
          </div>
        );
        
      case 'twitter':
        return (
          <div className="max-w-[450px] mx-auto border rounded-md bg-white">
            {/* Twitter header */}
            <div className="flex p-3">
              <Avatar className="h-10 w-10 mr-3">
                <AvatarFallback>YB</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center">
                  <p className="font-bold text-sm">Your Brand</p>
                  <p className="text-gray-500 text-sm ml-2">@yourbrand · 2h</p>
                </div>
                <p className="text-sm mt-1" dangerouslySetInnerHTML={{ __html: displayContent }} />
                {hashtags.length > 0 && (
                  <p className="text-sm text-blue-500 mt-1">
                    {hashtags.slice(0, 3).map((tag, i) => 
                      <span key={i}>#{tag} </span>
                    )}
                  </p>
                )}
                {/* Post image placeholder */}
                {true && (
                  <div className="mt-3 aspect-video bg-gray-100 rounded-xl flex items-center justify-center">
                    <div className="text-gray-400 text-sm">Post Image</div>
                  </div>
                )}
                {/* Action buttons */}
                <div className="flex justify-between mt-3 text-gray-500">
                  <div className="flex items-center">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    <span className="text-xs">42</span>
                  </div>
                  <div className="flex items-center">
                    <Repeat2 className="h-4 w-4 mr-1" />
                    <span className="text-xs">15</span>
                  </div>
                  <div className="flex items-center">
                    <Heart className="h-4 w-4 mr-1" />
                    <span className="text-xs">278</span>
                  </div>
                  <div className="flex items-center">
                    <BarChart className="h-4 w-4 mr-1" />
                    <span className="text-xs">1.2K</span>
                  </div>
                  <div className="flex items-center">
                    <Share2 className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'linkedin':
        return (
          <div className="max-w-[500px] mx-auto border rounded-md bg-white">
            {/* LinkedIn header */}
            <div className="flex items-center p-3">
              <Avatar className="h-12 w-12 mr-3">
                <AvatarFallback>YB</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">Your Brand</p>
                <p className="text-xs text-gray-500">125K followers</p>
                <div className="flex items-center text-xs text-gray-500">
                  <span>2h</span>
                  <span className="mx-1">·</span>
                  <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor"><circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1.5"></circle><path d="M5 8h6M8 5v6"></path></svg>
                </div>
              </div>
            </div>
            {/* Post content */}
            <div className="px-3 pb-3">
              <p className="text-sm mb-3" dangerouslySetInnerHTML={{ __html: displayContent }} />
              {hashtags.length > 0 && (
                <p className="text-sm text-blue-500 mb-3">
                  {hashtags.slice(0, 3).map((tag, i) => 
                    <span key={i}>#{tag} </span>
                  )}
                </p>
              )}
            </div>
            {/* Post image placeholder */}
            <div className="aspect-video bg-gray-100 flex items-center justify-center">
              <div className="text-gray-400 text-sm">Post Image</div>
            </div>
            {/* Engagement counts */}
            <div className="p-3 border-b border-gray-200">
              <div className="flex items-center text-xs text-gray-500">
                <div className="flex -space-x-1 mr-1">
                  <div className="bg-blue-500 rounded-full h-4 w-4"></div>
                  <div className="bg-green-500 rounded-full h-4 w-4"></div>
                  <div className="bg-red-500 rounded-full h-4 w-4"></div>
                </div>
                <span>You and 1,234 others</span>
                <span className="mx-1">·</span>
                <span>42 comments</span>
              </div>
            </div>
            {/* Action buttons */}
            <div className="flex justify-around p-1">
              <Button variant="ghost" size="sm" className="flex-1 text-gray-600">
                <ThumbsUp className="h-5 w-5 mr-2" />
                Like
              </Button>
              <Button variant="ghost" size="sm" className="flex-1 text-gray-600">
                <MessageSquare className="h-5 w-5 mr-2" />
                Comment
              </Button>
              <Button variant="ghost" size="sm" className="flex-1 text-gray-600">
                <Repeat2 className="h-5 w-5 mr-2" />
                Repost
              </Button>
              <Button variant="ghost" size="sm" className="flex-1 text-gray-600">
                <Share2 className="h-5 w-5 mr-2" />
                Send
              </Button>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="p-4 bg-gray-100 rounded-md">
            <p>Preview not available</p>
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Social Media Preview</DialogTitle>
          <DialogDescription>
            See how your content will appear on different social media platforms and optimize it for better engagement.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
          {/* Left side - Platform tabs and preview */}
          <div className="lg:col-span-7 space-y-4">
            <Tabs defaultValue="instagram" onValueChange={setPlatform}>
              <TabsList className="w-full">
                <TabsTrigger value="instagram" className="flex-1">
                  <SiInstagram className="mr-2" /> Instagram
                </TabsTrigger>
                <TabsTrigger value="tiktok" className="flex-1">
                  <SiTiktok className="mr-2" /> TikTok
                </TabsTrigger>
                <TabsTrigger value="facebook" className="flex-1">
                  <SiFacebook className="mr-2" /> Facebook
                </TabsTrigger>
                <TabsTrigger value="twitter" className="flex-1">
                  <SiX className="mr-2" /> Twitter
                </TabsTrigger>
                <TabsTrigger value="linkedin" className="flex-1">
                  <SiLinkedin className="mr-2" /> LinkedIn
                </TabsTrigger>
              </TabsList>
              
              <div className="mt-6">
                {renderPlatformTemplate()}
              </div>
            </Tabs>
          </div>
          
          {/* Right side - Optimization and editing */}
          <div className="lg:col-span-5 space-y-6">
            {/* Platform optimization score */}
            {data?.suggestions && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <div 
                      className="w-8 h-8 rounded-full mr-2 flex items-center justify-center text-white"
                      style={{ background: getPlatformColor(platform) }}
                    >
                      {getPlatformIcon(platform)}
                    </div>
                    {platform.charAt(0).toUpperCase() + platform.slice(1)} Optimization
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Score visualization */}
                  <div className="mb-4">
                    {data.suggestions.find(s => s.platform === platform) && (
                      <>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Engagement Score</span>
                          <span className="text-sm font-bold">
                            {data.suggestions.find(s => s.platform === platform)?.score}/10
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full" 
                            style={{ 
                              width: `${(data.suggestions.find(s => s.platform === platform)?.score || 0) * 10}%`,
                              background: getPlatformColor(platform)
                            }}
                          ></div>
                        </div>
                      </>
                    )}
                  </div>
                  
                  {/* Suggestions */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Recommendations</h4>
                    <ul className="space-y-1">
                      {data.suggestions
                        .find(s => s.platform === platform)?.suggestions
                        .map((suggestion, i) => (
                          <li key={i} className="text-sm flex">
                            <ArrowUpRight className="h-4 w-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>{suggestion}</span>
                          </li>
                        ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Content editor */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Edit Content</CardTitle>
                <CardDescription>
                  Customize your content for {platform}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {editing ? (
                  <Textarea 
                    value={editContent} 
                    onChange={(e) => setEditContent(e.target.value)}
                    className="min-h-[150px] mb-2"
                  />
                ) : (
                  <div className="border rounded-md p-3 min-h-[150px] mb-2 text-sm">
                    {optimizedContent[platform] || content}
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2 mt-4">
                  {hashtagsAndEmojis?.hashtags.slice(0, 5).map((tag, i) => (
                    <Badge key={i} variant="outline" className="cursor-pointer"
                      onClick={() => {
                        if (editing) {
                          setEditContent(prev => `${prev} #${tag}`);
                        }
                      }}
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex flex-wrap gap-2 mt-2">
                  {hashtagsAndEmojis?.emojis.slice(0, 10).map((emoji, i) => (
                    <span key={i} className="text-xl cursor-pointer"
                      onClick={() => {
                        if (editing) {
                          setEditContent(prev => `${prev} ${emoji}`);
                        }
                      }}
                    >
                      {emoji}
                    </span>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="sm" variant="outline" className="mr-2"
                          onClick={handleCopyContent}
                        >
                          <Copy className="h-4 w-4 mr-1" /> Copy
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Copy to clipboard</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div>
                  {editing ? (
                    <>
                      <Button size="sm" variant="outline" className="mr-2"
                        onClick={() => {
                          setEditContent(optimizedContent[platform] || content);
                          setEditing(false);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleSaveEdit}>
                        Save Changes
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" onClick={() => setEditing(true)}>
                      Edit Content
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}