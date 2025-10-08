import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Home, 
  BarChart3, 
  FileText, 
  Sparkles, 
  TrendingUp, 
  Calendar, 
  Eye, 
  Hash, 
  Target, 
  MousePointer, 
  Download, 
  Webhook, 
  Zap, 
  Activity, 
  Info, 
  HelpCircle, 
  MessageCircle, 
  Shield, 
  FileCheck,
  Menu,
  X,
  Bot,
  Settings,
  History,
  TestTube,
  Layers,
  Package,
  Clock,
  DollarSign,
  Mail,
  Users,
  Users2,
  UserCheck,
  FlaskConical,
  Workflow,
  PersonStanding,
  FormInput,
  FileSpreadsheet,
  ShoppingCart,
  BarChart2,
  CreditCard,
  GitBranch,
  Monitor,
  Send,
  Wrench,
  BookOpen,
  Building,
  Lightbulb
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { isAmazonEnabled } from '@shared/constants';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SidebarCategory {
  name: string;
  items: SidebarItem[];
}

// SIMPLIFIED NAVIGATION STRUCTURE - TikTok Viral Product Generator
const sidebarData: SidebarCategory[] = [
  {
    name: "",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: Home },
      { name: "AI Content Studio", href: "/generate", icon: Sparkles },
      { name: "Content History", href: "/content-history", icon: History },
      { name: "Trend History", href: "/trend-history", icon: Clock },
    ]
  }
];

interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const [location] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(true); // Start collapsed on mobile

  const isActive = (href: string) => {
    if (href === '/') {
      return location === '/';
    }
    return location === href || location.startsWith(href + '/');
  };

  return (
    <>
      {/* Mobile overlay */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-200 ease-in-out flex flex-col",
        "lg:relative lg:translate-x-0 lg:h-screen lg:flex-shrink-0",
        isCollapsed ? "-translate-x-full lg:translate-x-0" : "translate-x-0",
        className
      )}>
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">Pheme</span>
          </div>
          <button
            onClick={() => setIsCollapsed(true)}
            className="lg:hidden p-2 rounded-md text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto">
          {sidebarData.map((category) => {
            // DISABLED: Filter out Amazon-related sidebar items when Amazon features are disabled
            const filteredItems = category.items.filter(item => {
              // Hide Amazon-specific navigation items when features are disabled
              if (!isAmazonEnabled() && (
                item.href === '/affiliate-links' ||
                item.href === '/amazon-settings' ||
                item.href === '/monetization'
              )) {
                return false;
              }
              return true;
            });

            // Skip empty categories
            if (filteredItems.length === 0) {
              return null;
            }

            return (
              <div key={category.name || 'main'}>
                {category.name && (
                  <h3 className="px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                    {category.name}
                  </h3>
                )}
                <div className="space-y-1">
                  {filteredItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                        "group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150",
                        active
                          ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-r-2 border-blue-700 dark:border-blue-500"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
                      )}
                      onClick={() => setIsCollapsed(true)}
                    >
                      <Icon
                        className={cn(
                          "mr-3 h-5 w-5 flex-shrink-0",
                          active ? "text-blue-700 dark:text-blue-400" : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400"
                        )}
                      />
                      {item.name}
                    </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex-shrink-0">
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            AI-Powered Content Engine
          </div>
        </div>
      </aside>

      {/* Mobile menu button */}
      <button
        onClick={() => setIsCollapsed(false)}
        className="fixed top-4 left-4 z-40 lg:hidden p-2 rounded-md bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
      >
        <Menu className="h-6 w-6" />
      </button>
    </>
  );
};

export default Sidebar;