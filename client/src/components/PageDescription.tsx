import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Info, ExternalLink } from 'lucide-react';

interface PageDescriptionProps {
  title: string;
  description: string;
  category?: string;
  keyFeatures?: string[];
  relatedLinks?: { name: string; path: string }[];
  className?: string;
  showFeatures?: boolean;
  showRelatedLinks?: boolean;
  variant?: 'default' | 'compact';
}

export const PageDescription: React.FC<PageDescriptionProps> = ({
  title,
  description,
  category,
  keyFeatures = [],
  relatedLinks = [],
  className = '',
  showFeatures = true,
  showRelatedLinks = true,
  variant = 'default'
}) => {
  if (variant === 'compact') {
    return (
      <div className={`mb-6 ${className}`}>
        <div className="flex items-center gap-3 mb-2">
          <Info className="h-5 w-5 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {category && (
            <Badge variant="secondary" className="text-xs">
              {category}
            </Badge>
          )}
        </div>
        <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
      </div>
    );
  }

  return (
    <Card className={`mb-8 border-l-4 border-l-blue-600 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Info className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{title}</h1>
              {category && (
                <Badge variant="secondary" className="text-xs">
                  {category}
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <p className="text-gray-700 text-base leading-relaxed mb-6">
          {description}
        </p>

        {showFeatures && keyFeatures.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Key Features:</h3>
            <div className="flex flex-wrap gap-2">
              {keyFeatures.map((feature, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {feature}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {showRelatedLinks && relatedLinks.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Related Tools:</h3>
            <div className="flex flex-wrap gap-2">
              {relatedLinks.map((link, index) => (
                <Link key={index} href={link.path}>
                  <Button variant="ghost" size="sm" className="h-8 text-xs">
                    {link.name}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PageDescription;