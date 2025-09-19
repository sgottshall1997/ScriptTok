/**
 * Personalization Provider - Mock Mode Implementation
 * Handles dynamic content adaptation based on audience rules
 */

interface AudienceRules {
  diet?: string[]; // ['vegan', 'gluten-free', 'keto']
  skill?: string; // 'beginner' | 'intermediate' | 'advanced'
  time?: string; // 'quick' | 'moderate' | 'extended'
  geo?: string; // 'US' | 'EU' | 'APAC'
  device?: string; // 'mobile' | 'desktop' | 'tablet'
  language?: string; // 'en' | 'es' | 'fr'
}

interface PersonalizationContext {
  originalContent: string;
  audienceRules: AudienceRules;
  platform?: string;
  templateType?: string;
}

interface PersonalizationResult {
  adaptedContent: string;
  appliedRules: string[];
  confidence: number;
  mode: 'mock' | 'live';
}

class PersonalizationProvider {
  /**
   * Adapt content based on audience rules
   */
  async adaptForAudience(context: PersonalizationContext): Promise<PersonalizationResult> {
    const mode = process.env.OPENAI_API_KEY ? 'live' : 'mock';
    
    if (mode === 'live') {
      return this.adaptLive(context);
    } else {
      return this.adaptMock(context);
    }
  }

  /**
   * Preview adaptation without applying
   */
  async previewAdaptation(context: PersonalizationContext): Promise<PersonalizationResult> {
    // Same logic as adapt, but for preview purposes
    return this.adaptForAudience(context);
  }

  private async adaptLive(context: PersonalizationContext): Promise<PersonalizationResult> {
    // Live implementation would use OpenAI/Claude for content adaptation
    // For now, fallback to mock
    return this.adaptMock(context);
  }

  private async adaptMock(context: PersonalizationContext): Promise<PersonalizationResult> {
    let adaptedContent = context.originalContent;
    const appliedRules: string[] = [];
    const { audienceRules } = context;

    // Diet-based adaptations
    if (audienceRules.diet) {
      for (const diet of audienceRules.diet) {
        switch (diet.toLowerCase()) {
          case 'vegan':
            adaptedContent = this.applyVeganAdaptations(adaptedContent);
            appliedRules.push('vegan_substitutions');
            break;
          case 'gluten-free':
            adaptedContent = this.applyGlutenFreeAdaptations(adaptedContent);
            appliedRules.push('gluten_free_substitutions');
            break;
          case 'keto':
            adaptedContent = this.applyKetoAdaptations(adaptedContent);
            appliedRules.push('keto_optimizations');
            break;
          case 'paleo':
            adaptedContent = this.applyPaleoAdaptations(adaptedContent);
            appliedRules.push('paleo_adjustments');
            break;
        }
      }
    }

    // Skill level adaptations
    if (audienceRules.skill) {
      switch (audienceRules.skill.toLowerCase()) {
        case 'beginner':
          adaptedContent = this.applyBeginnerAdaptations(adaptedContent);
          appliedRules.push('beginner_simplification');
          break;
        case 'advanced':
          adaptedContent = this.applyAdvancedAdaptations(adaptedContent);
          appliedRules.push('advanced_techniques');
          break;
        case 'intermediate':
          // Keep as is, but note the targeting
          appliedRules.push('intermediate_targeting');
          break;
      }
    }

    // Time constraint adaptations
    if (audienceRules.time) {
      switch (audienceRules.time.toLowerCase()) {
        case 'quick':
          adaptedContent = this.applyQuickTimeAdaptations(adaptedContent);
          appliedRules.push('quick_time_optimization');
          break;
        case 'extended':
          adaptedContent = this.applyExtendedTimeAdaptations(adaptedContent);
          appliedRules.push('detailed_preparation');
          break;
      }
    }

    // Geographic adaptations
    if (audienceRules.geo) {
      switch (audienceRules.geo.toUpperCase()) {
        case 'EU':
          adaptedContent = this.applyEUAdaptations(adaptedContent);
          appliedRules.push('eu_compliance');
          break;
        case 'APAC':
          adaptedContent = this.applyAPACAdaptations(adaptedContent);
          appliedRules.push('apac_localization');
          break;
      }
    }

    // Device-specific adaptations
    if (audienceRules.device) {
      switch (audienceRules.device.toLowerCase()) {
        case 'mobile':
          adaptedContent = this.applyMobileAdaptations(adaptedContent);
          appliedRules.push('mobile_optimization');
          break;
        case 'desktop':
          adaptedContent = this.applyDesktopAdaptations(adaptedContent);
          appliedRules.push('desktop_enhancement');
          break;
      }
    }

    // Language adaptations
    if (audienceRules.language && audienceRules.language !== 'en') {
      adaptedContent = this.applyLanguageAdaptations(adaptedContent, audienceRules.language);
      appliedRules.push(`${audienceRules.language}_localization`);
    }

    return {
      adaptedContent,
      appliedRules,
      confidence: 0.88,
      mode: 'mock'
    };
  }

  private applyVeganAdaptations(content: string): string {
    return content
      .replace(/\bchicken\b/gi, 'tofu')
      .replace(/\bbeef\b/gi, 'lentils')
      .replace(/\bmilk\b/gi, 'plant milk')
      .replace(/\bcheese\b/gi, 'nutritional yeast')
      .replace(/\beggs?\b/gi, 'flax eggs')
      .replace(/\bbutter\b/gi, 'vegan butter');
  }

  private applyGlutenFreeAdaptations(content: string): string {
    return content
      .replace(/\bflour\b/gi, 'gluten-free flour')
      .replace(/\bbread\b/gi, 'gluten-free bread')
      .replace(/\bpasta\b/gi, 'gluten-free pasta')
      .replace(/\bsoy sauce\b/gi, 'tamari');
  }

  private applyKetoAdaptations(content: string): string {
    return content
      .replace(/\brice\b/gi, 'cauliflower rice')
      .replace(/\bpotato\b/gi, 'radish')
      .replace(/\bsugar\b/gi, 'erythritol')
      .replace(/\bflour\b/gi, 'almond flour')
      .replace(/\bbread\b/gi, 'keto bread');
  }

  private applyPaleoAdaptations(content: string): string {
    return content
      .replace(/\bgrains?\b/gi, 'vegetables')
      .replace(/\blegumes?\b/gi, 'nuts')
      .replace(/\bdairy\b/gi, 'coconut products');
  }

  private applyBeginnerAdaptations(content: string): string {
    return content
      .replace(/\bsauté\b/gi, 'cook in a pan')
      .replace(/\bbraise\b/gi, 'cook slowly')
      .replace(/\bdeglaze\b/gi, 'add liquid to the pan')
      .replace(/\bemulsify\b/gi, 'mix together')
      .replace(/\bjulienne\b/gi, 'cut into thin strips');
  }

  private applyAdvancedAdaptations(content: string): string {
    return content
      .replace(/\bcook\b/gi, 'execute the technique')
      .replace(/\bmix\b/gi, 'incorporate thoroughly')
      .replace(/\bheat\b/gi, 'apply controlled thermal energy');
  }

  private applyQuickTimeAdaptations(content: string): string {
    return content
      .replace(/\b(\d+)\s*hours?\b/gi, (match, num) => `${Math.max(1, parseInt(num) - 1)} hours`)
      .replace(/\bmarinate overnight\b/gi, 'marinate 30 minutes')
      .replace(/\bslow cook\b/gi, 'quick cook')
      .replace(/\bsimmer\b/gi, 'bring to a quick boil');
  }

  private applyExtendedTimeAdaptations(content: string): string {
    return content
      .replace(/\bquick\b/gi, 'carefully prepared')
      .replace(/\b(\d+)\s*minutes?\b/gi, (match, num) => `${parseInt(num) + 10} minutes`)
      .replace(/\brush\b/gi, 'take your time');
  }

  private applyEUAdaptations(content: string): string {
    return content
      .replace(/\bcups?\b/gi, 'grams')
      .replace(/\bFahrenheit\b/gi, 'Celsius')
      .replace(/\boz\b/gi, 'ml');
  }

  private applyAPACAdaptations(content: string): string {
    return content
      .replace(/\bparsley\b/gi, 'coriander')
      .replace(/\bbasil\b/gi, 'Thai basil');
  }

  private applyMobileAdaptations(content: string): string {
    // Shorten content for mobile consumption
    return content
      .replace(/\. Additionally,/gi, '.')
      .replace(/\. Furthermore,/gi, '.')
      .replace(/\. Moreover,/gi, '.')
      .substring(0, Math.min(content.length, content.length * 0.8));
  }

  private applyDesktopAdaptations(content: string): string {
    // Add more detailed explanations for desktop
    return content
      .replace(/\. /gi, '. For best results, ')
      .replace(/\bTip:/gi, 'Pro Tip:');
  }

  private applyLanguageAdaptations(content: string, language: string): string {
    // Mock translation/localization
    const translations: Record<string, Record<string, string>> = {
      es: {
        'Recipe': 'Receta',
        'Ingredients': 'Ingredientes',
        'Instructions': 'Instrucciones',
        'Cook': 'Cocinar',
        'Heat': 'Calentar'
      },
      fr: {
        'Recipe': 'Recette',
        'Ingredients': 'Ingrédients',
        'Instructions': 'Instructions',
        'Cook': 'Cuire',
        'Heat': 'Chauffer'
      }
    };

    let adaptedContent = content;
    const langTranslations = translations[language];
    
    if (langTranslations) {
      Object.entries(langTranslations).forEach(([english, translated]) => {
        const regex = new RegExp(`\\b${english}\\b`, 'gi');
        adaptedContent = adaptedContent.replace(regex, translated);
      });
    }

    return adaptedContent;
  }
}

export const personalizationProvider = new PersonalizationProvider();
export default personalizationProvider;