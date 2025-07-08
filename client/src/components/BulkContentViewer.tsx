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
                        {/* Generated Content */}
                        {content.generatedContent && (
                          <div className="space-y-4">
                            {/* Product Description */}
                            {content.generatedContent.productDescription && (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium">Product Description:</h4>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(content.generatedContent.productDescription, 'Product Description')}
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </div>
                                <div className="bg-gray-50 p-3 rounded text-sm">
                                  {content.generatedContent.productDescription}
                                </div>
                              </div>
                            )}

                            {/* Viral Hooks */}
                            {content.generatedContent.viralHooks && content.generatedContent.viralHooks.length > 0 && (
                              <div className="space-y-2">
                                <h4 className="font-medium">Viral Hooks:</h4>
                                <div className="space-y-2">
                                  {content.generatedContent.viralHooks.map((hook: string, index: number) => (
                                    <div key={index} className="flex items-start justify-between bg-purple-50 p-3 rounded">
                                      <span className="text-sm">{hook}</span>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => copyToClipboard(hook, `Hook ${index + 1}`)}
                                      >
                                        <Copy className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Platform Captions */}
                            {content.generatedContent.platformCaptions && (
                              <div className="space-y-2">
                                <h4 className="font-medium">Platform Captions:</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {Object.entries(content.generatedContent.platformCaptions).map(([platform, caption]: [string, any]) => (
                                    <div key={platform} className="bg-blue-50 p-3 rounded">
                                      <div className="flex items-center justify-between mb-2">
                                        <Badge variant="secondary" className="text-xs capitalize">
                                          {platform}
                                        </Badge>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => copyToClipboard(caption, `${platform} caption`)}
                                        >
                                          <Copy className="h-3 w-3" />
                                        </Button>
                                      </div>
                                      <p className="text-sm">{caption}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Hashtags */}
                            {content.generatedContent.hashtags && content.generatedContent.hashtags.length > 0 && (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium flex items-center gap-2">
                                    <Hash className="h-4 w-4" />
                                    Hashtags:
                                  </h4>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(content.generatedContent.hashtags.join(' '), 'All hashtags')}
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {content.generatedContent.hashtags.map((tag: string, index: number) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Affiliate Link */}
                            {content.affiliateLink && (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium">Affiliate Link:</h4>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(content.affiliateLink, 'Affiliate Link')}
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </div>
                                <div className="bg-green-50 p-3 rounded text-sm break-all">
                                  {content.affiliateLink}
                                </div>
                              </div>
                            )}

                            {/* Viral Inspiration */}
                            {content.viralInspiration && (
                              <div className="space-y-2">
                                <h4 className="font-medium flex items-center gap-2">
                                  <Zap className="h-4 w-4" />
                                  Viral Inspiration:
                                </h4>
                                <div className="bg-purple-50 p-3 rounded space-y-2">
                                  <p><strong>Hook:</strong> {content.viralInspiration.hook}</p>
                                  <p><strong>Format:</strong> {content.viralInspiration.format}</p>
                                  {content.viralInspiration.caption && (
                                    <p><strong>Caption:</strong> {content.viralInspiration.caption}</p>
                                  )}
                                  {content.viralInspiration.hashtags && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {content.viralInspiration.hashtags.map((tag: string, index: number) => (
                                        <Badge key={index} variant="outline" className="text-xs">
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