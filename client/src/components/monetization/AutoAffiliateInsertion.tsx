import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Zap, 
  Link, 
  Target, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  ShoppingCart,
  Eye
} from 'lucide-react';

interface AutoInsertionSettings {
  enabled: boolean;
  timing: 'before' | 'during' | 'after';
  density: 'low' | 'medium' | 'high';
  placement: 'contextual' | 'random' | 'end';
  maxLinks: number;
  matchThreshold: number;
}

interface ContentPreview {
  original: string;
  enhanced: string;
  linksAdded: number;
  products: Array<{
    title: string;
    placement: string;
    relevanceScore: number;
  }>;
}

interface AutoAffiliateInsertionProps {
  content?: string;
  niche?: string;
  onContentUpdate?: (enhancedContent: string) => void;
}

export function AutoAffiliateInsertion({ 
  content = '', 
  niche = 'tech',
  onContentUpdate 
}: AutoAffiliateInsertionProps) {
  const [settings, setSettings] = useState<AutoInsertionSettings>({
    enabled: true,
    timing: 'during',
    density: 'medium',
    placement: 'contextual',
    maxLinks: 3,
    matchThreshold: 0.7
  });

  const [previewMode, setPreviewMode] = useState(false);
  const { toast } = useToast();

  // Fetch enhanced content preview
  const { data: preview, isLoading: previewLoading, refetch: generatePreview } = useQuery({
    queryKey: ['/api/content/enhance-affiliate-links', { 
      content, 
      niche, 
      settings 
    }],
    enabled: false // Manual trigger only
  });

  const handleEnhanceContent = async () => {
    try {
      await generatePreview();
      setPreviewMode(true);
    } catch (error) {
      toast({
        title: 'Enhancement failed',
        description: 'Unable to enhance content with affiliate links',
        variant: 'destructive'
      });
    }
  };

  const handleApplyEnhancements = () => {
    if (preview?.enhanced && onContentUpdate) {
      onContentUpdate(preview.enhanced);
      toast({
        title: 'Content enhanced',
        description: `Added ${preview.linksAdded} affiliate links to your content`
      });
      setPreviewMode(false);
    }
  };

  const getDensityDescription = (density: string) => {
    switch (density) {
      case 'low': return '1-2 links per 500 words';
      case 'medium': return '2-4 links per 500 words';
      case 'high': return '4+ links per 500 words';
      default: return '';
    }
  };

  const getPlacementDescription = (placement: string) => {
    switch (placement) {
      case 'contextual': return 'Insert near relevant keywords';
      case 'random': return 'Distribute randomly throughout';
      case 'end': return 'Add at the end of content';
      default: return '';
    }
  };

  return (
    <div className="space-y-4" data-testid="auto-affiliate-insertion">
      {/* Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Auto Affiliate Insertion
          </CardTitle>
          <CardDescription>
            Automatically enhance your content with relevant Amazon affiliate links
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Enable Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Enable Auto-Insertion</p>
              <p className="text-xs text-muted-foreground">
                Automatically add affiliate links to generated content
              </p>
            </div>
            <Switch
              checked={settings.enabled}
              onCheckedChange={(enabled) => setSettings(prev => ({ ...prev, enabled }))}
              data-testid="enable-auto-insertion"
            />
          </div>

          <Separator />

          {/* Link Density */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Link Density</p>
                <p className="text-xs text-muted-foreground">
                  {getDensityDescription(settings.density)}
                </p>
              </div>
              <Badge variant="outline" className="capitalize">
                {settings.density}
              </Badge>
            </div>
            <Select
              value={settings.density}
              onValueChange={(density: 'low' | 'medium' | 'high') =>
                setSettings(prev => ({ ...prev, density }))
              }
            >
              <SelectTrigger data-testid="density-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low Density</SelectItem>
                <SelectItem value="medium">Medium Density</SelectItem>
                <SelectItem value="high">High Density</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Placement Strategy */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Placement Strategy</p>
                <p className="text-xs text-muted-foreground">
                  {getPlacementDescription(settings.placement)}
                </p>
              </div>
              <Badge variant="outline" className="capitalize">
                {settings.placement}
              </Badge>
            </div>
            <Select
              value={settings.placement}
              onValueChange={(placement: 'contextual' | 'random' | 'end') =>
                setSettings(prev => ({ ...prev, placement }))
              }
            >
              <SelectTrigger data-testid="placement-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="contextual">Contextual Placement</SelectItem>
                <SelectItem value="random">Random Distribution</SelectItem>
                <SelectItem value="end">End of Content</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Max Links Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Maximum Links</p>
              <Badge variant="outline">{settings.maxLinks}</Badge>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={settings.maxLinks}
              onChange={(e) => setSettings(prev => ({ 
                ...prev, 
                maxLinks: parseInt(e.target.value) 
              }))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              data-testid="max-links-slider"
            />
            <p className="text-xs text-muted-foreground">
              Limit the total number of affiliate links per piece of content
            </p>
          </div>

          {/* Timing */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Insertion Timing</p>
            <Select
              value={settings.timing}
              onValueChange={(timing: 'before' | 'during' | 'after') =>
                setSettings(prev => ({ ...prev, timing }))
              }
            >
              <SelectTrigger data-testid="timing-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="before">Before content generation</SelectItem>
                <SelectItem value="during">During content generation</SelectItem>
                <SelectItem value="after">After content generation</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Content Enhancement */}
      {content && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Content Enhancement
            </CardTitle>
            <CardDescription>
              Preview and apply affiliate link enhancements to your content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Button
                onClick={handleEnhanceContent}
                disabled={!settings.enabled || previewLoading}
                data-testid="enhance-content-button"
              >
                {previewLoading ? (
                  <>Enhancing...</>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Preview Enhancement
                  </>
                )}
              </Button>
              
              {preview && previewMode && (
                <Button
                  onClick={handleApplyEnhancements}
                  variant="default"
                  data-testid="apply-enhancements-button"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Apply Changes
                </Button>
              )}
            </div>

            {/* Enhancement Stats */}
            {preview && previewMode && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex items-center gap-1">
                    <Link className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">{preview.linksAdded} Links Added</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ShoppingCart className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">{preview.products.length} Products</span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  {preview.products.map((product, index) => (
                    <div key={index} className="flex items-center justify-between text-xs">
                      <span className="truncate max-w-[200px]">{product.title}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {(product.relevanceScore * 100).toFixed(0)}% match
                        </Badge>
                        <span className="text-muted-foreground">{product.placement}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Content Preview */}
            {preview && previewMode && (
              <div className="border rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-sm font-medium">Enhanced Content Preview</h4>
                  <Badge variant="outline" className="text-xs">
                    +{preview.linksAdded} affiliate links
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground max-h-32 overflow-y-auto">
                  {preview.enhanced.substring(0, 300)}...
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Guidelines Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-yellow-100 rounded-full">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Best Practices</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Keep affiliate links contextual and relevant to your content</li>
                <li>• Don't oversaturate content - quality over quantity</li>
                <li>• Always include FTC disclosure when required</li>
                <li>• Test different placements to optimize click-through rates</li>
                <li>• Monitor performance and adjust settings accordingly</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}