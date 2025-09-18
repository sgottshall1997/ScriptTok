import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  FileText, 
  Plus, 
  Search, 
  Building2,
  Edit, 
  Trash2,
  Loader2,
  Eye,
  BarChart3,
  Copy,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { insertFormSchema, forms, formSubmissions, organizations } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import InstructionFooter from '@/cookaing-marketing/components/InstructionFooter';

type FormType = typeof forms.$inferSelect;
type FormSubmission = typeof formSubmissions.$inferSelect;
type Organization = typeof organizations.$inferSelect;

const formFormSchema = insertFormSchema.extend({
  slug: z.string().min(1, "Form slug is required").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  orgId: z.number({ required_error: "Please select an organization" }),
});

const FormsPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingForm, setEditingForm] = useState<FormType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrgFilter, setSelectedOrgFilter] = useState<string>('all');
  const [selectedFormId, setSelectedFormId] = useState<number | null>(null);

  // Fetch forms
  const { data: forms, isLoading } = useQuery<FormType[]>({
    queryKey: ['/api/cookaing-marketing/forms'],
    retry: false,
  });

  // Fetch organizations for dropdown
  const { data: organizations } = useQuery<Organization[]>({
    queryKey: ['/api/cookaing-marketing/organizations'],
    retry: false,
  });

  // Fetch submissions for selected form
  const { data: submissions, isLoading: submissionsLoading } = useQuery<FormSubmission[]>({
    queryKey: [`/api/cookaing-marketing/forms/${selectedFormId}/submissions`],
    enabled: !!selectedFormId,
    retry: false,
  });

  // Create form mutation
  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formFormSchema>) => {
      const response = await apiRequest('POST', '/api/cookaing-marketing/forms', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Form created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cookaing-marketing/forms'] });
      setIsCreateDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create form",
        variant: "destructive",
      });
    },
  });

  // Update form mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: z.infer<typeof formFormSchema> }) => {
      const response = await apiRequest('PUT', `/api/cookaing-marketing/forms/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Form updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cookaing-marketing/forms'] });
      setIsEditDialogOpen(false);
      setEditingForm(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update form",
        variant: "destructive",
      });
    },
  });

  // Delete form mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/cookaing-marketing/forms/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Form deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cookaing-marketing/forms'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete form",
        variant: "destructive",
      });
    },
  });

  const form = useForm<z.infer<typeof formFormSchema>>({
    resolver: zodResolver(formFormSchema),
    defaultValues: {
      slug: "",
      schemaJson: {
        fields: [
          { name: "email", type: "email", required: true, label: "Email Address" },
          { name: "name", type: "text", required: false, label: "Full Name" }
        ]
      },
      rulesJson: {},
    },
  });

  const onSubmit = (data: z.infer<typeof formFormSchema>) => {
    createMutation.mutate(data);
  };

  const onEditSubmit = (data: z.infer<typeof formFormSchema>) => {
    if (editingForm) {
      updateMutation.mutate({ id: editingForm.id, data });
    }
  };

  const handleEdit = (formItem: FormType) => {
    setEditingForm(formItem);
    setIsEditDialogOpen(true);
  };

  // Filter forms
  const filteredForms = forms?.filter(formItem => {
    const matchesSearch = formItem.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesOrg = selectedOrgFilter === 'all' || formItem.orgId.toString() === selectedOrgFilter;
    return matchesSearch && matchesOrg;
  }) || [];

  // Get organization name for a form
  const getOrgName = (orgId: number) => {
    return organizations?.find(org => org.id === orgId)?.name || `Org ${orgId}`;
  };

  // Get submission count for a form
  const getSubmissionCount = (formId: number) => {
    // This would need to be fetched from API in real implementation
    return Math.floor(Math.random() * 50); // Mock data
  };

  const copyFormUrl = (slug: string) => {
    const url = `${window.location.origin}/forms/${slug}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Success",
      description: "Form URL copied to clipboard",
    });
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="forms" className="w-full">
        <TabsList>
          <TabsTrigger value="forms">Forms</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
        </TabsList>

        <TabsContent value="forms" className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Forms
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Build lead capture forms
              </p>
            </div>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-form">
                  <Plus className="h-4 w-4 mr-2" />
                  New Form
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Form</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Form Slug</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="contact-us" 
                              data-testid="input-form-slug"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                          <p className="text-sm text-gray-500">
                            Form will be accessible at: /forms/{field.value || 'your-slug'}
                          </p>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="orgId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Organization</FormLabel>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                            <FormControl>
                              <SelectTrigger data-testid="select-form-organization">
                                <SelectValue placeholder="Select organization" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {organizations?.map((org) => (
                                <SelectItem key={org.id} value={org.id.toString()}>
                                  {org.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsCreateDialogOpen(false)}
                        data-testid="button-cancel-create"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={createMutation.isPending}
                        data-testid="button-submit-create"
                      >
                        {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Create
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search forms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-forms"
              />
            </div>
            <Select value={selectedOrgFilter} onValueChange={setSelectedOrgFilter}>
              <SelectTrigger className="w-48" data-testid="select-filter-organization">
                <SelectValue placeholder="Filter by organization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Organizations</SelectItem>
                {organizations?.map((org) => (
                  <SelectItem key={org.id} value={org.id.toString()}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Forms Grid */}
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredForms.map((formItem) => (
                <Card key={formItem.id} data-testid={`card-form-${formItem.id}`}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-indigo-500" />
                      <CardTitle className="text-lg">{formItem.slug}</CardTitle>
                    </div>
                    <Badge variant="outline">
                      {getSubmissionCount(formItem.id)} submissions
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Building2 className="h-4 w-4 mr-2" />
                        {getOrgName(formItem.orgId)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Created {new Date(formItem.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500 break-all">
                        /forms/{formItem.slug}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <div className="flex space-x-1">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => copyFormUrl(formItem.slug)}
                          data-testid={`button-copy-${formItem.id}`}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEdit(formItem)}
                          data-testid={`button-edit-${formItem.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => deleteMutation.mutate(formItem.id)}
                          disabled={deleteMutation.isPending}
                          data-testid={`button-delete-${formItem.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button 
                        size="sm"
                        onClick={() => setSelectedFormId(formItem.id)}
                        data-testid={`button-view-submissions-${formItem.id}`}
                      >
                        <BarChart3 className="h-4 w-4 mr-1" />
                        Analytics
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {filteredForms.length === 0 && !isLoading && (
            <Card>
              <CardContent className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No forms found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {searchTerm || selectedOrgFilter !== 'all'
                    ? 'No forms match your filters.' 
                    : 'Get started by creating your first form.'}
                </p>
                {!searchTerm && selectedOrgFilter === 'all' && (
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Form
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="submissions" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Form Submissions
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              View and manage form submissions
            </p>
          </div>
          
          {!selectedFormId ? (
            <Card>
              <CardContent className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Select a form to view submissions
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Choose a form from the Forms tab to see its submissions here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Submissions for Form #{selectedFormId}</CardTitle>
              </CardHeader>
              <CardContent>
                {submissionsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : submissions && submissions.length > 0 ? (
                  <div className="space-y-4">
                    {submissions.map((submission) => (
                      <div key={submission.id} className="border p-4 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Submitted {new Date(submission.createdAt).toLocaleString()}
                            </p>
                            <div className="mt-2">
                              <pre className="text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded">
                                {JSON.stringify(submission.dataJson, null, 2)}
                              </pre>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600 dark:text-gray-400">
                      No submissions yet for this form.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Instruction Footer */}
      <InstructionFooter
        title="Forms"
        whatIsIt="Embeddable forms (newsletter, lead gen, contact) with webhook automation."
        setupSteps={[
          "Create a form record with fields; copy/paste the embed code or iframe.",
          "Add webhook to trigger workflows when forms are submitted."
        ]}
        usageSteps={[
          "Preview the form; monitor submissions; use data for segmentation."
        ]}
      />
    </div>
  );
};

export default FormsPage;