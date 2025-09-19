// Recipe-aware prompt builder and content renderer

export interface NormalizedRecipe {
  title: string;
  yield: string;
  time: string;
  ingredients: Array<{
    name: string;
    qty: string;
  }>;
  steps: string[];
  dietTags: string[];
  pantry: {
    has: string[];
  };
}

// Normalize recipe object for consistent processing
export function normalizeRecipe(recipeData: any): NormalizedRecipe {
  return {
    title: recipeData.title || "Delicious Recipe",
    yield: recipeData.yield || "4 servings", 
    time: recipeData.time || "30 minutes",
    ingredients: recipeData.ingredients || [
      { name: "main ingredient", qty: "1 cup" },
      { name: "seasoning", qty: "to taste" }
    ],
    steps: recipeData.steps || [
      "Prepare ingredients",
      "Combine and mix", 
      "Cook until done",
      "Serve and enjoy"
    ],
    dietTags: recipeData.dietTags || ["delicious"],
    pantry: {
      has: recipeData.pantry?.has || []
    }
  };
}

// Build recipe-aware prompt for AI generation
export function renderRecipeContent(
  normalizedRecipe: NormalizedRecipe,
  blueprint: any,
  options: any
): string {
  const { persona, tone, platform, duration, cta } = options;
  
  // Base context about the recipe
  const recipeContext = `
Recipe Title: ${normalizedRecipe.title}
Cooking Time: ${normalizedRecipe.time}
Servings: ${normalizedRecipe.yield}
Ingredients: ${normalizedRecipe.ingredients.map(ing => `${ing.qty} ${ing.name}`).join(', ')}
Steps: ${normalizedRecipe.steps.join(' → ')}
Diet Tags: ${normalizedRecipe.dietTags.join(', ')}
Pantry Staples Available: ${normalizedRecipe.pantry.has.join(', ')}
`;

  // Platform-specific considerations
  const platformGuide = getPlatformGuide(platform, duration);
  
  // Persona-specific voice
  const personaVoice = getPersonaVoice(persona);
  
  // Tone specifications
  const toneSpec = getToneSpecification(tone);
  
  // Blueprint-specific instructions
  const blueprintInstructions = getBlueprintInstructions(blueprint);
  
  return `
${personaVoice}
${toneSpec}
${platformGuide}

${recipeContext}

${blueprintInstructions}

Remember to:
- Use cooking-native language and terminology
- Reference specific ingredients and techniques from the recipe
- Make content feel authentic and actionable
- Optimize for ${platform} audience and format
- Include appropriate calls-to-action: ${cta}
- Keep content within ${duration} constraints where applicable
- Generate content that feels natural and engaging, not robotic
- Use the pantry staples as connection points for relatability
`;
}

function getPlatformGuide(platform: string, duration: string): string {
  const guides = {
    TikTok: `
Platform: TikTok (${duration})
- Start with a strong hook in first 3 seconds
- Use trending music and sounds where applicable
- Include text overlays for key information
- End with clear call-to-action
- Optimize for vertical mobile viewing
- Use popular cooking hashtags
`,
    Reel: `
Platform: Instagram Reels (${duration})
- Hook viewers immediately with visual appeal
- Use trending audio or original sound
- Include captions for accessibility
- Design for vertical format
- End with engaging question or CTA
`,
    Shorts: `
Platform: YouTube Shorts (${duration})
- Quick, punchy opening
- Clear audio narration
- Good lighting essential
- Trending topics boost visibility
- Clear thumbnail-worthy moment
`,
    YouTubeLong: `
Platform: YouTube Long-form (${duration})
- Detailed introduction explaining value
- Chapter breakdown for easy navigation
- Comprehensive demonstration
- Multiple camera angles if possible
- Strong SEO-optimized title and description
`,
    Instagram: `
Platform: Instagram Post/Story
- High-quality food photography
- Engaging caption with story/context
- Use relevant hashtags strategically
- Include questions to boost engagement
`,
    Blog: `
Platform: Blog Post
- SEO-optimized headers and structure
- Include recipe card with structured data
- Comprehensive cooking tips and variations
- High-quality step-by-step photos
- Internal/external linking strategy
`,
    Email: `
Platform: Email Newsletter
- Personal, conversational tone
- Clear subject line with benefit
- Scannable format with bullet points
- Strong call-to-action
- Mobile-responsive design
`,
    Push: `
Platform: Push Notification
- Ultra-concise and compelling
- Clear value proposition
- Time-sensitive feel
- Direct deep link to recipe
`
  };
  
  return guides[platform as keyof typeof guides] || guides.TikTok;
}

function getPersonaVoice(persona: string): string {
  const voices = {
    Chef: `
Voice: Professional Chef
- Use culinary terminology with confidence
- Share professional tips and techniques
- Reference restaurant-quality results
- Mention proper equipment and ingredients
- Speak with authority and experience
`,
    "Busy Parent": `
Voice: Busy Parent
- Emphasize quick, family-friendly solutions
- Mention kid-approved aspects
- Focus on convenience and time-saving
- Reference real parenting challenges
- Use relatable, down-to-earth language
`,
    College: `
Voice: College Student / Young Adult
- Casual, friendly tone
- Budget-conscious approach
- Simple equipment and minimal cleanup
- Dorm/apartment-friendly cooking
- Social media savvy language
`,
    Vegan: `
Voice: Plant-Based Enthusiast
- Passionate about plant-based living
- Highlight health and environmental benefits
- Suggest vegan substitutions naturally
- Use inclusive, welcoming language
- Share nutritional benefits
`,
    Athlete: `
Voice: Fitness-Focused Cook
- Emphasize nutritional benefits and macros
- Mention performance and recovery aspects
- Reference meal prep and timing
- Use energy-focused language
- Include protein and nutrient highlights
`
  };
  
  return voices[persona as keyof typeof voices] || voices.Chef;
}

function getToneSpecification(tone: string): string {
  const tones = {
    Friendly: `
Tone: Warm and Approachable
- Use welcoming, inclusive language
- Share personal anecdotes where appropriate
- Encourage experimentation and fun
- Be supportive of different skill levels
- Create a sense of community
`,
    Expert: `
Tone: Knowledgeable and Authoritative  
- Demonstrate deep cooking knowledge
- Use precise culinary terminology
- Explain the 'why' behind techniques
- Reference cooking science when relevant
- Build confidence through education
`,
    Playful: `
Tone: Fun and Energetic
- Use humor and wordplay where appropriate
- Include food puns and playful language
- Create excitement about cooking
- Use emojis and expressive language
- Make cooking feel like an adventure
`
  };
  
  return tones[tone as keyof typeof tones] || tones.Friendly;
}

function getBlueprintInstructions(blueprint: any): string {
  const instructions = {
    video_script_short: `
Generate a short-form video script with:
- Hook: Compelling opening line that grabs attention immediately
- Beats: Timed segments with scene descriptions, dialogue, actions, and b-roll notes
- Call to Action: Clear next step for viewer
- Captions: Platform-appropriate caption text
- Hashtags: Trending and relevant cooking hashtags
- Thumbnail Prompts: Ideas for eye-catching thumbnail images

Format as JSON with exact timecodes (e.g., "0-3s", "3-8s") that add up to the total duration.
`,
    video_script_long: `
Generate a comprehensive long-form video script with:
- Title: SEO-optimized video title
- Description: Detailed video description for platform
- Chapters: Logical breakdown of content sections
- B-roll suggestions: Visual elements to enhance the narrative
- Timestamps: Clear time markers for viewer navigation
- Call to Action: Subscription/engagement prompts

Structure for educational, tutorial-style content.
`,
    carousel_step: `
Generate an Instagram carousel post with:
- Slides: 5-8 individual slides with headlines, body text, and image prompts
- Caption: Engaging caption with story and context
- Hashtags: Strategic mix of popular and niche cooking hashtags

Each slide should build on the previous one, creating a complete recipe tutorial.
`,
    blog_recipe: `
Generate SEO-optimized blog content with:
- Title: Search-friendly recipe title
- Headers: H2 structure for scannable reading
- Meta data: SEO title, description, and keywords
- FAQ section: Common recipe questions and answers  
- Schema markup: Structured data for recipe rich snippets

Focus on comprehensive, helpful content that ranks well in search.
`,
    email_campaign: `
Generate email newsletter content with:
- Subject: Compelling subject line with clear benefit
- Preheader: Supporting text that appears in preview
- Content blocks: Modular email sections with clear hierarchy
- Affiliate products: Natural product recommendations with context

Balance promotional and educational content for high engagement.
`,
    push_notification: `
Generate mobile push notification with:
- Title: Ultra-concise, attention-grabbing headline
- Body: Brief value proposition or curiosity driver
- Deep link: App navigation path to recipe content

Optimize for mobile notification constraints and user attention spans.
`
  };
  
  return instructions[blueprint.kind as keyof typeof instructions] || 
    "Generate content appropriate for the specified blueprint type, following cooking content best practices.";
}