import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Spartan format configuration
const SPARTAN_SYSTEM_PROMPT = `
You are an AI content generator that produces short-form video scripts and platform captions in a strict Spartan format.

# OVERVIEW
You will generate two possible content types:
- A Spartan-style **caption** (50 words max)
- A Spartan-style **video script** (max 120 words)

This Spartan format activated when:
- The user manually selects "Use Spartan Format" 
- OR the niche is one of: "tech", "finance", "productivity"

When Spartan mode is active:
- You must override any tone settings
- You must replace standard caption/script output with Spartan versions

# STYLE GUIDELINES
- Use clear, simple language
- Write in short, direct, factual sentences
- Use active voice only
- Avoid metaphors, cliches, fluff, and filler
- DO NOT use emojis, asterisks, setup phrases ("in summary", "in conclusion", etc.), or exaggerated language

Strictly avoid the following words:
"can, may, just, that, very, really, literally, actually, certainly, probably, basically, could, maybe, delve, embark, enlightening, esteemed, imagine, game-changer, unlock, discover, skyrocket, revolutionize, disruptive, utilize, tapestry, illuminate, unveil, pivotal, enrich, intricate, elucidate, hence, furthermore, however, harness, exciting, groundbreaking, remarkable, navigating, powerful, inquiries, ever-evolving"

---

# FORMAT A: Spartan Video Caption (Content Type: shortCaptionSpartan)

1. Paragraph 1: 2–3 sentence summary of the product or topic  
2. Paragraph 2: Friendly CTA (e.g., "Curious? You should be.")  
3. Paragraph 3: Encourage user to visit link or bio for more  
4. Paragraph 4: Include 5 relevant trending hashtags  

---

# FORMAT B: Spartan Video Script (Content Type: spartanVideoScript)

1. One single paragraph  
2. Max 120 words  
3. Begin with a strong hook  
4. End with a direct call to action (e.g., "Here's what to do next")  

---

# OUTPUT RULES
- Output only the formatted caption or script
- Do not include notes, disclaimers, or internal instructions
- Follow Spartan format 100% of the time when active
`;

// Niches that automatically trigger Spartan format
const SPARTAN_AUTO_NICHES = ['tech', 'finance', 'productivity'];

export interface SpartanContentOptions {
  productName: string;
  niche: string;
  contentType: 'shortCaptionSpartan' | 'spartanVideoScript';
  useSpartanFormat?: boolean;
  additionalContext?: string;
}

export async function generateSpartanContent(options: SpartanContentOptions): Promise<{
  success: boolean;
  content?: string;
  error?: string;
}> {
  try {
    const {
      productName,
      niche,
      contentType,
      useSpartanFormat = false,
      additionalContext = ''
    } = options;

    // Check if Spartan format should be used
    const shouldUseSpartan = useSpartanFormat || SPARTAN_AUTO_NICHES.includes(niche.toLowerCase());
    
    if (!shouldUseSpartan) {
      return {
        success: false,
        error: 'Spartan format not activated for this niche or not manually selected'
      };
    }

    const formatInstruction = contentType === 'shortCaptionSpartan' 
      ? 'Generate a Spartan video caption following FORMAT A (50 words max)'
      : 'Generate a Spartan video script following FORMAT B (120 words max)';

    const prompt = `${formatInstruction}

Product/Topic: ${productName}
Niche: ${niche}
${additionalContext ? `Additional Context: ${additionalContext}` : ''}

<sources>
Product: ${productName}
Niche: ${niche}
Context: ${additionalContext}
</sources>`;

    console.log(`🏛️ Generating Spartan ${contentType} for ${productName} in ${niche} niche`);

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: SPARTAN_SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3, // Lower temperature for more consistent, factual output
      max_tokens: contentType === 'shortCaptionSpartan' ? 100 : 200,
    });

    const content = response.choices[0]?.message?.content?.trim();

    if (!content) {
      throw new Error('No content generated from OpenAI');
    }

    console.log(`✅ Spartan ${contentType} generated successfully for ${productName}`);

    return {
      success: true,
      content
    };

  } catch (error) {
    console.error('❌ Spartan content generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export function shouldUseSpartanFormat(niche: string, manualSpartanMode: boolean = false): boolean {
  return manualSpartanMode || SPARTAN_AUTO_NICHES.includes(niche.toLowerCase());
}

export function getSpartanAutoNiches(): string[] {
  return [...SPARTAN_AUTO_NICHES];
}