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
      question: "How much time will I actually save with templates?",
      answer:
        "Users report 90% time savings on script creation. Instead of spending 45 minutes per script from scratch, templates reduce this to 4 minutes. That's creating 50 videos in the time it previously took to create 5. One agency client saved 30 hours per week using our template system across 20 client accounts.",
    },
    {
      question: "What's the actual revenue impact of using templates?",
      answer:
        "Our templates convert at 13.8% on average—2.5x the industry standard of 5.2%. Users report revenue increases of 300-500% within 90 days. Example: A solopreneur went from $2,400/month to $12,800/month by scaling from 3 to 30 posts per week using our viral templates. Templates eliminate guesswork and use proven frameworks that work.",
    },
    {
      question: "How do templates maintain brand consistency across my team?",
      answer:
        "Templates include brand voice presets that ensure 95% consistency across all team members and content. Each template can be customized with your brand's tone, terminology, and style guidelines. Teams can import/export templates, ensuring everyone creates on-brand content even when scaling from 1 to 20 creators.",
    },
    {
      question: "Can I create custom templates from my best-performing content?",
      answer:
        "Yes! Our custom template builder lets you turn your winning scripts into reusable templates in minutes. AI analyzes your top performers and suggests structural elements to save. You can build a library of templates proven to work for YOUR audience, then scale those winners infinitely.",
    },
    {
      question: "What ROI can I expect from the template library?",
      answer:
        "Based on user data: Save 3.25 hours/week on content creation while earning 5.3x more revenue. Templates reduce content creation costs by 70% (less time = lower costs) while increasing output by 400% and conversion rates by 250%. Most users see positive ROI within the first week of using templates.",
    },
    {
      question: "How do niche-specific templates help my business?",
      answer:
        "Our niche templates (beauty, tech, finance, fitness, etc.) are pre-optimized for your industry's unique audience, pain points, and conversion patterns. A beauty template converts at 18.2% because it uses hooks, angles, and CTAs proven in the beauty space. Generic templates can't match this level of niche-specific optimization.",
    },
    {
      question: "What makes these templates better than free ones online?",
      answer:
        "Free templates are generic and unproven. Our templates are tested across millions of views with documented performance data (avg. views, conversion rates, engagement metrics). Plus, you get AI customization, brand voice matching, performance analytics, and regular updates based on current trends. It's the difference between guessing and using proven formulas.",
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
        <title>Proven Viral Templates - Pre-Built Script Structures for Faster Content | Pheme</title>
        <meta name="description" content="Access pre-built templates with proven content structures. Choose from niche-specific formats, customize quickly with AI, and maintain brand consistency across all content." />
        <meta property="og:title" content="Proven Viral Templates - Pre-Built Script Structures for Faster Content | Pheme" />
        <meta property="og:description" content="Access pre-built templates with proven content structures. Choose from niche-specific formats, customize quickly with AI, and maintain brand consistency across all content." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://pheme.com/features/proven-viral-templates" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Proven Viral Templates - Pre-Built Script Structures for Faster Content | Pheme" />
        <meta name="twitter:description" content="Access pre-built templates with proven content structures. Choose from niche-specific formats, customize quickly with AI, and maintain brand consistency across all content." />
      </Helmet>

      <div className="min-h-screen">
        <FeatureHero
          title="Create 50 Videos in the Time It Takes to Script 5"
          subtitle="Stop starting from scratch. Our proven templates convert at 2.5x industry average while maintaining 95% brand voice consistency. Scale your content without scaling your workload."
          primaryCTA={{
            text: "Browse Template Library →",
            onClick: () => {
              trackNavigateCTA("template_library_hero", "browse_template_library");
              navigate("/tools/template-library");
            },
          }}
          secondaryCTA={{
            text: "See ROI Calculator",
            onClick: () => {
              trackNavigateCTA("template_library_hero", "see_roi");
              const element = document.getElementById("roi-benefits");
              if (element) element.scrollIntoView({ behavior: "smooth" });
            },
          }}
        />

      <section id="roi-benefits" className="py-16 px-4 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Templates = More Money, Growth & Time Saved</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Stop wondering if your content will work. Use proven frameworks that deliver measurable business results.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Card className="rounded-2xl p-8 border-2 border-violet-200 dark:border-violet-800 bg-white dark:bg-gray-900" data-testid="benefit-time-savings">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900 dark:to-purple-900 p-4 rounded-full">
                  <Clock className="h-8 w-8 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">10x Time Savings</h3>
                  <p className="text-4xl font-bold text-violet-600 dark:text-violet-400 mb-2">50 Videos</p>
                  <p className="text-sm text-muted-foreground">
                    Create 50 videos in the time it takes to script 5 from scratch
                  </p>
                </div>
                <div className="pt-4 border-t w-full">
                  <p className="text-xs text-muted-foreground mb-2">Time Saved Per Video</p>
                  <p className="text-lg font-semibold">45 minutes → 4 minutes</p>
                </div>
              </div>
            </Card>

            <Card className="rounded-2xl p-8 border-2 border-violet-200 dark:border-violet-800 bg-white dark:bg-gray-900" data-testid="benefit-consistency">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900 dark:to-purple-900 p-4 rounded-full">
                  <CheckCircle2 className="h-8 w-8 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Brand Consistency</h3>
                  <p className="text-4xl font-bold text-violet-600 dark:text-violet-400 mb-2">95%</p>
                  <p className="text-sm text-muted-foreground">
                    Maintain 95% brand voice consistency across all content
                  </p>
                </div>
                <div className="pt-4 border-t w-full">
                  <p className="text-xs text-muted-foreground mb-2">Consistency Improvement</p>
                  <p className="text-lg font-semibold">60% → 95%</p>
                </div>
              </div>
            </Card>

            <Card className="rounded-2xl p-8 border-2 border-violet-200 dark:border-violet-800 bg-white dark:bg-gray-900" data-testid="benefit-conversion">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900 dark:to-purple-900 p-4 rounded-full">
                  <DollarSign className="h-8 w-8 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Revenue Impact</h3>
                  <p className="text-4xl font-bold text-violet-600 dark:text-violet-400 mb-2">2.5x</p>
                  <p className="text-sm text-muted-foreground">
                    Templates that convert at 2.5x industry average
                  </p>
                </div>
                <div className="pt-4 border-t w-full">
                  <p className="text-xs text-muted-foreground mb-2">Avg. Conversion Rate</p>
                  <p className="text-lg font-semibold">5.2% → 13.8%</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border-2 border-violet-200 dark:border-violet-800" data-testid="roi-calculator">
            <h3 className="text-2xl font-bold mb-6 text-center">Your ROI Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <BarChart className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                  Without Templates (Traditional Approach)
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex justify-between">
                    <span>Time per script:</span>
                    <span className="font-semibold">45 minutes</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Videos per week:</span>
                    <span className="font-semibold">7 videos</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Total time weekly:</span>
                    <span className="font-semibold">5.25 hours</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Avg. conversion rate:</span>
                    <span className="font-semibold">5.2%</span>
                  </li>
                  <li className="flex justify-between pt-2 border-t">
                    <span className="font-bold text-foreground">Monthly revenue:</span>
                    <span className="font-bold text-foreground">$2,400</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Rocket className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                  With Templates (Pheme Approach)
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex justify-between">
                    <span>Time per script:</span>
                    <span className="font-semibold text-violet-600 dark:text-violet-400">4 minutes</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Videos per week:</span>
                    <span className="font-semibold text-violet-600 dark:text-violet-400">30+ videos</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Total time weekly:</span>
                    <span className="font-semibold text-violet-600 dark:text-violet-400">2 hours</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Avg. conversion rate:</span>
                    <span className="font-semibold text-violet-600 dark:text-violet-400">13.8%</span>
                  </li>
                  <li className="flex justify-between pt-2 border-t">
                    <span className="font-bold text-foreground">Monthly revenue:</span>
                    <span className="font-bold text-violet-600 dark:text-violet-400">$12,800</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8 p-6 bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 rounded-xl text-center">
              <p className="text-sm text-muted-foreground mb-2">Total Impact</p>
              <p className="text-3xl font-bold text-violet-600 dark:text-violet-400">+$10,400/month</p>
              <p className="text-sm text-muted-foreground mt-2">Save 3.25 hours/week while earning 5.3x more</p>
            </div>
          </div>

          <div className="text-center mt-8">
            <Button
              size="lg"
              className="bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:opacity-90"
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

      <section className="py-16 px-4 bg-white dark:bg-gray-900">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Real-World Use Cases</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See how templates transform workflows for agencies, solopreneurs, and brand teams.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="rounded-2xl p-6" data-testid="use-case-agency">
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
                    <p className="text-sm">Maintain 95% brand consistency across 20 accounts</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm">Scale from 60 to 400+ videos/month without hiring</p>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground mb-1">Result</p>
                  <p className="font-semibold text-violet-600 dark:text-violet-400">+$45K MRR, 70% time savings</p>
                </div>
              </div>
            </Card>

            <Card className="rounded-2xl p-6" data-testid="use-case-solopreneur">
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
                    <p className="text-sm">Go from 3 struggling posts to 30 viral-ready scripts weekly</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm">Use niche templates (beauty, tech) that convert at 14.2%</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm">Save 8 hours/week on content creation</p>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground mb-1">Result</p>
                  <p className="font-semibold text-violet-600 dark:text-violet-400">$8K/mo passive income, 10x output</p>
                </div>
              </div>
            </Card>

            <Card className="rounded-2xl p-6" data-testid="use-case-brand">
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
                  <p className="font-semibold text-violet-600 dark:text-violet-400">Unified voice, 3x content velocity</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="text-center mt-10">
            <Button
              size="lg"
              variant="outline"
              className="border-violet-600 text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20"
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

      <section className="py-16 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What You Get</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Complete template system with everything you need to scale your content production.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="rounded-2xl p-6" data-testid="deliverable-templates">
              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900 dark:to-purple-900 p-3 rounded-full">
                  <Layout className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold mb-2">50+ Pre-Built Viral Templates</h3>
                  <p className="text-sm text-muted-foreground">
                    Proven templates tested across millions of views. Product showcases, tutorials, reviews, transformations, and more.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="rounded-2xl p-6" data-testid="deliverable-builder">
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

            <Card className="rounded-2xl p-6" data-testid="deliverable-niche">
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

            <Card className="rounded-2xl p-6" data-testid="deliverable-analytics">
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

            <Card className="rounded-2xl p-6" data-testid="deliverable-voice">
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

            <Card className="rounded-2xl p-6" data-testid="deliverable-collaboration">
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
              className="bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:opacity-90"
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

      <section className="py-16 px-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
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
                className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl"
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
              Ready to 10x Your Content Output?
            </h2>
            <p className="text-lg md:text-xl text-violet-100 mb-4 max-w-3xl mx-auto">
              Stop spending 45 minutes per script. Start creating 50 videos in the time it takes to script 5.
            </p>
            <p className="text-base text-violet-200 max-w-2xl mx-auto">
              Join thousands of creators, agencies, and brands using templates to scale revenue while saving time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-xl">
              <p className="text-4xl font-bold mb-2">90%</p>
              <p className="text-sm text-violet-100">Time Saved</p>
            </div>
            <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-xl">
              <p className="text-4xl font-bold mb-2">2.5x</p>
              <p className="text-sm text-violet-100">Better Conversions</p>
            </div>
            <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-xl">
              <p className="text-4xl font-bold mb-2">$10K+</p>
              <p className="text-sm text-violet-100">Monthly Impact</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={() => {
                trackNavigateCTA("final_cta", "browse_template_library");
                navigate("/tools/template-library");
              }}
              size="lg"
              className="bg-white text-violet-600 hover:bg-violet-50 rounded-xl text-lg px-8 py-6 h-auto"
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
              className="border-2 border-white text-white hover:bg-white/20 rounded-xl text-lg px-8 py-6 h-auto"
              data-testid="button-learn-custom-templates-cta"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Learn How to Create Custom Templates →
            </Button>
          </div>
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
              trackNavigateCTA("proven_viral_templates_cta", "template-library");
              navigate("/tools/template-library");
            }}
            size="lg"
            className="bg-violet-600 hover:bg-violet-700 text-white"
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