import {
  Home,
  Sparkles,
  Layers,
  Lightbulb,
  History,
  BarChart3,
  Calendar,
  Clock,
  DollarSign,
  TrendingUp,
  Zap,
  TestTube,
  Bot,
  Settings,
  Hash,
  Target,
  MousePointer,
  Download,
  Webhook,
  Activity,
  Shield,
  FileCheck,
  HelpCircle,
  MessageCircle,
  Package
} from 'lucide-react';

export interface PhemeSection {
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  category: string;
  whatItDoes: string;
  setupRequirements: string[];
  usageInstructions: string[];
  relatedLinks: { name: string; path: string }[];
  notes: string[];
  keyFeatures: string[];
}

export const phemeSections: PhemeSection[] = [
  // Overview
  {
    name: "About Pheme",
    description: "Comprehensive overview of the Pheme AI platform, its capabilities, and how it transforms content creation.",
    icon: HelpCircle,
    path: "/about",
    category: "Overview",
    whatItDoes: "Provides a complete introduction to Pheme's AI-powered content generation platform, explaining core features, supported platforms, and the comprehensive toolkit available for scaling content production.",
    setupRequirements: ["No setup required", "Explore platform capabilities", "Review available tools and features"],
    usageInstructions: [
      "Read through platform overview and key features",
      "Explore the comprehensive tools grid to understand capabilities",
      "Visit individual tool pages for detailed functionality",
      "Start with the Dashboard for your content creation journey",
      "Access help resources and documentation as needed"
    ],
    relatedLinks: [
      { name: "Dashboard", path: "/" },
      { name: "Unified Generator", path: "/unified-generator" },
      { name: "How It Works", path: "/how-it-works" }
    ],
    notes: [
      "Central hub for understanding all platform capabilities",
      "No AI keys required to explore platform features",
      "Comprehensive tool grid shows all available functionality"
    ],
    keyFeatures: ["Platform overview", "Tools directory", "Getting started guide", "Feature explanations", "Navigation hub"]
  },

  // Core
  {
    name: "Dashboard",
    description: "Your streamlined command center for viral content creation, trend discovery, and performance tracking.",
    icon: Home,
    path: "/",
    category: "Core",
    whatItDoes: "Serves as your central hub for discovering viral trends, generating content, and accessing key tools. Features the comprehensive Trend Forecaster, AI-powered trending picks from multiple sources, and quick access to content generation and analytics tools.",
    setupRequirements: ["No setup required", "Automatically populated with trending data"],
    usageInstructions: [
      "Explore trends using the comprehensive Trend Forecaster across all 7 niches",
      "Switch between Perplexity AI and Amazon data sources for trending products",
      "Use trending products to generate viral content with one-click navigation",
      "Access Unified Content Generator and Content History via quick action buttons",
      "Review product insights and filter by niche to find your target opportunities"
    ],
    relatedLinks: [
      { name: "Unified Generator", path: "/unified-generator" },
      { name: "Content History", path: "/content-history" },
      { name: "AI Trending Picks", path: "/trending-ai-picks" }
    ],
    notes: [
      "Trend Forecaster provides real-time insights with manual refresh control",
      "Data sources can be toggled between Perplexity AI and Amazon PA-API",
      "All trending products link directly to content generation workflows"
    ],
    keyFeatures: ["Trend Forecaster", "Multi-source trending picks", "Quick content generation", "Data source switching", "Niche filtering"]
  },
  {
    name: "Unified Generator",
    description: "Primary content generation tool supporting multiple AI models, platforms, and content formats.",
    icon: Sparkles,
    path: "/unified-generator",
    category: "Core",
    whatItDoes: "Generates high-quality content for multiple social media platforms using advanced AI models. Supports various content types, tones, and formats with platform-specific optimization and bulk generation capabilities.",
    setupRequirements: ["AI API keys (OpenAI, Claude)", "Select preferred AI model", "Choose target platforms"],
    usageInstructions: [
      "Select your preferred AI model (Claude recommended)",
      "Choose target platforms (TikTok, Instagram, YouTube, etc.)",
      "Enter product name and select content style",
      "Optionally add product URL for enhanced context",
      "Click generate and review platform-specific content",
      "Use webhook integration to send content to automation tools"
    ],
    relatedLinks: [
      { name: "Template Explorer", path: "/templates" },
      { name: "Content History", path: "/content-history" },
      { name: "Webhook Settings", path: "/webhook-settings" }
    ],
    notes: [
      "Claude AI typically produces higher quality results",
      "Content is automatically optimized for each platform's requirements",
      "Generated content is saved to history for future reference"
    ],
    keyFeatures: ["Multi-platform generation", "AI model selection", "Bulk generation", "Webhook integration", "Content optimization"]
  },
  {
    name: "Template Explorer",
    description: "Browse, manage, and customize content generation templates for different niches and styles.",
    icon: Layers,
    path: "/templates",
    category: "Core",
    whatItDoes: "Provides access to a comprehensive library of content generation templates organized by niche, style, and platform. Allows customization and management of template preferences for consistent content generation.",
    setupRequirements: ["No setup required", "Templates are pre-configured"],
    usageInstructions: [
      "Browse templates by niche or search for specific styles",
      "Preview template examples and descriptions",
      "Select templates to use in content generation",
      "Customize template parameters as needed",
      "Save favorite templates for quick access"
    ],
    relatedLinks: [
      { name: "Unified Generator", path: "/unified-generator" },
      { name: "Content History", path: "/content-history" }
    ],
    notes: [
      "Templates are continuously updated and improved",
      "Custom templates can be created for specific needs",
      "Template performance is tracked for optimization"
    ],
    keyFeatures: ["Template library", "Niche organization", "Customization", "Favorites", "Performance tracking"]
  },
  {
    name: "Product Ideas",
    description: "Discover actionable product opportunities using constraint-based research and AI analysis.",
    icon: Lightbulb,
    path: "/product-research",
    category: "Core",
    whatItDoes: "Uses advanced constraint-based research to identify specific product opportunities that match your business parameters. Provides concrete data including demand metrics, competition analysis, margin calculations, and go/no-go recommendations.",
    setupRequirements: ["Perplexity API access", "Define business constraints"],
    usageInstructions: [
      "Fill in business constraints (problem, target customer, costs, etc.)",
      "Review margin calculations and validate parameters",
      "Submit research request for AI analysis",
      "Review detailed product opportunities with concrete metrics",
      "Save successful constraint sets for future research",
      "Export or bookmark promising opportunities"
    ],
    relatedLinks: [
      { name: "AI Trending Picks", path: "/trending-ai-picks" },
      { name: "Competitive Analysis", path: "/competitive-analysis" }
    ],
    notes: [
      "Constraint-based approach eliminates generic results",
      "Results include specific demand and competition data",
      "Research criteria can be saved and reused"
    ],
    keyFeatures: ["Constraint-based research", "Margin calculations", "Demand analysis", "Competition metrics", "Save/load criteria"]
  },
  {
    name: "Bulk Content Generation",
    description: "Automated bulk content creation system for scaling content production across multiple niches and platforms.",
    icon: Package,
    path: "/bulk-content-generation",
    category: "Core",
    whatItDoes: "Automates the creation of multiple content variations simultaneously using advanced AI models. Supports scheduled generation, batch processing, and multi-niche content production with comprehensive job management and tracking.",
    setupRequirements: ["AI API keys configured", "Select target niches and platforms", "Configure generation parameters"],
    usageInstructions: [
      "Choose between automated scheduling or manual bulk generation",
      "Set up generation parameters (niche, platform, count, style)",
      "Configure scheduling options for automated content creation",
      "Monitor job progress and status in real-time",
      "Review and manage generated content batches",
      "Export or distribute completed content"
    ],
    relatedLinks: [
      { name: "Unified Generator", path: "/unified-generator" },
      { name: "Content History", path: "/content-history" },
      { name: "Schedule Manager", path: "/schedule-manager" }
    ],
    notes: [
      "Automated jobs persist across server restarts",
      "Content generation is rate-limited to prevent API overuse",
      "Failed generations are automatically retried with exponential backoff"
    ],
    keyFeatures: ["Automated scheduling", "Batch processing", "Multi-niche support", "Job monitoring", "Retry logic"]
  },

  // Content Management
  {
    name: "Content History",
    description: "View, manage, and analyze all your generated content with advanced filtering and export options.",
    icon: History,
    path: "/content-history",
    category: "Content Management",
    whatItDoes: "Provides comprehensive access to all generated content with advanced search, filtering, and management capabilities. Track performance, export content, and analyze generation patterns.",
    setupRequirements: ["Generated content in the system"],
    usageInstructions: [
      "Browse content by date, platform, or niche",
      "Use search and filters to find specific content",
      "View detailed content metrics and performance",
      "Export content in various formats",
      "Delete or archive old content"
    ],
    relatedLinks: [
      { name: "Analytics Dashboard", path: "/analytics" },
      { name: "Export/Import", path: "/export-import" }
    ],
    notes: [
      "Content is automatically saved after generation",
      "Performance metrics are updated regularly",
      "Export options include CSV and JSON formats"
    ],
    keyFeatures: ["Content search", "Advanced filtering", "Performance tracking", "Export options", "Bulk management"]
  },
  {
    name: "Analytics Dashboard",
    description: "Performance metrics and insights for your content generation and engagement tracking.",
    icon: BarChart3,
    path: "/analytics",
    category: "Content Management",
    whatItDoes: "Displays comprehensive analytics including content performance, generation trends, platform effectiveness, and ROI metrics. Provides actionable insights for content strategy optimization.",
    setupRequirements: ["Content generation history", "Optional: tracking integration"],
    usageInstructions: [
      "Review overall performance metrics",
      "Analyze content by platform and niche",
      "Track generation trends and patterns",
      "Export analytics reports",
      "Use insights to optimize content strategy"
    ],
    relatedLinks: [
      { name: "Content History", path: "/content-history" },
      { name: "Performance Analytics", path: "/performance-analytics" }
    ],
    notes: [
      "Analytics are updated in real-time",
      "Historical data is preserved for trend analysis",
      "Reports can be exported for external analysis"
    ],
    keyFeatures: ["Performance metrics", "Trend analysis", "Platform comparison", "ROI tracking", "Report generation"]
  },
  {
    name: "Content Calendar",
    description: "Schedule and plan your content generation and posting across multiple platforms.",
    icon: Calendar,
    path: "/content-calendar",
    category: "Content Management",
    whatItDoes: "Provides calendar-based content planning and scheduling with multi-platform support. Visualize content pipeline, plan campaigns, and manage posting schedules.",
    setupRequirements: ["Content generation setup", "Platform integrations"],
    usageInstructions: [
      "View content calendar by day, week, or month",
      "Schedule new content generation",
      "Plan content campaigns and themes",
      "Manage posting schedules across platforms",
      "Track scheduled vs published content"
    ],
    relatedLinks: [
      { name: "Schedule Manager", path: "/schedule-manager" },
      { name: "Cross-Platform Scheduling", path: "/cross-platform-scheduling" }
    ],
    notes: [
      "Calendar integrates with scheduling tools",
      "Supports recurring content plans",
      "Mobile-responsive for on-the-go planning"
    ],
    keyFeatures: ["Calendar visualization", "Multi-platform scheduling", "Campaign planning", "Recurring schedules", "Mobile access"]
  },

  // Framework
  {
    name: "Schedule Manager",
    description: "Manage and automate content generation schedules with advanced timing controls.",
    icon: Clock,
    path: "/schedule-manager",
    category: "Framework",
    whatItDoes: "Provides sophisticated scheduling capabilities for automated content generation with timezone support, frequency controls, and batch processing options.",
    setupRequirements: ["Content generation setup", "Scheduling preferences"],
    usageInstructions: [
      "Create new content generation schedules",
      "Set frequency and timing preferences",
      "Configure batch size and processing options",
      "Monitor scheduled job status",
      "Adjust schedules based on performance"
    ],
    relatedLinks: [
      { name: "Content Calendar", path: "/content-calendar" },
      { name: "Automation Checklist", path: "/btb-status" }
    ],
    notes: [
      "Schedules persist across server restarts",
      "Supports complex timing patterns",
      "Failed jobs are automatically retried"
    ],
    keyFeatures: ["Automated scheduling", "Timezone support", "Batch processing", "Status monitoring", "Retry logic"]
  },
  {
    name: "Cross-Platform Scheduling",
    description: "Coordinate content posting across multiple social media platforms with unified scheduling.",
    icon: Calendar,
    path: "/cross-platform-scheduling",
    category: "Framework",
    whatItDoes: "Enables synchronized content distribution across multiple platforms with platform-specific optimization and timing controls.",
    setupRequirements: ["Platform API access", "Scheduling configuration"],
    usageInstructions: [
      "Select target platforms for content distribution",
      "Configure platform-specific posting times",
      "Set up content adaptation rules",
      "Schedule cross-platform campaigns",
      "Monitor posting status across platforms"
    ],
    relatedLinks: [
      { name: "Schedule Manager", path: "/schedule-manager" },
      { name: "API Integration Hub", path: "/api-integration-hub" }
    ],
    notes: [
      "Content is automatically adapted for each platform",
      "Supports different timing for each platform",
      "Includes failure handling and retry logic"
    ],
    keyFeatures: ["Multi-platform posting", "Platform optimization", "Unified scheduling", "Status tracking", "Failure handling"]
  },
  {
    name: "Performance Analytics",
    description: "Detailed performance analysis with advanced metrics and reporting capabilities.",
    icon: DollarSign,
    path: "/performance-analytics",
    category: "Framework",
    whatItDoes: "Provides in-depth performance analysis including engagement metrics, conversion tracking, ROI calculations, and predictive analytics for content optimization.",
    setupRequirements: ["Analytics integration", "Performance tracking setup"],
    usageInstructions: [
      "Review detailed performance metrics",
      "Analyze engagement and conversion data",
      "Generate custom performance reports",
      "Track ROI and business metrics",
      "Use predictive analytics for optimization"
    ],
    relatedLinks: [
      { name: "Analytics Dashboard", path: "/analytics" },
      { name: "Click Tracking", path: "/click-tracking" }
    ],
    notes: [
      "Advanced metrics require additional setup",
      "Historical data enables trend prediction",
      "Custom reports can be automated"
    ],
    keyFeatures: ["Advanced metrics", "ROI tracking", "Predictive analytics", "Custom reports", "Business intelligence"]
  },

  // AI Tools
  {
    name: "AI Trending Picks",
    description: "AI-powered trend analysis and viral content inspiration from multiple data sources.",
    icon: TrendingUp,
    path: "/trending-ai-picks",
    category: "AI Tools",
    whatItDoes: "Uses AI to analyze trending products, topics, and content patterns across multiple platforms to provide data-driven content inspiration and viral potential assessment.",
    setupRequirements: ["Perplexity API access", "Trending data sources"],
    usageInstructions: [
      "Review AI-generated trending product recommendations",
      "Analyze trend data and viral potential",
      "Select trending items for content generation",
      "Track trend performance over time",
      "Export trending data for analysis"
    ],
    relatedLinks: [
      { name: "Product Ideas", path: "/product-research" },
      { name: "Unified Generator", path: "/unified-generator" }
    ],
    notes: [
      "Trending data is updated daily",
      "AI analysis includes viral potential scoring",
      "Trends are categorized by niche and platform"
    ],
    keyFeatures: ["AI trend analysis", "Viral potential scoring", "Multi-source data", "Niche categorization", "Performance tracking"]
  },
  {
    name: "Spartan Generator",
    description: "Specialized content format that removes filler words and creates professional, direct messaging.",
    icon: Zap,
    path: "/spartan-generator",
    category: "AI Tools",
    whatItDoes: "Generates clean, professional content by automatically removing casual language and filler words, creating direct and impactful messaging suitable for business and professional contexts.",
    setupRequirements: ["AI model access", "Content input"],
    usageInstructions: [
      "Input casual or draft content",
      "Select Spartan formatting level",
      "Generate cleaned, professional version",
      "Review and refine output",
      "Export for professional use"
    ],
    relatedLinks: [
      { name: "Unified Generator", path: "/unified-generator" },
      { name: "Template Explorer", path: "/templates" }
    ],
    notes: [
      "Spartan format enforces professional tone",
      "Automatic filler word removal",
      "Suitable for business communications"
    ],
    keyFeatures: ["Professional formatting", "Filler word removal", "Tone enforcement", "Business messaging", "Clean output"]
  },
  {
    name: "AI Model Testing",
    description: "Test and compare different AI models for content generation performance and quality.",
    icon: TestTube,
    path: "/ai-model-test",
    category: "AI Tools",
    whatItDoes: "Provides A/B testing capabilities for different AI models, allowing comparison of output quality, style, and performance to optimize content generation settings.",
    setupRequirements: ["Multiple AI model access", "Test scenarios"],
    usageInstructions: [
      "Select AI models to compare",
      "Configure test parameters",
      "Run comparative generation tests",
      "Analyze quality and performance metrics",
      "Save optimal model configurations"
    ],
    relatedLinks: [
      { name: "Model Configuration", path: "/ai-model-config" },
      { name: "Unified Generator", path: "/unified-generator" }
    ],
    notes: [
      "Testing helps optimize AI model selection",
      "Results guide configuration decisions",
      "Performance metrics include quality scores"
    ],
    keyFeatures: ["Model comparison", "A/B testing", "Quality metrics", "Performance analysis", "Configuration optimization"]
  },
  {
    name: "Claude Generator",
    description: "Dedicated Claude AI integration with advanced features and model-specific optimizations.",
    icon: Bot,
    path: "/claude-generator",
    category: "AI Tools",
    whatItDoes: "Specialized interface for Claude AI with enhanced prompting, conversation context, and Claude-specific features for superior content generation quality.",
    setupRequirements: ["Claude API access", "Model configuration"],
    usageInstructions: [
      "Configure Claude model parameters",
      "Use enhanced prompting interface",
      "Leverage conversation context",
      "Generate high-quality content",
      "Fine-tune Claude-specific settings"
    ],
    relatedLinks: [
      { name: "AI Model Testing", path: "/ai-model-test" },
      { name: "Model Configuration", path: "/ai-model-config" }
    ],
    notes: [
      "Claude often produces higher quality results",
      "Advanced prompting improves output",
      "Context management enhances consistency"
    ],
    keyFeatures: ["Claude optimization", "Enhanced prompting", "Context management", "Quality focus", "Model tuning"]
  },
  {
    name: "Model Configuration",
    description: "Configure and fine-tune AI model parameters for optimal content generation performance.",
    icon: Settings,
    path: "/ai-model-config",
    category: "AI Tools",
    whatItDoes: "Provides detailed configuration options for AI models including temperature, token limits, prompt templates, and model-specific parameters for customized content generation.",
    setupRequirements: ["AI model access", "Configuration knowledge"],
    usageInstructions: [
      "Select AI model to configure",
      "Adjust temperature and creativity settings",
      "Set token limits and response parameters",
      "Customize prompt templates",
      "Test and save configuration profiles"
    ],
    relatedLinks: [
      { name: "AI Model Testing", path: "/ai-model-test" },
      { name: "Claude Generator", path: "/claude-generator" }
    ],
    notes: [
      "Different models require different configurations",
      "Testing helps validate configuration changes",
      "Profiles can be saved for reuse"
    ],
    keyFeatures: ["Parameter tuning", "Prompt customization", "Configuration profiles", "Testing integration", "Model optimization"]
  },

  // Advanced Tools
  {
    name: "Competitive Analysis",
    description: "Analyze competitor content strategies, performance metrics, and market positioning.",
    icon: Target,
    path: "/competitive-analysis",
    category: "Advanced Tools",
    whatItDoes: "Provides comprehensive competitor analysis including content strategy evaluation, performance benchmarking, and market gap identification for strategic content planning.",
    setupRequirements: ["Competitor identification", "Analysis tools setup"],
    usageInstructions: [
      "Add competitors to analysis dashboard",
      "Configure analysis parameters",
      "Run competitive content analysis",
      "Review performance comparisons",
      "Identify market opportunities"
    ],
    relatedLinks: [
      { name: "Product Ideas", path: "/product-research" },
      { name: "Analytics Dashboard", path: "/analytics" }
    ],
    notes: [
      "Analysis includes content gaps and opportunities",
      "Regular monitoring tracks competitive changes",
      "Results inform content strategy decisions"
    ],
    keyFeatures: ["Competitor tracking", "Performance benchmarking", "Gap analysis", "Strategy insights", "Market research"]
  },
  {
    name: "Emoji & Hashtag Test",
    description: "Advanced testing tools for emoji effectiveness and hashtag performance optimization.",
    icon: Hash,
    path: "/emoji-hashtag-test",
    category: "Advanced Tools",
    whatItDoes: "Provides specialized testing capabilities for emoji usage patterns and hashtag performance analysis, helping optimize content engagement through data-driven emoji and hashtag selection.",
    setupRequirements: ["Content samples for testing", "Platform-specific guidelines"],
    usageInstructions: [
      "Input content variations with different emoji combinations",
      "Test hashtag effectiveness across platforms",
      "Analyze engagement patterns for emoji usage",
      "Compare performance metrics for different approaches",
      "Generate optimized emoji and hashtag recommendations"
    ],
    relatedLinks: [
      { name: "Unified Generator", path: "/unified-generator" },
      { name: "Performance Analytics", path: "/performance-analytics" },
      { name: "AI Model Testing", path: "/ai-model-test" }
    ],
    notes: [
      "Emoji effectiveness varies significantly by platform",
      "Hashtag performance depends on timing and audience",
      "Regular testing improves engagement rates"
    ],
    keyFeatures: ["Emoji effectiveness testing", "Hashtag performance analysis", "Platform-specific optimization", "Engagement correlation", "Data-driven recommendations"]
  },

  // Analytics & Tracking  
  {
    name: "Click Tracking",
    description: "Track and analyze link performance with detailed engagement metrics and conversion data.",
    icon: MousePointer,
    path: "/click-tracking",
    category: "Analytics & Tracking",
    whatItDoes: "Provides comprehensive link tracking with click analytics, conversion metrics, traffic source analysis, and performance optimization insights.",
    setupRequirements: ["Link tracking setup", "Analytics integration"],
    usageInstructions: [
      "Set up tracked links for content",
      "Monitor click-through rates",
      "Analyze traffic sources and patterns",
      "Track conversion performance",
      "Optimize link placement and timing"
    ],
    relatedLinks: [
      { name: "Performance Analytics", path: "/performance-analytics" },
      { name: "Analytics Dashboard", path: "/analytics" }
    ],
    notes: [
      "Real-time click tracking available",
      "Attribution data helps optimize content",
      "Privacy-compliant tracking methods"
    ],
    keyFeatures: ["Link tracking", "Click analytics", "Conversion tracking", "Traffic analysis", "Performance optimization"]
  },
  {
    name: "Export/Import",
    description: "Data management tools for exporting content, importing data, and system backup/restore.",
    icon: Download,
    path: "/export-import",
    category: "Analytics & Tracking",
    whatItDoes: "Provides comprehensive data management including content export, bulk import capabilities, backup creation, and data migration tools for system maintenance and analysis.",
    setupRequirements: ["Data access permissions", "Export format preferences"],
    usageInstructions: [
      "Select data to export (content, analytics, etc.)",
      "Choose export format (CSV, JSON, etc.)",
      "Configure export parameters",
      "Download exported data",
      "Import data from external sources"
    ],
    relatedLinks: [
      { name: "Content History", path: "/content-history" },
      { name: "Analytics Dashboard", path: "/analytics" }
    ],
    notes: [
      "Multiple export formats supported",
      "Bulk operations available for efficiency",
      "Data integrity maintained during operations"
    ],
    keyFeatures: ["Data export", "Bulk import", "Multiple formats", "Backup tools", "Migration support"]
  },

  // Integration
  {
    name: "Webhook Settings",
    description: "Configure webhook integrations for automated content distribution and workflow automation.",
    icon: Webhook,
    path: "/webhook-settings",
    category: "Integration",
    whatItDoes: "Manages webhook configurations for automated content delivery to external platforms like Make.com, Zapier, and custom endpoints with payload customization and retry logic.",
    setupRequirements: ["Webhook endpoint URLs", "Authentication setup"],
    usageInstructions: [
      "Add webhook endpoints",
      "Configure payload format and content",
      "Set up authentication and headers",
      "Test webhook delivery",
      "Monitor webhook status and logs"
    ],
    relatedLinks: [
      { name: "API Integration Hub", path: "/api-integration-hub" },
      { name: "Automation Checklist", path: "/btb-status" }
    ],
    notes: [
      "Webhooks enable automation workflow integration",
      "Retry logic handles delivery failures",
      "Payload customization supports various platforms"
    ],
    keyFeatures: ["Webhook management", "Payload customization", "Authentication", "Delivery monitoring", "Retry handling"]
  },
  {
    name: "API Integration Hub",
    description: "Manage API connections, credentials, and integration status across all external services.",
    icon: Zap,
    path: "/api-integration-hub",
    category: "Integration",
    whatItDoes: "Centralized management for all API integrations including AI services, social platforms, analytics tools, and automation services with status monitoring and credential management.",
    setupRequirements: ["API credentials", "Service accounts"],
    usageInstructions: [
      "Add new API integrations",
      "Configure credentials and authentication",
      "Test API connections",
      "Monitor integration status",
      "Manage rate limits and quotas"
    ],
    relatedLinks: [
      { name: "Webhook Settings", path: "/webhook-settings" },
      { name: "Automation Checklist", path: "/btb-status" }
    ],
    notes: [
      "Centralized credential management improves security",
      "Status monitoring prevents integration failures",
      "Rate limit management optimizes API usage"
    ],
    keyFeatures: ["API management", "Credential security", "Status monitoring", "Rate limiting", "Integration testing"]
  },
  {
    name: "Automation Checklist",
    description: "Monitor system status, integration health, and automation workflow performance.",
    icon: Activity,
    path: "/btb-status",
    category: "Integration",
    whatItDoes: "Provides comprehensive system monitoring including integration status, automation health checks, performance metrics, and troubleshooting tools for maintaining optimal system operation.",
    setupRequirements: ["System integrations", "Monitoring configuration"],
    usageInstructions: [
      "Review system status dashboard",
      "Check integration health metrics",
      "Monitor automation workflows",
      "Investigate performance issues",
      "Run system health diagnostics"
    ],
    relatedLinks: [
      { name: "API Integration Hub", path: "/api-integration-hub" },
      { name: "Webhook Settings", path: "/webhook-settings" }
    ],
    notes: [
      "Real-time status monitoring available",
      "Automated alerts for system issues",
      "Performance metrics track system health"
    ],
    keyFeatures: ["System monitoring", "Health checks", "Performance metrics", "Issue diagnostics", "Status alerts"]
  },

  // Legal & Compliance
  {
    name: "Compliance Center",
    description: "Legal compliance tools and documentation for content generation and data handling.",
    icon: Shield,
    path: "/compliance",
    category: "Legal & Compliance",
    whatItDoes: "Provides compliance management tools including content review, legal documentation, data handling protocols, and regulatory compliance tracking for content generation activities.",
    setupRequirements: ["Compliance requirements review", "Legal documentation"],
    usageInstructions: [
      "Review compliance requirements",
      "Configure content review workflows",
      "Generate compliance reports",
      "Manage legal documentation",
      "Track regulatory compliance status"
    ],
    relatedLinks: [
      { name: "Privacy Policy", path: "/privacy-cookies" },
      { name: "Terms of Service", path: "/terms-billing" }
    ],
    notes: [
      "Compliance requirements vary by jurisdiction",
      "Regular reviews ensure ongoing compliance",
      "Documentation supports audit processes"
    ],
    keyFeatures: ["Compliance tracking", "Content review", "Legal documentation", "Audit support", "Regulatory management"]
  },
  {
    name: "Privacy Policy",
    description: "Comprehensive privacy policy covering data collection, usage, and protection practices.",
    icon: Shield,
    path: "/privacy-cookies",
    category: "Legal & Compliance",
    whatItDoes: "Details how user data is collected, stored, processed, and protected within the Pheme platform, including third-party integrations, data retention policies, and user rights regarding personal information.",
    setupRequirements: ["Review privacy practices", "Understand data handling"],
    usageInstructions: [
      "Read through data collection practices",
      "Understand how personal information is used",
      "Review third-party data sharing policies",
      "Learn about data retention and deletion",
      "Know your rights regarding personal data"
    ],
    relatedLinks: [
      { name: "Terms of Service", path: "/terms-billing" },
      { name: "Compliance Center", path: "/compliance" },
      { name: "Contact", path: "/contact" }
    ],
    notes: [
      "Privacy policy is regularly updated",
      "Users are notified of material changes",
      "Contact support for privacy concerns"
    ],
    keyFeatures: ["Data protection", "Privacy rights", "Third-party policies", "Data retention", "User controls"]
  },
  {
    name: "Terms of Service",
    description: "Legal terms and conditions governing the use of the GlowBot platform and services.",
    icon: FileCheck,
    path: "/terms-billing",
    category: "Legal & Compliance",
    whatItDoes: "Establishes the legal agreement between users and Pheme, covering service usage, user responsibilities, limitations, intellectual property rights, and dispute resolution procedures.",
    setupRequirements: ["Read and understand terms", "Accept agreement to use services"],
    usageInstructions: [
      "Read through service terms and conditions",
      "Understand user responsibilities and restrictions",
      "Review intellectual property provisions",
      "Know service limitations and disclaimers",
      "Understand dispute resolution procedures"
    ],
    relatedLinks: [
      { name: "Privacy Policy", path: "/privacy-cookies" },
      { name: "Compliance Center", path: "/compliance" },
      { name: "Contact", path: "/contact" }
    ],
    notes: [
      "Terms are binding upon service usage",
      "Regular updates may occur with notification",
      "Legal disputes subject to specified jurisdiction"
    ],
    keyFeatures: ["Service agreement", "User responsibilities", "Intellectual property", "Limitations", "Dispute resolution"]
  },

  // Support
  {
    name: "How It Works",
    description: "Learn the complete Pheme workflow and best practices.",
    icon: FileText,
    path: "/how-it-works",
    category: "Support",
    whatItDoes: "Provides detailed documentation on Pheme functionality, step-by-step guides, workflow explanations, and best practice recommendations for optimal platform usage.",
    setupRequirements: ["No setup required"],
    usageInstructions: [
      "Browse feature documentation",
      "Follow step-by-step guides",
      "Learn workflow best practices",
      "Access troubleshooting resources",
      "Find integration instructions"
    ],
    relatedLinks: [
      { name: "FAQ", path: "/faq" },
      { name: "Contact", path: "/contact" }
    ],
    notes: [
      "Documentation is regularly updated",
      "Includes video tutorials and examples",
      "Community contributions welcome"
    ],
    keyFeatures: ["Feature guides", "Best practices", "Troubleshooting", "Video tutorials", "Community support"]
  },
  {
    name: "FAQ",
    description: "Frequently asked questions about Pheme features",
    icon: HelpCircle,
    path: "/faq",
    category: "Support",
    whatItDoes: "Comprehensive FAQ section covering common questions about features, troubleshooting, billing, integrations, and best practices with searchable content and categorized topics.",
    setupRequirements: ["No setup required"],
    usageInstructions: [
      "Search for specific questions",
      "Browse categories of common issues",
      "Access detailed answers and solutions",
      "Submit new questions",
      "Rate answer helpfulness"
    ],
    relatedLinks: [
      { name: "How It Works", path: "/how-it-works" },
      { name: "Contact", path: "/contact" }
    ],
    notes: [
      "FAQ is updated based on user questions",
      "Search functionality helps find relevant answers",
      "Community Q&A encouraged"
    ],
    keyFeatures: ["Searchable FAQ", "Categorized topics", "Detailed answers", "User submissions", "Answer ratings"]
  },
  {
    name: "Contact",
    description: "Get support, report issues, and connect with the Pheme team for assistance.",
    icon: MessageCircle,
    path: "/contact",
    category: "Support",
    whatItDoes: "Provides multiple contact options including support tickets, live chat, email support, and feedback submission with priority handling and response tracking.",
    setupRequirements: ["No setup required"],
    usageInstructions: [
      "Select appropriate contact method",
      "Describe your issue or question",
      "Provide relevant system information",
      "Submit support request",
      "Track response and resolution"
    ],
    relatedLinks: [
      { name: "FAQ", path: "/faq" },
      { name: "How It Works", path: "/how-it-works" }
    ],
    notes: [
      "Response times vary by support tier",
      "Detailed descriptions help faster resolution",
      "System information aids troubleshooting"
    ],
    keyFeatures: ["Multiple contact methods", "Support tickets", "Response tracking", "Priority handling", "Feedback submission"]
  }
];

export const getPhemeSectionsByCategory = () => {
  const categories: { [key: string]: PhemeSection[] } = {};

  phemeSections.forEach(section => {
    if (!categories[section.category]) {
      categories[section.category] = [];
    }
    categories[section.category].push(section);
  });

  return categories;
};

export const getPhemeSectionByPath = (path: string): PhemeSection | undefined => {
  return phemeSections.find(section => section.path === path);
};

export const getPhemeSectionsByKeyword = (keyword: string): PhemeSection[] => {
  const lowercaseKeyword = keyword.toLowerCase();
  return phemeSections.filter(section =>
    section.name.toLowerCase().includes(lowercaseKeyword) ||
    section.description.toLowerCase().includes(lowercaseKeyword) ||
    section.whatItDoes.toLowerCase().includes(lowercaseKeyword) ||
    section.keyFeatures.some(feature => feature.toLowerCase().includes(lowercaseKeyword))
  );
};

// Legacy exports for backward compatibility
export const getGlowBotSectionsByCategory = getPhemeSectionsByCategory;
export const getGlowBotSectionByPath = getPhemeSectionByPath;
export const getGlowBotSectionsByKeyword = getPhemeSectionsByKeyword;
export const scriptTokSections = phemeSections;
export const getScriptTokSectionsByCategory = getPhemeSectionsByCategory;
export const getScriptTokSectionByPath = getPhemeSectionByPath;
export const getScriptTokSectionsByKeyword = getPhemeSectionsByKeyword;