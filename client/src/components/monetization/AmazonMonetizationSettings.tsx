import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, CheckCircle, DollarSign, Settings, Tag, Globe, Zap } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface MonetizationSettings {
  enabled: boolean;
  partnerTag: string;
  ascPrefix: string;
  nicheOverrides: Record<string, string>;
  autoInsertLinks: boolean;
  linkDensity: 'low' | 'medium' | 'high';
  trackingEnabled: boolean;
  complianceMode: boolean;
}

interface AmazonStatus {
  configured: boolean;
  connected: boolean;
  partnerTag?: string;
  region: string;
  error?: string;
}

const AVAILABLE_NICHES = [
  'tech', 'fitness', 'beauty', 'fashion', 'food', 'travel', 'pets'
];

const REGIONS = [
  { value: 'us-east-1', label: 'United States', domain: 'amazon.com' },
  { value: 'eu-west-1', label: 'United Kingdom', domain: 'amazon.co.uk' },
  { value: 'eu-central-1', label: 'Germany', domain: 'amazon.de' },
  { value: 'ap-northeast-1', label: 'Japan', domain: 'amazon.co.jp' }
];

export function AmazonMonetizationSettings() {
  const [settings, setSettings] = useState<MonetizationSettings>({
    enabled: false,
    partnerTag: '',
    ascPrefix: 'glowbot_',
    nicheOverrides: {},
    autoInsertLinks: true,
    linkDensity: 'medium',
    trackingEnabled: true,
    complianceMode: true
  });

  const [status, setStatus] = useState<AmazonStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Load current settings and Amazon status
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      // Load Amazon API status
      const statusResponse = await fetch('/api/amazon/status');
      const statusData = await statusResponse.json();
      setStatus(statusData);

      // Load monetization settings from localStorage for now
      const savedSettings = localStorage.getItem('amazon-monetization-settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      } else if (statusData.configured) {
        // Initialize with Amazon data if available
        setSettings(prev => ({
          ...prev,
          enabled: true,
          partnerTag: statusData.partnerTag || ''
        }));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast({
        title: 'Error loading settings',
        description: 'Failed to load Amazon monetization settings',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      
      // Save to localStorage for now (would be API call in production)
      localStorage.setItem('amazon-monetization-settings', JSON.stringify(settings));
      
      toast({
        title: 'Settings saved',
        description: 'Amazon monetization settings updated successfully'
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast({
        title: 'Error saving settings',
        description: 'Failed to save monetization settings',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async () => {
    try {
      const response = await fetch('/api/amazon/status');
      const data = await response.json();
      setStatus(data);
      
      if (data.apiStatus?.connected) {
        toast({
          title: 'Connection successful',
          description: 'Amazon PA-API is working correctly'
        });
      } else {
        toast({
          title: 'Connection failed',
          description: data.apiStatus?.error || 'Unable to connect to Amazon PA-API',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Test failed',
        description: 'Unable to test Amazon connection',
        variant: 'destructive'
      });
    }
  };

  const addNicheOverride = (niche: string, partnerTag: string) => {
    setSettings(prev => ({
      ...prev,
      nicheOverrides: {
        ...prev.nicheOverrides,
        [niche]: partnerTag
      }
    }));
  };

  const removeNicheOverride = (niche: string) => {
    setSettings(prev => ({
      ...prev,
      nicheOverrides: Object.fromEntries(
        Object.entries(prev.nicheOverrides).filter(([key]) => key !== niche)
      )
    }));
  };

  if (loading) {
    return (
      <Card data-testid="monetization-settings-loading">
        <CardContent className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6" data-testid="amazon-monetization-settings">
      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Amazon Affiliate Monetization
          </CardTitle>
          <CardDescription>
            Configure Amazon Product Advertising API integration for affiliate revenue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {status.configured ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
                <div>
                  <p className="font-medium">
                    {status.configured ? 'Amazon PA-API Configured' : 'Amazon PA-API Not Configured'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {status.configured 
                      ? `Partner Tag: ${status.partnerTag} • Region: ${status.region}`
                      : 'Run setup tool to configure Amazon credentials'
                    }
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={testConnection}
                data-testid="test-connection-button"
              >
                Test Connection
              </Button>
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Unable to load Amazon API status. Check your configuration.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Basic Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Basic Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Monetization</Label>
              <p className="text-sm text-muted-foreground">
                Automatically insert affiliate links in generated content
              </p>
            </div>
            <Switch
              checked={settings.enabled}
              onCheckedChange={(enabled) => setSettings(prev => ({ ...prev, enabled }))}
              data-testid="enable-monetization-toggle"
            />
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="partner-tag">Default Partner Tag</Label>
              <Input
                id="partner-tag"
                value={settings.partnerTag}
                onChange={(e) => setSettings(prev => ({ ...prev, partnerTag: e.target.value }))}
                placeholder="your-partner-tag-20"
                data-testid="partner-tag-input"
              />
              <p className="text-xs text-muted-foreground">
                Your Amazon Associates partner tag
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="asc-prefix">ASC Subtag Prefix</Label>
              <Input
                id="asc-prefix"
                value={settings.ascPrefix}
                onChange={(e) => setSettings(prev => ({ ...prev, ascPrefix: e.target.value }))}
                placeholder="glowbot_"
                data-testid="asc-prefix-input"
              />
              <p className="text-xs text-muted-foreground">
                Prefix for Amazon Attribution Service Campaign tracking
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Content Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-Insert Affiliate Links</Label>
              <p className="text-sm text-muted-foreground">
                Automatically add relevant product links to generated content
              </p>
            </div>
            <Switch
              checked={settings.autoInsertLinks}
              onCheckedChange={(autoInsertLinks) => 
                setSettings(prev => ({ ...prev, autoInsertLinks }))
              }
              data-testid="auto-insert-links-toggle"
            />
          </div>

          <div className="space-y-2">
            <Label>Link Density</Label>
            <Select
              value={settings.linkDensity}
              onValueChange={(linkDensity: 'low' | 'medium' | 'high') =>
                setSettings(prev => ({ ...prev, linkDensity }))
              }
            >
              <SelectTrigger data-testid="link-density-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low (1-2 links per post)</SelectItem>
                <SelectItem value="medium">Medium (2-4 links per post)</SelectItem>
                <SelectItem value="high">High (4+ links per post)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Controls how many affiliate links to include in content
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Compliance Mode</Label>
              <p className="text-sm text-muted-foreground">
                Add FTC disclosure statements and affiliate link warnings
              </p>
            </div>
            <Switch
              checked={settings.complianceMode}
              onCheckedChange={(complianceMode) =>
                setSettings(prev => ({ ...prev, complianceMode }))
              }
              data-testid="compliance-mode-toggle"
            />
          </div>
        </CardContent>
      </Card>

      {/* Niche-Specific Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Niche-Specific Partner Tags
          </CardTitle>
          <CardDescription>
            Override the default partner tag for specific niches
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {Object.entries(settings.nicheOverrides).map(([niche, partnerTag]) => (
              <div key={niche} className="flex items-center gap-3 p-3 border rounded-lg">
                <Badge variant="secondary" className="capitalize">
                  {niche}
                </Badge>
                <Input
                  value={partnerTag}
                  onChange={(e) => addNicheOverride(niche, e.target.value)}
                  placeholder="partner-tag-20"
                  className="flex-1"
                  data-testid={`niche-override-${niche}`}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeNicheOverride(niche)}
                  data-testid={`remove-niche-${niche}`}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Select onValueChange={(niche) => addNicheOverride(niche, '')}>
              <SelectTrigger className="w-48" data-testid="add-niche-select">
                <SelectValue placeholder="Add niche override" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_NICHES
                  .filter(niche => !settings.nicheOverrides[niche])
                  .map(niche => (
                    <SelectItem key={niche} value={niche}>
                      {niche.charAt(0).toUpperCase() + niche.slice(1)}
                    </SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
          </div>

          <p className="text-xs text-muted-foreground">
            Use different partner tags for different content niches to track performance
          </p>
        </CardContent>
      </Card>

      {/* Analytics & Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Analytics & Tracking
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Click Tracking</Label>
              <p className="text-sm text-muted-foreground">
                Track affiliate link clicks and performance
              </p>
            </div>
            <Switch
              checked={settings.trackingEnabled}
              onCheckedChange={(trackingEnabled) =>
                setSettings(prev => ({ ...prev, trackingEnabled }))
              }
              data-testid="tracking-enabled-toggle"
            />
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Analytics data will be available in the Reporting section once tracking is enabled.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={saveSettings}
          disabled={saving || !status?.configured}
          data-testid="save-settings-button"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}