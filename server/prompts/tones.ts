/**
 * Tone Definitions for Content Generation
 * Defines different writing styles/tones that can be applied to generated content
 */
import { ToneOption } from "@shared/constants";

/**
 * Map of tone options to detailed descriptions
 * These descriptions are injected into prompt templates
 */
const toneDescriptions: Record<ToneOption, string> = {
  "friendly": "a warm, approachable tone that feels like advice from a friend. Use conversational language and occasional first-person perspective.",
  
  "professional": "a formal, authoritative tone with industry terminology and third-person perspective. Emphasize expertise and factual information.",
  
  "casual": "a relaxed, conversational style with simple language and occasional slang. Write as if chatting with a peer.",
  
  "enthusiastic": "an energetic, passionate tone with emphasis words and exclamations where appropriate. Convey excitement about the topic.",
  
  "minimalist": "a concise, straightforward tone focusing on essential information. Avoid flowery language and keep sentences short.",
  
  "luxurious": "an elegant, sophisticated tone emphasizing premium quality and exclusivity. Use rich descriptive language and focus on sensory details.",
  
  "educational": "an informative, clear tone that explains concepts thoroughly. Include helpful details and technical information where relevant.",
  
  "humorous": "a light-hearted, witty tone with appropriate jokes or wordplay. Keep information accurate while maintaining a fun voice.",
  
  "trendy": "a contemporary, fashionable tone using current slang and cultural references. Write as if speaking to a trend-conscious audience.",
  
  "scientific": "a precise, analytical tone with proper terminology and evidence-based statements. Maintain objectivity and include technical details.",
  
  "poetic": "an artistic, expressive tone with vivid imagery and creative language. Focus on evoking feelings about the product."
};

/**
 * Get a detailed description for a specific tone option
 * @param tone The tone option to describe
 * @returns A detailed description of the requested tone
 */
export function getToneDescription(tone: ToneOption): string {
  return toneDescriptions[tone] || toneDescriptions.friendly;
}

/**
 * Get all available tone options with their descriptions
 * @returns An object mapping tone keys to their descriptions
 */
export function getAllToneDescriptions(): Record<ToneOption, string> {
  return { ...toneDescriptions };
}