import { Helmet } from 'react-helmet';
import { useLocation } from 'wouter';
import { useCTATracking } from '@/hooks/use-cta-tracking';
import { MarketingNav } from '@/components/MarketingNav';
import Footer from '@/components/Footer';
import { ToolHero, HowItWorksSteps, ToolFeatureGrid, ToolFAQ, ToolCTA } from '@/components/tools';
import { FileText, BarChart3, Target, RefreshCw, Zap, BookOpen, Lightbulb, CheckCircle2, AlertCircle, ArrowRight, Link2, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function ViralScoreAnalyzerTool() {
  const [, setLocation] = useLocation();
  const { trackNavigateCTA } = useCTATracking();

  const handlePrimaryCTA = () => {
    trackNavigateCTA('viral-score-hero', '/generate-content');
    setLocation('/generate-content');
  };

  const handleSecondaryCTA = () => {
    const usageGuideSection = document.querySelector('[data-testid="usage-guide-section"]');
    usageGuideSection?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFinalCTA = () => {
    trackNavigateCTA('viral-score-final-cta', '/generate-content');
    setLocation('/generate-content');
  };

  const handleFeatureCTA = () => {
    trackNavigateCTA('viral-score-feature-link', '/features/viral-score');
    setLocation('/features/viral-score');
  };

  const steps = [
    {
      icon: FileText,
      title: 'Step 1: Generate or Input Your Script',
      description: 'Navigate to Script Generator or paste existing content into the text editor. The analyzer accepts scripts from any source - AI-generated, manually written, or imported from competitors.',
    },
    {
      icon: BarChart3,
      title: 'Step 2: View Your Initial Viral Score',
      description: 'Click "Analyze Score" to receive your 0-100 viral prediction. The interface displays your overall score plus individual scores for Hook (25%), Story Flow (25%), CTA (20%), Timing (15%), and Platform (15%).',
    },
    {
      icon: Lightbulb,
      title: 'Step 3: Review AI Suggestions',
      description: 'Scroll to the "AI Improvement Suggestions" panel below your score. Each suggestion is labeled by category (Hook, Story, CTA, etc.) with specific, actionable recommendations like "Strengthen opening hook with a question" or "Add urgency to CTA".',
    },
    {
      icon: Target,
      title: 'Step 4: Apply Improvements',
      description: 'Edit your script manually in the text editor, or click "Auto-Apply Suggestions" to regenerate with all AI feedback implemented. Watch your score update in real-time as you make changes.',
    },
    {
      icon: RefreshCw,
      title: 'Step 5: Iterate to Target Score',
      description: 'Repeat Steps 2-4 until you reach 80+ (excellent range). Each iteration improves your score - most creators reach 80+ within 2-3 optimization cycles. Track your progress with the score history chart.',
    },
  ];

  const features = [
    {
      icon: Target,
      title: '0-100 Viral Score',
      description: 'Precise performance prediction based on proven viral patterns',
    },
    {
      icon: Zap,
      title: 'Hook Strength Analysis',
      description: 'Evaluate first 3 seconds for scroll-stopping power',
    },
    {
      icon: BookOpen,
      title: 'Story Flow Evaluation',
      description: 'Assess narrative structure and pacing throughout',
    },
    {
      icon: Target,
      title: 'CTA Effectiveness Score',
      description: 'Measure call-to-action clarity and conversion potential',
    },
    {
      icon: Lightbulb,
      title: 'AI Improvement Tips',
      description: 'Get specific, actionable suggestions to boost score',
    },
    {
      icon: RefreshCw,
      title: 'Auto-Regeneration',
      description: 'One-click regeneration implementing AI feedback',
    },
  ];

  const scoreRanges = [
    {
      range: '0-59',
      label: 'Needs Work',
      color: 'bg-red-100 border-red-300',
      textColor: 'text-red-700',
      description: 'Script requires significant improvements. Focus on strengthening hook, clarifying story flow, and enhancing CTA.',
      priority: 'Fix hook first (25% weight) - strongest impact on overall score',
    },
    {
      range: '60-79',
      label: 'Good',
      color: 'bg-yellow-100 border-yellow-300',
      textColor: 'text-yellow-700',
      description: 'Script is solid but has room for optimization. Fine-tune specific components to push into excellent range.',
      priority: 'Optimize lowest-scoring component - check breakdown for weakest area',
    },
    {
      range: '80-100',
      label: 'Excellent',
      color: 'bg-green-100 border-green-300',
      textColor: 'text-green-700',
      description: 'Script is optimized for viral performance. Ready to post with high confidence of strong engagement.',
      priority: 'Optional: Platform-specific tweaks for maximum performance on each channel',
    },
  ];

  const optimizationExamples = [
    {
      title: 'Example 1: Low Score to Viral (45 → 87)',
      before: {
        score: 45,
        script: 'Check out this new skincare product. It works really well and has helped my skin a lot. You should try it.',
        issues: 'Weak hook (15/25), vague story (12/25), generic CTA (10/20)',
      },
      changes: [
        'Hook: Changed "Check out" to "POV: You discover the $8 serum dermatologists don\'t want you to know about"',
        'Story: Added specific results "cleared my cystic acne in 14 days" with before/after tease',
        'CTA: Changed to "Link in bio - but it keeps selling out, grab it NOW"',
      ],
      after: {
        score: 87,
        script: 'POV: You discover the $8 serum dermatologists don\'t want you to know about. Day 1: My skin was a disaster - cystic acne everywhere. Day 14: Completely clear. I\'m showing you the before/after you WON\'T believe. Link in bio - but it keeps selling out, grab it NOW.',
        improvement: 'Hook jumped to 23/25, story to 22/25, CTA to 18/20',
      },
    },
    {
      title: 'Example 2: Platform-Specific Optimization',
      script: 'Quick morning routine for busy moms: coffee, 5-minute workout, healthy breakfast prep in under 30 minutes total.',
      platforms: [
        {
          name: 'TikTok',
          score: 78,
          optimization: 'Shorten to 15s, open with "No time? No problem." hook, end with "Follow for more 5-min routines"',
          newScore: 88,
        },
        {
          name: 'Instagram Reels',
          score: 72,
          optimization: 'Extend to 45s with aesthetic B-roll, add "Save this!" CTA, include product links',
          newScore: 86,
        },
        {
          name: 'YouTube Shorts',
          score: 68,
          optimization: 'Add "Part 1 of 3" hook for series potential, include "Subscribe for Parts 2-3" CTA',
          newScore: 85,
        },
      ],
    },
    {
      title: 'Example 3: Hook Strengthening (Hook: 12 → 24)',
      before: 'Hey guys, today I want to show you my favorite recipe.',
      after: 'Stop scrolling. This 3-ingredient recipe broke the internet and you already have everything in your pantry.',
      impact: [
        'Hook score: 12 → 24 (doubled)',
        'Overall score: 63 → 81 (improved 18 points)',
        'Added urgency ("Stop scrolling"), curiosity ("broke the internet"), and accessibility ("already have everything")',
      ],
    },
  ];

  const troubleshootingGuide = [
    {
      issue: 'My score is stuck at 65',
      diagnosis: 'You\'re optimizing the wrong components. Check your breakdown - focus on the LOWEST scoring metric first.',
      solution: [
        'If Hook is lowest: Start with a question, shocking stat, or bold claim in first 3 seconds',
        'If Story Flow is lowest: Add clear beginning/middle/end structure, remove filler words',
        'If CTA is lowest: Make action specific and urgent ("Link in bio NOW" vs "check my bio")',
        'If Timing is lowest: Cut script to platform-optimal length (TikTok: 15-30s, IG: 30-60s)',
      ],
    },
    {
      issue: 'AI suggestions don\'t make sense',
      diagnosis: 'The AI detects issues but the suggestions seem generic or unclear.',
      solution: [
        'Look at the specific category: Hook suggestions focus on first 3 seconds only',
        'Cross-reference with examples: Compare your script to high-scoring examples in that category',
        'Use auto-regenerate: Let AI implement suggestions, then compare old vs new to understand changes',
        'Check platform context: Some suggestions are platform-specific (e.g., "add trending sound" for TikTok)',
      ],
    },
    {
      issue: 'Score differs between platforms',
      diagnosis: 'This is normal - each platform has different viral factors and optimal formats.',
      solution: [
        'TikTok: Prioritize 15-30s length, trending sounds, fast pacing, strong hook',
        'Instagram Reels: 30-60s works, aesthetic visuals, clear CTA, save-worthy content',
        'YouTube Shorts: 30-60s, series potential, subscribe-focused CTA, educational angle',
        'Create platform-specific versions: Use same core content, adjust length/CTA/pacing per platform',
      ],
    },
    {
      issue: 'Can\'t reach 80+ score',
      diagnosis: 'You need advanced optimization techniques beyond basic improvements.',
      solution: [
        'Pattern interrupt: Add unexpected element in first 3 seconds (visual surprise, controversial statement)',
        'Emotional arc: Map your script to emotion journey (curiosity → surprise → satisfaction)',
        'CTA stacking: Combine multiple CTAs ("Like + Follow + Link in bio for the product")',
        'Platform signals: Add "watch till end," "wait for it," "you won\'t believe" - these train the algorithm',
        'Test variations: Generate 3 versions with different hooks, compare scores, pick winner',
      ],
    },
  ];

  const faqs = [
    {
      question: 'How do I access the Viral Score Analyzer?',
      answer: 'Go to the Script Generator page, generate or paste a script, then click the "Analyze Viral Score" button. The score appears instantly with a detailed breakdown of all components.',
    },
    {
      question: 'What does each score component mean?',
      answer: 'Hook (25%): First 3 seconds\' stopping power. Story Flow (25%): Narrative structure and pacing. CTA (20%): Call-to-action clarity and urgency. Timing (15%): Length optimization for platform. Platform (15%): Platform-specific best practices.',
    },
    {
      question: 'How do I interpret the AI suggestions?',
      answer: 'Each suggestion is labeled by component (Hook, Story, CTA, etc.) and provides specific actions. For example: "Hook: Add a question in first 3 seconds" or "CTA: Include urgency word like NOW or TODAY." Apply them one-by-one or use auto-regenerate to implement all at once.',
    },
    {
      question: 'What\'s the fastest way to improve my score?',
      answer: 'Fix your lowest-scoring component first (check the breakdown). Hook improvements have the biggest impact (25% weight). Use the "Auto-Apply Suggestions" button to implement all AI recommendations in one click, then iterate.',
    },
    {
      question: 'How many iterations does it take to reach 80+?',
      answer: 'Most creators reach 80+ in 2-3 optimization cycles. Start with your initial score, apply AI suggestions, regenerate, and repeat. Track your progress with the score history chart to see improvement trends.',
    },
    {
      question: 'Can I save my optimization history?',
      answer: 'Yes! All score iterations are automatically saved in your Content History. You can revisit previous versions, compare scores, and see your improvement journey over time.',
    },
  ];

  return (
    <>
      <MarketingNav />
      <Helmet>
        <title>Viral Score Analyzer - Step-by-Step Usage Guide | Pheme</title>
        <meta
          name="description"
          content="Learn how to use the Viral Score Analyzer with step-by-step instructions, practical examples, and troubleshooting. Optimize your content from 45 to 87+ scores with AI-powered guidance."
        />
        <meta property="og:title" content="Viral Score Analyzer - Step-by-Step Usage Guide | Pheme" />
        <meta
          property="og:description"
          content="Learn how to use the Viral Score Analyzer with step-by-step instructions, practical examples, and troubleshooting. Optimize your content from 45 to 87+ scores with AI-powered guidance."
        />
        <meta property="og:type" content="website" />
      </Helmet>

      <ToolHero
        eyebrowText="VIRAL SCORE ANALYZER - HOW TO USE"
        headline="Master the Viral Score Analyzer: Step-by-Step Guide"
        subheadline="Learn exactly how to analyze, optimize, and iterate your scripts to achieve 80+ viral scores - with practical examples and troubleshooting for every scenario"
        primaryCTA={{ text: 'Start Scoring Content', onClick: handlePrimaryCTA }}
        secondaryCTA={{ text: 'See Step-by-Step Guide', onClick: handleSecondaryCTA }}
      />

      {/* Step-by-Step Usage Guide */}
      <section className="py-16 md:py-20 bg-white" data-testid="usage-guide-section">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Complete Usage Workflow
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Follow these 5 steps to optimize any script to 80+ viral score
            </p>
          </div>
          
          <div className="space-y-8">
            {steps.map((step, index) => (
              <Card key={index} className="border-2 border-violet-100 hover:border-violet-300 transition-colors">
                <CardContent className="p-8">
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 rounded-full bg-violet-100 flex items-center justify-center">
                        <step.icon className="h-7 w-7 text-violet-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        {step.title}
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 p-6 bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg border-2 border-violet-200">
            <div className="flex items-start gap-4">
              <TrendingUp className="h-6 w-6 text-violet-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Pro Tip: Optimization Workflow</h4>
                <p className="text-gray-700">
                  Most creators reach 80+ scores within 2-3 iterations. Start by fixing your lowest-scoring component (it has the biggest impact), use auto-regenerate to implement all suggestions at once, then repeat until you hit your target score.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Understanding Your Score - Expanded */}
      <section className="py-16 md:py-20 bg-gray-50" data-testid="score-breakdown-section">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900" data-testid="breakdown-title">
              Understanding Your Viral Score
            </h2>
            <p className="text-lg text-gray-600 mt-4" data-testid="breakdown-description">
              How to interpret your score and prioritize improvements
            </p>
          </div>

          {/* Score Component Breakdown */}
          <div className="mb-12">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">Score Breakdown Components</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border-violet-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-semibold text-gray-900">Hook Quality</h4>
                    <Badge className="bg-violet-600">25%</Badge>
                  </div>
                  <Progress value={100} className="h-2 mb-3" />
                  <p className="text-sm text-gray-600">First 3 seconds - scroll-stopping power and immediate engagement</p>
                </CardContent>
              </Card>

              <Card className="border-violet-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-semibold text-gray-900">Story Flow</h4>
                    <Badge className="bg-violet-600">25%</Badge>
                  </div>
                  <Progress value={100} className="h-2 mb-3" />
                  <p className="text-sm text-gray-600">Narrative structure, pacing, and viewer retention throughout</p>
                </CardContent>
              </Card>

              <Card className="border-violet-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-semibold text-gray-900">CTA Effectiveness</h4>
                    <Badge className="bg-violet-600">20%</Badge>
                  </div>
                  <Progress value={80} className="h-2 mb-3" />
                  <p className="text-sm text-gray-600">Call-to-action clarity, urgency, and conversion potential</p>
                </CardContent>
              </Card>

              <Card className="border-violet-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-semibold text-gray-900">Timing & Pacing</h4>
                    <Badge className="bg-violet-600">15%</Badge>
                  </div>
                  <Progress value={60} className="h-2 mb-3" />
                  <p className="text-sm text-gray-600">Script length and pacing optimized for platform algorithms</p>
                </CardContent>
              </Card>

              <Card className="border-violet-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-semibold text-gray-900">Platform Optimization</h4>
                    <Badge className="bg-violet-600">15%</Badge>
                  </div>
                  <Progress value={60} className="h-2 mb-3" />
                  <p className="text-sm text-gray-600">Platform-specific best practices and format alignment</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Score Range Meanings */}
          <div className="mb-12">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">What Each Score Range Means</h3>
            <div className="space-y-4">
              {scoreRanges.map((range, index) => (
                <Card key={index} className={`border-2 ${range.color}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className={`text-xl font-bold ${range.textColor} mb-1`}>
                          {range.range} - {range.label}
                        </h4>
                        <p className="text-gray-700 mb-3">{range.description}</p>
                        <div className="flex items-start gap-2">
                          <Target className="h-5 w-5 text-violet-600 flex-shrink-0 mt-0.5" />
                          <p className="text-sm font-medium text-gray-900">
                            <strong>Priority:</strong> {range.priority}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Platform-Specific Score Differences */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8 border-2 border-blue-200">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Platform-Specific Score Differences</h3>
            <p className="text-gray-700 mb-6">
              The same script can score differently on each platform due to unique algorithm preferences and audience behaviors:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-2">TikTok Prioritizes</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                    15-30s optimal length
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                    Fast-paced editing
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                    Strong opening hook
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-2">Instagram Reels Prioritizes</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                    30-60s aesthetic content
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                    Save-worthy value
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                    Clear product CTAs
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-2">YouTube Shorts Prioritizes</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                    30-60s educational angle
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                    Series potential
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                    Subscribe-focused CTA
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Practical Optimization Examples */}
      <section className="py-16 md:py-20 bg-white" data-testid="practical-examples-section">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Real Optimization Workflows
            </h2>
            <p className="text-lg text-gray-600 mt-4">
              See exactly how to transform low-scoring scripts into viral content
            </p>
          </div>

          <div className="space-y-12">
            {/* Example 1: Low to Viral */}
            <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardContent className="p-8 md:p-10">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  {optimizationExamples[0].title}
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
                  <div className="bg-white rounded-lg p-6 border-2 border-red-200">
                    <div className="flex items-center gap-2 mb-4">
                      <Badge className="bg-red-600">Before: {optimizationExamples[0].before.score}/100</Badge>
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    </div>
                    <p className="text-gray-800 italic mb-4">"{optimizationExamples[0].before.script}"</p>
                    <p className="text-sm text-red-700 font-medium">{optimizationExamples[0].before.issues}</p>
                  </div>

                  <div className="bg-white rounded-lg p-6 border-2 border-green-200">
                    <div className="flex items-center gap-2 mb-4">
                      <Badge className="bg-green-600">After: {optimizationExamples[0].after.score}/100</Badge>
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                    <p className="text-gray-800 italic mb-4">"{optimizationExamples[0].after.script}"</p>
                    <p className="text-sm text-green-700 font-medium">{optimizationExamples[0].after.improvement}</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <ArrowRight className="h-5 w-5 text-violet-600" />
                    Exact Changes Made:
                  </h4>
                  <ul className="space-y-2">
                    {optimizationExamples[0].changes.map((change, i) => (
                      <li key={i} className="text-gray-700 flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        {change}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Example 2: Platform-Specific */}
            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-sky-50">
              <CardContent className="p-8 md:p-10">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {optimizationExamples[1].title}
                </h3>
                <p className="text-gray-700 italic mb-6">
                  Base Script: "{optimizationExamples[1].script}"
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {optimizationExamples[1].platforms.map((platform, i) => (
                    <div key={i} className="bg-white rounded-lg p-6 border-2 border-blue-200">
                      <h4 className="font-semibold text-gray-900 mb-3">{platform.name}</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Original:</span>
                          <Badge variant="outline">{platform.score}/100</Badge>
                        </div>
                        <p className="text-sm text-gray-700">{platform.optimization}</p>
                        <div className="flex items-center justify-between pt-2 border-t">
                          <span className="text-sm font-medium text-gray-900">Optimized:</span>
                          <Badge className="bg-green-600">{platform.newScore}/100</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Example 3: Hook Strengthening */}
            <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-violet-50">
              <CardContent className="p-8 md:p-10">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  {optimizationExamples[2].title}
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <div className="bg-white rounded-lg p-6">
                    <Badge className="bg-red-600 mb-3">Weak Hook: 12/25</Badge>
                    <p className="text-gray-800 italic">"{optimizationExamples[2].before}"</p>
                  </div>

                  <div className="bg-white rounded-lg p-6">
                    <Badge className="bg-green-600 mb-3">Strong Hook: 24/25</Badge>
                    <p className="text-gray-800 italic">"{optimizationExamples[2].after}"</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Impact Analysis:</h4>
                  <ul className="space-y-2">
                    {optimizationExamples[2].impact.map((item, i) => (
                      <li key={i} className="text-gray-700 flex items-start gap-2">
                        <TrendingUp className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Troubleshooting Guide */}
      <section className="py-16 md:py-20 bg-gray-50" data-testid="troubleshooting-section">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Troubleshooting Common Issues
            </h2>
            <p className="text-lg text-gray-600 mt-4">
              Get unstuck and optimize your content effectively
            </p>
          </div>

          <div className="space-y-6">
            {troubleshootingGuide.map((item, index) => (
              <Card key={index} className="border-2 border-orange-200 hover:border-orange-300 transition-colors">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4 mb-4">
                    <AlertCircle className="h-6 w-6 text-orange-600 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">"{item.issue}"</h3>
                      <p className="text-gray-700 mb-4">
                        <strong>Diagnosis:</strong> {item.diagnosis}
                      </p>
                      <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                        <h4 className="font-semibold text-gray-900 mb-3">Solution:</h4>
                        <ul className="space-y-2">
                          {item.solution.map((step, i) => (
                            <li key={i} className="text-gray-700 flex items-start gap-2">
                              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                              {step}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <ToolFeatureGrid features={features} sectionTitle="Viral Score Analysis Features" />

      {/* Cross-Link to Feature Page */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-violet-600 to-purple-700" data-testid="feature-crosslink-section">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Want to Know WHY Viral Score Works?
          </h2>
          <p className="text-xl text-violet-100 mb-8 max-w-2xl mx-auto">
            Discover the science, benefits, and success stories behind our viral score prediction system
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleFeatureCTA}
              size="lg"
              className="bg-white text-violet-600 hover:bg-gray-100"
              data-testid="feature-link-benefits"
            >
              Learn Why Viral Score Predicts Success
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              onClick={handleFeatureCTA}
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white/10"
              data-testid="feature-link-case-studies"
            >
              See Benefits & Case Studies
              <Link2 className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      <ToolFAQ faqs={faqs} />

      <ToolCTA
        headline="Start Optimizing Your Content Today"
        description="Follow the step-by-step guide to transform any script into viral content with 80+ scores"
        primaryCTA={{ text: 'Try Viral Score Analyzer Now', onClick: handleFinalCTA }}
        gradient={true}
      />

      <Footer />
    </>
  );
}
