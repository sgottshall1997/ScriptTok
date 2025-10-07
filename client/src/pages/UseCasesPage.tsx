import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useCTATracking } from '@/hooks/use-cta-tracking';
import { MarketingNav } from '@/components/MarketingNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  Video, 
  DollarSign, 
  Users, 
  Award, 
  Briefcase, 
  GraduationCap, 
  ShoppingBag, 
  Youtube, 
  Laptop,
  TrendingUp,
  Sparkles,
  Target,
  Library,
  History,
  Zap,
  CheckCircle2,
  type LucideIcon
} from 'lucide-react';

interface ToolMapping {
  icon: LucideIcon;
  title: string;
  description: string;
  href?: string;
}

interface Benefit {
  title: string;
  description: string;
}

interface WorkflowStep {
  step: string;
}

interface UseCase {
  title: string;
  description: string;
}

interface PersonaTabContent {
  id: string;
  icon: LucideIcon;
  name: string;
  description: string;
  toolMappings: ToolMapping[];
  benefits: Benefit[];
  workflow: WorkflowStep[];
  useCases: UseCase[];
  featureHighlight: {
    title: string;
    description: string;
  };
  primaryCTA: {
    text: string;
    destination: string;
  };
  secondaryCTA: {
    text: string;
    destination: string;
  };
}

const personasData: PersonaTabContent[] = [
  {
    id: 'content-creators',
    icon: Video,
    name: 'Content Creators',
    description: 'Generate daily viral ideas and scripts customized for your niche',
    toolMappings: [
      {
        icon: TrendingUp,
        title: 'Trend Discovery',
        description: 'Find trending topics before they peak',
        href: '/tools/trend-discovery'
      },
      {
        icon: Sparkles,
        title: 'Script Generator',
        description: 'Dual studio modes for any content type',
        href: '/tools/script-generator'
      },
      {
        icon: Target,
        title: 'Viral Score Analyzer',
        description: 'Predict performance with 0-100 scoring',
        href: '/tools/viral-score'
      },
      {
        icon: Library,
        title: 'Template Library',
        description: '20+ viral formulas proven to work',
        href: '/tools/template-library'
      }
    ],
    benefits: [
      {
        title: 'Find Trends Before Competitors',
        description: 'Real-time discovery of viral opportunities'
      },
      {
        title: 'Generate Scripts in Minutes',
        description: 'AI-powered content creation at scale'
      },
      {
        title: 'Predict Viral Success',
        description: '0-100 scoring before posting'
      },
      {
        title: 'Learn From Winners',
        description: 'Template library of proven formats'
      }
    ],
    workflow: [
      { step: 'Discover trend' },
      { step: 'Generate script' },
      { step: 'Score & refine' },
      { step: 'Publish' },
      { step: 'Track in history' }
    ],
    useCases: [
      {
        title: 'Beauty Creator Success',
        description: 'Beauty creator gets 2M views finding Glass Skin trend early'
      },
      {
        title: 'Tech Reviewer Win',
        description: 'Tech reviewer drives 10K sales discovering gadget before saturation'
      },
      {
        title: 'Fitness Coach Growth',
        description: 'Fitness coach builds audience identifying workout trend'
      }
    ],
    featureHighlight: {
      title: 'Viral Score Analyzer',
      description: '0-100 prediction system that tells you if your content will go viral before you post'
    },
    primaryCTA: {
      text: 'Start as Content Creator',
      destination: '/dashboard'
    },
    secondaryCTA: {
      text: 'See Viral Score',
      destination: '/tools/viral-score'
    }
  },
  {
    id: 'affiliate-marketers',
    icon: DollarSign,
    name: 'Affiliate Marketers',
    description: 'Turn product links into performance-driven UGC scripts and ads',
    toolMappings: [
      {
        icon: TrendingUp,
        title: 'Trend Discovery',
        description: 'Find trending products first',
        href: '/tools/trend-discovery'
      },
      {
        icon: Sparkles,
        title: 'Affiliate Studio',
        description: 'Conversion-optimized script generation',
        href: '/tools/script-generator'
      },
      {
        icon: Library,
        title: 'Template Library',
        description: 'Product showcase templates',
        href: '/tools/template-library'
      },
      {
        icon: History,
        title: 'History',
        description: 'Track conversions and performance',
        href: '/tools/history'
      }
    ],
    benefits: [
      {
        title: 'Find Products First',
        description: 'Discover trending items before saturation'
      },
      {
        title: 'Conversion-Optimized Scripts',
        description: 'Specialized templates for affiliate content'
      },
      {
        title: 'Track What Works',
        description: 'Monitor which products/scripts drive sales'
      },
      {
        title: 'Scale Fast',
        description: 'Bulk generation for multiple products'
      }
    ],
    workflow: [
      { step: 'Find trending product' },
      { step: 'Generate affiliate script' },
      { step: 'Optimize CTA' },
      { step: 'Test & track conversions' }
    ],
    useCases: [
      {
        title: 'Conversion Boost',
        description: 'Affiliate marketer increases conversion 40% with optimized scripts'
      },
      {
        title: 'Scale to 50 Videos',
        description: 'Product reviewer scales to 50 videos/month with bulk generation'
      },
      {
        title: '$10K Sales',
        description: 'TikTok shop creator drives $10K sales with trend-based product picks'
      }
    ],
    featureHighlight: {
      title: 'Affiliate Studio',
      description: 'Product-focused templates designed specifically for affiliate marketing and conversions'
    },
    primaryCTA: {
      text: 'Start Affiliate Marketing',
      destination: '/dashboard'
    },
    secondaryCTA: {
      text: 'See Affiliate Templates',
      destination: '/tools/template-library'
    }
  },
  {
    id: 'social-media-managers',
    icon: Users,
    name: 'Social Media Managers',
    description: 'Scale short-form content calendars for multiple brands',
    toolMappings: [
      {
        icon: Library,
        title: 'Template Library',
        description: 'Maintain brand voice consistency',
        href: '/tools/template-library'
      },
      {
        icon: Sparkles,
        title: 'Script Generator',
        description: 'Bulk generation capabilities',
        href: '/tools/script-generator'
      },
      {
        icon: History,
        title: 'History',
        description: 'Organized content archive',
        href: '/tools/history'
      },
      {
        icon: Target,
        title: 'Viral Score',
        description: 'Quality control before posting',
        href: '/tools/viral-score'
      }
    ],
    benefits: [
      {
        title: 'Manage Multiple Brands',
        description: 'Organized content for each client'
      },
      {
        title: 'Bulk Generate Weekly Content',
        description: 'Create 50+ scripts in one session'
      },
      {
        title: 'Maintain Quality',
        description: 'Score all scripts before approval'
      },
      {
        title: 'Save 80% Time',
        description: 'Automated content calendar creation'
      }
    ],
    workflow: [
      { step: 'Select template' },
      { step: 'Bulk generate week\'s content' },
      { step: 'Score all scripts' },
      { step: 'Schedule & archive' }
    ],
    useCases: [
      {
        title: 'Agency at Scale',
        description: 'Agency manages 10 clients with 30 posts each monthly'
      },
      {
        title: '80% Time Savings',
        description: 'SMM reduces content creation time from 20 hours to 4 hours weekly'
      },
      {
        title: 'Consistent Voice',
        description: 'Brand manager maintains consistent voice across 5 platforms'
      }
    ],
    featureHighlight: {
      title: 'Bulk Generation (Pro)',
      description: 'Generate 50+ scripts per session with automated quality scoring for all content'
    },
    primaryCTA: {
      text: 'Start Managing Content',
      destination: '/dashboard'
    },
    secondaryCTA: {
      text: 'See Bulk Features',
      destination: '/tools/script-generator'
    }
  },
  {
    id: 'influencers',
    icon: Award,
    name: 'Influencers',
    description: 'Convert audience insights into high-engagement video ideas',
    toolMappings: [
      {
        icon: TrendingUp,
        title: 'Trend Discovery',
        description: 'Stay ahead of viral waves',
        href: '/tools/trend-discovery'
      },
      {
        icon: Target,
        title: 'Viral Score Analyzer',
        description: 'Maintain 80+ scores consistently',
        href: '/tools/viral-score'
      },
      {
        icon: Sparkles,
        title: 'Script Generator',
        description: 'Lock in your personal brand voice',
        href: '/tools/script-generator'
      },
      {
        icon: History,
        title: 'History',
        description: 'Learn from your top performers',
        href: '/tools/history'
      }
    ],
    benefits: [
      {
        title: 'Stay Relevant Always',
        description: 'Real-time trend monitoring for your niche'
      },
      {
        title: 'Viral Score Guarantee',
        description: 'Maintain 80+ scores for consistent performance'
      },
      {
        title: 'Brand Voice Locked',
        description: 'AI learns and replicates your unique style'
      },
      {
        title: 'Growth Tracking',
        description: 'Analyze what works best for your audience'
      }
    ],
    workflow: [
      { step: 'Check trend velocity' },
      { step: 'Generate on-brand script' },
      { step: 'Score for virality' },
      { step: 'Refine until 80+' },
      { step: 'Post' }
    ],
    useCases: [
      {
        title: '100K to 500K Growth',
        description: 'Influencer grows 100K to 500K followers in 90 days'
      },
      {
        title: '2M+ Average Views',
        description: 'Creator maintains 2M+ average views with trend-based content'
      },
      {
        title: 'Monetization Success',
        description: 'Personal brand monetizes with consistent viral performance'
      }
    ],
    featureHighlight: {
      title: 'Smart Style System',
      description: 'AI that learns from your top-rated content to maintain your unique brand voice'
    },
    primaryCTA: {
      text: 'Start Growing',
      destination: '/dashboard'
    },
    secondaryCTA: {
      text: 'See Smart Styles',
      destination: '/tools/viral-score'
    }
  },
  {
    id: 'marketing-agencies',
    icon: Briefcase,
    name: 'Marketing Agencies',
    description: 'Deliver optimized short-form scripts and campaign copy for clients',
    toolMappings: [
      {
        icon: Library,
        title: 'Template Library',
        description: 'Campaign frameworks for industries',
        href: '/tools/template-library'
      },
      {
        icon: Target,
        title: 'Viral Score',
        description: 'Quality assurance for deliverables',
        href: '/tools/viral-score'
      },
      {
        icon: History,
        title: 'History',
        description: 'Client organization and reporting',
        href: '/tools/history'
      },
      {
        icon: Sparkles,
        title: 'Script Generator',
        description: 'Multi-platform optimization',
        href: '/tools/script-generator'
      }
    ],
    benefits: [
      {
        title: 'White-Label Quality',
        description: 'Professional-grade outputs for clients'
      },
      {
        title: 'Multi-Platform Ready',
        description: 'TikTok, IG, YouTube optimization'
      },
      {
        title: 'Campaign Frameworks',
        description: 'Proven templates for all industries'
      },
      {
        title: 'Client Reporting',
        description: 'Organized history with analytics'
      }
    ],
    workflow: [
      { step: 'Brief intake' },
      { step: 'Template selection' },
      { step: 'Generate variations' },
      { step: 'Client review' },
      { step: 'Platform optimization' }
    ],
    useCases: [
      {
        title: '500 Scripts Monthly',
        description: 'Agency delivers 500 scripts monthly to 15 clients'
      },
      {
        title: '60% ROI Increase',
        description: 'Marketing team increases campaign ROI 60% with optimized scripts'
      },
      {
        title: '$50K Contracts',
        description: 'Creative agency lands $50K contracts with ScriptTok deliverables'
      }
    ],
    featureHighlight: {
      title: 'Multi-Platform Optimization',
      description: 'Automatic format adjustments for TikTok, Instagram, YouTube, and more'
    },
    primaryCTA: {
      text: 'Start Agency Dashboard',
      destination: '/dashboard'
    },
    secondaryCTA: {
      text: 'See Platform Tools',
      destination: '/tools/script-generator'
    }
  },
  {
    id: 'coaches-educators',
    icon: GraduationCap,
    name: 'Coaches & Educators',
    description: 'Repurpose lessons and insights into bite-sized viral clips',
    toolMappings: [
      {
        icon: Library,
        title: 'Template Library',
        description: 'Tutorial and educational formats',
        href: '/tools/template-library'
      },
      {
        icon: Sparkles,
        title: 'Script Generator',
        description: 'Break complex topics into clips',
        href: '/tools/script-generator'
      },
      {
        icon: Target,
        title: 'Viral Score',
        description: 'Measure hook strength',
        href: '/tools/viral-score'
      },
      {
        icon: TrendingUp,
        title: 'Trend Discovery',
        description: 'Find educational trends',
        href: '/tools/trend-discovery'
      }
    ],
    benefits: [
      {
        title: 'Simplify Complex Topics',
        description: 'Break lessons into 15-60s clips'
      },
      {
        title: 'Engage Students Better',
        description: 'Viral hooks for educational content'
      },
      {
        title: 'Reach Wider Audiences',
        description: 'Optimize for platform algorithms'
      },
      {
        title: 'Content Series Builder',
        description: 'Structured multi-part content'
      }
    ],
    workflow: [
      { step: 'Identify lesson' },
      { step: 'Break into micro-topics' },
      { step: 'Generate engaging scripts' },
      { step: 'Score clarity' },
      { step: 'Publish series' }
    ],
    useCases: [
      {
        title: '10X Email List Growth',
        description: 'Online coach grows email list 10X with viral educational content'
      },
      {
        title: '1M Views Teaching',
        description: 'Educator reaches 1M views teaching finance basics'
      },
      {
        title: '500 Signups',
        description: 'Course creator drives 500 signups with short-form teasers'
      }
    ],
    featureHighlight: {
      title: 'Educational Templates',
      description: 'Storytelling frameworks designed specifically for teaching and engagement'
    },
    primaryCTA: {
      text: 'Start Teaching',
      destination: '/dashboard'
    },
    secondaryCTA: {
      text: 'See Education Tools',
      destination: '/tools/template-library'
    }
  },
  {
    id: 'ecommerce-brands',
    icon: ShoppingBag,
    name: 'E-Commerce Brands',
    description: 'Build product showcase videos and social proof campaigns fast',
    toolMappings: [
      {
        icon: TrendingUp,
        title: 'Trend Discovery',
        description: 'Find trending products in catalog',
        href: '/tools/trend-discovery'
      },
      {
        icon: Sparkles,
        title: 'Affiliate Studio',
        description: 'Product demo script generation',
        href: '/tools/script-generator'
      },
      {
        icon: Library,
        title: 'Template Library',
        description: 'Unboxing and feature templates',
        href: '/tools/template-library'
      },
      {
        icon: Target,
        title: 'Viral Score',
        description: 'Conversion optimization',
        href: '/tools/viral-score'
      }
    ],
    benefits: [
      {
        title: 'Product Showcase Made Easy',
        description: 'Ready-to-film scripts in minutes'
      },
      {
        title: 'UGC-Style Authentic',
        description: 'Templates mimic creator content'
      },
      {
        title: 'Drive Conversions',
        description: 'Optimized for sales not just views'
      },
      {
        title: 'Scale Product Content',
        description: 'Generate scripts for entire catalog'
      }
    ],
    workflow: [
      { step: 'Select product' },
      { step: 'Choose showcase format' },
      { step: 'Generate script' },
      { step: 'Add social proof' },
      { step: 'Track performance' }
    ],
    useCases: [
      {
        title: '45% Conversion Increase',
        description: 'E-commerce brand increases conversion 45% with UGC-style videos'
      },
      {
        title: '100 Videos Monthly',
        description: 'DTC company scales to 100 product videos monthly'
      },
      {
        title: '$25K Sales',
        description: 'Online store drives $25K sales with viral product content'
      }
    ],
    featureHighlight: {
      title: 'UGC-Style Templates',
      description: 'Authentic creator content templates that drive conversions not just views'
    },
    primaryCTA: {
      text: 'Start Selling',
      destination: '/dashboard'
    },
    secondaryCTA: {
      text: 'See Product Templates',
      destination: '/tools/template-library'
    }
  },
  {
    id: 'youtube-shorts-creators',
    icon: Youtube,
    name: 'YouTube Shorts Creators',
    description: 'Repurpose long-form ideas into punchy short scripts',
    toolMappings: [
      {
        icon: Sparkles,
        title: 'Script Generator',
        description: '15-60s Shorts optimization',
        href: '/tools/script-generator'
      },
      {
        icon: Target,
        title: 'Viral Score',
        description: 'Retention prediction',
        href: '/tools/viral-score'
      },
      {
        icon: Library,
        title: 'Template Library',
        description: 'YouTube Shorts formats',
        href: '/tools/template-library'
      },
      {
        icon: TrendingUp,
        title: 'Trend Discovery',
        description: 'YouTube-specific trends',
        href: '/tools/trend-discovery'
      }
    ],
    benefits: [
      {
        title: 'Long-Form to Short-Form',
        description: 'Extract key insights from videos'
      },
      {
        title: 'Retention Optimized',
        description: 'Structure for 100% watch time'
      },
      {
        title: 'Cross-Promote Smart',
        description: 'Drive traffic to main channel'
      },
      {
        title: 'YouTube Algorithm Ready',
        description: 'Optimized for Shorts discovery'
      }
    ],
    workflow: [
      { step: 'Pick long-form concept' },
      { step: 'Extract key insight' },
      { step: 'Generate Shorts script' },
      { step: 'Optimize retention' },
      { step: 'Cross-promote' }
    ],
    useCases: [
      {
        title: '500K Shorts Subs',
        description: 'YouTuber grows Shorts channel to 500K subs'
      },
      {
        title: '50K Channel Views',
        description: 'Creator drives 50K channel views from Shorts traffic'
      },
      {
        title: '100 Videos Repurposed',
        description: 'Video producer repurposes 100 long videos into viral Shorts'
      }
    ],
    featureHighlight: {
      title: 'YouTube Shorts Optimizer',
      description: 'Retention-focused structure designed for YouTube Shorts algorithm'
    },
    primaryCTA: {
      text: 'Start Creating Shorts',
      destination: '/dashboard'
    },
    secondaryCTA: {
      text: 'See Shorts Tools',
      destination: '/tools/script-generator'
    }
  },
  {
    id: 'content-teams',
    icon: Users,
    name: 'Content Teams',
    description: 'Centralize content generation, scoring, and team collaboration',
    toolMappings: [
      {
        icon: History,
        title: 'History',
        description: 'Team content library',
        href: '/tools/history'
      },
      {
        icon: Library,
        title: 'Template Library',
        description: 'Brand guidelines enforcement',
        href: '/tools/template-library'
      },
      {
        icon: Target,
        title: 'Viral Score',
        description: 'Approval workflows',
        href: '/tools/viral-score'
      },
      {
        icon: Sparkles,
        title: 'Script Generator',
        description: 'Role-based access',
        href: '/tools/script-generator'
      }
    ],
    benefits: [
      {
        title: 'Team Collaboration',
        description: 'Centralized content hub for all members'
      },
      {
        title: 'Brand Guidelines Enforced',
        description: 'Templates ensure consistency'
      },
      {
        title: 'Approval Workflows',
        description: 'Score and review before publishing'
      },
      {
        title: 'Performance Analytics',
        description: 'Track what works across team'
      }
    ],
    workflow: [
      { step: 'Strategy meeting' },
      { step: 'Template assignment' },
      { step: 'Team generation' },
      { step: 'Peer review' },
      { step: 'Score → Approve → Schedule' }
    ],
    useCases: [
      {
        title: '200 Scripts Monthly',
        description: 'Content team produces 200 scripts monthly with 3 members'
      },
      {
        title: 'Brand Voice Across 20 Creators',
        description: 'Marketing team maintains brand voice across 20 content creators'
      },
      {
        title: '50 to 500 Videos',
        description: 'Media company scales from 50 to 500 videos monthly'
      }
    ],
    featureHighlight: {
      title: 'Content History',
      description: 'Team filtering and performance analytics for collaborative content creation'
    },
    primaryCTA: {
      text: 'Start Team Hub',
      destination: '/dashboard'
    },
    secondaryCTA: {
      text: 'See Collaboration',
      destination: '/tools/history'
    }
  },
  {
    id: 'saas-tech-companies',
    icon: Laptop,
    name: 'SaaS & Tech Companies',
    description: 'Create product demo videos, feature announcements, and social proof content that drives signups',
    toolMappings: [
      {
        icon: Library,
        title: 'Template Library',
        description: 'Product demo templates',
        href: '/tools/template-library'
      },
      {
        icon: Sparkles,
        title: 'Script Generator',
        description: 'Technical simplification',
        href: '/tools/script-generator'
      },
      {
        icon: Target,
        title: 'Viral Score',
        description: 'Education-engagement balance',
        href: '/tools/viral-score'
      },
      {
        icon: TrendingUp,
        title: 'Trend Discovery',
        description: 'Tech trends and competitors',
        href: '/tools/trend-discovery'
      }
    ],
    benefits: [
      {
        title: 'Simplify Technical Concepts',
        description: 'Make features digestible for TikTok/IG'
      },
      {
        title: 'Demo Scripts Ready',
        description: 'Product showcase templates'
      },
      {
        title: 'Feature Launch Content',
        description: 'Announcement scripts optimized'
      },
      {
        title: 'Competitor Analysis',
        description: 'See what tech brands are doing'
      }
    ],
    workflow: [
      { step: 'Feature launch' },
      { step: 'Simplify technical benefit' },
      { step: 'Generate demo script' },
      { step: 'Score clarity' },
      { step: 'Multi-platform publish' }
    ],
    useCases: [
      {
        title: '500 Signups',
        description: 'SaaS company drives 500 signups with product demo Shorts'
      },
      {
        title: 'Viral AI Explanation',
        description: 'Tech startup goes viral explaining AI features simply'
      },
      {
        title: '35% Trial Conversions',
        description: 'B2B platform increases trial conversions 35% with short-form content'
      }
    ],
    featureHighlight: {
      title: 'Tech Template Collection',
      description: 'SaaS-specific frameworks for product demos and feature announcements'
    },
    primaryCTA: {
      text: 'Start SaaS Marketing',
      destination: '/dashboard'
    },
    secondaryCTA: {
      text: 'See Tech Templates',
      destination: '/tools/template-library'
    }
  }
];

const rotatingPersonas = personasData.map(p => p.name);

export default function UseCasesPage() {
  const [, setLocation] = useLocation();
  const { trackNavigateCTA } = useCTATracking();
  const [currentPersonaIndex, setCurrentPersonaIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('content-creators');

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPersonaIndex((prev) => (prev + 1) % rotatingPersonas.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleHeroCTA = () => {
    trackNavigateCTA('use-cases-hero', '/dashboard');
    setLocation('/dashboard');
  };

  const handleTabChange = (tabValue: string) => {
    setActiveTab(tabValue);
    const persona = personasData.find(p => p.id === tabValue);
    if (persona) {
      trackNavigateCTA(`use-cases-tab-${tabValue}`, tabValue);
    }
  };

  const handleToolClick = (personaId: string, toolTitle: string, href?: string) => {
    if (href) {
      trackNavigateCTA(`use-cases-${personaId}-tool-${toolTitle.toLowerCase().replace(/\s+/g, '-')}`, href);
      setLocation(href);
    }
  };

  const handlePrimaryCTA = (persona: PersonaTabContent) => {
    trackNavigateCTA(`use-cases-${persona.id}-primary-cta`, persona.primaryCTA.destination);
    setLocation(persona.primaryCTA.destination);
  };

  const handleSecondaryCTA = (persona: PersonaTabContent) => {
    trackNavigateCTA(`use-cases-${persona.id}-secondary-cta`, persona.secondaryCTA.destination);
    setLocation(persona.secondaryCTA.destination);
  };

  return (
    <>
      <MarketingNav />
      <Helmet>
        <title>ScriptTok Use Cases - Tools for Every Creator Type</title>
        <meta
          name="description"
          content="From content creators to SaaS companies, discover how ScriptTok's AI-powered tools transform your video content workflow"
        />
        <meta property="og:title" content="ScriptTok Use Cases - Tools for Every Creator Type" />
        <meta
          property="og:description"
          content="From content creators to SaaS companies, discover how ScriptTok's AI-powered tools transform your video content workflow"
        />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* Hero Section */}
      <section 
        className="relative bg-gradient-to-br from-violet-600 to-purple-600 text-white py-16 md:py-24"
        data-testid="use-cases-hero-section"
      >
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center space-y-6">
            {/* Eyebrow */}
            <p 
              className="text-sm font-semibold tracking-wide uppercase text-violet-200"
              data-testid="hero-eyebrow"
            >
              WHO SCRIPTTOK IS FOR
            </p>

            {/* Headline */}
            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
              data-testid="hero-headline"
            >
              Transform Your Content Creation — No Matter Your Niche
            </h1>

            {/* Rotating Personas */}
            <div className="min-h-[3em] flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPersonaIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="text-2xl md:text-3xl font-semibold text-violet-200"
                  data-testid={`rotating-persona-${currentPersonaIndex}`}
                >
                  {rotatingPersonas[currentPersonaIndex]}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Subheadline */}
            <p 
              className="text-lg md:text-xl text-violet-100 max-w-3xl mx-auto"
              data-testid="hero-subheadline"
            >
              From viral TikToks to high-converting product videos, ScriptTok adapts to your unique content goals
            </p>

            {/* Primary CTA */}
            <div className="pt-4">
              <Button
                onClick={handleHeroCTA}
                size="lg"
                className="bg-white text-violet-600 hover:bg-violet-50 font-semibold"
                data-testid="hero-primary-cta"
              >
                Start Creating Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Tabbed Interface */}
      <section className="py-16 md:py-20 bg-white" data-testid="use-cases-tabs-section">
        <div className="container mx-auto px-4 max-w-7xl">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            {/* Tabs List - Sticky on Scroll */}
            <div className="sticky top-16 bg-white z-40 pb-6 border-b">
              <TabsList 
                className="w-full flex flex-wrap justify-start gap-2 bg-transparent h-auto p-0"
                data-testid="use-cases-tabs-list"
              >
                {personasData.map((persona) => {
                  const Icon = persona.icon;
                  return (
                    <TabsTrigger
                      key={persona.id}
                      value={persona.id}
                      className="data-[state=active]:bg-violet-600 data-[state=active]:text-white bg-gray-100 text-gray-600 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                      data-testid={`tab-trigger-${persona.id}`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{persona.name}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>

            {/* Tab Contents */}
            {personasData.map((persona) => (
              <TabsContent 
                key={persona.id} 
                value={persona.id}
                className="mt-8 space-y-12"
                data-testid={`tab-content-${persona.id}`}
              >
                {/* Description */}
                <div className="text-center max-w-3xl mx-auto">
                  <p 
                    className="text-xl md:text-2xl text-gray-700"
                    data-testid={`persona-description-${persona.id}`}
                  >
                    {persona.description}
                  </p>
                </div>

                {/* Tool Mapping Grid */}
                <div>
                  <h3 
                    className="text-2xl font-bold text-gray-900 mb-6 text-center"
                    data-testid={`tool-mapping-title-${persona.id}`}
                  >
                    Your Essential Tools
                  </h3>
                  <div 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                    data-testid={`tool-mapping-grid-${persona.id}`}
                  >
                    {persona.toolMappings.map((tool, idx) => {
                      const ToolIcon = tool.icon;
                      return (
                        <Card
                          key={idx}
                          className="cursor-pointer transition-shadow hover:shadow-md"
                          onClick={() => handleToolClick(persona.id, tool.title, tool.href)}
                          data-testid={`tool-card-${persona.id}-${idx}`}
                        >
                          <CardContent className="p-6">
                            <ToolIcon className="h-8 w-8 text-violet-600 mb-4" data-testid={`tool-icon-${persona.id}-${idx}`} />
                            <h4 className="font-semibold text-gray-900 mb-2" data-testid={`tool-title-${persona.id}-${idx}`}>
                              {tool.title}
                            </h4>
                            <p className="text-sm text-gray-600" data-testid={`tool-description-${persona.id}-${idx}`}>
                              {tool.description}
                            </p>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                {/* Benefits Breakdown */}
                <div className="bg-gray-50 rounded-2xl p-8">
                  <h3 
                    className="text-2xl font-bold text-gray-900 mb-6 text-center"
                    data-testid={`benefits-title-${persona.id}`}
                  >
                    Key Benefits
                  </h3>
                  <div 
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    data-testid={`benefits-grid-${persona.id}`}
                  >
                    {persona.benefits.map((benefit, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-start gap-3"
                        data-testid={`benefit-item-${persona.id}-${idx}`}
                      >
                        <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" data-testid={`benefit-icon-${persona.id}-${idx}`} />
                        <div>
                          <p className="font-semibold text-gray-900" data-testid={`benefit-title-${persona.id}-${idx}`}>
                            {benefit.title}
                          </p>
                          <p className="text-sm text-gray-600" data-testid={`benefit-description-${persona.id}-${idx}`}>
                            {benefit.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Workflow Visualization */}
                <div>
                  <h3 
                    className="text-2xl font-bold text-gray-900 mb-6 text-center"
                    data-testid={`workflow-title-${persona.id}`}
                  >
                    Your Workflow
                  </h3>
                  <div 
                    className="flex flex-col md:flex-row items-center justify-center gap-4"
                    data-testid={`workflow-steps-${persona.id}`}
                  >
                    {persona.workflow.map((step, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <div 
                          className="flex flex-col items-center"
                          data-testid={`workflow-step-${persona.id}-${idx}`}
                        >
                          <div className="w-12 h-12 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold text-lg" data-testid={`workflow-number-${persona.id}-${idx}`}>
                            {idx + 1}
                          </div>
                          <p className="mt-2 text-sm font-medium text-gray-900 text-center max-w-[120px]" data-testid={`workflow-step-text-${persona.id}-${idx}`}>
                            {step.step}
                          </p>
                        </div>
                        {idx < persona.workflow.length - 1 && (
                          <ArrowRight className="hidden md:block h-6 w-6 text-gray-400" data-testid={`workflow-arrow-${persona.id}-${idx}`} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Use Case Examples */}
                <div>
                  <h3 
                    className="text-2xl font-bold text-gray-900 mb-6 text-center"
                    data-testid={`use-case-examples-title-${persona.id}`}
                  >
                    Real Success Stories
                  </h3>
                  <div 
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    data-testid={`use-case-examples-grid-${persona.id}`}
                  >
                    {persona.useCases.map((useCase, idx) => (
                      <Card key={idx} data-testid={`use-case-card-${persona.id}-${idx}`}>
                        <CardContent className="p-6">
                          <Badge className="mb-3 bg-violet-100 text-violet-700" data-testid={`use-case-badge-${persona.id}-${idx}`}>
                            Success Story
                          </Badge>
                          <h4 className="font-semibold text-gray-900 mb-2" data-testid={`use-case-title-${persona.id}-${idx}`}>
                            {useCase.title}
                          </h4>
                          <p className="text-sm text-gray-600" data-testid={`use-case-description-${persona.id}-${idx}`}>
                            {useCase.description}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Feature Highlight */}
                <div className="bg-gradient-to-br from-violet-600 to-purple-600 text-white rounded-2xl p-8">
                  <div className="flex items-start gap-4">
                    <Zap className="h-12 w-12 flex-shrink-0" data-testid={`feature-highlight-icon-${persona.id}`} />
                    <div>
                      <h3 className="text-2xl font-bold mb-2" data-testid={`feature-highlight-title-${persona.id}`}>
                        {persona.featureHighlight.title}
                      </h3>
                      <p className="text-violet-100 text-lg" data-testid={`feature-highlight-description-${persona.id}`}>
                        {persona.featureHighlight.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom CTAs */}
                <div 
                  className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
                  data-testid={`ctas-${persona.id}`}
                >
                  <Button
                    onClick={() => handlePrimaryCTA(persona)}
                    size="lg"
                    className="bg-violet-600 text-white hover:bg-violet-700"
                    data-testid={`primary-cta-${persona.id}`}
                  >
                    {persona.primaryCTA.text}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button
                    onClick={() => handleSecondaryCTA(persona)}
                    size="lg"
                    variant="outline"
                    className="border-2 border-violet-600 text-violet-600 hover:bg-violet-50"
                    data-testid={`secondary-cta-${persona.id}`}
                  >
                    {persona.secondaryCTA.text}
                  </Button>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>
    </>
  );
}
