import React from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Check } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

interface NicheCardProps {
  niche: string;
  title: string;
  description: string;
  icon: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  templateCount: number;
  isSelected?: boolean;
  onSelect?: (niche: string) => void;
}

// Map of niche names to SVG icons or emoji representations
const nicheIcons: Record<string, React.ReactNode> = {
  skincare: '✨',
  tech: '📱',
  fashion: '👕',
  fitness: '🏋️',
  food: '🍳',
  travel: '✈️',
  pet: '🐾'
};

// Map of niche names to background gradient classes
const nicheBgClasses: Record<string, string> = {
  skincare: 'from-pink-100 to-purple-100',
  tech: 'from-blue-100 to-cyan-100',
  fashion: 'from-amber-100 to-yellow-100',
  fitness: 'from-green-100 to-emerald-100',
  food: 'from-orange-100 to-amber-100',
  travel: 'from-blue-100 to-indigo-100',
  pet: 'from-purple-100 to-indigo-100'
};

// Map of niche names to text color classes
const nicheTextClasses: Record<string, string> = {
  skincare: 'text-pink-600',
  tech: 'text-blue-600',
  fashion: 'text-amber-600',
  fitness: 'text-green-600',
  food: 'text-orange-600',
  travel: 'text-blue-700',
  pet: 'text-purple-600'
};

// Map of niche names to border color classes
const nicheBorderClasses: Record<string, string> = {
  skincare: 'border-pink-200 hover:border-pink-300',
  tech: 'border-blue-200 hover:border-blue-300',
  fashion: 'border-amber-200 hover:border-amber-300',
  fitness: 'border-green-200 hover:border-green-300',
  food: 'border-orange-200 hover:border-orange-300',
  travel: 'border-blue-300 hover:border-blue-400',
  pet: 'border-purple-200 hover:border-purple-300'
};

// Map of niches to relevant keywords
const nicheKeywords: Record<string, string[]> = {
  skincare: ['Moisturizer', 'Serum', 'Cleanser', 'Sunscreen', 'Toner'],
  tech: ['Gadgets', 'Phones', 'Laptops', 'Headphones', 'Smart Home'],
  fashion: ['Apparel', 'Shoes', 'Accessories', 'Watches', 'Bags'],
  fitness: ['Supplements', 'Equipment', 'Apparel', 'Tracking', 'Nutrition'],
  food: ['Cookware', 'Appliances', 'Utensils', 'Ingredients', 'Pantry'],
  travel: ['Luggage', 'Accessories', 'Gear', 'Clothing', 'Tech'],
  pet: ['Food', 'Toys', 'Beds', 'Grooming', 'Accessories']
};

const NicheCard: React.FC<NicheCardProps> = ({
  niche,
  title,
  description,
  icon,
  bgClass = '',
  textClass = '',
  borderClass = '',
  templateCount,
  isSelected = false,
  onSelect
}) => {
  // Use provided classes or fallback to the mapped classes by niche name
  const bgClassToUse = bgClass || nicheBgClasses[niche] || 'from-gray-100 to-gray-100';
  const textClassToUse = textClass || nicheTextClasses[niche] || 'text-gray-600';
  const borderClassToUse = borderClass || nicheBorderClasses[niche] || 'border-gray-200 hover:border-gray-300';
  const iconToUse = icon || nicheIcons[niche] || '📄';
  
  // Get keywords for this niche
  const keywords = nicheKeywords[niche] || [];
  
  // Handle card selection
  const handleSelect = () => {
    if (onSelect) {
      onSelect(niche);
      // Track niche selection event
      trackEvent('select_niche', 'engagement', niche);
    }
  };
  
  return (
    <Card 
      className={`overflow-hidden transition-all duration-300 ${borderClassToUse} ${isSelected ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
      onClick={handleSelect}
    >
      <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${bgClassToUse}`}></div>
      
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center text-xl bg-gradient-to-r ${bgClassToUse} ${textClassToUse} mr-3`}>
              {iconToUse}
            </div>
            <CardTitle className={`text-lg ${textClassToUse}`}>{title}</CardTitle>
          </div>
          {isSelected && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <Check className="h-3 w-3 mr-1" /> Selected
            </Badge>
          )}
        </div>
        <CardDescription className="mt-2">{description}</CardDescription>
      </CardHeader>
      
      <CardContent className="pb-3">
        <div className="flex flex-wrap gap-1 mb-3">
          {keywords.map((keyword, idx) => (
            <Badge key={idx} variant="secondary" className="bg-gray-100 text-gray-600 hover:bg-gray-200">
              {keyword}
            </Badge>
          ))}
        </div>
        <div className="text-sm text-gray-500">
          {templateCount} templates available
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 flex justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          className={`${textClassToUse} hover:bg-gray-100`}
          asChild
        >
          <Link href={`/templates?niche=${niche}`}>
            <BookOpen className="h-4 w-4 mr-1" /> 
            View Templates
          </Link>
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className={`${textClassToUse} hover:bg-gray-100`}
          asChild
        >
          <Link href={`/niche/${niche}`}>
            Generate Content
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NicheCard;