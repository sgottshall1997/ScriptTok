import React from 'react';
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TEMPLATE_TYPES, type TemplateType } from '@shared/constants';

// Properties for the TemplateSelector component
interface TemplateSelectorProps {
  value?: TemplateType; // For single selection (legacy)
  selectedTemplates?: TemplateType[]; // For multi-selection
  onChange?: (template: TemplateType) => void; // For single selection (legacy)
  onMultiChange?: (templates: TemplateType[]) => void; // For multi-selection
  selectedNiche?: string;
  className?: string;
  templateOptions?: TemplateType[];
  multiSelect?: boolean; // Flag to enable multi-selection mode
}

/**
 * Component for selecting content template types for TikTok Viral Product Generator
 * Supports both single selection (radio group) and multi-selection (checkboxes)
 */
export function TemplateSelector({
  value,
  selectedTemplates = [],
  onChange,
  onMultiChange,
  selectedNiche,
  className = "",
  templateOptions,
  multiSelect = false
}: TemplateSelectorProps) {
  // Use provided options or default template types
  const options = templateOptions || TEMPLATE_TYPES;

  // Handle checkbox toggle for multi-selection
  const handleTemplateToggle = (template: TemplateType, checked: boolean) => {
    if (!onMultiChange) return;

    if (checked) {
      onMultiChange([...selectedTemplates, template]);
    } else {
      onMultiChange(selectedTemplates.filter(t => t !== template));
    }
  };

  // Handle Select All
  const handleSelectAll = () => {
    if (onMultiChange) {
      onMultiChange([...options]);
    }
  };

  // Handle Clear All
  const handleClearAll = () => {
    if (onMultiChange) {
      onMultiChange([]);
    }
  };

  // Template descriptions for TikTok viral content (universal templates work across all niches)
  const descriptions: Record<TemplateType, string> = {
    'affiliate_email': 'Persuasive email content for affiliate marketing campaigns',
    'influencer_caption': 'Authentic social media captions for influencer posts',
    'product_comparison': 'Detailed comparison guides between products',
    'routine_kit': 'Step-by-step routine guides and tutorials',
    'seo_blog': 'Search-optimized blog posts (1000+ words)',
    'short_video': 'TikTok, Reels, and YouTube Shorts scripts'
  };

  // Icons for each template type (universal templates)
  const templateIcons: Record<TemplateType, string> = {
    'affiliate_email': '📧',
    'influencer_caption': '📱',
    'product_comparison': '⚖️',
    'routine_kit': '📋',
    'seo_blog': '📝',
    'short_video': '🎥'
  };

  if (multiSelect) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Content Templates</h3>
            <p className="text-sm text-muted-foreground">
              {selectedTemplates.length > 0 
                ? `${selectedTemplates.length} template${selectedTemplates.length !== 1 ? 's' : ''} selected`
                : 'Select one or more templates'
              }
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              disabled={selectedTemplates.length === options.length}
            >
              Select All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              disabled={selectedTemplates.length === 0}
            >
              Clear All
            </Button>
          </div>
        </div>

        {selectedTemplates.length === 0 && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
            ⚠️ Please select at least one template to continue
          </div>
        )}

        <TooltipProvider>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {options.map((template) => {
              const isSelected = selectedTemplates.includes(template);
              return (
                <Tooltip key={template} delayDuration={300}>
                  <TooltipTrigger asChild>
                    <div className="relative">
                      <Label
                        htmlFor={`template-multi-${template}`}
                        className={`flex items-center space-x-3 rounded-lg border-2 p-4 cursor-pointer hover:bg-gray-50 transition-all ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200'
                        }`}
                      >
                        <Checkbox
                          id={`template-multi-${template}`}
                          checked={isSelected}
                          onCheckedChange={(checked) => handleTemplateToggle(template, checked as boolean)}
                          className="shrink-0"
                        />
                        <span className="text-2xl">{templateIcons[template]}</span>
                        <div className="flex-1">
                          <div className="font-medium capitalize text-sm">
                            {template.replace('_', ' ')}
                          </div>
                        </div>
                      </Label>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    <p>{descriptions[template]}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>
      </div>
    );
  }

  // Single selection mode (legacy)
  return (
    <div className={`space-y-3 ${className}`}>
      <h3 className="text-lg font-medium">Content Template</h3>

      <TooltipProvider>
        <RadioGroup 
          value={value} 
          onValueChange={(selectedValue) => onChange && onChange(selectedValue as TemplateType)}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
        >
          {options.map((template) => (
            <Tooltip key={template} delayDuration={300}>
              <TooltipTrigger asChild>
                <div className="relative">
                  <RadioGroupItem 
                    value={template} 
                    id={`template-${template}`}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={`template-${template}`}
                    className="flex items-center space-x-3 rounded-lg border-2 border-gray-200 p-4 cursor-pointer hover:bg-gray-50 peer-checked:border-blue-500 peer-checked:bg-blue-50 transition-all"
                  >
                    <span className="text-2xl">{templateIcons[template]}</span>
                    <div className="flex-1">
                      <div className="font-medium capitalize text-sm">
                        {template.replace('_', ' ')}
                      </div>
                    </div>
                  </Label>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <p>{descriptions[template]}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </RadioGroup>
      </TooltipProvider>
    </div>
  );
}