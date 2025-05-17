import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { TrendingProduct, SOURCE_COLORS } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

interface TrendingProductCardProps {
  product: TrendingProduct;
  rank: number;
  gradientClass?: string;
}

// Format large numbers with K/M suffix
const formatNumber = (num: number = 0) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

export const TrendingProductCard: React.FC<TrendingProductCardProps> = ({ 
  product, 
  rank, 
  gradientClass = "from-blue-500 to-violet-500" 
}) => {
  const getSourceColorClass = (source: string) => {
    if (source === "suggested") {
      return 'bg-indigo-100 text-indigo-800';
    }
    return SOURCE_COLORS[source as keyof typeof SOURCE_COLORS] || 'bg-gray-100 text-gray-800';
  };

  const handleAddProductToForm = (product: string) => {
    // Find the product input field and set its value
    const productInput = document.getElementById('product') as HTMLInputElement;
    if (productInput) {
      productInput.value = product;
      productInput.focus();

      // Find the closest form and navigate to it
      const form = productInput.closest('form');
      if (form) {
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="flex items-center p-4 gap-3">
          <div className={`bg-gradient-to-r ${gradientClass} text-white inline-flex items-center justify-center h-10 w-10 rounded-full flex-shrink-0 shadow-sm`}>
            <span className="text-sm font-bold">{rank}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-neutral-800 truncate">{product.title}</p>
            <div className="flex items-center mt-1">
              <span className={`inline-block text-xs px-2 py-0.5 rounded ${getSourceColorClass(product.source)} mr-2`}>
                {product.isAIGenerated ? 
                  '🤖 AI-' + product.source.charAt(0).toUpperCase() + product.source.slice(1) :
                  '🌐 ' + product.source.charAt(0).toUpperCase() + product.source.slice(1)
                }
              </span>
              <div className="text-xs text-neutral-500 truncate">
                {formatNumber(product.mentions || 0)} {product.isAIGenerated ? 'est. mentions' : 'mentions'}
              </div>
            </div>
          </div>
        </div>
        <div className="p-3 bg-muted flex justify-end">
          <Button 
            size="sm"
            variant="outline"
            className="text-xs font-medium" 
            onClick={() => handleAddProductToForm(product.title)}
          >
            <PlusIcon className="h-3.5 w-3.5 mr-1" />
            Use Product
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};