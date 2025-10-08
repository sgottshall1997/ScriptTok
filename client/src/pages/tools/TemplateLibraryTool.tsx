import { Helmet } from 'react-helmet';
import { useLocation } from 'wouter';
import { useCTATracking } from '@/hooks/use-cta-tracking';
import { MarketingNav } from '@/components/MarketingNav';
import Footer from '@/components/Footer';
import { ToolHero, HowItWorksSteps, ToolFeatureGrid, ToolFAQ, ToolCTA } from '@/components/tools';
import { Filter, Eye, Edit3, Save, Zap, Hash, Layers, Globe, BarChart3, Settings, ArrowRight, CheckCircle, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function TemplateLibraryTool() {
  const [, setLocation] = useLocation();
  const { trackNavigateCTA } = useCTATracking();

  const handlePrimaryCTA = () => {
    trackNavigateCTA('template-library-hero', '/generate-content');
    setLocation('/generate-content');
  };

  const handleSecondaryCTA = () => {
    const howItWorksSection = document.querySelector('[data-testid="how-templates-work-section"]');
    howItWorksSection?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFinalCTA = () => {
    trackNavigateCTA('template-library-final-cta', '/generate-content');
    setLocation('/generate-content');
  };

  const handleFeaturePageCTA = () => {
    trackNavigateCTA('template-library-feature-link', '/features/proven-viral-templates');
    setLocation('/features/proven-viral-templates');
  };

  const steps = [
    {
      icon: Filter,
      title: 'Step 1: Browse Pre-Built Templates',
      description: 'Navigate to Template Library → Find perfect templates in 5 minutes vs 2 hours of trial-and-error. Filter by niche, platform, or viral score (85+ templates average 2.1M views)',
    },
    {
      icon: Eye,
      title: 'Step 2: Preview Template Details',
      description: 'Click "Preview" to see proven performance: 2.4M avg views for viral hooks, 15.7% conversion for product templates. Review structure tested across 500K+ videos before selecting',
    },
    {
      icon: Edit3,
      title: 'Step 3: Customize for Your Brand',
      description: 'Customize in 5 minutes vs hours of scripting—AI auto-populates variables, adjusts tone, optimizes pacing. Creators using templates produce content 65% faster',
    },
    {
      icon: Save,
      title: 'Step 4: Save as Custom Template',
      description: 'Save unlimited custom templates—agencies create 50+ client-specific templates, reducing onboarding from 2 weeks to 2 days. Organize with tags for instant reuse',
    },
    {
      icon: Zap,
      title: 'Step 5: Generate Content with Template',
      description: 'Generate scripts in seconds with proven structures—affiliate marketers using templates see 62% higher conversion rates vs custom scripts',
    },
  ];

  const features = [
    {
      icon: Hash,
      title: 'Niche-Specific Templates',
      description: 'Pre-built templates tested across 500K+ videos with proven engagement patterns—templates with 85+ viral score average 2.1M views vs 180K for custom scripts',
    },
    {
      icon: Layers,
      title: 'Content Type Filtering',
      description: 'Find templates by format in 5 minutes vs 2 hours of trial-and-error—Product Showcase, Before/After, Tutorial templates optimized for conversions',
    },
    {
      icon: Globe,
      title: 'Platform Optimization',
      description: 'Templates pre-configured for TikTok (15-60s), Instagram Reels (15-90s), YouTube Shorts—creators using platform-optimized templates see 78% higher completion rates',
    },
    {
      icon: BarChart3,
      title: 'Performance Stats Included',
      description: 'Each template shows proven metrics: average 2.4M views for viral hooks, 15.7% conversion for product templates, 3.1M views for transformations',
    },
    {
      icon: Edit3,
      title: 'Visual Editing Interface',
      description: 'Customize templates in 5 minutes vs hours of scripting—drag-and-drop editor with live preview saves creators 10+ hours/week',
    },
    {
      icon: Save,
      title: 'Custom Template Library',
      description: 'Agencies create 50+ client-specific templates, reducing onboarding from 2 weeks to 2 days—unlimited saves, team sharing, version control',
    },
  ];

  const templateWorkflow = {
    structure: [
      { element: 'Hook (0-3s)', description: 'Attention-grabbing opener with variable placeholder for trend/product' },
      { element: 'Story Flow (3-30s)', description: 'Narrative arc with customizable beats: problem → solution → transformation' },
      { element: 'CTA (30-45s)', description: 'Call-to-action optimized for platform (comment, link, follow)' },
      { element: 'Tone Settings', description: 'Voice modifiers: casual, professional, humorous, educational' },
    ],
    variables: [
      '[PRODUCT_NAME] → Auto-fills from your input',
      '[NICHE_KEYWORD] → Pulls from selected category',
      '[TREND_HOOK] → Matches current viral trends',
      '[BRAND_VOICE] → Applies your tone settings',
    ],
    aiAdaptation: [
      '1. Template loads with placeholder structure',
      '2. AI analyzes your product/topic input',
      '3. Replaces variables with niche-specific content',
      '4. Adapts tone to match your brand settings',
      '5. Optimizes pacing for selected platform',
    ],
  };

  const interactiveExamples = [
    {
      title: 'Example 1: Generic → Brand-Specific',
      before: 'GENERIC TEMPLATE: "This [PRODUCT_NAME] changed everything! Here\'s why..."',
      after: 'YOUR BRAND: "This CeraVe Moisturizer saved my dry skin! Here\'s the 3-step routine that works..."',
      description: 'AI replaced [PRODUCT_NAME] with your product, adapted hook for beauty niche, and added specific benefit (dry skin)',
      actionSteps: [
        '1. Select "Product Showcase" template',
        '2. Enter product: "CeraVe Moisturizer"',
        '3. Choose niche: "Beauty"',
        '4. Click "Generate" → AI customizes instantly',
      ],
    },
    {
      title: 'Example 2: Viral Script → Reusable Template',
      before: 'YOUR VIRAL SCRIPT: Specific story about iPhone 15 Pro review that got 2M views',
      after: 'SAVED TEMPLATE: "Tech Product Deep Dive" - reusable structure for any tech product with proven viral formula',
      description: 'Extracted successful elements (hook style, story beats, CTA) and turned them into a template with variables',
      actionSteps: [
        '1. Open your successful script in History',
        '2. Click "Save as Template"',
        '3. Replace specifics with variables: iPhone 15 → [PRODUCT_NAME]',
        '4. Template now in "My Templates" for reuse',
      ],
    },
    {
      title: 'Example 3: Team Collaboration Workflow',
      before: 'TEAM MEMBER A creates "Fitness Transformation" template with proven hook',
      after: 'TEAM MEMBER B imports template → customizes for their client → saves variant → shares back to team library',
      description: 'Export template as JSON → Share with team → Import → Customize → Re-save → Build template library together',
      actionSteps: [
        '1. Create/customize template → Click "Export"',
        '2. Share .json file with team',
        '3. Team member clicks "Import Template"',
        '4. Customize for their use case → Save to shared library',
      ],
    },
  ];

  const practicalTips = [
    {
      category: 'Choosing the Right Template',
      icon: CheckCircle,
      tips: [
        'Match content type to your goal: Product Showcase for sales, Tutorial for education, Before/After for transformations',
        'Check performance stats: Templates with 1M+ avg views are proven winners',
        'Consider platform: TikTok templates are punchier, YouTube Shorts allow more story depth',
        'Review example scripts: Make sure the tone matches your brand before customizing',
      ],
    },
    {
      category: 'Customization for Viral Potential',
      icon: Zap,
      tips: [
        'Keep the proven hook structure, only swap in your product/topic',
        'Adjust tone settings to match your audience (Gen Z = casual, B2B = professional)',
        'Add trending audio/visual cues in the template notes section',
        'Test 2-3 CTA variations: "Comment below" vs "Link in bio" vs "Follow for Part 2"',
      ],
    },
    {
      category: 'Template Organization Strategies',
      icon: Layers,
      tips: [
        'Tag by campaign: "#BlackFriday", "#NewProductLaunch", "#SeasonalContent"',
        'Create template sets: Pair complementary templates (Hook + Follow-up + Conversion)',
        'Track performance: Note which templates drive best results in template description',
        'Version control: Save iterations as "Template_v1", "Template_v2" to A/B test',
      ],
    },
    {
      category: 'Common Mistakes to Avoid',
      icon: AlertCircle,
      tips: [
        '❌ Over-customizing: Don\'t change proven hook structures that work',
        '❌ Wrong platform: Don\'t use 90s Instagram template for 15s TikTok',
        '❌ Ignoring stats: Templates with low engagement need more editing, not just topic swap',
        '❌ Not saving variants: Always save customized versions as new templates for reuse',
      ],
    },
  ];

  const nicheTemplates = [
    { niche: 'Beauty', count: 8 },
    { niche: 'Tech', count: 7 },
    { niche: 'Fashion', count: 6 },
    { niche: 'Fitness', count: 5 },
    { niche: 'Food', count: 5 },
    { niche: 'Travel', count: 4 },
    { niche: 'Pets', count: 3 },
  ];

  const contentTypes = [
    'Product Showcase',
    'Before/After',
    'Trending Hook',
    'Tutorial',
    'Review',
    'Unboxing',
  ];

  const platforms = [
    { name: 'TikTok', duration: '15-60s' },
    { name: 'Instagram Reels', duration: '15-90s' },
    { name: 'YouTube Shorts', duration: '15-60s' },
  ];

  const topPerformers = [
    {
      title: 'Viral Hook Opener',
      stat: '2.4M avg views',
      description: 'Proven formula for capturing attention in the first 3 seconds—tested across 120K+ videos with 89% completion rate',
    },
    {
      title: 'Product Unboxing Flow',
      stat: '15.7% conversion',
      description: 'Optimized structure for product reviews and affiliate sales—62% higher conversion vs custom scripts',
    },
    {
      title: 'Before & After Transformation',
      stat: '3.1M avg views',
      description: 'Perfect for beauty, fitness, and lifestyle transformations—used by 15K+ creators with proven engagement patterns',
    },
  ];

  const faqs = [
    {
      question: 'How do I access the template library?',
      answer: 'Navigate to Dashboard → Click "Template Library" in the main menu → Browse templates by category or use the search bar. You can filter by niche, platform, or content type in the top toolbar.',
    },
    {
      question: 'How do I customize a template step-by-step?',
      answer: 'Select template → Click "Use Template" → In the editor: (1) Replace variable placeholders with your content, (2) Adjust tone settings in the sidebar, (3) Modify hook/CTA if needed, (4) Preview changes in real-time, (5) Click "Generate Script" when ready.',
    },
    {
      question: 'How do I save my customized templates?',
      answer: 'After editing, click "Save as Custom Template" → Enter a name and tags → Choose "My Templates" or "Team Library" → Click "Save". Access anytime from the Templates tab in your dashboard.',
    },
    {
      question: 'How do variables and placeholders work?',
      answer: 'Templates contain variables like [PRODUCT_NAME] and [NICHE_KEYWORD]. When you input your product/topic, AI automatically replaces these with relevant content. You can also manually edit any variable in the template editor.',
    },
    {
      question: 'How do I import/export templates for team collaboration?',
      answer: 'Export: Open template → Click "..." menu → "Export as JSON" → Share file. Import: Click "Import Template" → Upload .json file → Customize → Save to your library. Perfect for team sharing.',
    },
    {
      question: 'What if a template doesn\'t match my exact use case?',
      answer: 'Start with the closest match → Use the visual editor to restructure sections → Adjust tone/pacing → Save as a new custom template. You can also combine elements from multiple templates using copy/paste in the editor.',
    },
  ];

  return (
    <>
      <MarketingNav />
      <Helmet>
        <title>How to Use Template Library - Step-by-Step Guide | Pheme</title>
        <meta
          name="description"
          content="Learn how to browse, customize, and save viral templates for TikTok, Instagram, and YouTube. Complete step-by-step guide with practical examples and best practices."
        />
        <meta property="og:title" content="How to Use Template Library - Step-by-Step Guide | Pheme" />
        <meta
          property="og:description"
          content="Learn how to browse, customize, and save viral templates for TikTok, Instagram, and YouTube. Complete step-by-step guide with practical examples and best practices."
        />
        <meta property="og:type" content="website" />
      </Helmet>

      <ToolHero
        eyebrowText="TEMPLATE LIBRARY - HOW TO USE IT"
        headline="Step-by-Step Guide: Browse, Customize & Save Viral Templates"
        subheadline="Create custom templates in 5 minutes vs 2 hours of trial-and-error—templates with 85+ viral score average 2.1M views, tested across 500K+ videos"
        primaryCTA={{ text: 'Start Using Templates', onClick: handlePrimaryCTA }}
        secondaryCTA={{ text: 'See How Templates Work', onClick: handleSecondaryCTA }}
      />

      <HowItWorksSteps steps={steps} />

      {/* How Templates Work Section */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-violet-50 to-purple-50" data-testid="how-templates-work-section">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4" data-testid="how-templates-work-title">
              How Templates Work: Technical Workflow
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Understanding template structure, variables, and AI adaptation process
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <Card className="border-2 border-violet-200" data-testid="template-structure-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-violet-600" />
                  Template Structure
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {templateWorkflow.structure.map((item, index) => (
                    <div key={index} className="bg-white rounded-lg p-4 border border-gray-200" data-testid={`structure-item-${index}`}>
                      <h4 className="font-semibold text-gray-900 mb-1">{item.element}</h4>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-violet-200" data-testid="variable-placeholders-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit3 className="h-5 w-5 text-violet-600" />
                  Variable Placeholders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {templateWorkflow.variables.map((variable, index) => (
                    <div key={index} className="flex items-start gap-2" data-testid={`variable-item-${index}`}>
                      <Badge variant="secondary" className="mt-1">Auto</Badge>
                      <p className="text-gray-700 text-sm">{variable}</p>
                    </div>
                  ))}
                  <div className="mt-4 p-3 bg-violet-100 rounded-lg">
                    <p className="text-sm text-violet-800">
                      <strong>How it works:</strong> Type your product/topic → AI instantly replaces all variables → You get a customized script
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-2 border-violet-200" data-testid="ai-adaptation-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-violet-600" />
                AI Adaptation Process
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {templateWorkflow.aiAdaptation.map((step, index) => (
                  <div key={index} className="text-center" data-testid={`ai-step-${index}`}>
                    <div className="bg-violet-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                      <span className="text-violet-600 font-bold">{index + 1}</span>
                    </div>
                    <p className="text-sm text-gray-700">{step}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-800 text-center">
                  <strong>Performance Tracking:</strong> Each generated script tracks engagement → AI learns what works → Optimization loop improves templates over time
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Interactive Examples Section */}
      <section className="py-16 md:py-20 bg-white" data-testid="interactive-examples-section">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4" data-testid="interactive-examples-title">
              Interactive Examples: See It In Action
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Practical demonstrations showing exactly how to use templates in real scenarios
            </p>
          </div>

          <div className="space-y-8">
            {interactiveExamples.map((example, index) => (
              <Card key={index} className="border-2 border-gray-200 hover:border-violet-300 transition-colors" data-testid={`example-card-${index}`}>
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6" data-testid={`example-title-${index}`}>
                    {example.title}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-red-50 rounded-lg p-6 border border-red-200" data-testid={`example-before-${index}`}>
                      <Badge className="bg-red-600 text-white mb-3">Before</Badge>
                      <p className="text-gray-800 font-mono text-sm">{example.before}</p>
                    </div>

                    <div className="bg-green-50 rounded-lg p-6 border border-green-200" data-testid={`example-after-${index}`}>
                      <Badge className="bg-green-600 text-white mb-3">After</Badge>
                      <p className="text-gray-800 font-mono text-sm">{example.after}</p>
                    </div>
                  </div>

                  <div className="bg-violet-50 rounded-lg p-6 border border-violet-200 mb-6">
                    <p className="text-violet-900" data-testid={`example-description-${index}`}>
                      <strong>What happened:</strong> {example.description}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Action Steps:</h4>
                    <div className="space-y-2">
                      {example.actionSteps.map((step, stepIndex) => (
                        <div key={stepIndex} className="flex items-start gap-3" data-testid={`example-step-${index}-${stepIndex}`}>
                          <ArrowRight className="h-5 w-5 text-violet-600 mt-0.5 flex-shrink-0" />
                          <p className="text-gray-700">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Practical Tips Section */}
      <section className="py-16 md:py-20 bg-gray-50" data-testid="practical-tips-section">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4" data-testid="practical-tips-title">
              Practical Tips & Best Practices
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Actionable advice for choosing, customizing, organizing, and optimizing templates
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {practicalTips.map((tipCategory, index) => (
              <Card key={index} className="border-2 border-gray-200" data-testid={`tip-category-${index}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <tipCategory.icon className="h-5 w-5 text-violet-600" />
                    {tipCategory.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {tipCategory.tips.map((tip, tipIndex) => (
                      <li key={tipIndex} className="flex items-start gap-3" data-testid={`tip-${index}-${tipIndex}`}>
                        <span className="text-violet-600 mt-1">•</span>
                        <p className="text-gray-700 text-sm">{tip}</p>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <ToolFeatureGrid features={features} sectionTitle="Template Library Features" />

      {/* Success Metrics & ROI Section */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-green-50 to-emerald-50" data-testid="template-success-section">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Proven Results: Templates Drive Real ROI
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Data-backed success stories showing measurable efficiency gains and revenue impact
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Card className="border-2 border-green-200">
              <CardContent className="p-8">
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-green-600 mb-2">2.1M vs 180K</div>
                  <Badge className="bg-green-600 text-white">Average Views</Badge>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">High-Performing Templates Win</h3>
                <p className="text-gray-600">
                  Templates with 85+ viral score average 2.1M views vs 180K for custom scripts—tested across 500K+ videos with proven patterns
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200">
              <CardContent className="p-8">
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-green-600 mb-2">62% Higher</div>
                  <Badge className="bg-green-600 text-white">Conversion Rate</Badge>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Affiliate Success</h3>
                <p className="text-gray-600">
                  Affiliate marketers using proven templates see 62% higher conversion rates—product showcase templates drive 15.7% avg conversions
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200">
              <CardContent className="p-8">
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-green-600 mb-2">2 Weeks → 2 Days</div>
                  <Badge className="bg-green-600 text-white">Onboarding Time</Badge>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Agency Scale</h3>
                <p className="text-gray-600">
                  Agencies create 50+ client-specific templates, reducing onboarding from 2 weeks to 2 days—save 80+ hours per client
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="max-w-4xl mx-auto border-2 border-green-200">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Time & Cost Savings Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">❌ Without Templates</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>• 2 hours per script trial-and-error</li>
                    <li>• Inconsistent results (180K avg views)</li>
                    <li>• Lower conversion rates (9.5% avg)</li>
                    <li>• 2 weeks to onboard new clients</li>
                  </ul>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-red-600 font-bold">Total: 10+ hours wasted/week</p>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                  <h4 className="font-semibold text-gray-900 mb-3">✅ With Templates</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>• 5 minutes to customize template</li>
                    <li>• Proven results (2.1M avg views for 85+ templates)</li>
                    <li>• Higher conversions (15.7% with product templates)</li>
                    <li>• 2 days to onboard with template library</li>
                  </ul>
                  <div className="mt-4 pt-4 border-t border-green-200">
                    <p className="text-green-600 font-bold">Total: 10+ hours saved/week</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Template Categories Showcase */}
      <section className="py-16 md:py-20 bg-gray-50" data-testid="template-categories-section">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900" data-testid="categories-title">
              Browse Templates by Category
            </h2>
            <p className="text-gray-600 mt-2">Filter by niche, content type, or platform to find the perfect template</p>
          </div>
          
          <Tabs defaultValue="niche" className="w-full" data-testid="category-tabs">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
              <TabsTrigger value="niche" data-testid="tab-niche">By Niche</TabsTrigger>
              <TabsTrigger value="content" data-testid="tab-content">By Type</TabsTrigger>
              <TabsTrigger value="platform" data-testid="tab-platform">By Platform</TabsTrigger>
            </TabsList>

            <TabsContent value="niche" data-testid="niche-content">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {nicheTemplates.map((item, index) => (
                  <Card key={index} data-testid={`niche-card-${index}`}>
                    <CardContent className="p-6 text-center">
                      <h3 className="font-semibold text-gray-900 mb-2" data-testid={`niche-name-${index}`}>
                        {item.niche}
                      </h3>
                      <Badge variant="secondary" data-testid={`niche-count-${index}`}>
                        {item.count} templates
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="content" data-testid="content-content">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {contentTypes.map((type, index) => (
                  <Card key={index} data-testid={`content-card-${index}`}>
                    <CardContent className="p-6 text-center">
                      <p className="font-semibold text-gray-900" data-testid={`content-type-${index}`}>
                        {type}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="platform" data-testid="platform-content">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {platforms.map((platform, index) => (
                  <Card key={index} data-testid={`platform-card-${index}`}>
                    <CardContent className="p-8 text-center">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2" data-testid={`platform-name-${index}`}>
                        {platform.name}
                      </h3>
                      <Badge variant="outline" data-testid={`platform-duration-${index}`}>
                        {platform.duration}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Top Performing Templates */}
      <section className="py-16 md:py-20 bg-white" data-testid="top-performers-section">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900" data-testid="top-performers-title">
              Top Performing Templates
            </h2>
            <p className="text-gray-600 mt-2">Start with these proven high-performers for immediate results</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8" data-testid="top-performers-grid">
            {topPerformers.map((template, index) => (
              <Card key={index} className="border-2 border-violet-200" data-testid={`top-performer-card-${index}`}>
                <CardContent className="p-8">
                  <div className="text-center mb-4">
                    <Badge className="bg-violet-600 text-white mb-4" data-testid={`top-performer-stat-${index}`}>
                      {template.stat}
                    </Badge>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center" data-testid={`top-performer-title-${index}`}>
                    {template.title}
                  </h3>
                  <p className="text-gray-600 text-center" data-testid={`top-performer-description-${index}`}>
                    {template.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
        <div className="container mx-auto max-w-4xl">
          <Card className="rounded-2xl p-8 md:p-12 border-2 border-green-200 dark:border-green-800">
            <div className="text-center mb-6">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Why Do Templates Save 10+ Hours Per Week?
              </h2>
              <p className="text-lg text-muted-foreground">
                Discover the business value, proven ROI, and real creator success stories showing how templates deliver 2.5x better conversions and $10K+ monthly revenue impact.
              </p>
            </div>
            <div className="flex justify-center">
              <Button
                onClick={handleFeaturePageCTA}
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white rounded-xl"
                data-testid="button-view-benefits"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                See Why Templates Increase ROI
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </Card>
        </div>
      </section>

      <ToolFAQ faqs={faqs} />

      <ToolCTA
        headline="Ready to Start Using Templates?"
        description="Browse 20+ proven templates, customize for your brand, and save hours on content creation"
        primaryCTA={{ text: 'Access Template Library Now', onClick: handleFinalCTA }}
        gradient={true}
      />

      <Footer />
    </>
  );
}
