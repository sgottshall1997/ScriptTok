import { Helmet } from 'react-helmet';
import { useLocation } from 'wouter';
import { useCTATracking } from '@/hooks/use-cta-tracking';
import { MarketingNav } from '@/components/MarketingNav';
import Footer from '@/components/Footer';
import { ToolHero, HowItWorksSteps, ToolFeatureGrid, ToolFAQ, ToolCTA } from '@/components/tools';
import { Save, Search, BarChart3, FileText, TrendingUp, Star, Download, FolderOpen, Filter, Copy, ArrowRight, Database, Tags, SlidersHorizontal, Sparkles, FileDown, BookTemplate } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function HistoryTool() {
  const [, setLocation] = useLocation();
  const { trackNavigateCTA } = useCTATracking();

  const handlePrimaryCTA = () => {
    trackNavigateCTA('history-hero', '/content-history');
    setLocation('/content-history');
  };

  const handleSecondaryCTA = () => {
    const workflowSection = document.querySelector('[data-testid="workflow-section"]');
    workflowSection?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFinalCTA = () => {
    trackNavigateCTA('history-final-cta', '/content-history');
    setLocation('/content-history');
  };

  const handleTemplateLibraryCTA = () => {
    trackNavigateCTA('history-to-template-library', '/tools/template-library');
    setLocation('/tools/template-library');
  };

  const handleScriptGeneratorCTA = () => {
    trackNavigateCTA('history-to-script-generator', '/tools/script-generator');
    setLocation('/tools/script-generator');
  };

  const steps = [
    {
      icon: FolderOpen,
      title: 'Step 1: Access Your Content History',
      description: 'Navigate to Dashboard → "Content History" tab. View all saved scripts, trends, and viral scores organized by date—search through 1000+ scripts instantly vs hours of manual file hunting',
    },
    {
      icon: Filter,
      title: 'Step 2: Filter and Search Content',
      description: 'Use advanced filters to find exact scripts in 30 seconds vs 2 hours of searching: date range, platform, niche, viral score (80+), or template type—save 15+ hours/month',
    },
    {
      icon: BarChart3,
      title: 'Step 3: Review Past Performance',
      description: 'Click any item to see full metrics: viral score breakdown, engagement predictions, audience data. Creators using insights see 3.2x higher engagement on new scripts',
    },
    {
      icon: Copy,
      title: 'Step 4: Reuse Successful Content',
      description: 'Click "Duplicate" on high-performers to recreate with new products. Creators who reuse top scripts produce content 45% faster with proven viral structures',
    },
    {
      icon: FileDown,
      title: 'Step 5: Export Content for Analysis',
      description: 'Export 30 days of content in 1 click vs 3 hours of manual compilation. Agencies save $800/month on reporting—CSV/JSON includes all metadata for client dashboards',
    },
  ];

  const features = [
    {
      icon: Database,
      title: 'Auto-Save All Content',
      description: 'Every script, trend, score automatically saved—search through 1000+ scripts in seconds vs 2 hours of manual file hunting',
    },
    {
      icon: Tags,
      title: 'Smart Organization',
      description: 'Tag content by performance, organize into folders—agencies manage 500+ client scripts with 90% faster retrieval',
    },
    {
      icon: SlidersHorizontal,
      title: 'Advanced Filtering',
      description: 'Multi-parameter search finds exact scripts in 30 seconds vs 2 hours of manual searching—save 15+ hours/month',
    },
    {
      icon: Star,
      title: 'Rating & Tagging',
      description: 'Rate scripts 1-5 stars, mark favorites—creators who track top performers produce 45% faster content',
    },
    {
      icon: BarChart3,
      title: 'Performance Insights',
      description: 'Analytics reveal winning patterns—creators using insights see 3.2x higher engagement on new scripts',
    },
    {
      icon: Download,
      title: 'Bulk Export Tools',
      description: 'Export 30 days of content in 1 click vs 3 hours of compilation—agencies save $800/month on reporting',
    },
  ];

  const workflowDemo = {
    scenario: 'Finding and Reusing Your Top-Performing Scripts',
    steps: [
      {
        step: '1. Access History',
        action: 'Dashboard → Content History tab',
        visual: 'Grid view showing all saved scripts with thumbnails'
      },
      {
        step: '2. Apply Filters',
        action: 'Set filters: "Last 30 days" + "Viral Score 85+" + "Beauty Niche"',
        visual: 'Results narrow to 8 high-performing beauty scripts'
      },
      {
        step: '3. Review Performance',
        action: 'Click top script to view full metrics and breakdown',
        visual: 'Detailed view: 92 viral score, trending hooks, audience data'
      },
      {
        step: '4. Duplicate Script',
        action: 'Click "Duplicate & Edit" → Update product name and CTA',
        visual: 'New script generated with viral structure, fresh content'
      },
      {
        step: '5. Export Winners',
        action: 'Select all 8 scripts → Export to CSV for client report',
        visual: 'CSV downloads with scores, dates, performance metrics'
      }
    ]
  };

  const trackingSystemInfo = [
    {
      title: 'What Data is Saved',
      items: [
        'Complete scripts with hooks, body, CTAs',
        'Viral scores and rating breakdowns',
        'Template, niche, platform, trend used',
        'Timestamps, user ratings, custom tags',
        'Performance predictions and audience data'
      ]
    },
    {
      title: 'How to Organize Content',
      items: [
        'Create custom folders by niche or campaign',
        'Add tags like "High Performer", "Client Approved"',
        'Star favorites for quick access',
        'Archive old content without deleting',
        'Bulk move items between categories'
      ]
    },
    {
      title: 'Search & Filter Capabilities',
      items: [
        'Text search across scripts and metadata',
        'Date range filters (custom or preset)',
        'Multi-select: niche + platform + score',
        'Sort by: date, score, rating, template',
        'Advanced queries: "Beauty scripts 90+ score last week"'
      ]
    },
    {
      title: 'Bulk Actions & Management',
      items: [
        'Select multiple items for batch operations',
        'Bulk export, delete, tag, or rate',
        'Duplicate multiple scripts at once',
        'Bulk archive low-performing content',
        'Mass update tags or categories'
      ]
    }
  ];

  const practicalExamples = [
    {
      title: 'Example 1: Finding Top Scripts from Last Month',
      workflow: [
        '→ Open Content History',
        '→ Set date filter: "Last 30 days"',
        '→ Sort by: "Viral Score (High to Low)"',
        '→ Review top 10 scripts',
        '→ Identify common hooks and structures'
      ],
      outcome: 'Discovered that "Before/After" hooks scored 15% higher in beauty niche'
    },
    {
      title: 'Example 2: Identifying Success Patterns (Niche Analysis)',
      workflow: [
        '→ Filter by niche: "Tech"',
        '→ Select scripts with 85+ viral score',
        '→ Export to CSV for spreadsheet analysis',
        '→ Compare hooks, CTAs, and templates used',
        '→ Create pattern report'
      ],
      outcome: 'Found that "Problem-Solution" template works best for tech product promos'
    },
    {
      title: 'Example 3: Recreating Viral Script for New Product',
      workflow: [
        '→ Search: "Skincare" + "90+ score"',
        '→ Find highest-performing script',
        '→ Click "Duplicate & Edit"',
        '→ Replace product name and features',
        '→ Keep viral hook structure intact',
        '→ Generate new script with AI'
      ],
      outcome: 'New script achieved 88 viral score using proven framework'
    },
    {
      title: 'Example 4: Exporting Monthly Content for Client Reporting',
      workflow: [
        '→ Set date range: "September 1-30"',
        '→ Select all generated scripts',
        '→ Click "Export" → Choose CSV',
        '→ CSV includes: dates, scores, niches, platforms',
        '→ Import to client dashboard or report'
      ],
      outcome: 'Delivered comprehensive monthly report showing 24 scripts, avg score 84'
    }
  ];

  const bestPractices = [
    {
      icon: Sparkles,
      title: 'Content Strategy Planning',
      tips: [
        'Review history weekly to identify trending patterns',
        'Track which niches perform best for your audience',
        'Plan next month\'s content based on top-performing templates',
        'Use seasonal trends from history to predict future wins'
      ]
    },
    {
      icon: TrendingUp,
      title: 'Audience Analysis',
      tips: [
        'Compare scripts that got same score but different niches',
        'Identify which hooks resonate most with your followers',
        'Track performance by platform (TikTok vs Instagram)',
        'Note which CTAs drive highest predicted engagement'
      ]
    },
    {
      icon: BookTemplate,
      title: 'Template Creation from Winners',
      tips: [
        'Find your top 5 scripts and extract common structures',
        'Create custom templates based on proven patterns',
        'Document successful hook formulas for reuse',
        'Build a "swipe file" of viral elements'
      ]
    },
    {
      icon: BarChart3,
      title: 'Performance Trend Analysis',
      tips: [
        'Track viral score trends over time (improving or declining?)',
        'Compare current month avg score to previous months',
        'Identify if certain templates are losing effectiveness',
        'A/B test: duplicate high-performers with slight variations'
      ]
    }
  ];

  const faqs = [
    {
      question: 'How do I access my content history?',
      answer: 'Go to your Dashboard and click the "Content History" tab. You\'ll see a grid view of all saved scripts with thumbnails, viral scores, and metadata. Use the search bar or filters at the top to narrow results.',
    },
    {
      question: 'How do I filter content by viral score?',
      answer: 'Click the "Filters" button → Select "Viral Score" → Choose your range (e.g., "80-100" for top performers). You can combine this with other filters like niche, platform, or date range for precise results.',
    },
    {
      question: 'Can I duplicate a successful script for a new product?',
      answer: 'Yes! Find the script in your history → Click "Duplicate & Edit" → The script opens in the editor where you can update product details, hooks, and CTAs while keeping the viral structure. Then regenerate with AI.',
    },
    {
      question: 'How do I export content for analysis or reporting?',
      answer: 'Select the items you want to export (or "Select All") → Click "Export" button → Choose CSV (for spreadsheets/reports) or JSON (for developers/advanced analysis). The export includes all metadata: scores, dates, templates, and performance data.',
    },
    {
      question: 'What\'s the best way to organize my history?',
      answer: 'Use a combination of: (1) Star your best performers for quick access, (2) Create tags like "Client Work", "Personal Brand", "High ROI", (3) Use folders to separate by campaign or niche, (4) Archive old content instead of deleting to keep history clean.',
    },
    {
      question: 'How can I identify patterns in my successful content?',
      answer: 'Filter for scripts with 85+ viral score → Export to CSV → Analyze in a spreadsheet: Look for common templates, recurring hooks, successful niches, and platform patterns. The analytics dashboard also shows automated insights like "Top Templates" and "Best Niches".',
    },
  ];

  return (
    <>
      <MarketingNav />
      <Helmet>
        <title>Content History - Step-by-Step Usage Guide | Pheme</title>
        <meta
          name="description"
          content="Learn how to access, filter, analyze, and reuse your content history. Step-by-step guide to finding top scripts, identifying patterns, exporting data, and maximizing your viral content strategy."
        />
        <meta property="og:title" content="Content History - Step-by-Step Usage Guide | Pheme" />
        <meta
          property="og:description"
          content="Learn how to access, filter, analyze, and reuse your content history. Step-by-step guide to finding top scripts, identifying patterns, exporting data, and maximizing your viral content strategy."
        />
        <meta property="og:type" content="website" />
      </Helmet>

      <ToolHero
        eyebrowText="CONTENT HISTORY - HOW TO USE IT"
        headline="Master Your Content Archive: Complete Usage Guide"
        subheadline="Find winning scripts in 30 seconds vs 2 hours of searching—creators using History save 15+ hours/month and increase views by 6x"
        primaryCTA={{ text: 'Access Your History', onClick: handlePrimaryCTA }}
        secondaryCTA={{ text: 'See Workflow Guide', onClick: handleSecondaryCTA }}
      />

      <HowItWorksSteps steps={steps} />

      {/* Complete Workflow Demo */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-violet-50 to-purple-50" data-testid="workflow-section">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4" data-testid="workflow-title">
              Complete Workflow: {workflowDemo.scenario}
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Follow this step-by-step workflow to find and reuse your best-performing scripts
            </p>
          </div>

          <Card className="max-w-5xl mx-auto border-2 border-violet-200">
            <CardContent className="p-8 md:p-12">
              <div className="space-y-6">
                {workflowDemo.steps.map((item, index) => (
                  <div key={index} className="bg-white rounded-lg p-6 border border-gray-200" data-testid={`workflow-step-${index}`}>
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-violet-600 text-white rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                          {item.step}
                        </h4>
                        <p className="text-violet-700 font-medium mb-2">
                          {item.action}
                        </p>
                        <p className="text-gray-600 text-sm">
                          ✅ {item.visual}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="text-center">
                  <Badge className="bg-green-600 text-white text-base px-6 py-2">
                    ✅ Result: Found winners, created new viral content, delivered client report—all in 10 minutes
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How History Tracking Works */}
      <section className="py-16 md:py-20 bg-white" data-testid="tracking-system-section">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4" data-testid="tracking-title">
              How History Tracking Works
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Understanding the system: what's saved, how to organize, and powerful tools at your disposal
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8" data-testid="tracking-grid">
            {trackingSystemInfo.map((section, index) => (
              <Card key={index} data-testid={`tracking-card-${index}`}>
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-violet-600 rounded-full"></div>
                    {section.title}
                  </h3>
                  <ul className="space-y-3">
                    {section.items.map((item, i) => (
                      <li key={i} className="text-gray-700 flex items-start gap-2">
                        <span className="text-violet-600 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <ToolFeatureGrid features={features} sectionTitle="Powerful History Management Features" />

      {/* Practical Examples */}
      <section className="py-16 md:py-20 bg-gray-50" data-testid="examples-section">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4" data-testid="examples-title">
              Practical Examples: Real Usage Scenarios
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              See exactly how to use history for common content creator tasks
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" data-testid="examples-grid">
            {practicalExamples.map((example, index) => (
              <Card key={index} className="border-2 border-gray-200" data-testid={`example-card-${index}`}>
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4" data-testid={`example-title-${index}`}>
                    {example.title}
                  </h3>
                  <div className="space-y-2 mb-6">
                    {example.workflow.map((step, i) => (
                      <p key={i} className="text-gray-700 font-medium" data-testid={`example-step-${index}-${i}`}>
                        {step}
                      </p>
                    ))}
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-800 font-semibold">
                      📊 Outcome: {example.outcome}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Best Practices */}
      <section className="py-16 md:py-20 bg-white" data-testid="best-practices-section">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4" data-testid="best-practices-title">
              Best Practices: Maximize Your History
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Actionable tips to turn your content archive into a strategic advantage
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8" data-testid="best-practices-grid">
            {bestPractices.map((practice, index) => (
              <Card key={index} data-testid={`practice-card-${index}`}>
                <CardContent className="p-8">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-violet-100 rounded-lg">
                      <practice.icon className="w-6 h-6 text-violet-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mt-2" data-testid={`practice-title-${index}`}>
                      {practice.title}
                    </h3>
                  </div>
                  <ul className="space-y-3">
                    {practice.tips.map((tip, i) => (
                      <li key={i} className="text-gray-700 flex items-start gap-2" data-testid={`practice-tip-${index}-${i}`}>
                        <span className="text-violet-600 font-bold mt-1">→</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Success Metrics & ROI Section */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-green-50 to-emerald-50" data-testid="success-metrics-section">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4" data-testid="success-metrics-title">
              Real Success Stories with Concrete Results
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Creators and agencies using Content History achieve measurable ROI and efficiency gains
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Card className="border-2 border-green-200" data-testid="success-story-1">
              <CardContent className="p-8">
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-green-600 mb-2">50K → 300K</div>
                  <Badge className="bg-green-600 text-white">Average Views Increased</Badge>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Beauty Creator Success</h3>
                <p className="text-gray-600">
                  Identified 5 viral patterns from history, replicated winning hooks—grew average views from 50K to 300K in 2 months
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200" data-testid="success-story-2">
              <CardContent className="p-8">
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-green-600 mb-2">$800/mo</div>
                  <Badge className="bg-green-600 text-white">Cost Savings</Badge>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Agency Efficiency</h3>
                <p className="text-gray-600">
                  Saves $800/month by analyzing past performance in History vs manual tracking—1-click reports replace 3-hour compilations
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200" data-testid="success-story-3">
              <CardContent className="p-8">
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-green-600 mb-2">45% Faster</div>
                  <Badge className="bg-green-600 text-white">Content Production</Badge>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Creator Workflow</h3>
                <p className="text-gray-600">
                  Creators who reuse top-performing scripts from History see 45% faster content creation—find winners in 30 seconds vs 2 hours
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="max-w-4xl mx-auto border-2 border-green-200">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Time Savings Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">❌ Without History Tool</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>• 2 hours searching through old files</li>
                    <li>• 3 hours compiling client reports manually</li>
                    <li>• No pattern identification = trial & error</li>
                    <li>• Lost scripts and viral frameworks</li>
                  </ul>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-red-600 font-bold">Total: 15+ hours wasted/month</p>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                  <h4 className="font-semibold text-gray-900 mb-3">✅ With History Tool</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>• 30 seconds to find any script with filters</li>
                    <li>• 1 click to export monthly reports</li>
                    <li>• AI insights reveal winning patterns</li>
                    <li>• All content auto-saved and searchable</li>
                  </ul>
                  <div className="mt-4 pt-4 border-t border-green-200">
                    <p className="text-green-600 font-bold">Total: 15+ hours saved/month</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Cross-Links to Related Tools */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-blue-50 to-indigo-50" data-testid="related-tools-section">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4" data-testid="related-tools-title">
              What's Next? Create More Viral Content
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Now that you know how to leverage your history, use these tools to create even more winning content
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="border-2 border-blue-200 hover:border-blue-400 transition-colors" data-testid="cta-template-library">
              <CardContent className="p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-4 bg-blue-100 rounded-lg">
                    <BookTemplate className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Create from Templates
                    </h3>
                    <p className="text-gray-600">
                      Use proven templates based on your successful patterns
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={handleTemplateLibraryCTA}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  data-testid="btn-template-library"
                >
                  Browse Template Library <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200 hover:border-purple-400 transition-colors" data-testid="cta-script-generator">
              <CardContent className="p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-4 bg-purple-100 rounded-lg">
                    <Sparkles className="w-8 h-8 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Generate New Scripts
                    </h3>
                    <p className="text-gray-600">
                      Create fresh viral content with AI-powered insights
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={handleScriptGeneratorCTA}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  data-testid="btn-script-generator"
                >
                  Start Generating Scripts <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <ToolFAQ faqs={faqs} />

      <ToolCTA
        headline="Start Using Your Content History Today"
        description="Access your archive, find winners, identify patterns, and create more viral content"
        primaryCTA={{ text: 'Open Content History', onClick: handleFinalCTA }}
        gradient={true}
      />

      <Footer />
    </>
  );
}
