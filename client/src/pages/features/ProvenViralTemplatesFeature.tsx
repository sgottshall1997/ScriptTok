import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FeatureHero,
  FAQAccordion,
  HowItWorksSection,
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
  DollarSign,
  Users,
  Rocket,
  CheckCircle2,
  ArrowRight,
  BarChart,
  Trophy,
  Building2,
  BookOpen,
} from "lucide-react";
import { MarketingNav } from '@/components/MarketingNav';
import Footer from "@/components/Footer";

export default function ProvenViralTemplatesFeature() {
  const [_, navigate] = useLocation();
  const { trackNavigateCTA, trackSignupCTA } = useCTATracking();

  const steps = [
    {
      number: 1,
      title: 'Choose Your Template',
      description: 'Browse pre-built templates by niche, platform, or content type. Each template includes hook structure, story flow, and CTA format.',
    },
    {
      number: 2,
      title: 'Customize for Your Brand',
      description: 'AI adapts the template to your product, niche, and brand voice in seconds. Adjust tone, pacing, and CTAs as needed.',
    },
    {
      number: 3,
      title: 'Generate & Refine',
      description: 'Create scripts instantly with the template structure. Get AI suggestions, viral score feedback, and iterate until perfect.',
    },
    {
      number: 4,
      title: 'Save & Reuse',
      description: 'Turn your best scripts into custom templates. Build a library of formats that work for your content style.',
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
      format: "Attention-Grabbing",
      structure: "Pattern Interrupt",
      description: "Template designed to capture attention in the first 3 seconds with strong hooks",
    },
    {
      name: "Product Unboxing Flow",
      niche: "Tech",
      format: "Product-Focused",
      structure: "First Impressions",
      description: "Structured for product reveals with natural CTA placement",
    },
    {
      name: "Before & After Transformation",
      niche: "Beauty",
      format: "Transformation",
      structure: "Visual Reveal",
      description: "Story-driven template with clear problem-solution-result flow",
    },
    {
      name: "Quick Tutorial",
      niche: "DIY",
      format: "Educational",
      structure: "Step-by-Step",
      description: "Instructional template that breaks down processes clearly",
    },
    {
      name: "Problem-Solution",
      niche: "Business",
      format: "Value-Driven",
      structure: "Pain-to-Gain",
      description: "Template that identifies pain points and presents clear solutions",
    },
    {
      name: "5 Tips Quick List",
      niche: "Education",
      format: "List-Based",
      structure: "Listicle",
      description: "Easy-to-follow format that organizes information in digestible chunks",
    },
  ];

  const faqs = [
    {
      question: "How much time will templates save me?",
      answer:
        "Templates provide a pre-built structure so you don't start from scratch. Instead of planning hooks, story flow, and CTAs each time, you start with a complete framework and customize it. This significantly reduces the time spent on script planning and structure.",
    },
    {
      question: "How do templates help with content creation?",
      answer:
        "Templates give you tested content structures for different formats (product showcase, tutorial, before/after, etc.). Each template includes hook patterns, story beats, and CTA placements that you can customize with your specific content. This helps maintain quality and consistency across all your scripts.",
    },
    {
      question: "How do templates maintain brand consistency across my team?",
      answer:
        "Templates include brand voice presets that you can customize with your tone, terminology, and style guidelines. Teams can save and share templates, ensuring everyone uses the same structures and messaging approach for consistent content across all creators.",
    },
    {
      question: "Can I create custom templates from my best-performing content?",
      answer:
        "Yes! The custom template builder lets you turn your successful scripts into reusable templates. You can extract the structure, hooks, and flow from your best content and save it as a template for future use. Build a library of formats that work for your specific audience.",
    },
    {
      question: "What benefits do templates provide?",
      answer:
        "Templates help you create content faster by providing established structures. You get pre-built hooks, story flows, and CTAs that you can customize. This reduces planning time, maintains consistency, and helps you scale content production without sacrificing quality.",
    },
    {
      question: "How do niche-specific templates help my business?",
      answer:
        "Niche templates (beauty, tech, finance, fitness, etc.) are pre-configured with hooks, angles, and CTAs commonly used in that industry. They follow content patterns that resonate with specific audiences, saving you time on researching what works in your niche.",
    },
    {
      question: "What makes these templates different from free ones online?",
      answer:
        "Our templates include AI customization that adapts them to your specific product, brand voice, and platform. You also get brand voice matching, the ability to save custom variations, and integration with our viral score system for feedback on your scripts.",
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
        <title>Viral Templates - Pre-Built Script Structures for Faster Content | Pheme</title>
        <meta name="description" content="Access pre-built templates with tested content structures. Choose from niche-specific formats, customize quickly with AI, and maintain brand consistency across all content." />
        <meta property="og:title" content="Viral Templates - Pre-Built Script Structures for Faster Content | Pheme" />
        <meta property="og:description" content="Access pre-built templates with tested content structures. Choose from niche-specific formats, customize quickly with AI, and maintain brand consistency across all content." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://pheme.com/features/proven-viral-templates" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Viral Templates - Pre-Built Script Structures for Faster Content | Pheme" />
        <meta name="twitter:description" content="Access pre-built templates with tested content structures. Choose from niche-specific formats, customize quickly with AI, and maintain brand consistency across all content." />
      </Helmet>

      <div className="min-h-screen">
        <FeatureHero
          title="Pre-Built Templates for Faster Content Creation"
          subtitle="Stop starting from scratch. Access tested content structures with hooks, story flows, and CTAs. Customize quickly with AI and maintain brand consistency across all your content."
          primaryCTA={{
            text: "Browse Template Library →",
            onClick: () => {
              trackNavigateCTA("template_library_hero", "browse_template_library");
              navigate("/tools/template-library");
            },
          }}
          secondaryCTA={{
            text: "See Template Benefits",
            onClick: () => {
              trackNavigateCTA("template_library_hero", "see_roi");
              const element = document.getElementById("roi-benefits");
              if (element) element.scrollIntoView({ behavior: "smooth" });
            },
          }}
        />

      <section id="roi-benefits" className="py-20 md:py-28 px-4 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Use Templates?</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Templates provide tested content structures that help you create faster and maintain consistency.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Card className="rounded-2xl p-8 border-2 border-violet-200 dark:border-violet-800 bg-white dark:bg-gray-900 shadow-card hover:shadow-card-hover hover-lift transition-all-smooth" data-testid="benefit-time-savings">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900 dark:to-purple-900 p-4 rounded-full">
                  <Clock className="h-8 w-8 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Save Time</h3>
                  <p className="text-4xl font-bold text-violet-600 dark:text-violet-400 mb-2">Faster</p>
                  <p className="text-sm text-muted-foreground">
                    Start with complete structure instead of blank page
                  </p>
                </div>
                <div className="pt-4 border-t w-full">
                  <p className="text-xs text-muted-foreground mb-2">What You Get</p>
                  <p className="text-lg font-semibold">Pre-built hooks, flow, CTAs</p>
                </div>
              </div>
            </Card>

            <Card className="rounded-2xl p-8 border-2 border-violet-200 dark:border-violet-800 bg-white dark:bg-gray-900 shadow-card hover:shadow-card-hover hover-lift transition-all-smooth" data-testid="benefit-consistency">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900 dark:to-purple-900 p-4 rounded-full">
                  <CheckCircle2 className="h-8 w-8 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Brand Consistency</h3>
                  <p className="text-4xl font-bold text-violet-600 dark:text-violet-400 mb-2">Unified</p>
                  <p className="text-sm text-muted-foreground">
                    Maintain consistent voice across all content
                  </p>
                </div>
                <div className="pt-4 border-t w-full">
                  <p className="text-xs text-muted-foreground mb-2">How It Works</p>
                  <p className="text-lg font-semibold">Shared brand voice presets</p>
                </div>
              </div>
            </Card>

            <Card className="rounded-2xl p-8 border-2 border-violet-200 dark:border-violet-800 bg-white dark:bg-gray-900 shadow-card hover:shadow-card-hover hover-lift transition-all-smooth" data-testid="benefit-conversion">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900 dark:to-purple-900 p-4 rounded-full">
                  <Sparkles className="h-8 w-8 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Quality Scripts</h3>
                  <p className="text-4xl font-bold text-violet-600 dark:text-violet-400 mb-2">Effective</p>
                  <p className="text-sm text-muted-foreground">
                    Templates use effective content structures
                  </p>
                </div>
                <div className="pt-4 border-t w-full">
                  <p className="text-xs text-muted-foreground mb-2">What's Included</p>
                  <p className="text-lg font-semibold">Hook patterns & story beats</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border-2 border-violet-200 dark:border-violet-800" data-testid="roi-calculator">
            <h3 className="text-2xl font-bold mb-6 text-center">Template Workflow Comparison</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <BarChart className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                  Without Templates
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Start from blank page each time</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Plan hook, flow, and CTA manually</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Inconsistent structure across content</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Team members use different styles</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Spend time planning each script</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Rocket className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                  With Templates
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-violet-600 dark:text-violet-400">•</span>
                    <span>Start with complete structure</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-600 dark:text-violet-400">•</span>
                    <span>Pre-built hooks, flow, and CTAs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-600 dark:text-violet-400">•</span>
                    <span>Consistent format across all content</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-600 dark:text-violet-400">•</span>
                    <span>Shared templates for team alignment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-600 dark:text-violet-400">•</span>
                    <span>AI auto-fills variables quickly</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8 p-6 bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 rounded-xl text-center">
              <p className="text-sm text-muted-foreground mb-2">Key Benefit</p>
              <p className="text-3xl font-bold text-violet-600 dark:text-violet-400">Save Significant Time</p>
              <p className="text-sm text-muted-foreground mt-2">Create content faster with tested structures</p>
            </div>
          </div>

          <div className="text-center mt-8">
            <Button
              size="lg"
              className="bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:opacity-90 btn-glow hover-lift"
              onClick={() => {
                trackNavigateCTA("roi_benefits", "start_template_library");
                navigate("/tools/template-library");
              }}
              data-testid="button-start-template-library"
            >
              Browse Template Library →
            </Button>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 px-4 bg-white dark:bg-gray-900">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Real-World Use Cases</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See how templates transform workflows for agencies, solopreneurs, and brand teams.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="rounded-2xl p-6 shadow-card hover:shadow-card-hover hover-lift transition-all-smooth" data-testid="use-case-agency">
              <div className="flex flex-col gap-4">
                <div className="bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900 dark:to-purple-900 p-4 rounded-full w-fit">
                  <Building2 className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Social Media Agency</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Managing 20 clients with custom brand templates
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm">Create client-specific templates with unique brand voices</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm">Maintain brand consistency across multiple client accounts</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm">Increase content output with AI template automation</p>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground mb-1">Result</p>
                  <p className="font-semibold text-violet-600 dark:text-violet-400">Scalable, consistent client content</p>
                </div>
              </div>
            </Card>

            <Card className="rounded-2xl p-6 shadow-card hover:shadow-card-hover hover-lift transition-all-smooth" data-testid="use-case-solopreneur">
              <div className="flex flex-col gap-4">
                <div className="bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900 dark:to-purple-900 p-4 rounded-full w-fit">
                  <Users className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Solopreneur Creator</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Scaling content output from 3 to 30 posts per week
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm">Generate multiple ready-to-use scripts quickly each week</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm">Use niche-specific templates (beauty, tech) customized for your audience</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm">Reduce time spent on content creation with templates</p>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground mb-1">Result</p>
                  <p className="font-semibold text-violet-600 dark:text-violet-400">Consistent, high-volume content output</p>
                </div>
              </div>
            </Card>

            <Card className="rounded-2xl p-6 shadow-card hover:shadow-card-hover hover-lift transition-all-smooth" data-testid="use-case-brand">
              <div className="flex flex-col gap-4">
                <div className="bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900 dark:to-purple-900 p-4 rounded-full w-fit">
                  <Trophy className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Growing Brand Team</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Maintaining voice across multiple team members
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm">5 team members create on-brand content with one template library</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm">Brand voice presets ensure consistency across all creators</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm">Import/export templates for team collaboration</p>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground mb-1">Result</p>
                  <p className="font-semibold text-violet-600 dark:text-violet-400">Unified voice, faster content creation</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="text-center mt-10">
            <Button
              size="lg"
              variant="outline"
              className="border-violet-600 text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 hover-lift transition-all-smooth"
              onClick={() => {
                trackNavigateCTA("use_cases", "learn_custom_templates");
                navigate("/tools/template-library");
              }}
              data-testid="button-learn-custom-templates"
            >
              Learn How to Create Custom Templates →
            </Button>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What You Get</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Complete template system with everything you need to scale your content production.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="rounded-2xl p-6 shadow-card hover:shadow-card-hover hover-lift transition-all-smooth" data-testid="deliverable-templates">
              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900 dark:to-purple-900 p-3 rounded-full">
                  <Layout className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold mb-2">50+ Pre-Built Viral Templates</h3>
                  <p className="text-sm text-muted-foreground">
                    Tested templates for various content formats. Product showcases, tutorials, reviews, transformations, and more.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="rounded-2xl p-6 shadow-card hover:shadow-card-hover hover-lift transition-all-smooth" data-testid="deliverable-builder">
              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900 dark:to-purple-900 p-3 rounded-full">
                  <Sparkles className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold mb-2">Custom Template Builder</h3>
                  <p className="text-sm text-muted-foreground">
                    AI-powered builder with smart suggestions. Create templates from your best-performing content in minutes.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="rounded-2xl p-6 shadow-card hover:shadow-card-hover hover-lift transition-all-smooth" data-testid="deliverable-niche">
              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900 dark:to-purple-900 p-3 rounded-full">
                  <Target className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold mb-2">Niche-Specific Templates</h3>
                  <p className="text-sm text-muted-foreground">
                    Specialized templates for beauty, tech, finance, fitness, food, fashion, and 20+ other niches.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="rounded-2xl p-6 shadow-card hover:shadow-card-hover hover-lift transition-all-smooth" data-testid="deliverable-analytics">
              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900 dark:to-purple-900 p-3 rounded-full">
                  <BarChart className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold mb-2">Template Performance Analytics</h3>
                  <p className="text-sm text-muted-foreground">
                    See which templates drive the most views, engagement, and conversions. Data-backed decisions.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="rounded-2xl p-6 shadow-card hover:shadow-card-hover hover-lift transition-all-smooth" data-testid="deliverable-voice">
              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900 dark:to-purple-900 p-3 rounded-full">
                  <Users className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold mb-2">Brand Voice Presets</h3>
                  <p className="text-sm text-muted-foreground">
                    Tone matching presets ensure every template maintains your unique brand personality and voice.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="rounded-2xl p-6 shadow-card hover:shadow-card-hover hover-lift transition-all-smooth" data-testid="deliverable-collaboration">
              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900 dark:to-purple-900 p-3 rounded-full">
                  <Rocket className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold mb-2">Import/Export for Teams</h3>
                  <p className="text-sm text-muted-foreground">
                    Share templates across your team. Export to clients. Build a template library that scales with you.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div className="text-center mt-10">
            <Button
              size="lg"
              className="bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:opacity-90 btn-glow hover-lift"
              onClick={() => {
                trackNavigateCTA("what_you_get", "explore_templates");
                navigate("/tools/template-library");
              }}
              data-testid="button-explore-templates"
            >
              Explore All Template Features →
            </Button>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 px-4 bg-white dark:bg-gray-900">
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
                      className="rounded-2xl p-6 shadow-card hover:shadow-card-hover hover-lift transition-all-smooth cursor-pointer"
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
                      className="rounded-2xl p-6 shadow-card hover:shadow-card-hover hover-lift transition-all-smooth cursor-pointer"
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
                    className="rounded-2xl p-4 shadow-card hover:shadow-card-hover hover-lift transition-all-smooth cursor-pointer"
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
                      className="rounded-2xl p-6 shadow-card hover:shadow-card-hover hover-lift transition-all-smooth cursor-pointer"
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

      <section className="py-20 md:py-28 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">All Templates</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Browse our complete library of script templates.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {allTemplates.map((template, index) => (
              <Card
                key={index}
                className="rounded-2xl p-4 shadow-card hover:shadow-card-hover hover-lift transition-all-smooth"
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

      <section id="top-performers" className="py-20 md:py-28 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Flame className="h-8 w-8 text-orange-500" />
              <h2 className="text-3xl md:text-4xl font-bold">Top Performing Templates</h2>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our highest-converting templates for various content formats.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topPerformers.map((template, index) => (
              <Card
                key={index}
                className="rounded-2xl p-6 shadow-card hover:shadow-card-hover hover-lift transition-all-smooth border-2 border-violet-200 dark:border-violet-800"
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
                    className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:opacity-90 btn-glow hover-lift"
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

      <section className="py-20 md:py-28 px-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
        <div className="container mx-auto max-w-4xl">
          <Card className="rounded-2xl p-8 md:p-12 border-2 border-orange-200 dark:border-orange-800">
            <div className="text-center mb-6">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Want to See Exactly How to Use Templates?
              </h2>
              <p className="text-lg text-muted-foreground">
                Get a complete step-by-step guide showing you how to browse, customize, save, and reuse viral templates for maximum content efficiency.
              </p>
            </div>
            <div className="flex justify-center">
              <Button
                onClick={() => {
                  trackNavigateCTA("template_library_guide", "view_guide");
                  navigate("/tools/template-library");
                }}
                size="lg"
                className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl btn-glow hover-lift"
                data-testid="button-template-guide"
              >
                <BookOpen className="mr-2 h-5 w-5" />
                See Step-by-Step Usage Guide
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </Card>
        </div>
      </section>

      <FAQAccordion faqs={faqs} className="bg-white dark:bg-gray-900" />

      <section className="bg-gradient-to-br from-violet-600 to-purple-700 text-white py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to Streamline Your Content Workflow?
            </h2>
            <p className="text-lg md:text-xl text-violet-100 mb-4 max-w-3xl mx-auto">
              Stop starting from scratch. Use professional templates to create content faster and more consistently.
            </p>
            <p className="text-base text-violet-200 max-w-2xl mx-auto">
              Join creators, agencies, and brands using templates to create content more efficiently.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-xl">
              <p className="text-4xl font-bold mb-2">⚡</p>
              <p className="text-sm text-violet-100">Faster Creation</p>
            </div>
            <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-xl">
              <p className="text-4xl font-bold mb-2">✨</p>
              <p className="text-sm text-violet-100">Consistent Quality</p>
            </div>
            <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-xl">
              <p className="text-4xl font-bold mb-2">🎯</p>
              <p className="text-sm text-violet-100">Proven Structures</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={() => {
                trackNavigateCTA("final_cta", "browse_template_library");
                navigate("/tools/template-library");
              }}
              size="lg"
              className="bg-white text-violet-600 hover:bg-violet-50 rounded-xl text-lg px-8 py-6 h-auto btn-glow hover-lift"
              data-testid="button-browse-template-library-cta"
            >
              <Layout className="mr-2 h-5 w-5" />
              Browse Template Library →
            </Button>
            <Button
              onClick={() => {
                trackNavigateCTA("final_cta", "learn_custom_templates");
                navigate("/tools/template-library");
              }}
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white/20 rounded-xl text-lg px-8 py-6 h-auto hover-lift transition-all-smooth"
              data-testid="button-learn-custom-templates-cta"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Learn How to Create Custom Templates →
            </Button>
          </div>
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
              trackNavigateCTA("proven_viral_templates_cta", "template-library");
              navigate("/tools/template-library");
            }}
            size="lg"
            className="bg-violet-600 hover:bg-violet-700 text-white glow-purple-sm hover-lift"
            data-testid="button-try-template-library"
          >
            Try the Template Library →
          </Button>
        </div>
      </section>

      <Footer />
      </div>
    </>
  );
}