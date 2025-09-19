import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Sparkles, 
  FileText, 
  Mail, 
  MessageSquare, 
  Image, 
  Video, 
  Mic,
  Settings,
  Wand2,
  Copy,
  Download
} from 'lucide-react';

export default function UnifiedContentGenerator() {
  const [contentType, setContentType] = useState('social');
  const [tone, setTone] = useState('professional');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate generation process
    setTimeout(() => {
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="space-y-6" data-testid="unified-content-generator-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="page-title">
            Unified Content Generator
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Generate content across all formats with our AI-powered unified engine
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" data-testid="button-templates">
            <FileText className="w-4 h-4 mr-2" />
            Templates
          </Button>
          <Button variant="outline" data-testid="button-settings">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-1">
          <Card data-testid="configuration-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wand2 className="w-5 h-5 mr-2" />
                Generation Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Content Type
                </label>
                <Select value={contentType} onValueChange={setContentType} data-testid="select-content-type">
                  <SelectTrigger>
                    <SelectValue placeholder="Select content type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="social">Social Media Post</SelectItem>
                    <SelectItem value="email">Email Campaign</SelectItem>
                    <SelectItem value="blog">Blog Article</SelectItem>
                    <SelectItem value="ad">Advertisement Copy</SelectItem>
                    <SelectItem value="newsletter">Newsletter</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tone & Style
                </label>
                <Select value={tone} onValueChange={setTone} data-testid="select-tone">
                  <SelectTrigger>
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="casual">Casual & Friendly</SelectItem>
                    <SelectItem value="persuasive">Persuasive</SelectItem>
                    <SelectItem value="informative">Informative</SelectItem>
                    <SelectItem value="creative">Creative & Fun</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Target Audience
                </label>
                <Select data-testid="select-audience">
                  <SelectTrigger>
                    <SelectValue placeholder="Select audience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Audience</SelectItem>
                    <SelectItem value="business">Business Professionals</SelectItem>
                    <SelectItem value="millennials">Millennials</SelectItem>
                    <SelectItem value="genz">Gen Z</SelectItem>
                    <SelectItem value="parents">Parents</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Content Description
                </label>
                <Textarea
                  placeholder="Describe what you want to create (e.g., 'A promotional post about our new product launch targeting young professionals')"
                  className="min-h-[100px]"
                  data-testid="textarea-description"
                />
              </div>

              <Button 
                className="w-full" 
                onClick={handleGenerate}
                disabled={isGenerating}
                data-testid="button-generate"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Content
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Output Panel */}
        <div className="lg:col-span-2">
          <Card data-testid="output-card">
            <CardHeader>
              <CardTitle>Generated Content</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="text" className="w-full" data-testid="output-tabs">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="text" data-testid="tab-text">
                    <FileText className="w-4 h-4 mr-2" />
                    Text
                  </TabsTrigger>
                  <TabsTrigger value="image" data-testid="tab-image">
                    <Image className="w-4 h-4 mr-2" />
                    Images
                  </TabsTrigger>
                  <TabsTrigger value="video" data-testid="tab-video">
                    <Video className="w-4 h-4 mr-2" />
                    Video
                  </TabsTrigger>
                  <TabsTrigger value="audio" data-testid="tab-audio">
                    <Mic className="w-4 h-4 mr-2" />
                    Audio
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="text" className="mt-4" data-testid="content-text">
                  <div className="space-y-4">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white" data-testid="text-output-title">
                          Primary Content
                        </h4>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" data-testid="button-copy-text">
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" data-testid="button-download-text">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300" data-testid="text-output-content">
                        {isGenerating ? (
                          <span className="text-gray-500 italic">Content will appear here once generated...</span>
                        ) : (
                          "🚀 Exciting news! We're thrilled to announce the launch of our revolutionary new product that's set to transform how you work and play. Join thousands of satisfied customers who have already experienced the difference. #Innovation #NewProduct #GameChanger"
                        )}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                        <h5 className="font-semibold text-gray-900 dark:text-white mb-2" data-testid="variation-1-title">
                          Variation 1 - Casual
                        </h5>
                        <p className="text-sm text-gray-700 dark:text-gray-300" data-testid="variation-1-content">
                          Hey everyone! 👋 Just dropped our latest creation and we can't contain our excitement! This one's a real game-changer...
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                        <h5 className="font-semibold text-gray-900 dark:text-white mb-2" data-testid="variation-2-title">
                          Variation 2 - Professional
                        </h5>
                        <p className="text-sm text-gray-700 dark:text-gray-300" data-testid="variation-2-content">
                          We are pleased to introduce our latest innovation, designed to enhance productivity and streamline workflows...
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="image" className="mt-4" data-testid="content-image">
                  <div className="text-center py-12">
                    <Image className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Image Generation
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Generate AI-powered images to accompany your content
                    </p>
                    <Button data-testid="button-generate-image">Generate Images</Button>
                  </div>
                </TabsContent>

                <TabsContent value="video" className="mt-4" data-testid="content-video">
                  <div className="text-center py-12">
                    <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Video Generation
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Create engaging video content from your text
                    </p>
                    <Button data-testid="button-generate-video">Generate Video</Button>
                  </div>
                </TabsContent>

                <TabsContent value="audio" className="mt-4" data-testid="content-audio">
                  <div className="text-center py-12">
                    <Mic className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Audio Generation
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Convert your content to natural-sounding speech
                    </p>
                    <Button data-testid="button-generate-audio">Generate Audio</Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}