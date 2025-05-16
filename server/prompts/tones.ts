/**
 * Enhanced Tone System for Content Generation
 * Loads tone definitions from JSON and provides enhanced tone descriptions
 */
import { promises as fs } from 'fs';
import path from 'path';
import { ToneOption } from "@shared/constants";

// Define the shape of our enhanced tone data
export interface ToneDefinition {
  description: string;
  examples: string[];
  keywords: string[];
  emoji_style: string;
}

export type ToneDefinitions = Record<ToneOption, ToneDefinition>;

// In-memory cache for tone data
let toneDefinitionsCache: ToneDefinitions | null = null;
let simpleToneDescriptionsCache: Record<ToneOption, string> | null = null;

/**
 * Load tone definitions from the JSON file
 */
async function loadToneDefinitions(): Promise<ToneDefinitions> {
  // Use cached definitions if available and not in development mode
  if (toneDefinitionsCache && process.env.NODE_ENV !== 'development') {
    return toneDefinitionsCache;
  }
  
  try {
    // Construct the path to the JSON file
    const filePath = path.join(__dirname, 'tones.json');
    
    // Read and parse the JSON file
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(fileContent) as ToneDefinitions;
    
    // Cache for future use
    toneDefinitionsCache = data;
    console.log('Loaded tone definitions from JSON file');
    return data;
  } catch (error) {
    console.error('Failed to load tone definitions:', error);
    
    // Fallback to hardcoded definitions if JSON loading fails
    const fallback: Record<string, ToneDefinition> = {
      "friendly": {
        description: "a warm, approachable tone that feels like advice from a friend. Use conversational language and occasional first-person perspective.",
        examples: ["I've been using this for months, and it's been a game-changer."],
        keywords: ["warm", "approachable"],
        emoji_style: "moderate"
      }
    };
    
    return fallback as ToneDefinitions;
  }
}

/**
 * Get a detailed description for a specific tone option
 * @param tone The tone option to describe
 * @returns A detailed description of the requested tone
 */
export async function getToneDescription(tone: ToneOption): Promise<string> {
  // Load simple descriptions if not already cached
  if (!simpleToneDescriptionsCache) {
    const definitions = await loadToneDefinitions();
    simpleToneDescriptionsCache = Object.entries(definitions).reduce((acc, [key, value]) => {
      acc[key as ToneOption] = value.description;
      return acc;
    }, {} as Record<ToneOption, string>);
  }
  
  return simpleToneDescriptionsCache[tone] || simpleToneDescriptionsCache.friendly;
}

/**
 * Get the full tone definition for a specific tone
 * @param tone The tone option to get details for
 * @returns The complete tone definition with examples and keywords
 */
export async function getToneDefinition(tone: ToneOption): Promise<ToneDefinition> {
  const definitions = await loadToneDefinitions();
  return definitions[tone] || definitions.friendly;
}

/**
 * Get all available tone options with their descriptions
 * @returns An object mapping tone keys to their descriptions
 */
export async function getAllToneDescriptions(): Promise<Record<ToneOption, string>> {
  if (!simpleToneDescriptionsCache) {
    const definitions = await loadToneDefinitions();
    simpleToneDescriptionsCache = Object.entries(definitions).reduce((acc, [key, value]) => {
      acc[key as ToneOption] = value.description;
      return acc;
    }, {} as Record<ToneOption, string>);
  }
  
  return { ...simpleToneDescriptionsCache };
}

/**
 * Get all tone definitions with full details
 * @returns All tone definitions with examples and keywords
 */
export async function getAllToneDefinitions(): Promise<ToneDefinitions> {
  return await loadToneDefinitions();
}