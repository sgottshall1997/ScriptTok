import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Edit, RefreshCw, Star, ExternalLink } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { ContentRating } from './ContentRating';

interface GeneratedContentResult {
  content: string;
  productName: string;
  niche: string;
  templateType: string;
  tone: string;
  platforms: string[];
  platformCaptions: Record<string, string>;
  videoDuration?: any;
  viralInspiration?: any;
  affiliateUrl?: string;
  customHook?: string;
  model: string;
  tokens: number;
  fallbackLevel: string;
  generatedAt: string;
}

interface GeneratedContentCardProps {
  result: GeneratedContentResult;
  onRegenerate?: (productName: string) => void;
  onEdit?: (content: string) => void;
  showRating?: boolean;
  contentIndex?: number;
}

const GeneratedContentCard: React.FC<GeneratedContentCardProps> = ({
  result,
  onRegenerate,
  onEdit,
  showRating = true,
  contentIndex = 0
}) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(result.content);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: `${label} copied successfully`,
    });
  };

  const handleSaveEdit = () => {
    if (onEdit) {
      onEdit(editedContent);
    }
    setIsEditing(false);
    toast({
      title: "Content updated",
      description: "Your edits have been saved",
    });
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'tiktok': return '📱';
      case 'instagram': return '📸';
      case 'youtube': return '▶️';
      case 'twitter': return '🐦';
      case 'other': return '📄';
      default: return '🌐';
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'tiktok': return 'bg-black text-white';
      case 'instagram': return 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 text-white';
      case 'youtube': return 'bg-red-600 text-white';
      case 'twitter': return 'bg-blue-500 text-white';
      case 'other': return 'bg-gray-600 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <Card className="w-full mb-6 shadow-lg border-l-4 border-l-blue-500">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-gray-900">{result.productName}</h3>
              <Badge variant="outline" className="text-xs">{result.niche}</Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {result.templateType} • {result.tone}
            </Badge>
            {result.fallbackLevel === 'exact' && (
              <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                <Star className="w-3 h-3 mr-1" />
                Premium
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Main Content */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              🎯 Main Content
            </h4>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(result.content, 'Main content')}
                className="text-xs"
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="text-xs"
              >
                <Edit className="h-3 w-3 mr-1" />
                Edit
              </Button>
              {onRegenerate && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRegenerate(result.productName)}
                  className="text-xs"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Regenerate
                </Button>
              )}
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-3">
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full p-4 border rounded-lg min-h-[200px] font-mono text-sm"
                placeholder="Edit your content..."
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveEdit}>Save Changes</Button>
                <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <div className="text-sm font-mono whitespace-pre-wrap text-gray-800 leading-relaxed">
                {result.content}
              </div>
            </div>
          )}

          {/* Rating for main content */}
          {showRating && (
            <div className="pt-2 border-t">
              <ContentRating
                contentHistoryId={Math.floor(Math.random() * 1000000)}
                userId={1}
              />
            </div>
          )}
        </div>

        {/* Platform-Specific Captions */}
        {result.platformCaptions && Object.keys(result.platformCaptions).length > 0 && (
          <div className="space-y-4 border-t pt-6">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-lg flex items-center gap-2">
                🎯 Platform-Specific Captions
              </h4>
            </div>
            
            <div className="space-y-4">
              {Object.entries(result.platformCaptions).map(([platform, caption]) => (
                <div key={platform} className={`p-4 rounded-lg border ${getPlatformColor(platform)}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-semibold flex items-center gap-2">
                      {getPlatformIcon(platform)} {platform.charAt(0).toUpperCase() + platform.slice(1)} Caption
                    </h5>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(caption, `${platform} caption`)}
                      className="text-xs bg-white/20 backdrop-blur-sm hover:bg-white/30"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                  
                  <div className="bg-black/20 backdrop-blur-sm p-4 rounded border border-white/20 text-sm font-mono whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
                    {caption}
                  </div>

                  {/* Rating for platform caption */}
                  {showRating && (
                    <div className="mt-3 pt-3 border-t border-white/20">
                      <ContentRating
                        contentHistoryId={Math.floor(Math.random() * 1000000)}
                        userId={1}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional Info */}
        {(result.affiliateUrl || result.viralInspiration) && (
          <div className="space-y-3 border-t pt-4">
            {result.affiliateUrl && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="font-medium">Affiliate Link:</span>
                <a href={result.affiliateUrl} target="_blank" rel="noopener noreferrer" 
                   className="text-blue-600 hover:underline flex items-center gap-1">
                  View Product <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
            
            {result.viralInspiration && (
              <details className="text-sm text-gray-600">
                <summary className="font-medium cursor-pointer hover:text-gray-800">
                  Viral Inspiration Used
                </summary>
                <div className="mt-2 pl-4 border-l-2 border-gray-200">
                  <p><strong>Hook:</strong> {result.viralInspiration.hook}</p>
                  <p><strong>Format:</strong> {result.viralInspiration.format}</p>
                  {result.viralInspiration.hashtags && (
                    <p><strong>Hashtags:</strong> {result.viralInspiration.hashtags.join(', ')}</p>
                  )}
                </div>
              </details>
            )}
          </div>
        )}

        {/* Generation Metadata */}
        <div className="text-xs text-gray-500 border-t pt-3">
          Generated with {result.model} • {result.tokens} tokens • {new Date(result.generatedAt).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
};

export default GeneratedContentCard;