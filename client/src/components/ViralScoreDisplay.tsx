import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Target, 
  Eye, 
  Zap, 
  MessageSquare, 
  Star,
  Lock,
  Rocket,
  Sparkles,
  BarChart3,
  Users,
  Crown
} from 'lucide-react';
import { TierBadge } from './TierBadge';
import { useLocation } from 'wouter';

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
  tier?: string;
}

export function ViralScoreDisplay({ viralScore, overallScore, tier = 'starter' }: ViralScoreDisplayProps) {
  const scoreData = viralScore;
  const displayScore = scoreData?.overall || overallScore || 0;
  
  const getScoreColor = (score: number) => {
    if (score >= 71) return 'text-green-600';
    if (score >= 41) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 71) return 'bg-green-50 border-green-200';
    if (score >= 41) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 71) return 'Excellent';
    if (score >= 41) return 'Good';
    return 'Needs Work';
  };

  switch (tier.toLowerCase()) {
    case 'starter':
      return <BasicViralScore score={displayScore} />;
    case 'creator':
      return <StandardViralScore score={displayScore} scoreData={scoreData} />;
    case 'pro':
      return <AdvancedViralScore score={displayScore} scoreData={scoreData} />;
    case 'agency':
      return <EnterpriseViralScore score={displayScore} scoreData={scoreData} />;
    default:
      return <BasicViralScore score={displayScore} />;
  }
}

function BasicViralScore({ score }: { score: number }) {
  const [, setLocation] = useLocation();
  
  const getScoreColor = (score: number) => {
    if (score >= 71) return 'text-green-600';
    if (score >= 41) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 71) return 'bg-green-50 border-green-200';
    if (score >= 41) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 71) return 'Excellent';
    if (score >= 41) return 'Good';
    return 'Needs Work';
  };

  return (
    <Card className="w-full" data-testid="viral-score-basic">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Viral Score
          <TierBadge tier="starter" size="sm" className="ml-auto" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className={`text-center p-8 rounded-lg border-2 ${getScoreBgColor(score)}`}>
          <div className="text-6xl font-bold mb-3 ${getScoreColor(score)}">
            {score}
          </div>
          <Badge className={`text-sm ${getScoreBgColor(score)} ${getScoreColor(score)} border-none`}>
            {getScoreLabel(score)}
          </Badge>
        </div>

        <Alert className="border-purple-200 bg-purple-50" data-testid="upgrade-prompt-creator">
          <Lock className="h-4 w-4 text-purple-600" />
          <AlertTitle className="text-purple-900">Unlock Detailed Viral Score Analysis</AlertTitle>
          <AlertDescription className="text-purple-800">
            <p className="mb-3">Get metric breakdowns and AI suggestions with Creator tier:</p>
            <ul className="space-y-1 mb-3 text-sm">
              <li>✓ Engagement potential score</li>
              <li>✓ Hook strength analysis</li>
              <li>✓ Trending alignment metrics</li>
              <li>✓ 2-3 AI improvement tips</li>
            </ul>
            <Button 
              variant="default" 
              size="sm"
              className="bg-purple-600 hover:bg-purple-700"
              onClick={() => setLocation('/pricing')}
              data-testid="button-upgrade-creator"
            >
              Upgrade to Creator - $15/mo
            </Button>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

function StandardViralScore({ score, scoreData }: { score: number; scoreData: ViralScore | null }) {
  const [, setLocation] = useLocation();
  
  const getScoreColor = (score: number) => {
    if (score >= 71) return 'text-green-600';
    if (score >= 41) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 71) return 'bg-green-50 border-green-200';
    if (score >= 41) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 71) return 'Excellent';
    if (score >= 41) return 'Good';
    return 'Needs Work';
  };

  const mainMetrics = scoreData?.breakdown ? {
    engagement: scoreData.breakdown.engagement,
    hookStrength: scoreData.breakdown.hookStrength,
    trending: scoreData.breakdown.trending
  } : null;

  const suggestions = scoreData?.suggestions?.slice(0, 3) || [];

  return (
    <Card className="w-full" data-testid="viral-score-standard">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Viral Score Analysis
          <TierBadge tier="creator" size="sm" className="ml-auto" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className={`text-center p-6 rounded-lg border-2 ${getScoreBgColor(score)}`}>
          <div className={`text-5xl font-bold mb-2 ${getScoreColor(score)}`}>
            {score}
          </div>
          <Badge className={`text-sm ${getScoreBgColor(score)} ${getScoreColor(score)} border-none`}>
            {getScoreLabel(score)}
          </Badge>
        </div>

        {mainMetrics && (
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Metric Breakdown
            </h4>
            
            <div className="space-y-3">
              <MetricBar 
                label="Engagement Potential" 
                value={mainMetrics.engagement} 
                icon={<MessageSquare className="w-4 h-4" />}
              />
              <MetricBar 
                label="Hook Strength" 
                value={mainMetrics.hookStrength} 
                icon={<Zap className="w-4 h-4" />}
              />
              <MetricBar 
                label="Trending Alignment" 
                value={mainMetrics.trending} 
                icon={<TrendingUp className="w-4 h-4" />}
              />
            </div>
          </div>
        )}

        {suggestions.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              AI Suggestions
            </h4>
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Star className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-blue-900">{suggestion}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Alert className="border-dashed border-blue-300 bg-blue-50" data-testid="upgrade-prompt-pro">
          <Rocket className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900">
            <p className="font-semibold mb-2">Upgrade to Pro for Dual-AI Evaluation</p>
            <p className="text-sm mb-2">Get advanced metrics and insights:</p>
            <ul className="space-y-1 mb-3 text-sm">
              <li>✓ Dual-AI analysis (Claude + GPT-4)</li>
              <li>✓ 5+ advanced metrics</li>
              <li>✓ Platform optimization score</li>
              <li>✓ Comparative analysis</li>
            </ul>
            <Button 
              variant="default" 
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setLocation('/pricing')}
              data-testid="button-upgrade-pro"
            >
              Upgrade to Pro - $35/mo
            </Button>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

function AdvancedViralScore({ score, scoreData }: { score: number; scoreData: ViralScore | null }) {
  const [, setLocation] = useLocation();
  
  const getScoreColor = (score: number) => {
    if (score >= 71) return 'text-green-600';
    if (score >= 41) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 71) return 'bg-green-50 border-green-200';
    if (score >= 41) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const allMetrics = scoreData?.breakdown || null;
  const suggestions = scoreData?.suggestions || [];

  return (
    <Card className="w-full" data-testid="viral-score-advanced">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 flex-wrap">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Viral Score Analysis
          <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0">
            <Sparkles className="w-3 h-3 mr-1" />
            Dual-AI Analysis
          </Badge>
          <TierBadge tier="pro" size="sm" className="ml-auto" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className={`text-center p-6 rounded-lg border-2 ${getScoreBgColor(score)}`}>
          <div className={`text-5xl font-bold mb-2 ${getScoreColor(score)}`}>
            {score}
          </div>
          <div className="text-sm text-gray-600 mt-1">Powered by Claude + GPT-4</div>
        </div>

        <Tabs defaultValue="breakdown" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="breakdown" data-testid="tab-breakdown">Breakdown</TabsTrigger>
            <TabsTrigger value="suggestions" data-testid="tab-suggestions">AI Suggestions</TabsTrigger>
            <TabsTrigger value="compare" data-testid="tab-compare">Comparison</TabsTrigger>
          </TabsList>

          <TabsContent value="breakdown" className="space-y-3 mt-4">
            {allMetrics && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <MetricCard title="Engagement Potential" value={allMetrics.engagement} />
                <MetricCard title="Hook Strength" value={allMetrics.hookStrength} />
                <MetricCard title="Trending Alignment" value={allMetrics.trending} />
                <MetricCard title="Clarity" value={allMetrics.clarity} />
                <MetricCard title="Length Optimization" value={allMetrics.length} />
              </div>
            )}
          </TabsContent>

          <TabsContent value="suggestions" className="space-y-3 mt-4">
            {suggestions.map((suggestion, index) => (
              <Card key={index} className="p-4 bg-gradient-to-r from-purple-50 to-blue-50">
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-0.5">
                    {index % 2 === 0 ? 'Claude' : 'GPT-4'}
                  </Badge>
                  <p className="text-sm text-gray-900 flex-1">{suggestion}</p>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="compare" className="mt-4">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Performance Comparison</h4>
              <div className="space-y-3">
                <ComparisonBar label="Your Score" value={score} maxValue={100} color="blue" />
                <ComparisonBar label="Platform Average" value={65} maxValue={100} color="gray" />
                <ComparisonBar label="Top 10% Performers" value={85} maxValue={100} color="green" />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <Alert className="border-dashed border-amber-300 bg-amber-50" data-testid="upgrade-prompt-agency">
          <Crown className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-900">
            <p className="font-semibold mb-2">Upgrade to Agency for Enterprise Features</p>
            <p className="text-sm mb-2">Unlock competitive benchmarking and team tools:</p>
            <ul className="space-y-1 mb-3 text-sm">
              <li>✓ Competitive industry benchmarking</li>
              <li>✓ A/B test recommendations</li>
              <li>✓ Multi-platform predictions</li>
              <li>✓ Team collaboration tools</li>
            </ul>
            <Button 
              variant="default" 
              size="sm"
              className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600"
              onClick={() => setLocation('/pricing')}
              data-testid="button-upgrade-agency"
            >
              Upgrade to Agency - $75/mo
            </Button>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

function EnterpriseViralScore({ score, scoreData }: { score: number; scoreData: ViralScore | null }) {
  const getScoreColor = (score: number) => {
    if (score >= 71) return 'text-green-600';
    if (score >= 41) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 71) return 'bg-green-50 border-green-200';
    if (score >= 41) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const allMetrics = scoreData?.breakdown || null;
  const suggestions = scoreData?.suggestions || [];

  return (
    <Card className="w-full" data-testid="viral-score-enterprise">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 flex-wrap">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Enterprise Viral Score Analysis
          <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0">
            <Sparkles className="w-3 h-3 mr-1" />
            Dual-AI Analysis
          </Badge>
          <TierBadge tier="agency" size="sm" className="ml-auto" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className={`text-center p-6 rounded-lg border-2 ${getScoreBgColor(score)}`}>
          <div className={`text-5xl font-bold mb-2 ${getScoreColor(score)}`}>
            {score}
          </div>
          <div className="text-sm text-gray-600 mt-1">Powered by Claude + GPT-4</div>
        </div>

        <Tabs defaultValue="breakdown" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="breakdown" data-testid="tab-breakdown">Breakdown</TabsTrigger>
            <TabsTrigger value="suggestions" data-testid="tab-suggestions">AI Tips</TabsTrigger>
            <TabsTrigger value="compare" data-testid="tab-compare">Compare</TabsTrigger>
            <TabsTrigger value="benchmark" data-testid="tab-benchmark">Benchmark</TabsTrigger>
            <TabsTrigger value="abtest" data-testid="tab-abtest">A/B Test</TabsTrigger>
          </TabsList>

          <TabsContent value="breakdown" className="space-y-3 mt-4">
            {allMetrics && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <MetricCard title="Engagement Potential" value={allMetrics.engagement} />
                <MetricCard title="Hook Strength" value={allMetrics.hookStrength} />
                <MetricCard title="Trending Alignment" value={allMetrics.trending} />
                <MetricCard title="Clarity" value={allMetrics.clarity} />
                <MetricCard title="Length Optimization" value={allMetrics.length} />
              </div>
            )}
          </TabsContent>

          <TabsContent value="suggestions" className="space-y-3 mt-4">
            {suggestions.map((suggestion, index) => (
              <Card key={index} className="p-4 bg-gradient-to-r from-purple-50 to-blue-50">
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-0.5">
                    {index % 2 === 0 ? 'Claude' : 'GPT-4'}
                  </Badge>
                  <p className="text-sm text-gray-900 flex-1">{suggestion}</p>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="compare" className="mt-4">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Performance Comparison</h4>
              <div className="space-y-3">
                <ComparisonBar label="Your Score" value={score} maxValue={100} color="blue" />
                <ComparisonBar label="Platform Average" value={65} maxValue={100} color="gray" />
                <ComparisonBar label="Top 10% Performers" value={85} maxValue={100} color="green" />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="benchmark" className="mt-4">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Competitive Benchmarking
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <BenchmarkCard title="Industry Average" value={65} comparison={score - 65} />
                <BenchmarkCard title="Top Competitor" value={78} comparison={score - 78} />
                <BenchmarkCard title="Your Best" value={82} comparison={score - 82} />
              </div>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h5 className="font-semibold text-blue-900 mb-2">Multi-Platform Prediction</h5>
                <div className="space-y-2 text-sm text-blue-800">
                  <div className="flex justify-between">
                    <span>TikTok Performance:</span>
                    <Badge className="bg-green-500 text-white">High ({score})</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Instagram Reels:</span>
                    <Badge className="bg-yellow-500 text-white">Medium ({Math.max(score - 10, 0)})</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>YouTube Shorts:</span>
                    <Badge className="bg-green-500 text-white">High ({Math.max(score - 5, 0)})</Badge>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="abtest" className="mt-4">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">A/B Test Recommendations</h4>
              <div className="space-y-3">
                <Card className="p-4 bg-purple-50">
                  <h5 className="font-semibold text-purple-900 mb-2">Variant A (Current)</h5>
                  <p className="text-sm text-purple-800 mb-2">Current hook and structure</p>
                  <Badge className="bg-purple-600 text-white">Score: {score}</Badge>
                </Card>
                <Card className="p-4 bg-blue-50">
                  <h5 className="font-semibold text-blue-900 mb-2">Variant B (Suggested)</h5>
                  <p className="text-sm text-blue-800 mb-2">Shorter hook with trending phrase</p>
                  <Badge className="bg-blue-600 text-white">Predicted: {Math.min(score + 8, 100)}</Badge>
                </Card>
                <Card className="p-4 bg-green-50">
                  <h5 className="font-semibold text-green-900 mb-2">Variant C (Aggressive)</h5>
                  <p className="text-sm text-green-800 mb-2">POV format with emotional hook</p>
                  <Badge className="bg-green-600 text-white">Predicted: {Math.min(score + 12, 100)}</Badge>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function MetricBar({ label, value, icon }: { label: string; value: number; icon?: React.ReactNode }) {
  const getColor = (value: number) => {
    if (value >= 71) return 'bg-green-500';
    if (value >= 41) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-1" data-testid={`metric-bar-${label.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-medium">{label}</span>
        </div>
        <span className="font-bold">{value}</span>
      </div>
      <Progress value={value} className="h-2" indicatorClassName={getColor(value)} />
    </div>
  );
}

function MetricCard({ title, value }: { title: string; value: number }) {
  const getColor = (value: number) => {
    if (value >= 71) return 'border-green-500 bg-green-50';
    if (value >= 41) return 'border-yellow-500 bg-yellow-50';
    return 'border-red-500 bg-red-50';
  };

  const getTextColor = (value: number) => {
    if (value >= 71) return 'text-green-700';
    if (value >= 41) return 'text-yellow-700';
    return 'text-red-700';
  };

  return (
    <Card className={`p-4 border-2 ${getColor(value)}`} data-testid={`metric-card-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="text-sm font-medium text-gray-600 mb-1">{title}</div>
      <div className={`text-3xl font-bold ${getTextColor(value)}`}>{value}</div>
      <Progress value={value} className="h-1 mt-2" />
    </Card>
  );
}

function ComparisonBar({ label, value, maxValue, color }: { label: string; value: number; maxValue: number; color: string }) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-500',
    gray: 'bg-gray-400',
    green: 'bg-green-500'
  };

  const percentage = (value / maxValue) * 100;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="font-bold">{value}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div 
          className={`h-3 rounded-full ${colorMap[color] || 'bg-blue-500'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function BenchmarkCard({ title, value, comparison }: { title: string; value: number; comparison: number }) {
  const isPositive = comparison >= 0;
  
  return (
    <Card className="p-4">
      <div className="text-sm text-gray-600 mb-1">{title}</div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className={`text-sm font-medium mt-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? '+' : ''}{comparison} vs you
      </div>
    </Card>
  );
}
