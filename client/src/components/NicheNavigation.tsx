import { FC } from "react";
import { NICHES } from "@shared/constants";
import { Link, useLocation } from "wouter";

interface NicheNavigationProps {
  currentNiche?: string;
}

const NicheNavigation: FC<NicheNavigationProps> = ({ currentNiche }) => {
  const [location] = useLocation();
  
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

  // Icons for each niche
  const nicheIcons: Record<string, string> = {
    skincare: "✨",
    tech: "📱",
    fashion: "👕",
    fitness: "🏋️",
    food: "🍳",
    travel: "✈️",
    pet: "🐾"
  };

  // Color classes for each niche
  const nicheColors: Record<string, string> = {
    skincare: "bg-pink-100 text-pink-800 hover:bg-pink-200",
    tech: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    fashion: "bg-purple-100 text-purple-800 hover:bg-purple-200",
    fitness: "bg-green-100 text-green-800 hover:bg-green-200",
    food: "bg-orange-100 text-orange-800 hover:bg-orange-200",
    travel: "bg-sky-100 text-sky-800 hover:bg-sky-200",
    pet: "bg-amber-100 text-amber-800 hover:bg-amber-200",
  };

  return (
    <div className="mb-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">Niche Navigation</h3>
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard">
            <span className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
              location === "/dashboard" 
                ? "bg-gray-800 text-white" 
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}>
              🏠 Dashboard
            </span>
          </Link>
          
          <Link href="/templates">
            <span className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
              location === "/templates" 
                ? "bg-gray-800 text-white" 
                : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
            }`}>
              📋 Template Explorer
            </span>
          </Link>

          {NICHES.map(niche => (
            <Link key={niche} href={`/niche/${niche}`}>
              <span className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                currentNiche === niche 
                  ? "bg-gray-800 text-white" 
                  : nicheColors[niche] || "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}>
                {nicheIcons[niche]} {nicheLabels[niche] || niche}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NicheNavigation;