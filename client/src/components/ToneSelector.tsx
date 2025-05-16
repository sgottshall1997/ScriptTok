import React from 'react';
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TONE_OPTIONS, type ToneOption } from '@shared/constants';

// Properties for the ToneSelector component
interface ToneSelectorProps {
  selectedTone: ToneOption;
  onChange: (tone: ToneOption) => void;
  className?: string;
  toneDescriptions?: Record<ToneOption, string>;
}

/**
 * Component for selecting the tone of voice for content generation
 * Provides a radio group with tooltips explaining each tone option
 */
export function ToneSelector({
  selectedTone,
  onChange,
  className = "",
  toneDescriptions
}: ToneSelectorProps) {
  // Default tone descriptions if not provided
  const descriptions: Record<ToneOption, string> = toneDescriptions || {
    friendly: "Warm, approachable tone like advice from a friend.",
    professional: "Formal, authoritative tone with industry terminology.",
    casual: "Relaxed, conversational style with simple language.",
    enthusiastic: "Energetic, passionate tone with emphasis words.",
    minimalist: "Concise, straightforward tone focusing on essential information.",
    luxurious: "Elegant, sophisticated tone emphasizing premium quality.",
    educational: "Informative, clear tone that explains concepts thoroughly.",
    humorous: "Light-hearted, witty tone with appropriate jokes.",
    trendy: "Contemporary tone using current slang and cultural references.",
    scientific: "Precise, analytical tone with proper terminology.",
    poetic: "Artistic, expressive tone with vivid imagery."
  };

  // Icons representing each tone to make selection more visual
  const toneIcons: Record<ToneOption, string> = {
    friendly: "👋",
    professional: "👔",
    casual: "😊",
    enthusiastic: "🙌",
    minimalist: "✓",
    luxurious: "✨",
    educational: "📚",
    humorous: "😄",
    trendy: "🔥",
    scientific: "🔬",
    poetic: "🌸"
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <h3 className="text-lg font-medium">Tone of Voice</h3>
      
      <TooltipProvider>
        <RadioGroup 
          value={selectedTone} 
          onValueChange={(value) => onChange(value as ToneOption)}
          className="grid grid-cols-2 sm:grid-cols-3 gap-3"
        >
          {TONE_OPTIONS.map((tone) => (
            <Tooltip key={tone} delayDuration={300}>
              <TooltipTrigger asChild>
                <div className="relative">
                  <RadioGroupItem 
                    value={tone} 
                    id={`tone-${tone}`}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={`tone-${tone}`}
                    className="flex items-center justify-between px-4 py-3 rounded-md border-2 border-muted 
                              bg-popover hover:bg-accent hover:text-accent-foreground 
                              peer-data-[state=checked]:border-primary cursor-pointer"
                  >
                    <div className="flex items-center">
                      <span className="mr-2">{toneIcons[tone]}</span>
                      <span className="capitalize">{tone}</span>
                    </div>
                  </Label>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" align="center">
                <p className="max-w-xs">{descriptions[tone]}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </RadioGroup>
      </TooltipProvider>
    </div>
  );
}

export default ToneSelector;