import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Building,
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
  Info,
  Menu,
  X,
  ArrowLeft,
  History,
  Sparkles,
  FileText,
  Activity,
  HelpCircle,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ModeSwitcher from '@/components/ModeSwitcher';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
  disabledReason?: string;
}

interface SidebarSection {
  name: string;
  items: SidebarItem[];
}

const cookAIngNavigation: SidebarSection[] = [
  {
    name: "Overview",
    items: [
      { name: "Marketing Dashboard", href: "/cookaing-marketing", icon: Home },
      { name: "About", href: "/cookaing-marketing/about", icon: Info }
    ]
  },
  {
    name: "Data",
    items: [
      { name: "Organizations", href: "/cookaing-marketing/organizations", icon: Building },
      { name: "Contacts", href: "/cookaing-marketing/contacts", icon: Users },
      { name: "Segments", href: "/cookaing-marketing/segments", icon: Users2 },
      { name: "Forms", href: "/cookaing-marketing/forms", icon: FormInput },
      { name: "Form Submissions", href: "/cookaing-marketing/submissions", icon: FileSpreadsheet },
      { name: "Affiliate Products", href: "/cookaing-marketing/affiliate-products", icon: ShoppingCart }
    ]
  },
  {
    name: "Campaign Ops",
    items: [
      { name: "Campaigns", href: "/cookaing-marketing/campaigns", icon: Target },
      { name: "A/B Testing", href: "/cookaing-marketing/experiments", icon: FlaskConical },
      { name: "Workflows", href: "/cookaing-marketing/workflows", icon: Workflow },
      { name: "Personalization", href: "/cookaing-marketing/personalization", icon: PersonStanding }
    ]
  },
  {
    name: "Intelligence & Content",
    items: [
      { name: "Trends & Seasonal", href: "/cookaing-marketing/trends", icon: TrendingUp },
      { name: "Content History", href: "/cookaing-marketing/content-history", icon: History },
      { name: "Unified Content Generator", href: "/cookaing-marketing/content-generator", icon: Sparkles }
    ]
  },
  {
    name: "Analytics",
    items: [
      { name: "Reports", href: "/cookaing-marketing/reports", icon: BarChart2 },
      { name: "Costs & ROAS", href: "/cookaing-marketing/costs", icon: CreditCard },
      { name: "Attribution Inspector", href: "/cookaing-marketing/attribution", icon: GitBranch }
    ]
  },
  {
    name: "System",
    items: [
      { name: "Health", href: "/cookaing-marketing/integrations-health", icon: Monitor },
      { name: "Webhooks Monitor", href: "/cookaing-marketing/webhooks", icon: Send },
      { name: "Email Delivery Test", href: "/cookaing-marketing/email-test", icon: Mail },
      { name: "Developer Tools", href: "/cookaing-marketing/devtools", icon: Wrench }
    ]
  },
  {
    name: "Help",
    items: [
      { name: "Docs", href: "/cookaing-marketing/docs", icon: BookOpen },
      { name: "Exit CookAIng", href: "/", icon: LogOut }
    ]
  }
];

interface CookAIngLayoutProps {
  children: React.ReactNode;
}

const CookAIngLayout: React.FC<CookAIngLayoutProps> = ({ children }) => {
  const [location, navigate] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentPath = location.startsWith('/cookaing/') ? location.replace('/cookaing/', '/cookaing-marketing/') : location;

  const generateBreadcrumbs = () => {
    const pathSegments = currentPath.split('/').filter(Boolean);
    const breadcrumbs = ['CookAIng'];
    
    if (pathSegments.length > 1) {
      // Find current item across all sections
      let currentItem = null;
      for (const section of cookAIngNavigation) {
        currentItem = section.items.find(item => item.href === currentPath);
        if (currentItem) break;
      }
      
      if (currentItem) {
        breadcrumbs.push(currentItem.name);
      } else {
        // Fallback for dynamic routes
        const sectionName = pathSegments[1]?.replace('-', ' ')?.replace(/\b\w/g, l => l.toUpperCase());
        if (sectionName && sectionName !== 'Cookaing Marketing') {
          breadcrumbs.push(sectionName);
        }
      }
    }
    
    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden bg-black bg-opacity-50" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Header with Mode Switcher */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CA</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">CookAIng</h2>
            </div>
            
            {/* Close button for mobile */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>


          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <TooltipProvider>
              <div className="space-y-6">
                {cookAIngNavigation.map((section) => (
                  <div key={section.name}>
                    {/* Section Header */}
                    <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {section.name}
                    </h3>
                    
                    {/* Section Items */}
                    <div className="space-y-1">
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentPath === item.href || 
                          (item.href === '/cookaing-marketing' && currentPath === '/cookaing-marketing');
                        
                        // Handle Exit CookAIng special case
                        if (item.name === "Exit CookAIng") {
                          return (
                            <button
                              key={item.name}
                              onClick={() => {
                                window.location.href = '/';
                              }}
                              className={cn(
                                "flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors group text-left",
                                "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                              )}
                            >
                              <Icon className="mr-3 flex-shrink-0 h-4 w-4 text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400" />
                              {item.name}
                            </button>
                          );
                        }

                        // Use full href for proper routing  
                        const cleanHref = item.href;

                        const linkContent = (
                          <Link
                            key={item.name}
                            href={item.disabled ? '#' : cleanHref}
                            className={cn(
                              "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors group",
                              item.disabled 
                                ? "text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50"
                                : isActive
                                  ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-100"
                                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                            )}
                            onClick={(e) => {
                              if (item.disabled) {
                                e.preventDefault();
                              }
                            }}
                          >
                            <Icon className={cn(
                              "mr-3 flex-shrink-0 h-4 w-4",
                              item.disabled
                                ? "text-gray-400 dark:text-gray-600"
                                : isActive 
                                  ? "text-blue-500 dark:text-blue-400" 
                                  : "text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400"
                            )} />
                            {item.name}
                          </Link>
                        );

                        // Wrap disabled items with tooltip
                        if (item.disabled && item.disabledReason) {
                          return (
                            <Tooltip key={item.name}>
                              <TooltipTrigger asChild>
                                {linkContent}
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{item.disabledReason}</p>
                              </TooltipContent>
                            </Tooltip>
                          );
                        }

                        return linkContent;
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </TooltipProvider>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              CookAIng Marketing Engine
            </p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Breadcrumbs */}
              <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                {breadcrumbs.map((crumb, index) => (
                  <span key={crumb} className="flex items-center">
                    {index > 0 && <span className="mx-2">/</span>}
                    <span className={index === breadcrumbs.length - 1 ? "font-medium text-gray-900 dark:text-white" : ""}>
                      {crumb}
                    </span>
                  </span>
                ))}
              </nav>
            </div>

            {/* Header actions */}
            <div className="flex items-center space-x-4">
              <ModeSwitcher />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CookAIngLayout;