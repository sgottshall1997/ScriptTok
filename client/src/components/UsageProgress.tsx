import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface UsageProgressProps {
  used: number;
  limit: number;
  label: string;
  className?: string;
}

export function UsageProgress({ used, limit, label, className }: UsageProgressProps) {
  const isUnlimited = limit === Infinity || limit === 999999;
  const percentage = isUnlimited ? 0 : Math.min((used / limit) * 100, 100);
  
  const getColorClass = () => {
    if (isUnlimited) return 'bg-green-500';
    if (percentage < 50) return 'bg-green-500';
    if (percentage < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getTextColor = () => {
    if (isUnlimited) return 'text-green-600';
    if (percentage < 50) return 'text-green-600';
    if (percentage < 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className={cn('space-y-2', className)} data-testid={`usage-${label.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className={cn('text-xs font-semibold', getTextColor())}>
          {used} / {isUnlimited ? '∞' : limit}
        </span>
      </div>
      <Progress 
        value={percentage} 
        className="h-2"
        indicatorClassName={getColorClass()}
      />
      {!isUnlimited && (
        <p className="text-xs text-gray-500">
          {limit - used} remaining
        </p>
      )}
    </div>
  );
}
