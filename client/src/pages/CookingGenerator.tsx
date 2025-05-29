import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sparkles, Copy, Check, ChefHat, Clock, Users } from "lucide-react";
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
  const [generatedContent, setGeneratedContent] = useState<RecipePayload | null>(null);
  const [copiedText, setCopiedText] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
      setGeneratedContent(data.recipe);
      toast({
        title: "Recipe generated!",
        description: `${selectedMethod} ${selectedIngredient || customIngredient} content is ready`,
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

            {/* Generate Button */}
            <div className="flex justify-center pt-4">
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
            </div>
          </CardContent>
        </Card>

        {/* Generated Content Display */}
        {generatedContent && (
          <Card className="bg-gray-800 text-white">
            <CardHeader>
              <CardTitle className="text-xl">{generatedContent.script.split('\n')[0]}</CardTitle>
              <CardDescription className="text-gray-300">
                {generatedContent.cookingMethod} • {generatedContent.videoDuration} • Ready for {generatedContent.platforms.join(', ')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Recipe Script */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Recipe Script</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(generatedContent.script, 'Recipe Script')}
                    className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                  >
                    {copiedText === 'Recipe Script' ? <Check size={14} /> : <Copy size={14} />}
                    <span className="ml-1">Copy</span>
                  </Button>
                </div>
                <div className="bg-gray-900 p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap text-gray-200 text-base leading-relaxed">
                    {generatedContent.script}
                  </pre>
                </div>
              </div>

              {/* Caption */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Social Media Caption</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(generatedContent.caption, 'Caption')}
                    className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                  >
                    {copiedText === 'Caption' ? <Check size={14} /> : <Copy size={14} />}
                    <span className="ml-1">Copy</span>
                  </Button>
                </div>
                <div className="bg-gray-900 p-4 rounded-lg">
                  <p className="text-gray-200">{generatedContent.caption}</p>
                </div>
              </div>

              {/* Call to Action */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Call to Action</h3>
                <div className="bg-gray-900 p-4 rounded-lg">
                  <p className="text-gray-200">{generatedContent.cta}</p>
                </div>
              </div>

              {/* Hashtags */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Hashtags</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(generatedContent.hashtags, 'Hashtags')}
                    className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                  >
                    {copiedText === 'Hashtags' ? <Check size={14} /> : <Copy size={14} />}
                    <span className="ml-1">Copy</span>
                  </Button>
                </div>
                <div className="bg-gray-900 p-4 rounded-lg">
                  <p className="text-blue-400">{generatedContent.hashtags}</p>
                </div>
              </div>

              {/* Image Prompt */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Image/Video Prompt</h3>
                <div className="bg-gray-900 p-4 rounded-lg">
                  <p className="text-gray-200 italic">{generatedContent.imagePrompt}</p>
                </div>
              </div>

              {/* Copy All Button */}
              <div className="flex justify-center pt-4">
                <Button
                  onClick={() => copyToClipboard(
                    `${generatedContent.script}\n\n${generatedContent.caption}\n\n${generatedContent.cta}\n\n${generatedContent.hashtags}`,
                    'All Content'
                  )}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {copiedText === 'All Content' ? <Check size={16} /> : <Copy size={16} />}
                  <span className="ml-2">Copy Complete Post</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CookingGenerator;