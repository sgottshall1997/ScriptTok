import { FC } from "react";
import { NICHES } from "@shared/constants";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NicheSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const NicheSelector: FC<NicheSelectorProps> = ({ value, onChange }) => {
  // Get niche labels with proper formatting for display
  const nicheLabels: Record<string, string> = {
    skincare: "Skincare & Beauty",
    tech: "Technology & Gadgets",
    fashion: "Fashion & Apparel",
    fitness: "Fitness & Wellness",
    food: "Food & Cooking",
    travel: "Travel & Adventure",
    pet: "Pet Care & Products"
  };

  // Icons for each niche (using emoji as placeholders, can be replaced with SVG/icon components)
  const nicheIcons: Record<string, string> = {
    skincare: "✨",
    tech: "📱",
    fashion: "👕",
    fitness: "🏋️",
    food: "🍳",
    travel: "✈️",
    pet: "🐾"
  };

  return (
    <div className="flex flex-col space-y-1.5">
      <Label htmlFor="niche">Content Niche</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select niche" />
        </SelectTrigger>
        <SelectContent>
          {NICHES.map((niche) => (
            <SelectItem key={niche} value={niche} className="flex items-center">
              <span className="mr-2">{nicheIcons[niche]}</span>
              <span>{nicheLabels[niche] || niche}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-sm text-muted-foreground">
        Select the industry or niche for your content
      </p>
    </div>
  );
};

export default NicheSelector;