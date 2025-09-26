import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Target, Eye, Zap, MessageSquare, Star } from 'lucide-react';

interface ViralScore {
  overall: number;
  breakdown: {
    length: number;
    clarity: number;
    trending: number;
    engagement: number;
    hookStrength: number;
  };
  colorCode: string;
  suggestions: string[];
}

interface ViralScoreDisplayProps {
  viralScore: ViralScore | null;
  overallScore: number | null;
}

export function ViralScoreDisplay({ viralScore, overallScore }: ViralScoreDisplayProps) {
  // Use viralScore data if available, otherwise fall back to overallScore
  const scoreData = viralScore;
  const displayScore = scoreData?.overall || overallScore || 0;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreGrade = (score: number) => {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <Star className="w-5 h-5 text-green-600" />;
    if (score >= 60) return <TrendingUp className="w-5 h-5 text-yellow-600" />;
    return <Target className="w-5 h-5 text-red-600" />;
  };

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'length': return <Target className="w-4 h-4" />;
      case 'clarity': return <Eye className="w-4 h-4" />;
      case 'trending': return <TrendingUp className="w-4 h-4" />;
      case 'engagement': return <MessageSquare className="w-4 h-4" />;
      case 'hookStrength': return <Zap className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  const formatMetricName = (metric: string) => {
    switch (metric) {
      case 'hookStrength': return 'Hook Strength';
      case 'trending': return 'Trend Potential';
      case 'engagement': return 'Engagement';
      case 'clarity': return 'Clarity';
      case 'length': return 'Length Opt.';
      default: return metric;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Viral Score Analysis
          <Badge variant="outline" className="ml-auto">
            Performance Metrics
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Overall Viral Score */}
        <div className={`text-center p-6 mb-6 rounded-lg border-2 ${getScoreColor(displayScore)}`}>
          <div className="flex items-center justify-center gap-3 mb-2">
            {getScoreIcon(displayScore)}
            <h3 className="text-lg font-semibold">Overall Viral Score</h3>
          </div>
          <div className="text-4xl font-bold mb-2">
            {displayScore}/100
          </div>
          <Badge className={`text-sm ${getScoreColor(displayScore)}`}>
            Grade: {getScoreGrade(displayScore)}
          </Badge>
        </div>

        {/* Score Breakdown */}
        {scoreData?.breakdown && (
          <div className="space-y-4 mb-6">
            <h4 className="font-semibold text-gray-900">Performance Breakdown</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(scoreData.breakdown).map(([metric, score]) => (
                <div key={metric} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    {getMetricIcon(metric)}
                    <span className="font-medium text-sm">{formatMetricName(metric)}</span>
                  </div>
                  <Badge className={`${getScoreColor(score)} font-bold`}>
                    {score}/100
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Suggestions */}
        {scoreData?.suggestions && scoreData.suggestions.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">AI Optimization Tips</h4>
            <div className="space-y-2">
              {scoreData.suggestions.map((suggestion, index) => (
                <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Star className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-blue-800">{suggestion}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No data fallback */}
        {!scoreData && !overallScore && (
          <div className="text-center py-6 text-gray-500">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">Viral score analysis will appear here after content generation</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}