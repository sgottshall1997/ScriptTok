import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, ExternalLink, Check, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AffiliateLink {
  product: string;
  url: string;
}

interface AmazonLinksResponse {
  niche: string;
  links: AffiliateLink[];
}

// Pre-cached content for each category
const cachedContent = {
  skincare: {
    title: "✨ Skincare Routine That Actually Works",
    content: `Ready to glow up? Here's your science-backed skincare routine:

🌅 MORNING:
• Gentle cleanser to remove overnight buildup
• Vitamin C serum for antioxidant protection
• Lightweight moisturizer with SPF 30+

🌙 EVENING:
• Double cleanse (oil + water-based)
• Retinol or retinoid (start 2x/week)
• Rich night moisturizer to repair overnight

💡 Pro tip: The Mighty Patch is perfect for those surprise breakouts - it draws out impurities while you sleep!

Remember: Consistency beats expensive products every time. Start simple, be patient, and your skin will thank you! ✨`,
    hashtags: "#skincare #glowup #selfcare #beautyRoutine #healthySkin"
  },
  tech: {
    title: "⚡ Tech Essentials for 2025",
    content: `Level up your tech game with these must-haves:

📱 PRODUCTIVITY POWERHOUSES:
• Apple Watch SE - Health tracking meets smart notifications
• Wireless earbuds for seamless calls and music
• Fast charging cables that actually last

🏠 HOME TECH UPGRADES:
• Smart home devices for convenience
• Quality webcam for remote work
• Portable chargers for on-the-go power

💡 Tech tip: Invest in quality accessories - they often outlast the devices themselves!

The Apple Watch SE offers premium features at a more accessible price point. Perfect for fitness tracking and staying connected! ⌚`,
    hashtags: "#tech #gadgets #productivity #smartHome #techReview"
  },
  fashion: {
    title: "👗 Effortless Style Guide",
    content: `Build a wardrobe that works for every occasion:

👔 CAPSULE WARDROBE ESSENTIALS:
• Classic shirt dress (like Costaric) - dress up or down
• Well-fitted jeans in dark wash
• Versatile blazer for instant polish

🎨 STYLING SECRETS:
• Stick to 3-color palette per outfit
• Invest in quality basics, have fun with trends
• Accessories can transform any look

💡 Style tip: The shirt dress is your secret weapon - works for brunch, office, or date night with the right styling!

Quality over quantity always wins. Build slowly, choose pieces you genuinely love! 👗`,
    hashtags: "#fashion #style #wardrobe #outfitIdeas #fashionTips"
  },
  fitness: {
    title: "💪 Home Workout Revolution",
    content: `Transform your fitness routine at home:

🏋️ ESSENTIAL EQUIPMENT:
• Hex dumbbells for strength training
• Resistance bands for versatile workouts
• Quality yoga mat for floor exercises

📅 WEEKLY WORKOUT SPLIT:
• Monday: Upper body strength
• Wednesday: Lower body + core
• Friday: Full body circuit
• Weekend: Active recovery (yoga, walks)

💡 Fitness tip: Start with bodyweight exercises, then add equipment as you progress!

Hex dumbbells are perfect for home gyms - the shape prevents rolling and the rubber coating protects your floors. Start with lighter weights and focus on form! 🏋️`,
    hashtags: "#fitness #homeWorkout #strength #healthyLifestyle #fitnessMotivation"
  },
  kitchen: {
    title: "🍳 Kitchen Game Changers",
    content: `Upgrade your cooking with these essentials:

👨‍🍳 MUST-HAVE APPLIANCES:
• 8 QT Air Fryer for healthy, crispy meals
• Quality knife set for efficient prep
• Non-stick cookware that actually lasts

🥗 MEAL PREP MASTERY:
• Glass containers for storage
• Prep vegetables on Sunday
• Batch cook proteins and grains

💡 Cooking tip: The air fryer isn't just for fries - try roasted vegetables, chicken, even baked goods!

Large capacity air fryers like the 8 QT model are perfect for families or meal prep. Crispy results with 75% less oil! 🍳`,
    hashtags: "#cooking #kitchen #mealPrep #healthyEating #airFryer"
  },
  travel: {
    title: "✈️ Smart Travel Hacks",
    content: `Pack like a pro and travel stress-free:

🧳 PACKING ESSENTIALS:
• Compression packing cubes to maximize space
• Portable charger for all your devices
• Versatile clothing that mixes and matches

🗺️ TRAVEL PRODUCTIVITY:
• Download offline maps before you go
• Pack a portable WiFi hotspot
• Keep important documents in cloud storage

💡 Travel tip: Packing cubes aren't just organizers - compression ones can increase luggage space by 30%!

The right packing system transforms chaotic suitcases into organized travel experiences. Invest in quality cubes that compress! 🧳`,
    hashtags: "#travel #packing #travelTips #wanderlust #travelHacks"
  },
  pets: {
    title: "🐾 Happy Pet, Happy Life",
    content: `Keep your furry friends healthy and entertained:

🐕 DAILY CARE ESSENTIALS:
• High-quality treats like Chik 'n Hide Twists
• Interactive toys for mental stimulation
• Regular grooming routine

🎾 ENRICHMENT IDEAS:
• Puzzle feeders to slow eating
• Rotating toy selection to prevent boredom
• Training sessions for bonding

💡 Pet tip: Dental chews like Chik 'n Hide Twists serve dual purposes - dental health and satisfying natural chew instincts!

Mental stimulation is just as important as physical exercise for pets. Keep those tails wagging with engaging activities! 🐕`,
    hashtags: "#pets #dogCare #petHealth #petToys #happyPets"
  }
};

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
  const [showContent, setShowContent] = useState<boolean>(false);
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

  const generateContent = () => {
    setShowContent(true);
    toast({
      title: "Content generated!",
      description: `${niches.find(n => n.value === selectedNiche)?.emoji} ${selectedNiche} content is ready to use`,
    });
  };

  const currentFeatured = featuredProducts[selectedNiche as keyof typeof featuredProducts] || [];
  const currentContent = cachedContent[selectedNiche as keyof typeof cachedContent];

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

        {/* Generate Content Button */}
        <div className="flex justify-center">
          <Button 
            onClick={generateContent}
            className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-6 py-2 flex items-center gap-2"
          >
            <Sparkles size={18} />
            Generate {niches.find(n => n.value === selectedNiche)?.emoji} {selectedNiche} Content
          </Button>
        </div>

        {/* Generated Content Display */}
        {showContent && currentContent && (
          <div className="bg-gray-800 rounded-lg p-6 border border-orange-200 shadow-sm">
            <h3 className="text-xl font-bold text-white mb-4">{currentContent.title}</h3>
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap text-gray-200 font-sans leading-relaxed">
                {currentContent.content}
              </pre>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-600">
              <div className="flex items-center justify-between">
                <p className="text-sm text-blue-400 font-medium">{currentContent.hashtags}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(currentContent.content + '\n\n' + currentContent.hashtags, 'content')}
                  className="flex items-center gap-1 bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                >
                  <Copy size={14} />
                  Copy Content
                </Button>
              </div>
            </div>
          </div>
        )}

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