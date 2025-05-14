import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/Sidebar";
import TrendingProductsList from "@/components/TrendingProductsList";
import ScraperHealth from "@/components/ScraperHealth";
import ContentGenerator from "@/components/ContentGenerator";
import ContentOutput from "@/components/ContentOutput";
import RecentGenerations from "@/components/RecentGenerations";
import ApiUsageComponent from "@/components/ApiUsage";
import { GenerationResponse, TrendingProduct, ApiUsage, ContentGeneration, ScraperStatus } from "@/lib/types";
import { convertContentGenerations, convertScraperStatuses } from "@/lib/type-converters";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GenerationResponse | null>(null);

  // Fetch scraper health
  const { data: scraperHealth = [], isLoading: isLoadingScraperHealth } = useQuery<ScraperStatus[]>({
    queryKey: ['/api/scraper-health'],
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
          
          {/* Trending Products - Full Width Section at Top */}
          <div className="mb-6">
            <TrendingProductsList 
              products={trendingProducts || []} 
              isLoading={isLoadingTrending}
            />
          </div>
          
          {/* Main dashboard grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Content Generator */}
              <ContentGenerator onGenerate={handleContentGenerated} />
              
              {/* Content Output */}
              <ContentOutput content={generatedContent} />
              
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
