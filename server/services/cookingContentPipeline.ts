import { db } from "../db";
import { eq } from "drizzle-orm";
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface RecipePayload {
  niche: string;
  productName: string;
  contentType: string;
  script: string;
  captionAndHashtags: string;
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

class CookingContentPipeline {
  private cookingMethods = [
    'air fryer',
    'oven baked',
    'grilled',
    'pan seared',
    'slow cooker'
  ];

  private trendingIngredients = [
    { name: 'Chicken Breast', popularity: 95, seasonality: 'year-round', nutritionFacts: 'High protein, low fat' },
    { name: 'Salmon', popularity: 88, seasonality: 'year-round', nutritionFacts: 'Omega-3 rich, high protein' },
    { name: 'Sweet Potato', popularity: 82, seasonality: 'fall/winter', nutritionFacts: 'High fiber, vitamin A' },
    { name: 'Avocado', popularity: 90, seasonality: 'year-round', nutritionFacts: 'Healthy fats, potassium' },
    { name: 'Quinoa', popularity: 75, seasonality: 'year-round', nutritionFacts: 'Complete protein, gluten-free' },
    { name: 'Brussels Sprouts', popularity: 68, seasonality: 'fall/winter', nutritionFacts: 'High vitamin K, fiber' },
    { name: 'Cauliflower', popularity: 85, seasonality: 'year-round', nutritionFacts: 'Low carb, vitamin C' },
    { name: 'Ground Turkey', popularity: 79, seasonality: 'year-round', nutritionFacts: 'Lean protein, versatile' }
  ];

  async selectTrendingIngredientOfDay(): Promise<TrendingIngredient> {
    // Use day of year for daily rotation
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const index = dayOfYear % this.trendingIngredients.length;
    
    return this.trendingIngredients[index];
  }

  private stringToHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  }

  async generateRecipeContentWithSkillLevel(ingredient: TrendingIngredient, method: string, skillLevel: string): Promise<RecipePayload[]> {
    const platforms = ['LinkedIn', 'Twitter', 'Instagram', 'TikTok', 'YouTube Shorts'];
    const recipes: RecipePayload[] = [];

    for (const platform of platforms) {
      const recipeData = this.getRecipeDataWithSkillLevel(ingredient.name, method, skillLevel);
      
      const recipe: RecipePayload = {
        niche: 'cooking',
        productName: `${method} ${ingredient.name}`,
        contentType: 'recipe',
        script: this.getPlatformScriptWithSkillLevel(recipeData, platform, method, skillLevel),
        caption: this.getPlatformCaptionWithSkillLevel(recipeData, platform, skillLevel),
        hashtags: this.getPlatformHashtags(recipeData, platform),
        cta: `Buy it here: https://www.amazon.com/dp/B08N5WRWNW?tag=sgottshall199-20`,
        platforms: [platform],
        videoDuration: this.getPlatformDuration(platform),
        imagePrompt: `Professional food photography of ${method.toLowerCase()} ${ingredient.name.toLowerCase()}, beautifully plated, warm lighting, shallow depth of field, restaurant quality presentation`,
        cookingMethod: method,
        postType: this.getPlatformType(platform)
      };

      recipes.push(recipe);
    }

    return recipes;
  }

  async generateRecipeContent(ingredient: TrendingIngredient, method: string): Promise<RecipePayload[]> {
    const recipeData = this.getRecipeData(ingredient.name, method);
    const platforms = ['LinkedIn', 'Twitter', 'Instagram', 'TikTok', 'YouTube Shorts'];
    
    return platforms.map(platform => ({
      niche: "cooking",
      productName: ingredient.name,
      contentType: "recipePost",
      script: this.getPlatformScript(recipeData, platform, method),
      captionAndHashtags: this.getCombinedCaptionAndHashtags(recipeData, platform, method),
      platforms: [platform],
      videoDuration: this.getPlatformDuration(platform),
      imagePrompt: recipeData.imagePrompt,
      cookingMethod: method,
      postType: this.getPlatformType(platform),
      platform: platform
    }));
  }

  private getPlatformScriptWithSkillLevel(recipeData: any, platform: string, method: string, skillLevel: string): string {
    const skillIntros = {
      'Elite Chef': 'Here\'s a recipe for you elite chefs',
      'Skilled Home Chef': 'Here\'s a recipe for you skilled home chefs', 
      'Beginner': 'Here\'s a recipe for you beginners'
    };

    const intro = skillIntros[skillLevel as keyof typeof skillIntros];
    const baseScript = this.getPlatformScript(recipeData, platform, method);
    
    return `${intro} - ${baseScript}`;
  }

  private getPlatformCaptionWithSkillLevel(recipeData: any, platform: string, skillLevel: string): string {
    const skillIntros = {
      'Elite Chef': 'For you elite chefs',
      'Skilled Home Chef': 'For you skilled home chefs',
      'Beginner': 'For you beginners'
    };

    const intro = skillIntros[skillLevel as keyof typeof skillIntros];
    const baseCaption = this.getPlatformCaption(recipeData, platform);
    
    // Add app store CTA before hashtags
    const captionWithCTA = `${intro} - ${baseCaption}\n\nTry us out for free in the iPhone App Store!`;
    
    return captionWithCTA;
  }

  private getPlatformScript(recipeData: any, platform: string, method: string): string {
    const baseScript = recipeData.script;
    
    switch (platform) {
      case 'LinkedIn':
        return `Professional Kitchen Tip: ${method} Mastery

${baseScript}

Why this matters for busy professionals:
• Quick, efficient cooking method
• Consistent, restaurant-quality results
• Perfect for meal prep and time management

What's your go-to cooking method for busy weekdays?`;

      case 'Twitter':
        return `Quick ${method} tip thread

${baseScript.split('\n').slice(0, 8).join('\n')}

Pro tip: This method saves 30% cooking time while maintaining perfect results!

What's your favorite quick cooking hack?`;

      case 'Instagram':
      case 'TikTok':
      case 'YouTube Shorts':
        return `${method} hack that'll change your cooking game!

${baseScript}

Follow for more cooking tips that actually work!
Tag a friend who needs to see this!
WATCH UNTIL THE END for the secret tip!`;

      default:
        return baseScript;
    }
  }

  private getPlatformCaption(recipeData: any, platform: string): string {
    const baseCaption = recipeData.caption;
    
    switch (platform) {
      case 'LinkedIn':
        return `${baseCaption} Perfect for busy professionals who want restaurant-quality meals at home. What's your go-to quick cooking method?`;

      case 'Twitter':
        return `${baseCaption} Quick thread below 👇`;

      case 'Instagram':
        return `${baseCaption} Double tap if you're trying this tonight! 💫`;

      case 'TikTok':
        return `${baseCaption} Follow for more cooking hacks! 🔥`;

      case 'YouTube Shorts':
        return `${baseCaption} LIKE & SUBSCRIBE for daily cooking tips! 🔔`;

      default:
        return baseCaption;
    }
  }

  private getCombinedCaptionAndHashtags(recipeData: any, platform: string, method: string): string {
    const baseCaption = this.getPlatformCaption(recipeData, platform);
    const cta = `🍳 Get the best ${method.replace(' ', '')} for perfect results → https://www.amazon.com/s?k=${method.replace(' ', '+')}&tag=sgottshall199-20`;
    const hashtags = this.getPlatformHashtags(recipeData, platform);
    
    // Combine caption, CTA, and hashtags in one flowing section
    return `${baseCaption} ${cta}\n${hashtags}`;
  }

  private getPlatformHashtags(recipeData: any, platform: string): string {
    const baseHashtags = recipeData.hashtags;
    
    switch (platform) {
      case 'LinkedIn':
        return `${baseHashtags} #ProfessionalCooking #MealPrep #WorkLifeBalance #CookingTips`;

      case 'Twitter':
        return `${baseHashtags} #CookingThread #FoodieTwitter #QuickMeals`;

      case 'Instagram':
        return `${baseHashtags} #FoodieGram #InstaFood #CookingReels #FoodPhotography`;

      case 'TikTok':
        return `${baseHashtags} #CookingHacks #FoodTok #Recipe #Viral #FYP`;

      case 'YouTube Shorts':
        return `${baseHashtags} #Shorts #CookingShorts #Recipe #FoodHacks`;

      default:
        return baseHashtags;
    }
  }

  private getPlatformDuration(platform: string): string {
    switch (platform) {
      case 'LinkedIn':
        return '2-3 min';
      case 'Twitter':
        return '30s';
      case 'Instagram':
        return '30-45s';
      case 'TikTok':
        return '30-45s';
      case 'YouTube Shorts':
        return '30-45s';
      default:
        return '45s';
    }
  }

  private getPlatformType(platform: string): string {
    switch (platform) {
      case 'LinkedIn':
        return 'carousel';
      case 'Twitter':
        return 'thread';
      case 'Instagram':
        return 'reel';
      case 'TikTok':
        return 'video';
      case 'YouTube Shorts':
        return 'short';
      default:
        return 'video';
    }
  }

  private getRecipeDataWithSkillLevel(ingredient: string, method: string, skillLevel: string) {
    const baseData = this.getRecipeData(ingredient, method);
    
    // Customize complexity based on skill level
    const skillModifications = {
      'Elite Chef': {
        techniques: ['advanced knife work', 'precision temperature control', 'flavor layering', 'molecular gastronomy techniques'],
        equipment: ['professional-grade tools', 'specialized equipment', 'precision instruments'],
        complexity: 'restaurant-quality execution with advanced techniques'
      },
      'Skilled Home Chef': {
        techniques: ['proper seasoning', 'temperature monitoring', 'multi-step preparation', 'flavor balance'],
        equipment: ['quality home kitchen tools', 'digital thermometer', 'good knife skills'],
        complexity: 'intermediate techniques with attention to detail'
      },
      'Beginner': {
        techniques: ['basic cooking methods', 'simple seasoning', 'straightforward preparation'],
        equipment: ['basic kitchen tools', 'simple equipment', 'beginner-friendly utensils'],
        complexity: 'easy-to-follow steps with clear instructions'
      }
    };

    return {
      ...baseData,
      skillLevel,
      ...skillModifications[skillLevel as keyof typeof skillModifications]
    };
  }

  private getRecipeData(ingredient: string, method: string) {
    const recipeMap: Record<string, Record<string, any>> = {
      "Chicken Breast": {
        "air fryer": {
          script: `🔥 Perfect Air Fryer Chicken Breast in 20 Minutes!

🥘 INGREDIENTS:
• 2 chicken breasts (6-8 oz each)
• 1 tbsp olive oil
• 1 tsp garlic powder
• 1 tsp paprika
• Salt & pepper to taste

⏱️ STEPS:
1. Preheat air fryer to 375°F
2. Brush chicken with olive oil
3. Season both sides generously
4. Cook 12 minutes, flip halfway
5. Check internal temp (165°F)
6. Rest 5 minutes before slicing

💡 Pro tip: Pound to even thickness for perfect cooking!

The result? Juicy, tender chicken with a golden crispy outside every time! 🙌`,
          caption: "🔥 Air Fryer Chicken = Dinner Hero! Juicy, crispy perfection in 20 mins. Who's trying this tonight? 🍗✨",
          hashtags: "#airfryer #chickenrecipe #quickmeals #dinnerinspo #healthyeats #proteinpacked",
          imagePrompt: "Golden crispy air fryer chicken breast sliced on a white plate with herbs garnish, steam rising"
        },
        "oven baked": {
          script: `🔥 The Perfect Oven Baked Chicken Breast!

🥘 INGREDIENTS:
• 4 chicken breasts
• 2 tbsp olive oil
• 1 tsp Italian seasoning
• 1 tsp garlic powder
• Salt & pepper

⏱️ STEPS:
1. Preheat oven to 425°F
2. Pat chicken dry & season
3. Heat oil in oven-safe skillet
4. Sear chicken 3 min per side
5. Transfer to oven 15-18 min
6. Rest before serving

💡 The sear locks in all the juices!

Say goodbye to dry chicken forever! 🙌`,
          caption: "🔥 Oven baked chicken that's actually juicy! The secret is in the sear. Save this recipe! 🍗",
          hashtags: "#ovenbaked #chickenrecipe #easydinner #mealprep #healthycooking #dinnergoals",
          imagePrompt: "Perfectly baked chicken breast in cast iron skillet with golden brown color and herbs"
        }
      },
      "Salmon": {
        "air fryer": {
          script: `🐟 Crispy Air Fryer Salmon in 12 Minutes!

🥘 INGREDIENTS:
• 4 salmon fillets (6 oz each)
• 1 tbsp olive oil
• 1 tsp lemon pepper
• 1 tsp garlic powder
• Fresh dill

⏱️ STEPS:
1. Preheat air fryer to 400°F
2. Pat salmon dry, brush with oil
3. Season with spices
4. Cook 10-12 minutes (no flip!)
5. Garnish with fresh dill
6. Serve with lemon wedges

💡 Skin-side down for crispy skin!

Restaurant-quality salmon at home! 🌟`,
          caption: "🐟 Air fryer salmon is a GAME CHANGER! Crispy outside, flaky inside. Omega-3 goodness in 12 mins! ✨",
          hashtags: "#airfryersalmon #healthyeats #seafood #omega3 #quickdinner #pescatarian",
          imagePrompt: "Perfectly cooked air fryer salmon fillet with crispy skin, garnished with dill and lemon"
        }
      }
    };

    // Default fallback for any ingredient/method combination
    const defaultRecipe = {
      script: `🔥 Amazing ${method} ${ingredient}!

This ${method} ${ingredient.toLowerCase()} recipe is incredibly easy and delicious!

⏱️ Quick cooking method that locks in flavor
🥘 Simple ingredients you already have
💡 Perfect for busy weeknights

Ready to transform your dinner routine? Let's cook! 🙌`,
      caption: `🔥 ${method} ${ingredient} hits different! Who's trying this cooking method? ✨`,
      hashtags: `#${method.replace(' ', '')} #${ingredient.toLowerCase().replace(' ', '')}recipe #easycooking #dinnerinspo`,
      imagePrompt: `Beautifully cooked ${ingredient.toLowerCase()} using ${method} method on an elegant plate`
    };

    return recipeMap[ingredient]?.[method] || defaultRecipe;
  }

  async generateDailyRecipes(): Promise<RecipePayload[]> {
    const ingredient = await this.selectTrendingIngredientOfDay();
    const recipes: RecipePayload[] = [];

    // Generate 3-5 recipes for different cooking methods
    const selectedMethods = this.cookingMethods.slice(0, 4); // Use first 4 methods

    for (const method of selectedMethods) {
      const recipe = await this.generateRecipeContent(ingredient, method);
      recipes.push(...recipe); // Flatten array since generateRecipeContent now returns an array
    }

    return recipes;
  }

  async generateDailyBatch(): Promise<RecipePayload[]> {
    const ingredient = await this.selectTrendingIngredientOfDay();
    
    // Select one cooking method per day (rotates daily)
    const today = new Date();
    const dayIndex = today.getDate() % this.cookingMethods.length;
    const selectedMethod = this.cookingMethods[dayIndex];
    
    console.log(`🎯 Daily method: ${selectedMethod} for ingredient: ${ingredient.name}`);
    
    // Generate content for 3 skill levels with all platforms
    const skillLevels = ['Elite Chef', 'Skilled Home Chef', 'Beginner'];
    const allRecipes: RecipePayload[] = [];
    
    for (const skillLevel of skillLevels) {
      const recipes = await this.generateRecipeContentWithSkillLevel(ingredient, selectedMethod, skillLevel);
      allRecipes.push(...recipes);
    }
    
    return allRecipes;
  }

  async generateCookAIngAdContent(): Promise<any> {
    const adVideoScript = `Tired of staring at your fridge wondering what to cook?

You have ingredients but no inspiration. Meal planning feels overwhelming. Cooking the same boring meals every week.

Meet CookAIng - the AI cooking assistant that transforms whatever's in your kitchen into amazing recipes instantly.

Just tell CookAIng what ingredients you have, and watch personalized recipes appear in seconds.

Custom recipes based on your ingredients and dietary needs. Supports air fryer, oven, grill, and 10+ cooking methods. Built by professional chefs and AI experts. Saves time, money, and eliminates food waste.

Download CookAIng today and never ask "what's for dinner?" again.

CAPTION:
Transform your kitchen chaos into culinary magic with CookAIng. Our AI cooking assistant turns whatever ingredients you have into personalized, delicious recipes in seconds. No more meal planning stress or food waste.

Try us on the app store for free!

#CookAIng #AIcooking #RecipeGenerator #MealPlanning #CookingHacks #FoodTech #KitchenAI #RecipeApp #CookingMadeEasy #FoodWaste #SmartCooking`;

    const linkedinPost = `The future of home cooking is here.

CookAIng is an AI-powered cooking assistant that solves one of the biggest challenges busy professionals face: deciding what to cook with limited time and ingredients.

Key benefits:
- Instantly generates custom recipes from your available ingredients
- Adapts to your dietary preferences and cooking skill level
- Supports multiple cooking methods from air fryer to slow cooker
- Reduces food waste and meal planning stress

Whether you're a seasoned chef or just starting your culinary journey, CookAIng makes cooking accessible, efficient, and enjoyable.

Ready to transform your kitchen experience? Try us on the app store for free!`;

    const tweet = `Stop staring at your fridge wondering what to cook. CookAIng turns your random ingredients into amazing recipes instantly. AI-powered cooking made simple. Try us on the app store for free!`;

    return {
      videoScript: adVideoScript,
      linkedinPost: linkedinPost,
      tweet: tweet,
      videoDuration: "45-60 seconds",
      platform: "Multi-platform CookAIng Ad"
    };
  }

  private async generateAdVideoScript(): Promise<string> {
    const prompt = `You are a world-class direct-response ad copywriter and video script strategist working for a viral food-tech startup.

Write a polished, Pictory-ready video ad script (under 60 seconds) promoting CookAIng, an AI-powered cooking assistant app that generates custom recipes based on ingredients, dietary needs, and cooking methods.

Structure:
- Hook (1-2 lines) — Grab attention FAST
- Problem (2-3 lines) — Common frustration with cooking
- Solution (2-3 lines) — Introduce CookAIng as the fix
- Demo Line (1-2 lines) — What does the user see? What's the "wow" moment?
- Features (3-4 bullets) — What makes it great?
- Call to Action — Get people to download the app

Tone: Friendly, modern, trustworthy. Think: Tasty meets Headspace.

Format it in clear sections with bold titles.

Avoid fluff — make it conversion-focused. NO emojis.`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 800,
        temperature: 0.7,
      });
      
      return response.choices[0].message.content || 'Could not generate ad script';
    } catch (error) {
      console.error('OpenAI failed for ad script, trying Anthropic:', error);
      
      const response = await anthropic.messages.create({
        model: "claude-3-7-sonnet-20250219",
        max_tokens: 800,
        messages: [{ role: "user", content: prompt }],
      });
      
      return response.content[0].type === 'text' ? response.content[0].text : 'Could not generate ad script';
    }
  }

  private async generateAdLinkedInPost(): Promise<string> {
    const prompt = `Write a professional LinkedIn post promoting CookAIng, an AI cooking assistant app. 

Keep it:
- Professional but engaging
- 150-200 words
- Include a clear value proposition
- End with a call to action
- NO emojis
- Professional tone suitable for LinkedIn audience`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 300,
        temperature: 0.7,
      });
      
      return response.choices[0].message.content || 'Could not generate LinkedIn post';
    } catch (error) {
      console.error('OpenAI failed for LinkedIn post, trying Anthropic:', error);
      
      const response = await anthropic.messages.create({
        model: "claude-3-7-sonnet-20250219",
        max_tokens: 300,
        messages: [{ role: "user", content: prompt }],
      });
      
      return response.content[0].type === 'text' ? response.content[0].text : 'Could not generate LinkedIn post';
    }
  }

  private async generateAdTweet(): Promise<string> {
    const prompt = `Write a compelling Twitter/X post promoting CookAIng, an AI cooking assistant app.

Requirements:
- Under 280 characters
- Catchy and engaging
- Clear value proposition
- Include call to action
- NO emojis
- Twitter-appropriate tone`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 150,
        temperature: 0.7,
      });
      
      return response.choices[0].message.content || 'Could not generate tweet';
    } catch (error) {
      console.error('OpenAI failed for tweet, trying Anthropic:', error);
      
      const response = await anthropic.messages.create({
        model: "claude-3-7-sonnet-20250219",
        max_tokens: 150,
        messages: [{ role: "user", content: prompt }],
      });
      
      return response.content[0].type === 'text' ? response.content[0].text : 'Could not generate tweet';
    }
  }

  async sendToMakeWebhook(recipes: RecipePayload[]): Promise<boolean> {
    const webhookUrl = process.env.MAKE_WEBHOOK_URL;
    
    if (!webhookUrl) {
      console.log('⚠️ MAKE_WEBHOOK_URL not configured - recipes generated but not sent to Make.com');
      return false;
    }

    try {
      const payload = {
        source: 'CookAIng',
        timestamp: new Date().toISOString(),
        recipes: recipes,
        totalCount: recipes.length
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        console.log(`✅ Successfully sent ${recipes.length} recipes to Make.com`);
        return true;
      } else {
        console.error('❌ Failed to send to Make.com:', response.statusText);
        return false;
      }
    } catch (error) {
      console.error('❌ Error sending to Make.com:', error);
      return false;
    }
  }

  async storeDailyRecipes(recipes: RecipePayload[]): Promise<void> {
    // Note: This would require adding a cooking_recipes table to your schema
    // For now, we'll log the recipes
    console.log(`📝 Generated ${recipes.length} recipes for storage:`, {
      ingredient: recipes[0]?.productName,
      methods: recipes.map(r => r.cookingMethod),
      timestamp: new Date().toISOString()
    });
  }

  async runDailyPipeline(): Promise<{ success: boolean, count: number, sent: boolean }> {
    try {
      console.log('🚀 Starting daily cooking content pipeline...');
      
      const recipes = await this.generateDailyRecipes();
      console.log(`📝 Generated ${recipes.length} recipes`);
      
      await this.storeDailyRecipes(recipes);
      
      const sent = await this.sendToMakeWebhook(recipes);
      
      console.log('✅ Daily cooking content pipeline completed');
      
      return {
        success: true,
        count: recipes.length,
        sent
      };
    } catch (error) {
      console.error('❌ Daily cooking content pipeline failed:', error);
      return {
        success: false,
        count: 0,
        sent: false
      };
    }
  }
}

export const cookingPipeline = new CookingContentPipeline();