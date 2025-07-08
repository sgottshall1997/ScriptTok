import React from 'react';
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectLabel, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { NICHES, type Niche } from '@shared/constants';

interface NicheInfo {
  name: string;
  description: string;
  icon: string;
  primary_color: string;
  secondary_color: string;
}

interface NicheDropdownProps {
  value: string;
  onChange: (value: string) => void;
  nicheInfo?: Record<string, NicheInfo>;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

/**
 * Dropdown component for selecting a content niche
 * Displays rich information about each niche option
 */
export function NicheDropdown({
  value,
  onChange,
  nicheInfo = {},
  disabled = false,
  className = "",
  placeholder = "Select niche"
}: NicheDropdownProps) {
  // Default nice icons if no rich info is provided
  const defaultIcons: Record<string, string> = {
    beauty: "✨",
    tech: "💻",
    fashion: "👗",
    fitness: "💪",
    food: "🍲",
    travel: "✈️",
    pet: "🐶",
  };
  
  // Get the appropriate icon for each niche
  const getIcon = (niche: string) => {
    if (nicheInfo[niche]?.icon) {
      return nicheInfo[niche].icon;
    }
    return defaultIcons[niche] || "📄";
  };
  
  return (
    <Select 
      value={value} 
      onValueChange={onChange}
      disabled={disabled}
    >
      <SelectTrigger className={`w-full ${className}`}>
        <SelectValue placeholder={placeholder}>
          {value && (
            <div className="flex items-center space-x-2">
              <span>{getIcon(value)}</span>
              <span className="capitalize">{value}</span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Content Niches</SelectLabel>
          <SelectItem value="" className="text-muted-foreground italic">
            Select a niche
          </SelectItem>
          {NICHES.map((niche) => (
            <SelectItem key={niche} value={niche} className="capitalize">
              <div className="flex items-center space-x-2">
                <span>{getIcon(niche)}</span>
                <span className="flex-grow">{niche}</span>
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export default NicheDropdown;