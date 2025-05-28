import { FC, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Calendar, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import CaptionRewriter from "@/components/CaptionRewriter";

interface PlatformContentResponse {
  platform: string;
  type: "video" | "photo" | "other";
  label: string;
  content?: string;
  script?: string;
  caption?: string;
  hashtags?: string[];
  postInstructions?: string;
}

interface MultiPlatformResponse {
  success: boolean;
  platformContent: { [platform: string]: PlatformContentResponse };
  platformSchedules: { [platform: string]: string };
  metadata: {
    product: string;
    niche: string;
    tone: string;
    templateType: string;
    generatedAt: string;
    platforms: string[];
    totalPlatforms: number;
  };
}

interface MultiPlatformContentOutputProps {
  data: MultiPlatformResponse;
}

const MultiPlatformContentOutput: FC<MultiPlatformContentOutputProps> = ({ data }) => {
  const { toast } = useToast();
  const [platformSchedules, setPlatformSchedules] = useState<{ [platform: string]: string }>({});
  const [isScheduling, setIsScheduling] = useState(false);

  // Add safety check for data
  if (!data) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-6 text-center">
          <p className="text-orange-700">No data available</p>
        </CardContent>
      </Card>
    );
  }

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleScheduleContent = async () => {
    try {
      setIsScheduling(true);

      const response = await apiRequest('POST', '/api/multi-platform/schedule', {
        platformContent: data.platformContent,
        platformSchedules,
        metadata: data.metadata
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "✅ Content Scheduled Successfully",
          description: `Scheduled for ${result.scheduledPlatforms.length} platforms via Make.com`,
        });
      } else {
        throw new Error(result.error || "Scheduling failed");
      }
    } catch (error: any) {
      toast({
        title: "❌ Scheduling Failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsScheduling(false);
    }
  };

  const formatLabel = (platformData: PlatformContentResponse, videoDuration?: string) => {
    const { platform, type } = platformData;
    
    if (type === "video") {
      const duration = videoDuration || "30";
      return `${type.charAt(0).toUpperCase() + type.slice(1)} Script (${duration} seconds - ${platform})`;
    } else if (type === "photo") {
      return `${type.charAt(0).toUpperCase() + type.slice(1)} Content (${platform})`;
    } else {
      return `${platform} Content`;
    }
  };

  // Debug: Log the data structure to understand what we're receiving
  console.log('MultiPlatformContentOutput received data:', data);
  console.log('Platform content:', data.platformContent);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      
      {/* Metadata */}
      <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
        <CardHeader>
          <CardTitle className="text-pink-700 flex items-center gap-2">
            🎯 Multi-Platform Content Generated
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-600">Product:</span>
              <p className="text-gray-800">{data.metadata?.product || 'N/A'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Niche:</span>
              <p className="text-gray-800 capitalize">{data.metadata?.niche || 'N/A'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Tone:</span>
              <p className="text-gray-800 capitalize">{data.metadata?.tone || 'N/A'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Platforms:</span>
              <p className="text-gray-800">{data.metadata?.totalPlatforms || Object.keys(data.platformContent || {}).length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Platform Content */}
      {data.platformContent && Object.keys(data.platformContent).length > 0 ? Object.entries(data.platformContent).map(([platform, platformData]) => (
        <Card key={platform} className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="text-purple-700">
                {platformData.label || formatLabel(platformData)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const content = platformData.script || platformData.caption || platformData.content || '';
                  copyToClipboard(content, platformData.label);
                }}
                className="text-purple-600 border-purple-200 hover:bg-purple-50"
              >
                <Copy className="w-4 h-4 mr-1" />
                Copy
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* Video Script */}
            {platformData.script && (
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-medium text-purple-700 mb-2">Script Content</h4>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {platformData.script}
                </p>
                <CaptionRewriter 
                  originalCaption={platformData.script} 
                  outputId={`${platform}-script`} 
                />
              </div>
            )}

            {/* Photo Caption */}
            {platformData.caption && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-700 mb-2">Caption Content</h4>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {platformData.caption}
                </p>
                <CaptionRewriter 
                  originalCaption={platformData.caption} 
                  outputId={`${platform}-caption`} 
                />
              </div>
            )}

            {/* Other Content */}
            {platformData.content && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-700 mb-2">Content</h4>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {platformData.content}
                </p>
                <CaptionRewriter 
                  originalCaption={platformData.content} 
                  outputId={`${platform}-content`} 
                />
              </div>
            )}

            {/* Hashtags */}
            {platformData.hashtags && platformData.hashtags.length > 0 && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-700 mb-2">Recommended Hashtags</h4>
                <div className="flex flex-wrap gap-2">
                  {platformData.hashtags.map((hashtag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium"
                    >
                      {hashtag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Post Instructions */}
            {platformData.postInstructions && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-700 mb-1">Post Instructions</h4>
                <p className="text-blue-600 text-sm">{platformData.postInstructions}</p>
              </div>
            )}

          </CardContent>
        </Card>
      )) : (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6 text-center">
            <p className="text-orange-700">No platform content available. Please generate content first.</p>
          </CardContent>
        </Card>
      )}

      {/* Multi-Platform Scheduling */}
      {data.platformContent && Object.keys(data.platformContent).length > 0 && (
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-700 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Schedule & Send to Make.com
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Platform Schedulers */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-blue-700">
              Schedule Time per Platform (Optional)
            </label>
            
            {Object.keys(data.platformContent || {}).map((platform) => (
              <div key={platform} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-200">
                <span className="font-medium text-gray-700 w-32">{platform}:</span>
                <Input
                  type="datetime-local"
                  value={platformSchedules[platform] || ''}
                  onChange={(e) => {
                    setPlatformSchedules(prev => ({
                      ...prev,
                      [platform]: e.target.value
                    }));
                  }}
                  className="flex-1"
                  placeholder="Leave empty to send immediately"
                />
              </div>
            ))}
            
            <p className="text-xs text-blue-600">
              Leave empty to send immediately to Make.com
            </p>
          </div>

          <Button
            onClick={handleScheduleContent}
            disabled={isScheduling}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Send className="w-4 h-4 mr-2" />
            {isScheduling ? "Scheduling..." : "Send to Make.com"}
          </Button>
          
        </CardContent>
      </Card>
      )}

    </div>
  );
};

export default MultiPlatformContentOutput;