import React, { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Users, 
  Mail, 
  FileText, 
  ShoppingCart, 
  Workflow, 
  Building2,
  ArrowRight,
  TrendingUp,
  BarChart3,
  Sparkles,
  Zap,
  Heart,
  AlertTriangle,
  ChevronDown,
  HelpCircle
} from "lucide-react";
import InstructionFooter from '@/cookaing-marketing/components/InstructionFooter';

const CookAIngMarketingDashboard = () => {
  const [isDashboardInfoOpen, setIsDashboardInfoOpen] = useState(false);
  
  // Fetch overview stats
  const { data: stats, isLoading } = useQuery<{
    organizations: number;
    contacts: number;
    activeCampaigns: number;
    conversionRate: string;
  }>({
    queryKey: ['/api/cookaing-marketing/stats'],
    retry: false,
  });

  // Fetch intelligence analytics stats
  const { data: intelligenceStats, isLoading: intelligenceLoading } = useQuery({
    queryKey: ['/api/cookaing-marketing/intel/status'],
    staleTime: 300000, // 5 minutes
    retry: false,
  });

  const quickActions = [
    {
      title: "Organizations",
      description: "Manage client organizations and accounts",
      icon: Building2,
      path: "/cookaing-marketing/organizations",
      color: "bg-blue-500",
      testId: "link-organizations"
    },
    {
      title: "Contacts",
      description: "Manage leads and customer contacts",
      icon: Users,
      path: "/cookaing-marketing/contacts",
      color: "bg-green-500",
      testId: "link-contacts"
    },
    {
      title: "Campaigns",
      description: "Create and manage marketing campaigns",
      icon: Mail,
      path: "/cookaing-marketing/campaigns",
      color: "bg-purple-500",
      testId: "link-campaigns"
    },
    {
      title: "Workflows",
      description: "Automate marketing processes",
      icon: Workflow,
      path: "/cookaing-marketing/workflows",
      color: "bg-orange-500",
      testId: "link-workflows"
    },
    {
      title: "Forms",
      description: "Build lead capture forms",
      icon: FileText,
      path: "/cookaing-marketing/forms",
      color: "bg-indigo-500",
      testId: "link-forms"
    },
    {
      title: "Affiliate Products",
      description: "Manage affiliate product catalog",
      icon: ShoppingCart,
      path: "/cookaing-marketing/affiliate-products",
      color: "bg-rose-500",
      testId: "link-affiliate-products"
    },
    {
      title: "Content Generator",
      description: "Transform recipes into engaging multi-platform content",
      icon: Sparkles,
      path: "/cookaing-marketing/content",
      color: "bg-teal-500",
      testId: "link-content"
    },
    {
      title: "Intelligence Center",
      description: "AI-powered competitor analysis, sentiment & viral prediction",
      icon: BarChart3,
      path: "/cookaing-marketing/intelligence",
      color: "bg-purple-600",
      testId: "link-intelligence"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Dashboard Overview Dropdown */}
      <Collapsible open={isDashboardInfoOpen} onOpenChange={setIsDashboardInfoOpen} className="w-full">
        <CollapsibleTrigger asChild>
          <Card className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-orange-200 bg-orange-50 dark:bg-orange-950" data-testid="button-dashboard-info">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-orange-600" />
                  <CardTitle className="text-lg text-orange-900 dark:text-orange-100">
                    🍳 What is CookAIng Marketing Engine? Click to learn about each section
                  </CardTitle>
                </div>
                <ChevronDown 
                  className={`h-4 w-4 text-orange-600 transition-transform duration-200 ${
                    isDashboardInfoOpen ? 'rotate-180' : ''
                  }`} 
                />
              </div>
            </CardHeader>
          </Card>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950 border-t-0 rounded-t-none">
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-2">
                    🍳 CookAIng Marketing Engine Overview
                  </h3>
                  <p className="text-orange-800 dark:text-orange-200 text-sm leading-relaxed">
                    CookAIng Marketing Engine is a comprehensive recipe-focused marketing automation platform that transforms culinary content into engaging multi-channel marketing campaigns. Built for food bloggers, recipe developers, and culinary businesses, it combines AI-powered content generation with advanced marketing automation tools.
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-orange-900 dark:text-orange-100 text-sm">🏢 Organizations & Contact Management</h4>
                    <p className="text-xs text-orange-700 dark:text-orange-300">Manage client organizations, customer databases, and lead segmentation. Track engagement across multiple food-focused customer segments with detailed contact profiles and interaction histories.</p>
                    
                    <h4 className="font-semibold text-orange-900 dark:text-orange-100 text-sm">📧 Campaign & Workflow Automation</h4>
                    <p className="text-xs text-orange-700 dark:text-orange-300">Create and manage automated email campaigns, recipe newsletters, and seasonal marketing workflows. Set up drip campaigns for recipe collections and automated follow-ups for cooking enthusiasts.</p>
                    
                    <h4 className="font-semibold text-orange-900 dark:text-orange-100 text-sm">📝 Forms & Lead Capture</h4>
                    <p className="text-xs text-orange-700 dark:text-orange-300">Build custom lead capture forms for recipe downloads, cooking class signups, and newsletter subscriptions. Track form submissions and conversion rates with detailed analytics.</p>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold text-orange-900 dark:text-orange-100 text-sm">🛍️ Affiliate Product Management</h4>
                    <p className="text-xs text-orange-700 dark:text-orange-300">Manage cooking equipment, ingredient suppliers, and kitchen tool affiliate partnerships. Track revenue from recipe-related product recommendations and optimize affiliate performance.</p>
                    
                    <h4 className="font-semibold text-orange-900 dark:text-orange-100 text-sm">✨ AI Content Generation & Intelligence</h4>
                    <p className="text-xs text-orange-700 dark:text-orange-300">Transform recipes into engaging social media content, blog posts, and marketing materials. AI-powered competitor analysis, sentiment tracking, and viral content prediction specifically for food content.</p>
                    
                    <h4 className="font-semibold text-orange-900 dark:text-orange-100 text-sm">📊 Marketing Analytics & Attribution</h4>
                    <p className="text-xs text-orange-700 dark:text-orange-300">Track campaign performance, cost analysis, and ROI across all marketing channels. Advanced attribution modeling for recipe engagement, conversion tracking, and customer lifetime value.</p>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-orange-200 dark:border-orange-800 mt-4">
                  <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                    💡 <strong>Quick Start:</strong> Begin by setting up your organization, import your recipe database, then create targeted campaigns using AI-generated content. Monitor performance and optimize using intelligence insights.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          CookAIng Marketing Engine
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Comprehensive marketing automation and content generation platform
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="card-organizations">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organizations</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-organizations">
              {isLoading ? "-" : stats?.organizations || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Active client accounts
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-contacts">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contacts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-contacts">
              {isLoading ? "-" : stats?.contacts || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Total leads & customers
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-campaigns">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-campaigns">
              {isLoading ? "-" : stats?.activeCampaigns || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently running
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-conversion-rate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-conversion-rate">
              {isLoading ? "-" : stats?.conversionRate || "0%"}
            </div>
            <p className="text-xs text-muted-foreground">
              Form submissions to leads
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Intelligence Analytics KPIs */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Intelligence Analytics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card data-testid="card-intel-competitor">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Competitor Insights</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-intel-competitor">
                {intelligenceLoading ? "-" : intelligenceStats?.competitor?.insights || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Analysis reports generated
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-intel-sentiment">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sentiment Score</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-intel-sentiment">
                {intelligenceLoading ? "-" : (intelligenceStats?.sentiment?.averageScore || 0).toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground">
                Average content sentiment
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-intel-viral">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Viral Predictions</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-intel-viral">
                {intelligenceLoading ? "-" : intelligenceStats?.viral?.predicted || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                High-potential content pieces
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-intel-fatigue">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fatigue Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-intel-fatigue">
                {intelligenceLoading ? "-" : intelligenceStats?.fatigue?.warnings || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Content fatigue warnings
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const IconComponent = action.icon;
            return (
              <Link key={action.path} href={action.path}>
                <Card 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  data-testid={action.testId}
                >
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${action.color}`}>
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{action.title}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {action.description}
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      Manage <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <Card data-testid="card-recent-activity">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <BarChart3 className="h-8 w-8 mx-auto mb-2" />
            <p>Activity tracking coming soon</p>
          </div>
        </CardContent>
      </Card>

      {/* Instruction Footer */}
      <InstructionFooter
        title="Marketing Dashboard"
        whatIsIt="Central KPI overview for CookAIng marketing. Pulls recent activity across contacts, campaigns, email, social/blog/push, A/B, and costs/ROAS."
        setupSteps={[
          "Ensure seeds or real data exist in Contacts, Campaigns, and Analytics.",
          "Optionally upload a costs CSV in Costs & ROAS to enable spend/ROAS tiles.",
          "Verify feature flags for channels you plan to use (ENABLE_EMAIL/SOCIAL/BLOG/PUSH)."
        ]}
        usageSteps={[
          "Scan 14-day KPIs; click into any widget to drill into the source page.",
          "Use A/B snapshot to identify winners to reuse in upcoming sends.",
          "Review Top Content to inform social and ad creative."
        ]}
        relatedLinks={[
          {label:"Reports", href:"/cookaing-marketing/reports"},
          {label:"Costs & ROAS", href:"/cookaing-marketing/costs"}
        ]}
      />
    </div>
  );
};

export default CookAIngMarketingDashboard;