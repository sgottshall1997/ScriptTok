import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { 
  ChevronDown, 
  Copy, 
  ExternalLink,
  Calendar,
  Hash,
  Zap
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useQuery } from '@tanstack/react-query';

interface BulkContentViewerProps {
  jobId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function BulkContentViewer({ jobId, isOpen, onClose }: BulkContentViewerProps) {
  const { toast } = useToast();
  const [expandedContent, setExpandedContent] = useState<Record<string, boolean>>({});

  // Fetch bulk generated content
  const { data: bulkContent, isLoading } = useQuery({
    queryKey: ['/api/bulk/content', jobId],
    queryFn: async () => {
      const response = await fetch(`/api/bulk/content/${jobId}`);
      const data = await response.json();
      return data.success ? data.content : [];
    },
    enabled: isOpen && !!jobId,
    staleTime: 0
  });

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: `${label} copied successfully`,
    });
  };

  const toggleExpanded = (id: string) => {
    setExpandedContent(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Generated Content for Job {jobId}</h2>
          <Button variant="outline" onClick={onClose}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="text-center py-8">Loading generated content...</div>
          ) : !bulkContent || bulkContent.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No generated content found for this job.
            </div>
          ) : (
            <div className="space-y-4">
              {bulkContent.map((content: any) => (
                <Card key={content.id} className="border">
                  <Collapsible 
                    open={expandedContent[content.id]}
                    onOpenChange={() => toggleExpanded(content.id)}
                  >
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <ChevronDown 
                              className={`h-4 w-4 transition-transform ${
                                expandedContent[content.id] ? 'transform rotate-180' : ''
                              }`}
                            />
                            <div>
                              <CardTitle className="text-base">{content.productName}</CardTitle>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="text-xs">
                                  {content.niche}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {content.tone}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {content.template}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 text-gray-500" />
                            <span className="text-xs text-gray-500">
                              {new Date(content.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        {/* Generated Content - Matching Standard Generator Format */}
                        {content.generatedContent && (
                          <div className="space-y-4">
                            {/* Main Generated Content */}
                            <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-green-500">
                              <h4 className="font-semibold mb-3 text-lg">Generated Content:</h4>
                              <div className="text-sm text-gray-600 mb-4 flex gap-4">
                                <span className="bg-white px-2 py-1 rounded">Template: {content.template}</span>
                                <span className="bg-white px-2 py-1 rounded">Tone: {content.tone}</span>
                                <span className="bg-white px-2 py-1 rounded">Niche: {content.niche}</span>
                              </div>
                              <div className="prose prose-sm max-w-none">
                                <p className="whitespace-pre-wrap text-gray-900 leading-relaxed">
                                  {content.generatedContent.productDescription || content.generatedContent.videoScript || 'Generated content'}
                                </p>
                              </div>
                              <div className="mt-4">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => copyToClipboard(content.generatedContent.productDescription || content.generatedContent.videoScript || 'Generated content', 'Content')}
                                >
                                  <Copy className="h-4 w-4 mr-1" />
                                  Copy Content
                                </Button>
                              </div>
                            </div>

                            {/* Viral Hook */}
                            {content.generatedContent.viralHooks && content.generatedContent.viralHooks.length > 0 && (
                              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                                <h4 className="font-semibold mb-2">Viral Hook:</h4>
                                <p className="text-blue-900 font-medium">{content.generatedContent.viralHooks[0]}</p>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="mt-2"
                                  onClick={() => copyToClipboard(content.generatedContent.viralHooks[0], 'Viral Hook')}
                                >
                                  <Copy className="h-4 w-4 mr-1" />
                                  Copy Hook
                                </Button>
                              </div>
                            )}

                            {/* Platform-Specific Captions - Exact Style Match */}
                            {content.generatedContent.platformCaptions && (
                              <div className="space-y-4 border-t pt-6">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-semibold text-lg flex items-center gap-2">
                                    🎯 Platform-Specific Captions
                                  </h4>
                                </div>
                                
                                <div className="space-y-4">
                                  {/* TikTok Caption */}
                                  {content.generatedContent.platformCaptions.tiktok && (
                                    <div className="bg-black text-white p-4 rounded-lg border">
                                      <div className="flex items-center justify-between mb-3">
                                        <h5 className="font-semibold flex items-center gap-2 text-white">
                                          📱 TikTok Caption
                                        </h5>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => copyToClipboard(content.generatedContent.platformCaptions.tiktok, 'TikTok caption')}
                                          className="text-xs bg-white text-black hover:bg-gray-100"
                                        >
                                          <Copy className="h-3 w-3 mr-1" />
                                          Copy
                                        </Button>
                                      </div>
                                      <div className="bg-gray-900 p-4 rounded border border-gray-700 text-sm font-mono whitespace-pre-wrap text-gray-100 leading-relaxed max-h-40 overflow-y-auto">
                                        {content.generatedContent.platformCaptions.tiktok}
                                      </div>
                                    </div>
                                  )}

                                  {/* Instagram Caption */}
                                  {content.generatedContent.platformCaptions.instagram && (
                                    <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 text-white p-4 rounded-lg border">
                                      <div className="flex items-center justify-between mb-3">
                                        <h5 className="font-semibold flex items-center gap-2 text-white">
                                          📸 Instagram Caption
                                        </h5>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => copyToClipboard(content.generatedContent.platformCaptions.instagram, 'Instagram caption')}
                                          className="text-xs bg-white text-purple-600 hover:bg-gray-100"
                                        >
                                          <Copy className="h-3 w-3 mr-1" />
                                          Copy
                                        </Button>
                                      </div>
                                      <div className="bg-black bg-opacity-30 backdrop-blur-sm p-4 rounded border border-white/20 text-sm font-mono whitespace-pre-wrap text-white leading-relaxed max-h-40 overflow-y-auto">
                                        {content.generatedContent.platformCaptions.instagram}
                                      </div>
                                    </div>
                                  )}

                                  {/* YouTube Caption */}
                                  {content.generatedContent.platformCaptions.youtube && (
                                    <div className="bg-red-600 text-white p-4 rounded-lg border">
                                      <div className="flex items-center justify-between mb-3">
                                        <h5 className="font-semibold flex items-center gap-2 text-white">
                                          ▶️ YouTube Caption
                                        </h5>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => copyToClipboard(content.generatedContent.platformCaptions.youtube, 'YouTube caption')}
                                          className="text-xs bg-white text-red-600 hover:bg-gray-100"
                                        >
                                          <Copy className="h-3 w-3 mr-1" />
                                          Copy
                                        </Button>
                                      </div>
                                      <div className="bg-red-800 p-4 rounded border border-red-700 text-sm font-mono whitespace-pre-wrap text-red-100 leading-relaxed max-h-40 overflow-y-auto">
                                        {content.generatedContent.platformCaptions.youtube}
                                      </div>
                                    </div>
                                  )}

                                  {/* Twitter Caption */}
                                  {content.generatedContent.platformCaptions.twitter && (
                                    <div className="bg-blue-500 text-white p-4 rounded-lg border">
                                      <div className="flex items-center justify-between mb-3">
                                        <h5 className="font-semibold flex items-center gap-2 text-white">
                                          🐦 Twitter Caption
                                        </h5>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => copyToClipboard(content.generatedContent.platformCaptions.twitter, 'Twitter caption')}
                                          className="text-xs bg-white text-blue-600 hover:bg-gray-100"
                                        >
                                          <Copy className="h-3 w-3 mr-1" />
                                          Copy
                                        </Button>
                                      </div>
                                      <div className="bg-blue-700 p-4 rounded border border-blue-600 text-sm font-mono whitespace-pre-wrap text-blue-100 leading-relaxed max-h-40 overflow-y-auto">
                                        {content.generatedContent.platformCaptions.twitter}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Hashtags */}
                            {content.generatedContent.hashtags && content.generatedContent.hashtags.length > 0 && (
                              <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-semibold flex items-center gap-2">
                                    <Hash className="h-4 w-4" />
                                    Hashtags
                                  </h4>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => copyToClipboard(content.generatedContent.hashtags.join(' '), 'Hashtags')}
                                  >
                                    <Copy className="h-3 w-3 mr-1" />
                                    Copy All
                                  </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {content.generatedContent.hashtags.map((tag: string, index: number) => (
                                    <Badge key={index} variant="secondary" className="text-xs bg-yellow-200 text-yellow-800">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Affiliate Link */}
                            {content.affiliateLink && (
                              <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-semibold flex items-center gap-2">
                                    <ExternalLink className="h-4 w-4" />
                                    Affiliate Link
                                  </h4>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => copyToClipboard(content.affiliateLink, 'Affiliate Link')}
                                  >
                                    <Copy className="h-3 w-3 mr-1" />
                                    Copy Link
                                  </Button>
                                </div>
                                <div className="bg-white p-3 rounded border text-sm break-all font-mono text-green-800">
                                  {content.affiliateLink}
                                </div>
                              </div>
                            )}

                            {/* Video Script */}
                            {content.generatedContent.videoScript && (
                              <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-semibold flex items-center gap-2">
                                    📹 Video Script
                                  </h4>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => copyToClipboard(content.generatedContent.videoScript, 'Video Script')}
                                  >
                                    <Copy className="h-3 w-3 mr-1" />
                                    Copy Script
                                  </Button>
                                </div>
                                <div className="bg-white p-3 rounded border text-sm whitespace-pre-wrap font-mono text-purple-800">
                                  {content.generatedContent.videoScript}
                                </div>
                              </div>
                            )}

                            {/* Viral Inspiration */}
                            {content.viralInspiration && (
                              <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-semibold flex items-center gap-2">
                                    <Zap className="h-4 w-4" />
                                    Viral Inspiration
                                  </h4>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => copyToClipboard(`Hook: ${content.viralInspiration.hook}\nFormat: ${content.viralInspiration.format}\nCaption: ${content.viralInspiration.caption || ''}`, 'Viral Inspiration')}
                                  >
                                    <Copy className="h-3 w-3 mr-1" />
                                    Copy All
                                  </Button>
                                </div>
                                <div className="bg-white p-3 rounded border space-y-2 text-sm">
                                  <div><strong className="text-orange-800">Hook:</strong> <span className="text-orange-900">{content.viralInspiration.hook}</span></div>
                                  <div><strong className="text-orange-800">Format:</strong> <span className="text-orange-900">{content.viralInspiration.format}</span></div>
                                  {content.viralInspiration.caption && (
                                    <div><strong className="text-orange-800">Caption:</strong> <span className="text-orange-900">{content.viralInspiration.caption}</span></div>
                                  )}
                                  {content.viralInspiration.hashtags && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      <strong className="text-orange-800 w-full">Hashtags:</strong>
                                      {content.viralInspiration.hashtags.map((tag: string, index: number) => (
                                        <Badge key={index} variant="secondary" className="text-xs bg-orange-200 text-orange-800">
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}