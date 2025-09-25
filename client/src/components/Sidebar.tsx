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

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SidebarCategory {
  name: string;
  items: SidebarItem[];
}

const sidebarData: SidebarCategory[] = [
  {
    name: "Core",
    items: [
      { name: "Dashboard", href: "/", icon: Home },
      { name: "Unified Generator", href: "/unified-generator", icon: Sparkles },
      { name: "Template Explorer", href: "/templates", icon: Layers },
    ]
  },
  {
    name: "Content Management",
    items: [
      { name: "Content History", href: "/content-history", icon: History },
      { name: "Analytics Dashboard", href: "/analytics", icon: BarChart3 },
      { name: "Content Calendar", href: "/content-calendar", icon: Calendar },
    ]
  },
  {
    name: "Framework",
    items: [
      { name: "Schedule Manager", href: "/schedule-manager", icon: Clock },
      { name: "Cross-Platform Scheduling", href: "/cross-platform-scheduling", icon: Calendar },
      { name: "Performance Analytics", href: "/performance-analytics", icon: DollarSign },
    ]
  },
  {
    name: "AI Tools",
    items: [
      { name: "AI Trending Picks", href: "/trending-ai-picks", icon: TrendingUp },
      { name: "Product Ideas", href: "/product-research", icon: Lightbulb },
      { name: "Spartan Generator", href: "/spartan-generator", icon: Zap },
      { name: "AI Model Testing", href: "/ai-model-test", icon: TestTube },
      { name: "Claude Generator", href: "/claude-generator", icon: Bot },
      { name: "Model Configuration", href: "/ai-model-config", icon: Settings },
    ]
  },
  {
    name: "Advanced Tools",
    items: [

      { name: "Emoji & Hashtag Test", href: "/emoji-hashtag-test", icon: Hash },
      { name: "Competitive Analysis", href: "/competitive-analysis", icon: Target },
    ]
  },
  {
    name: "Analytics & Tracking",
    items: [

      { name: "Click Tracking", href: "/click-tracking", icon: MousePointer },
      { name: "Export/Import", href: "/export-import", icon: Download },
    ]
  },
  {
    name: "Integration",
    items: [
      { name: "Webhook Settings", href: "/webhook-settings", icon: Webhook },
      { name: "API Integration Hub", href: "/api-integration-hub", icon: Zap },
      { name: "Automation Checklist", href: "/btb-status", icon: Activity },
    ]
  },
  {
    name: "Legal & Compliance",
    items: [
      { name: "Compliance Center", href: "/compliance", icon: Shield },
      { name: "Privacy Policy", href: "/privacy", icon: Shield },
      { name: "Terms of Service", href: "/terms", icon: FileCheck },
    ]
  },
  {
    name: "Support",
    items: [
      { name: "About", href: "/about", icon: Info },
      { name: "How It Works", href: "/how-it-works", icon: HelpCircle },
      { name: "FAQ", href: "/faq", icon: MessageCircle },
      { name: "Contact", href: "/contact", icon: MessageCircle },
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
      return location === '/' || location === '/dashboard';
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
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out flex flex-col",
        "lg:relative lg:translate-x-0 lg:h-screen lg:flex-shrink-0",
        isCollapsed ? "-translate-x-full lg:translate-x-0" : "translate-x-0",
        className
      )}>
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">GlowBot</span>
          </div>
          <button
            onClick={() => setIsCollapsed(true)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto">
          {sidebarData.map((category) => (
            <div key={category.name}>
              <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {category.name}
              </h3>
              <div className="space-y-1">
                {category.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150",
                        active
                          ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      )}
                      onClick={() => setIsCollapsed(true)}
                    >
                      <Icon
                        className={cn(
                          "mr-3 h-5 w-5 flex-shrink-0",
                          active ? "text-blue-700" : "text-gray-400 group-hover:text-gray-600"
                        )}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          <div className="text-xs text-gray-500 text-center">
            AI-Powered Content Engine
          </div>
        </div>
      </aside>

      {/* Mobile menu button */}
      <button
        onClick={() => setIsCollapsed(false)}
        className="fixed top-4 left-4 z-40 lg:hidden p-2 rounded-md bg-white shadow-lg border border-gray-200 text-gray-600 hover:text-gray-900"
      >
        <Menu className="h-6 w-6" />
      </button>
    </>
  );
};

export default Sidebar;