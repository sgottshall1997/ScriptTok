import React, { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar, Clock } from 'lucide-react';

interface Platform {
  id: string;
  name: string;
  icon: string;
  maxChars: number;
  features: string[];
}

const PLATFORMS: Platform[] = [
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: '🎵',
    maxChars: 2200,
    features: ['hashtags', 'trending_sounds', 'viral_hooks']
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: '📸',
    maxChars: 2200,
    features: ['hashtags', 'stories', 'reels']
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: '📺',
    maxChars: 5000,
    features: ['tags', 'timestamps', 'descriptions']
  },
  {
    id: 'twitter',
    name: 'Twitter/X',
    icon: '🐦',
    maxChars: 280,
    features: ['hashtags', 'threads', 'mentions']
  },
  {
    id: 'threads',
    name: 'Threads',
    icon: '🧵',
    maxChars: 500,
    features: ['hashtags', 'replies', 'mentions']
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    icon: '📌',
    maxChars: 500,
    features: ['boards', 'rich_pins', 'hashtags']
  }
];

const SCHEDULE_OPTIONS = [
  { value: 'now', label: 'Post Now' },
  { value: 'optimal', label: 'Optimal Time (AI Selected)' },
  { value: 'morning', label: 'Morning (8-10 AM)' },
  { value: 'afternoon', label: 'Afternoon (12-2 PM)' },
  { value: 'evening', label: 'Evening (6-8 PM)' },
  { value: 'custom', label: 'Custom Time' }
];

interface PlatformSelectorProps {
  selectedPlatforms: string[];
  onPlatformsChange: (platforms: string[]) => void;
  scheduleTime?: string;
  onScheduleChange?: (schedule: string) => void;
  showScheduling?: boolean;
}

export function PlatformSelector({ 
  selectedPlatforms, 
  onPlatformsChange, 
  scheduleTime = 'now',
  onScheduleChange,
  showScheduling = true 
}: PlatformSelectorProps) {
  const [customTime, setCustomTime] = useState('');

  const handlePlatformToggle = (platformId: string) => {
    const updated = selectedPlatforms.includes(platformId)
      ? selectedPlatforms.filter(id => id !== platformId)
      : [...selectedPlatforms, platformId];
    onPlatformsChange(updated);
  };

  const handleScheduleTimeChange = (value: string) => {
    if (onScheduleChange) {
      onScheduleChange(value);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>📱</span>
          Platform Selection & Scheduling
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Platform Selection */}
        <div>
          <h3 className="font-medium mb-3">Select Platforms</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {PLATFORMS.map((platform) => (
              <div
                key={platform.id}
                className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedPlatforms.includes(platform.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handlePlatformToggle(platform.id)}
              >
                <Checkbox
                  checked={selectedPlatforms.includes(platform.id)}
                  onChange={() => handlePlatformToggle(platform.id)}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{platform.icon}</span>
                    <Label className="text-sm font-medium cursor-pointer">
                      {platform.name}
                    </Label>
                  </div>
                  <p className="text-xs text-gray-500">
                    Max: {platform.maxChars} chars
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          {selectedPlatforms.length > 0 && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                Selected: {selectedPlatforms.map(id => 
                  PLATFORMS.find(p => p.id === id)?.name
                ).join(', ')}
              </p>
            </div>
          )}
        </div>

        {/* Scheduling Options */}
        {showScheduling && (
          <div>
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Schedule Publishing
            </h3>
            <div className="space-y-3">
              <Select value={scheduleTime} onValueChange={handleScheduleTimeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select posting time" />
                </SelectTrigger>
                <SelectContent>
                  {SCHEDULE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {scheduleTime === 'custom' && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <input
                    type="datetime-local"
                    value={customTime}
                    onChange={(e) => setCustomTime(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              )}

              {scheduleTime === 'optimal' && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    AI will analyze your audience engagement patterns and select the optimal posting time for maximum reach.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Platform Features Preview */}
        {selectedPlatforms.length > 0 && (
          <div>
            <h3 className="font-medium mb-3">Platform Features</h3>
            <div className="space-y-2">
              {selectedPlatforms.map(platformId => {
                const platform = PLATFORMS.find(p => p.id === platformId);
                return platform ? (
                  <div key={platformId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">
                      {platform.icon} {platform.name}
                    </span>
                    <div className="flex gap-1">
                      {platform.features.map(feature => (
                        <span key={feature} className="text-xs bg-white px-2 py-1 rounded border">
                          {feature.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}