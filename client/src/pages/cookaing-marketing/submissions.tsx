import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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
  Loader2
} from "lucide-react";
import { formSubmissions } from "@shared/schema";

type FormSubmission = typeof formSubmissions.$inferSelect;


export default function SubmissionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [formFilter, setFormFilter] = useState<string>("all");

  // Fetch form submissions
  const { data: submissions, isLoading } = useQuery<FormSubmission[]>({
    queryKey: ['/api/cookaing-marketing/submissions'],
    retry: false,
  });

  // Since we removed mock data, submissions will be empty until real data is added
  const filteredSubmissions = (submissions || []).filter(submission => {
    // Real filtering would require joining with forms and contacts tables
    // For now, just return all submissions
    return true;
  });

  const uniqueForms: string[] = [];  // Will be populated when real forms are connected


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
                <p className="text-2xl font-bold">{submissions?.length || 0}</p>
              </div>
              <FileSpreadsheet className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">This Week</p>
                <p className="text-2xl font-bold text-blue-600">0</p>
              </div>
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Processed</p>
                <p className="text-2xl font-bold text-green-600">0</p>
              </div>
              <User className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Conversion Rate</p>
                <p className="text-2xl font-bold text-purple-600">0%</p>
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
          {filteredSubmissions.length > 0 ? (
            <div className="space-y-4">
              {filteredSubmissions.map((submission) => (
                <Card key={submission.id} data-testid={`card-submission-${submission.id}`} 
                      className="border-l-4 border-l-blue-500">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">Form Submission #{submission.id}</h3>
                          <Badge variant="outline">New</Badge>
                        </div>
                        
                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 mb-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400">
                              {new Date(submission.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <FileSpreadsheet className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400">Form ID: {submission.formId}</span>
                          </div>
                          {submission.contactId && (
                            <div className="flex items-center gap-2 text-sm">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600 dark:text-gray-400">Contact ID: {submission.contactId}</span>
                            </div>
                          )}
                        </div>

                        {submission.dataJson && (
                          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 mb-3">
                            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Submission Data:</h4>
                            <details className="cursor-pointer">
                              <summary className="text-sm text-gray-600 dark:text-gray-400">
                                View Data (Click to expand)
                              </summary>
                              <pre className="mt-2 text-xs overflow-auto">
                                {JSON.stringify(submission.dataJson as any, null, 2)}
                              </pre>
                            </details>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Button variant="outline" size="sm" data-testid={`button-view-${submission.id}`}>
                          <Eye className="h-3 w-3 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileSpreadsheet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                No Form Submissions Found
              </h3>
              <p className="text-gray-500 dark:text-gray-500 mb-6">
                Form submissions will appear here once your forms start collecting data.
              </p>
              <div className="text-xs text-gray-400">
                <p>Connect your forms to start receiving submissions.</p>
                <p>Visit the <strong>Forms</strong> section to create and manage your forms.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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