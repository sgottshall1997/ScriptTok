import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Zap,
  Video,
  ArrowRight,
  Check,
  Star,
  MessageSquare,
  Rocket,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/components/AuthProvider";
import { useCTATracking } from "@/hooks/use-cta-tracking";
import { MarketingNav, featuresData, toolsData, useCasesData, pricingData } from "@/components/MarketingNav";
import Footer from "@/components/Footer";
import SampleFlowDemonstration from "@/components/SampleFlowDemonstration";
import RotatingValueProps from "@/components/marketing/RotatingValueProps";
import MetricsCounter from "@/components/marketing/MetricsCounter";

interface GridCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  colorClass?: string;
}

function GridCard({ icon: Icon, title, description, colorClass = "purple" }: GridCardProps) {
  const colorClasses = {
    purple: "bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400",
    red: "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400",
    yellow: "bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400",
    green: "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400",
    blue: "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400",
    orange: "bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400",
  };

  return (
    <Card className="rounded-2xl shadow-card hover:shadow-card-hover hover-lift">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className={`${colorClasses[colorClass as keyof typeof colorClasses] || colorClasses.purple} p-3 rounded-lg flex-shrink-0`}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-2xl md:text-3xl font-semibold mb-2">{title}</h3>
            <p className="text-gray-600 dark:text-gray-400">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CTABar({ section, ctaText = "Get Started Free" }: { section: string; ctaText?: string }) {
  const { isAuthenticated, login } = useAuth();
  const { trackSignupCTA, trackNavigateCTA } = useCTATracking();
  const [_, navigate] = useLocation();

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center mt-3">
      <Button
        onClick={() => {
          trackNavigateCTA(section, 'talk_to_sales');
          navigate('/contact');
        }}
        size="lg"
        variant="outline"
        className="rounded-xl hover-lift transition-all-smooth"
        data-testid={`button-${section}-talk-sales`}
      >
        <MessageSquare className="mr-2 h-5 w-5" />
        Talk to Sales
      </Button>
      {!isAuthenticated ? (
        <Button
          onClick={() => {
            trackSignupCTA(section);
            login();
          }}
          size="lg"
          className="bg-gradient-hero text-white hover:opacity-90 rounded-xl btn-glow hover-lift"
          data-testid={`button-${section}-get-started`}
        >
          {ctaText}
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      ) : (
        <Button
          onClick={() => navigate('/dashboard')}
          size="lg"
          className="bg-gradient-hero text-white hover:opacity-90 rounded-xl btn-glow hover-lift"
          data-testid={`button-${section}-dashboard`}
        >
          Go to Dashboard
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      )}
    </div>
  );
}

export default function LandingPage() {
  const { isAuthenticated, login } = useAuth();
  const { trackSignupCTA, trackNavigateCTA } = useCTATracking();
  const [_, navigate] = useLocation();

  // Color rotation for cards
  const featureColors = ["purple", "red", "yellow", "green", "blue", "orange"];
  const toolColors = ["purple", "blue", "green", "red", "yellow", "orange"];
  const useCaseColors = ["purple", "red", "yellow", "green", "blue", "orange", "purple", "red", "yellow"];

  return (
    <div className="min-h-screen">
      {/* Marketing Navigation */}
      <MarketingNav />

      {/* Hero Section */}
      <section className="relative bg-gradient-hero text-white py-6 px-4">
        <div className="absolute inset-0 glow-purple opacity-30 pointer-events-none"></div>
        <div className="container mx-auto max-w-6xl text-center relative z-10">
          <RotatingValueProps />
          <MetricsCounter />
          <p className="text-lg md:text-xl text-gray-200 mb-4 max-w-3xl mx-auto">
            AI-powered scripts, trend discovery, and affiliate tools built for creators.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {!isAuthenticated ? (
              <Button
                onClick={() => {
                  trackSignupCTA('hero');
                  login();
                }}
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-100 hover:scale-105 rounded-xl font-semibold glow-purple-sm btn-glow hover-lift transition-all-smooth"
                data-testid="button-hero-start-free"
              >
                <Zap className="mr-2 h-5 w-5 flex-shrink-0" />
                <span>Save 10 Hours/Week Free</span>
              </Button>
            ) : (
              <Button
                onClick={() => {
                  trackSignupCTA('hero');
                  navigate('/dashboard');
                }}
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-100 hover:scale-105 rounded-xl font-semibold glow-purple-sm btn-glow hover-lift transition-all-smooth"
                data-testid="button-hero-dashboard"
              >
                <Zap className="mr-2 h-5 w-5 flex-shrink-0" />
                <span>Go to Dashboard</span>
              </Button>
            )}
            <Button
              onClick={() => {
                trackNavigateCTA('hero', 'watch_demo');
                navigate('/how-it-works');
              }}
              size="lg"
              variant="outline"
              className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-purple-600 hover:scale-105 rounded-xl font-semibold hover-lift transition-all-smooth"
              data-testid="button-hero-watch-demo"
            >
              <Video className="mr-2 h-5 w-5 flex-shrink-0" />
              <span>Watch Demo</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white dark:bg-gray-900">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-5">
            <h2 className="text-3xl md:text-4xl lg:text-display-sm font-bold mb-2">From Trend to Script in 60 Seconds.</h2>
            <SampleFlowDemonstration />
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Everything you need to create viral content and grow your audience.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {featuresData.map((feature, index) => (
              <GridCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                colorClass={featureColors[index % featureColors.length]}
              />
            ))}
          </div>
          {/* Pheme features */}
          <CTABar section="features" ctaText="Generate Your First Viral Script" />
        </div>
      </section>

      {/* Tools Section */}
      <section className="py-16 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-5">
            <h2 className="text-3xl md:text-4xl lg:text-display-sm font-bold mb-2">Tools</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Powerful AI tools to streamline your content creation workflow.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {toolsData.map((tool, index) => (
              <GridCard
                key={tool.title}
                icon={tool.icon}
                title={tool.title}
                description={tool.description}
                colorClass={toolColors[index % toolColors.length]}
              />
            ))}
          </div>
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold">Other Tools:</span> Batch Builder • Model Router • Hashtag Generator • Caption Writer • Idea to Script
            </p>
          </div>
          <CTABar section="tools" ctaText="Discover Trends Before They Peak" />
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-16 px-4 bg-white dark:bg-gray-900">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-5">
            <h2 className="text-3xl md:text-4xl lg:text-display-sm font-bold mb-2">Use Cases</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Perfect for creators, marketers, and teams of all sizes.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {useCasesData.map((useCase, index) => (
              <GridCard
                key={useCase.title}
                icon={useCase.icon}
                title={useCase.title}
                description={useCase.description}
                colorClass={useCaseColors[index % useCaseColors.length]}
              />
            ))}
          </div>
          <CTABar section="use-cases" ctaText="Start Creating 10 Scripts Free" />
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 px-4 bg-white dark:bg-gray-900">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-5">
            <h2 className="text-3xl md:text-4xl lg:text-display-sm font-bold mb-2">
              Choose Your Plan
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Start for Free - Get 10 Generations on Us
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {/* Starter Plan */}
            <Card className="rounded-2xl shadow-card hover:shadow-card-hover hover-lift relative h-full flex flex-col">
              <CardContent className="p-6 flex-1 flex flex-col">
                <div className="flex flex-col items-center text-center mb-4">
                  <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg mb-3">
                    <Zap className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-1">Starter</h3>
                  <div className="text-3xl font-bold mb-1">$7<span className="text-base font-normal text-gray-600 dark:text-gray-400">/mo</span></div>
                  <div className="text-sm text-gray-500 dark:text-gray-500">or $5/mo annually - Save 29%</div>
                </div>
                <ul className="space-y-2.5 mb-6 flex-1">
                  <li className="flex items-start text-sm">
                    <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>15 GPT-4 + 10 Claude generations/month</span>
                  </li>
                  <li className="flex items-start text-sm">
                    <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>10 trend analyses/month</span>
                  </li>
                  <li className="flex items-start text-sm">
                    <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>3 templates per category</span>
                  </li>
                  <li className="flex items-start text-sm">
                    <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>3 niches (beauty, tech, fashion)</span>
                  </li>
                  <li className="flex items-start text-sm">
                    <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Basic viral score</span>
                  </li>
                </ul>
                {!isAuthenticated ? (
                  <Button
                    onClick={() => {
                      trackSignupCTA('pricing_starter');
                      login();
                    }}
                    className="w-full rounded-xl hover-lift transition-all-smooth"
                    variant="outline"
                    data-testid="button-pricing-starter"
                  >
                    Start Free Trial
                  </Button>
                ) : (
                  <Button
                    onClick={() => navigate('/dashboard')}
                    className="w-full rounded-xl hover-lift transition-all-smooth"
                    variant="outline"
                    data-testid="button-pricing-starter-dashboard"
                  >
                    Go to Dashboard
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Creator Plan */}
            <Card className="rounded-2xl border-purple-500 border-2 shadow-card hover:shadow-card-hover hover-lift relative h-full flex flex-col">
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-600 hover:bg-purple-600">
                Most Popular
              </Badge>
              <CardContent className="p-6 flex-1 flex flex-col">
                <div className="flex flex-col items-center text-center mb-4">
                  <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg mb-3">
                    <Star className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-1">Creator</h3>
                  <div className="text-3xl font-bold mb-1">$15<span className="text-base font-normal text-gray-600 dark:text-gray-400">/mo</span></div>
                  <div className="text-sm text-gray-500 dark:text-gray-500">or $10/mo annually - Save 33%</div>
                </div>
                <ul className="space-y-2.5 mb-6 flex-1">
                  <li className="flex items-start text-sm">
                    <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>50 GPT-4 + 30 Claude generations/month</span>
                  </li>
                  <li className="flex items-start text-sm">
                    <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>25 trend analyses/month</span>
                  </li>
                  <li className="flex items-start text-sm">
                    <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>All templates & niches</span>
                  </li>
                  <li className="flex items-start text-sm">
                    <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Full viral score + suggestions</span>
                  </li>
                  <li className="flex items-start text-sm">
                    <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Content export (CSV)</span>
                  </li>
                  <li className="flex items-start text-sm">
                    <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Basic trend forecasting</span>
                  </li>
                </ul>
                <Button
                  onClick={() => {
                    trackNavigateCTA('pricing_creator', 'get_creator');
                    navigate('/account');
                  }}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl btn-glow hover-lift"
                  data-testid="button-pricing-creator"
                >
                  Get Creator
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="rounded-2xl border-green-500 border-2 shadow-card hover:shadow-card-hover hover-lift relative h-full flex flex-col">
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-600 hover:bg-green-600">
                Best Value
              </Badge>
              <CardContent className="p-6 flex-1 flex flex-col">
                <div className="flex flex-col items-center text-center mb-4">
                  <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg mb-3">
                    <Rocket className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-1">Pro</h3>
                  <div className="text-3xl font-bold mb-1">$35<span className="text-base font-normal text-gray-600 dark:text-gray-400">/mo</span></div>
                  <div className="text-sm text-gray-500 dark:text-gray-500">or $25/mo annually - Save 29%</div>
                </div>
                <ul className="space-y-2.5 mb-6 flex-1">
                  <li className="flex items-start text-sm">
                    <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>300 GPT-4 + 150 Claude generations/month</span>
                  </li>
                  <li className="flex items-start text-sm">
                    <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>100 trend analyses/month</span>
                  </li>
                  <li className="flex items-start text-sm">
                    <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Both Studios (Viral + Affiliate)</span>
                  </li>
                  <li className="flex items-start text-sm">
                    <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Bulk generation (10 items)</span>
                  </li>
                  <li className="flex items-start text-sm">
                    <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Advanced dual-AI viral score</span>
                  </li>
                  <li className="flex items-start text-sm">
                    <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Full trend forecasting</span>
                  </li>
                  <li className="flex items-start text-sm">
                    <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Custom prompts</span>
                  </li>
                  <li className="flex items-start text-sm">
                    <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Make.com webhooks</span>
                  </li>
                </ul>
                <Button
                  onClick={() => {
                    trackNavigateCTA('pricing_pro', 'upgrade_pro');
                    navigate('/account');
                  }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl btn-glow hover-lift"
                  data-testid="button-pricing-pro"
                >
                  Upgrade to Pro
                </Button>
              </CardContent>
            </Card>

            {/* Agency Plan */}
            <Card className="rounded-2xl shadow-card hover:shadow-card-hover hover-lift relative h-full flex flex-col">
              <CardContent className="p-6 flex-1 flex flex-col">
                <div className="flex flex-col items-center text-center mb-4">
                  <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg mb-3">
                    <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Agency</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 italic mb-3">Teams and creators managing multiple brands</p>
                  <div className="text-base font-semibold text-gray-900 dark:text-white mb-2">Custom volume based on your team's needs</div>
                </div>
                <ul className="space-y-2.5 mb-6 flex-1">
                  <li className="flex items-start text-sm">
                    <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Everything in Pro</span>
                  </li>
                  <li className="flex items-start text-sm">
                    <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Multiple team seats</span>
                  </li>
                  <li className="flex items-start text-sm">
                    <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Bulk content generation & export</span>
                  </li>
                  <li className="flex items-start text-sm">
                    <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Custom prompt templates</span>
                  </li>
                  <li className="flex items-start text-sm">
                    <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Early access to experimental AI features</span>
                  </li>
                  <li className="flex items-start text-sm">
                    <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>White-label or co-branded content</span>
                  </li>
                  <li className="flex items-start text-sm">
                    <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Personalized support and setup</span>
                  </li>
                  <li className="flex items-start text-sm">
                    <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Flexible billing & partnership agreements</span>
                  </li>
                </ul>
                <Button
                  onClick={() => {
                    trackNavigateCTA('pricing_agency', 'contact_sales');
                    navigate('/contact');
                  }}
                  className="w-full rounded-xl hover-lift transition-all-smooth"
                  variant="outline"
                  data-testid="button-pricing-agency"
                >
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>
          <div className="text-center mt-8">
            <Button
              onClick={() => {
                trackNavigateCTA('pricing_teaser', 'compare_plans');
                navigate('/pricing');
              }}
              size="lg"
              variant="outline"
              className="rounded-xl hover-lift transition-all-smooth"
              data-testid="button-compare-plans"
            >
              Compare All Plans
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="bg-gradient-cta text-white py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl lg:text-display-sm font-bold mb-6">
            Ready to Go Viral?
          </h2>
          <p className="text-lg md:text-xl text-gray-200 mb-8">
            Creators are using Pheme to grow faster and work smarter.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isAuthenticated ? (
              <Button
                onClick={() => {
                  trackSignupCTA('footer_banner');
                  login();
                }}
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-100 rounded-xl font-semibold glow-purple-sm btn-glow hover-lift"
                data-testid="button-footer-start-free"
              >
                <Zap className="mr-2 h-5 w-5 flex-shrink-0" />
                <span>Start Free</span>
              </Button>
            ) : (
              <Button
                onClick={() => {
                  trackSignupCTA('footer_banner');
                  navigate('/dashboard');
                }}
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-100 rounded-xl font-semibold glow-purple-sm btn-glow hover-lift"
                data-testid="button-footer-dashboard"
              >
                <Zap className="mr-2 h-5 w-5 flex-shrink-0" />
                <span>Go to Dashboard</span>
              </Button>
            )}
            <Button
              onClick={() => {
                trackNavigateCTA('footer_banner', 'talk_sales');
                navigate('/contact');
              }}
              size="lg"
              variant="outline"
              className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-purple-600 rounded-xl font-semibold hover-lift transition-all-smooth"
              data-testid="button-footer-talk-sales"
            >
              <MessageSquare className="mr-2 h-5 w-5 flex-shrink-0" />
              <span>Talk to Sales</span>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}