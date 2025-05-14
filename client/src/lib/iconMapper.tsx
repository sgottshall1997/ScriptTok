import React from 'react';
import { 
  FileText, 
  TestTube,
  Scale,
  Instagram,
  ListChecks,
  Clock,
  BookOpen,
  Video,
  BadgeDollarSign,
  User,
  Sparkles,
  TrendingUp,
  Droplets,
  DollarSign,
  Users,
  AlertTriangle,
  Microscope,
  Calendar,
  Laptop,
  Shirt,
  Dumbbell,
  UtensilsCrossed,
  Plane,
  Cat,
  CircleUser,
  Layout,
  BarChart
} from 'lucide-react';

// Type for Lucide React icons
export type IconComponent = React.FC<React.SVGProps<SVGSVGElement>>;

/**
 * Maps icon names from templates to Lucide React icons
 * @param iconName The name of the icon from template metadata
 * @returns The corresponding Lucide React icon component
 */
export function getIconByName(iconName?: string): IconComponent {
  if (!iconName) {
    return FileText;
  }
  
  switch(iconName.toLowerCase().replace('-', '_')) {
    // Template icons
    case 'test_tube': return TestTube;
    case 'scale': return Scale;
    case 'instagram': return Instagram;
    case 'list_checks': return ListChecks;
    case 'clock': return Clock;
    case 'book_open': return BookOpen;
    case 'video': return Video;
    case 'badge_dollar_sign': return BadgeDollarSign;
    case 'user': return User;
    case 'sparkles': return Sparkles;
    case 'trending_up': return TrendingUp;
    case 'droplets': return Droplets;
    case 'dollar_sign': return DollarSign;
    case 'users': return Users;
    case 'alert_triangle': return AlertTriangle;
    case 'microscope': return Microscope;
    case 'calendar': return Calendar;
    
    // Niche icons
    case 'laptop': return Laptop;
    case 'shirt': return Shirt;
    case 'dumbbell': return Dumbbell;
    case 'utensils': case 'utensils_crossed': return UtensilsCrossed;
    case 'plane': return Plane;
    case 'cat': case 'pet': return Cat;
    case 'circle_user': return CircleUser;
    case 'layout': case 'layout_dashboard': return Layout;
    case 'bar_chart': return BarChart;
    
    // Default fallback
    default: return FileText;
  }
}