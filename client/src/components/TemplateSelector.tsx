import React from 'react';
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TEMPLATE_TYPES, type TemplateType } from '@shared/constants';

// Properties for the TemplateSelector component
interface TemplateSelectorProps {
  value: TemplateType;
  onChange: (template: TemplateType) => void;
  selectedNiche?: string;
  className?: string;
  templateOptions?: TemplateType[];
}

/**
 * Component for selecting the content template type for TikTok Viral Product Generator
 * Provides a radio group with tooltips explaining each template option
 */
export function TemplateSelector({
  value,
  onChange,
  selectedNiche,
  className = "",
  templateOptions
}: TemplateSelectorProps) {
  // Use provided options or default template types
  const options = templateOptions || TEMPLATE_TYPES;
  
  // Template descriptions for TikTok viral content
  const descriptions: Record<TemplateType, string> = {
    'affiliate_email': 'Persuasive email content for affiliate marketing campaigns',
    'influencer_caption': 'Authentic social media captions for influencer posts',
    'product_comparison': 'Detailed comparison guides between products',
    'routine_kit': 'Step-by-step routine guides and tutorials',
    'seo_blog': 'Search-optimized blog posts (1000+ words)',
    'short_video': 'TikTok, Reels, and YouTube Shorts scripts',
    'skincare': 'Beauty and skincare focused content templates',
    'fashion': 'Fashion and style content templates',
    'fitness': 'Fitness and health content templates', 
    'food': 'Food and cooking content templates',
    'tech': 'Technology and gadget content templates',
    'travel': 'Travel and adventure content templates',
    'pet': 'Pet care and product content templates'
  };

  // Icons for each template type
  const templateIcons: Record<TemplateType, string> = {
    'affiliate_email': '📧',
    'influencer_caption': '📱',
    'product_comparison': '⚖️',
    'routine_kit': '📋',
    'seo_blog': '📝',
    'short_video': '🎥',
    'skincare': '🧴',
    'fashion': '👗',
    'fitness': '💪',
    'food': '🍴',
    'tech': '📱',
    'travel': '✈️',
    'pet': '🐾'
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <h3 className="text-lg font-medium">Content Template</h3>
      
      <TooltipProvider>
        <RadioGroup 
          value={value} 
          onValueChange={(selectedValue) => onChange(selectedValue as TemplateType)}
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