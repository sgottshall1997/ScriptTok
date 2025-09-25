import React from 'react';
import AboutThisPage from '@/components/AboutThisPage';
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
  TrendingUp, 
  FileText, 
  Settings, 
  Send, 
  Share2, 
  ChevronRight,
  Zap,
  FileSearch,
  Brain,
  Target,
  BarChart
} from 'lucide-react';

const HowItWorksPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4 md:p-6 max-w-5xl">
      <div className="mb-12">
        <h1 className="text-3xl font-bold mb-3 text-gray-800">How GlowBot AI Works</h1>
        <p className="text-lg text-gray-600 max-w-3xl">
          Discover how our multi-niche content generation engine transforms your product ideas into 
          engaging, trend-aware content in just a few clicks.
        </p>
      </div>
      
      {/* Process Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <Card>
          <CardHeader className="pb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="flex items-start">
              <div className="bg-gray-200 text-gray-700 font-bold rounded-full w-7 h-7 flex items-center justify-center mr-2 flex-shrink-0">1</div>
              <span>Select Your Niche</span>
            </CardTitle>
            <CardDescription>
              Choose from multiple niches including skincare, tech, fashion, fitness and more.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 text-sm">
              Each niche comes with specialized templates and trend data to ensure your content is 
              relevant and engaging for your specific audience.
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
              <span>Pick a Template</span>
            </CardTitle>
            <CardDescription>
              Choose from various content templates tailored to your specific needs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 text-sm">
              From product reviews to comparison charts, we offer specialized templates for each 
              niche to help you create the perfect content for your audience.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="flex items-start">
              <div className="bg-gray-200 text-gray-700 font-bold rounded-full w-7 h-7 flex items-center justify-center mr-2 flex-shrink-0">3</div>
              <span>Generate Content</span>
            </CardTitle>
            <CardDescription>
              Enter your product details, customize tone, and let our AI do the rest.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 text-sm">
              Our advanced AI engine combines your inputs with trending data to generate 
              high-quality, engaging content optimized for your chosen niche.
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Feature Highlights */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Key Features</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex">
            <div className="mr-4 mt-1">
              <FileSearch className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Trend Analysis</h3>
              <p className="text-gray-700">
                Our platform continuously monitors trending products across multiple platforms including 
                TikTok, YouTube, Instagram, Reddit, and Amazon to ensure your content references what's 
                popular now.
              </p>
            </div>
          </div>
          
          <div className="flex">
            <div className="mr-4 mt-1">
              <Brain className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered Templates</h3>
              <p className="text-gray-700">
                Our specialized templates have been trained on thousands of successful content pieces 
                to ensure they follow best practices for engagement and conversion.
              </p>
            </div>
          </div>
          
          <div className="flex">
            <div className="mr-4 mt-1">
              <Target className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Niche Specialization</h3>
              <p className="text-gray-700">
                Each niche has its own content patterns, audience expectations, and terminology. 
                Our system is trained specifically for each niche to ensure authentic-sounding content.
              </p>
            </div>
          </div>
          
          <div className="flex">
            <div className="mr-4 mt-1">
              <BarChart className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Analytics Integration</h3>
              <p className="text-gray-700">
                Track which content performs best with built-in analytics, helping you refine your 
                strategy and focus on what drives engagement and conversions.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* FAQ Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Frequently Asked Questions</h2>
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>
              What niches does GlowBot AI support?
            </AccordionTrigger>
            <AccordionContent>
              GlowBot AI currently supports multiple niches including Skincare & Beauty, Technology, 
              Fashion, Fitness, Food, Travel, and Pet Care. We're constantly expanding our niche coverage 
              based on user feedback.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-2">
            <AccordionTrigger>
              How accurate is the trend data?
            </AccordionTrigger>
            <AccordionContent>
              Our trend data is refreshed regularly from multiple sources including social media platforms 
              and e-commerce sites. While we strive for accuracy, trends can change rapidly, so we recommend 
              refreshing trend data before generating important content.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-3">
            <AccordionTrigger>
              Can I customize the generated content?
            </AccordionTrigger>
            <AccordionContent>
              Yes! After content generation, you can edit the output, change tone, add your own affiliate 
              links, and make any adjustments needed before using it on your platforms.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-4">
            <AccordionTrigger>
              How does the affiliate link option work?
            </AccordionTrigger>
            <AccordionContent>
              When generating content, you can optionally add your own Amazon affiliate links. The system 
              will create properly formatted links using your affiliate ID that you can include in your 
              content, helping you monetize your audience.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-5">
            <AccordionTrigger>
              Is the content unique and original?
            </AccordionTrigger>
            <AccordionContent>
              Yes, each piece of content is uniquely generated based on your inputs, selected template, 
              and current trends. The AI creates original content that doesn't duplicate existing material 
              while maintaining best practices for each content type.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-6">
            <AccordionTrigger>
              Can I create content for multiple products at once?
            </AccordionTrigger>
            <AccordionContent>
              Currently, each generation is focused on a single product for maximum quality. However, some 
              templates like "comparison" or "top 5" will reference multiple products in relation to your 
              main product, creating a richer content piece.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-7">
            <AccordionTrigger>
              Do I need technical knowledge to use GlowBot AI?
            </AccordionTrigger>
            <AccordionContent>
              Not at all! GlowBot AI is designed with a user-friendly interface that anyone can use 
              without technical expertise. Simply select options from dropdown menus, enter your product 
              information, and the system handles the complex generation process.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      
      {/* CTA Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-none shadow-md">
        <CardContent className="p-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
              Ready to Create Compelling Content?
            </h2>
            <p className="text-gray-700 mb-6">
              Start generating trend-aware, niche-specific content for your products in minutes.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/">
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600">
                  Get Started Now <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/templates">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Browse Templates
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      <AboutThisPage 
        title="How GlowBot AI Works"
        whatItDoes="Comprehensive guide explaining the complete process of using GlowBot AI for content generation. Covers niche selection, AI-powered content creation, platform optimization, and publishing workflows. Provides step-by-step instructions for maximizing content performance and engagement."
        setupRequirements={[
          "Basic understanding of your target niche and audience",
          "Product or topic ideas for content creation",
          "Social media accounts for content distribution"
        ]}
        usageInstructions={[
          "Read through the complete process overview to understand the workflow",
          "Follow the 3-step process: Select niche → Generate content → Optimize & share",
          "Use the provided examples and best practices for each step",
          "Refer back to specific sections when implementing each stage",
          "Follow the recommended optimization tips for better performance",
          "Use this guide as a reference while using other GlowBot features"
        ]}
        relatedLinks={[
          {name: "Get Started Now", path: "/"},
          {name: "Browse Templates", path: "/template-explorer"},
          {name: "FAQ", path: "/faq"},
          {name: "Contact Support", path: "/contact"}
        ]}
        notes={[
          "This guide provides the foundational knowledge for using all GlowBot features",
          "Best practices mentioned here apply across all content generation tools",
          "Regular updates ensure the guide reflects the latest platform capabilities",
          "Step-by-step approach makes it easy for beginners to get started",
          "Advanced tips help experienced users optimize their content strategy"
        ]}
      />

    </div>
  );
};

export default HowItWorksPage;