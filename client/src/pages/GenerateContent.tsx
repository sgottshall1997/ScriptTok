import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ContentHistoryManager } from '@shared/contentHistoryUtils';
import { queryClient } from '@/lib/queryClient';
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Sparkles, 
  Clock, 
  Copy, 
  RefreshCw, 
  Edit,
  ChevronDown,
  Zap,
  ExternalLink,
  Crown,
  AlertTriangle,
  Lock
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { TemplateSelector } from "@/components/TemplateSelector";
import { UsageStatistics } from "@/components/UsageStatistics";
import { ViralScoreDisplay } from "@/components/ViralScoreDisplay";
import { TierBadge } from "@/components/TierBadge";
import { UsageProgress } from "@/components/UsageProgress";
import { type TemplateType, type ContentMode, TIKTOK_TONE_OPTIONS, templateRequiresProduct } from '@shared/constants';
import { useUsageData } from '@/hooks/useUsageData';

// Video duration interface
interface VideoDuration {
  seconds: number;
  readableTime: string;
  wordCount: number;
  pacing: 'slow' | 'moderate' | 'fast';
  isIdealLength: boolean;
  lengthFeedback: string;
}

interface GeneratedContent {
  content: string;
  hook: string;
  platform: string;
  niche: string;
  videoDuration?: VideoDuration;
  viralScore?: {
    overall: number;
    score?: number; // backward compatibility
    breakdown: {
      hookStrength: number;
      engagement: number;
      clarity: number;
      length: number;
      trending: number;
    };
    suggestions: string[];
    colorCode?: 'green' | 'yellow' | 'red';
  };
  viralAnalysis?: {
    overallSummary: string;
    hookFeedback: string;
    engagementFeedback: string;
    clarityFeedback: string;
    lengthFeedback: string;
    trendingFeedback: string;
    topActions: string[];
    improvementPrompt: string; // NEW: For AI-powered regeneration
  };
  historyId?: number; // NEW: For tracking database record
}


const GenerateContent = () => {
  const [location] = useLocation();
  const { toast } = useToast();
  const { data: usageResponse, isLoading: usageLoading } = useUsageData();
  const usageData = usageResponse?.data;
  const tier = usageData?.features.tier || 'starter';
  const usage = usageData?.usage;
  const limits = usageData?.limits;
  const remaining = usageData?.remaining;
  const features = usageData?.features;
  
  // Extract niche from URL path
  const urlParts = location.split('/');
  const nicheFromUrl = urlParts[2]; // /niche/skincare -> skincare
  
  // Extract template and product from query params using window.location.search
  const urlParams = new URLSearchParams(window.location.search);
  const templateFromUrl = urlParams.get('template');
  const productFromUrl = urlParams.get('product');
  
  // Debug logging to see what we're getting
  // console.log('🔍 URL Debug:', { location, search: window.location.search, productFromUrl, nicheFromUrl });

  // State management
  const [contentMode, setContentMode] = useState<ContentMode | undefined>(undefined); // No default mode - user must choose
  const [selectedNiche, setSelectedNiche] = useState(nicheFromUrl || 'beauty');
  const [selectedProduct, setSelectedProduct] = useState(productFromUrl || '');
  const [viralTopic, setViralTopic] = useState(''); // For viral mode topic input
  
  // Update state when URL parameters change
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const productParam = urlParams.get('product');
    const nicheParam = urlParams.get('niche');
    
    // console.log('🔍 useEffect URL parsing:', { productParam, nicheParam });
    
    if (productParam && productParam !== selectedProduct) {
      setSelectedProduct(productParam);
      // Auto-select affiliate mode when product is passed from trend dashboard
      setContentMode('affiliate');
      // console.log('🔍 Setting product from URL:', productParam);
    }
    
    if (nicheParam && nicheParam !== selectedNiche) {
      setSelectedNiche(nicheParam);
      // console.log('🔍 Setting niche from URL:', nicheParam);
    }
  }, [location, window.location.search]);
  
  // Auto-set niche to "universal" when switching to viral mode
  useEffect(() => {
    if (contentMode === 'viral' && selectedNiche !== 'universal') {
      setSelectedNiche('universal');
    } else if (contentMode === 'affiliate' && selectedNiche === 'universal') {
      setSelectedNiche('beauty'); // Default back to beauty for affiliate mode
    }
  }, [contentMode]);
  // Hardcoded to TikTok only for simplified generator
  const selectedPlatforms = ['tiktok'];
  const customHook = ''; // No custom hook input - using templates only
  const [templateType, setTemplateType] = useState(templateFromUrl || '');
  const [selectedTemplates, setSelectedTemplates] = useState<TemplateType[]>(templateFromUrl ? [templateFromUrl] as TemplateType[] : []);
  const [tone, setTone] = useState('enthusiastic');
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [multiTemplateResults, setMultiTemplateResults] = useState<Array<{id: string; templateType: string; content: GeneratedContent}>>([]);
  const [comparisonResults, setComparisonResults] = useState<{
    claude: GeneratedContent | null;
    chatgpt: GeneratedContent | null;
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPlatformCaptions, setShowPlatformCaptions] = useState(true);
  const [useSmartStyle, setUseSmartStyle] = useState(false);
  const [aiModel, setAiModel] = useState<'chatgpt' | 'claude' | 'both'>('claude'); // AI model selection
  const [currentPromptStructure, setCurrentPromptStructure] = useState<{
    systemPrompt: string;
    userPrompt: string;
    templateType: string;
  } | null>(null);
  
  // Viral inspiration data (will be populated when product is selected)
  const [viralInspo, setViralInspo] = useState<{
    hook: string;
    format: string;
    caption: string;
    hashtags: string[];
  } | null>(null);
  const [viralInspoLoading, setViralInspoLoading] = useState(false);
  
  // Enhanced viral research data
  const [enhancedViralResearch, setEnhancedViralResearch] = useState<any>(null);
  const [viralResearchLoading, setViralResearchLoading] = useState(false);
  const [selectedViralTemplate, setSelectedViralTemplate] = useState<any>(null);

  // Perplexity Intelligence System states
  const [productResearch, setProductResearch] = useState<any>(null);
  const [productResearchLoading, setProductResearchLoading] = useState(false);
  const [competitorVideos, setCompetitorVideos] = useState<any[]>([]);
  const [competitorLoading, setCompetitorLoading] = useState(false);
  const [competitorIntelOpen, setCompetitorIntelOpen] = useState(false);
  const [viralScore, setViralScore] = useState<any>(null);
  const [selectedCompetitorStyle, setSelectedCompetitorStyle] = useState<any>(null);
  
  // Viral Trend Research System states (new)
  const [trendResearch, setTrendResearch] = useState<any>(null);
  const [trendResearchLoading, setTrendResearchLoading] = useState(false);
  const [trendCompetitorVideos, setTrendCompetitorVideos] = useState<any[]>([]);
  const [trendCompetitorLoading, setTrendCompetitorLoading] = useState(false);
  const [trendCompetitorIntelOpen, setTrendCompetitorIntelOpen] = useState(false);
  const [selectedTrendCompetitorStyle, setSelectedTrendCompetitorStyle] = useState<any>(null);




  // Fetch product research using Perplexity Intelligence System
  const fetchViralInspirationForProduct = async (productName: string) => {
    if (!productName.trim()) {
      setViralInspo(null);
      setEnhancedViralResearch(null);
      setProductResearch(null);
      setViralInspoLoading(false);
      setViralResearchLoading(false);
      setProductResearchLoading(false);
      return;
    }

    setViralInspoLoading(true);
    setViralResearchLoading(true);
    setProductResearchLoading(true);
    
    try {
      // Call Product Research API
      const response = await fetch('/api/product-research/research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product: productName,
          niche: selectedNiche
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setProductResearch(result.data.research);
          console.log('🔍 Product research loaded:', result.data.research);
        }
      } else {
        console.log('Product research API not available, using fallback');
        setProductResearch(null);
      }

      // Clear old viral inspiration data since we're using new research system
      setViralInspo(null);
      setEnhancedViralResearch(null);
    } catch (error) {
      console.error('Error fetching product research:', error);
      setViralInspo(null);
      setEnhancedViralResearch(null);
      setProductResearch(null);
    } finally {
      setViralInspoLoading(false);
      setViralResearchLoading(false);
      setProductResearchLoading(false);
    }
  };

  // Fetch competitor intelligence
  const fetchCompetitorIntel = async () => {
    if (!selectedProduct.trim()) {
      toast({
        title: "Product Required",
        description: "Please enter a product name first",
        variant: "destructive",
      });
      return;
    }

    setCompetitorLoading(true);
    setCompetitorIntelOpen(true);
    
    try {
      const response = await fetch('/api/product-research/competitors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product: selectedProduct,
          niche: selectedNiche
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setCompetitorVideos(result.data.competitors);
          console.log('🎯 Competitor intel loaded:', result.data.competitors);
        }
      }
    } catch (error) {
      console.error('Error fetching competitor intel:', error);
      toast({
        title: "Fetch Failed",
        description: "Could not load competitor videos. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCompetitorLoading(false);
    }
  };

  // Apply competitor style to generation
  const applyCompetitorStyle = (competitor: any) => {
    setSelectedCompetitorStyle(competitor);

    
    toast({
      title: "Style Applied! ⚡",
      description: `Now using ${competitor.creator}'s successful format`,
    });
  };

  // NEW: Fetch trend research using Perplexity Intelligence System
  const fetchTrendResearch = async (topic: string) => {
    if (!topic.trim()) {
      setTrendResearch(null);
      setTrendResearchLoading(false);
      return;
    }

    // Check trend analysis quota before making API call
    if (remaining && remaining.trends <= 0) {
      toast({
        title: "Trend Analysis Limit Reached 🔥",
        description: `You've reached your trend analysis limit (${limits?.trends}/month). Upgrade for more!`,
        variant: "destructive",
      });
      return;
    }

    setTrendResearchLoading(true);
    
    try {
      // Call Trend Research API
      const response = await fetch('/api/trend-research/research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: topic,
          niche: selectedNiche !== 'universal' ? selectedNiche : undefined
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setTrendResearch(result.data.research);
          console.log('🔥 Trend research loaded:', result.data.research);
        }
      } else {
        console.log('Trend research API not available, using fallback');
        setTrendResearch(null);
      }
    } catch (error) {
      console.error('Error fetching trend research:', error);
      setTrendResearch(null);
    } finally {
      setTrendResearchLoading(false);
    }
  };

  // NEW: Fetch trend competitor intelligence
  const fetchTrendCompetitorIntel = async () => {
    if (!viralTopic.trim()) {
      toast({
        title: "Trend Topic Required",
        description: "Please enter a viral topic first",
        variant: "destructive",
      });
      return;
    }

    // Check trend analysis quota before making API call
    if (remaining && remaining.trends <= 0) {
      toast({
        title: "Trend Analysis Limit Reached 🔥",
        description: `You've reached your trend analysis limit (${limits?.trends}/month). Upgrade for more!`,
        variant: "destructive",
      });
      return;
    }

    setTrendCompetitorLoading(true);
    setTrendCompetitorIntelOpen(true);
    
    try {
      const response = await fetch('/api/trend-research/competitors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: viralTopic,
          niche: selectedNiche !== 'universal' ? selectedNiche : undefined
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setTrendCompetitorVideos(result.data.competitors);
          console.log('🔥 Trend competitor intel loaded:', result.data.competitors);
        }
      }
    } catch (error) {
      console.error('Error fetching trend competitor intel:', error);
      toast({
        title: "Fetch Failed",
        description: "Could not load trending competitor videos. Please try again.",
        variant: "destructive",
      });
    } finally {
      setTrendCompetitorLoading(false);
    }
  };

  // NEW: Apply trend competitor style to generation
  const applyTrendCompetitorStyle = (competitor: any) => {
    setSelectedTrendCompetitorStyle(competitor);

    
    toast({
      title: "Trending Style Applied! 🔥",
      description: `Now using ${competitor.creator}'s viral format`,
    });
  };

  // REMOVED: Automatic Perplexity triggering to prevent token waste
  // Now using manual "Run Perplexity" buttons instead

  // Fetch prompt structure when template type, niche, or tone changes
  const fetchPromptStructure = async () => {
    if (selectedTemplates.length === 0 || !selectedNiche || !tone) {
      setCurrentPromptStructure(null);
      return;
    }

    try {
      const response = await fetch('/api/prompt-structure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateType: selectedTemplates[0], // Use first selected template for prompt structure
          niche: selectedNiche,
          tone,
          productName: selectedProduct || 'Sample Product',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentPromptStructure(data);
      } else {
        console.error('Failed to fetch prompt structure');
        setCurrentPromptStructure(null);
      }
    } catch (error) {
      console.error('Error fetching prompt structure:', error);
      setCurrentPromptStructure(null);
    }
  };

  // Watch for changes in template type, niche, or tone to update prompt structure
  useEffect(() => {
    fetchPromptStructure();
  }, [selectedTemplates, selectedNiche, tone]);

  // Debug: Log viralInspo state changes
  useEffect(() => {
    console.log('🎯 Viral inspiration updated:', viralInspo);
  }, [viralInspo]);

  // Copy to clipboard helper
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  // Generate TikTok-optimized caption
  const generatePlatformCaption = (platform: string, contentData?: GeneratedContent): string => {
    const content = contentData || generatedContent;
    if (!content || !selectedProduct) return '';

    const productName = selectedProduct;
    
    // TikTok configuration only
    const config = {
      cta: "Link in bio! 🔗✨",
      hashtags: ["#fyp", "#viral", `#${selectedNiche}`, "#trending", "#musthave"],
      maxLength: 200
    };

    // Create a completely different hook and description for the caption
    const captionHook = generateDynamicHook(productName, selectedNiche);
    
    // Create a social media style description that's different from the script
    const socialDescriptions = [
      `This ${productName} is absolutely EVERYTHING! Perfect for ${selectedNiche} lovers who want the best. You need this in your life! ✨`,
      `Obsessed with this ${productName}! It's been trending all over my FYP and now I know why. The quality is unmatched! 🔥`,
      `POV: You found the perfect ${productName} and now you're gatekeeping it... just kidding, sharing the link! 💕`,
      `This ${productName} has been selling out everywhere and I finally got my hands on it. Worth the hype! 🙌`,
      `Everyone's asking about my ${productName} - here's where I got it! Thank me later 😍`,
    ];
    
    // Pick a random social description
    const description = socialDescriptions[Math.floor(Math.random() * socialDescriptions.length)];
    
    const caption = `${captionHook}

${description}

${config.cta}

${config.hashtags.join(' ')}`;

    return caption;
  };

  // Generate platform-specific captions for saving to history (uses provided data)
  // Dynamic hook generator for varied, engaging hooks
  const generateDynamicHook = (productName: string, niche: string): string => {
    const hooks = [
      `💫 ${productName} is a game changer!`,
      `🌟 ${productName} is a life saver!`,
      `✨ ${productName} changed everything for me!`,
      `🔥 ${productName} is absolutely incredible!`,
      `🚀 ${productName} is revolutionary!`,
      `💎 ${productName} is pure magic!`,
      `⚡ ${productName} is mind-blowing!`,
      `🎯 ${productName} hits different!`,
      `💝 ${productName} is everything!`,
      `🌈 ${productName} is perfection!`,
      `🔮 ${productName} is the secret weapon!`,
      `💖 ${productName} stole my heart!`,
      `🎊 ${productName} is the real deal!`,
      `⭐ ${productName} exceeds expectations!`,
      `🏆 ${productName} wins every time!`
    ];
    
    // Add niche-specific hooks
    const nicheHooks: { [key: string]: string[] } = {
      beauty: [
        `💄 ${productName} is my new obsession!`,
        `✨ ${productName} gave me confidence!`,
        `🌸 ${productName} is skincare gold!`,
        `💅 ${productName} is my holy grail!`
      ],
      tech: [
        `⚡ ${productName} is next level tech!`,
        `🤖 ${productName} is the future!`,
        `💻 ${productName} changed my workflow!`,
        `🔌 ${productName} is pure innovation!`
      ],
      fitness: [
        `💪 ${productName} transformed my workouts!`,
        `🏋️ ${productName} is my fitness secret!`,
        `🔥 ${productName} gets results!`,
        `⚡ ${productName} powers my training!`
      ],
      fashion: [
        `👗 ${productName} is my style staple!`,
        `✨ ${productName} completes every outfit!`,
        `💫 ${productName} is fashion perfection!`,
        `🌟 ${productName} makes me feel amazing!`
      ],
      food: [
        `🍽️ ${productName} is flavor paradise!`,
        `😋 ${productName} satisfies every craving!`,
        `🔥 ${productName} is deliciously addictive!`,
        `✨ ${productName} elevates every meal!`
      ],
      travel: [
        `✈️ ${productName} is my travel essential!`,
        `🌍 ${productName} makes adventures easier!`,
        `🧳 ${productName} is the perfect companion!`,
        `🗺️ ${productName} enhances every trip!`
      ],
      pets: [
        `🐾 ${productName} makes my pet happy!`,
        `💕 ${productName} is pet parent approved!`,
        `🐕 ${productName} is a furry friend favorite!`,
        `✨ ${productName} keeps pets healthy!`
      ]
    };
    
    // Combine general and niche-specific hooks
    const allHooks = [...hooks, ...(nicheHooks[niche] || [])];
    
    // Return random hook
    return allHooks[Math.floor(Math.random() * allHooks.length)];
  };

  const generatePlatformCaptionForSaving = (platform: string, contentData: GeneratedContent, productName: string, linkUrl: string, niche: string): string => {
    if (!contentData || !productName) return '';
    
    // TikTok configuration only
    const config = {
      cta: "Link in bio! 🔗✨",
      hashtags: ["#fyp", "#viral", `#${niche}`, "#trending", "#musthave"],
      maxLength: 200
    };

    // Create a completely different social media style caption
    const socialCaptions = [
      `Just tried the ${productName} and I'm SHOOK! 😱 This is why everyone's talking about it. Definitely adding to cart! 🛒`,
      `POV: You found the perfect ${productName} and your ${niche} routine is about to be elite ✨ Thank me later!`,
      `This ${productName} has been all over my FYP and now I see why! The reviews don't lie 🔥`,
      `Guys... this ${productName} is IT! Been using it for a week and I'm obsessed 💕 Had to share!`,
      `Not me gatekeeping this ${productName} until now 🤫 But y'all deserve to know about this gem!`,
      `The ${productName} that everyone's been raving about? Yeah, it lives up to the hype! 🙌`,
      `Okay but why did nobody tell me about this ${productName} sooner?! Game changer! ⚡`,
      `This ${productName} just hit different 💯 Perfect for my ${niche} girlies who get it!`,
    ];
    
    // Pick a random caption style
    const description = socialCaptions[Math.floor(Math.random() * socialCaptions.length)];
    
    const caption = `${description}

${config.cta}

${config.hashtags.join(' ')}`;

    return caption;
  };

  // Handle content generation
  // Auto-suggest template based on viral inspiration format
  const autoSuggestTemplate = (viralFormat: string): TemplateType => {
    const format = viralFormat.toLowerCase();
    
    // Map viral formats to available template types (using valid TemplateType values)
    if (format.includes('demo') || format.includes('demonstration')) return 'short_video';
    if (format.includes('voiceover') && format.includes('story')) return 'influencer_caption';
    if (format.includes('skit') || format.includes('dialogue')) return 'short_video';
    if (format.includes('reaction') || format.includes('react')) return 'influencer_caption';
    if (format.includes('tutorial') || format.includes('how-to')) return 'routine_kit';
    if (format.includes('unboxing') || format.includes('unbox')) return 'short_video';
    if (format.includes('review') || format.includes('testing')) return 'product_comparison';
    if (format.includes('comparison') || format.includes('vs')) return 'product_comparison';
    if (format.includes('testimonial') || format.includes('before_after')) return 'influencer_caption';
    if (format.includes('lifestyle') || format.includes('day_in_life')) return 'influencer_caption';
    
    // Default fallbacks based on common patterns
    if (format.includes('quick') || format.includes('60_second')) return 'short_video';
    if (format.includes('hook') || format.includes('attention')) return 'influencer_caption';
    
    return 'short_video'; // fallback to short video for TikTok
  };

  const handleGenerateContent = async () => {
    // Check if usage data is still loading or undefined
    if (!usageData || usageLoading) {
      toast({
        title: "Loading your quota info...",
        description: "Please wait while we load your usage data",
      });
      return;
    }

    // Check tier-based restrictions and limits
    // Check canBulkGenerate before allowing multiple templates or "both" model
    if (!features?.canBulkGenerate && (selectedTemplates.length > 1 || aiModel === 'both')) {
      toast({
        title: "Pro Feature Required 👑",
        description: `Bulk generation requires Pro or Agency tier. Upgrade to create multiple posts at once!`,
        variant: "destructive",
      });
      return;
    }

    // Check model-specific limits
    if (aiModel === 'chatgpt' && remaining?.gpt === 0) {
      toast({
        title: "ChatGPT Limit Reached",
        description: `You've reached your ChatGPT generation limit for this month (${limits?.gpt}). Upgrade for more generations.`,
        variant: "destructive",
      });
      return;
    }

    if (aiModel === 'claude' && remaining?.claude === 0) {
      toast({
        title: "Claude Limit Reached",
        description: `You've reached your Claude generation limit for this month (${limits?.claude}). Upgrade for more generations.`,
        variant: "destructive",
      });
      return;
    }

    // Check if both models are at limit when "both" is selected
    if (aiModel === 'both' && (remaining?.gpt === 0 || remaining?.claude === 0)) {
      toast({
        title: "Model Limit Reached",
        description: "One or both AI models have reached their generation limit. Upgrade for more generations.",
        variant: "destructive",
      });
      return;
    }

    // Validate input based on content mode
    if (contentMode === 'affiliate' && !selectedProduct) {
      toast({
        title: "Missing Product",
        description: "Please enter a product name for affiliate content",
        variant: "destructive",
      });
      return;
    }
    
    if (contentMode === 'viral' && !viralTopic) {
      toast({
        title: "Missing Topic",
        description: "Please enter a topic or subject for viral content",
        variant: "destructive",
      });
      return;
    }

    // Validate template selection for multi-select mode
    if (selectedTemplates.length === 0) {
      toast({
        title: "No Templates Selected",
        description: "Please select at least one template to generate content",
        variant: "destructive",
      });
      return;
    }

    // Handle multi-template generation
    if (selectedTemplates.length > 1) {
      setIsGenerating(true);
      setMultiTemplateResults([]);
      
      toast({
        title: "🚀 Multi-Template Generation",
        description: `Generating content for ${selectedTemplates.length} templates...`,
        duration: 3000,
      });

      try {
        const results: Array<{id: string; templateType: string; content: GeneratedContent}> = [];
        
        // Generate content for each selected template
        for (let i = 0; i < selectedTemplates.length; i++) {
          const templateType = selectedTemplates[i];
          const uniqueId = `${templateType}-${Date.now()}-${i}`;
          
          const response = await fetch('/api/generate-content', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...(contentMode === 'affiliate' ? { product: selectedProduct } : { viralTopic: viralTopic }),
              niche: selectedNiche,
              platforms: ['tiktok'],
              templateType: templateType,
              tone,
              customHook: '',
              aiModel: aiModel === 'both' ? 'claude' : aiModel, // Use selected AI model
              contentMode,
            }),
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success) {
              results.push({
                id: uniqueId,
                templateType: templateType,
                content: {
                  content: result.data.content,
                  hook: result.data.customHook || '',
                  platform: 'tiktok',
                  niche: selectedNiche,
                  videoDuration: result.data.videoDuration,
                  viralScore: result.data.viralScore
                }
              });
            }
          }
        }

        setMultiTemplateResults(results);

        // Invalidate usage query to refresh quota counters
        queryClient.invalidateQueries({ queryKey: ['/api/billing/usage'] });
        
        toast({
          title: "✨ Multi-Template Generation Complete!",
          description: `Generated content for ${results.length} templates`,
        });

      } catch (error) {
        console.error('Multi-template generation failed:', error);
        toast({
          title: "Generation Failed",
          description: "Failed to generate content for multiple templates",
          variant: "destructive",
        });
      } finally {
        setIsGenerating(false);
      }
      return;
    }

    // Single template generation (existing logic)
    let finalTemplateType = selectedTemplates[0];
    let templateSource = 'manual';
    
    // Auto-suggest template if viral inspiration is available and no templates selected yet
    if (viralInspo && selectedTemplates.length === 1 && selectedTemplates[0] === 'short_video') {
      finalTemplateType = autoSuggestTemplate(viralInspo.format);
      templateSource = `auto-suggested from format: ${viralInspo.format}`;
      
      // Update the selected templates to include the auto-suggested template
      setSelectedTemplates([finalTemplateType]);
      
      toast({
        title: "🎯 Auto-Template Selection",
        description: `Selected "${finalTemplateType}" based on viral format: ${viralInspo.format}`,
        duration: 4000,
      });
    }
    
    console.log("Template source:", templateSource);
    console.log("Selected template:", finalTemplateType);

    setIsGenerating(true);
    
    // Handle "Both" models case
    if (aiModel === 'both') {
      try {
        const requestBody = {
          ...(contentMode === 'affiliate' ? { product: selectedProduct } : { viralTopic: viralTopic }),
          niche: selectedNiche,
          platforms: ['tiktok'], // TikTok-only generator
          templateType: finalTemplateType,
          tone,
          customHook,
          contentMode, // Add content mode to request
          // No affiliate URL needed for TikTok-only generator
          ...(viralInspo ? { viralInspiration: viralInspo } : {}), // Include viral inspiration data only if exists
          ...(productResearch ? { productResearch } : {}), // Include product research data
          ...(selectedCompetitorStyle ? { competitorStyle: selectedCompetitorStyle } : {}), // Include competitor style
          templateSource, // Track how template was selected
          useSmartStyle, // Enable smart style recommendations
          userId: 1 // Demo user ID for rating system
        };

        // Make parallel requests to both AI models
        const [claudeResponse, chatgptResponse] = await Promise.all([
          fetch('/api/generate-content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...requestBody, aiModel: 'claude' }),
          }),
          fetch('/api/generate-content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...requestBody, aiModel: 'chatgpt' }),
          })
        ]);

        if (claudeResponse.ok && chatgptResponse.ok) {
          const [claudeResult, chatgptResult] = await Promise.all([
            claudeResponse.json(),
            chatgptResponse.json()
          ]);

          if (claudeResult.success && chatgptResult.success) {
            const claudeContent: GeneratedContent = {
              content: claudeResult.data.content,
              hook: claudeResult.data.customHook || '',
              platform: 'tiktok',
              niche: selectedNiche,
              viralScore: claudeResult.data.viralScore,
              viralAnalysis: claudeResult.data.viralAnalysis
            };
            
            const chatgptContent: GeneratedContent = {
              content: chatgptResult.data.content,
              hook: chatgptResult.data.customHook || '',
              platform: 'tiktok',
              niche: selectedNiche,
              viralScore: chatgptResult.data.viralScore,
              viralAnalysis: chatgptResult.data.viralAnalysis
            };

            setComparisonResults({
              claude: claudeContent,
              chatgpt: chatgptContent
            });
            setGeneratedContent(null); // Clear single result when showing comparison

            // Invalidate usage query to refresh quota counters
            queryClient.invalidateQueries({ queryKey: ['/api/billing/usage'] });

            toast({
              title: "Both Models Generated!",
              description: "Compare results from Claude and ChatGPT side-by-side",
            });
          } else {
            throw new Error('One or both AI models failed to generate content');
          }
        } else {
          throw new Error('Failed to generate content with both models');
        }
      } catch (error) {
        console.error('Both models generation error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        toast({
          title: "Generation Failed",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsGenerating(false);
      }
      return; // Exit early for "both" case
    }

    // Handle single model case
    try {
      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(contentMode === 'affiliate' ? { product: selectedProduct } : { viralTopic: viralTopic }),
          niche: selectedNiche,
          platforms: ['tiktok'], // TikTok-only generator
          templateType: finalTemplateType,
          tone,
          customHook,
          aiModel: aiModel, // Use selected single model
          contentMode, // Add content mode to request
          // No affiliate URL needed for TikTok-only generator
          ...(viralInspo ? { viralInspiration: viralInspo } : {}), // Include viral inspiration data only if exists
          ...(productResearch ? { productResearch } : {}), // Include product research data
          ...(selectedCompetitorStyle ? { competitorStyle: selectedCompetitorStyle } : {}), // Include competitor style
          templateSource, // Track how template was selected
          useSmartStyle, // Enable smart style recommendations
          userId: 1 // Demo user ID for rating system
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('API Response:', result); // Debug log
        
        if (result.success && result.data) {
          // Extract content from the API response structure
          const contentData: GeneratedContent = {
            content: result.data.content,
            hook: result.data.customHook || '',
            platform: 'tiktok',
            niche: selectedNiche,
            videoDuration: result.data.videoDuration,
            viralScore: result.data.viralScore,
            viralAnalysis: result.data.viralAnalysis,
            historyId: result.data.historyId
          };
          
          setGeneratedContent(contentData);
          setComparisonResults(null); // Clear comparison results when showing single result

          // Set viral score if available
          if (result.data.viralScore) {
            setViralScore(result.data.viralScore);
            console.log('🎯 Viral score loaded:', result.data.viralScore);
          }
          
          // Generate TikTok caption for saving to history
          const tiktokCaption = generatePlatformCaptionForSaving('tiktok', contentData, selectedProduct, '', selectedNiche);
          const platformCaptions = {
            tiktokCaption
          };

          // Save to content generation history
          const directAffiliateLink = ''; // No affiliate links for TikTok-only generator
          
          ContentHistoryManager.saveEntry({
            productName: selectedProduct,
            niche: selectedNiche,
            platformsSelected: ['tiktok'], // TikTok-only
            templateUsed: finalTemplateType,
            tone: tone,
            generatedOutput: {
              content: result.data.content,
              hook: result.data.customHook || '',
              platform: 'tiktok',
              niche: selectedNiche,
              hashtags: result.data.hashtags || [],
              affiliateLink: directAffiliateLink,
              viralInspo: viralInspo || undefined,
              ...platformCaptions
            },
            sessionId: `session_${Date.now()}`
          });

          // Invalidate usage query to refresh quota counters
          queryClient.invalidateQueries({ queryKey: ['/api/billing/usage'] });
          
          toast({
            title: "Content Generated!",
            description: `Your ${finalTemplateType} content is ready`,
          });
          
          // Show Surprise Me reasoning if available
          if (result.data.surpriseMeReasoning) {
            toast({
              title: "🎲 Surprise Me Selection",
              description: result.data.surpriseMeReasoning,
              duration: 5000,
            });
          }
        } else {
          console.error('API Response Error:', result);
          throw new Error(result.error || 'Generation failed');
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Generation failed');
      }
    } catch (error) {
      console.error('Content generation error:', error); // Debug log
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Apply AI Suggestions - Auto-regenerate content with AI improvements
  const handleApplyAISuggestions = async () => {
    if (!generatedContent?.viralAnalysis?.improvementPrompt) {
      toast({
        title: "No Suggestions Available",
        description: "Generate content first to get AI suggestions",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Use the AI improvement prompt as custom instructions
      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: selectedProduct,
          niche: selectedNiche,
          platforms: ['tiktok'],
          templateType: selectedTemplates[0] || 'short_video',
          tone: tone,
          customHook: '',
          // Pass improvement instructions
          improvementInstructions: generatedContent.viralAnalysis.improvementPrompt
        }),
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.success && result.data) {
          const contentData: GeneratedContent = {
            content: result.data.content,
            hook: result.data.customHook || '',
            platform: 'tiktok',
            niche: selectedNiche,
            videoDuration: result.data.videoDuration,
            viralScore: result.data.viralScore,
            viralAnalysis: result.data.viralAnalysis,
            historyId: result.data.historyId
          };
          
          setGeneratedContent(contentData);
          
          toast({
            title: "Improved Script Generated! ✨",
            description: `New viral score: ${result.data.viralScore?.score || 'N/A'}/100`,
          });
        }
      } else {
        throw new Error('Generation failed');
      }
    } catch (error) {
      console.error('Apply suggestions error:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };


  // Niche data
  const allNiches = [
    { id: 'beauty', name: 'Beauty & Personal Care', color: 'bg-pink-100 text-pink-800', starterAllowed: true },
    { id: 'tech', name: 'Tech', color: 'bg-purple-100 text-purple-800', starterAllowed: true },
    { id: 'fashion', name: 'Fashion', color: 'bg-purple-100 text-purple-800', starterAllowed: true },
    { id: 'fitness', name: 'Fitness', color: 'bg-green-100 text-green-800', starterAllowed: false },
    { id: 'food', name: 'Food', color: 'bg-orange-100 text-orange-800', starterAllowed: false },
    { id: 'travel', name: 'Travel', color: 'bg-cyan-100 text-cyan-800', starterAllowed: false },
    { id: 'pets', name: 'Pets', color: 'bg-yellow-100 text-yellow-800', starterAllowed: false },
  ];
  
  // Filter niches based on tier (Starter tier limited to beauty, tech, fashion)
  const niches = tier === 'starter' 
    ? allNiches.filter(niche => niche.starterAllowed)
    : allNiches;


  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50 pb-32">
        <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
          {/* Header */}
          <div className="text-center space-y-2 px-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">🎵 TikTok Content Generator</h1>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
              Generate viral TikTok content in under 60 seconds
            </p>
          </div>

          {/* Tier Badge and Quota Counters */}
          {!usageLoading && usageData && (
            <Card className="rounded-2xl shadow-sm bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  {/* Tier Badge */}
                  <div className="flex items-center gap-3">
                    <TierBadge tier={tier} size="md" />
                    {(tier === 'starter' || tier === 'creator') && (
                      <Link href="/pricing">
                        <Button variant="outline" size="sm" className="gap-2" data-testid="button-upgrade-cta">
                          <Crown className="h-4 w-4" />
                          Upgrade
                        </Button>
                      </Link>
                    )}
                  </div>

                  {/* Quota Counters */}
                  <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                    <UsageProgress
                      used={usage?.gptGenerationsUsed || 0}
                      limit={limits?.gpt || 0}
                      label="GPT-4"
                      className="w-full md:w-48"
                    />
                    <UsageProgress
                      used={usage?.claudeGenerationsUsed || 0}
                      limit={limits?.claude || 0}
                      label="Claude"
                      className="w-full md:w-48"
                    />
                    <UsageProgress
                      used={usage?.trendAnalysesUsed || 0}
                      limit={limits?.trends || 0}
                      label="Trends"
                      className="w-full md:w-48"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Usage Statistics Section */}
          <UsageStatistics />


        {/* Content Generation Module - Vertical Stack Layout */}
        <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto">
          
          {/* Mode Selector */}
          <Card className="shadow-lg border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-center justify-center">
                <Zap className="h-6 w-6 text-purple-600" />
                Choose Your Content Studio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Viral Content Studio */}
                <div 
                  className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                    contentMode === 'viral' 
                      ? 'border-purple-500 bg-purple-100 shadow-lg scale-105' 
                      : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
                  }`}
                  onClick={() => setContentMode('viral')}
                >
                  <div className="text-center space-y-3">
                    <div className="text-4xl">🔥</div>
                    <h3 className="font-bold text-lg text-purple-700">Viral Content Studio</h3>
                    <p className="text-sm text-gray-600">Create trending viral content without products. Perfect for building audience and engagement.</p>
                    <div className="text-xs text-purple-600 font-medium">✨ Trending topics • Viral hooks • Story content</div>
                  </div>
                </div>
                
                {/* Affiliate Content Studio */}
                <div 
                  className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                    contentMode === 'affiliate' 
                      ? 'border-purple-500 bg-purple-100 shadow-lg scale-105' 
                      : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
                  }`}
                  onClick={() => setContentMode('affiliate')}
                >
                  <div className="text-center space-y-3">
                    <div className="text-4xl">💰</div>
                    <h3 className="font-bold text-lg text-purple-700">Affiliate Content Studio</h3>
                    <p className="text-sm text-gray-600">Generate product-focused content with affiliate links. Perfect for monetization and sales.</p>
                    <div className="text-xs text-purple-600 font-medium">🛒 Product reviews • Sales scripts • Affiliate links</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Setup - Show only when mode is selected */}
          {contentMode && (
            <Card className="rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  {contentMode === 'viral' ? '🔥 Viral Content Setup' : '📄 Product Setup'}
                </CardTitle>
              </CardHeader>
            <CardContent className="space-y-4">
              
              {contentMode === 'viral' ? (
                // Viral Mode: Topic Input
                <div>
                  <Label htmlFor="viral-topic">Trending Topic or Subject</Label>
                  <div className="flex gap-2">
                    <Input
                      id="viral-topic"
                      value={viralTopic}
                      onChange={(e) => setViralTopic(e.target.value)}
                      placeholder="Enter topic (e.g., 'productivity hacks', 'dating red flags', 'workout motivation')..."
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="default"
                      onClick={() => fetchTrendResearch(viralTopic)}
                      disabled={!viralTopic.trim() || trendResearchLoading}
                      className="whitespace-nowrap"
                    >
                      {trendResearchLoading ? (
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Sparkles className="h-4 w-4 mr-2" />
                      )}
                      Run Trend Analysis
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    💡 Tip: Use trending topics, relatable situations, or engaging subjects that don't require specific products
                  </p>
                </div>
              ) : (
                // Affiliate Mode: Product Input
                <div>
                  <Label htmlFor="product">Product Name</Label>
                  <div className="flex gap-2">
                    <Input
                      id="product"
                      value={selectedProduct}
                      onChange={(e) => setSelectedProduct(e.target.value)}
                      placeholder="Enter product name..."
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="default"
                      onClick={() => fetchViralInspirationForProduct(selectedProduct)}
                      disabled={!selectedProduct.trim() || viralInspoLoading}
                      className="whitespace-nowrap"
                    >
                      {viralInspoLoading ? (
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Sparkles className="h-4 w-4 mr-2" />
                      )}
                      Run Trend Analysis
                    </Button>
                  </div>
                </div>
              )}

              {/* Niche - Optional for viral mode */}
              <div>
                <Label htmlFor="niche">
                  Niche {contentMode === 'viral' && <span className="text-xs text-gray-500">(Optional)</span>}
                </Label>
                <Select value={selectedNiche} onValueChange={setSelectedNiche}>
                  <SelectTrigger>
                    <SelectValue placeholder={contentMode === 'viral' ? "Select niche (optional for viral content)" : "Select your niche"} />
                  </SelectTrigger>
                  <SelectContent>
                    {contentMode === 'viral' && (
                      <SelectItem value="universal">
                        🌐 Universal (Cross-Niche)
                      </SelectItem>
                    )}
                    {niches.map((niche) => (
                      <SelectItem key={niche.id} value={niche.id}>
                        {niche.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {contentMode === 'viral' && (
                  <p className="text-xs text-muted-foreground mt-1">
                    💡 Tip: Leave blank or select "Universal" for cross-niche viral content that works across all audiences
                  </p>
                )}
              </div>

          </CardContent>
          </Card>
          )}

          {/* Show selection prompt when no mode is chosen */}
          {!contentMode && (
            <Card className="shadow-lg border-2 border-yellow-200 bg-yellow-50">
              <CardContent className="p-8 text-center">
                <div className="text-4xl mb-4">👆</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Choose Your Content Studio</h3>
                <p className="text-gray-600">Select either Viral Content Studio or Affiliate Content Studio above to get started</p>
              </CardContent>
            </Card>
          )}

        {/* Product Research Card */}
        {selectedProduct && (productResearchLoading || productResearch) && (
          <Card className="rounded-2xl shadow-sm bg-purple-50 border border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-purple-700 flex items-center gap-2">
                {productResearchLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    🔍 Analyzing {selectedProduct} on TikTok...
                  </>
                ) : (
                  <>🎯 Product Research Complete</>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {productResearchLoading ? (
                <div className="space-y-2">
                  <p className="text-sm text-purple-600">Discovering viral hooks, target audience, and trending angles...</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="h-2 bg-purple-200 rounded animate-pulse"></div>
                    <div className="h-2 bg-purple-200 rounded animate-pulse"></div>
                    <div className="h-2 bg-purple-200 rounded animate-pulse"></div>
                  </div>
                </div>
              ) : productResearch && (
                <div className="space-y-4">
                  {/* Viral Hooks */}
                  {productResearch.viralHooks && productResearch.viralHooks.length > 0 && (
                    <div className="bg-white p-3 rounded-lg border">
                      <h4 className="font-semibold text-green-700 mb-2">🔥 Viral Hooks</h4>
                      <ul className="space-y-1">
                        {productResearch.viralHooks.map((hook: string, index: number) => (
                          <li key={index} className="text-sm text-gray-700">• {hook}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Target Audience */}
                  {productResearch.targetAudience && (
                    <div className="bg-white p-3 rounded-lg border">
                      <h4 className="font-semibold text-purple-700 mb-2">👥 Target Audience</h4>
                      <p className="text-sm text-gray-700">{productResearch.targetAudience}</p>
                    </div>
                  )}

                  {/* Trending Angles */}
                  {productResearch.trendingAngles && productResearch.trendingAngles.length > 0 && (
                    <div className="bg-white p-3 rounded-lg border">
                      <h4 className="font-semibold text-orange-700 mb-2">📈 Trending Angles</h4>
                      <ul className="space-y-1">
                        {productResearch.trendingAngles.map((angle: string, index: number) => (
                          <li key={index} className="text-sm text-gray-700">• {angle}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Best Time to Post */}
                  {productResearch.bestTimeToPost && productResearch.bestTimeToPost.length > 0 && (
                    <div className="bg-white p-3 rounded-lg border">
                      <h4 className="font-semibold text-purple-700 mb-2">⏰ Best Time to Post</h4>
                      <ul className="space-y-1">
                        {productResearch.bestTimeToPost.map((time: string, index: number) => (
                          <li key={index} className="text-sm text-gray-700">• {time}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* View Competitors Button */}
                  <div className="pt-2">
                    <Button 
                      onClick={fetchCompetitorIntel}
                      disabled={competitorLoading}
                      className="w-full"
                      variant="outline"
                      data-testid="button-view-competitors"
                    >
                      {competitorLoading ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Loading Competitor Videos...
                        </>
                      ) : (
                        <>
                          👁️ View Competitor Videos →
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* NEW: Viral Trend Research Section */}
        {contentMode === 'viral' && viralTopic && (trendResearchLoading || trendResearch) && (
          <Card className="rounded-2xl shadow-sm bg-orange-50 border border-orange-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-orange-700 flex items-center gap-2">
                {trendResearchLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    🔥 Analyzing {viralTopic} trend...
                  </>
                ) : (
                  <>📈 Trend Research Complete</>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {trendResearchLoading ? (
                <div className="space-y-2">
                  <p className="text-sm text-orange-600">Discovering viral hooks, trend insights, and trending angles...</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="h-2 bg-orange-200 rounded animate-pulse"></div>
                    <div className="h-2 bg-orange-200 rounded animate-pulse"></div>
                    <div className="h-2 bg-orange-200 rounded animate-pulse"></div>
                  </div>
                </div>
              ) : trendResearch && (
                <div className="space-y-4">
                  {/* Viral Hooks */}
                  {trendResearch.viralHooks && trendResearch.viralHooks.length > 0 && (
                    <div className="bg-white p-3 rounded-lg border">
                      <h4 className="font-semibold text-green-700 mb-2">🔥 Viral Hooks</h4>
                      <ul className="space-y-1">
                        {trendResearch.viralHooks.map((hook: string, index: number) => (
                          <li key={index} className="text-sm text-gray-700">• {hook}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Target Audience */}
                  {trendResearch.targetAudience && (
                    <div className="bg-white p-3 rounded-lg border">
                      <h4 className="font-semibold text-purple-700 mb-2">👥 Target Audience</h4>
                      <p className="text-sm text-gray-700">{trendResearch.targetAudience}</p>
                    </div>
                  )}

                  {/* Trending Angles */}
                  {trendResearch.trendingAngles && trendResearch.trendingAngles.length > 0 && (
                    <div className="bg-white p-3 rounded-lg border">
                      <h4 className="font-semibold text-purple-700 mb-2">🎆 Trending Angles</h4>
                      <ul className="space-y-1">
                        {trendResearch.trendingAngles.map((angle: string, index: number) => (
                          <li key={index} className="text-sm text-gray-700">• {angle}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Trend Insights */}
                  {trendResearch.trendInsights && (
                    <div className="bg-white p-3 rounded-lg border">
                      <h4 className="font-semibold text-yellow-700 mb-2">✨ Trend Insights</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-600">Popularity Score:</span>
                          <span className="text-sm bg-yellow-100 px-2 py-1 rounded text-yellow-800">
                            {trendResearch.trendInsights.popularityScore}/100
                          </span>
                        </div>
                        <div className="text-sm text-gray-700">
                          <strong>Peak Time:</strong> {trendResearch.trendInsights.peakTime}
                        </div>
                        {trendResearch.trendInsights.relatedTrends && trendResearch.trendInsights.relatedTrends.length > 0 && (
                          <div>
                            <strong className="text-sm text-gray-600">Related Trends:</strong>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {trendResearch.trendInsights.relatedTrends.map((trend: string, index: number) => (
                                <span key={index} className="text-xs bg-orange-100 px-2 py-1 rounded text-orange-700">
                                  {trend}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Best Time to Post */}
                  {trendResearch.bestTimeToPost && trendResearch.bestTimeToPost.length > 0 && (
                    <div className="bg-white p-3 rounded-lg border">
                      <h4 className="font-semibold text-indigo-700 mb-2">📅 Best Time to Post</h4>
                      <div className="flex flex-wrap gap-2">
                        {trendResearch.bestTimeToPost.map((time: string, index: number) => (
                          <span key={index} className="text-xs bg-indigo-100 px-2 py-1 rounded text-indigo-700">
                            {time}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* View Trend Competitor Videos Button */}
                  <div className="pt-2">
                    <Button 
                      onClick={fetchTrendCompetitorIntel}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                      disabled={trendCompetitorLoading}
                      data-testid="button-view-trend-competitors"
                    >
                      {trendCompetitorLoading ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                          Analyzing Trending Videos...
                        </>
                      ) : (
                        <>
                          🔥 View Trending Competitor Videos →
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* NEW: Trend Competitor Intel Expandable Section */}
        {trendCompetitorIntelOpen && (
          <Card className="rounded-2xl shadow-sm bg-red-50 border border-red-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-red-700 flex items-center gap-2">
                🔥 Trending Competitor Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {trendCompetitorLoading ? (
                <div className="space-y-2">
                  <p className="text-sm text-red-600">Finding top 5 viral videos about {viralTopic}...</p>
                  <div className="grid grid-cols-5 gap-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-16 bg-red-200 rounded animate-pulse"></div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {trendCompetitorVideos.length > 0 ? (
                    trendCompetitorVideos.map((video, index) => (
                      <div key={index} className="bg-white p-4 rounded-lg border hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{video.creator}</h4>
                            <p className="text-sm text-red-600 font-medium">"{video.hook}"</p>
                          </div>
                          <div className="text-right text-xs text-gray-500">
                            <div>{video.views}</div>
                            <div>{video.engagement}</div>
                          </div>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p><strong>Structure:</strong> {video.structure}</p>
                          <p><strong>What Worked:</strong> {video.whatWorked}</p>
                          {video.trendElement && (
                            <p><strong>Trend Element:</strong> {video.trendElement}</p>
                          )}
                        </div>
                        <div className="pt-2">
                          <Button 
                            onClick={() => applyTrendCompetitorStyle(video)}
                            size="sm"
                            className="w-full bg-green-600 hover:bg-green-700"
                            data-testid={`button-use-trend-style-${index}`}
                          >
                            🔥 Use This Trending Style
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-red-600">
                      <p>No trending competitor videos found for this topic.</p>
                      <p className="text-sm mt-1">Try a different trending topic or check back later.</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Competitor Intel Expandable Section */}
        {competitorIntelOpen && (
          <Card className="rounded-2xl shadow-sm bg-purple-50 border border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-purple-700 flex items-center gap-2">
                🎯 Competitor Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {competitorLoading ? (
                <div className="space-y-2">
                  <p className="text-sm text-purple-600">Finding top 5 viral videos about {selectedProduct}...</p>
                  <div className="grid grid-cols-5 gap-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-16 bg-purple-200 rounded animate-pulse"></div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {competitorVideos.length > 0 ? (
                    competitorVideos.map((video, index) => (
                      <div key={index} className="bg-white p-4 rounded-lg border hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{video.creator}</h4>
                            <p className="text-sm text-purple-600 font-medium">"{video.hook}"</p>
                          </div>
                          <div className="text-right text-xs text-gray-500">
                            <div>{video.views}</div>
                            <div>{video.engagement}</div>
                          </div>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p><strong>Structure:</strong> {video.structure}</p>
                          <p><strong>What Worked:</strong> {video.whatWorked}</p>
                        </div>
                        <div className="pt-2">
                          <Button 
                            onClick={() => applyCompetitorStyle(video)}
                            size="sm"
                            className="w-full bg-green-600 hover:bg-green-700"
                            data-testid={`button-use-style-${index}`}
                          >
                            ⚡ Use This Style
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-purple-600">
                      <p>No competitor videos found for this product.</p>
                      <p className="text-sm mt-1">Try a different product name or check back later.</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Enhanced Viral Research Preview */}
        {selectedProduct && (viralResearchLoading || enhancedViralResearch || viralInspo) && (
          <Card className="rounded-2xl shadow-sm bg-[#fff9f0] border border-orange-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-orange-700 flex items-center gap-2">
                {viralResearchLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Analyzing Viral Content Patterns...
                  </>
                ) : enhancedViralResearch ? (
                  <>🚀 Enhanced Viral Research Found</>
                ) : (
                  <>🎯 Viral Inspiration Found</>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {viralResearchLoading ? (
                <div className="space-y-2">
                  <p className="text-sm text-orange-600">Searching TikTok and Instagram for viral content patterns...</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="h-2 bg-orange-200 rounded animate-pulse"></div>
                    <div className="h-2 bg-orange-200 rounded animate-pulse"></div>
                    <div className="h-2 bg-orange-200 rounded animate-pulse"></div>
                  </div>
                </div>
              ) : enhancedViralResearch ? (
                <div className="space-y-4">
                  {/* Research Summary */}
                  <div className="bg-white p-3 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-orange-800">Research Summary</h4>
                      <span className="text-xs bg-orange-100 px-2 py-1 rounded text-orange-700">
                        {enhancedViralResearch.totalExamplesFound} examples • {enhancedViralResearch.templateRecommendations.confidenceScore}% confidence
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Found {enhancedViralResearch.totalExamplesFound} viral videos for {enhancedViralResearch.product}
                    </p>
                  </div>

                  {/* Top Viral Examples */}
                  {enhancedViralResearch.viralExamples?.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-orange-800 flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        Top Viral Examples
                      </h4>
                      {enhancedViralResearch.viralExamples.slice(0, 2).map((example: any, index: number) => (
                        <Collapsible key={index}>
                          <CollapsibleTrigger asChild>
                            <div className="bg-white p-3 rounded-lg border cursor-pointer hover:bg-orange-50 transition-colors">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{example.title}</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {example.engagementMetrics.views} views • {example.confidence}% viral confidence
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedViralTemplate(example);
                                      toast({
                                        title: "Template Selected!",
                                        description: `Using viral structure: ${example.format}`,
                                      });
                                    }}
                                  >
                                    Use Template
                                  </Button>
                                  <ChevronDown className="h-4 w-4" />
                                </div>
                              </div>
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="mt-2">
                            <div className="bg-gray-50 p-3 rounded-lg space-y-2 text-sm">
                              <div><strong>Hook:</strong> "{example.hook}"</div>
                              <div><strong>Format:</strong> {example.format}</div>
                              <div><strong>Style:</strong> {example.style}</div>
                              <div className="grid grid-cols-3 gap-2 text-xs">
                                <span className="bg-white p-1 rounded">👁 {example.engagementMetrics.views}</span>
                                <span className="bg-white p-1 rounded">❤️ {example.engagementMetrics.likes}</span>
                                <span className="bg-white p-1 rounded">💬 {example.engagementMetrics.comments}</span>
                              </div>
                              <div>
                                <strong>Structure:</strong>
                                <div className="ml-2 mt-1 space-y-1">
                                  <div>• Opening: {example.contentStructure?.opening}</div>
                                  <div>• Demo: {example.contentStructure?.demonstration}</div>
                                  <div>• CTA: {example.contentStructure?.callToAction}</div>
                                </div>
                              </div>
                              <div><strong>Hashtags:</strong> {example.hashtags?.join(" ")}</div>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      ))}
                    </div>
                  )}

                  {/* Template Recommendations */}
                  {enhancedViralResearch.templateRecommendations && (
                    <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-3 rounded-lg border border-orange-200">
                      <h4 className="font-semibold text-orange-800 mb-2">📈 AI Template Recommendations</h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>Best Hook Pattern:</strong> {enhancedViralResearch.templateRecommendations.bestHookTemplate}</div>
                        <div><strong>Recommended Format:</strong> {enhancedViralResearch.templateRecommendations.recommendedFormat}</div>
                        <div><strong>Suggested Structure:</strong> {enhancedViralResearch.templateRecommendations.suggestedStructure}</div>
                      </div>
                      <Button
                        size="sm"
                        className="mt-3 bg-orange-600 hover:bg-orange-700"
                        onClick={() => {
                          setSelectedViralTemplate(enhancedViralResearch.templateRecommendations);
                          toast({
                            title: "AI Recommendations Applied!",
                            description: `Using optimized viral patterns with ${enhancedViralResearch.templateRecommendations.confidenceScore}% success rate`,
                          });
                        }}
                      >
                        Apply AI Recommendations
                      </Button>
                    </div>
                  )}

                  {/* Common Patterns */}
                  {enhancedViralResearch.commonPatterns && (
                    <div className="bg-white p-3 rounded-lg border">
                      <h4 className="font-semibold text-orange-800 mb-2">🔍 Viral Pattern Analysis</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <strong>Top Hooks:</strong>
                          <ul className="mt-1 space-y-1">
                            {enhancedViralResearch.commonPatterns.topHooks?.slice(0, 2).map((hook: string, i: number) => (
                              <li key={i} className="text-xs bg-gray-100 p-1 rounded">"{hook}"</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <strong>Engagement Drivers:</strong>
                          <ul className="mt-1 space-y-1">
                            {enhancedViralResearch.commonPatterns.engagementDrivers?.slice(0, 3).map((driver: string, i: number) => (
                              <li key={i} className="text-xs bg-gray-100 p-1 rounded">{driver}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedViralTemplate && (
                    <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 text-green-800">
                        <Zap className="h-4 w-4" />
                        <span className="font-semibold">Viral Template Active</span>
                      </div>
                      <p className="text-sm text-green-700 mt-1">
                        Content generation will use proven viral patterns for maximum engagement.
                      </p>
                    </div>
                  )}
                </div>
              ) : viralInspo ? (
                <>
                  <p><strong>Hook:</strong> {viralInspo.hook}</p>
                  <p><strong>Format:</strong> {viralInspo.format}</p>
                  <p><strong>Caption:</strong> {viralInspo.caption}</p>
                  <p><strong>Hashtags:</strong> {viralInspo.hashtags?.join(" ")}</p>
                </>
              ) : (
                <p className="text-sm text-orange-600">No recent viral examples found — try refreshing or selecting another product.</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Content Setup */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-500" />
              🚀 Content Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">

            {/* Template Selection */}
            <div>
              <TemplateSelector 
                multiSelect={true}
                selectedTemplates={selectedTemplates}
                onMultiChange={setSelectedTemplates}
                selectedNiche={selectedNiche}
                contentMode={contentMode}
              />
            </div>

            

            {/* Tone */}
            <div>
              <Label htmlFor="tone">Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* AI Model Selection */}
            <div>
              <Label htmlFor="ai-model">AI Model</Label>
              <Select 
                value={aiModel} 
                onValueChange={(value: 'chatgpt' | 'claude' | 'both') => {
                  // Only Pro and Agency can use 'both' (model comparison)
                  if (value === 'both' && (tier === 'starter' || tier === 'creator')) {
                    toast({
                      title: "Pro Feature 👑",
                      description: "AI Model Comparison is available on Pro and Agency tiers. Upgrade to compare outputs!",
                      variant: "destructive",
                    });
                    return;
                  }
                  setAiModel(value);
                }}
              >
                <SelectTrigger data-testid="select-ai-model">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chatgpt" disabled={remaining?.gpt === 0}>
                    🤖 ChatGPT - {remaining?.gpt || 0} / {limits?.gpt || 0} remaining
                    {remaining?.gpt === 0 && ' (Limit Reached)'}
                  </SelectItem>
                  <SelectItem value="claude" disabled={remaining?.claude === 0}>
                    🧠 Claude - {remaining?.claude || 0} / {limits?.claude || 0} remaining
                    {remaining?.claude === 0 && ' (Limit Reached)'}
                  </SelectItem>
                  <SelectItem value="both" disabled={tier === 'starter' || tier === 'creator'}>
                    {(tier === 'starter' || tier === 'creator') ? <Lock className="h-3 w-3 inline mr-1" /> : null}
                    ⚡ Both - Compare AI models side-by-side
                    {(tier === 'starter' || tier === 'creator') && ' (Pro/Agency Only)'}
                  </SelectItem>
                </SelectContent>
              </Select>
              
              {/* Approaching Limit Warnings (>80% usage) */}
              {usage && limits && remaining && (
                <>
                  {aiModel === 'chatgpt' && remaining.gpt > 0 && (usage.gptGenerationsUsed / limits.gpt) > 0.8 && (
                    <Alert className="mt-2 bg-orange-50 border-orange-200">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <AlertTitle className="text-sm font-semibold text-orange-800">Approaching Limit</AlertTitle>
                      <AlertDescription className="text-sm text-orange-800">
                        You've used {usage.gptGenerationsUsed} of {limits.gpt} GPT-4 generations this month.
                        <Link href="/pricing" className="font-semibold underline ml-1">Upgrade for more</Link>
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {aiModel === 'chatgpt' && remaining.gpt === 0 && (
                    <Alert className="mt-2 bg-red-50 border-red-200">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <AlertTitle className="text-sm font-semibold text-red-800">Quota Exhausted</AlertTitle>
                      <AlertDescription className="text-sm text-red-800">
                        You've used all your GPT-4 generations this month.
                        <Link href="/pricing">
                          <Button variant="outline" size="sm" className="ml-2 mt-1">
                            Upgrade Now
                          </Button>
                        </Link>
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {aiModel === 'claude' && remaining.claude > 0 && (usage.claudeGenerationsUsed / limits.claude) > 0.8 && (
                    <Alert className="mt-2 bg-orange-50 border-orange-200">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <AlertTitle className="text-sm font-semibold text-orange-800">Approaching Limit</AlertTitle>
                      <AlertDescription className="text-sm text-orange-800">
                        You've used {usage.claudeGenerationsUsed} of {limits.claude} Claude generations this month.
                        <Link href="/pricing" className="font-semibold underline ml-1">Upgrade for more</Link>
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {aiModel === 'claude' && remaining.claude === 0 && (
                    <Alert className="mt-2 bg-red-50 border-red-200">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <AlertTitle className="text-sm font-semibold text-red-800">Quota Exhausted</AlertTitle>
                      <AlertDescription className="text-sm text-red-800">
                        You've used all your Claude generations this month.
                        <Link href="/pricing">
                          <Button variant="outline" size="sm" className="ml-2 mt-1">
                            Upgrade Now
                          </Button>
                        </Link>
                      </AlertDescription>
                    </Alert>
                  )}
                </>
              )}
              
              <p className="text-xs text-muted-foreground mt-1">
                {aiModel === 'both' 
                  ? 'Generate content using both AI models and compare results side-by-side'
                  : aiModel === 'claude'
                  ? 'Generate content using Anthropic\'s Claude AI model'
                  : 'Generate content using OpenAI\'s ChatGPT model'
                }
              </p>
            </div>

            {/* Smart Style Toggle */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
              <div className="flex-1">
                <Label htmlFor="smart-style" className="text-sm font-medium text-purple-800">
                  Use My Best-Rated Style
                </Label>
                <p className="text-xs text-purple-600 mt-1">
                  Generate content based on your highest-rated posts (80+ rating)
                </p>
              </div>
              <Switch
                id="smart-style"
                checked={useSmartStyle}
                onCheckedChange={setUseSmartStyle}
              />
            </div>

            {/* Total Variations Counter */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-purple-800">Total Variations</h4>
                  <p className="text-xs text-purple-600">
                    {selectedTemplates.length} template{selectedTemplates.length !== 1 ? 's' : ''} × 1 tone × {aiModel === 'both' ? '2' : '1'} AI model{aiModel === 'both' ? 's' : ''}
                  </p>
                </div>
                <div className="text-2xl font-bold text-purple-800">
                  {selectedTemplates.length * 1 * (aiModel === 'both' ? 2 : 1)}
                </div>
              </div>
              
              {/* Bulk Generation Feature Gates */}
              {features && (
                <>
                  {/* Starter/Creator: Bulk Generation Locked */}
                  {(tier === 'starter' || tier === 'creator') && (selectedTemplates.length > 1 || aiModel === 'both') && (
                    <Alert className="mt-3 bg-yellow-50 border-yellow-200">
                      <Lock className="h-4 w-4 text-yellow-600" />
                      <AlertTitle className="text-yellow-800">Bulk Generation Locked</AlertTitle>
                      <AlertDescription className="text-sm text-yellow-800">
                        Bulk generation is available on Pro and Agency tiers. Upgrade to generate up to 10 posts at once (Pro) or 50 posts (Agency)!
                        <Link href="/pricing">
                          <Button variant="outline" size="sm" className="ml-2 mt-2" data-testid="button-upgrade-bulk">
                            <Crown className="h-3 w-3 mr-1" />
                            Upgrade Now
                          </Button>
                        </Link>
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {/* Pro: Show limit of 10 */}
                  {tier === 'pro' && features.canBulkGenerate && selectedTemplates.length > features.bulkGenerationLimit && (
                    <Alert className="mt-3 bg-blue-50 border-blue-200">
                      <AlertTriangle className="h-4 w-4 text-blue-600" />
                      <AlertTitle className="text-blue-800">Bulk Limit Reached</AlertTitle>
                      <AlertDescription className="text-sm text-blue-800">
                        Pro tier can generate up to {features.bulkGenerationLimit} items at once. Please reduce selections or upgrade to Agency for up to 50 items.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {/* Agency: Show limit of 50 */}
                  {tier === 'agency' && features.canBulkGenerate && selectedTemplates.length > features.bulkGenerationLimit && (
                    <Alert className="mt-3 bg-amber-50 border-amber-200">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <AlertTitle className="text-amber-800">Bulk Limit Reached</AlertTitle>
                      <AlertDescription className="text-sm text-amber-800">
                        Agency tier can generate up to {features.bulkGenerationLimit} items at once. Please reduce selections.
                      </AlertDescription>
                    </Alert>
                  )}
                </>
              )}
            </div>

            {/* Generate Button */}
            <Button 
              className="w-full h-12 text-lg font-semibold"
              onClick={handleGenerateContent}
              disabled={
                isGenerating || 
                !contentMode || 
                (contentMode === 'affiliate' && !selectedProduct) || 
                (contentMode === 'viral' && !viralTopic) || 
                selectedTemplates.length === 0 ||
                // Bulk generation restrictions for Starter/Creator
                ((tier === 'starter' || tier === 'creator') && selectedTemplates.length > 1) ||
                ((tier === 'starter' || tier === 'creator') && aiModel === 'both') ||
                // Quota exhausted checks
                (aiModel === 'chatgpt' && remaining?.gpt === 0) ||
                (aiModel === 'claude' && remaining?.claude === 0)
              }
              data-testid="button-generate-content"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                  Generating Content...
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5 mr-2" />
                  🚀 Generate Content
                </>
              )}
            </Button>
            </CardContent>
          </Card>
        </div>

        {/* 3️⃣ Generated Content Output */}
        {generatedContent && (
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-green-500" />
                ✨ Generated TikTok Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-green-500">
                  <h4 className="font-semibold mb-3 text-lg">Generated Content:</h4>
                  <div className="text-sm text-gray-600 mb-4 flex gap-4 flex-wrap">
                    <span className="bg-white px-2 py-1 rounded">Templates: {selectedTemplates.join(', ')}</span>
                    <span className="bg-white px-2 py-1 rounded">Tone: {tone}</span>
                    <span className="bg-white px-2 py-1 rounded">Niche: {selectedNiche}</span>
                    {generatedContent.videoDuration && (
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded font-medium">
                        ⏱️ Est. Duration: {generatedContent.videoDuration.readableTime} ({generatedContent.videoDuration.wordCount} words)
                      </span>
                    )}
                    {generatedContent.videoDuration?.isIdealLength && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                        ✅ Perfect for social media
                      </span>
                    )}
                    {generatedContent.videoDuration && !generatedContent.videoDuration.isIdealLength && (
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs" title={generatedContent.videoDuration.lengthFeedback}>
                        ⚠️ {generatedContent.videoDuration.lengthFeedback.includes('short') ? 'Too short' : 'Too long'}
                      </span>
                    )}
                  </div>
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-line text-gray-900 leading-relaxed text-base">
                      {generatedContent.content}
                    </div>
                  </div>
                </div>
              
                {generatedContent.hook && (
                  <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                    <h4 className="font-semibold mb-2">Viral Hook:</h4>
                    <p className="text-purple-900 font-medium">{generatedContent.hook}</p>
                  </div>
                )}

                {/* Platform-Specific Captions */}
                <div className="space-y-4 border-t pt-6">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-lg flex items-center gap-2">
                      🎯 TikTok Caption
                    </h4>
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={showPlatformCaptions}
                        onCheckedChange={setShowPlatformCaptions}
                        id="platform-captions"
                      />
                      <Label htmlFor="platform-captions" className="text-sm font-medium">Show Captions</Label>
                    </div>
                  </div>
                  
                  {!showPlatformCaptions && (
                    <p className="text-sm text-muted-foreground">
                      Toggle to show TikTok-optimized caption with hashtags and CTAs
                    </p>
                  )}
                  
                  {showPlatformCaptions && (
                    <div className="space-y-4">
                      {/* TikTok Caption */}
                      <div className="bg-black text-white p-4 rounded-lg border">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-semibold flex items-center gap-2 text-white">
                            📱 TikTok Caption
                          </h5>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(generatePlatformCaption('tiktok'), 'TikTok caption')}
                            className="text-xs bg-white text-black hover:bg-gray-100"
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </Button>
                        </div>
                        <div className="bg-white p-4 rounded border border-gray-300 text-sm whitespace-pre-wrap text-gray-800 leading-relaxed max-h-40 overflow-y-auto">
                          {generatePlatformCaption('tiktok')}
                        </div>
                      </div>

                    </div>
                  )}
                </div>

                {/* Viral Score Display */}
                {(viralScore || generatedContent?.viralScore) && (
                  <div className="space-y-4">
                    <ViralScoreDisplay
                      viralScore={viralScore || generatedContent?.viralScore || null}
                      overallScore={viralScore?.overall || generatedContent?.viralScore?.overall || null}
                      tier={tier}
                    />

                    {/* AI-Powered Analysis & Auto-Apply */}
                    {generatedContent?.viralAnalysis && (
                      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                        <h5 className="font-medium text-gray-700 flex items-center gap-2">
                          🤖 AI Analysis
                        </h5>
                        <p className="text-sm text-gray-600">{generatedContent.viralAnalysis.overallSummary}</p>
                        
                        {/* Apply AI Suggestions Button */}
                        <Button 
                          onClick={handleApplyAISuggestions}
                          disabled={isGenerating}
                          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                          data-testid="button-apply-ai-suggestions"
                        >
                          {isGenerating ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Applying AI Suggestions...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4 mr-2" />
                              ✨ Apply AI Suggestions
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                  </div>
                )}

              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedContent.content);
                    toast({
                      title: "Copied!",
                      description: "Content copied to clipboard",
                    });
                  }}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy Content
                </Button>
                <Button size="sm" variant="outline">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit Hook
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleGenerateContent}
                  disabled={isGenerating}
                >
                  <RefreshCw className={`h-4 w-4 mr-1 ${isGenerating ? 'animate-spin' : ''}`} />
                  {isGenerating ? 'Generating...' : 'Regenerate'}
                </Button>
              </div>
            </div>
            </CardContent>
          </Card>
        )}

        {/* Multi-Template Results */}
        {multiTemplateResults.length > 0 && (
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                🎯 Multi-Template Results
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Generated content for {multiTemplateResults.length} templates
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {multiTemplateResults.map((item) => (
                  <div key={item.id} className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <h3 className="font-semibold text-lg capitalize">
                        📄 {item.templateType.replace('_', ' ')} Template
                      </h3>
                    </div>
                    <div className="bg-purple-50 p-6 rounded-lg border-l-4 border-purple-500">
                      <div className="text-sm text-gray-600 mb-4 flex gap-2 flex-wrap">
                        <span className="bg-white px-2 py-1 rounded">Template: {item.templateType}</span>
                        <span className="bg-white px-2 py-1 rounded">Tone: {tone}</span>
                        <span className="bg-white px-2 py-1 rounded">Niche: {selectedNiche}</span>
                        {item.content.videoDuration && (
                          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded font-medium">
                            🎥 Duration: {item.content.videoDuration.readableTime}
                          </span>
                        )}
                      </div>
                      <div className="prose prose-sm max-w-none">
                        <div className="whitespace-pre-line text-gray-800 leading-relaxed text-base">
                          {item.content.content}
                        </div>
                      </div>
                    </div>

                    {/* Viral Score Display for this template */}
                    {item.content.viralScore && (
                      <div className="mt-4">
                        <ViralScoreDisplay
                          viralScore={{...item.content.viralScore, colorCode: item.content.viralScore.colorCode || 'green'}}
                          overallScore={item.content.viralScore?.overall || null}
                          tier={tier}
                        />
                      </div>
                    )}

                    {/* Action buttons for each template result */}
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(item.content.content);
                          toast({
                            title: "Content Copied!",
                            description: `${item.templateType} content copied to clipboard`,
                          });
                        }}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          setGeneratedContent(item.content);
                          setMultiTemplateResults([]);
                          toast({
                            title: "Template Selected",
                            description: `Using ${item.templateType} as your main content`,
                          });
                        }}
                      >
                        Use This Template
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Models Comparison Results */}
        {comparisonResults && (
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                ⚡ AI Models Comparison Results
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Compare results from Claude and ChatGPT side-by-side
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Claude Results */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <h3 className="font-semibold text-lg">🧠 Claude AI</h3>
                  </div>
                  {comparisonResults.claude && (
                    <div className="bg-orange-50 p-6 rounded-lg border-l-4 border-orange-500">
                      <div className="text-sm text-gray-600 mb-4 flex gap-2 flex-wrap">
                        <span className="bg-white px-2 py-1 rounded">Templates: {selectedTemplates.join(', ')}</span>
                        <span className="bg-white px-2 py-1 rounded">Tone: {tone}</span>
                        <span className="bg-white px-2 py-1 rounded">Niche: {selectedNiche}</span>
                      </div>
                      <div className="prose prose-sm max-w-none">
                        <div className="whitespace-pre-line text-gray-900 leading-relaxed text-base">
                          {comparisonResults.claude.content}
                        </div>
                      </div>
                      {comparisonResults.claude.hook && (
                        <div className="bg-orange-100 p-3 rounded-lg border-l-4 border-orange-400 mt-4">
                          <h4 className="font-semibold mb-2">Hook:</h4>
                          <p className="text-orange-900 font-medium">{comparisonResults.claude.hook}</p>
                        </div>
                      )}
                      {/* Viral Score Display for Claude */}
                      {comparisonResults.claude.viralScore && (
                        <div className="mt-4">
                          <ViralScoreDisplay
                            viralScore={{...comparisonResults.claude.viralScore, colorCode: comparisonResults.claude.viralScore.colorCode || 'green'}}
                            overallScore={comparisonResults.claude.viralScore?.overall || null}
                            tier={tier}
                          />
                        </div>
                      )}

                      <div className="mt-4">
                        <div className="bg-orange-100 p-4 rounded border border-orange-200">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-semibold flex items-center gap-2 text-orange-800">
                              📱 TikTok Caption
                            </h5>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(generatePlatformCaption('tiktok', comparisonResults.claude || undefined), 'Claude TikTok caption')}
                              className="text-xs bg-white text-orange-600 hover:bg-gray-100"
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              Copy
                            </Button>
                          </div>
                          <div className="bg-white p-4 rounded border border-gray-300 text-sm whitespace-pre-wrap text-gray-800 leading-relaxed max-h-40 overflow-y-auto">
                            {generatePlatformCaption('tiktok', comparisonResults.claude)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* ChatGPT Results */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <h3 className="font-semibold text-lg">🤖 ChatGPT</h3>
                  </div>
                  {comparisonResults.chatgpt && (
                    <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-500">
                      <div className="text-sm text-gray-600 mb-4 flex gap-2 flex-wrap">
                        <span className="bg-white px-2 py-1 rounded">Templates: {selectedTemplates.join(', ')}</span>
                        <span className="bg-white px-2 py-1 rounded">Tone: {tone}</span>
                        <span className="bg-white px-2 py-1 rounded">Niche: {selectedNiche}</span>
                      </div>
                      <div className="prose prose-sm max-w-none">
                        <div className="whitespace-pre-line text-gray-900 leading-relaxed text-base">
                          {comparisonResults.chatgpt.content}
                        </div>
                      </div>
                      {comparisonResults.chatgpt.hook && (
                        <div className="bg-green-100 p-3 rounded-lg border-l-4 border-green-400 mt-4">
                          <h4 className="font-semibold mb-2">Hook:</h4>
                          <p className="text-green-900 font-medium">{comparisonResults.chatgpt.hook}</p>
                        </div>
                      )}
                      {/* Viral Score Display for ChatGPT */}
                      {comparisonResults.chatgpt.viralScore && (
                        <div className="mt-4">
                          <ViralScoreDisplay
                            viralScore={{...comparisonResults.chatgpt.viralScore, colorCode: comparisonResults.chatgpt.viralScore.colorCode || 'green'}}
                            overallScore={comparisonResults.chatgpt.viralScore?.overall || null}
                            tier={tier}
                          />
                        </div>
                      )}

                      <div className="mt-4">
                        <div className="bg-green-100 p-4 rounded border border-green-200">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-semibold flex items-center gap-2 text-green-800">
                              📱 TikTok Caption
                            </h5>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(generatePlatformCaption('tiktok', comparisonResults.chatgpt || undefined), 'ChatGPT TikTok caption')}
                              className="text-xs bg-white text-green-600 hover:bg-gray-100"
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              Copy
                            </Button>
                          </div>
                          <div className="bg-white p-4 rounded border border-gray-300 text-sm whitespace-pre-wrap text-gray-800 leading-relaxed max-h-40 overflow-y-auto">
                            {generatePlatformCaption('tiktok', comparisonResults.chatgpt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Comparison Actions */}
              <div className="flex gap-2 mt-6 pt-4 border-t">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (comparisonResults?.claude) {
                      setGeneratedContent(comparisonResults.claude);
                      setComparisonResults(null);
                      setAiModel('claude');
                      toast({
                        title: "Claude Result Selected",
                        description: "Switched to Claude result for further editing",
                      });
                    }
                  }}
                  className="bg-orange-50 text-orange-700 hover:bg-orange-100"
                >
                  Use Claude Result
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (comparisonResults?.chatgpt) {
                      setGeneratedContent(comparisonResults.chatgpt);
                      setComparisonResults(null);
                      setAiModel('chatgpt');
                      toast({
                        title: "ChatGPT Result Selected",
                        description: "Switched to ChatGPT result for further editing",
                      });
                    }
                  }}
                  className="bg-green-50 text-green-700 hover:bg-green-100"
                >
                  Use ChatGPT Result
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleGenerateContent}
                  disabled={isGenerating}
                >
                  <RefreshCw className={`h-4 w-4 mr-1 ${isGenerating ? 'animate-spin' : ''}`} />
                  {isGenerating ? 'Regenerating...' : 'Regenerate Both'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

      </div>
      </div>
    </TooltipProvider>
  );
};

export default GenerateContent;