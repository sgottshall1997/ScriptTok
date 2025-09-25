import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { LinkIcon, DollarSign, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";

interface ProductMatch {
  productName: string;
  amazonProduct: {
    id: number;
    title: string;
    price: number;
    rating: number;
    reviewCount: number;
    brand: string;
    niche: string;
  };
  affiliateLink: {
    id: number;
    trackingId: string;
    affiliateUrl: string;
  };
  position: number;
}

interface InjectionResult {
  originalContent: string;
  processedContent: string;
  linksInjected: number;
  productMatches: ProductMatch[];
  warnings: string[];
}

export function AffiliateLinkInjector() {
  const [content, setContent] = useState("");
  const [processedContent, setProcessedContent] = useState("");
  const [contentId, setContentId] = useState(1);
  const [contentType, setContentType] = useState("social_post");
  const [userId, setUserId] = useState(1);
  const [niche, setNiche] = useState("");
  const [maxLinks, setMaxLinks] = useState(3);
  const [onlyFirstMention, setOnlyFirstMention] = useState(false);
  const [skipIfExists, setSkipIfExists] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [injectionResult, setInjectionResult] = useState<InjectionResult | null>(null);
  const { toast } = useToast();

  const niches = ["beauty", "tech", "fashion", "fitness", "food", "travel", "pets"];
  const contentTypes = ["social_post", "blog_article", "product_review", "recipe", "tutorial"];

  const handleInjectLinks = async () => {
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Please enter some content to process",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      const response = await apiRequest('/api/affiliate/inject-links', {
        method: 'POST',
        body: JSON.stringify({
          content: content.trim(),
          contentId,
          contentType,
          userId,
          niche: niche || undefined,
          maxLinksPerContent: maxLinks,
          onlyFirstMention,
          skipIfExists
        })
      });

      if (response.success) {
        const result = response.data as InjectionResult;
        setInjectionResult(result);
        setProcessedContent(result.processedContent);
        
        toast({
          title: "Success!",
          description: `Injected ${result.linksInjected} affiliate links successfully`
        });
      } else {
        throw new Error(response.error || 'Failed to inject affiliate links');
      }
    } catch (error) {
      console.error('Affiliate injection error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to inject affiliate links",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyProcessedContent = () => {
    navigator.clipboard.writeText(processedContent);
    toast({
      title: "Copied!",
      description: "Processed content copied to clipboard"
    });
  };

  return (
    <div className="space-y-6" data-testid="affiliate-link-injector">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            Smart Affiliate Link Injection
          </CardTitle>
          <CardDescription>
            Automatically convert product mentions in your content into tracked affiliate links
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Configuration Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="content-id">Content ID</Label>
              <Input
                id="content-id"
                type="number"
                value={contentId}
                onChange={(e) => setContentId(parseInt(e.target.value) || 1)}
                data-testid="input-content-id"
              />
            </div>
            
            <div>
              <Label htmlFor="content-type">Content Type</Label>
              <Select value={contentType} onValueChange={setContentType}>
                <SelectTrigger data-testid="select-content-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {contentTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type.replace('_', ' ').toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="user-id">User ID</Label>
              <Input
                id="user-id"
                type="number"
                value={userId}
                onChange={(e) => setUserId(parseInt(e.target.value) || 1)}
                data-testid="input-user-id"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="niche">Niche Filter (Optional)</Label>
              <Select value={niche} onValueChange={setNiche}>
                <SelectTrigger data-testid="select-niche">
                  <SelectValue placeholder="All niches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All niches</SelectItem>
                  {niches.map(n => (
                    <SelectItem key={n} value={n}>
                      {n.charAt(0).toUpperCase() + n.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="max-links">Max Links Per Content</Label>
              <Input
                id="max-links"
                type="number"
                min="1"
                max="10"
                value={maxLinks}
                onChange={(e) => setMaxLinks(parseInt(e.target.value) || 3)}
                data-testid="input-max-links"
              />
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="only-first"
                checked={onlyFirstMention}
                onCheckedChange={setOnlyFirstMention}
                data-testid="switch-only-first"
              />
              <Label htmlFor="only-first">Only first mention</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="skip-existing"
                checked={skipIfExists}
                onCheckedChange={setSkipIfExists}
                data-testid="switch-skip-existing"
              />
              <Label htmlFor="skip-existing">Skip if links exist</Label>
            </div>
          </div>

          <Separator />

          {/* Content Input */}
          <div>
            <Label htmlFor="content">Content to Process</Label>
            <Textarea
              id="content"
              placeholder="Enter your content here. Mention products like 'Sony WH-1000XM5 headphones', 'The Ordinary Niacinamide', 'Lululemon Align Leggings' etc."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="mt-2"
              data-testid="textarea-content"
            />
          </div>

          <Button 
            onClick={handleInjectLinks} 
            disabled={isProcessing || !content.trim()}
            className="w-full"
            data-testid="button-inject-links"
          >
            {isProcessing ? "Processing..." : "Inject Affiliate Links"}
          </Button>
        </CardContent>
      </Card>

      {/* Results Section */}
      {injectionResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Injection Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {injectionResult.linksInjected}
                </div>
                <div className="text-sm text-green-700 dark:text-green-300">Links Injected</div>
              </div>
              
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {injectionResult.productMatches.length}
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300">Product Matches</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {injectionResult.warnings.length}
                </div>
                <div className="text-sm text-purple-700 dark:text-purple-300">Warnings</div>
              </div>
            </div>

            {/* Product Matches */}
            {injectionResult.productMatches.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Successfully Matched Products
                </h4>
                <div className="space-y-2">
                  {injectionResult.productMatches.map((match, index) => (
                    <div key={index} className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium">{match.productName}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            → {match.amazonProduct.title}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary">{match.amazonProduct.niche}</Badge>
                            <Badge variant="outline">{match.amazonProduct.brand}</Badge>
                            <div className="text-sm text-gray-500">
                              ${match.amazonProduct.price} • ⭐ {match.amazonProduct.rating} ({match.amazonProduct.reviewCount} reviews)
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 ml-4">
                          Position: {match.position}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Warnings */}
            {injectionResult.warnings.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Warnings:</strong>
                  <ul className="list-disc list-inside mt-1">
                    {injectionResult.warnings.map((warning, index) => (
                      <li key={index} className="text-sm">{warning}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Processed Content */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label htmlFor="processed-content">Processed Content</Label>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={copyProcessedContent}
                  data-testid="button-copy-content"
                >
                  Copy Content
                </Button>
              </div>
              <Textarea
                id="processed-content"
                value={processedContent}
                readOnly
                rows={8}
                className="bg-gray-50 dark:bg-gray-800"
                data-testid="textarea-processed-content"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}