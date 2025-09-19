// Content generation provider - supports both AI and mock modes
import { ContentBlueprint } from "../../../../shared/schema";

interface GenerationRequest {
  blueprint: ContentBlueprint;
  sourceData: any;
  options: {
    persona: string;
    tone: string;
    platform: string;
    duration: string;
    cta: string;
  };
}

// Mock content templates for different blueprint kinds
const mockTemplates = {
  video_script_short: {
    hook: "POV: You just discovered this amazing {{recipe_title}} recipe!",
    beats: [
      {
        timecode: "0-3s",
        scene: "Close-up of main ingredient on clean counter",
        dialogue: "Start with this one simple ingredient...",
        action: "Hand reaching for {{main_ingredient}}",
        broll: "Ingredient glamour shot with natural lighting",
        onScreenText: "{{recipe_title}} in 30 seconds"
      },
      {
        timecode: "3-8s", 
        scene: "Quick montage of prep steps",
        dialogue: "Mix these three things together",
        action: "Fast-paced chopping and mixing",
        broll: "Hands working, ingredients combining",
        onScreenText: "So easy!"
      },
      {
        timecode: "8-15s",
        scene: "Cooking process in action",
        dialogue: "Watch this magic happen",
        action: "Sizzling pan, bubbling, transforming",
        broll: "Steam rising, colors changing",
        onScreenText: "The secret is..."
      },
      {
        timecode: "15-25s",
        scene: "Final reveal and plating",
        dialogue: "And just like that...",
        action: "Plating the finished dish beautifully",
        broll: "Perfect final dish, multiple angles", 
        onScreenText: "Restaurant quality at home"
      },
      {
        timecode: "25-30s",
        scene: "Call to action with overlay",
        dialogue: "Try this tonight!",
        action: "Taking a satisfying bite",
        broll: "Happy reaction, thumbs up",
        onScreenText: "Recipe in comments ↓"
      }
    ],
    callToAction: {
      primary: "Get the full recipe in our app!",
      alt: ["Save this for later!", "Tag someone who needs this!", "Recipe below!"]
    },
    captions: ["This {{recipe_title}} is about to change your dinner game forever! 🤤"],
    hashtags: ["#recipe", "#cooking", "#foodhack", "#{{recipe_category}}", "#easyrecipes"],
    thumbnailPrompts: [
      "Mouth-watering close-up of finished {{recipe_title}} with dramatic lighting",
      "Before and after split showing ingredients vs final dish",
      "Hand holding fork with bite of food, shocked expression in background"
    ]
  },
  
  video_script_long: {
    title: "How to Make Perfect {{recipe_title}} - Complete Guide",
    description: "Learn to make restaurant-quality {{recipe_title}} at home with this step-by-step tutorial. I'll show you all my tips and tricks!",
    chapters: [
      { title: "Introduction & Ingredients", keyPoints: ["What makes this recipe special", "Ingredient selection tips"] },
      { title: "Prep Work", keyPoints: ["Proper knife techniques", "Getting organized"] }, 
      { title: "Cooking Process", keyPoints: ["Temperature control", "Timing tips"] },
      { title: "Finishing Touches", keyPoints: ["Plating techniques", "Garnish ideas"] },
      { title: "Variations & Storage", keyPoints: ["Recipe modifications", "Leftover tips"] }
    ],
    broll: ["Ingredient shots", "Hands working", "Process close-ups", "Final presentation"],
    callToAction: "Subscribe for more cooking tutorials and hit the bell for notifications!",
    timestamps: ["0:00 Intro", "1:30 Ingredients", "3:00 Prep", "5:30 Cooking", "8:00 Plating"]
  },
  
  carousel_step: {
    slides: [
      { headline: "{{recipe_title}}", body: "Ready in just {{cook_time}}!", imagePrompt: "Hero shot of finished dish" },
      { headline: "What You Need", body: "{{ingredient_count}} simple ingredients", imagePrompt: "Flat lay of all ingredients" },
      { headline: "Step 1: Prep", body: "{{prep_instruction}}", imagePrompt: "Hands prepping main ingredient" },
      { headline: "Step 2: Cook", body: "{{cook_instruction}}", imagePrompt: "Food cooking in pan/oven" },
      { headline: "Step 3: Finish", body: "{{finish_instruction}}", imagePrompt: "Adding final touches" },
      { headline: "Enjoy!", body: "Tag us when you make it! 👨‍🍳", imagePrompt: "Perfect final plating shot" }
    ],
    caption: "Save this {{recipe_title}} recipe for your next meal! Easy, delicious, and ready in {{cook_time}}. What's your favorite way to make this dish? Let me know in the comments! ⬇️",
    hashtags: ["#recipe", "#{{recipe_category}}", "#homecooking", "#foodie", "#delicious", "#easyrecipes"]
  },
  
  blog_recipe: {
    title: "Perfect {{recipe_title}}: Easy Recipe + Pro Tips",
    h2s: ["Why This {{recipe_title}} Recipe Works", "Ingredients You'll Need", "Step-by-Step Instructions", "Expert Tips for Success", "Recipe Variations", "Storage and Reheating"],
    meta: {
      title: "Easy {{recipe_title}} Recipe - Ready in {{cook_time}}!",
      description: "Learn to make delicious {{recipe_title}} at home with this foolproof recipe. Includes pro tips, variations, and storage advice.",
      keywords: ["{{recipe_title}} recipe", "how to make {{recipe_title}}", "easy {{recipe_title}}", "homemade {{recipe_title}}"]
    },
    faq: [
      { q: "How long does this {{recipe_title}} take to make?", a: "This recipe takes approximately {{total_time}} from start to finish." },
      { q: "Can I make this {{recipe_title}} ahead of time?", a: "Yes! You can prepare this up to {{prep_ahead_time}} in advance." },
      { q: "What can I substitute for {{main_ingredient}}?", a: "Great alternatives include {{substitutions}}." }
    ],
    schemaOrgJsonLd: {
      "@context": "https://schema.org",
      "@type": "Recipe",
      "name": "{{recipe_title}}",
      "description": "{{recipe_description}}",
      "cookTime": "{{cook_time}}",
      "prepTime": "{{prep_time}}"
    }
  },
  
  email_campaign: {
    subject: "Tonight's dinner sorted: {{recipe_title}} in {{cook_time}}",
    preheader: "Plus the one ingredient that makes all the difference...",
    blocks: [
      { type: "header", content: "Hey there, home chef!" },
      { type: "intro", content: "I know you're probably staring at your pantry right now wondering what to make for dinner. Well, I've got you covered with this incredible {{recipe_title}} recipe!" },
      { type: "recipe_highlight", content: "What makes this special? {{unique_selling_point}}. And the best part? You probably have most of these ingredients already!" },
      { type: "ingredients_tease", content: "The secret ingredient that takes this from good to amazing is {{secret_ingredient}}. Trust me on this one!" },
      { type: "cta", content: "Get the full recipe and start cooking in the next 10 minutes!" },
      { type: "ps", content: "P.S. This recipe works perfectly for meal prep too - make a big batch on Sunday!" }
    ],
    affiliateProducts: [
      { name: "Non-stick Pan (my favorite!)", url: "https://amzn.to/affiliate-pan" },
      { name: "Quality Olive Oil", url: "https://amzn.to/affiliate-oil" }
    ]
  },
  
  push_notification: {
    title: "🍳 Quick dinner idea!",
    body: "Make {{recipe_title}} with what's in your pantry right now",
    deepLink: "cookaing://recipe/{{recipe_id}}"
  }
};

export const contentProvider = {
  async generateContent(request: GenerationRequest): Promise<any> {
    const { blueprint, sourceData, options } = request;
    
    // Check if we have OpenAI API key for real generation
    const hasOpenAI = !!process.env.OPENAI_API_KEY;
    
    if (hasOpenAI) {
      // TODO: Implement real AI generation here
      console.log("🤖 Using AI generation (OpenAI)");
      return await generateWithAI(request);
    } else {
      // Use mock generation
      console.log("🎭 Using mock generation (no API key)");
      return generateMockContent(request);
    }
  }
};

// Mock content generation using templates
function generateMockContent(request: GenerationRequest): any {
  const { blueprint, sourceData, options } = request;
  
  // Get template for this blueprint kind
  const template = mockTemplates[blueprint.kind as keyof typeof mockTemplates];
  
  if (!template) {
    throw new Error(`No mock template available for blueprint kind: ${blueprint.kind}`);
  }
  
  // Create context for template substitution
  const context = {
    recipe_title: sourceData.title || "Delicious Recipe",
    recipe_category: sourceData.dietTags?.[0] || "healthy",
    cook_time: sourceData.time || "30 minutes",
    prep_time: "10 minutes",
    total_time: "40 minutes", 
    main_ingredient: sourceData.ingredients?.[0]?.name || "fresh ingredients",
    ingredient_count: sourceData.ingredients?.length || 5,
    prep_instruction: "Prepare all ingredients according to recipe",
    cook_instruction: "Cook until golden and delicious", 
    finish_instruction: "Plate beautifully and serve immediately",
    unique_selling_point: "it uses common pantry staples",
    secret_ingredient: sourceData.ingredients?.[1]?.name || "garlic",
    prep_ahead_time: "2 days",
    substitutions: "similar ingredients you have on hand",
    recipe_description: `A delicious ${sourceData.title || 'recipe'} that's perfect for any occasion`,
    recipe_id: sourceData.id || 1
  };
  
  // Replace template variables with actual values
  const result = JSON.parse(JSON.stringify(template));
  replaceTemplateVariables(result, context);
  
  return result;
}

// Recursive function to replace {{variable}} patterns in objects
function replaceTemplateVariables(obj: any, context: Record<string, any>) {
  if (typeof obj === 'string') {
    return obj.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return context[key] || match;
    });
  } else if (Array.isArray(obj)) {
    return obj.map(item => replaceTemplateVariables(item, context));
  } else if (obj && typeof obj === 'object') {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = replaceTemplateVariables(value, context);
    }
    return result;
  }
  return obj;
}

// Placeholder for future AI implementation
async function generateWithAI(request: GenerationRequest): Promise<any> {
  // TODO: Implement OpenAI API calls here
  // For now, fall back to mock generation
  return generateMockContent(request);
}