import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Scale, CreditCard, Shield, AlertTriangle } from 'lucide-react';

const TermsBillingPage: React.FC = () => {
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
              Terms of Service & Billing
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Complete terms of service, acceptable use policies, and billing terms for ScriptTok
            </p>
            <p className="text-sm text-gray-500">
              Last updated: September 26, 2025
            </p>
          </div>
        </div>

        {/* Agreement */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-800">
              <Scale className="h-5 w-5 mr-2" />
              Agreement to Terms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-700">
              By accessing and using ScriptTok, you accept and agree to be bound by the terms and provision of this agreement. 
              If you do not agree to abide by the above, please do not use this service.
            </p>
          </CardContent>
        </Card>

        {/* Terms of Service */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Scale className="h-5 w-5 mr-2" />
              Terms of Service
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">1. Service Description</h3>
              <p className="text-gray-700 mb-2">
                ScriptTok is an AI-powered TikTok content generation platform that helps users create viral TikTok content 
                using Claude AI technology with viral score analysis.
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>AI-generated TikTok content creation</li>
                <li>Viral score analysis and optimization</li>
                <li>Content history and performance tracking</li>
                <li>Niche-specific templates and customization</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">2. User Accounts</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>You are responsible for maintaining the confidentiality of your account</li>
                <li>You must provide accurate and complete information when creating an account</li>
                <li>You are responsible for all activities that occur under your account</li>
                <li>One person or legal entity may not maintain more than one account</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">3. Intellectual Property</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>You retain ownership of content you create using ScriptTok</li>
                <li>ScriptTok retains ownership of the platform, technology, and algorithms</li>
                <li>AI-generated content is provided "as-is" without guarantees of uniqueness</li>
                <li>You may not reverse engineer, decompile, or attempt to extract our algorithms</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">4. Service Availability</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>We strive for 99% uptime but do not guarantee uninterrupted service</li>
                <li>Scheduled maintenance will be announced in advance when possible</li>
                <li>We reserve the right to modify or discontinue features with notice</li>
                <li>Emergency maintenance may occur without advance notice</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">5. Limitation of Liability</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>ScriptTok is provided "as-is" without warranties of any kind</li>
                <li>We are not liable for any indirect, incidental, or consequential damages</li>
                <li>Our total liability shall not exceed the amount paid by you in the last 12 months</li>
                <li>We do not guarantee viral success or specific engagement rates</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Acceptable Use Policy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Acceptable Use Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-800 mb-2">AI Content Disclaimer</h4>
                  <p className="text-sm text-yellow-700">
                    ⚠️ AI-generated content outputs are probabilistic and not guaranteed to go viral or achieve specific engagement rates. 
                    Always review and customize content before posting.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Prohibited Activities</h3>
              <p className="text-gray-700 mb-3">You may not use ScriptTok to:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Generate harmful, offensive, or inappropriate content</li>
                <li>Create content that violates TikTok's Community Guidelines</li>
                <li>Impersonate others or create misleading content</li>
                <li>Generate spam or repetitive content</li>
                <li>Attempt to circumvent usage limits or restrictions</li>
                <li>Share your account credentials with others</li>
                <li>Use the service for any illegal purposes</li>
                <li>Violate any applicable laws or regulations</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Content Guidelines</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Generated content should comply with TikTok's Community Guidelines</li>
                <li>You are responsible for ensuring content accuracy before posting</li>
                <li>Respect intellectual property rights when using generated content</li>
                <li>Do not use AI-generated content to mislead audiences about its origin</li>
                <li>Consider disclosing AI assistance when appropriate for transparency</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Enforcement</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Violations may result in account suspension or termination</li>
                <li>We reserve the right to investigate suspected violations</li>
                <li>Repeated violations will result in permanent account closure</li>
                <li>We may report illegal activities to appropriate authorities</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Billing Terms */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Billing Terms & Subscription
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">1. Subscription Plans</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Free tier: Limited content generations per month</li>
                <li>Premium plans: Unlimited generations, advanced features, priority support</li>
                <li>Pricing and features subject to change with 30 days notice</li>
                <li>Educational and volume discounts may be available upon request</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">2. Payment Terms</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Subscriptions are billed monthly or annually in advance</li>
                <li>Payment is due immediately upon subscription or renewal</li>
                <li>We accept major credit cards and PayPal</li>
                <li>All fees are non-refundable except as required by law</li>
                <li>Prices are in USD unless otherwise specified</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">3. Automatic Renewal</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Subscriptions automatically renew unless cancelled</li>
                <li>You can cancel anytime from your account settings</li>
                <li>Cancellation takes effect at the end of your current billing period</li>
                <li>We'll send renewal reminders before charging your payment method</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">4. Refunds & Cancellations</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>No refunds for partial months or unused generations</li>
                <li>Refunds may be provided for technical issues preventing service use</li>
                <li>Disputed charges should be reported within 60 days</li>
                <li>Account termination does not entitle you to refunds</li>
                <li>Chargebacks may result in immediate account suspension</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">5. Usage Limits</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Free accounts have monthly generation limits</li>
                <li>Premium accounts have fair use policies to prevent abuse</li>
                <li>Excessive usage may result in temporary rate limiting</li>
                <li>Commercial usage may require enterprise plans</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Dispute Resolution */}
        <Card>
          <CardHeader>
            <CardTitle>Dispute Resolution & Arbitration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-3">Binding Arbitration</h3>
              <p className="text-gray-700 mb-3">
                Any disputes arising from this agreement shall be resolved through binding arbitration rather than 
                in court, except for claims related to intellectual property rights.
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Arbitration will be conducted by a neutral arbitrator</li>
                <li>The arbitration will take place in your jurisdiction</li>
                <li>Each party will bear their own costs and attorney fees</li>
                <li>Arbitration decisions are final and binding</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Governing Law</h3>
              <p className="text-gray-700">
                This agreement shall be governed by the laws of the jurisdiction where ScriptTok is operated, 
                without regard to conflict of law principles.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="bg-gray-900 text-white">
          <CardContent className="text-center py-8">
            <h3 className="text-xl font-semibold mb-2">Questions About These Terms?</h3>
            <p className="text-gray-300 mb-4">
              Contact our support team if you have questions about our terms of service or billing.
            </p>
            <Link href="/contact">
              <Button variant="secondary" size="lg">
                Contact Support
              </Button>
            </Link>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default TermsBillingPage;