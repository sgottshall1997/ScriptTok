import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InstructionFooter from '@/cookaing-marketing/components/InstructionFooter';
import { 
  BarChart2, 
  Download, 
  Calendar,
  TrendingUp,
  Users,
  Mail,
  MousePointer,
  Target,
  DollarSign,
  Eye,
  Share2
} from "lucide-react";

interface PerformanceMetric {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
  icon: React.ComponentType<{ className?: string }>;
}

interface CampaignReport {
  id: string;
  name: string;
  type: 'email' | 'social' | 'blog' | 'ads';
  dateRange: string;
  sent: number;
  delivered: number;
  opens: number;
  clicks: number;
  conversions: number;
  revenue: number;
  roas: number;
}

// Mock performance metrics
const mockPerformanceMetrics: PerformanceMetric[] = [
  {
    label: "Total Campaigns",
    value: "24",
    change: "+12%",
    trend: "up",
    icon: Target
  },
  {
    label: "Email Open Rate",
    value: "28.4%",
    change: "+3.2%",
    trend: "up",
    icon: Mail
  },
  {
    label: "Click Through Rate",
    value: "4.8%",
    change: "-0.5%",
    trend: "down",
    icon: MousePointer
  },
  {
    label: "Conversion Rate",
    value: "2.1%",
    change: "+0.3%",
    trend: "up",
    icon: TrendingUp
  },
  {
    label: "Total Revenue",
    value: "$12,450",
    change: "+18.5%",
    trend: "up",
    icon: DollarSign
  },
  {
    label: "ROAS",
    value: "4.2x",
    change: "+0.8x",
    trend: "up",
    icon: BarChart2
  }
];

// Mock campaign reports
const mockCampaignReports: CampaignReport[] = [
  {
    id: "1",
    name: "Weekly Recipe Newsletter",
    type: "email",
    dateRange: "Jan 8-14, 2025",
    sent: 5240,
    delivered: 5018,
    opens: 1425,
    clicks: 284,
    conversions: 67,
    revenue: 2840,
    roas: 5.2
  },
  {
    id: "2",
    name: "Holiday Cooking Guide",
    type: "blog",
    dateRange: "Dec 15-31, 2024",
    sent: 0,
    delivered: 0,
    opens: 8960,
    clicks: 1290,
    conversions: 156,
    revenue: 4680,
    roas: 7.8
  },
  {
    id: "3",
    name: "Social Media Promo",
    type: "social",
    dateRange: "Jan 1-7, 2025",
    sent: 0,
    delivered: 0,
    opens: 12400,
    clicks: 892,
    conversions: 89,
    revenue: 1780,
    roas: 3.6
  },
  {
    id: "4",
    name: "Quick Meals Ad Campaign",
    type: "ads",
    dateRange: "Jan 10-16, 2025",
    sent: 0,
    delivered: 0,
    opens: 15600,
    clicks: 734,
    conversions: 123,
    revenue: 3690,
    roas: 4.1
  }
];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("performance");
  const [dateRange, setDateRange] = useState("last-30-days");

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'email': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'social': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'blog': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'ads': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      default: return '→';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const calculateMetrics = (report: CampaignReport) => {
    const openRate = report.type === 'email' && report.delivered > 0 
      ? ((report.opens / report.delivered) * 100).toFixed(1) 
      : 'N/A';
    
    const ctr = report.opens > 0 
      ? ((report.clicks / report.opens) * 100).toFixed(1) 
      : 'N/A';
    
    const conversionRate = report.clicks > 0 
      ? ((report.conversions / report.clicks) * 100).toFixed(1) 
      : 'N/A';
    
    return { openRate, ctr, conversionRate };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart2 className="h-8 w-8" />
            Reports
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Performance, attribution, and ROAS reporting for all campaigns
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm"
            data-testid="select-date-range"
          >
            <option value="last-7-days">Last 7 days</option>
            <option value="last-30-days">Last 30 days</option>
            <option value="last-90-days">Last 90 days</option>
            <option value="this-month">This month</option>
            <option value="last-month">Last month</option>
            <option value="this-quarter">This quarter</option>
          </select>
          <Button data-testid="button-export-report">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Tabs for different report types */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="performance" data-testid="tab-performance">Performance</TabsTrigger>
          <TabsTrigger value="attribution" data-testid="tab-attribution">Attribution</TabsTrigger>
          <TabsTrigger value="roas" data-testid="tab-roas">ROAS Analysis</TabsTrigger>
        </TabsList>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          {/* Key Metrics Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mockPerformanceMetrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <Card key={metric.label}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {metric.label}
                        </p>
                        <p className="text-2xl font-bold">{metric.value}</p>
                        <p className={`text-sm ${getTrendColor(metric.trend)} flex items-center gap-1`}>
                          <span>{getTrendIcon(metric.trend)}</span>
                          {metric.change} from last period
                        </p>
                      </div>
                      <Icon className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Campaign Performance Table */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance</CardTitle>
              <CardDescription>
                Detailed metrics for all active campaigns in the selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockCampaignReports.map((report) => {
                  const metrics = calculateMetrics(report);
                  
                  return (
                    <Card key={report.id} data-testid={`card-campaign-${report.id}`} 
                          className="border-l-4 border-l-blue-500">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold">{report.name}</h3>
                              <Badge variant="outline" className={getTypeColor(report.type)}>
                                {report.type.charAt(0).toUpperCase() + report.type.slice(1)}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <Calendar className="h-4 w-4" />
                              {report.dateRange}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600">
                              ${report.revenue.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-500">Revenue</div>
                          </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-6">
                          {report.type === 'email' && (
                            <>
                              <div className="text-center">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                  <Mail className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm text-gray-600 dark:text-gray-400">Sent</span>
                                </div>
                                <p className="text-lg font-semibold">{report.sent.toLocaleString()}</p>
                              </div>
                              
                              <div className="text-center">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                  <Target className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm text-gray-600 dark:text-gray-400">Delivered</span>
                                </div>
                                <p className="text-lg font-semibold">{report.delivered.toLocaleString()}</p>
                              </div>
                            </>
                          )}

                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <Eye className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {report.type === 'email' ? 'Opens' : 'Views'}
                              </span>
                            </div>
                            <p className="text-lg font-semibold">{report.opens.toLocaleString()}</p>
                            {report.type === 'email' && (
                              <p className="text-xs text-gray-500">{metrics.openRate}% rate</p>
                            )}
                          </div>

                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <MousePointer className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">Clicks</span>
                            </div>
                            <p className="text-lg font-semibold">{report.clicks.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">{metrics.ctr}% CTR</p>
                          </div>

                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <Target className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">Conversions</span>
                            </div>
                            <p className="text-lg font-semibold">{report.conversions}</p>
                            <p className="text-xs text-gray-500">{metrics.conversionRate}% rate</p>
                          </div>

                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <BarChart2 className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">ROAS</span>
                            </div>
                            <p className="text-lg font-semibold text-green-600">{report.roas}x</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-4">
                          <Button variant="outline" size="sm" data-testid={`button-details-${report.id}`}>
                            <Eye className="h-3 w-3 mr-1" />
                            View Details
                          </Button>
                          <Button variant="outline" size="sm" data-testid={`button-export-${report.id}`}>
                            <Download className="h-3 w-3 mr-1" />
                            Export
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attribution Tab */}
        <TabsContent value="attribution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Attribution Analysis</CardTitle>
              <CardDescription>
                Track customer journey and attribution across channels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <CardContent className="p-6 text-center">
                    <Share2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      First-Touch Attribution
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Track which channels first introduce customers to your brand
                    </p>
                    <Button variant="outline" data-testid="button-first-touch">
                      <BarChart2 className="h-4 w-4 mr-2" />
                      View First-Touch Report
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <CardContent className="p-6 text-center">
                    <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Last-Touch Attribution
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Identify the final touchpoint before conversion
                    </p>
                    <Button variant="outline" data-testid="button-last-touch">
                      <BarChart2 className="h-4 w-4 mr-2" />
                      View Last-Touch Report
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <CardContent className="p-6 text-center">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Multi-Touch Attribution
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Full customer journey analysis across all touchpoints
                    </p>
                    <Button variant="outline" data-testid="button-multi-touch">
                      <BarChart2 className="h-4 w-4 mr-2" />
                      View Multi-Touch Report
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <CardContent className="p-6 text-center">
                    <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      UTM Analysis
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Track campaign performance by UTM parameters
                    </p>
                    <Button variant="outline" data-testid="button-utm-analysis">
                      <BarChart2 className="h-4 w-4 mr-2" />
                      View UTM Report
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ROAS Analysis Tab */}
        <TabsContent value="roas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ROAS Analysis</CardTitle>
              <CardDescription>
                Return on ad spend analysis across campaigns and channels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                <Card>
                  <CardContent className="p-6 text-center">
                    <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">Overall ROAS</p>
                    <p className="text-2xl font-bold text-green-600">4.8x</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 text-center">
                    <Mail className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">Email ROAS</p>
                    <p className="text-2xl font-bold text-blue-600">5.2x</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 text-center">
                    <Share2 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">Social ROAS</p>
                    <p className="text-2xl font-bold text-purple-600">3.6x</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 text-center">
                    <Target className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">Ads ROAS</p>
                    <p className="text-2xl font-bold text-orange-600">4.1x</p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Campaign ROAS Breakdown</h3>
                {mockCampaignReports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={getTypeColor(report.type)}>
                        {report.type}
                      </Badge>
                      <span className="font-medium">{report.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Revenue</p>
                        <p className="font-semibold">${report.revenue.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 dark:text-gray-400">ROAS</p>
                        <p className="text-lg font-bold text-green-600">{report.roas}x</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Help Text */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <BarChart2 className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100">
                Reporting Best Practices
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Review performance weekly, focus on trends rather than absolute numbers, 
                and use attribution analysis to optimize budget allocation across channels.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instruction Footer */}
      <InstructionFooter
        title="Reports"
        whatIsIt="Performance analytics, attribution, and ROI across all channels."
        setupSteps={[
          "Connect Google Analytics for web tracking.",
          "Configure UTM parameters in campaigns for proper attribution."
        ]}
        usageSteps={[
          "Review weekly reports; focus on trends and ROAS.",
          "Use attribution analysis to optimize budget allocation."
        ]}
        envKeys={["GOOGLE_ANALYTICS_TRACKING_ID"]}
      />
    </div>
  );
}