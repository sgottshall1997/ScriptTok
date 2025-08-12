import { Router } from 'express';
import { z } from 'zod';
import { filterContentForCompliance, getContentImprovementSuggestions } from '../services/contentPolicyFilter.js';
import { 
  generateComplianceReport, 
  verifyUserEligibility, 
  createVerificationChecklist,
  userVerificationSchema 
} from '../services/userVerificationSystem.js';
import { 
  trackAffiliateLink, 
  generateLinkPerformanceReport, 
  monitorComplianceViolations,
  exportComplianceData 
} from '../services/linkTrackingSystem.js';

const router = Router();

// Content Policy Filtering
router.post('/content/filter', async (req, res) => {
  try {
    const { content, productName, niche } = req.body;
    
    if (!content || !productName || !niche) {
      return res.status(400).json({ 
        error: 'Missing required fields: content, productName, niche' 
      });
    }

    const policyResult = filterContentForCompliance(content, productName, niche);
    const suggestions = getContentImprovementSuggestions(policyResult, niche);

    res.json({
      success: true,
      compliance: policyResult,
      suggestions,
      canPublish: policyResult.isCompliant
    });

  } catch (error) {
    console.error('Content filtering error:', error);
    res.status(500).json({ 
      error: 'Failed to filter content',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// User Verification
router.post('/user/verify', async (req, res) => {
  try {
    const validatedData = userVerificationSchema.parse(req.body);
    
    const eligibilityCheck = verifyUserEligibility({
      userId: 'temp_user', // In real app, get from auth
      ...validatedData,
      verificationStatus: 'pending',
      lastComplianceCheck: new Date()
    });

    const checklist = createVerificationChecklist(validatedData);

    res.json({
      success: true,
      eligibility: eligibilityCheck,
      checklist,
      nextSteps: eligibilityCheck.eligible ? 
        ['Complete verification process', 'Start creating compliant content'] :
        eligibilityCheck.recommendations
    });

  } catch (error) {
    console.error('User verification error:', error);
    res.status(500).json({ 
      error: 'Failed to verify user',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Link Tracking
router.post('/links/track', async (req, res) => {
  try {
    const { 
      userId, 
      affiliateId, 
      productName, 
      originalUrl, 
      platform, 
      contentId, 
      content 
    } = req.body;

    if (!userId || !affiliateId || !productName || !originalUrl || !platform) {
      return res.status(400).json({ 
        error: 'Missing required fields for link tracking' 
      });
    }

    const trackingData = trackAffiliateLink(
      userId,
      affiliateId,
      productName,
      originalUrl,
      platform,
      contentId || `content_${Date.now()}`,
      content
    );

    res.json({
      success: true,
      linkId: trackingData.linkId,
      complianceStatus: trackingData.complianceStatus,
      complianceNotes: trackingData.complianceNotes
    });

  } catch (error) {
    console.error('Link tracking error:', error);
    res.status(500).json({ 
      error: 'Failed to track link',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Compliance Report
router.get('/report/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { timeframe = 'month' } = req.query;

    // In real implementation, fetch from database
    const mockContentHistory = [
      {
        id: 1,
        content: 'Great product! As an Amazon Associate I earn from qualifying purchases.',
        affiliateLink: 'https://amazon.com/product?tag=test-20',
        createdAt: new Date()
      }
    ];

    const report = generateComplianceReport(
      userId,
      mockContentHistory,
      timeframe as 'month' | 'quarter' | 'year'
    );

    res.json({
      success: true,
      report
    });

  } catch (error) {
    console.error('Compliance report error:', error);
    res.status(500).json({ 
      error: 'Failed to generate compliance report',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Performance Analytics
router.get('/analytics/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { timeframe = 'month' } = req.query;

    // Mock tracking data - in real implementation, fetch from database
    const mockTrackingData = [
      {
        linkId: 'link_123',
        userId,
        affiliateId: 'test-20',
        productName: 'Test Product',
        originalUrl: 'https://amazon.com/test?tag=test-20',
        shortUrl: '',
        platform: 'instagram',
        contentId: 'content_123',
        createdAt: new Date(),
        clicks: 25,
        conversions: 3,
        revenue: 45.99,
        complianceStatus: 'compliant' as const,
        complianceNotes: ['All checks passed']
      }
    ];

    const performance = generateLinkPerformanceReport(
      userId,
      mockTrackingData,
      timeframe as 'week' | 'month' | 'quarter'
    );

    const violations = monitorComplianceViolations(mockTrackingData);

    res.json({
      success: true,
      performance,
      violations,
      summary: {
        totalLinks: performance.totalLinks,
        complianceScore: performance.complianceScore,
        revenue: performance.totalRevenue,
        recommendedActions: violations.recommendedActions
      }
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ 
      error: 'Failed to generate analytics',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Export Compliance Data for Amazon
router.get('/export/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { timeframe = 'quarter' } = req.query;

    // Mock data - in real implementation, fetch from database
    const mockTrackingData = [
      {
        linkId: 'link_123',
        userId,
        affiliateId: 'test-20',
        productName: 'Test Product',
        originalUrl: 'https://amazon.com/test?tag=test-20',
        shortUrl: '',
        platform: 'instagram',
        contentId: 'content_123',
        createdAt: new Date(),
        clicks: 25,
        conversions: 3,
        revenue: 45.99,
        complianceStatus: 'compliant' as const,
        complianceNotes: ['All checks passed']
      }
    ];

    const exportData = exportComplianceData(
      userId,
      mockTrackingData,
      timeframe as 'month' | 'quarter' | 'year'
    );

    res.json({
      success: true,
      exportData,
      generatedAt: new Date().toISOString(),
      disclaimer: 'This report contains all affiliate link usage and compliance data for the specified period.'
    });

  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ 
      error: 'Failed to export compliance data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;