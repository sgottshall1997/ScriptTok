import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import ContentGenerator from "@/components/ContentGenerator";
import ContentOutput from "@/components/ContentOutput";
import TrendingProductsList from "@/components/TrendingProductsList";
import { GenerationResponse, TrendingProduct } from "@/lib/types";
import { NICHES } from "@shared/constants";
import type { Niche } from "@shared/constants";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Niche-specific page information
const getNicheInfo = (nicheId: string) => {
  const nicheMap: Record<string, { title: string; description: string, bgClass: string, textClass: string }> = {
    skincare: {
      title: "Skincare & Beauty Content",
      description: "Create compelling content for beauty products, skincare routines, and cosmetics that resonates with your audience.",
      bgClass: "from-pink-50 to-purple-50",
      textClass: "from-pink-600 to-purple-600"
    },
    tech: {
      title: "Technology Content",
      description: "Generate engaging content for gadgets, electronics, software and tech innovations that drives conversions.",
      bgClass: "from-blue-50 to-cyan-50",
      textClass: "from-blue-600 to-cyan-600"
    },
    fashion: {
      title: "Fashion & Style Content",
      description: "Create stylish content for clothing, accessories, and fashion trends that captivates your audience.",
      bgClass: "from-purple-50 to-pink-50",
      textClass: "from-purple-600 to-pink-600"
    },
    fitness: {
      title: "Fitness & Wellness Content",
      description: "Generate motivational content for fitness products, workout gear, and wellness items that inspires your followers.",
      bgClass: "from-green-50 to-teal-50",
      textClass: "from-green-600 to-teal-600"
    },
    food: {
      title: "Food & Cooking Content",
      description: "Create appetizing content for kitchen gadgets, cooking tools, and food products that excites your audience.",
      bgClass: "from-orange-50 to-yellow-50",
      textClass: "from-orange-600 to-yellow-600"
    },
    travel: {
      title: "Travel & Adventure Content", 
      description: "Generate wanderlust-inspiring content for travel gear, accessories, and destination-related products.",
      bgClass: "from-sky-50 to-indigo-50",
      textClass: "from-sky-600 to-indigo-600"
    },
    pet: {
      title: "Pet Care Content",
      description: "Create heartwarming content for pet products, accessories, and care items that resonates with pet owners.",
      bgClass: "from-amber-50 to-orange-50",
      textClass: "from-amber-600 to-orange-600"
    }
  };

  return nicheMap[nicheId] || {
    title: "Content Generator",
    description: "Create AI-powered content for your niche products.",
    bgClass: "from-gray-50 to-gray-100",
    textClass: "from-gray-700 to-gray-800"
  };
};

export default function NichePage() {
  const params = useParams<{ niche: string }>();
  const [generatedContent, setGeneratedContent] = useState<GenerationResponse | null>(null);
  const [isRefreshingTrends, setIsRefreshingTrends] = useState(false);
  const { toast } = useToast();

  // Redirect to home if niche is invalid
  useEffect(() => {
    if (params.niche && !NICHES.includes(params.niche as Niche)) {
      window.location.href = "/";
    }
  }, [params.niche]);

  // Get niche information for display
  const nicheInfo = getNicheInfo(params.niche);

  // Fetch trending products
  const { data: trendingProducts = [], isLoading: isLoadingTrending } = useQuery<TrendingProduct[]>({
    queryKey: ['/api/trending'],
  });

  // Function to refresh trending products
  const refreshTrendingProducts = async () => {
    try {
      setIsRefreshingTrends(true);
      await apiRequest('POST', '/api/trending/refresh', {});
      // Invalidate the trending products query to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/trending'] });
      
      toast({
        title: `${params.niche.charAt(0).toUpperCase() + params.niche.slice(1)} trends refreshed`,
        description: "The latest trending products have been fetched.",
      });
    } catch (error) {
      toast({
        title: "Error refreshing trends",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsRefreshingTrends(false);
    }
  };

  const handleContentGenerated = (response: GenerationResponse) => {
    setGeneratedContent(response);
  };

  if (!params.niche || !NICHES.includes(params.niche as Niche)) {
    return <div>Loading...</div>;
  }

  return (
    <div className="px-4 py-6 md:px-6 lg:px-8 min-h-screen bg-gray-50">
      {/* Header */}
      <div className={`rounded-lg bg-gradient-to-r ${nicheInfo.bgClass} p-8 mb-8 shadow-md border border-gray-200`}>
        <h1 className={`text-3xl font-bold text-gradient bg-gradient-to-r ${nicheInfo.textClass} mb-3`}>
          {nicheInfo.title}
        </h1>
        <p className="text-gray-700 text-lg max-w-3xl">
          {nicheInfo.description}
        </p>
        <div className="mt-6">
          <button 
            onClick={refreshTrendingProducts}
            disabled={isRefreshingTrends}
            className={`px-5 py-2.5 rounded-md bg-gradient-to-r from-${params.niche === 'skincare' ? 'pink' : params.niche === 'tech' ? 'blue' : params.niche === 'fashion' ? 'purple' : params.niche === 'fitness' ? 'green' : params.niche === 'food' ? 'orange' : params.niche === 'travel' ? 'sky' : params.niche === 'pet' ? 'amber' : 'gray'}-600 to-${params.niche === 'skincare' ? 'purple' : params.niche === 'tech' ? 'cyan' : params.niche === 'fashion' ? 'pink' : params.niche === 'fitness' ? 'teal' : params.niche === 'food' ? 'yellow' : params.niche === 'travel' ? 'indigo' : params.niche === 'pet' ? 'orange' : 'gray'}-600 hover:opacity-90 text-white font-medium flex items-center transition-all shadow-md hover:shadow-lg`}
          >
            {isRefreshingTrends ? (
              <>
                <svg className="animate-spin mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Fetching Trends...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Get Latest {params.niche.charAt(0).toUpperCase() + params.niche.slice(1)} Trends
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* Trending Products */}
          <TrendingProductsList 
            products={trendingProducts || []} 
            isLoading={isLoadingTrending || isRefreshingTrends}
            niche={params.niche}
          />
        </div>
        
        <div className="space-y-6">
          {/* Content Generator */}
          <ContentGenerator 
            onGenerate={handleContentGenerated} 
            initialNiche={params.niche as Niche}
          />
          
          {/* Content Output */}
          <ContentOutput content={generatedContent} />
        </div>
      </div>
    </div>
  );
}