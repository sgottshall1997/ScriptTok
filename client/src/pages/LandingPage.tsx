import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  Video,
  Layers,
  Flame,
  Lightbulb,
  BarChart3,
  Target,
  ArrowRight,
  Check,
  Star
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/components/AuthProvider";
import { useCTATracking } from "@/hooks/use-cta-tracking";

export default function LandingPage() {
  const { isAuthenticated, login } = useAuth();
  const { trackSignupCTA, trackNavigateCTA } = useCTATracking();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-hero text-white py-20 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Create Viral & Affiliate TikTok Content in Seconds.
          </h1>
          <p className="text-lg text-gray-200 mb-8 max-w-3xl mx-auto">
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
              <Link href="/dashboard">
                <Button
                  onClick={() => trackSignupCTA('hero')}
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
              onClick={() => trackNavigateCTA('hero', 'watch_demo')}
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

      {/* Key Features Section */}
      <section className="py-16 px-4 bg-white dark:bg-gray-900">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
                    <Layers className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">🧩 Dual Studios: Viral & Affiliate</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Choose between viral content creation or affiliate product promotion
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-red-100 dark:bg-red-900 p-3 rounded-lg">
                    <Flame className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">🔥 Viral Score System</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      AI-powered scoring to predict and optimize viral potential
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-lg">
                    <Lightbulb className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">💡 Real-Time Trend Discovery</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Stay ahead with AI-powered trend analysis and forecasting
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">📈 AI Performance Analytics</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Track performance and optimize your content strategy
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl md:col-span-2">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                    <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">🎯 Multi-Platform Optimization</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Create content optimized for TikTok, Instagram, YouTube, and more
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Visual Demo Section */}
      <section className="py-16 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              See ScriptTok in Action
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              From idea to viral-ready script — all in one place.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="rounded-2xl">
              <CardContent className="p-6">
                <div className="bg-purple-100 dark:bg-purple-900 rounded-lg p-4 mb-4 h-40 flex items-center justify-center">
                  <Layers className="h-16 w-16 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Viral Studio</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Create trending content without products
                </p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl">
              <CardContent className="p-6">
                <div className="bg-purple-100 dark:bg-purple-900 rounded-lg p-4 mb-4 h-40 flex items-center justify-center">
                  <Target className="h-16 w-16 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Affiliate Studio</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Product-focused affiliate content
                </p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl">
              <CardContent className="p-6">
                <div className="bg-green-100 dark:bg-green-900 rounded-lg p-4 mb-4 h-40 flex items-center justify-center">
                  <BarChart3 className="h-16 w-16 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Score Breakdown</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  AI-powered viral potential analysis
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="py-16 px-4 bg-white dark:bg-gray-900">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Choose Your Plan
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="rounded-2xl">
              <CardContent className="p-8">
                <div className="text-4xl mb-4">🆓</div>
                <h3 className="text-2xl font-bold mb-4">Free Plan</h3>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                    <span>5 daily generations</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                    <span>Core templates</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-purple-600 border-2">
              <CardContent className="p-8">
                <div className="text-4xl mb-4">💎</div>
                <h3 className="text-2xl font-bold mb-4">Pro Plan</h3>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                    <span>Unlimited access</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                    <span>Trend engine</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                    <span>Analytics dashboard</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
          <div className="text-center mt-8">
            <Link href="/pricing">
              <Button
                onClick={() => trackNavigateCTA('pricing_teaser', 'compare_plans')}
                size="lg"
                variant="outline"
                className="rounded-xl"
                data-testid="button-compare-plans"
              >
                Compare Plans
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What Creators Say
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-purple-100 dark:bg-purple-900 rounded-full w-12 h-12 flex items-center justify-center mr-3">
                    <Star className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <div className="font-semibold">Creator A</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">@creatorA</div>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  "I got 100k views my first day using ScriptTok!"
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-purple-100 dark:bg-purple-900 rounded-full w-12 h-12 flex items-center justify-center mr-3">
                    <Star className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <div className="font-semibold">Creator B</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">@creatorB</div>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  "My affiliate clicks doubled."
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-green-100 dark:bg-green-900 rounded-full w-12 h-12 flex items-center justify-center mr-3">
                    <Star className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <div className="font-semibold">Creator C</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">@creatorC</div>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  "Best content tool I've used!"
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="bg-gradient-cta text-white py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">
            Ready to Go Viral?
          </h2>
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
              <Link href="/dashboard">
                <Button
                  onClick={() => trackSignupCTA('footer_banner')}
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
              onClick={() => trackNavigateCTA('footer_banner', 'upgrade_pro')}
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
  );
}
