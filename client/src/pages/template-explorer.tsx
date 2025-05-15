import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectLabel, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import NicheCard from '@/components/NicheCard';
import NicheGrid from '@/components/NicheGrid';
import { TemplateGrid } from '@/components/TemplatePreview';
import { useLocation } from 'wouter';
import { trackEvent } from '@/lib/analytics';

interface NicheInfo {
  name: string;
  description: string;
  icon: string;
  primary_color: string;
  secondary_color: string;
  keywords: string[];
}

interface AllTemplatesResponse {
  niches: Record<string, {
    info: NicheInfo;
    templates: Record<string, any>;
  }>;
}

interface NicheTemplateResponse {
  info: NicheInfo;
  templates: Record<string, any>;
}

// Template Explorer Page
const TemplateExplorerPage: React.FC = () => {
  const [selectedNiche, setSelectedNiche] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [templateList, setTemplateList] = useState<string[]>([]);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Niche labels with proper formatting for display
  const nicheLabels: Record<string, string> = {
    skincare: "Skincare & Beauty",
    tech: "Technology & Gadgets",
    fashion: "Fashion & Apparel",
    fitness: "Fitness & Wellness",
    food: "Food & Cooking",
    travel: "Travel & Adventure",
    pet: "Pet Care & Products"
  };
  
  // Descriptions for each niche
  const nicheDescriptions: Record<string, string> = {
    skincare: "Generate content for skincare, beauty, and cosmetic products with specialized templates for routines, ingredient analysis, and before-after comparisons.",
    tech: "Create tech reviews, comparisons, and tutorials for gadgets, software, and electronics with specifications and feature-focused templates.",
    fashion: "Produce stylish content for apparel, accessories, and footwear with outfit pairing guides, seasonal collections, and style trend analysis.",
    fitness: "Develop workout routines, supplement reviews, and equipment guides with templates designed for fitness enthusiasts and wellness products.",
    food: "Craft recipes, cookware reviews, and meal plan content with specialized formats for ingredients, nutritional information, and cooking techniques.",
    travel: "Build travel guides, gear reviews, and destination comparisons with templates for itineraries, packing lists, and travel essentials.",
    pet: "Generate pet care content, product reviews, and training guides with specialized templates for different pet types, breeds, and care routines."
  };
  
  // Template counts for each niche
  const templateCounts: Record<string, number> = {
    skincare: 18,
    tech: 14,
    fashion: 12,
    fitness: 15,
    food: 11,
    travel: 10,
    pet: 9
  };

  // Fetch all niches for the dropdown
  const { 
    data: allNichesData, 
    isLoading: loadingNiches, 
    error: nichesError 
  } = useQuery({
    queryKey: ['/api/templates'],
    queryFn: async () => {
      const response = await fetch('/api/templates');
      if (!response.ok) {
        throw new Error('Failed to fetch niches');
      }
      return response.json() as Promise<AllTemplatesResponse>;
    },
    refetchOnWindowFocus: false,
  });

  // Fetch templates for selected niche
  const { 
    data: nicheTemplatesData, 
    isLoading: loadingTemplates, 
    error: templatesError,
    refetch: refetchTemplates
  } = useQuery({
    queryKey: ['/api/templates', selectedNiche],
    queryFn: async () => {
      if (!selectedNiche) return null;
      
      const response = await fetch(`/api/templates/${selectedNiche}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch templates for ${selectedNiche}`);
      }
      return response.json() as Promise<NicheTemplateResponse>;
    },
    enabled: !!selectedNiche, // Only run this query if a niche is selected
    refetchOnWindowFocus: false,
  });

  // When niche changes, update template list
  useEffect(() => {
    if (nicheTemplatesData?.templates) {
      const templateKeys = Object.keys(nicheTemplatesData.templates);
      setTemplateList(templateKeys);
      // Auto-select the first template if available
      if (templateKeys.length > 0 && !templateKeys.includes(selectedTemplate)) {
        setSelectedTemplate(templateKeys[0]);
      }
    } else {
      setTemplateList([]);
      setSelectedTemplate('');
    }
  }, [nicheTemplatesData, selectedTemplate]);

  // Handle niche selection
  const handleNicheChange = (niche: string) => {
    setSelectedNiche(niche);
    // Reset template selection when niche changes
    setSelectedTemplate('');
    // Track niche selection event
    trackEvent('niche_selection', 'template_explorer', niche);
  };

  // Handle template selection
  const handleTemplateSelect = (templateType: string) => {
    setSelectedTemplate(templateType);
    // Track template selection event
    trackEvent('template_selection', 'template_explorer', `${selectedNiche}_${templateType}`);
  };

  // Handle generate button
  const handleGenerateContent = () => {
    if (!selectedNiche || !selectedTemplate) {
      toast({
        title: 'Selection Required',
        description: 'Please select both a niche and a template before generating content',
        variant: 'destructive',
      });
      return;
    }

    // Track the event for analytics
    trackEvent(
      'navigate_to_generator', 
      'template_explorer', 
      `${selectedNiche}/${selectedTemplate}`
    );

    // Navigate to the content generator page with niche and template pre-selected
    setLocation(`/niche/${selectedNiche}?template=${selectedTemplate}`);
  };

  // Extract the list of available niches
  const niches = allNichesData 
    ? Object.keys(allNichesData.niches) 
    : [];

  // Show loading state
  if (loadingNiches) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <h1 className="text-3xl font-bold mb-6">Template Explorer</h1>
        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-60 w-full" />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show error state
  if (nichesError) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <h1 className="text-3xl font-bold mb-6">Template Explorer</h1>
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-500">Error Loading Templates</CardTitle>
            <CardDescription>
              There was a problem loading the template data. Please try again later.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <h1 className="text-3xl font-bold mb-6">Template Explorer</h1>
      
      {/* Niche Selection */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Step 1: Select a Content Niche</CardTitle>
          <CardDescription>
            Choose the industry or topic for your content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Select value={selectedNiche} onValueChange={handleNicheChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a content niche" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Available Niches</SelectLabel>
                  {niches.map(niche => (
                    <SelectItem key={niche} value={niche}>
                      {allNichesData?.niches[niche]?.info?.name || niche}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            
            {/* Niche cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {niches.map((niche) => (
                <NicheCard
                  key={niche}
                  niche={niche}
                  title={nicheLabels[niche] || niche}
                  description={nicheDescriptions[niche] || `Generate content for ${niche} products and services.`}
                  icon=""
                  bgClass=""
                  textClass=""
                  borderClass=""
                  templateCount={templateCounts[niche] || 10}
                  isSelected={selectedNiche === niche}
                  onSelect={handleNicheChange}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Template Selection (only shown after niche is selected) */}
      {selectedNiche && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Step 2: Choose a Content Template</CardTitle>
            <CardDescription>
              Select the type of content you want to generate
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingTemplates ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-60 w-full" />
                ))}
              </div>
            ) : templatesError ? (
              <div className="text-red-500">
                Error loading templates for this niche. Please try again or select a different niche.
              </div>
            ) : (
              <div className="space-y-6">
                <TemplateGrid 
                  niche={selectedNiche}
                  templates={templateList}
                  selectedTemplate={selectedTemplate}
                  onSelectTemplate={handleTemplateSelect}
                />
                
                <div className="flex justify-center mt-6">
                  <Button 
                    size="lg"
                    onClick={handleGenerateContent}
                    disabled={!selectedTemplate}
                  >
                    Generate Content with This Template
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TemplateExplorerPage;