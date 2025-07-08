import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Package, Clock, CheckCircle, XCircle, Eye, Calendar, Zap } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface BulkJob {
  id: number;
  jobId: string;
  productName: string;
  niche: string;
  totalVariations: number;
  completedVariations: number;
  status: string;
  platforms: string[];
  tones: string[];
  templates: string[];
  scheduleAfterGeneration: boolean;
  scheduledTime?: string;
  createdAt: string;
  updatedAt: string;
}

interface BulkJobsListProps {
  jobs: BulkJob[];
  isLoading: boolean;
}

export default function BulkJobsList({ jobs, isLoading }: BulkJobsListProps) {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  // Fetch job details when selected
  const { data: jobDetails } = useQuery({
    queryKey: ['/api/bulk/job', selectedJobId],
    enabled: !!selectedJobId,
    staleTime: 10000,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-2 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div className="text-center py-8">
        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Bulk Jobs</h3>
        <p className="text-gray-600">Start your first bulk generation to see jobs here</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'processing': return 'bg-blue-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-yellow-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'processing': return <Zap className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateProgress = (completed: number, total: number) => {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'tiktok': return 'bg-pink-100 text-pink-700';
      case 'instagram': return 'bg-purple-100 text-purple-700';
      case 'youtube': return 'bg-red-100 text-red-700';
      case 'twitter': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-4">
      {jobs.map((job) => {
        const progress = calculateProgress(job.completedVariations, job.totalVariations);
        const isSelected = selectedJobId === job.jobId;
        
        return (
          <Card 
            key={job.id} 
            className={`border transition-all duration-200 ${
              isSelected ? 'border-purple-300 shadow-lg' : 'border-gray-200 hover:shadow-md'
            }`}
          >
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Job Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {job.productName}
                    </h3>
                    <Badge variant="secondary" className="text-xs">
                      {job.niche}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(job.status)}`}></div>
                      <span className="text-sm text-gray-600 flex items-center gap-1">
                        {getStatusIcon(job.status)}
                        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">
                        {job.completedVariations} / {job.totalVariations} variations
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-gray-500">{progress}% complete</p>
                  </div>

                  {/* Platforms */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {job.platforms.map((platform) => (
                      <Badge 
                        key={platform} 
                        variant="secondary" 
                        className={`text-xs ${getPlatformColor(platform)}`}
                      >
                        {platform.charAt(0).toUpperCase() + platform.slice(1)}
                      </Badge>
                    ))}
                  </div>

                  {/* Job Configuration */}
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      <strong>Tones:</strong> {job.tones.join(', ')}
                    </p>
                    <p>
                      <strong>Templates:</strong> {job.templates.join(', ')}
                    </p>
                    <p>
                      <strong>Job ID:</strong> {job.jobId}
                    </p>
                  </div>

                  {/* Scheduling info */}
                  {job.scheduleAfterGeneration && job.scheduledTime && (
                    <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-sm text-blue-700">
                        <Calendar className="h-4 w-4" />
                        <span>Scheduled for {formatDateTime(job.scheduledTime)}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions & Timeline */}
                <div className="flex flex-col items-end gap-3 min-w-fit">
                  <div className="text-right text-sm">
                    <p className="text-gray-600">Created</p>
                    <p className="font-medium">{formatDateTime(job.createdAt)}</p>
                    {job.updatedAt !== job.createdAt && (
                      <p className="text-xs text-gray-500 mt-1">
                        Updated {formatDateTime(job.updatedAt)}
                      </p>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedJobId(isSelected ? null : job.jobId)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Job Details Panel */}
              {isSelected && jobDetails && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-4">Generated Content</h4>
                  
                  {jobDetails.generatedContent && jobDetails.generatedContent.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {jobDetails.generatedContent.slice(0, 4).map((content: any) => (
                        <Card key={content.id} className="border-gray-200">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="text-xs">
                                {content.tone}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {content.templateType}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-3">
                              {content.content.substring(0, 100)}...
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">
                      {job.status === 'processing' ? 'Content being generated...' : 'No content generated yet'}
                    </p>
                  )}

                  {/* Show total count if more content exists */}
                  {jobDetails.generatedContent && jobDetails.generatedContent.length > 4 && (
                    <p className="text-sm text-gray-600 mt-3">
                      And {jobDetails.generatedContent.length - 4} more variations...
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}