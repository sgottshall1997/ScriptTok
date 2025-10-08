import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FeatureHero,
  FeatureGrid,
  FAQAccordion,
} from "@/components/features";
import { useLocation } from "wouter";
import { useCTATracking } from "@/hooks/use-cta-tracking";
import { 
  Zap, 
  BookOpen, 
  Target, 
  Volume2, 
  Clock, 
  Share2, 
  TrendingUp, 
  Package, 
  Lightbulb, 
  Users,
  DollarSign,
  Rocket,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { MarketingNav } from '@/components/MarketingNav';
import Footer from "@/components/Footer";

export default function AIScriptGeneratorFeature() {
  const [_, navigate] = useLocation();
  const { trackNavigateCTA, trackSignupCTA } = useCTATracking();

  const benefits = [
    {
      icon: Clock,
      title: "Save 10+ Hours Per Week",
      description: "Eliminate script writing time. What used to take 2-3 hours per video now takes 30 seconds—letting you create 20x more content in the same time.",
    },
    {
      icon: TrendingUp,
      title: "3x Higher Engagement Rates",
      description: "AI-optimized hooks and story flows proven to stop scrollers. Our users see 3x more views, shares, and comments compared to manually written scripts.",
    },
    {
      icon: DollarSign,
      title: "Generate $5K+ Monthly Revenue",
      description: "Conversion-optimized CTAs and affiliate placements drive real revenue. Creators report earning $5,000-$15,000/month from AI-scripted content.",
    },
    {
      icon: Rocket,
      title: "Scale from 10K to 500K Followers",
      description: "Consistent, high-quality scripts fuel growth. Multiple creators have grown from 10K to 500K+ followers in 6 months using our AI scripts daily.",
    },
    {
      icon: Target,
      title: "40% Higher Conversion Rates",
      description: "Data-backed CTAs tailored to your audience psychology increase clicks, sales, and affiliate commissions by an average of 40%.",
    },
    {
      icon: BarChart3,
      title: "Maintain Quality Across 100+ Videos",
      description: "Never sacrifice quality for quantity. Brands create 100+ consistent, on-brand videos monthly while maintaining viral potential in every script.",
    },
  ];

  const useCases = [
    {
      icon: "📈",
      title: "Content Creator Growth",
      story: "Sarah's Journey",
      metric: "10K → 500K Followers in 6 Months",
      description: "Sarah used AI scripts to post 3x daily on TikTok. The consistent, engaging content helped her grow from 10,000 to 500,000 followers, landing brand deals worth $20K/month.",
      outcome: "$20K/month in brand deals",
    },
    {
      icon: "💰",
      title: "Affiliate Marketing Success",
      story: "Mike's Revenue Leap",
      metric: "125% Increase in Affiliate Sales",
      description: "Mike implemented AI-optimized CTAs in his product review scripts. His conversion rate jumped from 2.1% to 4.7%, increasing monthly affiliate earnings from $4K to $9K.",
      outcome: "$5K additional monthly revenue",
    },
    {
      icon: "🏢",
      title: "Brand Consistency at Scale",
      story: "TechBrand Studios",
      metric: "150 Videos/Month, Zero Quality Loss",
      description: "TechBrand needed consistent messaging across 150 monthly videos. AI scripts maintained their brand voice perfectly, reducing production costs by 60% while improving engagement by 35%.",
      outcome: "60% cost reduction, 35% engagement boost",
    },
  ];

  const deliverables = [
    {
      icon: "🎣",
      title: "3 Viral Hook Variations",
      description: "Every script includes 3 tested hook options",
      examples: [
        '"Stop scrolling if you want to..."',
        '"Nobody talks about this [product feature]..."',
        '"I tried [product] for 30 days and..."'
      ]
    },
    {
      icon: "📖",
      title: "Complete Story Flow Structure",
      description: "Detailed script with timing markers for every section",
      examples: [
        "0-3s: Hook that stops scrollers",
        "3-15s: Problem/pain point setup",
        "15-45s: Solution reveal & benefits",
        "45-60s: Call-to-action & next steps"
      ]
    },
    {
      icon: "🎯",
      title: "Platform-Specific CTAs",
      description: "Optimized calls-to-action for each platform",
      examples: [
        'TikTok: "Link in bio for 20% off!"',
        'Instagram: "Swipe up to shop the collection"',
        'YouTube: "First link in description gets you..."'
      ]
    },
    {
      icon: "🎭",
      title: "Multiple Tone Variations",
      description: "Scripts in 5 different tones to match your brand",
      examples: [
        "Casual & Relatable",
        "Professional & Authoritative",
        "Energetic & Enthusiastic",
        "Educational & Informative",
        "Humorous & Entertaining"
      ]
    },
    {
      icon: "📊",
      title: "Viral Score Preview",
      description: "AI-predicted viral potential with detailed breakdown",
      examples: [
        "Hook Effectiveness: 92/100",
        "Story Engagement: 88/100",
        "CTA Conversion: 85/100",
        "Overall Viral Score: 89/100"
      ]
    },
    {
      icon: "⏱️",
      title: "Multi-Length Formats",
      description: "Instant script versions for any platform requirement",
      examples: [
        "15s version for quick hooks",
        "30s version for concise stories",
        "60s version for detailed content",
        "90s+ extended format"
      ]
    },
  ];

  const faqs = [
    {
      question: "How much time will AI Script Generator actually save me?",
      answer:
        "Most creators save 10-15 hours per week. A typical video script that takes 2-3 hours to research, write, and refine can be generated in 30 seconds. If you create 5 videos per week, that's 10-15 hours saved—time you can use to film more content, engage with your audience, or close brand deals.",
    },
    {
      question: "What kind of revenue increase can I expect?",
      answer:
        "Results vary, but our users report significant gains: content creators see $5K-$15K additional monthly revenue from increased posting frequency and better engagement. Affiliate marketers report 40-125% increases in conversion rates thanks to optimized CTAs. The key is using AI to create more high-quality content consistently.",
    },
    {
      question: "How does it help with audience growth?",
      answer:
        "AI scripts are optimized for virality using proven hooks, pacing, and engagement techniques. We've seen creators grow from 10K to 500K followers in 6 months by using AI scripts to post 2-3x more frequently without sacrificing quality. The consistent, engaging content feeds platform algorithms and keeps audiences coming back.",
    },
    {
      question: "Can I maintain my brand voice with AI scripts?",
      answer:
        "Absolutely. Every script is generated in 5 tone variations (casual, professional, energetic, educational, humorous) so you can choose what matches your brand. Plus, all scripts are fully editable—use them as-is or customize to add your unique personality. Brands using our tool create 100+ videos monthly while maintaining perfect consistency.",
    },
    {
      question: "What makes the CTAs more effective than what I write myself?",
      answer:
        "Our AI analyzes millions of high-converting videos to understand what CTAs work best for different products, audiences, and platforms. It factors in psychology, urgency, clarity, and platform-specific best practices. Users report 40% higher conversion rates on average because the CTAs are data-backed, not guesswork.",
    },
    {
      question: "How do viral scores help me create better content?",
      answer:
        "The viral score gives you a data-backed prediction of how well your script will perform before you film anything. It breaks down hook effectiveness, story engagement, and CTA conversion separately. If your score is low, you know exactly what to improve. This means you only film scripts with high viral potential—saving time and maximizing ROI.",
    },
    {
      question: "What if I need help getting started?",
      answer:
        "We provide a complete step-by-step guide showing exactly how to use the Script Generator for maximum results. You'll see live examples, best practices, and tips from top-performing creators. Plus, you can generate your first script in under 60 seconds—no learning curve required.",
    },
  ];

  return (
    <>
      <MarketingNav />
      <Helmet>
        <title>AI Script Generator - Save 10+ Hours/Week & 3x Your Engagement | Pheme</title>
        <meta name="description" content="Generate viral scripts that drive $5K+ monthly revenue. Save 10 hours per week, grow from 10K to 500K followers, and increase conversions by 40%. AI-powered script generation that delivers results." />
        <meta property="og:title" content="AI Script Generator - Save 10+ Hours/Week & 3x Your Engagement | Pheme" />
        <meta property="og:description" content="Generate viral scripts that drive $5K+ monthly revenue. Save 10 hours per week, grow from 10K to 500K followers, and increase conversions by 40%." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://pheme.com/features/ai-script-generator" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AI Script Generator - Save 10+ Hours/Week & 3x Your Engagement | Pheme" />
        <meta name="twitter:description" content="Generate viral scripts that drive $5K+ monthly revenue. Save 10 hours per week, grow from 10K to 500K followers, and increase conversions by 40%." />
      </Helmet>
      
      <div className="min-h-screen">
        <FeatureHero
          title="Save 10+ Hours Per Week While 3x Your Engagement"
          subtitle="AI-powered scripts proven to grow creators from 10K to 500K followers and generate $5K+ in monthly revenue. Stop writing, start earning."
          primaryCTA={{
            text: "Generate Your First Viral Script",
            onClick: () => {
              trackNavigateCTA("ai_script_generator_hero", "generate_script");
              navigate("/dashboard");
            },
          }}
          secondaryCTA={{
            text: "See Success Stories",
            onClick: () => {
              trackNavigateCTA("ai_script_generator_hero", "success_stories");
              const element = document.getElementById('success-stories');
              if (element) element.scrollIntoView({ behavior: 'smooth' });
            },
          }}
        />

      <section className="py-16 px-4 bg-white dark:bg-gray-900">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose AI Script Generator?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Real results from creators and brands using AI scripts to scale their content and revenue.
            </p>
          </div>
          <FeatureGrid features={benefits} />
        </div>
      </section>

      <section id="success-stories" className="py-16 px-4 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Real Success Stories
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See how creators and brands are using AI scripts to achieve breakthrough results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {useCases.map((useCase, index) => (
              <Card
                key={index}
                className="rounded-2xl shadow-sm border-2 border-violet-200 dark:border-violet-800 overflow-hidden"
                data-testid={`use-case-card-${index}`}
              >
                <div className="bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900 dark:to-purple-900 p-6">
                  <div className="text-4xl mb-3">{useCase.icon}</div>
                  <h3 className="text-xl font-bold mb-2" data-testid={`use-case-title-${index}`}>
                    {useCase.title}
                  </h3>
                  <Badge className="bg-violet-600 text-white mb-2">
                    {useCase.story}
                  </Badge>
                </div>
                <div className="p-6">
                  <div className="mb-4">
                    <div className="text-2xl font-bold text-violet-600 dark:text-violet-400 mb-2">
                      {useCase.metric}
                    </div>
                    <p className="text-muted-foreground text-sm mb-3">
                      {useCase.description}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-semibold text-green-600 dark:text-green-400 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      {useCase.outcome}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-white dark:bg-gray-900">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What You Get With Every Script
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A complete content package designed to maximize your viral potential and ROI.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deliverables.map((item, index) => (
              <Card
                key={index}
                className="rounded-2xl p-6 hover:shadow-lg transition-shadow"
                data-testid={`deliverable-card-${index}`}
              >
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold mb-2" data-testid={`deliverable-title-${index}`}>
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {item.description}
                </p>
                <div className="space-y-2">
                  {item.examples.map((example, i) => (
                    <div
                      key={i}
                      className="text-xs bg-gray-50 dark:bg-gray-800 rounded-lg p-2 border border-gray-200 dark:border-gray-700"
                    >
                      {example}
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-12 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-8 border-2 border-green-200 dark:border-green-800">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-green-600" />
                  Plus: All Data Automatically Saved
                </h3>
                <p className="text-muted-foreground">
                  Every script, variation, and viral score is saved to your dashboard. Access your complete script library anytime, reuse top performers, and track what works best.
                </p>
              </div>
              <CheckCircle2 className="h-16 w-16 text-green-600" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What You Achieve With Each Approach</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Multiple paths to success—each delivers measurable results in engagement, revenue, and growth.
            </p>
          </div>

          <Tabs defaultValue="trends" className="w-full" data-testid="generation-process-tabs">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto md:h-10">
              <TabsTrigger value="trends" data-testid="tab-from-trends">
                Trend-Based
              </TabsTrigger>
              <TabsTrigger value="products" data-testid="tab-from-products">
                Product-Focused
              </TabsTrigger>
              <TabsTrigger value="ideas" data-testid="tab-from-ideas">
                Original Ideas
              </TabsTrigger>
              <TabsTrigger value="competitors" data-testid="tab-from-competitors">
                Competitor-Informed
              </TabsTrigger>
            </TabsList>

            <TabsContent value="trends" className="mt-8" data-testid="trends-content">
              <Card className="rounded-2xl p-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900 dark:to-purple-900 p-3 rounded-full">
                    <TrendingUp className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2" data-testid="trends-tab-title">3x Higher Engagement From Viral Momentum</h3>
                    <p className="text-muted-foreground mb-4" data-testid="trends-tab-description">
                      Trending content achieves 3x higher engagement rates by capitalizing on existing viral momentum. Your scripts are optimized with hooks proven to be working right now—not guesswork, but real-time viral patterns that drive views and shares.
                    </p>
                    <div className="space-y-2">
                      <Badge className="bg-green-600 text-white mr-2">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        300% engagement boost
                      </Badge>
                      <Badge className="bg-blue-600 text-white">
                        500K+ avg views per trending video
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="products" className="mt-8" data-testid="products-content">
              <Card className="rounded-2xl p-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900 dark:to-purple-900 p-3 rounded-full">
                    <Package className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2" data-testid="products-tab-title">40% Higher Conversions = Direct Revenue Growth</h3>
                    <p className="text-muted-foreground mb-4" data-testid="products-tab-description">
                      Product-focused scripts convert at 40% higher rates because AI identifies the exact benefit angles and psychological triggers that drive purchases. Every CTA is profit-optimized, turning viewers into customers and boosting affiliate commissions by an average of $5K/month.
                    </p>
                    <div className="space-y-2">
                      <Badge className="bg-green-600 text-white mr-2">
                        <DollarSign className="h-3 w-3 mr-1" />
                        +$5K monthly revenue
                      </Badge>
                      <Badge className="bg-blue-600 text-white">
                        40% conversion rate increase
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="ideas" className="mt-8" data-testid="ideas-content">
              <Card className="rounded-2xl p-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900 dark:to-purple-900 p-3 rounded-full">
                    <Lightbulb className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2" data-testid="ideas-tab-title">10+ Hours Saved Weekly While Maintaining Quality</h3>
                    <p className="text-muted-foreground mb-4" data-testid="ideas-tab-description">
                      Original ideas become viral-ready scripts in 30 seconds instead of 2-3 hours of manual writing. The quality doesn't drop—it improves. AI structures your ideas with proven engagement techniques, viral hooks, and optimized pacing that you'd spend hours researching. That's 10+ hours saved per week to create more content or close brand deals.
                    </p>
                    <div className="space-y-2">
                      <Badge className="bg-green-600 text-white mr-2">
                        <Clock className="h-3 w-3 mr-1" />
                        10+ hours saved weekly
                      </Badge>
                      <Badge className="bg-blue-600 text-white">
                        20x more content in same time
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="competitors" className="mt-8" data-testid="competitors-content">
              <Card className="rounded-2xl p-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900 dark:to-purple-900 p-3 rounded-full">
                    <Users className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2" data-testid="competitors-tab-title">Instant Competitive Advantage From Proven Structures</h3>
                    <p className="text-muted-foreground mb-4" data-testid="competitors-tab-description">
                      Leverage what's already working without copying. AI analyzes millions of top-performing videos to extract winning structures—then applies them to your unique brand voice. Get the competitive intelligence that would take months of manual analysis, delivered instantly. Creators using competitor-informed scripts see 2.5x faster audience growth.
                    </p>
                    <div className="space-y-2">
                      <Badge className="bg-green-600 text-white mr-2">
                        <BarChart3 className="h-3 w-3 mr-1" />
                        2.5x faster growth
                      </Badge>
                      <Badge className="bg-blue-600 text-white">
                        Learn from millions of viral videos
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <section className="py-16 px-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
        <div className="container mx-auto max-w-4xl">
          <Card className="rounded-2xl p-8 md:p-12 border-2 border-orange-200 dark:border-orange-800">
            <div className="text-center mb-6">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Want to See Exactly How to Use This?
              </h2>
              <p className="text-lg text-muted-foreground">
                Get a complete step-by-step guide with live examples, best practices, and tips from top-performing creators.
              </p>
            </div>
            <div className="flex justify-center">
              <Button
                onClick={() => {
                  trackNavigateCTA("ai_script_generator_guide", "view_guide");
                  navigate("/tools/script-generator");
                }}
                size="lg"
                className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl"
                data-testid="button-view-guide"
              >
                <BookOpen className="mr-2 h-5 w-5" />
                See Step-by-Step Guide
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </Card>
        </div>
      </section>

      <FAQAccordion faqs={faqs} className="bg-white dark:bg-gray-900" />

      <section className="bg-gradient-cta text-white py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Start Generating Viral Scripts That Drive Results
          </h2>
          <p className="text-lg md:text-xl text-gray-200 mb-8">
            Join creators earning $5K+ monthly, growing to 500K followers, and saving 10+ hours per week with AI-powered scripts.
          </p>
          <Button
            onClick={() => {
              trackSignupCTA("ai_script_generator_cta");
              navigate("/dashboard");
            }}
            size="lg"
            className="bg-white text-purple-600 hover:bg-gray-100 rounded-xl"
            data-testid="button-ai-script-generator-cta"
          >
            <Zap className="mr-2 h-5 w-5" />
            Generate Your First Viral Script
          </Button>
        </div>
      </section>

      <Footer />
      </div>
    </>
  );
}
