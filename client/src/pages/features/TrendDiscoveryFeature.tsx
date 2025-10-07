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
  Music, 
  Hash, 
  TrendingUp, 
  Filter, 
  FileText,
  Search,
  Sparkles,
  ArrowRight,
  BarChart3,
  Zap
} from "lucide-react";
import { MarketingNav } from '@/components/MarketingNav';

export default function TrendDiscoveryFeature() {
  const [_, navigate] = useLocation();
  const { trackNavigateCTA, trackSignupCTA } = useCTATracking();

  const features = [
    {
      icon: Globe,
      title: "Multi-Platform Tracking",
      description: "Monitor trending content across TikTok, Instagram, YouTube Shorts, and more—all in one dashboard.",
    },
    {
      icon: Music,
      title: "Trending Sounds Library",
      description: "Access the hottest sounds and audio tracks before they peak, giving you a competitive edge.",
    },
    {
      icon: Hash,
      title: "Hashtag Intelligence",
      description: "Discover emerging hashtags with growth potential and avoid oversaturated ones.",
    },
    {
      icon: TrendingUp,
      title: "Topic Forecaster",
      description: "AI-powered predictions of what topics will trend next in your niche.",
    },
    {
      icon: Filter,
      title: "Niche-Specific Trends",
      description: "Filter trends by your specific niche—beauty, tech, fitness, food, and 20+ more categories.",
    },
    {
      icon: FileText,
      title: "Trend-to-Script",
      description: "Generate scripts directly from trending topics with one click—no research needed.",
    },
  ];

  const discoveryProcess = [
    {
      icon: Search,
      title: "Real-Time Scanning",
      description: "AI monitors millions of posts across platforms every hour to identify emerging patterns.",
    },
    {
      icon: BarChart3,
      title: "Engagement Analysis",
      description: "Algorithms analyze view counts, engagement rates, and growth velocity to spot viral potential.",
    },
    {
      icon: Filter,
      title: "Niche Filtering",
      description: "Trends are categorized by niche, platform, and content type for easy discovery.",
    },
    {
      icon: Sparkles,
      title: "Instant Notifications",
      description: "Get alerted when a trend matches your niche before it hits mainstream saturation.",
    },
  ];

  const liveTrends = [
    {
      name: "Glow-Up Transformations",
      platform: "TikTok",
      engagement: "12.3M views",
      growth: "+340%",
      type: "Video Format",
    },
    {
      name: "#ThatGirlMorning",
      platform: "Instagram",
      engagement: "8.7M posts",
      growth: "+215%",
      type: "Hashtag",
    },
    {
      name: "Storytime + B-Roll",
      platform: "YouTube Shorts",
      engagement: "45M views",
      growth: "+180%",
      type: "Content Style",
    },
    {
      name: "Product Dupes Under $20",
      platform: "TikTok",
      engagement: "19.2M views",
      growth: "+290%",
      type: "Topic",
    },
    {
      name: "Before & After Edits",
      platform: "Instagram Reels",
      engagement: "6.4M posts",
      growth: "+165%",
      type: "Video Format",
    },
    {
      name: "Viral Sound: 'Original Audio'",
      platform: "Multi-Platform",
      engagement: "23.1M uses",
      growth: "+420%",
      type: "Audio",
    },
  ];

  const integrations = [
    {
      title: "Instant Script Generation",
      description: "Click any trend to automatically generate a script tailored to that topic with optimized hooks and CTAs.",
      icon: Zap,
    },
    {
      title: "Viral Score Preview",
      description: "See the predicted viral score of content based on each trend before you create it.",
      icon: TrendingUp,
    },
    {
      title: "Platform Optimization",
      description: "Trends come with platform-specific tips to maximize performance on TikTok, Instagram, or YouTube.",
      icon: Globe,
    },
  ];

  const faqs = [
    {
      question: "How often are trends updated?",
      answer: "Our AI scans platforms every hour and updates the trend dashboard in real-time. You'll always see the freshest trending topics, sounds, and hashtags as they emerge.",
    },
    {
      question: "Can I track trends in my specific niche?",
      answer: "Absolutely! Filter trends by 20+ niches including beauty, tech, fitness, food, travel, pets, fashion, and more. You can also set niche preferences to only see relevant trends.",
    },
    {
      question: "What's the difference between trending and saturated?",
      answer: "Our AI identifies trends in their growth phase—before they become oversaturated. We show growth velocity and current competition levels so you can jump on trends at the perfect time.",
    },
    {
      question: "Can I use trends from other platforms?",
      answer: "Yes! Many trends start on one platform and migrate to others. We track cross-platform trends and show you which ones are gaining traction on multiple channels.",
    },
    {
      question: "Do I need to research trends manually?",
      answer: "Not at all. Our AI does all the research for you—monitoring engagement, identifying patterns, and categorizing trends. Just browse, select, and create.",
    },
    {
      question: "Can I generate scripts directly from trends?",
      answer: "Yes! Every trend has a 'Generate Script' button that instantly creates a full video script optimized for that specific trend, complete with hooks, story flow, and CTAs.",
    },
    {
      question: "How do I know which trends will work for my content?",
      answer: "Each trend shows platform, niche, engagement stats, and growth rate. Our AI also provides suggestions on how to adapt trends to your unique brand voice and audience.",
    },
  ];

  const handleScrollToTable = () => {
    const element = document.getElementById('live-trends-dashboard');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <MarketingNav />
      <Helmet>
        <title>Trend Discovery - Real-Time Viral Trends & Sounds | ScriptTok</title>
        <meta name="description" content="Track trending sounds, hashtags, and topics across all platforms. Turn viral trends into ready-to-film scripts instantly." />
        <meta property="og:title" content="Trend Discovery - Real-Time Viral Trends & Sounds | ScriptTok" />
        <meta property="og:description" content="Track trending sounds, hashtags, and topics across all platforms. Turn viral trends into ready-to-film scripts instantly." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://scripttok.com/features/trend-discovery" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Trend Discovery - Real-Time Viral Trends & Sounds | ScriptTok" />
        <meta name="twitter:description" content="Track trending sounds, hashtags, and topics across all platforms. Turn viral trends into ready-to-film scripts instantly." />
      </Helmet>
      
      <div className="min-h-screen">
        <FeatureHero
          title="Never Miss a Viral Trend Again"
          subtitle="AI-powered trend discovery that finds what's about to go viral across every platform—before your competitors do."
          primaryCTA={{
            text: "Explore Trends Now",
            onClick: () => {
              trackNavigateCTA("trend_discovery_hero", "explore_trends");
              navigate("/trending-ai-picks");
            },
          }}
          secondaryCTA={{
            text: "See How It Works",
            onClick: () => {
              trackNavigateCTA("trend_discovery_hero", "how_it_works");
              navigate("/how-it-works");
            },
          }}
        />

      <section className="py-16 px-4 bg-white dark:bg-gray-900">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Powerful Trend Discovery Features
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to stay ahead of the viral curve.
            </p>
          </div>
          <FeatureGrid features={features} />
        </div>
      </section>

      <section className="py-16 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How Trend Discovery Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered system finds viral trends before they peak.
            </p>
          </div>
          
          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {discoveryProcess.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={index} className="relative" data-testid={`discovery-step-${index}`}>
                    <Card className="rounded-2xl shadow-sm h-full">
                      <div className="p-6">
                        <div className="flex flex-col items-center text-center">
                          <div className="bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900 dark:to-purple-900 p-4 rounded-full mb-4">
                            <Icon className="h-8 w-8 text-violet-600 dark:text-violet-400" />
                          </div>
                          <h3 className="text-xl font-semibold mb-3" data-testid={`discovery-title-${index}`}>
                            {step.title}
                          </h3>
                          <p className="text-muted-foreground text-sm" data-testid={`discovery-description-${index}`}>
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </Card>
                    {index < discoveryProcess.length - 1 && (
                      <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                        <ArrowRight className="h-6 w-6 text-violet-600" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section id="live-trends-dashboard" className="py-16 px-4 bg-white dark:bg-gray-900">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Live Trends Dashboard Preview
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See what's trending right now across all platforms.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveTrends.map((trend, index) => (
              <Card
                key={index}
                className="rounded-2xl shadow-sm hover:shadow-lg transition-all border-2 border-transparent hover:border-violet-200 dark:hover:border-violet-800"
                data-testid={`trend-card-${index}`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2" data-testid={`trend-name-${index}`}>
                        {trend.name}
                      </h3>
                      <div className="flex gap-2 flex-wrap mb-3">
                        <Badge variant="outline" className="text-xs" data-testid={`trend-platform-${index}`}>
                          {trend.platform}
                        </Badge>
                        <Badge variant="secondary" className="text-xs" data-testid={`trend-type-${index}`}>
                          {trend.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Engagement</p>
                      <p className="font-semibold text-sm" data-testid={`trend-engagement-${index}`}>
                        {trend.engagement}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Growth</p>
                      <p className="font-semibold text-sm text-green-600 dark:text-green-400" data-testid={`trend-growth-${index}`}>
                        {trend.growth}
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl"
                    onClick={() => {
                      trackNavigateCTA("trend_discovery_dashboard", `generate_from_trend_${trend.name}`);
                      navigate("/dashboard");
                    }}
                    data-testid={`button-generate-script-${index}`}
                  >
                    <Zap className="mr-2 h-4 w-4" />
                    Generate Script
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Seamless Integration With Other Features
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Trend discovery works hand-in-hand with our entire content creation suite.
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

      <FAQAccordion faqs={faqs} className="bg-white dark:bg-gray-900" />

      <section className="bg-gradient-cta text-white py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Start Discovering Trends
          </h2>
          <p className="text-lg md:text-xl text-gray-200 mb-8">
            Never miss a viral opportunity again. Find trending topics, sounds, and hashtags in real-time.
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
            <TrendingUp className="mr-2 h-5 w-5" />
            Explore Trending Content Now
          </Button>
        </div>
      </section>
      </div>
    </>
  );
}
