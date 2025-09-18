import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import InstructionFooter from '@/cookaing-marketing/components/InstructionFooter';
import { Textarea } from "@/components/ui/textarea";
import { 
  Webhook, 
  Plus, 
  Search,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  Copy,
  Send
} from "lucide-react";

interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: 'active' | 'inactive' | 'error';
  lastTriggered: string;
  totalRequests: number;
  successRate: number;
  secretKey: string;
}

interface WebhookLog {
  id: string;
  endpointId: string;
  endpointName: string;
  event: string;
  timestamp: string;
  httpStatus: number;
  responseTime: number;
  success: boolean;
  payload: object;
  response?: string;
  error?: string;
}

// Mock webhook endpoints
const mockEndpoints: WebhookEndpoint[] = [
  {
    id: "1",
    name: "Make.com Integration",
    url: "https://hook.us1.make.com/xyz123",
    events: ["content.generated", "campaign.sent", "user.converted"],
    status: "active",
    lastTriggered: "2025-01-18T15:30:00Z",
    totalRequests: 1245,
    successRate: 98.5,
    secretKey: "wh_sec_abc123xyz"
  },
  {
    id: "2",
    name: "Zapier Automation",
    url: "https://hooks.zapier.com/hooks/catch/456789",
    events: ["form.submitted", "user.subscribed"],
    status: "active",
    lastTriggered: "2025-01-18T14:22:00Z",
    totalRequests: 892,
    successRate: 99.2,
    secretKey: "wh_sec_def456abc"
  },
  {
    id: "3",
    name: "CRM Sync",
    url: "https://api.crm-example.com/webhooks",
    events: ["contact.created", "contact.updated"],
    status: "error",
    lastTriggered: "2025-01-17T09:15:00Z",
    totalRequests: 567,
    successRate: 87.3,
    secretKey: "wh_sec_ghi789def"
  }
];

// Mock webhook logs
const mockLogs: WebhookLog[] = [
  {
    id: "1",
    endpointId: "1",
    endpointName: "Make.com Integration",
    event: "content.generated",
    timestamp: "2025-01-18T15:30:00Z",
    httpStatus: 200,
    responseTime: 245,
    success: true,
    payload: {
      event: "content.generated",
      data: {
        contentId: "12345",
        niche: "fitness",
        platforms: ["tiktok", "instagram"],
        generatedAt: "2025-01-18T15:29:45Z"
      }
    },
    response: "OK"
  },
  {
    id: "2",
    endpointId: "2",
    endpointName: "Zapier Automation",
    event: "form.submitted",
    timestamp: "2025-01-18T14:22:00Z",
    httpStatus: 200,
    responseTime: 1420,
    success: true,
    payload: {
      event: "form.submitted",
      data: {
        formId: "contact-form",
        name: "John Doe",
        email: "john@example.com",
        message: "Interested in meal prep guides"
      }
    },
    response: "Accepted"
  },
  {
    id: "3",
    endpointId: "3",
    endpointName: "CRM Sync",
    event: "contact.created",
    timestamp: "2025-01-17T09:15:00Z",
    httpStatus: 500,
    responseTime: 5000,
    success: false,
    payload: {
      event: "contact.created",
      data: {
        contactId: "67890",
        email: "user@example.com",
        source: "newsletter"
      }
    },
    error: "Internal Server Error"
  }
];

export default function WebhooksPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showAddForm, setShowAddForm] = useState(false);

  const filteredEndpoints = mockEndpoints.filter(endpoint => {
    const matchesSearch = endpoint.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         endpoint.url.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || endpoint.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'inactive': return Clock;
      case 'error': return XCircle;
      default: return AlertTriangle;
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

  const totalRequests = mockEndpoints.reduce((sum, e) => sum + e.totalRequests, 0);
  const avgSuccessRate = mockEndpoints.reduce((sum, e) => sum + e.successRate, 0) / mockEndpoints.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Webhook className="h-8 w-8" />
            Webhooks Monitor
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor webhook endpoints, delivery status, and payload logs
          </p>
        </div>
        <Button 
          onClick={() => setShowAddForm(!showAddForm)}
          data-testid="button-add-webhook"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Webhook
        </Button>
      </div>

      {/* Add Webhook Form */}
      {showAddForm && (
        <Card className="border-2 border-dashed border-blue-300 dark:border-blue-600">
          <CardHeader>
            <CardTitle>Add New Webhook Endpoint</CardTitle>
            <CardDescription>
              Configure a webhook endpoint to receive real-time event notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="webhook-name">Endpoint Name</Label>
                  <Input 
                    id="webhook-name" 
                    placeholder="e.g. Make.com Integration"
                    data-testid="input-webhook-name"
                  />
                </div>
                <div>
                  <Label htmlFor="webhook-url">Webhook URL</Label>
                  <Input 
                    id="webhook-url" 
                    placeholder="https://your-endpoint.com/webhook"
                    data-testid="input-webhook-url"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="webhook-events">Events to Subscribe</Label>
                <Textarea
                  id="webhook-events"
                  placeholder="content.generated, campaign.sent, user.converted"
                  data-testid="textarea-webhook-events"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Button data-testid="button-save-webhook">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Webhook
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddForm(false)}
                  data-testid="button-cancel-webhook"
                >
                  Cancel
                </Button>
                <Button variant="outline" data-testid="button-test-webhook">
                  <Send className="h-4 w-4 mr-2" />
                  Test Endpoint
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Endpoints</p>
                <p className="text-2xl font-bold">{mockEndpoints.length}</p>
              </div>
              <Webhook className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {mockEndpoints.filter(e => e.status === 'active').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Requests</p>
                <p className="text-2xl font-bold text-purple-600">{totalRequests.toLocaleString()}</p>
              </div>
              <Send className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Success Rate</p>
                <p className="text-2xl font-bold text-orange-600">{avgSuccessRate.toFixed(1)}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search webhooks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
            data-testid="input-search-webhooks"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm"
            data-testid="select-status-filter"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="error">Error</option>
          </select>
        </div>
      </div>

      {/* Webhook Endpoints */}
      <Card>
        <CardHeader>
          <CardTitle>Webhook Endpoints</CardTitle>
          <CardDescription>
            Manage and monitor all configured webhook endpoints
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredEndpoints.map((endpoint) => {
              const StatusIcon = getStatusIcon(endpoint.status);
              
              return (
                <Card key={endpoint.id} data-testid={`card-webhook-${endpoint.id}`} 
                      className="border-l-4 border-l-blue-500">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{endpoint.name}</h3>
                          <Badge variant="outline" className={getStatusColor(endpoint.status)}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {endpoint.status.charAt(0).toUpperCase() + endpoint.status.slice(1)}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 mb-3">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            <strong>URL:</strong> {endpoint.url}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            <strong>Events:</strong> {endpoint.events.join(', ')}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            <strong>Last Triggered:</strong> {formatDate(endpoint.lastTriggered)}
                          </div>
                        </div>

                        <div className="grid gap-3 md:grid-cols-3">
                          <div className="text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Requests</p>
                            <p className="text-lg font-semibold">{endpoint.totalRequests.toLocaleString()}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Success Rate</p>
                            <p className="text-lg font-semibold text-green-600">{endpoint.successRate}%</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Secret Key</p>
                            <div className="flex items-center gap-1">
                              <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                {endpoint.secretKey.slice(0, 12)}...
                              </code>
                              <Button variant="ghost" size="sm" data-testid={`button-copy-${endpoint.id}`}>
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Button variant="outline" size="sm" data-testid={`button-logs-${endpoint.id}`}>
                          <Eye className="h-3 w-3 mr-1" />
                          Logs
                        </Button>
                        <Button variant="outline" size="sm" data-testid={`button-edit-${endpoint.id}`}>
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" data-testid={`button-test-${endpoint.id}`}>
                          <Send className="h-3 w-3 mr-1" />
                          Test
                        </Button>
                        <Button variant="outline" size="sm" data-testid={`button-delete-${endpoint.id}`}>
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

      {/* Recent Webhook Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Webhook Activity</CardTitle>
          <CardDescription>
            Latest webhook delivery attempts and responses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockLogs.map((log) => (
              <div key={log.id} 
                   className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
                   data-testid={`log-${log.id}`}>
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full ${log.success ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
                    {log.success ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold">{log.endpointName}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {log.event} • {formatDate(log.timestamp)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                    <p className={`font-semibold ${log.success ? 'text-green-600' : 'text-red-600'}`}>
                      {log.httpStatus}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Response Time</p>
                    <p className="font-semibold">{log.responseTime}ms</p>
                  </div>
                  <Button variant="outline" size="sm" data-testid={`button-view-log-${log.id}`}>
                    <Eye className="h-3 w-3 mr-1" />
                    View Payload
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      {filteredEndpoints.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Webhook className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No webhook endpoints found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm || statusFilter !== "all" 
                ? "Try adjusting your search or filter criteria."
                : "Create your first webhook endpoint to receive real-time notifications."
              }
            </p>
            {!searchTerm && statusFilter === "all" && (
              <Button data-testid="button-create-first-webhook">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Webhook
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Help Text */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Webhook className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100">
                Webhook Integration Guide
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Webhooks enable real-time data sync with external platforms like Make.com, Zapier, and CRMs. 
                Use secret keys for security and monitor delivery status to ensure reliable data flow.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instruction Footer */}
      <InstructionFooter
        title="Webhooks Monitor"
        whatIsIt="Monitor webhook endpoints, delivery status, and payload logs for real-time integrations."
        setupSteps={[
          "Add webhook endpoints for platforms like Make.com, Zapier, and CRMs.",
          "Use secret keys for security and configure retry policies."
        ]}
        usageSteps={[
          "Monitor delivery status and troubleshoot failed webhooks.",
          "Use payload logs to debug integration issues and ensure reliable data flow."
        ]}
      />
    </div>
  );
}