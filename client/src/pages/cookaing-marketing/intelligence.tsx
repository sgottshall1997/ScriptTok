import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Brain, 
  TrendingUp, 
  Heart, 
  Target,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Users,
  Activity,
  Eye
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import InstructionFooter from '@/cookaing-marketing/components/InstructionFooter';

interface IntelligenceStats {
  competitor: { posts: number; insights: number; lastAnalysis: string };
  sentiment: { analyzed: number; positiveRate: number; averageScore: number };
  viral: { predicted: number; highPotential: number; accuracy: number };
  fatigue: { detected: number; topics: number; warnings: number };
}

const CookAIngIntelligence = () => {
  const [activeTab, setActiveTab] = useState('competitors');
  const [competitorInput, setCompetitorInput] = useState('');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [contentInput, setContentInput] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('instagram');
  const [selectedNiche, setSelectedNiche] = useState('food');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch intelligence overview stats
  const { data: stats, isLoading: statsLoading } = useQuery<IntelligenceStats>({
    queryKey: ['/api/cookaing-marketing/intel/status'],
    retry: false,
  });

  // Fetch competitor analysis data
  const { data: competitorData, isLoading: competitorLoading, refetch: refetchCompetitor } = useQuery({
    queryKey: ['/api/cookaing-marketing/intel/competitor'],
    enabled: false, // Only fetch via mutations
    staleTime: 300000,
  });

  // Fetch sentiment analysis data  
  const { data: sentimentData, isLoading: sentimentLoading } = useQuery({
    queryKey: ['/api/cookaing-marketing/intel/sentiment'],
    enabled: false, // Only fetch via mutations
    staleTime: 300000,
  });

  // Competitor analysis mutation
  const analyzeCompetitorMutation = useMutation({
    mutationFn: async (data: { competitor: string; platform: string }) => {
      const response = await apiRequest('POST', '/api/cookaing-marketing/intel/competitor/analyze', {
        content: `Analyze competitor: ${data.competitor}`,
        platform: data.platform,
        niche: selectedNiche,
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Analysis Complete",
        description: `Competitor analysis finished with ${data.data?.insights?.length || 0} insights`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cookaing-marketing/intel/competitor'] });
      queryClient.setQueryData(['/api/cookaing-marketing/intel/competitor'], data);
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze competitor",
        variant: "destructive",
      });
    },
  });

  // Sentiment analysis mutation
  const analyzeSentimentMutation = useMutation({
    mutationFn: async (data: { content: string; platform: string }) => {
      const response = await apiRequest('POST', '/api/cookaing-marketing/intel/sentiment/analyze', {
        content: data.content,
        platform: data.platform,
        niche: selectedNiche,
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Sentiment Analysis Complete",
        description: `Sentiment: ${data.data?.sentiment?.score > 0 ? 'Positive' : 'Negative'} (${(data.data?.sentiment?.score || 0).toFixed(2)})`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cookaing-marketing/intel/sentiment'] });
      queryClient.setQueryData(['/api/cookaing-marketing/intel/sentiment'], data);
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed", 
        description: error instanceof Error ? error.message : "Failed to analyze sentiment",
        variant: "destructive",
      });
    },
  });

  // Viral prediction mutation
  const predictViralMutation = useMutation({
    mutationFn: async (data: { content: string; platform: string }) => {
      const response = await apiRequest('POST', '/api/cookaing-marketing/intel/viral/predict', {
        content: data.content,
        platform: data.platform,
        niche: selectedNiche,
      });
      return response.json();
    },
    onSuccess: (data) => {
      const score = data.data?.viral?.score || 0;
      toast({
        title: "Viral Prediction Complete",
        description: `Viral potential: ${score.toFixed(1)}/10 ${score > 7 ? '🔥' : score > 4 ? '📈' : '📊'}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cookaing-marketing/intel/viral'] });
      queryClient.setQueryData(['/api/cookaing-marketing/intel/viral'], data);
    },
    onError: (error) => {
      toast({
        title: "Prediction Failed",
        description: error instanceof Error ? error.message : "Failed to predict viral potential",
        variant: "destructive",
      });
    },
  });

  // Fatigue detection mutation
  const detectFatigueMutation = useMutation({
    mutationFn: async (data: { content: string; platform: string }) => {
      const response = await apiRequest('POST', '/api/cookaing-marketing/intel/fatigue/detect', {
        content: data.content,
        platform: data.platform,
        niche: selectedNiche,
      });
      return response.json();
    },
    onSuccess: (data) => {
      const severity = data.data?.fatigue?.severity || 'low';
      toast({
        title: "Fatigue Detection Complete",
        description: `Content fatigue: ${severity} ${severity === 'high' ? '⚠️' : severity === 'medium' ? '⚡' : '✅'}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cookaing-marketing/intel/fatigue'] });
      queryClient.setQueryData(['/api/cookaing-marketing/intel/fatigue'], data);
    },
    onError: (error) => {
      toast({
        title: "Detection Failed",
        description: error instanceof Error ? error.message : "Failed to detect content fatigue",
        variant: "destructive",
      });
    },
  });

  const handleCompetitorAnalysis = () => {
    if (!competitorInput.trim()) {
      toast({
        title: "Missing Input",
        description: "Please enter a competitor name or handle",
        variant: "destructive",
      });
      return;
    }
    analyzeCompetitorMutation.mutate({ 
      competitor: competitorInput, 
      platform: platformFilter === 'all' ? selectedPlatform : platformFilter 
    });
  };

  const handleSentimentAnalysis = () => {
    if (!contentInput.trim()) {
      toast({
        title: "Missing Content",
        description: "Please enter content to analyze",
        variant: "destructive",
      });
      return;
    }
    analyzeSentimentMutation.mutate({ content: contentInput, platform: selectedPlatform });
  };

  const handleViralPrediction = () => {
    if (!contentInput.trim()) {
      toast({
        title: "Missing Content",
        description: "Please enter content to analyze",
        variant: "destructive",
      });
      return;
    }
    predictViralMutation.mutate({ content: contentInput, platform: selectedPlatform });
  };

  const handleFatigueDetection = () => {
    if (!contentInput.trim()) {
      toast({
        title: "Missing Content",
        description: "Please enter content to analyze",
        variant: "destructive",
      });
      return;
    }
    detectFatigueMutation.mutate({ content: contentInput, platform: selectedPlatform });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Brain className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Intelligence Center</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Advanced AI-powered content analysis and competitive intelligence
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card data-testid="card-competitor-insights">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Competitor Insights</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="stat-competitor-insights">
                    {statsLoading ? '--' : stats?.competitor?.insights || 0}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-sentiment-score">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Sentiment Score</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="stat-sentiment-score">
                    {statsLoading ? '--' : (stats?.sentiment?.averageScore || 0).toFixed(1)}
                  </p>
                </div>
                <Heart className="h-8 w-8 text-pink-500" />
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-viral-predictions">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Viral Predictions</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="stat-viral-predictions">
                    {statsLoading ? '--' : stats?.viral?.predicted || 0}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-fatigue-warnings">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Fatigue Warnings</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="stat-fatigue-warnings">
                    {statsLoading ? '--' : stats?.fatigue?.warnings || 0}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Intelligence Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="competitors" data-testid="tab-competitors">
            <Users className="h-4 w-4 mr-2" />
            Competitors
          </TabsTrigger>
          <TabsTrigger value="sentiment" data-testid="tab-sentiment">
            <Heart className="h-4 w-4 mr-2" />
            Sentiment
          </TabsTrigger>
          <TabsTrigger value="viral" data-testid="tab-viral">
            <TrendingUp className="h-4 w-4 mr-2" />
            Viral Predictor
          </TabsTrigger>
          <TabsTrigger value="fatigue" data-testid="tab-fatigue">
            <Activity className="h-4 w-4 mr-2" />
            Fatigue
          </TabsTrigger>
        </TabsList>

        {/* Competitors Tab */}
        <TabsContent value="competitors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Competitor Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="competitor-input" data-testid="label-competitor">Competitor Handle/Name</Label>
                  <Input
                    id="competitor-input"
                    placeholder="@competitor_handle or Brand Name"
                    value={competitorInput}
                    onChange={(e) => setCompetitorInput(e.target.value)}
                    data-testid="input-competitor"
                  />
                </div>
                <div>
                  <Label htmlFor="platform-filter" data-testid="label-platform-filter">Platform</Label>
                  <Select value={platformFilter} onValueChange={setPlatformFilter}>
                    <SelectTrigger data-testid="select-platform">
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Platforms</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                      <SelectItem value="youtube">YouTube</SelectItem>
                      <SelectItem value="twitter">Twitter</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={handleCompetitorAnalysis}
                    disabled={analyzeCompetitorMutation.isPending}
                    className="w-full"
                    data-testid="button-analyze-competitor"
                  >
                    {analyzeCompetitorMutation.isPending ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Analyze
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {competitorData && (competitorData as any)?.success && (
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h4 className="font-semibold mb-2">Analysis Results</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Insights Found</p>
                      <p className="text-lg font-bold">{(competitorData as any)?.data?.insights?.length || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Analysis Time</p>
                      <p className="text-lg font-bold">{(competitorData as any)?.metadata?.processingTime || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sentiment Tab */}
        <TabsContent value="sentiment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Sentiment Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="content-input" data-testid="label-content-input">Content to Analyze</Label>
                  <Textarea
                    id="content-input"
                    placeholder="Enter your content here..."
                    value={contentInput}
                    onChange={(e) => setContentInput(e.target.value)}
                    rows={4}
                    data-testid="textarea-content"
                  />
                </div>
                <div>
                  <Label htmlFor="platform-select" data-testid="label-platform-select">Platform</Label>
                  <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                    <SelectTrigger data-testid="select-sentiment-platform">
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                      <SelectItem value="youtube">YouTube</SelectItem>
                      <SelectItem value="twitter">Twitter</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={handleSentimentAnalysis}
                    disabled={analyzeSentimentMutation.isPending}
                    className="w-full"
                    data-testid="button-analyze-sentiment"
                  >
                    {analyzeSentimentMutation.isPending ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Heart className="h-4 w-4 mr-2" />
                        Analyze Sentiment
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Viral Predictor Tab */}
        <TabsContent value="viral" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Viral Potential Predictor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="viral-content" data-testid="label-viral-content">Content to Predict</Label>
                  <Textarea
                    id="viral-content"
                    placeholder="Enter content to predict viral potential..."
                    value={contentInput}
                    onChange={(e) => setContentInput(e.target.value)}
                    rows={4}
                    data-testid="textarea-viral-content"
                  />
                </div>
                <div>
                  <Label htmlFor="viral-platform" data-testid="label-viral-platform">Target Platform</Label>
                  <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                    <SelectTrigger data-testid="select-viral-platform">
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                      <SelectItem value="youtube">YouTube</SelectItem>
                      <SelectItem value="twitter">Twitter</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={handleViralPrediction}
                    disabled={predictViralMutation.isPending}
                    className="w-full"
                    data-testid="button-predict-viral"
                  >
                    {predictViralMutation.isPending ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Predicting...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Predict Viral Potential
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fatigue Tab */}
        <TabsContent value="fatigue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Content Fatigue Detection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="fatigue-content" data-testid="label-fatigue-content">Content/Topic to Check</Label>
                  <Textarea
                    id="fatigue-content"
                    placeholder="Enter content or topic to check for audience fatigue..."
                    value={contentInput}
                    onChange={(e) => setContentInput(e.target.value)}
                    rows={4}
                    data-testid="textarea-fatigue-content"
                  />
                </div>
                <div>
                  <Label htmlFor="fatigue-platform" data-testid="label-fatigue-platform">Platform Context</Label>
                  <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                    <SelectTrigger data-testid="select-fatigue-platform">
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                      <SelectItem value="youtube">YouTube</SelectItem>
                      <SelectItem value="twitter">Twitter</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={handleFatigueDetection}
                    disabled={detectFatigueMutation.isPending}
                    className="w-full"
                    data-testid="button-detect-fatigue"
                  >
                    {detectFatigueMutation.isPending ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Detecting...
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        Detect Fatigue
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <InstructionFooter 
        title="Intelligence Center"
        whatIsIt="Advanced AI-powered content analysis and competitive intelligence platform with 4 core capabilities: competitor analysis, sentiment analysis, viral prediction, and content fatigue detection."
        setupSteps={[
          "Select analysis type from the 4 tabs (Competitors, Sentiment, Viral, Fatigue)",
          "Enter content or competitor information in the input fields",
          "Choose target platform and niche for optimized analysis",
          "Click analyze to get AI-powered insights and recommendations"
        ]}
        usageSteps={[
          "Use Competitor tab to analyze competitors' content strategies and performance",
          "Use Sentiment tab to evaluate emotional impact and audience reception",
          "Use Viral Predictor to assess content's potential for viral spread",
          "Use Fatigue tab to detect when audiences might be getting tired of topics"
        ]}
      />
    </div>
  );
};

export default CookAIngIntelligence;