import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Shield, Eye, Users, AlertTriangle, Zap, Heart, Globe } from 'lucide-react';

const TrustSafetyPage: React.FC = () => {
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
              Trust & Safety
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Accessibility, AI transparency, safety guidelines, and community standards for ScriptTok
            </p>
            <p className="text-sm text-gray-500">
              Last updated: September 26, 2025
            </p>
          </div>
        </div>

        {/* Trust & Safety Commitment */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center text-green-800">
              <Shield className="h-5 w-5 mr-2" />
              Our Commitment to Trust & Safety
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-700">
              ScriptTok is committed to creating a safe, accessible, and trustworthy platform for all users. 
              We believe in transparency, responsible AI use, and maintaining the highest standards of digital safety.
            </p>
          </CardContent>
        </Card>

        {/* Accessibility Statement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="h-5 w-5 mr-2" />
              Accessibility Statement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Our Accessibility Commitment</h3>
              <p className="text-gray-700 mb-4">
                ScriptTok is committed to ensuring digital accessibility for all users, including those with disabilities. 
                We strive to continually improve the user experience for everyone and apply relevant accessibility standards.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Web Content Accessibility Guidelines (WCAG) Compliance</h3>
              <p className="text-gray-700 mb-3">
                We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li><strong>Perceivable:</strong> Content is presented in ways users can perceive</li>
                <li><strong>Operable:</strong> Interface components are operable by all users</li>
                <li><strong>Understandable:</strong> Information and UI operation are understandable</li>
                <li><strong>Robust:</strong> Content works with various assistive technologies</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Accessibility Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Visual Accessibility</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>High contrast color schemes</li>
                    <li>Scalable fonts and UI elements</li>
                    <li>Alternative text for images</li>
                    <li>Clear visual focus indicators</li>
                  </ul>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">Navigation & Interaction</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>Keyboard navigation support</li>
                    <li>Logical tab order and structure</li>
                    <li>Clear headings and landmarks</li>
                    <li>Descriptive link text</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Assistive Technology Support</h3>
              <p className="text-gray-700 mb-3">
                Pheme is designed to work with common assistive technologies including:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Screen readers (NVDA, JAWS, VoiceOver)</li>
                <li>Voice recognition software</li>
                <li>Screen magnification tools</li>
                <li>Switch navigation devices</li>
                <li>Keyboard-only navigation</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Ongoing Improvements</h3>
              <p className="text-gray-700 mb-3">
                We continuously work to improve accessibility through:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Regular accessibility audits and testing</li>
                <li>User feedback and accessibility reviews</li>
                <li>Training our development team on accessibility best practices</li>
                <li>Incorporating accessibility in our design and development process</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Accessibility Feedback</h3>
              <p className="text-gray-700">
                If you encounter accessibility barriers while using ScriptTok, please contact us at 
                shallsdigital@gmail.com with "Accessibility" in the subject line. We take all feedback 
                seriously and will work to address issues promptly.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* AI Transparency & Disclosure */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              AI Transparency & Disclosure
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-800 mb-2">Important AI Content Disclosure</h4>
                  <p className="text-sm text-yellow-700">
                    ⚠️ <strong>AI-generated content outputs are probabilistic and not guaranteed to go viral</strong> 
                    or achieve specific engagement rates. All content generated by ScriptTok uses artificial intelligence 
                    and should be reviewed, customized, and validated before use.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">How Our AI Works</h3>
              <p className="text-gray-700 mb-3">
                Pheme uses advanced AI technology to help create TikTok content:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li><strong>Claude AI by Anthropic:</strong> Powers our content generation capabilities</li>
                <li><strong>Viral Score Analysis:</strong> Algorithmic analysis of content engagement potential</li>
                <li><strong>Template System:</strong> Structured approaches for different content types</li>
                <li><strong>Niche Optimization:</strong> Specialized algorithms for different market segments</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">AI Limitations & Considerations</h3>
              <div className="space-y-3">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 mb-2">No Guarantees</h4>
                  <p className="text-sm text-red-700">
                    AI-generated content is based on patterns and probabilities. We cannot guarantee viral success, 
                    specific engagement rates, or performance outcomes.
                  </p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-800 mb-2">Human Review Required</h4>
                  <p className="text-sm text-purple-700">
                    Always review and customize AI-generated content before publishing. Ensure accuracy, 
                    appropriateness, and alignment with your brand voice.
                  </p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Originality Considerations</h4>
                  <p className="text-sm text-blue-700">
                    While our AI generates original content, similarities to existing content may occur. 
                    Users are responsible for ensuring content compliance and originality.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Responsible AI Use Guidelines</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Always disclose AI assistance when appropriate or required</li>
                <li>Review all generated content for accuracy and appropriateness</li>
                <li>Customize content to match your authentic voice and brand</li>
                <li>Respect intellectual property and copyright considerations</li>
                <li>Follow platform-specific guidelines for AI-generated content</li>
                <li>Consider your audience and community standards</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Age Restrictions & Parental Consent */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Age Restrictions & Parental Consent
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Minimum Age Requirements</h3>
              <p className="text-gray-700 mb-4">
                ScriptTok has specific age requirements to ensure compliance with privacy laws and create 
                an appropriate environment for content creation:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 mb-2">Under 13 Years Old</h4>
                  <p className="text-sm text-red-700">
                    <strong>Not Permitted:</strong> ScriptTok is not intended for children under 13. 
                    We do not knowingly collect information from children under 13.
                  </p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">13-17 Years Old</h4>
                  <p className="text-sm text-yellow-700">
                    <strong>Parental Consent Required:</strong> Users between 13-17 should obtain 
                    parental consent before using ScriptTok.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Parental Guidance for Teen Users</h3>
              <p className="text-gray-700 mb-3">
                We recommend parents and guardians:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Review the content their teens plan to create and share</li>
                <li>Discuss responsible social media use and online safety</li>
                <li>Monitor their teen's use of AI-generated content</li>
                <li>Understand TikTok's Community Guidelines and safety features</li>
                <li>Encourage creativity while maintaining appropriate boundaries</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Content Safety for Young Creators</h3>
              <p className="text-gray-700 mb-3">
                For users under 18, we especially emphasize:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Never share personal information in generated content</li>
                <li>Avoid content that could be used to identify location or school</li>
                <li>Focus on creative, educational, or entertainment content</li>
                <li>Report any inappropriate content or interactions</li>
                <li>Understand that AI-generated content should always be reviewed</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Content Safety Guidelines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Heart className="h-5 w-5 mr-2" />
              Content Safety Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">TikTok Content Safety</h3>
              <p className="text-gray-700 mb-4">
                ScriptTok helps you create content that aligns with TikTok's Community Guidelines and promotes 
                a positive, safe environment for all users.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Prohibited Content Types</h3>
              <p className="text-gray-700 mb-3">
                ScriptTok's AI systems are designed to avoid generating content that includes:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <ul className="list-disc pl-6 text-gray-700 space-y-1">
                    <li>Harmful or dangerous activities</li>
                    <li>Harassment or bullying content</li>
                    <li>Hate speech or discriminatory language</li>
                    <li>Misinformation or false claims</li>
                    <li>Adult content or sexual material</li>
                  </ul>
                </div>
                <div>
                  <ul className="list-disc pl-6 text-gray-700 space-y-1">
                    <li>Violence or graphic content</li>
                    <li>Copyright-infringing material</li>
                    <li>Spam or deceptive practices</li>
                    <li>Illegal activities or substances</li>
                    <li>Personal attacks or doxxing</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Promoting Positive Content</h3>
              <p className="text-gray-700 mb-3">
                We encourage content that:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Inspires creativity and authentic self-expression</li>
                <li>Shares knowledge, skills, or positive experiences</li>
                <li>Builds community and connects people</li>
                <li>Promotes wellness, learning, or entertainment</li>
                <li>Celebrates diversity and inclusivity</li>
                <li>Follows ethical guidelines for AI-generated content</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Content Moderation</h3>
              <p className="text-gray-700 mb-3">
                Our content safety measures include:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>AI content filtering to prevent harmful outputs</li>
                <li>Community reporting mechanisms</li>
                <li>Regular review of generated content patterns</li>
                <li>Continuous improvement of safety algorithms</li>
                <li>Collaboration with platform safety experts</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Digital Wellbeing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="h-5 w-5 mr-2" />
              Digital Wellbeing & Responsible Use
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Promoting Digital Wellbeing</h3>
              <p className="text-gray-700 mb-4">
                ScriptTok supports healthy digital habits and responsible content creation:
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Healthy Content Creation Habits</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Take regular breaks from content creation and social media</li>
                <li>Focus on quality over quantity in your content</li>
                <li>Remember that engagement metrics don't define your worth</li>
                <li>Use AI as a tool to enhance creativity, not replace authentic expression</li>
                <li>Maintain a balance between online and offline activities</li>
                <li>Seek support if social media impacts your mental health</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Authenticity in the AI Age</h3>
              <p className="text-gray-700 mb-3">
                While AI can help with content creation, we encourage users to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Maintain your authentic voice and personality</li>
                <li>Use AI-generated content as inspiration, not replacement</li>
                <li>Share your genuine experiences and perspectives</li>
                <li>Be transparent about AI assistance when appropriate</li>
                <li>Build real connections with your audience</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Mental Health Resources</h3>
              <p className="text-gray-700 mb-3">
                If you're struggling with digital wellbeing or mental health:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Reach out to trusted friends, family, or mental health professionals</li>
                <li>Consider digital detox periods or usage limits</li>
                <li>Focus on content that brings you joy and fulfillment</li>
                <li>Remember that social media is just one part of life</li>
                <li>Seek professional help if needed</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Community Standards */}
        <Card>
          <CardHeader>
            <CardTitle>Community Standards & Reporting</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Building a Positive Community</h3>
              <p className="text-gray-700 mb-4">
                ScriptTok users are expected to contribute to a positive, inclusive environment that 
                supports creativity and learning while maintaining safety and respect for all.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Reporting Concerns</h3>
              <p className="text-gray-700 mb-3">
                If you encounter content or behavior that violates our community standards:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Report inappropriate content through our contact form</li>
                <li>Provide specific details about the issue</li>
                <li>Include relevant screenshots or documentation</li>
                <li>Allow time for our team to investigate and respond</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Enforcement Actions</h3>
              <p className="text-gray-700 mb-3">
                Violations of our community standards may result in:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Content removal or restriction</li>
                <li>Account warnings or temporary suspensions</li>
                <li>Permanent account termination for severe violations</li>
                <li>Reporting to law enforcement when required</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Contact Trust & Safety Team */}
        <Card className="bg-gray-900 text-white">
          <CardContent className="text-center py-8">
            <h3 className="text-xl font-semibold mb-2">Trust & Safety Support</h3>
            <p className="text-gray-300 mb-4">
              Have questions about accessibility, safety, or need to report a concern? 
              Our Trust & Safety team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a href="mailto:shallsdigital@gmail.com?subject=Accessibility%20Support">
                <Button variant="secondary" size="lg">
                  <Eye className="mr-2 h-4 w-4" />
                  Accessibility Support
                </Button>
              </a>
              <a href="mailto:shallsdigital@gmail.com?subject=Safety%20Report">
                <Button variant="outline" size="lg" className="text-gray-300 border-gray-600 hover:bg-gray-800">
                  <Shield className="mr-2 h-4 w-4" />
                  Report Safety Concern
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default TrustSafetyPage;