import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Link } from 'wouter';
import { 
  Info, 
  Settings, 
  Play, 
  ExternalLink, 
  CheckCircle,
  HelpCircle,
  AlertCircle
} from 'lucide-react';

interface AboutThisPageProps {
  title: string;
  whatItDoes: string;
  setupRequirements: string[];
  usageInstructions: string[];
  relatedLinks?: Array<{name: string; path: string}>;
  notes?: string[];
}

const AboutThisPage: React.FC<AboutThisPageProps> = ({
  title,
  whatItDoes,
  setupRequirements,
  usageInstructions,
  relatedLinks = [],
  notes = []
}) => {
  return (
    <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8">
      <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg text-blue-900 dark:text-blue-100">
            <Info className="w-5 h-5" />
            About this page
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* What this is */}
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white mb-2">
              <HelpCircle className="w-4 h-4" />
              What this is
            </h4>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {whatItDoes}
            </p>
          </div>

          <Separator className="my-4" />

          {/* Setup Steps */}
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white mb-3">
              <Settings className="w-4 h-4" />
              Setup
            </h4>
            <ul className="space-y-2">
              {setupRequirements.map((step, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-0.5 text-xs px-2 py-0.5">
                    {index + 1}
                  </Badge>
                  <span className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                    {step}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <Separator className="my-4" />

          {/* How to use */}
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white mb-3">
              <Play className="w-4 h-4" />
              How to use
            </h4>
            <ul className="space-y-2">
              {usageInstructions.map((step, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                    {step}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Related Links */}
          {relatedLinks.length > 0 && (
            <>
              <Separator className="my-4" />
              <div>
                <h4 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white mb-3">
                  <ExternalLink className="w-4 h-4" />
                  Related pages
                </h4>
                <div className="flex flex-wrap gap-2">
                  {relatedLinks.map((link, index) => (
                    <Button 
                      key={index} 
                      asChild 
                      variant="outline" 
                      size="sm"
                      className="text-xs"
                    >
                      <Link href={link.path}>
                        {link.name}
                      </Link>
                    </Button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Notes */}
          {notes.length > 0 && (
            <>
              <Separator className="my-4" />
              <div>
                <h4 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white mb-3">
                  <AlertCircle className="w-4 h-4" />
                  Important notes
                </h4>
                <ul className="space-y-2">
                  {notes.map((note, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                        {note}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {/* Footer */}
          <div className="pt-4 border-t border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-700 dark:text-blue-300 text-center">
              <strong>{title}</strong> • Part of the GlowBot AI Platform • For Spence's Reference
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AboutThisPage;