import { FC, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { NICHES, TONE_OPTIONS } from '@shared/constants';
import { PlusCircle, XCircle, HelpCircle, FileDown, FileUp } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Define available placeholders with descriptions
const AVAILABLE_PLACEHOLDERS = [
  { name: '{product_name}', description: 'The name of the product being discussed' },
  { name: '{trending_products}', description: 'A list of trending products in the selected niche' },
  { name: '{niche}', description: 'The selected niche/industry' },
  { name: '{tone}', description: 'The selected tone of voice' },
  { name: '{current_date}', description: 'Today\'s date' },
  { name: '{competitor_products}', description: 'Products that compete with the main product' },
  { name: '{key_benefits}', description: 'Main benefits of the product' },
  { name: '{price_point}', description: 'The typical price range for the product' },
  { name: '{target_audience}', description: 'The target demographic for the product' },
  { name: '{call_to_action}', description: 'A call to action relevant to the product and niche' },
  { name: '{hashtags}', description: 'Popular hashtags for the niche' },
  { name: '{emojis}', description: 'Relevant emojis for the content' },
];

// Template section schema
const sectionSchema = z.object({
  title: z.string().min(1, "Section title is required"),
  content: z.string().min(1, "Section content is required"),
});

// Main form schema
const formSchema = z.object({
  name: z.string().min(3, {
    message: "Template name must be at least 3 characters.",
  }),
  niche: z.string().min(1, {
    message: "Please select a niche.",
  }),
  description: z.string().min(10, {
    message: "Template description must be at least 10 characters.",
  }),
  sections: z.array(sectionSchema).min(1, {
    message: "Add at least one section to your template.",
  }),
  useAICompletions: z.boolean().default(true),
});

type Section = z.infer<typeof sectionSchema>;

interface AdvancedTemplateBuilderProps {
  onSuccess?: () => void;
}

const AdvancedTemplateBuilder: FC<AdvancedTemplateBuilderProps> = ({ onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("build");
  const [sections, setSections] = useState<Section[]>([{ title: "Introduction", content: "" }]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      niche: "",
      description: "",
      sections: [{ title: "Introduction", content: "" }],
      useAICompletions: true,
    },
  });

  // Update form sections when sections state changes
  useEffect(() => {
    form.setValue('sections', sections);
  }, [sections, form]);

  const createTemplateMutation = useMutation({
    mutationFn: (values: z.infer<typeof formSchema>) => {
      // Combine all sections into a single content string
      const combinedContent = values.sections.map(section => 
        `## ${section.title}\n${section.content}\n\n`
      ).join('');
      
      return apiRequest('POST', '/api/analytics/templates/custom', {
        name: values.name,
        niche: values.niche,
        content: combinedContent
      });
    },
    onSuccess: () => {
      toast({
        title: "Template created",
        description: "Your advanced template has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/templates/custom'] });
      form.reset();
      setSections([{ title: "Introduction", content: "" }]);
      setOpen(false);
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error) => {
      toast({
        title: "Failed to create template",
        description: "There was an error saving your advanced template. Please try again.",
        variant: "destructive",
      });
      console.error("Template creation error:", error);
    },
  });

  const addSection = () => {
    setSections([...sections, { title: `Section ${sections.length + 1}`, content: "" }]);
  };

  const removeSection = (index: number) => {
    if (sections.length > 1) {
      setSections(sections.filter((_, i) => i !== index));
    } else {
      toast({
        title: "Cannot remove section",
        description: "You must have at least one section in your template.",
        variant: "destructive",
      });
    }
  };

  const updateSection = (index: number, field: keyof Section, value: string) => {
    const updatedSections = [...sections];
    updatedSections[index] = { ...updatedSections[index], [field]: value };
    setSections(updatedSections);
  };

  const insertPlaceholder = (placeholder: string, sectionIndex: number) => {
    const currentContent = sections[sectionIndex].content;
    const updatedContent = currentContent + placeholder;
    updateSection(sectionIndex, "content", updatedContent);
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createTemplateMutation.mutate(values);
  };

  // Convert template to JSON for export
  const exportTemplate = () => {
    const template = form.getValues();
    const jsonData = JSON.stringify(template, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.name || 'template'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Template exported",
      description: "Your template has been exported as a JSON file.",
    });
  };

  // Import template from JSON
  const importTemplate = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const template = JSON.parse(content);
        
        // Validate imported data
        const result = formSchema.safeParse(template);
        if (!result.success) {
          toast({
            title: "Invalid template file",
            description: "The file doesn't contain a valid template structure.",
            variant: "destructive",
          });
          return;
        }
        
        // Update form with imported data
        form.reset(template);
        setSections(template.sections);
        
        toast({
          title: "Template imported",
          description: "Your template has been imported successfully.",
        });
      } catch (error) {
        toast({
          title: "Import failed",
          description: "Failed to parse the imported file. Please ensure it's a valid JSON file.",
          variant: "destructive",
        });
        console.error("Template import error:", error);
      }
    };
    reader.readAsText(file);
  };

  // Preview the combined template
  const getPreviewContent = () => {
    return sections.map(section => 
      `## ${section.title}\n${section.content}`
    ).join('\n\n');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Advanced Template Builder</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Advanced Template Builder</DialogTitle>
          <DialogDescription>
            Create sophisticated multi-section templates with specialized placeholders for dynamic content.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="build" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="build">Build Template</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="help">Help & Info</TabsTrigger>
          </TabsList>
          
          <TabsContent value="build">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Template Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Professional Product Review Template" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="niche"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Niche</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a niche" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {NICHES.map((niche) => (
                              <SelectItem key={niche} value={niche}>
                                {niche.charAt(0).toUpperCase() + niche.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Template Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe what this template is for and how it should be used" 
                          className="min-h-[60px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="useAICompletions"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Enable AI Completions</FormLabel>
                        <FormDescription>
                          Let AI fill in contextual details when placeholders lack specific data
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Template Sections</h3>
                    <Button type="button" variant="outline" size="sm" onClick={addSection}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Section
                    </Button>
                  </div>
                  
                  {sections.map((section, index) => (
                    <Card key={index} className="border">
                      <CardHeader className="py-2 px-4">
                        <div className="flex justify-between items-center">
                          <Input
                            className="font-semibold border-0 p-0 h-7 focus-visible:ring-0"
                            value={section.title}
                            onChange={(e) => updateSection(index, "title", e.target.value)}
                            placeholder="Section Title"
                          />
                          {sections.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSection(index)}
                              className="h-8 w-8 p-0"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="px-4 py-2 space-y-3">
                        <Textarea
                          className="min-h-[100px]"
                          value={section.content}
                          onChange={(e) => updateSection(index, "content", e.target.value)}
                          placeholder="Write your section content with placeholders..."
                        />
                        <div className="flex flex-wrap gap-1 mt-2">
                          <span className="text-sm text-muted-foreground mt-1">Insert placeholder:</span>
                          {AVAILABLE_PLACEHOLDERS.slice(0, 6).map((placeholder) => (
                            <TooltipProvider key={placeholder.name}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge
                                    variant="outline"
                                    className="cursor-pointer hover:bg-accent"
                                    onClick={() => insertPlaceholder(placeholder.name, index)}
                                  >
                                    {placeholder.name}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{placeholder.description}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ))}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6"
                            onClick={() => document.getElementById(`placeholders-accordion-${index}`)?.click()}
                          >
                            <HelpCircle className="h-3 w-3 mr-1" />
                            More
                          </Button>
                        </div>
                        
                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="placeholders">
                            <AccordionTrigger id={`placeholders-accordion-${index}`} className="text-sm py-1">
                              All Available Placeholders
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="grid grid-cols-2 gap-2 mt-2">
                                {AVAILABLE_PLACEHOLDERS.map((placeholder) => (
                                  <div 
                                    key={placeholder.name}
                                    className="flex items-center justify-between bg-muted p-2 rounded-md"
                                  >
                                    <div>
                                      <span className="font-mono text-xs">{placeholder.name}</span>
                                      <p className="text-xs text-muted-foreground">{placeholder.description}</p>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="h-6"
                                      onClick={() => insertPlaceholder(placeholder.name, index)}
                                    >
                                      <PlusCircle className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <DialogFooter className="flex justify-between flex-wrap gap-2">
                  <div>
                    <label htmlFor="import-template">
                      <Button type="button" variant="outline" className="mr-2" asChild>
                        <div className="flex items-center cursor-pointer">
                          <FileUp className="h-4 w-4 mr-2" />
                          Import
                        </div>
                      </Button>
                    </label>
                    <input
                      id="import-template"
                      type="file"
                      accept=".json"
                      onChange={importTemplate}
                      className="hidden"
                    />
                    
                    <Button type="button" variant="outline" onClick={exportTemplate}>
                      <FileDown className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={createTemplateMutation.isPending}
                  >
                    {createTemplateMutation.isPending ? "Saving..." : "Save Template"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="preview">
            <Card>
              <CardHeader>
                <CardTitle>{form.watch("name") || "Untitled Template"}</CardTitle>
                <CardDescription>{form.watch("description") || "No description provided"}</CardDescription>
                <Badge className="w-fit">{form.watch("niche") || "No niche selected"}</Badge>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md p-4 whitespace-pre-wrap">
                  {getPreviewContent() || "No content yet. Add sections to your template."}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="help">
            <Card>
              <CardHeader>
                <CardTitle>Template Building Guide</CardTitle>
                <CardDescription>Learn how to create effective templates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Using Placeholders</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Placeholders are special tags that get replaced with dynamic content when the template is used.
                    Insert them anywhere in your template sections.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {AVAILABLE_PLACEHOLDERS.map((placeholder) => (
                      <div key={placeholder.name} className="flex p-2 bg-muted rounded-md">
                        <div className="flex-1">
                          <p className="font-mono text-sm">{placeholder.name}</p>
                          <p className="text-xs text-muted-foreground">{placeholder.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="tips">
                    <AccordionTrigger>Tips for Effective Templates</AccordionTrigger>
                    <AccordionContent>
                      <ul className="list-disc pl-5 space-y-2 text-sm">
                        <li>Break your template into logical sections that flow well together</li>
                        <li>Include clear headings for each section</li>
                        <li>Use placeholders for content that should change with each use</li>
                        <li>Provide enough structure but leave room for AI to add details</li>
                        <li>Test your template with different products and niches</li>
                        <li>Keep instructions clear if you want specific formatting</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="example">
                    <AccordionTrigger>Example Template</AccordionTrigger>
                    <AccordionContent>
                      <div className="bg-muted p-3 rounded-md">
                        <p className="font-semibold">Product Review Template</p>
                        <div className="mt-2 text-sm whitespace-pre-wrap">
                          {`## Introduction
Are you looking for the best {niche} products? Today we're reviewing {product_name}, a trending option that's catching everyone's attention.

## Key Features
{product_name} offers several standout features:
{key_benefits}

## How It Compares
When compared to alternatives like:
{competitor_products}

{product_name} stands out because of its unique approach to {niche} solutions.

## Who Should Buy
Perfect for {target_audience} who want quality {niche} products at {price_point}.

## Conclusion
If you're considering {product_name}, we recommend checking it out. {call_to_action}

{hashtags}
{emojis}`}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AdvancedTemplateBuilder;