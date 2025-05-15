import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Eye, Share2, Heart, MessageCircle, Bookmark, ThumbsUp, SendHorizontal, UserPlus, Repeat2, BarChart4 } from 'lucide-react';
import { NICHES } from '@shared/constants';

interface Preview {
  platformName: string;
  content: string;
  optimizedContent?: string;
  hashtags: string[];
  emojis: string[];
}

export default function MultiPlatformPreview() {
  const [content, setContent] = useState<string>('');
  const [niche, setNiche] = useState<string>('');
  const [activePlatform, setActivePlatform] = useState<string>('instagram');
  const [previews, setPreviews] = useState<Preview[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [username, setUsername] = useState<string>('glowbot_user');
  const [avatarUrl, setAvatarUrl] = useState<string>('https://ui-avatars.com/api/?name=Glow+Bot');

  // Platform options
  const platforms = [
    { id: 'instagram', name: 'Instagram', color: 'bg-gradient-to-r from-purple-500 to-pink-500' },
    { id: 'facebook', name: 'Facebook', color: 'bg-blue-600' },
    { id: 'twitter', name: 'Twitter', color: 'bg-blue-400' },
    { id: 'linkedin', name: 'LinkedIn', color: 'bg-blue-800' },
    { id: 'tiktok', name: 'TikTok', color: 'bg-black' },
  ];

  // Generate previews for all platforms
  const generatePreviews = async () => {
    if (!content) {
      toast({
        title: 'Missing Content',
        description: 'Please enter content to generate previews.',
        variant: 'destructive',
      });
      return;
    }

    if (!niche) {
      toast({
        title: 'Missing Niche',
        description: 'Please select a niche for your content.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Get hashtags and emojis to use across platforms
      const hashtagResponse = await apiRequest(
        'POST',
        '/api/hashtag-emoji',
        {
          content,
          niche,
        }
      );
      
      const hashtagData = await hashtagResponse.json();
      const hashtags = hashtagData.hashtags || [];
      const emojis = hashtagData.emojis || [];
      
      // Generate platform-specific previews sequentially
      const newPreviews: Preview[] = [];
      
      for (const platform of platforms) {
        // Generate platform-specific content
        const optimizeResponse = await apiRequest(
          'POST',
          '/api/claude-content',
          {
            prompt: `I have a piece of content in the ${niche} niche that I want to optimize for ${platform.name}.
            Here's my original content:
            "${content}"
            
            Please rewrite this content specifically for ${platform.name}, following their best practices for engagement, character limits, and formatting. 
            Keep it concise and platform-appropriate.
            Focus on maintaining the key points while optimizing the format.
            Return only the optimized content without any explanations.`,
            niche,
            temperature: 0.7,
            maxTokens: 1024,
          }
        );
        
        const optimizeData = await optimizeResponse.json();
        
        // Create platform preview
        newPreviews.push({
          platformName: platform.name,
          content,
          optimizedContent: optimizeData.content,
          hashtags,
          emojis
        });
      }
      
      setPreviews(newPreviews);
      setActivePlatform('instagram'); // Default to first platform
      
      toast({
        title: 'Previews Generated',
        description: `Content optimized for ${platforms.length} platforms.`,
      });
    } catch (error) {
      console.error('Preview generation failed:', error);
      toast({
        title: 'Generation Failed',
        description: 'Failed to generate platform previews. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Get the current preview based on active platform
  const getActivePreview = (): Preview | undefined => {
    return previews.find(preview => 
      preview.platformName.toLowerCase() === activePlatform.toLowerCase()
    );
  };

  // Get formatted hashtags for display
  const getFormattedHashtags = (hashtags: string[]): string => {
    return hashtags.map(tag => 
      tag.startsWith('#') ? tag : `#${tag}`
    ).join(' ');
  };

  // Render Instagram preview
  const renderInstagramPreview = (preview?: Preview) => {
    if (!preview) return null;
    
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg overflow-hidden shadow">
          {/* Header */}
          <div className="p-3 flex items-center justify-between border-b">
            <div className="flex items-center space-x-2">
              <Avatar>
                <AvatarImage src={avatarUrl} alt={username} />
                <AvatarFallback>{username.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">{username}</p>
                <p className="text-xs text-gray-500">Sponsored</p>
              </div>
            </div>
            <button className="text-gray-500">•••</button>
          </div>
          
          {/* Image Placeholder */}
          <div className="bg-gray-100 aspect-square flex items-center justify-center">
            <p className="text-gray-500 text-sm">Content image would appear here</p>
          </div>
          
          {/* Actions */}
          <div className="p-3 flex items-center justify-between">
            <div className="flex space-x-4">
              <Heart className="w-6 h-6" />
              <MessageCircle className="w-6 h-6" />
              <SendHorizontal className="w-6 h-6" />
            </div>
            <Bookmark className="w-6 h-6" />
          </div>
          
          {/* Content */}
          <div className="px-3 pb-3">
            <p className="text-sm font-medium mb-1">{username}</p>
            <p className="text-sm">
              {preview.optimizedContent || preview.content}
            </p>
            <p className="text-sm text-blue-500 mt-1">
              {getFormattedHashtags(preview.hashtags.slice(0, 5))}
            </p>
            <p className="text-xs text-gray-500 mt-2">View all 123 comments</p>
          </div>
        </div>
      </div>
    );
  };

  // Render Twitter/X preview
  const renderTwitterPreview = (preview?: Preview) => {
    if (!preview) return null;
    
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg overflow-hidden shadow p-4">
          <div className="flex space-x-3">
            <Avatar>
              <AvatarImage src={avatarUrl} alt={username} />
              <AvatarFallback>{username.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center">
                <p className="font-bold text-sm">{username}</p>
                <p className="text-gray-500 text-sm ml-2">@{username} · 1h</p>
              </div>
              <p className="text-sm mt-1">
                {preview.optimizedContent || preview.content}
              </p>
              <p className="text-sm text-blue-500 mt-1">
                {getFormattedHashtags(preview.hashtags.slice(0, 3))}
              </p>
              
              <div className="flex justify-between mt-3 text-gray-500 text-sm">
                <div className="flex items-center space-x-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>24</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Repeat2 className="w-4 h-4" />
                  <span>12</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Heart className="w-4 h-4" />
                  <span>347</span>
                </div>
                <div className="flex items-center space-x-1">
                  <BarChart4 className="w-4 h-4" />
                  <span>1.2K</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Facebook preview
  const renderFacebookPreview = (preview?: Preview) => {
    if (!preview) return null;
    
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg overflow-hidden shadow">
          <div className="p-4 border-b">
            <div className="flex items-center space-x-2">
              <Avatar>
                <AvatarImage src={avatarUrl} alt={username} />
                <AvatarFallback>{username.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{username}</p>
                <p className="text-xs text-gray-500">Sponsored · 3h</p>
              </div>
            </div>
            
            <p className="mt-3">
              {preview.optimizedContent || preview.content}
            </p>
            <p className="text-blue-500 mt-1">
              {getFormattedHashtags(preview.hashtags.slice(0, 3))}
            </p>
          </div>
          
          <div className="bg-gray-100 aspect-video flex items-center justify-center">
            <p className="text-gray-500 text-sm">Image or Video content would appear here</p>
          </div>
          
          <div className="p-3 border-t">
            <div className="flex justify-between text-gray-500 text-sm">
              <div className="flex items-center space-x-1">
                <ThumbsUp className="w-4 h-4" />
                <span>123 Likes</span>
              </div>
              <div>
                <span>45 Comments · 12 Shares</span>
              </div>
            </div>
            
            <div className="flex justify-between mt-3 pt-3 border-t">
              <button className="flex items-center text-gray-500">
                <ThumbsUp className="w-5 h-5 mr-1" />
                Like
              </button>
              <button className="flex items-center text-gray-500">
                <MessageCircle className="w-5 h-5 mr-1" />
                Comment
              </button>
              <button className="flex items-center text-gray-500">
                <Share2 className="w-5 h-5 mr-1" />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render LinkedIn preview
  const renderLinkedInPreview = (preview?: Preview) => {
    if (!preview) return null;
    
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg overflow-hidden shadow">
          <div className="p-4">
            <div className="flex items-center space-x-2">
              <Avatar>
                <AvatarImage src={avatarUrl} alt={username} />
                <AvatarFallback>{username.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{username}</p>
                <p className="text-xs text-gray-500">Marketing Manager at GlowBot · 1d</p>
                <div className="flex items-center text-xs text-gray-500 mt-1">
                  <span>1,234 followers</span>
                  <span className="mx-1">•</span>
                  <span>Sponsored</span>
                </div>
              </div>
            </div>
            
            <div className="mt-3">
              <p>
                {preview.optimizedContent || preview.content}
              </p>
              <p className="text-blue-500 mt-2">
                {getFormattedHashtags(preview.hashtags.slice(0, 3))}
              </p>
            </div>
          </div>
          
          <div className="bg-gray-100 aspect-video flex items-center justify-center">
            <p className="text-gray-500 text-sm">Image content would appear here</p>
          </div>
          
          <div className="p-3">
            <div className="flex justify-between text-gray-500 text-xs">
              <span>123 reactions • 45 comments</span>
            </div>
            
            <div className="flex justify-between mt-3 pt-3 border-t text-sm">
              <button className="flex items-center text-gray-500">
                <ThumbsUp className="w-5 h-5 mr-1" />
                Like
              </button>
              <button className="flex items-center text-gray-500">
                <MessageCircle className="w-5 h-5 mr-1" />
                Comment
              </button>
              <button className="flex items-center text-gray-500">
                <Repeat2 className="w-5 h-5 mr-1" />
                Repost
              </button>
              <button className="flex items-center text-gray-500">
                <SendHorizontal className="w-5 h-5 mr-1" />
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render TikTok preview
  const renderTikTokPreview = (preview?: Preview) => {
    if (!preview) return null;
    
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-black text-white rounded-lg overflow-hidden shadow relative">
          <div className="aspect-[9/16] flex flex-col">
            <div className="flex-1 flex items-center justify-center bg-gray-800">
              <p className="text-gray-300 text-sm">Video content would appear here</p>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="flex">
                <div className="flex-1">
                  <p className="font-bold">@{username}</p>
                  <p className="text-sm mt-1 line-clamp-2">
                    {preview.optimizedContent || preview.content}
                  </p>
                  <p className="text-sm mt-2">
                    {preview.emojis.slice(0, 3).join(' ')} {getFormattedHashtags(preview.hashtags.slice(0, 3))}
                  </p>
                </div>
                
                <div className="flex flex-col items-center justify-end space-y-4 ml-4">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={avatarUrl} alt={username} />
                    <AvatarFallback>{username.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-center">
                    <Heart className="w-8 h-8" />
                    <span className="text-xs">456K</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <MessageCircle className="w-8 h-8" />
                    <span className="text-xs">2031</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Bookmark className="w-8 h-8" />
                    <span className="text-xs">75K</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Share2 className="w-8 h-8" />
                    <span className="text-xs">Share</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render the appropriate preview based on active platform
  const renderActivePreview = () => {
    const preview = getActivePreview();
    
    switch (activePlatform) {
      case 'instagram':
        return renderInstagramPreview(preview);
      case 'twitter':
        return renderTwitterPreview(preview);
      case 'facebook':
        return renderFacebookPreview(preview);
      case 'linkedin':
        return renderLinkedInPreview(preview);
      case 'tiktok':
        return renderTikTokPreview(preview);
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Multi-Platform Preview</h1>
      <p className="text-gray-600 mb-6">
        See how your content will look across different social media platforms. Generate optimized versions for each platform.
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Details</CardTitle>
              <CardDescription>
                Enter your content and details to preview across platforms
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Post Title (Optional)</Label>
                <Input
                  id="title"
                  placeholder="Enter a title for your post"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="content">Post Content</Label>
                <Textarea
                  id="content"
                  placeholder="Enter your post content here"
                  className="min-h-[150px]"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="niche">Content Niche</Label>
                <Select value={niche} onValueChange={setNiche}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a niche" />
                  </SelectTrigger>
                  <SelectContent>
                    {NICHES.map((n) => (
                      <SelectItem key={n} value={n}>
                        {n.charAt(0).toUpperCase() + n.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="username">Display Username</Label>
                <Input
                  id="username"
                  placeholder="Your social media username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </CardContent>
            
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={generatePreviews}
                disabled={isGenerating}
              >
                {isGenerating ? 'Generating Previews...' : 'Generate Platform Previews'}
              </Button>
            </CardFooter>
          </Card>
          
          {/* Platform Display Selection */}
          {previews.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Platform Optimization</CardTitle>
                <CardDescription>
                  View how your content looks on different platforms
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  {platforms.map((platform) => (
                    <Button 
                      key={platform.id}
                      variant={activePlatform === platform.id ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => setActivePlatform(platform.id)}
                    >
                      <div className={`w-4 h-4 rounded-full mr-2 ${platform.color}`}></div>
                      {platform.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div className="lg:col-span-2">
          {previews.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>{platforms.find(p => p.id === activePlatform)?.name} Preview</CardTitle>
                <CardDescription>
                  Content optimized specifically for {platforms.find(p => p.id === activePlatform)?.name}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {renderActivePreview()}
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <p className="text-sm text-gray-500">Preview only - actual appearance may vary</p>
              </CardFooter>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Platform Previews</CardTitle>
                <CardDescription>
                  Enter your content and generate previews to see how it will look on different platforms
                </CardDescription>
              </CardHeader>
              
              <CardContent className="min-h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <Eye className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Previews Generated</h3>
                  <p className="text-gray-500 max-w-xs mx-auto">
                    Enter your content details and click "Generate Platform Previews" to see how your content will appear across different social media platforms.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}