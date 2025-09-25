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
import { Checkbox } from "@/components/ui/checkbox";
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
  TrendingUp,
  CheckSquare,
  Square,
  Trash,
  Eye
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useQuery } from '@tanstack/react-query';
import { ContentHistoryManager } from '@shared/contentHistoryUtils';
import { ContentGenerationEntry } from '@shared/contentGenerationHistory';
import { ContentRating, SmartLearningToggle } from '@/components/ContentRating';
import SyncRatingsButton from '@/components/SyncRatingsButton';
import { ContentEvaluationPanel } from '@/components/ContentEvaluationPanel';
import { getGlowBotSectionByPath } from '@/lib/glowbot-sections';
import AboutThisPage from '@/components/AboutThisPage';

const EnhancedContentHistory = () => {
  const { toast } = useToast();
  const [history, setHistory] = useState<ContentGenerationEntry[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<ContentGenerationEntry[]>([]);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [copiedItems, setCopiedItems] = useState<Record<string, boolean>>({});
  const [expandedRatings, setExpandedRatings] = useState<Record<string, boolean>>({});
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [bulkDeleteMode, setBulkDeleteMode] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filters, setFilters] = useState({
    niche: 'all',
    platform: 'all',
    template: 'all',
    affiliateLink: 'all',
    amazonAffiliate: 'all',
    aiModel: 'all',
    contentFormat: 'all',
    smartStyle: 'all'
  });
  const [sortBy, setSortBy] = useState('newest');
  const [evaluationData, setEvaluationData] = useState<Record<string, any>>({});

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
  }, [history, filters, sortBy]);

  // Fetch evaluation data for all content items
  useEffect(() => {
    const fetchEvaluationData = async () => {
      const newEvaluationData: Record<string, any> = {};
      
      for (const entry of history) {
        if (entry.databaseId) {
          try {
            const response = await fetch(`/api/content-evaluation/${entry.databaseId}`);
            const data = await response.json();
            
            if (data.success && data.evaluations && data.evaluations.length > 0) {
              const evaluations: any = {};
              data.evaluations.forEach((evaluation: any) => {
                evaluations[evaluation.evaluatorModel] = evaluation;
              });
              newEvaluationData[entry.id] = evaluations;
            }
          } catch (error) {
            console.error(`Failed to fetch evaluations for ${entry.id}:`, error);
          }
        }
      }
      
      setEvaluationData(newEvaluationData);
    };

    if (history.length > 0) {
      fetchEvaluationData();
    }
  }, [history]);

  useEffect(() => {
    if (dbHistory) {
      loadHistory();
    }
  }, [dbHistory]);

  const loadHistory = () => {
    // Prioritize database history, add local storage as fallback
    let combinedHistory: any[] = [];
    
    // Add database history if available (these can be rated)
    if (dbHistory && Array.isArray(dbHistory)) {
      console.log('🔧 DEBUG: Raw dbHistory received:', dbHistory.length, 'items');
      console.log('🔧 DEBUG: First item raw:', dbHistory[0]);
      
      const dbHistoryConverted = dbHistory.map((item: any) => {
        console.log('🔧 DEBUG: Processing item with ID:', item.id, 'type:', typeof item.id);
        
        // Handle null/undefined values from database
        const parsedGeneratedOutput = item.generatedOutput ? 
          (typeof item.generatedOutput === 'string' ? JSON.parse(item.generatedOutput) : item.generatedOutput) : {};
        
        const convertedItem = {
          id: `db_${item.id}`,
          databaseId: item.id, // Preserve the actual database ID for rating system
          timestamp: new Date(item.createdAt).toISOString(),
          productName: item.productName || 'Unknown Product',
          niche: item.niche || 'general',
          tone: item.tone || 'neutral',
          contentType: item.contentType || 'content',
          templateUsed: item.templateUsed || item.contentType || 'default',
          promptText: item.promptText || '',
          outputText: item.outputText || '',
          platformsSelected: item.platformsSelected ? 
            (Array.isArray(item.platformsSelected) ? item.platformsSelected : JSON.parse(item.platformsSelected || '[]')) : [],
          // Add new filter fields
          aiModel: item.ai_model || item.aiModel || item.model_used || item.modelUsed || '',
          contentFormat: item.content_format || item.contentFormat || '',
          topRatedStyleUsed: item.top_rated_style_used || item.topRatedStyleUsed || false,
          useSmartStyle: item.use_smart_style || item.useSmartStyle || false,
          generatedOutput: {
            content: item.outputText || '',
            hook: parsedGeneratedOutput.hook || 'Generated content',
            hashtags: parsedGeneratedOutput.hashtags || [],
            affiliateLink: item.affiliateLink || '',
            viralInspo: item.viralInspo || item.viralInspiration || '',
            ...parsedGeneratedOutput
          },
          source: 'database'
        };
        
        console.log('🔧 DEBUG: Converted item databaseId:', convertedItem.databaseId, 'type:', typeof convertedItem.databaseId);
        return convertedItem;
      });
      
      console.log('🔧 DEBUG: Total converted items:', dbHistoryConverted.length);
      combinedHistory.push(...dbHistoryConverted);
    }
    
    // Only show database entries on this page since they support rating
    // Local storage entries are shown on other pages but not here
    console.log('🔧 DEBUG: Final combined history length:', combinedHistory.length);
    
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

    if (filters.affiliateLink !== 'all') {
      filtered = filtered.filter(item => {
        const hasAffiliateLink = item.generatedOutput?.affiliateLink && 
          item.generatedOutput.affiliateLink.trim() !== '' &&
          item.generatedOutput.affiliateLink !== 'N/A';
        return filters.affiliateLink === 'has' ? hasAffiliateLink : !hasAffiliateLink;
      });
    }

    if (filters.amazonAffiliate !== 'all') {
      filtered = filtered.filter(item => {
        const affiliateLink = item.generatedOutput?.affiliateLink || '';
        const isAmazonLink = affiliateLink.includes('amazon.com') || 
                            affiliateLink.includes('amzn.to') ||
                            affiliateLink.includes('amazon.') ||
                            affiliateLink.includes('/dp/') ||
                            affiliateLink.includes('tag=');
        return filters.amazonAffiliate === 'amazon' ? isAmazonLink : 
               (affiliateLink.trim() !== '' && affiliateLink !== 'N/A' && !isAmazonLink);
      });
    }

    if (filters.aiModel !== 'all') {
      filtered = filtered.filter(item => {
        const aiModel = item.aiModel || item.model;
        if (!aiModel) return filters.aiModel === 'unknown';
        
        const modelLower = aiModel.toLowerCase();
        if (filters.aiModel === 'chatgpt') {
          return modelLower.includes('gpt') || modelLower.includes('chatgpt');
        } else if (filters.aiModel === 'claude') {
          return modelLower.includes('claude');
        }
        return false;
      });
    }

    if (filters.contentFormat !== 'all') {
      filtered = filtered.filter(item => {
        const format = item.contentFormat;
        if (!format) return filters.contentFormat === 'unknown';
        
        const formatLower = format.toLowerCase();
        if (filters.contentFormat === 'spartan') {
          return formatLower.includes('spartan');
        } else if (filters.contentFormat === 'regular') {
          return formatLower.includes('regular') || !formatLower.includes('spartan');
        }
        return false;
      });
    }

    if (filters.smartStyle !== 'all') {
      filtered = filtered.filter(item => {
        const smartStyleUsed = item.topRatedStyleUsed || item.useSmartStyle;
        return filters.smartStyle === 'used' ? smartStyleUsed : !smartStyleUsed;
      });
    }

    // Apply sorting
    if (sortBy !== 'newest') {
      console.log('🔍 SORTING DEBUG: sortBy =', sortBy);
      console.log('🔍 SORTING DEBUG: evaluationData keys =', Object.keys(evaluationData));
      console.log('🔍 SORTING DEBUG: first few evaluation entries =', Object.values(evaluationData).slice(0, 2));
      
      filtered = [...filtered].sort((a, b) => {
        const aEvals = evaluationData[a.id] || {};
        const bEvals = evaluationData[b.id] || {};
        
        console.log(`🔍 SORTING DEBUG: Comparing ${a.id} vs ${b.id}`);
        console.log(`🔍 SORTING DEBUG: aEvals =`, aEvals);
        console.log(`🔍 SORTING DEBUG: bEvals =`, bEvals);
        
        switch (sortBy) {
          case 'gpt-highest':
            const aGptScore = calculateAverageRating(aEvals.chatgpt);
            const bGptScore = calculateAverageRating(bEvals.chatgpt);
            return bGptScore - aGptScore; // Higher scores first
          case 'gpt-lowest':
            const aGptScoreLow = calculateAverageRating(aEvals.chatgpt);
            const bGptScoreLow = calculateAverageRating(bEvals.chatgpt);
            // For lowest, treat missing evaluations as high scores (10) so they appear last
            const aGptFinal = aGptScoreLow === 0 ? 10 : aGptScoreLow;
            const bGptFinal = bGptScoreLow === 0 ? 10 : bGptScoreLow;
            return aGptFinal - bGptFinal; // Lower scores first
          case 'claude-highest':
            const aClaudeScore = calculateAverageRating(aEvals.claude);
            const bClaudeScore = calculateAverageRating(bEvals.claude);
            return bClaudeScore - aClaudeScore; // Higher scores first
          case 'claude-lowest':
            const aClaudeScoreLow = calculateAverageRating(aEvals.claude);
            const bClaudeScoreLow = calculateAverageRating(bEvals.claude);
            // For lowest, treat missing evaluations as high scores (10) so they appear last
            const aClaudeFinal = aClaudeScoreLow === 0 ? 10 : aClaudeScoreLow;
            const bClaudeFinal = bClaudeScoreLow === 0 ? 10 : bClaudeScoreLow;
            return aClaudeFinal - bClaudeFinal; // Lower scores first
          default:
            return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        }
      });
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

  // Calculate average rating from evaluation scores
  const calculateAverageRating = (evaluation: any): number => {
    if (!evaluation) return 0;
    const scores = [
      evaluation.viralityScore,
      evaluation.clarityScore,
      evaluation.persuasivenessScore,
      evaluation.creativityScore
    ].filter(score => score != null);
    
    if (scores.length === 0) return 0;
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  };

  // Enhanced content extraction function
  const extractCleanContent = (content: any): string => {
    if (!content) return 'No content available';
    
    // If it's already a string, return it
    if (typeof content === 'string') {
      try {
        // Try to parse as JSON in case it's a stringified object
        const parsed = JSON.parse(content);
        return parsed.content || parsed.script || content;
      } catch {
        // If parsing fails, it's a plain string
        return content;
      }
    }
    
    // If it's an object, extract the content field
    if (typeof content === 'object') {
      return content.content || content.script || JSON.stringify(content, null, 2);
    }
    
    return String(content);
  };

  const copyToClipboard = async (text: string | any, label: string, id: string) => {
    try {
      // Extract clean content for copying
      const textToCopy = extractCleanContent(text);
      await navigator.clipboard.writeText(textToCopy);
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

  const toggleItemSelection = (id: string) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedItems(newSelection);
  };

  const selectAllVisible = () => {
    const visibleIds = filteredHistory.map(item => item.id);
    setSelectedItems(new Set(visibleIds));
  };

  const clearSelection = () => {
    setSelectedItems(new Set());
    setBulkDeleteMode(false);
  };

  const bulkDeleteSelected = async () => {
    if (selectedItems.size === 0) {
      toast({
        title: "No Items Selected",
        description: "Please select items to delete",
        variant: "default"
      });
      return;
    }

    const confirmMessage = `Are you sure you want to delete ${selectedItems.size} selected items? This action cannot be undone.`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setIsDeleting(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const id of selectedItems) {
        try {
          if (id.startsWith('db_')) {
            const databaseId = id.replace('db_', '');
            const response = await fetch(`/api/history/${databaseId}`, {
              method: 'DELETE',
            });
            
            if (response.ok) {
              successCount++;
            } else {
              errorCount++;
            }
          } else {
            ContentHistoryManager.removeEntry(id);
            successCount++;
          }
        } catch (error) {
          console.error('Error deleting item:', id, error);
          errorCount++;
        }
      }

      // Refresh data and clear selection
      await refetchDbHistory();
      loadHistory();
      setSelectedItems(new Set());
      setBulkDeleteMode(false);

      toast({
        title: "Bulk Delete Complete",
        description: `Successfully deleted ${successCount} items${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
        variant: errorCount > 0 ? "destructive" : "default"
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete bulk delete operation",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const clearAllHistory = async () => {
    try {
      setIsDeleting(true);
      
      // Clear database history via API
      const response = await fetch('/api/history/clear-all', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Also clear local storage for completeness
        ContentHistoryManager.clearHistory();
        
        // Refresh the history display
        await refetchDbHistory();
        loadHistory();
        
        toast({
          title: "History cleared",
          description: "All content generation history has been cleared",
        });
      } else {
        throw new Error(data.error || 'Failed to clear history');
      }
    } catch (error) {
      console.error('❌ Error clearing history:', error);
      toast({
        title: "Error",
        description: "Failed to clear history. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
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
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Eye className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Content History</h1>
              <p className="text-gray-600">View and manage your generated content history</p>
            </div>
          </div>
        </div>

        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Zap className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No content generated yet
          </h3>
          <p className="text-gray-500 mb-4">
            Start by selecting a trending product and generating your first viral content!
          </p>
          <Button onClick={() => window.location.href = '/unified-generator'}>
            Create Content
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-100 rounded-lg">
            <Eye className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Content History</h1>
            <p className="text-gray-600">View and manage your generated content history</p>
          </div>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <div></div>
          <div className="flex gap-2">
            {!bulkDeleteMode ? (
              <Button 
                variant="outline" 
                onClick={() => setBulkDeleteMode(true)}
                className="text-blue-600 hover:text-blue-700"
              >
                <CheckSquare className="h-4 w-4 mr-2" />
                Select Multiple
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={selectAllVisible}
                  disabled={filteredHistory.length === 0}
                  className="text-green-600 hover:text-green-700"
                >
                  <CheckSquare className="h-4 w-4 mr-2" />
                  Select All ({filteredHistory.length})
                </Button>
                <Button 
                  variant="outline" 
                  onClick={bulkDeleteSelected}
                  disabled={selectedItems.size === 0 || isDeleting}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash className="h-4 w-4 mr-2" />
                  {isDeleting ? 'Deleting...' : `Delete Selected (${selectedItems.size})`}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={clearSelection}
                  className="text-gray-600 hover:text-gray-700"
                >
                  Cancel
                </Button>
              </div>
            )}
            <Button 
              variant="outline" 
              onClick={() => {
                if (window.confirm('Are you sure you want to delete all content history? This action cannot be undone.')) {
                  clearAllHistory();
                }
              }}
              disabled={isDeleting}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting ? 'Clearing...' : 'Clear All'}
            </Button>
          </div>
        </div>

        {/* Smart Learning Toggle */}
        <div className="mb-6">
          <SmartLearningToggle userId={1} />
        </div>

        {/* Sync Ratings to Google Sheet Button */}
        <SyncRatingsButton className="mb-6" />

        {/* Sort by AI Ratings */}
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Sort by:</label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort options" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="gpt-highest">GPT Rating: Highest</SelectItem>
                <SelectItem value="gpt-lowest">GPT Rating: Lowest</SelectItem>
                <SelectItem value="claude-highest">Claude Rating: Highest</SelectItem>
                <SelectItem value="claude-lowest">Claude Rating: Lowest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-6">
          <div>
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
          
          <div>
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
          
          <div>
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

          <div>
            <Select value={filters.affiliateLink} onValueChange={(value) => setFilters(prev => ({ ...prev, affiliateLink: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Has / Does not have Affiliate Link" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Affiliate Link / No Affiliate Link</SelectItem>
                <SelectItem value="has">Has Affiliate Link</SelectItem>
                <SelectItem value="none">No Affiliate Link</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Select value={filters.amazonAffiliate} onValueChange={(value) => setFilters(prev => ({ ...prev, amazonAffiliate: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Amazon Affiliate Links" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Amazon Affiliate Links</SelectItem>
                <SelectItem value="amazon">Amazon Affiliate Links</SelectItem>
                <SelectItem value="nonamazon">Non-Amazon Links</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Select value={filters.aiModel} onValueChange={(value) => setFilters(prev => ({ ...prev, aiModel: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="AI Model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Models</SelectItem>
                <SelectItem value="chatgpt">ChatGPT</SelectItem>
                <SelectItem value="claude">Claude</SelectItem>
                <SelectItem value="unknown">Unknown</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Select value={filters.contentFormat} onValueChange={(value) => setFilters(prev => ({ ...prev, contentFormat: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Regular or Spartan Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Regular or Spartan Format</SelectItem>
                <SelectItem value="regular">Regular Format</SelectItem>
                <SelectItem value="spartan">Spartan Format</SelectItem>
                <SelectItem value="unknown">Unknown</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Select value={filters.smartStyle} onValueChange={(value) => setFilters(prev => ({ ...prev, smartStyle: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Smart Style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Smart Style or Standard</SelectItem>
                <SelectItem value="used">Smart Style Used</SelectItem>
                <SelectItem value="none">Standard Style</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="text-right mb-4">
          <p className="text-sm text-gray-500">
            Showing {filteredHistory.length} of {history.length} entries
          </p>
        </div>
      </div>

      {/* History Cards */}
      <div className="space-y-4">
        {filteredHistory.map((entry) => (
          <Card key={entry.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3 flex-1">
                  {bulkDeleteMode && (
                    <Checkbox
                      checked={selectedItems.has(entry.id)}
                      onCheckedChange={() => toggleItemSelection(entry.id)}
                      className="mt-1"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-xl">📦 {entry.productName}</CardTitle>
                      
                      {/* AI Ratings Display */}
                      <div className="flex items-center gap-3 text-sm">
                        {(() => {
                          const evals = evaluationData[entry.id];
                          if (!evals) return null;
                          
                          const gptRating = evals.chatgpt ? calculateAverageRating(evals.chatgpt) : null;
                          const claudeRating = evals.claude ? calculateAverageRating(evals.claude) : null;
                          
                          return (
                            <>
                              {gptRating && (
                                <div className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded">
                                  <span className="text-blue-600 font-medium">GPT:</span>
                                  <span className="text-blue-800 font-bold">{gptRating.toFixed(1)}</span>
                                </div>
                              )}
                              {claudeRating && (
                                <div className="flex items-center gap-1 bg-orange-50 px-2 py-1 rounded">
                                  <span className="text-orange-600 font-medium">Claude:</span>
                                  <span className="text-orange-800 font-bold">{claudeRating.toFixed(1)}</span>
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge className={getNicheColor(entry.niche)}>
                        {entry.niche.charAt(0).toUpperCase() + entry.niche.slice(1)}
                      </Badge>
                      {(entry.platformsSelected || []).map(platform => (
                        <Badge key={platform} className={getPlatformColor(platform)}>
                          {platform}
                        </Badge>
                      ))}
                      
                      {/* AI Model Badge */}
                      {(entry.aiModel || entry.model) && (
                        <Badge className="bg-purple-100 text-purple-800">
                          {(entry.aiModel || entry.model).includes('gpt') || (entry.aiModel || entry.model).includes('chatgpt') ? 'ChatGPT' : 
                           (entry.aiModel || entry.model).includes('claude') ? 'Claude' : 
                           (entry.aiModel || entry.model)}
                        </Badge>
                      )}
                      
                      {/* Content Format Badge */}
                      {entry.contentFormat && (
                        <Badge className={entry.contentFormat.toLowerCase().includes('spartan') ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}>
                          {entry.contentFormat.includes('spartan') ? '🏛️ Spartan' : '📝 Regular'}
                        </Badge>
                      )}
                      
                      {/* Smart Style Badge */}
                      {(entry.topRatedStyleUsed || entry.useSmartStyle) && (
                        <Badge className="bg-green-100 text-green-800">
                          ⭐ Smart Style
                        </Badge>
                      )}
                      
                      {/* Affiliate Link Badge */}
                      {entry.generatedOutput?.affiliateLink && 
                       entry.generatedOutput.affiliateLink.trim() !== '' && 
                       entry.generatedOutput.affiliateLink !== 'N/A' && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          🔗 Affiliate Link
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      Template: {entry.templateUsed ? entry.templateUsed.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : (entry.contentType || 'Unknown')} | 
                      Tone: {entry.tone || 'Unknown'} | 
                      <Calendar className="inline h-4 w-4 ml-2 mr-1" />
                      {formatDate(entry.timestamp)}
                    </p>
                  </div>
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
                      {extractCleanContent(entry.generatedOutput.content)}
                    </div>
                  </div>

                  {/* Generated Caption */}
                  {(() => {
                    // Get the TikTok caption or fallback to main content
                    const platformCaptions = entry.generatedOutput.platformCaptions || {};
                    const tiktokCaption = platformCaptions.tiktok || entry.generatedOutput.tiktokCaption;
                    const caption = tiktokCaption || entry.generatedOutput.content;
                    
                    if (!caption) return null;
                    
                    return (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">Generated Caption:</h4>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(caption, 'Generated Caption', `caption-${entry.id}`)}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            {copiedItems[`caption-${entry.id}`] ? 'Copied!' : 'Copy'}
                          </Button>
                        </div>
                        <div className="bg-white p-3 rounded border text-sm">
                          {typeof caption === 'string' 
                            ? caption 
                            : JSON.stringify(caption, null, 2)}
                        </div>
                      </div>
                    );
                  })()}

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
                  {(() => {
                    // Check for platform captions in both new nested structure and old flat structure
                    const platformCaptions = entry.generatedOutput.platformCaptions || {};
                    const tiktokCaption = platformCaptions.tiktok || entry.generatedOutput.tiktokCaption;
                    const instagramCaption = platformCaptions.instagram || entry.generatedOutput.instagramCaption;
                    const youtubeCaption = platformCaptions.youtube || entry.generatedOutput.youtubeCaption;
                    const twitterCaption = platformCaptions.twitter || platformCaptions.x || entry.generatedOutput.twitterCaption;
                    
                    const hasPlatformCaptions = tiktokCaption || instagramCaption || youtubeCaption || twitterCaption;
                    
                    if (!hasPlatformCaptions) return null;
                    
                    return (
                      <div className="space-y-2">
                        <h4 className="font-medium">Platform-Specific Captions:</h4>
                        <div className="space-y-3">
                          {tiktokCaption && (
                            <div className="bg-white p-3 rounded border">
                              <div className="flex justify-between items-center mb-2">
                                <h5 className="font-medium text-pink-600 flex items-center gap-2">
                                  📱 TikTok Caption
                                </h5>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => copyToClipboard(tiktokCaption, 'TikTok Caption', `tiktok-${entry.id}`)}
                                >
                                  <Copy className="h-4 w-4 mr-2" />
                                  {copiedItems[`tiktok-${entry.id}`] ? 'Copied!' : 'Copy'}
                                </Button>
                              </div>
                              <div className="font-mono text-sm whitespace-pre-wrap bg-gray-50 p-2 rounded">
                                {typeof tiktokCaption === 'string' 
                                  ? tiktokCaption 
                                  : JSON.stringify(tiktokCaption, null, 2)}
                              </div>
                            </div>
                          )}
                          
                          {instagramCaption && (
                            <div className="bg-white p-3 rounded border">
                              <div className="flex justify-between items-center mb-2">
                                <h5 className="font-medium text-purple-600 flex items-center gap-2">
                                  📸 Instagram Caption
                                </h5>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => copyToClipboard(instagramCaption, 'Instagram Caption', `instagram-${entry.id}`)}
                                >
                                  <Copy className="h-4 w-4 mr-2" />
                                  {copiedItems[`instagram-${entry.id}`] ? 'Copied!' : 'Copy'}
                                </Button>
                              </div>
                              <div className="font-mono text-sm whitespace-pre-wrap bg-gray-50 p-2 rounded">
                                {typeof instagramCaption === 'string' 
                                  ? instagramCaption 
                                  : JSON.stringify(instagramCaption, null, 2)}
                              </div>
                            </div>
                          )}
                          
                          {youtubeCaption && (
                            <div className="bg-white p-3 rounded border">
                              <div className="flex justify-between items-center mb-2">
                                <h5 className="font-medium text-red-600 flex items-center gap-2">
                                  📺 YouTube Description
                                </h5>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => copyToClipboard(youtubeCaption, 'YouTube Description', `youtube-${entry.id}`)}
                                >
                                  <Copy className="h-4 w-4 mr-2" />
                                  {copiedItems[`youtube-${entry.id}`] ? 'Copied!' : 'Copy'}
                                </Button>
                              </div>
                              <div className="font-mono text-sm whitespace-pre-wrap bg-gray-50 p-2 rounded">
                                {typeof youtubeCaption === 'string' 
                                  ? youtubeCaption 
                                  : JSON.stringify(youtubeCaption, null, 2)}
                              </div>
                            </div>
                          )}
                          
                          {twitterCaption && (
                            <div className="bg-white p-3 rounded border">
                              <div className="flex justify-between items-center mb-2">
                                <h5 className="font-medium text-blue-600 flex items-center gap-2">
                                  🐦 Twitter/X Post
                                </h5>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => copyToClipboard(twitterCaption, 'Twitter Post', `twitter-${entry.id}`)}
                                >
                                  <Copy className="h-4 w-4 mr-2" />
                                  {copiedItems[`twitter-${entry.id}`] ? 'Copied!' : 'Copy'}
                                </Button>
                              </div>
                              <div className="font-mono text-sm whitespace-pre-wrap bg-gray-50 p-2 rounded">
                                {typeof twitterCaption === 'string' 
                                  ? twitterCaption 
                                  : JSON.stringify(twitterCaption, null, 2)}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}

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
                    <div className="text-xs text-gray-400 mb-2">
                      🔧 RATING DEBUG: entry.id={entry.id}, entry.databaseId={entry.databaseId}, 
                      type={typeof entry.databaseId}, source={entry.source}, 
                      truthyCheck={!!entry.databaseId}
                    </div>
                    {entry.databaseId ? (
                      <>
                        <div className="text-xs text-green-600 mb-2">✅ RATING ENABLED: databaseId = {entry.databaseId}</div>
                        <ContentRating
                          contentHistoryId={entry.databaseId}
                          userId={1}
                          isExpanded={expandedRatings[entry.id]}
                          onToggle={() => toggleRatingExpanded(entry.id)}
                        />
                      </>
                    ) : (
                      <div className="flex items-center gap-2 p-2 border rounded-lg bg-gray-50">
                        <span className="text-sm text-gray-500">
                          Rating available for database-saved content only
                        </span>
                      </div>
                    )}
                  </div>

                  {/* AI Content Evaluation System */}
                  {entry.databaseId && (
                    <div className="border-t pt-4 mt-4">
                      <ContentEvaluationPanel
                        contentHistoryId={entry.databaseId}
                        productName={entry.productName || 'Unknown Product'}
                        onEvaluationComplete={(evaluations) => {
                          console.log('✅ Evaluation completed for content ID:', entry.databaseId, evaluations);
                          toast({
                            title: "Evaluation Saved",
                            description: "Content evaluations have been stored for future reference and learning",
                          });
                        }}
                      />
                    </div>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>
      
      {/* About This Page Component */}
      {(() => {
        const sectionData = getGlowBotSectionByPath('/content-history');
        return sectionData ? (
          <AboutThisPage 
            title={sectionData.name}
            whatItDoes={sectionData.whatItDoes}
            setupRequirements={sectionData.setupRequirements}
            usageInstructions={sectionData.usageInstructions}
            relatedLinks={sectionData.relatedLinks}
            notes={sectionData.notes}
          />
        ) : null;
      })()} 
    </div>
  );
};

export default EnhancedContentHistory;