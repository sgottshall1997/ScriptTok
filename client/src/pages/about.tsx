import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link } from 'wouter';
import { TEMPLATE_METADATA, getUniversalTemplates, getTemplatesByCategory } from '../../../shared/templateMetadata';
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
  BookOpen,
  Code
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
      title: 'Smart AI Integration',
      description: 'Choose from OpenAI GPT-4 and Anthropic Claude - both enhanced with real-time Perplexity trend data'
    },
    {
      icon: TrendingUp,
      title: 'Trending Product Integration',
      description: 'Automatically discover trending products to create timely, relevant content that drives engagement'
    },
    {
      icon: Grid3X3,
      title: 'Content Templates & History',
      description: 'Access proven templates and track all your generated content with performance ratings'
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
    <div className="container mx-auto p-4 md:p-6 max-w-6xl">
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

      {/* What ScriptTok Does */}
      <Card className="mb-12 border-l-4 border-l-pink-600">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <Target className="h-6 w-6 mr-3 text-pink-600" />
            What ScriptTok Does
          </CardTitle>
          <CardDescription>
            AI-powered TikTok content generation with real-time trend intelligence
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-6 rounded-lg mb-8">
            <p className="text-lg text-gray-800 leading-relaxed">
              ScriptTok combines AI technology with real-time trend data to help you create engaging TikTok scripts 
              that capture attention and drive results. Our platform uses Perplexity AI to research trending products 
              and viral content patterns, then feeds this intelligence to ChatGPT or Claude to generate smart, 
              contextually relevant content.
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

      {/* The ScriptTok Intelligence Process */}
      <Card className="mb-12 border-l-4 border-l-purple-600">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <Sparkles className="h-6 w-6 mr-3 text-purple-600" />
            The ScriptTok Intelligence Process
          </CardTitle>
          <CardDescription>
            How we create trend-aware, viral content using AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* ScriptTok Intelligence Flow Diagram */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200">
              <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-2">

                {/* Step 1: Perplexity Discovery */}
                <div className="flex-1 text-center p-4 bg-white rounded-lg border-2 border-purple-300 shadow-sm">
                  <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-bold text-purple-800 mb-2 text-sm">Perplexity Discovery</h4>
                  <p className="text-xs text-purple-700">Finds trending products for each niche using real-time web research</p>
                </div>

                {/* Arrow 1 */}
                <div className="hidden md:block">
                  <ArrowRight className="h-6 w-6 text-purple-600" />
                </div>
                <div className="md:hidden">
                  <div className="h-6 w-6 rotate-90">
                    <ArrowRight className="h-6 w-6 text-purple-600" />
                  </div>
                </div>

                {/* Step 2: Product Selection */}
                <div className="flex-1 text-center p-4 bg-white rounded-lg border-2 border-blue-300 shadow-sm">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-bold text-blue-800 mb-2 text-sm">Product Selection</h4>
                  <p className="text-xs text-blue-700">You select a trending product to create content about</p>
                </div>

                {/* Arrow 2 */}
                <div className="hidden md:block">
                  <ArrowRight className="h-6 w-6 text-blue-600" />
                </div>
                <div className="md:hidden">
                  <div className="h-6 w-6 rotate-90">
                    <ArrowRight className="h-6 w-6 text-blue-600" />
                  </div>
                </div>

                {/* Step 3: Viral Analysis */}
                <div className="flex-1 text-center p-4 bg-white rounded-lg border-2 border-green-300 shadow-sm">
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Video className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-bold text-green-800 mb-2 text-sm">Viral Analysis</h4>
                  <p className="text-xs text-green-700">Perplexity analyzes TikTok and competitor viral videos for the product</p>
                </div>

                {/* Arrow 3 */}
                <div className="hidden md:block">
                  <ArrowRight className="h-6 w-6 text-green-600" />
                </div>
                <div className="md:hidden">
                  <div className="h-6 w-6 rotate-90">
                    <ArrowRight className="h-6 w-6 text-green-600" />
                  </div>
                </div>

                {/* Step 4: AI Generation */}
                <div className="flex-1 text-center p-4 bg-white rounded-lg border-2 border-orange-300 shadow-sm">
                  <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-bold text-orange-800 mb-2 text-sm">AI Generation</h4>
                  <p className="text-xs text-orange-700">ChatGPT/Claude creates script using all viral intelligence</p>
                </div>

                {/* Arrow 4 */}
                <div className="hidden md:block">
                  <ArrowRight className="h-6 w-6 text-orange-600" />
                </div>
                <div className="md:hidden">
                  <div className="h-6 w-6 rotate-90">
                    <ArrowRight className="h-6 w-6 text-orange-600" />
                  </div>
                </div>

                {/* Step 5: Viral Score Analysis */}
                <div className="flex-1 text-center p-4 bg-white rounded-lg border-2 border-pink-300 shadow-sm">
                  <div className="w-12 h-12 bg-pink-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-bold text-pink-800 mb-2 text-sm">Viral Score Analysis</h4>
                  <p className="text-xs text-pink-700">AI analyzes and rates output with viral potential score</p>
                </div>

              </div>

              {/* Flow Summary */}
              <div className="mt-6 p-4 bg-white rounded-lg border border-purple-300">
                <h4 className="font-bold text-purple-800 mb-2 text-center">The Result</h4>
                <p className="text-sm text-purple-700 text-center">
                  Scripts that are informed by real trending data, proven viral patterns, and optimized for maximum engagement - not just well-written generic content.
                </p>
              </div>
            </div>
          </div>

          {/* Key Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h4 className="font-semibold text-yellow-800 mb-2">🎯 Why This Matters:</h4>
              <p className="text-sm text-yellow-700">
                Your content isn't just well-written—it's intelligently informed about what's actually viral right now, 
                giving you the competitive edge to create content that resonates with audiences.
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">⚡ Smart AI Models:</h4>
              <p className="text-sm text-green-700">
                Both ChatGPT and Claude are enhanced with live Perplexity trend data. Choose the AI model that 
                works best for your content style - both create trend-aware, viral content.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How to Use ScriptTok */}
      <Card className="mb-12 border-l-4 border-l-blue-600">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <Play className="h-6 w-6 mr-3 text-blue-600" />
            How to Use ScriptTok
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
              <p className="text-sm text-gray-600">Select from 7 supported niches with specialized templates</p>
            </div>

            <div className="text-center p-6 bg-purple-50 rounded-lg border-2 border-purple-200">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Select Product & Template</h3>
              <p className="text-sm text-gray-600">Pick trending products and viral content templates</p>
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
              <h3 className="font-semibold text-gray-900 mb-2">Review & Optimize</h3>
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            {supportedNiches.map((niche, index) => (
              <div key={index} className="flex items-center p-3 bg-green-50 rounded-lg border border-green-200">
                <Star className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-900">{niche}</span>
              </div>
            ))}
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Why niches matter:</strong> Each niche has unique audience preferences, trending formats, 
              and viral patterns. Our AI is trained on successful content from each category to ensure 
              your scripts resonate with the right audience.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Content Template Types */}
      <Card className="mb-12 border-l-4 border-l-orange-600">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <Code className="h-6 w-6 mr-3 text-orange-600" />
            Content Template Types
          </CardTitle>
          <CardDescription>
            Highly sophisticated, proprietary AI prompts engineered for maximum viral potential
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Universal Templates Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-orange-600" />
              Universal Templates
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {getUniversalTemplates().map((template) => (
                <div key={template.id} className="p-4 bg-orange-50 rounded-lg border border-orange-200 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{template.icon}</span>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">{template.name}</h4>
                        <Badge variant="outline" className="text-xs mt-1">
                          {template.estimatedLength}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">{template.description}</p>
                  <div className="space-y-2">
                    <div className="flex items-center text-xs text-gray-600">
                      <span className="font-medium mr-2">Platforms:</span>
                      <div className="flex flex-wrap gap-1">
                        {template.platforms.map((platform, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {platform}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-xs text-gray-600">
                      <span className="font-medium">Use Case:</span> {template.useCase}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Niche-Specific Templates Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Target className="h-5 w-5 mr-2 text-orange-600" />
              Niche-Specific Templates
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {['Beauty', 'Fashion', 'Fitness', 'Food', 'Tech', 'Travel', 'Pet'].map((category) => {
                const categoryTemplates = getTemplatesByCategory(category);
                return categoryTemplates.map((template) => (
                  <div key={template.id} className="p-4 bg-blue-50 rounded-lg border border-blue-200 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{template.icon}</span>
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm">{template.name}</h4>
                          <Badge variant="outline" className="text-xs mt-1">
                            {template.estimatedLength}
                          </Badge>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {template.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">{template.description}</p>
                    <div className="space-y-2">
                      <div className="flex items-center text-xs text-gray-600">
                        <span className="font-medium mr-2">Platforms:</span>
                        <div className="flex flex-wrap gap-1">
                          {template.platforms.map((platform, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {platform}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-xs text-gray-600">
                        <span className="font-medium">Use Case:</span> {template.useCase}
                      </div>
                    </div>
                  </div>
                ));
              })}
            </div>
          </div>

          {/* Bottom Note */}
          <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-200">
            <p className="text-sm text-gray-800 font-medium mb-2">
              🔧 Advanced Prompt Engineering
            </p>
            <p className="text-sm text-gray-700">
              Each template utilizes advanced prompt engineering techniques developed through extensive testing and optimization. 
              Our proprietary AI prompts are designed to maximize viral potential, engagement rates, and conversion performance 
              across all supported platforms and content types.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ScriptTok Features Navigation */}
      <Card className="mb-12">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <Grid3X3 className="h-6 w-6 mr-3 text-purple-600" />
            Explore ScriptTok Features
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