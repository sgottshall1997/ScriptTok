import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Pause, 
  Play, 
  Download,
  ChefHat,
  RefreshCw,
  Calendar,
  Zap
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface AutomatedCookAIngJob {
  id: string;
  type: 'automated';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'paused' | 'scheduled';
  progress: number;
  totalRecipes: number;
  completedRecipes: number;
  ingredientsProcessed: string[];
  cookingMethods: string[];
  platforms: string[];
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  nextRunAt?: string;
  error?: string;
  isRecurring: boolean;
}

interface AutomatedCookAIngBulkJobsListProps {
  limit?: number;
}

export default function AutomatedCookAIngBulkJobsList({ limit = 10 }: AutomatedCookAIngBulkJobsListProps) {
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch automated CookAIng bulk jobs
  const { data: jobsData, isLoading } = useQuery({
    queryKey: ['/api/cookAIng/generator/automated/jobs'],
    refetchInterval: 5000, // Refresh every 5 seconds for real-time updates
    staleTime: 1000,
  });

  const jobs: AutomatedCookAIngJob[] = jobsData?.jobs?.slice(0, limit) || [];

  // Pause/Resume job mutation
  const pauseResumeMutation = useMutation({
    mutationFn: ({ jobId, action }: { jobId: string; action: 'pause' | 'resume' }) => 
      apiRequest(`/api/cookAIng/generator/automated/jobs/${jobId}/${action}`, {
        method: 'POST',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cookAIng/generator/automated/jobs'] });
      toast({
        title: 'Job Updated',
        description: 'Automated recipe generation job has been updated',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Update Failed',
        description: error?.message || 'Failed to update job',
        variant: 'destructive',
      });
    }
  });

  // Cancel job mutation
  const cancelJobMutation = useMutation({
    mutationFn: (jobId: string) => apiRequest(`/api/cookAIng/generator/automated/jobs/${jobId}/cancel`, {
      method: 'POST',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cookAIng/generator/automated/jobs'] });
      toast({
        title: 'Job Cancelled',
        description: 'Automated recipe generation job has been cancelled',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Cancel Failed',
        description: error?.message || 'Failed to cancel job',
        variant: 'destructive',
      });
    }
  });

  // Download results mutation
  const downloadMutation = useMutation({
    mutationFn: (jobId: string) => apiRequest(`/api/cookAIng/generator/automated/jobs/${jobId}/download`, {
      method: 'GET',
    }),
    onSuccess: (response, jobId) => {
      // Create download link
      const url = window.URL.createObjectURL(new Blob([JSON.stringify(response, null, 2)]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `automated-cookaing-recipes-${jobId}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: 'Download Started',
        description: 'Automated recipe results are being downloaded',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Download Failed',
        description: error?.message || 'Failed to download results',
        variant: 'destructive',
      });
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'processing':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-gray-500" />;
      case 'scheduled':
        return <Calendar className="h-4 w-4 text-purple-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'paused':
        return 'bg-gray-100 text-gray-800';
      case 'scheduled':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (startedAt?: string, completedAt?: string) => {
    if (!startedAt) return 'Not started';
    
    const start = new Date(startedAt);
    const end = completedAt ? new Date(completedAt) : new Date();
    const duration = Math.floor((end.getTime() - start.getTime()) / 1000);
    
    if (duration < 60) return `${duration}s`;
    if (duration < 3600) return `${Math.floor(duration / 60)}m ${duration % 60}s`;
    return `${Math.floor(duration / 3600)}h ${Math.floor((duration % 3600) / 60)}m`;
  };

  if (isLoading) {
    return (
      <div className="space-y-3" data-testid="automated-jobs-loading">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-2 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500" data-testid="no-automated-jobs">
        <Zap className="h-12 w-12 mx-auto mb-3 text-gray-300" />
        <p>No automated recipe generation jobs found</p>
        <p className="text-sm">Set up automated generation to see jobs here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="automated-cookaing-jobs-list">
      {jobs.map((job) => (
        <Card key={job.id} className="transition-shadow hover:shadow-md" data-testid={`automated-job-${job.id}`}>
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(job.status)}
                    <h3 className="font-medium text-gray-900" data-testid={`automated-job-title-${job.id}`}>
                      Automated Recipe Generation
                    </h3>
                    <Badge 
                      className={getStatusColor(job.status)}
                      data-testid={`automated-job-status-${job.id}`}
                    >
                      {job.status}
                    </Badge>
                    {job.isRecurring && (
                      <Badge variant="outline" className="text-xs">
                        <Calendar className="h-3 w-3 mr-1" />
                        Recurring
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {job.cookingMethods.length} cooking methods • {job.platforms.length} platforms
                  </div>
                  <div className="text-xs text-gray-400">
                    {job.status === 'scheduled' && job.nextRunAt ? (
                      <>Next run: {formatDateTime(job.nextRunAt)}</>
                    ) : (
                      <>Started {formatDuration(job.startedAt, job.completedAt)} ago</>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  {job.status === 'completed' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadMutation.mutate(job.id)}
                      disabled={downloadMutation.isPending}
                      data-testid={`download-automated-job-${job.id}`}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {job.status === 'processing' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => pauseResumeMutation.mutate({ jobId: job.id, action: 'pause' })}
                      disabled={pauseResumeMutation.isPending}
                      data-testid={`pause-automated-job-${job.id}`}
                    >
                      <Pause className="h-4 w-4" />
                    </Button>
                  )}

                  {job.status === 'paused' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => pauseResumeMutation.mutate({ jobId: job.id, action: 'resume' })}
                      disabled={pauseResumeMutation.isPending}
                      data-testid={`resume-automated-job-${job.id}`}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {(job.status === 'processing' || job.status === 'pending' || job.status === 'scheduled') && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => cancelJobMutation.mutate(job.id)}
                      disabled={cancelJobMutation.isPending}
                      data-testid={`cancel-automated-job-${job.id}`}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Progress */}
              {job.status === 'processing' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress</span>
                    <span>{job.completedRecipes} / {job.totalRecipes} recipes</span>
                  </div>
                  <Progress value={job.progress} className="h-2" data-testid={`automated-job-progress-${job.id}`} />
                </div>
              )}

              {/* Processed Ingredients */}
              {job.ingredientsProcessed.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs text-gray-500">Processed Ingredients:</div>
                  <div className="flex flex-wrap gap-1">
                    {job.ingredientsProcessed.slice(0, 5).map((ingredient, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {ingredient}
                      </Badge>
                    ))}
                    {job.ingredientsProcessed.length > 5 && (
                      <Badge variant="outline" className="text-xs">
                        +{job.ingredientsProcessed.length - 5} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Cooking Methods and Platforms */}
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  <span className="text-xs text-gray-500 mr-2">Methods:</span>
                  {job.cookingMethods.map((method) => (
                    <Badge key={method} variant="outline" className="text-xs">
                      {method.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1">
                  <span className="text-xs text-gray-500 mr-2">Platforms:</span>
                  {job.platforms.map((platform) => (
                    <Badge key={platform} variant="outline" className="text-xs">
                      {platform}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Error Message */}
              {job.status === 'failed' && job.error && (
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <p className="text-sm text-red-800">{job.error}</p>
                </div>
              )}

              {/* Completion Summary */}
              {job.status === 'completed' && (
                <div className="bg-green-50 border border-green-200 rounded p-3">
                  <p className="text-sm text-green-800">
                    ✅ Generated {job.completedRecipes} recipe variations in {formatDuration(job.startedAt, job.completedAt)}
                    {job.isRecurring && ' • Will run again automatically'}
                  </p>
                </div>
              )}

              {/* Scheduled Info */}
              {job.status === 'scheduled' && job.nextRunAt && (
                <div className="bg-purple-50 border border-purple-200 rounded p-3">
                  <p className="text-sm text-purple-800">
                    📅 Scheduled to run at {formatDateTime(job.nextRunAt)}
                    {job.isRecurring && ' • Repeats daily'}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}