import { Helmet } from 'react-helmet';
import { useLocation } from 'wouter';
import { useCTATracking } from '@/hooks/use-cta-tracking';
import { MarketingNav } from '@/components/MarketingNav';
import Footer from '@/components/Footer';
import { ToolHero, HowItWorksSteps, ToolFeatureGrid, ToolFAQ, ToolCTA } from '@/components/tools';
import { Save, Search, BarChart3, FileText, TrendingUp, Star, Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

export default function HistoryTool() {
  const [, setLocation] = useLocation();
  const { trackNavigateCTA } = useCTATracking();

  const handlePrimaryCTA = () => {
    trackNavigateCTA('history-hero', '/content-history');
    setLocation('/content-history');
  };

  const handleSecondaryCTA = () => {
    trackNavigateCTA('history-export', '/content-history?export=true');
    setLocation('/content-history?export=true');
  };

  const handleFinalCTA = () => {
    trackNavigateCTA('history-final-cta', '/content-history');
    setLocation('/content-history');
  };

  const steps = [
    {
      icon: Save,
      title: 'Auto-Save Everything',
      description: 'Every generated script, trend analysis, and viral score automatically saved with timestamps',
    },
    {
      icon: Search,
      title: 'Search & Filter',
      description: 'Find content by niche, template, platform, date, or viral score - advanced filtering makes retrieval instant',
    },
    {
      icon: BarChart3,
      title: 'Reuse & Analyze',
      description: 'Copy successful scripts, view rating trends, export data, and identify your top-performing patterns',
    },
  ];

  const features = [
    {
      icon: FileText,
      title: 'Content History',
      description: 'All generated scripts with viral scores and metadata',
    },
    {
      icon: TrendingUp,
      title: 'Trend History',
      description: 'Track trends you\'ve discovered and their evolution',
    },
    {
      icon: Star,
      title: 'Rating System',
      description: 'Rate and organize content by performance',
    },
    {
      icon: Search,
      title: 'Advanced Search',
      description: 'Filter by niche, template, platform, date, score',
    },
    {
      icon: BarChart3,
      title: 'Performance Analytics',
      description: 'Identify patterns in your top-performing content',
    },
    {
      icon: Download,
      title: 'Data Export',
      description: 'Export your content history to CSV or JSON',
    },
  ];

  const contentActions = ['Copy', 'Regenerate', 'Rate', 'Delete'];
  const trendActions = ['View Details', 'Generate Script', 'Archive'];

  const analyticsMetrics = [
    'Top-performing templates',
    'Best-scoring content by niche',
    'Rating distribution graph',
    'Trend adoption success rate',
  ];

  const faqs = [
    {
      question: 'How long is history saved?',
      answer: 'Free users: Last 10 items with details blurred. Pro users: Up to 50 items with full access and unlimited cloud storage.',
    },
    {
      question: 'Can I export my content history?',
      answer: 'Pro users can export all history data to CSV or JSON format. Free users can copy individual scripts.',
    },
    {
      question: 'How do ratings work?',
      answer: 'Rate content 1-5 stars based on performance. The system tracks your ratings to identify patterns in successful content.',
    },
    {
      question: 'Can I delete old content?',
      answer: 'Yes! You can delete individual items or bulk delete. Deleted content is permanently removed and doesn\'t count toward your history limit.',
    },
    {
      question: 'Is there a history limit?',
      answer: 'Free tier: 10 items (blurred details). Pro tier: 50 items with full access. Oldest items auto-archive when limit is reached.',
    },
  ];

  return (
    <>
      <MarketingNav />
      <Helmet>
        <title>Content History - Track All Your Scripts & Trends | Pheme</title>
        <meta
          name="description"
          content="Access your complete content creation archive. Track scripts, trends, and viral scores. Search, filter, rate, and export your best-performing content. Get insights and analytics."
        />
        <meta property="og:title" content="Content History - Track All Your Scripts & Trends | Pheme" />
        <meta
          property="og:description"
          content="Access your complete content creation archive. Track scripts, trends, and viral scores. Search, filter, rate, and export your best-performing content. Get insights and analytics."
        />
        <meta property="og:type" content="website" />
      </Helmet>

      <ToolHero
        eyebrowText="CONTENT HISTORY"
        headline="Your Complete Content Creation Archive"
        subheadline="Access every script, trend, and viral score - track performance, reuse winners, and learn from your best content"
        primaryCTA={{ text: 'View History', onClick: handlePrimaryCTA }}
        secondaryCTA={{ text: 'Export Data', onClick: handleSecondaryCTA }}
      />

      <HowItWorksSteps steps={steps} />

      <ToolFeatureGrid features={features} sectionTitle="History & Analytics Features" />

      {/* History Categories */}
      <section className="py-16 md:py-20 bg-gray-50" data-testid="history-categories-section">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900" data-testid="categories-title">
              Organize Your Content History
            </h2>
          </div>
          
          <Tabs defaultValue="content" className="w-full" data-testid="history-tabs">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="content" data-testid="tab-content">Content History</TabsTrigger>
              <TabsTrigger value="trends" data-testid="tab-trends">Trend History</TabsTrigger>
            </TabsList>

            <TabsContent value="content" data-testid="content-tab-content">
              <Card>
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4" data-testid="content-history-title">
                    Content History Details
                  </h3>
                  <p className="text-gray-600 mb-6" data-testid="content-history-description">
                    All generated scripts with viral scores, template used, niche, platform, creation dates, and actions
                  </p>
                  <div className="flex flex-wrap gap-2" data-testid="content-actions">
                    <span className="text-sm font-medium text-gray-700">Available Actions:</span>
                    {contentActions.map((action, index) => (
                      <Badge key={index} variant="secondary" data-testid={`content-action-${index}`}>
                        {action}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trends" data-testid="trends-tab-content">
              <Card>
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4" data-testid="trend-history-title">
                    Trend History Details
                  </h3>
                  <p className="text-gray-600 mb-6" data-testid="trend-history-description">
                    All discovered trends, product recommendations, competitor data, trend velocity over time, and actions
                  </p>
                  <div className="flex flex-wrap gap-2" data-testid="trend-actions">
                    <span className="text-sm font-medium text-gray-700">Available Actions:</span>
                    {trendActions.map((action, index) => (
                      <Badge key={index} variant="secondary" data-testid={`trend-action-${index}`}>
                        {action}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Analytics Features */}
      <section className="py-16 md:py-20 bg-white" data-testid="analytics-section">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900" data-testid="analytics-title">
              Performance Analytics & Insights
            </h2>
            <p className="text-lg text-gray-600 mt-4" data-testid="analytics-description">
              Identify patterns in your content to create more viral hits
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8" data-testid="analytics-grid">
            {analyticsMetrics.map((metric, index) => (
              <Card key={index} data-testid={`analytics-card-${index}`}>
                <CardContent className="p-8">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-violet-100 rounded-lg">
                      <BarChart3 className="w-6 h-6 text-violet-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900" data-testid={`analytics-metric-${index}`}>
                        {metric}
                      </h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <ToolFAQ faqs={faqs} />

      <ToolCTA
        headline="Access Your Content History Today"
        primaryCTA={{ text: 'View Your History', onClick: handleFinalCTA }}
        gradient={true}
      />

      <Footer />
    </>
  );
}
