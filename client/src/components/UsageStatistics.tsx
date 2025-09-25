import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TrendingUp, Calendar, Zap, Puzzle, Target, Flame } from 'lucide-react';

interface UsageStatistics {
  totalGenerations: number;
  monthlyGenerations: number;
  dailyGenerations: number;
  mostPopularTemplate: string | null;
  mostPopularNiche: string | null;
  currentStreak: number;
}

export function UsageStatistics() {
  const [stats, setStats] = useState<UsageStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await fetch('/api/statistics');
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setStats(result.data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch usage statistics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  if (isLoading) {
    return (
      <Card className="mb-8 overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 border-none">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="text-center">
                <Skeleton className="h-8 w-8 mx-auto mb-2 bg-white/20" />
                <Skeleton className="h-8 w-16 mx-auto mb-1 bg-white/20" />
                <Skeleton className="h-4 w-20 mx-auto bg-white/20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  const statsItems = [
    {
      icon: TrendingUp,
      value: stats.totalGenerations.toLocaleString(),
      label: 'Total Generations',
      tooltip: 'Total number of content pieces generated since you started using the platform'
    },
    {
      icon: Calendar,
      value: stats.monthlyGenerations.toLocaleString(),
      label: 'This Month',
      tooltip: 'Content generations in the current month'
    },
    {
      icon: Zap,
      value: stats.dailyGenerations.toLocaleString(),
      label: 'Today',
      tooltip: 'Content generated today'
    },
    {
      icon: Puzzle,
      value: stats.mostPopularTemplate ? formatTemplateName(stats.mostPopularTemplate) : 'None',
      label: 'Top Template',
      tooltip: 'Your most frequently used content template'
    },
    {
      icon: Target,
      value: stats.mostPopularNiche ? formatNicheName(stats.mostPopularNiche) : 'None',
      label: 'Top Niche',
      tooltip: 'Your most frequently targeted niche market'
    },
    {
      icon: Flame,
      value: `${stats.currentStreak} day${stats.currentStreak !== 1 ? 's' : ''}`,
      label: 'Current Streak',
      tooltip: 'Consecutive days with at least one content generation'
    }
  ];

  return (
    <TooltipProvider>
      <Card className="mb-8 overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 border-none shadow-xl">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {statsItems.map((item, index) => (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <div className="text-center cursor-help group hover:transform hover:scale-105 transition-all duration-200">
                    <div className="bg-white/20 rounded-full p-3 w-12 h-12 mx-auto mb-3 group-hover:bg-white/30 transition-colors duration-200">
                      <item.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-white mb-1 group-hover:text-yellow-200 transition-colors duration-200">
                      {item.value}
                    </div>
                    <div className="text-sm text-blue-100 font-medium">
                      {item.label}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{item.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}

// Helper functions to format display names
function formatTemplateName(template: string): string {
  const templateMap: Record<string, string> = {
    'social_media_post': 'Social Post',
    'product_review': 'Review',
    'unboxing_video': 'Unboxing',
    'comparison_video': 'Comparison',
    'tutorial_video': 'Tutorial',
    'lifestyle_integration': 'Lifestyle',
    'before_after': 'Before/After',
    'routine_showcase': 'Routine',
    'skincare': 'Skincare',
    'fashion': 'Fashion',
    'fitness': 'Fitness',
    'food': 'Food',
    'tech': 'Tech',
    'travel': 'Travel'
  };
  
  return templateMap[template] || template.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function formatNicheName(niche: string): string {
  const nicheMap: Record<string, string> = {
    'beauty': 'Beauty',
    'skincare': 'Skincare',
    'fashion': 'Fashion',
    'fitness': 'Fitness',
    'food': 'Food',
    'tech': 'Tech',
    'travel': 'Travel',
    'pets': 'Pets'
  };
  
  return nicheMap[niche] || niche.charAt(0).toUpperCase() + niche.slice(1);
}