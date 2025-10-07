import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/components/AuthProvider";
import { useCTATracking } from "@/hooks/use-cta-tracking";
import {
  Menu,
  Zap,
  Layers,
  TrendingUp,
  Sparkles,
  Flame,
  Library,
  Target,
  BarChart3,
  Calculator,
  Package,
  History,
  Users,
  Briefcase,
  Award,
  GraduationCap,
  ShoppingBag,
  Youtube,
  BookOpen,
  MessageSquare,
  Video,
  FileText,
  DollarSign,
  type LucideIcon,
} from "lucide-react";

interface CardItem {
  icon: LucideIcon;
  title: string;
  description: string;
  href?: string;
}

// Features Data
const featuresData: CardItem[] = [
  {
    icon: Layers,
    title: "Dual Studios",
    description: "Switch between Viral & Affiliate studios, each optimized for its own format and tone.",
    href: "/features/dual-studios"
  },
  {
    icon: TrendingUp,
    title: "Real-Time Trend Discovery",
    description: "Track and transform trending topics into ready-to-film TikTok scripts.",
    href: "/features/trend-discovery"
  },
  {
    icon: Sparkles,
    title: "AI Script Generator",
    description: "Generate scroll-stopping hooks, stories, and CTAs with a single click.",
    href: "/features/ai-script-generator"
  },
  {
    icon: Flame,
    title: "AI Viral Score System",
    description: "Instantly score and refine your scripts for clarity, engagement, and timing.",
    href: "/features/viral-score"
  },
  {
    icon: Library,
    title: "Template Library",
    description: "Choose from 20+ plug-and-play templates for any niche or platform.",
    href: "/features/template-library"
  },
  {
    icon: Target,
    title: "Multi-Platform Optimization",
    description: "Create content optimized for TikTok, Instagram, YouTube, and more.",
    href: "/features/multi-platform"
  },
];

// Tools Data
const toolsData: CardItem[] = [
  {
    icon: TrendingUp,
    title: "Trend Discovery",
    description: "Discover what's trending before it goes viral with AI-powered trend analysis.",
    href: "/tools/trend-discovery"
  },
  {
    icon: Sparkles,
    title: "Script Generator",
    description: "Generate scroll-stopping scripts in seconds with dual studio modes.",
    href: "/tools/script-generator"
  },
  {
    icon: Library,
    title: "Template Library",
    description: "20+ proven templates for every niche and platform tested across millions of views.",
    href: "/tools/template-library"
  },
  {
    icon: Target,
    title: "Viral Score Analyzer",
    description: "Know your content will perform before you post with AI-powered scoring.",
    href: "/tools/viral-score"
  },
  {
    icon: History,
    title: "History",
    description: "Your complete content creation archive with scripts, trends, and viral scores.",
    href: "/tools/history"
  },
];

// Use Cases Data
const useCasesData: CardItem[] = [
  {
    icon: Video,
    title: "TikTok Creators",
    description: "Generate daily viral ideas and scripts customized for your niche.",
    href: "#"
  },
  {
    icon: DollarSign,
    title: "Affiliate Marketers",
    description: "Turn product links into performance-driven UGC scripts and ads.",
    href: "#"
  },
  {
    icon: Users,
    title: "Social Media Managers",
    description: "Scale short-form content calendars for multiple brands.",
    href: "#"
  },
  {
    icon: Award,
    title: "Influencers",
    description: "Convert audience insights into high-engagement video ideas.",
    href: "#"
  },
  {
    icon: Briefcase,
    title: "Marketing Agencies",
    description: "Deliver optimized short-form scripts and campaign copy for clients.",
    href: "#"
  },
  {
    icon: GraduationCap,
    title: "Coaches & Educators",
    description: "Repurpose lessons and insights into bite-sized viral clips.",
    href: "#"
  },
  {
    icon: ShoppingBag,
    title: "E-Commerce Brands",
    description: "Build product showcase videos and social proof campaigns fast.",
    href: "#"
  },
  {
    icon: Youtube,
    title: "YouTube Shorts Creators",
    description: "Repurpose long-form ideas into punchy short scripts.",
    href: "#"
  },
  {
    icon: Users,
    title: "Content Teams",
    description: "Centralize content generation, scoring, and team collaboration.",
    href: "#"
  },
];

// Learn Data
const learnData: CardItem[] = [
  {
    icon: FileText,
    title: "Script Templates",
    description: "Browse viral & affiliate-style templates and examples.",
    href: "#"
  },
  {
    icon: BookOpen,
    title: "Blog",
    description: "Learn short-form growth tactics, trends, and AI content strategies.",
    href: "#"
  },
  {
    icon: Video,
    title: "Tutorials",
    description: "Step-by-step guides on ScriptTok tools and studios.",
    href: "#"
  },
  {
    icon: MessageSquare,
    title: "Creator Community",
    description: "Join discussions, share results, and swap templates.",
    href: "#"
  },
  {
    icon: Award,
    title: "Showcase",
    description: "Explore user-generated content made with ScriptTok AI.",
    href: "#"
  },
  {
    icon: Library,
    title: "Resources",
    description: "Access guides, cheat sheets, and growth resources.",
    href: "#"
  },
];

// Pricing Data
const pricingData: CardItem[] = [
  {
    icon: Zap,
    title: "Free Plan",
    description: "Start creating with 5 daily generations and core templates.",
    href: "/pricing"
  },
  {
    icon: Flame,
    title: "Pro Plan",
    description: "Unlimited access, trend engine, and analytics dashboard.",
    href: "/pricing"
  },
];

function DropdownCard({ item }: { item: CardItem }) {
  const Icon = item.icon;
  const [, navigate] = useLocation();
  
  const handleClick = () => {
    if (item.href && item.href !== "#") {
      navigate(item.href);
    }
  };
  
  return (
    <div
      onClick={handleClick}
      className="flex items-start gap-3 p-4 rounded-lg hover:bg-accent transition-colors cursor-pointer"
      data-testid={`dropdown-card-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-lg flex-shrink-0">
        <Icon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
      </div>
    </div>
  );
}

export function MarketingNav() {
  const { isAuthenticated, login } = useAuth();
  const { trackSignupCTA, trackNavigateCTA } = useCTATracking();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [, navigate] = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer" data-testid="link-logo">
            <div className="bg-gradient-hero rounded-lg p-2">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl bg-gradient-hero bg-clip-text text-transparent">
              ScriptTok
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden lg:flex">
          <NavigationMenuList>
            {/* Features Dropdown */}
            <NavigationMenuItem>
              <NavigationMenuTrigger data-testid="nav-trigger-features">
                Features
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="w-[600px] p-4">
                  <div className="grid grid-cols-2 gap-2">
                    {featuresData.map((item) => (
                      <DropdownCard key={item.title} item={item} />
                    ))}
                  </div>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Tools Dropdown */}
            <NavigationMenuItem>
              <NavigationMenuTrigger data-testid="nav-trigger-tools">
                Tools
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="w-[600px] p-4">
                  <div className="grid grid-cols-2 gap-2">
                    {toolsData.map((item) => (
                      <DropdownCard key={item.title} item={item} />
                    ))}
                  </div>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Use Cases Dropdown */}
            <NavigationMenuItem>
              <NavigationMenuTrigger data-testid="nav-trigger-use-cases">
                Use Cases
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="w-[700px] p-4">
                  <div className="grid grid-cols-3 gap-2">
                    {useCasesData.map((item) => (
                      <DropdownCard key={item.title} item={item} />
                    ))}
                  </div>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Learn Dropdown */}
            <NavigationMenuItem>
              <NavigationMenuTrigger data-testid="nav-trigger-learn">
                Learn
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="w-[600px] p-4">
                  <div className="grid grid-cols-2 gap-2">
                    {learnData.map((item) => (
                      <DropdownCard key={item.title} item={item} />
                    ))}
                  </div>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Pricing */}
            <NavigationMenuItem>
              <Link href="/pricing">
                <span
                  className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
                  data-testid="nav-link-pricing"
                >
                  Pricing
                </span>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Desktop CTAs */}
        <div className="hidden lg:flex items-center gap-3">
          {!isAuthenticated ? (
            <>
              <Button
                variant="ghost"
                onClick={() => {
                  trackNavigateCTA('nav', 'sign_in');
                  login();
                }}
                data-testid="button-nav-signin"
              >
                Sign In
              </Button>
              <Button
                onClick={() => {
                  trackSignupCTA('nav');
                  login();
                }}
                className="bg-gradient-hero text-white hover:opacity-90"
                data-testid="button-nav-start-free"
              >
                <Zap className="mr-2 h-4 w-4" />
                Start Free
              </Button>
            </>
          ) : (
            <Button
              onClick={() => navigate('/dashboard')}
              className="bg-gradient-hero text-white hover:opacity-90"
              data-testid="button-nav-dashboard"
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon" data-testid="button-mobile-menu">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            
            <div className="mt-6 flex flex-col gap-4">
              {/* Mobile CTAs */}
              <div className="flex flex-col gap-2 pb-4 border-b">
                {!isAuthenticated ? (
                  <>
                    <Button
                      onClick={() => {
                        trackSignupCTA('mobile_nav');
                        login();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full bg-gradient-hero text-white"
                      data-testid="button-mobile-start-free"
                    >
                      <Zap className="mr-2 h-4 w-4" />
                      Start Free
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        trackNavigateCTA('mobile_nav', 'sign_in');
                        login();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full"
                      data-testid="button-mobile-signin"
                    >
                      Sign In
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/dashboard');
                    }}
                    className="w-full bg-gradient-hero text-white"
                    data-testid="button-mobile-dashboard"
                  >
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                )}
              </div>

              {/* Mobile Navigation Accordion */}
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="features">
                  <AccordionTrigger data-testid="mobile-accordion-features">
                    Features
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col gap-1">
                      {featuresData.map((item) => (
                        <div
                          key={item.title}
                          onClick={() => {
                            setMobileMenuOpen(false);
                            if (item.href && item.href !== "#") {
                              navigate(item.href);
                            }
                          }}
                          className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer"
                          data-testid={`mobile-link-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setMobileMenuOpen(false);
                              if (item.href && item.href !== "#") {
                                navigate(item.href);
                              }
                            }
                          }}
                        >
                          <item.icon className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <div className="font-medium text-sm">{item.title}</div>
                            <div className="text-xs text-muted-foreground">{item.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="tools">
                  <AccordionTrigger data-testid="mobile-accordion-tools">
                    Tools
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col gap-1">
                      {toolsData.map((item) => (
                        <div
                          key={item.title}
                          onClick={() => {
                            setMobileMenuOpen(false);
                            if (item.href && item.href !== "#") {
                              navigate(item.href);
                            }
                          }}
                          className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer"
                          data-testid={`mobile-link-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setMobileMenuOpen(false);
                              if (item.href && item.href !== "#") {
                                navigate(item.href);
                              }
                            }
                          }}
                        >
                          <item.icon className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <div className="font-medium text-sm">{item.title}</div>
                            <div className="text-xs text-muted-foreground">{item.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="use-cases">
                  <AccordionTrigger data-testid="mobile-accordion-use-cases">
                    Use Cases
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col gap-1">
                      {useCasesData.map((item) => (
                        <div
                          key={item.title}
                          onClick={() => {
                            setMobileMenuOpen(false);
                            if (item.href && item.href !== "#") {
                              navigate(item.href);
                            }
                          }}
                          className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer"
                          data-testid={`mobile-link-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setMobileMenuOpen(false);
                              if (item.href && item.href !== "#") {
                                navigate(item.href);
                              }
                            }
                          }}
                        >
                          <item.icon className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <div className="font-medium text-sm">{item.title}</div>
                            <div className="text-xs text-muted-foreground">{item.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="learn">
                  <AccordionTrigger data-testid="mobile-accordion-learn">
                    Learn
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col gap-1">
                      {learnData.map((item) => (
                        <div
                          key={item.title}
                          onClick={() => {
                            setMobileMenuOpen(false);
                            if (item.href && item.href !== "#") {
                              navigate(item.href);
                            }
                          }}
                          className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer"
                          data-testid={`mobile-link-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setMobileMenuOpen(false);
                              if (item.href && item.href !== "#") {
                                navigate(item.href);
                              }
                            }
                          }}
                        >
                          <item.icon className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <div className="font-medium text-sm">{item.title}</div>
                            <div className="text-xs text-muted-foreground">{item.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/pricing');
                }}
                data-testid="mobile-link-pricing"
              >
                Pricing
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

// Export data for use in landing page
export { featuresData, toolsData, useCasesData, learnData, pricingData };
