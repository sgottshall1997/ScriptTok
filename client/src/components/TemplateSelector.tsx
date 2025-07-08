import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, Dice6 } from 'lucide-react';
import { TEMPLATE_METADATA, getTemplatesByCategory, TemplateMetadata } from '@shared/templateMetadata';
import { TemplateType } from '@shared/constants';

interface TemplateSelectorProps {
  value: string;
  onChange: (value: string) => void;
  selectedNiche: string;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  value,
  onChange,
  selectedNiche
}) => {
  const [showTemplateExplorer, setShowTemplateExplorer] = useState(false);
  
  const categories = getTemplatesByCategory();
  
  // Get popular templates for quick access
  const popularTemplates = [
    'short_video',
    'influencer_caption', 
    'product_comparison',
    'seo_blog',
    'unboxing',
    'surprise_me'
  ];

  // Filter templates based on niche relevance
  const getRelevantTemplates = () => {
    const nicheMap: Record<string, string[]> = {
      'beauty': ['Universal', 'Beauty & Personal Care'],
      'tech': ['Universal', 'Tech'],
      'fashion': ['Universal', 'Fashion'],
      'fitness': ['Universal', 'Fitness'],
      'food': ['Universal', 'Food', 'Home'],
      'travel': ['Universal', 'Travel'],
      'pet': ['Universal', 'Pet']
    };
    
    const relevantCategories = nicheMap[selectedNiche] || ['Universal'];
    const relevant: TemplateMetadata[] = [];
    
    relevantCategories.forEach(category => {
      if (categories[category]) {
        relevant.push(...categories[category]);
      }
    });
    
    // Add legacy templates for backward compatibility
    if (categories['Legacy']) {
      relevant.push(...categories['Legacy']);
    }
    
    return relevant;
  };

  // Group templates by product usage (NEW)
  const getTemplatesByUsage = () => {
    const relevantTemplates = getRelevantTemplates();
    const productFocused = relevantTemplates.filter(t => t.usesProduct);
    const generic = relevantTemplates.filter(t => !t.usesProduct);
    
    return { productFocused, generic };
  };

  const relevantTemplates = getRelevantTemplates();
  const selectedTemplate = TEMPLATE_METADATA[value as TemplateType];

  const handleSurpriseMe = () => {
    onChange('surprise_me');
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="flex-1">
            <SelectValue>
              {selectedTemplate ? (
                <div className="flex items-center gap-2">
                  <span>{selectedTemplate.icon}</span>
                  <span>{selectedTemplate.name}</span>
                </div>
              ) : (
                'Select template...'
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-96">
            {/* Product-Focused Templates Section */}
            <div className="sticky top-0 bg-blue-50 px-3 py-2 border-b">
              <div className="text-sm font-semibold text-blue-600 flex items-center gap-2">
                🎯 Product-Focused Templates
              </div>
              <div className="text-xs text-blue-500 mt-1">
                Content that centers around your specific input product
              </div>
            </div>
            {getTemplatesByUsage().productFocused.map((template) => (
              <SelectItem key={template.id} value={template.id}>
                <div className="flex items-center gap-2 w-full">
                  <span>{template.icon}</span>
                  <span className="flex-1">{template.name}</span>
                  <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-200 ml-2">
                    {template.estimatedLength}
                  </Badge>
                </div>
              </SelectItem>
            ))}

            {/* Generic Content Templates Section */}
            <div className="sticky top-0 bg-green-50 px-3 py-2 border-b border-t mt-2">
              <div className="text-sm font-semibold text-green-600 flex items-center gap-2">
                📝 Generic Content Templates
              </div>
              <div className="text-xs text-green-500 mt-1">
                General niche content (product input optional)
              </div>
            </div>
            {getTemplatesByUsage().generic.map((template) => (
              <SelectItem key={template.id} value={template.id}>
                <div className="flex items-center gap-2 w-full">
                  <span>{template.icon}</span>
                  <span className="flex-1">{template.name}</span>
                  <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-200 ml-2">
                    {template.estimatedLength}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {/* Surprise Me Button */}
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleSurpriseMe}
          className="shrink-0"
        >
          <Dice6 className="h-4 w-4 mr-1" />
          Surprise Me
        </Button>
        
        {/* Template Explorer */}
        <Dialog open={showTemplateExplorer} onOpenChange={setShowTemplateExplorer}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="shrink-0">
              <Info className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Template Explorer</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[60vh]">
              <Tabs defaultValue="Product-Focused" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="Product-Focused">🎯 Product-Focused</TabsTrigger>
                  <TabsTrigger value="Generic">📝 Generic Content</TabsTrigger>
                  <TabsTrigger value="Universal">Universal</TabsTrigger>
                  <TabsTrigger value="All">All Categories</TabsTrigger>
                </TabsList>
                
                <TabsContent value="Product-Focused" className="space-y-4">
                  <div className="mb-3 text-sm text-gray-600 bg-blue-50 p-3 rounded">
                    These templates center around your specific input product, creating content that directly features and promotes it.
                  </div>
                  <div className="grid gap-3">
                    {getTemplatesByUsage().productFocused.map((template) => (
                      <TemplateCard 
                        key={template.id}
                        template={template}
                        isSelected={value === template.id}
                        onSelect={() => {
                          onChange(template.id);
                          setShowTemplateExplorer(false);
                        }}
                      />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="Generic" className="space-y-4">
                  <div className="mb-3 text-sm text-gray-600 bg-green-50 p-3 rounded">
                    These templates create general content that doesn't focus on the specific product but may reference the niche or topic area.
                  </div>
                  <div className="grid gap-3">
                    {getTemplatesByUsage().generic.map((template) => (
                      <TemplateCard 
                        key={template.id}
                        template={template}
                        isSelected={value === template.id}
                        onSelect={() => {
                          onChange(template.id);
                          setShowTemplateExplorer(false);
                        }}
                      />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="Universal" className="space-y-4">
                  <div className="grid gap-3">
                    {categories['Universal']?.map((template) => (
                      <TemplateCard 
                        key={template.id}
                        template={template}
                        isSelected={value === template.id}
                        onSelect={() => {
                          onChange(template.id);
                          setShowTemplateExplorer(false);
                        }}
                      />
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value={selectedNiche.charAt(0).toUpperCase() + selectedNiche.slice(1)} className="space-y-4">
                  <div className="grid gap-3">
                    {categories[selectedNiche.charAt(0).toUpperCase() + selectedNiche.slice(1)]?.map((template) => (
                      <TemplateCard 
                        key={template.id}
                        template={template}
                        isSelected={value === template.id}
                        onSelect={() => {
                          onChange(template.id);
                          setShowTemplateExplorer(false);
                        }}
                      />
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="All" className="space-y-4">
                  {Object.entries(categories).map(([category, templates]) => (
                    <div key={category}>
                      <h3 className="font-semibold mb-2">{category}</h3>
                      <div className="grid gap-3">
                        {templates.map((template) => (
                          <TemplateCard 
                            key={template.id}
                            template={template}
                            isSelected={value === template.id}
                            onSelect={() => {
                              onChange(template.id);
                              setShowTemplateExplorer(false);
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </TabsContent>
                
                <TabsContent value="Legacy" className="space-y-4">
                  <div className="grid gap-3">
                    {categories['Legacy']?.map((template) => (
                      <TemplateCard 
                        key={template.id}
                        template={template}
                        isSelected={value === template.id}
                        onSelect={() => {
                          onChange(template.id);
                          setShowTemplateExplorer(false);
                        }}
                      />
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Selected Template Info */}
      {selectedTemplate && (
        <div className="text-xs text-muted-foreground bg-gray-50 p-2 rounded">
          <div className="flex items-center gap-2 mb-1">
            <span>{selectedTemplate.icon}</span>
            <span className="font-medium">{selectedTemplate.name}</span>
            <Badge variant="secondary" className="text-xs">
              {selectedTemplate.estimatedLength}
            </Badge>
            <Badge 
              variant={selectedTemplate.usesProduct ? "default" : "outline"} 
              className={`text-xs ${selectedTemplate.usesProduct ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}
            >
              {selectedTemplate.usesProduct ? '🎯 Product-Focused' : '📝 Generic'}
            </Badge>
          </div>
          <p>{selectedTemplate.description}</p>
          <div className="mt-1">
            <span className="font-medium">Use case:</span> {selectedTemplate.useCase}
          </div>
          {selectedTemplate.usesProduct ? (
            <div className="mt-1 text-blue-600">
              ✓ This template will center around your input product
            </div>
          ) : (
            <div className="mt-1 text-green-600">
              ℹ️ This template creates general content (product input optional)
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface TemplateCardProps {
  template: TemplateMetadata;
  isSelected: boolean;
  onSelect: () => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, isSelected, onSelect }) => {
  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
      }`}
      onClick={onSelect}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <span>{template.icon}</span>
            {template.name}
          </CardTitle>
          <div className="flex gap-1">
            <Badge variant="outline" className="text-xs">
              {template.estimatedLength}
            </Badge>
            {template.platforms.length <= 3 && (
              <Badge variant="secondary" className="text-xs">
                {template.platforms.join(', ')}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <CardDescription className="text-xs mb-2">
          {template.description}
        </CardDescription>
        <div className="text-xs text-muted-foreground">
          <span className="font-medium">Use case:</span> {template.useCase}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          <span className="font-medium">Example:</span> {template.example}
        </div>
      </CardContent>
    </Card>
  );
};