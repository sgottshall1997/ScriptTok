import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  GitBranch, 
  Search, 
  Filter,
  Users,
  Eye,
  Mail,
  Share2,
  Target,
  Calendar,
  ExternalLink,
  BarChart3
} from "lucide-react";

interface AttributionData {
  id: string;
  contactName: string;
  contactEmail: string;
  firstTouch: {
    channel: string;
    source: string;
    medium: string;
    campaign: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    timestamp: string;
  };
  lastTouch: {
    channel: string;
    source: string;
    medium: string;
    campaign: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    timestamp: string;
  };
  totalTouchpoints: number;
  conversionValue: number;
  journeyDays: number;
}

interface UTMReport {
  campaign: string;
  source: string;
  medium: string;
  content?: string;
  sessions: number;
  conversions: number;
  conversionRate: number;
  revenue: number;
}

// Mock attribution data
const mockAttributionData: AttributionData[] = [
  {
    id: "1",
    contactName: "Sarah Johnson",
    contactEmail: "sarah.j@email.com",
    firstTouch: {
      channel: "Social Media",
      source: "instagram",
      medium: "social",
      campaign: "recipe-discovery",
      utmSource: "instagram",
      utmMedium: "social",
      utmCampaign: "recipe-discovery",
      timestamp: "2025-01-10T09:30:00Z"
    },
    lastTouch: {
      channel: "Email",
      source: "newsletter",
      medium: "email",
      campaign: "weekly-recipes",
      utmSource: "newsletter",
      utmMedium: "email", 
      utmCampaign: "weekly-recipes",
      timestamp: "2025-01-18T14:22:00Z"
    },
    totalTouchpoints: 5,
    conversionValue: 89.99,
    journeyDays: 8
  },
  {
    id: "2",
    contactName: "Mike Chen",
    contactEmail: "mike.chen@email.com",
    firstTouch: {
      channel: "Search",
      source: "google",
      medium: "organic",
      campaign: "organic-search",
      timestamp: "2025-01-12T16:45:00Z"
    },
    lastTouch: {
      channel: "Direct",
      source: "direct",
      medium: "direct",
      campaign: "direct-visit",
      timestamp: "2025-01-17T11:15:00Z"
    },
    totalTouchpoints: 3,
    conversionValue: 45.50,
    journeyDays: 5
  },
  {
    id: "3",
    contactName: "Emma Davis",
    contactEmail: "emma.d@email.com",
    firstTouch: {
      channel: "Paid Search",
      source: "google",
      medium: "cpc",
      campaign: "meal-prep-ads",
      utmSource: "google",
      utmMedium: "cpc",
      utmCampaign: "meal-prep-ads",
      timestamp: "2025-01-14T12:20:00Z"
    },
    lastTouch: {
      channel: "Referral",
      source: "foodblog.com",
      medium: "referral",
      campaign: "partner-blog",
      timestamp: "2025-01-18T09:33:00Z"
    },
    totalTouchpoints: 7,
    conversionValue: 125.00,
    journeyDays: 4
  }
];

// Mock UTM reports
const mockUTMReports: UTMReport[] = [
  {
    campaign: "recipe-discovery",
    source: "instagram",
    medium: "social",
    content: "carousel-post",
    sessions: 1250,
    conversions: 34,
    conversionRate: 2.7,
    revenue: 2890
  },
  {
    campaign: "meal-prep-ads",
    source: "google",
    medium: "cpc",
    sessions: 890,
    conversions: 28,
    conversionRate: 3.1,
    revenue: 3150
  },
  {
    campaign: "weekly-recipes",
    source: "newsletter",
    medium: "email",
    sessions: 2340,
    conversions: 67,
    conversionRate: 2.9,
    revenue: 5980
  },
  {
    campaign: "partner-blog",
    source: "foodblog.com",
    medium: "referral",
    sessions: 456,
    conversions: 12,
    conversionRate: 2.6,
    revenue: 1080
  }
];

export default function AttributionPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [campaignFilter, setCampaignFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");

  const filteredAttributions = mockAttributionData.filter(attribution => {
    const matchesSearch = attribution.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         attribution.contactEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCampaign = campaignFilter === "all" || 
                          attribution.firstTouch.campaign === campaignFilter ||
                          attribution.lastTouch.campaign === campaignFilter;
    const matchesSource = sourceFilter === "all" ||
                         attribution.firstTouch.source === sourceFilter ||
                         attribution.lastTouch.source === sourceFilter;
    return matchesSearch && matchesCampaign && matchesSource;
  });

  const uniqueCampaigns = Array.from(new Set([
    ...mockAttributionData.map(a => a.firstTouch.campaign),
    ...mockAttributionData.map(a => a.lastTouch.campaign)
  ]));

  const uniqueSources = Array.from(new Set([
    ...mockAttributionData.map(a => a.firstTouch.source),
    ...mockAttributionData.map(a => a.lastTouch.source)
  ]));

  const getChannelColor = (channel: string) => {
    switch (channel.toLowerCase().replace(' ', '')) {
      case 'socialmedia': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'email': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'search': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'paidsearch': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'referral': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'direct': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const avgJourneyDays = mockAttributionData.reduce((sum, a) => sum + a.journeyDays, 0) / mockAttributionData.length;
  const avgTouchpoints = mockAttributionData.reduce((sum, a) => sum + a.totalTouchpoints, 0) / mockAttributionData.length;
  const totalRevenue = mockAttributionData.reduce((sum, a) => sum + a.conversionValue, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <GitBranch className="h-8 w-8" />
            Attribution Inspector
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            First/last touch analysis and UTM drill-down by contact and campaign
          </p>
        </div>
        <Button data-testid="button-export-attribution">
          <BarChart3 className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Journeys</p>
                <p className="text-2xl font-bold">{mockAttributionData.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Journey Days</p>
                <p className="text-2xl font-bold text-green-600">{avgJourneyDays.toFixed(1)}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Touchpoints</p>
                <p className="text-2xl font-bold text-purple-600">{avgTouchpoints.toFixed(1)}</p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                <p className="text-2xl font-bold text-orange-600">${totalRevenue.toFixed(2)}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
            data-testid="input-search-attribution"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={campaignFilter}
            onChange={(e) => setCampaignFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm"
            data-testid="select-campaign-filter"
          >
            <option value="all">All Campaigns</option>
            {uniqueCampaigns.map(campaign => (
              <option key={campaign} value={campaign}>{campaign}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm"
            data-testid="select-source-filter"
          >
            <option value="all">All Sources</option>
            {uniqueSources.map(source => (
              <option key={source} value={source}>{source}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Attribution Journey Details */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Attribution Journeys</CardTitle>
          <CardDescription>
            Track first-touch and last-touch attribution for each contact
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredAttributions.map((attribution) => (
              <Card key={attribution.id} data-testid={`card-attribution-${attribution.id}`} 
                    className="border-l-4 border-l-blue-500">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{attribution.contactName}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {attribution.contactEmail}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        ${attribution.conversionValue}
                      </div>
                      <div className="text-xs text-gray-500">
                        {attribution.journeyDays} days • {attribution.totalTouchpoints} touchpoints
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {/* First Touch */}
                    <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="h-4 w-4 text-blue-600" />
                          <h4 className="font-semibold text-blue-900 dark:text-blue-100">First Touch</h4>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={getChannelColor(attribution.firstTouch.channel)}>
                              {attribution.firstTouch.channel}
                            </Badge>
                            <span className="text-gray-600 dark:text-gray-400">
                              {formatDate(attribution.firstTouch.timestamp)}
                            </span>
                          </div>
                          <div className="text-gray-700 dark:text-gray-300">
                            <strong>Source:</strong> {attribution.firstTouch.source}
                          </div>
                          <div className="text-gray-700 dark:text-gray-300">
                            <strong>Campaign:</strong> {attribution.firstTouch.campaign}
                          </div>
                          {attribution.firstTouch.utmSource && (
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              UTM: {attribution.firstTouch.utmSource} / {attribution.firstTouch.utmMedium} / {attribution.firstTouch.utmCampaign}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Last Touch */}
                    <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="h-4 w-4 text-green-600" />
                          <h4 className="font-semibold text-green-900 dark:text-green-100">Last Touch</h4>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={getChannelColor(attribution.lastTouch.channel)}>
                              {attribution.lastTouch.channel}
                            </Badge>
                            <span className="text-gray-600 dark:text-gray-400">
                              {formatDate(attribution.lastTouch.timestamp)}
                            </span>
                          </div>
                          <div className="text-gray-700 dark:text-gray-300">
                            <strong>Source:</strong> {attribution.lastTouch.source}
                          </div>
                          <div className="text-gray-700 dark:text-gray-300">
                            <strong>Campaign:</strong> {attribution.lastTouch.campaign}
                          </div>
                          {attribution.lastTouch.utmSource && (
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              UTM: {attribution.lastTouch.utmSource} / {attribution.lastTouch.utmMedium} / {attribution.lastTouch.utmCampaign}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    <Button variant="outline" size="sm" data-testid={`button-journey-${attribution.id}`}>
                      <Eye className="h-3 w-3 mr-1" />
                      View Full Journey
                    </Button>
                    <Button variant="outline" size="sm" data-testid={`button-contact-${attribution.id}`}>
                      <Users className="h-3 w-3 mr-1" />
                      View Contact
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* UTM Performance Report */}
      <Card>
        <CardHeader>
          <CardTitle>UTM Performance Report</CardTitle>
          <CardDescription>
            Campaign performance breakdown by UTM parameters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockUTMReports.map((report, index) => (
              <div key={index} 
                   className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
                   data-testid={`utm-report-${index}`}>
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="font-semibold">{report.campaign}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {report.source} / {report.medium}
                      {report.content && ` / ${report.content}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Sessions</p>
                    <p className="font-semibold">{report.sessions.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Conversions</p>
                    <p className="font-semibold">{report.conversions}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Conv. Rate</p>
                    <p className="font-semibold">{report.conversionRate}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Revenue</p>
                    <p className="font-semibold text-green-600">${report.revenue.toLocaleString()}</p>
                  </div>
                  <Button variant="outline" size="sm" data-testid={`button-utm-details-${index}`}>
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      {filteredAttributions.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <GitBranch className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No attribution data found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm || campaignFilter !== "all" || sourceFilter !== "all"
                ? "Try adjusting your search or filter criteria."
                : "Attribution data will appear here as contacts interact with your campaigns."
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Help Text */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <GitBranch className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100">
                Attribution Analysis Tips
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Use first-touch to understand discovery channels and last-touch for conversion optimization. 
                UTM parameters provide granular campaign tracking. Multi-touch attribution gives the complete customer journey picture.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}