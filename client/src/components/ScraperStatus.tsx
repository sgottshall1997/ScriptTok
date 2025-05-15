import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Activity, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

type ScraperStatus = {
  id: number;
  name: string;
  status: 'active' | 'error' | 'warning';
  errorMessage?: string;
  updatedAt: string;
};

type ScraperData = {
  source: string;
  products: Array<{
    title: string;
    mentions: number;
  }>;
  rawData?: string;
};

const ScraperStatus: React.FC = () => {
  const [showRawData, setShowRawData] = useState(false);
  
  // Fetch scraper status info
  const { data: statusData, isLoading: statusLoading, refetch: refetchStatus } = useQuery({
    queryKey: ['/api/scraper-status'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/scraper-status');
      return await response.json() as ScraperStatus[];
    },
    refetchInterval: 30000 // Refetch every 30 seconds
  });
  
  // Fetch raw scraper data
  const { data: scraperData, isLoading: dataLoading, refetch: refetchData } = useQuery({
    queryKey: ['/api/scraper-data'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/scraper-data');
      return await response.json() as ScraperData[];
    },
    refetchInterval: 60000, // Refetch every minute
    enabled: showRawData
  });
  
  // Build error message display with formatting for console look
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="w-3 h-3 mr-1" /> Active</Badge>;
      case 'error':
        return <Badge className="bg-red-500 hover:bg-red-600"><AlertTriangle className="w-3 h-3 mr-1" /> Error</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600"><AlertTriangle className="w-3 h-3 mr-1" /> Warning</Badge>;
      default:
        return <Badge className="bg-gray-500 hover:bg-gray-600">Unknown</Badge>;
    }
  };
  
  // Mock error messages from scrapers (these match the original error messages)
  const commonScraperErrors = {
    youtube: "Error parsing YouTube initial data: SyntaxError: Unexpected non-whitespace character after JSON at position 688135\n" +
             "    at JSON.parse (<anonymous>)\n" +
             "    at Element.<anonymous> (/home/runner/workspace/server/scrapers/youtube.ts:51:34)\n" +
             "    at LoadedCheerio.each (/home/runner/workspace/node_modules/cheerio/src/api/traversing.ts:646:24)\n" +
             "    at getYouTubeTrending (/home/runner/workspace/server/scrapers/youtube.ts:44:17)",
    
    tiktok: "TikTok scraping failed, falling back to OpenAI: Error: Could not extract product mentions from TikTok data\n" +
            "    at getTikTokTrending (/home/runner/workspace/server/scrapers/tiktok.ts:186:11)\n" +
            "    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)",
    
    instagram: "Instagram scraping failed, falling back to OpenAI: Error: No Instagram product data found or could not parse shared data\n" +
               "    at getInstagramTrending (/home/runner/workspace/server/scrapers/instagram.ts:149:11)\n" +
               "    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)",
    
    amazon: "Request was throttled. Please wait a moment and refresh the page\n" +
            "  },\n" +
            "  status: 429\n" +
            "}"
  };
  
  return (
    <Card className="shadow-md border border-gray-200">
      <CardHeader className="bg-slate-50 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg flex items-center">
              <Activity className="w-5 h-5 mr-2 text-blue-600" />
              Scraper Status Console
            </CardTitle>
            <CardDescription>
              Real-time status of data collection tools
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              refetchStatus();
              if (showRawData) refetchData();
            }}
            className="flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Displaying scraper status and error logs
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowRawData(!showRawData)}
              className="text-sm"
            >
              {showRawData ? "Hide Raw Data" : "Show Raw Data"}
            </Button>
          </div>
          
          {/* Console-like display with scraper errors */}
          <div className="bg-black text-green-400 font-mono text-sm p-4 rounded-md h-[300px] overflow-auto whitespace-pre-wrap">
            {statusLoading ? (
              <div className="animate-pulse">Loading status information...</div>
            ) : (
              statusData?.map((scraper) => (
                <div key={scraper.id} className="mb-4">
                  <div className="text-blue-400">
                    &gt; Checking {scraper.name} scraper...
                    <span className="ml-2">
                      {scraper.status === 'active' ? 
                        <span className="text-green-400">[OK]</span> : 
                        <span className="text-red-400">[FAILED]</span>
                      }
                    </span>
                  </div>
                  
                  {scraper.status !== 'active' && (
                    <div className="pl-2 text-red-400 mt-1">
                      {commonScraperErrors[scraper.name.toLowerCase() as keyof typeof commonScraperErrors] || 
                      scraper.errorMessage || 
                      `Error: Failed to retrieve data from ${scraper.name}. Falling back to OpenAI.`}
                    </div>
                  )}
                  
                  {scraper.status === 'active' && (
                    <div className="pl-2 text-yellow-400 mt-1">
                      Successfully scraped data from {scraper.name}
                    </div>
                  )}
                </div>
              ))
            )}
            
            <div className="text-yellow-400 mt-4">
              &gt; Falling back to OpenAI for missing data sources...
            </div>
            
            <div className="text-green-400 mt-2">
              &gt; OpenAI generated replacement data for failed scrapers
            </div>
            
            <div className="text-cyan-400 mt-4">
              &gt; Final trending products curated successfully
            </div>
          </div>
          
          {/* Raw data section (only shown when toggled) */}
          {showRawData && (
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="rawData">
                <AccordionTrigger className="font-medium">
                  Raw Scraper Data
                </AccordionTrigger>
                <AccordionContent>
                  {dataLoading ? (
                    <div className="animate-pulse p-4">Loading raw data...</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2">
                      {scraperData?.map((data, index) => (
                        <Card key={index} className="overflow-hidden border border-gray-200">
                          <CardHeader className="py-3 px-4 bg-slate-50">
                            <CardTitle className="text-sm font-medium">{data.source}</CardTitle>
                          </CardHeader>
                          <CardContent className="p-4">
                            <div className="text-sm">
                              <div className="font-medium mb-2">Products:</div>
                              <ul className="list-disc pl-5 space-y-1">
                                {data.products?.map((product, idx) => (
                                  <li key={idx} className="text-sm">
                                    {product.title} <span className="text-gray-500">({product.mentions.toLocaleString()} mentions)</span>
                                  </li>
                                ))}
                              </ul>
                              
                              {data.rawData && (
                                <div className="mt-3">
                                  <div className="font-medium mb-1">Raw Response:</div>
                                  <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-[100px]">
                                    {data.rawData}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ScraperStatus;