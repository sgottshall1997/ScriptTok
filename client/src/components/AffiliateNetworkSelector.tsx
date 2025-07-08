import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Copy, ExternalLink, DollarSign } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Network {
  id: string;
  name: string;
  commission: number;
  linkFormat: string;
}

interface AffiliateNetworkSelectorProps {
  productUrl?: string;
  product?: string;
  niche?: string;
  onLinkGenerated?: (data: any) => void;
}

export function AffiliateNetworkSelector({ 
  productUrl = '', 
  product = '', 
  niche = '',
  onLinkGenerated 
}: AffiliateNetworkSelectorProps) {
  const [networks, setNetworks] = useState<Network[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState('');
  const [affiliateId, setAffiliateId] = useState('');
  const [productUrlInput, setProductUrlInput] = useState(productUrl);
  const [generatedLink, setGeneratedLink] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchNetworks();
  }, []);

  const fetchNetworks = async () => {
    try {
      const response = await apiRequest('GET', '/api/affiliate-networks');
      const data = await response.json();
      if (data.success) {
        setNetworks(data.networks);
      }
    } catch (error) {
      console.error('Failed to fetch networks:', error);
    }
  };

  const generateAffiliateLink = async () => {
    if (!selectedNetwork || !affiliateId || !productUrlInput) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await apiRequest('POST', '/api/affiliate-networks/generate', {
        network: selectedNetwork,
        productUrl: productUrlInput,
        affiliateId,
        product,
        niche
      });

      const data = await response.json();
      if (data.success) {
        setGeneratedLink(data);
        if (onLinkGenerated) {
          onLinkGenerated(data);
        }
        toast({
          title: "Link generated",
          description: "Affiliate link created successfully"
        });
      }
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "Failed to generate affiliate link",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied",
        description: "Link copied to clipboard"
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      });
    }
  };

  const selectedNetworkData = networks.find(n => n.id === selectedNetwork);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-green-600" />
          Affiliate Network Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Affiliate Network</label>
            <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
              <SelectTrigger>
                <SelectValue placeholder="Select network" />
              </SelectTrigger>
              <SelectContent>
                {networks.map((network) => (
                  <SelectItem key={network.id} value={network.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{network.name}</span>
                      <Badge variant="secondary" className="ml-2">
                        {(network.commission * 100).toFixed(0)}%
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedNetworkData && (
              <p className="text-xs text-gray-500 mt-1">
                Commission: {(selectedNetworkData.commission * 100).toFixed(1)}%
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Your Affiliate ID</label>
            <Input
              placeholder="Your affiliate ID for this network"
              value={affiliateId}
              onChange={(e) => setAffiliateId(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Product URL</label>
            <Input
              placeholder="https://example.com/product"
              value={productUrlInput}
              onChange={(e) => setProductUrlInput(e.target.value)}
            />
          </div>

          <Button 
            onClick={generateAffiliateLink} 
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? "Generating..." : "Generate Affiliate Link"}
          </Button>
        </div>

        {generatedLink && (
          <div className="space-y-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-medium text-green-800">Generated Links</h3>
            
            <div className="space-y-2">
              <div>
                <label className="text-xs font-medium text-green-700">Trackable Redirect URL</label>
                <div className="flex items-center gap-2 mt-1">
                  <Input 
                    value={generatedLink.redirectUrl} 
                    readOnly 
                    className="bg-white"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(generatedLink.redirectUrl)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(generatedLink.redirectUrl, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-green-700">Direct Affiliate Link</label>
                <div className="flex items-center gap-2 mt-1">
                  <Input 
                    value={generatedLink.affiliateLink} 
                    readOnly 
                    className="bg-white"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(generatedLink.affiliateLink)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span>Network: {generatedLink.network}</span>
              <span>Commission: {generatedLink.commission}</span>
              <span>Est. Earnings: ${generatedLink.estimatedCommission.toFixed(2)}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}