import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InstructionFooter from '@/cookaing-marketing/components/InstructionFooter';
import { 
  Mail, 
  Send, 
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  Globe,
  Server,
  AlertTriangle,
  Eye,
  Trash2
} from "lucide-react";

interface EmailTest {
  id: string;
  testType: 'smtp' | 'deliverability' | 'spam' | 'template';
  recipientEmail: string;
  subject: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'bounced' | 'spam' | 'pending';
  deliveryTime?: number;
  spamScore?: number;
  opens?: number;
  clicks?: number;
}

interface DeliverabilityCheck {
  provider: string;
  status: 'pass' | 'fail' | 'warn';
  details: string;
  score?: number;
}

// Mock email test history
const mockEmailTests: EmailTest[] = [
  {
    id: "1",
    testType: "deliverability",
    recipientEmail: "test@gmail.com",
    subject: "Test Email Delivery - Recipe Newsletter",
    timestamp: "2025-01-18T15:30:00Z",
    status: "delivered",
    deliveryTime: 2340,
    spamScore: 1.2,
    opens: 1,
    clicks: 0
  },
  {
    id: "2",
    testType: "spam",
    recipientEmail: "spamtest@example.com",
    subject: "🔥 AMAZING RECIPES 🔥 Click NOW!!!",
    timestamp: "2025-01-18T14:15:00Z",
    status: "spam",
    spamScore: 8.7
  },
  {
    id: "3",
    testType: "smtp",
    recipientEmail: "smtp-test@outlook.com",
    subject: "SMTP Configuration Test",
    timestamp: "2025-01-18T13:00:00Z",
    status: "bounced",
    deliveryTime: 5000
  },
  {
    id: "4",
    testType: "template",
    recipientEmail: "template@yahoo.com",
    subject: "Weekly Recipe Collection - Template Test",
    timestamp: "2025-01-18T12:45:00Z",
    status: "delivered",
    deliveryTime: 1890,
    spamScore: 2.1,
    opens: 1,
    clicks: 1
  }
];

// Mock deliverability checks
const mockDeliverabilityChecks: DeliverabilityCheck[] = [
  {
    provider: "Gmail",
    status: "pass",
    details: "SPF, DKIM, and DMARC all configured correctly",
    score: 95
  },
  {
    provider: "Outlook/Hotmail",
    status: "warn",
    details: "DMARC policy set to 'none' - consider upgrading to 'quarantine'",
    score: 78
  },
  {
    provider: "Yahoo",
    status: "pass",
    details: "All authentication checks pass",
    score: 92
  },
  {
    provider: "Apple iCloud",
    status: "fail",
    details: "DKIM signature verification failed",
    score: 45
  },
  {
    provider: "AOL",
    status: "pass",
    details: "Domain reputation is good",
    score: 88
  }
];

export default function EmailTestPage() {
  const [activeTab, setActiveTab] = useState("send-test");
  const [testEmail, setTestEmail] = useState("");
  const [testSubject, setTestSubject] = useState("");
  const [testType, setTestType] = useState("deliverability");

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': case 'sent': case 'pass': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'bounced': case 'spam': case 'fail': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'pending': case 'warn': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': case 'sent': case 'pass': return CheckCircle;
      case 'bounced': case 'spam': case 'fail': return XCircle;
      case 'pending': case 'warn': return AlertTriangle;
      default: return Clock;
    }
  };

  const getTestTypeLabel = (type: string) => {
    switch (type) {
      case 'smtp': return 'SMTP Config';
      case 'deliverability': return 'Deliverability';
      case 'spam': return 'Spam Test';
      case 'template': return 'Template';
      default: return type;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const avgDeliveryTime = mockEmailTests
    .filter(t => t.deliveryTime)
    .reduce((sum, t) => sum + (t.deliveryTime || 0), 0) / 
    mockEmailTests.filter(t => t.deliveryTime).length;

  const deliveryRate = (mockEmailTests.filter(t => t.status === 'delivered').length / mockEmailTests.length) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Mail className="h-8 w-8" />
            Email Delivery Test
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Test SMTP configuration, deliverability, and spam scoring
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tests</p>
                <p className="text-2xl font-bold">{mockEmailTests.length}</p>
              </div>
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Delivery Rate</p>
                <p className="text-2xl font-bold text-green-600">{deliveryRate.toFixed(1)}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Delivery Time</p>
                <p className="text-2xl font-bold text-purple-600">{avgDeliveryTime.toFixed(0)}ms</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Spam Issues</p>
                <p className="text-2xl font-bold text-orange-600">
                  {mockEmailTests.filter(t => t.status === 'spam').length}
                </p>
              </div>
              <Shield className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different test types */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="send-test" data-testid="tab-send-test">Send Test</TabsTrigger>
          <TabsTrigger value="deliverability" data-testid="tab-deliverability">Deliverability Check</TabsTrigger>
          <TabsTrigger value="history" data-testid="tab-history">Test History</TabsTrigger>
        </TabsList>

        {/* Send Test Tab */}
        <TabsContent value="send-test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Send Email Test</CardTitle>
              <CardDescription>
                Test your email configuration by sending test emails
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="test-email">Test Email Address</Label>
                    <Input 
                      id="test-email"
                      type="email"
                      placeholder="test@example.com"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      data-testid="input-test-email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="test-type">Test Type</Label>
                    <select
                      id="test-type"
                      value={testType}
                      onChange={(e) => setTestType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                      data-testid="select-test-type"
                    >
                      <option value="deliverability">Deliverability Test</option>
                      <option value="smtp">SMTP Configuration</option>
                      <option value="spam">Spam Score Check</option>
                      <option value="template">Template Rendering</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="test-subject">Subject Line</Label>
                  <Input 
                    id="test-subject"
                    placeholder="Test Email Subject"
                    value={testSubject}
                    onChange={(e) => setTestSubject(e.target.value)}
                    data-testid="input-test-subject"
                  />
                </div>

                <div>
                  <Label htmlFor="test-content">Email Content</Label>
                  <Textarea
                    id="test-content"
                    placeholder="Enter your test email content here..."
                    rows={6}
                    data-testid="textarea-test-content"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Button data-testid="button-send-test">
                    <Send className="h-4 w-4 mr-2" />
                    Send Test Email
                  </Button>
                  <Button variant="outline" data-testid="button-send-multiple">
                    <Mail className="h-4 w-4 mr-2" />
                    Send to Multiple Providers
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Deliverability Check Tab */}
        <TabsContent value="deliverability" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Deliverability Status</CardTitle>
              <CardDescription>
                Check your domain's email authentication and reputation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockDeliverabilityChecks.map((check, index) => {
                  const StatusIcon = getStatusIcon(check.status);
                  
                  return (
                    <div key={index} 
                         className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
                         data-testid={`deliverability-${check.provider.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}>
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${getStatusColor(check.status).includes('green') ? 'bg-green-100 dark:bg-green-900' : 
                                                            getStatusColor(check.status).includes('red') ? 'bg-red-100 dark:bg-red-900' : 
                                                            'bg-yellow-100 dark:bg-yellow-900'}`}>
                          <StatusIcon className={`h-4 w-4 ${getStatusColor(check.status).includes('green') ? 'text-green-600' : 
                                                            getStatusColor(check.status).includes('red') ? 'text-red-600' : 
                                                            'text-yellow-600'}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold flex items-center gap-2">
                            {check.provider}
                            <Badge variant="outline" className={getStatusColor(check.status)}>
                              {check.status.charAt(0).toUpperCase() + check.status.slice(1)}
                            </Badge>
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{check.details}</p>
                        </div>
                      </div>
                      {check.score && (
                        <div className="text-right">
                          <p className="text-2xl font-bold">{check.score}</p>
                          <p className="text-xs text-gray-500">Score</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button data-testid="button-refresh-deliverability">
                  <Globe className="h-4 w-4 mr-2" />
                  Refresh Deliverability Check
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Test History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Test History</CardTitle>
              <CardDescription>
                Review all previous email delivery tests and their results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockEmailTests.map((test) => {
                  const StatusIcon = getStatusIcon(test.status);
                  
                  return (
                    <Card key={test.id} data-testid={`test-${test.id}`} 
                          className="border-l-4 border-l-blue-500">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold">{test.subject}</h3>
                              <Badge variant="outline" className={getStatusColor(test.status)}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                              </Badge>
                              <Badge variant="outline">
                                {getTestTypeLabel(test.testType)}
                              </Badge>
                            </div>
                            
                            <div className="grid gap-2 text-sm mb-3">
                              <div>
                                <strong>Recipient:</strong> {test.recipientEmail}
                              </div>
                              <div>
                                <strong>Sent:</strong> {formatDate(test.timestamp)}
                              </div>
                            </div>

                            <div className="grid gap-3 md:grid-cols-4">
                              {test.deliveryTime && (
                                <div className="text-center">
                                  <p className="text-sm text-gray-600 dark:text-gray-400">Delivery Time</p>
                                  <p className="font-semibold">{test.deliveryTime}ms</p>
                                </div>
                              )}
                              
                              {test.spamScore !== undefined && (
                                <div className="text-center">
                                  <p className="text-sm text-gray-600 dark:text-gray-400">Spam Score</p>
                                  <p className={`font-semibold ${test.spamScore > 5 ? 'text-red-600' : 'text-green-600'}`}>
                                    {test.spamScore}/10
                                  </p>
                                </div>
                              )}
                              
                              {test.opens !== undefined && (
                                <div className="text-center">
                                  <p className="text-sm text-gray-600 dark:text-gray-400">Opens</p>
                                  <p className="font-semibold">{test.opens}</p>
                                </div>
                              )}
                              
                              {test.clicks !== undefined && (
                                <div className="text-center">
                                  <p className="text-sm text-gray-600 dark:text-gray-400">Clicks</p>
                                  <p className="font-semibold">{test.clicks}</p>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 ml-4">
                            <Button variant="outline" size="sm" data-testid={`button-view-${test.id}`}>
                              <Eye className="h-3 w-3 mr-1" />
                              Details
                            </Button>
                            <Button variant="outline" size="sm" data-testid={`button-retest-${test.id}`}>
                              <Send className="h-3 w-3 mr-1" />
                              Retest
                            </Button>
                            <Button variant="outline" size="sm" data-testid={`button-delete-${test.id}`}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Help Text */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100">
                Email Delivery Best Practices
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Regularly test email delivery to major providers. Maintain good sender reputation 
                with proper SPF, DKIM, and DMARC configuration. Monitor spam scores and adjust 
                content accordingly to improve deliverability.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instruction Footer */}
      <InstructionFooter
        title="Email Delivery Test"
        whatIsIt="Test email deliverability, check spam scores, and validate DNS authentication."
        setupSteps={[
          "Configure email provider (Brevo, Resend) with API keys.",
          "Set up domain authentication: SPF, DKIM, and DMARC records."
        ]}
        usageSteps={[
          "Send test emails to various providers (Gmail, Outlook, Yahoo).",
          "Check deliverability reports and spam scoring."
        ]}
        envKeys={["BREVO_API_KEY", "RESEND_API_KEY", "SENDGRID_API_KEY"]}
        featureFlags={["email"]}
      />
    </div>
  );
}