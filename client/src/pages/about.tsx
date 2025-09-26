import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Link } from 'wouter';
import { 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Target, 
  Zap, 
  BarChart3, 
  Users, 
  Shield, 
  HelpCircle,
  ExternalLink,
  Grid3X3,
  BookOpen,
  ArrowRight,
  Lightbulb
} from 'lucide-react';
import { scriptTokSections, getScriptTokSectionsByCategory, getScriptTokSectionsByKeyword, getScriptTokSectionByPath } from '@/lib/glowbot-sections';
import AboutThisPage from '@/components/AboutThisPage';

const AboutPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({});
  
  const sectionsByCategory = getScriptTokSectionsByCategory();
  const filteredSections = searchTerm ? getScriptTokSectionsByKeyword(searchTerm) : scriptTokSections;

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      {/* Header Section */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mr-4">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <div className="text-left">
            <h1 className="text-4xl font-bold text-gray-900">ScriptTok AI</h1>
            <p className="text-lg text-gray-600">Comprehensive Content Generation Platform</p>
          </div>
        </div>
        <p className="text-gray-700 max-w-3xl mx-auto text-lg leading-relaxed">
          Empower your content creation with AI-driven tools spanning from product research to cross-platform generation. 
          ScriptTok provides a complete ecosystem for content creators, marketers, and businesses to generate high-quality, 
          trend-aware content at scale.
        </p>
      </div>

      {/* System Overview */}
      <Card className="mb-12 border-l-4 border-l-blue-600">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <Target className="h-6 w-6 mr-3 text-blue-600" />
            System Overview
          </CardTitle>
          <CardDescription>
            Complete workflow from research to publication
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Lightbulb className="h-12 w-12 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900">1. Research</h3>
              <p className="text-sm text-gray-600">Discover products, analyze trends, assess opportunities</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Sparkles className="h-12 w-12 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900">2. Generate</h3>
              <p className="text-sm text-gray-600">Create platform-optimized content with AI models</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <BarChart3 className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900">3. Analyze</h3>
              <p className="text-sm text-gray-600">Track performance, measure engagement, optimize strategy</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Zap className="h-12 w-12 text-orange-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900">4. Automate</h3>
              <p className="text-sm text-gray-600">Schedule, integrate, and scale your content workflow</p>
            </div>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">Key Platform Features:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="flex items-center text-sm text-gray-700">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Multi-AI model support (OpenAI, Claude, etc.)
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                Cross-platform content optimization
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Real-time performance analytics
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                Automated scheduling and distribution
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                Constraint-based product research
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                Webhook integrations for workflow automation
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Navigation Grid */}
      <Card className="mb-12">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <Grid3X3 className="h-6 w-6 mr-3 text-green-600" />
            Quick Navigation
          </CardTitle>
          <CardDescription>
            Jump directly to any GlowBot section
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search features, tools, or functionality..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Navigation Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSections.map((section) => {
              const Icon = section.icon;
              return (
                <Link key={section.path} href={section.path}>
                  <Card className="h-full hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-blue-200 hover:border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <Icon className="h-5 w-5 text-blue-600 flex-shrink-0" />
                        <Badge variant="outline" className="text-xs">
                          {section.category}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">{section.name}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {section.description}
                      </p>
                      <div className="flex items-center text-xs text-blue-600">
                        <span>Learn more</span>
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {searchTerm && filteredSections.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-600">Try different keywords or browse all sections below.</p>
              <Button variant="outline" onClick={() => setSearchTerm('')} className="mt-4">
                Clear search
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Section Breakdown */}
      {!searchTerm && (
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <BookOpen className="h-6 w-6 mr-3 text-purple-600" />
              Detailed Section Guide
            </CardTitle>
            <CardDescription>
              Comprehensive breakdown of all GlowBot sections organized by category
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.entries(sectionsByCategory).map(([category, sections]) => (
              <Collapsible 
                key={category} 
                open={expandedCategories[category]} 
                onOpenChange={() => toggleCategory(category)}
              >
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-4 h-auto border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center">
                      <div className="text-left">
                        <h3 className="font-semibold text-lg text-gray-900">{category}</h3>
                        <p className="text-sm text-gray-600">
                          {sections.length} {sections.length === 1 ? 'tool' : 'tools'} available
                        </p>
                      </div>
                    </div>
                    {expandedCategories[category] ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pl-4">
                    {sections.map((section) => {
                      const Icon = section.icon;
                      return (
                        <Card key={section.path} className="border-l-4 border-l-gray-200">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center">
                                <Icon className="h-5 w-5 text-blue-600 mr-3" />
                                <h4 className="font-semibold text-gray-900">{section.name}</h4>
                              </div>
                              <Link href={section.path}>
                                <Button size="sm" variant="outline">
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  Open
                                </Button>
                              </Link>
                            </div>
                            
                            <p className="text-sm text-gray-700 mb-4">
                              {section.whatItDoes}
                            </p>

                            {section.keyFeatures.length > 0 && (
                              <div className="mb-4">
                                <h5 className="text-xs font-semibold text-gray-900 mb-2">Key Features:</h5>
                                <div className="flex flex-wrap gap-1">
                                  {section.keyFeatures.slice(0, 4).map((feature, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {feature}
                                    </Badge>
                                  ))}
                                  {section.keyFeatures.length > 4 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{section.keyFeatures.length - 4} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}

                            {section.setupRequirements.length > 0 && (
                              <div>
                                <h5 className="text-xs font-semibold text-gray-900 mb-2">Setup Requirements:</h5>
                                <ul className="text-xs text-gray-600 space-y-1">
                                  {section.setupRequirements.slice(0, 2).map((req, index) => (
                                    <li key={index} className="flex items-start">
                                      <span className="text-gray-400 mr-2">•</span>
                                      {req}
                                    </li>
                                  ))}
                                  {section.setupRequirements.length > 2 && (
                                    <li className="text-gray-500 italic">
                                      +{section.setupRequirements.length - 2} more requirements
                                    </li>
                                  )}
                                </ul>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Getting Started */}
      <Card className="mb-12 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <Zap className="h-6 w-6 mr-3 text-blue-600" />
            Getting Started
          </CardTitle>
          <CardDescription>
            New to GlowBot? Start here for the best experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Explore Dashboard</h3>
              <p className="text-sm text-gray-600 mb-4">
                Start with the dashboard to understand trending products and system overview
              </p>
              <Link href="/">
                <Button size="sm" variant="outline">
                  Visit Dashboard
                </Button>
              </Link>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Try Unified Generator</h3>
              <p className="text-sm text-gray-600 mb-4">
                Generate your first piece of content with our primary generation tool
              </p>
              <Link href="/unified-generator">
                <Button size="sm" variant="outline">
                  Start Generating
                </Button>
              </Link>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Research Products</h3>
              <p className="text-sm text-gray-600 mb-4">
                Use constraint-based research to discover actionable product opportunities
              </p>
              <Link href="/product-research">
                <Button size="sm" variant="outline">
                  Start Research
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Support & Community */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <HelpCircle className="h-5 w-5 mr-2 text-blue-600" />
              Need Help?
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
              Trust & Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/compliance">
              <Button variant="outline" className="w-full justify-start">
                <Shield className="h-4 w-4 mr-2" />
                Compliance Center
              </Button>
            </Link>
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
          </CardContent>
        </Card>
      </div>
      
      {/* About This Page Component */}
      {(() => {
        const sectionData = getScriptTokSectionByPath('/about');
        return sectionData ? (
          <AboutThisPage 
            title={sectionData.name}
            whatItDoes={sectionData.whatItDoes}
            setupRequirements={sectionData.setupRequirements}
            usageInstructions={sectionData.usageInstructions}
            relatedLinks={sectionData.relatedLinks}
            notes={sectionData.notes}
          />
        ) : null;
      })()}
    </div>
  );
};

export default AboutPage;