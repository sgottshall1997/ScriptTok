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
import { Zap, BookOpen, Target, Volume2, Clock, Share2, TrendingUp, Package, Lightbulb, Users } from "lucide-react";

export default function AIScriptGeneratorFeature() {
  const [_, navigate] = useLocation();
  const { trackNavigateCTA, trackSignupCTA } = useCTATracking();

  const features = [
    {
      icon: Zap,
      title: "Hook Generator",
      description: "AI-powered hooks that stop scrollers in their tracks within the first 3 seconds.",
    },
    {
      icon: BookOpen,
      title: "Story Flow Builder",
      description: "Structured narratives that keep viewers engaged from start to finish.",
    },
    {
      icon: Target,
      title: "CTA Optimizer",
      description: "Conversion-focused calls-to-action tailored to your content goals.",
    },
    {
      icon: Volume2,
      title: "Tone Adjuster",
      description: "Match your brand voice perfectly—from casual to professional, funny to inspirational.",
    },
    {
      icon: Clock,
      title: "Length Controller",
      description: "Generate scripts optimized for 15s, 30s, 60s, or longer formats.",
    },
    {
      icon: Share2,
      title: "Multi-Platform Output",
      description: "Scripts formatted for TikTok, Instagram Reels, YouTube Shorts, and more.",
    },
  ];

  const templates = [
    { name: "Product Unboxing", niche: "Tech", duration: "30s" },
    { name: "Before & After", niche: "Beauty", duration: "15s" },
    { name: "Problem-Solution", niche: "Lifestyle", duration: "60s" },
    { name: "Tutorial Quick Tip", niche: "Education", duration: "45s" },
    { name: "Day in the Life", niche: "Lifestyle", duration: "90s" },
    { name: "Product Review", niche: "Tech", duration: "60s" },
    { name: "Transformation Story", niche: "Fitness", duration: "45s" },
    { name: "How-To Guide", niche: "DIY", duration: "60s" },
    { name: "Behind the Scenes", niche: "Entertainment", duration: "30s" },
    { name: "Myth vs Reality", niche: "Education", duration: "30s" },
  ];

  const faqs = [
    {
      question: "How does the AI Script Generator work?",
      answer:
        "Our AI analyzes trending content, successful formats, and your input to generate scroll-stopping scripts. It considers hooks, story structure, pacing, and CTAs to create scripts optimized for engagement and conversions.",
    },
    {
      question: "Can I customize the generated scripts?",
      answer:
        "Absolutely! All generated scripts are fully editable. You can adjust tone, length, hooks, CTAs, and any other element to perfectly match your brand and style.",
    },
    {
      question: "What video lengths can the generator create?",
      answer:
        "The generator supports scripts from 15 seconds up to 3 minutes, optimized for different platforms including TikTok (15-60s), Instagram Reels (15-90s), and YouTube Shorts (15-60s).",
    },
    {
      question: "Does it work for both viral and affiliate content?",
      answer:
        "Yes! The script generator adapts to both Viral Studio (engagement-focused) and Affiliate Studio (conversion-focused) modes, automatically adjusting hooks, story flow, and CTAs accordingly.",
    },
    {
      question: "Can I generate scripts from trending topics?",
      answer:
        "Yes, you can input trending topics, hashtags, or use our Trend Discovery tool to find what's hot. The AI will create scripts that capitalize on current trends while maintaining your unique voice.",
    },
    {
      question: "How many scripts can I generate per day?",
      answer:
        "Free users get 5 script generations per day. Pro users enjoy unlimited script generation with advanced customization options and priority processing.",
    },
    {
      question: "Can I save and reuse script templates?",
      answer:
        "Yes! Save your best-performing scripts as custom templates. You can also access our library of 20+ proven templates to jumpstart your content creation.",
    },
  ];

  return (
    <div className="min-h-screen">
      <FeatureHero
        title="Generate Scroll-Stopping Scripts in Seconds"
        subtitle="AI-powered script generation that combines trending hooks, engaging storytelling, and conversion-optimized CTAs for maximum impact."
        primaryCTA={{
          text: "Generate Your First Script",
          onClick: () => {
            trackNavigateCTA("ai_script_generator_hero", "generate_script");
            navigate("/dashboard");
          },
        }}
        secondaryCTA={{
          text: "See Examples",
          onClick: () => {
            trackNavigateCTA("ai_script_generator_hero", "see_examples");
            navigate("/content-history");
          },
        }}
      />

      <section className="py-16 px-4 bg-white dark:bg-gray-900">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Powerful AI Script Features
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to create engaging, high-converting video scripts.
            </p>
          </div>
          <FeatureGrid features={features} />
        </div>
      </section>

      <section className="py-16 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Script Generation Process</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Multiple ways to create perfect scripts for any situation.
            </p>
          </div>

          <Tabs defaultValue="trends" className="w-full" data-testid="generation-process-tabs">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto md:h-10">
              <TabsTrigger value="trends" data-testid="tab-from-trends">
                From Trends
              </TabsTrigger>
              <TabsTrigger value="products" data-testid="tab-from-products">
                From Products
              </TabsTrigger>
              <TabsTrigger value="ideas" data-testid="tab-from-ideas">
                From Ideas
              </TabsTrigger>
              <TabsTrigger value="competitors" data-testid="tab-from-competitors">
                From Competitors
              </TabsTrigger>
            </TabsList>

            <TabsContent value="trends" className="mt-8" data-testid="trends-content">
              <Card className="rounded-2xl p-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900 dark:to-purple-900 p-3 rounded-full">
                    <TrendingUp className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Capitalize on Trending Topics</h3>
                    <p className="text-muted-foreground">
                      Browse our real-time trend discovery feed, select a trending topic, and let AI
                      generate scripts that ride the wave of what's hot right now.
                    </p>
                  </div>
                </div>
                <div className="mt-6 space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Step 1</Badge>
                    <span>Browse trending topics in your niche</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Step 2</Badge>
                    <span>Select a trend that matches your brand</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Step 3</Badge>
                    <span>AI generates script with trending hooks and context</span>
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
                    <h3 className="text-2xl font-bold mb-2">Product-Focused Scripts</h3>
                    <p className="text-muted-foreground">
                      Input a product name or URL, and AI creates compelling scripts highlighting
                      features, benefits, and conversion-optimized CTAs.
                    </p>
                  </div>
                </div>
                <div className="mt-6 space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Step 1</Badge>
                    <span>Enter product name or paste product URL</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Step 2</Badge>
                    <span>AI researches product features and benefits</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Step 3</Badge>
                    <span>Generate script with product highlights and CTA</span>
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
                    <h3 className="text-2xl font-bold mb-2">Turn Ideas Into Scripts</h3>
                    <p className="text-muted-foreground">
                      Have a content idea? Describe it in a few words and let AI transform it into
                      a fully structured, engaging video script.
                    </p>
                  </div>
                </div>
                <div className="mt-6 space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Step 1</Badge>
                    <span>Describe your content idea briefly</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Step 2</Badge>
                    <span>Choose tone, length, and target audience</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Step 3</Badge>
                    <span>AI creates complete script with hook and story flow</span>
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
                    <h3 className="text-2xl font-bold mb-2">Learn From Top Performers</h3>
                    <p className="text-muted-foreground">
                      Analyze successful competitor content and generate similar scripts with your
                      unique twist and brand voice.
                    </p>
                  </div>
                </div>
                <div className="mt-6 space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Step 1</Badge>
                    <span>Share a successful competitor video</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Step 2</Badge>
                    <span>AI analyzes what makes it effective</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Step 3</Badge>
                    <span>Generate inspired script with your brand voice</span>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <section className="py-16 px-4 bg-white dark:bg-gray-900">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Popular Script Templates</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start with proven templates and customize to your needs.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {templates.map((template, index) => (
              <Card
                key={index}
                className="rounded-2xl p-4 hover:shadow-md transition-shadow cursor-pointer"
                data-testid={`template-card-${index}`}
              >
                <div className="flex flex-col gap-2">
                  <h4 className="font-semibold text-sm" data-testid={`template-name-${index}`}>
                    {template.name}
                  </h4>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs">
                      {template.niche}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {template.duration}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full mt-2"
                    onClick={() => {
                      trackNavigateCTA("ai_script_generator_templates", `use_template_${template.name}`);
                      navigate("/dashboard");
                    }}
                    data-testid={`button-use-template-${index}`}
                  >
                    Use Template
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <FAQAccordion faqs={faqs} className="bg-gray-50 dark:bg-gray-800" />

      <section className="bg-gradient-cta text-white py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Start Generating Scripts</h2>
          <p className="text-lg md:text-xl text-gray-200 mb-8">
            Create professional, engaging video scripts in seconds. No writing skills required.
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
            Generate Your First Script
          </Button>
        </div>
      </section>
    </div>
  );
}
