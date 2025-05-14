import { FC } from "react";
import { NICHES } from "@shared/constants";
import { Label } from "@/components/ui/label";
import { Link } from "wouter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";

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
      <div className="flex justify-between items-center">
        <Label htmlFor="niche">Content Niche</Label>
        {value && (
          <Link href={`/niche/${value}`}>
            <Button variant="ghost" size="sm" className="flex items-center text-sm text-blue-600">
              <Info className="w-4 h-4 mr-1" />
              Niche Page
            </Button>
          </Link>
        )}
      </div>
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
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Select the industry or niche for your content
        </p>
        <div className="flex flex-wrap gap-1 justify-end">
          {NICHES.slice(0, 3).map(niche => (
            <Link key={niche} href={`/niche/${niche}`}>
              <Button variant="outline" size="sm" className="text-xs py-1 h-auto">
                {nicheIcons[niche]} {niche}
              </Button>
            </Link>
          ))}
          <Button variant="outline" size="sm" className="text-xs py-1 h-auto">
            + more
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NicheSelector;