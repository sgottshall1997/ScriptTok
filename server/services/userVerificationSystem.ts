/**
 * User Verification System for Amazon Associates Compliance
 * Ensures users can be verified for compliance upon Amazon's request
 */

import { z } from 'zod';

export interface UserVerificationData {
  userId: string;
  email: string;
  websiteUrl?: string;
  socialMediaHandles?: string[];
  amazonAssociateId?: string;
  businessName?: string;
  taxId?: string;
  phoneNumber?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  verificationStatus: 'pending' | 'verified' | 'rejected';
  complianceAgreementAccepted: boolean;
  lastComplianceCheck: Date;
  affiliatePrograms: string[];
}

export interface ComplianceReport {
  userId: string;
  reportDate: Date;
  contentGenerated: number;
  affiliateLinksUsed: number;
  disclosuresPresent: number;
  policyViolations: string[];
  lastAuditDate: Date;
  complianceScore: number;
}

/**
 * User verification schema for data validation
 */
export const userVerificationSchema = z.object({
  email: z.string().email(),
  websiteUrl: z.string().url().optional(),
  socialMediaHandles: z.array(z.string()).optional(),
  amazonAssociateId: z.string().optional(),
  businessName: z.string().optional(),
  taxId: z.string().optional(),
  phoneNumber: z.string().optional(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string()
  }).optional(),
  complianceAgreementAccepted: z.boolean(),
  affiliatePrograms: z.array(z.string())
});

/**
 * Generate compliance report for a user
 */
export function generateComplianceReport(
  userId: string,
  contentHistory: any[],
  timeframe: 'month' | 'quarter' | 'year' = 'month'
): ComplianceReport {
  const now = new Date();
  const startDate = getStartDate(timeframe);
  
  // Filter content within timeframe
  const relevantContent = contentHistory.filter(content => 
    new Date(content.createdAt) >= startDate
  );

  const contentGenerated = relevantContent.length;
  const affiliateLinksUsed = relevantContent.filter(content => 
    content.affiliateLink && content.affiliateLink.length > 0
  ).length;
  
  const disclosuresPresent = relevantContent.filter(content =>
    hasProperDisclosure(content.content)
  ).length;

  // Check for policy violations
  const policyViolations: string[] = [];
  relevantContent.forEach(content => {
    if (content.affiliateLink && !hasProperDisclosure(content.content)) {
      policyViolations.push(`Missing disclosure in content ${content.id}`);
    }
    
    if (hasProhibitedContent(content.content)) {
      policyViolations.push(`Policy violation in content ${content.id}`);
    }
  });

  // Calculate compliance score (0-100)
  let complianceScore = 100;
  if (contentGenerated > 0) {
    const disclosureRate = disclosuresPresent / Math.max(affiliateLinksUsed, 1);
    complianceScore = Math.max(0, Math.round(disclosureRate * 100 - (policyViolations.length * 10)));
  }

  return {
    userId,
    reportDate: now,
    contentGenerated,
    affiliateLinksUsed,
    disclosuresPresent,
    policyViolations,
    lastAuditDate: now,
    complianceScore
  };
}

/**
 * Verify user eligibility for Amazon Associates program
 */
export function verifyUserEligibility(userData: UserVerificationData): {
  eligible: boolean;
  issues: string[];
  recommendations: string[];
} {
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Check required fields
  if (!userData.email) {
    issues.push('Email address is required');
  }

  if (!userData.complianceAgreementAccepted) {
    issues.push('Must accept compliance agreement');
  }

  // Check website or social media presence
  if (!userData.websiteUrl && (!userData.socialMediaHandles || userData.socialMediaHandles.length === 0)) {
    issues.push('Must have either a website or social media presence');
    recommendations.push('Add your website URL or social media handles');
  }

  // Validate Amazon Associate ID format if provided
  if (userData.amazonAssociateId && !isValidAmazonAssociateId(userData.amazonAssociateId)) {
    issues.push('Invalid Amazon Associate ID format');
    recommendations.push('Amazon Associate ID should be in format: yourname-20');
  }

  // Check business information for tax compliance
  if (!userData.businessName && !userData.taxId) {
    recommendations.push('Consider providing business information for tax compliance');
  }

  // Address verification for international compliance
  if (!userData.address) {
    recommendations.push('Provide address information for international compliance');
  }

  return {
    eligible: issues.length === 0,
    issues,
    recommendations
  };
}

/**
 * Create verification checklist for new users
 */
export function createVerificationChecklist(userData: Partial<UserVerificationData>): {
  item: string;
  completed: boolean;
  required: boolean;
  description: string;
}[] {
  return [
    {
      item: 'Email Verification',
      completed: !!userData.email,
      required: true,
      description: 'Valid email address for account verification'
    },
    {
      item: 'Website/Social Media',
      completed: !!(userData.websiteUrl || userData.socialMediaHandles?.length),
      required: true,
      description: 'Website URL or social media handles where content will be published'
    },
    {
      item: 'Amazon Associate ID',
      completed: !!userData.amazonAssociateId,
      required: false,
      description: 'Your Amazon Associates affiliate ID (format: yourname-20)'
    },
    {
      item: 'Compliance Agreement',
      completed: !!userData.complianceAgreementAccepted,
      required: true,
      description: 'Accept terms and compliance requirements'
    },
    {
      item: 'Business Information',
      completed: !!(userData.businessName || userData.taxId),
      required: false,
      description: 'Business name or tax ID for compliance records'
    },
    {
      item: 'Contact Information',
      completed: !!(userData.phoneNumber && userData.address),
      required: false,
      description: 'Phone and address for verification purposes'
    }
  ];
}

/**
 * Helper functions
 */
function getStartDate(timeframe: 'month' | 'quarter' | 'year'): Date {
  const now = new Date();
  switch (timeframe) {
    case 'month':
      return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    case 'quarter':
      return new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    case 'year':
      return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    default:
      return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
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
    'manipulated review'
  ];
  
  const lowerContent = content.toLowerCase();
  return prohibitedTerms.some(term => lowerContent.includes(term));
}

function isValidAmazonAssociateId(associateId: string): boolean {
  // Amazon Associate IDs typically end with -20 (for US) or other country codes
  const pattern = /^[a-zA-Z0-9]+-\d{2}$/;
  return pattern.test(associateId);
}

/**
 * Generate verification token for email verification
 */
export function generateVerificationToken(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * Validate verification token
 */
export function validateVerificationToken(token: string, storedToken: string): boolean {
  return token === storedToken;
}