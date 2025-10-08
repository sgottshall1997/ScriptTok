import React from 'react';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from 'wouter';
import { 
  Video, 
  FileText, 
  Sparkles, 
  BarChart3, 
  History, 
  ChevronRight,
  Zap,
  TrendingUp,
  Brain,
  Target,
  Play
} from 'lucide-react';

const HowItWorksPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4 md:p-6 max-w-5xl">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-3 text-gray-800">How Pheme Works</h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-3xl">
          Create viral content with AI-powered generation, viral score analysis, and performance tracking. 
          Turn your ideas into engaging scripts in seconds.
        </p>
      </div>
      
      {/* Process Steps */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <Card>
          <CardHeader className="pb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="flex items-start">
              <div className="bg-gray-200 text-gray-700 font-bold rounded-full w-7 h-7 flex items-center justify-center mr-2 flex-shrink-0">1</div>
              <span>Select Niche</span>
            </CardTitle>
            <CardDescription>
              Choose from beauty, tech, fashion, fitness, food, travel, or pets.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 text-sm">
              Each niche has specialized templates optimized for that audience and content style.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
            <CardTitle className="flex items-start">
              <div className="bg-gray-200 text-gray-700 font-bold rounded-full w-7 h-7 flex items-center justify-center mr-2 flex-shrink-0">2</div>
              <span>Choose Template</span>
            </CardTitle>
            <CardDescription>
              Pick from viral content templates designed to engage your audience.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 text-sm">
              From product reveals to tutorials, our templates are crafted for maximum engagement.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Sparkles className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="flex items-start">
              <div className="bg-gray-200 text-gray-700 font-bold rounded-full w-7 h-7 flex items-center justify-center mr-2 flex-shrink-0">3</div>
              <span>Generate & Score</span>
            </CardTitle>
            <CardDescription>
              AI creates your content with instant viral score analysis.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 text-sm">
              Claude AI generates engaging content while our viral score algorithm predicts engagement potential.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <History className="h-6 w-6 text-orange-600" />
            </div>
            <CardTitle className="flex items-start">
              <div className="bg-gray-200 text-gray-700 font-bold rounded-full w-7 h-7 flex items-center justify-center mr-2 flex-shrink-0">4</div>
              <span>Save & Track</span>
            </CardTitle>
            <CardDescription>
              Save content to history and track performance over time.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 text-sm">
              Access your content history, rate performance, and learn from your highest-scoring content.
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Feature Highlights */}
      <div className="mb-12">
        <h2 className="text-3xl md:text-4xl lg:text-display-sm font-bold mb-6 text-gray-800">Pheme Features</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex">
            <div className="mr-4 mt-1">
              <Zap className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-2xl md:text-3xl font-semibold mb-2">Viral Score Analysis</h3>
              <p className="text-gray-700">
                Every generated script gets an instant viral score based on engagement patterns, 
                trending elements, and content structure to help you pick winning content.
              </p>
            </div>
          </div>
          
          <div className="flex">
            <div className="mr-4 mt-1">
              <Brain className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-2xl md:text-3xl font-semibold mb-2">Claude AI Generation</h3>
              <p className="text-gray-700">
                Powered by GPT and Claude AI for high-quality, engaging content that feels natural 
                and authentic while maintaining viral potential.
              </p>
            </div>
          </div>
          
          <div className="flex">
            <div className="mr-4 mt-1">
              <Video className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-2xl md:text-3xl font-semibold mb-2">Platform Optimized</h3>
              <p className="text-gray-700">
                All content is intelligently structured for high engagement across platforms — 
                optimized length, trending topics, and proven formats that perform on TikTok, 
                Instagram Reels, YouTube Shorts, and beyond
              </p>
            </div>
          </div>
          
          <div className="flex">
            <div className="mr-4 mt-1">
              <BarChart3 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-2xl md:text-3xl font-semibold mb-2">Content History & Tracking</h3>
              <p className="text-gray-700">
                Save all your generated content, rate performance, and build a library of your 
                highest-performing scripts for future reference.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* FAQ Section */}
      <div className="mb-12">
        <h2 className="text-3xl md:text-4xl lg:text-display-sm font-bold mb-6 text-gray-800">Frequently Asked Questions</h2>
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>
              What niches does Pheme support?
            </AccordionTrigger>
            <AccordionContent>
              Pheme supports 7 major niches: Beauty, Technology, Fashion, Fitness, Food, 
              Travel, and Pets. Each niche has specialized templates designed for that specific audience 
              and content style.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-2">
            <AccordionTrigger>
              How does the viral score work?
            </AccordionTrigger>
            <AccordionContent>
              Our Viral Score algorithm analyzes each piece of content for key performance factors — 
              engagement hooks, trending patterns, optimal length, and audience appeal. 
              A higher score means stronger viral potential.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-3">
            <AccordionTrigger>
              Can I edit the generated content?
            </AccordionTrigger>
            <AccordionContent>
              Absolutely! After generation, you can copy, edit, and customize the content however you like. 
              The generated scripts are starting points that you can adapt to your personal style and brand.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-4">
            <AccordionTrigger>
              How is my content history stored?
            </AccordionTrigger>
            <AccordionContent>
              All your generated content is automatically saved to your content history with timestamps, 
              viral scores, and the ability to rate performance. You can access this anytime to review 
              and reuse successful content.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-5">
            <AccordionTrigger>
              Is each script unique?
            </AccordionTrigger>
            <AccordionContent>
              Yes! Claude AI generates completely original content every time based on your inputs, 
              selected template, and niche. No two generations will be identical, ensuring your content 
              stays fresh and unique.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-6">
            <AccordionTrigger>
              What makes Pheme different from other content generators?
            </AccordionTrigger>
            <AccordionContent>
              Pheme helps creators win across platforms with Viral Score insights, tailored templates, 
                and dual-AI generation. Every piece is optimized for maximum engagement and growth.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-7">
            <AccordionTrigger>
              Do I need any experience to create content?
            </AccordionTrigger>
            <AccordionContent>
              Not at all! Pheme is designed for creators of all levels. Simply select your niche, 
              pick a template, and let our AI handle the complex part of creating engaging, viral-worthy 
              content.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      
      {/* CTA Section */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-none shadow-md">
        <CardContent className="p-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl lg:text-display-sm font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
              Ready to Go Viral?
            </h2>
            <p className="text-gray-700 mb-6">
              Start creating viral content with AI-powered generation and instant viral score analysis.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/generate">
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600">
                  <Play className="mr-2 h-4 w-4" />
                  Create Content
                </Button>
              </Link>
              <Link href="/content-history">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  <History className="mr-2 h-4 w-4" />
                  View Content History
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>


    </div>
  );
};

export default HowItWorksPage;