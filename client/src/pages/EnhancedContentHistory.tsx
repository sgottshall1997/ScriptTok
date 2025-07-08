import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { 
  ChevronDown, 
  Copy, 
  ExternalLink, 
  Trash2, 
  Calendar,
  Hash,
  Zap
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { ContentHistoryManager } from '@shared/contentHistoryUtils';
import { ContentGenerationEntry } from '@shared/contentGenerationHistory';

const EnhancedContentHistory = () => {
  const { toast } = useToast();
  const [history, setHistory] = useState<ContentGenerationEntry[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<ContentGenerationEntry[]>([]);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [copiedItems, setCopiedItems] = useState<Record<string, boolean>>({});
  const [filters, setFilters] = useState({
    niche: 'all',
    platform: 'all',
    template: 'all'
  });

  // Load history on component mount
  useEffect(() => {
    loadHistory();
  }, []);

  // Apply filters when history or filters change
  useEffect(() => {
    applyFilters();
  }, [history, filters]);

  const loadHistory = () => {
    const loadedHistory = ContentHistoryManager.getHistory();
    setHistory(loadedHistory);
  };

  const applyFilters = () => {
    const filtered = ContentHistoryManager.filterHistory({
      niche: filters.niche === 'all' ? undefined : filters.niche,
      platform: filters.platform === 'all' ? undefined : filters.platform,
      template: filters.template === 'all' ? undefined : filters.template
    });
    setFilteredHistory(filtered);
  };

  const toggleExpanded = (id: string) => {
    setExpandedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const copyToClipboard = async (text: string, label: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItems(prev => ({ ...prev, [id]: true }));
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedItems(prev => ({ ...prev, [id]: false }));
      }, 2000);
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard",
        variant: "destructive"
      });
    }
  };

  const deleteEntry = (id: string) => {
    ContentHistoryManager.removeEntry(id);
    loadHistory();
    toast({
      title: "Entry deleted",
      description: "Content generation entry removed from history",
    });
  };

  const clearAllHistory = () => {
    ContentHistoryManager.clearHistory();
    loadHistory();
    toast({
      title: "History cleared",
      description: "All content generation history has been cleared",
    });
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Extract unique values for filter dropdowns
  const uniqueNiches = Array.from(new Set(history.map(entry => entry.niche)));
  const uniquePlatforms = Array.from(new Set(history.flatMap(entry => entry.platformsSelected)));
  const uniqueTemplates = Array.from(new Set(history.map(entry => entry.templateUsed)));

  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      'TikTok': 'bg-black text-white',
      'Instagram': 'bg-pink-500 text-white',
      'YouTube': 'bg-red-500 text-white',
      'Twitter': 'bg-blue-400 text-white'
    };
    return colors[platform] || 'bg-gray-500 text-white';
  };

  const getNicheColor = (niche: string) => {
    const colors: Record<string, string> = {
      'beauty': 'bg-pink-100 text-pink-800',
      'tech': 'bg-blue-100 text-blue-800',
      'fashion': 'bg-purple-100 text-purple-800',
      'fitness': 'bg-green-100 text-green-800',
      'food': 'bg-orange-100 text-orange-800',
      'travel': 'bg-cyan-100 text-cyan-800',
      'pets': 'bg-yellow-100 text-yellow-800'
    };
    return colors[niche] || 'bg-gray-100 text-gray-800';
  };

  if (history.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Zap className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No content generated yet
          </h3>
          <p className="text-gray-500 mb-4">
            Start by selecting a trending product and generating your first viral content!
          </p>
          <Button onClick={() => window.location.href = '/generate'}>
            Create Content
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Content History</h1>
            <p className="text-gray-600">
              View and manage your generated content history
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={clearAllHistory}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="w-full md:w-1/4">
            <Select value={filters.niche} onValueChange={(value) => setFilters(prev => ({ ...prev, niche: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by niche" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Niches</SelectItem>
                {uniqueNiches.map(niche => (
                  <SelectItem key={niche} value={niche}>
                    {niche.charAt(0).toUpperCase() + niche.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full md:w-1/4">
            <Select value={filters.platform} onValueChange={(value) => setFilters(prev => ({ ...prev, platform: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                {uniquePlatforms.map(platform => (
                  <SelectItem key={platform} value={platform}>
                    {platform}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full md:w-1/4">
            <Select value={filters.template} onValueChange={(value) => setFilters(prev => ({ ...prev, template: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Templates</SelectItem>
                {uniqueTemplates.map(template => (
                  <SelectItem key={template} value={template}>
                    {template.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex-grow text-right">
            <p className="text-sm text-gray-500 mt-2">
              Showing {filteredHistory.length} of {history.length} entries
            </p>
          </div>
        </div>
      </div>

      {/* History Cards */}
      <div className="space-y-4">
        {filteredHistory.map((entry) => (
          <Card key={entry.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2">📦 {entry.productName}</CardTitle>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge className={getNicheColor(entry.niche)}>
                      {entry.niche.charAt(0).toUpperCase() + entry.niche.slice(1)}
                    </Badge>
                    {entry.platformsSelected.map(platform => (
                      <Badge key={platform} className={getPlatformColor(platform)}>
                        {platform}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">
                    Template: {entry.templateUsed.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} | 
                    Tone: {entry.tone} | 
                    <Calendar className="inline h-4 w-4 ml-2 mr-1" />
                    {formatDate(entry.timestamp)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteEntry(entry.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <Collapsible
              open={expandedCards[entry.id]}
              onOpenChange={() => toggleExpanded(entry.id)}
            >
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between px-6">
                  <span>View Generated Content</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${expandedCards[entry.id] ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="space-y-4 border-t bg-gray-50">
                  {/* Main Content */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Generated Content:</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(entry.generatedOutput.content, 'Content', `content-${entry.id}`)}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        {copiedItems[`content-${entry.id}`] ? 'Copied!' : 'Copy'}
                      </Button>
                    </div>
                    <div className="bg-white p-4 rounded border font-mono text-sm whitespace-pre-wrap">
                      {entry.generatedOutput.content}
                    </div>
                  </div>

                  {/* Hook */}
                  {entry.generatedOutput.hook && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Hook:</h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(entry.generatedOutput.hook!, 'Hook', `hook-${entry.id}`)}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          {copiedItems[`hook-${entry.id}`] ? 'Copied!' : 'Copy'}
                        </Button>
                      </div>
                      <div className="bg-white p-3 rounded border text-sm">
                        {entry.generatedOutput.hook}
                      </div>
                    </div>
                  )}

                  {/* Hashtags */}
                  {entry.generatedOutput.hashtags && entry.generatedOutput.hashtags.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Hashtags:</h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(entry.generatedOutput.hashtags!.join(' '), 'Hashtags', `hashtags-${entry.id}`)}
                        >
                          <Hash className="h-4 w-4 mr-2" />
                          {copiedItems[`hashtags-${entry.id}`] ? 'Copied!' : 'Copy'}
                        </Button>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <div className="flex flex-wrap gap-2">
                          {entry.generatedOutput.hashtags.map((tag, index) => (
                            <Badge key={index} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Affiliate Link */}
                  {entry.generatedOutput.affiliateLink && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Affiliate Link:</h4>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(entry.generatedOutput.affiliateLink!, 'Affiliate Link', `link-${entry.id}`)}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            {copiedItems[`link-${entry.id}`] ? 'Copied!' : 'Copy Link'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(entry.generatedOutput.affiliateLink, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Open
                          </Button>
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded border text-sm text-blue-600 truncate">
                        {entry.generatedOutput.affiliateLink}
                      </div>
                    </div>
                  )}

                  {/* Viral Inspiration */}
                  {entry.generatedOutput.viralInspo && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Viral Inspiration:</h4>
                      <div className="bg-white p-3 rounded border space-y-2">
                        <p><strong>Hook:</strong> {entry.generatedOutput.viralInspo.hook}</p>
                        <p><strong>Format:</strong> {entry.generatedOutput.viralInspo.format}</p>
                        <p><strong>Caption:</strong> {entry.generatedOutput.viralInspo.caption}</p>
                        <div className="flex flex-wrap gap-1">
                          {entry.generatedOutput.viralInspo.hashtags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default EnhancedContentHistory;