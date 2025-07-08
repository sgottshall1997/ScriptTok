import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Circle, Clock, AlertCircle, Zap } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface FeatureStatus {
  feature: string;
  status: 'complete' | 'partial' | 'pending' | 'optional';
  description: string;
  implementation?: string[];
}

const BTB_FEATURES: FeatureStatus[] = [
  {
    feature: '/go/:slug endpoint',
    status: 'complete',
    description: 'Smart redirect system with click tracking',
    implementation: ['server/api/redirect.ts', 'clickLogs schema', 'slug generation']
  },
  {
    feature: 'Click tracking in SQLite',
    status: 'complete',
    description: 'Enhanced click analytics with performance metrics',
    implementation: ['PostgreSQL clickLogs table', 'clickEvents tracking', 'metrics API']
  },
  {
    feature: 'Smart link generation',
    status: 'complete',
    description: 'Automatic affiliate link generation with tracking',
    implementation: ['crypto slug generation', 'redirect URL creation', 'affiliate networks']
  },
  {
    feature: 'Platform checkboxes in UI',
    status: 'complete',
    description: 'Multi-platform content selection with scheduling',
    implementation: ['PlatformSelector component', 'GenerateContent page integration', 'Platform scheduling UI']
  },
  {
    feature: 'GPT platform-specific prompts',
    status: 'complete',
    description: 'AI optimization for each social platform',
    implementation: ['server/api/platform-content.ts', 'platform formatting', 'OpenAI integration']
  },
  {
    feature: 'Structured output formatting',
    status: 'complete',
    description: 'Platform-optimized content structure',
    implementation: ['TikTok/Instagram/YouTube formatting', 'hashtag generation', 'character limits']
  },
  {
    feature: 'Platform schedule dropdown',
    status: 'complete',
    description: 'Content scheduling system',
    implementation: ['server/api/scheduling.ts', 'platformContent schema', 'schedule management']
  },
  {
    feature: 'Webhook + Make integration',
    status: 'complete',
    description: 'Automated content distribution',
    implementation: ['Make.com webhook integration', 'batch sending', 'payload formatting']
  },
  {
    feature: '5 AM cron trigger',
    status: 'complete',
    description: 'Daily automated content processing',
    implementation: ['node-cron scheduler', 'daily batch processing', 'webhook automation']
  },
  {
    feature: 'Metrics DB table',
    status: 'complete',
    description: 'Performance tracking database',
    implementation: ['Enhanced clickLogs schema', 'metrics API', 'analytics endpoints']
  },
  {
    feature: 'Manual input UI',
    status: 'complete',
    description: 'Manual performance metrics entry with AI analysis',
    implementation: ['MetricsInputForm component', 'GenerateContent integration', 'metrics/manual endpoint', 'AI feedback system']
  },
  {
    feature: 'GPT feedback analyzer',
    status: 'complete',
    description: 'AI-powered performance analysis',
    implementation: ['server/api/metrics.ts', 'performance feedback generation', 'OpenAI analysis']
  },
  {
    feature: 'Hook generator',
    status: 'complete',
    description: 'Viral hook creation system',
    implementation: ['server/api/hooks.ts', 'HookGenerator component', 'viral optimization']
  },
  {
    feature: 'GPT scoring',
    status: 'complete',
    description: 'AI-powered hook scoring system',
    implementation: ['hook scoring algorithm', 'viral potential analysis', 'ranking system']
  },
  {
    feature: 'UI override',
    status: 'complete',
    description: 'Manual hook selection and override',
    implementation: ['HookGenerator UI', 'hook selection interface', 'content integration']
  },
  {
    feature: 'Network selector',
    status: 'complete',
    description: 'Multiple affiliate network support',
    implementation: ['server/api/affiliate-networks.ts', 'AffiliateNetworkSelector', 'multi-network support']
  },
  {
    feature: 'Commission logic',
    status: 'complete',
    description: 'Automatic commission calculation',
    implementation: ['commission tracking', 'network-specific rates', 'earnings estimation']
  },
  {
    feature: 'Redirect formats',
    status: 'complete',
    description: 'Network-specific link formatting',
    implementation: ['Amazon Associates', 'ShareASale', 'CJ', 'Impact', 'Awin support']
  },
  {
    feature: 'Trending landing page',
    status: 'optional',
    description: 'Public storefront for trending products',
    implementation: []
  },
  {
    feature: 'Email capture',
    status: 'optional',
    description: 'Email list building system',
    implementation: []
  },
  {
    feature: 'Weekly digest',
    status: 'optional',
    description: 'Automated email campaigns',
    implementation: []
  },
  {
    feature: 'Product research scrapers',
    status: 'partial',
    description: 'Advanced scraping system (AI fallback active)',
    implementation: ['TikTok/Amazon/Reddit scrapers', 'AI-generated fallback data', 'trend detection']
  },
  {
    feature: 'Viral content scrapers',
    status: 'partial',
    description: 'Content trend monitoring',
    implementation: ['Multi-platform trending detection', 'AI-enhanced data generation']
  },
  {
    feature: 'API social auto-posting',
    status: 'pending',
    description: 'Direct social media posting',
    implementation: []
  },
  {
    feature: 'A/B + conversion tracking',
    status: 'partial',
    description: 'Conversion optimization (manual tracking available)',
    implementation: ['Manual metrics input', 'performance comparison']
  },
  {
    feature: 'Funnel analyzer',
    status: 'pending',
    description: 'Sales funnel analysis',
    implementation: []
  },
  {
    feature: 'Viral crossposting system',
    status: 'pending',
    description: 'Automated cross-platform distribution',
    implementation: []
  },
  {
    feature: 'Timing optimization engine',
    status: 'pending',
    description: 'AI-powered posting time optimization',
    implementation: []
  },
  {
    feature: 'Perplexity trend search integration',
    status: 'complete',
    description: 'Real-time trend data from Perplexity API with authentic product intelligence',
    implementation: ['server/services/perplexityTrends.ts', 'API endpoint /api/perplexity-trends', 'TikTok scraper integration', 'Smart product parsing with mention extraction']
  }
];

export default function BTBStatus() {
  const [perplexityLoading, setPerplexityLoading] = useState(false);
  const [perplexityResult, setPerplexityResult] = useState<any>(null);

  const testPerplexityIntegration = async () => {
    setPerplexityLoading(true);
    setPerplexityResult(null);
    
    try {
      const response = await apiRequest('GET', '/api/perplexity-trends/test');
      const data = await response.json();
      setPerplexityResult(data);
    } catch (error) {
      setPerplexityResult({
        success: false,
        error: error instanceof Error ? error.message : 'Test failed'
      });
    } finally {
      setPerplexityLoading(false);
    }
  };

  const getStatusIcon = (status: FeatureStatus['status']) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'partial':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'pending':
        return <Circle className="h-5 w-5 text-gray-400" />;
      case 'optional':
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: FeatureStatus['status']) => {
    switch (status) {
      case 'complete':
        return <Badge className="bg-green-100 text-green-800">Complete</Badge>;
      case 'partial':
        return <Badge className="bg-yellow-100 text-yellow-800">Partial</Badge>;
      case 'pending':
        return <Badge className="bg-gray-100 text-gray-800">Pending</Badge>;
      case 'optional':
        return <Badge className="bg-blue-100 text-blue-800">Optional</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  const completeFeatures = BTB_FEATURES.filter(f => f.status === 'complete').length;
  const partialFeatures = BTB_FEATURES.filter(f => f.status === 'partial').length;
  const totalRequired = BTB_FEATURES.filter(f => f.status !== 'optional').length;
  const completionRate = Math.round((completeFeatures / totalRequired) * 100);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Automation Framework Status</h1>
        <p className="text-muted-foreground mb-4">
          Complete implementation status of the BowTied Bull automation checklist
        </p>
        
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">{completeFeatures}</div>
              <p className="text-xs text-muted-foreground">Complete</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-yellow-600">{partialFeatures}</div>
              <p className="text-xs text-muted-foreground">Partial</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">{completionRate}%</div>
              <p className="text-xs text-muted-foreground">Core Features</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-purple-600">{BTB_FEATURES.length}</div>
              <p className="text-xs text-muted-foreground">Total Features</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Perplexity Integration Test */}
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="text-purple-700 flex items-center gap-2">
              <Zap className="h-5 w-5" />
              🔍 Perplexity Trend Search Integration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-purple-600">
                Test the new Perplexity API integration that replaces GPT-based trend generation with authentic real-time trend data.
              </p>
              
              <Button 
                onClick={testPerplexityIntegration}
                disabled={perplexityLoading}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {perplexityLoading ? 'Testing...' : 'Test Perplexity Integration'}
              </Button>
              
              {perplexityResult && (
                <div className={`p-4 rounded-lg ${perplexityResult.success ? 'bg-green-100 border border-green-200' : 'bg-red-100 border border-red-200'}`}>
                  <h4 className={`font-medium ${perplexityResult.success ? 'text-green-800' : 'text-red-800'}`}>
                    {perplexityResult.success ? '✅ Perplexity Integration Working' : '❌ Perplexity Test Failed'}
                  </h4>
                  <pre className="text-xs mt-2 overflow-auto">
                    {JSON.stringify(perplexityResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {/* Core Features */}
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">🔗 Redirect Link System</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {BTB_FEATURES.filter(f => f.feature.includes('endpoint') || f.feature.includes('tracking') || f.feature.includes('Smart link')).map((feature, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(feature.status)}
                    <div>
                      <p className="font-medium">{feature.feature}</p>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                      {feature.implementation && feature.implementation.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          {feature.implementation.join(' • ')}
                        </p>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(feature.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Platform Features */}
        <Card>
          <CardHeader>
            <CardTitle className="text-blue-600">📱 Platform Formatting</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {BTB_FEATURES.filter(f => f.feature.includes('Platform') || f.feature.includes('GPT') || f.feature.includes('formatting')).map((feature, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(feature.status)}
                    <div>
                      <p className="font-medium">{feature.feature}</p>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                      {feature.implementation && feature.implementation.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          {feature.implementation.join(' • ')}
                        </p>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(feature.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* All Other Features */}
        <Card>
          <CardHeader>
            <CardTitle>All Automation Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {BTB_FEATURES.map((feature, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(feature.status)}
                    <div>
                      <p className="font-medium">{feature.feature}</p>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                      {feature.implementation && feature.implementation.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          {feature.implementation.join(' • ')}
                        </p>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(feature.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}