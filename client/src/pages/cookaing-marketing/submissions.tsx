import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import InstructionFooter from '@/cookaing-marketing/components/InstructionFooter';
import { 
  FileSpreadsheet, 
  Search, 
  Filter,
  Eye,
  Download,
  Calendar,
  User,
  Mail,
  MapPin,
  Phone
} from "lucide-react";

interface FormSubmission {
  id: string;
  formName: string;
  submitterName: string;
  submitterEmail: string;
  submissionDate: string;
  status: 'new' | 'reviewed' | 'responded' | 'archived';
  source: string;
  data: Record<string, any>;
}

// Mock data for form submissions
const mockSubmissions: FormSubmission[] = [
  {
    id: "1",
    formName: "Newsletter Signup",
    submitterName: "Sarah Johnson",
    submitterEmail: "sarah.j@email.com",
    submissionDate: "2025-01-18T14:30:00Z",
    status: "new",
    source: "Recipe Blog",
    data: {
      email: "sarah.j@email.com",
      name: "Sarah Johnson",
      preferences: ["vegetarian", "quick-meals"],
      source: "google-search"
    }
  },
  {
    id: "2", 
    formName: "Contact Form",
    submitterName: "Mike Chen",
    submitterEmail: "mike.chen@email.com",
    submissionDate: "2025-01-18T11:15:00Z",
    status: "reviewed",
    source: "Contact Page",
    data: {
      name: "Mike Chen",
      email: "mike.chen@email.com",
      subject: "Partnership Inquiry",
      message: "Interested in collaborating on meal prep content",
      phone: "+1-555-0123"
    }
  },
  {
    id: "3",
    formName: "Recipe Feedback",
    submitterName: "Emma Davis",
    submitterEmail: "emma.d@email.com", 
    submissionDate: "2025-01-17T16:45:00Z",
    status: "responded",
    source: "Recipe Detail Page",
    data: {
      name: "Emma Davis",
      email: "emma.d@email.com",
      recipe: "5-Minute Breakfast Bowl",
      rating: 5,
      feedback: "Amazing recipe! Made it 3 times this week.",
      wouldRecommend: true
    }
  },
  {
    id: "4",
    formName: "Meal Plan Request",
    submitterName: "Alex Rodriguez",
    submitterEmail: "alex.r@email.com",
    submissionDate: "2025-01-17T09:20:00Z",
    status: "new",
    source: "Landing Page",
    data: {
      name: "Alex Rodriguez",
      email: "alex.r@email.com",
      dietaryRestrictions: ["gluten-free", "dairy-free"],
      mealTypes: ["lunch", "dinner"],
      budget: "$50-75/week",
      familySize: 2
    }
  }
];

export default function SubmissionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [formFilter, setFormFilter] = useState<string>("all");

  const filteredSubmissions = mockSubmissions.filter(submission => {
    const matchesSearch = submission.submitterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         submission.submitterEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         submission.formName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || submission.status === statusFilter;
    const matchesForm = formFilter === "all" || submission.formName === formFilter;
    return matchesSearch && matchesStatus && matchesForm;
  });

  const uniqueForms = Array.from(new Set(mockSubmissions.map(s => s.formName)));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'reviewed': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'responded': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'archived': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
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

  const renderSubmissionData = (data: Record<string, any>) => {
    return Object.entries(data).slice(0, 3).map(([key, value]) => (
      <div key={key} className="text-sm">
        <span className="font-medium text-gray-600 dark:text-gray-400 capitalize">
          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
        </span>{" "}
        <span className="text-gray-800 dark:text-gray-200">
          {Array.isArray(value) ? value.join(', ') : value?.toString() || 'N/A'}
        </span>
      </div>
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileSpreadsheet className="h-8 w-8" />
            Form Submissions
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View and manage all form submissions across your site
          </p>
        </div>
        <Button data-testid="button-export-submissions">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search submissions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
            data-testid="input-search-submissions"
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
            <option value="new">New</option>
            <option value="reviewed">Reviewed</option>
            <option value="responded">Responded</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={formFilter}
            onChange={(e) => setFormFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm"
            data-testid="select-form-filter"
          >
            <option value="all">All Forms</option>
            {uniqueForms.map(form => (
              <option key={form} value={form}>{form}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Submissions</p>
                <p className="text-2xl font-bold">{mockSubmissions.length}</p>
              </div>
              <FileSpreadsheet className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">New</p>
                <p className="text-2xl font-bold text-blue-600">
                  {mockSubmissions.filter(s => s.status === 'new').length}
                </p>
              </div>
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Responded</p>
                <p className="text-2xl font-bold text-green-600">
                  {mockSubmissions.filter(s => s.status === 'responded').length}
                </p>
              </div>
              <User className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Response Rate</p>
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round((mockSubmissions.filter(s => s.status === 'responded').length / mockSubmissions.length) * 100)}%
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submissions List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Submissions</CardTitle>
          <CardDescription>
            All form submissions with searchable viewer and status management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredSubmissions.map((submission) => (
              <Card key={submission.id} data-testid={`card-submission-${submission.id}`} 
                    className="border-l-4 border-l-blue-500">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{submission.formName}</h3>
                        <Badge variant="outline" className={getStatusColor(submission.status)}>
                          {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                        </Badge>
                      </div>
                      
                      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{submission.submitterName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">{submission.submitterEmail}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">{formatDate(submission.submissionDate)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">From: {submission.source}</span>
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 mb-3">
                        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Submission Data:</h4>
                        <div className="space-y-1">
                          {renderSubmissionData(submission.data)}
                          {Object.keys(submission.data).length > 3 && (
                            <div className="text-sm text-gray-500">
                              ... and {Object.keys(submission.data).length - 3} more fields
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button variant="outline" size="sm" data-testid={`button-view-${submission.id}`}>
                        <Eye className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                      <select
                        defaultValue={submission.status}
                        className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800"
                        data-testid={`select-status-${submission.id}`}
                      >
                        <option value="new">New</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="responded">Responded</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      {filteredSubmissions.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No submissions found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm || statusFilter !== "all" || formFilter !== "all"
                ? "Try adjusting your search or filter criteria."
                : "Form submissions will appear here when users submit forms on your site."
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Help Text */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <FileSpreadsheet className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100">
                Managing Form Submissions
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Track all form interactions in one place. Use status filters to prioritize responses 
                and export data for analysis. Update submission status to track your response workflow.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instruction Footer */}
      <InstructionFooter
        title="Submissions Inbox"
        whatIsIt="Capture and triage inbound form and UGC submissions."
        setupSteps={[
          "Create forms and configure webhooks to post submissions."
        ]}
        usageSteps={[
          "Review, approve, tag, and route to workflows."
        ]}
        relatedLinks={[{"label":"Forms", "href":"/cookaing-marketing/forms"},{"label":"Webhooks", "href":"/cookaing-marketing/webhooks"}]}
      />
    </div>
  );
}