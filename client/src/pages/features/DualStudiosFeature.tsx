import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FeatureHero,
  FeatureGrid,
  HowItWorksSection,
  FAQAccordion,
} from "@/components/features";
import { useLocation } from "wouter";
import { useCTATracking } from "@/hooks/use-cta-tracking";
import { Repeat, Sparkles, Target, Library, BarChart, Cpu, Zap } from "lucide-react";
import { MarketingNav } from '@/components/MarketingNav';
import Footer from "@/components/Footer";

export default function DualStudiosFeature() {
  const [_, navigate] = useLocation();
  const { trackNavigateCTA, trackSignupCTA } = useCTATracking();

  const features = [
    {
      icon: Repeat,
      title: "One-Click Studio Switching",
      description: "Instantly switch between Viral and Affiliate modes without losing your work or context.",
    },
    {
      icon: Sparkles,
      title: "Viral Studio Mode",
      description: "Optimized for trending content, viral hooks, and maximum engagement for organic growth.",
    },
    {
      icon: Target,
      title: "Affiliate Studio Mode",
      description: "Fine-tuned for product promotions, conversion-focused CTAs, and revenue generation.",
    },
    {
      icon: Library,
      title: "Shared Template Library",
      description: "Access all your templates across both studios. Customize once, use everywhere.",
    },
    {
      icon: BarChart,
      title: "Cross-Studio Analytics",
      description: "Track performance metrics across both modes to optimize your content strategy.",
    },
    {
      icon: Cpu,
      title: "Mode-Specific AI Tuning",
      description: "AI automatically adjusts prompts and generation based on your selected studio mode.",
    },
  ];

  const steps = [
    {
      number: 1,
      title: "Choose Your Goal",
      description: "Select Viral Studio for engagement or Affiliate Studio for conversions.",
    },
    {
      number: 2,
      title: "Studio Auto-Configures",
      description: "AI settings, templates, and tone adapt automatically to your chosen mode.",
    },
    {
      number: 3,
      title: "Generate & Switch Anytime",
      description: "Create content in either mode and seamlessly switch as your needs change.",
    },
  ];

  const faqs = [
    {
      question: "What's the difference between Viral and Affiliate Studio modes?",
      answer:
        "Viral Studio is optimized for trending content, viral hooks, and organic growth with emphasis on entertainment and shareability. Affiliate Studio focuses on product-driven content with conversion-optimized CTAs and revenue generation strategies.",
    },
    {
      question: "Can I switch between studios mid-project?",
      answer:
        "Yes! You can switch between Viral and Affiliate modes at any time. Your content, templates, and settings are preserved, making it easy to pivot your strategy.",
    },
    {
      question: "Do I need separate accounts for each studio?",
      answer:
        "No, both studios are included in your single Pheme account. Switch between them with one click using the studio selector in your dashboard.",
    },
    {
      question: "Are templates shared between both studios?",
      answer:
        "Yes, all your custom and saved templates are accessible in both Viral and Affiliate studios. You can customize them specifically for each mode.",
    },
    {
      question: "How does the AI adjust between studio modes?",
      answer:
        "The AI automatically adjusts tone, hooks, CTAs, and content structure based on your selected mode. Viral mode emphasizes engagement and trends, while Affiliate mode focuses on product benefits and conversion.",
    },
    {
      question: "Can I use both studios simultaneously?",
      answer:
        "While you can only actively work in one studio at a time, you can quickly switch between them and maintain multiple projects across both modes.",
    },
    {
      question: "Do analytics track performance separately for each studio?",
      answer:
        "Yes, our analytics dashboard provides separate metrics for Viral and Affiliate content, as well as combined insights to help you optimize your overall strategy.",
    },
  ];

  return (
    <>
      <MarketingNav />
      <Helmet>
        <title>Dual Studios - Switch Between Viral & Affiliate Content | Pheme</title>
        <meta name="description" content="Toggle between viral and affiliate content studios instantly. Specialized AI modes optimized for organic engagement or high-converting campaigns." />
        <meta property="og:title" content="Dual Studios - Switch Between Viral & Affiliate Content | Pheme" />
        <meta property="og:description" content="Toggle between viral and affiliate content studios instantly. Specialized AI modes optimized for organic engagement or high-converting campaigns." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://pheme.com/features/dual-studios" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Dual Studios - Switch Between Viral & Affiliate Content | Pheme" />
        <meta name="twitter:description" content="Toggle between viral and affiliate content studios instantly. Specialized AI modes optimized for organic engagement or high-converting campaigns." />
      </Helmet>
      
      <div className="min-h-screen">
        <FeatureHero
          title="Switch Between Viral & Affiliate Studios Instantly"
          subtitle="Two powerful content modes in one platform. Create viral content for engagement or affiliate content for revenue—switch seamlessly as your goals evolve."
          primaryCTA={{
            text: "Try Both Studios Free",
            onClick: () => {
              trackNavigateCTA("dual_studios_hero", "try_studios");
              navigate("/dashboard");
            },
          }}
          secondaryCTA={{
            text: "Watch How It Works",
            onClick: () => {
              trackNavigateCTA("dual_studios_hero", "watch_demo");
              navigate("/how-it-works");
            },
          }}
        />

      <section className="py-20 md:py-28 px-4 bg-white dark:bg-gray-900">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Two Studios, One Powerful Platform
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to succeed in both viral content creation and affiliate marketing.
            </p>
          </div>
          <FeatureGrid features={features} />
        </div>
      </section>

      <HowItWorksSection
        title="How Dual Studios Work"
        steps={steps}
        className="bg-gray-50 dark:bg-gray-800"
      />

      <section className="py-20 md:py-28 px-4 bg-white dark:bg-gray-900">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Perfect For Every Creator</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Whether you're focused on one strategy or both, Dual Studios adapts to your needs.
            </p>
          </div>

          <Tabs defaultValue="content-creators" className="w-full" data-testid="use-cases-tabs">
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 h-auto md:h-10">
              <TabsTrigger value="content-creators" data-testid="tab-content-creators">
                Content Creators
              </TabsTrigger>
              <TabsTrigger value="affiliate-marketers" data-testid="tab-affiliate-marketers">
                Affiliate Marketers
              </TabsTrigger>
              <TabsTrigger value="hybrid-creators" data-testid="tab-hybrid-creators">
                Hybrid Creators
              </TabsTrigger>
            </TabsList>

            <TabsContent value="content-creators" className="mt-8" data-testid="content-creators-content">
              <Card className="rounded-2xl p-8 shadow-card hover:shadow-card-hover hover-lift transition-all-smooth">
                <h3 className="text-2xl font-bold mb-4" data-testid="content-creators-tab-title">Build Your Audience First</h3>
                <p className="text-muted-foreground mb-6" data-testid="content-creators-tab-description">
                  Start with Viral Studio to grow your following with trending, engaging content.
                  Once you've built an audience, seamlessly switch to Affiliate Studio to monetize
                  your influence.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <Sparkles className="h-5 w-5 text-violet-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span data-testid="content-creators-feature-0">Create viral content that attracts followers and builds community</span>
                  </li>
                  <li className="flex items-start">
                    <Target className="h-5 w-5 text-violet-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span data-testid="content-creators-feature-1">Transition to affiliate content when ready to monetize</span>
                  </li>
                  <li className="flex items-start">
                    <BarChart className="h-5 w-5 text-violet-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span data-testid="content-creators-feature-2">Track growth metrics across both content types</span>
                  </li>
                </ul>
              </Card>
            </TabsContent>

            <TabsContent value="affiliate-marketers" className="mt-8" data-testid="affiliate-marketers-content">
              <Card className="rounded-2xl p-8 shadow-card hover:shadow-card-hover hover-lift transition-all-smooth">
                <h3 className="text-2xl font-bold mb-4" data-testid="affiliate-marketers-tab-title">Revenue-Focused From Day One</h3>
                <p className="text-muted-foreground mb-6" data-testid="affiliate-marketers-tab-description">
                  Use Affiliate Studio to create conversion-optimized content for product promotions.
                  Occasionally switch to Viral Studio to expand reach and attract new potential customers.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <Target className="h-5 w-5 text-violet-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span data-testid="affiliate-marketers-feature-0">Generate product-focused scripts with built-in conversion tactics</span>
                  </li>
                  <li className="flex items-start">
                    <Sparkles className="h-5 w-5 text-violet-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span data-testid="affiliate-marketers-feature-1">Create occasional viral content to grow your audience</span>
                  </li>
                  <li className="flex items-start">
                    <BarChart className="h-5 w-5 text-violet-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span data-testid="affiliate-marketers-feature-2">Analyze which content types drive the most sales</span>
                  </li>
                </ul>
              </Card>
            </TabsContent>

            <TabsContent value="hybrid-creators" className="mt-8" data-testid="hybrid-creators-content">
              <Card className="rounded-2xl p-8 shadow-card hover:shadow-card-hover hover-lift transition-all-smooth">
                <h3 className="text-2xl font-bold mb-4" data-testid="hybrid-creators-tab-title">Best of Both Worlds</h3>
                <p className="text-muted-foreground mb-6" data-testid="hybrid-creators-tab-description">
                  Master creators use both studios strategically—viral content for growth,
                  affiliate content for revenue. Switch between them based on trends, opportunities,
                  and business goals.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <Repeat className="h-5 w-5 text-violet-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span data-testid="hybrid-creators-feature-0">Balance viral engagement with steady affiliate revenue</span>
                  </li>
                  <li className="flex items-start">
                    <Cpu className="h-5 w-5 text-violet-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span data-testid="hybrid-creators-feature-1">Let AI optimize content for each studio's unique goals</span>
                  </li>
                  <li className="flex items-start">
                    <BarChart className="h-5 w-5 text-violet-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span data-testid="hybrid-creators-feature-2">Unified analytics show complete performance picture</span>
                  </li>
                </ul>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <FAQAccordion faqs={faqs} className="bg-gray-50 dark:bg-gray-800" />

      <section className="bg-gradient-cta text-white py-20 md:py-28 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Switch Studios?</h2>
          <p className="text-lg md:text-xl text-gray-200 mb-8">
            Experience the flexibility of dual studios. Start creating viral content, affiliate content, or both.
          </p>
          <Button
            onClick={() => {
              trackSignupCTA("dual_studios_cta");
              navigate("/dashboard");
            }}
            size="lg"
            className="bg-white text-purple-600 hover:bg-gray-100 rounded-xl btn-glow hover-lift"
            data-testid="button-dual-studios-cta"
          >
            <Zap className="mr-2 h-5 w-5" />
            Get Started Free
          </Button>
        </div>
      </section>

      <section className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 py-20 md:py-28 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Get Hands-On?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Explore the step-by-step guide and see exactly how to use this feature.
          </p>
          <Button
            onClick={() => {
              trackNavigateCTA("dual_studios_feature_cta", "dashboard");
              navigate("/dashboard");
            }}
            size="lg"
            className="bg-violet-600 hover:bg-violet-700 text-white glow-purple-sm hover-lift"
            data-testid="button-try-studios"
          >
            Try Both Studios →
          </Button>
        </div>
      </section>

      <Footer />
      </div>
    </>
  );
}
