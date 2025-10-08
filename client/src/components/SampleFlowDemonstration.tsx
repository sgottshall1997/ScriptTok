import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { 
  TrendingUp, 
  Search, 
  ShoppingBag, 
  Brain, 
  FileText, 
  Sparkles, 
  BarChart3, 
  Save, 
  GraduationCap,
  Check,
  ChevronRight,
  Play,
  RotateCcw,
  Flame,
  Eye,
  Star,
  Clock,
  ArrowRight,
  Zap
} from 'lucide-react';
import { useLocation } from 'wouter';
import { TEMPLATE_METADATA } from '@shared/templateMetadata';

interface Step {
  id: number;
  title: string;
  icon: any;
  color: string;
  bgColor: string;
}

const steps: Step[] = [
  { id: 1, title: 'Find Trend', icon: Search, color: 'text-purple-600 dark:text-purple-400', bgColor: 'bg-purple-100 dark:bg-purple-900' },
  { id: 2, title: 'Select Product', icon: ShoppingBag, color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-100 dark:bg-blue-900' },
  { id: 3, title: 'AI Intelligence', icon: Brain, color: 'text-purple-600 dark:text-purple-400', bgColor: 'bg-purple-100 dark:bg-purple-900' },
  { id: 4, title: 'Choose Template', icon: FileText, color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-100 dark:bg-green-900' },
  { id: 5, title: 'Generate Content', icon: Sparkles, color: 'text-purple-600 dark:text-purple-400', bgColor: 'bg-purple-100 dark:bg-purple-900' },
  { id: 6, title: 'Viral Score', icon: BarChart3, color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-100 dark:bg-green-900' },
  { id: 7, title: 'Save to History', icon: Save, color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-100 dark:bg-blue-900' },
  { id: 8, title: 'Smart Learning', icon: GraduationCap, color: 'text-purple-600 dark:text-purple-400', bgColor: 'bg-purple-100 dark:bg-purple-900' },
];

export default function SampleFlowDemonstration() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [_, navigate] = useLocation();

  useEffect(() => {
    if (!isAutoPlay) return;

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= 8) {
          setIsAutoPlay(false);
          return 8;
        }
        return prev + 1;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isAutoPlay]);

  const handleReplay = () => {
    setCurrentStep(1);
    setIsAutoPlay(true);
  };

  return (
    <div className="my-4 w-full max-w-6xl mx-auto">
      {/* Section Header */}
      <div className="text-center mb-4">
        <h3 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Pheme Sample Workflow
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-3">
          Watch how AI transforms trends into high-performing scripts with built-in virality analysis
        </p>
        
        {/* Auto-play controls */}
        <div className="flex items-center justify-center gap-4 mb-3">
          <Button
            onClick={() => setIsAutoPlay(!isAutoPlay)}
            variant={isAutoPlay ? "default" : "outline"}
            size="sm"
            data-testid="button-autoplay-toggle"
          >
            <Play className="w-4 h-4 mr-2" />
            {isAutoPlay ? 'Playing...' : 'Auto-Play Demo'}
          </Button>
          <Button
            onClick={handleReplay}
            variant="outline"
            size="sm"
            data-testid="button-replay-demo"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Replay
          </Button>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="mb-4">
        <div className="flex justify-between mb-2">
          {steps.map((step) => (
            <button
              key={step.id}
              onClick={() => setCurrentStep(step.id)}
              className={`flex flex-col items-center gap-1 transition-all ${
                currentStep >= step.id ? 'opacity-100' : 'opacity-40'
              }`}
              data-testid={`button-step-${step.id}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep === step.id 
                  ? `${step.bgColor} ${step.color} ring-4 ring-purple-200 dark:ring-purple-800` 
                  : currentStep > step.id 
                  ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
              }`}>
                {currentStep > step.id ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <step.icon className="w-5 h-5" />
                )}
              </div>
              <span className="text-xs hidden md:block">{step.title}</span>
            </button>
          ))}
        </div>
        <Progress value={(currentStep / 8) * 100} className="h-2" />
      </div>

      {/* Step Content */}
      <div className="min-h-[350px]">
        {currentStep === 1 && <Step1FindTrend navigate={navigate} />}
        {currentStep === 2 && <Step2SelectProduct />}
        {currentStep === 3 && <Step3AIIntelligence />}
        {currentStep === 4 && <Step4SelectTemplate navigate={navigate} />}
        {currentStep === 5 && <Step5GenerateContent />}
        {currentStep === 6 && <Step6ViralScore navigate={navigate} />}
        {currentStep === 7 && <Step7SaveHistory navigate={navigate} />}
        {currentStep === 8 && <Step8SmartLearning navigate={navigate} />}
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-center gap-4 mt-4">
        <Button
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
          variant="outline"
          data-testid="button-prev-step"
        >
          Previous
        </Button>
        <Button
          onClick={() => setCurrentStep(Math.min(8, currentStep + 1))}
          disabled={currentStep === 8}
          data-testid="button-next-step"
        >
          Next
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

function Step1FindTrend({ navigate }: { navigate: (path: string) => void }) {
  return (
    <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <CardContent className="p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
            <Search className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-2">Step 1: Discover Trending Topics</h3>
            <p className="text-gray-600 dark:text-gray-400">
              AI-powered trend discovery shows you what's viral right now
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className="font-semibold">Glass Skin Routine</span>
                <Badge className="bg-purple-600 hover:bg-purple-700 text-white">Beauty</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium">Trending</span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>2.4M views</span>
              </div>
              <div>Last 24h</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
              <div className="flex items-center justify-between">
                <span className="text-sm">Minimalist Fashion</span>
                <Badge variant="outline" className="text-xs">Fashion</Badge>
              </div>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
              <div className="flex items-center justify-between">
                <span className="text-sm">Home Workout Gear</span>
                <Badge variant="outline" className="text-xs">Fitness</Badge>
              </div>
            </div>
          </div>
        </div>

        <Button 
          className="w-full mt-6 bg-gradient-hero text-white hover:opacity-90"
          onClick={() => navigate('/trending-ai-picks')}
          data-testid="button-discover-trends"
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Discover More Trends
        </Button>
      </CardContent>
    </Card>
  );
}

function Step2SelectProduct() {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  const products = [
    { id: 1, name: 'CeraVe Moisturizing Cream', category: 'Beauty', mentions: '42,000', icon: '✨' },
    { id: 2, name: 'iPhone 15 Pro', category: 'Tech', mentions: '38,000', icon: '📱' },
    { id: 3, name: 'Nike Air Force 1', category: 'Fashion', mentions: '45,000', icon: '👟' },
  ];

  return (
    <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <CardContent className="p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
            <ShoppingBag className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-2">Step 2: Select Trending Product</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Choose from top trending products in your niche
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              onClick={() => setSelectedProduct(product.name)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-lg ${
                selectedProduct === product.name
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
              }`}
              data-testid={`product-card-${product.id}`}
            >
              <div className="text-3xl mb-2">{product.icon}</div>
              <h4 className="font-semibold mb-1">{product.name}</h4>
              <Badge variant="outline" className="mb-2">{product.category}</Badge>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Flame className="w-4 h-4 text-orange-500" />
                <span>{product.mentions} mentions</span>
              </div>
              {selectedProduct === product.name && (
                <div className="mt-3 flex items-center gap-2 text-blue-600 dark:text-blue-400">
                  <Check className="w-4 h-4" />
                  <span className="text-sm font-medium">Selected</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function Step3AIIntelligence() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <CardContent className="p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
            <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-2">Step 3: AI Trending Intelligence</h3>
            <p className="text-gray-600 dark:text-gray-400">
              AI analyzes viral patterns and trending data
            </p>
          </div>
          <Badge className="bg-purple-600 hover:bg-purple-700 text-white">Perplexity Intelligence</Badge>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
              <span className="text-gray-600">Analyzing trending patterns...</span>
            </div>
            <Progress value={66} className="h-2" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-2">
                <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h4 className="font-semibold">Viral Hook</h4>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                "POV: You discover the $12 moisturizer dermatologists don't want you to know about"
              </p>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-2">
                <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h4 className="font-semibold">Target Audience</h4>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Gen Z and millennials (18-34), skincare enthusiasts
              </p>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-2">
                <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h4 className="font-semibold">Trending Angle</h4>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Before/after transformation, dermatologist secrets
              </p>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-2">
                <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h4 className="font-semibold">Best Time to Post</h4>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Tuesday-Thursday 7-9 PM EST
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Step4SelectTemplate({ navigate }: { navigate: (path: string) => void }) {
  const [selectedTemplate, setSelectedTemplate] = useState('short_video');

  const templates = [
    TEMPLATE_METADATA.short_video,
    TEMPLATE_METADATA.product_comparison,
    TEMPLATE_METADATA.influencer_caption,
    TEMPLATE_METADATA.seo_blog,
  ];

  return (
    <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <CardContent className="p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
            <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-2">Step 4: Choose Content Template</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Select from proven viral templates
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {templates.map((template) => (
            <div
              key={template.id}
              onClick={() => setSelectedTemplate(template.id)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-lg ${
                selectedTemplate === template.id
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600'
              }`}
              data-testid={`template-card-${template.id}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{template.icon}</span>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">{template.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {template.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{template.estimatedLength}</Badge>
                    {selectedTemplate === template.id && template.id === 'short_video' && (
                      <Badge className="bg-green-600 hover:bg-green-700 text-white text-xs">Recommended</Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Button 
          className="w-full bg-green-600 hover:bg-green-700 text-white dark:bg-green-600 dark:hover:bg-green-700"
          onClick={() => navigate('/tools/template-library')}
          data-testid="button-browse-templates"
        >
          Browse All Templates
        </Button>
      </CardContent>
    </Card>
  );
}

function Step5GenerateContent() {
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsGenerating(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <CardContent className="p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
            <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-2">Step 5: GPT Generates Content</h3>
            <p className="text-gray-600 dark:text-gray-400">
              AI creates viral-optimized content with trending data
            </p>
          </div>
        </div>

        {isGenerating ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
              <span className="text-gray-600">Generating viral content...</span>
            </div>
            <div className="space-y-2">
              <div className="h-2 bg-purple-200 rounded animate-pulse"></div>
              <div className="h-2 bg-purple-200 rounded animate-pulse w-4/5"></div>
              <div className="h-2 bg-purple-200 rounded animate-pulse w-3/5"></div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border-2 border-purple-200">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <Badge className="bg-purple-600 hover:bg-purple-700 text-white">Generated Content</Badge>
              </div>
              <div className="space-y-2 text-gray-800 dark:text-gray-200">
                <p className="font-medium">POV: You discover the $12 moisturizer dermatologists don't want you to know about 🤫</p>
                <p>CeraVe just hit different! Been using it for 2 weeks and my skin is GLOWING ✨</p>
                <p>Perfect for anyone into glass skin routines - this is your sign to try it!</p>
                <p>Link in bio 🔗</p>
                <p className="text-purple-600 font-medium">#glassskin #skincare #cerave #dermatologistapproved</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <Check className="w-5 h-5" />
              <span className="font-medium">Content generated successfully!</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Step6ViralScore({ navigate }: { navigate: (path: string) => void }) {
  const score = 87;
  const breakdown = [
    { label: 'Hook Strength', score: 92, icon: Zap },
    { label: 'Engagement Potential', score: 85, icon: TrendingUp },
    { label: 'Clarity', score: 88, icon: Eye },
    { label: 'Length Optimization', score: 82, icon: FileText },
    { label: 'Trending Elements', score: 90, icon: Flame },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-600';
    if (score >= 60) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  return (
    <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <CardContent className="p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
            <BarChart3 className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-2">Step 6: AI Viral Score & Feedback</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Get instant virality prediction and improvement tips
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border-2 border-green-200">
            <div className="relative w-32 h-32 mb-4">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="none" className="text-gray-200" />
                <circle 
                  cx="64" 
                  cy="64" 
                  r="56" 
                  stroke="currentColor" 
                  strokeWidth="8" 
                  fill="none" 
                  className={getScoreBg(score)}
                  strokeDasharray={`${(score / 100) * 351.86} 351.86`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-4xl font-bold ${getScoreColor(score)}`}>{score}</span>
              </div>
            </div>
            <Badge className="bg-green-600 hover:bg-green-700 text-white">Excellent Viral Potential</Badge>
          </div>

          <div className="space-y-3">
            {breakdown.map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <item.icon className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${getScoreColor(item.score)}`}>{item.score}/100</span>
                  <Check className="w-4 h-4 text-green-600" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Brain className="w-4 h-4 text-blue-600" />
            AI Recommendations
          </h4>
          <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
            <li>• Add a question at the end to boost engagement</li>
            <li>• Consider mentioning the price point earlier</li>
            <li>• Tag @cerave for potential brand partnership</li>
          </ul>
        </div>

        <Button 
          className="w-full mt-4 bg-gradient-hero text-white hover:opacity-90"
          onClick={() => navigate('/tools/viral-score-analyzer')}
          data-testid="button-analyze-score"
        >
          Analyze Your Content Score
        </Button>
      </CardContent>
    </Card>
  );
}

function Step7SaveHistory({ navigate }: { navigate: (path: string) => void }) {
  const [isSaved, setIsSaved] = useState(false);
  const [rating, setRating] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setIsSaved(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <CardContent className="p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="bg-blue-100 p-3 rounded-lg">
            <Save className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-2">Step 7: Save to History</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Track all your content with ratings and AI feedback
            </p>
          </div>
        </div>

        {!isSaved ? (
          <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">Saving to history...</span>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border-2 border-blue-200 animate-in slide-in-from-right duration-500">
              <div className="flex items-center gap-2 mb-3">
                <Check className="w-5 h-5 text-green-600" />
                <Badge className="bg-blue-600 text-white">Saved Successfully</Badge>
              </div>
              
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">
                POV: You discover the $12 moisturizer dermatologists don't want you to know about...
              </p>

              <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">AI Score:</span>
                  <span className="ml-2 font-semibold text-green-600">87/100</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Template:</span>
                  <span className="ml-2 font-semibold">Short Video</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Product:</span>
                  <span className="ml-2 font-semibold">CeraVe</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Date:</span>
                  <span className="ml-2 font-semibold">Just now</span>
                </div>
              </div>

              <div className="border-t pt-3">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Rate this content:</p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="transition-transform hover:scale-110"
                      data-testid={`star-rating-${star}`}
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => navigate('/tools/history')}
              data-testid="button-view-history"
            >
              View Full History
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Step8SmartLearning({ navigate }: { navigate: (path: string) => void }) {
  const [isEnabled, setIsEnabled] = useState(false);

  return (
    <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <CardContent className="p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="bg-purple-100 p-3 rounded-lg">
            <GraduationCap className="w-6 h-6 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-2">Step 8: Smart Learning System</h3>
            <p className="text-gray-600 dark:text-gray-400">
              AI learns from your top-rated content to improve future outputs
            </p>
          </div>
          <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">Premium</Badge>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                <span className="font-semibold">Use Smart Style from Top-Rated Content 🧠</span>
              </div>
              <Switch
                checked={isEnabled}
                onCheckedChange={setIsEnabled}
                data-testid="switch-smart-learning"
              />
            </div>

            {isEnabled && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top duration-300">
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">Filter Active</Badge>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Your 5-Star Rated Scripts (12 found)
                  </p>
                </div>

                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="bg-purple-600 text-white text-xs">Pattern Analysis</Badge>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Your top hooks use POV format 80% of the time
                  </p>
                </div>

                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="bg-green-600 text-white text-xs">Structure Insight</Badge>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Hook → Problem → Solution scores highest
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white">
            <h4 className="font-semibold mb-2">Why Smart Learning?</h4>
            <ul className="space-y-1 text-sm">
              <li>• AI learns your unique voice and style</li>
              <li>• Automatically improves over time</li>
              <li>• Uses your best-performing content as templates</li>
              <li>• Saves hours of manual editing</li>
            </ul>
          </div>

          <Button 
            className="w-full bg-gradient-hero text-white hover:opacity-90"
            onClick={() => navigate('/account')}
            data-testid="button-enable-smart-learning"
          >
            <GraduationCap className="w-4 h-4 mr-2" />
            Enable Smart Learning (Premium)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
