import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Zap, 
  Target, 
  Users, 
  Clock, 
  CheckCircle, 
  BarChart3,
  Video,
  Brain,
  Search,
  ArrowRight,
  Star,
  Shield,
  Sparkles
} from "lucide-react";
import { Link } from "wouter";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* ScriptTok Branding */}
      <div className="text-center py-4 md:py-6 lg:py-8 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
          ScriptTok
        </h1>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-6 md:py-8 lg:py-12 xl:py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-6 md:mb-8">
            <Badge variant="secondary" className="mb-4 md:mb-6 text-xs md:text-sm font-medium bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
              ✨ AI Trend Fetcher and Dual Content Generator
            </Badge>

            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 dark:text-white mb-4 md:mb-6 leading-tight">
              From
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600"> trend </span>
              to
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600"> viral script</span>
              <br />in 60 seconds
            </h1>

            <div className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl md:rounded-2xl p-4 md:p-6 mb-6 md:mb-8 max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="text-center">
                  <h3 className="font-bold text-pink-700 dark:text-pink-300 mb-2 flex items-center justify-center gap-2 text-sm md:text-base">
                    🔥 Viral Content Studio
                  </h3>
                  <p className="text-xs md:text-sm text-gray-700 dark:text-gray-300">
                    Create trend-based viral content without specific products. Perfect for riding trending topics.
                  </p>
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-purple-700 dark:text-purple-300 mb-2 flex items-center justify-center gap-2 text-sm md:text-base">
                    💰 Affiliate Content Studio
                  </h3>
                  <p className="text-xs md:text-sm text-gray-700 dark:text-gray-300">
                    Generate product-focused content with affiliate integration for maximum conversions.
                  </p>
                </div>
              </div>
            </div>

            <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 mb-4 md:mb-6 font-medium">
              Create your free account with Email or Google
            </p>

            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4">
              <Link href="/sign-in" className="w-full sm:w-auto">
                <Button 
                  size="default" 
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold rounded-lg md:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 min-h-[44px]" 
                  data-testid="button-login"
                >
                  Get Started Free <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
                </Button>
              </Link>
              <Button variant="outline" size="default" className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold rounded-lg md:rounded-xl border-2 border-gray-300 hover:border-purple-400 transition-all duration-300 min-h-[44px]" data-testid="button-watch-demo">
                <Video className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                Watch Demo
              </Button>
            </div>

            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-3 md:mt-4">
              No credit card required • Free to start
            </p>
          </div>
        </div>
      </section>

      {/* The AI Behind ScriptTok */}
      <section className="py-8 md:py-10 lg:py-12 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-6 md:mb-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 md:mb-6">
              The AI Behind ScriptTok
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto px-2">
              ScriptTok's dual AI engines power both viral trend analysis and affiliate product research. Whether you're creating viral content or promoting products, our AI adapts to deliver scripts optimized for your specific goals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Search className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Perplexity Discovers Trends</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Real-time trend discovery across platforms</p>
              <div className="hidden md:flex justify-center mt-4">
                <ArrowRight className="h-6 w-6 text-purple-400" />
              </div>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Analyzes Viral Performance</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Studies engagement metrics and viral patterns</p>
              <div className="hidden md:flex justify-center mt-4">
                <ArrowRight className="h-6 w-6 text-purple-400" />
              </div>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-br from-pink-500 to-red-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Studies Top Competitors</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Reverse-engineers successful content strategies</p>
              <div className="hidden md:flex justify-center mt-4">
                <ArrowRight className="h-6 w-6 text-purple-400" />
              </div>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">AI Generates Your Script</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Custom scripts optimized for engagement</p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-8 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-8">
            <p className="text-gray-600 dark:text-gray-400 mb-6">Built with leading AI platforms</p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              <div className="flex items-center gap-2 text-2xl font-bold text-gray-700 dark:text-gray-300">
                <Video className="h-8 w-8" />
                TikTok
              </div>
              <div className="flex items-center gap-2 text-2xl font-bold text-gray-700 dark:text-gray-300">
                <Search className="h-8 w-8" />
                Perplexity
              </div>
              <div className="flex items-center gap-2 text-2xl font-bold text-gray-700 dark:text-gray-300">
                <Brain className="h-8 w-8" />
                OpenAI
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Demo */}
      <section className="py-12 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              How ScriptTok Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Choose your content studio, then follow our simple workflow
            </p>
          </div>

          {/* Studio Selection */}
          <div className="mb-8 max-w-4xl mx-auto">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Step 1: Choose Your Content Studio</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="bg-gradient-to-br from-pink-50 to-red-50 dark:from-pink-900/20 dark:to-red-900/20 border-2 border-pink-200 dark:border-pink-700 shadow-lg">
                <CardContent className="p-8 text-center">
                  <div className="text-6xl mb-4">🔥</div>
                  <h4 className="text-xl font-bold text-pink-700 dark:text-pink-300 mb-4">Viral Content Studio</h4>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Enter trending topics (like "One Piece", "Stanley Cup", "Viral Dance") and get content that rides the wave.
                  </p>
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-pink-200">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Example: "AI Art Controversy"</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-2 border-purple-200 dark:border-purple-700 shadow-lg">
                <CardContent className="p-8 text-center">
                  <div className="text-6xl mb-4">💰</div>
                  <h4 className="text-xl font-bold text-purple-700 dark:text-purple-300 mb-4">Affiliate Content Studio</h4>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Select trending products and get affiliate-optimized content with conversion-focused messaging.
                  </p>
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-purple-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Stanley Tumbler</span>
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">Hot 🔥</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Workflow Steps */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="bg-blue-500 rounded-full w-12 h-12 flex items-center justify-center mb-6">
                  <span className="text-white font-bold text-xl">2</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">AI Research & Analysis</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Our AI researches trending patterns (viral) or product performance data (affiliate) to inform your content.
                </p>
                <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border-2 border-dashed border-blue-200 dark:border-blue-700">
                  <div className="text-center">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">AI analyzing trends...</span>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div className="bg-blue-600 h-2 rounded-full w-[75%]"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="bg-purple-500 rounded-full w-12 h-12 flex items-center justify-center mb-6">
                  <span className="text-white font-bold text-xl">3</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Template Selection</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Choose from viral templates (hooks, challenges) or affiliate templates (reviews, comparisons).
                </p>
                <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border-2 border-dashed border-purple-200 dark:border-purple-700">
                  <div className="space-y-2">
                    <div className="text-xs text-pink-600 font-medium">🔥 Viral Hooks</div>
                    <div className="text-xs text-purple-600 font-medium">💰 Product Review</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="bg-green-500 rounded-full w-12 h-12 flex items-center justify-center mb-6">
                  <span className="text-white font-bold text-xl">4</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Optimized Content</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Get scripts optimized for viral engagement or affiliate conversions, with viral scores and suggestions.
                </p>
                <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border-2 border-dashed border-green-200 dark:border-green-700">
                  <p className="text-sm text-gray-600 dark:text-gray-300 italic">
                    "POV: You discovered this trend before it exploded... 🚀✨"
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Powerful Features for Both Studios
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Whether you're going viral or driving sales, we've got you covered
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <div className="bg-pink-500 rounded-lg p-3 shadow-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Viral Trend Discovery</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Real-time trend analysis for viral content opportunities</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-purple-500 rounded-lg p-3 shadow-lg">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Product Intelligence</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Smart product research for affiliate content optimization</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-green-500 rounded-lg p-3 shadow-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Dual-Mode AI Generation</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Scripts optimized for viral engagement or affiliate conversions</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-red-500 rounded-lg p-3 shadow-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">FTC Disclosure Guidelines Included</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Automatic disclosure handling for affiliate content</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-yellow-500 rounded-lg p-3 shadow-lg">
                <Star className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Engagement Score + AI Optimization</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Get engagement potential scores and optimization suggestions</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-indigo-500 rounded-lg p-3 shadow-lg">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Suggested Posting Times</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">AI-recommended posting times for maximum reach</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-12 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Simple Pricing
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Start free, upgrade when you're ready to scale
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-2 border-gray-200 dark:border-gray-700">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Free</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">$0</span>
                  <span className="text-gray-600 dark:text-gray-300">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-gray-600 dark:text-gray-300">5 scripts per month</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-gray-600 dark:text-gray-300">Basic trend insights</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-gray-600 dark:text-gray-300">Community support</span>
                  </li>
                </ul>
                <Link href="/dashboard">
                  <Button className="w-full" variant="outline" data-testid="button-start-free">
                    Start Free
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-500 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-purple-600 text-white">Most Popular</Badge>
              </div>
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Pro</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">$29</span>
                  <span className="text-gray-600 dark:text-gray-300">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-gray-600 dark:text-gray-300">Unlimited scripts</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-gray-600 dark:text-gray-300">Advanced competitor analysis</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-gray-600 dark:text-gray-300">Priority support</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-gray-600 dark:text-gray-300">Bulk export features</span>
                  </li>
                </ul>
                <Link href="/dashboard">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700" data-testid="button-start-pro">
                    Start Pro
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">How do you find trends?</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  We use Perplexity AI to analyze real-time data across social platforms, e-commerce sites, and viral content databases. Our AI processes millions of data points daily to identify emerging trends before they peak.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Is the content original?</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Yes! While we analyze successful patterns, our AI generates completely original scripts tailored to your voice and brand. We never copy content directly - we study what works and create fresh, unique scripts.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Will this work if I'm not an influencer?</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Absolutely! ScriptTok is designed for creators at any level. Whether you're just starting or have millions of followers, our AI adapts scripts to your experience level and helps you grow your audience authentically.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Do I need to connect my TikTok account?</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  No connection required! ScriptTok works independently. You simply copy the generated scripts and post them on any platform. We provide the content strategy, you maintain full control over your accounts.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-12 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Whether you're chasing trends or driving sales...
          </h2>
          <p className="text-xl text-purple-100 mb-6 max-w-2xl mx-auto">
            Choose your content studio and start creating optimized scripts in seconds. Viral or affiliate - we've got both covered.
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300" data-testid="button-try-scripttok-final">
              <Sparkles className="mr-2 h-5 w-5" />
              Try ScriptTok Free
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}