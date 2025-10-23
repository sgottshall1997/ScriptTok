import React from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from 'wouter';
import { 
  Video, 
  Sparkles, 
  Target, 
  TrendingUp,
  ArrowRight,
  Home,
  FileText,
  MessageSquare,
  HelpCircle,
  Zap
} from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <>
      {/* Navigation Header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" data-testid="link-home">
            <Button variant="ghost" className="flex items-center gap-2 hover:bg-violet-50">
              <Home className="h-4 w-4" />
              <span className="font-medium">Home</span>
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto p-4 md:p-6 max-w-4xl">
        <Helmet>
          <title>About Pheme - AI Content Creation Platform | Our Story & Mission</title>
          <meta name="description" content="Learn about Pheme, the AI-powered content creation platform helping creators build viral content for TikTok, Instagram, and YouTube. Discover our mission, features, and technology." />
          <link rel="canonical" href="https://phemeai.io/about" />
          
          {/* Open Graph / Facebook */}
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://phemeai.io/about" />
          <meta property="og:title" content="About Pheme - AI Content Creation Platform" />
          <meta property="og:description" content="Learn about Pheme, the AI-powered content creation platform helping creators build viral content for social media." />
          <meta property="og:site_name" content="Pheme" />
          
          {/* Twitter */}
          <meta property="twitter:card" content="summary_large_image" />
          <meta property="twitter:url" content="https://phemeai.io/about" />
          <meta property="twitter:title" content="About Pheme - AI Content Creation Platform" />
          <meta property="twitter:description" content="Learn about Pheme, the AI-powered content creation platform helping creators build viral content for social media." />
          
          {/* Additional SEO */}
          <meta name="robots" content="index, follow" />
        </Helmet>
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl flex items-center justify-center mr-4">
              <Video className="h-8 w-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white">About Pheme</h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">AI-Powered Content Creation</p>
            </div>
          </div>
        </div>

        {/* Mission */}
        <Card className="mb-8 border-l-4 border-l-violet-600">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Target className="h-6 w-6 mr-3 text-violet-600" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg mb-4">
              Pheme empowers content creators with AI-driven tools to produce viral short-form content for TikTok, Instagram Reels, and YouTube Shorts. We combine cutting-edge AI technology with real-time trend discovery to help creators stay ahead of the curve.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Our platform eliminates the guesswork in content creation by providing instant viral score analysis, trend-based templates, and AI-powered script generation - so you can focus on creating, not strategizing.
            </p>
          </CardContent>
        </Card>

        {/* What Makes Us Different */}
        <Card className="mb-8 border-l-4 border-l-purple-600">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Sparkles className="h-6 w-6 mr-3 text-purple-600" />
              What Makes Us Different
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Video className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Dual Studio Modes</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Switch between <strong>Viral Content Studio</strong> for trend-based content and <strong>Affiliate Content Studio</strong> for product-focused marketing with affiliate links.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Real-Time Trend Discovery</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Powered by Perplexity AI, we automatically discover trending products and topics across niches, so your content is always timely and relevant.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">AI Viral Score Analysis</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Every generated script is automatically analyzed and rated for viral potential, with actionable suggestions to improve engagement.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technology */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Sparkles className="h-6 w-6 mr-3 text-blue-600" />
              Our Technology
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Pheme integrates multiple AI models to deliver the best results:
            </p>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-violet-600 mt-1">•</span>
                <span><strong>Anthropic Claude</strong> and <strong>OpenAI GPT-4</strong> for intelligent script generation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-600 mt-1">•</span>
                <span><strong>Perplexity AI</strong> for real-time trend discovery and viral video analysis</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-600 mt-1">•</span>
                <span><strong>Custom optimization</strong> for platform-specific content (TikTok, Instagram, YouTube, etc.)</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Learn More */}
        <Card className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950 dark:to-purple-950 border-none shadow-md">
          <CardContent className="p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Want to Learn More?</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Explore our platform features, workflow, and frequently asked questions.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/how-it-works">
                  <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-purple-600 hover:opacity-90">
                    <FileText className="mr-2 h-4 w-4" />
                    How It Works
                  </Button>
                </Link>
                <Link href="/faq">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    FAQ
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Contact Us
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Get Started CTA */}
        <div className="mt-12 text-center">
          <Link href="/">
            <Button size="lg" className="bg-gradient-to-r from-violet-600 to-purple-600 hover:opacity-90">
              Get Started with Pheme
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
};

export default AboutPage;
