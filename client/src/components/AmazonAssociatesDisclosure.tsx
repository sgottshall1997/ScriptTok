import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from 'lucide-react';

interface AmazonAssociatesDisclosureProps {
  variant?: 'compact' | 'detailed';
  className?: string;
}

export const AmazonAssociatesDisclosure: React.FC<AmazonAssociatesDisclosureProps> = ({ 
  variant = 'compact', 
  className = "" 
}) => {
  if (variant === 'detailed') {
    return (
      <Card className={`bg-blue-50 border-blue-200 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-2">Amazon Associates Disclosure</p>
              <p className="mb-2">
                <strong>As an Amazon Associate, I earn from qualifying purchases.</strong> 
                This means that when you click on Amazon links in this content and make a purchase, 
                I may receive a small commission at no extra cost to you.
              </p>
              <p className="text-xs text-blue-700">
                This helps support the continued development of this content creation tool. 
                All product recommendations are genuine and based on trending data.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`bg-amber-50 border border-amber-200 rounded-lg p-3 ${className}`}>
      <p className="text-sm text-amber-800 text-center">
        <strong>Disclosure:</strong> As an Amazon Associate, I earn from qualifying purchases.
      </p>
    </div>
  );
};