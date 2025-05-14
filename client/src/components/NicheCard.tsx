import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { LucideIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Link } from 'wouter';

// Interface for niche info from the API
interface NicheInfo {
  name: string;
  description: string;
  icon: string;
  primary_color: string;
  secondary_color: string;
  keywords: string[];
}

interface NicheCardProps {
  niche: string;
  selected?: boolean;
  compact?: boolean;
}

export const NicheCard: React.FC<NicheCardProps> = ({ 
  niche, 
  selected = false,
  compact = false
}) => {
  const { toast } = useToast();
  
  // Fetch niche metadata from the API
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/templates', niche],
    queryFn: async () => {
      const response = await fetch(`/api/templates/${niche}`);
      if (!response.ok) {
        throw new Error('Failed to fetch niche information');
      }
      const data = await response.json();
      return data.info as NicheInfo;
    },
    refetchOnWindowFocus: false,
  });
  
  // Get the icon component based on the icon name
  const IconComponent = React.useMemo(() => {
    if (!data?.icon) return LucideIcons.FileText as LucideIcon;
    
    // Try to find the icon in Lucide
    const iconName = data.icon.charAt(0).toUpperCase() + data.icon.slice(1);
    return (LucideIcons as Record<string, LucideIcon>)[iconName] || LucideIcons.FileText;
  }, [data?.icon]);
  
  // Map color names to Tailwind classes
  const getColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      red: 'bg-red-500',
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      purple: 'bg-purple-500',
      pink: 'bg-pink-500',
      gray: 'bg-gray-500',
      // Add more colors as needed
    };
    
    return colorMap[color.toLowerCase()] || 'bg-gray-500';
  };
  
  // Get color classes for the card
  const primaryColorClass = data?.primary_color ? getColorClass(data.primary_color) : 'bg-gray-500';
  const secondaryColorClass = data?.secondary_color ? getColorClass(data.secondary_color) : 'bg-blue-500';
  
  // Show loading state
  if (isLoading) {
    return (
      <Card className="w-full h-full">
        <CardHeader>
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-3 w-full" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
        {!compact && (
          <CardFooter>
            <Skeleton className="h-9 w-20" />
          </CardFooter>
        )}
      </Card>
    );
  }
  
  // Show error state
  if (error || !data) {
    return (
      <Card className="w-full h-full border-red-200">
        <CardHeader>
          <CardTitle className="text-red-500">Niche not found</CardTitle>
          <CardDescription>
            Could not load information for the {niche} niche
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button 
            variant="outline" 
            onClick={() => toast({
              title: "Error",
              description: error?.message || "Failed to load niche information",
            })}
          >
            Show Error
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  // Compact view for grid layouts
  if (compact) {
    return (
      <Link href={`/niche/${niche}`}>
        <a className="block w-full">
          <Card className={`w-full h-full transition-all hover:shadow-md cursor-pointer ${selected ? 'border-2 border-primary' : ''}`}>
            <div className={`h-2 ${primaryColorClass} rounded-t-lg`}></div>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <IconComponent className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">{data.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-gray-600">{data.description}</p>
            </CardContent>
          </Card>
        </a>
      </Link>
    );
  }
  
  // Full view with keywords and action button
  return (
    <Card className={`w-full h-full transition-all hover:shadow-md ${selected ? 'border-2 border-primary' : ''}`}>
      <div className={`h-2 ${primaryColorClass} rounded-t-lg`}></div>
      <CardHeader>
        <div className="flex items-center gap-2">
          <IconComponent className="h-5 w-5 text-primary" />
          <CardTitle>{data.name}</CardTitle>
        </div>
        <CardDescription>{data.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {data.keywords.map(keyword => (
            <Badge key={keyword} variant="secondary">{keyword}</Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Link href={`/niche/${niche}`}>
          <Button className="w-full">
            Generate {data.name} Content
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

// Grid view component to show multiple niches
interface NicheGridProps {
  niches: string[];
  selectedNiche?: string;
}

export const NicheGrid: React.FC<NicheGridProps> = ({
  niches,
  selectedNiche
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {niches.map(niche => (
        <NicheCard
          key={niche}
          niche={niche}
          selected={niche === selectedNiche}
          compact
        />
      ))}
    </div>
  );
};