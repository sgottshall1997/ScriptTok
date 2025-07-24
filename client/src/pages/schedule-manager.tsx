import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Calendar, Clock, Play, Trash2, Settings, AlertCircle, CheckCircle, Zap, Users, Target, Sparkles } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ScheduleManager: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch scheduled jobs
  const { data: scheduledJobs, isLoading, error } = useQuery({
    queryKey: ['/api/automated-bulk/scheduled-jobs'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/automated-bulk/scheduled-jobs');
      return response.json();
    }
  });

  // Toggle job active state
  const toggleJobMutation = useMutation({
    mutationFn: async ({ jobId, isActive }: { jobId: string; isActive: boolean }) => {
      if (!isActive) {
        // Delete/stop the job when toggling off
        return apiRequest('DELETE', `/api/automated-bulk/scheduled-jobs/${jobId}`);
      } else {
        // Job reactivation would require recreating the job - not supported in simplified system
        throw new Error('Job reactivation not supported. Please create a new scheduled job.');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/automated-bulk/scheduled-jobs'] });
      toast({
        title: "Updated",
        description: "Job status updated successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update job",
        variant: "destructive"
      });
    }
  });

  // Delete job
  const deleteJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      return apiRequest('DELETE', `/api/automated-bulk/scheduled-jobs/${jobId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/automated-bulk/scheduled-jobs'] });
      toast({
        title: "Deleted",
        description: "Scheduled job deleted successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete job",
        variant: "destructive"
      });
    }
  });

  // Trigger job manually
  const triggerJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      // Manual trigger not available in simplified system
      throw new Error('Manual job triggering not supported in simplified system');
    },
    onSuccess: () => {
      toast({
        title: "✅ Job Triggered",
        description: "Manual execution started successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to trigger job",
        variant: "destructive"
      });
    }
  });

  const formatTime = (time: string, timezone: string) => {
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }) + ` ${timezone.split('/')[1]?.replace('_', ' ')}`;
  };

  const formatNextRun = (nextRunAt: string) => {
    if (!nextRunAt) return 'Not scheduled';
    const date = new Date(nextRunAt);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    if (diffHours < 24) {
      return `${Math.round(diffHours)}h from now`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d from now`;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
            <div className="h-4 bg-gray-200 rounded w-96"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-7xl mx-auto">
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load scheduled jobs. Please try again.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const jobs = scheduledJobs?.jobs || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <Calendar className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Schedule Manager</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Manage your automated daily bulk content generation schedules. Set it and forget it!
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Jobs</p>
                  <p className="text-2xl font-bold">{jobs.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold text-green-600">
                    {jobs.filter((job: any) => job.isActive).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Runs</p>
                  <p className="text-2xl font-bold">
                    {jobs.reduce((sum: number, job: any) => sum + (job.totalRuns || 0), 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Failed Jobs</p>
                  <p className="text-2xl font-bold text-red-600">
                    {jobs.filter((job: any) => job.consecutiveFailures > 0).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Jobs List */}
        {jobs.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Scheduled Jobs</h3>
              <p className="text-gray-500 mb-6">
                Create your first scheduled bulk generation job from the Unified Generator
              </p>
              <Button 
                onClick={() => window.location.href = '/unified-generator'}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Create Your First Schedule
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {jobs.map((job: any) => (
              <Card key={job.id} className={`${job.isActive ? 'border-green-200 bg-green-50/30' : 'border-gray-200'}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg flex items-center space-x-2">
                        <span>{job.name}</span>
                        {job.isActive ? (
                          <Badge className="bg-green-600 text-white">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </CardTitle>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatTime(job.scheduleTime, job.timezone)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>Next: {formatNextRun(job.nextRunAt)}</span>
                        </div>
                      </div>
                    </div>
                    <Switch
                      checked={job.isActive}
                      onCheckedChange={(checked) => 
                        toggleJobMutation.mutate({ jobId: job.id, isActive: checked })
                      }
                      disabled={toggleJobMutation.isPending}
                    />
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Configuration Details */}
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="font-medium text-gray-600">Niches:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {job.config?.selectedNiches?.slice(0, 3).map((niche: string) => (
                          <Badge key={niche} variant="outline" className="text-xs">
                            {niche}
                          </Badge>
                        ))}
                        {job.config?.selectedNiches?.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{job.config.selectedNiches.length - 3}
                          </Badge>
                        )}
                        {(!job.config?.selectedNiches || job.config.selectedNiches.length === 0) && (
                          <span className="text-gray-500 text-xs">No niches configured</span>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium text-gray-600">Platforms:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {job.config?.platforms?.slice(0, 3).map((platform: string) => (
                          <Badge key={platform} variant="outline" className="text-xs">
                            {platform}
                          </Badge>
                        ))}
                        {job.config?.platforms?.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{job.config.platforms.length - 3}
                          </Badge>
                        )}
                        {(!job.config?.platforms || job.config.platforms.length === 0) && (
                          <span className="text-gray-500 text-xs">No platforms configured</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Templates and Content Tone */}
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="font-medium text-gray-600">Templates:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {job.config?.templates?.slice(0, 2).map((template: string) => (
                          <Badge key={template} variant="secondary" className="text-xs">
                            {template}
                          </Badge>
                        ))}
                        {job.config?.templates?.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{job.config.templates.length - 2}
                          </Badge>
                        )}
                        {(!job.config?.templates || job.config.templates.length === 0) && (
                          <span className="text-gray-500 text-xs">No templates configured</span>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium text-gray-600">Content Tone:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {job.config?.tones?.map((tone: string) => (
                          <Badge key={tone} variant="outline" className="text-xs">
                            {tone}
                          </Badge>
                        ))}
                        {(!job.config?.tones || job.config.tones.length === 0) && (
                          <span className="text-gray-500 text-xs">friendly</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* AI Models and Content Formats */}
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="font-medium text-gray-600">AI Models:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {job.config?.aiModels?.map((model: string) => (
                          <Badge key={model} variant="default" className="text-xs">
                            {model}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium text-gray-600">Content Formats:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {job.config?.contentFormats?.map((format: string) => (
                          <Badge key={format} variant="outline" className="text-xs">
                            {format}
                          </Badge>
                        ))}
                        {(!job.config?.contentFormats || job.config.contentFormats.length === 0) && (
                          <span className="text-gray-500 text-xs">main_content</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Advanced Settings */}
                  <div className="flex flex-wrap gap-2 text-xs">
                    {job.config?.useSpartanFormat && (
                      <Badge className="bg-purple-600 text-white">Spartan Format</Badge>
                    )}
                    {job.config?.generateAffiliateLinks && (
                      <Badge className="bg-orange-600 text-white">Affiliate Links</Badge>
                    )}
                    {job.config?.topRatedStyleUsed && (
                      <Badge className="bg-blue-600 text-white">Smart Style</Badge>
                    )}
                  </div>

                  {/* Execution Stats */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground bg-gray-50 p-2 rounded">
                    <span>Runs: {job.totalRuns || 0}</span>
                    {job.consecutiveFailures > 0 && (
                      <span className="text-red-600">Failures: {job.consecutiveFailures}</span>
                    )}
                    {job.lastRunAt && (
                      <span>Last: {new Date(job.lastRunAt).toLocaleDateString()}</span>
                    )}
                  </div>

                  {/* Error Display */}
                  {job.lastError && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        {job.lastError}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => triggerJobMutation.mutate(job.id)}
                      disabled={triggerJobMutation.isPending}
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Run Now
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteJobMutation.mutate(job.id)}
                      disabled={deleteJobMutation.isPending}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleManager;