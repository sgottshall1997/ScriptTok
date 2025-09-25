import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Link } from 'wouter';
import { 
  ChevronDown, 
  ChevronUp, 
  Settings, 
  Play, 
  ExternalLink, 
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';

interface InstructionFooterProps {
  setupRequirements?: string[];
  usageInstructions?: string[];
  relatedLinks?: { name: string; path: string }[];
  notes?: string[];
  troubleshooting?: { issue: string; solution: string }[];
  className?: string;
  variant?: 'default' | 'compact';
}

export const InstructionFooter: React.FC<InstructionFooterProps> = ({
  setupRequirements = [],
  usageInstructions = [],
  relatedLinks = [],
  notes = [],
  troubleshooting = [],
  className = '',
  variant = 'default'
}) => {
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    setup: false,
    usage: false,
    links: false,
    notes: false,
    troubleshooting: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (variant === 'compact') {
    return (
      <div className={`mt-12 pt-8 border-t border-gray-200 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {usageInstructions.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                <Play className="h-4 w-4 mr-2 text-green-600" />
                Quick Start
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {usageInstructions.slice(0, 3).map((instruction, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-gray-400 mr-2">{index + 1}.</span>
                    {instruction}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {relatedLinks.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                <ExternalLink className="h-4 w-4 mr-2 text-blue-600" />
                Related Tools
              </h4>
              <div className="space-y-1">
                {relatedLinks.slice(0, 3).map((link, index) => (
                  <Link key={index} href={link.path}>
                    <Button variant="ghost" size="sm" className="h-7 text-xs justify-start p-1">
                      {link.name}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {notes.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                <Info className="h-4 w-4 mr-2 text-orange-600" />
                Important Notes
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {notes.slice(0, 2).map((note, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-orange-400 mr-2">•</span>
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  const hasContent = setupRequirements.length > 0 || usageInstructions.length > 0 || relatedLinks.length > 0 || notes.length > 0 || troubleshooting.length > 0;

  if (!hasContent) {
    return null;
  }

  return (
    <div className={`mt-12 ${className}`}>
      <Separator className="mb-8" />
      
      <Card className="border-l-4 border-l-gray-300">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-gray-900 flex items-center">
            <Info className="h-5 w-5 mr-2 text-gray-600" />
            Setup & Usage Instructions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Setup Requirements */}
          {setupRequirements.length > 0 && (
            <Collapsible open={expandedSections.setup} onOpenChange={() => toggleSection('setup')}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                  <div className="flex items-center">
                    <Settings className="h-4 w-4 mr-2 text-orange-600" />
                    <span className="font-semibold text-gray-900">Setup Requirements</span>
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {setupRequirements.length} items
                    </Badge>
                  </div>
                  {expandedSections.setup ? (
                    <ChevronUp className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-4">
                <div className="pl-6">
                  <ul className="space-y-2">
                    {setupRequirements.map((requirement, index) => (
                      <li key={index} className="flex items-start text-sm text-gray-700">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                        {requirement}
                      </li>
                    ))}
                  </ul>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Usage Instructions */}
          {usageInstructions.length > 0 && (
            <Collapsible open={expandedSections.usage} onOpenChange={() => toggleSection('usage')}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                  <div className="flex items-center">
                    <Play className="h-4 w-4 mr-2 text-green-600" />
                    <span className="font-semibold text-gray-900">Usage Steps</span>
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {usageInstructions.length} steps
                    </Badge>
                  </div>
                  {expandedSections.usage ? (
                    <ChevronUp className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-4">
                <div className="pl-6">
                  <ol className="space-y-3">
                    {usageInstructions.map((instruction, index) => (
                      <li key={index} className="flex items-start text-sm text-gray-700">
                        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full mr-3 mt-0.5 flex-shrink-0">
                          {index + 1}
                        </span>
                        {instruction}
                      </li>
                    ))}
                  </ol>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Related Links */}
          {relatedLinks.length > 0 && (
            <Collapsible open={expandedSections.links} onOpenChange={() => toggleSection('links')}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                  <div className="flex items-center">
                    <ExternalLink className="h-4 w-4 mr-2 text-blue-600" />
                    <span className="font-semibold text-gray-900">Related Tools</span>
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {relatedLinks.length} tools
                    </Badge>
                  </div>
                  {expandedSections.links ? (
                    <ChevronUp className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-4">
                <div className="pl-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {relatedLinks.map((link, index) => (
                      <Link key={index} href={link.path}>
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          {link.name}
                          <ExternalLink className="h-3 w-3 ml-auto" />
                        </Button>
                      </Link>
                    ))}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Notes */}
          {notes.length > 0 && (
            <Collapsible open={expandedSections.notes} onOpenChange={() => toggleSection('notes')}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2 text-amber-600" />
                    <span className="font-semibold text-gray-900">Important Notes</span>
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {notes.length} notes
                    </Badge>
                  </div>
                  {expandedSections.notes ? (
                    <ChevronUp className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-4">
                <div className="pl-6">
                  <ul className="space-y-2">
                    {notes.map((note, index) => (
                      <li key={index} className="flex items-start text-sm text-gray-700">
                        <span className="text-amber-500 mr-2 mt-1">•</span>
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Troubleshooting */}
          {troubleshooting.length > 0 && (
            <Collapsible open={expandedSections.troubleshooting} onOpenChange={() => toggleSection('troubleshooting')}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2 text-red-600" />
                    <span className="font-semibold text-gray-900">Troubleshooting</span>
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {troubleshooting.length} issues
                    </Badge>
                  </div>
                  {expandedSections.troubleshooting ? (
                    <ChevronUp className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-4">
                <div className="pl-6 space-y-4">
                  {troubleshooting.map((item, index) => (
                    <div key={index} className="border-l-2 border-red-200 pl-4">
                      <h5 className="font-medium text-red-800 text-sm mb-1">
                        {item.issue}
                      </h5>
                      <p className="text-sm text-gray-700">
                        {item.solution}
                      </p>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InstructionFooter;