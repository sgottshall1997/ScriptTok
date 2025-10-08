import { Helmet } from 'react-helmet';
import { useLocation } from 'wouter';
import { useCTATracking } from '@/hooks/use-cta-tracking';
import { MarketingNav } from '@/components/MarketingNav';
import Footer from '@/components/Footer';
import { ToolHero, HowItWorksSteps, ToolFeatureGrid, ToolFAQ, ToolCTA } from '@/components/tools';
import { Layers, Lightbulb, Sparkles, CheckCircle, Zap, BookOpen, Target, Volume2, Share2, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ScriptGeneratorTool() {
  const [, setLocation] = useLocation();
  const { trackNavigateCTA } = useCTATracking();

  const handlePrimaryCTA = () => {
    trackNavigateCTA('script-generator-hero', '/generate-content');
    setLocation('/generate-content');
  };

  const handleSecondaryCTA = () => {
    const useCasesSection = document.querySelector('[data-testid="use-cases-section"]');
    useCasesSection?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFinalCTA = () => {
    trackNavigateCTA('script-generator-final-cta', '/generate-content');
    setLocation('/generate-content');
  };

  const steps = [
    {
      icon: Layers,
      title: 'Choose Your Mode',
      description: 'Select Viral Studio for engagement-focused content or Affiliate Studio for conversion-optimized scripts',
    },
    {
      icon: Lightbulb,
      title: 'Input Your Ideas',
      description: 'Add product details, trending topic, or use AI suggestions from Trend Discovery',
    },
    {
      icon: Sparkles,
      title: 'AI Script Creation',
      description: 'ChatGPT generates complete scripts with hooks, story flow, pacing, and platform-specific CTAs',
    },
    {
      icon: CheckCircle,
      title: 'Refine & Export',
      description: 'Edit, get viral score feedback, regenerate based on AI tips, then export ready-to-film scripts',
    },
  ];

  const features = [
    {
      icon: Layers,
      title: 'Dual Studio Modes',
      description: 'Switch between Viral and Affiliate studios for different content goals',
    },
    {
      icon: Zap,
      title: 'Hook Generator',
      description: 'AI creates scroll-stopping hooks designed to capture attention',
    },
    {
      icon: BookOpen,
      title: 'Story Flow Builder',
      description: 'Structured narratives that keep viewers engaged start to finish',
    },
    {
      icon: Target,
      title: 'CTA Optimizer',
      description: 'Platform-specific calls-to-action optimized for conversions',
    },
    {
      icon: Volume2,
      title: 'Tone Adjuster',
      description: 'Match your brand voice from casual to professional',
    },
    {
      icon: Share2,
      title: 'Multi-Platform Output',
      description: 'Scripts optimized for TikTok, Instagram, YouTube, and more',
    },
  ];

  const useCases = [
    {
      title: 'Batch Content Creation',
      description: 'Creator generates 10 scripts in 10 minutes for weekly content batch',
    },
    {
      title: 'Affiliate Success',
      description: 'Affiliate marketer creates product review series with 15% conversion rate',
    },
    {
      title: 'Brand Consistency',
      description: 'Brand builds consistent content calendar with on-brand scripts',
    },
  ];

  const faqs = [
    {
      question: 'What\'s the difference between Viral and Affiliate modes?',
      answer: 'Viral Studio focuses on engagement and reach with trending content. Affiliate Studio optimizes for conversions with product-focused scripts and affiliate links.',
    },
    {
      question: 'Can I customize generated scripts?',
      answer: 'Yes! Every script is fully editable. You can also regenerate with different parameters or use our AI suggestions to improve specific sections.',
    },
    {
      question: 'How many scripts can I generate?',
      answer: 'Free tier: 10 GPT scripts per month. Pro tier: 300 GPT + 150 Claude scripts per month. All scripts include viral score analysis.',
    },
    {
      question: 'Does it work for all platforms?',
      answer: 'Yes! Scripts are optimized for TikTok (15-60s), Instagram Reels (15-90s), YouTube Shorts (15-60s), and can be adapted for longer formats.',
    },
    {
      question: 'Can I save my own templates?',
      answer: 'Pro users can save custom templates and reuse successful script structures for consistent content creation.',
    },
  ];

  return (
    <>
      <MarketingNav />
      <Helmet>
        <title>Script Generator - AI-Powered Viral Scripts in Seconds | Pheme</title>
        <meta
          name="description"
          content="Generate scroll-stopping TikTok, Instagram, and YouTube scripts in seconds with AI. Choose Viral Studio for engagement or Affiliate Studio for conversions. Get started free today."
        />
        <meta property="og:title" content="Script Generator - AI-Powered Viral Scripts in Seconds | Pheme" />
        <meta
          property="og:description"
          content="Generate scroll-stopping TikTok, Instagram, and YouTube scripts in seconds with AI. Choose Viral Studio for engagement or Affiliate Studio for conversions. Get started free today."
        />
        <meta property="og:type" content="website" />
      </Helmet>

      <ToolHero
        eyebrowText="SCRIPT GENERATOR"
        headline="Generate Scroll-Stopping Scripts in Seconds"
        subheadline="AI-powered script generation for viral content and affiliate conversions - choose your mode and watch the magic happen"
        primaryCTA={{ text: 'Generate Your First Script', onClick: handlePrimaryCTA }}
        secondaryCTA={{ text: 'View Sample Scripts', onClick: handleSecondaryCTA }}
      />

      <HowItWorksSteps steps={steps} />

      <ToolFeatureGrid features={features} sectionTitle="Advanced Script Generation Features" />

      {/* Use Cases Section */}
      <section className="py-16 bg-gray-50" data-testid="use-cases-section">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-display-sm font-bold text-gray-900" data-testid="use-cases-title">
              See What Creators Are Achieving
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

      <section className="py-16 px-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
        <div className="container mx-auto max-w-6xl">
          <Card className="rounded-2xl p-8 md:p-12 border-2 border-green-200 dark:border-green-800 shadow-card hover:shadow-card-hover transition-all-smooth">
            <div className="text-center mb-6">
              <h2 className="text-3xl md:text-4xl lg:text-display-sm font-bold mb-4">
                Why Do AI Scripts Drive 3x More Engagement?
              </h2>
              <p className="text-lg text-muted-foreground">
                Learn about the business value and real creator success stories showing how AI-generated scripts save 10+ hours per week while increasing engagement and revenue.
              </p>
            </div>
            <div className="flex justify-center">
              <Button
                onClick={() => {
                  trackNavigateCTA("script_generator_benefits", "view_benefits");
                  setLocation("/features/instant-script-creation");
                }}
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white rounded-xl glow-purple-sm hover-lift"
                data-testid="button-view-benefits"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                See Why AI Scripts Increase Engagement
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </Card>
        </div>
      </section>

      <ToolFAQ faqs={faqs} />

      <ToolCTA
        headline="Start Creating Viral Scripts Today"
        primaryCTA={{ text: 'Try Script Generator', onClick: handleFinalCTA }}
        gradient={true}
      />

      <Footer />
    </>
  );
}
