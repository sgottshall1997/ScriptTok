import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Shield, Eye, Cookie, Download, Trash2, Settings } from 'lucide-react';

const PrivacyCookiesPage: React.FC = () => {
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
            <h1 className="text-4xl font-bold text-gray-900">
              Privacy Policy & Cookies
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              How Pheme collects, uses, and protects your personal information and data
            </p>
            <p className="text-sm text-gray-500">
              Last updated: September 26, 2025
            </p>
          </div>
        </div>

        {/* Privacy Commitment */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center text-green-800">
              <Shield className="h-5 w-5 mr-2" />
              Our Privacy Commitment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-700">
              Pheme is committed to protecting your privacy. We believe in transparency about how we collect, 
              use, and share your information. This policy explains our practices in clear, understandable terms.
            </p>
          </CardContent>
        </Card>

        {/* Information We Collect */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="h-5 w-5 mr-2" />
              Information We Collect
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Information You Provide</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li><strong>Account Information:</strong> Email address, username, password</li>
                <li><strong>Profile Information:</strong> Display name, preferences, settings</li>
                <li><strong>Content Data:</strong> TikTok content you generate, ratings, and feedback</li>
                <li><strong>Communication:</strong> Messages you send through our contact forms</li>
                <li><strong>Payment Information:</strong> Billing details for subscription services</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Information We Collect Automatically</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li><strong>Usage Data:</strong> How you interact with ScriptTok features</li>
                <li><strong>Device Information:</strong> Browser type, operating system, IP address</li>
                <li><strong>Performance Data:</strong> Page load times, error logs, feature usage</li>
                <li><strong>Analytics:</strong> Aggregated usage patterns and trends</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">AI-Related Data Collection</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li><strong>Content Generation:</strong> Prompts, templates, and AI-generated content</li>
                <li><strong>Viral Scores:</strong> Analysis results and optimization data</li>
                <li><strong>Usage Patterns:</strong> Which AI features and templates you use</li>
                <li><strong>Performance Feedback:</strong> Content ratings and success metrics</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* How We Use Information */}
        <Card>
          <CardHeader>
            <CardTitle>How We Use Your Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Service Provision</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Generate TikTok content using Claude AI technology</li>
                <li>Provide viral score analysis and optimization recommendations</li>
                <li>Maintain your content history and performance tracking</li>
                <li>Process payments and manage subscriptions</li>
                <li>Provide customer support and technical assistance</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Service Improvement</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Analyze usage patterns to improve AI generation quality</li>
                <li>Optimize viral score algorithms based on performance data</li>
                <li>Develop new features and templates</li>
                <li>Fix bugs and enhance user experience</li>
                <li>Conduct research for platform improvements</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Communication</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Send important service updates and security notifications</li>
                <li>Respond to your questions and support requests</li>
                <li>Provide tips and best practices for content creation</li>
                <li>Send optional marketing communications (with your consent)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Information Sharing */}
        <Card>
          <CardHeader>
            <CardTitle>Information Sharing & Disclosure</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">We Do Not Sell Your Personal Information</h3>
              <p className="text-gray-700 mb-4">
                Pheme does not sell, rent, or trade your personal information to third parties for monetary gain.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Limited Sharing</h3>
              <p className="text-gray-700 mb-3">We may share information in these specific circumstances:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li><strong>Service Providers:</strong> Claude AI for content generation, payment processors</li>
                <li><strong>Legal Requirements:</strong> When required by law or legal process</li>
                <li><strong>Safety & Security:</strong> To protect rights, property, or safety</li>
                <li><strong>Business Transfers:</strong> In case of merger, acquisition, or asset sale</li>
                <li><strong>Consent:</strong> When you explicitly consent to sharing</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">AI Partner Disclosure</h3>
              <p className="text-gray-700 mb-3">
                Pheme uses Claude AI by Anthropic for content generation. When you generate content:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Your prompts are sent to Claude AI for processing</li>
                <li>Claude AI generates content based on your inputs</li>
                <li>We do not store your prompts with Claude AI beyond the generation session</li>
                <li>Generated content is returned to you and stored in your Pheme account</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Your Privacy Rights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">GDPR Rights (EU Users)</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Rectification:</strong> Correct inaccurate or incomplete data</li>
                <li><strong>Erasure:</strong> Request deletion of your personal data</li>
                <li><strong>Portability:</strong> Export your data in a machine-readable format</li>
                <li><strong>Restriction:</strong> Limit how we process your data</li>
                <li><strong>Objection:</strong> Object to processing based on legitimate interests</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">CCPA Rights (California Users)</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li><strong>Know:</strong> What personal information we collect and how it's used</li>
                <li><strong>Delete:</strong> Request deletion of your personal information</li>
                <li><strong>Opt-Out:</strong> Opt out of the sale of personal information (we don't sell)</li>
                <li><strong>Non-Discrimination:</strong> Equal service regardless of privacy choices</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Exercising Your Rights</h3>
              <p className="text-gray-700 mb-3">
                To exercise any of these rights, contact us at shallsdigital@gmail.com or use our contact form. 
                We'll respond within 30 days and may ask for verification of your identity.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Cookie Policy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Cookie className="h-5 w-5 mr-2" />
              Cookie Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">What Are Cookies?</h3>
              <p className="text-gray-700 mb-4">
                Cookies are small text files stored on your device when you visit websites. They help us provide 
                a better user experience and analyze how our service is used.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Types of Cookies We Use</h3>
              
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Essential Cookies (Required)</h4>
                  <p className="text-sm text-blue-700 mb-2">
                    These cookies are necessary for the website to function properly.
                  </p>
                  <ul className="text-sm text-blue-600 list-disc pl-4">
                    <li>Authentication and session management</li>
                    <li>Security and fraud prevention</li>
                    <li>Basic functionality and navigation</li>
                  </ul>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">Functional Cookies (Optional)</h4>
                  <p className="text-sm text-green-700 mb-2">
                    These cookies enhance your experience but are not required.
                  </p>
                  <ul className="text-sm text-green-600 list-disc pl-4">
                    <li>Remember your preferences and settings</li>
                    <li>Personalize content recommendations</li>
                    <li>Language and region preferences</li>
                  </ul>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-800 mb-2">Analytics Cookies (Optional)</h4>
                  <p className="text-sm text-purple-700 mb-2">
                    These cookies help us understand how you use our service.
                  </p>
                  <ul className="text-sm text-purple-600 list-disc pl-4">
                    <li>Track page views and user interactions</li>
                    <li>Analyze feature usage and performance</li>
                    <li>Improve user experience based on data</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Managing Cookies</h3>
              <p className="text-gray-700 mb-3">
                You can control cookies through your browser settings and our cookie preferences:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Use our Cookie Preferences tool to opt-out of non-essential cookies</li>
                <li>Configure your browser to block or delete cookies</li>
                <li>Note that disabling essential cookies may affect site functionality</li>
              </ul>
              
              <div className="mt-4">
                <Link href="/cookie-preferences">
                  <Button variant="outline" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    Manage Cookie Preferences
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Data Security & Retention
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Security Measures</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Access controls and authentication requirements</li>
                <li>Secure payment processing through trusted providers</li>
                <li>Regular backup and disaster recovery procedures</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Data Retention</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Account data: Retained while your account is active</li>
                <li>Generated content: Stored in your content history indefinitely</li>
                <li>Usage analytics: Retained for up to 2 years</li>
                <li>Support communications: Retained for up to 3 years</li>
                <li>Payment records: Retained as required by law</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Data Deletion</h3>
              <p className="text-gray-700 mb-3">
                When you delete your account or request data deletion:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Personal information is deleted within 30 days</li>
                <li>Generated content is permanently removed</li>
                <li>Some data may be retained for legal or security purposes</li>
                <li>Anonymized analytics data may be retained</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Children's Privacy */}
        <Card>
          <CardHeader>
            <CardTitle>Children's Privacy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              ScriptTok is not intended for children under 13 years of age. We do not knowingly collect 
              personal information from children under 13. If you are a parent or guardian and believe 
              your child has provided personal information, please contact us immediately.
            </p>
            <p className="text-gray-700">
              Users between 13-18 years old should obtain parental consent before using ScriptTok.
            </p>
          </CardContent>
        </Card>

        {/* International Transfers */}
        <Card>
          <CardHeader>
            <CardTitle>International Data Transfers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              ScriptTok operates globally and may transfer your information to countries other than your own. 
              We ensure appropriate safeguards are in place for international transfers, including:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>Standard contractual clauses for EU data transfers</li>
              <li>Adequacy decisions by relevant data protection authorities</li>
              <li>Other approved transfer mechanisms as required</li>
            </ul>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="bg-gray-900 text-white">
          <CardContent className="text-center py-8">
            <h3 className="text-xl font-semibold mb-2">Privacy Questions or Concerns?</h3>
            <p className="text-gray-300 mb-4">
              Contact our privacy team for questions about this policy or to exercise your privacy rights.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/contact">
                <Button variant="secondary" size="lg">
                  Contact Privacy Team
                </Button>
              </Link>
              <Link href="/cookie-preferences">
                <Button variant="outline" size="lg" className="text-gray-300 border-gray-600 hover:bg-gray-800">
                  <Settings className="mr-2 h-4 w-4" />
                  Cookie Preferences
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default PrivacyCookiesPage;