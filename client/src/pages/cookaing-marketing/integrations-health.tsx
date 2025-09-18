import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import InstructionFooter from '@/cookaing-marketing/components/InstructionFooter';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Settings, 
  RefreshCw,
  Mail,
  Bell,
  Brain,
  Webhook,
  ShoppingCart,
  Database,
  Share2,
  Clock,
  Info
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface IntegrationStatus {
  id: string;
  name: string;
  category: 'email' | 'social' | 'push' | 'webhook' | 'affiliate' | 'ai' | 'database';
  status: 'healthy' | 'warning' | 'error' | 'not_configured';
  message: string;
  details?: {
    providers?: string[];
    configuredKeys?: string[];
    missingKeys?: string[];
    lastChecked: string;
  };
}

interface IntegrationHealthResponse {
  success: boolean;
  data: {
    totalIntegrations: number;
    healthy: number;
    warnings: number;
    errors: number;
    notConfigured: number;
    lastUpdated: string;
    integrations: IntegrationStatus[];
  };
}

interface IntegrationHealthSummary {
  totalIntegrations: number;
  healthy: number;
  warnings: number;
  errors: number;
  notConfigured: number;
  lastUpdated: string;
  integrations: IntegrationStatus[];
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'email': return Mail;
    case 'push': return Bell;
    case 'ai': return Brain;
    case 'webhook': return Webhook;
    case 'affiliate': return ShoppingCart;
    case 'database': return Database;
    case 'social': return Share2;
    default: return Settings;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'healthy': return 'text-green-600 dark:text-green-400';
    case 'warning': return 'text-yellow-600 dark:text-yellow-400';
    case 'error': return 'text-red-600 dark:text-red-400';
    case 'not_configured': return 'text-gray-600 dark:text-gray-400';
    default: return 'text-gray-600 dark:text-gray-400';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'healthy': return CheckCircle;
    case 'warning': return AlertTriangle;
    case 'error': return XCircle;
    case 'not_configured': return Settings;
    default: return Info;
  }
};

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'healthy': return 'default';
    case 'warning': return 'secondary';
    case 'error': return 'destructive';
    case 'not_configured': return 'outline';
    default: return 'outline';
  }
};

export default function IntegrationsHealthPage() {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Fetch integration health summary
  const { data: healthResponse, isLoading, refetch } = useQuery<IntegrationHealthResponse>({
    queryKey: ['/api/cookaing-marketing/integrations/health'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Extract the actual health data from the response
  const healthSummary = healthResponse?.data;

  // Handle refresh
  const handleRefresh = async () => {
    try {
      await fetch('/api/cookaing-marketing/integrations/health/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      refetch();
      
      toast({
        title: "Health Status Refreshed",
        description: "Integration health status has been updated."
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh integration health status.",
        variant: "destructive"
      });
    }
  };

  // Filter integrations by category
  const filteredIntegrations = (healthSummary?.integrations || []).filter(integration => 
    selectedCategory === 'all' || integration.category === selectedCategory
  );

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(healthSummary?.integrations?.map(i => i.category) || []))];

  if (isLoading && !healthResponse) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Integration Health</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Monitor the status of all system integrations
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Integration Health
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor the status of all system integrations
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <Clock className="h-4 w-4" />
            Last updated: {healthSummary && healthSummary.lastUpdated ? new Date(healthSummary.lastUpdated).toLocaleString() : '--:--'}
          </p>
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            size="sm"
            data-testid="button-refresh-health"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {healthSummary && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
                  <p className="text-2xl font-bold">{healthSummary.totalIntegrations}</p>
                </div>
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Healthy</p>
                  <p className="text-2xl font-bold text-green-600">{healthSummary.healthy}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Warnings</p>
                  <p className="text-2xl font-bold text-yellow-600">{healthSummary.warnings}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Issues</p>
                  <p className="text-2xl font-bold text-red-600">{(healthSummary.errors || 0) + (healthSummary.notConfigured || 0)}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            data-testid={`button-filter-${category}`}
          >
            {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
          </Button>
        ))}
      </div>

      {/* Integration Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredIntegrations.map((integration) => {
          const CategoryIcon = getCategoryIcon(integration.category);
          const StatusIcon = getStatusIcon(integration.status);
          
          return (
            <Card key={integration.id} data-testid={`card-integration-${integration.id}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CategoryIcon className="h-5 w-5" />
                    <CardTitle className="text-lg">{integration.name}</CardTitle>
                  </div>
                  <Badge variant={getStatusBadgeVariant(integration.status)}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {integration.status.replace('_', ' ').charAt(0).toUpperCase() + integration.status.replace('_', ' ').slice(1)}
                  </Badge>
                </div>
                <CardDescription className="text-sm">
                  {integration.message}
                </CardDescription>
              </CardHeader>
              
              {integration.details && (
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {integration.details.providers && integration.details.providers.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-1">Active Providers</p>
                        <div className="flex flex-wrap gap-1">
                          {integration.details.providers.map((provider) => (
                            <Badge key={provider} variant="secondary" className="text-xs">
                              {provider}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {integration.details.configuredKeys && integration.details.configuredKeys.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-1">Configured Keys</p>
                        <div className="flex flex-wrap gap-1">
                          {integration.details.configuredKeys.map((key) => (
                            <Badge key={key} variant="outline" className="text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {key}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {integration.details.missingKeys && integration.details.missingKeys.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-1 text-yellow-600 dark:text-yellow-400">Missing Keys</p>
                        <div className="flex flex-wrap gap-1">
                          {integration.details.missingKeys.map((key) => (
                            <Badge key={key} variant="secondary" className="text-xs">
                              <XCircle className="h-3 w-3 mr-1" />
                              {key}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <Separator />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Last checked: {new Date(integration.details.lastChecked).toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* No integrations message */}
      {filteredIntegrations.length === 0 && healthSummary && (
        <Card>
          <CardContent className="text-center py-8">
            <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No integrations found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {selectedCategory === 'all' 
                ? 'No integrations are currently available.' 
                : `No integrations found in the ${selectedCategory} category.`}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Instruction Footer */}
      <InstructionFooter
        title="Integrations Health"
        whatIsIt="Real-time status and diagnostics for connected integrations."
        setupSteps={[
          "Add API keys for each provider (email, push, social, docs).",
          "Configure webhooks/callback URLs and test connectivity.",
          "Click 'Run Health Check' regularly."
        ]}
        usageSteps={[
          "Review status, error rates, and last sync.",
          "Re-auth or rotate keys when failures are detected.",
          "Drill into logs to resolve issues quickly."
        ]}
        envKeys={["RESEND_API_KEY","BREVO_API_KEY","SENDGRID_API_KEY","ONESIGNAL_API_KEY","BUFFER_API_KEY","NOTION_API_KEY","PERPLEXITY_API_KEY","GOOGLE_ANALYTICS_TRACKING_ID"]}
        featureFlags={["email","social","blog","push","trends"]}
        relatedLinks={[{"label":"Docs", "href":"/cookaing-marketing/docs"}]}
      />
    </div>
  );
}