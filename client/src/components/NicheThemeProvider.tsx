import { FC, ReactNode, useEffect, useState } from "react";
import { Niche } from "@shared/constants";

interface NicheThemeProviderProps {
  niche?: string;
  children: ReactNode;
}

// Theme colors for each niche
const nicheThemes: Record<string, { primary: string; secondary: string }> = {
  skincare: { 
    primary: "pink-600", 
    secondary: "purple-600" 
  },
  tech: { 
    primary: "blue-600", 
    secondary: "cyan-600" 
  },
  fashion: { 
    primary: "purple-600", 
    secondary: "pink-600" 
  },
  fitness: { 
    primary: "green-600", 
    secondary: "teal-600" 
  },
  food: { 
    primary: "orange-600", 
    secondary: "yellow-600" 
  },
  travel: { 
    primary: "sky-600", 
    secondary: "indigo-600" 
  },
  pet: { 
    primary: "amber-600", 
    secondary: "orange-600" 
  },
  default: { 
    primary: "violet-600", 
    secondary: "blue-600" 
  }
};

// CSS Variables setter for dynamic theming
const setThemeColors = (niche: string) => {
  const theme = nicheThemes[niche] || nicheThemes.default;
  
  document.documentElement.style.setProperty('--theme-primary', `var(--${theme.primary})`);
  document.documentElement.style.setProperty('--theme-secondary', `var(--${theme.secondary})`);
  document.documentElement.style.setProperty('--theme-primary-light', `var(--${theme.primary.replace('-600', '-50')})`);
  document.documentElement.style.setProperty('--theme-secondary-light', `var(--${theme.secondary.replace('-600', '-50')})`);
};

const NicheThemeProvider: FC<NicheThemeProviderProps> = ({ niche = 'default', children }) => {
  useEffect(() => {
    // Apply the theme colors based on the selected niche
    setThemeColors(niche);
    
    // Clean up when component unmounts
    return () => {
      // Reset to default theme
      setThemeColors('default');
    };
  }, [niche]);
  
  return <>{children}</>;
};

export default NicheThemeProvider;