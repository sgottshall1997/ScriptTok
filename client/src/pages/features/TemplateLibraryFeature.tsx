import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FeatureHero,
  HowItWorksSection,
  FAQAccordion,
} from "@/components/features";
import { useLocation } from "wouter";
import { useCTATracking } from "@/hooks/use-cta-tracking";
import { 
  Zap, 
  Star, 
  TrendingUp,
  Heart,
  ShoppingBag,
  Sparkles,
  Video,
  Instagram,
  Youtube,
  Clock,
  Layout,
  Target,
  Flame,
} from "lucide-react";
import { MarketingNav } from '@/components/MarketingNav';
import Footer from "@/components/Footer";

export default function TemplateLibraryFeature() {
  const [_, navigate] = useLocation();
  const { trackNavigateCTA, trackSignupCTA } = useCTATracking();

  const steps = [
    {
      number: 1,
      title: "Select Template",
      description: "Browse by type, platform, niche, or duration to find the perfect template.",
    },
    {
      number: 2,
      title: "Customize Content",
      description: "AI pre-fills the template with your brand voice, products, or trending topics.",
    },
    {
      number: 3,
      title: "Generate & Export",
      description: "One-click generation creates your ready-to-record script instantly.",
    },
  ];

  const templatesByType = [
    { name: "Product Showcase", icon: ShoppingBag, description: "Highlight features and benefits" },
    { name: "Before & After", icon: Star, description: "Transformation-focused content" },
    { name: "Trending Hook", icon: TrendingUp, description: "Capitalize on viral trends" },
    { name: "Tutorial", icon: Video, description: "Step-by-step how-to guides" },
    { name: "Review", icon: Heart, description: "Honest product reviews" },
    { name: "Unboxing", icon: ShoppingBag, description: "First impression reveals" },
  ];

  const templatesByPlatform = [
    { platform: "TikTok", icon: Video, count: 12, badge: "Most Popular" },
    { platform: "Instagram Reels", icon: Instagram, count: 10, badge: null },
    { platform: "YouTube Shorts", icon: Youtube, count: 8, badge: "New" },
  ];

  const templatesByNiche = [
    { niche: "Beauty", count: 8, color: "bg-pink-100 dark:bg-pink-900 text-pink-600 dark:text-pink-400" },
    { niche: "Tech", count: 7, color: "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400" },
    { niche: "Fashion", count: 6, color: "bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400" },
    { niche: "Fitness", count: 5, color: "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400" },
    { niche: "Food", count: 5, color: "bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400" },
    { niche: "Lifestyle", count: 4, color: "bg-violet-100 dark:bg-violet-900 text-violet-600 dark:text-violet-400" },
  ];

  const templatesByDuration = [
    { duration: "15 seconds", count: 8, icon: Clock, recommended: "Quick Hooks" },
    { duration: "30 seconds", count: 10, icon: Clock, recommended: "Product Features" },
    { duration: "60 seconds", count: 7, icon: Clock, recommended: "Story Telling" },
    { duration: "90+ seconds", count: 5, icon: Clock, recommended: "Deep Dives" },
  ];

  const allTemplates = [
    { name: "Viral Hook Opener", niche: "Lifestyle", platforms: ["TikTok", "Instagram"], duration: "15s" },
    { name: "Product Unboxing Flow", niche: "Tech", platforms: ["TikTok", "YouTube"], duration: "45s" },
    { name: "Before & After Transformation", niche: "Beauty", platforms: ["Instagram", "TikTok"], duration: "30s" },
    { name: "Quick Tutorial", niche: "DIY", platforms: ["TikTok"], duration: "60s" },
    { name: "Product Review Template", niche: "Tech", platforms: ["YouTube", "TikTok"], duration: "90s" },
    { name: "Day in the Life", niche: "Lifestyle", platforms: ["Instagram", "TikTok"], duration: "60s" },
    { name: "Myth Buster", niche: "Education", platforms: ["TikTok"], duration: "30s" },
    { name: "Problem-Solution", niche: "Business", platforms: ["TikTok", "Instagram"], duration: "45s" },
    { name: "Trend Jacking", niche: "Entertainment", platforms: ["TikTok"], duration: "15s" },
    { name: "Get Ready With Me", niche: "Beauty", platforms: ["Instagram", "TikTok"], duration: "60s" },
    { name: "5 Tips Quick List", niche: "Education", platforms: ["TikTok", "Instagram"], duration: "30s" },
    { name: "Behind the Scenes", niche: "Business", platforms: ["Instagram"], duration: "45s" },
    { name: "Story Time", niche: "Lifestyle", platforms: ["TikTok"], duration: "90s" },
    { name: "What I Eat in a Day", niche: "Food", platforms: ["Instagram", "TikTok"], duration: "60s" },
    { name: "Workout Routine", niche: "Fitness", platforms: ["TikTok", "YouTube"], duration: "60s" },
    { name: "Product Comparison", niche: "Tech", platforms: ["YouTube"], duration: "90s" },
    { name: "First Impressions", niche: "Beauty", platforms: ["TikTok", "Instagram"], duration: "30s" },
    { name: "Morning Routine", niche: "Lifestyle", platforms: ["Instagram"], duration: "60s" },
    { name: "Recipe Quick Tip", niche: "Food", platforms: ["TikTok"], duration: "30s" },
    { name: "Fashion Haul", niche: "Fashion", platforms: ["Instagram", "TikTok"], duration: "90s" },
    { name: "Tech Setup Tour", niche: "Tech", platforms: ["YouTube"], duration: "120s" },
    { name: "Transformation Journey", niche: "Fitness", platforms: ["Instagram"], duration: "60s" },
  ];

  const topPerformers = [
    {
      name: "Viral Hook Opener",
      niche: "Lifestyle",
      avgViews: "2.4M",
      conversionRate: "12.3%",
      description: "Proven hook that stops scrollers in the first 3 seconds",
    },
    {
      name: "Product Unboxing Flow",
      niche: "Tech",
      avgViews: "1.8M",
      conversionRate: "15.7%",
      description: "Perfect for affiliate content with built-in CTAs",
    },
    {
      name: "Before & After Transformation",
      niche: "Beauty",
      avgViews: "3.1M",
      conversionRate: "18.2%",
      description: "High engagement with visual transformation reveals",
    },
    {
      name: "Quick Tutorial",
      niche: "DIY",
      avgViews: "1.5M",
      conversionRate: "9.8%",
      description: "Educational content that builds trust and authority",
    },
    {
      name: "Problem-Solution",
      niche: "Business",
      avgViews: "2.2M",
      conversionRate: "14.5%",
      description: "Addresses pain points and presents clear solutions",
    },
    {
      name: "5 Tips Quick List",
      niche: "Education",
      avgViews: "1.9M",
      conversionRate: "11.2%",
      description: "Easy to follow, highly shareable format",
    },
  ];

  const faqs = [
    {
      question: "How many templates are included?",
      answer:
        "We offer 20+ professionally crafted templates covering viral, educational, product-focused, and storytelling formats. New templates are added monthly based on trending content patterns.",
    },
    {
      question: "Can I customize the templates?",
      answer:
        "Absolutely! Every template is fully customizable. You can adjust hooks, story flow, CTAs, tone, length, and any other element to match your brand and content goals.",
    },
    {
      question: "Are templates platform-specific?",
      answer:
        "Templates are optimized for TikTok, Instagram Reels, and YouTube Shorts. Each template indicates which platforms it works best on, and you can customize for multi-platform use.",
    },
    {
      question: "Do templates work for both Viral and Affiliate studios?",
      answer:
        "Yes! Most templates work in both studios, with AI automatically adjusting hooks and CTAs based on your selected mode (viral engagement vs. affiliate conversion).",
    },
    {
      question: "Can I save my own templates?",
      answer:
        "Pro users can save custom templates from their best-performing content. Simply generate a script, customize it, and save it as a reusable template for future use.",
    },
    {
      question: "Which templates perform best?",
      answer:
        "Our top performers include 'Viral Hook Opener' (2.4M avg views), 'Before & After Transformation' (3.1M avg views), and 'Product Unboxing Flow' (15.7% conversion rate). Performance varies by niche and audience.",
    },
    {
      question: "Are new templates added regularly?",
      answer:
        "Yes, we analyze trending content patterns weekly and add new templates monthly. Pro users get early access to new templates before they're released to all users.",
    },
  ];

  const scrollToTopPerformers = () => {
    const element = document.getElementById("top-performers");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <MarketingNav />
      <Helmet>
        <title>Template Library - 20+ Proven Script Templates | ScriptTok</title>
        <meta name="description" content="Pre-built viral formulas and affiliate frameworks for every niche. Browse proven templates and customize in seconds." />
        <meta property="og:title" content="Template Library - 20+ Proven Script Templates | ScriptTok" />
        <meta property="og:description" content="Pre-built viral formulas and affiliate frameworks for every niche. Browse proven templates and customize in seconds." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://scripttok.com/features/template-library" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Template Library - 20+ Proven Script Templates | ScriptTok" />
        <meta name="twitter:description" content="Pre-built viral formulas and affiliate frameworks for every niche. Browse proven templates and customize in seconds." />
      </Helmet>
      
      <div className="min-h-screen">
        <FeatureHero
          title="20+ Proven Templates for Every Niche & Platform"
          subtitle="Professional script templates tested across millions of views. Customize for your brand and start creating in seconds."
          primaryCTA={{
            text: "Browse All Templates",
            onClick: () => {
              trackNavigateCTA("template_library_hero", "browse_templates");
              navigate("/dashboard");
            },
          }}
          secondaryCTA={{
            text: "See Top Performers",
            onClick: () => {
              trackNavigateCTA("template_library_hero", "see_top_performers");
              scrollToTopPerformers();
            },
          }}
        />

      <section className="py-16 px-4 bg-white dark:bg-gray-900">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Template Categories</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Find the perfect template for your content style and audience.
            </p>
          </div>

          <Tabs defaultValue="by-type" className="w-full" data-testid="template-categories-tabs">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto md:h-10">
              <TabsTrigger value="by-type" data-testid="tab-by-type">
                By Type
              </TabsTrigger>
              <TabsTrigger value="by-platform" data-testid="tab-by-platform">
                By Platform
              </TabsTrigger>
              <TabsTrigger value="by-niche" data-testid="tab-by-niche">
                By Niche
              </TabsTrigger>
              <TabsTrigger value="by-duration" data-testid="tab-by-duration">
                By Duration
              </TabsTrigger>
            </TabsList>

            <TabsContent value="by-type" className="mt-8" data-testid="by-type-content">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templatesByType.map((template, index) => {
                  const Icon = template.icon;
                  return (
                    <Card
                      key={index}
                      className="rounded-2xl p-6 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => {
                        trackNavigateCTA("template_library_type", `use_${template.name}`);
                        navigate("/dashboard");
                      }}
                      data-testid={`type-template-${index}`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900 dark:to-purple-900 p-3 rounded-full">
                          <Icon className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-1" data-testid={`type-template-name-${index}`}>{template.name}</h3>
                          <p className="text-sm text-muted-foreground" data-testid={`type-template-description-${index}`}>{template.description}</p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="by-platform" className="mt-8" data-testid="by-platform-content">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {templatesByPlatform.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <Card
                      key={index}
                      className="rounded-2xl p-6 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => {
                        trackNavigateCTA("template_library_platform", `browse_${item.platform}`);
                        navigate("/dashboard");
                      }}
                      data-testid={`platform-template-${index}`}
                    >
                      <div className="flex flex-col items-center text-center gap-4">
                        <div className="bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900 dark:to-purple-900 p-4 rounded-full">
                          <Icon className="h-8 w-8 text-violet-600 dark:text-violet-400" />
                        </div>
                        <div>
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <h3 className="text-xl font-semibold" data-testid={`platform-template-name-${index}`}>{item.platform}</h3>
                            {item.badge && (
                              <Badge variant="secondary" className="text-xs" data-testid={`platform-template-badge-${index}`}>
                                {item.badge}
                              </Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground" data-testid={`platform-template-count-${index}`}>{item.count} Templates</p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="by-niche" className="mt-8" data-testid="by-niche-content">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {templatesByNiche.map((item, index) => (
                  <Card
                    key={index}
                    className="rounded-2xl p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => {
                      trackNavigateCTA("template_library_niche", `browse_${item.niche}`);
                      navigate("/dashboard");
                    }}
                    data-testid={`niche-template-${index}`}
                  >
                    <div className="flex flex-col items-center text-center gap-2">
                      <div className={`${item.color} p-3 rounded-full`}>
                        <Layout className="h-5 w-5" />
                      </div>
                      <h4 className="font-semibold text-sm" data-testid={`niche-template-name-${index}`}>{item.niche}</h4>
                      <p className="text-xs text-muted-foreground" data-testid={`niche-template-count-${index}`}>{item.count} templates</p>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="by-duration" className="mt-8" data-testid="by-duration-content">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {templatesByDuration.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <Card
                      key={index}
                      className="rounded-2xl p-6 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => {
                        trackNavigateCTA("template_library_duration", `browse_${item.duration}`);
                        navigate("/dashboard");
                      }}
                      data-testid={`duration-template-${index}`}
                    >
                      <div className="flex flex-col gap-3">
                        <div className="bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900 dark:to-purple-900 p-3 rounded-full w-fit">
                          <Icon className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1" data-testid={`duration-template-duration-${index}`}>{item.duration}</h3>
                          <p className="text-sm text-muted-foreground" data-testid={`duration-template-count-${index}`}>{item.count} templates</p>
                          <Badge variant="outline" className="text-xs mt-2" data-testid={`duration-template-recommended-${index}`}>
                            {item.recommended}
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <section className="py-16 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">All Templates</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Browse our complete library of proven script templates.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {allTemplates.map((template, index) => (
              <Card
                key={index}
                className="rounded-2xl p-4 hover:shadow-md transition-shadow"
                data-testid={`all-template-${index}`}
              >
                <div className="flex flex-col gap-3">
                  <h4 className="font-semibold text-sm" data-testid={`all-template-name-${index}`}>
                    {template.name}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs" data-testid={`all-template-niche-${index}`}>
                      {template.niche}
                    </Badge>
                    <Badge variant="secondary" className="text-xs" data-testid={`all-template-duration-${index}`}>
                      {template.duration}
                    </Badge>
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {template.platforms.map((platform, pIndex) => (
                      <Badge key={pIndex} className="text-xs bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300" data-testid={`all-template-platform-${index}-${pIndex}`}>
                        {platform}
                      </Badge>
                    ))}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full"
                    onClick={() => {
                      trackNavigateCTA("template_library_all", `use_${template.name}`);
                      navigate("/dashboard");
                    }}
                    data-testid={`button-use-all-template-${index}`}
                  >
                    Use Template
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <HowItWorksSection
        title="How to Use Templates"
        steps={steps}
        className="bg-white dark:bg-gray-900"
      />

      <section id="top-performers" className="py-16 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Flame className="h-8 w-8 text-orange-500" />
              <h2 className="text-3xl md:text-4xl font-bold">Top Performing Templates</h2>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our highest-converting templates with proven results across millions of views.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topPerformers.map((template, index) => (
              <Card
                key={index}
                className="rounded-2xl p-6 hover:shadow-lg transition-shadow border-2 border-violet-200 dark:border-violet-800"
                data-testid={`top-performer-${index}`}
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold mb-1" data-testid={`top-performer-name-${index}`}>{template.name}</h3>
                      <Badge variant="outline" className="text-xs" data-testid={`top-performer-niche-${index}`}>
                        {template.niche}
                      </Badge>
                    </div>
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  </div>
                  <p className="text-sm text-muted-foreground" data-testid={`top-performer-description-${index}`}>{template.description}</p>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground">Avg. Views</p>
                      <p className="text-lg font-bold text-violet-600 dark:text-violet-400" data-testid={`top-performer-avg-views-${index}`}>
                        {template.avgViews}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Conversion</p>
                      <p className="text-lg font-bold text-violet-600 dark:text-violet-400" data-testid={`top-performer-conversion-${index}`}>
                        {template.conversionRate}
                      </p>
                    </div>
                  </div>
                  <Button
                    className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:opacity-90"
                    onClick={() => {
                      trackNavigateCTA("template_library_top_performer", `use_${template.name}`);
                      navigate("/dashboard");
                    }}
                    data-testid={`button-top-performer-${index}`}
                  >
                    <Target className="mr-2 h-4 w-4" />
                    Use This Template
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <FAQAccordion faqs={faqs} className="bg-white dark:bg-gray-900" />

      <section className="bg-gradient-cta text-white py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Browse Templates Now</h2>
          <p className="text-lg md:text-xl text-gray-200 mb-8">
            Start with proven templates and create your first viral script in minutes.
          </p>
          <Button
            onClick={() => {
              trackSignupCTA("template_library_cta");
              navigate("/dashboard");
            }}
            size="lg"
            className="bg-white text-purple-600 hover:bg-gray-100 rounded-xl"
            data-testid="button-template-library-cta"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Explore All Templates
          </Button>
        </div>
      </section>

      <Footer />
      </div>
    </>
  );
}
