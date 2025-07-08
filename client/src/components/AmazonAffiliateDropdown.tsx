import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, ExternalLink, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AffiliateLink {
  product: string;
  url: string;
}

interface AmazonLinksResponse {
  niche: string;
  links: AffiliateLink[];
}

export function AmazonAffiliateDropdown() {
  const [selectedNiche, setSelectedNiche] = useState<string>("");
  const [copiedLink, setCopiedLink] = useState<string>("");
  const { toast } = useToast();

  const niches = [
    { value: "beauty", label: "Beauty & Personal Care" },
    { value: "tech", label: "Tech" },
    { value: "fashion", label: "Fashion" },
    { value: "fitness", label: "Fitness" },
    { value: "kitchen", label: "Kitchen" },
    { value: "travel", label: "Travel" },
    { value: "pets", label: "Pets" }
  ];

  const { data: affiliateData, isLoading, error } = useQuery<AmazonLinksResponse>({
    queryKey: ['/api/amazon-links', selectedNiche],
    enabled: !!selectedNiche,
    queryFn: async () => {
      const response = await fetch(`/api/amazon-links?niche=${selectedNiche}`);
      if (!response.ok) {
        throw new Error('Failed to fetch affiliate links');
      }
      return response.json();
    }
  });

  const copyToClipboard = async (url: string, product: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(url);
      toast({
        title: "Link copied!",
        description: `${product} affiliate link copied to clipboard`,
      });
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopiedLink(""), 2000);
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Could not copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  const openLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card className="shadow-sm bg-white border border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Get Amazon Affiliate Link</CardTitle>
        <CardDescription>
          Select a niche to get pre-configured Amazon affiliate links with your tracking ID
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="niche-select" className="text-sm font-medium">
            Select Niche
          </label>
          <Select value={selectedNiche} onValueChange={setSelectedNiche}>
            <SelectTrigger id="niche-select">
              <SelectValue placeholder="Choose a niche..." />
            </SelectTrigger>
            <SelectContent>
              {niches.map((niche) => (
                <SelectItem key={niche.value} value={niche.value}>
                  {niche.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading && selectedNiche && (
          <div className="flex items-center justify-center py-4">
            <div className="text-sm text-gray-500">Loading affiliate links...</div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">
              Failed to load affiliate links. Please try again.
            </p>
          </div>
        )}

        {affiliateData && affiliateData.links && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">
              Available Products for {affiliateData.niche}:
            </h4>
            {affiliateData.links.map((link, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-md border"
              >
                <div className="flex-1">
                  <p className="font-medium text-sm">{link.product}</p>
                  <p className="text-xs text-gray-500 truncate max-w-sm">
                    {link.url}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(link.url, link.product)}
                    className="flex items-center space-x-1"
                  >
                    {copiedLink === link.url ? (
                      <Check size={14} />
                    ) : (
                      <Copy size={14} />
                    )}
                    <span className="text-xs">
                      {copiedLink === link.url ? 'Copied' : 'Copy'}
                    </span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openLink(link.url)}
                    className="flex items-center space-x-1"
                  >
                    <ExternalLink size={14} />
                    <span className="text-xs">View</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedNiche && !isLoading && !error && !affiliateData && (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">
              No affiliate links found for this niche.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}