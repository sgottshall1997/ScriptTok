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
  Zap,
  Star,
  TrendingUp
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useQuery } from '@tanstack/react-query';
import { ContentHistoryManager } from '@shared/contentHistoryUtils';
import { ContentGenerationEntry } from '@shared/contentGenerationHistory';
import { ContentRating, SmartLearningToggle } from '@/components/ContentRating';

const EnhancedContentHistory = () => {
  const { toast } = useToast();
  const [history, setHistory] = useState<ContentGenerationEntry[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<ContentGenerationEntry[]>([]);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [copiedItems, setCopiedItems] = useState<Record<string, boolean>>({});
  const [expandedRatings, setExpandedRatings] = useState<Record<string, boolean>>({});
  const [filters, setFilters] = useState({
    niche: 'all',
    platform: 'all',
    template: 'all'
  });

  // Load history from database API
  const { data: dbHistory, refetch: refetchDbHistory } = useQuery({
    queryKey: ['/api/history'],
    queryFn: async () => {
      const response = await fetch('/api/history');
      const data = await response.json();
      return data.success ? data.history : [];
    },
    staleTime: 0,
    cacheTime: 0
  });

  // Load history on component mount
  useEffect(() => {
    loadHistory();
  }, []);

  // Apply filters when history or filters change, and reload when db data changes
  useEffect(() => {
    applyFilters();
  }, [history, filters]);

  useEffect(() => {
    if (dbHistory) {
      loadHistory();
    }
  }, [dbHistory]);

  const loadHistory = () => {
    // Combine local storage history with database history
    const localHistory = ContentHistoryManager.getHistory();
    const combinedHistory = [...localHistory];
    
    // Add database history if available
    if (dbHistory && Array.isArray(dbHistory)) {
      console.log('🔍 Debug: Database history items:', dbHistory.slice(0, 2)); // Debug first 2 items
      const dbHistoryConverted = dbHistory.map((item: any) => {
        console.log('🔍 Debug: Converting item with ID:', item.id, 'to databaseId:', item.id);
        return {
          id: `db_${item.id}`,
          databaseId: item.id, // Preserve the actual database ID for rating system
          timestamp: new Date(item.createdAt).toISOString(),
          productName: item.productName,
          niche: item.niche,
          tone: item.tone,
          contentType: item.contentType,
          promptText: item.promptText,
          outputText: item.outputText,
          platformsSelected: item.platformsSelected || [],
          generatedOutput: {
            ...item.generatedOutput,
            content: item.outputText,
            hook: item.generatedOutput?.hook || 'Generated content',
            hashtags: item.generatedOutput?.hashtags || [],
            affiliateLink: item.affiliateLink,
            viralInspo: item.viralInspiration,
            ...item.generatedOutput
          },
          source: 'database'
        };
      });
      console.log('🔍 Debug: First converted entry databaseId:', dbHistoryConverted[0]?.databaseId);
      combinedHistory.push(...dbHistoryConverted);
    }
    
    // Sort by timestamp (newest first)
    combinedHistory.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    setHistory(combinedHistory);
  };

  const applyFilters = () => {
    // Filter from the combined history instead of using ContentHistoryManager
    let filtered = history;
    
    if (filters.niche !== 'all') {
      filtered = filtered.filter(item => item.niche === filters.niche);
    }
    
    if (filters.platform !== 'all') {
      filtered = filtered.filter(item => 
        item.platformsSelected && item.platformsSelected.includes(filters.platform)
      );
    }
    
    if (filters.template !== 'all') {
      filtered = filtered.filter(item => item.contentType === filters.template);
    }
    
    setFilteredHistory(filtered);
  };

  const toggleExpanded = (id: string) => {
    setExpandedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const toggleRatingExpanded = (entryId: string) => {
    setExpandedRatings(prev => ({
      ...prev,
      [entryId]: !prev[entryId]
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
    // Check if it's a database entry (starts with 'db_')
    if (id.startsWith('db_')) {
      // For database entries, we need to delete from the database via API
      fetch(`/api/history/${id.replace('db_', '')}`, {
        method: 'DELETE',
      }).then(() => {
        refetchDbHistory(); // Refresh database data
        loadHistory(); // Reload combined history
        toast({
          title: "Entry deleted",
          description: "Content generation entry removed from database",
        });
      }).catch(() => {
        toast({
          title: "Delete failed",
          description: "Could not delete entry from database",
          variant: "destructive"
        });
      });
    } else {
      // For local storage entries
      ContentHistoryManager.removeEntry(id);
      loadHistory();
      toast({
        title: "Entry deleted",
        description: "Content generation entry removed from history",
      });
    }
  };

  const deleteAllEntries = () => {
    if (window.confirm('Are you sure you want to delete all content history? This action cannot be undone.')) {
      ContentHistoryManager.clearHistory();
      loadHistory();
      toast({
        title: "All history cleared",
        description: "All content generation entries have been removed",
      });
    }
  };

  const clearAllHistory = () => {
    ContentHistoryManager.clearHistory();
    loadHistory();
    toast({
      title: "History cleared",
      description: "All content generation history has been cleared",
    });
  };

  const formatDate = (dateInput: string | Date) => {
    try {
      if (!dateInput) return 'Unknown date';
      const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
      if (isNaN(date.getTime())) return 'Invalid date';
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Extract unique values for filter dropdowns
  const uniqueNiches = Array.from(new Set(history.map(entry => entry.niche)));
  const uniquePlatforms = Array.from(new Set(history.flatMap(entry => entry.platformsSelected || [])));
  const uniqueTemplates = Array.from(new Set(
    history
      .map(entry => entry.templateUsed || entry.contentType)
      .filter(template => template && typeof template === 'string')
  ));

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
            onClick={deleteAllEntries}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>

        {/* Smart Learning Toggle */}
        <div className="mb-6">
          <SmartLearningToggle userId={1} />
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
                  <SelectItem key={template || 'unknown'} value={template || 'unknown'}>
                    {template ? template.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Unknown Template'}
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
                    {(entry.platformsSelected || []).map(platform => (
                      <Badge key={platform} className={getPlatformColor(platform)}>
                        {platform}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">
                    Template: {entry.templateUsed ? entry.templateUsed.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : (entry.contentType || 'Unknown')} | 
                    Tone: {entry.tone || 'Unknown'} | 
                    <Calendar className="inline h-4 w-4 ml-2 mr-1" />
                    {formatDate(entry.timestamp)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteEntry(entry.id)}
                  className="text-red-500 hover:text-red-700"
                  title="Delete this entry"
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
                      <div className="bg-white p-3 rounded border text-sm text-blue-600 break-all whitespace-normal">
                        {entry.generatedOutput.affiliateLink}
                      </div>
                    </div>
                  )}

                  {/* Platform-Specific Captions */}
                  {(entry.generatedOutput.tiktokCaption || entry.generatedOutput.instagramCaption || entry.generatedOutput.youtubeCaption || entry.generatedOutput.twitterCaption) && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Platform-Specific Captions:</h4>
                      <div className="space-y-3">
                        {entry.generatedOutput.tiktokCaption && (
                          <div className="bg-white p-3 rounded border">
                            <div className="flex justify-between items-center mb-2">
                              <h5 className="font-medium text-pink-600 flex items-center gap-2">
                                📱 TikTok Caption
                              </h5>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(entry.generatedOutput.tiktokCaption!, 'TikTok Caption', `tiktok-${entry.id}`)}
                              >
                                <Copy className="h-4 w-4 mr-2" />
                                {copiedItems[`tiktok-${entry.id}`] ? 'Copied!' : 'Copy'}
                              </Button>
                            </div>
                            <div className="font-mono text-sm whitespace-pre-wrap bg-gray-50 p-2 rounded">
                              {entry.generatedOutput.tiktokCaption}
                            </div>
                          </div>
                        )}
                        
                        {entry.generatedOutput.instagramCaption && (
                          <div className="bg-white p-3 rounded border">
                            <div className="flex justify-between items-center mb-2">
                              <h5 className="font-medium text-purple-600 flex items-center gap-2">
                                📸 Instagram Caption
                              </h5>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(entry.generatedOutput.instagramCaption!, 'Instagram Caption', `instagram-${entry.id}`)}
                              >
                                <Copy className="h-4 w-4 mr-2" />
                                {copiedItems[`instagram-${entry.id}`] ? 'Copied!' : 'Copy'}
                              </Button>
                            </div>
                            <div className="font-mono text-sm whitespace-pre-wrap bg-gray-50 p-2 rounded">
                              {entry.generatedOutput.instagramCaption}
                            </div>
                          </div>
                        )}
                        
                        {entry.generatedOutput.youtubeCaption && (
                          <div className="bg-white p-3 rounded border">
                            <div className="flex justify-between items-center mb-2">
                              <h5 className="font-medium text-red-600 flex items-center gap-2">
                                📺 YouTube Description
                              </h5>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(entry.generatedOutput.youtubeCaption!, 'YouTube Description', `youtube-${entry.id}`)}
                              >
                                <Copy className="h-4 w-4 mr-2" />
                                {copiedItems[`youtube-${entry.id}`] ? 'Copied!' : 'Copy'}
                              </Button>
                            </div>
                            <div className="font-mono text-sm whitespace-pre-wrap bg-gray-50 p-2 rounded">
                              {entry.generatedOutput.youtubeCaption}
                            </div>
                          </div>
                        )}
                        
                        {entry.generatedOutput.twitterCaption && (
                          <div className="bg-white p-3 rounded border">
                            <div className="flex justify-between items-center mb-2">
                              <h5 className="font-medium text-blue-600 flex items-center gap-2">
                                🐦 Twitter/X Post
                              </h5>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(entry.generatedOutput.twitterCaption!, 'Twitter Post', `twitter-${entry.id}`)}
                              >
                                <Copy className="h-4 w-4 mr-2" />
                                {copiedItems[`twitter-${entry.id}`] ? 'Copied!' : 'Copy'}
                              </Button>
                            </div>
                            <div className="font-mono text-sm whitespace-pre-wrap bg-gray-50 p-2 rounded">
                              {entry.generatedOutput.twitterCaption}
                            </div>
                          </div>
                        )}
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

                  {/* Content Rating System */}
                  <div className="border-t pt-4 mt-4">
                    {entry.databaseId ? (
                      <ContentRating
                        contentHistoryId={entry.databaseId}
                        userId={1}
                        isExpanded={expandedRatings[entry.id]}
                        onToggle={() => toggleRatingExpanded(entry.id)}
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-2 border rounded-lg bg-gray-50">
                        <span className="text-sm text-gray-500">
                          Rating available for database-saved content only (ID: {entry.id}, dbID: {entry.databaseId})
                        </span>
                      </div>
                    )}
                  </div>
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