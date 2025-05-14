import { FC, useState, useRef } from "react";
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
  
  // Using refs and state to store the form values
  const productInputRef = useRef<HTMLInputElement>(null);
  const [templateType, setTemplateType] = useState("original");
  const [tone, setTone] = useState("friendly");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get the product value directly from the ref
    const productValue = productInputRef.current?.value.trim();
    
    // Validate form
    if (!productValue) {
      toast({
        title: "Product name required",
        description: "Please enter a product name to generate content",
        variant: "destructive",
      });
      return;
    }
    
    // Create the request data
    const requestData = {
      product: productValue,
      templateType,
      tone
    };
    
    try {
      setIsGenerating(true);
      
      const response = await apiRequest('POST', '/api/generate', requestData);
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
    <Card className="shadow-xl bg-white/80 backdrop-blur-sm border border-gray-200">
      <CardHeader className="bg-gradient-to-r from-violet-50 to-blue-50 rounded-t-lg border-b border-neutral-200 py-5">
        <CardTitle className="text-gradient bg-gradient-to-r from-violet-600 to-blue-600 font-bold text-xl">Generate Content</CardTitle>
        <p className="text-sm text-gray-700">Create AI-powered affiliate content with trending data</p>
      </CardHeader>
      <CardContent className="p-5">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
            <label htmlFor="product" className="block text-sm font-medium text-blue-700 mb-2">
              Product Name
            </label>
            <Input
              id="product"
              name="product"
              ref={productInputRef}
              placeholder="e.g. The Ordinary Niacinamide Serum"
              className="w-full border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              defaultValue=""
            />
            <p className="mt-1 text-xs text-gray-500">Enter the skincare or beauty product you want to generate content for</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
              <label htmlFor="template-type" className="block text-sm font-medium text-violet-700 mb-2">
                Template Type
              </label>
              <Select 
                value={templateType} 
                onValueChange={setTemplateType}
              >
                <SelectTrigger id="template-type" className="w-full border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100">
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
              <p className="mt-1 text-xs text-gray-500">Choose the format for your affiliate content</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
              <label htmlFor="tone" className="block text-sm font-medium text-pink-700 mb-2">
                Content Tone
              </label>
              <Select
                value={tone}
                onValueChange={setTone}
              >
                <SelectTrigger id="tone" className="w-full border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100">
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
              <p className="mt-1 text-xs text-gray-500">Select the voice and style for your content</p>
            </div>
          </div>
          
          <div className="flex justify-center mt-8">
            <Button 
              type="submit"
              className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-lg text-lg shadow-xl transform transition hover:scale-105 w-full max-w-md"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin mr-3 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-lg">Generating Your Content...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-lg">GENERATE CONTENT</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ContentGenerator;