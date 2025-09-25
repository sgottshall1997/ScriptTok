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
  AlertCircle,
  Users,
  BarChart3,
  ShoppingCart,
  TestTube,
  CheckCircle2,
  XCircle,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ProductOpportunity {
  id: number;
  category: string;
  opportunity: string;
  reasoning: string;
  createdAt: string;
  
  // New actionable fields
  specificProduct: string;
  whyThisProduct: string;
  monthlySearchVolume?: number;
  tiktokVideoCount?: number;
  redditMentions?: number;
  competitorBrands?: Array<{name: string; pricePoint: string}>;
  marketSaturation: string;
  saturationReasoning: string;
  manufacturingCost?: string;
  typicalRetailPrice?: string;
  grossMarginPercent?: string;
  marginCalculation?: string;
  targetDemographic: string;
  customerPainPoint: string;
  testDifficulty: string;
  testDifficultyReasoning: string;
  goNoGoScore?: number;
  recommendation: string;
}

interface ActionableOpportunity {
  opportunity: string;
  reasoning: string;
  
  // New actionable fields
  specificProduct: string;
  whyThisProduct: string;
  monthlySearchVolume?: number;
  tiktokVideoCount?: number;
  redditMentions?: number;
  competitorBrands?: Array<{name: string; pricePoint: string}>;
  marketSaturation: string;
  saturationReasoning: string;
  manufacturingCost?: string;
  typicalRetailPrice?: string;
  grossMarginPercent?: string;
  marginCalculation?: string;
  targetDemographic: string;
  customerPainPoint: string;
  testDifficulty: string;
  testDifficultyReasoning: string;
  goNoGoScore?: number;
  recommendation: string;
}

interface ResearchResult {
  category: string;
  opportunities: ActionableOpportunity[];
}

// Utility functions for data display
const getTrafficLight = (saturation: string) => {
  switch (saturation.toUpperCase()) {
    case 'LOW': return { emoji: '🟢', color: 'text-green-600', bg: 'bg-green-50' };
    case 'MEDIUM': return { emoji: '🟡', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    case 'HIGH': return { emoji: '🔴', color: 'text-red-600', bg: 'bg-red-50' };
    default: return { emoji: '🟡', color: 'text-gray-600', bg: 'bg-gray-50' };
  }
};

const getRecommendationBadge = (recommendation: string) => {
  switch (recommendation.toUpperCase()) {
    case 'WORTH_TESTING': 
      return { variant: 'default' as const, color: 'bg-green-600', text: 'WORTH TESTING ✅' };
    case 'SKIP': 
      return { variant: 'destructive' as const, color: 'bg-red-600', text: 'SKIP ❌' };
    case 'MAYBE': 
      return { variant: 'secondary' as const, color: 'bg-yellow-600', text: 'MAYBE ⚠️' };
    default: 
      return { variant: 'secondary' as const, color: 'bg-gray-600', text: 'REVIEW 📋' };
  }
};

const formatNumber = (num?: number) => {
  if (!num) return 'Data not available';
  return num.toLocaleString();
};

interface ActionableOpportunityCardProps {
  opportunity: ActionableOpportunity;
  index: number;
  onSave: () => void;
  isSaving: boolean;
}

const ActionableOpportunityCard: React.FC<ActionableOpportunityCardProps> = ({ 
  opportunity, 
  index, 
  onSave, 
  isSaving 
}) => {
  const traffic = getTrafficLight(opportunity.marketSaturation);
  const recBadge = getRecommendationBadge(opportunity.recommendation);
  const score = opportunity.goNoGoScore || 50;

  return (
    <div 
      className="border-2 rounded-xl p-6 space-y-4"
      data-testid={`opportunity-${index}`}
      style={{
        borderColor: opportunity.recommendation === 'WORTH_TESTING' ? '#16a34a' : 
                    opportunity.recommendation === 'SKIP' ? '#dc2626' : '#6b7280'
      }}
    >
      {/* Header with Product Name and Score */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-bold text-gray-900">{opportunity.specificProduct}</h3>
            <div className="flex items-center gap-2">
              <div className={`px-3 py-1 rounded-full text-sm font-semibold ${recBadge.color} text-white`}>
                {recBadge.text}
              </div>
              <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm font-semibold">
                Score: {score}/100
              </div>
            </div>
          </div>
          <p className="text-gray-600 mb-3">{opportunity.whyThisProduct}</p>
        </div>
        <Button
          size="lg"
          onClick={onSave}
          disabled={isSaving}
          data-testid={`button-save-${index}`}
          className="shrink-0"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <BookmarkPlus className="h-4 w-4" />
          )}
          Save
        </Button>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Margin Calculation - Most Prominent */}
        <div className="md:col-span-2 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <span className="font-semibold text-green-800">Profit Potential</span>
          </div>
          <div className="text-2xl font-bold text-green-700">
            {opportunity.marginCalculation || 'Margin data not available'}
          </div>
          {opportunity.grossMarginPercent && (
            <div className="text-sm text-green-600 mt-1">
              {opportunity.grossMarginPercent}% gross margin
            </div>
          )}
        </div>

        {/* Competition Level */}
        <div className={`${traffic.bg} border rounded-lg p-4`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{traffic.emoji}</span>
            <span className="font-semibold">Competition</span>
          </div>
          <div className={`text-lg font-bold ${traffic.color}`}>
            {opportunity.marketSaturation}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {opportunity.saturationReasoning}
          </div>
        </div>

        {/* Test Difficulty */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TestTube className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-blue-800">Test Difficulty</span>
          </div>
          <div className="text-lg font-bold text-blue-700">
            {opportunity.testDifficulty}
          </div>
          <div className="text-sm text-blue-600 mt-1">
            {opportunity.testDifficultyReasoning}
          </div>
        </div>
      </div>

      {/* Demand Proof */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="h-5 w-5 text-purple-600" />
          <span className="font-semibold text-purple-800">Demand Proof</span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-gray-600">Monthly Searches</div>
            <div className="font-bold text-purple-700">
              {formatNumber(opportunity.monthlySearchVolume)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">TikTok Videos (30d)</div>
            <div className="font-bold text-purple-700">
              {formatNumber(opportunity.tiktokVideoCount)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Reddit Mentions (90d)</div>
            <div className="font-bold text-purple-700">
              {formatNumber(opportunity.redditMentions)}
            </div>
          </div>
        </div>
      </div>

      {/* Target Customer */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Users className="h-5 w-5 text-orange-600" />
          <span className="font-semibold text-orange-800">Target Customer</span>
        </div>
        <div className="text-gray-700">
          <strong>Who:</strong> {opportunity.targetDemographic}
        </div>
        <div className="text-gray-700 mt-1">
          <strong>Problem:</strong> {opportunity.customerPainPoint}
        </div>
      </div>

      {/* Competitors */}
      {opportunity.competitorBrands && opportunity.competitorBrands.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingCart className="h-5 w-5 text-gray-600" />
            <span className="font-semibold text-gray-800">Key Competitors</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {opportunity.competitorBrands.slice(0, 6).map((comp, idx) => (
              <div key={idx} className="text-sm">
                <span className="font-medium">{comp.name}</span>
                {comp.pricePoint !== 'Data not available' && (
                  <div className="text-gray-600">{comp.pricePoint}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Decision Summary */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {opportunity.recommendation === 'WORTH_TESTING' ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : opportunity.recommendation === 'SKIP' ? (
                <XCircle className="h-5 w-5 text-red-600" />
              ) : (
                <Clock className="h-5 w-5 text-yellow-600" />
              )}
              <span className="font-medium">
                {opportunity.recommendation === 'WORTH_TESTING' ? 'Ready to test with $500' :
                 opportunity.recommendation === 'SKIP' ? 'Skip this opportunity' :
                 'Needs more research'}
              </span>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Decision time: &lt; 30 seconds
          </div>
        </div>
      </div>
    </div>
  );
};

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
      const response = await apiRequest('POST', '/api/product-research', { category: searchCategory });
      return await response.json();
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
    mutationFn: async (opportunity: ActionableOpportunity & { category: string }) => {
      const response = await apiRequest('POST', '/api/product-research/save', opportunity);
      return await response.json();
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
      const response = await apiRequest('DELETE', `/api/product-research/opportunities/${id}`);
      return await response.json();
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

  const handleSaveOpportunity = (opportunityData: ActionableOpportunity) => {
    if (!searchResults) return;
    
    saveOpportunityMutation.mutate({
      category: searchResults.category,
      ...opportunityData,
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

      {/* Actionable Search Results */}
      {searchResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Product Opportunities for "{searchResults.category}"
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              {searchResults.opportunities.map((item, index) => (
                <ActionableOpportunityCard 
                  key={index}
                  opportunity={item}
                  index={index}
                  onSave={() => handleSaveOpportunity(item)}
                  isSaving={saveOpportunityMutation.isPending}
                />
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