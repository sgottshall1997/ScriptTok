import React, { useState } from 'react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  UNIVERSAL_TEMPLATE_TYPES, 
  BEAUTY_TEMPLATE_TYPES,
  TECH_TEMPLATE_TYPES,
  FASHION_TEMPLATE_TYPES,
  FITNESS_TEMPLATE_TYPES,
  HOME_TEMPLATE_TYPES,
  PET_TEMPLATE_TYPES,
  OUTDOOR_TEMPLATE_TYPES,
  LEGACY_TEMPLATE_TYPES,
  type TemplateType
} from '@shared/constants';

interface TemplateInfo {
  title: string;
  description: string;
  icon: string;
  exampleOutput?: string;
}

interface ContentTypeButtonsProps {
  selectedType: TemplateType;
  niche: string;
  onChange: (type: TemplateType) => void;
  templateMetadata?: Record<string, TemplateInfo>;
  className?: string;
}

/**
 * Component for selecting content generation template types
 * Organizes templates by category and provides tooltips with descriptions
 */
export function ContentTypeButtons({
  selectedType,
  niche,
  onChange,
  templateMetadata = {},
  className = ""
}: ContentTypeButtonsProps) {
  const [activeTab, setActiveTab] = useState<string>("universal");
  
  // Get template types based on selected niche
  const getNicheTemplates = (currentNiche: string): TemplateType[] => {
    switch (currentNiche) {
      case "beauty":
        return [...BEAUTY_TEMPLATE_TYPES];
      case "tech":
        return [...TECH_TEMPLATE_TYPES];
      case "fashion":
        return [...FASHION_TEMPLATE_TYPES];
      case "fitness":
        return [...FITNESS_TEMPLATE_TYPES];
      case "home":
        return [...HOME_TEMPLATE_TYPES];
      case "pet":
        return [...PET_TEMPLATE_TYPES];
      case "travel":
        return [...OUTDOOR_TEMPLATE_TYPES];
      default:
        return [];
    }
  };
  
  // Get template info with fallbacks if metadata is not available
  const getTemplateInfo = (type: TemplateType): { title: string, description: string, icon: string } => {
    if (templateMetadata[type]) {
      return {
        title: templateMetadata[type].title || formatTitle(type),
        description: templateMetadata[type].description || "Generate content using this template.",
        icon: templateMetadata[type].icon || "📄"
      };
    }
    
    // Default values if metadata is not available
    return {
      title: formatTitle(type),
      description: "Generate content using this template.",
      icon: "📄"
    };
  };
  
  // Format the template type ID into a readable title
  const formatTitle = (type: string): string => {
    return type
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Get all niche-specific templates
  const nicheTemplates = getNicheTemplates(niche);
  
  // Define tab content
  const tabContent = {
    universal: UNIVERSAL_TEMPLATE_TYPES,
    niche: nicheTemplates,
    legacy: LEGACY_TEMPLATE_TYPES
  };

  return (
    <div className={className}>
      <Tabs defaultValue="universal" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="universal">Universal</TabsTrigger>
          <TabsTrigger 
            value="niche" 
            disabled={nicheTemplates.length === 0}
          >
            Niche-Specific
          </TabsTrigger>
          <TabsTrigger value="legacy">Legacy</TabsTrigger>
        </TabsList>
        
        {Object.entries(tabContent).map(([tab, templates]) => (
          <TabsContent key={tab} value={tab} className="pt-4">
            <ScrollArea className="h-56">
              <TooltipProvider>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {templates.map((type) => {
                    const info = getTemplateInfo(type);
                    return (
                      <Tooltip key={type} delayDuration={300}>
                        <TooltipTrigger asChild>
                          <Button
                            variant={selectedType === type ? "default" : "outline"}
                            onClick={() => onChange(type)}
                            className="justify-start text-left h-auto py-3"
                          >
                            <div className="flex items-start">
                              <span className="mr-2 text-lg">{info.icon}</span>
                              <span className="flex-grow">{info.title}</span>
                            </div>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right" align="start" className="max-w-sm">
                          <p className="font-semibold">{info.title}</p>
                          <p className="text-sm">{info.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </TooltipProvider>
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

export default ContentTypeButtons;