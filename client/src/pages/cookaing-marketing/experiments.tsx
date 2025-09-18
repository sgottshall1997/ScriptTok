import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { 
  FlaskConical, 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit,
  BarChart3,
  Target,
  Users,
  Mail,
  MousePointer,
  Calculator
} from "lucide-react";

interface ABTest {
  id: string;
  name: string;
  campaign: string;
  status: 'draft' | 'running' | 'completed' | 'paused';
  variantA: string;
  variantB: string;
  trafficSplit: number;
  assignments: number;
  opens: number;
  clicks: number;
  conversions: number;
  winningVariant?: 'A' | 'B' | null;
  confidence: number;
  startDate: string;
  endDate?: string;
}

// Mock data for A/B tests
const mockABTests: ABTest[] = [
  {
    id: "1",
    name: "Subject Line Test - Recipe Newsletter",
    campaign: "Weekly Recipe Newsletter",
    status: "running",
    variantA: "5-Minute Healthy Meals",
    variantB: "Quick & Nutritious Recipes",
    trafficSplit: 50,
    assignments: 2500,
    opens: 875,
    clicks: 132,
    conversions: 28,
    confidence: 87,
    startDate: "2025-01-15",
    winningVariant: null
  },
  {
    id: "2",
    name: "CTA Button Color Test",
    campaign: "Product Launch Email",
    status: "completed",
    variantA: "Blue CTA Button",
    variantB: "Orange CTA Button",
    trafficSplit: 50,
    assignments: 5000,
    opens: 1850,
    clicks: 425,
    conversions: 89,
    confidence: 95,
    startDate: "2025-01-08",
    endDate: "2025-01-12",
    winningVariant: "B"
  },
  {
    id: "3",
    name: "Email Send Time Test",
    campaign: "Weekly Tips Email",
    status: "draft",
    variantA: "Send at 9 AM",
    variantB: "Send at 2 PM",
    trafficSplit: 50,
    assignments: 0,
    opens: 0,
    clicks: 0,
    conversions: 0,
    confidence: 0,
    startDate: "2025-01-20",
    winningVariant: null
  }
];

export default function ExperimentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredTests = mockABTests.filter(test => {
    const matchesSearch = test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.campaign.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || test.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      case 'paused': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateCTR = (clicks: number, opens: number) => {
    return opens > 0 ? ((clicks / opens) * 100).toFixed(1) : '0.0';
  };

  const calculateConversionRate = (conversions: number, clicks: number) => {
    return clicks > 0 ? ((conversions / clicks) * 100).toFixed(1) : '0.0';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FlaskConical className="h-8 w-8" />
            A/B Testing
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Test and optimize your campaigns with scientific experiments
          </p>
        </div>
        <Button data-testid="button-create-test">
          <Plus className="h-4 w-4 mr-2" />
          Create A/B Test
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search tests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
            data-testid="input-search-tests"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm"
            data-testid="select-status-filter"
          >
            <option value="all">All Status</option>
            <option value="running">Running</option>
            <option value="completed">Completed</option>
            <option value="draft">Draft</option>
            <option value="paused">Paused</option>
          </select>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tests</p>
                <p className="text-2xl font-bold">{mockABTests.length}</p>
              </div>
              <FlaskConical className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Running</p>
                <p className="text-2xl font-bold text-green-600">
                  {mockABTests.filter(t => t.status === 'running').length}
                </p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-blue-600">
                  {mockABTests.filter(t => t.status === 'completed').length}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Participants</p>
                <p className="text-2xl font-bold">
                  {mockABTests.reduce((sum, t) => sum + t.assignments, 0).toLocaleString()}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* A/B Tests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Experiments</CardTitle>
          <CardDescription>
            Track performance metrics and statistical significance for all tests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTests.map((test) => (
              <Card key={test.id} data-testid={`card-test-${test.id}`} className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{test.name}</CardTitle>
                      <CardDescription>{test.campaign}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getStatusColor(test.status)}>
                        {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                      </Badge>
                      {test.winningVariant && (
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          Winner: Variant {test.winningVariant}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Variant Info */}
                    <div className="col-span-full grid gap-2 md:grid-cols-2 mb-4">
                      <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                        <h4 className="font-medium text-blue-900 dark:text-blue-100">
                          Variant A ({test.trafficSplit}%)
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300">{test.variantA}</p>
                      </div>
                      <div className="p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                        <h4 className="font-medium text-purple-900 dark:text-purple-100">
                          Variant B ({100 - test.trafficSplit}%)
                        </h4>
                        <p className="text-sm text-purple-700 dark:text-purple-300">{test.variantB}</p>
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Assignments</span>
                      </div>
                      <p className="text-xl font-semibold">{test.assignments.toLocaleString()}</p>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Opens</span>
                      </div>
                      <p className="text-xl font-semibold">{test.opens.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">
                        {test.assignments > 0 ? ((test.opens / test.assignments) * 100).toFixed(1) : '0.0'}% rate
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <MousePointer className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Clicks</span>
                      </div>
                      <p className="text-xl font-semibold">{test.clicks.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">{calculateCTR(test.clicks, test.opens)}% CTR</p>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Target className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Conversions</span>
                      </div>
                      <p className="text-xl font-semibold">{test.conversions.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">{calculateConversionRate(test.conversions, test.clicks)}% rate</p>
                    </div>
                  </div>

                  {/* Confidence Level */}
                  {test.status === 'running' && test.confidence > 0 && (
                    <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Statistical Confidence</span>
                        <span className="text-sm font-semibold">{test.confidence}%</span>
                      </div>
                      <Progress value={test.confidence} className="h-2" />
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {test.confidence >= 95 ? "Statistically significant result" : "Continue test for more confidence"}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-4">
                    <Button variant="outline" size="sm" data-testid={`button-view-${test.id}`}>
                      <Eye className="h-3 w-3 mr-1" />
                      View Details
                    </Button>
                    <Button variant="outline" size="sm" data-testid={`button-edit-${test.id}`}>
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    {test.status === 'completed' && test.confidence >= 95 && (
                      <Button variant="outline" size="sm" data-testid={`button-recompute-${test.id}`}>
                        <Calculator className="h-3 w-3 mr-1" />
                        Recompute Winner
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      {filteredTests.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FlaskConical className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No A/B tests found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm || statusFilter !== "all" 
                ? "Try adjusting your search or filter criteria."
                : "Start optimizing your campaigns with data-driven experiments."
              }
            </p>
            {!searchTerm && statusFilter === "all" && (
              <Button data-testid="button-create-first-test">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First A/B Test
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Help Text */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <FlaskConical className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100">
                A/B Testing Best Practices
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Test one variable at a time, ensure statistical significance (≥95% confidence), 
                and run tests long enough to account for weekly patterns and seasonal variations.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}