import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Webhook, Eye, EyeOff, Copy, Check, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WebhookPayload {
  event_type: string;
  platform: string;
  niche: string;
  script: string;
  instagramCaption: string;
  tiktokCaption: string;
  youtubeCaption: string;
  xCaption: string;
  facebookCaption: string;
  affiliateLink: string;
  product: string;
  imageUrl: string;
  tone: string;
  template: string;
  postType: string;
  timestamp: string;
}

interface WebhookDebugPanelProps {
  lastPayload?: WebhookPayload;
}

const WebhookDebugPanel: React.FC<WebhookDebugPanelProps> = ({ lastPayload }) => {
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [storedPayloads, setStoredPayloads] = useState<WebhookPayload[]>([]);

  // Load stored payloads from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('webhook-debug-payloads');
    if (stored) {
      try {
        setStoredPayloads(JSON.parse(stored));
      } catch (error) {
        console.warn('Failed to parse stored webhook payloads:', error);
      }
    }
  }, []);

  // Save new payload to localStorage
  useEffect(() => {
    if (lastPayload && !storedPayloads.find(p => p.timestamp === lastPayload.timestamp)) {
      const updated = [lastPayload, ...storedPayloads.slice(0, 4)]; // Keep last 5
      setStoredPayloads(updated);
      localStorage.setItem('webhook-debug-payloads', JSON.stringify(updated));
    }
  }, [lastPayload, storedPayloads]);

  const copyPayload = async (payload: WebhookPayload) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied!",
        description: "Webhook payload copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const clearStoredPayloads = () => {
    setStoredPayloads([]);
    localStorage.removeItem('webhook-debug-payloads');
    toast({
      title: "Cleared",
      description: "All stored webhook payloads cleared",
    });
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getPayloadPreview = (payload: WebhookPayload) => {
    return {
      niche: payload.niche,
      product: payload.product.substring(0, 30) + (payload.product.length > 30 ? '...' : ''),
      script: payload.script.substring(0, 50) + (payload.script.length > 50 ? '...' : ''),
      hasAffiliate: !!payload.affiliateLink
    };
  };

  const mostRecentPayload = storedPayloads[0] || lastPayload;

  if (!mostRecentPayload && storedPayloads.length === 0) {
    return (
      <Card className="border-dashed border-gray-300">
        <CardHeader className="text-center py-8">
          <Webhook className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <CardTitle className="text-gray-600">No Webhook Payloads Yet</CardTitle>
          <CardDescription>
            Generate content to see webhook payloads sent to Make.com
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Webhook className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-blue-900">Webhook Debug Panel</CardTitle>
            <Badge variant="outline" className="text-blue-700 border-blue-300">
              {storedPayloads.length} payload{storedPayloads.length !== 1 ? 's' : ''}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="border-blue-300 text-blue-700"
            >
              {isExpanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {isExpanded ? 'Hide' : 'Show'} Details
            </Button>
            {storedPayloads.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearStoredPayloads}
                className="border-red-300 text-red-700"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>
        <CardDescription>
          Last webhook payload sent to Make.com • Click to view details
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Most Recent Payload Summary */}
        {mostRecentPayload && (
          <div className="bg-white border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-blue-900">Latest Payload</h4>
              <div className="flex gap-2">
                <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                  {mostRecentPayload.event_type}
                </Badge>
                <span className="text-xs text-gray-500">
                  {formatTimestamp(mostRecentPayload.timestamp)}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
              <div>
                <span className="font-medium text-gray-700">Platform:</span>
                <p className="text-purple-700 capitalize">{mostRecentPayload.platform}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Niche:</span>
                <p className="text-blue-700">{mostRecentPayload.niche}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Product:</span>
                <p className="text-gray-900 truncate">{getPayloadPreview(mostRecentPayload).product}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Script:</span>
                <p className="text-gray-600 truncate">{getPayloadPreview(mostRecentPayload).script}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Affiliate:</span>
                <Badge variant={getPayloadPreview(mostRecentPayload).hasAffiliate ? "default" : "secondary"}>
                  {getPayloadPreview(mostRecentPayload).hasAffiliate ? 'Yes' : 'No'}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Expanded Details */}
        {isExpanded && mostRecentPayload && (
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-auto max-h-96">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-300">// Full JSON Payload</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyPayload(mostRecentPayload)}
                className="text-green-400 hover:text-green-300 hover:bg-gray-800"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
            <pre className="whitespace-pre-wrap">
              {JSON.stringify(mostRecentPayload, null, 2)}
            </pre>
          </div>
        )}

        {/* Recent Payloads List */}
        {storedPayloads.length > 1 && (
          <div>
            <h4 className="font-medium text-blue-900 mb-2">Recent Payloads</h4>
            <div className="space-y-2">
              {storedPayloads.slice(1, 4).map((payload, index) => (
                <div key={payload.timestamp} className="bg-white border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-4 text-sm">
                      <Badge variant="outline" className="text-purple-700 border-purple-300 capitalize">
                        {payload.platform}
                      </Badge>
                      <span className="font-medium">{payload.niche}</span>
                      <span className="text-gray-600">{getPayloadPreview(payload).product}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(payload.timestamp)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyPayload(payload)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WebhookDebugPanel;