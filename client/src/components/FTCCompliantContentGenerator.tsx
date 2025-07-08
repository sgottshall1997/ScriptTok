import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Shield, CheckCircle } from 'lucide-react';

export const FTCCompliantContentGenerator: React.FC = () => {
  const complianceGuidelines = [
    {
      title: "Truth in Advertising",
      description: "All AI-generated content must be truthful and substantiated",
      icon: <CheckCircle className="w-5 h-5 text-green-600" />,
      rules: [
        "Product claims must be accurate and verifiable",
        "Avoid exaggerated or unsubstantiated benefits",
        "Include disclaimers for typical results"
      ]
    },
    {
      title: "Clear Disclosure",
      description: "Amazon affiliate relationship must be clearly disclosed",
      icon: <Shield className="w-5 h-5 text-blue-600" />,
      rules: [
        "Use 'As an Amazon Associate, I earn from qualifying purchases'",
        "Place disclosure prominently before affiliate links",
        "Ensure disclosure is easily understandable"
      ]
    },
    {
      title: "Customer Service Boundaries",
      description: "Cannot provide Amazon customer service or handle orders",
      icon: <AlertTriangle className="w-5 h-5 text-orange-600" />,
      rules: [
        "Direct customers to Amazon for order issues",
        "Do not handle returns, refunds, or shipping questions",
        "Clearly state you are not representing Amazon"
      ]
    }
  ];

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader>
        <CardTitle className="text-lg text-blue-800 flex items-center gap-2">
          <Shield className="w-6 h-6" />
          FTC & Amazon Associates Compliance
        </CardTitle>
        <p className="text-sm text-blue-700">
          Your content generation follows Federal Trade Commission and Amazon Associates guidelines
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {complianceGuidelines.map((guideline, index) => (
            <div key={index} className="flex gap-3 p-3 bg-white rounded-lg border">
              {guideline.icon}
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-1">{guideline.title}</h4>
                <p className="text-sm text-gray-600 mb-2">{guideline.description}</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  {guideline.rules.map((rule, ruleIndex) => (
                    <li key={ruleIndex} className="flex items-start gap-1">
                      <span className="text-green-500 mt-1">•</span>
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Automated Compliance:</strong> All generated content includes proper disclosures 
            and follows FTC guidelines for affiliate marketing. Amazon links automatically include 
            your Associate ID and proper attribution.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};