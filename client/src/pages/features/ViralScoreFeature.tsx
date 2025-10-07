import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  FeatureHero,
  FeatureGrid,
  FAQAccordion,
} from "@/components/features";
import { useLocation } from "wouter";
import { useCTATracking } from "@/hooks/use-cta-tracking";
import { 
  Target, 
  Zap, 
  BarChart, 
  CheckCircle, 
  Clock, 
  Lightbulb,
  TrendingUp,
  AlertCircle,
  Award
} from "lucide-react";
import { useState } from "react";

export default function ViralScoreFeature() {
  const [_, navigate] = useLocation();
  const { trackNavigateCTA, trackSignupCTA } = useCTATracking();
  const [demoScore, setDemoScore] = useState(78);

  const features = [
    {
      icon: Target,
      title: "0-100 Viral Score",
      description: "Get a clear, actionable score predicting your content's viral potential before you post.",
    },
    {
      icon: Zap,
      title: "Hook Strength Analysis",
      description: "AI evaluates your opening 3 seconds to ensure maximum scroll-stopping power.",
    },
    {
      icon: BarChart,
      title: "Engagement Prediction",
      description: "Data-driven forecasts of expected views, likes, shares, and comments.",
    },
    {
      icon: CheckCircle,
      title: "Clarity Score",
      description: "Measures how easy your message is to understand—critical for retention and shares.",
    },
    {
      icon: Clock,
      title: "Timing Optimizer",
      description: "Analyzes pacing, transitions, and duration for optimal engagement throughout your video.",
    },
    {
      icon: Lightbulb,
      title: "Improvement Suggestions",
      description: "Get specific, actionable feedback on exactly what to change to boost your score.",
    },
  ];

  const scoreBreakdown = [
    { category: "Hook Quality", percentage: 25, description: "First 3 seconds engagement potential" },
    { category: "Story Flow", percentage: 25, description: "Narrative structure and pacing" },
    { category: "CTA Effectiveness", percentage: 20, description: "Call-to-action clarity and placement" },
    { category: "Timing & Pacing", percentage: 15, description: "Video length and transition timing" },
    { category: "Platform Optimization", percentage: 15, description: "Platform-specific best practices" },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "High Viral Potential";
    if (score >= 60) return "Good Potential";
    return "Needs Improvement";
  };

  const faqs = [
    {
      question: "How accurate is the Viral Score?",
      answer: "Our Viral Score is trained on millions of viral videos and has a proven correlation with actual performance. While no prediction is perfect, our AI accurately identifies key factors that drive engagement and virality.",
    },
    {
      question: "Can I improve my score after generating a script?",
      answer: "Absolutely! The score updates in real-time as you edit. Each change shows you exactly how it impacts your viral potential, so you can iterate until you hit your target score.",
    },
    {
      question: "What's a good Viral Score to aim for?",
      answer: "Scores above 70 indicate strong viral potential. Scores of 80+ are exceptional and have the highest likelihood of significant reach. However, even scores in the 60s can perform well with good execution.",
    },
    {
      question: "Does the score differ by platform?",
      answer: "Yes! Our AI adjusts scoring criteria based on your target platform. What works on TikTok may differ from Instagram Reels or YouTube Shorts, and the score reflects those nuances.",
    },
    {
      question: "What factors affect the Viral Score most?",
      answer: "Hook strength (first 3 seconds) has the biggest impact, followed by story flow and CTA effectiveness. A weak hook can sink even great content, while a strong hook significantly boosts viral potential.",
    },
    {
      question: "Can I see a breakdown of my score?",
      answer: "Yes! Click into any score to see a detailed breakdown across Hook Quality, Story Flow, CTA Effectiveness, Timing & Pacing, and Platform Optimization—each with specific improvement tips.",
    },
    {
      question: "Is Viral Score available for both studios?",
      answer: "Yes! Both Viral Studio and Affiliate Studio include Viral Score analysis. Affiliate content is scored on conversion potential and engagement, while viral content focuses purely on reach and shares.",
    },
  ];

  return (
    <>
      <Helmet>
        <title>AI Viral Score - Predict Content Performance | ScriptTok</title>
        <meta name="description" content="Know your content will perform before you post. AI-powered viral prediction scores with actionable feedback to maximize reach." />
        <meta property="og:title" content="AI Viral Score - Predict Content Performance | ScriptTok" />
        <meta property="og:description" content="Know your content will perform before you post. AI-powered viral prediction scores with actionable feedback to maximize reach." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://scripttok.com/features/viral-score" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AI Viral Score - Predict Content Performance | ScriptTok" />
        <meta name="twitter:description" content="Know your content will perform before you post. AI-powered viral prediction scores with actionable feedback to maximize reach." />
      </Helmet>
      
      <div className="min-h-screen">
        <FeatureHero
          title="Know Your Content Will Perform Before You Post"
          subtitle="AI-powered viral score predicts your content's performance with precision, giving you confidence and data-backed insights before you hit publish."
          primaryCTA={{
            text: "Score Your Content",
            onClick: () => {
              trackNavigateCTA("viral_score_hero", "score_content");
              navigate("/dashboard");
            },
          }}
          secondaryCTA={{
            text: "Learn The Algorithm",
            onClick: () => {
              trackNavigateCTA("viral_score_hero", "learn_algorithm");
              navigate("/how-it-works");
            },
          }}
        />

      <section className="py-16 px-4 bg-white dark:bg-gray-900">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Powerful Viral Scoring Features
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to predict and maximize your content's viral potential.
            </p>
          </div>
          <FeatureGrid features={features} />
        </div>
      </section>

      <section className="py-16 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How Viral Scoring Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Understand the science behind predicting viral content.
            </p>
          </div>

          <Tabs defaultValue="breakdown" className="w-full" data-testid="viral-scoring-tabs">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto md:h-10">
              <TabsTrigger value="breakdown" data-testid="tab-score-breakdown">
                Score Breakdown
              </TabsTrigger>
              <TabsTrigger value="improvement" data-testid="tab-improvement-process">
                Improvement Process
              </TabsTrigger>
              <TabsTrigger value="platforms" data-testid="tab-platform-differences">
                Platform Differences
              </TabsTrigger>
              <TabsTrigger value="success" data-testid="tab-success-stories">
                Success Stories
              </TabsTrigger>
            </TabsList>

            <TabsContent value="breakdown" className="mt-8" data-testid="breakdown-content">
              <Card className="rounded-2xl p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900 dark:to-purple-900 p-3 rounded-full">
                    <BarChart className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Score Breakdown Components</h3>
                    <p className="text-muted-foreground">
                      Your Viral Score is calculated from five key components, each weighted based on its impact on viral performance.
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  {scoreBreakdown.map((item, index) => (
                    <div key={index} className="border-l-4 border-violet-500 pl-4 py-2" data-testid={`breakdown-item-${index}`}>
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold">{item.category}</h4>
                        <Badge variant="secondary">{item.percentage}%</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="improvement" className="mt-8" data-testid="improvement-content">
              <Card className="rounded-2xl p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900 dark:to-purple-900 p-3 rounded-full">
                    <TrendingUp className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Iterative Improvement Process</h3>
                    <p className="text-muted-foreground">
                      Our AI provides real-time feedback as you edit, helping you optimize every element for maximum viral potential.
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold mb-1">Generate Initial Script</h4>
                      <p className="text-sm text-muted-foreground">Start with AI-generated content and receive your baseline Viral Score.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold mb-1">Review Suggestions</h4>
                      <p className="text-sm text-muted-foreground">AI highlights specific areas for improvement with actionable recommendations.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold mb-1">Edit & Optimize</h4>
                      <p className="text-sm text-muted-foreground">Make changes and watch your score update in real-time.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold mb-1">Achieve Target Score</h4>
                      <p className="text-sm text-muted-foreground">Iterate until you hit 70+ for high viral potential.</p>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="platforms" className="mt-8" data-testid="platforms-content">
              <Card className="rounded-2xl p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900 dark:to-purple-900 p-3 rounded-full">
                    <Target className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Platform-Specific Scoring</h3>
                    <p className="text-muted-foreground">
                      Each platform has unique algorithms and audience behaviors. Our scoring adapts accordingly.
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="border rounded-xl p-4">
                    <h4 className="font-semibold mb-2">TikTok</h4>
                    <p className="text-sm text-muted-foreground">Prioritizes hook strength, trending sounds, and watch-time retention. Quick pacing scores higher.</p>
                  </div>
                  <div className="border rounded-xl p-4">
                    <h4 className="font-semibold mb-2">Instagram Reels</h4>
                    <p className="text-sm text-muted-foreground">Values aesthetic appeal, hashtag strategy, and share potential. Visual hooks are weighted heavily.</p>
                  </div>
                  <div className="border rounded-xl p-4">
                    <h4 className="font-semibold mb-2">YouTube Shorts</h4>
                    <p className="text-sm text-muted-foreground">Emphasizes retention rate, subscriber conversion, and content depth. Longer retention = higher score.</p>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="success" className="mt-8" data-testid="success-content">
              <Card className="rounded-2xl p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900 dark:to-purple-900 p-3 rounded-full">
                    <Award className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Real Success Stories</h3>
                    <p className="text-muted-foreground">
                      See how creators use Viral Score to consistently produce high-performing content.
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">Beauty Creator</Badge>
                      <Badge className="bg-green-600">Score: 87</Badge>
                    </div>
                    <p className="text-sm mb-2">"I went from 50K to 500K followers in 3 months by only posting scripts with 80+ scores."</p>
                    <p className="text-xs text-muted-foreground">Result: 2.3M views average per video</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">Tech Reviewer</Badge>
                      <Badge className="bg-green-600">Score: 82</Badge>
                    </div>
                    <p className="text-sm mb-2">"The AI caught weak hooks I would have missed. Now I know before I film if it'll perform."</p>
                    <p className="text-xs text-muted-foreground">Result: 3x increase in engagement rate</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">Fitness Coach</Badge>
                      <Badge className="bg-green-600">Score: 91</Badge>
                    </div>
                    <p className="text-sm mb-2">"Every video above 85 has hit over 1M views. It's like having a crystal ball."</p>
                    <p className="text-xs text-muted-foreground">Result: 5 viral videos in a row (1M+ views each)</p>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <section className="py-16 px-4 bg-white dark:bg-gray-900">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Score Evaluation Framework
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Understand how each component contributes to your overall Viral Score.
            </p>
          </div>
          
          <Card className="rounded-2xl p-8 max-w-4xl mx-auto">
            <div className="space-y-6">
              {scoreBreakdown.map((item, index) => (
                <div key={index} data-testid={`framework-item-${index}`}>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-lg">{item.category}</h4>
                    <span className="text-2xl font-bold text-violet-600 dark:text-violet-400">{item.percentage}%</span>
                  </div>
                  <Progress value={item.percentage} className="h-3 mb-2" />
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      <section className="py-16 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Interactive Score Demo
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See how different elements affect your Viral Score.
            </p>
          </div>
          
          <Card className="rounded-2xl p-8 max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-block">
                <div className={`text-6xl font-bold mb-2 ${getScoreColor(demoScore)}`} data-testid="demo-score-value">
                  {demoScore}
                </div>
                <Badge variant="secondary" className="mb-4">{getScoreLabel(demoScore)}</Badge>
                <p className="text-sm text-muted-foreground">
                  Adjust the score to see different performance predictions
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Simulate Your Score</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={demoScore}
                  onChange={(e) => setDemoScore(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  data-testid="demo-score-slider"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>0</span>
                  <span>50</span>
                  <span>100</span>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 space-y-2">
                <h4 className="font-semibold mb-3">Predicted Performance:</h4>
                {demoScore >= 80 && (
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">High likelihood of viral success (100K+ views)</p>
                  </div>
                )}
                {demoScore >= 60 && demoScore < 80 && (
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">Good engagement potential (10K-100K views)</p>
                  </div>
                )}
                {demoScore < 60 && (
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">May need optimization before posting</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </section>

      <FAQAccordion faqs={faqs} className="bg-white dark:bg-gray-900" />

      <section className="bg-gradient-cta text-white py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Get Your Viral Score
          </h2>
          <p className="text-lg md:text-xl text-gray-200 mb-8">
            Stop guessing. Start knowing. Create content with confidence using AI-powered viral predictions.
          </p>
          <Button
            onClick={() => {
              trackSignupCTA("viral_score_cta");
              navigate("/dashboard");
            }}
            size="lg"
            className="bg-white text-purple-600 hover:bg-gray-100 rounded-xl"
            data-testid="button-viral-score-cta"
          >
            <Target className="mr-2 h-5 w-5" />
            Score Your Content Now
          </Button>
        </div>
      </section>
      </div>
    </>
  );
}
