import React, { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Clock, Calendar, Check, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface ScheduleDailyBulkToggleProps {
  formData: any;
  isVisible?: boolean;
}

const ScheduleDailyBulkToggle: React.FC<ScheduleDailyBulkToggleProps> = ({ 
  formData, 
  isVisible = true 
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isScheduleEnabled, setIsScheduleEnabled] = useState(false);
  const [scheduleSettings, setScheduleSettings] = useState({
    name: '',
    scheduleTime: '05:00',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York'
  });

  // Auto-generate a meaningful name when form data changes
  useEffect(() => {
    if (formData.selectedNiches?.length && formData.tones?.length) {
      const nicheText = formData.selectedNiches.length === 1 
        ? formData.selectedNiches[0] 
        : `${formData.selectedNiches.length} niches`;
      const toneText = formData.tones.length === 1 
        ? formData.tones[0] 
        : `${formData.tones.length} tones`;
      
      setScheduleSettings(prev => ({
        ...prev,
        name: `Daily ${nicheText} content (${toneText})`
      }));
    }
  }, [formData.selectedNiches, formData.tones]);

  const createScheduledJobMutation = useMutation({
    mutationFn: async (jobData: any) => {
      return apiRequest('POST', '/api/scheduled-bulk/jobs', jobData);
    },
    onSuccess: () => {
      toast({
        title: "✅ Scheduled!",
        description: `Your daily bulk generation will run at ${scheduleSettings.scheduleTime}.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/scheduled-bulk/jobs'] });
      setIsScheduleEnabled(false); // Reset the toggle
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create scheduled job",
        variant: "destructive"
      });
    }
  });

  const handleSaveSchedule = () => {
    if (!scheduleSettings.name.trim()) {
      toast({
        title: "Missing Name",
        description: "Please provide a name for your scheduled job",
        variant: "destructive"
      });
      return;
    }

    const jobData = {
      name: scheduleSettings.name,
      scheduleTime: scheduleSettings.scheduleTime,
      timezone: scheduleSettings.timezone,
      selectedNiches: formData.selectedNiches || [],
      tones: formData.tones || [],
      templates: formData.templates || [],
      platforms: formData.platforms || [],
      useExistingProducts: formData.useExistingProducts || true,
      generateAffiliateLinks: formData.generateAffiliateLinks || false,
      useSpartanFormat: formData.useSpartanFormat || false,
      useSmartStyle: formData.useSmartStyle || false,
      affiliateId: formData.affiliateId || 'sgottshall107-20',
      aiModel: formData.selectedAiModels?.[0] || 'claude', // 🚀 CLAUDE-FIRST: Prioritize Claude for scheduled jobs
      webhookUrl: 'https://hook.us2.make.com/rkemtdx2hmy4tpd0to9bht6dg23s8wjw',
      sendToMakeWebhook: true
    };

    createScheduledJobMutation.mutate(jobData);
  };

  if (!isVisible) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <Switch
          id="schedule-daily-bulk"
          checked={isScheduleEnabled}
          onCheckedChange={setIsScheduleEnabled}
        />
        <Label htmlFor="schedule-daily-bulk" className="flex items-center space-x-2">
          <Calendar className="w-4 h-4" />
          <span>Schedule Daily Bulk Generation</span>
        </Label>
      </div>
      
      <p className="text-sm text-muted-foreground">
        Run this bulk generation automatically each day at the selected time
      </p>

      {isScheduleEnabled && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="job-name">Schedule Name</Label>
                <Input
                  id="job-name"
                  placeholder="Daily content generation"
                  value={scheduleSettings.name}
                  onChange={(e) => setScheduleSettings(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="schedule-time" className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>Time</span>
                </Label>
                <Input
                  id="schedule-time"
                  type="time"
                  value={scheduleSettings.scheduleTime}
                  onChange={(e) => setScheduleSettings(prev => ({ ...prev, scheduleTime: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select 
                value={scheduleSettings.timezone} 
                onValueChange={(value) => setScheduleSettings(prev => ({ ...prev, timezone: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                  <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Configuration Preview */}
            <div className="bg-white p-3 rounded-lg border">
              <h4 className="font-medium text-sm mb-2 flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-600" />
                <span>Configuration Preview</span>
              </h4>
              <div className="text-xs space-y-1 text-muted-foreground">
                <div><strong>Niches:</strong> {formData.selectedNiches?.join(', ') || 'None selected'}</div>
                <div><strong>Tones:</strong> {formData.tones?.join(', ') || 'None selected'}</div>
                <div><strong>Templates:</strong> {formData.templates?.length || 0} selected</div>
                <div><strong>Platforms:</strong> {formData.platforms?.join(', ') || 'None selected'}</div>
                <div><strong>Spartan Format:</strong> {formData.useSpartanFormat ? 'Enabled' : 'Disabled'}</div>
                <div><strong>Affiliate Links:</strong> {formData.generateAffiliateLinks ? 'Enabled' : 'Disabled'}</div>
              </div>
            </div>

            {/* Confirmation Message */}
            <div className="bg-blue-100 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>📅 This bulk generation will auto-run every day at {scheduleSettings.scheduleTime} {scheduleSettings.timezone.split('/')[1]?.replace('_', ' ')}</strong>
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setIsScheduleEnabled(false)}
                disabled={createScheduledJobMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveSchedule}
                disabled={createScheduledJobMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {createScheduledJobMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4 mr-2" />
                    Save Schedule
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ScheduleDailyBulkToggle;