import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ShoppingCart, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Package,
  Zap,
  Eye,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AutoInsertResult {
  success: boolean;
  message: string;
  result: {
    added: number;
    skipped: number;
  };
}

interface PreviewProduct {
  id: number;
  name: string;
  price: string;
  imageUrl: string;
  source: string;
  rating?: string;
}

interface PreviewResponse {
  success: boolean;
  count: number;
  products: PreviewProduct[];
}

interface AutoInsertAffiliateButtonProps {
  campaignId: number;
  contactId?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'secondary';
}

const AutoInsertAffiliateButton: React.FC<AutoInsertAffiliateButtonProps> = ({ 
  campaignId, 
  contactId,
  className = '',
  size = 'md',
  variant = 'default'
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<AutoInsertResult | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewProducts, setPreviewProducts] = useState<PreviewProduct[]>([]);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  const handleAutoInsert = async () => {
    if (!campaignId) {
      toast({
        title: "Error",
        description: "Campaign ID is required",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiRequest(
        'POST',
        `/api/cookaing-marketing/affiliate-auto-insert/campaigns/${campaignId}/auto-insert`,
        { contactId }
      );

      const result = await response.json() as AutoInsertResult;
      setLastResult(result);

      if (result.success) {
        toast({
          title: "Success",
          description: `${result.result.added} artifacts enriched with affiliate products`,
          variant: "default"
        });
      } else {
        toast({
          title: "Auto-Insert Failed",
          description: result.message || "Failed to auto-insert affiliate products",
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('Auto-insert error:', error);
      toast({
        title: "Error",
        description: "Failed to auto-insert affiliate products",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadProductPreview = async () => {
    setIsLoadingPreview(true);
    
    try {
      const params = new URLSearchParams({
        tags: 'cooking-essentials,kitchen-tools',
        category: 'kitchen',
        limit: '6'
      });
      
      if (contactId) {
        params.append('contactId', contactId.toString());
      }

      const response = await apiRequest(
        'GET',
        `/api/cookaing-marketing/affiliate-auto-insert/products/preview?${params.toString()}`
      );

      const result = await response.json() as PreviewResponse;

      if (result.success) {
        setPreviewProducts(result.products);
      } else {
        toast({
          title: "Preview Error",
          description: "Failed to load product preview",
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('Preview error:', error);
      toast({
        title: "Preview Error", 
        description: "Failed to load product preview",
        variant: "destructive"
      });
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handlePreviewOpen = () => {
    setShowPreview(true);
    loadProductPreview();
  };

  const getButtonSize = () => {
    switch (size) {
      case 'sm': return 'px-3 py-1 text-sm';
      case 'lg': return 'px-6 py-3 text-lg';
      default: return 'px-4 py-2';
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Main Auto-Insert Button */}
      <Button
        onClick={handleAutoInsert}
        disabled={isLoading}
        variant={variant}
        className={`${getButtonSize()} flex items-center gap-2`}
        data-testid="button-auto-insert-affiliate"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Zap className="h-4 w-4" />
        )}
        Auto-insert Affiliate Picks
      </Button>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviewOpen}
            className="flex items-center gap-1"
            data-testid="button-preview-products"
          >
            <Eye className="h-4 w-4" />
            Preview
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Affiliate Products Preview
            </DialogTitle>
            <DialogDescription>
              Preview of affiliate products that would be inserted into your campaign artifacts
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            {isLoadingPreview ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading products...</span>
              </div>
            ) : previewProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {previewProducts.map((product) => (
                  <Card key={product.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-16 h-16 rounded-lg object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64x64?text=Product';
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm mb-1 line-clamp-2">{product.name}</h4>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="text-xs">
                              {product.source}
                            </Badge>
                            {product.rating && (
                              <span className="text-xs text-yellow-600 flex items-center">
                                ⭐ {product.rating}
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-semibold text-green-600">{product.price}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No affiliate products found</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Results Display */}
      {lastResult && (
        <div className="ml-2">
          {lastResult.success ? (
            <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              {lastResult.result.added} added, {lastResult.result.skipped} skipped
            </Badge>
          ) : (
            <Badge variant="destructive">
              <AlertCircle className="h-3 w-3 mr-1" />
              Failed
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default AutoInsertAffiliateButton;