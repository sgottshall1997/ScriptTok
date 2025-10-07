import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TierBadgeProps {
  tier: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function TierBadge({ tier, size = 'md', className }: TierBadgeProps) {
  const tierConfig: Record<string, { icon: string; colorClass: string; label: string }> = {
    starter: { 
      icon: '🌱', 
      colorClass: 'bg-green-500 hover:bg-green-600 text-white border-green-600', 
      label: 'Starter' 
    },
    creator: { 
      icon: '⭐', 
      colorClass: 'bg-purple-500 hover:bg-purple-600 text-white border-purple-600', 
      label: 'Creator' 
    },
    pro: { 
      icon: '🚀', 
      colorClass: 'bg-blue-500 hover:bg-blue-600 text-white border-blue-600', 
      label: 'Pro' 
    },
    agency: { 
      icon: '👥', 
      colorClass: 'bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white border-yellow-600', 
      label: 'Agency' 
    }
  };

  const config = tierConfig[tier.toLowerCase()] || tierConfig.starter;
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5'
  };

  return (
    <Badge 
      className={cn(config.colorClass, sizeClasses[size], className)}
      data-testid={`badge-tier-${tier.toLowerCase()}`}
    >
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </Badge>
  );
}
