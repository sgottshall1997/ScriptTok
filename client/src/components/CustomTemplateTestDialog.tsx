import { FC, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { NICHES, TONE_OPTIONS } from '@shared/constants';

// Define the response type for template testing
interface TemplateTestResponse {
  product: string;
  niche: string;
  tone: string;
  content: string;
  template: string;
}

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
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const testFormSchema = z.object({
  templateContent: z.string().min(10, {
    message: "Template content must be at least 10 characters.",
  }),
  productName: z.string().min(1, {
    message: "Product name is required.",
  }),
  tone: z.string().min(1, {
    message: "Please select a tone.",
  }),
  niche: z.string().min(1, {
    message: "Please select a niche.",
  }),
});

interface CustomTemplateTestDialogProps {
  initialTemplate?: string;
  trigger?: React.ReactNode;
}

const CustomTemplateTestDialog: FC<CustomTemplateTestDialogProps> = ({ 
  initialTemplate = '', 
  trigger 
}) => {
  const [open, setOpen] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof testFormSchema>>({
    resolver: zodResolver(testFormSchema),
    defaultValues: {
      templateContent: initialTemplate,
      productName: "",
      tone: "friendly",
      niche: "skincare",
    },
  });

  const testTemplateMutation = useMutation<TemplateTestResponse, Error, z.infer<typeof testFormSchema>>({
    mutationFn: async (values) => {
      const response = await apiRequest('POST', '/api/custom-template/test', values);
      const data: TemplateTestResponse = await response.json();
      return data;
    },
    onSuccess: (data) => {
      setGeneratedContent(data.content);
      toast({
        title: "Template tested successfully",
        description: "See the generated content below.",
      });
    },
    onError: (error) => {
      toast({
        title: "Test failed",
        description: "There was an error testing your template. Please try again.",
        variant: "destructive",
      });
      console.error("Template test error:", error);
    },
  });

  const onSubmit = (values: z.infer<typeof testFormSchema>) => {
    setGeneratedContent(null);
    testTemplateMutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Test Template</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Test Custom Template</DialogTitle>
          <DialogDescription>
            Test your template with a product name to see how the generated content will look.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="templateContent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Template Content</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Write your template with placeholders like {product_name}, {trending_products}, etc." 
                          className="min-h-[150px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Include placeholders like {'{product_name}'} or {'{trending_products}'}.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="productName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., CeraVe Hydrating Cleanser" {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter a product name to test with.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
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
                  
                  <FormField
                    control={form.control}
                    name="tone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tone</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a tone" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TONE_OPTIONS.map((tone) => (
                              <SelectItem key={tone} value={tone}>
                                {tone.charAt(0).toUpperCase() + tone.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={testTemplateMutation.isPending}
                >
                  {testTemplateMutation.isPending ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Testing...
                    </div>
                  ) : "Test Template"}
                </Button>
              </form>
            </Form>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Generated Content Preview</h3>
            <Card className="p-4 h-[400px] overflow-y-auto">
              {testTemplateMutation.isPending ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <svg className="animate-spin h-8 w-8 text-primary mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-muted-foreground">Generating content preview...</p>
                  </div>
                </div>
              ) : generatedContent ? (
                <div className="whitespace-pre-wrap">{generatedContent}</div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-center">
                  <div>
                    <p>No content generated yet</p>
                    <p className="text-sm mt-2">Test your template to see the generated content here</p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
        
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CustomTemplateTestDialog;