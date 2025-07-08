import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, Send, Smartphone, Monitor, Video, MessageCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

const PLATFORMS = [
  { id: 'tiktok', name: 'TikTok', icon: Video, color: 'bg-pink-100 text-pink-700' },
  { id: 'instagram', name: 'Instagram', icon: Smartphone, color: 'bg-purple-100 text-purple-700' },
  { id: 'youtube', name: 'YouTube', icon: Monitor, color: 'bg-red-100 text-red-700' },
  { id: 'twitter', name: 'Twitter', icon: MessageCircle, color: 'bg-blue-100 text-blue-700' },
];

export default function ScheduleContentForm() {
  const [selectedContent, setSelectedContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [scheduledDateTime, setScheduledDateTime] = useState('');
  const [makeWebhookUrl, setMakeWebhookUrl] = useState('');
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch available content
  const { data: contentList } = useQuery({
    queryKey: ['/api/generateContent'],
    staleTime: 60000,
  });

  // Schedule content mutation
  const scheduleContentMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/scheduling/schedule-content', { 
      method: 'POST', 
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    }),
    onSuccess: (data) => {
      toast({
        title: 'Content Scheduled',
        description: `Successfully scheduled content for ${data.platformContent.length} platforms`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/scheduling/posts'] });
      // Reset form
      setSelectedContent('');
      setSelectedPlatforms([]);
      setScheduledDateTime('');
      setMakeWebhookUrl('');
    },
    onError: (error) => {
      toast({
        title: 'Scheduling Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedContent) {
      toast({
        title: 'Content Required',
        description: 'Please select content to schedule',
        variant: 'destructive',
      });
      return;
    }

    if (selectedPlatforms.length === 0) {
      toast({
        title: 'Platforms Required',
        description: 'Please select at least one platform',
        variant: 'destructive',
      });
      return;
    }

    if (!scheduledDateTime) {
      toast({
        title: 'Date/Time Required',
        description: 'Please select when to publish the content',
        variant: 'destructive',
      });
      return;
    }

    const scheduleData = {
      contentId: parseInt(selectedContent),
      platforms: selectedPlatforms,
      scheduledTime: new Date(scheduledDateTime).toISOString(),
      makeWebhookUrl: makeWebhookUrl || undefined,
    };

    scheduleContentMutation.mutate(scheduleData);
  };

  // Generate minimum datetime (15 minutes from now)
  const minDateTime = new Date(Date.now() + 15 * 60 * 1000).toISOString().slice(0, 16);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Content Selection */}
      <div className="space-y-3">
        <Label htmlFor="content-select" className="text-base font-medium">
          Select Content to Schedule
        </Label>
        <select
          id="content-select"
          value={selectedContent}
          onChange={(e) => setSelectedContent(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Choose from recent content...</option>
          {contentList?.slice(0, 20).map((content: any) => (
            <option key={content.id} value={content.id}>
              {content.product} ({content.niche}) - {content.templateType}
            </option>
          ))}
        </select>
      </div>

      {/* Platform Selection */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Select Platforms</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {PLATFORMS.map((platform) => {
            const IconComponent = platform.icon;
            const isSelected = selectedPlatforms.includes(platform.id);
            
            return (
              <Card 
                key={platform.id}
                className={`cursor-pointer transition-all duration-200 ${
                  isSelected 
                    ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-200' 
                    : 'hover:bg-gray-50 border-gray-200'
                }`}
                onClick={() => handlePlatformToggle(platform.id)}
              >
                <CardContent className="p-4 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className={`p-2 rounded-lg ${platform.color}`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-medium">{platform.name}</span>
                    {isSelected && (
                      <Badge variant="default" className="text-xs">Selected</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <p className="text-sm text-gray-600">
          Selected {selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Schedule Date/Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="schedule-datetime" className="text-base font-medium">
            Schedule Date & Time
          </Label>
          <div className="relative">
            <Input
              id="schedule-datetime"
              type="datetime-local"
              value={scheduledDateTime}
              min={minDateTime}
              onChange={(e) => setScheduledDateTime(e.target.value)}
              className="pl-10"
              required
            />
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          <p className="text-xs text-gray-500">
            Content will be posted automatically at this time
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="webhook-url" className="text-base font-medium">
            Make.com Webhook URL (Optional)
          </Label>
          <div className="relative">
            <Input
              id="webhook-url"
              type="url"
              value={makeWebhookUrl}
              onChange={(e) => setMakeWebhookUrl(e.target.value)}
              placeholder="https://hook.integromat.com/..."
              className="pl-10"
            />
            <Send className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          <p className="text-xs text-gray-500">
            Optional webhook for advanced automation
          </p>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button 
          type="submit" 
          disabled={scheduleContentMutation.isPending || !selectedContent || selectedPlatforms.length === 0 || !scheduledDateTime}
          className="bg-blue-600 hover:bg-blue-700 px-6"
        >
          <Clock className="h-4 w-4 mr-2" />
          {scheduleContentMutation.isPending ? 'Scheduling...' : 'Schedule Content'}
        </Button>
      </div>
    </form>
  );
}