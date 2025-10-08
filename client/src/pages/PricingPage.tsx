import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Check, 
  X, 
  Sparkles, 
  Rocket, 
  Crown, 
  Users, 
  Zap,
  TrendingUp,
  ArrowRight,
  AlertCircle
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useCTATracking } from "@/hooks/use-cta-tracking";
import { Helmet } from "react-helmet";
import { MarketingNav } from "@/components/MarketingNav";
import Footer from "@/components/Footer";

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);
  const { isAuthenticated, login } = useAuth();
  const { trackSignupCTA, trackUpgradeCTA, trackNavigateCTA } = useCTATracking();

  const pricingTiers = [
    {
      id: "starter",
      name: "Starter",
      icon: Sparkles,
      emoji: "✨",
      philosophy: "Enough to taste the magic, not enough to live in it",
      priceMonthly: 7,
      priceAnnual: 5,
      savings: 29,
      generationLimits: {
        gpt4: "15/month",
        claude: "10/month",
        trends: "10/month",
        viralScore: "Basic (GPT-4 only)"
      },
      features: [
        { text: "3 templates per category", included: true, detail: "hooks, storytelling, educational" },
        { text: "3 niches", included: true, detail: "beauty, tech, fashion" },
        { text: "Last 10 content items", included: true },
        { text: "Viral Score preview", included: true, detail: "number only, no breakdown" },
        { text: "Bulk generation", included: false },
        { text: "Content export", included: false },
        { text: "Trend forecasting", included: false },
        { text: "Custom prompts", included: false },
        { text: "API access", included: false }
      ],
      cta: "Start Free",
      ctaVariant: "outline" as const,
      popular: false
    },
    {
      id: "creator",
      name: "Creator",
      icon: Rocket,
      emoji: "🚀",
      philosophy: "Perfect for aspiring influencers",
      priceMonthly: 15,
      priceAnnual: 10,
      savings: 33,
      generationLimits: {
        gpt4: "50/month",
        claude: "30/month",
        trends: "25/month",
        viralScore: "Full scoring + basic AI suggestions"
      },
      features: [
        { text: "All viral templates", included: true, detail: "unlimited" },
        { text: "All 7 niches", included: true },
        { text: "Full history", included: true, detail: "last 50 items" },
        { text: "Content export", included: true, detail: "CSV" },
        { text: "Trend forecasting", included: true, detail: "basic - hot/rising only" },
        { text: "Viral score with tips", included: true },
        { text: "Bulk generation", included: false },
        { text: "Custom prompts", included: false },
        { text: "Affiliate studio", included: false },
        { text: "API access", included: false }
      ],
      cta: "Get Creator",
      ctaVariant: "default" as const,
      popular: true,
      highlighted: true
    },
    {
      id: "pro",
      name: "Pro",
      icon: Crown,
      emoji: "👑",
      philosophy: "Power users & agencies need unlimited creation",
      priceMonthly: 35,
      priceAnnual: 25,
      savings: 29,
      generationLimits: {
        gpt4: "300/month",
        claude: "150/month",
        trends: "100/month",
        viralScore: "Advanced (dual AI - Claude + GPT)"
      },
      features: [
        { text: "BOTH Studios", included: true, detail: "Viral + Affiliate" },
        { text: "Bulk generation", included: true, detail: "10 items at once" },
        { text: "Full trend forecasting", included: true, detail: "hot/rising/upcoming/declining" },
        { text: "Custom prompts", included: true, detail: "save & reuse" },
        { text: "Unlimited history", included: true, detail: "with filters" },
        { text: "Priority support", included: true, detail: "24hr response" },
        { text: "Make.com webhook", included: true },
        { text: "Team features", included: false },
        { text: "API access", included: false },
        { text: "Brand templates", included: false }
      ],
      cta: "Upgrade to Pro",
      ctaVariant: "default" as const,
      popular: false,
      emphasized: true
    },
    {
      id: "agency",
      name: "Agency/Team",
      icon: Users,
      emoji: "🏢",
      philosophy: "Agencies managing multiple brands",
      priceMonthly: 69,
      priceAnnual: 50,
      savings: 28,
      generationLimits: {
        gpt4: "1000/month (shared)",
        claude: "500/month (shared)",
        trends: "Unlimited",
        viralScore: "Enterprise (with competitive analysis)"
      },
      features: [
        { text: "Everything in Pro", included: true },
        { text: "5 Team Seats", included: true },
        { text: "Brand Templates", included: true },
        { text: "API Access", included: true, detail: "full REST" },
        { text: "Bulk Scheduling", included: true, detail: "50+ items" },
        { text: "Analytics Dashboard", included: true },
        { text: "Dedicated Account Manager", included: true },
        { text: "Custom integrations", included: true },
        { text: "White-label reports", included: true }
      ],
      cta: "Contact Sales",
      ctaVariant: "outline" as const,
      popular: false
    }
  ];

  const handleCTA = (tierId: string) => {
    switch (tierId) {
      case "starter":
        trackSignupCTA(`pricing_${tierId}_card`);
        if (!isAuthenticated) {
          login();
        }
        break;
      case "creator":
      case "pro":
        trackUpgradeCTA(`pricing_${tierId}_card`, tierId);
        window.location.href = '/account';
        break;
      case "agency":
        trackNavigateCTA(`pricing_${tierId}_card`, 'contact_sales');
        window.location.href = '/contact';
        break;
    }
  };

  return (
    <>
      <MarketingNav />
      <Helmet>
        <title>Pricing Plans - Pheme | Choose Your Perfect Plan</title>
        <meta name="description" content="Start free with Pheme's 4-tier pricing. From Starter ($7/mo) to Agency ($69/mo), find the perfect plan for your viral content creation needs." />
        <meta property="og:title" content="Pheme Pricing - 4 Plans to Fit Every Creator" />
        <meta property="og:description" content="Starter, Creator, Pro, or Agency - choose the plan that scales with your viral content ambitions." />
      </Helmet>
      
      <div className="min-h-screen bg-white dark:bg-gray-900">
        {/* Hero Section */}
        <section className="bg-gradient-hero text-white py-20 px-4">
          <div className="container mx-auto max-w-6xl text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Simple Pricing, Powerful Results
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-3xl mx-auto">
              Choose the plan that fits your content creation goals. Start free, upgrade anytime.
            </p>
            
            {/* Monthly/Annual Toggle */}
            <div className="flex items-center justify-center gap-4 mb-12">
              <span className={`text-lg font-medium ${!isAnnual ? 'text-white' : 'text-gray-300'}`}>
                Monthly
              </span>
              <Switch
                checked={isAnnual}
                onCheckedChange={setIsAnnual}
                className="data-[state=checked]:bg-green-500"
                data-testid="toggle-billing-period"
              />
              <span className={`text-lg font-medium ${isAnnual ? 'text-white' : 'text-gray-300'}`}>
                Annual
              </span>
              {isAnnual && (
                <Badge className="bg-green-500 text-white ml-2" data-testid="badge-annual-savings">
                  Save up to 33%
                </Badge>
              )}
            </div>
          </div>
        </section>

        {/* Pricing Cards Grid */}
        <section className="py-16 px-4 -mt-20">
          <div className="container mx-auto max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {pricingTiers.map((tier) => (
                <Card 
                  key={tier.id}
                  className={`rounded-2xl relative transition-all hover:shadow-xl ${
                    tier.highlighted 
                      ? 'border-2 border-purple-600 shadow-lg md:scale-105 z-10' 
                      : tier.emphasized
                        ? 'border-2 border-green-500'
                        : 'border-gray-200 dark:border-gray-700'
                  }`}
                  data-testid={`pricing-card-${tier.id}`}
                >
                  {tier.popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white z-20">
                      Most Popular
                    </Badge>
                  )}
                  
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-3xl">{tier.emoji}</span>
                      <CardTitle className="text-2xl">{tier.name}</CardTitle>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-gray-900 dark:text-white">
                          ${isAnnual ? tier.priceAnnual : tier.priceMonthly}
                        </span>
                        <span className="text-base text-gray-600 dark:text-gray-400">/month</span>
                      </div>
                      {isAnnual && (
                        <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                          Save {tier.savings}% annually
                        </p>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                      {tier.philosophy}
                    </p>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Generation Limits */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 space-y-2">
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">Generation Limits:</p>
                      <ul className="text-xs space-y-1 text-gray-700 dark:text-gray-300">
                        <li>• GPT-4: {tier.generationLimits.gpt4}</li>
                        <li>• Claude: {tier.generationLimits.claude}</li>
                        <li>• Trends: {tier.generationLimits.trends}</li>
                      </ul>
                    </div>
                    
                    {/* Features */}
                    <ul className="space-y-2">
                      {tier.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          {feature.included ? (
                            <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                          ) : (
                            <X className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                          )}
                          <span className={feature.included ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-500'}>
                            {feature.text}
                            {feature.detail && (
                              <span className="text-xs text-gray-500 dark:text-gray-400 block">
                                {feature.detail}
                              </span>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button
                      onClick={() => handleCTA(tier.id)}
                      className={`w-full rounded-xl ${
                        tier.highlighted 
                          ? 'bg-purple-600 hover:bg-purple-700' 
                          : tier.emphasized
                            ? 'bg-green-600 hover:bg-green-700'
                            : ''
                      }`}
                      variant={tier.ctaVariant}
                      data-testid={`button-${tier.id}-cta`}
                    >
                      {tier.cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Comparison Table */}
        <section className="py-16 px-4 bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Compare All Features</h2>
              <p className="text-gray-600 dark:text-gray-400">
                See exactly what's included in each plan
              </p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-white dark:bg-gray-900 rounded-xl overflow-hidden">
                <thead className="bg-gray-100 dark:bg-gray-800">
                  <tr>
                    <th className="text-left p-4 font-semibold">Feature</th>
                    <th className="p-4 font-semibold">Starter</th>
                    <th className="p-4 font-semibold bg-purple-50 dark:bg-purple-900/20">Creator</th>
                    <th className="p-4 font-semibold">Pro</th>
                    <th className="p-4 font-semibold">Agency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <td colSpan={5} className="p-3 font-semibold text-sm">AI Generations</td>
                  </tr>
                  <tr>
                    <td className="p-4">GPT-4 Generations</td>
                    <td className="p-4 text-center">15/mo</td>
                    <td className="p-4 text-center bg-purple-50 dark:bg-purple-900/20">50/mo</td>
                    <td className="p-4 text-center">300/mo</td>
                    <td className="p-4 text-center">1000/mo</td>
                  </tr>
                  <tr>
                    <td className="p-4">Claude Generations</td>
                    <td className="p-4 text-center">10/mo</td>
                    <td className="p-4 text-center bg-purple-50 dark:bg-purple-900/20">30/mo</td>
                    <td className="p-4 text-center">150/mo</td>
                    <td className="p-4 text-center">500/mo</td>
                  </tr>
                  <tr>
                    <td className="p-4">Trend Fetcher</td>
                    <td className="p-4 text-center">10/mo</td>
                    <td className="p-4 text-center bg-purple-50 dark:bg-purple-900/20">25/mo</td>
                    <td className="p-4 text-center">100/mo</td>
                    <td className="p-4 text-center">Unlimited</td>
                  </tr>
                  
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <td colSpan={5} className="p-3 font-semibold text-sm">Templates & Content</td>
                  </tr>
                  <tr>
                    <td className="p-4">Template Access</td>
                    <td className="p-4 text-center">3 per category</td>
                    <td className="p-4 text-center bg-purple-50 dark:bg-purple-900/20">All templates</td>
                    <td className="p-4 text-center">All templates</td>
                    <td className="p-4 text-center">All + Custom</td>
                  </tr>
                  <tr>
                    <td className="p-4">Niches Available</td>
                    <td className="p-4 text-center">3 niches</td>
                    <td className="p-4 text-center bg-purple-50 dark:bg-purple-900/20">All 7 niches</td>
                    <td className="p-4 text-center">All 7 niches</td>
                    <td className="p-4 text-center">All 7 niches</td>
                  </tr>
                  <tr>
                    <td className="p-4">Studios</td>
                    <td className="p-4 text-center">Viral only</td>
                    <td className="p-4 text-center bg-purple-50 dark:bg-purple-900/20">Viral only</td>
                    <td className="p-4 text-center">Both Studios</td>
                    <td className="p-4 text-center">Both Studios</td>
                  </tr>
                  
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <td colSpan={5} className="p-3 font-semibold text-sm">Analytics & Tools</td>
                  </tr>
                  <tr>
                    <td className="p-4">Viral Score</td>
                    <td className="p-4 text-center">Basic</td>
                    <td className="p-4 text-center bg-purple-50 dark:bg-purple-900/20">Full + Tips</td>
                    <td className="p-4 text-center">Advanced</td>
                    <td className="p-4 text-center">Enterprise</td>
                  </tr>
                  <tr>
                    <td className="p-4">Content History</td>
                    <td className="p-4 text-center">Last 10</td>
                    <td className="p-4 text-center bg-purple-50 dark:bg-purple-900/20">Last 50</td>
                    <td className="p-4 text-center">Unlimited</td>
                    <td className="p-4 text-center">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="p-4">Trend Forecasting</td>
                    <td className="p-4 text-center"><X className="h-4 w-4 text-gray-400 mx-auto" /></td>
                    <td className="p-4 text-center bg-purple-50 dark:bg-purple-900/20">Basic</td>
                    <td className="p-4 text-center">Full</td>
                    <td className="p-4 text-center">Full</td>
                  </tr>
                  <tr>
                    <td className="p-4">Bulk Generation</td>
                    <td className="p-4 text-center"><X className="h-4 w-4 text-gray-400 mx-auto" /></td>
                    <td className="p-4 text-center bg-purple-50 dark:bg-purple-900/20"><X className="h-4 w-4 text-gray-400 mx-auto" /></td>
                    <td className="p-4 text-center">10 items</td>
                    <td className="p-4 text-center">50+ items</td>
                  </tr>
                  
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <td colSpan={5} className="p-3 font-semibold text-sm">Team & Enterprise</td>
                  </tr>
                  <tr>
                    <td className="p-4">Team Seats</td>
                    <td className="p-4 text-center">1</td>
                    <td className="p-4 text-center bg-purple-50 dark:bg-purple-900/20">1</td>
                    <td className="p-4 text-center">1</td>
                    <td className="p-4 text-center">5 seats</td>
                  </tr>
                  <tr>
                    <td className="p-4">API Access</td>
                    <td className="p-4 text-center"><X className="h-4 w-4 text-gray-400 mx-auto" /></td>
                    <td className="p-4 text-center bg-purple-50 dark:bg-purple-900/20"><X className="h-4 w-4 text-gray-400 mx-auto" /></td>
                    <td className="p-4 text-center"><X className="h-4 w-4 text-gray-400 mx-auto" /></td>
                    <td className="p-4 text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-4">Priority Support</td>
                    <td className="p-4 text-center"><X className="h-4 w-4 text-gray-400 mx-auto" /></td>
                    <td className="p-4 text-center bg-purple-50 dark:bg-purple-900/20"><X className="h-4 w-4 text-gray-400 mx-auto" /></td>
                    <td className="p-4 text-center">24hr</td>
                    <td className="p-4 text-center">Dedicated AM</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Upgrade Triggers Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">When to Upgrade</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Know the perfect time to level up your plan
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="rounded-xl border-2 border-purple-200 dark:border-purple-800">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <CardTitle className="text-xl">Starter → Creator</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
                      <span>Running out of monthly generations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
                      <span>Need to export content for clients</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
                      <span>Want trend forecasting insights</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="rounded-xl border-2 border-green-200 dark:border-green-800">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                      <Rocket className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <CardTitle className="text-xl">Creator → Pro</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
                      <span>Manual work is too slow</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
                      <span>Need bulk generation for scale</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
                      <span>Want access to Affiliate Studio</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="rounded-xl border-2 border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                      <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <CardTitle className="text-xl">Pro → Agency</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
                      <span>Managing multiple team members</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
                      <span>Need API for custom workflows</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
                      <span>Require white-label reporting</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4 bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full space-y-4">
              <AccordionItem value="item-1" className="border rounded-lg px-6 bg-white dark:bg-gray-900" data-testid="faq-item-1">
                <AccordionTrigger className="text-left hover:no-underline" data-testid="faq-trigger-1">
                  How does the Starter plan work?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 dark:text-gray-400" data-testid="faq-content-1">
                  The Starter plan gives you 15 GPT-4 and 10 Claude generations per month, access to 3 templates per category (hooks, storytelling, educational), and 3 niches (beauty, tech, fashion). You'll get basic viral score analysis and can view your last 10 content items. It's perfect for testing the platform and creating your first viral scripts.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border rounded-lg px-6 bg-white dark:bg-gray-900" data-testid="faq-item-2">
                <AccordionTrigger className="text-left hover:no-underline" data-testid="faq-trigger-2">
                  What's the difference between monthly and annual pricing?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 dark:text-gray-400" data-testid="faq-content-2">
                  Annual plans save you 28-33% compared to monthly billing. For example, Creator is $15/month billed monthly, or $10/month when billed annually (saving you 33%). You get the same features either way - just bigger savings with annual.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border rounded-lg px-6 bg-white dark:bg-gray-900" data-testid="faq-item-3">
                <AccordionTrigger className="text-left hover:no-underline" data-testid="faq-trigger-3">
                  Can I upgrade or downgrade anytime?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 dark:text-gray-400" data-testid="faq-content-3">
                  Yes! You can upgrade your plan at any time and changes take effect immediately. If you downgrade, the change will apply at your next billing cycle, and you'll continue to have access to your current plan's features until then.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border rounded-lg px-6 bg-white dark:bg-gray-900" data-testid="faq-item-4">
                <AccordionTrigger className="text-left hover:no-underline" data-testid="faq-trigger-4">
                  What payment methods do you accept?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 dark:text-gray-400" data-testid="faq-content-4">
                  We accept all major credit cards (Visa, MasterCard, American Express, Discover) and debit cards. All payments are processed securely through Stripe.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="border rounded-lg px-6 bg-white dark:bg-gray-900" data-testid="faq-item-5">
                <AccordionTrigger className="text-left hover:no-underline" data-testid="faq-trigger-5">
                  Do you offer refunds?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 dark:text-gray-400" data-testid="faq-content-5">
                  We offer a 14-day money-back guarantee on all paid plans. If you're not satisfied with Pheme, contact our support team within 14 days of your purchase for a full refund.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6" className="border rounded-lg px-6 bg-white dark:bg-gray-900" data-testid="faq-item-6">
                <AccordionTrigger className="text-left hover:no-underline" data-testid="faq-trigger-6">
                  What happens when I hit my generation limit?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 dark:text-gray-400" data-testid="faq-content-6">
                  When you reach your monthly generation limit, you can either wait until your next billing cycle for the limit to reset, or upgrade to a higher plan immediately to get more generations. Upgrading is instant and you'll get the new limits right away.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-7" className="border rounded-lg px-6 bg-white dark:bg-gray-900" data-testid="faq-item-7">
                <AccordionTrigger className="text-left hover:no-underline" data-testid="faq-trigger-7">
                  What's included in the Agency/Team plan?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 dark:text-gray-400" data-testid="faq-content-7">
                  The Agency plan includes everything in Pro, plus 5 team seats, brand templates, full REST API access, bulk scheduling (50+ items), analytics dashboard, dedicated account manager, custom integrations, and white-label reports. It's designed for agencies managing multiple brands and clients.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* Final CTA Banner */}
        <section className="bg-gradient-cta text-white py-20 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Ready to Create Viral Content?
            </h2>
            <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
              Join thousands of creators using Pheme to generate scroll-stopping scripts
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!isAuthenticated ? (
                <Button
                  onClick={() => {
                    trackSignupCTA('pricing_footer');
                    login();
                  }}
                  size="lg"
                  className="bg-white text-purple-600 hover:bg-gray-100 rounded-xl"
                  data-testid="button-footer-start-free"
                >
                  <Zap className="mr-2 h-5 w-5" />
                  Start Free Today
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    trackSignupCTA('pricing_footer');
                    window.location.href = '/dashboard';
                  }}
                  size="lg"
                  className="bg-white text-purple-600 hover:bg-gray-100 rounded-xl"
                  data-testid="button-footer-dashboard"
                >
                  <Zap className="mr-2 h-5 w-5" />
                  Go to Dashboard
                </Button>
              )}
              <Button
                onClick={() => {
                  trackNavigateCTA('pricing_footer', 'view_plans');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10 rounded-xl"
                data-testid="button-footer-view-plans"
              >
                View All Plans
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
