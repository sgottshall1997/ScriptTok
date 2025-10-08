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


  const faqs = [
    {
      question: "How much time will templates save me?",
      answer:
        "Templates provide a pre-built structure so you don't start from scratch. Instead of planning hooks, story flow, and CTAs each time, you start with a complete framework and customize it. This significantly reduces the time spent on script planning and structure.",
    },
    {
      question: "How do templates help with content creation?",
      answer:
        "Templates give you tested content structures organized into two modes: Viral (7 templates for content-first approach) and Affiliate (13 templates for product-focused content). Each template includes hook patterns, story beats, and CTA placements that you can customize with your specific content. This helps maintain quality and consistency across all your scripts.",
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

      <section className="py-20 md:py-28 px-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How Templates Work</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Understanding template structure, modes, and customization process
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <Card className="rounded-2xl p-8 border-2 border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-900" data-testid="template-mode-viral">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 p-3 rounded-full">
                  <Flame className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Viral Mode (7 Templates)</h3>
                  <p className="text-sm text-muted-foreground">No product required • Content-first approach</p>
                </div>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400">•</span>
                  <span className="text-sm">Viral Hooks - Scroll-stopping opening lines</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400">•</span>
                  <span className="text-sm">Short Scripts - 15-30s structured content</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400">•</span>
                  <span className="text-sm">Storytime - Narrative-driven content</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400">•</span>
                  <span className="text-sm">Duet/Reaction - Response content formats</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400">•</span>
                  <span className="text-sm">Listicle - Top tips format</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400">•</span>
                  <span className="text-sm">Challenge - Participation content</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400">•</span>
                  <span className="text-sm">Caption + Hashtags - Social optimization</span>
                </li>
              </ul>
            </Card>

            <Card className="rounded-2xl p-8 border-2 border-violet-200 dark:border-violet-800 bg-white dark:bg-gray-900" data-testid="template-mode-affiliate">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900 dark:to-purple-900 p-3 rounded-full">
                  <ShoppingBag className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Affiliate Mode (13 Templates)</h3>
                  <p className="text-sm text-muted-foreground">Product-focused • Conversion-optimized</p>
                </div>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-violet-600 dark:text-violet-400">•</span>
                  <span className="text-sm">Affiliate Email - Persuasive email content</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-violet-600 dark:text-violet-400">•</span>
                  <span className="text-sm">Influencer Caption - Authentic recommendations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-violet-600 dark:text-violet-400">•</span>
                  <span className="text-sm">Product Comparison - Decision guides</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-violet-600 dark:text-violet-400">•</span>
                  <span className="text-sm">Routine Guide - Step-by-step integration</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-violet-600 dark:text-violet-400">•</span>
                  <span className="text-sm">SEO Blog - Search-optimized posts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-violet-600 dark:text-violet-400">•</span>
                  <span className="text-sm">Niche-Specific - Fashion, Fitness, Food, Tech, Travel, Pet</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-violet-600 dark:text-violet-400">•</span>
                  <span className="text-sm">Short Video Scripts - TikTok, Reels, Shorts</span>
                </li>
              </ul>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="rounded-2xl p-6 bg-white dark:bg-gray-900">
              <div className="text-center">
                <div className="bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 p-4 rounded-full w-fit mx-auto mb-4">
                  <Layout className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h4 className="font-bold mb-2">Template Structure</h4>
                <p className="text-sm text-muted-foreground">
                  Hook + Story Flow + CTA with variable placeholders for customization
                </p>
              </div>
            </Card>

            <Card className="rounded-2xl p-6 bg-white dark:bg-gray-900">
              <div className="text-center">
                <div className="bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900 p-4 rounded-full w-fit mx-auto mb-4">
                  <Zap className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h4 className="font-bold mb-2">AI Adaptation</h4>
                <p className="text-sm text-muted-foreground">
                  AI auto-fills variables with your product, niche, and brand voice settings
                </p>
              </div>
            </Card>

            <Card className="rounded-2xl p-6 bg-white dark:bg-gray-900">
              <div className="text-center">
                <div className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 p-4 rounded-full w-fit mx-auto mb-4">
                  <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h4 className="font-bold mb-2">Save & Reuse</h4>
                <p className="text-sm text-muted-foreground">
                  Save customized templates to your library for future content creation
                </p>
              </div>
            </Card>
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
                  <h3 className="font-bold mb-2">20 Pre-Built Templates (Viral + Affiliate)</h3>
                  <p className="text-sm text-muted-foreground">
                    7 viral templates for content-first approach + 13 affiliate templates for product-focused content. Tested structures with hooks, flows, and CTAs.
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

      <HowItWorksSection
        title="How to Use Templates"
        steps={steps}
        className="bg-white dark:bg-gray-900"
      />

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
              <p className="text-sm text-violet-100">Tested Structures</p>
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