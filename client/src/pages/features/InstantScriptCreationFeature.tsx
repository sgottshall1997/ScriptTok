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

export default function InstantScriptCreationFeature() {
  const [_, navigate] = useLocation();
  const { trackNavigateCTA, trackSignupCTA } = useCTATracking();

  const benefits = [
    {
      icon: Zap,
      title: "Generate Scripts in Seconds",
      description: "AI creates complete scripts instantly with hooks, story flow, and CTAs. Get a professional foundation without staring at a blank page.",
    },
    {
      icon: BookOpen,
      title: "Never Start from Scratch",
      description: "Always have a professional script foundation to build from. Customize and refine AI-generated content to match your unique style.",
    },
    {
      icon: Share2,
      title: "Optimize for Each Platform",
      description: "Get platform-specific script variations automatically. Each version is tailored for TikTok, Instagram, YouTube, or other platforms.",
    },
    {
      icon: Sparkles,
      title: "Built-in Viral Elements",
      description: "Scripts include attention-grabbing hooks, engaging story structures, and clear calls-to-action based on effective content patterns.",
    },
    {
      icon: Clock,
      title: "Save Significant Time",
      description: "Reduce script writing from hours to minutes. Spend more time creating content and less time planning what to say.",
    },
    {
      icon: Target,
      title: "Maintain Brand Consistency",
      description: "Keep your brand voice consistent across all content. Choose from multiple tone options or customize to match your style.",
    },
  ];

  const useCases = [
    {
      icon: "📈",
      title: "Content Creators",
      story: "Consistent Output",
      metric: "Multiple Scripts Daily",
      description: "Generate multiple script variations quickly for A/B testing different hooks and approaches. Create consistent content without spending hours on each script.",
      outcome: "Faster content production workflow",
    },
    {
      icon: "💰",
      title: "Affiliate Marketers",
      story: "Product-Focused Content",
      metric: "Natural CTA Integration",
      description: "Get product-focused scripts with naturally integrated calls-to-action. AI helps structure product benefits and recommendations in an engaging way.",
      outcome: "Better-structured affiliate content",
    },
    {
      icon: "🏢",
      title: "Marketing Teams",
      story: "Brand Consistency",
      metric: "Unified Team Voice",
      description: "Maintain brand consistency across multiple team members. Everyone can generate on-brand scripts that match your company's tone and messaging.",
      outcome: "Consistent brand voice across creators",
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
        "The AI generates complete scripts in seconds, significantly reducing the time needed for script creation. A script that typically takes hours to research, write, and refine is ready in under a minute. This time savings allows you to focus on filming, engaging with your audience, or other business activities.",
    },
    {
      question: "How does AI help with content creation?",
      answer:
        "The AI provides complete scripts with hooks, story flow, and CTAs already structured. This helps you create content more consistently and efficiently. Each script is optimized for your chosen platform and includes elements designed to engage viewers.",
    },
    {
      question: "How does it help with audience growth?",
      answer:
        "AI scripts include hooks, pacing, and engagement techniques designed to capture attention. By helping you create more content consistently, the tool supports regular posting schedules that can benefit algorithmic reach and audience retention.",
    },
    {
      question: "Can I maintain my brand voice with AI scripts?",
      answer:
        "Yes. Every script is generated in 5 tone variations (casual, professional, energetic, educational, humorous) so you can choose what matches your brand. All scripts are fully editable—use them as-is or customize to add your unique personality while maintaining a professional foundation.",
    },
    {
      question: "What makes the AI-generated CTAs effective?",
      answer:
        "The AI creates CTAs based on analysis of successful video content across platforms. It considers psychological principles, clarity, and platform-specific best practices to structure calls-to-action that are clear and compelling.",
    },
    {
      question: "How do viral scores help me create better content?",
      answer:
        "The viral score provides an AI analysis of your script's potential before filming. It breaks down hook effectiveness, story engagement, and CTA strength separately. If your score is low, you can see exactly which elements need improvement, helping you refine scripts before investing time in production.",
    },
    {
      question: "What if I need help getting started?",
      answer:
        "We provide a complete step-by-step guide showing exactly how to use the Script Generator. You'll see live examples, best practices, and practical tips. Plus, you can generate your first script in under 60 seconds—minimal learning curve required.",
    },
  ];

  return (
    <>
      <MarketingNav />
      <Helmet>
        <title>Instant Script Creation - AI-Powered Video Script Generator | Pheme</title>
        <meta name="description" content="Generate complete video scripts in seconds with AI. Get platform-optimized scripts with hooks, story flow, and CTAs. Never start from scratch again." />
        <meta property="og:title" content="Instant Script Creation - AI-Powered Video Script Generator | Pheme" />
        <meta property="og:description" content="Generate complete video scripts in seconds with AI. Get platform-optimized scripts with hooks, story flow, and CTAs. Never start from scratch again." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://pheme.com/features/instant-script-creation" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Instant Script Creation - AI-Powered Video Script Generator | Pheme" />
        <meta name="twitter:description" content="Generate complete video scripts in seconds with AI. Get platform-optimized scripts with hooks, story flow, and CTAs. Never start from scratch again." />
      </Helmet>
      
      <div className="min-h-screen">
        <FeatureHero
          title="Generate Complete Video Scripts in Seconds"
          subtitle="AI-powered script generation with platform-optimized hooks, story flow, and CTAs. Get a professional foundation to build from—never start with a blank page."
          primaryCTA={{
            text: "Generate Your First Script",
            onClick: () => {
              trackNavigateCTA("ai_script_generator_hero", "generate_script");
              navigate("/dashboard");
            },
          }}
          secondaryCTA={{
            text: "See Use Cases",
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
              Powerful features that help you create better content faster.
            </p>
          </div>
          <FeatureGrid features={benefits} />
        </div>
      </section>

      <section id="success-stories" className="py-16 px-4 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Real Use Cases
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See how different creators use AI scripts to streamline their content workflow.
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
              Multiple approaches to script generation—each optimized for different content goals and strategies.
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
                    <h3 className="text-2xl font-bold mb-2" data-testid="trends-tab-title">Capitalize on Trending Topics</h3>
                    <p className="text-muted-foreground mb-4" data-testid="trends-tab-description">
                      Trending scripts use hooks and angles from current viral topics, helping you create timely content. Scripts are optimized with structures that work well for trending content—based on real-time patterns and popular formats.
                    </p>
                    <div className="space-y-2">
                      <Badge className="bg-green-600 text-white mr-2">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Timely content creation
                      </Badge>
                      <Badge className="bg-blue-600 text-white">
                        Current viral patterns included
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
                    <h3 className="text-2xl font-bold mb-2" data-testid="products-tab-title">Product-Focused Scripts with Strong CTAs</h3>
                    <p className="text-muted-foreground mb-4" data-testid="products-tab-description">
                      Product-focused scripts highlight key benefits and features that drive interest. AI structures content with clear CTAs and persuasive angles designed to convert viewers into customers. Each script emphasizes value propositions and includes natural product integration.
                    </p>
                    <div className="space-y-2">
                      <Badge className="bg-green-600 text-white mr-2">
                        <DollarSign className="h-3 w-3 mr-1" />
                        Conversion-optimized structure
                      </Badge>
                      <Badge className="bg-blue-600 text-white">
                        Clear, compelling CTAs
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
                    <h3 className="text-2xl font-bold mb-2" data-testid="ideas-tab-title">Transform Ideas into Scripts Quickly</h3>
                    <p className="text-muted-foreground mb-4" data-testid="ideas-tab-description">
                      Original ideas become complete scripts in seconds instead of hours of manual writing. AI structures your concepts with engagement techniques, hooks, and optimized pacing. This streamlined process allows you to create more content and spend time on other business priorities.
                    </p>
                    <div className="space-y-2">
                      <Badge className="bg-green-600 text-white mr-2">
                        <Clock className="h-3 w-3 mr-1" />
                        Rapid script creation
                      </Badge>
                      <Badge className="bg-blue-600 text-white">
                        Professional structure instantly
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
                    <h3 className="text-2xl font-bold mb-2" data-testid="competitors-tab-title">Learn From Successful Content Structures</h3>
                    <p className="text-muted-foreground mb-4" data-testid="competitors-tab-description">
                      Leverage successful patterns without copying. AI analyzes top-performing videos to extract effective structures—then applies them to your unique brand voice. Get competitive intelligence instantly that would otherwise require extensive manual analysis.
                    </p>
                    <div className="space-y-2">
                      <Badge className="bg-green-600 text-white mr-2">
                        <BarChart3 className="h-3 w-3 mr-1" />
                        Data-driven structures
                      </Badge>
                      <Badge className="bg-blue-600 text-white">
                        Learn from successful videos
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
            Start Generating Scripts in Seconds
          </h2>
          <p className="text-lg md:text-xl text-gray-200 mb-8">
            Join creators using AI-powered scripts to create content faster, more consistently, and with professional quality.
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

      {/* Before/After Comparison */}
      <section className="py-20 md:py-28 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto max-w-6xl px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Manual Scripting vs AI-Powered Scripts
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-8 bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900">
              <div className="flex items-center mb-6">
                <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mr-4">
                  <Clock className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-2xl font-bold">Manual Method</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <span className="text-red-500 mr-3 mt-1">✗</span>
                  <span>Hours spent researching trends and competitors</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-3 mt-1">✗</span>
                  <span>Starting from a blank page every time</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-3 mt-1">✗</span>
                  <span>Guessing which hooks will work</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-3 mt-1">✗</span>
                  <span>Inconsistent quality across videos</span>
                </li>
              </ul>
            </Card>

            <Card className="p-8 bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
              <div className="flex items-center mb-6">
                <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mr-4">
                  <Zap className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-2xl font-bold">With ScriptTok</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 mt-1">✓</span>
                  <span>Instant script generation in seconds</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 mt-1">✓</span>
                  <span>Professional foundation to build upon</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 mt-1">✓</span>
                  <span>Multiple hook variations included</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 mt-1">✓</span>
                  <span>Consistent quality and brand voice</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Time Savings Calculator */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-violet-600 to-purple-600 dark:from-violet-800 dark:to-purple-800">
        <div className="container mx-auto max-w-4xl px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12">
            Calculate Your Time Savings
          </h2>
          <Card className="p-8">
            <div className="space-y-6">
              <div>
                <label className="block font-semibold mb-3 text-gray-700 dark:text-gray-300">
                  How many scripts do you write per week?
                </label>
                <input 
                  type="number" 
                  className="w-full p-4 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 text-lg"
                  defaultValue={5}
                  min={1}
                  max={100}
                  onChange={(e) => {
                    const scripts = Number(e.target.value);
                    const manualHours = scripts * 2;
                    const aiMinutes = scripts * 2;
                    const savedHours = manualHours - (aiMinutes / 60);
                    const resultEl = document.getElementById('time-saved-result');
                    if (resultEl) {
                      resultEl.textContent = `${savedHours.toFixed(1)} hours per week`;
                    }
                  }}
                />
              </div>
              <div className="bg-green-50 dark:bg-green-950/30 p-6 rounded-lg border border-green-200 dark:border-green-900">
                <h3 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-2">
                  You Save: <span id="time-saved-result">10.0 hours per week</span>
                </h3>
                <p className="text-green-600 dark:text-green-500">
                  That's time you can spend creating more content, engaging with your audience, or focusing on strategy.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Get Hands-On?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Explore the step-by-step guide and see exactly how to use this feature.
          </p>
          <Button
            onClick={() => {
              trackNavigateCTA("instant_script_creation_cta", "script-generator");
              navigate("/tools/script-generator");
            }}
            size="lg"
            className="bg-violet-600 hover:bg-violet-700 text-white"
            data-testid="button-try-script-generator"
          >
            Try the Script Generator →
          </Button>
        </div>
      </section>

      <Footer />
      </div>
    </>
  );
}
