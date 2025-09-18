import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Link } from "wouter";
import { 
  Home, 
  Building2,
  Users,
  Users2,
  Target,
  FlaskConical,
  Workflow,
  PersonStanding,
  FormInput,
  FileSpreadsheet,
  ShoppingCart,
  TrendingUp,
  BarChart2,
  CreditCard,
  GitBranch,
  Monitor,
  Send,
  Mail,
  Wrench,
  BookOpen,
  ArrowRight,
  Zap,
  Globe,
  Database,
  Settings
} from 'lucide-react';
import InstructionFooter from '@/cookaing-marketing/components/InstructionFooter';

interface CookAIngSection {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  category: 'core' | 'automation' | 'analytics' | 'admin';
  description: string;
  whatItDoes: string;
  setup: string;
  usage: string;
}

const sections: CookAIngSection[] = [
  {
    id: 'dashboard',
    name: 'Marketing Dashboard',
    icon: Home,
    path: '/cookaing-marketing',
    category: 'core',
    description: 'Central command center for all CookAIng marketing activities',
    whatItDoes: 'Displays comprehensive KPI overview with recent activity across contacts, campaigns, email performance, social media, A/B tests, and ROAS metrics.',
    setup: 'Requires seed data or real data in contacts, campaigns, and analytics to display meaningful metrics.',
    usage: 'Start here each day to review performance, identify trends, and navigate to specific tools based on priority actions.'
  },
  {
    id: 'organizations',
    name: 'Organizations',
    icon: Building2,
    path: '/cookaing-marketing/organizations',
    category: 'admin',
    description: 'Multi-tenant management for brands and client accounts',
    whatItDoes: 'Manages different organizations/brands with separate plan settings, sending limits, and contact databases.',
    setup: 'Create your primary organization (CookAIng) and assign appropriate plan levels and defaults.',
    usage: 'Filter records by organization, update plan metadata, and manage linked contacts and campaigns.'
  },
  {
    id: 'contacts',
    name: 'Contacts',
    icon: Users,
    path: '/cookaing-marketing/contacts',
    category: 'core',
    description: 'Complete lead and customer directory with rich profile data',
    whatItDoes: 'Stores contact information including preferences, dietary restrictions, pantry data, tags, and attribution tracking.',
    setup: 'Embed forms on your site and ensure UTM parameters are captured via GA4/GTM integration.',
    usage: 'Search and filter contacts by segments, edit preferences, view first/last touch attribution, and inspect engagement history.'
  },
  {
    id: 'segments',
    name: 'Segments',
    icon: Users2,
    path: '/cookaing-marketing/segments',
    category: 'core',
    description: 'Dynamic contact lists driven by behavioral and preference rules',
    whatItDoes: 'Creates targeted audience groups using rules like diet preferences, cooking time constraints, and engagement patterns.',
    setup: 'Define segmentation rules using contact fields, tags, and behavioral data.',
    usage: 'Use segments as audiences for campaign targeting and automated workflow triggers.'
  },
  {
    id: 'campaigns',
    name: 'Campaigns',
    icon: Target,
    path: '/cookaing-marketing/campaigns',
    category: 'core',
    description: 'Multi-channel campaign creation and management hub',
    whatItDoes: 'Orchestrates campaigns across email, social media, blog publishing, and push notifications with unified tracking.',
    setup: 'Configure authentication for email providers (SPF/DKIM/DMARC) and social media platforms.',
    usage: 'Create campaign artifacts for each channel, select target segments, schedule sends, and monitor performance metrics.'
  },
  {
    id: 'experiments',
    name: 'A/B Testing',
    icon: FlaskConical,
    path: '/cookaing-marketing/experiments',
    category: 'analytics',
    description: 'Scientific testing framework for optimizing campaign performance',
    whatItDoes: 'Runs controlled tests on subject lines, CTAs, and content with statistical significance and auto-winner selection.',
    setup: 'Link experiments to campaigns and ensure analytics events are properly tracked.',
    usage: 'Monitor open rates and click-through rates per variant, identify statistical winners, and apply learnings to future campaigns.'
  },
  {
    id: 'workflows',
    name: 'Workflows',
    icon: Workflow,
    path: '/cookaing-marketing/workflows',
    category: 'automation',
    description: 'JSON-driven marketing automation engine',
    whatItDoes: 'Automates welcome series, seasonal campaigns, referral programs, and weekly digest emails based on triggers and schedules.',
    setup: 'Define workflow triggers (form submissions, segment joins) and configure automation sequences.',
    usage: 'Toggle workflows active/inactive, monitor execution logs, and review automated campaign performance.'
  },
  {
    id: 'personalization',
    name: 'Personalization',
    icon: PersonStanding,
    path: '/cookaing-marketing/personalization',
    category: 'automation',
    description: 'Dynamic content personalization and meal coaching system',
    whatItDoes: 'Inserts personalized tokens and pantry-aware content recommendations, plus automated weekly Meal-Prep Coach digests.',
    setup: 'Ensure contacts have complete pantry and dietary preference data populated.',
    usage: 'Preview personalized content as specific contacts and send test digest emails to validate personalization logic.'
  },
  {
    id: 'forms',
    name: 'Forms',
    icon: FormInput,
    path: '/cookaing-marketing/forms',
    category: 'core',
    description: 'Lead capture form builder with UTM tracking',
    whatItDoes: 'Creates public forms for lead capture with automatic contact creation and UTM parameter storage.',
    setup: 'Build forms and embed /forms/{slug} URLs on your website with proper GA4/GTM tracking.',
    usage: 'Monitor form performance, track submission sources, and integrate with automated welcome workflows.'
  },
  {
    id: 'submissions',
    name: 'Form Submissions',
    icon: FileSpreadsheet,
    path: '/cookaing-marketing/submissions',
    category: 'analytics',
    description: 'Comprehensive form submission analytics and data viewer',
    whatItDoes: 'Displays all incoming form data with UTM attribution, timestamps, and conversion tracking.',
    setup: 'Ensure at least one form is active and receiving traffic with proper tracking.',
    usage: 'Filter submissions by form, date range, UTM parameters, and export data for analysis.'
  },
  {
    id: 'affiliates',
    name: 'Affiliate Products',
    icon: ShoppingCart,
    path: '/cookaing-marketing/affiliate-products',
    category: 'core',
    description: 'Smart affiliate product catalog with auto-insertion capabilities',
    whatItDoes: 'Manages affiliate product inventory with intelligent matching and automatic insertion into recipes and emails.',
    setup: 'Seed product catalog or connect affiliate API keys, tag products by diet and equipment type.',
    usage: 'Use auto-insert functionality in campaign editor to automatically enrich recipe content with relevant affiliate products.'
  },
  {
    id: 'trends',
    name: 'Trends & Seasonal',
    icon: TrendingUp,
    path: '/cookaing-marketing/trends',
    category: 'analytics',
    description: 'AI-powered trend detection and seasonal campaign generator',
    whatItDoes: 'Analyzes trending topics and generates seasonal holiday campaign drafts with relevant content and timing.',
    setup: 'Configure trend detection APIs or use AI-generated trend data for campaign inspiration.',
    usage: 'Review automatically generated campaign drafts, customize content, and publish to active channels.'
  },
  {
    id: 'reports',
    name: 'Reports',
    icon: BarChart2,
    path: '/cookaing-marketing/reports',
    category: 'analytics',
    description: 'Comprehensive performance analytics and ROAS reporting',
    whatItDoes: 'Provides detailed performance rollups by campaign, channel, and segment with open rates, CTR, and basic ROAS calculations.',
    setup: 'Ensure analytics events are properly ingesting and upload cost data for ROAS calculations.',
    usage: 'Filter reports by date range, channel, and segment; export data or capture screenshots for stakeholder reporting.'
  },
  {
    id: 'costs',
    name: 'Costs & ROAS',
    icon: CreditCard,
    path: '/cookaing-marketing/costs',
    category: 'analytics',
    description: 'Ad spend tracking and return on advertising spend calculator',
    whatItDoes: 'Tracks advertising costs and calculates ROAS using click-through proxies and revenue attribution.',
    setup: 'Prepare and upload CSV files with date, campaign_platform, campaign_name, and cost columns.',
    usage: 'Review spend by campaign, cross-reference with Reports data, and optimize budget allocation based on ROAS performance.'
  },
  {
    id: 'attribution',
    name: 'Attribution Inspector',
    icon: GitBranch,
    path: '/cookaing-marketing/attribution',
    category: 'analytics',
    description: 'Customer journey mapping and UTM attribution analysis',
    whatItDoes: 'Provides first-touch and last-touch attribution analysis with detailed UTM parameter drill-down by contact and campaign.',
    setup: 'Ensure GA4/GTM properly captures and passes UTM parameters to form submissions.',
    usage: 'Filter by campaign or traffic source, analyze customer journeys, and optimize attribution models for better ROI measurement.'
  },
  {
    id: 'health',
    name: 'Integration Health',
    icon: Monitor,
    path: '/cookaing-marketing/integrations-health',
    category: 'admin',
    description: 'Real-time monitoring of all marketing integrations',
    whatItDoes: 'Monitors the status and health of email, social media, blog, push notification, affiliate, and analytics integrations.',
    setup: 'Add required environment variables and API keys, then run health checks to verify connectivity.',
    usage: 'Check before major campaigns to ensure all integrations are ready; troubleshoot any missing_keys or failed connections.'
  },
  {
    id: 'webhooks',
    name: 'Webhooks Monitor',
    icon: Send,
    path: '/cookaing-marketing/webhooks',
    category: 'admin',
    description: 'Inbound webhook event logging and monitoring system',
    whatItDoes: 'Logs and monitors inbound webhook events from email providers, social platforms, and other integrated services.',
    setup: 'Configure webhook URLs at third-party providers and verify HMAC signature validation if using WEBHOOK_SECRET.',
    usage: 'Filter events by source and type, retry failed webhook processing, and debug integration issues.'
  },
  {
    id: 'email-test',
    name: 'Email Delivery Test',
    icon: Mail,
    path: '/cookaing-marketing/email-test',
    category: 'admin',
    description: 'Email template preview and delivery testing environment',
    whatItDoes: 'Provides artifact preview and mock send logging to validate email rendering without requiring live API keys.',
    setup: 'Select campaigns with email artifacts; use mock mode for testing or real mode with authenticated providers.',
    usage: 'Inspect HTML rendering, test send functionality, and iterate on email templates before campaign deployment.'
  },
  {
    id: 'devtools',
    name: 'Developer Tools',
    icon: Wrench,
    path: '/cookaing-marketing/devtools',
    category: 'admin',
    description: 'Development utilities and feature flag management',
    whatItDoes: 'Provides database seeding, end-to-end testing triggers, and feature flag toggles for development and testing.',
    setup: 'Ensure development database is writable and decide which feature flags to enable for testing.',
    usage: 'Run database seeds, execute end-to-end smoke tests, and toggle ENABLE_* flags to test feature gating.'
  },
  {
    id: 'docs',
    name: 'Documentation',
    icon: BookOpen,
    path: '/cookaing-marketing/docs',
    category: 'admin',
    description: 'Comprehensive system documentation and runbooks',
    whatItDoes: 'Centralizes documentation for environment variables, webhook configurations, operational runbooks, and system architecture.',
    setup: 'Review environment variable table and populate .env file as needed for your deployment.',
    usage: 'Reference for setup instructions, troubleshooting guides, and links to navigate between different system areas.'
  }
];

const AboutCookAIng = () => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'core': return <Zap className="w-4 h-4" />;
      case 'automation': return <Settings className="w-4 h-4" />;
      case 'analytics': return <BarChart2 className="w-4 h-4" />;
      case 'admin': return <Database className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'core': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'automation': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'analytics': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'admin': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const groupedSections = {
    core: sections.filter(s => s.category === 'core'),
    automation: sections.filter(s => s.category === 'automation'),
    analytics: sections.filter(s => s.category === 'analytics'),
    admin: sections.filter(s => s.category === 'admin')
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          About CookAIng Marketing Engine
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          A comprehensive, self-hosted marketing automation platform designed specifically for CookAIng. 
          This system orchestrates multi-channel campaigns, automates customer journeys, and provides 
          detailed analytics across email, social media, blog publishing, and push notifications.
        </p>
      </div>

      {/* System Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            System Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            The CookAIng Marketing Engine is built as a complete marketing stack with {sections.length} integrated modules. 
            It handles everything from lead capture and segmentation to automated campaigns and performance analytics. 
            The system is designed to scale from individual creators to multi-brand organizations.
          </p>
          
          {/* System Flow */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Marketing Flow</h4>
            <div className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-400 space-x-2 overflow-x-auto">
              <span className="whitespace-nowrap">Ads/Social</span>
              <ArrowRight className="w-4 h-4" />
              <span className="whitespace-nowrap">Forms</span>
              <ArrowRight className="w-4 h-4" />
              <span className="whitespace-nowrap">Contacts/Segments</span>
              <ArrowRight className="w-4 h-4" />
              <span className="whitespace-nowrap">Campaigns/Workflows</span>
              <ArrowRight className="w-4 h-4" />
              <span className="whitespace-nowrap">Email/Social/Blog/Push</span>
              <ArrowRight className="w-4 h-4" />
              <span className="whitespace-nowrap">Analytics/Reports</span>
              <ArrowRight className="w-4 h-4" />
              <span className="whitespace-nowrap">A/B/Personalization</span>
              <ArrowRight className="w-4 h-4" />
              <span className="whitespace-nowrap">ROAS/Attribution</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(groupedSections).map(([category, sectionList]) => (
          <Card key={category} className="text-center">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-center gap-2 text-lg">
                {getCategoryIcon(category)}
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className={getCategoryColor(category)}>
                {sectionList.length} modules
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Section Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>All CookAIng Sections</CardTitle>
          <p className="text-gray-600 dark:text-gray-400">
            Complete breakdown of every module in the marketing engine
          </p>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            {sections.map((section) => (
              <AccordionItem key={section.id} value={section.id}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3 text-left">
                    <section.icon className="w-5 h-5 text-gray-500" />
                    <div className="flex-1">
                      <div className="font-medium">{section.name}</div>
                      <div className="text-sm text-gray-500 font-normal">{section.description}</div>
                    </div>
                    <Badge className={getCategoryColor(section.category)} variant="secondary">
                      {section.category}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  <div className="space-y-4 pl-8">
                    <div>
                      <h5 className="font-semibold text-gray-900 dark:text-white mb-2">What it does</h5>
                      <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                        {section.whatItDoes}
                      </p>
                    </div>
                    
                    <div>
                      <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Setup</h5>
                      <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                        {section.setup}
                      </p>
                    </div>
                    
                    <div>
                      <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Usage</h5>
                      <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                        {section.usage}
                      </p>
                    </div>

                    <div className="pt-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={section.path}>
                          Go to {section.name}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Quick Navigation */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Navigation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {sections.map((section) => (
              <Button 
                key={section.id} 
                asChild 
                variant="ghost" 
                size="sm" 
                className="justify-start h-auto p-3"
              >
                <Link href={section.path}>
                  <section.icon className="w-4 h-4 mr-2" />
                  <span className="text-xs">{section.name}</span>
                </Link>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Instruction Footer */}
      <InstructionFooter
        title="About"
        whatIsIt="High-level overview of the CookAIng Marketing Engine and how all sections connect together. This page serves as the central documentation hub for understanding the complete system architecture and workflow."
        setupSteps={[
          "None required—this is reference documentation only.",
          "Bookmark this page for quick navigation to any CookAIng section.",
          "Use this page to onboard new team members or collaborators."
        ]}
        usageSteps={[
          "Start here when learning the CookAIng Marketing Engine for the first time.",
          "Use the accordion sections to understand what each module does.",
          "Click 'Go to [Section]' buttons to navigate directly to specific tools.",
          "Reference the system flow diagram to understand how data moves through the platform.",
          "Use this page to onboard collaborators and explain the complete marketing stack."
        ]}
        relatedLinks={[
          {label: "Marketing Dashboard", href: "/cookaing-marketing"},
          {label: "Documentation", href: "/cookaing-marketing/docs"},
          {label: "Developer Tools", href: "/cookaing-marketing/devtools"}
        ]}
        notes={[
          "This page is automatically updated as new sections are added to the CookAIng Marketing Engine.",
          "Each section has its own detailed instruction footer with specific setup and usage guidance.",
          "The system is designed to work in both mock mode (no external API keys) and production mode (with full integrations)."
        ]}
      />
    </div>
  );
};

export default AboutCookAIng;