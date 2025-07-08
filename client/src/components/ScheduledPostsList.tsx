import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, Eye, Edit, Trash2, ExternalLink } from 'lucide-react';

interface ScheduledPost {
  id: number;
  contentId: number;
  platforms: string[];
  scheduledTime: string;
  status: string;
  bulkJobId?: string;
  platformResults?: any;
  errorMessage?: string;
  createdAt: string;
  content: {
    product: string;
    niche: string;
    content: string;
  };
}

interface ScheduledPostsListProps {
  posts: ScheduledPost[];
  isLoading: boolean;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
}

export default function ScheduledPostsList({ 
  posts, 
  isLoading, 
  getStatusColor, 
  getStatusIcon 
}: ScheduledPostsListProps) {

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Scheduled Posts</h3>
        <p className="text-gray-600">Schedule your first content to see it here</p>
      </div>
    );
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPlatformBadgeColor = (platform: string) => {
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
      {posts.map((post) => (
        <Card key={post.id} className="border border-gray-200 hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Content Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-gray-900">
                    {post.content.product}
                  </h3>
                  <Badge variant="secondary" className="text-xs">
                    {post.content.niche}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(post.status)}`}></div>
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      {getStatusIcon(post.status)}
                      {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Platform badges */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {post.platforms.map((platform) => (
                    <Badge 
                      key={platform} 
                      variant="secondary" 
                      className={`text-xs ${getPlatformBadgeColor(platform)}`}
                    >
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </Badge>
                  ))}
                </div>

                {/* Content preview */}
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                  {post.content.content.substring(0, 120)}...
                </p>

                {/* Error message if any */}
                {post.errorMessage && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                    <p className="text-sm text-red-700">
                      <strong>Error:</strong> {post.errorMessage}
                    </p>
                  </div>
                )}

                {/* Bulk job info */}
                {post.bulkJobId && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Badge variant="outline" className="text-xs">
                      Bulk Job: {post.bulkJobId}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Schedule Info & Actions */}
              <div className="flex flex-col items-end gap-3 min-w-fit">
                <div className="text-right">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Clock className="h-4 w-4" />
                    <span>Scheduled for</span>
                  </div>
                  <p className="font-medium text-gray-900">
                    {formatDateTime(post.scheduledTime)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Created {formatDateTime(post.createdAt)}
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  {post.status === 'pending' && (
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}

                  {post.platformResults && (
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}

                  {post.status === 'failed' && (
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Platform results if available */}
            {post.platformResults && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Platform Results</h4>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-700">
                    Content successfully distributed to {post.platforms.length} platform(s)
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}