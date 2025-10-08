import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, CheckCircle, AlertTriangle, ExternalLink, FileText, Scale, Shield, Video, Zap } from 'lucide-react';

const CompliancePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-8">

        {/* Header */}
        <div className="text-center space-y-4">
          <Link href="/">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>

          <div className="space-y-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Video className="h-3 w-3 mr-1" />
              Social Media Content Compliant
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900">
              Pheme Compliance Center
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Your complete guide to content creation compliance and AI-generated content best practices
            </p>
          </div>
        </div>

        {/* Compliance Status */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center text-green-800">
              <CheckCircle className="h-5 w-5 mr-2" />
              Pheme Content Compliance Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">AI content disclosure implemented</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Social Media hashtag compliance active</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Content length limits enforced</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Viral score analysis integrated</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Content Disclosure */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              AI-Generated Content Disclosure
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Zap className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-800 mb-2">Important AI Content Notice</h4>
                  <p className="text-sm text-blue-700 mb-2">
                    Pheme uses advanced AI technology (Claude AI) to generate content suggestions. All content is AI-generated and should be reviewed before posting.
                  </p>
                  <p className="text-sm text-blue-700 font-medium">
                    ⚠️ AI-generated content outputs are probabilistic and not guaranteed to go viral or achieve specific engagement rates.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* TikTok Content Guidelines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Video className="h-5 w-5 mr-2" />
              Pheme Content Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-800 mb-2">Pheme Content Requirements</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Content must be original and engaging</li>
                    <li>• Follow social media Community Guidelines</li>
                    <li>• Respect copyright and intellectual property</li>
                    <li>• Use appropriate hashtags for content discovery</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold">Content Best Practices:</h4>
                <ul className="text-sm space-y-1">
                  <li>• <strong>Length:</strong> Keep content concise and engaging</li>
                  <li>• <strong>Hashtags:</strong> Use relevant trending hashtags</li>
                  <li>• <strong>Timing:</strong> Post when your audience is most active</li>
                  <li>• <strong>Authenticity:</strong> Be genuine and relatable</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Pheme Features:</h4>
                <ul className="text-sm space-y-1">
                  <li>• AI-powered content generation</li>
                  <li>• Viral score analysis for optimization</li>
                  <li>• Content history and performance tracking</li>
                  <li>• Template-based content creation</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pheme AI Content Generation System */}
        <Card>
          <CardHeader>
            <CardTitle>Pheme AI Content Generation System</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Pheme uses advanced AI technology to create engaging content with built-in viral score analysis:
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-3">Claude AI-Powered Content Creation</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <strong className="text-blue-700">Content Generation:</strong>
                  <ul className="text-sm text-blue-600 mt-1 space-y-1">
                    <li>• Claude AI for high-quality content</li>
                    <li>• Niche-specific content templates</li>
                    <li>• Viral score analysis and optimization</li>
                    <li>• Content length optimization</li>
                    <li>• Trending hashtag integration</li>
                  </ul>
                </div>
                <div>
                  <strong className="text-blue-700">Smart Features:</strong>
                  <ul className="text-sm text-blue-600 mt-1 space-y-1">
                    <li>• Dual AI evaluation system</li>
                    <li>• Content history and analytics</li>
                    <li>• Performance tracking and ratings</li>
                    <li>• Template-based generation</li>
                    <li>• Real-time viral score calculation</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">Example Content Formats:</h4>
              <div className="space-y-2">
                <div className="bg-gray-100 rounded p-3">
                  <strong className="text-sm">Beauty Niche Example:</strong>
                  <p className="text-sm mt-1">"This skincare routine changed EVERYTHING! ✨ 3 simple steps for glowing skin. Who else is obsessed with that glow? #skincare #glowup #beautyTips"</p>
                </div>
                <div className="bg-gray-100 rounded p-3">
                  <strong className="text-sm">Tech Niche Example:</strong>
                  <p className="text-sm mt-1">"POV: You finally found the perfect headphones 🎧 Sound quality is UNREAL! Game changer for productivity. #tech #productivity #headphones"</p>
                </div>
                <div className="bg-gray-100 rounded p-3">
                  <strong className="text-sm">Fitness Niche Example:</strong>
                  <p className="text-sm mt-1">"This 5-minute morning routine hits different 💪 Energy levels through the roof! Try it and tell me how you feel. #fitness #morningroutine #energy"</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Processing & Privacy */}
        <Card>
          <CardHeader>
            <CardTitle>Data Processing & Privacy Protection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-semibold text-purple-800 mb-3">Pheme Technology Stack</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <strong className="text-purple-700">AI Technology:</strong>
                  <ul className="text-sm text-purple-600 mt-1 space-y-1">
                    <li>• Claude AI for content generation</li>
                    <li>• Viral score analysis algorithms</li>
                    <li>• Content quality assessment</li>
                    <li>• Template-based generation system</li>
                  </ul>
                </div>
                <div>
                  <strong className="text-purple-700">Privacy Features:</strong>
                  <ul className="text-sm text-purple-600 mt-1 space-y-1">
                    <li>• Secure content storage</li>
                    <li>• User data protection</li>
                    <li>• No personal data sharing</li>
                    <li>• Transparent content tracking</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">Data Processing Transparency:</h4>
              <ul className="text-sm space-y-1">
                <li>• All generated content is stored with timestamps and viral scores</li>
                <li>• User ratings help improve content recommendations</li>
                <li>• No personal information is required for content generation</li>
                <li>• Content history helps track performance and optimization</li>
                <li>• All AI interactions are logged for quality assurance</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Resources & Documentation */}
        <Card>
          <CardHeader>
            <CardTitle>Resources & Platform Guidelines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-semibold">Pheme Guidelines:</h4>
                <div className="space-y-2">
                  <a
                    href="https://www.tiktok.com/community-guidelines"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <ExternalLink className="h-3 w-3 mr-2" />
                    Pheme Community Guidelines
                  </a>
                  <a
                    href="https://www.tiktok.com/creators/creator-portal/en-us/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <ExternalLink className="h-3 w-3 mr-2" />
                    Pheme Creator Portal
                  </a>
                  <a
                    href="https://support.tiktok.com/en/safety-hc/report-a-problem"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <ExternalLink className="h-3 w-3 mr-2" />
                    Pheme Safety Guidelines
                  </a>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">AI Content Guidelines:</h4>
                <div className="space-y-2">
                  <a
                    href="https://www.anthropic.com/safety"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <ExternalLink className="h-3 w-3 mr-2" />
                    Claude AI Safety Guidelines
                  </a>
                  <a
                    href="https://www.ftc.gov/business-guidance/resources/disclosures-101-social-media-influencers"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <ExternalLink className="h-3 w-3 mr-2" />
                    Social Media Content Guidelines
                  </a>
                  <Link href="/trust-and-safety">
                    <span className="flex items-center text-blue-600 hover:text-blue-800 text-sm cursor-pointer">
                      <ExternalLink className="h-3 w-3 mr-2" />
                      Pheme Trust & Safety
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact & Support */}
        <Card className="bg-gray-900 text-white">
          <CardContent className="text-center py-8">
            <h3 className="text-2xl md:text-3xl font-semibold mb-2">Ready to Create Viral Content?</h3>
            <p className="text-gray-300 mb-4">
              Pheme helps you create engaging content with AI-powered viral score analysis.
            </p>
            <Link href="/generate">
              <Button variant="secondary" size="lg">
                Start Creating Viral Content
              </Button>
            </Link>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default CompliancePage;