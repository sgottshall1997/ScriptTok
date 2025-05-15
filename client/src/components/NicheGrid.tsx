import React, { useState } from 'react';
import { useLocation } from 'wouter';
import NicheCard from './NicheCard';
import { Button } from '@/components/ui/button';
import { NICHES } from '@shared/constants';
import { trackEvent } from '@/lib/analytics';

// Map of niche descriptions - should be loaded from backend in production
const nicheDescriptions: Record<string, string> = {
  skincare: "Generate content for skincare, beauty, and cosmetic products with specialized templates for routines, ingredient analysis, and before-after comparisons.",
  tech: "Create tech reviews, comparisons, and tutorials for gadgets, software, and electronics with specifications and feature-focused templates.",
  fashion: "Produce stylish content for apparel, accessories, and footwear with outfit pairing guides, seasonal collections, and style trend analysis.",
  fitness: "Develop workout routines, supplement reviews, and equipment guides with templates designed for fitness enthusiasts and wellness products.",
  food: "Craft recipes, cookware reviews, and meal plan content with specialized formats for ingredients, nutritional information, and cooking techniques.",
  travel: "Build travel guides, gear reviews, and destination comparisons with templates for itineraries, packing lists, and travel essentials.",
  pet: "Generate pet care content, product reviews, and training guides with specialized templates for different pet types, breeds, and care routines."
};

// Map of template counts for each niche
const nicheTemplateCounts: Record<string, number> = {
  skincare: 18,
  tech: 14,
  fashion: 12,
  fitness: 15,
  food: 11,
  travel: 10,
  pet: 9
};

// Map of niche titles with proper capitalization and formatting
const nicheTitles: Record<string, string> = {
  skincare: "Skincare & Beauty",
  tech: "Technology & Gadgets",
  fashion: "Fashion & Apparel",
  fitness: "Fitness & Wellness",
  food: "Food & Cooking",
  travel: "Travel & Adventure",
  pet: "Pet Care & Products"
};

interface NicheGridProps {
  initialNiche?: string;
  onNicheSelect?: (niche: string) => void;
  showStartButton?: boolean;
}

const NicheGrid: React.FC<NicheGridProps> = ({ 
  initialNiche = '',
  onNicheSelect,
  showStartButton = true 
}) => {
  const [selectedNiche, setSelectedNiche] = useState<string>(initialNiche);
  const [_, navigate] = useLocation();

  const handleNicheSelect = (niche: string) => {
    setSelectedNiche(niche);
    
    // Call the parent component's onNicheSelect if provided
    if (onNicheSelect) {
      onNicheSelect(niche);
    }
    
    // Track the niche selection event
    trackEvent('select_niche', 'engagement', niche);
  };

  const handleGetStarted = () => {
    if (selectedNiche) {
      // Navigate to the niche page
      navigate(`/niche/${selectedNiche}`);
      
      // Track the start button click
      trackEvent('start_with_niche', 'conversion', selectedNiche);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {NICHES.map((niche) => (
          <NicheCard
            key={niche}
            niche={niche}
            title={nicheTitles[niche] || niche.charAt(0).toUpperCase() + niche.slice(1)}
            description={nicheDescriptions[niche] || `Generate content for ${niche} products and services.`}
            icon=""
            bgClass=""
            textClass=""
            borderClass=""
            templateCount={nicheTemplateCounts[niche] || 10}
            isSelected={selectedNiche === niche}
            onSelect={handleNicheSelect}
          />
        ))}
      </div>
      
      {showStartButton && (
        <div className="flex justify-center mt-8">
          <Button
            size="lg"
            disabled={!selectedNiche}
            onClick={handleGetStarted}
            className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-bold py-6 px-10 rounded-lg text-lg shadow-xl transition-all hover:shadow-2xl hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {selectedNiche ? (
              <>Get Started with {nicheTitles[selectedNiche]}</>
            ) : (
              <>Select a Niche to Continue</>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default NicheGrid;