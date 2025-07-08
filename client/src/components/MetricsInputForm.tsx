import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, DollarSign, Eye, Heart, Share, MessageCircle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface MetricsInputFormProps {
  contentId?: string;
  onMetricsSubmitted?: (metrics: any) => void;
}

const PLATFORMS = [
  { id: 'tiktok', name: 'TikTok', icon: '🎵' },
  { id: 'instagram', name: 'Instagram', icon: '📸' },
  { id: 'youtube', name: 'YouTube', icon: '📺' },
  { id: 'twitter', name: 'Twitter/X', icon: '🐦' },
  { id: 'threads', name: 'Threads', icon: '🧵' },
  { id: 'pinterest', name: 'Pinterest', icon: '📌' }
];

export function MetricsInputForm({ contentId, onMetricsSubmitted }: MetricsInputFormProps) {
  const [platform, setPlatform] = useState('');
  const [metrics, setMetrics] = useState({
    views: '',
    likes: '',
    shares: '',
    comments: '',
    clickThrough: '',
    conversions: '',
    revenue: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const { toast } = useToast();

  const handleMetricChange = (field: string, value: string) => {
    setMetrics(prev => ({ ...prev, [field]: value }));
  };

  const calculateCTR = () => {
    const views = parseInt(metrics.views) || 0;
    const clicks = parseInt(metrics.clickThrough) || 0;
    return views > 0 ? ((clicks / views) * 100).toFixed(2) : '0';
  };

  const calculateConversionRate = () => {
    const clicks = parseInt(metrics.clickThrough) || 0;
    const conversions = parseInt(metrics.conversions) || 0;
    return clicks > 0 ? ((conversions / clicks) * 100).toFixed(2) : '0';
  };

  const submitMetrics = async () => {
    if (!platform || !contentId) {
      toast({
        title: "Missing information",
        description: "Please select a platform and ensure content ID is provided",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Submit manual metrics
      const metricsResponse = await apiRequest('POST', '/api/metrics/manual', {
        contentId,
        platform,
        views: parseInt(metrics.views) || 0,
        likes: parseInt(metrics.likes) || 0,
        shares: parseInt(metrics.shares) || 0,
        comments: parseInt(metrics.comments) || 0,
        clickThrough: parseFloat(metrics.clickThrough) || 0,
        conversions: parseInt(metrics.conversions) || 0,
        revenue: parseFloat(metrics.revenue) || 0
      });

      const metricsData = await metricsResponse.json();
      
      if (metricsData.success) {
        // Get AI analysis
        const analysisResponse = await apiRequest('POST', '/api/metrics/analyze', {
          contentId,
          platform
        });

        const analysisData = await analysisResponse.json();
        if (analysisData.success) {
          setAiAnalysis(analysisData.feedback);
        }

        if (onMetricsSubmitted) {
          onMetricsSubmitted(metricsData.metrics);
        }

        toast({
          title: "Metrics submitted",
          description: "Performance data has been recorded and analyzed"
        });

        // Reset form
        setMetrics({
          views: '',
          likes: '',
          shares: '',
          comments: '',
          clickThrough: '',
          conversions: '',
          revenue: ''
        });
      }
    } catch (error) {
      toast({
        title: "Submission failed",
        description: "Failed to submit metrics. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          Manual Performance Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Platform Selection */}
        <div>
          <label className="text-sm font-medium mb-2 block">Platform</label>
          <Select value={platform} onValueChange={setPlatform}>
            <SelectTrigger>
              <SelectValue placeholder="Select platform" />
            </SelectTrigger>
            <SelectContent>
              {PLATFORMS.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  <div className="flex items-center gap-2">
                    <span>{p.icon}</span>
                    <span>{p.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Engagement Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block flex items-center gap-1">
              <Eye className="h-4 w-4" />
              Views
            </label>
            <Input
              type="number"
              placeholder="0"
              value={metrics.views}
              onChange={(e) => handleMetricChange('views', e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block flex items-center gap-1">
              <Heart className="h-4 w-4" />
              Likes
            </label>
            <Input
              type="number"
              placeholder="0"
              value={metrics.likes}
              onChange={(e) => handleMetricChange('likes', e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block flex items-center gap-1">
              <Share className="h-4 w-4" />
              Shares
            </label>
            <Input
              type="number"
              placeholder="0"
              value={metrics.shares}
              onChange={(e) => handleMetricChange('shares', e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              Comments
            </label>
            <Input
              type="number"
              placeholder="0"
              value={metrics.comments}
              onChange={(e) => handleMetricChange('comments', e.target.value)}
            />
          </div>
        </div>

        {/* Conversion Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Click-Through</label>
            <Input
              type="number"
              placeholder="0"
              value={metrics.clickThrough}
              onChange={(e) => handleMetricChange('clickThrough', e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Conversions</label>
            <Input
              type="number"
              placeholder="0"
              value={metrics.conversions}
              onChange={(e) => handleMetricChange('conversions', e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              Revenue
            </label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={metrics.revenue}
              onChange={(e) => handleMetricChange('revenue', e.target.value)}
            />
          </div>
        </div>

        {/* Calculated Metrics */}
        {(metrics.views || metrics.clickThrough || metrics.conversions) && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Calculated Metrics</h4>
            <div className="flex gap-4 text-sm">
              <Badge variant="secondary">CTR: {calculateCTR()}%</Badge>
              <Badge variant="secondary">Conversion Rate: {calculateConversionRate()}%</Badge>
              {metrics.revenue && metrics.conversions && (
                <Badge variant="secondary">
                  Avg Order: ${(parseFloat(metrics.revenue) / parseInt(metrics.conversions) || 0).toFixed(2)}
                </Badge>
              )}
            </div>
          </div>
        )}

        <Button 
          onClick={submitMetrics} 
          disabled={isSubmitting || !platform}
          className="w-full"
        >
          {isSubmitting ? "Submitting..." : "Submit Metrics & Get AI Analysis"}
        </Button>

        {/* AI Analysis Results */}
        {aiAnalysis && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">AI Performance Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-sm">{aiAnalysis}</pre>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}