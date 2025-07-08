import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Platform {
  id: string;
  name: string;
  icon: string;
  color: string;
  maxLength: number;
  features: string[];
}

const PLATFORMS: Platform[] = [
  {
    id: 'instagram',
    name: 'Instagram',
    icon: '📸',
    color: 'bg-gradient-to-r from-purple-500 to-pink-500',
    maxLength: 2200,
    features: ['Image', 'Video', 'Carousel', 'Hashtags']
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: '🎵',
    color: 'bg-gradient-to-r from-black to-red-500',
    maxLength: 300,
    features: ['Video', 'Trending Sounds', 'Hashtags']
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: '🎥',
    color: 'bg-gradient-to-r from-red-500 to-red-600',
    maxLength: 5000,
    features: ['Video', 'Title', 'Description', 'Tags']
  },
  {
    id: 'twitter',
    name: 'X/Twitter',
    icon: '🐦',
    color: 'bg-gradient-to-r from-blue-400 to-blue-600',
    maxLength: 280,
    features: ['Text', 'Hashtags', 'Link']
  },
  {
    id: 'threads',
    name: 'Threads',
    icon: '🧵',
    color: 'bg-gradient-to-r from-gray-700 to-gray-900',
    maxLength: 500,
    features: ['Text', 'Image', 'Hashtags']
  }
];

interface PlatformSelectorProps {
  selectedPlatforms: string[];
  onPlatformChange: (platforms: string[]) => void;
  className?: string;
}

export function PlatformSelector({ 
  selectedPlatforms, 
  onPlatformChange, 
  className = "" 
}: PlatformSelectorProps) {
  
  const handlePlatformToggle = (platformId: string, checked: boolean) => {
    if (checked) {
      onPlatformChange([...selectedPlatforms, platformId]);
    } else {
      onPlatformChange(selectedPlatforms.filter(id => id !== platformId));
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📱 Select Publishing Platforms
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Choose which platforms to optimize your content for
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PLATFORMS.map((platform) => {
            const isSelected = selectedPlatforms.includes(platform.id);
            
            return (
              <div
                key={platform.id}
                className={`
                  relative rounded-lg border-2 p-4 cursor-pointer transition-all duration-200
                  ${isSelected 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                  }
                `}
                onClick={() => handlePlatformToggle(platform.id, !isSelected)}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    id={platform.id}
                    checked={isSelected}
                    onCheckedChange={(checked) => 
                      handlePlatformToggle(platform.id, checked as boolean)
                    }
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex-1 min-w-0">
                    <Label 
                      htmlFor={platform.id}
                      className="cursor-pointer flex items-center gap-2 font-medium"
                    >
                      <span className="text-lg">{platform.icon}</span>
                      {platform.name}
                    </Label>
                    
                    <div className="mt-2 space-y-1">
                      <div className="text-xs text-muted-foreground">
                        Max length: {platform.maxLength.toLocaleString()} chars
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {platform.features.map((feature) => (
                          <span
                            key={feature}
                            className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded-full"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {selectedPlatforms.length > 0 && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="text-sm text-green-800 dark:text-green-200">
              ✅ {selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? 's' : ''} selected
            </div>
            <div className="text-xs text-green-600 dark:text-green-300 mt-1">
              Content will be optimized for: {selectedPlatforms.join(', ')}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}