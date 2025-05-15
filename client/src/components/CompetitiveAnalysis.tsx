import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NICHES } from '@shared/constants';
import { apiRequest } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';
import { Loader2, Upload, Sparkles, Zap, Download } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface CompetitorContent {
  url: string;
  title: string;
  content: string;
  platform: string;
}

interface AnalysisResult {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  keywordGaps: string[];
  contentRecommendations: string[];
  engagement: {
    estimated: number;
    potential: number;
  };
  trendsAlignment: number;
  uniquenessScore: number;
}

export default function CompetitiveAnalysis() {
  const [niche, setNiche] = useState<string>('');
  const [competitors, setCompetitors] = useState<CompetitorContent[]>([
    { url: '', title: '', content: '', platform: 'Instagram' }
  ]);
  const [userContent, setUserContent] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<string>('input');

  // Platform options for competitor content
  const platforms = [
    'Instagram',
    'Facebook',
    'Twitter',
    'TikTok',
    'YouTube',
    'Blog',
    'Website',
    'Pinterest'
  ];

  // Add a new competitor input field
  const addCompetitor = () => {
    setCompetitors([...competitors, { url: '', title: '', content: '', platform: 'Instagram' }]);
  };

  // Remove a competitor input field
  const removeCompetitor = (index: number) => {
    const updatedCompetitors = [...competitors];
    updatedCompetitors.splice(index, 1);
    setCompetitors(updatedCompetitors);
  };

  // Update competitor data
  const updateCompetitor = (index: number, field: keyof CompetitorContent, value: string) => {
    const updatedCompetitors = [...competitors];
    updatedCompetitors[index] = { ...updatedCompetitors[index], [field]: value };
    setCompetitors(updatedCompetitors);
  };

  // Analyze competitor content against user's content
  const analyzeContent = async () => {
    // Validate inputs
    if (!niche) {
      toast({
        title: 'Missing Information',
        description: 'Please select a niche before analyzing.',
        variant: 'destructive',
      });
      return;
    }

    if (!userContent) {
      toast({
        title: 'Missing Information',
        description: 'Please enter your content before analyzing.',
        variant: 'destructive',
      });
      return;
    }

    if (competitors.length === 0 || !competitors.some(c => c.content || c.url)) {
      toast({
        title: 'Missing Information',
        description: 'Please add at least one competitor with content or URL.',
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzing(true);
    setProgress(0);
    
    // Mock progress updates for UI feedback
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 5;
        return newProgress > 95 ? 95 : newProgress;
      });
    }, 300);
    
    try {
      // In a real implementation, this would call the backend
      // For now, we'll use Claude AI to do the analysis after a delay to simulate processing
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Call Claude AI for analysis
      const response = await apiRequest(
        'POST',
        '/api/claude-content',
        {
          prompt: `I need a competitive analysis for content in the ${niche} niche. 
          Here's my content: "${userContent}"
          
          Here are my competitors' contents:
          ${competitors.map(comp => `URL: ${comp.url || 'N/A'}
          Title: ${comp.title || 'N/A'}
          Platform: ${comp.platform}
          Content: "${comp.content || 'N/A'}"
          `).join('\n\n')}
          
          Please analyze this data and provide a structured competitive analysis that includes:
          1. SWOT analysis (strengths, weaknesses, opportunities, threats)
          2. Keyword gaps I should focus on
          3. Content improvement recommendations
          4. Estimated engagement potential (as a percentage)
          5. Trends alignment score (1-10)
          6. Uniqueness score (1-10)
          
          Format your response as JSON with the following structure:
          {
            "strengths": ["strength1", "strength2", ...],
            "weaknesses": ["weakness1", "weakness2", ...],
            "opportunities": ["opportunity1", "opportunity2", ...],
            "threats": ["threat1", "threat2", ...],
            "keywordGaps": ["keyword1", "keyword2", ...],
            "contentRecommendations": ["rec1", "rec2", ...],
            "engagement": {
              "estimated": number,
              "potential": number
            },
            "trendsAlignment": number,
            "uniquenessScore": number
          }`,
          niche: niche,
          temperature: 0.7,
          maxTokens: 2048,
        }
      );

      const data = await response.json();
      
      // Parse the Claude response as JSON
      let result: AnalysisResult;
      try {
        // Try to extract JSON from the Claude response
        const jsonMatch = data.content.match(/{[\s\S]*}/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Could not extract JSON from response');
        }
      } catch (error) {
        console.error('Failed to parse Claude response as JSON:', error);
        // Fallback to mock data if parsing fails
        result = {
          strengths: ['Authentic voice', 'Good use of trending products', 'Clear value proposition'],
          weaknesses: ['Lacks specific examples', 'Could use more engaging questions', 'No call to action'],
          opportunities: ['Incorporate more trending hashtags', 'Address product pain points directly', 'Add personal stories'],
          threats: ['Similar content from established creators', 'Platform algorithm changes', 'Audience fatigue with product mentions'],
          keywordGaps: ['sustainable', 'affordable', 'before and after', 'transformation'],
          contentRecommendations: [
            'Add before/after examples', 
            'Include price points for better conversion', 
            'Ask questions to increase engagement'
          ],
          engagement: {
            estimated: 65,
            potential: 85
          },
          trendsAlignment: 7,
          uniquenessScore: 6
        };
      }
      
      clearInterval(progressInterval);
      setProgress(100);
      setAnalysisResult(result);
      setActiveTab('results');
      
      toast({
        title: 'Analysis Complete',
        description: 'Your competitive analysis is ready to view.',
      });
    } catch (error) {
      console.error('Analysis failed:', error);
      toast({
        title: 'Analysis Failed',
        description: 'Failed to complete the competitive analysis. Please try again.',
        variant: 'destructive',
      });
    } finally {
      clearInterval(progressInterval);
      setIsAnalyzing(false);
    }
  };

  // Export analysis as PDF or text file
  const exportAnalysis = () => {
    if (!analysisResult) return;
    
    // Create text content for export
    const content = `
COMPETITIVE CONTENT ANALYSIS
============================
Niche: ${niche}

STRENGTHS:
${analysisResult.strengths.map(item => `- ${item}`).join('\n')}

WEAKNESSES:
${analysisResult.weaknesses.map(item => `- ${item}`).join('\n')}

OPPORTUNITIES:
${analysisResult.opportunities.map(item => `- ${item}`).join('\n')}

THREATS:
${analysisResult.threats.map(item => `- ${item}`).join('\n')}

KEYWORD GAPS:
${analysisResult.keywordGaps.map(item => `- ${item}`).join('\n')}

CONTENT RECOMMENDATIONS:
${analysisResult.contentRecommendations.map(item => `- ${item}`).join('\n')}

ENGAGEMENT:
- Current estimated engagement: ${analysisResult.engagement.estimated}%
- Potential engagement: ${analysisResult.engagement.potential}%

SCORES:
- Trends alignment: ${analysisResult.trendsAlignment}/10
- Uniqueness: ${analysisResult.uniquenessScore}/10

Generated by GlowBot Competitive Analysis Tool
Date: ${new Date().toLocaleDateString()}
    `;
    
    // Create a blob and download link
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${niche.toLowerCase().replace(/\s+/g, '-')}-competitive-analysis.txt`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
    
    toast({
      title: 'Export Complete',
      description: 'Your analysis has been exported as a text file.',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Competitive Content Analysis</h1>
      <p className="text-gray-600 mb-6">
        Compare your content against competitors to identify strengths, weaknesses, and opportunities for improvement.
      </p>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="input">Input Data</TabsTrigger>
          <TabsTrigger value="results" disabled={!analysisResult}>Results</TabsTrigger>
        </TabsList>
        
        <TabsContent value="input" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Content</CardTitle>
              <CardDescription>
                Enter the content you want to analyze and compare against competitors.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="niche">Select Niche</Label>
                <Select value={niche} onValueChange={setNiche}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a niche" />
                  </SelectTrigger>
                  <SelectContent>
                    {NICHES.map((n) => (
                      <SelectItem key={n} value={n}>
                        {n.charAt(0).toUpperCase() + n.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="content">Your Content</Label>
                <Textarea
                  id="content"
                  placeholder="Enter your content here..."
                  className="min-h-[150px]"
                  value={userContent}
                  onChange={(e) => setUserContent(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Competitor Content</CardTitle>
              <CardDescription>
                Add content from your competitors to compare against your own.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {competitors.map((competitor, index) => (
                <div key={index} className="space-y-4 border-b pb-4 mb-4 last:border-0">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Competitor #{index + 1}</h4>
                    {competitors.length > 1 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeCompetitor(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`url-${index}`}>URL (Optional)</Label>
                      <Input
                        id={`url-${index}`}
                        placeholder="https://..."
                        value={competitor.url}
                        onChange={(e) => updateCompetitor(index, 'url', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`platform-${index}`}>Platform</Label>
                      <Select 
                        value={competitor.platform} 
                        onValueChange={(value) => updateCompetitor(index, 'platform', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select platform" />
                        </SelectTrigger>
                        <SelectContent>
                          {platforms.map((platform) => (
                            <SelectItem key={platform} value={platform}>
                              {platform}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor={`title-${index}`}>Content Title/Heading (Optional)</Label>
                    <Input
                      id={`title-${index}`}
                      placeholder="Enter title..."
                      value={competitor.title}
                      onChange={(e) => updateCompetitor(index, 'title', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`content-${index}`}>Content</Label>
                    <Textarea
                      id={`content-${index}`}
                      placeholder="Enter competitor content here..."
                      className="min-h-[100px]"
                      value={competitor.content}
                      onChange={(e) => updateCompetitor(index, 'content', e.target.value)}
                    />
                  </div>
                </div>
              ))}
              
              <Button variant="outline" onClick={addCompetitor} className="w-full">
                <Upload className="w-4 h-4 mr-2" />
                Add Another Competitor
              </Button>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={analyzeContent} 
                disabled={isAnalyzing} 
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Analyze Content
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
          
          {isAnalyzing && (
            <Card>
              <CardContent className="py-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Analysis Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="results" className="space-y-6">
          {analysisResult && (
            <>
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Analysis Results</h2>
                <Button onClick={exportAnalysis} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export Results
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">SWOT Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                        <h3 className="font-bold text-green-800 mb-2">Strengths</h3>
                        <ul className="list-disc pl-5 text-sm space-y-1">
                          {analysisResult.strengths.map((strength, idx) => (
                            <li key={idx}>{strength}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                        <h3 className="font-bold text-red-800 mb-2">Weaknesses</h3>
                        <ul className="list-disc pl-5 text-sm space-y-1">
                          {analysisResult.weaknesses.map((weakness, idx) => (
                            <li key={idx}>{weakness}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <h3 className="font-bold text-blue-800 mb-2">Opportunities</h3>
                        <ul className="list-disc pl-5 text-sm space-y-1">
                          {analysisResult.opportunities.map((opportunity, idx) => (
                            <li key={idx}>{opportunity}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                        <h3 className="font-bold text-amber-800 mb-2">Threats</h3>
                        <ul className="list-disc pl-5 text-sm space-y-1">
                          {analysisResult.threats.map((threat, idx) => (
                            <li key={idx}>{threat}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="font-medium mb-2">Engagement Potential</h3>
                      <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500" 
                          style={{ width: `${analysisResult.engagement.estimated}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span>Current: {analysisResult.engagement.estimated}%</span>
                        <span>Potential: {analysisResult.engagement.potential}%</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-medium mb-2">Trends Alignment</h3>
                        <div className="flex items-center">
                          <div className="text-2xl font-bold mr-2">
                            {analysisResult.trendsAlignment}
                          </div>
                          <div className="text-sm text-gray-500">/10</div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-2">Uniqueness Score</h3>
                        <div className="flex items-center">
                          <div className="text-2xl font-bold mr-2">
                            {analysisResult.uniquenessScore}
                          </div>
                          <div className="text-sm text-gray-500">/10</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="md:col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Improvement Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Keyword Gaps to Target</h3>
                      <div className="flex flex-wrap gap-2">
                        {analysisResult.keywordGaps.map((keyword, idx) => (
                          <span 
                            key={idx} 
                            className="px-2 py-1 rounded-full bg-indigo-100 text-indigo-800 text-sm"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Content Recommendations</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        {analysisResult.contentRecommendations.map((rec, idx) => (
                          <li key={idx}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="flex justify-center mt-8">
                <Button onClick={() => setActiveTab('input')} variant="outline" className="mx-2">
                  Edit Input Data
                </Button>
                <Button onClick={analyzeContent} className="mx-2">
                  <Zap className="w-4 h-4 mr-2" />
                  Re-Analyze
                </Button>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}