import { FC, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { NICHES } from '@shared/constants';
import CustomTemplateTestDialog from './CustomTemplateTestDialog';

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

const formSchema = z.object({
  name: z.string().min(3, {
    message: "Template name must be at least 3 characters.",
  }),
  niche: z.string().min(1, {
    message: "Please select a niche.",
  }),
  content: z.string().min(20, {
    message: "Template content must be at least 20 characters.",
  }),
});

interface CustomTemplateEditorProps {
  onSuccess?: () => void;
}

const CustomTemplateEditor: FC<CustomTemplateEditorProps> = ({ onSuccess }) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      niche: "",
      content: "",
    },
  });

  const createTemplateMutation = useMutation({
    mutationFn: (values: z.infer<typeof formSchema>) => {
      return apiRequest('POST', '/api/analytics/templates/custom', values);
    },
    onSuccess: () => {
      toast({
        title: "Template created",
        description: "Your custom template has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/templates/custom'] });
      form.reset();
      setOpen(false);
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error) => {
      toast({
        title: "Failed to create template",
        description: "There was an error saving your custom template. Please try again.",
        variant: "destructive",
      });
      console.error("Template creation error:", error);
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createTemplateMutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Create Custom Template</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Custom Template</DialogTitle>
          <DialogDescription>
            Design your own template for content generation. Templates can include placeholders like {'{product_name}'}, {'{trending_products}'}, and more.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., My Product Review Template" {...field} />
                  </FormControl>
                  <FormDescription>
                    Give your template a descriptive name.
                  </FormDescription>
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
                  <FormDescription>
                    This template will be available for the selected niche.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template Content</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Write your template with placeholders like {product_name}, {trending_products}, etc." 
                      className="min-h-[200px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Use placeholders that will be replaced during content generation.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button 
                type="submit" 
                disabled={createTemplateMutation.isPending}
              >
                {createTemplateMutation.isPending ? "Saving..." : "Save Template"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CustomTemplateEditor;