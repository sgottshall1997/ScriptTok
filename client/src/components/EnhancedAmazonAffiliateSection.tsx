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

// Featured products with descriptions
const featuredProducts = {
  skincare: [
    {
      name: "Mighty Patch",
      url: "https://www.amazon.com/dp/B07YPBX9Y7?tag=sgottshall199-20",
      description: "Helps zap zits overnight with hydrocolloid technology.",
      emoji: "✨"
    }
  ],
  tech: [
    {
      name: "Apple Watch SE (2nd Gen)",
      url: "https://www.amazon.com/dp/B0BDJG949Z?tag=sgottshall199-20",
      description: "Advanced health monitoring with fitness tracking capabilities.",
      emoji: "⌚"
    }
  ],
  fashion: [
    {
      name: "Costaric Shirt Dress",
      url: "https://www.amazon.com/dp/B0BLC7S4JY?tag=sgottshall199-20",
      description: "Stylish and comfortable everyday wear with modern design.",
      emoji: "👗"
    }
  ],
  fitness: [
    {
      name: "Hex Dumbbells",
      url: "https://www.amazon.com/dp/B074DY6VJ4?tag=sgottshall199-20",
      description: "Solid grip, rubber-coated, perfect for home workouts.",
      emoji: "🏋️"
    }
  ],
  kitchen: [
    {
      name: "8 QT Air Fryer",
      url: "https://www.amazon.com/dp/B0C6WR7M9M?tag=sgottshall199-20",
      description: "Large capacity air fryer for healthy, crispy cooking.",
      emoji: "🍳"
    }
  ],
  travel: [
    {
      name: "Packing Cubes Set",
      url: "https://www.amazon.com/dp/B01E7AVSKG?tag=sgottshall199-20",
      description: "Organize your luggage efficiently with compression cubes.",
      emoji: "🧳"
    }
  ],
  pets: [
    {
      name: "Chik 'n Hide Twists",
      url: "https://www.amazon.com/dp/B01CPJ38RY?tag=sgottshall199-20",
      description: "Healthy dog treats that clean teeth while satisfying chew instincts.",
      emoji: "🐕"
    }
  ]
};

export function EnhancedAmazonAffiliateSection() {
  const [selectedNiche, setSelectedNiche] = useState<string>("skincare");
  const [copiedLink, setCopiedLink] = useState<string>("");
  const { toast } = useToast();

  const niches = [
    { value: "skincare", label: "Skincare", emoji: "✨" },
    { value: "tech", label: "Tech", emoji: "⚡" },
    { value: "fashion", label: "Fashion", emoji: "👗" },
    { value: "fitness", label: "Fitness", emoji: "💪" },
    { value: "kitchen", label: "Kitchen", emoji: "🍳" },
    { value: "travel", label: "Travel", emoji: "✈️" },
    { value: "pets", label: "Pets", emoji: "🐾" }
  ];

  const { data: affiliateData, isLoading } = useQuery<AmazonLinksResponse>({
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

  const currentFeatured = featuredProducts[selectedNiche as keyof typeof featuredProducts] || [];

  return (
    <Card className="shadow-lg bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold text-orange-800 flex items-center gap-2">
          🔥 Top Affiliate Picks by Category
        </CardTitle>
        <CardDescription className="text-orange-700 text-base">
          Select a category to explore useful products with our affiliate links!
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Category Selector */}
        <div className="space-y-3">
          <label htmlFor="category-select" className="text-sm font-semibold text-orange-800">
            Choose Category:
          </label>
          <Select value={selectedNiche} onValueChange={setSelectedNiche}>
            <SelectTrigger id="category-select" className="bg-white border-orange-200 focus:border-orange-400">
              <SelectValue placeholder="Select a category..." />
            </SelectTrigger>
            <SelectContent>
              {niches.map((niche) => (
                <SelectItem key={niche.value} value={niche.value}>
                  <span className="flex items-center gap-2">
                    {niche.emoji} {niche.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Featured Products Section */}
        {currentFeatured.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-orange-800 capitalize">
              {niches.find(n => n.value === selectedNiche)?.emoji} {selectedNiche} Picks
            </h3>
            
            {currentFeatured.map((product, index) => (
              <div 
                key={index}
                className="bg-white rounded-lg p-4 border border-orange-100 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-green-600 font-bold">✅</span>
                      <h4 className="font-semibold text-gray-900">{product.name}</h4>
                    </div>
                    <div className="flex items-start gap-2 mb-3">
                      <span className="text-lg">{product.emoji}</span>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        <span className="font-medium">Why we like it:</span> {product.description}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 font-mono break-all">
                      {product.url}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(product.url, product.name)}
                      className="flex items-center gap-1 bg-orange-50 border-orange-200 hover:bg-orange-100"
                    >
                      {copiedLink === product.url ? (
                        <Check size={14} className="text-green-600" />
                      ) : (
                        <Copy size={14} />
                      )}
                      <span className="text-xs">
                        {copiedLink === product.url ? 'Copied!' : 'Copy'}
                      </span>
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => openLink(product.url)}
                      className="flex items-center gap-1 bg-orange-600 hover:bg-orange-700"
                    >
                      <ExternalLink size={14} />
                      <span className="text-xs">View on Amazon</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* API Data Display */}
        {isLoading && (
          <div className="flex items-center justify-center py-6">
            <div className="text-sm text-orange-600">Loading more products...</div>
          </div>
        )}

        {affiliateData && affiliateData.links && affiliateData.links.length > 1 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-orange-700">
              More {affiliateData.niche} products:
            </h4>
            {affiliateData.links.slice(1).map((link, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 bg-white rounded-md border border-orange-100"
              >
                <div className="flex-1">
                  <p className="font-medium text-sm text-gray-900">{link.product}</p>
                  <p className="text-xs text-gray-500 truncate max-w-sm font-mono">
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
                      <Check size={14} className="text-green-600" />
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
      </CardContent>
    </Card>
  );
}