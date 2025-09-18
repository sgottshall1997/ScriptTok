import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  Users, 
  Mail, 
  FileText, 
  ShoppingCart, 
  Workflow, 
  Building2,
  ArrowRight,
  TrendingUp,
  BarChart3
} from "lucide-react";
import InstructionFooter from '@/cookaing-marketing/components/InstructionFooter';

const CookAIngMarketingDashboard = () => {
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
    }
  ];

  return (
    <div className="space-y-6">
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