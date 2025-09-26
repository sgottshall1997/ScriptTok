import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link } from 'wouter';
import { 
  Video, 
  Sparkles, 
  Target, 
  Zap, 
  BarChart3, 
  TrendingUp, 
  Play,
  History,
  Star,
  Grid3X3,
  ArrowRight,
  Home,
  FileText,
  MessageSquare,
  HelpCircle,
  Shield,
  Users,
  BookOpen
} from 'lucide-react';

const AboutPage: React.FC = () => {
  // Supported niches
  const supportedNiches = [
    'Beauty & Skincare',
    'Fitness & Health', 
    'Technology & Gadgets',
    'Fashion & Style',
    'Food & Recipes',
    'Travel & Lifestyle',
    'Pets & Animals'
  ];

  // Key features
  const keyFeatures = [
    {
      icon: Video,
      title: 'TikTok-Optimized Content',
      description: 'Generate viral-ready scripts and captions specifically designed for TikTok\'s algorithm and audience'
    },
    {
      icon: BarChart3,
      title: 'AI Viral Score Analysis',
      description: 'Get instant feedback on your content\'s viral potential with AI-powered scoring and improvement suggestions'
    },
    {
      icon: Sparkles,
      title: 'Multiple AI Models',
      description: 'Choose from OpenAI GPT-4 and Anthropic Claude for diverse content styles and perspectives'
    },
    {
      icon: TrendingUp,
      title: 'Trending Product Integration',
      description: 'Automatically discover trending products to create timely, relevant content that drives engagement'
    },
    {
      icon: Grid3X3,
      title: 'Content Templates',
      description: 'Access proven templates for product demos, reviews, comparisons, and viral format scripts'
    },
    {
      icon: History,
      title: 'Content History & Ratings',
      description: 'Track all your generated content, rate performance, and identify your best-performing styles'
    }
  ];

  // Navigation sections for actual app pages
  const appSections = [
    {
      icon: Home,
      title: 'Dashboard',
      description: 'Overview of your content generation activity and system stats',
      path: '/',
      category: 'Core'
    },
    {
      icon: Video,
      title: 'TikTok Generator',
      description: 'Generate viral TikTok content with AI-powered scripts and captions',
      path: '/generate-content',
      category: 'Generation'
    },
    {
      icon: History,
      title: 'Content History',
      description: 'View, rate, and manage all your previously generated content',
      path: '/content-history',
      category: 'Management'
    },
    {
      icon: FileText,
      title: 'How It Works',
      description: 'Learn the complete ScriptTok workflow and best practices',
      path: '/how-it-works',
      category: 'Help'
    },
    {
      icon: HelpCircle,
      title: 'FAQ',
      description: 'Frequently asked questions about ScriptTok features',
      path: '/faq',
      category: 'Help'
    },
    {
      icon: MessageSquare,
      title: 'Contact',
      description: 'Get support and provide feedback to improve ScriptTok',
      path: '/contact',
      category: 'Support'
    }
  ];

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      {/* Header Section */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl flex items-center justify-center mr-4">
            <Video className="h-8 w-8 text-white" />
          </div>
          <div className="text-left">
            <h1 className="text-4xl font-bold text-gray-900">ScriptTok</h1>
            <p className="text-lg text-gray-600">TikTok Viral Content Generator</p>
          </div>
        </div>
        <p className="text-gray-700 max-w-3xl mx-auto text-lg leading-relaxed">
          Transform your TikTok content creation with AI-powered viral script generation. ScriptTok helps creators, 
          marketers, and businesses generate high-performing TikTok content that drives engagement and grows your audience.
        </p>
      </div>

      {/* System Overview */}
      <Card className="mb-12 border-l-4 border-l-pink-600">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <Target className="h-6 w-6 mr-3 text-pink-600" />
            What ScriptTok Does
          </CardTitle>
          <CardDescription>
            AI-powered TikTok content generation platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-6 rounded-lg mb-8">
            <p className="text-lg text-gray-800 leading-relaxed">
              ScriptTok is specifically designed for TikTok content creation and viral content generation. 
              Our platform combines AI technology with proven viral content patterns to help you create 
              engaging TikTok scripts that capture attention and drive results.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {keyFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center p-4 bg-white border rounded-lg shadow-sm">
                  <Icon className="h-12 w-12 text-pink-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Perplexity AI Integration */}
      <Card className="mb-12 border-l-4 border-l-purple-600">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <Sparkles className="h-6 w-6 mr-3 text-purple-600" />
            Powered by Perplexity AI: Four Core Capabilities
          </CardTitle>
          <CardDescription>
            Advanced AI research and trend analysis across every feature
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg mb-8">
            <p className="text-lg text-gray-800 leading-relaxed mb-4">
              ScriptTok leverages Perplexity AI's powerful research capabilities across four key areas to give you unprecedented 
              insight into viral content opportunities. This isn't just trend tracking - it's intelligent content strategy powered by real-time web analysis.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-white border-2 border-purple-200 rounded-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mr-4">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-purple-900">1. Trend Forecasting</h3>
              </div>
              <p className="text-gray-700 mb-4">
                Our Trend Forecaster uses Perplexity AI to analyze real-time web data, social media patterns, 
                and emerging conversations to predict what will go viral before it happens.
              </p>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-2">How it works:</h4>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• Scans millions of web sources for emerging topics</li>
                  <li>• Categorizes trends as Hot, Rising, Upcoming, or Declining</li>
                  <li>• Provides specific product recommendations with pricing</li>
                  <li>• Explains why each trend will succeed and when to act</li>
                </ul>
              </div>
            </div>

            <div className="p-6 bg-white border-2 border-pink-200 rounded-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-pink-600 rounded-lg flex items-center justify-center mr-4">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-pink-900">2. AI-Powered Trending Picks</h3>
              </div>
              <p className="text-gray-700 mb-4">
                Automatically discover viral products across all niches using Perplexity's web research to find 
                what's actually trending right now, not what was trending last week.
              </p>
              <div className="bg-pink-50 p-4 rounded-lg">
                <h4 className="font-semibold text-pink-800 mb-2">How it works:</h4>
                <ul className="text-sm text-pink-700 space-y-1">
                  <li>• Real-time product discovery across social media and commerce</li>
                  <li>• Intelligent filtering by niche and viral potential</li>
                  <li>• Instant access to trending product data for content creation</li>
                  <li>• Automatic refresh with credit-conscious scheduling</li>
                </ul>
              </div>
            </div>

            <div className="p-6 bg-white border-2 border-blue-200 rounded-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
                  <Video className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-blue-900">3. TikTok Trend Analysis</h3>
              </div>
              <p className="text-gray-700 mb-4">
                Deep analysis of TikTok's current viral patterns, hashtag performance, and content formats 
                to ensure your content aligns with platform-specific trends.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">How it works:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Analyzes viral TikTok content patterns and formats</li>
                  <li>• Identifies trending hashtags and sound combinations</li>
                  <li>• Recommends optimal posting times and content styles</li>
                  <li>• Tracks algorithm preferences and engagement patterns</li>
                </ul>
              </div>
            </div>

            <div className="p-6 bg-white border-2 border-green-200 rounded-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mr-4">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-green-900">4. Viral Competitor Analysis</h3>
              </div>
              <p className="text-gray-700 mb-4">
                Research successful competitor videos and viral content strategies to understand 
                what makes content go viral in your specific niche.
              </p>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">How it works:</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Identifies top-performing videos in your niche</li>
                  <li>• Analyzes viral content structure and timing</li>
                  <li>• Extracts successful content patterns and formulas</li>
                  <li>• Provides actionable insights for your content strategy</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg border border-purple-200">
            <h3 className="text-xl font-semibold text-purple-900 mb-4">Why Perplexity AI Makes the Difference</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-purple-800 mb-2">Real-Time Web Research</h4>
                <p className="text-sm text-purple-700">
                  Unlike static databases, Perplexity accesses live web data to give you the most current trends 
                  and opportunities as they emerge.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-purple-800 mb-2">Multi-Source Analysis</h4>
                <p className="text-sm text-purple-700">
                  Combines data from social media, e-commerce, news, and content platforms for comprehensive 
                  trend intelligence.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-purple-800 mb-2">Predictive Insights</h4>
                <p className="text-sm text-purple-700">
                  Not just what's trending now, but what will trend next - giving you the competitive edge 
                  to create content before topics explode.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-purple-800 mb-2">Niche-Specific Intelligence</h4>
                <p className="text-sm text-purple-700">
                  Tailored analysis for each niche ensures trends and products align with your specific 
                  audience and content style.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How ScriptTok Works */}
      <Card className="mb-12 border-l-4 border-l-blue-600">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <Play className="h-6 w-6 mr-3 text-blue-600" />
            How ScriptTok Works
          </CardTitle>
          <CardDescription>
            Simple 4-step workflow to viral TikTok content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="text-center p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Choose Your Niche</h3>
              <p className="text-sm text-gray-600">Select from beauty, fitness, tech, fashion, food, travel, or pets</p>
            </div>
            
            <div className="text-center p-6 bg-purple-50 rounded-lg border-2 border-purple-200">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Select Templates</h3>
              <p className="text-sm text-gray-600">Pick from viral content templates optimized for TikTok</p>
            </div>
            
            <div className="text-center p-6 bg-green-50 rounded-lg border-2 border-green-200">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Generate Content</h3>
              <p className="text-sm text-gray-600">AI creates viral-ready scripts and captions instantly</p>
            </div>
            
            <div className="text-center p-6 bg-orange-50 rounded-lg border-2 border-orange-200">
              <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg">4</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Review & Save</h3>
              <p className="text-sm text-gray-600">Get viral scores, save to history, and improve with AI feedback</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Supported Niches */}
      <Card className="mb-12 border-l-4 border-l-green-600">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <Grid3X3 className="h-6 w-6 mr-3 text-green-600" />
            Supported Content Niches
          </CardTitle>
          <CardDescription>
            Specialized templates and optimization for every niche
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {supportedNiches.map((niche, index) => (
              <div key={index} className="flex items-center p-3 bg-green-50 rounded-lg border border-green-200">
                <Star className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-900">{niche}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Why niches matter:</strong> Each niche has unique audience preferences, trending formats, 
              and viral patterns. Our AI is trained on successful content from each category to ensure 
              your scripts resonate with the right audience.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Navigation Grid */}
      <Card className="mb-12">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <Grid3X3 className="h-6 w-6 mr-3 text-purple-600" />
            ScriptTok Features
          </CardTitle>
          <CardDescription>
            Navigate to any ScriptTok feature or page
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {appSections.map((section) => {
              const Icon = section.icon;
              return (
                <Link key={section.path} href={section.path}>
                  <Card className="h-full hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-purple-200 hover:border-l-purple-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <Icon className="h-5 w-5 text-purple-600 flex-shrink-0" />
                        <Badge variant="outline" className="text-xs">
                          {section.category}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">{section.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {section.description}
                      </p>
                      <div className="flex items-center text-xs text-purple-600">
                        <span>Open</span>
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Getting Started */}
      <Card className="mb-12 bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <Zap className="h-6 w-6 mr-3 text-pink-600" />
            Getting Started with ScriptTok
          </CardTitle>
          <CardDescription>
            New to ScriptTok? Follow this quick start guide
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-pink-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Visit Dashboard</h3>
              <p className="text-sm text-gray-600 mb-4">
                Start with the dashboard to see your content activity and platform stats
              </p>
              <Link href="/">
                <Button size="sm" variant="outline">
                  Go to Dashboard
                </Button>
              </Link>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Generate Content</h3>
              <p className="text-sm text-gray-600 mb-4">
                Create your first viral TikTok script with our AI-powered generator
              </p>
              <Link href="/generate-content">
                <Button size="sm" variant="outline">
                  Start Creating
                </Button>
              </Link>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Track Performance</h3>
              <p className="text-sm text-gray-600 mb-4">
                Review your content history and improve with AI-powered suggestions
              </p>
              <Link href="/content-history">
                <Button size="sm" variant="outline">
                  View History
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Support & Resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <HelpCircle className="h-5 w-5 mr-2 text-blue-600" />
              Help & Resources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/how-it-works">
              <Button variant="outline" className="w-full justify-start">
                <BookOpen className="h-4 w-4 mr-2" />
                How It Works Guide
              </Button>
            </Link>
            <Link href="/faq">
              <Button variant="outline" className="w-full justify-start">
                <HelpCircle className="h-4 w-4 mr-2" />
                Frequently Asked Questions
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Contact Support
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-green-600" />
              Legal & Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/privacy">
              <Button variant="outline" className="w-full justify-start">
                <Shield className="h-4 w-4 mr-2" />
                Privacy Policy
              </Button>
            </Link>
            <Link href="/terms">
              <Button variant="outline" className="w-full justify-start">
                <Shield className="h-4 w-4 mr-2" />
                Terms of Service
              </Button>
            </Link>
            <Link href="/compliance">
              <Button variant="outline" className="w-full justify-start">
                <Shield className="h-4 w-4 mr-2" />
                Compliance Center
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AboutPage;