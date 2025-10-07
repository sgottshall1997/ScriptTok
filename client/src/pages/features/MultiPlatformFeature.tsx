import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FeatureHero,
  FeatureGrid,
  HowItWorksSection,
  FAQAccordion,
} from "@/components/features";
import { useLocation } from "wouter";
import { useCTATracking } from "@/hooks/use-cta-tracking";
import { 
  Smartphone, 
  Maximize, 
  Type, 
  Hash, 
  MousePointer, 
  Calendar,
  CheckCircle,
  Video,
  Share2
} from "lucide-react";

export default function MultiPlatformFeature() {
  const [_, navigate] = useLocation();
  const { trackNavigateCTA, trackSignupCTA } = useCTATracking();

  const features = [
    {
      icon: Smartphone,
      title: "Platform Auto-Detect",
      description: "AI automatically recognizes your target platform and optimizes content accordingly.",
    },
    {
      icon: Maximize,
      title: "Aspect Ratio Optimizer",
      description: "Perfect formatting for 9:16 vertical, 1:1 square, or 16:9 horizontal—automatically adjusted.",
    },
    {
      icon: Type,
      title: "Caption Customization",
      description: "Platform-specific caption styles, character limits, and formatting best practices.",
    },
    {
      icon: Hash,
      title: "Hashtag Strategies",
      description: "Optimized hashtag count and selection per platform—3-5 for Instagram, more for TikTok.",
    },
    {
      icon: MousePointer,
      title: "CTA Adaptation",
      description: "Calls-to-action adapted for each platform's user behavior and engagement patterns.",
    },
    {
      icon: Calendar,
      title: "Cross-Post Scheduler",
      description: "Schedule and post to multiple platforms simultaneously with optimized timing.",
    },
  ];

  const howItWorksSteps = [
    {
      number: 1,
      title: "Create Base Script",
      description: "Generate your core script with AI—hook, story, and CTA included.",
    },
    {
      number: 2,
      title: "AI Analyzes Platforms",
      description: "Our AI identifies platform-specific requirements and best practices.",
    },
    {
      number: 3,
      title: "Auto-Adapts Content",
      description: "Scripts are automatically optimized for each platform's unique algorithm.",
    },
    {
      number: 4,
      title: "Export All Versions",
      description: "Download platform-specific versions ready to post—no manual editing needed.",
    },
  ];

  const platformComparison = [
    {
      feature: "Ideal Duration",
      tiktok: "15-60 seconds",
      instagram: "15-90 seconds",
      youtube: "15-60 seconds",
    },
    {
      feature: "Hook Timing",
      tiktok: "0-3 seconds",
      instagram: "0-2 seconds",
      youtube: "0-5 seconds",
    },
    {
      feature: "CTA Placement",
      tiktok: "End + Caption",
      instagram: "Mid-video + Caption",
      youtube: "End + Pinned Comment",
    },
    {
      feature: "Hashtag Count",
      tiktok: "3-5 relevant",
      instagram: "8-15 mix",
      youtube: "3-5 in description",
    },
    {
      feature: "Caption Length",
      tiktok: "Short & punchy",
      instagram: "Longer storytelling",
      youtube: "Brief + full description",
    },
  ];

  const supportedPlatforms = [
    {
      name: "TikTok",
      icon: Video,
      specs: {
        duration: "15-60s",
        aspectRatio: "9:16",
        hashtags: "3-5",
        captionStyle: "Short & engaging",
      },
      color: "from-pink-500 to-purple-600",
    },
    {
      name: "Instagram Reels",
      icon: Video,
      specs: {
        duration: "15-90s",
        aspectRatio: "9:16 or 1:1",
        hashtags: "8-15",
        captionStyle: "Story-driven",
      },
      color: "from-purple-500 to-pink-600",
    },
    {
      name: "YouTube Shorts",
      icon: Video,
      specs: {
        duration: "15-60s",
        aspectRatio: "9:16",
        hashtags: "3-5",
        captionStyle: "Title focused",
      },
      color: "from-red-500 to-red-700",
    },
    {
      name: "Facebook Reels",
      icon: Video,
      specs: {
        duration: "15-90s",
        aspectRatio: "9:16 or 1:1",
        hashtags: "2-3",
        captionStyle: "Conversational",
      },
      color: "from-blue-500 to-blue-700",
    },
    {
      name: "LinkedIn Video",
      icon: Video,
      specs: {
        duration: "30-90s",
        aspectRatio: "16:9 or 1:1",
        hashtags: "3-5",
        captionStyle: "Professional",
      },
      color: "from-blue-600 to-blue-800",
    },
  ];

  const faqs = [
    {
      question: "How does multi-platform optimization work?",
      answer: "Our AI analyzes each platform's unique algorithm, audience behavior, and best practices. It then adapts your script's hook, pacing, CTA, hashtags, and caption style to maximize performance on each platform.",
    },
    {
      question: "Can I customize platform-specific versions manually?",
      answer: "Absolutely! While AI auto-optimizes for each platform, you have full control to edit and customize any version. Changes to one platform won't affect others unless you want them to.",
    },
    {
      question: "Do I need separate accounts for each platform?",
      answer: "You'll need accounts on each platform where you want to post, but our tool streamlines the process by generating platform-ready versions with one click—saving hours of manual adaptation.",
    },
    {
      question: "Which platforms are supported?",
      answer: "We support TikTok, Instagram Reels, YouTube Shorts, Facebook Reels, and LinkedIn Video. Each gets platform-specific optimization for maximum performance.",
    },
    {
      question: "Can I post to all platforms at once?",
      answer: "Yes! Use our Cross-Post Scheduler to schedule and publish to multiple platforms simultaneously. You can also set platform-specific posting times for optimal engagement.",
    },
    {
      question: "What's different between platform versions?",
      answer: "Each platform has unique requirements: TikTok favors quick hooks and trending sounds, Instagram values aesthetic captions and hashtag variety, YouTube Shorts prioritizes retention and descriptions. We optimize all these elements automatically.",
    },
    {
      question: "Does multi-platform optimization work for affiliate content?",
      answer: "Yes! Whether you're in Viral Studio or Affiliate Studio, every script can be optimized for multiple platforms. Affiliate links and CTAs are adapted to each platform's policies and best practices.",
    },
  ];

  const handleScrollToTable = () => {
    const element = document.getElementById('platform-comparison');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <Helmet>
        <title>Multi-Platform Optimization - One Script, Every Platform | ScriptTok</title>
        <meta name="description" content="Automatically adapt content for TikTok, Instagram, YouTube, and more. Platform-specific optimization with perfect formatting." />
        <meta property="og:title" content="Multi-Platform Optimization - One Script, Every Platform | ScriptTok" />
        <meta property="og:description" content="Automatically adapt content for TikTok, Instagram, YouTube, and more. Platform-specific optimization with perfect formatting." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://scripttok.com/features/multi-platform" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Multi-Platform Optimization - One Script, Every Platform | ScriptTok" />
        <meta name="twitter:description" content="Automatically adapt content for TikTok, Instagram, YouTube, and more. Platform-specific optimization with perfect formatting." />
      </Helmet>
      
      <div className="min-h-screen">
        <FeatureHero
          title="One Script, Every Platform—Perfectly Optimized"
          subtitle="Stop manually adapting content for each platform. Our AI automatically optimizes your scripts for TikTok, Instagram, YouTube, and more—maximizing reach with zero extra effort."
          primaryCTA={{
            text: "Optimize Your Content",
            onClick: () => {
              trackNavigateCTA("multi_platform_hero", "optimize_content");
              navigate("/dashboard");
            },
          }}
          secondaryCTA={{
            text: "See Platform Differences",
            onClick: () => {
              trackNavigateCTA("multi_platform_hero", "platform_differences");
              handleScrollToTable();
            },
          }}
        />

      <section className="py-16 px-4 bg-white dark:bg-gray-900">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Powerful Multi-Platform Features
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to dominate every platform with optimized content.
            </p>
          </div>
          <FeatureGrid features={features} />
        </div>
      </section>

      <HowItWorksSection 
        title="How Multi-Platform Optimization Works"
        steps={howItWorksSteps}
        className="bg-gray-50 dark:bg-gray-800"
      />

      <section id="platform-comparison" className="py-16 px-4 bg-white dark:bg-gray-900">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Platform Comparison Table
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See how content requirements differ across platforms.
            </p>
          </div>
          
          <Card className="rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-800">
                    <TableHead className="font-bold text-base w-1/4">Feature</TableHead>
                    <TableHead className="font-bold text-base text-center">TikTok</TableHead>
                    <TableHead className="font-bold text-base text-center">Instagram Reels</TableHead>
                    <TableHead className="font-bold text-base text-center">YouTube Shorts</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {platformComparison.map((row, index) => (
                    <TableRow key={index} data-testid={`comparison-row-${index}`}>
                      <TableCell className="font-semibold">{row.feature}</TableCell>
                      <TableCell className="text-center" data-testid={`tiktok-${index}`}>{row.tiktok}</TableCell>
                      <TableCell className="text-center" data-testid={`instagram-${index}`}>{row.instagram}</TableCell>
                      <TableCell className="text-center" data-testid={`youtube-${index}`}>{row.youtube}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      </section>

      <section className="py-16 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Supported Platforms
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Optimized for the top short-form video platforms.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {supportedPlatforms.map((platform, index) => {
              const Icon = platform.icon;
              return (
                <Card
                  key={index}
                  className="rounded-2xl shadow-sm hover:shadow-lg transition-all overflow-hidden"
                  data-testid={`platform-card-${index}`}
                >
                  <div className={`h-2 bg-gradient-to-r ${platform.color}`} />
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-3 rounded-full bg-gradient-to-r ${platform.color}`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-xl font-bold" data-testid={`platform-name-${index}`}>
                        {platform.name}
                      </h3>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Duration</p>
                          <p className="text-sm font-semibold">{platform.specs.duration}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Aspect Ratio</p>
                          <p className="text-sm font-semibold">{platform.specs.aspectRatio}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Hashtags</p>
                          <p className="text-sm font-semibold">{platform.specs.hashtags}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Caption Style</p>
                          <p className="text-sm font-semibold">{platform.specs.captionStyle}</p>
                        </div>
                      </div>
                    </div>
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
            Optimize For All Platforms
          </h2>
          <p className="text-lg md:text-xl text-gray-200 mb-8">
            Create once, optimize everywhere. Maximize your reach across all platforms with AI-powered adaptation.
          </p>
          <Button
            onClick={() => {
              trackSignupCTA("multi_platform_cta");
              navigate("/dashboard");
            }}
            size="lg"
            className="bg-white text-purple-600 hover:bg-gray-100 rounded-xl"
            data-testid="button-multi-platform-cta"
          >
            <Share2 className="mr-2 h-5 w-5" />
            Start Multi-Platform Creation
          </Button>
        </div>
      </section>
      </div>
    </>
  );
}
