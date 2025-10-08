import { Helmet } from 'react-helmet';
import { useLocation } from 'wouter';
import { useCTATracking } from '@/hooks/use-cta-tracking';
import { MarketingNav } from '@/components/MarketingNav';
import Footer from '@/components/Footer';
import { ToolHero, HowItWorksSteps, ToolFeatureGrid, ToolFAQ, ToolCTA } from '@/components/tools';
import { Filter, Eye, Edit3, Save, Zap, Hash, Layers, Globe, BarChart3, Settings, ArrowRight, CheckCircle, RefreshCw, AlertCircle, Sparkles, Clock, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TEMPLATE_METADATA, getViralTemplates, getTemplatesByMode } from '@shared/templateMetadata';

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
      description: 'Navigate to Template Library and find templates quickly using filters. Search by niche, platform, or content type to match your needs.',
    },
    {
      icon: Eye,
      title: 'Step 2: Preview Template Details',
      description: 'Click "Preview" to see the template structure, including hooks, story flow, and CTAs. Review the format before selecting.',
    },
    {
      icon: Edit3,
      title: 'Step 3: Customize for Your Brand',
      description: 'Customize templates with AI assistance - auto-populates variables, adjusts tone settings, and optimizes pacing for your selected platform.',
    },
    {
      icon: Save,
      title: 'Step 4: Save as Custom Template',
      description: 'Save unlimited custom templates for future use. Organize with tags and categories for easy access across your team.',
    },
    {
      icon: Zap,
      title: 'Step 5: Generate Content with Template',
      description: 'Generate scripts in seconds using your saved template structures. Maintain consistent quality across all your content.',
    },
  ];

  const features = [
    {
      icon: Hash,
      title: 'Niche-Specific Templates',
      description: 'Pre-built templates organized by niche including beauty, tech, fashion, fitness, and more. Each template follows tested content structures.',
    },
    {
      icon: Layers,
      title: 'Content Type Filtering',
      description: 'Find templates by mode - Viral or Affiliate - or browse all templates at once. Filter to match your content goals and product needs.',
    },
    {
      icon: Globe,
      title: 'Platform Optimization',
      description: 'Templates pre-configured for different platforms: TikTok (15-60s), Instagram Reels (15-90s), and YouTube Shorts with appropriate pacing for each.',
    },
    {
      icon: BarChart3,
      title: 'Structured Formats',
      description: 'Each template includes defined sections for hooks, story flow, and CTAs. See the complete structure before customizing.',
    },
    {
      icon: Edit3,
      title: 'Visual Editing Interface',
      description: 'Customize templates using a drag-and-drop editor with live preview. Edit any section and see changes in real-time.',
    },
    {
      icon: Save,
      title: 'Custom Template Library',
      description: 'Save unlimited custom templates for reuse. Share with your team, organize with tags, and maintain version control.',
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
        '1. Select "Influencer Caption" template from Affiliate mode',
        '2. Enter product: "CeraVe Moisturizer"',
        '3. Choose niche: "Beauty"',
        '4. Click "Generate" → AI customizes instantly',
      ],
    },
    {
      title: 'Example 2: Viral Script → Reusable Template',
      before: 'YOUR VIRAL SCRIPT: Specific story about iPhone 15 Pro review with detailed structure',
      after: 'SAVED TEMPLATE: "Tech Product Deep Dive" - reusable structure for any tech product review',
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
      before: 'TEAM MEMBER A creates "Fitness Transformation" template with tested hook',
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
        'Match template mode to your goal: Viral templates for content-first approach, Affiliate templates for product-focused content',
        'Review template structure: Check if the hook, flow, and CTA style align with your content strategy',
        'Consider platform: TikTok templates are punchier, YouTube Shorts allow more story depth',
        'Review example scripts: Make sure the tone matches your brand before customizing',
      ],
    },
    {
      category: 'Customization for Viral Potential',
      icon: Zap,
      tips: [
        'Keep the tested hook structure, only swap in your product/topic',
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
        '❌ Over-customizing: Don\'t change effective hook structures that work',
        '❌ Wrong platform: Don\'t use 90s Instagram template for 15s TikTok',
        '❌ Ignoring stats: Templates with low engagement need more editing, not just topic swap',
        '❌ Not saving variants: Always save customized versions as new templates for reuse',
      ],
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
        headline="Step-by-Step Guide: Browse, Customize & Save Templates"
        subheadline="Access pre-built templates with tested structures for hooks, story flow, and CTAs. Customize quickly with AI-powered variable replacement and save for future use."
        primaryCTA={{ text: 'Start Using Templates', onClick: handlePrimaryCTA }}
        secondaryCTA={{ text: 'See How Templates Work', onClick: handleSecondaryCTA }}
      />

      <HowItWorksSteps steps={steps} />

      {/* How Templates Work Section */}
      <section className="py-16 bg-gradient-to-br from-violet-50 to-purple-50" data-testid="how-templates-work-section">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-display-sm font-bold text-gray-900 mb-4" data-testid="how-templates-work-title">
              How Templates Work: Technical Workflow
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Understanding template structure, variables, and AI adaptation process
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <Card className="border-2 border-violet-200 shadow-card hover:shadow-card-hover hover-lift transition-all-smooth" data-testid="template-structure-card">
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

            <Card className="border-2 border-violet-200 shadow-card hover:shadow-card-hover hover-lift transition-all-smooth" data-testid="variable-placeholders-card">
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

          <Card className="border-2 border-violet-200 shadow-card hover:shadow-card-hover hover-lift transition-all-smooth" data-testid="ai-adaptation-card">
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
      <section className="py-16 bg-white" data-testid="interactive-examples-section">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-display-sm font-bold text-gray-900 mb-4" data-testid="interactive-examples-title">
              Interactive Examples: See It In Action
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Practical demonstrations showing exactly how to use templates in real scenarios
            </p>
          </div>

          <div className="space-y-8">
            {interactiveExamples.map((example, index) => (
              <Card key={index} className="border-2 border-gray-200 hover:border-violet-300 shadow-card hover:shadow-card-hover hover-lift transition-all-smooth" data-testid={`example-card-${index}`}>
                <CardContent className="p-8">
                  <h3 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-6" data-testid={`example-title-${index}`}>
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
      <section className="py-16 bg-gray-50" data-testid="practical-tips-section">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-display-sm font-bold text-gray-900 mb-4" data-testid="practical-tips-title">
              Practical Tips & Best Practices
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Actionable advice for choosing, customizing, organizing, and optimizing templates
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {practicalTips.map((tipCategory, index) => (
              <Card key={index} className="border-2 border-gray-200 shadow-card hover:shadow-card-hover hover-lift transition-all-smooth" data-testid={`tip-category-${index}`}>
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

      {/* Template Benefits Section */}
      <section className="py-16 bg-gradient-to-br from-green-50 to-emerald-50" data-testid="template-success-section">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-display-sm font-bold text-gray-900 mb-4">
              Why Use Templates?
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Templates help you create better content faster with tested structures and consistent quality
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Card className="border-2 border-green-200 shadow-card hover:shadow-card-hover hover-lift transition-all-smooth">
              <CardContent className="p-8">
                <div className="text-center mb-4">
                  <Sparkles className="h-12 w-12 text-green-600 mx-auto mb-2" />
                  <Badge className="bg-green-600 text-white">Structured Approach</Badge>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Effective Formats</h3>
                <p className="text-gray-600">
                  Templates follow content structures that have worked well, including hook patterns, story flows, and CTA placements
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200 shadow-card hover:shadow-card-hover hover-lift transition-all-smooth">
              <CardContent className="p-8">
                <div className="text-center mb-4">
                  <Clock className="h-12 w-12 text-green-600 mx-auto mb-2" />
                  <Badge className="bg-green-600 text-white">Time Savings</Badge>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Faster Creation</h3>
                <p className="text-gray-600">
                  Start with a complete structure instead of a blank page. Customize quickly with AI variable replacement
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200 shadow-card hover:shadow-card-hover hover-lift transition-all-smooth">
              <CardContent className="p-8">
                <div className="text-center mb-4">
                  <Target className="h-12 w-12 text-green-600 mx-auto mb-2" />
                  <Badge className="bg-green-600 text-white">Consistency</Badge>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Brand Voice</h3>
                <p className="text-gray-600">
                  Maintain consistent quality and tone across all content. Share templates with your team for unified messaging
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="max-w-4xl mx-auto border-2 border-green-200 shadow-card hover:shadow-card-hover transition-all-smooth">
            <CardContent className="p-8">
              <h3 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-6 text-center">Template Workflow Comparison</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">❌ Without Templates</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Start from scratch each time</li>
                    <li>• Inconsistent structure and quality</li>
                    <li>• Spend time planning hook/flow/CTA</li>
                    <li>• Team members create different styles</li>
                  </ul>
                </div>

                <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                  <h4 className="font-semibold text-gray-900 mb-3">✅ With Templates</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Start with tested structure</li>
                    <li>• Consistent format across content</li>
                    <li>• AI auto-fills variables quickly</li>
                    <li>• Team uses shared templates</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Actual Template Catalog */}
      <section className="py-16 bg-gray-50" data-testid="template-catalog-section">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-display-sm font-bold text-gray-900" data-testid="catalog-title">
              Complete Template Catalog (20 Templates)
            </h2>
            <p className="text-gray-600 mt-2">7 viral templates + 13 affiliate templates = complete content toolkit</p>
          </div>
          
          <Tabs defaultValue="viral" className="w-full" data-testid="template-mode-tabs">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="viral" data-testid="tab-viral">Viral Templates (7)</TabsTrigger>
              <TabsTrigger value="affiliate" data-testid="tab-affiliate">Affiliate Templates (13)</TabsTrigger>
            </TabsList>

            <TabsContent value="viral" data-testid="viral-templates-content">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getViralTemplates().map((template, index) => (
                  <Card key={template.id} className="border-2 border-blue-200 shadow-card hover:shadow-card-hover hover-lift transition-all-smooth" data-testid={`viral-template-${index}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3 mb-4">
                        <span className="text-3xl">{template.icon}</span>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 mb-1" data-testid={`viral-template-name-${index}`}>
                            {template.name}
                          </h3>
                          <Badge variant="secondary" className="text-xs" data-testid={`viral-template-length-${index}`}>
                            {template.estimatedLength}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3" data-testid={`viral-template-description-${index}`}>
                        {template.description}
                      </p>
                      <div className="space-y-2">
                        <div className="text-xs text-gray-500">
                          <strong>Use Case:</strong> {template.useCase}
                        </div>
                        <div className="text-xs text-gray-500">
                          <strong>Example:</strong> {template.example}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="affiliate" data-testid="affiliate-templates-content">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getTemplatesByMode('affiliate').map((template, index) => (
                  <Card key={template.id} className="border-2 border-violet-200 shadow-card hover:shadow-card-hover hover-lift transition-all-smooth" data-testid={`affiliate-template-${index}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3 mb-4">
                        <span className="text-3xl">{template.icon}</span>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 mb-1" data-testid={`affiliate-template-name-${index}`}>
                            {template.name}
                          </h3>
                          <Badge variant="secondary" className="text-xs" data-testid={`affiliate-template-length-${index}`}>
                            {template.estimatedLength}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3" data-testid={`affiliate-template-description-${index}`}>
                        {template.description}
                      </p>
                      <div className="space-y-2">
                        <div className="text-xs text-gray-500">
                          <strong>Use Case:</strong> {template.useCase}
                        </div>
                        <div className="text-xs text-gray-500">
                          <strong>Example:</strong> {template.example}
                        </div>
                        {template.platforms && template.platforms.length > 0 && (
                          <div className="flex gap-1 flex-wrap mt-2">
                            {template.platforms.map((platform, pIndex) => (
                              <Badge key={pIndex} variant="outline" className="text-xs">
                                {platform}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <section className="py-16 px-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
        <div className="container mx-auto max-w-4xl">
          <Card className="rounded-2xl p-8 md:p-12 border-2 border-green-200 dark:border-green-800 shadow-card hover:shadow-card-hover transition-all-smooth">
            <div className="text-center mb-6">
              <h2 className="text-3xl md:text-4xl lg:text-display-sm font-bold mb-4">
                Why Do Templates Streamline Content Creation?
              </h2>
              <p className="text-lg text-muted-foreground">
                Learn how templates provide professional structures, reduce creation time, and help you maintain consistency across all your content.
              </p>
            </div>
            <div className="flex justify-center">
              <Button
                onClick={handleFeaturePageCTA}
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white rounded-xl glow-purple-sm hover-lift"
                data-testid="button-view-benefits"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                See How Templates Work
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </Card>
        </div>
      </section>

      <ToolFAQ faqs={faqs} />

      <ToolCTA
        headline="Ready to Start Using Templates?"
        description="Browse 20+ templates, customize for your brand, and save hours on content creation"
        primaryCTA={{ text: 'Access Template Library Now', onClick: handleFinalCTA }}
        gradient={true}
      />

      <Footer />
    </>
  );
}
