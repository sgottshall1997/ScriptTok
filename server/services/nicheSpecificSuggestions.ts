/**
 * Niche-Specific Claude AI Suggestions
 * Pre-populated suggestions for each niche-template combination
 */

import { storeSuggestion, type InsertClaudeAiSuggestion } from './claudeAiSuggestionsService';

interface NicheSuggestion {
  niche: string;
  templateType: string;
  tone: string;
  category: 'structure' | 'engagement' | 'conversion' | 'formatting' | 'tone';
  suggestion: string;
  reasoning: string;
  effectiveness: number;
  platform?: string;
}

/**
 * Comprehensive niche-specific suggestions database
 */
const NICHE_SUGGESTIONS: NicheSuggestion[] = [
  // BEAUTY NICHE
  {
    niche: 'beauty',
    templateType: 'product-review',
    tone: 'professional',
    category: 'structure',
    suggestion: 'Start with skin concern/problem, show before state, demonstrate product application, reveal results',
    reasoning: 'Beauty content performs best with clear problem-solution-result structure',
    effectiveness: 0.92
  },
  {
    niche: 'beauty',
    templateType: 'product-review',
    tone: 'professional',
    category: 'engagement',
    suggestion: 'Include specific skin tone/type recommendations and mention who this product works best for',
    reasoning: 'Beauty audiences want personalized recommendations that match their specific needs',
    effectiveness: 0.88
  },
  {
    niche: 'beauty',
    templateType: 'product-review',
    tone: 'professional',
    category: 'conversion',
    suggestion: 'Mention texture, finish, and wear time with specific details (e.g., "lasted 8 hours without touch-ups")',
    reasoning: 'Beauty buyers make decisions based on performance metrics and sensory details',
    effectiveness: 0.85
  },

  // TECH NICHE
  {
    niche: 'tech',
    templateType: 'tech-review',
    tone: 'professional',
    category: 'structure',
    suggestion: 'Lead with specs overview, highlight key features, demonstrate real-world performance, compare to alternatives',
    reasoning: 'Tech audiences want comprehensive feature analysis before making purchase decisions',
    effectiveness: 0.89
  },
  {
    niche: 'tech',
    templateType: 'tech-review',
    tone: 'professional',
    category: 'engagement',
    suggestion: 'Include actual performance benchmarks, battery life tests, or speed comparisons with numbers',
    reasoning: 'Tech buyers trust quantifiable data and real-world testing results',
    effectiveness: 0.91
  },
  {
    niche: 'tech',
    templateType: 'tech-review',
    tone: 'professional',
    category: 'conversion',
    suggestion: 'Address common concerns (price, compatibility, warranty) and mention who should/shouldn\'t buy',
    reasoning: 'Tech purchases involve significant research; addressing objections builds trust',
    effectiveness: 0.87
  },

  // FITNESS NICHE
  {
    niche: 'fitness',
    templateType: 'workout-guide',
    tone: 'motivational',
    category: 'structure',
    suggestion: 'Start with goal/target audience, show proper form, provide modifications, include progression tips',
    reasoning: 'Fitness content needs clear instruction hierarchy for safety and effectiveness',
    effectiveness: 0.86
  },
  {
    niche: 'fitness',
    templateType: 'product-review',
    tone: 'professional',
    category: 'engagement',
    suggestion: 'Demonstrate product in action during actual workout, show sweat/durability testing',
    reasoning: 'Fitness audiences want to see products perform under real exercise conditions',
    effectiveness: 0.84
  },

  // FASHION NICHE
  {
    niche: 'fashion',
    templateType: 'product-review',
    tone: 'casual',
    category: 'structure',
    suggestion: 'Show item styling options, fit on different body types, mixing/matching possibilities',
    reasoning: 'Fashion buyers want to see versatility and how items work in multiple contexts',
    effectiveness: 0.83
  },
  {
    niche: 'fashion',
    templateType: 'product-review',
    tone: 'casual',
    category: 'engagement',
    suggestion: 'Include sizing details, fabric feel, and care instructions with personal experience',
    reasoning: 'Fashion purchases often fail due to sizing/care issues; addressing these builds confidence',
    effectiveness: 0.81
  },

  // FOOD NICHE
  {
    niche: 'food',
    templateType: 'recipe',
    tone: 'friendly',
    category: 'structure',
    suggestion: 'Show ingredients prep, cooking process, taste testing reaction, final plating presentation',
    reasoning: 'Food content succeeds with complete cooking journey and authentic taste reactions',
    effectiveness: 0.88
  },
  {
    niche: 'food',
    templateType: 'product-review',
    tone: 'casual',
    category: 'engagement',
    suggestion: 'Compare taste to familiar foods, mention texture, include family/friends reactions',
    reasoning: 'Food decisions are highly personal; relatable comparisons help viewers judge appeal',
    effectiveness: 0.85
  },

  // TRAVEL NICHE
  {
    niche: 'travel',
    templateType: 'travel-guide',
    tone: 'informative',
    category: 'structure',
    suggestion: 'Include practical details (cost, time needed, booking tips) alongside experience highlights',
    reasoning: 'Travel content must balance inspiration with actionable planning information',
    effectiveness: 0.87
  },
  {
    niche: 'travel',
    templateType: 'product-review',
    tone: 'professional',
    category: 'engagement',
    suggestion: 'Test travel gear in actual travel conditions, show packing demonstrations, durability tests',
    reasoning: 'Travel gear buyers need confidence in real-world performance and space efficiency',
    effectiveness: 0.84
  },

  // PETS NICHE
  {
    niche: 'pets',
    templateType: 'pet-care',
    tone: 'caring',
    category: 'structure',
    suggestion: 'Show pet\'s initial reaction, demonstrate product use, capture pet enjoying/using item',
    reasoning: 'Pet content succeeds when pets are clearly happy and engaged with products',
    effectiveness: 0.89
  },
  {
    niche: 'pets',
    templateType: 'product-review',
    tone: 'informative',
    category: 'engagement',
    suggestion: 'Include pet size/breed suitability, safety considerations, cleaning/maintenance tips',
    reasoning: 'Pet owners prioritize safety and practical care requirements over features',
    effectiveness: 0.86
  }
];

/**
 * Populate database with niche-specific suggestions
 */
export async function populateNicheSpecificSuggestions(): Promise<{
  success: boolean;
  populated: number;
  skipped: number;
}> {
  console.log('🎯 Populating niche-specific Claude AI suggestions...');
  
  let populated = 0;
  let skipped = 0;

  for (const suggestion of NICHE_SUGGESTIONS) {
    try {
      await storeSuggestion({
        niche: suggestion.niche,
        category: suggestion.category,
        suggestion: suggestion.suggestion,
        templateType: suggestion.templateType,
        platform: suggestion.platform || 'universal',
        tone: suggestion.tone,
        effectiveness: suggestion.effectiveness,
        reasoning: suggestion.reasoning,
        usageCount: 0
      });
      
      populated++;
      console.log(`✅ Added ${suggestion.category} suggestion for ${suggestion.niche}-${suggestion.templateType}`);
      
    } catch (error) {
      // Suggestion might already exist
      skipped++;
      console.log(`⚠️ Skipped ${suggestion.niche}-${suggestion.templateType}-${suggestion.category} (likely exists)`);
    }
  }

  console.log(`🎉 Populated ${populated} suggestions, skipped ${skipped} existing ones`);
  
  return {
    success: true,
    populated,
    skipped
  };
}

/**
 * Get suggestions count by niche
 */
export function getSuggestionsCountByNiche(): Record<string, number> {
  const counts: Record<string, number> = {};
  
  NICHE_SUGGESTIONS.forEach(suggestion => {
    if (!counts[suggestion.niche]) {
      counts[suggestion.niche] = 0;
    }
    counts[suggestion.niche]++;
  });
  
  return counts;
}

/**
 * Get suggestions by niche and template type
 */
export function getSuggestionsByNicheTemplate(niche: string, templateType: string): NicheSuggestion[] {
  return NICHE_SUGGESTIONS.filter(s => 
    s.niche === niche && s.templateType === templateType
  );
}