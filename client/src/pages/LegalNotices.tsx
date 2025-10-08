import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Scale, Shield, AlertTriangle, Mail, FileText } from 'lucide-react';

const LegalNoticesPage: React.FC = () => {
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
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900">
              Legal Notices
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              DMCA copyright notices, security disclosure procedures, and legal compliance information
            </p>
            <p className="text-sm text-gray-500">
              Last updated: September 26, 2025
            </p>
          </div>
        </div>

        {/* DMCA Notice */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Scale className="h-5 w-5 mr-2" />
              DMCA Copyright Notice
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Copyright Policy</h3>
              <p className="text-gray-700 mb-4">
                Pheme respects the intellectual property rights of others and expects our users to do the same. 
                We respond to notices of alleged copyright infringement that comply with the Digital Millennium Copyright Act (DMCA).
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">AI-Generated Content & Copyright</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-700 mb-3">
                  <strong>Important:</strong> Pheme generates content using AI technology. While we strive to create original content, 
                  users should be aware of copyright considerations:
                </p>
                <ul className="list-disc pl-6 text-blue-600 space-y-1">
                  <li>AI-generated content may inadvertently resemble existing copyrighted material</li>
                  <li>Users are responsible for ensuring their use of generated content complies with copyright law</li>
                  <li>We recommend reviewing and modifying AI-generated content before commercial use</li>
                  <li>Consider seeking legal advice for high-value commercial applications</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Filing a DMCA Notice</h3>
              <p className="text-gray-700 mb-3">
                If you believe that content on Pheme infringes your copyright, please provide our designated agent with the following information:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>A physical or electronic signature of the copyright owner or authorized representative</li>
                <li>Identification of the copyrighted work claimed to have been infringed</li>
                <li>Identification of the material that is claimed to be infringing and its location on our service</li>
                <li>Your contact information (address, telephone number, and email address)</li>
                <li>A statement that you have a good faith belief that use of the material is not authorized</li>
                <li>A statement that the information is accurate and you are authorized to act on behalf of the copyright owner</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">DMCA Designated Agent</h3>
              <div className="bg-gray-100 rounded-lg p-4">
                <p className="font-medium text-gray-800 mb-2">Copyright Agent</p>
                <p className="text-gray-700">Email: shallsdigital@gmail.com</p>
                <p className="text-gray-700">Subject Line: DMCA Copyright Notice</p>
                <p className="text-sm text-gray-600 mt-2">
                  Please include "DMCA" in the subject line for faster processing
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Counter-Notification Procedure</h3>
              <p className="text-gray-700 mb-3">
                If you believe your content was removed in error, you may file a counter-notification containing:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Your physical or electronic signature</li>
                <li>Identification of the material that was removed and its previous location</li>
                <li>A statement under penalty of perjury that you have a good faith belief the material was removed by mistake</li>
                <li>Your name, address, telephone number, and email address</li>
                <li>A statement that you consent to jurisdiction of the federal court in your district</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Repeat Infringer Policy</h3>
              <p className="text-gray-700">
                Pheme will terminate the accounts of users who are repeat infringers in accordance with the DMCA 
                and our Terms of Service.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Security & Responsible Disclosure */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Security & Responsible Disclosure
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Our Security Commitment</h3>
              <p className="text-gray-700 mb-4">
                Pheme takes security seriously. We are committed to protecting our users' data and maintaining 
                the integrity of our platform. We welcome security researchers and the community to help us 
                identify and fix security vulnerabilities.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Reporting Security Vulnerabilities</h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-800 mb-2">Security Issue Reporting</h4>
                    <p className="text-sm text-red-700 mb-3">
                      If you discover a security vulnerability, please report it responsibly to help us protect our users.
                    </p>
                    <div className="bg-white rounded p-3">
                      <p className="font-medium text-gray-800 mb-1">Security Team Email:</p>
                      <p className="text-gray-700">shallsdigital@gmail.com</p>
                      <p className="text-sm text-gray-600 mt-1">Subject: Security Vulnerability Report</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">What to Include in Your Report</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>A clear description of the vulnerability</li>
                <li>Steps to reproduce the issue</li>
                <li>Potential impact and severity assessment</li>
                <li>Any proof-of-concept code or screenshots (if applicable)</li>
                <li>Your contact information for follow-up questions</li>
                <li>Any suggested remediation steps</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Responsible Disclosure Guidelines</h3>
              <p className="text-gray-700 mb-3">
                To ensure responsible disclosure, please follow these guidelines:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Do not access, modify, or delete data belonging to other users</li>
                <li>Do not perform any actions that could harm the service or its users</li>
                <li>Do not publicly disclose the vulnerability until we've had time to address it</li>
                <li>Give us a reasonable amount of time to investigate and fix the issue</li>
                <li>Do not use social engineering, phishing, or physical attacks</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Our Response Process</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-semibold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Acknowledgment (24-48 hours)</h4>
                    <p className="text-sm text-gray-600">We'll confirm receipt of your report and assign a tracking ID</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-semibold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Investigation (1-7 days)</h4>
                    <p className="text-sm text-gray-600">Our security team will investigate and validate the report</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-semibold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Resolution (varies by severity)</h4>
                    <p className="text-sm text-gray-600">We'll develop and deploy a fix, then notify you of the resolution</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Security Best Practices</h3>
              <p className="text-gray-700 mb-3">
                While using Pheme, please follow these security best practices:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Use strong, unique passwords for your account</li>
                <li>Enable two-factor authentication when available</li>
                <li>Keep your browser and devices updated</li>
                <li>Be cautious when sharing generated content publicly</li>
                <li>Report any suspicious activity or security concerns</li>
                <li>Review and customize AI-generated content before use</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Legal Compliance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Legal Compliance & Regulatory Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Data Protection Regulations</h3>
              <p className="text-gray-700 mb-3">
                Pheme complies with applicable data protection regulations including:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>General Data Protection Regulation (GDPR) for EU users</li>
                <li>California Consumer Privacy Act (CCPA) for California residents</li>
                <li>Other applicable local and international privacy laws</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">AI Ethics & Compliance</h3>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-800 mb-2">Responsible AI Use</h4>
                <p className="text-purple-700 mb-3">
                  Pheme is committed to responsible AI development and deployment:
                </p>
                <ul className="list-disc pl-6 text-purple-600 space-y-1">
                  <li>We use Claude AI by Anthropic, which follows strict AI safety guidelines</li>
                  <li>Content generation includes appropriate safeguards against harmful outputs</li>
                  <li>We continuously monitor and improve our AI systems</li>
                  <li>Users are informed that content is AI-generated</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Industry Standards</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>SOC 2 Type II compliance (security and availability)</li>
                <li>ISO 27001 information security management standards</li>
                <li>OWASP security guidelines for web applications</li>
                <li>Payment Card Industry (PCI) compliance for payment processing</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Content Moderation</h3>
              <p className="text-gray-700 mb-3">
                Pheme maintains content standards to ensure appropriate use:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>AI systems include content filtering for harmful or inappropriate material</li>
                <li>User-generated content is subject to community guidelines</li>
                <li>Automated monitoring systems detect potential policy violations</li>
                <li>Users can report inappropriate content or behavior</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Government Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Government Requests & Legal Process</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-3">Law Enforcement Requests</h3>
              <p className="text-gray-700 mb-3">
                Pheme may disclose user information in response to valid legal process, including:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Subpoenas, court orders, and search warrants</li>
                <li>Emergency requests involving imminent harm</li>
                <li>National security requests where legally required</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Transparency Principles</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>We notify users of legal requests when legally permitted</li>
                <li>We challenge overly broad or inappropriate requests</li>
                <li>We publish transparency reports when feasible</li>
                <li>We limit disclosure to the minimum necessary information</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Contact Legal Team */}
        <Card className="bg-gray-900 text-white">
          <CardContent className="text-center py-8">
            <h3 className="text-xl font-semibold mb-2">Legal Questions or Concerns?</h3>
            <p className="text-gray-300 mb-4">
              Contact our legal team for copyright notices, security reports, or other legal matters.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a href="mailto:shallsdigital@gmail.com?subject=Legal%20Inquiry">
                <Button variant="secondary" size="lg">
                  <Mail className="mr-2 h-4 w-4" />
                  Contact Legal Team
                </Button>
              </a>
              <a href="mailto:shallsdigital@gmail.com?subject=Security%20Vulnerability%20Report">
                <Button variant="outline" size="lg" className="text-gray-300 border-gray-600 hover:bg-gray-800">
                  <Shield className="mr-2 h-4 w-4" />
                  Report Security Issue
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default LegalNoticesPage;