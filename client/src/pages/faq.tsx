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
import { ChevronRight, HelpCircle, Info, Search } from 'lucide-react';

const FAQPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4 md:p-6 max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-3 text-gray-800">Frequently Asked Questions</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Find answers to common questions about GlowBot AI and how it can help you create
          engaging, trend-aware content for your products.
        </p>
      </div>
      
      {/* FAQ Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card className="text-center hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Info className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle>General</CardTitle>
            <CardDescription>
              Basic information about our platform
            </CardDescription>
          </CardHeader>
        </Card>
        
        <Card className="text-center hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Search className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle>Features</CardTitle>
            <CardDescription>
              Learn about platform capabilities
            </CardDescription>
          </CardHeader>
        </Card>
        
        <Card className="text-center hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <HelpCircle className="h-6 w-6 text-purple-600" />
            </div>
            <CardTitle>Troubleshooting</CardTitle>
            <CardDescription>
              Solutions to common issues
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
      
      {/* General FAQs */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">General Questions</h2>
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="what-is-glowbot">
            <AccordionTrigger>
              What is GlowBot AI?
            </AccordionTrigger>
            <AccordionContent>
              GlowBot AI is a modular, trend-aware content generation engine designed specifically for 
              affiliate marketers, social media managers, and content creators. It helps you create 
              high-quality, niche-specific content that incorporates current trends and best practices 
              across various industries including skincare, tech, fashion, fitness, and more.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="how-does-it-work">
            <AccordionTrigger>
              How does GlowBot AI work?
            </AccordionTrigger>
            <AccordionContent>
              <p className="mb-4">
                GlowBot AI works in three simple steps:
              </p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Select your content niche (skincare, tech, fashion, etc.)</li>
                <li>Choose a template type for your content</li>
                <li>Enter your product details and customize tone</li>
              </ol>
              <p className="mt-4">
                Our AI engine then generates content that incorporates recent trends, industry best 
                practices, and your product information. For more detailed information, visit our{' '}
                <Link href="/how-it-works">
                  <span className="text-blue-600 hover:text-blue-800 cursor-pointer">How It Works</span>
                </Link>{' '}
                page.
              </p>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="what-niches">
            <AccordionTrigger>
              What content niches are supported?
            </AccordionTrigger>
            <AccordionContent>
              GlowBot AI currently supports content generation for:
              <ul className="list-disc pl-6 mt-2 grid grid-cols-2 gap-2">
                <li>Skincare & Beauty</li>
                <li>Technology & Gadgets</li>
                <li>Fashion & Apparel</li>
                <li>Fitness & Wellness</li>
                <li>Food & Cooking</li>
                <li>Travel & Adventure</li>
                <li>Pet Care & Products</li>
              </ul>
              <p className="mt-2">
                We're continuously expanding our niche support based on user feedback and market demands.
              </p>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="cost">
            <AccordionTrigger>
              How much does it cost?
            </AccordionTrigger>
            <AccordionContent>
              GlowBot AI offers multiple pricing tiers to fit different needs. We have a free tier with 
              limited generations per month, as well as various paid plans for more extensive usage. 
              Visit our pricing page for current rates and features included in each plan.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      
      {/* Features FAQs */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Features & Capabilities</h2>
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="templates">
            <AccordionTrigger>
              What content templates are available?
            </AccordionTrigger>
            <AccordionContent>
              <p className="mb-2">
                GlowBot AI offers a wide range of templates, including:
              </p>
              <ul className="list-disc pl-6 grid grid-cols-2 gap-2">
                <li>Product Reviews</li>
                <li>Comparison Content</li>
                <li>Product Pros & Cons</li>
                <li>Social Media Captions</li>
                <li>Product Routines</li>
                <li>Beginner Guides</li>
                <li>Video Scripts</li>
                <li>And many more!</li>
              </ul>
              <p className="mt-2">
                Each niche also has specialized templates that are only available for that particular industry.
              </p>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="trends">
            <AccordionTrigger>
              How does trend detection work?
            </AccordionTrigger>
            <AccordionContent>
              Our trend detection system continuously monitors popular platforms (TikTok, YouTube, Instagram, 
              Reddit, and Amazon) to identify trending products and topics within each niche. This data is 
              refreshed regularly to ensure your content references current trends, making it more relevant 
              and engaging for your audience.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="affiliate">
            <AccordionTrigger>
              Can I add my affiliate links?
            </AccordionTrigger>
            <AccordionContent>
              Yes! GlowBot AI supports adding your Amazon affiliate ID or full affiliate links to your content. 
              This feature helps you monetize your content directly without having to manually add links after 
              generation. Simply toggle the affiliate link option when generating content and enter your 
              affiliate ID.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="export">
            <AccordionTrigger>
              How can I export or use the generated content?
            </AccordionTrigger>
            <AccordionContent>
              After generating content, you can copy it directly to your clipboard, download it as a text file, 
              or share it via a generated link. The content is ready to use on your website, social media 
              platforms, email newsletters, or anywhere else you publish content.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      
      {/* Troubleshooting FAQs */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Troubleshooting</h2>
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="error-generation">
            <AccordionTrigger>
              I'm getting an error during content generation
            </AccordionTrigger>
            <AccordionContent>
              <p>If you're experiencing errors during content generation, try these steps:</p>
              <ol className="list-decimal pl-6 mt-2 space-y-2">
                <li>Refresh the page and try again</li>
                <li>Make sure your product name doesn't contain special characters</li>
                <li>Try selecting a different template</li>
                <li>Check your internet connection</li>
                <li>Clear your browser cache and cookies</li>
              </ol>
              <p className="mt-2">
                If the issue persists, please contact our support team with details about the error and 
                what you were trying to generate.
              </p>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="trends-outdated">
            <AccordionTrigger>
              The trend data seems outdated
            </AccordionTrigger>
            <AccordionContent>
              <p>
                If you notice trend data that seems outdated, you can:
              </p>
              <ol className="list-decimal pl-6 mt-2 space-y-2">
                <li>Click the "Refresh Trends" button on the dashboard to fetch the latest data</li>
                <li>Check when the data was last updated (displayed at the bottom of the trends panel)</li>
                <li>Select a different niche to see if the issue is niche-specific</li>
              </ol>
              <p className="mt-2">
                We update trend data regularly, but some platforms may have limitations on how frequently 
                we can fetch new data.
              </p>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="content-quality">
            <AccordionTrigger>
              How can I improve the quality of generated content?
            </AccordionTrigger>
            <AccordionContent>
              <p>To get the best results from GlowBot AI:</p>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li>Provide specific and detailed product names</li>
                <li>Choose the most appropriate template for your content goal</li>
                <li>Select a tone that matches your brand voice</li>
                <li>Experiment with different templates for the same product</li>
                <li>Edit and customize the generated content to add your personal touch</li>
              </ul>
              <p className="mt-2">
                Remember that AI-generated content works best as a starting point which you can then refine and 
                enhance with your own expertise and brand voice.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      
      {/* Still Have Questions Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-none shadow-md">
        <CardContent className="p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Still Have Questions?</h2>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
              We're here to help! Check out our detailed how-it-works guide or contact our support team
              for personalized assistance.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/how-it-works">
                <Button size="lg" className="w-full sm:w-auto">
                  How It Works Guide <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Contact Support
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>


    </div>
  );
};

export default FAQPage;