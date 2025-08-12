import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, CheckCircle, Shield, TrendingUp, FileText, Download } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";

interface ComplianceMonitorProps {
  userId: string;
}

export const ComplianceMonitor: React.FC<ComplianceMonitorProps> = ({ userId }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'quarter'>('month');
  const { toast } = useToast();

  // Fetch compliance report
  const { data: reportData, isLoading: reportLoading } = useQuery({
    queryKey: ['/api/compliance/report', userId, selectedTimeframe],
    enabled: !!userId,
  });

  // Fetch analytics data
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/compliance/analytics', userId, selectedTimeframe],
    enabled: !!userId,
  });

  const handleExportData = async () => {
    try {
      const response = await fetch(`/api/compliance/export/${userId}?timeframe=${selectedTimeframe}`);
      const data = await response.json();
      
      if (data.success) {
        // Create downloadable file
        const blob = new Blob([JSON.stringify(data.exportData, null, 2)], { 
          type: 'application/json' 
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `compliance-report-${userId}-${selectedTimeframe}.json`;
        link.click();
        URL.revokeObjectURL(url);
        
        toast({
          title: "Export Complete",
          description: "Compliance report has been downloaded.",
        });
      }
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Unable to export compliance data.",
        variant: "destructive",
      });
    }
  };

  if (reportLoading || analyticsLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading compliance data...</div>
        </CardContent>
      </Card>
    );
  }

  const complianceScore = analyticsData?.performance?.complianceScore || 0;
  const violations = analyticsData?.violations || { criticalViolations: [], warningCount: 0, recommendedActions: [] };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Amazon Associates Compliance Monitor
              </CardTitle>
              <CardDescription>
                Track your compliance status and affiliate link performance
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <select 
                value={selectedTimeframe} 
                onChange={(e) => setSelectedTimeframe(e.target.value as any)}
                className="px-3 py-1 border rounded-md text-sm"
              >
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="quarter">Last Quarter</option>
              </select>
              <Button onClick={handleExportData} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Compliance Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Compliance Score</p>
                <p className="text-2xl font-bold">{complianceScore.toFixed(1)}%</p>
              </div>
              <div className="w-16 h-16">
                <div className="relative w-full h-full">
                  <Progress value={complianceScore} className="w-full" />
                  {complianceScore >= 90 ? (
                    <CheckCircle className="w-6 h-6 text-green-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-yellow-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Links</p>
                <p className="text-2xl font-bold">{analyticsData?.performance?.totalLinks || 0}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Warnings</p>
                <p className="text-2xl font-bold">{violations.warningCount}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="compliance" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="compliance">Compliance Status</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Overview</CardTitle>
              <CardDescription>Current compliance status and recent activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Disclosure Compliance</span>
                  <Badge variant={complianceScore > 95 ? "default" : "secondary"}>
                    {complianceScore > 95 ? "Excellent" : "Needs Improvement"}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Content Policy Adherence</span>
                  <Badge variant={violations.criticalViolations.length === 0 ? "default" : "destructive"}>
                    {violations.criticalViolations.length === 0 ? "Compliant" : "Violations Found"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Link Format Compliance</span>
                  <Badge variant="default">Valid</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {violations.criticalViolations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Critical Violations</CardTitle>
                <CardDescription>Issues that need immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {violations.criticalViolations.map((violation, index) => (
                    <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm font-medium text-red-800">{violation.violationType}</p>
                      <p className="text-sm text-red-600">{violation.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Link Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Clicks</span>
                    <span className="font-medium">{analyticsData?.performance?.totalClicks || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Conversions</span>
                    <span className="font-medium">{analyticsData?.performance?.totalConversions || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Conversion Rate</span>
                    <span className="font-medium">{(analyticsData?.performance?.conversionRate || 0).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Revenue</span>
                    <span className="font-medium">${(analyticsData?.performance?.totalRevenue || 0).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analyticsData?.performance?.topPerformingProducts?.slice(0, 5).map((product, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm truncate">{product}</span>
                      <Badge variant="outline">#{index + 1}</Badge>
                    </div>
                  )) || <p className="text-sm text-gray-500">No data available</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recommended Actions</CardTitle>
              <CardDescription>Steps to improve your compliance and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {violations.recommendedActions.map((action, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <FileText className="w-4 h-4 text-blue-600 mt-0.5" />
                    <p className="text-sm text-blue-800">{action}</p>
                  </div>
                ))}
                
                {violations.recommendedActions.length === 0 && (
                  <div className="text-center p-6">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <p className="text-sm text-gray-600">No recommendations at this time. Keep up the great work!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};