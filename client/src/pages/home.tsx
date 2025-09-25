import React, { useState } from 'react';
import AboutThisPage from '@/components/AboutThisPage';
import { useLocation } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trackEvent } from '@/lib/analytics';
import NicheGrid from '@/components/NicheGrid';
import { Button } from '@/components/ui/button';
import { ArrowRight, Book, BookOpen, TrendingUp, Lightbulb, Palette, Wand2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  const [selectedNiche, setSelectedNiche] = useState<string>('');
  const [_, navigate] = useLocation();

  const handleNicheSelect = (niche: string) => {
    setSelectedNiche(niche);
    trackEvent('select_niche', 'engagement', niche);
  };
  
  const navigateToDocumentation = () => {
    trackEvent('click', 'navigation', 'documentation');
    navigate('/documentation');
  };
  
  const navigateToTemplates = () => {
    trackEvent('click', 'navigation', 'template-explorer');
    navigate('/templates');
  };
  
  const navigateToTrends = () => {
    trackEvent('click', 'navigation', 'trends');
    navigate('/trends');
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center max-w-4xl mx-auto mb-12">
        <h1 className="text-4xl font-bold mb-4 text-gradient bg-gradient-to-r from-indigo-700 to-purple-700">
          Multi-Niche AI Content Generator
        </h1>
        <p className="text-xl text-gray-600 mb-6">
          Create specialized, targeted content for multiple industries with our AI-powered content engine.
          Select your niche to get started.
        </p>
      </div>
      
      <Tabs defaultValue="niche-selection" className="max-w-5xl mx-auto">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="niche-selection" className="text-sm sm:text-base">
            <Palette className="h-4 w-4 mr-2" /> Select Your Niche
          </TabsTrigger>
          <TabsTrigger value="features" className="text-sm sm:text-base">
            <Wand2 className="h-4 w-4 mr-2" /> Features
          </TabsTrigger>
          <TabsTrigger value="getting-started" className="text-sm sm:text-base">
            <Lightbulb className="h-4 w-4 mr-2" /> Getting Started
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="niche-selection" className="border-none p-0">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl mb-8 border border-indigo-100">
            <h2 className="text-2xl font-bold mb-3 text-indigo-800">Choose Your Industry</h2>
            <p className="text-gray-700 mb-6">
              Our AI content generator is specialized for multiple niches, with custom templates designed for each industry.
              Select the niche that best matches your content needs:
            </p>
          </div>
          
          <NicheGrid 
            initialNiche={selectedNiche} 
            onNicheSelect={handleNicheSelect}
            showStartButton={true}
          />
        </TabsContent>
        
        <TabsContent value="features" className="space-y-6 border-none p-0">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl mb-8 border border-blue-100">
            <h2 className="text-2xl font-bold mb-3 text-blue-800">Key Features</h2>
            <p className="text-gray-700 mb-6">
              Our AI content engine comes loaded with features to enhance your content creation workflow:
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
                  Trend Detection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Real-time trending product detection from multiple social platforms for each niche.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                  Specialized Templates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Niche-specific content templates designed for different content formats and platforms.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Palette className="h-5 w-5 mr-2 text-pink-600" />
                  Multi-Niche Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Supports multiple industries with specialized content formats for each vertical.
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex justify-center mt-8">
            <Button
              onClick={navigateToDocumentation}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 mr-4"
            >
              <Book className="h-4 w-4 mr-2" />
              View Documentation
            </Button>
            
            <Button
              onClick={navigateToTemplates}
              variant="outline"
              className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Explore Templates
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="getting-started" className="space-y-6 border-none p-0">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl mb-8 border border-green-100">
            <h2 className="text-2xl font-bold mb-3 text-green-800">Getting Started</h2>
            <p className="text-gray-700 mb-6">
              Follow these simple steps to create niche-specific content with our AI engine:
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="bg-green-100 text-green-800 rounded-full h-8 w-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="font-medium text-lg mb-1">Select Your Niche</h3>
                <p className="text-gray-600">
                  Choose the industry vertical that best matches your content needs from our niche selection grid.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-green-100 text-green-800 rounded-full h-8 w-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="font-medium text-lg mb-1">Choose a Template</h3>
                <p className="text-gray-600">
                  Select from specialized content templates designed specifically for your niche. Each template is optimized for different content formats.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-green-100 text-green-800 rounded-full h-8 w-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="font-medium text-lg mb-1">Enter Product Details</h3>
                <p className="text-gray-600">
                  Provide the product name and select a tone for your content. Our AI will generate specialized content using trending data.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-green-100 text-green-800 rounded-full h-8 w-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">
                4
              </div>
              <div>
                <h3 className="font-medium text-lg mb-1">Generate and Use</h3>
                <p className="text-gray-600">
                  Click generate and get your niche-specific content, complete with trending references and industry-specific terminology.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center mt-8">
            <Button
              onClick={() => navigate('/dashboard')}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 mr-4"
            >
              View Dashboard
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            
            <Button
              onClick={() => navigate('/trends')}
              variant="outline"
              className="border-green-200 text-green-700 hover:bg-green-50"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              View Trending Data
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <AboutThisPage 
        title="GlowBot AI Homepage"
        whatItDoes="Central hub and starting point for the multi-niche AI content generation platform. Provides niche selection, feature overview, and quick access to all major platform capabilities. Serves as the primary navigation center for content creation workflows."
        setupRequirements={[
          "No setup required - immediately ready for niche selection",
          "Basic understanding of your target market and audience",
          "Content goals and platform strategies for optimization"
        ]}
        usageInstructions={[
          "Select your target niche from the grid in the Niche Selection tab",
          "Explore platform features and capabilities in the Features tab",
          "Follow the Getting Started guide for step-by-step onboarding",
          "Use quick navigation buttons to access dashboard and trends",
          "Track events are automatically logged for analytics and optimization",
          "Bookmark specific niches and features for faster future access"
        ]}
        relatedLinks={[
          {name: "Generate Content", path: "/"},
          {name: "How It Works", path: "/how-it-works"},
          {name: "Template Explorer", path: "/template-explorer"},
          {name: "Trending AI Picks", path: "/trending-ai-picks"}
        ]}
        notes={[
          "Niche selection influences all AI-generated content optimization",
          "Platform features are designed for scalable multi-niche content creation",
          "Getting started guide provides comprehensive onboarding for new users",
          "Analytics tracking helps optimize platform experience based on usage patterns",
          "Central navigation design ensures efficient access to all platform capabilities"
        ]}
      />
    </div>
  );
}