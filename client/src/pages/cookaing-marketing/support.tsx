import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  HeadphonesIcon,
  Plus, 
  Search, 
  TicketIcon,
  BookOpen,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
  Mail,
  Loader2,
  TrendingUp,
  Users,
  Timer,
  Star,
  Filter,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Send,
  Bot,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import InstructionFooter from '@/cookaing-marketing/components/InstructionFooter';

// Form schemas
const ticketFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  categoryId: z.number().optional(),
  customerEmail: z.string().email("Valid email required"),
  customerName: z.string().min(1, "Name is required"),
});

const articleFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  excerpt: z.string().optional(),
  categoryId: z.number().optional(),
  tags: z.string().optional(),
});

type TicketForm = z.infer<typeof ticketFormSchema>;
type ArticleForm = z.infer<typeof articleFormSchema>;

// Types
interface SupportStats {
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  avgResponseTime: number;
  avgResolutionTime: number;
  satisfactionScore: number;
}

interface SupportTicket {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  customerEmail: string;
  customerName: string;
  createdAt: string;
  updatedAt: string;
}

interface KnowledgeBaseArticle {
  id: number;
  title: string;
  excerpt: string;
  viewCount: number;
  helpfulCount: number;
  notHelpfulCount: number;
  status: string;
  createdAt: string;
}

interface SupportCategory {
  id: number;
  name: string;
  description: string;
}

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig: Record<string, { color: string; icon: any }> = {
    'open': { color: 'bg-blue-100 text-blue-800', icon: AlertCircle },
    'in_progress': { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    'resolved': { color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
    'closed': { color: 'bg-gray-100 text-gray-800', icon: CheckCircle2 }
  };
  
  const config = statusConfig[status] || statusConfig['open'];
  const IconComponent = config.icon;
  
  return (
    <Badge className={`${config.color} flex items-center gap-1`}>
      <IconComponent className="w-3 h-3" />
      {status.replace('_', ' ')}
    </Badge>
  );
};

// Priority Badge Component
const PriorityBadge = ({ priority }: { priority: string }) => {
  const priorityConfig: Record<string, { color: string }> = {
    'low': { color: 'bg-gray-100 text-gray-800' },
    'medium': { color: 'bg-blue-100 text-blue-800' },
    'high': { color: 'bg-orange-100 text-orange-800' },
    'urgent': { color: 'bg-red-100 text-red-800' }
  };
  
  const config = priorityConfig[priority] || priorityConfig['medium'];
  
  return (
    <Badge className={config.color}>
      {priority}
    </Badge>
  );
};

export default function SupportCenterPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);
  const [isArticleDialogOpen, setIsArticleDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form initialization
  const ticketForm = useForm<TicketForm>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
      categoryId: undefined,
      customerEmail: '',
      customerName: '',
    }
  });

  const articleForm = useForm<ArticleForm>({
    resolver: zodResolver(articleFormSchema),
    defaultValues: {
      title: '',
      content: '',
      excerpt: '',
      categoryId: undefined,
      tags: '',
    }
  });

  // Data queries
  const { data: stats, isLoading: statsLoading } = useQuery<{ success: boolean; data: SupportStats }>({
    queryKey: ['/api/cookaing-marketing/support/stats'],
    staleTime: 30000
  });

  const { data: tickets, isLoading: ticketsLoading } = useQuery<{ success: boolean; data: SupportTicket[] }>({
    queryKey: ['/api/cookaing-marketing/support/tickets'],
    staleTime: 30000
  });

  const { data: articles, isLoading: articlesLoading } = useQuery<{ success: boolean; data: KnowledgeBaseArticle[] }>({
    queryKey: ['/api/cookaing-marketing/support/knowledge-base'],
    staleTime: 60000
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery<{ success: boolean; data: SupportCategory[] }>({
    queryKey: ['/api/cookaing-marketing/support/categories'],
    staleTime: 300000
  });

  // Mutations
  const createTicketMutation = useMutation({
    mutationFn: async (data: TicketForm) => {
      return apiRequest('/api/cookaing-marketing/support/tickets', 'POST', data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Support ticket created successfully!"
      });
      ticketForm.reset();
      setIsTicketDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/cookaing-marketing/support/tickets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/cookaing-marketing/support/stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create ticket",
        variant: "destructive"
      });
    }
  });

  const createArticleMutation = useMutation({
    mutationFn: async (data: ArticleForm) => {
      return apiRequest('/api/cookaing-marketing/support/knowledge-base', 'POST', {
        ...data,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : [],
        slug: data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Knowledge base article created successfully!"
      });
      articleForm.reset();
      setIsArticleDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/cookaing-marketing/support/knowledge-base'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create article",
        variant: "destructive"
      });
    }
  });

  // Filter tickets and articles based on search
  const filteredTickets = tickets?.data?.filter(ticket =>
    ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredArticles = articles?.data?.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2" data-testid="heading-support-center">Customer Support Center</h1>
          <p className="text-muted-foreground">
            Manage tickets, knowledge base, and provide excellent customer support
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Bot className="w-3 h-3" />
            Live System
          </Badge>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <Card data-testid="card-total-tickets">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : stats?.data?.totalTickets || 0}
            </div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card data-testid="card-open-tickets">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : stats?.data?.openTickets || 0}
            </div>
            <p className="text-xs text-muted-foreground">Needs attention</p>
          </CardContent>
        </Card>

        <Card data-testid="card-resolved-tickets">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : stats?.data?.resolvedTickets || 0}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card data-testid="card-response-time">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : `${stats?.data?.avgResponseTime || 0}h`}
            </div>
            <p className="text-xs text-muted-foreground">First response</p>
          </CardContent>
        </Card>

        <Card data-testid="card-resolution-time">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Resolution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : `${stats?.data?.avgResolutionTime || 0}h`}
            </div>
            <p className="text-xs text-muted-foreground">Full resolution</p>
          </CardContent>
        </Card>

        <Card data-testid="card-satisfaction-score">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : `${stats?.data?.satisfactionScore || 0}%`}
            </div>
            <p className="text-xs text-muted-foreground">Customer rating</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2" data-testid="tab-overview">
            <TrendingUp className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="tickets" className="flex items-center gap-2" data-testid="tab-tickets">
            <TicketIcon className="w-4 h-4" />
            Tickets
          </TabsTrigger>
          <TabsTrigger value="knowledge-base" className="flex items-center gap-2" data-testid="tab-knowledge-base">
            <BookOpen className="w-4 h-4" />
            Knowledge Base
          </TabsTrigger>
          <TabsTrigger value="live-chat" className="flex items-center gap-2" data-testid="tab-live-chat">
            <MessageSquare className="w-4 h-4" />
            Live Chat
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card data-testid="card-recent-tickets">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TicketIcon className="w-5 h-5" />
                  Recent Tickets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  {ticketsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {tickets?.data?.slice(0, 5).map((ticket) => (
                        <div key={ticket.id} className="flex items-start justify-between p-3 border rounded-lg" data-testid={`ticket-item-${ticket.id}`}>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{ticket.title}</p>
                            <p className="text-xs text-muted-foreground">{ticket.customerName} • {ticket.customerEmail}</p>
                            <p className="text-xs text-muted-foreground">{new Date(ticket.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="flex flex-col gap-1">
                            <StatusBadge status={ticket.status} />
                            <PriorityBadge priority={ticket.priority} />
                          </div>
                        </div>
                      )) || []}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            <Card data-testid="card-popular-articles">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Popular Articles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  {articlesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {articles?.data?.slice(0, 5).map((article) => (
                        <div key={article.id} className="flex items-start justify-between p-3 border rounded-lg" data-testid={`article-item-${article.id}`}>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{article.title}</p>
                            <p className="text-xs text-muted-foreground">{article.excerpt}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {article.viewCount} views
                              </span>
                              <span className="flex items-center gap-1">
                                <ThumbsUp className="w-3 h-3" />
                                {article.helpfulCount}
                              </span>
                            </div>
                          </div>
                        </div>
                      )) || []}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tickets Tab */}
        <TabsContent value="tickets" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                  data-testid="input-search-tickets"
                />
              </div>
            </div>
            <Dialog open={isTicketDialogOpen} onOpenChange={setIsTicketDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-ticket">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Ticket
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Support Ticket</DialogTitle>
                </DialogHeader>
                <Form {...ticketForm}>
                  <form onSubmit={ticketForm.handleSubmit((data) => createTicketMutation.mutate(data))} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={ticketForm.control}
                        name="customerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Customer Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" data-testid="input-customer-name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={ticketForm.control}
                        name="customerEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Customer Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="john@example.com" data-testid="input-customer-email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={ticketForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Brief description of the issue" data-testid="input-ticket-title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={ticketForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Detailed description of the issue..."
                              className="min-h-[100px]"
                              data-testid="textarea-ticket-description"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={ticketForm.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Priority</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-ticket-priority">
                                  <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={ticketForm.control}
                        name="categoryId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                              <FormControl>
                                <SelectTrigger data-testid="select-ticket-category">
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categories?.data?.map((category) => (
                                  <SelectItem key={category.id} value={category.id.toString()}>
                                    {category.name}
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
                      disabled={createTicketMutation.isPending}
                      data-testid="button-submit-ticket"
                    >
                      {createTicketMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      Create Ticket
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <Card data-testid="card-tickets-list">
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                {ticketsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-0">
                    {filteredTickets.map((ticket, index) => (
                      <div key={ticket.id} className={`flex items-center justify-between p-4 ${index !== filteredTickets.length - 1 ? 'border-b' : ''}`} data-testid={`ticket-row-${ticket.id}`}>
                        <div className="flex-1 grid grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm font-medium">{ticket.title}</p>
                            <p className="text-xs text-muted-foreground">#{ticket.id}</p>
                          </div>
                          <div>
                            <p className="text-sm">{ticket.customerName}</p>
                            <p className="text-xs text-muted-foreground">{ticket.customerEmail}</p>
                          </div>
                          <div className="flex flex-col gap-1">
                            <StatusBadge status={ticket.status} />
                            <PriorityBadge priority={ticket.priority} />
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Created</p>
                            <p className="text-sm">{new Date(ticket.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Knowledge Base Tab */}
        <TabsContent value="knowledge-base" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                  data-testid="input-search-articles"
                />
              </div>
            </div>
            <Dialog open={isArticleDialogOpen} onOpenChange={setIsArticleDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-article">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Article
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Create Knowledge Base Article</DialogTitle>
                </DialogHeader>
                <Form {...articleForm}>
                  <form onSubmit={articleForm.handleSubmit((data) => createArticleMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={articleForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Article Title</FormLabel>
                          <FormControl>
                            <Input placeholder="How to..." data-testid="input-article-title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={articleForm.control}
                      name="excerpt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Excerpt (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Brief summary of the article" data-testid="input-article-excerpt" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={articleForm.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Content</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Article content in markdown format..."
                              className="min-h-[200px]"
                              data-testid="textarea-article-content"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={articleForm.control}
                        name="categoryId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                              <FormControl>
                                <SelectTrigger data-testid="select-article-category">
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categories?.data?.map((category) => (
                                  <SelectItem key={category.id} value={category.id.toString()}>
                                    {category.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={articleForm.control}
                        name="tags"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tags (comma-separated)</FormLabel>
                            <FormControl>
                              <Input placeholder="how-to, tutorial, faq" data-testid="input-article-tags" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={createArticleMutation.isPending}
                      data-testid="button-submit-article"
                    >
                      {createArticleMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <BookOpen className="w-4 h-4 mr-2" />
                      )}
                      Create Article
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {articlesLoading ? (
              <div className="col-span-full flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              filteredArticles.map((article) => (
                <Card key={article.id} data-testid={`article-card-${article.id}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{article.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{article.excerpt}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {article.viewCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3" />
                          {article.helpfulCount}
                        </span>
                      </div>
                      <Badge variant={article.status === 'published' ? 'default' : 'secondary'}>
                        {article.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Live Chat Tab */}
        <TabsContent value="live-chat" className="space-y-6">
          <Card data-testid="card-live-chat">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Live Chat System
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Live Chat Coming Soon</h3>
                <p className="text-muted-foreground mb-4">
                  Real-time customer support chat functionality will be available here.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                  <div className="text-center">
                    <Zap className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                    <p className="text-sm font-medium">Instant Responses</p>
                    <p className="text-xs text-muted-foreground">Real-time messaging</p>
                  </div>
                  <div className="text-center">
                    <Users className="w-8 h-8 mx-auto text-green-500 mb-2" />
                    <p className="text-sm font-medium">Agent Assignment</p>
                    <p className="text-xs text-muted-foreground">Smart routing</p>
                  </div>
                  <div className="text-center">
                    <Timer className="w-8 h-8 mx-auto text-orange-500 mb-2" />
                    <p className="text-sm font-medium">Response Tracking</p>
                    <p className="text-xs text-muted-foreground">SLA monitoring</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <InstructionFooter 
        title="Customer Support Center"
        whatIsIt="A comprehensive support management system for handling tickets, knowledge base articles, and live customer chat."
        setupSteps={[
          "Configure support categories and priorities",
          "Set up agent accounts and permissions",
          "Create initial knowledge base articles",
          "Configure SLA and response time goals"
        ]}
        usageSteps={[
          "Monitor incoming tickets and customer inquiries",
          "Create and manage support tickets with proper categorization",
          "Build comprehensive knowledge base for self-service",
          "Track metrics and maintain high satisfaction scores"
        ]}
      />
    </div>
  );
}