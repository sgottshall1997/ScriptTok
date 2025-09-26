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
      <div className="text-center py-8 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-6xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
          ScriptTok
        </h1>
      </div>
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-6 text-sm font-medium bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
              ✨ AI-Powered TikTok Content Generator
            </Badge>
            
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Turn TikTok trends into
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600"> viral scripts</span>
              <br />in 30 seconds
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Stop guessing what works. Get real-time product trends, competitor insights, and ready-to-post scripts.
            </p>
            
            <div className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl p-6 mb-8 max-w-4xl mx-auto">
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center justify-center gap-2">
                <Brain className="h-6 w-6 text-purple-600" />
                Our AI analyzes viral competitor videos, trending performance data, and real-time market intelligence through Perplexity to generate scripts proven to convert.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300" data-testid="button-try-free-hero">
                  Generate My First Script <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="px-8 py-4 text-lg font-semibold rounded-xl border-2 border-gray-300 hover:border-purple-400 transition-all duration-300" data-testid="button-watch-demo">
                <Video className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* The AI Behind ScriptTok */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              The AI Behind ScriptTok
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              While others guess at trends, ScriptTok's AI studies what's actually working. We analyze viral competitor videos, performance metrics, and real-time trend data to generate scripts with built-in viral DNA.
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
              <p className="text-gray-600 dark:text-gray-300 text-sm">Custom scripts optimized for viral potential</p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <p className="text-gray-600 dark:text-gray-400 mb-8">Powered by industry-leading platforms</p>
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
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              How ScriptTok Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Three simple steps to viral TikTok content
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="bg-blue-500 rounded-full w-12 h-12 flex items-center justify-center mb-6">
                  <span className="text-white font-bold text-xl">1</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Pick a Trending Product</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Browse our real-time trending products like "Glass Skin Serums" or "Viral Hair Tools" with instant popularity scores.
                </p>
                <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border-2 border-dashed border-blue-200 dark:border-blue-700">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900 dark:text-white">Glass Skin Serums</span>
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">Hot 🔥</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="bg-purple-500 rounded-full w-12 h-12 flex items-center justify-center mb-6">
                  <span className="text-white font-bold text-xl">2</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">AI Analyzes Viral Competitors</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Our AI studies top-performing videos, competitor strategies, and engagement patterns to understand what works.
                </p>
                <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border-2 border-dashed border-purple-200 dark:border-purple-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Viral Score</span>
                    <span className="text-lg font-bold text-purple-600">94/100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full w-[94%]"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="bg-green-500 rounded-full w-12 h-12 flex items-center justify-center mb-6">
                  <span className="text-white font-bold text-xl">3</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Get Optimized Scripts</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Receive ready-to-use scripts with platform-specific captions, best posting times, and FTC compliance built-in.
                </p>
                <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border-2 border-dashed border-green-200 dark:border-green-700">
                  <p className="text-sm text-gray-600 dark:text-gray-300 italic">
                    "POV: You found the glass skin secret that Korean influencers don't want you to know... 🤫✨"
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Everything you need to create viral TikTok content
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <div className="bg-blue-500 rounded-lg p-3 shadow-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Real-time Trend Forecasting</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Stay ahead with live trend analysis across all niches</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="bg-purple-500 rounded-lg p-3 shadow-lg">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Competitor Intelligence</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Analyze what's working for top creators in your niche</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="bg-green-500 rounded-lg p-3 shadow-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Auto-Generated Viral Scripts</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">AI creates optimized scripts and captions instantly</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="bg-red-500 rounded-lg p-3 shadow-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">FTC Compliance Built-In</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Automatic disclosure handling for affiliate content</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="bg-yellow-500 rounded-lg p-3 shadow-lg">
                <Star className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Viral Score + AI Optimization</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Get viral potential scores and optimization suggestions</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="bg-indigo-500 rounded-lg p-3 shadow-lg">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Best Time to Post</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">AI-recommended posting times for maximum reach</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-16">
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
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Frequently Asked Questions
            </h2>
          </div>
          
          <div className="space-y-8">
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
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            TikTok moves fast. Don't get left behind.
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Generate your first viral script now and join thousands of creators already using ScriptTok to grow their audience.
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