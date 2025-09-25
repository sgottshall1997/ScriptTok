import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Search, 
  Loader2, 
  BookmarkPlus, 
  TrendingUp, 
  Package, 
  DollarSign,
  Target,
  Lightbulb,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ProductOpportunity {
  id: number;
  category: string;
  opportunity: string;
  reasoning: string;
  createdAt: string;
}

interface ResearchResult {
  category: string;
  opportunities: Array<{
    opportunity: string;
    reasoning: string;
  }>;
}

const ProductResearch = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [category, setCategory] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<ResearchResult | null>(null);

  // Fetch saved opportunities
  const { data: savedOpportunities = [], isLoading: savedLoading } = useQuery<ProductOpportunity[]>({
    queryKey: ['/api/product-research/opportunities'],
  });

  // Search for product opportunities
  const searchMutation = useMutation({
    mutationFn: async (searchCategory: string) => {
      setIsSearching(true);
      const response = await apiRequest('/api/product-research', {
        method: 'POST',
        body: { category: searchCategory },
      });
      return response;
    },
    onSuccess: (data) => {
      setSearchResults(data);
      setIsSearching(false);
      toast({
        title: "Research Complete",
        description: `Found ${data.opportunities.length} product opportunities for ${data.category}`,
      });
    },
    onError: (error) => {
      setIsSearching(false);
      toast({
        title: "Research Failed",
        description: error instanceof Error ? error.message : "Unable to complete research",
        variant: "destructive",
      });
    },
  });

  // Save opportunity mutation
  const saveOpportunityMutation = useMutation({
    mutationFn: async (opportunity: { category: string; opportunity: string; reasoning: string }) => {
      return await apiRequest('/api/product-research/save', {
        method: 'POST',
        body: opportunity,
      });
    },
    onSuccess: () => {
      toast({
        title: "Opportunity Saved",
        description: "Product opportunity has been saved to your collection",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/product-research/opportunities'] });
    },
    onError: (error) => {
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Unable to save opportunity",
        variant: "destructive",
      });
    },
  });

  // Delete opportunity mutation
  const deleteOpportunityMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/product-research/opportunities/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      toast({
        title: "Opportunity Deleted",
        description: "Product opportunity has been removed from your collection",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/product-research/opportunities'] });
    },
    onError: (error) => {
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Unable to delete opportunity",
        variant: "destructive",
      });
    },
  });

  const handleSearch = () => {
    if (!category.trim()) {
      toast({
        title: "Category Required",
        description: "Please enter a product category to research",
        variant: "destructive",
      });
      return;
    }
    searchMutation.mutate(category.trim());
  };

  const handleSaveOpportunity = (opportunity: string, reasoning: string) => {
    if (!searchResults) return;
    
    saveOpportunityMutation.mutate({
      category: searchResults.category,
      opportunity,
      reasoning,
    });
  };

  const handleDeleteOpportunity = (id: number) => {
    deleteOpportunityMutation.mutate(id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
          <Lightbulb className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Product Research</h1>
          <p className="text-muted-foreground">
            Discover trending product opportunities using AI-powered market analysis
          </p>
        </div>
      </div>

      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Research Product Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Product Category</Label>
            <div className="flex gap-2">
              <Input
                id="category"
                placeholder="e.g., fitness equipment, home decor, tech gadgets..."
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                data-testid="input-category"
              />
              <Button 
                onClick={handleSearch} 
                disabled={isSearching || !category.trim()}
                data-testid="button-search"
              >
                {isSearching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                Search
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Enter a product category to discover trending opportunities and market gaps
          </p>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Opportunities for "{searchResults.category}"
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {searchResults.opportunities.map((item, index) => (
                <div 
                  key={index} 
                  className="p-4 border rounded-lg space-y-3"
                  data-testid={`opportunity-${index}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Package className="h-4 w-4 text-blue-600" />
                        {item.opportunity}
                      </h3>
                      <p className="text-muted-foreground">{item.reasoning}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleSaveOpportunity(item.opportunity, item.reasoning)}
                      disabled={saveOpportunityMutation.isPending}
                      data-testid={`button-save-${index}`}
                    >
                      {saveOpportunityMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <BookmarkPlus className="h-4 w-4" />
                      )}
                      Save
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Saved Opportunities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookmarkPlus className="h-5 w-5" />
            Saved Opportunities ({savedOpportunities.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {savedLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : savedOpportunities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No saved opportunities yet</p>
              <p className="text-sm">Search for product categories to discover opportunities</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {savedOpportunities.map((item) => (
                <div 
                  key={item.id} 
                  className="p-4 border rounded-lg space-y-3"
                  data-testid={`saved-opportunity-${item.id}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{item.category}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Package className="h-4 w-4 text-blue-600" />
                        {item.opportunity}
                      </h3>
                      <p className="text-muted-foreground">{item.reasoning}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteOpportunity(item.id)}
                      disabled={deleteOpportunityMutation.isPending}
                      data-testid={`button-delete-${item.id}`}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductResearch;