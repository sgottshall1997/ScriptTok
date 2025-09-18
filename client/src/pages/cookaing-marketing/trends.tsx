import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  Calendar, 
  Snowflake,
  Sun,
  Leaf,
  Flower,
  Clock,
  Target,
  BarChart3,
  Eye
} from "lucide-react";

interface TrendData {
  id: string;
  name: string;
  category: 'recipe' | 'ingredient' | 'technique' | 'diet';
  trendScore: number;
  weeklyGrowth: number;
  searchVolume: number;
  season: 'spring' | 'summer' | 'fall' | 'winter' | 'year-round';
  peakMonth: string;
  description: string;
  relatedTerms: string[];
}

interface SeasonalCampaign {
  id: string;
  name: string;
  season: string;
  startDate: string;
  endDate: string;
  status: 'planning' | 'active' | 'completed';
  type: 'recipe' | 'product' | 'content';
  targetAudience: string;
  expectedReach: number;
}

// Mock data for trending topics
const mockTrends: TrendData[] = [
  {
    id: "1",
    name: "Air Fryer Recipes",
    category: "technique",
    trendScore: 92,
    weeklyGrowth: 15.3,
    searchVolume: 45600,
    season: "year-round",
    peakMonth: "January",
    description: "Quick, healthy cooking with air fryers gaining massive popularity",
    relatedTerms: ["crispy", "oil-free", "quick meals", "healthy cooking"]
  },
  {
    id: "2",
    name: "Plant-Based Protein",
    category: "diet",
    trendScore: 88,
    weeklyGrowth: 12.7,
    searchVolume: 33200,
    season: "year-round",
    peakMonth: "February",
    description: "Growing interest in vegan and vegetarian protein sources",
    relatedTerms: ["vegan", "vegetarian", "protein", "legumes", "tofu"]
  },
  {
    id: "3",
    name: "Summer Grilling",
    category: "technique",
    trendScore: 75,
    weeklyGrowth: 8.9,
    searchVolume: 28900,
    season: "summer",
    peakMonth: "July",
    description: "BBQ and outdoor cooking trends peak during summer months",
    relatedTerms: ["bbq", "grilling", "outdoor cooking", "marinades"]
  },
  {
    id: "4",
    name: "Oat-Based Everything",
    category: "ingredient",
    trendScore: 69,
    weeklyGrowth: 6.2,
    searchVolume: 19800,
    season: "year-round",
    peakMonth: "March",
    description: "Oats trending in everything from milk to cookies to savory dishes",
    relatedTerms: ["oat milk", "overnight oats", "oat flour", "oatmeal"]
  }
];

// Mock data for seasonal campaigns
const mockCampaigns: SeasonalCampaign[] = [
  {
    id: "1",
    name: "Winter Comfort Foods",
    season: "Winter 2025",
    startDate: "2025-01-01",
    endDate: "2025-03-20",
    status: "active",
    type: "recipe",
    targetAudience: "Home cooks seeking warmth",
    expectedReach: 15000
  },
  {
    id: "2",
    name: "Spring Detox Campaign",
    season: "Spring 2025",
    startDate: "2025-03-21",
    endDate: "2025-06-20",
    status: "planning",
    type: "content",
    targetAudience: "Health-conscious consumers",
    expectedReach: 22000
  },
  {
    id: "3",
    name: "Holiday Baking Series",
    season: "Winter 2024",
    startDate: "2024-11-01",
    endDate: "2024-12-31",
    status: "completed",
    type: "recipe",
    targetAudience: "Holiday entertainers",
    expectedReach: 35000
  }
];

export default function TrendsPage() {
  const [activeTab, setActiveTab] = useState("trends");

  const getSeasonIcon = (season: string) => {
    switch (season) {
      case 'spring': return Flower;
      case 'summer': return Sun;
      case 'fall': return Leaf;
      case 'winter': return Snowflake;
      default: return Calendar;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'recipe': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'ingredient': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'technique': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'diet': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'planning': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'completed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <TrendingUp className="h-8 w-8" />
            Trends & Seasonal
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track trending topics and plan seasonal marketing campaigns
          </p>
        </div>
        <Button data-testid="button-create-campaign">
          <Target className="h-4 w-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Trending Topics</p>
                <p className="text-2xl font-bold">{mockTrends.length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Campaigns</p>
                <p className="text-2xl font-bold text-green-600">
                  {mockCampaigns.filter(c => c.status === 'active').length}
                </p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Growth</p>
                <p className="text-2xl font-bold text-purple-600">
                  +{(mockTrends.reduce((sum, t) => sum + t.weeklyGrowth, 0) / mockTrends.length).toFixed(1)}%
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Reach</p>
                <p className="text-2xl font-bold text-orange-600">
                  {mockCampaigns.reduce((sum, c) => sum + c.expectedReach, 0).toLocaleString()}
                </p>
              </div>
              <Eye className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different trend aspects */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="trends" data-testid="tab-trends">Trending Topics</TabsTrigger>
          <TabsTrigger value="seasonal" data-testid="tab-seasonal">Seasonal Campaigns</TabsTrigger>
        </TabsList>

        {/* Trending Topics Tab */}
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Trending Topics</CardTitle>
              <CardDescription>
                Real-time trend analysis for food and cooking topics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {mockTrends.map((trend) => {
                  const SeasonIcon = getSeasonIcon(trend.season);
                  
                  return (
                    <Card key={trend.id} data-testid={`card-trend-${trend.id}`} 
                          className="border-l-4 border-l-green-500">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-semibold mb-1">{trend.name}</h3>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={getCategoryColor(trend.category)}>
                                {trend.category.charAt(0).toUpperCase() + trend.category.slice(1)}
                              </Badge>
                              <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                <SeasonIcon className="h-3 w-3" />
                                {trend.season === 'year-round' ? 'Year-round' : trend.season.charAt(0).toUpperCase() + trend.season.slice(1)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-2xl font-bold ${getTrendScoreColor(trend.trendScore)}`}>
                              {trend.trendScore}
                            </div>
                            <div className="text-xs text-gray-500">Trend Score</div>
                          </div>
                        </div>

                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                          {trend.description}
                        </p>

                        <div className="grid gap-2 text-sm mb-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Weekly Growth:</span>
                            <span className="font-medium text-green-600">+{trend.weeklyGrowth}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Search Volume:</span>
                            <span className="font-medium">{trend.searchVolume.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Peak Month:</span>
                            <span className="font-medium">{trend.peakMonth}</span>
                          </div>
                        </div>

                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Related Terms:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {trend.relatedTerms.map((term) => (
                              <Badge key={term} variant="secondary" className="text-xs">
                                {term}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" data-testid={`button-analyze-${trend.id}`}>
                            <BarChart3 className="h-3 w-3 mr-1" />
                            Analyze
                          </Button>
                          <Button variant="outline" size="sm" data-testid={`button-campaign-${trend.id}`}>
                            <Target className="h-3 w-3 mr-1" />
                            Create Campaign
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Seasonal Campaigns Tab */}
        <TabsContent value="seasonal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Seasonal Campaigns</CardTitle>
              <CardDescription>
                Plan and track marketing campaigns aligned with seasonal trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockCampaigns.map((campaign) => (
                  <Card key={campaign.id} data-testid={`card-campaign-${campaign.id}`} 
                        className="border-l-4 border-l-blue-500">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{campaign.name}</h3>
                            <Badge variant="outline" className={getStatusColor(campaign.status)}>
                              {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                            </Badge>
                          </div>
                          
                          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 mb-3">
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600 dark:text-gray-400">{campaign.season}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600 dark:text-gray-400">
                                {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Target className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600 dark:text-gray-400">{campaign.type.charAt(0).toUpperCase() + campaign.type.slice(1)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Eye className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600 dark:text-gray-400">{campaign.expectedReach.toLocaleString()} reach</span>
                            </div>
                          </div>

                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                            <strong>Target Audience:</strong> {campaign.targetAudience}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <Button variant="outline" size="sm" data-testid={`button-edit-campaign-${campaign.id}`}>
                            <Target className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" data-testid={`button-view-campaign-${campaign.id}`}>
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Help Text */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100">
                Trend Strategy Tips
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Monitor trending topics weekly and plan seasonal campaigns 2-3 months in advance. 
                Align content with peak search periods and leverage related terms for better discoverability.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}