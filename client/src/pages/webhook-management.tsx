import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Play, Trash2, Save, TestTube, Activity, Calendar } from 'lucide-react';

interface NicheWebhook {
  niche: string;
  webhookUrl: string;
  enabled: boolean;
  lastUsed?: string;
  successCount?: number;
  failureCount?: number;
}

interface WebhookStats {
  niche: string;
  enabled: boolean;
  successCount: number;
  failureCount: number;
  lastUsed?: string;
  successRate: string;
}

const NICHES = [
  { value: 'beauty', label: 'Beauty & Personal Care', color: 'bg-pink-100 text-pink-800' },
  { value: 'tech', label: 'Tech & Gadgets', color: 'bg-blue-100 text-blue-800' },
  { value: 'fitness', label: 'Supplements & Fitness', color: 'bg-green-100 text-green-800' },
  { value: 'fashion', label: 'Fashion & Accessories', color: 'bg-purple-100 text-purple-800' },
  { value: 'food', label: 'Food & Kitchen', color: 'bg-orange-100 text-orange-800' },
  { value: 'travel', label: 'Travel & Gear', color: 'bg-teal-100 text-teal-800' },
  { value: 'pets', label: 'Pet Care & Supplies', color: 'bg-amber-100 text-amber-800' }
];

export default function WebhookManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [webhookConfigs, setWebhookConfigs] = useState<Record<string, NicheWebhook>>({});

  // Initialize default configurations
  useEffect(() => {
    const defaultConfigs: Record<string, NicheWebhook> = {};
    NICHES.forEach(niche => {
      defaultConfigs[niche.value] = {
        niche: niche.value,
        webhookUrl: '',
        enabled: false
      };
    });
    setWebhookConfigs(defaultConfigs);
  }, []);

  // Fetch existing webhook configurations
  const { data: existingWebhooks, isLoading } = useQuery({
    queryKey: ['/api/niche-webhooks'],
    queryFn: async () => {
      const response = await fetch('/api/niche-webhooks');
      if (!response.ok) throw new Error('Failed to fetch webhooks');
      return response.json();
    },
    onSuccess: (data) => {
      const configs = { ...webhookConfigs };
      Object.keys(data).forEach(niche => {
        configs[niche] = {
          ...configs[niche],
          ...data[niche]
        };
      });
      setWebhookConfigs(configs);
    }
  });

  // Fetch webhook statistics
  const { data: webhookStats } = useQuery({
    queryKey: ['/api/niche-webhooks/stats/all'],
    queryFn: async () => {
      const response = await fetch('/api/niche-webhooks/stats/all');
      if (!response.ok) throw new Error('Failed to fetch webhook stats');
      return response.json() as WebhookStats[];
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Update webhook mutation
  const updateWebhookMutation = useMutation({
    mutationFn: async ({ niche, config }: { niche: string; config: NicheWebhook }) => {
      const response = await fetch(`/api/niche-webhooks/${niche}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      if (!response.ok) throw new Error('Failed to update webhook');
      return response.json();
    },
    onSuccess: (_, { niche }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/niche-webhooks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/niche-webhooks/stats/all'] });
      toast({
        title: "Webhook Updated",
        description: `${niche} webhook configuration saved successfully.`
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update webhook",
        variant: "destructive"
      });
    }
  });

  // Test webhook mutation
  const testWebhookMutation = useMutation({
    mutationFn: async (niche: string) => {
      const response = await fetch(`/api/niche-webhooks/${niche}/test`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to test webhook');
      return response.json();
    },
    onSuccess: (data, niche) => {
      queryClient.invalidateQueries({ queryKey: ['/api/niche-webhooks/stats/all'] });
      toast({
        title: data.success ? "Test Successful" : "Test Failed",
        description: data.message,
        variant: data.success ? "default" : "destructive"
      });
    },
    onError: (error) => {
      toast({
        title: "Test Failed",
        description: error instanceof Error ? error.message : "Failed to test webhook",
        variant: "destructive"
      });
    }
  });

  // Delete webhook mutation
  const deleteWebhookMutation = useMutation({
    mutationFn: async (niche: string) => {
      const response = await fetch(`/api/niche-webhooks/${niche}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete webhook');
      return response.json();
    },
    onSuccess: (_, niche) => {
      queryClient.invalidateQueries({ queryKey: ['/api/niche-webhooks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/niche-webhooks/stats/all'] });
      
      // Reset local config
      setWebhookConfigs(prev => ({
        ...prev,
        [niche]: {
          niche,
          webhookUrl: '',
          enabled: false
        }
      }));
      
      toast({
        title: "Webhook Deleted",
        description: `${niche} webhook configuration removed.`
      });
    },
    onError: (error) => {
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Failed to delete webhook",
        variant: "destructive"
      });
    }
  });

  const handleWebhookChange = (niche: string, field: keyof NicheWebhook, value: string | boolean) => {
    setWebhookConfigs(prev => ({
      ...prev,
      [niche]: {
        ...prev[niche],
        [field]: value
      }
    }));
  };

  const handleSaveWebhook = (niche: string) => {
    const config = webhookConfigs[niche];
    if (!config.webhookUrl.trim()) {
      toast({
        title: "Validation Error",
        description: "Webhook URL is required",
        variant: "destructive"
      });
      return;
    }
    updateWebhookMutation.mutate({ niche, config });
  };

  const getStatsForNiche = (niche: string): WebhookStats | undefined => {
    return webhookStats?.find(stat => stat.niche === niche);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg">Loading webhook configurations...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Niche Webhook Management
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Configure separate Make.com webhooks for each content niche to route generated content dynamically.
          Each niche can have its own automation workflow and distribution strategy.
        </p>
      </div>

      {/* Summary Stats */}
      {webhookStats && webhookStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Webhook Statistics Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
              {webhookStats.map(stat => {
                const nicheInfo = NICHES.find(n => n.value === stat.niche);
                return (
                  <div key={stat.niche} className="text-center space-y-2">
                    <Badge className={nicheInfo?.color || 'bg-gray-100 text-gray-800'}>
                      {nicheInfo?.label || stat.niche}
                    </Badge>
                    <div className="text-sm space-y-1">
                      <div className="font-medium">{stat.successRate}% Success</div>
                      <div className="text-xs text-muted-foreground">
                        {stat.successCount}✓ / {stat.failureCount}✗
                      </div>
                      {stat.lastUsed && (
                        <div className="text-xs text-muted-foreground">
                          Last: {new Date(stat.lastUsed).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Webhook Configurations */}
      <div className="grid gap-6">
        {NICHES.map(niche => {
          const config = webhookConfigs[niche.value];
          const stats = getStatsForNiche(niche.value);
          
          return (
            <Card key={niche.value} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge className={niche.color}>
                      {niche.label}
                    </Badge>
                    {config?.enabled && (
                      <Badge variant="outline" className="text-green-600">
                        Active
                      </Badge>
                    )}
                  </div>
                  
                  {stats && (
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Activity className="h-4 w-4" />
                        {stats.successRate}% Success
                      </div>
                      {stats.lastUsed && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Last used: {new Date(stats.lastUsed).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`webhook-url-${niche.value}`}>
                      Make.com Webhook URL
                    </Label>
                    <Input
                      id={`webhook-url-${niche.value}`}
                      type="url"
                      placeholder="https://hook.us2.make.com/..."
                      value={config?.webhookUrl || ''}
                      onChange={(e) => handleWebhookChange(niche.value, 'webhookUrl', e.target.value)}
                      className="font-mono text-sm"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`enabled-${niche.value}`}
                        checked={config?.enabled || false}
                        onCheckedChange={(checked) => handleWebhookChange(niche.value, 'enabled', checked)}
                      />
                      <Label htmlFor={`enabled-${niche.value}`}>
                        Enable webhook for {niche.label}
                      </Label>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testWebhookMutation.mutate(niche.value)}
                        disabled={!config?.webhookUrl || !config?.enabled || testWebhookMutation.isPending}
                      >
                        <TestTube className="h-4 w-4 mr-1" />
                        Test
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSaveWebhook(niche.value)}
                        disabled={updateWebhookMutation.isPending}
                      >
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                      
                      {config?.webhookUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteWebhookMutation.mutate(niche.value)}
                          disabled={deleteWebhookMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                
                {stats && (stats.successCount > 0 || stats.failureCount > 0) && (
                  <>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Successful deliveries:</span>
                        <span className="ml-2 font-medium text-green-600">{stats.successCount}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Failed deliveries:</span>
                        <span className="ml-2 font-medium text-red-600">{stats.failureCount}</span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
          <CardDescription>
            How to configure niche-specific webhooks with Make.com
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Create a new scenario in Make.com for each niche you want to automate</li>
            <li>Add a "Webhook" trigger module to receive content from GlowBot</li>
            <li>Copy the webhook URL from Make.com and paste it into the corresponding niche above</li>
            <li>Enable the webhook and test the connection using the "Test" button</li>
            <li>In Make.com, add modules to process and distribute content (e.g., social media posting, email campaigns)</li>
            <li>When content is generated for a specific niche, it will automatically be sent to that niche's webhook</li>
          </ol>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Webhook Payload Structure</h4>
            <pre className="text-xs text-blue-800 overflow-x-auto">
{`{
  "event_type": "content_generated",
  "timestamp": "2025-01-01T00:00:00Z",
  "niche": "beauty",
  "product_name": "CeraVe Daily Moisturizer",
  "platforms": ["TikTok", "Instagram"],
  "content": {
    "main_content": "Generated content...",
    "hook": "You won't believe this...",
    "platform_captions": {
      "TikTok": "TikTok-specific caption",
      "Instagram": "Instagram-specific caption"
    },
    "hashtags": ["#beauty", "#skincare"]
  },
  "affiliate_link": "https://amazon.com/...",
  "metadata": {
    "tone": "enthusiastic",
    "template": "product_review",
    "generation_mode": "manual"
  }
}`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}