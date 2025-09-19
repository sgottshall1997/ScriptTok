import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Home, ChefHat } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Mode {
  name: string;
  value: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const modes: Mode[] = [
  {
    name: 'Main App',
    value: 'main',
    href: '/',
    icon: Home,
    description: 'Content generation and core features'
  },
  {
    name: 'CookAIng',
    value: 'cookaing',
    href: '/cookaing-marketing',
    icon: ChefHat,
    description: 'Marketing automation and analytics'
  }
];

const ModeSwitcher: React.FC = () => {
  const [location, navigate] = useLocation();
  
  // Determine current mode based on location
  const getCurrentMode = () => {
    if (location.startsWith('/cookaing-marketing')) {
      return modes.find(m => m.value === 'cookaing') || modes[0];
    }
    return modes[0]; // Default to main app
  };

  const currentMode = getCurrentMode();

  const handleModeChange = (mode: Mode) => {
    navigate(mode.href);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "flex items-center space-x-2 min-w-[140px] justify-between",
            currentMode.value === 'cookaing' && "border-blue-500 bg-blue-50 dark:bg-blue-950"
          )}
        >
          <div className="flex items-center space-x-2">
            <currentMode.icon className="h-4 w-4" />
            <span className="font-medium">{currentMode.name}</span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="start" className="w-64">
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isActive = mode.value === currentMode.value;
          
          return (
            <DropdownMenuItem
              key={mode.value}
              onClick={() => handleModeChange(mode)}
              className={cn(
                "flex flex-col items-start space-y-1 p-3 cursor-pointer",
                isActive && "bg-blue-50 dark:bg-blue-950"
              )}
            >
              <div className="flex items-center space-x-2 w-full">
                <Icon className="h-4 w-4" />
                <span className="font-medium">{mode.name}</span>
                {isActive && (
                  <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full" />
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {mode.description}
              </p>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ModeSwitcher;