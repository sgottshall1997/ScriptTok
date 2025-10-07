import { Helmet } from 'react-helmet';
import { useLocation } from 'wouter';
import { useCTATracking } from '@/hooks/use-cta-tracking';
import MarketingLayout from '@/components/MarketingLayout';
import { ToolHero, HowItWorksSteps, ToolFeatureGrid, ToolFAQ, ToolCTA } from '@/components/tools';
import { Filter, Eye, Zap, Hash, Layers, Globe, BarChart3 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

export default function TemplateLibraryTool() {
  const [, setLocation] = useLocation();
  const { trackNavigateCTA } = useCTATracking();

  const handlePrimaryCTA = () => {
    trackNavigateCTA('template-library-hero', '/generate-content');
    setLocation('/generate-content');
  };

  const handleSecondaryCTA = () => {
    const topPerformersSection = document.querySelector('[data-testid="top-performers-section"]');
    topPerformersSection?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFinalCTA = () => {
    trackNavigateCTA('template-library-final-cta', '/generate-content');
    setLocation('/generate-content');
  };

  const steps = [
    {
      icon: Filter,
      title: 'Filter & Browse',
      description: 'Search by niche (beauty, tech, fitness, etc.), content type (unboxing, review, tutorial), or platform',
    },
    {
      icon: Eye,
      title: 'Preview Examples',
      description: 'View real examples, performance stats, and template structure before selecting',
    },
    {
      icon: Zap,
      title: 'Customize & Generate',
      description: 'One-click to load template into Script Generator with your product/topic - AI pre-fills everything',
    },
  ];

  const features = [
    {
      icon: Hash,
      title: 'Niche-Specific Templates',
      description: 'Templates tailored for beauty, tech, fashion, fitness, food, travel, pets',
    },
    {
      icon: Layers,
      title: 'Content Type Filtering',
      description: 'Find templates by type: reviews, tutorials, unboxings, transformations',
    },
    {
      icon: Globe,
      title: 'Platform Optimization',
      description: 'Templates optimized for TikTok, Instagram, YouTube Shorts',
    },
    {
      icon: BarChart3,
      title: 'Performance Stats',
      description: 'See average views, engagement rates, and conversion metrics',
    },
    {
      icon: Eye,
      title: 'Preview Mode',
      description: 'Preview template structure and examples before using',
    },
    {
      icon: Zap,
      title: 'Quick Customization',
      description: 'Load into Script Generator with one click - AI fills in details',
    },
  ];

  const nicheTemplates = [
    { niche: 'Beauty', count: 8 },
    { niche: 'Tech', count: 7 },
    { niche: 'Fashion', count: 6 },
    { niche: 'Fitness', count: 5 },
    { niche: 'Food', count: 5 },
    { niche: 'Travel', count: 4 },
    { niche: 'Pets', count: 3 },
  ];

  const contentTypes = [
    'Product Showcase',
    'Before/After',
    'Trending Hook',
    'Tutorial',
    'Review',
    'Unboxing',
  ];

  const platforms = [
    { name: 'TikTok', duration: '15-60s' },
    { name: 'Instagram Reels', duration: '15-90s' },
    { name: 'YouTube Shorts', duration: '15-60s' },
  ];

  const topPerformers = [
    {
      title: 'Viral Hook Opener',
      stat: '2.4M avg views',
      description: 'Proven formula for capturing attention in the first 3 seconds',
    },
    {
      title: 'Product Unboxing Flow',
      stat: '15.7% conversion',
      description: 'Optimized structure for product reviews and affiliate sales',
    },
    {
      title: 'Before & After Transformation',
      stat: '3.1M avg views',
      description: 'Perfect for beauty, fitness, and lifestyle transformations',
    },
  ];

  const faqs = [
    {
      question: 'How many templates are included?',
      answer: 'We have 20+ templates across all niches and platforms. Pro users get access to advanced templates and can create custom ones.',
    },
    {
      question: 'Can I create custom templates?',
      answer: 'Pro users can save any successful script as a custom template for reuse. You can also modify existing templates.',
    },
    {
      question: 'Are templates niche-specific?',
      answer: 'Yes! Templates are optimized for specific niches (beauty, tech, fitness, etc.) with niche-appropriate language and structure.',
    },
    {
      question: 'Do templates work for both Viral and Affiliate modes?',
      answer: 'Most templates work in both modes. Affiliate templates include product placement and CTA optimization, while viral templates focus on engagement.',
    },
    {
      question: 'Which templates perform best?',
      answer: 'Our top performers are Viral Hook Opener (2.4M avg views), Before & After (3.1M avg views), and Product Unboxing (15.7% conversion).',
    },
  ];

  return (
    <MarketingLayout>
      <Helmet>
        <title>Template Library - 20+ Proven Viral Templates | ScriptTok</title>
        <meta
          name="description"
          content="Browse 20+ proven viral templates for TikTok, Instagram, and YouTube. Pre-built formulas tested across millions of views. Filter by niche, content type, and platform."
        />
        <meta property="og:title" content="Template Library - 20+ Proven Viral Templates | ScriptTok" />
        <meta
          property="og:description"
          content="Browse 20+ proven viral templates for TikTok, Instagram, and YouTube. Pre-built formulas tested across millions of views. Filter by niche, content type, and platform."
        />
        <meta property="og:type" content="website" />
      </Helmet>

      <ToolHero
        eyebrowText="TEMPLATE LIBRARY"
        headline="20+ Proven Templates for Every Niche & Platform"
        subheadline="Pre-built viral formulas and affiliate frameworks tested across millions of views - just customize and create"
        primaryCTA={{ text: 'Browse All Templates', onClick: handlePrimaryCTA }}
        secondaryCTA={{ text: 'See Top Performers', onClick: handleSecondaryCTA }}
      />

      <HowItWorksSteps steps={steps} />

      <ToolFeatureGrid features={features} sectionTitle="Template Library Features" />

      {/* Template Categories Showcase */}
      <section className="py-16 md:py-20 bg-gray-50" data-testid="template-categories-section">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900" data-testid="categories-title">
              Explore Templates by Category
            </h2>
          </div>
          
          <Tabs defaultValue="niche" className="w-full" data-testid="category-tabs">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
              <TabsTrigger value="niche" data-testid="tab-niche">By Niche</TabsTrigger>
              <TabsTrigger value="content" data-testid="tab-content">By Type</TabsTrigger>
              <TabsTrigger value="platform" data-testid="tab-platform">By Platform</TabsTrigger>
            </TabsList>

            <TabsContent value="niche" data-testid="niche-content">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {nicheTemplates.map((item, index) => (
                  <Card key={index} data-testid={`niche-card-${index}`}>
                    <CardContent className="p-6 text-center">
                      <h3 className="font-semibold text-gray-900 mb-2" data-testid={`niche-name-${index}`}>
                        {item.niche}
                      </h3>
                      <Badge variant="secondary" data-testid={`niche-count-${index}`}>
                        {item.count} templates
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="content" data-testid="content-content">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {contentTypes.map((type, index) => (
                  <Card key={index} data-testid={`content-card-${index}`}>
                    <CardContent className="p-6 text-center">
                      <p className="font-semibold text-gray-900" data-testid={`content-type-${index}`}>
                        {type}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="platform" data-testid="platform-content">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {platforms.map((platform, index) => (
                  <Card key={index} data-testid={`platform-card-${index}`}>
                    <CardContent className="p-8 text-center">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2" data-testid={`platform-name-${index}`}>
                        {platform.name}
                      </h3>
                      <Badge variant="outline" data-testid={`platform-duration-${index}`}>
                        {platform.duration}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Top Performing Templates */}
      <section className="py-16 md:py-20 bg-white" data-testid="top-performers-section">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900" data-testid="top-performers-title">
              Top Performing Templates
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8" data-testid="top-performers-grid">
            {topPerformers.map((template, index) => (
              <Card key={index} className="border-2 border-violet-200" data-testid={`top-performer-card-${index}`}>
                <CardContent className="p-8">
                  <div className="text-center mb-4">
                    <Badge className="bg-violet-600 text-white mb-4" data-testid={`top-performer-stat-${index}`}>
                      {template.stat}
                    </Badge>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center" data-testid={`top-performer-title-${index}`}>
                    {template.title}
                  </h3>
                  <p className="text-gray-600 text-center" data-testid={`top-performer-description-${index}`}>
                    {template.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <ToolFAQ faqs={faqs} />

      <ToolCTA
        headline="Start Using Proven Templates Today"
        primaryCTA={{ text: 'Explore Templates', onClick: handleFinalCTA }}
        gradient={true}
      />
    </MarketingLayout>
  );
}
