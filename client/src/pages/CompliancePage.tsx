import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, CheckCircle, AlertTriangle, ExternalLink, FileText, Scale, Shield } from 'lucide-react';
// import { AmazonAssociatesDisclosure } from '@/components/AmazonAssociatesDisclosure'; // DISABLED: Amazon Associates functionality disabled

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
              <Shield className="h-3 w-3 mr-1" />
              FTC & Amazon Associates Compliant
            </Badge>
            <h1 className="text-4xl font-bold text-gray-900">
              Affiliate Marketing Compliance Center
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Your complete guide to FTC-compliant affiliate marketing and Amazon Associates Program requirements
            </p>
          </div>
        </div>

        {/* Compliance Status */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center text-green-800">
              <CheckCircle className="h-5 w-5 mr-2" />
              Platform Compliance Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">FTC disclosure requirements implemented</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Amazon Associates disclosures active</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Content labeling system operational</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Automated compliance wrapper integrated</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Amazon Associates Disclosure */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Amazon Associates Program Disclosure
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* <AmazonAssociatesDisclosure /> */} {/* DISABLED: Amazon Associates functionality disabled */}
          </CardContent>
        </Card>

        {/* FTC Guidelines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Scale className="h-5 w-5 mr-2" />
              FTC Disclosure Requirements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-800 mb-2">Required Disclosures</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• All affiliate relationships must be clearly disclosed</li>
                    <li>• Disclosures must be "clear and conspicuous"</li>
                    <li>• Disclosures must be placed near affiliate links</li>
                    <li>• Social media posts must include #ad or #affiliate hashtags</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold">Platform-Specific Requirements:</h4>
                <ul className="text-sm space-y-1">
                  <li>• <strong>TikTok:</strong> Include #ad or #affiliate in caption</li>
                  <li>• <strong>Instagram:</strong> Use "Paid partnership" or #ad</li>
                  <li>• <strong>YouTube:</strong> Verbal and written disclosure required</li>
                  <li>• <strong>Twitter/X:</strong> #ad hashtag in prominent position</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold">Best Practices:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Place disclosures at the beginning of content</li>
                  <li>• Use clear language like "I earn from qualifying purchases"</li>
                  <li>• Ensure disclosures are visible without scrolling</li>
                  <li>• Test disclosures on mobile devices</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Advanced AI System Compliance */}
        <Card>
          <CardHeader>
            <CardTitle>Advanced AI Content Generation & Compliance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Our sophisticated AI system ensures comprehensive compliance across all content generation features:
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-3">Claude AI-Powered Compliance System</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <strong className="text-blue-700">Content Generation:</strong>
                  <ul className="text-sm text-blue-600 mt-1 space-y-1">
                    <li>• Claude AI primary generation with automatic disclosures</li>
                    <li>• Platform-specific compliance language (TikTok, Instagram, YouTube, Twitter)</li>
                    <li>• Spartan format option for professional tone enforcement</li>
                    <li>• Automated bulk generation with compliance across all content</li>
                    <li>• Smart Style recommendations from your highest-rated compliant content</li>
                  </ul>
                </div>
                <div>
                  <strong className="text-blue-700">Advanced Features:</strong>
                  <ul className="text-sm text-blue-600 mt-1 space-y-1">
                    <li>• Dual AI evaluation system for quality assurance</li>
                    <li>• Claude AI suggestions database for optimization</li>
                    <li>• Scheduled generation with maintained compliance</li>
                    <li>• Perplexity API integration for trending products</li>
                    <li>• Comprehensive content history and analytics</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">Platform-Specific Compliant Disclosures (Auto-Generated):</h4>
              <div className="space-y-2">
                <div className="bg-gray-100 rounded p-3">
                  <strong className="text-sm">TikTok (60 words max):</strong>
                  <p className="text-sm mt-1">"This amazing product is trending! As an Amazon Associate I earn from qualifying purchases. #ad #affiliate"</p>
                </div>
                <div className="bg-gray-100 rounded p-3">
                  <strong className="text-sm">Instagram (80 words max):</strong>
                  <p className="text-sm mt-1">"Loving this find! Quality is incredible and shipping was super fast. As an Amazon Associate I earn from qualifying purchases. Link in bio! #affiliate #ad"</p>
                </div>
                <div className="bg-gray-100 rounded p-3">
                  <strong className="text-sm">YouTube (100 words max):</strong>
                  <p className="text-sm mt-1">"This video contains affiliate links. I earn a commission from qualifying purchases at no extra cost to you. All opinions are my own and based on personal experience."</p>
                </div>
                <div className="bg-gray-100 rounded p-3">
                  <strong className="text-sm">Twitter (40 words max):</strong>
                  <p className="text-sm mt-1">"Found the perfect product! As an Amazon Associate I earn from qualifying purchases. #ad"</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Technology Compliance */}
        <Card>
          <CardHeader>
            <CardTitle>AI Technology & Data Processing Compliance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-semibold text-purple-800 mb-3">Our AI Technology Stack</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <strong className="text-purple-700">Primary AI Models:</strong>
                  <ul className="text-sm text-purple-600 mt-1 space-y-1">
                    <li>• Claude AI: Content generation and suggestions</li>
                    <li>• Perplexity API: Trend discovery and viral insights</li>
                    <li>• Dual evaluation system for quality assurance</li>
                    <li>• Smart Style learning from your best content</li>
                  </ul>
                </div>
                <div>
                  <strong className="text-purple-700">Compliance Features:</strong>
                  <ul className="text-sm text-purple-600 mt-1 space-y-1">
                    <li>• Automatic FTC disclosure integration</li>
                    <li>• Platform-specific word limits enforced</li>
                    <li>• Content evaluation and rating systems</li>
                    <li>• Comprehensive audit trails and history</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">Data Processing Transparency:</h4>
              <ul className="text-sm space-y-1">
                <li>• All content generation is logged with timestamps and AI model attribution</li>
                <li>• User ratings and feedback improve future content recommendations</li>
                <li>• Trending product data refreshed automatically via Perplexity API</li>
                <li>• Claude AI suggestions database continuously optimized from high-rated content</li>
                <li>• Scheduled generation maintains same compliance standards as manual generation</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Legal Resources */}
        <Card>
          <CardHeader>
            <CardTitle>Legal Resources & Documentation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-semibold">Official Guidelines:</h4>
                <div className="space-y-2">
                  <a 
                    href="https://www.ftc.gov/tips-advice/business-center/guidance/ftcs-endorsement-guides-what-people-are-asking"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <ExternalLink className="h-3 w-3 mr-2" />
                    FTC Endorsement Guidelines
                  </a>
                  <a 
                    href="https://affiliate-program.amazon.com/help/operating/agreement"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <ExternalLink className="h-3 w-3 mr-2" />
                    Amazon Associates Operating Agreement
                  </a>
                  <a 
                    href="https://www.ftc.gov/business-guidance/resources/disclosures-101-social-media-influencers"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <ExternalLink className="h-3 w-3 mr-2" />
                    FTC Social Media Disclosure Guidelines
                  </a>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold">Platform Policies:</h4>
                <div className="space-y-2">
                  <a 
                    href="https://help.instagram.com/269983657173406"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <ExternalLink className="h-3 w-3 mr-2" />
                    Instagram Branded Content Policies
                  </a>
                  <a 
                    href="https://support.google.com/youtube/answer/154235"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <ExternalLink className="h-3 w-3 mr-2" />
                    YouTube Paid Promotion Guidelines
                  </a>
                  <a 
                    href="https://business.twitter.com/en/help/ads-policies/restricted-content-policies/political-content.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <ExternalLink className="h-3 w-3 mr-2" />
                    Twitter/X Advertising Policies
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact & Support */}
        <Card className="bg-gray-900 text-white">
          <CardContent className="text-center py-8">
            <h3 className="text-xl font-semibold mb-2">Need Compliance Support?</h3>
            <p className="text-gray-300 mb-4">
              Our platform is designed to help you stay compliant with all affiliate marketing regulations.
            </p>
            <Link href="/unified-generator">
              <Button variant="secondary" size="lg">
                Start Creating Compliant Content
              </Button>
            </Link>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default CompliancePage;