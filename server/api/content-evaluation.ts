import { Express } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { contentEvaluations, contentHistory } from "@shared/schema";
import { 
  evaluateContentWithBothModels, 
  createContentEvaluationData 
} from "../services/aiEvaluationService";

export function registerContentEvaluationRoutes(app: Express): void {
  // Evaluate specific content by content history ID
  app.post('/api/content-evaluation/evaluate/:contentHistoryId', async (req, res) => {
    try {
      const { contentHistoryId } = req.params;
      const contentId = parseInt(contentHistoryId);

      if (isNaN(contentId)) {
        return res.status(400).json({ 
          success: false, 
          error: "Invalid content history ID" 
        });
      }

      // Get the content to evaluate
      const [contentRecord] = await db
        .select()
        .from(contentHistory)
        .where(eq(contentHistory.id, contentId));

      if (!contentRecord) {
        return res.status(404).json({ 
          success: false, 
          error: "Content not found" 
        });
      }

      // Prepare content text for evaluation
      const contentToEvaluate = `
Product: ${contentRecord.productName}
Niche: ${contentRecord.niche}
Tone: ${contentRecord.tone}
Content Type: ${contentRecord.contentType}

Generated Content:
${contentRecord.outputText}

Platform Content:
${contentRecord.generatedOutput ? JSON.stringify(contentRecord.generatedOutput, null, 2) : 'No platform content available'}
      `.trim();

      console.log(`🔍 Starting AI evaluation for content ID ${contentId}...`);
      
      // Get evaluations from both models
      const { chatgptEvaluation, claudeEvaluation } = await evaluateContentWithBothModels(contentToEvaluate);
      
      console.log(`✅ ChatGPT evaluation completed - Overall: ${chatgptEvaluation.overallScore}/10`);
      console.log(`✅ Claude evaluation completed - Overall: ${claudeEvaluation.overallScore}/10`);

      // Save both evaluations to database
      const chatgptEvaluationData = createContentEvaluationData(contentId, 'chatgpt', chatgptEvaluation);
      const claudeEvaluationData = createContentEvaluationData(contentId, 'claude', claudeEvaluation);

      const [savedChatGPTEval, savedClaudeEval] = await Promise.all([
        db.insert(contentEvaluations).values(chatgptEvaluationData).returning(),
        db.insert(contentEvaluations).values(claudeEvaluationData).returning()
      ]);

      console.log(`💾 Saved evaluations to database: ChatGPT ID ${savedChatGPTEval[0].id}, Claude ID ${savedClaudeEval[0].id}`);

      res.json({
        success: true,
        contentHistoryId: contentId,
        evaluations: {
          chatgpt: {
            ...chatgptEvaluation,
            evaluationId: savedChatGPTEval[0].id
          },
          claude: {
            ...claudeEvaluation,
            evaluationId: savedClaudeEval[0].id
          }
        }
      });

    } catch (error: any) {
      console.error('Error in content evaluation:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || "Failed to evaluate content" 
      });
    }
  });

  // Get evaluations for specific content
  app.get('/api/content-evaluation/:contentHistoryId', async (req, res) => {
    try {
      const { contentHistoryId } = req.params;
      const contentId = parseInt(contentHistoryId);

      if (isNaN(contentId)) {
        return res.status(400).json({ 
          success: false, 
          error: "Invalid content history ID" 
        });
      }

      const evaluations = await db
        .select()
        .from(contentEvaluations)
        .where(eq(contentEvaluations.contentHistoryId, contentId))
        .orderBy(contentEvaluations.createdAt);

      res.json({
        success: true,
        contentHistoryId: contentId,
        evaluations
      });

    } catch (error: any) {
      console.error('Error fetching content evaluations:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || "Failed to fetch evaluations" 
      });
    }
  });

  // Get summary statistics for evaluations
  app.get('/api/content-evaluation/stats/summary', async (req, res) => {
    try {
      const evaluations = await db.select().from(contentEvaluations);
      
      const stats = {
        totalEvaluations: evaluations.length,
        averageOverallScore: 0,
        averageScoresByModel: {
          chatgpt: { count: 0, averageScore: 0 },
          claude: { count: 0, averageScore: 0 }
        },
        averageScoresByMetric: {
          virality: 0,
          clarity: 0,
          persuasiveness: 0,
          creativity: 0
        },
        needsRevisionCount: evaluations.filter(e => e.needsRevision).length
      };

      if (evaluations.length > 0) {
        // Calculate overall averages
        stats.averageOverallScore = evaluations.reduce((sum, e) => sum + parseFloat(e.overallScore || '0'), 0) / evaluations.length;
        
        // Calculate by model
        const chatgptEvals = evaluations.filter(e => e.evaluatorModel === 'chatgpt');
        const claudeEvals = evaluations.filter(e => e.evaluatorModel === 'claude');
        
        stats.averageScoresByModel.chatgpt.count = chatgptEvals.length;
        stats.averageScoresByModel.claude.count = claudeEvals.length;
        
        if (chatgptEvals.length > 0) {
          stats.averageScoresByModel.chatgpt.averageScore = 
            chatgptEvals.reduce((sum, e) => sum + parseFloat(e.overallScore || '0'), 0) / chatgptEvals.length;
        }
        
        if (claudeEvals.length > 0) {
          stats.averageScoresByModel.claude.averageScore = 
            claudeEvals.reduce((sum, e) => sum + parseFloat(e.overallScore || '0'), 0) / claudeEvals.length;
        }

        // Calculate by metric
        stats.averageScoresByMetric.virality = evaluations.reduce((sum, e) => sum + e.viralityScore, 0) / evaluations.length;
        stats.averageScoresByMetric.clarity = evaluations.reduce((sum, e) => sum + e.clarityScore, 0) / evaluations.length;
        stats.averageScoresByMetric.persuasiveness = evaluations.reduce((sum, e) => sum + e.persuasivenessScore, 0) / evaluations.length;
        stats.averageScoresByMetric.creativity = evaluations.reduce((sum, e) => sum + e.creativityScore, 0) / evaluations.length;
      }

      res.json({
        success: true,
        stats
      });

    } catch (error: any) {
      console.error('Error fetching evaluation stats:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || "Failed to fetch evaluation statistics" 
      });
    }
  });
}