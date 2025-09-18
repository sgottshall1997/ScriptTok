import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Users2, 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2
} from "lucide-react";
import InstructionFooter from '@/cookaing-marketing/components/InstructionFooter';

interface Segment {
  id: string;
  name: string;
  description: string;
  criteria: string;
  contactCount: number;
  status: 'active' | 'draft' | 'archived';
  createdAt: string;
}

// Mock data for segments
const mockSegments: Segment[] = [
  {
    id: "1",
    name: "High-Value Customers",
    description: "Customers who have made purchases over $500",
    criteria: "Total purchases > $500",
    contactCount: 245,
    status: "active",
    createdAt: "2025-01-15"
  },
  {
    id: "2", 
    name: "Recent Subscribers",
    description: "Contacts who subscribed in the last 30 days",
    criteria: "Subscription date < 30 days ago",
    contactCount: 89,
    status: "active",
    createdAt: "2025-01-10"
  },
  {
    id: "3",
    name: "Recipe Engagement",
    description: "Users who frequently engage with recipe content",
    criteria: "Recipe views > 10 per month",
    contactCount: 156,
    status: "draft", 
    createdAt: "2025-01-08"
  }
];

export default function SegmentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredSegments = mockSegments.filter(segment => {
    const matchesSearch = segment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         segment.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || segment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'draft': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'archived': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users2 className="h-8 w-8" />
            Segments
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Organize contacts into targeted segments for personalized marketing
          </p>
        </div>
        <Button data-testid="button-create-segment">
          <Plus className="h-4 w-4 mr-2" />
          Create Segment
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search segments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
            data-testid="input-search-segments"
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
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Segments</p>
                <p className="text-2xl font-bold">{mockSegments.length}</p>
              </div>
              <Users2 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Segments</p>
                <p className="text-2xl font-bold text-green-600">
                  {mockSegments.filter(s => s.status === 'active').length}
                </p>
              </div>
              <Users2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Contacts</p>
                <p className="text-2xl font-bold">
                  {mockSegments.reduce((sum, s) => sum + s.contactCount, 0).toLocaleString()}
                </p>
              </div>
              <Users2 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Segments Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredSegments.map((segment) => (
          <Card key={segment.id} data-testid={`card-segment-${segment.id}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{segment.name}</CardTitle>
                <Badge variant="outline" className={getStatusColor(segment.status)}>
                  {segment.status.charAt(0).toUpperCase() + segment.status.slice(1)}
                </Badge>
              </div>
              <CardDescription>{segment.description}</CardDescription>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Criteria:</strong> {segment.criteria}
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {segment.contactCount.toLocaleString()} contacts
                  </span>
                  <span className="text-gray-500">
                    Created {segment.createdAt}
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button variant="outline" size="sm" data-testid={`button-view-${segment.id}`}>
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" data-testid={`button-edit-${segment.id}`}>
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" data-testid={`button-delete-${segment.id}`}>
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredSegments.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No segments found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm || statusFilter !== "all" 
                ? "Try adjusting your search or filter criteria."
                : "Get started by creating your first customer segment."
              }
            </p>
            {!searchTerm && statusFilter === "all" && (
              <Button data-testid="button-create-first-segment">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Segment
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Help Text */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Users2 className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100">
                About Segments
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Segments allow you to group contacts based on behavior, preferences, or demographics. 
                Use segments to send targeted campaigns and increase engagement rates.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instruction Footer */}
      <InstructionFooter
        title="Segments"
        whatIsIt="Dynamic lists driven by rules (e.g., diet = vegan, time ≤ 20 min)."
        setupSteps={[
          "Define rules using contact fields and tags.",
          "Save and verify previewed membership counts."
        ]}
        usageSteps={[
          "Use a segment as audience for Campaign sends and Workflows."
        ]}
      />
    </div>
  );
}