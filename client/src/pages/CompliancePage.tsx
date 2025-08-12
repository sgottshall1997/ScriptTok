import React from 'react';
import { ComplianceDemo } from '@/components/ComplianceDemo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Shield, Users, FileText, TrendingUp } from 'lucide-react';

export default function CompliancePage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Amazon Associates Compliance</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Comprehensive compliance system ensuring 95% alignment with Amazon Associates Operating Agreement requirements.
        </p>
        <div className="flex justify-center gap-2">
          <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
            <CheckCircle className="w-4 h-4 mr-1" />
            95% Compliant
          </Badge>
          <Badge variant="secondary">
            3 Enhanced Systems
          </Badge>
          <Badge variant="outline">
            Real-time Monitoring
          </Badge>
        </div>
      </div>

      {/* Compliance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="text-center pb-3">
            <FileText className="w-8 h-8 mx-auto text-blue-600" />
            <CardTitle className="text-lg">Content Policy Filter</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-2xl font-bold text-green-600">✓</div>
            <p className="text-sm text-gray-600">Automated content compliance monitoring</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center pb-3">
            <Users className="w-8 h-8 mx-auto text-purple-600" />
            <CardTitle className="text-lg">User Verification</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-2xl font-bold text-green-600">✓</div>
            <p className="text-sm text-gray-600">Complete eligibility validation system</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center pb-3">
            <TrendingUp className="w-8 h-8 mx-auto text-orange-600" />
            <CardTitle className="text-lg">Link Tracking</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-2xl font-bold text-green-600">✓</div>
            <p className="text-sm text-gray-600">Comprehensive affiliate link monitoring</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center pb-3">
            <Shield className="w-8 h-8 mx-auto text-red-600" />
            <CardTitle className="text-lg">Overall Status</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-2xl font-bold text-green-600">95%</div>
            <p className="text-sm text-gray-600">Amazon Associates compliant</p>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Demo */}
      <ComplianceDemo />

      {/* Compliance Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Current Compliance Status */}
        <Card>
          <CardHeader>
            <CardTitle>Current Compliance Status</CardTitle>
            <CardDescription>
              How the system addresses Amazon Associates Operating Agreement requirements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Required Disclosures</span>
                <Badge variant="default">Compliant</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Affiliate Link Formatting</span>
                <Badge variant="default">Compliant</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">FTC Compliance Integration</span>
                <Badge variant="default">Compliant</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Customer Boundary Respect</span>
                <Badge variant="default">Compliant</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Content Policy Monitoring</span>
                <Badge variant="default">Enhanced</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">User Verification System</span>
                <Badge variant="default">Enhanced</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Link Tracking Analytics</span>
                <Badge variant="default">Enhanced</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Implementation Benefits */}
        <Card>
          <CardHeader>
            <CardTitle>Implementation Benefits</CardTitle>
            <CardDescription>
              How these improvements strengthen Amazon Associates compliance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-medium text-sm">Automated Content Monitoring</h4>
                <p className="text-xs text-gray-600 mt-1">
                  Real-time detection of prohibited products, misleading claims, and required disclosure validation ensures all content meets Amazon policies before publication.
                </p>
              </div>
              
              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-medium text-sm">Enhanced User Verification</h4>
                <p className="text-xs text-gray-600 mt-1">
                  Comprehensive eligibility validation system collects required contact information and enables Amazon verification requests when needed.
                </p>
              </div>
              
              <div className="border-l-4 border-orange-500 pl-4">
                <h4 className="font-medium text-sm">Comprehensive Link Analytics</h4>
                <p className="text-xs text-gray-600 mt-1">
                  Advanced tracking system monitors all affiliate links, provides compliance status, and generates exportable reports for Amazon review requests.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Technical Implementation */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Implementation Details</CardTitle>
          <CardDescription>
            Key systems and APIs powering the compliance improvements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <FileText className="w-6 h-6 mx-auto text-blue-600" />
              <h4 className="font-medium">Content Policy Filter</h4>
              <ul className="text-xs space-y-1 text-gray-600">
                <li>/api/compliance/content/filter</li>
                <li>Prohibited content detection</li>
                <li>Required disclosure validation</li>
                <li>Platform-specific compliance</li>
              </ul>
            </div>
            
            <div className="text-center space-y-2">
              <Users className="w-6 h-6 mx-auto text-purple-600" />
              <h4 className="font-medium">User Verification System</h4>
              <ul className="text-xs space-y-1 text-gray-600">
                <li>/api/compliance/user/verify</li>
                <li>Email & website verification</li>
                <li>Amazon Associate ID validation</li>
                <li>Compliance agreement tracking</li>
              </ul>
            </div>
            
            <div className="text-center space-y-2">
              <TrendingUp className="w-6 h-6 mx-auto text-orange-600" />
              <h4 className="font-medium">Link Tracking System</h4>
              <ul className="text-xs space-y-1 text-gray-600">
                <li>/api/compliance/links/track</li>
                <li>Real-time compliance monitoring</li>
                <li>Performance analytics</li>
                <li>Exportable reports</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}