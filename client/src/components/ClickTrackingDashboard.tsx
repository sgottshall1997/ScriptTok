import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  TrendingUp, 
  MousePointer, 
  Calendar, 
  ExternalLink,
  RefreshCw,
  BarChart3
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface ClickLog {
  id: number;
  slug: string;
  affiliateUrl: string;
  product: string;
  niche: string;
  platform: string;
  contentType: string;
  source: string;
  clicks: number;
  lastClickAt?: string;
  createdAt: string;
  redirectUrl: string;
}

interface ClickStats {
  totalClicks: number;
  totalLinks: number;
  topPerformer: ClickLog | null;
  recentActivity: ClickLog[];
}

export function ClickTrackingDashboard() {
  const queryClient = useQueryClient();
  
  const { 
    data: clickLogs, 
    isLoading, 
    error 
  } = useQuery<{ success: boolean; links: ClickLog[] }>({
    queryKey: ['/api/redirect'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const refreshMutation = useMutation({
    mutationFn: () => apiRequest('GET', '/api/redirect'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/redirect'] });
    }
  });

  const links = clickLogs?.links || [];
  
  // Calculate stats
  const stats: ClickStats = {
    totalClicks: links.reduce((sum, link) => sum + link.clicks, 0),
    totalLinks: links.length,
    topPerformer: links.length > 0 
      ? links.reduce((max, link) => link.clicks > max.clicks ? link : max)
      : null,
    recentActivity: links
      .filter(link => link.lastClickAt)
      .sort((a, b) => new Date(b.lastClickAt!).getTime() - new Date(a.lastClickAt!).getTime())
      .slice(0, 5)
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNicheBadgeColor = (niche: string) => {
    const colors: Record<string, string> = {
      skincare: 'bg-pink-100 text-pink-800',
      tech: 'bg-blue-100 text-blue-800',
      fashion: 'bg-purple-100 text-purple-800',
      fitness: 'bg-green-100 text-green-800',
      food: 'bg-orange-100 text-orange-800',
      travel: 'bg-cyan-100 text-cyan-800',
      pet: 'bg-amber-100 text-amber-800'
    };
    return colors[niche] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-8 w-full mb-2" />
                <Skeleton className="h-6 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-red-500 mb-4">
            Failed to load click tracking data
          </div>
          <Button 
            onClick={() => refreshMutation.mutate()}
            disabled={refreshMutation.isPending}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Clicks</p>
                <p className="text-2xl font-bold">{stats.totalClicks.toLocaleString()}</p>
              </div>
              <MousePointer className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Links</p>
                <p className="text-2xl font-bold">{stats.totalLinks}</p>
              </div>
              <ExternalLink className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Top Performer</p>
                <p className="text-2xl font-bold">
                  {stats.topPerformer ? stats.topPerformer.clicks : 0}
                </p>
                <p className="text-xs text-muted-foreground">
                  {stats.topPerformer ? stats.topPerformer.product.slice(0, 20) + '...' : 'No data'}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">CTR Average</p>
                <p className="text-2xl font-bold">
                  {stats.totalLinks > 0 ? (stats.totalClicks / stats.totalLinks).toFixed(1) : '0'}
                </p>
                <p className="text-xs text-muted-foreground">clicks per link</p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Click Activity</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refreshMutation.mutate()}
            disabled={refreshMutation.isPending}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {stats.recentActivity.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MousePointer className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No recent click activity</p>
              <p className="text-sm">Links will appear here once they start getting clicks</p>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.recentActivity.map((link) => (
                <div key={link.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={getNicheBadgeColor(link.niche)}>
                        {link.niche}
                      </Badge>
                      <Badge variant="outline">
                        {link.platform}
                      </Badge>
                    </div>
                    <p className="font-medium truncate">{link.product}</p>
                    <p className="text-sm text-muted-foreground">
                      Last clicked: {link.lastClickAt ? formatDate(link.lastClickAt) : 'Never'}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{link.clicks}</div>
                    <div className="text-sm text-muted-foreground">clicks</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Links Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Redirect Links</CardTitle>
        </CardHeader>
        <CardContent>
          {links.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ExternalLink className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No redirect links created yet</p>
              <p className="text-sm">Generate content to create trackable affiliate links</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Product</th>
                    <th className="text-left p-2">Niche</th>
                    <th className="text-left p-2">Platform</th>
                    <th className="text-center p-2">Clicks</th>
                    <th className="text-center p-2">Created</th>
                    <th className="text-center p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {links.map((link) => (
                    <tr key={link.id} className="border-b hover:bg-muted/50">
                      <td className="p-2">
                        <div className="max-w-48 truncate font-medium">
                          {link.product}
                        </div>
                      </td>
                      <td className="p-2">
                        <Badge className={getNicheBadgeColor(link.niche)}>
                          {link.niche}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <Badge variant="outline">
                          {link.platform}
                        </Badge>
                      </td>
                      <td className="p-2 text-center font-bold">
                        {link.clicks}
                      </td>
                      <td className="p-2 text-center text-sm text-muted-foreground">
                        {formatDate(link.createdAt)}
                      </td>
                      <td className="p-2 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(link.redirectUrl, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}