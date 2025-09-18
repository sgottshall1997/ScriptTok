import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import InstructionFooter from '@/cookaing-marketing/components/InstructionFooter';
import { 
  CreditCard, 
  Upload, 
  Download,
  FileSpreadsheet,
  DollarSign,
  TrendingUp,
  BarChart3,
  Target,
  Trash2,
  Plus,
  Calendar
} from "lucide-react";

interface CostImport {
  id: string;
  fileName: string;
  uploadDate: string;
  recordsCount: number;
  totalCost: number;
  dateRange: string;
  status: 'processed' | 'processing' | 'error';
}

interface CostRecord {
  id: string;
  date: string;
  campaignPlatform: string;
  campaignName: string;
  cost: number;
  impressions?: number;
  clicks?: number;
  conversions?: number;
  revenue?: number;
  roas?: number;
}

interface ROASSummary {
  channel: string;
  totalSpend: number;
  totalRevenue: number;
  roas: number;
  campaigns: number;
}

// Mock data for cost imports
const mockImports: CostImport[] = [
  {
    id: "1",
    fileName: "facebook_ads_jan_2025.csv",
    uploadDate: "2025-01-18T14:30:00Z",
    recordsCount: 156,
    totalCost: 2450,
    dateRange: "Jan 1-15, 2025",
    status: "processed"
  },
  {
    id: "2",
    fileName: "google_ads_jan_2025.csv", 
    uploadDate: "2025-01-16T09:15:00Z",
    recordsCount: 89,
    totalCost: 1890,
    dateRange: "Jan 1-15, 2025",
    status: "processed"
  },
  {
    id: "3",
    fileName: "email_platform_costs.csv",
    uploadDate: "2025-01-14T16:45:00Z",
    recordsCount: 24,
    totalCost: 125,
    dateRange: "Dec 2024",
    status: "processing"
  }
];

// Mock ROAS summary data
const mockROASSummary: ROASSummary[] = [
  {
    channel: "Facebook Ads",
    totalSpend: 2450,
    totalRevenue: 12250,
    roas: 5.0,
    campaigns: 8
  },
  {
    channel: "Google Ads",
    totalSpend: 1890,
    totalRevenue: 9450,
    roas: 5.0,
    campaigns: 6
  },
  {
    channel: "Email Marketing",
    totalSpend: 125,
    totalRevenue: 875,
    roas: 7.0,
    campaigns: 12
  },
  {
    channel: "Social Media",
    totalSpend: 580,
    totalRevenue: 2030,
    roas: 3.5,
    campaigns: 4
  }
];

// Mock cost records
const mockCostRecords: CostRecord[] = [
  {
    id: "1",
    date: "2025-01-18",
    campaignPlatform: "Facebook",
    campaignName: "Winter Recipe Collection",
    cost: 125.50,
    impressions: 15600,
    clicks: 890,
    conversions: 23,
    revenue: 690,
    roas: 5.5
  },
  {
    id: "2",
    date: "2025-01-17",
    campaignPlatform: "Google",
    campaignName: "Quick Meal Search Ads",
    cost: 89.30,
    impressions: 8900,
    clicks: 245,
    conversions: 12,
    revenue: 360,
    roas: 4.0
  },
  {
    id: "3",
    date: "2025-01-16",
    campaignPlatform: "Email",
    campaignName: "Weekly Newsletter",
    cost: 15.00,
    impressions: 5200,
    clicks: 890,
    conversions: 45,
    revenue: 1350,
    roas: 90.0
  }
];

export default function CostsPage() {
  const [showUploadForm, setShowUploadForm] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'processing': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'facebook': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'google': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'email': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalSpend = mockROASSummary.reduce((sum, item) => sum + item.totalSpend, 0);
  const totalRevenue = mockROASSummary.reduce((sum, item) => sum + item.totalRevenue, 0);
  const overallROAS = totalSpend > 0 ? totalRevenue / totalSpend : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <CreditCard className="h-8 w-8" />
            Costs & ROAS
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Upload campaign costs and analyze return on ad spend across channels
          </p>
        </div>
        <Button 
          onClick={() => setShowUploadForm(!showUploadForm)}
          data-testid="button-upload-costs"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Costs CSV
        </Button>
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <Card className="border-2 border-dashed border-blue-300 dark:border-blue-600">
          <CardHeader>
            <CardTitle>Upload Cost Data</CardTitle>
            <CardDescription>
              Upload CSV file with schema: date, campaign_platform, campaign_name, cost
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="csv-file">Select CSV File</Label>
                <Input 
                  id="csv-file" 
                  type="file" 
                  accept=".csv"
                  data-testid="input-csv-file"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button data-testid="button-upload-file">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload & Process
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowUploadForm(false)}
                  data-testid="button-cancel-upload"
                >
                  Cancel
                </Button>
                <Button variant="outline" data-testid="button-download-template">
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Spend</p>
                <p className="text-2xl font-bold">${totalSpend.toLocaleString()}</p>
              </div>
              <CreditCard className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">${totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overall ROAS</p>
                <p className="text-2xl font-bold text-blue-600">{overallROAS.toFixed(1)}x</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Channels</p>
                <p className="text-2xl font-bold text-purple-600">{mockROASSummary.length}</p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ROAS Summary by Channel */}
      <Card>
        <CardHeader>
          <CardTitle>ROAS Summary by Channel</CardTitle>
          <CardDescription>
            Performance comparison across marketing channels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockROASSummary.map((summary) => (
              <div key={summary.channel} 
                   className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
                   data-testid={`summary-${summary.channel.toLowerCase().replace(' ', '-')}`}>
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="font-semibold">{summary.channel}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {summary.campaigns} campaigns
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Spend</p>
                    <p className="font-semibold text-red-600">${summary.totalSpend.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Revenue</p>
                    <p className="font-semibold text-green-600">${summary.totalRevenue.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">ROAS</p>
                    <p className="text-xl font-bold text-blue-600">{summary.roas.toFixed(1)}x</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Cost Records */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Cost Records</CardTitle>
          <CardDescription>
            Latest campaign spending and performance data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockCostRecords.map((record) => (
              <Card key={record.id} data-testid={`record-${record.id}`} 
                    className="border-l-4 border-l-blue-500">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{record.campaignName}</h3>
                        <Badge variant="outline" className={getPlatformColor(record.campaignPlatform)}>
                          {record.campaignPlatform}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <Calendar className="h-4 w-4" />
                        {new Date(record.date).toLocaleDateString()}
                      </div>

                      <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-5">
                        <div className="text-center">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Cost</p>
                          <p className="text-lg font-semibold text-red-600">
                            ${record.cost.toFixed(2)}
                          </p>
                        </div>

                        {record.impressions && (
                          <div className="text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Impressions</p>
                            <p className="text-lg font-semibold">
                              {record.impressions.toLocaleString()}
                            </p>
                          </div>
                        )}

                        {record.clicks && (
                          <div className="text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Clicks</p>
                            <p className="text-lg font-semibold">
                              {record.clicks.toLocaleString()}
                            </p>
                          </div>
                        )}

                        {record.revenue && (
                          <div className="text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Revenue</p>
                            <p className="text-lg font-semibold text-green-600">
                              ${record.revenue.toFixed(2)}
                            </p>
                          </div>
                        )}

                        {record.roas && (
                          <div className="text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400">ROAS</p>
                            <p className="text-lg font-semibold text-blue-600">
                              {record.roas.toFixed(1)}x
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Import History */}
      <Card>
        <CardHeader>
          <CardTitle>Import History</CardTitle>
          <CardDescription>
            Track all uploaded cost data files and processing status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockImports.map((importRecord) => (
              <div key={importRecord.id} 
                   className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
                   data-testid={`import-${importRecord.id}`}>
                <div className="flex items-center gap-4">
                  <FileSpreadsheet className="h-8 w-8 text-blue-600" />
                  <div>
                    <h3 className="font-semibold">{importRecord.fileName}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Uploaded {formatDate(importRecord.uploadDate)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Records</p>
                    <p className="font-semibold">{importRecord.recordsCount}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Cost</p>
                    <p className="font-semibold">${importRecord.totalCost.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Date Range</p>
                    <p className="font-semibold">{importRecord.dateRange}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getStatusColor(importRecord.status)}>
                      {importRecord.status.charAt(0).toUpperCase() + importRecord.status.slice(1)}
                    </Badge>
                    <Button variant="outline" size="sm" data-testid={`button-delete-${importRecord.id}`}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Help Text */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <CreditCard className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100">
                Cost Tracking Best Practices
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Upload cost data regularly to maintain accurate ROAS calculations. 
                Use the CSV template for consistent formatting. Link cost data with revenue 
                tracking for comprehensive performance analysis.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instruction Footer */}
      <InstructionFooter
        title="Costs & ROAS"
        whatIsIt="Upload campaign costs and analyze return on ad spend across channels."
        setupSteps={[
          "Download the CSV template with required columns: date, campaign_platform, campaign_name, cost.",
          "Upload cost data regularly for accurate ROAS calculations."
        ]}
        usageSteps={[
          "Link cost data with revenue tracking for comprehensive performance analysis.",
          "Monitor ROAS trends to optimize budget allocation across channels."
        ]}
      />
    </div>
  );
}