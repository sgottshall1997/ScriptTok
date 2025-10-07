import { Helmet } from 'react-helmet';
import { useLocation } from 'wouter';
import { useCTATracking } from '@/hooks/use-cta-tracking';
import { MarketingNav } from '@/components/MarketingNav';
import { ToolHero, HowItWorksSteps, ToolFeatureGrid, ToolFAQ, ToolCTA } from '@/components/tools';
import { TrendingUp, Package, Users, Sparkles, Globe, Filter, BarChart3, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

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
      title: 'Real-Time Trend Scanning',
      description: 'AI monitors millions of posts across TikTok, Instagram, YouTube Shorts to identify emerging trends in your niche',
    },
    {
      icon: Package,
      title: 'Smart Product Matching',
      description: 'System analyzes trends and recommends products based on trend alignment AND your selected niche separately',
    },
    {
      icon: Users,
      title: 'Competitor Video Analysis',
      description: 'Pulls top-performing competitor videos for selected products/trends to understand what\'s working',
    },
    {
      icon: Sparkles,
      title: 'AI Script Generation',
      description: 'Feeds all trend data, product info, and competitor insights to ChatGPT to generate smart, viral-ready scripts',
    },
  ];

  const features = [
    {
      icon: Globe,
      title: 'Multi-Platform Trend Tracking',
      description: 'Monitor trends across TikTok, Instagram, YouTube Shorts in real-time',
    },
    {
      icon: Filter,
      title: 'Niche-Specific Filtering',
      description: 'Filter trends by your specific niche for relevant opportunities',
    },
    {
      icon: Package,
      title: 'Product Recommendation Engine',
      description: 'Get AI-powered product recommendations aligned with trends',
    },
    {
      icon: Users,
      title: 'Competitor Intelligence',
      description: 'Analyze top-performing competitor videos for insights',
    },
    {
      icon: BarChart3,
      title: 'Trend Velocity Scoring',
      description: 'See how fast trends are rising with velocity metrics',
    },
    {
      icon: Zap,
      title: 'One-Click Script Generation',
      description: 'Generate scripts directly from trend data instantly',
    },
  ];

  const useCases = [
    {
      title: 'Beauty Creator Success',
      description: 'Beauty Creator finds \'Glass Skin\' trend early, gets 2M views',
    },
    {
      title: 'Tech Reviewer Win',
      description: 'Tech Reviewer discovers viral gadget before saturation, drives 10K sales',
    },
    {
      title: 'Fitness Coach Growth',
      description: 'Fitness Coach identifies emerging workout trend, builds audience',
    },
  ];

  const faqs = [
    {
      question: 'How often are trends updated?',
      answer: 'Trends are updated in real-time as our AI monitors millions of posts across platforms. The dashboard refreshes every 15 minutes with the latest trending content.',
    },
    {
      question: 'Can I track trends in my specific niche?',
      answer: 'Yes! Our niche-specific filtering allows you to focus on trends in beauty, tech, fitness, fashion, food, travel, and pets. You can also combine niches for broader coverage.',
    },
    {
      question: 'What\'s the difference between trend and product recommendations?',
      answer: 'Trends show what\'s viral right now, while product recommendations are AI-matched items that align with those trends AND your niche. You get both for maximum opportunity.',
    },
    {
      question: 'How does competitor analysis work?',
      answer: 'We automatically pull top-performing videos for any trend or product, analyzing hooks, storytelling, and CTAs to help you understand what\'s working.',
    },
    {
      question: 'Can I save trends for later?',
      answer: 'Yes! You can save trends to your history and come back to generate scripts from them anytime. Your trend history shows velocity changes over time.',
    },
  ];

  return (
    <>
      <MarketingNav />
      <Helmet>
        <title>Trend Discovery - Find Viral Trends Before They Peak | ScriptTok</title>
        <meta
          name="description"
          content="AI-powered trend discovery tool that monitors TikTok, Instagram, and YouTube Shorts in real-time. Find viral trends before they peak and get AI-matched product recommendations for your niche."
        />
        <meta property="og:title" content="Trend Discovery - Find Viral Trends Before They Peak | ScriptTok" />
        <meta
          property="og:description"
          content="AI-powered trend discovery tool that monitors TikTok, Instagram, and YouTube Shorts in real-time. Find viral trends before they peak and get AI-matched product recommendations for your niche."
        />
        <meta property="og:type" content="website" />
      </Helmet>

      <ToolHero
        eyebrowText="TREND DISCOVERY"
        headline="Discover What's Trending Before It Goes Viral"
        subheadline="AI-powered trend analysis that finds real-time opportunities across all platforms and recommends winning products for your niche"
        primaryCTA={{ text: 'Start Finding Trends', onClick: handlePrimaryCTA }}
        secondaryCTA={{ text: 'See Example Trends', onClick: handleSecondaryCTA }}
      />

      <HowItWorksSteps steps={steps} />

      <ToolFeatureGrid features={features} sectionTitle="Powerful Trend Discovery Features" />

      {/* Use Cases Section */}
      <section className="py-16 md:py-20 bg-gray-50" data-testid="use-cases-section">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900" data-testid="use-cases-title">
              Real Creator Success Stories
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8" data-testid="use-cases-grid">
            {useCases.map((useCase, index) => (
              <Card key={index} data-testid={`use-case-card-${index}`}>
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

      <ToolFAQ faqs={faqs} />

      <ToolCTA
        headline="Start Discovering Viral Trends Today"
        primaryCTA={{ text: 'Get Started Free', onClick: handleFinalCTA }}
        gradient={true}
      />
    </>
  );
}
