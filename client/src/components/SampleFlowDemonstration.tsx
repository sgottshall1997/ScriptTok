import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  Zap,
  Info
} from 'lucide-react';
import { TEMPLATE_METADATA } from '@shared/templateMetadata';
import { staggerChildren, scaleIn } from '@/lib/animations';

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
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (!isAutoPlay || isHovering) return;

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= 8) {
          setIsAutoPlay(false);
          return 8;
        }
        return prev + 1;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlay, isHovering]);

  const handleReplay = () => {
    setCurrentStep(1);
    setIsAutoPlay(true);
  };

  return (
    <div className="my-8 w-full max-w-6xl mx-auto">
      <div className="text-center mb-6">
        <motion.h3 
          className="text-2xl md:text-3xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Pheme Sample Workflow
        </motion.h3>
        <motion.p 
          className="text-gray-600 dark:text-gray-400 mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Watch how AI transforms trends into high-performing scripts with built-in virality analysis
        </motion.p>
        
        <motion.div 
          className="flex items-center justify-center gap-4 mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
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
        </motion.div>

        {/* Demo Preview Badge */}
        <motion.div
          className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Info className="w-4 h-4" />
          <span>Demo Preview - Buttons Not Active</span>
        </motion.div>
      </div>

      <div className="mb-6 relative">
        <svg className="absolute top-5 left-0 w-full h-10 pointer-events-none z-0" viewBox="0 0 800 40" preserveAspectRatio="none">
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#9333ea" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>
          </defs>
          <path
            d={`M ${800 / 16} 20 ${Array.from({ length: 7 }, (_, i) => 
              `L ${((i + 1) * (800 / 8)) + 800 / 16} 20`
            ).join(' ')}`}
            stroke="#e5e7eb"
            strokeWidth="3"
            fill="none"
            className="dark:stroke-gray-700"
          />
          <motion.path
            d={`M ${800 / 16} 20 ${Array.from({ length: 7 }, (_, i) => 
              `L ${((i + 1) * (800 / 8)) + 800 / 16} 20`
            ).join(' ')}`}
            stroke="url(#progressGradient)"
            strokeWidth="3"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: currentStep / 8 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            style={{ 
              filter: 'drop-shadow(0 0 6px rgba(147, 51, 234, 0.5))',
            }}
          />
        </svg>

        <motion.div 
          className="flex justify-between relative z-10"
          variants={staggerChildren}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {steps.map((step) => (
            <motion.button
              key={step.id}
              onClick={() => setCurrentStep(step.id)}
              variants={scaleIn}
              whileHover={{ scale: 1.1 }}
              className={`flex flex-col items-center gap-1 transition-all ${
                currentStep >= step.id ? 'opacity-100' : 'opacity-40'
              }`}
              data-testid={`button-step-${step.id}`}
            >
              <motion.div 
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep === step.id 
                    ? `${step.bgColor} ${step.color} ring-4 ring-purple-200 dark:ring-purple-800` 
                    : currentStep > step.id 
                    ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                }`}
                animate={currentStep === step.id ? {
                  scale: [1, 1.1, 1],
                  boxShadow: [
                    '0 0 0 0 rgba(147, 51, 234, 0)',
                    '0 0 20px 5px rgba(147, 51, 234, 0.3)',
                    '0 0 0 0 rgba(147, 51, 234, 0)',
                  ],
                } : {}}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                {currentStep > step.id ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <step.icon className="w-5 h-5" />
                )}
              </motion.div>
              <span className="text-xs hidden md:block">{step.title}</span>
            </motion.button>
          ))}
        </motion.div>
        <Progress value={(currentStep / 8) * 100} className="h-2 mt-3" />
      </div>

      <div 
        className="min-h-[400px]"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep === 1 && <Step1FindTrend />}
            {currentStep === 2 && <Step2SelectProduct />}
            {currentStep === 3 && <Step3AIIntelligence />}
            {currentStep === 4 && <Step4SelectTemplate />}
            {currentStep === 5 && <Step5GenerateContent />}
            {currentStep === 6 && <Step6ViralScore />}
            {currentStep === 7 && <Step7SaveHistory />}
            {currentStep === 8 && <Step8SmartLearning />}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
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
        <Button
          disabled
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white opacity-60 cursor-not-allowed"
          data-testid="button-try-now"
        >
          <Zap className="w-4 h-4 mr-2" />
          Try It Now - Generate Your First Script
        </Button>
      </div>
    </div>
  );
}

function Step1FindTrend() {
  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] border-2 border-transparent hover:border-purple-200 dark:hover:border-purple-800">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-2xl pointer-events-none" />
        <CardContent className="p-6 relative">
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
            className="w-full mt-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white opacity-60 cursor-not-allowed"
            disabled
            data-testid="button-discover-trends"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Discover More Trends
          </Button>
        </CardContent>
      </Card>
    </motion.div>
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
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-800">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl pointer-events-none" />
        <CardContent className="p-6 relative">
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
              <motion.div
                key={product.id}
                onClick={() => setSelectedProduct(product.name)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedProduct === product.name
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                }`}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.98 }}
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
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function Step3AIIntelligence() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] border-2 border-transparent hover:border-purple-200 dark:hover:border-purple-800">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-2xl pointer-events-none" />
        <CardContent className="p-6 relative">
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
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              variants={staggerChildren}
              initial="hidden"
              animate="visible"
            >
              <motion.div 
                className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800"
                variants={scaleIn}
                whileHover={{ scale: 1.02, y: -2 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <h4 className="font-semibold">Viral Hook</h4>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  "POV: You discover the $12 moisturizer dermatologists don't want you to know about"
                </p>
              </motion.div>

              <motion.div 
                className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800"
                variants={scaleIn}
                whileHover={{ scale: 1.02, y: -2 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <h4 className="font-semibold">Target Audience</h4>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Gen Z and millennials (18-34), skincare enthusiasts
                </p>
              </motion.div>

              <motion.div 
                className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800"
                variants={scaleIn}
                whileHover={{ scale: 1.02, y: -2 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <h4 className="font-semibold">Trending Angle</h4>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Before/after transformation, dermatologist secrets
                </p>
              </motion.div>

              <motion.div 
                className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800"
                variants={scaleIn}
                whileHover={{ scale: 1.02, y: -2 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <h4 className="font-semibold">Best Time to Post</h4>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Tuesday-Thursday 7-9 PM EST
                </p>
              </motion.div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function Step4SelectTemplate() {
  const [selectedTemplate, setSelectedTemplate] = useState('short_video');

  const templates = [
    TEMPLATE_METADATA.short_video,
    TEMPLATE_METADATA.product_comparison,
    TEMPLATE_METADATA.influencer_caption,
    TEMPLATE_METADATA.seo_blog,
  ];

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] border-2 border-transparent hover:border-green-200 dark:hover:border-green-800">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-blue-500/5 rounded-2xl pointer-events-none" />
        <CardContent className="p-6 relative">
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2">Step 4: Choose Content Template</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Select from proven viral templates optimized for maximum engagement
              </p>
            </div>
          </div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            variants={staggerChildren}
            initial="hidden"
            animate="visible"
          >
            {templates.map((template) => (
              <motion.div
                key={template.id}
                onClick={() => setSelectedTemplate(template.id)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedTemplate === template.id
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600'
                }`}
                variants={scaleIn}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.98 }}
                data-testid={`template-card-${template.id}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-2xl">{template.icon}</div>
                  <h4 className="font-semibold">{template.name}</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {template.description}
                </p>
                {selectedTemplate === template.id && (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <Check className="w-4 h-4" />
                    <span className="text-sm font-medium">Selected</span>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>

          <Button 
            className="w-full mt-6 bg-gradient-to-r from-green-600 to-blue-600 text-white opacity-60 cursor-not-allowed"
            disabled
            data-testid="button-view-templates"
          >
            <FileText className="w-4 h-4 mr-2" />
            View All Templates
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function Step5GenerateContent() {
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsGenerating(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] border-2 border-transparent hover:border-purple-200 dark:hover:border-purple-800">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-2xl pointer-events-none" />
        <CardContent className="p-6 relative">
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
              <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2">Step 5: Generate Viral Content</h3>
              <p className="text-gray-600 dark:text-gray-400">
                AI creates optimized content with viral hooks and engagement triggers
              </p>
            </div>
          </div>

          {isGenerating ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                <span className="text-gray-600">Generating viral content...</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  Generated Script
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  "POV: You discover the $12 moisturizer that dermatologists don't want you to know about 🤫
                  <br/><br/>
                  This CeraVe cream literally changed my skin in 7 days. Here's the secret...
                  <br/><br/>
                  [Hook] Did you know most expensive moisturizers use the SAME ingredients as this drugstore gem? 
                  <br/><br/>
                  Link in bio 👆 #glowingskin #skincareroutine"
                </p>
              </div>
              <div className="flex gap-2">
                <Badge className="bg-purple-600 text-white">Viral Hook ✓</Badge>
                <Badge className="bg-green-600 text-white">Engagement Optimized ✓</Badge>
                <Badge className="bg-blue-600 text-white">Trending Format ✓</Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function Step6ViralScore() {
  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] border-2 border-transparent hover:border-green-200 dark:hover:border-green-800">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-blue-500/5 rounded-2xl pointer-events-none" />
        <CardContent className="p-6 relative">
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
              <BarChart3 className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2">Step 6: AI Viral Score Analysis</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Get instant feedback on viral potential and engagement metrics
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-center p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg">
              <motion.div 
                className="text-6xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
              >
                92
              </motion.div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Viral Score</p>
            </div>

            <motion.div 
              className="grid grid-cols-2 gap-3"
              variants={staggerChildren}
              initial="hidden"
              animate="visible"
            >
              <motion.div 
                className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                variants={scaleIn}
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-2xl font-bold text-green-600">95%</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Hook Strength</div>
              </motion.div>
              <motion.div 
                className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                variants={scaleIn}
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-2xl font-bold text-blue-600">88%</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Trend Alignment</div>
              </motion.div>
              <motion.div 
                className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                variants={scaleIn}
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-2xl font-bold text-purple-600">91%</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Engagement Rate</div>
              </motion.div>
              <motion.div 
                className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                variants={scaleIn}
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-2xl font-bold text-orange-600">2.1M</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Est. Reach</div>
              </motion.div>
            </motion.div>
          </div>

          <Button 
            className="w-full mt-6 bg-gradient-to-r from-green-600 to-blue-600 text-white opacity-60 cursor-not-allowed"
            disabled
            data-testid="button-analyze-score"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Analyze Your Content
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function Step7SaveHistory() {
  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-800">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl pointer-events-none" />
        <CardContent className="p-6 relative">
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
              <Save className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2">Step 7: Save to Content Library</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Organize and access all your viral content in one place
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-600" />
                <div>
                  <div className="font-semibold">Content Saved Successfully</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">CeraVe Glass Skin Script</div>
                </div>
              </div>
              <Badge className="bg-blue-600 text-white">Score: 92</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-sm font-medium mb-1">Total Saved</div>
                <div className="text-2xl font-bold">47</div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-sm font-medium mb-1">Avg. Score</div>
                <div className="text-2xl font-bold">89</div>
              </div>
            </div>
          </div>

          <Button 
            className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white opacity-60 cursor-not-allowed"
            disabled
            data-testid="button-view-history"
          >
            <Save className="w-4 h-4 mr-2" />
            View Content Library
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function Step8SmartLearning() {
  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] border-2 border-transparent hover:border-purple-200 dark:hover:border-purple-800">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-2xl pointer-events-none" />
        <CardContent className="p-6 relative">
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
              <GraduationCap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2">Step 8: AI Smart Learning</h3>
              <p className="text-gray-600 dark:text-gray-400">
                AI learns from your best content to improve future generations
              </p>
            </div>
          </div>

          <motion.div 
            className="space-y-3"
            variants={staggerChildren}
            initial="hidden"
            animate="visible"
          >
            <motion.div 
              className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800"
              variants={scaleIn}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Check className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold">Pattern Learned</h4>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                "POV" hooks generate 45% more engagement for beauty content
              </p>
            </motion.div>

            <motion.div 
              className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800"
              variants={scaleIn}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Check className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold">Optimized Timing</h4>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Your audience is most active Tuesday-Thursday 7-9 PM
              </p>
            </motion.div>

            <motion.div 
              className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800"
              variants={scaleIn}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Check className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold">Style Preference</h4>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Conversational tone performs 32% better for your niche
              </p>
            </motion.div>
          </motion.div>

          <div className="mt-6 p-4 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg text-center">
            <Sparkles className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <p className="text-sm font-medium">
              AI will use these insights to create even better content next time!
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
