import React from 'react';
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Crown } from "lucide-react";
import { TEMPLATE_TYPES, type TemplateType, type ContentMode, getTemplatesByMode } from '@shared/constants';
import { useUsageData } from '@/hooks/useUsageData';

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
  contentMode?: ContentMode; // Filter templates by mode
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
  multiSelect = false,
  contentMode = 'affiliate'
}: TemplateSelectorProps) {
  // Get usage data to determine tier
  const { data: usageResponse, isLoading: usageLoading } = useUsageData();
  const usageData = usageResponse?.data;
  
  // Determine if user is on free tier (fail-safe: default to free if data unavailable)
  const isFreeUser = !usageData || usageData.tier === 'free';
  
  // Filter templates based on content mode
  const modeTemplates = getTemplatesByMode(contentMode) as TemplateType[];
  const options = templateOptions || modeTemplates;

  // Organize templates into sections based on content mode
  const templateSections = contentMode === 'viral' ? {
    'Viral Content Templates': [
      'viral_hooks',                  // Viral Hooks
      'viral_short_script',           // Short Script (15-30s)
      'viral_storytime',              // Storytime
      'viral_duet_reaction',          // Duet/Reaction
      'viral_listicle',               // Listicle
      'viral_challenge',              // Challenge
      'viral_caption_hashtags'        // Caption + Hashtags
    ]
  } : {
    'Video Script Generator': [
      'universal_short_video_script',  // Universal Short Video
      'short_video',                   // Short Video - Niche Specific
      'product_comparison',           // Product Comparison
      'routine_kit'                   // Routine Kit
    ],
    'Marketing Content Tools': [
      'seo_blog',                     // SEO Blog
      'affiliate_email',              // Affiliate Email
      'influencer_caption'            // Influencer Caption
    ]
  };

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

  // Template descriptions for both viral and affiliate content
  const descriptions: Record<string, string> = {
    // Affiliate templates
    'affiliate_email': 'Persuasive email content for affiliate marketing campaigns',
    'influencer_caption': 'Authentic social media captions for influencer posts',
    'product_comparison': 'Detailed comparison guides between products',
    'routine_kit': 'Step-by-step routine guides and tutorials',
    'seo_blog': 'Search-optimized blog posts (1000+ words)',
    'short_video': 'TikTok, Reels, and YouTube Shorts scripts',
    'universal_short_video_script': 'Comprehensive universal video scripts with detailed structure',
    // Viral templates
    'viral_hooks': '10 scroll-stopping TikTok hooks (3-8 words each)',
    'viral_short_script': '15-30 second script with Hook/Build/Payoff/Button structure',
    'viral_storytime': '90-150 word authentic story script with narrative structure',
    'viral_duet_reaction': 'Script outline for reacting to or stitching another video',
    'viral_listicle': 'Top 3-5 format with titles, explanations and examples',
    'viral_challenge': 'TikTok participation idea with steps and variations',
    'viral_caption_hashtags': '3 engaging captions plus optimized hashtag sets'
  };

  // Template display names for better UI readability
  const templateDisplayNames: Record<string, string> = {
    // Affiliate templates
    'affiliate_email': 'Affiliate Email',
    'influencer_caption': 'Influencer Caption', 
    'product_comparison': 'Product Comparison',
    'routine_kit': 'Routine Kit',
    'seo_blog': 'SEO Blog',
    'short_video': 'Short Video - Niche Specific',
    'universal_short_video_script': 'Universal Short Video',
    // Viral templates
    'viral_hooks': 'Viral Hooks',
    'viral_short_script': 'Short Script (15-30s)',
    'viral_storytime': 'Storytime',
    'viral_duet_reaction': 'Duet/Reaction',
    'viral_listicle': 'Listicle',
    'viral_challenge': 'Challenge',
    'viral_caption_hashtags': 'Caption + Hashtags'
  };

  // Icons for each template type
  const templateIcons: Record<string, string> = {
    // Affiliate templates
    'affiliate_email': '📧',
    'influencer_caption': '📱',
    'product_comparison': '⚖️',
    'routine_kit': '📋',
    'seo_blog': '📝',
    'short_video': '🎥',
    'universal_short_video_script': '🎬',
    // Viral templates
    'viral_hooks': '🔥',
    'viral_short_script': '⚡',
    'viral_storytime': '📖',
    'viral_duet_reaction': '🎭',
    'viral_listicle': '📄',
    'viral_challenge': '🏆',
    'viral_caption_hashtags': '📱'
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
          <div className="space-y-6">
            {Object.entries(templateSections).map(([sectionName, sectionTemplates]) => (
              <div key={sectionName} className="space-y-3">
                <h4 className="text-md font-semibold text-gray-800 border-b border-gray-200 pb-2">
                  {sectionName}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {sectionTemplates.filter((template: string): template is TemplateType => options.includes(template as TemplateType)).map((template: TemplateType, indexInSection: number): React.ReactElement => {
                    const templateType = template as TemplateType;
                    const isSelected = selectedTemplates.includes(templateType);
                    const isLocked = isFreeUser && indexInSection >= 3;
                    
                    return (
                      <Tooltip key={template} delayDuration={300}>
                        <TooltipTrigger asChild>
                          <div className="relative">
                            <Label
                              htmlFor={`template-multi-${template}`}
                              className={`flex items-center space-x-3 rounded-lg border-2 p-4 transition-all ${
                                isLocked 
                                  ? 'cursor-not-allowed opacity-50 border-gray-200 bg-gray-50' 
                                  : isSelected 
                                    ? 'border-blue-500 bg-blue-50 cursor-pointer hover:bg-blue-100' 
                                    : 'border-gray-200 cursor-pointer hover:bg-gray-50'
                              }`}
                            >
                              <Checkbox
                                id={`template-multi-${template}`}
                                checked={isSelected}
                                onCheckedChange={(checked) => !isLocked && handleTemplateToggle(templateType, checked as boolean)}
                                className="shrink-0"
                                disabled={isLocked}
                              />
                              <span className="text-2xl">{templateIcons[templateType]}</span>
                              <div className="flex-1">
                                <div className="font-medium text-sm">
                                  {templateDisplayNames[templateType]}
                                </div>
                              </div>
                              {isLocked && (
                                <Badge variant="secondary" className="ml-2 bg-amber-100 text-amber-800 border-amber-300">
                                  <Crown className="w-3 h-3 mr-1" />
                                  Pro
                                </Badge>
                              )}
                            </Label>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="max-w-xs">
                          {isLocked ? (
                            <p>🔒 Pro Feature: Upgrade to unlock this template</p>
                          ) : (
                            <p>{descriptions[templateType]}</p>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </div>
            ))}
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
          className="space-y-6"
        >
          {Object.entries(templateSections).map(([sectionName, sectionTemplates]) => (
            <div key={sectionName} className="space-y-3">
              <h4 className="text-md font-semibold text-gray-800 border-b border-gray-200 pb-2">
                {sectionName}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {sectionTemplates.filter((template: string): template is TemplateType => options.includes(template as TemplateType)).map((template: TemplateType, indexInSection: number): React.ReactElement => {
                  const templateType = template;
                  const isLocked = isFreeUser && indexInSection >= 3;
                  
                  return (
                    <Tooltip key={template} delayDuration={300}>
                      <TooltipTrigger asChild>
                        <div className="relative">
                          <RadioGroupItem 
                            value={template} 
                            id={`template-${template}`}
                            className="peer sr-only"
                            disabled={isLocked}
                          />
                          <Label
                            htmlFor={`template-${template}`}
                            className={`flex items-center space-x-3 rounded-lg border-2 p-4 transition-all ${
                              isLocked
                                ? 'cursor-not-allowed opacity-50 border-gray-200 bg-gray-50'
                                : 'border-gray-200 cursor-pointer hover:bg-gray-50 peer-checked:border-blue-500 peer-checked:bg-blue-50'
                            }`}
                          >
                            <span className="text-2xl">{templateIcons[templateType]}</span>
                            <div className="flex-1">
                              <div className="font-medium text-sm">
                                {templateDisplayNames[templateType]}
                              </div>
                            </div>
                            {isLocked && (
                              <Badge variant="secondary" className="ml-2 bg-amber-100 text-amber-800 border-amber-300">
                                <Crown className="w-3 h-3 mr-1" />
                                Pro
                              </Badge>
                            )}
                          </Label>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-xs">
                        {isLocked ? (
                          <p>🔒 Pro Feature: Upgrade to unlock this template</p>
                        ) : (
                          <p>{descriptions[templateType]}</p>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          ))}
        </RadioGroup>
      </TooltipProvider>
    </div>
  );
}