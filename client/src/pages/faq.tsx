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
import { ChevronRight, HelpCircle, Info, Video, Zap, BarChart3 } from 'lucide-react';

const FAQPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4 md:p-6 max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-3 text-gray-800">Frequently Asked Questions</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Find answers to common questions about Pheme and how it helps you create
          viral content with AI-powered generation and viral score analysis.
        </p>
      </div>

      {/* FAQ Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card className="text-center hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Info className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>
              Basic information about Pheme
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="text-center hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Video className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle>Viral Content</CardTitle>
            <CardDescription>
              Learn about content generation
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="text-center hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-purple-600" />
            </div>
            <CardTitle>Viral Scores</CardTitle>
            <CardDescription>
              Understanding viral analysis
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* General FAQs */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Getting Started</h2>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="what-is-pheme">
            <AccordionTrigger>
              What is Pheme?
            </AccordionTrigger>
            <AccordionContent>
              Pheme is an AI-powered content generator that helps creators make viral content.
              Using Claude AI technology, it generates engaging scripts with instant viral score
              analysis to help you create content that resonates with your audience and has the potential to go viral.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="how-does-it-work">
            <AccordionTrigger>
              How does Pheme work?
            </AccordionTrigger>
            <AccordionContent>
              <p className="mb-4">
                Pheme works in four simple steps:
              </p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Select your content niche (beauty, tech, fashion, etc.)</li>
                <li>Choose a template designed for viral content</li>
                <li>Generate content using Claude AI</li>
                <li>Get instant viral score analysis and save to content history</li>
              </ol>
              <p className="mt-4">
                Our AI system analyzes your generated content and provides a viral score to help you
                choose the most engaging options. For more detailed information, visit our{' '}
                <Link href="/how-it-works">
                  <span className="text-blue-600 hover:text-blue-800 cursor-pointer">How It Works</span>
                </Link>{' '}
                page.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="what-niches">
            <AccordionTrigger>
              What niches are supported?
            </AccordionTrigger>
            <AccordionContent>
              Pheme supports 7 major niches:
              <ul className="list-disc pl-6 mt-2 grid grid-cols-2 gap-2">
                <li>Beauty & Skincare</li>
                <li>Technology & Gadgets</li>
                <li>Fashion & Style</li>
                <li>Fitness & Health</li>
                <li>Food & Cooking</li>
                <li>Travel & Adventure</li>
                <li>Pets & Animals</li>
              </ul>
              <p className="mt-2">
                Each niche has specialized templates designed specifically for audiences in that category.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="cost">
            <AccordionTrigger>
              Is Pheme free to use?
            </AccordionTrigger>
            <AccordionContent>
              Pheme offers both free and premium features. You can generate content and view
              viral scores without any cost. Premium features may include additional templates, unlimited
              generations, and advanced analytics. Check our pricing page for current plan details.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* TikTok Content FAQs */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Pheme Content Generation</h2>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="templates">
            <AccordionTrigger>
              What content templates are available?
            </AccordionTrigger>
            <AccordionContent>
              <p className="mb-2">
                Pheme offers viral templates designed for engagement:
              </p>
              <ul className="list-disc pl-6 grid grid-cols-2 gap-2">
                <li>Product Reveals</li>
                <li>Before & After</li>
                <li>Tutorial & How-To</li>
                <li>Trend Commentary</li>
                <li>Product Reviews</li>
                <li>Day in the Life</li>
                <li>Quick Tips</li>
                <li>Comparison Videos</li>
              </ul>
              <p className="mt-2">
                Each niche has specialized templates optimized for that audience and content style.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="viral-optimization">
            <AccordionTrigger>
              How is content optimized for social platforms?
            </AccordionTrigger>
            <AccordionContent>
              Pheme optimizes every piece of content for high engagement across TikTok, Reels, Shorts, and more.
                Our AI studies successful posts to identify proven viral patterns—strong hooks, ideal length,
                trending topics, and audience appeal—then generates scripts that stay authentic to your voice
                and niche.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="content-history">
            <AccordionTrigger>
              How does content history work?
            </AccordionTrigger>
            <AccordionContent>
              All your generated content is automatically saved to your content history with timestamps,
              viral scores, and performance ratings. You can access your history anytime to review past content,
              rate how it performed, and reuse successful scripts. This helps you learn what works best for
              your audience.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="export">
            <AccordionTrigger>
              How can I use the generated content?
            </AccordionTrigger>
            <AccordionContent>
              After generating content, you can copy it directly for use in your captions, video scripts,
                or content calendar. Each piece is optimized for platforms like TikTok, Reels, and Shorts,
                and can be easily customized to fit your unique style, tone, and brand voice.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Viral Score FAQs */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Viral Score Analysis</h2>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="viral-score-meaning">
            <AccordionTrigger>
              What does the viral score mean?
            </AccordionTrigger>
            <AccordionContent>
              <p>The viral score is a prediction of how well your content might perform, based on:</p>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li>Engagement hooks and opening lines</li>
                <li>Content structure and flow</li>
                <li>Trending elements and patterns</li>
                <li>Audience appeal for your selected niche</li>
                <li>Optimal length and format</li>
              </ul>
              <p className="mt-2">
                Higher scores indicate better viral potential, but remember that actual performance depends
                on many factors including timing, audience, and execution.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="improve-viral-score">
            <AccordionTrigger>
              How can I improve my viral scores?
            </AccordionTrigger>
            <AccordionContent>
              <p>
                To get higher viral scores on your content:
              </p>
              <ol className="list-decimal pl-6 mt-2 space-y-2">
                <li>Try different templates for the same topic</li>
                <li>Choose templates that match current trends</li>
                <li>Select the niche that best fits your content</li>
                <li>Regenerate content multiple times to compare scores</li>
                <li>Look at your content history to see which styles score highest</li>
              </ol>
              <p className="mt-2">
                Use your content history to identify patterns in your highest-scoring content and apply
                those learnings to future generations.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="content-quality">
            <AccordionTrigger>
              How can I improve my content quality?
            </AccordionTrigger>
            <AccordionContent>
              <p>To get the best content from Pheme:</p>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li>Choose the template that best matches your content goal</li>
                <li>Select the most relevant niche for your topic</li>
                <li>Generate multiple versions and compare viral scores</li>
                <li>Use your content history to learn from past successes</li>
                <li>Edit and personalize the generated content to match your style</li>
              </ul>
              <p className="mt-2">
                Remember that AI-generated content is a starting point - add your personal touch and
                authentic voice to make it truly engaging for your audience.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Still Have Questions Section */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-none shadow-md">
        <CardContent className="p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Create Viral Content?</h2>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
              Start generating engaging content with AI-powered viral score analysis.
              Still have questions? Check out our guides or contact support.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/generate">
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600">
                  <Video className="mr-2 h-4 w-4" />
                  Generate Content
                </Button>
              </Link>
              <Link href="/how-it-works">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
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