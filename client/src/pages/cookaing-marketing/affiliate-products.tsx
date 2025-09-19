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
  ShoppingCart, 
  Plus, 
  Search, 
  Building2,
  Edit, 
  Trash2,
  Loader2,
  ExternalLink,
  DollarSign,
  Tag,
  Image,
  Package,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { insertAffiliateProductSchema, affiliateProducts, organizations } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import InstructionFooter from '@/cookaing-marketing/components/InstructionFooter';
import { AmazonProductSearch } from "@/components/amazon/AmazonProductSearch";

type AffiliateProduct = typeof affiliateProducts.$inferSelect;
type Organization = typeof organizations.$inferSelect;

const productFormSchema = insertAffiliateProductSchema.extend({
  name: z.string().min(1, "Product name is required"),
  source: z.string().min(1, "Source is required"),
  url: z.string().url("Please enter a valid URL"),
  sku: z.string().min(1, "SKU is required"),
  orgId: z.number({ required_error: "Please select an organization" }),
});

const AffiliateProductsPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AffiliateProduct | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrgFilter, setSelectedOrgFilter] = useState<string>('all');
  const [selectedSourceFilter, setSelectedSourceFilter] = useState<string>('all');

  // Fetch affiliate products
  const { data: products, isLoading } = useQuery<AffiliateProduct[]>({
    queryKey: ['/api/cookaing-marketing/affiliate-products'],
    retry: false,
  });

  // Fetch organizations for dropdown
  const { data: organizations } = useQuery<Organization[]>({
    queryKey: ['/api/cookaing-marketing/organizations'],
    retry: false,
  });

  // Create product mutation
  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof productFormSchema>) => {
      const response = await apiRequest('POST', '/api/cookaing-marketing/affiliate-products', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Affiliate product created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cookaing-marketing/affiliate-products'] });
      setIsCreateDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create affiliate product",
        variant: "destructive",
      });
    },
  });

  // Update product mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: z.infer<typeof productFormSchema> }) => {
      const response = await apiRequest('PUT', `/api/cookaing-marketing/affiliate-products/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Affiliate product updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cookaing-marketing/affiliate-products'] });
      setIsEditDialogOpen(false);
      setEditingProduct(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update affiliate product",
        variant: "destructive",
      });
    },
  });

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/cookaing-marketing/affiliate-products/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Affiliate product deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cookaing-marketing/affiliate-products'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete affiliate product",
        variant: "destructive",
      });
    },
  });

  const form = useForm<z.infer<typeof productFormSchema>>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      source: "amazon",
      url: "",
      sku: "",
      price: "",
      imageUrl: "",
      attributesJson: {},
    },
  });

  const editForm = useForm<z.infer<typeof productFormSchema>>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      source: "amazon",
      url: "",
      sku: "",
      price: "",
      imageUrl: "",
      attributesJson: {},
    },
  });

  const onSubmit = (data: z.infer<typeof productFormSchema>) => {
    createMutation.mutate(data);
  };

  const onEditSubmit = (data: z.infer<typeof productFormSchema>) => {
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data });
    }
  };

  const handleEdit = (product: AffiliateProduct) => {
    setEditingProduct(product);
    setIsEditDialogOpen(true);
  };

  // Filter products
  const filteredProducts = products?.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesOrg = selectedOrgFilter === 'all' || product.orgId.toString() === selectedOrgFilter;
    const matchesSource = selectedSourceFilter === 'all' || product.source === selectedSourceFilter;
    return matchesSearch && matchesOrg && matchesSource;
  }) || [];

  // Get organization name for a product
  const getOrgName = (orgId: number) => {
    return organizations?.find(org => org.id === orgId)?.name || `Org ${orgId}`;
  };

  // Get unique sources for filter
  const uniqueSources = Array.from(new Set(products?.map(p => p.source) || []));

  const getSourceBadgeColor = (source: string) => {
    switch (source.toLowerCase()) {
      case 'amazon': return 'bg-orange-100 text-orange-800';
      case 'shareasale': return 'bg-blue-100 text-blue-800';
      case 'commission junction': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Affiliate Products
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage affiliate product catalog with Amazon integration
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-product">
              <Plus className="h-4 w-4 mr-2" />
              New Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Affiliate Product</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter product name" 
                            data-testid="input-product-name"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SKU</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Product SKU" 
                            data-testid="input-product-sku"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product URL</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://example.com/product" 
                          data-testid="input-product-url"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="source"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Affiliate Source</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-product-source">
                              <SelectValue placeholder="Select source" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="amazon">Amazon Associates</SelectItem>
                            <SelectItem value="shareasale">ShareASale</SelectItem>
                            <SelectItem value="commission-junction">Commission Junction</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="$19.99" 
                            data-testid="input-product-price"
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://example.com/image.jpg" 
                            data-testid="input-product-image"
                            {...field}
                            value={field.value || ''}
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
                            <SelectTrigger data-testid="select-product-organization">
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
                </div>
                
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

      {/* Tabs for Product Management */}
      <Tabs defaultValue="manual" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual" className="flex items-center space-x-2">
            <ShoppingCart className="h-4 w-4" />
            <span>Manual Products</span>
          </TabsTrigger>
          <TabsTrigger value="amazon" className="flex items-center space-x-2">
            <Package className="h-4 w-4" />
            <span>Amazon Search</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search-products"
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
        <Select value={selectedSourceFilter} onValueChange={setSelectedSourceFilter}>
          <SelectTrigger className="w-40" data-testid="select-filter-source">
            <SelectValue placeholder="Filter by source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            {uniqueSources.map((source) => (
              <SelectItem key={source} value={source}>
                {source}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <Card key={product.id} data-testid={`card-product-${product.id}`}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <ShoppingCart className="h-5 w-5 text-rose-500 flex-shrink-0" />
                    <CardTitle className="text-lg truncate">{product.name}</CardTitle>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getSourceBadgeColor(product.source)}>
                    {product.source}
                  </Badge>
                  {product.price && (
                    <Badge variant="outline">
                      <DollarSign className="h-3 w-3 mr-1" />
                      {product.price}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Building2 className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{getOrgName(product.orgId)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Tag className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">SKU: {product.sku}</span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Added {new Date(product.createdAt).toLocaleDateString()}
                  </div>
                  {product.imageUrl && (
                    <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                      <Image className="h-4 w-4 mr-2" />
                      Image available
                    </div>
                  )}
                </div>
                <div className="flex justify-between">
                  <div className="flex space-x-1">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => window.open(product.url, '_blank')}
                      data-testid={`button-view-${product.id}`}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEdit(product)}
                      data-testid={`button-edit-${product.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => deleteMutation.mutate(product.id)}
                      disabled={deleteMutation.isPending}
                      data-testid={`button-delete-${product.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

          {filteredProducts.length === 0 && !isLoading && (
            <Card>
              <CardContent className="text-center py-8">
                <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No affiliate products found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {searchTerm || selectedOrgFilter !== 'all' || selectedSourceFilter !== 'all'
                    ? 'No products match your filters.' 
                    : 'Get started by adding your first affiliate product.'}
                </p>
                {!searchTerm && selectedOrgFilter === 'all' && selectedSourceFilter === 'all' && (
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="amazon" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Amazon Product Discovery</span>
                <Badge variant="secondary" className="ml-2">
                  <Zap className="h-3 w-3 mr-1" />
                  PA-API
                </Badge>
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Search Amazon's vast catalog using the Product Advertising API. Find high-converting products with real-time data including ratings, reviews, pricing, and Prime eligibility.
              </p>
            </CardHeader>
            <CardContent>
              <AmazonProductSearch />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Instruction Footer */}
      <InstructionFooter
        title="Affiliate Products"
        whatIsIt="Comprehensive product database with manual entry and Amazon PA-API integration for affiliate marketing campaigns."
        setupSteps={[
          "Manual: Add products manually with affiliate links and metadata.",
          "Amazon: Configure PA-API credentials for real-time product discovery.",
          "Integration: Use Auto-Insert buttons in campaigns for seamless product placement."
        ]}
        usageSteps={[
          "Browse existing products or search Amazon's catalog in real-time.",
          "Products automatically integrate with campaigns based on niche and keywords.",
          "Copy affiliate URLs or export product data for external use."
        ]}
      />
    </div>
  );
};

export default AffiliateProductsPage;