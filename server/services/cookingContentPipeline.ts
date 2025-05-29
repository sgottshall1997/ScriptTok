import { db } from "../db";
import { eq } from "drizzle-orm";

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

  async generateRecipeContent(ingredient: TrendingIngredient, method: string): Promise<RecipePayload[]> {
    const recipeData = this.getRecipeData(ingredient.name, method);
    const platforms = ['LinkedIn', 'Twitter', 'Instagram', 'TikTok', 'YouTube Shorts'];
    
    return platforms.map(platform => ({
      niche: "cooking",
      productName: ingredient.name,
      contentType: "recipePost",
      script: this.getPlatformScript(recipeData, platform, method),
      caption: this.getPlatformCaption(recipeData, platform),
      hashtags: this.getPlatformHashtags(recipeData, platform),
      cta: `🍳 Get the best ${method.replace(' ', '')} for perfect results → https://www.amazon.com/s?k=${method.replace(' ', '+')}&tag=sgottshall199-20`,
      platforms: [platform],
      videoDuration: this.getPlatformDuration(platform),
      imagePrompt: recipeData.imagePrompt,
      cookingMethod: method,
      postType: this.getPlatformType(platform),
      platform: platform
    }));
  }

  private getPlatformScript(recipeData: any, platform: string, method: string): string {
    const baseScript = recipeData.script;
    
    switch (platform) {
      case 'LinkedIn':
        return `🔥 Professional Kitchen Tip: ${method} Mastery

${baseScript}

💼 Why this matters for busy professionals:
• Quick, efficient cooking method
• Consistent, restaurant-quality results
• Perfect for meal prep and time management

What's your go-to cooking method for busy weekdays?`;

      case 'Twitter':
        return `🔥 Quick ${method} tip thread 🧵

${baseScript.split('\n').slice(0, 8).join('\n')}

💡 Pro tip: This method saves 30% cooking time while maintaining perfect results!

What's your favorite quick cooking hack? 👇`;

      case 'Instagram':
      case 'TikTok':
      case 'YouTube Shorts':
        return `🔥 ${method} hack that'll change your cooking game!

${baseScript}

✨ Follow for more cooking tips that actually work!
📱 Tag a friend who needs to see this!
🎬 WATCH UNTIL THE END for the secret tip!`;

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
      recipes.push(recipe);
    }

    return recipes;
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