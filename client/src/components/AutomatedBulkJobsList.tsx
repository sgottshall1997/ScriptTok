import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  Eye, 
  ChevronDown,
  ChevronRight,
  Copy,
  ExternalLink,
  Zap,
  Target,
  BarChart3
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface AutomatedBulkJob {
  id: number;
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalVariations: number;
  completedVariations: number;
  autoSelectedProducts: Record<string, any>;
  selectedNiches: string[];
  tones: string[];
  templates: string[];
  platforms: string[];
  viralInspiration: Record<string, any>;
  progressLog: any;
  errorLog: any[];
  createdAt: string;
  updatedAt: string;
  progressPercentage?: number;
  generatedContentCount?: number;
}

interface AutomatedBulkJobsListProps {
  jobs: AutomatedBulkJob[];
}

export default function AutomatedBulkJobsList({ jobs }: AutomatedBulkJobsListProps) {
  const [expandedJobs, setExpandedJobs] = useState<Set<string>>(new Set());
  const [selectedJobDetails, setSelectedJobDetails] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch detailed job information when expanded
  const { data: jobDetails } = useQuery({
    queryKey: ['/api/automated-bulk/details', selectedJobDetails],
    enabled: !!selectedJobDetails,
    staleTime: 30000,
  });

  const toggleJobExpansion = (jobId: string) => {
    const newExpanded = new Set(expandedJobs);
    if (newExpanded.has(jobId)) {
      newExpanded.delete(jobId);
      if (selectedJobDetails === jobId) {
        setSelectedJobDetails(null);
      }
    } else {
      newExpanded.add(jobId);
      setSelectedJobDetails(jobId);
    }
    setExpandedJobs(newExpanded);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'processing': return <Clock className="h-4 w-4 animate-spin" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const copyToClipboard = (text: string, description: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "📋 Copied to Clipboard",
      description: `${description} copied successfully`,
    });
  };

  const getNicheColor = (niche: string) => {
    const colors: Record<string, string> = {
      beauty: 'bg-pink-100 text-pink-800',
      fitness: 'bg-green-100 text-green-800',
      tech: 'bg-blue-100 text-blue-800',
      fashion: 'bg-purple-100 text-purple-800',
      food: 'bg-orange-100 text-orange-800',
      travel: 'bg-cyan-100 text-cyan-800',
      pets: 'bg-yellow-100 text-yellow-800',
    };
    return colors[niche] || 'bg-gray-100 text-gray-800';
  };

  if (!jobs || jobs.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-gray-100 rounded-full">
              <Zap className="h-8 w-8 text-gray-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">No Automated Jobs Yet</h3>
              <p className="text-gray-600 mb-4">Start your first automated bulk generation to see jobs here</p>
              <p className="text-sm text-gray-500">Jobs will show real-time progress, auto-selected products, and generated content</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Automated Bulk Generation Jobs</h2>
        <Badge variant="outline" className="px-3 py-1">
          {jobs.length} {jobs.length === 1 ? 'Job' : 'Jobs'}
        </Badge>
      </div>

      <div className="space-y-4">
        {jobs.map((job) => (
          <Card key={job.jobId} className="border-2 hover:border-purple-200 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleJobExpansion(job.jobId)}
                    className="p-1 h-auto"
                  >
                    {expandedJobs.has(job.jobId) ? 
                      <ChevronDown className="h-4 w-4" /> : 
                      <ChevronRight className="h-4 w-4" />
                    }
                  </Button>
                  
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Badge className={getStatusColor(job.status)} variant="outline">
                        {getStatusIcon(job.status)}
                        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                      </Badge>
                      Auto-Generated Content
                    </CardTitle>
                    <CardDescription>
                      Job ID: {job.jobId} • Created {formatDistanceToNow(new Date(job.createdAt))} ago
                    </CardDescription>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-purple-600">
                    {job.completedVariations}/{job.totalVariations}
                  </p>
                  <p className="text-sm text-gray-600">Content Pieces</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm text-gray-600">
                    {job.progressPercentage || 0}%
                  </span>
                </div>
                <Progress 
                  value={job.progressPercentage || 0} 
                  className="h-2"
                />
              </div>

              {/* Quick Info */}
              <div className="flex flex-wrap gap-2 mt-3">
                <div className="flex items-center gap-1">
                  <Target className="h-3 w-3 text-gray-500" />
                  <span className="text-xs text-gray-600">
                    {job.selectedNiches?.length || 0} niches
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <BarChart3 className="h-3 w-3 text-gray-500" />
                  <span className="text-xs text-gray-600">
                    {job.tones?.length || 0} tones x {job.templates?.length || 0} templates
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-gray-500" />
                  <span className="text-xs text-gray-600">
                    {Object.keys(job.autoSelectedProducts || {}).length} auto-selected products
                  </span>
                </div>
              </div>
            </CardHeader>

            {/* Expanded Content */}
            <Collapsible open={expandedJobs.has(job.jobId)}>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <Separator className="mb-4" />
                  
                  {/* Auto-Selected Products */}
                  {job.autoSelectedProducts && Object.keys(job.autoSelectedProducts).length > 0 && (
                    <div className="space-y-3 mb-6">
                      <h4 className="font-semibold flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        Auto-Selected Trending Products
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {Object.entries(job.autoSelectedProducts).map(([niche, productData]: [string, any]) => (
                          <Card key={niche} className="p-3 bg-gray-50">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge className={getNicheColor(niche)} variant="secondary">
                                    {niche.charAt(0).toUpperCase() + niche.slice(1)}
                                  </Badge>
                                </div>
                                <h5 className="font-medium text-sm mb-1">{productData.product}</h5>
                                <p className="text-xs text-gray-600 mb-1">by {productData.brand}</p>
                                <p className="text-xs text-gray-500">{productData.reason}</p>
                                {productData.mentions && (
                                  <p className="text-xs text-blue-600 mt-1">
                                    {productData.mentions.toLocaleString()} mentions
                                  </p>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(productData.product, 'Product name')}
                                className="p-1 h-auto"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Viral Inspiration */}
                  {job.viralInspiration && Object.keys(job.viralInspiration).length > 0 && (
                    <div className="space-y-3 mb-6">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Zap className="h-4 w-4 text-purple-600" />
                        Viral Inspiration Data
                      </h4>
                      <div className="grid grid-cols-1 gap-3">
                        {Object.entries(job.viralInspiration).map(([productName, inspiration]: [string, any]) => (
                          <Card key={productName} className="p-3 bg-purple-50">
                            <h5 className="font-medium text-sm mb-2">{productName}</h5>
                            {inspiration && (
                              <div className="space-y-2">
                                <div>
                                  <p className="text-xs font-medium text-purple-800">Hook:</p>
                                  <p className="text-xs text-purple-700">{inspiration.hook}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-purple-800">Format:</p>
                                  <p className="text-xs text-purple-700">{inspiration.format}</p>
                                </div>
                                {inspiration.hashtags && (
                                  <div>
                                    <p className="text-xs font-medium text-purple-800">Hashtags:</p>
                                    <p className="text-xs text-purple-700">{inspiration.hashtags.join(' ')}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Generation Settings */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                      <h5 className="font-medium text-sm mb-2">Selected Niches</h5>
                      <div className="flex flex-wrap gap-1">
                        {job.selectedNiches?.map((niche) => (
                          <Badge key={niche} className={getNicheColor(niche)} variant="secondary">
                            {niche}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-sm mb-2">Content Tones</h5>
                      <div className="flex flex-wrap gap-1">
                        {job.tones?.map((tone) => (
                          <Badge key={tone} variant="outline" className="text-xs">
                            {tone}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-sm mb-2">Templates</h5>
                      <div className="flex flex-wrap gap-1">
                        {job.templates?.map((template) => (
                          <Badge key={template} variant="outline" className="text-xs">
                            {template}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Error Log */}
                  {job.errorLog && job.errorLog.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center gap-2 text-red-600">
                        <XCircle className="h-4 w-4" />
                        Error Log ({job.errorLog.length})
                      </h4>
                      <ScrollArea className="h-32 border rounded-md p-3 bg-red-50">
                        <div className="space-y-2">
                          {job.errorLog.map((error: any, index: number) => (
                            <div key={index} className="text-sm">
                              <p className="font-medium text-red-800">{error.product} - {error.tone}/{error.template}</p>
                              <p className="text-red-600">{error.error}</p>
                              <p className="text-red-500 text-xs">{error.timestamp}</p>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )}

                  {/* View Generated Content Button */}
                  {job.status === 'completed' && job.completedVariations > 0 && (
                    <div className="flex justify-center pt-4">
                      <Button variant="outline" className="gap-2">
                        <Eye className="h-4 w-4" />
                        View Generated Content ({job.completedVariations} pieces)
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>
    </div>
  );
}