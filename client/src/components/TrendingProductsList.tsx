import { FC, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingProduct, SOURCE_COLORS } from "@/lib/types";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface TrendingProductsListProps {
  products: TrendingProduct[];
  isLoading: boolean;
  niche?: string; // Optional niche filter
}

const TrendingProductsList: FC<TrendingProductsListProps> = ({ products, isLoading, niche }) => {
  // Generate placeholder products if needed for certain niches
  const generatePlaceholderProducts = (nicheName: string, count: number = 3): TrendingProduct[] => {
    const baseId = Math.floor(Math.random() * 10000);
    const placeholders: Record<string, string[]> = {
      tech: [
        "Latest iPhone 15 Pro Max", 
        "Samsung Galaxy Watch 5", 
        "Sony WH-1000XM5 Headphones", 
        "MacBook Air M2", 
        "Bose QuietComfort Earbuds II"
      ],
      fashion: [
        "Levi's 501 Original Fit Jeans", 
        "Nike Air Max 270 Sneakers", 
        "Ray-Ban Wayfarer Sunglasses",
        "Michael Kors Jet Set Tote Bag",
        "Casio G-Shock Watch"
      ],
      fitness: [
        "Fitbit Charge 5 Tracker",
        "Lululemon Align Leggings",
        "Nike Metcon 8 Training Shoes",
        "Hydro Flask Water Bottle",
        "TheraGun Elite Massage Gun"
      ],
      food: [
        "Ninja Foodi Smart XL Grill",
        "Vitamix Professional Blender",
        "Instant Pot Duo Plus",
        "Le Creuset Dutch Oven",
        "KitchenAid Stand Mixer"
      ],
      travel: [
        "Away Carry-On Luggage",
        "Bose QuietComfort 45 Headphones",
        "Peak Design Travel Backpack",
        "GoPro Hero11 Black",
        "Apple AirTag 4 Pack"
      ],
      pet: [
        "KONG Classic Dog Toy",
        "Furbo Dog Camera",
        "PetSafe Easy Walk Harness",
        "Catit Flower Water Fountain",
        "Furhaven Orthopedic Dog Bed"
      ]
    };
  
    // Only generate placeholders for niches with few or no matching products
    const suggestions = placeholders[nicheName] || [];
    if (!suggestions.length) return [];
  
    return suggestions.slice(0, count).map((title, idx) => ({
      id: baseId + idx,
      title: title,
      source: "suggested",
      mentions: Math.floor(Math.random() * 50000) + 10000,
      sourceUrl: "",
      createdAt: new Date().toISOString()
    }));
  };

  // Filter products by niche if provided
  const filteredProducts = niche 
    ? (Array.isArray(products) ? products : []).filter(product => {
        // Logic to determine if product is relevant to niche
        // For now, use a simple matching logic that can be improved later
        const nicheKeywords: Record<string, string[]> = {
          beauty: ['serum', 'cream', 'cleanser', 'mask', 'moisturizer', 'spf', 'sunscreen', 'facial', 'hydrating', 'exfoliating', 'collagen', 'makeup', 'lipstick', 'foundation'],
          tech: ['phone', 'laptop', 'gadget', 'device', 'smart', 'wireless', 'bluetooth', 'audio', 'charger', 'battery'],
          fashion: ['cloth', 'wear', 'apparel', 'outfit', 'style', 'fashion', 'accessory', 'bag', 'shoe', 'jewelry'],
          fitness: ['workout', 'fitness', 'exercise', 'protein', 'supplement', 'gym', 'muscle', 'training', 'vitamin', 'nutrition'],
          food: ['food', 'kitchen', 'cooking', 'recipe', 'meal', 'baking', 'blender', 'mixer', 'grill', 'pan'],
          travel: ['travel', 'luggage', 'backpack', 'outdoor', 'adventure', 'camping', 'hiking', 'portable', 'compact'],
          pet: ['pet', 'dog', 'cat', 'animal', 'treat', 'toy', 'grooming', 'leash', 'collar', 'food']
        };
        
        // If keywords exist for this niche, check if product title contains any of them
        const keywords = nicheKeywords[niche as keyof typeof nicheKeywords] || [];
        if (keywords.length === 0) return true; // If no keywords defined, include all products
        
        const productTitle = product.title.toLowerCase();
        return keywords.some(keyword => productTitle.includes(keyword.toLowerCase()));
      })
    : (Array.isArray(products) ? products : []);
    
  // If we have a niche, ensure we always have exactly 3 products
  const finalProducts = niche
    ? (filteredProducts.length > 0
        ? filteredProducts.slice(0, 3) // Limit to exactly 3 products
        : generatePlaceholderProducts(niche, 3)) // Use exactly 3 placeholders if needed
    : filteredProducts;
  const { toast } = useToast();

  // State for last refresh time and next scheduled refresh
  const [lastRefresh, setLastRefresh] = useState<string | null>(null);
  const [nextRefresh, setNextRefresh] = useState<string>("Midnight (12:00 AM)");

  const handleRefresh = async () => {
    try {
      const response = await apiRequest('POST', '/api/trending/refresh', {}) as any;
      
      // Update the last refresh time from the response
      if (response && response.lastRefresh) {
        setLastRefresh(response.lastRefresh);
      }
      
      // Update next scheduled refresh if available
      if (response && response.nextScheduledRefresh) {
        setNextRefresh(response.nextScheduledRefresh);
      }
      
      toast({
        title: "Trending products refreshed",
        description: "The latest trending products have been fetched. Next automatic refresh at midnight.",
      });
    } catch (error) {
      toast({
        title: "Error refreshing products",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const handleAddProductToForm = (product: string) => {
    // Find the product input field and set its value
    const productInput = document.getElementById('product') as HTMLInputElement;
    if (productInput) {
      productInput.value = product;
      productInput.focus();
    }
  };

  const getSourceColorClass = (source: string) => {
    if (source === "suggested") {
      return 'bg-indigo-100 text-indigo-800';
    }
    return SOURCE_COLORS[source as keyof typeof SOURCE_COLORS] || 'bg-gray-100 text-gray-800';
  };

  // Format large numbers with K/M suffix
  const formatNumber = (num: number = 0) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <Card className="shadow-xl bg-white/80 backdrop-blur-sm border border-gray-200">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-violet-50 rounded-t-lg border-b border-neutral-200 flex justify-between items-center py-5">
        <div>
          <CardTitle className="text-gradient bg-gradient-to-r from-blue-600 to-violet-600 font-bold text-xl">
            {niche 
              ? `${niche.charAt(0).toUpperCase() + niche.slice(1)} Trending Products` 
              : "Trending Products"}
          </CardTitle>
          <p className="text-sm text-gray-700">
            {niche 
              ? `Filtered for ${niche} niche from social media platforms` 
              : "Live data from social media platforms"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {niche && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {niche.charAt(0).toUpperCase() + niche.slice(1)}
            </span>
          )}
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <span className="mr-1.5 h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            Live
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        {isLoading ? (
          // Loading skeletons - exactly 3 for consistency
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="flex items-center bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                <Skeleton className="h-10 w-10 rounded-full mr-3" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : !niche ? (
          // State when no niche is selected yet
          <div className="text-center py-10 bg-white rounded-lg border border-dashed border-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-blue-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
            </svg>
            <p className="text-gray-700 text-lg font-medium mb-2">Select a content niche first</p>
            <p className="text-gray-500">Choose a niche and click "Get Trends" to see relevant trending products</p>
          </div>
        ) : products.length === 0 ? (
          // Empty state when no products at all
          <div className="text-center py-10 bg-white rounded-lg border border-dashed border-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-gray-700 text-lg font-medium mb-2">No trending products available</p>
            <p className="text-gray-500">Click the refresh button below to fetch the latest trends</p>
          </div>
        ) : finalProducts.length === 0 ? (
          // Empty state when no products match the filter
          <div className="text-center py-10 bg-white rounded-lg border border-dashed border-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-gray-700 text-lg font-medium mb-2">No products found for {niche} niche</p>
            <p className="text-gray-500">Try another niche or refresh to get more trending products</p>
          </div>
        ) : (
          // Trending products grid - using finalProducts
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {finalProducts.slice(0, 3).map((product, index) => (
              <div key={product.id} className="flex flex-col bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                <div className="flex items-center p-3 border-b border-gray-100">
                  <div className="bg-gradient-to-r from-blue-500 to-violet-500 text-white inline-flex items-center justify-center h-10 w-10 rounded-full flex-shrink-0 mr-3 shadow-sm">
                    <span className="text-sm font-bold">{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-800 truncate">{product.title}</p>
                    <div className="flex items-center mt-1">
                      <span className={`inline-block text-xs px-2 py-0.5 rounded ${getSourceColorClass(product.source)} mr-2`}>
                        {product.source.charAt(0).toUpperCase() + product.source.slice(1)}
                      </span>
                      <div className="text-xs text-neutral-500 truncate">
                        {formatNumber(product.mentions)} mentions
                      </div>
                    </div>
                    {/* Why it's hot */}
                    <div className="text-xs text-gray-600 mt-1 truncate">
                      {product.reason ? (product.reason.length > 50 ? product.reason.slice(0, 50) + '...' : product.reason) : 'Viral trend with social engagement'}
                    </div>
                  </div>
                </div>
                <div className="p-3 mt-auto flex justify-end bg-gray-50">
                  <button 
                    className="px-3 py-1.5 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 rounded-md font-medium flex items-center transition-colors"
                    onClick={() => handleAddProductToForm(product.title)}
                    title="Use this product"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Use Product
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="px-5 py-4 bg-gradient-to-r from-blue-50 to-violet-50 border-t border-neutral-200 flex flex-col items-center space-y-3">
        {/* Refresh status info */}
        <div className="text-xs text-gray-600 text-center">
          <p className="mb-1">
            <span className="font-medium">Data refresh policy:</span> Once daily at midnight
          </p>
          {lastRefresh && (
            <p className="text-green-600">
              <span className="mr-1">✓</span>
              Last refresh: {lastRefresh}
            </p>
          )}
          <p className="text-gray-500">
            <span className="mr-1">⏱</span>
            Next scheduled: {nextRefresh}
          </p>
        </div>
        
        {/* Manual refresh button */}
        <button 
          className="px-4 py-2 rounded-md bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white font-medium flex items-center transition-all shadow-md hover:shadow-lg"
          onClick={handleRefresh}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 animate-spin-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Now (Manual)
        </button>
      </CardFooter>
    </Card>
  );
};

export default TrendingProductsList;
