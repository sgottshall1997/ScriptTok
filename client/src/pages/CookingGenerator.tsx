import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sparkles, Copy, Check, ChefHat, Clock, Users, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RecipePayload {
  niche: string;
  productName: string;
  contentType: string;
  script: string;
  caption: string;
  hashtags: string;
  cta: string;
  platforms: string[];
  videoDuration: string;
  imagePrompt: string;
  cookingMethod: string;
  postType: string;
  platform: string;
}

interface TrendingIngredient {
  name: string;
  popularity: number;
  seasonality: string;
  nutritionFacts: string;
}

const CookingGenerator = () => {
  const [selectedIngredient, setSelectedIngredient] = useState<string>("");
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [customIngredient, setCustomIngredient] = useState<string>("");
  const [generatedContent, setGeneratedContent] = useState<RecipePayload[] | null>(null);
  const [batchContent, setBatchContent] = useState<RecipePayload[][] | null>(null);
  const [copiedText, setCopiedText] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const ingredients = [
    { value: "Chicken Breast", label: "🐔 Chicken Breast", popularity: 95, nutrition: "High protein, low fat" },
    { value: "Salmon", label: "🐟 Salmon", popularity: 88, nutrition: "Omega-3 rich, high protein" },
    { value: "Sweet Potato", label: "🍠 Sweet Potato", popularity: 82, nutrition: "High fiber, vitamin A" },
    { value: "Avocado", label: "🥑 Avocado", popularity: 90, nutrition: "Healthy fats, potassium" },
    { value: "Quinoa", label: "🌾 Quinoa", popularity: 75, nutrition: "Complete protein, gluten-free" },
    { value: "Brussels Sprouts", label: "🥬 Brussels Sprouts", popularity: 68, nutrition: "High vitamin K, fiber" },
    { value: "Cauliflower", label: "🥦 Cauliflower", popularity: 85, nutrition: "Low carb, vitamin C" },
    { value: "Ground Turkey", label: "🦃 Ground Turkey", popularity: 79, nutrition: "Lean protein, versatile" }
  ];

  const cookingMethods = [
    { value: "air fryer", label: "🔥 Air Fryer", time: "15-25 min", difficulty: "Easy" },
    { value: "oven baked", label: "🏠 Oven Baked", time: "20-45 min", difficulty: "Easy" },
    { value: "grilled", label: "🔥 Grilled", time: "10-30 min", difficulty: "Medium" },
    { value: "pan seared", label: "🍳 Pan Seared", time: "5-15 min", difficulty: "Medium" },
    { value: "slow cooker", label: "⏰ Slow Cooker", time: "2-8 hours", difficulty: "Easy" }
  ];

  // Get today's trending ingredient
  const { data: todaysIngredient } = useQuery({
    queryKey: ['/api/cooking/ingredient-of-day'],
    queryFn: async () => {
      const response = await fetch('/api/cooking/ingredient-of-day');
      if (!response.ok) throw new Error('Failed to fetch ingredient');
      return response.json();
    }
  });

  // Generate recipe content mutation
  const generateContentMutation = useMutation({
    mutationFn: async ({ ingredient, method }: { ingredient: string, method: string }) => {
      const response = await fetch('/api/cooking/generate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredient, method })
      });
      if (!response.ok) throw new Error('Failed to generate content');
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedContent(data.recipes);
      setBatchContent(null); // Clear batch content when generating single recipe
      toast({
        title: "Recipe generated!",
        description: `${selectedMethod} ${selectedIngredient || customIngredient} content is ready for all platforms`,
      });
    },
    onError: () => {
      toast({
        title: "Generation failed",
        description: "Could not generate recipe content. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Generate daily batch mutation
  const generateBatchMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/cooking/generate-daily-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to generate batch content');
      return response.json();
    },
    onSuccess: (data) => {
      setBatchContent(data.batchRecipes);
      setGeneratedContent(null); // Clear single content when generating batch
      toast({
        title: "Daily batch generated!",
        description: `Content for all 5 cooking methods with today's trending ingredient`,
      });
    },
    onError: () => {
      toast({
        title: "Batch generation failed",
        description: "Could not generate daily batch content. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleGenerate = () => {
    const ingredient = customIngredient || selectedIngredient;
    if (!ingredient || !selectedMethod) {
      toast({
        title: "Missing information",
        description: "Please select both an ingredient and cooking method",
        variant: "destructive",
      });
      return;
    }

    generateContentMutation.mutate({ ingredient, method: selectedMethod });
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(label);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
      setTimeout(() => setCopiedText(""), 2000);
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const selectedIngredientData = ingredients.find(ing => ing.value === selectedIngredient);
  const selectedMethodData = cookingMethods.find(method => method.value === selectedMethod);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <ChefHat className="h-8 w-8 text-orange-600" />
            <h1 className="text-4xl font-bold tracking-tight">Cooking Content Generator</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform any ingredient into engaging recipe content for your social media platforms
          </p>
        </div>

        {/* Today's Trending Ingredient */}
        {todaysIngredient && (
          <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
            <CardHeader>
              <CardTitle className="text-orange-800 flex items-center gap-2">
                🔥 Today's Trending Ingredient
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-orange-900">{todaysIngredient.name}</h3>
                  <p className="text-orange-700">{todaysIngredient.nutritionFacts}</p>
                  <Badge variant="secondary" className="mt-2">
                    {todaysIngredient.popularity}% popularity
                  </Badge>
                </div>
                <Button 
                  onClick={() => setSelectedIngredient(todaysIngredient.name)}
                  variant="outline"
                  className="bg-orange-100 border-orange-300 hover:bg-orange-200"
                >
                  Use This Ingredient
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Content Generation Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Generate Recipe Content
            </CardTitle>
            <CardDescription>
              Select an ingredient and cooking method to create platform-ready recipe content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Ingredient Selection */}
            <div className="space-y-3">
              <label className="text-sm font-semibold">Choose Ingredient:</label>
              <Select value={selectedIngredient} onValueChange={setSelectedIngredient}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an ingredient..." />
                </SelectTrigger>
                <SelectContent>
                  {ingredients.map((ingredient) => (
                    <SelectItem key={ingredient.value} value={ingredient.value}>
                      <div className="flex items-center justify-between w-full">
                        <span>{ingredient.label}</span>
                        <Badge variant="outline" className="ml-2">
                          {ingredient.popularity}%
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedIngredientData && (
                <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                  <strong>Nutrition:</strong> {selectedIngredientData.nutrition}
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Or enter custom ingredient:</label>
                <Textarea
                  placeholder="Enter your own ingredient..."
                  value={customIngredient}
                  onChange={(e) => setCustomIngredient(e.target.value)}
                  className="min-h-[60px]"
                />
              </div>
            </div>

            <Separator />

            {/* Cooking Method Selection */}
            <div className="space-y-3">
              <label className="text-sm font-semibold">Choose Cooking Method:</label>
              <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select cooking method..." />
                </SelectTrigger>
                <SelectContent>
                  {cookingMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      <div className="flex items-center gap-3">
                        <span>{method.label}</span>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {method.time}
                          </Badge>
                          <Badge variant="secondary">
                            {method.difficulty}
                          </Badge>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Generate Buttons */}
            <div className="flex justify-center gap-4 pt-4">
              <Button 
                onClick={handleGenerate}
                disabled={generateContentMutation.isPending || (!selectedIngredient && !customIngredient) || !selectedMethod}
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-8 py-3"
              >
                {generateContentMutation.isPending ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <ChefHat className="h-4 w-4 mr-2" />
                    Generate Recipe Content
                  </>
                )}
              </Button>
              
              <Button 
                onClick={() => generateBatchMutation.mutate()}
                disabled={generateBatchMutation.isPending}
                variant="outline"
                className="border-orange-600 text-orange-600 hover:bg-orange-50 px-8 py-3"
              >
                {generateBatchMutation.isPending ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                    Generating Batch...
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4 mr-2" />
                    Generate Daily Batch
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Generated Content Display */}
        {generatedContent && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold">Recipe Content Generated!</h2>
              <p className="text-muted-foreground">Platform-specific content ready for {generatedContent[0]?.productName} using {generatedContent[0]?.cookingMethod}</p>
            </div>
            
            {generatedContent.map((content, index) => {
              const platformColors = {
                'LinkedIn': 'bg-blue-50 border-blue-200',
                'Twitter': 'bg-sky-50 border-sky-200', 
                'Instagram': 'bg-pink-50 border-pink-200',
                'TikTok': 'bg-red-50 border-red-200',
                'YouTube Shorts': 'bg-red-50 border-red-200'
              };
              
              const platformIcons = {
                'LinkedIn': '💼',
                'Twitter': '🐦',
                'Instagram': '📸', 
                'TikTok': '🎵',
                'YouTube Shorts': '🎬'
              };
              
              return (
                <Card key={index} className={`${platformColors[content.platform as keyof typeof platformColors] || 'bg-gray-50 border-gray-200'}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <span className="text-2xl">{platformIcons[content.platform as keyof typeof platformIcons] || '📱'}</span>
                      {content.platform}
                      <Badge variant="outline" className="ml-auto">
                        {content.postType} • {content.videoDuration}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    
                    {/* Script */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">Script</h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(content.script, `${content.platform} Script`)}
                        >
                          {copiedText === `${content.platform} Script` ? <Check size={14} /> : <Copy size={14} />}
                          Copy
                        </Button>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <pre className="whitespace-pre-wrap text-sm">{content.script}</pre>
                      </div>
                    </div>

                    {/* Caption */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">Caption</h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(content.caption, `${content.platform} Caption`)}
                        >
                          {copiedText === `${content.platform} Caption` ? <Check size={14} /> : <Copy size={14} />}
                          Copy
                        </Button>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <p className="text-sm">{content.caption}</p>
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">Call-to-Action</h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(content.cta, `${content.platform} CTA`)}
                        >
                          {copiedText === `${content.platform} CTA` ? <Check size={14} /> : <Copy size={14} />}
                          Copy
                        </Button>
                      </div>
                      <div className="bg-blue-50 p-3 rounded border border-blue-200">
                        <p className="text-sm text-blue-800">{content.cta}</p>
                      </div>
                    </div>

                    {/* Hashtags */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">Hashtags</h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(content.hashtags, `${content.platform} Hashtags`)}
                        >
                          {copiedText === `${content.platform} Hashtags` ? <Check size={14} /> : <Copy size={14} />}
                          Copy
                        </Button>
                      </div>
                      <div className="bg-purple-50 p-3 rounded border border-purple-200">
                        <p className="text-sm text-purple-800">{content.hashtags}</p>
                      </div>
                    </div>

                    {/* Copy All for Platform */}
                    <Button 
                      className="w-full" 
                      variant="default"
                      onClick={() => copyToClipboard(
                        `${content.script}\n\n${content.caption}\n\n${content.cta}\n\n${content.hashtags}`, 
                        `Complete ${content.platform} Content`
                      )}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy All {content.platform} Content
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
            
            {/* Image Prompt (shared across platforms) */}
            {generatedContent[0] && (
              <Card className="bg-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    🎨 Image Prompt (All Platforms)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">Visual Description</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(generatedContent[0].imagePrompt, 'Image Prompt')}
                      >
                        {copiedText === 'Image Prompt' ? <Check size={14} /> : <Copy size={14} />}
                        Copy
                      </Button>
                    </div>
                    <div className="bg-white p-3 rounded border">
                      <p className="text-sm">{generatedContent[0].imagePrompt}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CookingGenerator;