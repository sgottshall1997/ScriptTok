import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Zap, 
  Video,
  ArrowRight,
  Check,
  Star,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/components/AuthProvider";
import { useCTATracking } from "@/hooks/use-cta-tracking";
import { MarketingNav, featuresData, toolsData, useCasesData, learnData, pricingData } from "@/components/MarketingNav";

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
    <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className={`${colorClasses[colorClass as keyof typeof colorClasses] || colorClasses.purple} p-3 rounded-lg flex-shrink-0`}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-gray-600 dark:text-gray-400">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CTABar({ section }: { section: string }) {
  const { isAuthenticated, login } = useAuth();
  const { trackSignupCTA, trackNavigateCTA } = useCTATracking();
  const [_, navigate] = useLocation();

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
      <Button
        onClick={() => {
          trackNavigateCTA(section, 'talk_to_sales');
          navigate('/contact');
        }}
        size="lg"
        variant="outline"
        className="rounded-xl"
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
          className="bg-gradient-hero text-white hover:opacity-90 rounded-xl"
          data-testid={`button-${section}-get-started`}
        >
          Get Started Free
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      ) : (
        <Button
          onClick={() => navigate('/dashboard')}
          size="lg"
          className="bg-gradient-hero text-white hover:opacity-90 rounded-xl"
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
  const learnColors = ["purple", "blue", "green", "red", "yellow", "orange"];

  return (
    <div className="min-h-screen">
      {/* Marketing Navigation */}
      <MarketingNav />

      {/* Hero Section */}
      <section className="bg-gradient-hero text-white py-20 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Create Viral & Affiliate TikTok Content in Seconds.
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-3xl mx-auto">
            AI-powered scripts, trend discovery, and affiliate tools built for creators.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isAuthenticated ? (
              <Button
                onClick={() => {
                  trackSignupCTA('hero');
                  login();
                }}
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-100 rounded-xl"
                data-testid="button-hero-start-free"
              >
                <Zap className="mr-2 h-5 w-5" />
                Start Free
              </Button>
            ) : (
              <Button
                onClick={() => {
                  trackSignupCTA('hero');
                  navigate('/dashboard');
                }}
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-100 rounded-xl"
                data-testid="button-hero-dashboard"
              >
                <Zap className="mr-2 h-5 w-5" />
                Go to Dashboard
              </Button>
            )}
            <Button
              onClick={() => {
                trackNavigateCTA('hero', 'watch_demo');
                navigate('/how-it-works');
              }}
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10 rounded-xl"
              data-testid="button-hero-watch-demo"
            >
              <Video className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white dark:bg-gray-900">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Features</h2>
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
          <CTABar section="features" />
        </div>
      </section>

      {/* Tools Section */}
      <section className="py-16 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Tools</h2>
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
          <CTABar section="tools" />
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-16 px-4 bg-white dark:bg-gray-900">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Use Cases</h2>
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
          <CTABar section="use-cases" />
        </div>
      </section>

      {/* Learn Section */}
      <section className="py-16 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Learn</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Resources, templates, and community to help you succeed.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {learnData.map((item, index) => (
              <GridCard
                key={item.title}
                icon={item.icon}
                title={item.title}
                description={item.description}
                colorClass={learnColors[index % learnColors.length]}
              />
            ))}
          </div>
          <CTABar section="learn" />
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 px-4 bg-white dark:bg-gray-900">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Choose Your Plan
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Start for free, upgrade when you're ready.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                    <Zap className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Free Plan</div>
                    <h3 className="text-2xl font-bold">$0</h3>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Perfect for getting started with AI content creation.
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>5 daily generations</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Core templates</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Basic viral score</span>
                  </li>
                </ul>
                {!isAuthenticated ? (
                  <Button
                    onClick={() => {
                      trackSignupCTA('pricing_free');
                      login();
                    }}
                    className="w-full rounded-xl"
                    variant="outline"
                    data-testid="button-pricing-free"
                  >
                    Get Started Free
                  </Button>
                ) : (
                  <Button
                    onClick={() => navigate('/dashboard')}
                    className="w-full rounded-xl"
                    variant="outline"
                    data-testid="button-pricing-free-dashboard"
                  >
                    Go to Dashboard
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="rounded-2xl border-purple-600 border-2 shadow-lg relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-hero text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
              </div>
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
                    <Star className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Pro Plan</div>
                    <h3 className="text-2xl font-bold">Contact Sales</h3>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  For serious creators and teams who need unlimited power.
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Unlimited generations</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Advanced trend engine</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Full analytics dashboard</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Priority support</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Team collaboration</span>
                  </li>
                </ul>
                <Button
                  onClick={() => {
                    trackNavigateCTA('pricing_pro', 'upgrade');
                    navigate('/contact');
                  }}
                  className="w-full bg-gradient-hero text-white hover:opacity-90 rounded-xl"
                  data-testid="button-pricing-pro"
                >
                  <Star className="mr-2 h-5 w-5" />
                  Upgrade to Pro
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
              className="rounded-xl"
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
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Go Viral?
          </h2>
          <p className="text-lg md:text-xl text-gray-200 mb-8">
            Join thousands of creators using ScriptTok to build their audience and grow their business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isAuthenticated ? (
              <Button
                onClick={() => {
                  trackSignupCTA('footer_banner');
                  login();
                }}
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-100 rounded-xl"
                data-testid="button-footer-start-free"
              >
                <Zap className="mr-2 h-5 w-5" />
                Start Free
              </Button>
            ) : (
              <Button
                onClick={() => {
                  trackSignupCTA('footer_banner');
                  navigate('/dashboard');
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
                trackNavigateCTA('footer_banner', 'talk_sales');
                navigate('/contact');
              }}
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10 rounded-xl"
              data-testid="button-footer-talk-sales"
            >
              <MessageSquare className="mr-2 h-5 w-5" />
              Talk to Sales
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
