import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/Sidebar";
import TrendingProductsList from "@/components/TrendingProductsList";
import ScraperHealth from "@/components/ScraperHealth";
import ScraperStatusConsole from "@/components/ScraperStatus";
import ContentGenerator from "@/components/ContentGenerator";
import ContentOutput from "@/components/ContentOutput";
import RecentGenerations from "@/components/RecentGenerations";
import ApiUsageComponent from "@/components/ApiUsage";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import NicheSelector from "@/components/NicheSelector";
import { GenerationResponse, TrendingProduct, ApiUsage, ContentGeneration, ScraperStatus as ScraperStatusType } from "@/lib/types";
import { convertContentGenerations, convertScraperStatuses } from "@/lib/type-converters";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GenerationResponse | null>(null);
  const [selectedNiche, setSelectedNiche] = useState("skincare"); // Default niche
  const [isRefreshingTrends, setIsRefreshingTrends] = useState(false);
  const { toast } = useToast();
  
  // Function to refresh trending products
  const refreshTrendingProducts = async () => {
    try {
      setIsRefreshingTrends(true);
      await apiRequest('POST', '/api/trending/refresh', {});
      // Invalidate the trending products query to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/trending'] });
      
      toast({
        title: `${selectedNiche.charAt(0).toUpperCase() + selectedNiche.slice(1)} trends refreshed`,
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

  // Fetch scraper health
  const { data: scraperHealth = [], isLoading: isLoadingScraperHealth } = useQuery<ScraperStatusType[]>({
    queryKey: ['/api/scraper-health'],
  });
  
  // Fetch original scraper logs including error messages
  const { data: scraperLogs = [] } = useQuery<any[]>({
    queryKey: ['/api/scraper-status'],
  });

  // Fetch trending products
  const { data: trendingProducts = [], isLoading: isLoadingTrending } = useQuery<TrendingProduct[]>({
    queryKey: ['/api/trending'],
  });

  // Fetch API usage
  const { data: apiUsage = { today: 0, weekly: 0, monthly: 0, limit: 500 }, isLoading: isLoadingApiUsage } = useQuery<ApiUsage>({
    queryKey: ['/api/usage'],
  });

  // Fetch recent content generations
  const { data: recentGenerations = [], isLoading: isLoadingGenerations } = useQuery<ContentGeneration[]>({
    queryKey: ['/api/generate/recent'],
  });

  const handleContentGenerated = (response: GenerationResponse) => {
    setGeneratedContent(response);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile menu overlay */}
      <div 
        className={`fixed inset-0 z-20 transition-opacity bg-neutral-900 opacity-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}
        onClick={() => setSidebarOpen(false)}
      />
      
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main content */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-neutral-50">
        {/* Top bar */}
        <div className="bg-white border-b border-neutral-200 p-4 flex items-center justify-between">
          <button 
            className="p-2 rounded-md text-neutral-500 hover:text-neutral-800 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div className="flex items-center ml-auto space-x-4">
            <button className="p-2 text-neutral-500 hover:text-neutral-800 relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-primary-500"></span>
            </button>
            <button className="p-2 text-neutral-500 hover:text-neutral-800">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Page content */}
        <div className="px-4 py-6 md:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-neutral-800">GlowBot Dashboard</h1>
            <p className="text-neutral-600">Generate trend-aware affiliate content for skincare and beauty products</p>
          </div>
          
          {/* Content Niche Selection */}
          <div className="mb-6">
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gradient bg-gradient-to-r from-purple-600 to-blue-600 mb-4">Select Content Niche</h2>
              <div className="mb-4">
                <NicheSelector value={selectedNiche} onChange={setSelectedNiche} />
              </div>
              <div className="flex justify-end">
                <button 
                  onClick={refreshTrendingProducts}
                  disabled={isRefreshingTrends}
                  className="px-4 py-2 rounded-md bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white font-medium flex items-center transition-all shadow-md hover:shadow-lg disabled:opacity-70"
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Get {selectedNiche.charAt(0).toUpperCase() + selectedNiche.slice(1)} Trends
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          {/* Trending Products */}
          <div className="mb-6">
            <TrendingProductsList 
              products={trendingProducts || []} 
              isLoading={isLoadingTrending || isRefreshingTrends}
              niche={selectedNiche}
            />
          </div>
          
          {/* Main dashboard grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Content Generator - without niche selector since it's moved above */}
              <ContentGenerator 
                onGenerate={handleContentGenerated} 
                initialNiche={selectedNiche}
                onNicheChange={setSelectedNiche}
              />
              
              {/* Content Output */}
              <ContentOutput content={generatedContent} />
              
              {/* Analytics Dashboard */}
              <AnalyticsDashboard />
              
              {/* Recent Generations */}
              <RecentGenerations 
                generations={recentGenerations || []} 
                isLoading={isLoadingGenerations}
              />
            </div>
            
            {/* Right column */}
            <div className="space-y-6">              
              {/* Scraper Health */}
              <ScraperHealth 
                scrapers={scraperHealth || []} 
                isLoading={isLoadingScraperHealth}
              />
              
              {/* Scraper Status Console */}
              <ScraperStatusConsole scraperLogs={scraperLogs} />
              
              {/* API Usage */}
              <ApiUsageComponent 
                usage={apiUsage || { today: 0, weekly: 0, monthly: 0, limit: 500 }} 
                isLoading={isLoadingApiUsage}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
