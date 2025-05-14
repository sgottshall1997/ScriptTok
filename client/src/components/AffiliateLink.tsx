import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ExternalLink, Copy, Check, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AffiliateLinkProps {
  niche: string;
  productName?: string;
}

const AffiliateLink: React.FC<AffiliateLinkProps> = ({ niche, productName = '' }) => {
  const [affiliateLink, setAffiliateLink] = useState('');
  const [useAffiliate, setUseAffiliate] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Generate Amazon search URL for the product
  const generateAmazonLink = () => {
    if (!productName.trim()) return '';
    
    const searchQuery = encodeURIComponent(productName.trim());
    return `https://www.amazon.com/s?k=${searchQuery}&tag=YOUR-AFFILIATE-ID`;
  };
  
  // Handle copy to clipboard
  const handleCopy = () => {
    if (!affiliateLink) return;
    
    navigator.clipboard.writeText(affiliateLink)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };
  
  // Get niche-specific tips for affiliate links
  const getAffiliateTips = () => {
    const nicheTips: Record<string, string> = {
      skincare: "Create detailed product reviews comparing ingredients, effectiveness, and value for money.",
      tech: "Focus on detailed specs, compatibility, and user experience in your tech reviews.",
      fashion: "Include style suggestions, size fit information, and seasonal trends.",
      fitness: "Emphasize benefits, durability, and how products fit into different workout routines.",
      food: "Discuss flavor profiles, cooking versatility, and health benefits.",
      travel: "Highlight durability, convenience, and how the product enhances travel experiences.",
      pet: "Focus on safety, durability, and benefits for both pets and owners."
    };
    
    return nicheTips[niche] || "Include detailed product information, benefits, and personal experiences in your content.";
  };

  return (
    <Card className="shadow-sm bg-white border border-gray-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Amazon Affiliate Link</CardTitle>
          <div className="flex items-center space-x-2">
            <Label htmlFor="use-affiliate" className="text-sm text-gray-500">
              Include Affiliate Link
            </Label>
            <Switch 
              id="use-affiliate" 
              checked={useAffiliate}
              onCheckedChange={setUseAffiliate}
            />
          </div>
        </div>
        <CardDescription>
          Add your Amazon affiliate link to monetize your content
        </CardDescription>
      </CardHeader>
      
      {useAffiliate && (
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="affiliate-link">Your Affiliate Link</Label>
              <div className="flex space-x-2">
                <Input
                  id="affiliate-link"
                  placeholder="https://www.amazon.com/product/B00X?tag=your-affiliate-id"
                  value={affiliateLink}
                  onChange={(e) => setAffiliateLink(e.target.value)}
                  className="flex-1"
                />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={handleCopy}
                        disabled={!affiliateLink}
                      >
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{copied ? "Copied!" : "Copy to clipboard"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <Button 
                  variant="outline" 
                  size="icon"
                  disabled={!productName}
                  onClick={() => productName && setAffiliateLink(generateAmazonLink())}
                >
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <ExternalLink size={16} />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Generate Amazon link</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Enter your full Amazon affiliate link or use the button to generate one
              </p>
            </div>
            
            <div className="bg-blue-50 border border-blue-100 rounded-md p-3 text-sm flex">
              <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
              <div className="text-blue-700">
                <p className="font-medium mb-1">Affiliate Tip for {niche.charAt(0).toUpperCase() + niche.slice(1)}</p>
                <p className="text-blue-600 text-xs">{getAffiliateTips()}</p>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default AffiliateLink;