import { FC, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { TEMPLATE_TYPE_OPTIONS, TONE_OPTIONS, GenerationResponse } from "@/lib/types";

interface ContentGeneratorProps {
  onGenerate: (content: GenerationResponse) => void;
}

const ContentGenerator: FC<ContentGeneratorProps> = ({ onGenerate }) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    product: "",
    templateType: "original",
    tone: "friendly"
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.product.trim()) {
      toast({
        title: "Product name required",
        description: "Please enter a product name to generate content",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsGenerating(true);
      
      const response = await apiRequest('POST', '/api/generate', formData);
      const data: GenerationResponse = await response.json();
      
      onGenerate(data);
      
      toast({
        title: "Content generated successfully",
        description: data.fromCache 
          ? "Content was retrieved from cache." 
          : "Fresh content was generated using OpenAI.",
      });
    } catch (error) {
      toast({
        title: "Error generating content",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader className="border-b border-neutral-200 py-5">
        <CardTitle className="text-lg font-semibold">Generate Content</CardTitle>
        <p className="text-sm text-muted-foreground">Create AI-powered affiliate content with trending data</p>
      </CardHeader>
      <CardContent className="p-5">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="product" className="block text-sm font-medium text-neutral-700 mb-1">
              Product Name
            </label>
            <Input
              id="product"
              name="product"
              value={formData.product}
              onChange={handleInputChange}
              placeholder="e.g. The Ordinary Niacinamide Serum"
              className="w-full"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="template-type" className="block text-sm font-medium text-neutral-700 mb-1">
                Template Type
              </label>
              <Select 
                value={formData.templateType} 
                onValueChange={(value) => handleSelectChange("templateType", value)}
              >
                <SelectTrigger id="template-type" className="w-full">
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  {TEMPLATE_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label htmlFor="tone" className="block text-sm font-medium text-neutral-700 mb-1">
                Content Tone
              </label>
              <Select
                value={formData.tone}
                onValueChange={(value) => handleSelectChange("tone", value)}
              >
                <SelectTrigger id="tone" className="w-full">
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  {TONE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-center mt-6">
            <Button 
              type="submit"
              className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-6 rounded-lg text-lg shadow-lg transform transition hover:scale-105 w-full"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating Content...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  GENERATE CONTENT
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ContentGenerator;
