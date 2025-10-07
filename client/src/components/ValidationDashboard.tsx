import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertCircle, TrendingUp } from 'lucide-react';

interface ValidationLog {
  timestamp: string;
  templateType: string;
  isValid: boolean;
  errorCount: number;
  warningCount: number;
  errors: Array<{ field: string; issue: string }>;
  metadata: { wordCount: number };
}

interface TemplateMetric {
  templateType: string;
  totalValidations: number;
  passedValidations: number;
  failedValidations: number;
  passRate: string;
  commonErrors?: Array<{ error: string; count: number }>;
}

interface OverallMetrics {
  totalValidations: number;
  passedValidations: number;
  failedValidations: number;
  overallPassRate: string;
  templateCount: number;
}

export function ValidationDashboard() {
  const { data: overallMetrics } = useQuery<OverallMetrics>({
    queryKey: ['/api/validation/overall']
  });

  const { data: templateMetrics } = useQuery<TemplateMetric[]>({
    queryKey: ['/api/validation/metrics']
  });

  const { data: recentLogs } = useQuery<ValidationLog[]>({
    queryKey: ['/api/validation/logs'],
    refetchInterval: 10000
  });

  return (
    <div className="space-y-6 p-6" data-testid="validation-dashboard">
      <div>
        <h1 className="text-3xl font-bold" data-testid="dashboard-title">Content Validation Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Monitor AI-generated content quality and validation metrics
        </p>
      </div>

      {overallMetrics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Validations</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="metric-total">
                {overallMetrics.totalValidations}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600" data-testid="metric-passrate">
                {overallMetrics.overallPassRate}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Passed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="metric-passed">
                {overallMetrics.passedValidations}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="metric-failed">
                {overallMetrics.failedValidations}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Template Performance</CardTitle>
          <CardDescription>Validation pass rates by template type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {templateMetrics?.map((metric) => (
              <div
                key={metric.templateType}
                className="flex items-center justify-between p-3 rounded-lg border"
                data-testid={`template-${metric.templateType}`}
              >
                <div>
                  <p className="font-medium">{metric.templateType.replace(/_/g, ' ').toUpperCase()}</p>
                  <p className="text-sm text-muted-foreground">
                    {metric.totalValidations} validations
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant={parseFloat(metric.passRate) >= 90 ? 'default' : 'secondary'}
                    data-testid={`badge-${metric.templateType}`}
                  >
                    {metric.passRate}
                  </Badge>
                  <div className="text-sm text-muted-foreground">
                    {metric.passedValidations}/{metric.totalValidations}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Validation Logs</CardTitle>
          <CardDescription>Latest validation results (last 20)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentLogs?.slice(0, 20).map((log, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  log.isValid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                }`}
                data-testid={`log-${index}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {log.isValid ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <div>
                      <p className="font-medium text-sm">
                        {log.templateType.replace(/_/g, ' ').toUpperCase()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {log.metadata.wordCount} words
                  </div>
                </div>
                {!log.isValid && log.errors.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {log.errors.map((error, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-red-700">
                        <AlertCircle className="h-3 w-3" />
                        <span>
                          <strong>{error.field}:</strong> {error.issue}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
