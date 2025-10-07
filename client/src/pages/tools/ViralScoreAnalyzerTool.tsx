import { Helmet } from 'react-helmet';
import { useLocation } from 'wouter';
import { useCTATracking } from '@/hooks/use-cta-tracking';
import { MarketingNav } from '@/components/MarketingNav';
import { ToolHero, HowItWorksSteps, ToolFeatureGrid, ToolFAQ, ToolCTA } from '@/components/tools';
import { FileText, BarChart3, Target, RefreshCw, Zap, BookOpen, Lightbulb } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default function ViralScoreAnalyzerTool() {
  const [, setLocation] = useLocation();
  const { trackNavigateCTA } = useCTATracking();

  const handlePrimaryCTA = () => {
    trackNavigateCTA('viral-score-hero', '/generate-content');
    setLocation('/generate-content');
  };

  const handleSecondaryCTA = () => {
    const scoreBreakdownSection = document.querySelector('[data-testid="score-breakdown-section"]');
    scoreBreakdownSection?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFinalCTA = () => {
    trackNavigateCTA('viral-score-final-cta', '/generate-content');
    setLocation('/generate-content');
  };

  const steps = [
    {
      icon: FileText,
      title: 'Paste Your Script',
      description: 'Input any script - from Script Generator or external sources',
    },
    {
      icon: BarChart3,
      title: 'AI Analysis',
      description: 'System evaluates hook strength, story flow, CTA effectiveness, timing, and platform optimization',
    },
    {
      icon: Target,
      title: 'Get Viral Score & Tips',
      description: 'Receive 0-100 score with detailed breakdown and specific AI-powered improvement suggestions',
    },
    {
      icon: RefreshCw,
      title: 'Regenerate with Feedback',
      description: 'One-click to regenerate script implementing all AI suggestions - iterate until you hit 80+ score',
    },
  ];

  const features = [
    {
      icon: Target,
      title: '0-100 Viral Score',
      description: 'Precise performance prediction based on proven viral patterns',
    },
    {
      icon: Zap,
      title: 'Hook Strength Analysis',
      description: 'Evaluate first 3 seconds for scroll-stopping power',
    },
    {
      icon: BookOpen,
      title: 'Story Flow Evaluation',
      description: 'Assess narrative structure and pacing throughout',
    },
    {
      icon: Target,
      title: 'CTA Effectiveness Score',
      description: 'Measure call-to-action clarity and conversion potential',
    },
    {
      icon: Lightbulb,
      title: 'AI Improvement Tips',
      description: 'Get specific, actionable suggestions to boost score',
    },
    {
      icon: RefreshCw,
      title: 'Auto-Regeneration',
      description: 'One-click regeneration implementing AI feedback',
    },
  ];

  const scoreMetrics = [
    { metric: 'Hook Quality', weight: 25 },
    { metric: 'Story Flow', weight: 25 },
    { metric: 'CTA Effectiveness', weight: 20 },
    { metric: 'Timing & Pacing', weight: 15 },
    { metric: 'Platform Optimization', weight: 15 },
  ];

  const useCases = [
    {
      title: 'Score Improvement Success',
      description: 'Creator improves score from 65 to 87, gets 1M+ views',
    },
    {
      title: 'Conversion Optimization',
      description: 'Affiliate marketer optimizes conversion-focused scripts to 15% click-through',
    },
    {
      title: 'Quality Threshold',
      description: 'Brand ensures all content meets 80+ threshold before posting',
    },
  ];

  const faqs = [
    {
      question: 'How accurate is the viral score?',
      answer: 'Our AI is trained on millions of viral videos and has 85% accuracy predicting content that reaches 100K+ views. Scores above 80 consistently perform well.',
    },
    {
      question: 'Can I improve my score?',
      answer: 'Yes! The AI provides specific suggestions for each script. You can manually edit or use auto-regeneration to implement all suggestions at once.',
    },
    {
      question: 'What\'s a good viral score to aim for?',
      answer: 'Scores 70-79 are good, 80-89 are great, 90+ are exceptional. We recommend posting content with scores above 75 for best results.',
    },
    {
      question: 'Does the score differ by platform?',
      answer: 'Yes! The analyzer considers platform-specific factors like optimal length for TikTok (15-60s) vs Instagram Reels (15-90s) vs YouTube Shorts.',
    },
    {
      question: 'How does AI regeneration work?',
      answer: 'The AI takes your original script and all improvement suggestions, then generates a new version addressing every issue. You can iterate multiple times.',
    },
  ];

  return (
    <>
      <MarketingNav />
      <Helmet>
        <title>Viral Score Analyzer - Predict Content Performance | ScriptTok</title>
        <meta
          name="description"
          content="AI-powered viral score analyzer predicts content performance before you post. Get 0-100 score with detailed breakdown and AI improvement suggestions for TikTok, Instagram, and YouTube."
        />
        <meta property="og:title" content="Viral Score Analyzer - Predict Content Performance | ScriptTok" />
        <meta
          property="og:description"
          content="AI-powered viral score analyzer predicts content performance before you post. Get 0-100 score with detailed breakdown and AI improvement suggestions for TikTok, Instagram, and YouTube."
        />
        <meta property="og:type" content="website" />
      </Helmet>

      <ToolHero
        eyebrowText="VIRAL SCORE ANALYZER"
        headline="Know Your Content Will Perform Before You Post"
        subheadline="AI-powered viral score predicts performance with precision - get specific improvement tips and regenerate scripts based on feedback"
        primaryCTA={{ text: 'Score Your Content', onClick: handlePrimaryCTA }}
        secondaryCTA={{ text: 'See How It Works', onClick: handleSecondaryCTA }}
      />

      <HowItWorksSteps steps={steps} />

      <ToolFeatureGrid features={features} sectionTitle="Viral Score Analysis Features" />

      {/* Score Breakdown Visualization */}
      <section className="py-16 md:py-20 bg-gray-50" data-testid="score-breakdown-section">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900" data-testid="breakdown-title">
              Understanding Your Viral Score
            </h2>
            <p className="text-lg text-gray-600 mt-4" data-testid="breakdown-description">
              Your score is calculated from 5 key metrics weighted by importance
            </p>
          </div>
          
          <div className="space-y-6" data-testid="metrics-list">
            {scoreMetrics.map((item, index) => (
              <Card key={index} data-testid={`metric-card-${index}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900" data-testid={`metric-name-${index}`}>
                      {item.metric}
                    </h3>
                    <span className="text-sm font-medium text-violet-600" data-testid={`metric-weight-${index}`}>
                      {item.weight}% weight
                    </span>
                  </div>
                  <Progress value={item.weight * 4} className="h-2" data-testid={`metric-progress-${index}`} />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-16 md:py-20 bg-white" data-testid="use-cases-section">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900" data-testid="use-cases-title">
              Real Results from Viral Score Optimization
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
        headline="Start Scoring Your Content Today"
        primaryCTA={{ text: 'Try Viral Score Analyzer', onClick: handleFinalCTA }}
        gradient={true}
      />
    </>
  );
}
