import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CheckCircle, Zap, Star, Rocket } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/components/AuthProvider";
import { useCTATracking } from "@/hooks/use-cta-tracking";
import { Helmet } from "react-helmet";
import { MarketingNav } from "@/components/MarketingNav";

export default function PricingPage() {
  const { isAuthenticated, login } = useAuth();
  const { trackSignupCTA, trackUpgradeCTA, trackNavigateCTA } = useCTATracking();

  const handleStartFree = (location: string) => {
    trackSignupCTA(location);
    if (!isAuthenticated) {
      login();
    }
  };

  const handleUpgradePro = (location: string) => {
    trackUpgradeCTA(location, 'pro');
    window.location.href = '/account';
  };

  const handleContactSales = () => {
    trackNavigateCTA('creator_card', 'contact_sales');
    window.location.href = '/contact';
  };

  return (
    <>
      <MarketingNav />
      <Helmet>
        <title>Pricing Plans - ScriptTok | Start Free or Upgrade to Pro</title>
        <meta name="description" content="Choose the perfect plan for your content creation needs. Start free with 10 GPT + 5 Claude generations per month, or upgrade to Pro for unlimited access and advanced analytics." />
        <meta property="og:title" content="ScriptTok Pricing - Choose Your Plan" />
        <meta property="og:description" content="Start free or upgrade to Pro. Create viral TikTok content with AI-powered scripts, trend discovery, and affiliate tools." />
      </Helmet>
      <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-hero text-white py-20 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Choose Your Plan — Go Viral Faster.
          </h1>
          <p className="text-lg text-gray-200 mb-8 max-w-3xl mx-auto">
            Start for free. Upgrade when you're ready to scale.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isAuthenticated ? (
              <Button
                onClick={() => handleStartFree('pricing_hero')}
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-100 rounded-xl"
                data-testid="button-hero-start-free"
              >
                <Zap className="mr-2 h-5 w-5" />
                Start Free
              </Button>
            ) : (
              <Link href="/dashboard">
                <Button
                  onClick={() => trackSignupCTA('pricing_hero')}
                  size="lg"
                  className="bg-white text-purple-600 hover:bg-gray-100 rounded-xl"
                  data-testid="button-hero-dashboard"
                >
                  <Zap className="mr-2 h-5 w-5" />
                  Go to Dashboard
                </Button>
              </Link>
            )}
            <Button
              onClick={() => handleUpgradePro('pricing_hero')}
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10 rounded-xl"
              data-testid="button-hero-upgrade-pro"
            >
              <Star className="mr-2 h-5 w-5" />
              Upgrade to Pro
            </Button>
          </div>
        </div>
      </section>

      {/* Pricing Cards Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {/* FREE Plan */}
            <Card className="rounded-2xl border-gray-200 dark:border-gray-700">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🆓</span>
                  <CardTitle className="text-2xl">Free</CardTitle>
                </div>
                <CardDescription className="text-3xl font-bold text-gray-900 dark:text-white">
                  $0<span className="text-base font-normal text-gray-600 dark:text-gray-400">/month</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">10 GPT + 5 Claude generations/month</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">First 3 templates per section</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">First 3 niches unlocked</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Basic Viral Score</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Last 10 content history records</span>
                  </li>
                </ul>
                <Button
                  onClick={() => handleStartFree('free_card')}
                  className="w-full rounded-xl"
                  variant="outline"
                  data-testid="button-free-start"
                >
                  <Zap className="mr-2 h-4 w-4" />
                  Start Free
                </Button>
              </CardContent>
            </Card>

            {/* PRO Plan - Most Popular */}
            <Card className="rounded-2xl border-2 border-purple-600 shadow-lg relative md:scale-105">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white">
                Most Popular
              </Badge>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">💎</span>
                  <CardTitle className="text-2xl">Pro</CardTitle>
                </div>
                <CardDescription className="text-3xl font-bold text-gray-900 dark:text-white">
                  $29<span className="text-base font-normal text-gray-600 dark:text-gray-400">/month</span>
                </CardDescription>
                <p className="text-sm text-gray-600 dark:text-gray-400">or $240/year (save $108)</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">300 GPT + 150 Claude generations/month</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">All templates unlocked</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">All niches unlocked</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Full Viral Score + Analytics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Full content history with export</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Bulk generation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Priority support</span>
                  </li>
                </ul>
                <Button
                  onClick={() => handleUpgradePro('pro_card')}
                  className="w-full rounded-xl bg-purple-600 hover:bg-purple-700"
                  data-testid="button-pro-upgrade"
                >
                  <Star className="mr-2 h-4 w-4" />
                  Upgrade to Pro
                </Button>
              </CardContent>
            </Card>

            {/* CREATOR+ Plan */}
            <Card className="rounded-2xl border-gray-200 dark:border-gray-700">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🚀</span>
                  <CardTitle className="text-2xl">Creator+</CardTitle>
                </div>
                <CardDescription className="text-3xl font-bold text-gray-900 dark:text-white">
                  $59<span className="text-base font-normal text-gray-600 dark:text-gray-400">/month</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Teams (5 seats)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">API access + Make.com integration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Bulk scheduling</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Custom templates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Dedicated account manager</span>
                  </li>
                </ul>
                <Button
                  onClick={handleContactSales}
                  className="w-full rounded-xl"
                  variant="outline"
                  data-testid="button-creator-contact"
                >
                  <Rocket className="mr-2 h-4 w-4" />
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1" data-testid="faq-item-1">
              <AccordionTrigger className="text-left" data-testid="faq-trigger-1">
                How does the free plan work?
              </AccordionTrigger>
              <AccordionContent data-testid="faq-content-1">
                The free plan gives you 10 GPT and 5 Claude generations per month, access to the first 3 templates in each section, and 3 niches. You'll also get basic viral score analysis and can view your last 10 content history records. It's perfect for getting started and testing the platform.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" data-testid="faq-item-2">
              <AccordionTrigger className="text-left" data-testid="faq-trigger-2">
                Can I upgrade or downgrade anytime?
              </AccordionTrigger>
              <AccordionContent data-testid="faq-content-2">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and if you downgrade, you'll be credited for any unused time on your current plan.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" data-testid="faq-item-3">
              <AccordionTrigger className="text-left" data-testid="faq-trigger-3">
                What payment methods do you accept?
              </AccordionTrigger>
              <AccordionContent data-testid="faq-content-3">
                We accept all major credit cards (Visa, MasterCard, American Express, Discover) and debit cards. All payments are processed securely through Stripe.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" data-testid="faq-item-4">
              <AccordionTrigger className="text-left" data-testid="faq-trigger-4">
                Do you offer refunds?
              </AccordionTrigger>
              <AccordionContent data-testid="faq-content-4">
                We offer a 14-day money-back guarantee on all paid plans. If you're not satisfied with ScriptTok, contact our support team within 14 days of your purchase for a full refund.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" data-testid="faq-item-5">
              <AccordionTrigger className="text-left" data-testid="faq-trigger-5">
                What's included in Pro vs Free?
              </AccordionTrigger>
              <AccordionContent data-testid="faq-content-5">
                Pro unlocks unlimited access to all features: 300 GPT + 150 Claude generations per month (vs 10+5 on Free), all templates and niches unlocked (vs first 3), full viral score analytics, complete content history with export, bulk generation, and priority support. Free is great for testing, Pro is for serious creators.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="bg-gradient-cta text-white py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Join Thousands of Viral Creators.
          </h2>
          <p className="text-lg text-gray-200 mb-8">
            Start creating viral content today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isAuthenticated ? (
              <Button
                onClick={() => handleStartFree('pricing_footer')}
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-100 rounded-xl"
                data-testid="button-footer-start-free"
              >
                <Zap className="mr-2 h-5 w-5" />
                Start Free
              </Button>
            ) : (
              <Link href="/dashboard">
                <Button
                  onClick={() => trackSignupCTA('pricing_footer')}
                  size="lg"
                  className="bg-white text-purple-600 hover:bg-gray-100 rounded-xl"
                  data-testid="button-footer-dashboard"
                >
                  <Zap className="mr-2 h-5 w-5" />
                  Go to Dashboard
                </Button>
              </Link>
            )}
            <Button
              onClick={() => handleUpgradePro('pricing_footer')}
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10 rounded-xl"
              data-testid="button-footer-upgrade-pro"
            >
              <Star className="mr-2 h-5 w-5" />
              Upgrade to Pro
            </Button>
          </div>
        </div>
      </section>
    </div>
    </>
  );
}
