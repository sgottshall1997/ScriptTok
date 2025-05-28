import { FC, useState } from 'react';
import ContentGenerator from '@/components/ContentGenerator';
import MultiPlatformContentOutput from '@/components/MultiPlatformContentOutput';
import { GenerationResponse, DashboardTrendingResponse, TrendingProduct } from '@/lib/types';
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingProductCard } from "@/components/TrendingProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

// Niche data
const niches = [
  { id: 'skincare', name: 'Skincare', icon: '✨', color: 'from-pink-400 to-rose-500' },
  { id: 'tech', name: 'Tech', icon: '📱', color: 'from-blue-400 to-indigo-500' },
  { id: 'fashion', name: 'Fashion', icon: '👗', color: 'from-purple-400 to-pink-500' },
  { id: 'fitness', name: 'Fitness', icon: '💪', color: 'from-green-400 to-emerald-500' },
  { id: 'food', name: 'Food', icon: '🍳', color: 'from-orange-400 to-red-500' },
  { id: 'travel', name: 'Travel', icon: '✈️', color: 'from-cyan-400 to-blue-500' },
  { id: 'pet', name: 'Pet', icon: '🐾', color: 'from-yellow-400 to-orange-500' }
];

const GenerateContent: FC = () => {
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [isMultiPlatform, setIsMultiPlatform] = useState(false);

  // Fetch trending products for all niches
  const { data: trendingProducts, isLoading: trendingLoading } = useQuery<DashboardTrendingResponse>({
    queryKey: ['/api/trending'],
    retry: false,
  });

  const handleGenerate = (content: any) => {
    console.log('Generated content received:', content);
    setGeneratedContent(content);
    
    // Check if this is multi-platform content
    if (content.platformContent && content.metadata) {
      setIsMultiPlatform(true);
    } else {
      setIsMultiPlatform(false);
    }
  };

  // Safely access trending products with defaults
  const nicheProducts: Record<string, TrendingProduct[]> = {};
  
  // Prepare niche products with proper fallbacks for each niche
  niches.forEach(niche => {
    if (trendingProducts?.data && trendingProducts.data[niche.id]) {
      nicheProducts[niche.id] = trendingProducts.data[niche.id];
    } else {
      nicheProducts[niche.id] = [];
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent mb-4">
            AI Content Generator
          </h1>
          <p className="text-gray-600 text-lg">
            Create optimized, multi-platform content with AI intelligence
          </p>
        </div>

        {/* Browse Products by Niche */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">Browse Trending Products</h2>
              <p className="text-muted-foreground">
                Select a niche to explore trending products and generate content for them.
              </p>
            </div>
            
            <Tabs defaultValue="skincare" className="w-full">
              <TabsList className="grid grid-cols-4 md:grid-cols-7 mb-6 h-auto p-1">
                {niches.map(niche => (
                  <TabsTrigger 
                    key={niche.id} 
                    value={niche.id}
                    className="text-xs md:text-sm flex flex-col md:flex-row items-center gap-1 md:gap-2 py-3 px-2 md:px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <span className="text-lg md:text-base">{niche.icon}</span>
                    <span className="text-xs md:text-sm font-medium">{niche.name}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {niches.map(niche => (
                <TabsContent key={niche.id} value={niche.id} className="mt-6">
                  <div className="space-y-4">
                    {/* Niche Header */}
                    <div className="flex items-center gap-3 pb-4 border-b">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${niche.color} flex items-center justify-center text-white text-lg font-bold`}>
                        {niche.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{niche.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {nicheProducts[niche.id]?.length || 0} trending products available
                        </p>
                      </div>
                    </div>
                    
                    {/* Products Grid */}
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                      {trendingLoading ? (
                        // Loading skeleton cards
                        Array(4).fill(0).map((_, i) => (
                          <Card key={i} className="overflow-hidden">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                <span className="text-sm text-muted-foreground">Loading...</span>
                              </div>
                              <Skeleton className="h-4 w-3/4 mb-2" />
                              <Skeleton className="h-3 w-1/2 mb-4" />
                              <Skeleton className="h-8 w-full" />
                            </CardContent>
                          </Card>
                        ))
                      ) : nicheProducts[niche.id]?.length > 0 ? (
                        nicheProducts[niche.id].map(product => (
                          <TrendingProductCard 
                            key={product.id} 
                            product={product} 
                          />
                        ))
                      ) : (
                        <div className="col-span-full text-center py-8">
                          <p className="text-muted-foreground">No trending products available for {niche.name} yet.</p>
                          <p className="text-sm text-muted-foreground mt-1">Check back later for updates!</p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>

        {/* Content Generator */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <ContentGenerator 
              onGenerate={handleGenerate}
              scrollToTopOnGenerate={false}
            />
          </div>
          
          {/* Generated Content Display */}
          <div>
            {generatedContent ? (
              <div>
                {isMultiPlatform ? (
                  <MultiPlatformContentOutput data={generatedContent} />
                ) : (
                  <div className="bg-white rounded-lg shadow-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Generated Content
                    </h3>
                    <div className="prose max-w-none">
                      {JSON.stringify(generatedContent, null, 2)}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white/50 rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
                <div className="text-gray-400">
                  <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No content generated yet
                  </h3>
                  <p className="text-gray-500">
                    Fill out the form and click "Generate Content" to see your AI-powered content here
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateContent;