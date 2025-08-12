/**
 * Enhanced Link Tracking and Compliance Monitoring System
 * Tracks affiliate link usage and monitors compliance with Amazon Associates policies
 */

import { z } from 'zod';

export interface LinkTrackingData {
  linkId: string;
  userId: string;
  affiliateId: string;
  productName: string;
  originalUrl: string;
  shortUrl?: string;
  platform: string;
  contentId: string;
  createdAt: Date;
  clicks: number;
  conversions: number;
  revenue: number;
  lastClickAt?: Date;
  complianceStatus: 'compliant' | 'warning' | 'violation';
  complianceNotes: string[];
}

export interface LinkPerformanceMetrics {
  totalLinks: number;
  totalClicks: number;
  totalConversions: number;
  totalRevenue: number;
  conversionRate: number;
  averageRevenuePerClick: number;
  topPerformingProducts: string[];
  complianceScore: number;
}

export interface ComplianceViolation {
  linkId: string;
  violationType: 'missing_disclosure' | 'prohibited_content' | 'link_manipulation' | 'policy_violation';
  description: string;
  severity: 'low' | 'medium' | 'high';
  detectedAt: Date;
  resolved: boolean;
}

/**
 * Link tracking schema for validation
 */
export const linkTrackingSchema = z.object({
  userId: z.string(),
  affiliateId: z.string(),
  productName: z.string(),
  originalUrl: z.string().url(),
  platform: z.string(),
  contentId: z.string()
});

/**
 * Track new affiliate link creation
 */
export function trackAffiliateLink(
  userId: string,
  affiliateId: string,
  productName: string,
  originalUrl: string,
  platform: string,
  contentId: string,
  content?: string
): LinkTrackingData {
  const linkId = generateLinkId();
  
  // Perform initial compliance check
  const complianceCheck = performComplianceCheck(originalUrl, content || '', platform);
  
  const trackingData: LinkTrackingData = {
    linkId,
    userId,
    affiliateId,
    productName,
    originalUrl,
    platform,
    contentId,
    createdAt: new Date(),
    clicks: 0,
    conversions: 0,
    revenue: 0,
    complianceStatus: complianceCheck.status,
    complianceNotes: complianceCheck.notes
  };

  console.log(`🔗 Tracked new affiliate link: ${linkId} for product: ${productName}`);
  
  return trackingData;
}

/**
 * Record affiliate link click
 */
export function recordLinkClick(
  linkId: string,
  clickData: {
    timestamp: Date;
    userAgent?: string;
    referrer?: string;
    ipAddress?: string;
    country?: string;
  }
): void {
  console.log(`👆 Click recorded for link: ${linkId} at ${clickData.timestamp}`);
  
  // In a real implementation, this would update the database
  // For now, we'll just log the interaction
}

/**
 * Record affiliate conversion
 */
export function recordConversion(
  linkId: string,
  conversionData: {
    orderId: string;
    revenue: number;
    commission: number;
    timestamp: Date;
    productsPurchased: string[];
  }
): void {
  console.log(`💰 Conversion recorded for link: ${linkId}, Revenue: $${conversionData.revenue}`);
  
  // Update tracking data with conversion
  // In real implementation, this would update the database
}

/**
 * Perform compliance check on affiliate link and content
 */
export function performComplianceCheck(
  affiliateUrl: string,
  content: string,
  platform: string
): {
  status: 'compliant' | 'warning' | 'violation';
  notes: string[];
  violations: ComplianceViolation[];
} {
  const notes: string[] = [];
  const violations: ComplianceViolation[] = [];
  let status: 'compliant' | 'warning' | 'violation' = 'compliant';

  // Check if URL is properly formatted Amazon affiliate link
  if (!isValidAmazonAffiliateUrl(affiliateUrl)) {
    violations.push({
      linkId: generateLinkId(),
      violationType: 'link_manipulation',
      description: 'Invalid Amazon affiliate URL format',
      severity: 'high',
      detectedAt: new Date(),
      resolved: false
    });
    status = 'violation';
  }

  // Check for proper disclosure in content
  if (!hasProperDisclosure(content)) {
    violations.push({
      linkId: generateLinkId(),
      violationType: 'missing_disclosure',
      description: 'Missing required Amazon Associates disclosure',
      severity: 'high',
      detectedAt: new Date(),
      resolved: false
    });
    status = 'violation';
  }

  // Check for prohibited content
  if (hasProhibitedContent(content)) {
    violations.push({
      linkId: generateLinkId(),
      violationType: 'prohibited_content',
      description: 'Content contains prohibited elements',
      severity: 'medium',
      detectedAt: new Date(),
      resolved: false
    });
    if (status !== 'violation') status = 'warning';
  }

  // Platform-specific compliance checks
  const platformCheck = checkPlatformCompliance(content, platform);
  if (!platformCheck.compliant) {
    notes.push(...platformCheck.issues);
    if (status === 'compliant') status = 'warning';
  }

  // Add compliance notes
  if (status === 'compliant') {
    notes.push('All compliance checks passed');
  }

  return { status, notes, violations };
}

/**
 * Generate link performance report
 */
export function generateLinkPerformanceReport(
  userId: string,
  trackingData: LinkTrackingData[],
  timeframe: 'week' | 'month' | 'quarter' = 'month'
): LinkPerformanceMetrics {
  const startDate = getStartDate(timeframe);
  const relevantData = trackingData.filter(link => 
    new Date(link.createdAt) >= startDate
  );

  const totalLinks = relevantData.length;
  const totalClicks = relevantData.reduce((sum, link) => sum + link.clicks, 0);
  const totalConversions = relevantData.reduce((sum, link) => sum + link.conversions, 0);
  const totalRevenue = relevantData.reduce((sum, link) => sum + link.revenue, 0);
  
  const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
  const averageRevenuePerClick = totalClicks > 0 ? totalRevenue / totalClicks : 0;

  // Get top performing products
  const productPerformance = relevantData
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)
    .map(link => link.productName);

  // Calculate compliance score
  const compliantLinks = relevantData.filter(link => link.complianceStatus === 'compliant').length;
  const complianceScore = totalLinks > 0 ? (compliantLinks / totalLinks) * 100 : 100;

  return {
    totalLinks,
    totalClicks,
    totalConversions,
    totalRevenue,
    conversionRate,
    averageRevenuePerClick,
    topPerformingProducts: productPerformance,
    complianceScore
  };
}

/**
 * Monitor compliance violations and generate alerts
 */
export function monitorComplianceViolations(trackingData: LinkTrackingData[]): {
  criticalViolations: ComplianceViolation[];
  warningCount: number;
  recommendedActions: string[];
} {
  const criticalViolations: ComplianceViolation[] = [];
  const warningCount = trackingData.filter(link => link.complianceStatus === 'warning').length;
  const recommendedActions: string[] = [];

  // Check for patterns of violations
  const violationLinks = trackingData.filter(link => link.complianceStatus === 'violation');
  
  if (violationLinks.length > 0) {
    recommendedActions.push('Review and fix content with compliance violations');
    recommendedActions.push('Ensure all affiliate content includes proper Amazon Associates disclosure');
  }

  if (warningCount > trackingData.length * 0.2) { // More than 20% warnings
    recommendedActions.push('Review content quality standards to reduce compliance warnings');
  }

  // Check for missing disclosures pattern
  const missingDisclosures = trackingData.filter(link => 
    link.complianceNotes.some(note => note.includes('disclosure'))
  );
  
  if (missingDisclosures.length > 0) {
    recommendedActions.push('Implement automatic disclosure insertion for all affiliate content');
  }

  return {
    criticalViolations,
    warningCount,
    recommendedActions
  };
}

/**
 * Helper functions
 */
function generateLinkId(): string {
  return 'link_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
}

function isValidAmazonAffiliateUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.includes('amazon') && 
           urlObj.searchParams.has('tag') &&
           urlObj.searchParams.get('tag')?.includes('-20'); // US affiliate tag format
  } catch {
    return false;
  }
}

function hasProperDisclosure(content: string): boolean {
  const lowerContent = content.toLowerCase();
  return lowerContent.includes('amazon associate') && 
         lowerContent.includes('qualifying purchase');
}

function hasProhibitedContent(content: string): boolean {
  const prohibitedTerms = [
    'guaranteed income',
    'get rich quick',
    'miracle cure',
    'fake review',
    'manipulated review',
    'doctor recommends',
    'medical breakthrough'
  ];
  
  const lowerContent = content.toLowerCase();
  return prohibitedTerms.some(term => lowerContent.includes(term));
}

function checkPlatformCompliance(content: string, platform: string): {
  compliant: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  const lowerPlatform = platform.toLowerCase();

  switch (lowerPlatform) {
    case 'tiktok':
    case 'instagram':
      if (!content.includes('#ad') && !content.includes('#affiliate')) {
        issues.push('Social media content should include #ad or #affiliate hashtag');
      }
      break;
    
    case 'youtube':
      if (!content.includes('description')) {
        issues.push('YouTube content should mention affiliate links in description');
      }
      break;
    
    case 'twitter':
      if (content.length > 280) {
        issues.push('Twitter content exceeds character limit');
      }
      break;
  }

  return {
    compliant: issues.length === 0,
    issues
  };
}

function getStartDate(timeframe: 'week' | 'month' | 'quarter'): Date {
  const now = new Date();
  switch (timeframe) {
    case 'week':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case 'month':
      return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    case 'quarter':
      return new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    default:
      return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  }
}

/**
 * Export tracking data for Amazon compliance review
 */
export function exportComplianceData(
  userId: string,
  trackingData: LinkTrackingData[],
  timeframe: 'month' | 'quarter' | 'year'
): {
  userId: string;
  reportPeriod: string;
  totalLinks: number;
  complianceRate: number;
  violations: ComplianceViolation[];
  linkDetails: Partial<LinkTrackingData>[];
} {
  const startDate = getStartDate(timeframe as any);
  const relevantData = trackingData.filter(link => 
    new Date(link.createdAt) >= startDate
  );

  const violations: ComplianceViolation[] = [];
  const compliantCount = relevantData.filter(link => link.complianceStatus === 'compliant').length;
  const complianceRate = relevantData.length > 0 ? (compliantCount / relevantData.length) * 100 : 100;

  return {
    userId,
    reportPeriod: `${startDate.toISOString().split('T')[0]} to ${new Date().toISOString().split('T')[0]}`,
    totalLinks: relevantData.length,
    complianceRate,
    violations,
    linkDetails: relevantData.map(link => ({
      linkId: link.linkId,
      productName: link.productName,
      platform: link.platform,
      createdAt: link.createdAt,
      complianceStatus: link.complianceStatus,
      complianceNotes: link.complianceNotes
    }))
  };
}