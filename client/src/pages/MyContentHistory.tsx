import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Copy, ClipboardCheck, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Define the ContentHistory type based on our backend model
interface ContentHistory {
  id: number;
  userId?: number;
  niche: string;
  contentType: string;
  tone: string;
  productName: string;
  promptText: string;
  outputText: string;
  modelUsed: string;
  tokenCount: number;
  fallbackLevel?: string;
  createdAt: string;
}

// Response type from our API
interface ContentHistoryResponse {
  success: boolean;
  history: ContentHistory[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

const MyContentHistory: React.FC = () => {
  const { toast } = useToast();
  const [expandedCards, setExpandedCards] = useState<Record<number, boolean>>({});
  const [copiedCards, setCopiedCards] = useState<Record<number, boolean>>({});
  const [selectedNiche, setSelectedNiche] = useState<string>('');
  const [selectedTone, setSelectedTone] = useState<string>('');

  // Fetch history data
  const { data, isLoading, isError } = useQuery<ContentHistoryResponse>({
    queryKey: ['/api/history'],
    refetchOnWindowFocus: false,
  });

  // Helper function to toggle card expansion
  const toggleCardExpand = (id: number) => {
    setExpandedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Helper function to copy content to clipboard
  const copyToClipboard = (id: number, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedCards(prev => ({
        ...prev,
        [id]: true
      }));
      
      toast({
        title: "Content copied!",
        description: "The content has been copied to your clipboard.",
      });
      
      // Reset copied status after 3 seconds
      setTimeout(() => {
        setCopiedCards(prev => ({
          ...prev,
          [id]: false
        }));
      }, 3000);
    }).catch(err => {
      console.error('Failed to copy content: ', err);
      toast({
        title: "Copy failed",
        description: "Could not copy the content to clipboard.",
        variant: "destructive"
      });
    });
  };

  // Filter history based on selected niche and tone
  const filteredHistory = data?.history.filter(item => {
    const matchesNiche = !selectedNiche || item.niche === selectedNiche;
    const matchesTone = !selectedTone || item.tone === selectedTone;
    return matchesNiche && matchesTone;
  }) || [];

  // Extract unique niches and tones for filter dropdowns
  const uniqueNiches = Array.from(new Set(data?.history.map(item => item.niche) || []));
  const uniqueTones = Array.from(new Set(data?.history.map(item => item.tone) || []));

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Content Generation History</h1>
        <p className="text-gray-600 dark:text-gray-400">
          View your past content generations and their details
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-lg">Loading history...</span>
        </div>
      ) : isError ? (
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <p className="text-red-800 dark:text-red-400 text-lg">Failed to load content history.</p>
          <p className="text-sm mt-2">Please try refreshing the page or contact support.</p>
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="w-full md:w-1/4">
              <Select value={selectedNiche} onValueChange={setSelectedNiche}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by niche" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Niches</SelectLabel>
                    <SelectItem value="">All Niches</SelectItem>
                    {uniqueNiches.map(niche => (
                      <SelectItem key={niche} value={niche}>
                        {niche.charAt(0).toUpperCase() + niche.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full md:w-1/4">
              <Select value={selectedTone} onValueChange={setSelectedTone}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Tones</SelectLabel>
                    <SelectItem value="">All Tones</SelectItem>
                    {uniqueTones.map(tone => (
                      <SelectItem key={tone} value={tone}>
                        {tone.charAt(0).toUpperCase() + tone.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-grow text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Showing {filteredHistory.length} of {data?.history.length || 0} entries
              </p>
            </div>
          </div>

          {/* History Cards */}
          {filteredHistory.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <p className="text-lg text-gray-500 dark:text-gray-400">
                {data?.history.length ? 'No matching entries found.' : 'No content history found.'}
              </p>
              <p className="text-sm mt-2 text-gray-400 dark:text-gray-500">
                {data?.history.length ? 'Try changing your filters.' : 'Generate some content to see history here.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredHistory.map((item) => (
                <Card key={item.id} className="overflow-hidden border border-border">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl truncate">{item.productName}</CardTitle>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="capitalize bg-primary/10">
                          {item.niche}
                        </Badge>
                        <Badge variant="outline" className="capitalize bg-secondary/10">
                          {item.tone}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription className="mt-2 flex flex-wrap gap-2">
                      <span className="inline-flex items-center bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">
                        Template: <span className="font-medium ml-1">{item.contentType}</span>
                      </span>
                      <span className="inline-flex items-center bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded text-xs">
                        Model: <span className="font-medium ml-1">{item.modelUsed}</span>
                      </span>
                      <span className="inline-flex items-center bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded text-xs">
                        Tokens: <span className="font-medium ml-1">{item.tokenCount}</span>
                      </span>
                      {item.fallbackLevel && (
                        <span className="inline-flex items-center bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded text-xs">
                          Fallback: <span className="font-medium ml-1">{item.fallbackLevel}</span>
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="output">
                      <TabsList className="mb-2">
                        <TabsTrigger value="output">Output</TabsTrigger>
                        <TabsTrigger value="prompt">Prompt</TabsTrigger>
                      </TabsList>
                      <TabsContent value="output" className="mt-0">
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-md p-3 mt-2">
                          <div className={`prose dark:prose-invert max-w-none text-sm ${!expandedCards[item.id] ? 'line-clamp-4' : ''}`}>
                            {item.outputText.split('\n').map((line, i) => (
                              <React.Fragment key={i}>
                                {line}
                                <br />
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="prompt" className="mt-0">
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-md p-3 mt-2">
                          <div className={`prose dark:prose-invert max-w-none text-sm ${!expandedCards[item.id] ? 'line-clamp-4' : ''}`}>
                            {item.promptText}
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-2 border-t">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Generated: {new Date(item.createdAt).toLocaleString()}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => toggleCardExpand(item.id)}
                      >
                        {expandedCards[item.id] ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                        {expandedCards[item.id] ? 'Show Less' : 'View More'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(item.id, item.outputText)}
                      >
                        {copiedCards[item.id] ? <ClipboardCheck className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                        {copiedCards[item.id] ? 'Copied' : 'Copy All'}
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyContentHistory;