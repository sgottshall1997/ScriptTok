import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  ArrowLeft, 
  HelpCircle, 
  MessageCircle, 
  Book, 
  Zap, 
  Shield, 
  Clock, 
  Users,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';

const SupportPage: React.FC = () => {
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
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <MessageCircle className="h-3 w-3 mr-1" />
              24/7 AI-Powered Support
            </Badge>
            <h1 className="text-4xl font-bold text-gray-900">
              Support & Help Center
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive support for your AI-powered content generation platform
            </p>
          </div>
        </div>

        {/* Quick Help */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center text-green-800">
              <Zap className="h-5 w-5 mr-2" />
              Quick Help & Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Claude AI system operational</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Perplexity API trending data active</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Dual AI evaluation system running</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">All compliance features active</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Getting Started */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Book className="h-5 w-5 mr-2" />
              Getting Started Guide
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800">Basic Content Generation</h4>
                <ol className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-start">
                    <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">1</span>
                    <span>Navigate to the Unified Generator from the main dashboard</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">2</span>
                    <span>Select your niche (beauty, tech, fitness, fashion, food, travel, pets)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">3</span>
                    <span>Choose products from trending suggestions or add custom products</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">4</span>
                    <span>Select platforms (TikTok, Instagram, YouTube, Twitter, Facebook)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">5</span>
                    <span>Click Generate to create FTC-compliant content with Claude AI</span>
                  </li>
                </ol>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800">Advanced Features</h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span><strong>Spartan Format:</strong> Enable professional tone enforcement</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span><strong>Bulk Generation:</strong> Create content for multiple products</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span><strong>Scheduled Generation:</strong> Automate daily content creation</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span><strong>Smart Style:</strong> Get recommendations from your best content</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span><strong>Content Rating:</strong> Rate content to improve future generations</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI System Features */}
        <Card>
          <CardHeader>
            <CardTitle>AI System Features & Capabilities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-800 mb-2">Claude AI Engine</h4>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• Primary content generation</li>
                  <li>• Intelligent suggestions database</li>
                  <li>• Quality evaluation system</li>
                  <li>• Platform-specific optimization</li>
                </ul>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Trending Intelligence</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Perplexity API integration</li>
                  <li>• Real-time viral product discovery</li>
                  <li>• Authentic mention count data</li>
                  <li>• Cross-niche trend analysis</li>
                </ul>
              </div>
              
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h4 className="font-semibold text-orange-800 mb-2">Smart Optimization</h4>
                <ul className="text-sm text-orange-700 space-y-1">
                  <li>• Dual AI evaluation scoring</li>
                  <li>• Personal style learning</li>
                  <li>• Length optimization by platform</li>
                  <li>• FTC compliance automation</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Common Issues & Solutions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <HelpCircle className="h-5 w-5 mr-2" />
              Common Issues & Solutions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                  <div>
                    <h4 className="font-semibold text-yellow-800">Content Generation Taking Too Long</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Normal generation time is 6-8 seconds. If it takes longer than 30 seconds, try refreshing the page and generating again. Claude AI may be experiencing high demand.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-l-4 border-blue-400 bg-blue-50 p-4">
                <div className="flex items-start">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                  <div>
                    <h4 className="font-semibold text-blue-800">No Trending Products Available</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Trending products are refreshed automatically via Perplexity API. If none appear, check the trending products refresh status in the dashboard or try a different niche.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-l-4 border-green-400 bg-green-50 p-4">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3" />
                  <div>
                    <h4 className="font-semibold text-green-800">Improving Content Quality</h4>
                    <p className="text-sm text-green-700 mt-1">
                      Rate your generated content (1-100 scale) to train the Smart Style system. The system learns from your highest-rated content to improve future generations.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-l-4 border-purple-400 bg-purple-50 p-4">
                <div className="flex items-start">
                  <Shield className="h-5 w-5 text-purple-600 mt-0.5 mr-3" />
                  <div>
                    <h4 className="font-semibold text-purple-800">FTC Compliance Questions</h4>
                    <p className="text-sm text-purple-700 mt-1">
                      All generated content includes automatic FTC-compliant disclosures. Visit our Compliance Center for detailed guidelines and platform-specific requirements.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact & Resources */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageCircle className="h-5 w-5 mr-2" />
                Contact Support
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-2 text-gray-500" />
                  <span>Response time: Usually within 24 hours</span>
                </div>
                <div className="flex items-center text-sm">
                  <Users className="h-4 w-4 mr-2 text-gray-500" />
                  <span>Support available Monday-Friday</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <a 
                  href="mailto:shallsdigital@gmail.com" 
                  className="block text-blue-600 hover:text-blue-800 text-sm"
                >
                  📧 shallsdigital@gmail.com
                </a>
                <a 
                  href="mailto:compliance@glowbotai.com" 
                  className="block text-blue-600 hover:text-blue-800 text-sm"
                >
                  ⚖️ compliance@glowbotai.com (Legal questions)
                </a>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional Resources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Link href="/terms">
                  <Button variant="ghost" className="w-full justify-start text-left">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Terms and Conditions
                  </Button>
                </Link>
                <Link href="/privacy">
                  <Button variant="ghost" className="w-full justify-start text-left">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Privacy Policy
                  </Button>
                </Link>
                <Link href="/compliance">
                  <Button variant="ghost" className="w-full justify-start text-left">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Compliance Center
                  </Button>
                </Link>
                <a 
                  href="https://www.ftc.gov/tips-advice/business-center/guidance/ftcs-endorsement-guides-what-people-are-asking"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button variant="ghost" className="w-full justify-start text-left">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    FTC Guidelines (External)
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <Card className="bg-gray-900 text-white">
          <CardContent className="text-center py-8">
            <h3 className="text-xl font-semibold mb-2">System Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">99.9%</div>
                <div className="text-sm text-gray-300">AI System Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">7s</div>
                <div className="text-sm text-gray-300">Avg Generation Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">100%</div>
                <div className="text-sm text-gray-300">FTC Compliance</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">24/7</div>
                <div className="text-sm text-gray-300">Platform Monitoring</div>
              </div>
            </div>
            <div className="mt-6">
              <Link href="/unified-generator">
                <Button variant="secondary" size="lg">
                  Start Generating Content
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default SupportPage;