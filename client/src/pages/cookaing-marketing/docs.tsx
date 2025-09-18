import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import InstructionFooter from '@/cookaing-marketing/components/InstructionFooter';
import { Copy, Key, Webhook, Play, RotateCcw, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function CookAIngMarketingDocs() {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const { toast } = useToast();

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(label);
      setTimeout(() => setCopiedItem(null), 2000);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy manually",
        variant: "destructive",
      });
    }
  };

  const envVars = [
    {
      name: "DATABASE_URL",
      description: "PostgreSQL connection string for campaign and contact data",
      example: "postgresql://user:password@host:5432/cookaing_marketing",
      required: true,
      category: "Database"
    },
    {
      name: "OPENAI_API_KEY",
      description: "OpenAI API key for content generation and A/B testing",
      example: "sk-proj-...",
      required: true,
      category: "AI Services"
    },
    {
      name: "ANTHROPIC_API_KEY",
      description: "Claude AI API key for advanced content optimization",
      example: "sk-ant-...",
      required: false,
      category: "AI Services"
    },
    {
      name: "PERPLEXITY_API_KEY",
      description: "Perplexity AI API key for trending content analysis",
      example: "pplx-...",
      required: false,
      category: "AI Services"
    },
    {
      name: "SENDGRID_API_KEY",
      description: "SendGrid API key for email campaign delivery",
      example: "SG.xxx...",
      required: true,
      category: "Email Services"
    },
    {
      name: "TWILIO_ACCOUNT_SID",
      description: "Twilio Account SID for SMS and WhatsApp campaigns",
      example: "AC...",
      required: false,
      category: "Communication"
    },
    {
      name: "TWILIO_AUTH_TOKEN",
      description: "Twilio Auth Token for SMS and WhatsApp campaigns",
      example: "xxx...",
      required: false,
      category: "Communication"
    },
    {
      name: "FACEBOOK_ACCESS_TOKEN",
      description: "Facebook Graph API token for social media posting",
      example: "EAAG...",
      required: false,
      category: "Social Media"
    },
    {
      name: "MAKE_WEBHOOK_URL",
      description: "Make.com webhook URL for automation integration",
      example: "https://hook.us2.make.com/your-webhook-id",
      required: true,
      category: "Integrations"
    },
    {
      name: "WEBHOOK_SECRET",
      description: "Optional secret key for webhook configuration",
      example: "whsec_...",
      required: false,
      category: "Security"
    },
    {
      name: "AFFILIATE_AMAZON_ACCESS_KEY",
      description: "Amazon Product Advertising API access key",
      example: "AKIA...",
      required: false,
      category: "Affiliate Networks"
    },
    {
      name: "AFFILIATE_AMAZON_SECRET_KEY",
      description: "Amazon Product Advertising API secret key",
      example: "xxx...",
      required: false,
      category: "Affiliate Networks"
    },
    {
      name: "AFFILIATE_AMAZON_PARTNER_TAG",
      description: "Amazon Associate partner/tracking ID",
      example: "yourtag-20",
      required: false,
      category: "Affiliate Networks"
    }
  ];

  const webhookEndpoints = [
    {
      endpoint: "/api/webhooks/config",
      method: "GET",
      description: "Retrieve current webhook configuration",
      events: ["configuration_retrieval"],
      security: "No authentication required"
    },
    {
      endpoint: "/api/webhooks/config",
      method: "POST",
      description: "Update webhook configuration for Make.com integration",
      events: ["configuration_update"],
      security: "URL validation and optional secret"
    },
    {
      endpoint: "/api/webhooks/config",
      method: "DELETE",
      description: "Disable webhook by clearing configuration",
      events: ["configuration_disable"],
      security: "No authentication required"
    },
    {
      endpoint: "/api/post/send-to-make",
      method: "POST",
      description: "Send single content item to Make.com webhook",
      events: ["content_sent"],
      security: "MAKE_WEBHOOK_URL required"
    },
    {
      endpoint: "/api/post/send-batch",
      method: "POST",
      description: "Send multiple content items to Make.com webhook in batch",
      events: ["batch_sent"],
      security: "MAKE_WEBHOOK_URL required"
    },
    {
      endpoint: "/api/post/test-make-webhook",
      method: "GET",
      description: "Test Make.com webhook connection with mock payload",
      events: ["test_webhook"],
      security: "MAKE_WEBHOOK_URL required"
    }
  ];

  return (
    <div className="container mx-auto py-6 space-y-6" data-testid="docs-page">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold" data-testid="docs-title">
          CookAIng Marketing Engine Documentation
        </h1>
        <p className="text-muted-foreground" data-testid="docs-description">
          Complete setup guides, environment configuration, and operational runbooks
        </p>
      </div>

      <Tabs defaultValue="setup" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="setup" data-testid="tab-setup">Setup Guide</TabsTrigger>
          <TabsTrigger value="environment" data-testid="tab-environment">Environment</TabsTrigger>
          <TabsTrigger value="webhooks" data-testid="tab-webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="runbook" data-testid="tab-runbook">Runbook</TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Quick Start Guide
              </CardTitle>
              <CardDescription>
                Get your CookAIng Marketing Engine up and running in minutes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">1. Database Setup</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <code className="text-sm">
                    npm run db:push
                  </code>
                </div>
                <p className="text-sm text-muted-foreground">
                  Initializes PostgreSQL tables for organizations, contacts, campaigns, and analytics
                </p>
              </div>

              <Separator />

              <div className="space-y-3">
                <h3 className="text-lg font-semibold">2. Seed Sample Data</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <code className="text-sm block">POST /api/cookaing-marketing/seed-data/initialize</code>
                  <p className="text-xs text-muted-foreground">
                    Creates 50 sample contacts + 1 multi-channel campaign with A/B testing
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h3 className="text-lg font-semibold">3. Configure Environment</h3>
                <p className="text-sm text-muted-foreground">
                  Set up required environment variables (see Environment tab for complete list)
                </p>
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Required Variables</AlertTitle>
                  <AlertDescription>
                    DATABASE_URL, OPENAI_API_KEY, SENDGRID_API_KEY, and MAKE_WEBHOOK_URL are required for basic functionality
                  </AlertDescription>
                </Alert>
              </div>

              <Separator />

              <div className="space-y-3">
                <h3 className="text-lg font-semibold">4. Test Webhook Integration</h3>
                <div className="bg-green-50 p-4 rounded-lg space-y-2">
                  <code className="text-sm block">GET /api/post/test-make-webhook</code>
                  <p className="text-xs text-muted-foreground">
                    Validates Make.com webhook connection with a test payload. Ensure MAKE_WEBHOOK_URL is set first.
                  </p>
                  <div className="text-xs bg-white p-2 rounded border">
                    <strong>Example:</strong> <code>curl ${window.location.origin}/api/post/test-make-webhook</code>
                    <br /><span className="text-muted-foreground">Or use the copy button in the Webhooks tab</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h3 className="text-lg font-semibold">5. Test Campaign Flow</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Create Campaign</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <code className="text-xs">POST /api/cookaing-marketing/campaigns</code>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Send Test Email</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <code className="text-xs">POST /api/cookaing-marketing/email/send</code>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Architecture Overview</CardTitle>
              <CardDescription>
                Understanding the CookAIng Marketing Engine components
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Core Engine</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Multi-channel campaigns</li>
                    <li>• A/B testing framework</li>
                    <li>• Contact segmentation</li>
                    <li>• Attribution tracking</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Integrations</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Email (SendGrid)</li>
                    <li>• SMS/WhatsApp (Twilio)</li>
                    <li>• Social Media (Facebook)</li>
                    <li>• Push Notifications</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Analytics</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Campaign performance</li>
                    <li>• Conversion tracking</li>
                    <li>• Trending detection</li>
                    <li>• Affiliate attribution</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="environment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Environment Variables
              </CardTitle>
              <CardDescription>
                Complete list of environment variables for CookAIng Marketing Engine
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {["Database", "AI Services", "Email Services", "Communication", "Social Media", "Security", "Integrations", "Affiliate Networks"].map((category) => (
                  <div key={category} className="space-y-3">
                    <h3 className="text-lg font-semibold">{category}</h3>
                    <div className="space-y-3">
                      {envVars.filter(env => env.category === category).map((env) => (
                        <Card key={env.name} className="border-l-4 border-l-blue-500">
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                  <code className="text-sm font-semibold bg-gray-100 px-2 py-1 rounded">
                                    {env.name}
                                  </code>
                                  {env.required && (
                                    <Badge variant="destructive" className="text-xs">Required</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">{env.description}</p>
                                <div className="flex items-center gap-2">
                                  <Label className="text-xs text-muted-foreground">Example:</Label>
                                  <code className="text-xs bg-gray-50 px-2 py-1 rounded">{env.example}</code>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(env.name, env.name)}
                                data-testid={`copy-env-${env.name.toLowerCase().replace(/_/g, '-')}`}
                              >
                                <Copy className="h-3 w-3" />
                                {copiedItem === env.name ? "Copied!" : "Copy"}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="h-5 w-5" />
                Webhook Endpoints
              </CardTitle>
              <CardDescription>
                Configure webhook URLs for real-time campaign event tracking
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {webhookEndpoints.map((webhook, index) => (
                <Card key={index} className="border-l-4 border-l-green-500">
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{webhook.method}</Badge>
                          <code className="text-sm font-semibold">{webhook.endpoint}</code>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(`${window.location.origin}${webhook.endpoint}`, webhook.endpoint)}
                          data-testid={`copy-webhook-${index}`}
                        >
                          <Copy className="h-3 w-3" />
                          {copiedItem === webhook.endpoint ? "Copied!" : "Copy URL"}
                        </Button>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">{webhook.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs font-semibold">Supported Events</Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {webhook.events.map((event) => (
                              <Badge key={event} variant="secondary" className="text-xs">
                                {event}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs font-semibold">Security</Label>
                          <p className="text-xs text-muted-foreground mt-1">{webhook.security}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Webhook Configuration</AlertTitle>
                <AlertDescription>
                  Configure these webhooks in your service provider's dashboard. Send endpoints require MAKE_WEBHOOK_URL; WEBHOOK_SECRET is optional if configured. The test endpoint is unauthenticated—use only in development or restrict access.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="runbook" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5" />
                Operational Runbook
              </CardTitle>
              <CardDescription>
                Standard procedures for campaign operations, troubleshooting, and rollbacks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Send Flow */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Campaign Send Flow</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Pre-Send Checklist
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <input type="checkbox" className="rounded" />
                          <span>Campaign content reviewed and approved</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" className="rounded" />
                          <span>Target segments validated</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" className="rounded" />
                          <span>A/B test variants configured</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" className="rounded" />
                          <span>Send time scheduled</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" className="rounded" />
                          <span>Webhook endpoints verified</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Send Process</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <ol className="text-sm space-y-1">
                        <li>1. Campaign status: draft → scheduled</li>
                        <li>2. Contact segments resolved</li>
                        <li>3. A/B variants assigned</li>
                        <li>4. Delivery queue populated</li>
                        <li>5. Send initiated</li>
                        <li>6. Real-time tracking begins</li>
                      </ol>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <Separator />

              {/* Monitoring */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Campaign Monitoring</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Key Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm space-y-1">
                        <li>• Delivery rate (&gt;95%)</li>
                        <li>• Open rate (industry avg)</li>
                        <li>• Click-through rate</li>
                        <li>• Bounce rate (&lt;2%)</li>
                        <li>• Unsubscribe rate (&lt;0.5%)</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Alert Thresholds</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm space-y-1">
                        <li>• Bounce rate &gt;5%</li>
                        <li>• Delivery rate &lt;90%</li>
                        <li>• API errors &gt;1%</li>
                        <li>• Webhook failures</li>
                        <li>• Unusual send volume</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Response Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm space-y-1">
                        <li>• Pause campaign</li>
                        <li>• Check provider status</li>
                        <li>• Review content quality</li>
                        <li>• Validate contact lists</li>
                        <li>• Escalate if needed</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <Separator />

              {/* Rollback Procedures */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Rollback Procedures</h3>
                
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Emergency Rollback</AlertTitle>
                  <AlertDescription>
                    Use these procedures when immediate campaign suspension is required
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm text-red-600">Immediate Stop</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="bg-red-50 p-3 rounded border-l-4 border-red-500">
                        <code className="text-sm">PUT /api/cookaing-marketing/campaigns/[id]</code>
                        <pre className="text-xs mt-2">
{`{
  "status": "paused",
  "pauseReason": "emergency_stop"
}`}
                        </pre>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Immediately pauses campaign delivery. No new sends will be initiated.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm text-orange-600">Cancel Scheduled</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="bg-orange-50 p-3 rounded border-l-4 border-orange-500">
                        <code className="text-sm">DELETE /api/cookaing-marketing/campaigns/[id]/schedule</code>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Removes future scheduled sends while preserving campaign data.
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Rollback Checklist</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <span>Campaign paused/cancelled</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <span>Delivery queue cleared</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <span>Team/stakeholders notified</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <span>Root cause identified</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <span>Incident report created</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <span>Follow-up plan established</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Separator />

              {/* Troubleshooting */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Common Issues & Solutions</h3>
                
                <div className="space-y-4">
                  {[
                    {
                      issue: "High Bounce Rate",
                      symptoms: "Bounce rate >5%, delivery failures",
                      solution: "Check contact list quality, validate email addresses, review domain reputation"
                    },
                    {
                      issue: "Low Open Rates",
                      symptoms: "Open rate significantly below industry average",
                      solution: "Review subject lines, check sender reputation, test A/B variants"
                    },
                    {
                      issue: "Webhook Failures",
                      symptoms: "Missing event data, tracking gaps",
                      solution: "Verify webhook URLs, check authentication, review endpoint logs"
                    },
                    {
                      issue: "API Rate Limits",
                      symptoms: "Send delays, 429 errors",
                      solution: "Review send volume, implement rate limiting, contact provider support"
                    }
                  ].map((item, index) => (
                    <Card key={index}>
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label className="text-sm font-semibold text-red-600">Issue</Label>
                            <p className="text-sm">{item.issue}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-semibold text-orange-600">Symptoms</Label>
                            <p className="text-sm text-muted-foreground">{item.symptoms}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-semibold text-green-600">Solution</Label>
                            <p className="text-sm text-muted-foreground">{item.solution}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Instruction Footer */}
      <InstructionFooter
        title="CookAIng Documentation"
        whatIsIt="In-app reference for concepts, workflows, and integrations."
        setupSteps={[
          "None — explore sections below."
        ]}
        usageSteps={[
          "Follow guides to configure features.",
          "Use links to jump to related tools."
        ]}
        relatedLinks={[{"label":"About", "href":"/cookaing-marketing/about"},{"label":"Integrations Health", "href":"/cookaing-marketing/integrations-health"}]}
      />
    </div>
  );
}