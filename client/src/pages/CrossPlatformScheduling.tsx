import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, PlayCircle, CheckCircle, XCircle, TrendingUp, Users, Eye } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import ScheduleContentForm from '@/components/ScheduleContentForm';
import ScheduledPostsList from '@/components/ScheduledPostsList';
import { useToast } from '@/hooks/use-toast';

export default function CrossPlatformScheduling() {
  const [activeTab, setActiveTab] = useState('schedule');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch scheduled posts
  const { data: scheduledPosts, isLoading: postsLoading } = useQuery({
    queryKey: ['/api/scheduling/posts'],
    staleTime: 30000,
  });

  // Process scheduled posts mutation
  const processPostsMutation = useMutation({
    mutationFn: () => apiRequest('/api/scheduling/process', { method: 'POST' }),
    onSuccess: (data) => {
      toast({
        title: 'Posts Processed',
        description: `Successfully processed ${data.processedPosts} scheduled posts`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/scheduling/posts'] });
    },
    onError: (error) => {
      toast({
        title: 'Processing Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleProcessPosts = () => {
    processPostsMutation.mutate();
  };

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
      case 'processing': return <PlayCircle className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  // Calculate summary stats
  const totalPosts = scheduledPosts?.posts?.length || 0;
  const pendingPosts = scheduledPosts?.posts?.filter((p: any) => p.status === 'pending').length || 0;
  const completedPosts = scheduledPosts?.posts?.filter((p: any) => p.status === 'completed').length || 0;
  const failedPosts = scheduledPosts?.posts?.filter((p: any) => p.status === 'failed').length || 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Calendar className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Cross-Platform Scheduling</h1>
            <p className="text-gray-600">Automate content distribution across TikTok, Instagram, YouTube, and Twitter</p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Scheduled</p>
                  <p className="text-2xl font-bold">{totalPosts}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingPosts}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Published</p>
                  <p className="text-2xl font-bold text-green-600">{completedPosts}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Failed</p>
                  <p className="text-2xl font-bold text-red-600">{failedPosts}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Button */}
        <div className="flex gap-3">
          <Button 
            onClick={handleProcessPosts}
            disabled={processPostsMutation.isPending || pendingPosts === 0}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <PlayCircle className="h-4 w-4 mr-2" />
            {processPostsMutation.isPending ? 'Processing...' : `Process ${pendingPosts} Pending Posts`}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="schedule">Schedule Content</TabsTrigger>
          <TabsTrigger value="posts">Scheduled Posts</TabsTrigger>
          <TabsTrigger value="automation">Automation Setup</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Schedule New Content
              </CardTitle>
              <CardDescription>
                Select content and platforms to schedule automatic distribution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScheduleContentForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="posts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Scheduled Posts
              </CardTitle>
              <CardDescription>
                Monitor and manage your scheduled content distribution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScheduledPostsList 
                posts={scheduledPosts?.posts || []}
                isLoading={postsLoading}
                getStatusColor={getStatusColor}
                getStatusIcon={getStatusIcon}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Make.com Integration
              </CardTitle>
              <CardDescription>
                Configure automated workflows for content distribution
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Automation Benefits</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Automatic posting to TikTok, Instagram, YouTube, Twitter</li>
                  <li>• Smart scheduling based on audience activity</li>
                  <li>• Platform-specific content optimization</li>
                  <li>• Error handling and retry mechanisms</li>
                </ul>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium">Platform Features</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="secondary" className="bg-pink-100 text-pink-700">TikTok</Badge>
                      <span>Video uploads, trending hashtags</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="secondary" className="bg-purple-100 text-purple-700">Instagram</Badge>
                      <span>Posts, Stories, Reels</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="secondary" className="bg-red-100 text-red-700">YouTube</Badge>
                      <span>Shorts, descriptions, tags</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700">Twitter</Badge>
                      <span>Threads, images, engagement</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Setup Instructions</h4>
                  <ol className="text-sm space-y-1 text-gray-600">
                    <li>1. Create Make.com account</li>
                    <li>2. Import GlowBot scenario template</li>
                    <li>3. Connect social media accounts</li>
                    <li>4. Configure webhook URL</li>
                    <li>5. Test automation workflow</li>
                  </ol>
                </div>
              </div>

              <Button className="w-full bg-green-600 hover:bg-green-700">
                <Users className="h-4 w-4 mr-2" />
                Setup Make.com Integration
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}