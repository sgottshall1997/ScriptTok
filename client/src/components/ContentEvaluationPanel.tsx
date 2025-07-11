import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Brain, TrendingUp, Eye, Lightbulb, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface ContentEvaluation {
  id: number;
  evaluatorModel: 'chatgpt' | 'claude';
  viralityScore: number;
  clarityScore: number;
  persuasivenessScore: number;
  creativityScore: number;
  viralityJustification: string;
  clarityJustification: string;
  persuasivenessJustification: string;
  creativityJustification: string;
  needsRevision: boolean;
  improvementSuggestions: string;
  overallScore: string;
  createdAt: string;
}

interface EvaluationResponse {
  success: boolean;
  contentHistoryId: number;
  evaluations: {
    chatgpt: ContentEvaluation & { evaluationId: number };
    claude: ContentEvaluation & { evaluationId: number };
  };
}

interface ContentEvaluationPanelProps {
  contentHistoryId: number;
  productName: string;
  onEvaluationComplete?: (evaluations: EvaluationResponse['evaluations']) => void;
}

export function ContentEvaluationPanel({ 
  contentHistoryId, 
  productName, 
  onEvaluationComplete 
}: ContentEvaluationPanelProps) {
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluations, setEvaluations] = useState<EvaluationResponse['evaluations'] | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const { toast } = useToast();

  const startEvaluation = async () => {
    if (isEvaluating) return;
    
    setIsEvaluating(true);
    
    try {
      console.log(`🔍 Starting AI evaluation for content ID ${contentHistoryId}...`);
      
      const response = await apiRequest('POST', `/api/content-evaluation/evaluate/${contentHistoryId}`);
      
      if (response.success) {
        setEvaluations(response.evaluations);
        onEvaluationComplete?.(response.evaluations);
        
        const avgScore = (
          (parseFloat(response.evaluations.chatgpt.overallScore) + 
           parseFloat(response.evaluations.claude.overallScore)) / 2
        ).toFixed(1);
        
        toast({
          title: "AI Evaluation Complete",
          description: `Content rated ${avgScore}/10 by both ChatGPT and Claude`,
        });
      } else {
        throw new Error(response.error || 'Evaluation failed');
      }
    } catch (error: any) {
      console.error('Evaluation error:', error);
      toast({
        title: "Evaluation Failed",
        description: error.message || "Failed to evaluate content",
        variant: "destructive",
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-50';
    if (score >= 6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 8) return <CheckCircle className="w-4 h-4" />;
    if (score >= 6) return <AlertCircle className="w-4 h-4" />;
    return <XCircle className="w-4 h-4" />;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600" />
          AI Content Evaluation
          {evaluations && (
            <Badge variant="outline" className="ml-auto">
              Dual AI Analysis Complete
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!evaluations ? (
          <div className="text-center py-6">
            <p className="text-sm text-gray-600 mb-4">
              Get professional AI feedback on your content quality from both ChatGPT and Claude
            </p>
            <Button 
              onClick={startEvaluation} 
              disabled={isEvaluating}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isEvaluating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Evaluating Content...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Start AI Evaluation
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Overall Scores Summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900">ChatGPT Rating</h4>
                <div className="text-3xl font-bold text-blue-600">
                  {parseFloat(evaluations.chatgpt.overallScore).toFixed(1)}/10
                </div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-900">Claude Rating</h4>
                <div className="text-3xl font-bold text-purple-600">
                  {parseFloat(evaluations.claude.overallScore).toFixed(1)}/10
                </div>
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-red-500" />
                  <span className="font-medium">Virality</span>
                </div>
                <div className="flex gap-2">
                  <Badge className={getScoreColor(evaluations.chatgpt.viralityScore)}>
                    GPT: {evaluations.chatgpt.viralityScore}
                  </Badge>
                  <Badge className={getScoreColor(evaluations.claude.viralityScore)}>
                    Claude: {evaluations.claude.viralityScore}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">Clarity</span>
                </div>
                <div className="flex gap-2">
                  <Badge className={getScoreColor(evaluations.chatgpt.clarityScore)}>
                    GPT: {evaluations.chatgpt.clarityScore}
                  </Badge>
                  <Badge className={getScoreColor(evaluations.claude.clarityScore)}>
                    Claude: {evaluations.claude.clarityScore}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="font-medium">Persuasiveness</span>
                </div>
                <div className="flex gap-2">
                  <Badge className={getScoreColor(evaluations.chatgpt.persuasivenessScore)}>
                    GPT: {evaluations.chatgpt.persuasivenessScore}
                  </Badge>
                  <Badge className={getScoreColor(evaluations.claude.persuasivenessScore)}>
                    Claude: {evaluations.claude.persuasivenessScore}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-yellow-500" />
                  <span className="font-medium">Creativity</span>
                </div>
                <div className="flex gap-2">
                  <Badge className={getScoreColor(evaluations.chatgpt.creativityScore)}>
                    GPT: {evaluations.chatgpt.creativityScore}
                  </Badge>
                  <Badge className={getScoreColor(evaluations.claude.creativityScore)}>
                    Claude: {evaluations.claude.creativityScore}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Toggle Details */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowDetails(!showDetails)}
              className="w-full"
            >
              {showDetails ? 'Hide Details' : 'Show Detailed Feedback'}
            </Button>

            {/* Detailed Feedback */}
            {showDetails && (
              <div className="space-y-4 pt-4 border-t">
                {/* ChatGPT Feedback */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-blue-900">ChatGPT Analysis</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Virality:</strong> {evaluations.chatgpt.viralityJustification}
                    </div>
                    <div>
                      <strong>Clarity:</strong> {evaluations.chatgpt.clarityJustification}
                    </div>
                    <div>
                      <strong>Persuasiveness:</strong> {evaluations.chatgpt.persuasivenessJustification}
                    </div>
                    <div>
                      <strong>Creativity:</strong> {evaluations.chatgpt.creativityJustification}
                    </div>
                    {evaluations.chatgpt.improvementSuggestions && (
                      <div className="p-3 bg-blue-50 rounded">
                        <strong>Suggestions:</strong> {evaluations.chatgpt.improvementSuggestions}
                      </div>
                    )}
                  </div>
                </div>

                {/* Claude Feedback */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-purple-900">Claude Analysis</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Virality:</strong> {evaluations.claude.viralityJustification}
                    </div>
                    <div>
                      <strong>Clarity:</strong> {evaluations.claude.clarityJustification}
                    </div>
                    <div>
                      <strong>Persuasiveness:</strong> {evaluations.claude.persuasivenessJustification}
                    </div>
                    <div>
                      <strong>Creativity:</strong> {evaluations.claude.creativityJustification}
                    </div>
                    {evaluations.claude.improvementSuggestions && (
                      <div className="p-3 bg-purple-50 rounded">
                        <strong>Suggestions:</strong> {evaluations.claude.improvementSuggestions}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}