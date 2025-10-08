import { Helmet } from 'react-helmet';
import { useLocation } from 'wouter';
import { useCTATracking } from '@/hooks/use-cta-tracking';
import { MarketingNav } from '@/components/MarketingNav';
import Footer from '@/components/Footer';
import { ToolHero, HowItWorksSteps, ToolFeatureGrid, ToolFAQ, ToolCTA } from '@/components/tools';
import { TrendingUp, Package, Users, Sparkles, Globe, Filter, BarChart3, Zap, Target, Clock, Video, Image, Database, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function TrendDiscoveryTool() {
  const [, setLocation] = useLocation();
  const { trackNavigateCTA } = useCTATracking();

  const handlePrimaryCTA = () => {
    trackNavigateCTA('trend-discovery-hero', '/dashboard');
    setLocation('/dashboard');
  };

  const handleSecondaryCTA = () => {
    const useCasesSection = document.querySelector('[data-testid="use-cases-section"]');
    useCasesSection?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFinalCTA = () => {
    trackNavigateCTA('trend-discovery-final-cta', '/dashboard');
    setLocation('/dashboard');
  };

  const steps = [
    {
      icon: TrendingUp,
      title: 'Comprehensive Trend Research',
      description: 'AI scans millions of posts and delivers a complete research package: viral hooks, trending angles, target audiences, popularity scores, peak times, and related trends—all in one place',
    },
    {
      icon: Package,
      title: 'Smart Product Matching',
      description: 'System automatically finds and recommends products that align perfectly with each trend AND your selected niche, with detailed product data and affiliate links ready to use',
    },
    {
      icon: Video,
      title: 'Competitor Video Intelligence',
      description: 'Automatically pulls top-performing competitor videos for each trend/product with visual previews, analyzing what hooks, storytelling, and CTAs are converting',
    },
    {
      icon: Sparkles,
      title: 'AI Script Generation',
      description: 'Feeds the complete trend package (hooks, angles, audience, products, competitor insights) to AI to generate smart, data-backed viral scripts',
    },
  ];

  const features = [
    {
      icon: Database,
      title: 'Complete Trend Research Package',
      description: 'Get viral hooks, target audiences, trending angles, popularity scores, peak posting times, and related trends—everything you need in one comprehensive report',
    },
    {
      icon: Target,
      title: 'Target Audience Intelligence',
      description: 'Discover exactly who engages with each trend—demographics, interests, engagement patterns—so you can tailor content perfectly',
    },
    {
      icon: Clock,
      title: 'Best Time to Post Analytics',
      description: 'AI determines optimal posting times based on when each trend gets maximum engagement across platforms',
    },
    {
      icon: Package,
      title: 'Trend-Matched Product Engine',
      description: 'Automatically finds products that align with trending topics and your niche, with photos, pricing, and affiliate links',
    },
    {
      icon: Video,
      title: 'Competitor Video Analysis',
      description: 'View top-performing competitor videos with thumbnails and performance data to understand what\'s working',
    },
    {
      icon: Image,
      title: 'Visual Trend Data',
      description: 'Every trend includes visual data, competitor video previews, and product images for complete context',
    },
    {
      icon: BarChart3,
      title: 'Trend Velocity & Timing',
      description: 'See exactly when trends peak, how fast they\'re rising, and the best window to capitalize',
    },
    {
      icon: Zap,
      title: 'One-Click Full Script',
      description: 'Generate complete scripts with all trend data, product info, and competitor insights baked in',
    },
  ];

  const trendPackageDemo = {
    title: 'One Piece Live-Action Reactions',
    viralHooks: [
      'Reacting to iconic One Piece moments with live emotions',
      'Cosplaying as favorite One Piece characters and sharing transformation',
      'Ranking devil fruits and debating their powers'
    ],
    targetAudience: 'Gen Z and Millennials (ages 16-34), anime enthusiasts, cosplayers, meme creators, and pop culture fans who enjoy long-running series and community engagement',
    trendingAngles: [
      'Comparing live-action adaptation scenes to anime originals',
      'Fan theories about upcoming story arcs and character fates',
      'Sharing personal journeys of watching One Piece from episode 1'
    ],
    insights: {
      popularityScore: '85/100',
      peakTime: 'August-September 2025 (post live-action release)',
      relatedTrends: ['Live-action anime adaptations', 'Anime reaction videos']
    },
    bestTimeToPost: ['Friday evenings (6-9 PM local time)', 'Sunday afternoons (2-5 PM local time)']
  };

  const useCases = [
    {
      title: 'Beauty Creator Success',
      description: 'Beauty Creator gets complete trend package for "Glass Skin" including hooks, audience data, product matches, competitor videos, and optimal posting times—hits 2M views',
    },
    {
      title: 'Tech Reviewer Win',
      description: 'Tech Reviewer discovers viral gadget trend with full research report, matched products with affiliate links, and competitor analysis—drives 10K sales',
    },
    {
      title: 'Fitness Coach Growth',
      description: 'Fitness Coach uses comprehensive trend data including target audience insights and trending angles to create perfectly timed content—builds massive following',
    },
  ];

  const faqs = [
    {
      question: 'What exactly is included in each trend research package?',
      answer: 'Every trend includes: viral hooks (specific content ideas), target audience (demographics and interests), trending angles (unique approaches), popularity score, peak timing, related trends, best posting times, matched products with images, and competitor video analysis. It\'s a complete research report delivered instantly.',
    },
    {
      question: 'How does product matching work?',
      answer: 'Our AI analyzes each trend and automatically finds products that align with both the trending topic AND your selected niche. You get product photos, pricing, descriptions, and affiliate links ready to use in your content.',
    },
    {
      question: 'What competitor intelligence do I get?',
      answer: 'For every trend and product, we automatically pull top-performing competitor videos with visual previews, view counts, and engagement data. You can see exactly what hooks, storytelling techniques, and CTAs are working right now.',
    },
    {
      question: 'How are best posting times determined?',
      answer: 'Our AI analyzes millions of posts to identify when each specific trend gets maximum engagement. You get day-of-week and time-of-day recommendations tailored to each trend, not generic advice.',
    },
    {
      question: 'Can I see visual examples of trends?',
      answer: 'Yes! Every trend package includes visual data—competitor video thumbnails, product images, and trend visualizations—so you have complete context before creating content.',
    },
    {
      question: 'How comprehensive is the audience data?',
      answer: 'For each trend, you get detailed target audience profiles including age ranges, interests, platform preferences, and engagement patterns. This helps you tailor your script, tone, and CTAs perfectly.',
    },
  ];

  return (
    <>
      <MarketingNav />
      <Helmet>
        <title>Comprehensive Trend Research - Full Trend Intelligence Package | Pheme</title>
        <meta
          name="description"
          content="Get complete trend research packages with viral hooks, target audiences, trending angles, product matches, competitor videos, and optimal posting times—all delivered instantly by AI."
        />
        <meta property="og:title" content="Comprehensive Trend Research - Full Trend Intelligence Package | Pheme" />
        <meta
          property="og:description"
          content="Get complete trend research packages with viral hooks, target audiences, trending angles, product matches, competitor videos, and optimal posting times—all delivered instantly by AI."
        />
        <meta property="og:type" content="website" />
      </Helmet>

      <ToolHero
        eyebrowText="COMPREHENSIVE TREND INTELLIGENCE"
        headline="Complete Trend Research Packages, Delivered Instantly"
        subheadline="Get viral hooks, target audiences, trending angles, product matches, competitor videos, and optimal timing—everything you need to create viral content in one comprehensive AI-powered report"
        primaryCTA={{ text: 'Get Full Trend Intelligence', onClick: handlePrimaryCTA }}
        secondaryCTA={{ text: 'See Example Package', onClick: handleSecondaryCTA }}
      />

      <HowItWorksSteps steps={steps} />

      {/* Complete Trend Package Demo */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-violet-50 to-purple-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-display-sm font-bold text-gray-900 mb-4">
              What You Get: Complete Trend Research Package
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Every trend delivers a comprehensive intelligence report with everything you need to create viral content
            </p>
          </div>

          <Card className="max-w-5xl mx-auto border-2 border-violet-200 shadow-card hover:shadow-card-hover transition-all-smooth">
            <CardContent className="p-8 md:p-12">
              <div className="mb-8">
                <Badge className="bg-violet-600 text-white mb-4">📊 Trend Research Complete</Badge>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{trendPackageDemo.title}</h3>
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    🔥 Viral Hooks
                  </h4>
                  <ul className="space-y-2">
                    {trendPackageDemo.viralHooks.map((hook, i) => (
                      <li key={i} className="text-gray-700 flex items-start gap-2">
                        <span className="text-violet-600">•</span>
                        {hook}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    👥 Target Audience
                  </h4>
                  <p className="text-gray-700">{trendPackageDemo.targetAudience}</p>
                </div>

                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    📐 Trending Angles
                  </h4>
                  <ul className="space-y-2">
                    {trendPackageDemo.trendingAngles.map((angle, i) => (
                      <li key={i} className="text-gray-700 flex items-start gap-2">
                        <span className="text-violet-600">•</span>
                        {angle}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    ✨ Trend Insights
                  </h4>
                  <div className="space-y-2">
                    <p className="text-gray-700">
                      <span className="font-medium">Popularity Score:</span> {trendPackageDemo.insights.popularityScore}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">Peak Time:</span> {trendPackageDemo.insights.peakTime}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">Related Trends:</span> {trendPackageDemo.insights.relatedTrends.join(', ')}
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    📅 Best Time to Post
                  </h4>
                  <div className="flex gap-3 flex-wrap">
                    {trendPackageDemo.bestTimeToPost.map((time, i) => (
                      <Badge key={i} variant="secondary" className="text-sm">
                        {time}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-6 border border-orange-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    🔥 View Trending Competitor Videos →
                  </h4>
                  <p className="text-gray-700 mb-4">
                    Automatically pulls top-performing videos with thumbnails, engagement data, and performance analysis
                  </p>
                  <Badge className="bg-orange-600 text-white">Click to view competitor intelligence</Badge>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <p className="text-center text-gray-600 mb-4">
                  ⚡ Plus: Matched products with images + One-click script generation
                </p>
                <div className="text-center">
                  <Badge className="bg-green-600 text-white text-base px-6 py-2">
                    ✅ Content Setup Complete - Ready to Film
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <ToolFeatureGrid features={features} sectionTitle="Comprehensive Trend Intelligence Features" />

      {/* Use Cases Section */}
      <section className="py-20 md:py-28 bg-gray-50" data-testid="use-cases-section">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-display-sm font-bold text-gray-900" data-testid="use-cases-title">
              Real Creator Success Stories
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8" data-testid="use-cases-grid">
            {useCases.map((useCase, index) => (
              <Card key={index} className="shadow-card hover:shadow-card-hover hover-lift transition-all-smooth" data-testid={`use-case-card-${index}`}>
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3" data-testid={`use-case-title-${index}`}>
                    {useCase.title}
                  </h3>
                  <p className="text-gray-600" data-testid={`use-case-description-${index}`}>
                    {useCase.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 px-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
        <div className="container mx-auto max-w-4xl">
          <Card className="rounded-2xl p-8 md:p-12 border-2 border-green-200 dark:border-green-800 shadow-card hover:shadow-card-hover transition-all-smooth">
            <div className="text-center mb-6">
              <h2 className="text-3xl md:text-4xl lg:text-display-sm font-bold mb-4">
                Why Is Trend Discovery So Valuable?
              </h2>
              <p className="text-lg text-muted-foreground">
                Discover the business value, ROI, and real success stories showing why creators save 10+ hours per week and 3x their engagement with comprehensive trend intelligence.
              </p>
            </div>
            <div className="flex justify-center">
              <Button
                onClick={() => {
                  trackNavigateCTA("trend_discovery_benefits", "view_benefits");
                  setLocation("/features/trend-discovery");
                }}
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white rounded-xl glow-purple-sm hover-lift"
                data-testid="button-view-benefits"
              >
                <TrendingUp className="mr-2 h-5 w-5" />
                See Why Trend Discovery Saves Time
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </Card>
        </div>
      </section>

      <ToolFAQ faqs={faqs} />

      <ToolCTA
        headline="Get Complete Trend Intelligence Packages Today"
        description="Viral hooks, audiences, products, competitor videos, and timing—all in one comprehensive AI report"
        primaryCTA={{ text: 'Start Getting Full Trend Reports', onClick: handleFinalCTA }}
        gradient={true}
      />

      <Footer />
    </>
  );
}
