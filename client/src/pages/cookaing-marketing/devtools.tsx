import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Code2, 
  Database,
  Bug,
  Download,
  Upload,
  FileText,
  Copy,
  Play,
  Settings,
  Terminal,
  Globe,
  Eye,
  Trash2
} from "lucide-react";

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  source: string;
  details?: object;
}

interface APIRequest {
  id: string;
  method: string;
  endpoint: string;
  timestamp: string;
  status: number;
  responseTime: number;
  userAgent?: string;
  ipAddress?: string;
}

// Mock log entries
const mockLogs: LogEntry[] = [
  {
    id: "1",
    timestamp: "2025-01-18T15:30:15Z",
    level: "info",
    message: "Content generation completed successfully",
    source: "content-generator",
    details: {
      contentId: "12345",
      niche: "fitness",
      platform: "tiktok",
      generationTime: "2.3s"
    }
  },
  {
    id: "2",
    timestamp: "2025-01-18T15:28:45Z",
    level: "warn",
    message: "High API usage detected",
    source: "rate-limiter",
    details: {
      apiKey: "openai_***456",
      requestCount: 450,
      limit: 500
    }
  },
  {
    id: "3",
    timestamp: "2025-01-18T15:25:30Z",
    level: "error",
    message: "Failed to connect to external API",
    source: "perplexity-api",
    details: {
      error: "Connection timeout",
      endpoint: "/api/search",
      retryAttempt: 3
    }
  },
  {
    id: "4",
    timestamp: "2025-01-18T15:20:12Z",
    level: "debug",
    message: "Database query executed",
    source: "database",
    details: {
      query: "SELECT * FROM trending_products",
      executionTime: "45ms",
      rowCount: 21
    }
  }
];

// Mock API requests
const mockAPIRequests: APIRequest[] = [
  {
    id: "1",
    method: "POST",
    endpoint: "/api/generate",
    timestamp: "2025-01-18T15:30:15Z",
    status: 200,
    responseTime: 2340,
    userAgent: "Mozilla/5.0 (Chrome/120.0.0.0)",
    ipAddress: "192.168.1.100"
  },
  {
    id: "2",
    method: "GET",
    endpoint: "/api/trending",
    timestamp: "2025-01-18T15:29:45Z",
    status: 200,
    responseTime: 156,
    userAgent: "Mozilla/5.0 (Chrome/120.0.0.0)",
    ipAddress: "192.168.1.100"
  },
  {
    id: "3",
    method: "PUT",
    endpoint: "/api/content/12345",
    timestamp: "2025-01-18T15:28:20Z",
    status: 404,
    responseTime: 89,
    userAgent: "Mozilla/5.0 (Firefox/121.0)",
    ipAddress: "192.168.1.101"
  },
  {
    id: "4",
    method: "DELETE",
    endpoint: "/api/content/67890",
    timestamp: "2025-01-18T15:27:10Z",
    status: 500,
    responseTime: 5000,
    userAgent: "Postman/10.0.0",
    ipAddress: "192.168.1.102"
  }
];

export default function DevToolsPage() {
  const [activeTab, setActiveTab] = useState("logs");
  const [logFilter, setLogFilter] = useState<string>("all");
  const [apiEndpoint, setApiEndpoint] = useState("");
  const [apiMethod, setApiMethod] = useState("GET");
  const [apiPayload, setApiPayload] = useState("");

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'info': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'warn': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'debug': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'POST': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'PUT': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'DELETE': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-600';
    if (status >= 400 && status < 500) return 'text-yellow-600';
    if (status >= 500) return 'text-red-600';
    return 'text-gray-600';
  };

  const filteredLogs = mockLogs.filter(log => 
    logFilter === "all" || log.level === logFilter
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const errorCount = mockLogs.filter(l => l.level === 'error').length;
  const warningCount = mockLogs.filter(l => l.level === 'warn').length;
  const avgResponseTime = mockAPIRequests.reduce((sum, r) => sum + r.responseTime, 0) / mockAPIRequests.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Code2 className="h-8 w-8" />
            Developer Tools
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Debug applications, view logs, test APIs, and manage system health
          </p>
        </div>
        <Button data-testid="button-export-logs">
          <Download className="h-4 w-4 mr-2" />
          Export Logs
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Logs</p>
                <p className="text-2xl font-bold">{mockLogs.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Errors</p>
                <p className="text-2xl font-bold text-red-600">{errorCount}</p>
              </div>
              <Bug className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Warnings</p>
                <p className="text-2xl font-bold text-yellow-600">{warningCount}</p>
              </div>
              <Database className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Response</p>
                <p className="text-2xl font-bold text-purple-600">{avgResponseTime.toFixed(0)}ms</p>
              </div>
              <Globe className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different dev tools */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="logs" data-testid="tab-logs">Application Logs</TabsTrigger>
          <TabsTrigger value="api-test" data-testid="tab-api-test">API Tester</TabsTrigger>
          <TabsTrigger value="requests" data-testid="tab-requests">Request Monitor</TabsTrigger>
          <TabsTrigger value="system" data-testid="tab-system">System Health</TabsTrigger>
        </TabsList>

        {/* Application Logs Tab */}
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Application Logs</CardTitle>
                  <CardDescription>
                    Real-time application logs with filtering and search
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={logFilter}
                    onChange={(e) => setLogFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm"
                    data-testid="select-log-filter"
                  >
                    <option value="all">All Levels</option>
                    <option value="error">Errors</option>
                    <option value="warn">Warnings</option>
                    <option value="info">Info</option>
                    <option value="debug">Debug</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredLogs.map((log) => (
                  <Card key={log.id} data-testid={`log-${log.id}`} className="bg-gray-50 dark:bg-gray-900">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge variant="outline" className={getLevelColor(log.level)}>
                              {log.level.toUpperCase()}
                            </Badge>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {formatDate(log.timestamp)}
                            </span>
                            <span className="text-sm text-gray-500">
                              {log.source}
                            </span>
                          </div>
                          <p className="text-gray-800 dark:text-gray-200 mb-2">
                            {log.message}
                          </p>
                          {log.details && (
                            <details className="text-sm">
                              <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                                View Details
                              </summary>
                              <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-x-auto">
                                {JSON.stringify(log.details, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button variant="outline" size="sm" data-testid={`button-copy-log-${log.id}`}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Tester Tab */}
        <TabsContent value="api-test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Endpoint Tester</CardTitle>
              <CardDescription>
                Test API endpoints directly from the interface
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-4">
                  <div>
                    <Label htmlFor="api-method">Method</Label>
                    <select
                      id="api-method"
                      value={apiMethod}
                      onChange={(e) => setApiMethod(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                      data-testid="select-api-method"
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="DELETE">DELETE</option>
                    </select>
                  </div>
                  <div className="md:col-span-3">
                    <Label htmlFor="api-endpoint">Endpoint</Label>
                    <Input 
                      id="api-endpoint"
                      placeholder="/api/generate"
                      value={apiEndpoint}
                      onChange={(e) => setApiEndpoint(e.target.value)}
                      data-testid="input-api-endpoint"
                    />
                  </div>
                </div>
                
                {(apiMethod === "POST" || apiMethod === "PUT") && (
                  <div>
                    <Label htmlFor="api-payload">Request Payload (JSON)</Label>
                    <Textarea
                      id="api-payload"
                      placeholder='{"key": "value"}'
                      rows={6}
                      value={apiPayload}
                      onChange={(e) => setApiPayload(e.target.value)}
                      data-testid="textarea-api-payload"
                    />
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Button data-testid="button-send-request">
                    <Play className="h-4 w-4 mr-2" />
                    Send Request
                  </Button>
                  <Button variant="outline" data-testid="button-clear-request">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                </div>

                {/* Response placeholder */}
                <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <CardContent className="p-6 text-center">
                    <Terminal className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Response will appear here
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Send a request to see the API response
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Request Monitor Tab */}
        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Request Monitor</CardTitle>
              <CardDescription>
                Real-time monitoring of all API requests and responses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAPIRequests.map((request) => (
                  <div key={request.id} 
                       className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
                       data-testid={`request-${request.id}`}>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className={getMethodColor(request.method)}>
                        {request.method}
                      </Badge>
                      <div>
                        <h3 className="font-semibold">{request.endpoint}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(request.timestamp)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                        <p className={`font-semibold ${getStatusColor(request.status)}`}>
                          {request.status}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Response Time</p>
                        <p className="font-semibold">{request.responseTime}ms</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 dark:text-gray-400">IP</p>
                        <p className="font-semibold text-xs">{request.ipAddress}</p>
                      </div>
                      <Button variant="outline" size="sm" data-testid={`button-details-${request.id}`}>
                        <Eye className="h-3 w-3 mr-1" />
                        Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Health Tab */}
        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Health Overview</CardTitle>
              <CardDescription>
                Monitor system performance and health metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <CardContent className="p-6 text-center">
                    <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Database Health
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Monitor database connections and performance
                    </p>
                    <Button variant="outline" data-testid="button-check-database">
                      <Database className="h-4 w-4 mr-2" />
                      Check Database
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <CardContent className="p-6 text-center">
                    <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      External APIs
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Check connectivity to external service APIs
                    </p>
                    <Button variant="outline" data-testid="button-check-apis">
                      <Globe className="h-4 w-4 mr-2" />
                      Test API Connections
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <CardContent className="p-6 text-center">
                    <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Configuration Check
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Verify system configuration and environment variables
                    </p>
                    <Button variant="outline" data-testid="button-check-config">
                      <Settings className="h-4 w-4 mr-2" />
                      Check Configuration
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <CardContent className="p-6 text-center">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      System Backup
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Create and manage system configuration backups
                    </p>
                    <Button variant="outline" data-testid="button-create-backup">
                      <Upload className="h-4 w-4 mr-2" />
                      Create Backup
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Help Text */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Code2 className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100">
                Developer Tools Usage
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Use these tools for debugging, monitoring, and maintaining system health. 
                Export logs for external analysis and regularly test API endpoints to ensure reliability.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}