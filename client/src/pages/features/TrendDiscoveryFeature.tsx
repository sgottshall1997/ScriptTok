import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FeatureHero,
  FeatureGrid,
  FAQAccordion,
} from "@/components/features";
import { useLocation } from "wouter";
import { useCTATracking } from "@/hooks/use-cta-tracking";
import { 
  Globe, 
  Package, 
  Users, 
  TrendingUp, 
  Filter, 
  FileText,
  Search,
  Sparkles,
  ArrowRight,
  BarChart3,
  Zap,
  Target,
  Clock,
  Video,
  Image,
  Database,
  BookOpen
} from "lucide-react";
import { MarketingNav } from '@/components/MarketingNav';
import Footer from "@/components/Footer";

export default function TrendDiscoveryFeature() {
  const [_, navigate] = useLocation();
  const { trackNavigateCTA, trackSignupCTA } = useCTATracking();

  const features = [
    {
      icon: Database,
      title: "Complete Trend Research Packages",
      description: "Every trend delivers a comprehensive intelligence report: viral hooks, target audiences, trending angles, popularity scores, peak times, related trends, and more—all in one place.",
    },
    {
      icon: Target,
      title: "Target Audience Intelligence",
      description: "Get detailed demographic data, interests, engagement patterns, and psychographics for each trend so you can tailor content perfectly.",
    },
    {
      icon: Package,
      title: "Trend-Matched Product Engine",
      description: "AI automatically finds products that align with trending topics AND your niche, complete with photos, pricing, descriptions, and affiliate links.",
    },
    {
      icon: Video,
      title: "Competitor Video Analysis",
      description: "Automatically pulls top-performing competitor videos with thumbnails, view counts, and engagement data so you can see what's working.",
    },
    {
      icon: Clock,
      title: "Optimal Posting Times",
      description: "AI determines the best days and times to post each trend based on when it gets maximum engagement across platforms.",
    },
    {
      icon: Image,
      title: "Visual Trend Intelligence",
      description: "Every trend package includes visual data—competitor video previews, product images, and trend visualizations for complete context.",
    },
  ];

  const intelligenceOutcomes = [
    {
      icon: TrendingUp,
      title: "Discover Emerging Trends Early",
      description: "Real-time AI monitoring helps you identify trending topics as they emerge, giving you time to create content before trends peak.",
    },
    {
      icon: Target,
      title: "Comprehensive Trend Intelligence",
      description: "Complete intelligence packages include hooks, target audiences, trending angles, and optimal posting times—all organized in one report for easy reference.",
    },
    {
      icon: Package,
      title: "Automatic Product Matching",
      description: "AI finds products that align with trending topics and your niche, complete with images, descriptions, and affiliate links ready to include in your content.",
    },
    {
      icon: Video,
      title: "Competitor Insights",
      description: "Instant access to top-performing competitor videos shows you what's working. See thumbnails, view counts, and engagement data to inform your strategy.",
    },
    {
      icon: Database,
      title: "Complete Trend Packages",
      description: "Scripts generated from full trend packages include hooks, audience insights, matched products, and competitor analysis—everything in one place.",
    },
  ];

  const trendPackageExample = {
    category: "Anime & Pop Culture",
    trend: "One Piece Live-Action Reactions",
    components: [
      {
        icon: "🔥",
        title: "Viral Hooks",
        items: [
          "Reacting to iconic One Piece moments with live emotions",
          "Cosplaying as favorite characters and sharing transformation",
          "Ranking devil fruits and debating their powers"
        ]
      },
      {
        icon: "👥",
        title: "Target Audience",
        description: "Gen Z and Millennials (ages 16-34), anime enthusiasts, cosplayers, meme creators, and pop culture fans who enjoy long-running series and community engagement"
      },
      {
        icon: "📐",
        title: "Trending Angles",
        items: [
          "Comparing live-action adaptation scenes to anime originals",
          "Fan theories about upcoming story arcs and character fates",
          "Sharing personal journeys of watching One Piece from episode 1"
        ]
      },
      {
        icon: "✨",
        title: "Trend Insights",
        data: {
          "Popularity Score": "85/100",
          "Peak Time": "August-September 2025 (post live-action release)",
          "Related Trends": "Live-action anime adaptations, Anime reaction videos"
        }
      },
      {
        icon: "📅",
        title: "Best Time to Post",
        times: ["Friday evenings (6-9 PM local time)", "Sunday afternoons (2-5 PM local time)"]
      },
      {
        icon: "🔥",
        title: "Competitor Videos",
        description: "View trending competitor videos with visual previews and performance data"
      }
    ]
  };

  const integrations = [
    {
      title: "One-Click Script Generation",
      description: "Generate complete scripts with all trend data, product info, and competitor insights automatically baked in—no manual research needed.",
      icon: Zap,
    },
    {
      title: "Product-to-Script Integration",
      description: "Matched products flow directly into script generation with descriptions, benefits, and CTAs already optimized for your niche.",
      icon: Package,
    },
    {
      title: "Competitor-Informed Scripts",
      description: "Scripts incorporate insights from top-performing competitor videos—hooks, storytelling techniques, and CTAs that convert.",
      icon: Video,
    },
  ];

  const faqs = [
    {
      question: "What exactly is included in each trend research package?",
      answer: "Every trend delivers a comprehensive intelligence report including: viral hooks (specific content ideas), target audience (demographics, interests, engagement patterns), trending angles (unique approaches to the topic), popularity score (0-100 rating), peak timing (when trend hits maximum engagement), related trends, best posting times (day/time recommendations), matched products with images and affiliate links, and competitor video analysis with visual previews. It's everything you need to create viral content in one instant report.",
    },
    {
      question: "How does the AI find and match products to trends?",
      answer: "Our AI analyzes each trending topic and identifies products that align with both the trend AND your selected niche. For example, if there's a 'Morning Routine' trend in the Beauty niche, it will find skincare and beauty products related to morning routines. You get product photos, pricing, descriptions, purchase links, and suggested talking points—all ready to use in your content.",
    },
    {
      question: "What competitor intelligence do I get with each trend?",
      answer: "For every trend and matched product, our system automatically pulls the top-performing competitor videos across platforms. You see visual thumbnails, view counts, engagement rates, and we analyze what hooks, storytelling techniques, and CTAs they're using successfully. This gives you a blueprint of what's working right now.",
    },
    {
      question: "How are the 'best posting times' determined for each trend?",
      answer: "Our AI analyzes millions of posts related to each specific trend to identify when it gets maximum engagement. Unlike generic 'best time to post' advice, these recommendations are tailored to each individual trend based on real performance data. You get specific day-of-week and time-of-day windows optimized for that trend.",
    },
    {
      question: "How detailed is the target audience data?",
      answer: "For each trend, you get comprehensive audience profiles including: age ranges, gender distribution, geographic hotspots, interests and hobbies, platform preferences (TikTok vs Instagram vs YouTube), engagement patterns (when they're most active), and psychographic data (what motivates them). This lets you tailor your script, tone, visuals, and CTAs to resonate perfectly with the exact people engaging with that trend.",
    },
    {
      question: "Can I see visual examples before creating content?",
      answer: "Absolutely! Every trend package includes rich visual data: competitor video thumbnails (so you can see what successful videos look like), product images (with clear photos of matched products), trend visualization charts (showing popularity over time), and related content examples. You have complete visual context before filming a single second.",
    },
    {
      question: "How does this all flow into script generation?",
      answer: "When you click 'Generate Script' on any trend, all the research data (viral hooks, target audience, trending angles, matched products, competitor insights, posting times) automatically feeds into our AI. The script is crafted using this comprehensive intelligence—hooks that are proven viral, angles that resonate with the audience, products presented with benefits your viewers care about, and CTAs modeled after top performers. It's data-backed content creation.",
    },
  ];

  const handleScrollToExample = () => {
    const element = document.getElementById('trend-package-example');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <MarketingNav />
      <Helmet>
        <title>Trend Discovery - Comprehensive Trend Intelligence Packages | Pheme</title>
        <meta name="description" content="Get complete trend research packages with viral hooks, target audiences, product matches, competitor videos, and optimal posting times. AI-powered trend intelligence delivered instantly." />
        <meta property="og:title" content="Trend Discovery - Comprehensive Trend Intelligence Packages | Pheme" />
        <meta property="og:description" content="Get complete trend research packages with viral hooks, target audiences, product matches, competitor videos, and optimal posting times. AI-powered trend intelligence delivered instantly." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://pheme.com/features/trend-discovery" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Trend Discovery - Comprehensive Trend Intelligence Packages | Pheme" />
        <meta name="twitter:description" content="Get complete trend research packages with viral hooks, target audiences, product matches, competitor videos, and optimal posting times. AI-powered trend intelligence delivered instantly." />
      </Helmet>

      <div className="min-h-screen">
        <FeatureHero
          title="Complete Trend Intelligence Packages"
          subtitle="From viral hooks to matched products to competitor videos—get everything you need to create viral content in one comprehensive AI-powered research report"
          primaryCTA={{
            text: "Get Full Trend Packages",
            onClick: () => {
              trackNavigateCTA("trend_discovery_hero", "explore_trends");
              navigate("/trending-ai-picks");
            },
          }}
          secondaryCTA={{
            text: "See Example Package",
            onClick: () => {
              trackNavigateCTA("trend_discovery_hero", "example_package");
              handleScrollToExample();
            },
          }}
        />

      <section className="py-16 px-4 bg-white dark:bg-gray-900">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Comprehensive Trend Research Features
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Every trend delivers a complete intelligence package—no manual research required.
            </p>
          </div>
          <FeatureGrid features={features} />
        </div>
      </section>

      <section className="py-16 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What You Achieve With Trend Intelligence
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              How comprehensive trend packages help you create better content with complete intelligence and insights.
            </p>
          </div>

          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {intelligenceOutcomes.map((outcome, index) => {
                const Icon = outcome.icon;
                return (
                  <div key={index} className="relative" data-testid={`discovery-step-${index}`}>
                    <Card className="rounded-2xl shadow-sm h-full">
                      <div className="p-6">
                        <div className="flex flex-col items-center text-center">
                          <div className="bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900 dark:to-purple-900 p-4 rounded-full mb-4">
                            <Icon className="h-8 w-8 text-violet-600 dark:text-violet-400" />
                          </div>
                          <h3 className="text-lg font-semibold mb-3" data-testid={`discovery-title-${index}`}>
                            {outcome.title}
                          </h3>
                          <p className="text-muted-foreground text-sm" data-testid={`discovery-description-${index}`}>
                            {outcome.description}
                          </p>
                        </div>
                      </div>
                    </Card>
                    {index < intelligenceOutcomes.length - 1 && (
                      <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                        <ArrowRight className="h-5 w-5 text-violet-600" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section id="trend-package-example" className="py-16 px-4 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Complete Trend Package Example
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See exactly what you get with each trend—a comprehensive intelligence report delivered instantly
            </p>
          </div>

          <Card className="border-2 border-violet-200 dark:border-violet-800">
            <div className="p-8 md:p-12">
              <div className="mb-8">
                <Badge className="bg-violet-600 text-white mb-4 text-sm">
                  {trendPackageExample.category}
                </Badge>
                <h3 className="text-2xl md:text-3xl font-bold mb-2">
                  📊 {trendPackageExample.trend}
                </h3>
                <p className="text-muted-foreground">Complete research package delivered in seconds</p>
              </div>

              <div className="space-y-6">
                {trendPackageExample.components.map((component, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <span className="text-2xl">{component.icon}</span>
                      {component.title}
                    </h4>
                    
                    {component.items && (
                      <ul className="space-y-2">
                        {component.items.map((item, i) => (
                          <li key={i} className="text-muted-foreground flex items-start gap-2">
                            <span className="text-violet-600 mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    
                    {component.description && (
                      <p className="text-muted-foreground">{component.description}</p>
                    )}
                    
                    {component.data && (
                      <div className="space-y-2">
                        {Object.entries(component.data).map(([key, value]) => (
                          <p key={key} className="text-muted-foreground">
                            <span className="font-medium text-gray-900 dark:text-white">{key}:</span> {value}
                          </p>
                        ))}
                      </div>
                    )}
                    
                    {component.times && (
                      <div className="flex gap-3 flex-wrap">
                        {component.times.map((time, i) => (
                          <Badge key={i} variant="secondary">
                            {time}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6 border-2 border-orange-200 dark:border-orange-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-semibold mb-2">
                        🔥 View Trending Competitor Videos
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        Automatically pulled with thumbnails, engagement data, and performance analysis
                      </p>
                    </div>
                    <Button 
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                      onClick={() => navigate("/dashboard")}
                    >
                      View Videos →
                    </Button>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border-2 border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-center gap-3">
                    <Sparkles className="h-6 w-6 text-green-600" />
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      ⚡ Plus: Matched Products with Images + One-Click Script Generation
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 text-center">
                <Badge className="bg-violet-600 text-white text-base px-6 py-3">
                  ✅ Complete Content Intelligence Package - Ready to Create
                </Badge>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="py-16 px-4 bg-white dark:bg-gray-900">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Seamless Integration With Script Generation
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              All trend intelligence flows directly into AI script generation—creating data-backed viral content
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {integrations.map((integration, index) => {
              const Icon = integration.icon;
              return (
                <Card
                  key={index}
                  className="rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                  data-testid={`integration-card-${index}`}
                >
                  <div className="p-6">
                    <div className="bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900 dark:to-purple-900 p-3 rounded-full inline-block mb-4">
                      <Icon className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3" data-testid={`integration-title-${index}`}>
                      {integration.title}
                    </h3>
                    <p className="text-muted-foreground" data-testid={`integration-description-${index}`}>
                      {integration.description}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
        <div className="container mx-auto max-w-4xl">
          <Card className="rounded-2xl p-8 md:p-12 border-2 border-orange-200 dark:border-orange-800">
            <div className="text-center mb-6">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Want to See Exactly How This Works?
              </h2>
              <p className="text-lg text-muted-foreground">
                Get a complete step-by-step guide showing you how to use Trend Discovery to get comprehensive research packages and generate viral content instantly.
              </p>
            </div>
            <div className="flex justify-center">
              <Button
                onClick={() => {
                  trackNavigateCTA("trend_discovery_guide", "view_guide");
                  navigate("/tools/trend-discovery");
                }}
                size="lg"
                className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl"
                data-testid="button-view-guide"
              >
                <BookOpen className="mr-2 h-5 w-5" />
                See Step-by-Step Usage Guide
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </Card>
        </div>
      </section>

      <FAQAccordion faqs={faqs} className="bg-gray-50 dark:bg-gray-800" />

      <section className="bg-gradient-cta text-white py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Start Getting Complete Trend Intelligence
          </h2>
          <p className="text-lg md:text-xl text-gray-200 mb-8">
            Viral hooks, target audiences, products, competitor videos, and optimal timing—all in one comprehensive AI report
          </p>
          <Button
            onClick={() => {
              trackSignupCTA("trend_discovery_cta");
              navigate("/dashboard");
            }}
            size="lg"
            className="bg-white text-purple-600 hover:bg-gray-100 rounded-xl"
            data-testid="button-trend-discovery-cta"
          >
            <Database className="mr-2 h-5 w-5" />
            Get Full Trend Packages Now
          </Button>
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
              trackNavigateCTA("trend_discovery_feature_cta", "trend-discovery");
              navigate("/tools/trend-discovery");
            }}
            size="lg"
            className="bg-violet-600 hover:bg-violet-700 text-white"
            data-testid="button-try-trend-discovery"
          >
            Try Trend Discovery →
          </Button>
        </div>
      </section>

      <Footer />
      </div>
    </>
  );
}
