/**
 * Tone management system providing distinct writing styles
 * for content generation across various niches
 */

export interface ToneDefinition {
  name: string;                // Friendly name
  description: string;         // Description for UI display
  stylistic_rules: string[];   // Writing style rules
  voice_examples: string[];    // Example phrases in this tone
  avoid: string[];             // Things to avoid in this tone
  grammar_preferences: {       // Grammar and style preferences
    sentence_length: 'short' | 'medium' | 'long';
    paragraph_length: 'short' | 'medium' | 'long';
    emoji_usage: 'none' | 'minimal' | 'moderate' | 'heavy';
    contractions: boolean;
    first_person: boolean;
    acronyms: boolean;
    hashtags: boolean;
  };
  special_characters?: string[]; // Special characters often used in this tone
  emoji_groups?: string[];    // Categories of emojis to prefer
}

// Tone definitions with enhanced differentiation
export const TONES: Record<string, ToneDefinition> = {
  friendly: {
    name: "Friendly",
    description: "Warm, approachable tone like advice from a friend.",
    stylistic_rules: [
      "Use conversational language with a warm, inviting tone",
      "Address the reader directly with 'you' and occasionally use first-person perspective",
      "Include relatable examples and scenarios",
      "Use encouraging and supportive language"
    ],
    voice_examples: [
      "I've been there too, and here's what worked for me...",
      "You might want to try...",
      "Isn't it great when you discover a product that actually works?",
      "Let's talk about how this can help you..."
    ],
    avoid: [
      "Overly formal language",
      "Technical jargon without explanation",
      "Condescending tone",
      "Excessive superlatives"
    ],
    grammar_preferences: {
      sentence_length: "medium",
      paragraph_length: "medium",
      emoji_usage: "minimal",
      contractions: true,
      first_person: true,
      acronyms: false,
      hashtags: false
    },
    emoji_groups: ["smileys", "gestures", "hearts"]
  },
  
  professional: {
    name: "Professional",
    description: "Formal, authoritative tone with industry terminology.",
    stylistic_rules: [
      "Use precise, clear language with proper industry terminology",
      "Maintain a balanced, objective tone",
      "Support claims with data or evidence when possible",
      "Structure content logically with clear transitions"
    ],
    voice_examples: [
      "Research indicates that...",
      "This product offers several key benefits, including...",
      "Industry experts recommend...",
      "The data demonstrates significant results..."
    ],
    avoid: [
      "Slang or colloquialisms",
      "Excessive personal anecdotes",
      "Overuse of exclamation points",
      "Hyperbole or exaggeration"
    ],
    grammar_preferences: {
      sentence_length: "medium",
      paragraph_length: "medium",
      emoji_usage: "none",
      contractions: false,
      first_person: false,
      acronyms: true,
      hashtags: false
    }
  },
  
  casual: {
    name: "Casual",
    description: "Relaxed, conversational style with simple language.",
    stylistic_rules: [
      "Use everyday language and a relaxed tone",
      "Include some slang and colloquialisms where appropriate",
      "Keep sentences and paragraphs short and easy to read",
      "Use a mix of questions and statements to maintain engagement"
    ],
    voice_examples: [
      "So, here's the deal...",
      "I'm not gonna lie, this product is pretty awesome.",
      "Want to know a secret? This stuff really works!",
      "Let's cut to the chase..."
    ],
    avoid: [
      "Complex terminology without explanation",
      "Lengthy, complex sentences",
      "Overly formal language",
      "Rigid structure"
    ],
    grammar_preferences: {
      sentence_length: "short",
      paragraph_length: "short",
      emoji_usage: "moderate",
      contractions: true,
      first_person: true,
      acronyms: false,
      hashtags: true
    },
    emoji_groups: ["smileys", "objects", "activities"]
  },
  
  enthusiastic: {
    name: "Enthusiastic",
    description: "Energetic, passionate tone with emphasis words.",
    stylistic_rules: [
      "Use energetic, passionate language with strong descriptors",
      "Include exclamation points judiciously",
      "Emphasize exciting aspects with intensifiers",
      "Create a sense of urgency and excitement"
    ],
    voice_examples: [
      "This is absolutely game-changing!",
      "I'm incredibly excited to share this amazing product with you!",
      "You won't believe the stunning results!",
      "Get ready to be blown away by these incredible benefits!"
    ],
    avoid: [
      "Understated language",
      "Excessive technical details that slow momentum",
      "Negative or cautious phrasing",
      "Monotonous sentence structure"
    ],
    grammar_preferences: {
      sentence_length: "medium",
      paragraph_length: "short",
      emoji_usage: "heavy",
      contractions: true,
      first_person: true,
      acronyms: false,
      hashtags: true
    },
    special_characters: ["!", "✨", "💯", "🔥"],
    emoji_groups: ["smileys", "hearts", "celebration"]
  },
  
  minimalist: {
    name: "Minimalist",
    description: "Concise, straightforward tone focusing on essential information.",
    stylistic_rules: [
      "Use concise language with no unnecessary words",
      "Focus on essential information only",
      "Employ straightforward sentence structure",
      "Avoid decorative language or excessive adjectives"
    ],
    voice_examples: [
      "Key benefits: durability, efficiency, value.",
      "Problem? Solved.",
      "Simple solution. Effective results.",
      "What it does: hydrates, protects, restores."
    ],
    avoid: [
      "Flowery language or excessive description",
      "Long introductions or conclusions",
      "Repetition of information",
      "Unnecessary emotional appeals"
    ],
    grammar_preferences: {
      sentence_length: "short",
      paragraph_length: "short",
      emoji_usage: "none",
      contractions: true,
      first_person: false,
      acronyms: true,
      hashtags: false
    }
  },
  
  luxurious: {
    name: "Luxurious",
    description: "Elegant, sophisticated tone emphasizing premium quality.",
    stylistic_rules: [
      "Use refined, sophisticated language",
      "Emphasize exclusivity, quality, and craftsmanship",
      "Include sensory details and rich descriptions",
      "Create an atmosphere of elegance and prestige"
    ],
    voice_examples: [
      "Indulge in the exquisite experience of...",
      "Meticulously crafted for the discerning individual...",
      "An unparalleled fusion of luxury and performance...",
      "Elevate your routine with this sophisticated formulation..."
    ],
    avoid: [
      "Budget-focused language",
      "Casual or colloquial expressions",
      "Overly technical specifications",
      "Urgent or pushy sales language"
    ],
    grammar_preferences: {
      sentence_length: "long",
      paragraph_length: "medium",
      emoji_usage: "none",
      contractions: false,
      first_person: false,
      acronyms: false,
      hashtags: false
    }
  },
  
  educational: {
    name: "Educational",
    description: "Informative, clear tone that explains concepts thoroughly.",
    stylistic_rules: [
      "Use clear, informative language with appropriate definitions",
      "Structure content in a logical progression",
      "Include examples and comparisons to illustrate concepts",
      "Balance depth of information with accessibility"
    ],
    voice_examples: [
      "Let me explain how this works...",
      "To understand this concept, consider the following example...",
      "The key difference between these two approaches is...",
      "This is significant because..."
    ],
    avoid: [
      "Unexplained jargon or terminology",
      "Oversimplification of complex topics",
      "Sales-focused language",
      "Assumptions about prior knowledge"
    ],
    grammar_preferences: {
      sentence_length: "medium",
      paragraph_length: "medium",
      emoji_usage: "none",
      contractions: true,
      first_person: false,
      acronyms: true,
      hashtags: false
    }
  },
  
  humorous: {
    name: "Humorous",
    description: "Light-hearted, witty tone with appropriate jokes.",
    stylistic_rules: [
      "Use playful language with appropriate humor",
      "Include witty observations or amusing comparisons",
      "Maintain a light-hearted tone throughout",
      "Use rhetorical questions and conversational asides"
    ],
    voice_examples: [
      "Let's face it, nobody actually enjoys [common pain point]...",
      "Warning: may cause excessive compliments and envy from friends.",
      "Remember when you thought [related product] was the answer? Those were simpler times.",
      "Plot twist: it actually works!"
    ],
    avoid: [
      "Offensive or insensitive jokes",
      "Humor that undermines the product's value",
      "Sarcasm that could be misinterpreted",
      "Inside jokes that exclude the audience"
    ],
    grammar_preferences: {
      sentence_length: "short",
      paragraph_length: "short",
      emoji_usage: "moderate",
      contractions: true,
      first_person: true,
      acronyms: false,
      hashtags: true
    },
    emoji_groups: ["smileys", "gestures", "activities"]
  },
  
  trendy: {
    name: "Trendy",
    description: "Contemporary tone using current slang and cultural references.",
    stylistic_rules: [
      "Use current slang, abbreviations, and trending expressions",
      "Reference current pop culture and trending topics",
      "Employ a fast-paced, high-energy writing style",
      "Include popular hashtags and expressions"
    ],
    voice_examples: [
      "This product is giving main character energy!",
      "No cap, this is literally the best thing ever.",
      "The vibes are immaculate with this one!",
      "It's the [key feature] for me."
    ],
    avoid: [
      "Outdated slang or references",
      "Overly formal language",
      "Complex or technical explanations",
      "Insincere usage of youth language"
    ],
    grammar_preferences: {
      sentence_length: "short",
      paragraph_length: "short",
      emoji_usage: "heavy",
      contractions: true,
      first_person: true,
      acronyms: true,
      hashtags: true
    },
    special_characters: ["✨", "💅", "🔥", "💯"],
    emoji_groups: ["smileys", "symbols", "gestures"]
  },
  
  scientific: {
    name: "Scientific",
    description: "Precise, analytical tone with proper terminology.",
    stylistic_rules: [
      "Use precise scientific terminology and accurate descriptions",
      "Present evidence and data-driven information",
      "Maintain an objective, analytical tone",
      "Structure content with clear logical progression"
    ],
    voice_examples: [
      "Clinical studies demonstrate efficacy rates of...",
      "The active compound functions by inhibiting...",
      "Analysis reveals a statistically significant improvement in...",
      "The mechanism of action involves..."
    ],
    avoid: [
      "Emotional appeals or subjective claims",
      "Oversimplification of complex processes",
      "Marketing language or hyperbole",
      "Unsubstantiated claims"
    ],
    grammar_preferences: {
      sentence_length: "long",
      paragraph_length: "medium",
      emoji_usage: "none",
      contractions: false,
      first_person: false,
      acronyms: true,
      hashtags: false
    }
  },
  
  poetic: {
    name: "Poetic",
    description: "Artistic, expressive tone with vivid imagery.",
    stylistic_rules: [
      "Use rich, evocative language and imagery",
      "Employ metaphors, similes, and sensory descriptions",
      "Create rhythm with varied sentence structure",
      "Evoke emotions through careful word choice"
    ],
    voice_examples: [
      "Like dawn breaking over a winter landscape, this essence awakens the skin...",
      "In the dance between technology and artistry, this creation leads with grace...",
      "The fragrance unfolds like a story, each note a new chapter in your day...",
      "Wrapped in the embrace of these ingredients, your senses journey to distant memories..."
    ],
    avoid: [
      "Technical jargon or clinical language",
      "Blunt, utilitarian descriptions",
      "Overly direct sales language",
      "Clichéd imagery or expressions"
    ],
    grammar_preferences: {
      sentence_length: "long",
      paragraph_length: "medium",
      emoji_usage: "minimal",
      contractions: true,
      first_person: true,
      acronyms: false,
      hashtags: false
    }
  },
  
  // Additional tones for social media content
  
  ugc: {
    name: "User-Generated Content",
    description: "Authentic, personal tone mimicking genuine user reviews or testimonials.",
    stylistic_rules: [
      "Write as if from a genuine consumer perspective",
      "Include personal details and experiences",
      "Use casual, conversational language",
      "Mention specific results or benefits experienced"
    ],
    voice_examples: [
      "Okay so I was skeptical at first but...",
      "I've been using this for about 3 weeks now and honestly...",
      "Not sponsored, just genuinely obsessed with this product!",
      "Here's my honest review after trying it for a month..."
    ],
    avoid: [
      "Overly polished or marketing-like language",
      "Perfect grammar or structure",
      "Formal product descriptions",
      "Promotional calls to action"
    ],
    grammar_preferences: {
      sentence_length: "short",
      paragraph_length: "short",
      emoji_usage: "heavy",
      contractions: true,
      first_person: true,
      acronyms: false,
      hashtags: true
    },
    special_characters: ["✨", "🙌", "💕", "‼️"],
    emoji_groups: ["smileys", "gestures", "hearts"]
  },
  
  influencer: {
    name: "Influencer",
    description: "Engaging, personality-driven content with calls to action.",
    stylistic_rules: [
      "Balance personal stories with product information",
      "Use engaging hooks and questions",
      "Include calls to action and engagement prompts",
      "Be enthusiastic yet seemingly authentic"
    ],
    voice_examples: [
      "You guys have been asking about my skincare routine, so...",
      "I'm obsessed with this new find! Swipe up for details!",
      "This literally changed my entire routine! Link in bio!",
      "Let me know in the comments if you've tried this!"
    ],
    avoid: [
      "Overly technical information",
      "Negative or critical language",
      "Long, complex explanations",
      "Corporate-sounding language"
    ],
    grammar_preferences: {
      sentence_length: "short",
      paragraph_length: "short",
      emoji_usage: "heavy",
      contractions: true,
      first_person: true,
      acronyms: false,
      hashtags: true
    },
    special_characters: ["✨", "💁‍♀️", "👇", "🔥"],
    emoji_groups: ["smileys", "gestures", "hearts", "objects"]
  }
};

/**
 * Get tone instructions based on specified tone name
 * @param toneName The name of the tone to retrieve
 * @returns Formatting instructions for the specified tone
 */
export function getToneInstructions(toneName: string): string {
  const tone = TONES[toneName.toLowerCase()] || TONES.friendly;
  
  return `
WRITING TONE: ${tone.name}

STYLE GUIDELINES:
${tone.stylistic_rules.map(rule => `- ${rule}`).join('\n')}

VOICE EXAMPLES:
${tone.voice_examples.map(example => `- "${example}"`).join('\n')}

AVOID:
${tone.avoid.map(item => `- ${item}`).join('\n')}

FORMATTING PREFERENCES:
- Sentence length: ${tone.grammar_preferences.sentence_length}
- Paragraph length: ${tone.grammar_preferences.paragraph_length}
- Use of emojis: ${tone.grammar_preferences.emoji_usage}
- Use contractions: ${tone.grammar_preferences.contractions ? 'Yes' : 'No'}
- First-person perspective: ${tone.grammar_preferences.first_person ? 'Yes' : 'No'}
- Use acronyms: ${tone.grammar_preferences.acronyms ? 'Yes' : 'No'}
- Include hashtags: ${tone.grammar_preferences.hashtags ? 'Yes' : 'No'}
${tone.special_characters ? `- Consider using these special characters: ${tone.special_characters.join(' ')}` : ''}
${tone.emoji_groups ? `- Preferred emoji groups: ${tone.emoji_groups.join(', ')}` : ''}
`;
}

/**
 * Get a simpler description of a tone for use in prompts
 * @param toneName The name of the tone to retrieve
 * @returns A concise description of the tone for prompt insertion
 */
export async function getToneDescription(toneName: string): Promise<string> {
  const tone = TONES[toneName.toLowerCase()] || TONES.friendly;
  
  // Create a simplified description for the prompt
  return `${tone.name.toLowerCase()} (${tone.description.toLowerCase()})`;
}