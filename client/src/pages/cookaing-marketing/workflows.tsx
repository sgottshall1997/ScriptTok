import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Workflow, 
  Plus, 
  Search, 
  Building2,
  Edit, 
  Trash2,
  Loader2,
  Play,
  Pause,
  Settings,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { insertWorkflowSchema, workflows, organizations } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

type WorkflowType = typeof workflows.$inferSelect;
type Organization = typeof organizations.$inferSelect;

const workflowFormSchema = insertWorkflowSchema.extend({
  name: z.string().min(1, "Workflow name is required"),
  orgId: z.number({ required_error: "Please select an organization" }),
});

const WorkflowsPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<WorkflowType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrgFilter, setSelectedOrgFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');

  // Fetch workflows
  const { data: workflows, isLoading } = useQuery<WorkflowType[]>({
    queryKey: ['/api/cookaing-marketing/workflows'],
    retry: false,
  });

  // Fetch organizations for dropdown
  const { data: organizations } = useQuery<Organization[]>({
    queryKey: ['/api/cookaing-marketing/organizations'],
    retry: false,
  });

  // Create workflow mutation
  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof workflowFormSchema>) => {
      const response = await apiRequest('POST', '/api/cookaing-marketing/workflows', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Workflow created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cookaing-marketing/workflows'] });
      setIsCreateDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create workflow",
        variant: "destructive",
      });
    },
  });

  // Update workflow mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: z.infer<typeof workflowFormSchema> }) => {
      const response = await apiRequest('PUT', `/api/cookaing-marketing/workflows/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Workflow updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cookaing-marketing/workflows'] });
      setIsEditDialogOpen(false);
      setEditingWorkflow(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update workflow",
        variant: "destructive",
      });
    },
  });

  // Toggle workflow status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const response = await apiRequest('PUT', `/api/cookaing-marketing/workflows/${id}`, { isActive });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Workflow status updated",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cookaing-marketing/workflows'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update workflow",
        variant: "destructive",
      });
    },
  });

  // Delete workflow mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/cookaing-marketing/workflows/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Workflow deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cookaing-marketing/workflows'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete workflow",
        variant: "destructive",
      });
    },
  });

  const form = useForm<z.infer<typeof workflowFormSchema>>({
    resolver: zodResolver(workflowFormSchema),
    defaultValues: {
      name: "",
      isActive: true,
      definitionJson: {},
    },
  });

  const editForm = useForm<z.infer<typeof workflowFormSchema>>({
    resolver: zodResolver(workflowFormSchema),
    defaultValues: {
      name: "",
      isActive: true,
      definitionJson: {},
    },
  });

  const onSubmit = (data: z.infer<typeof workflowFormSchema>) => {
    createMutation.mutate(data);
  };

  const onEditSubmit = (data: z.infer<typeof workflowFormSchema>) => {
    if (editingWorkflow) {
      updateMutation.mutate({ id: editingWorkflow.id, data });
    }
  };

  const handleEdit = (workflow: WorkflowType) => {
    setEditingWorkflow(workflow);
    editForm.reset({
      name: workflow.name,
      isActive: workflow.isActive,
      orgId: workflow.orgId,
      definitionJson: workflow.definitionJson || {},
    });
    setIsEditDialogOpen(true);
  };

  // Filter workflows
  const filteredWorkflows = workflows?.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesOrg = selectedOrgFilter === 'all' || workflow.orgId.toString() === selectedOrgFilter;
    const matchesStatus = selectedStatusFilter === 'all' || 
                         (selectedStatusFilter === 'active' && workflow.isActive) ||
                         (selectedStatusFilter === 'inactive' && !workflow.isActive);
    return matchesSearch && matchesOrg && matchesStatus;
  }) || [];

  // Get organization name for a workflow
  const getOrgName = (orgId: number) => {
    return organizations?.find(org => org.id === orgId)?.name || `Org ${orgId}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Workflows
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Automate marketing processes
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-workflow">
              <Plus className="h-4 w-4 mr-2" />
              New Workflow
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Workflow</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Workflow Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter workflow name" 
                          data-testid="input-workflow-name"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
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
                          <SelectTrigger data-testid="select-workflow-organization">
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
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Active
                        </FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Start the workflow immediately after creation
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-workflow-active"
                        />
                      </FormControl>
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
            placeholder="Search workflows..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search-workflows"
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
        <Select value={selectedStatusFilter} onValueChange={setSelectedStatusFilter}>
          <SelectTrigger className="w-40" data-testid="select-filter-status">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Workflows Grid */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWorkflows.map((workflow) => (
            <Card key={workflow.id} data-testid={`card-workflow-${workflow.id}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center space-x-2">
                  <Workflow className="h-5 w-5 text-orange-500" />
                  <CardTitle className="text-lg">{workflow.name}</CardTitle>
                </div>
                <Badge variant={workflow.isActive ? 'default' : 'outline'}>
                  {workflow.isActive ? (
                    <>
                      <Zap className="h-3 w-3 mr-1" />
                      Active
                    </>
                  ) : (
                    <>
                      <Pause className="h-3 w-3 mr-1" />
                      Inactive
                    </>
                  )}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Building2 className="h-4 w-4 mr-2" />
                    {getOrgName(workflow.orgId)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Created {new Date(workflow.createdAt).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Last updated {new Date(workflow.updatedAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex justify-between">
                  <div className="flex space-x-1">
                    <Button 
                      size="sm" 
                      variant="outline"
                      data-testid={`button-configure-${workflow.id}`}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEdit(workflow)}
                      data-testid={`button-edit-${workflow.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => deleteMutation.mutate(workflow.id)}
                      disabled={deleteMutation.isPending}
                      data-testid={`button-delete-${workflow.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button 
                    size="sm" 
                    variant={workflow.isActive ? "destructive" : "default"}
                    onClick={() => toggleStatusMutation.mutate({ 
                      id: workflow.id, 
                      isActive: !workflow.isActive 
                    })}
                    disabled={toggleStatusMutation.isPending}
                    data-testid={`button-toggle-${workflow.id}`}
                  >
                    {workflow.isActive ? (
                      <>
                        <Pause className="h-4 w-4 mr-1" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-1" />
                        Start
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredWorkflows.length === 0 && !isLoading && (
        <Card>
          <CardContent className="text-center py-8">
            <Workflow className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No workflows found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm || selectedOrgFilter !== 'all' || selectedStatusFilter !== 'all'
                ? 'No workflows match your filters.' 
                : 'Get started by creating your first workflow.'}
            </p>
            {!searchTerm && selectedOrgFilter === 'all' && selectedStatusFilter === 'all' && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Workflow
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WorkflowsPage;