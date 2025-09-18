/**
 * Frontend A/B Testing Service
 * Handles variant assignment, localStorage persistence, and conversion tracking
 */

import { useState, useEffect } from 'react';
import { apiRequest } from './queryClient';

export interface ABTestAssignment {
  id: number;
  testId: string;
  variant: 'A' | 'B';
  contactId?: number;
  anonId: string;
  assignedAt: string;
}

export interface ABTestResult {
  testId: string;
  status: 'active' | 'completed';
  variants: {
    A: { assignments: number; conversions: number; conversionRate: number };
    B: { assignments: number; conversions: number; conversionRate: number };
  };
  winner?: 'A' | 'B';
  confidence?: number;
  pValue?: number;
  recommendation?: string;
}

export interface ABTestConversion {
  testId: string;
  variant: 'A' | 'B';
  conversionType: string;
  value?: number;
  metadata?: Record<string, any>;
}

class ABTestingService {
  private readonly STORAGE_KEY = 'ab_test_assignments';
  private readonly ANON_ID_KEY = 'ab_anon_id';
  private assignments: Map<string, ABTestAssignment> = new Map();

  constructor() {
    this.loadFromStorage();
    this.generateAnonId();
  }

  /**
   * Generate or retrieve anonymous ID for tracking
   */
  private generateAnonId(): string {
    let anonId = localStorage.getItem(this.ANON_ID_KEY);
    if (!anonId) {
      anonId = 'anon_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
      localStorage.setItem(this.ANON_ID_KEY, anonId);
    }
    return anonId;
  }

  /**
   * Get the current anonymous ID
   */
  getAnonId(): string {
    return localStorage.getItem(this.ANON_ID_KEY) || this.generateAnonId();
  }

  /**
   * Load assignments from localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const assignments = JSON.parse(stored) as ABTestAssignment[];
        assignments.forEach(assignment => {
          this.assignments.set(assignment.testId, assignment);
        });
      }
    } catch (error) {
      console.warn('Failed to load A/B test assignments from storage:', error);
    }
  }

  /**
   * Save assignments to localStorage
   */
  private saveToStorage(): void {
    try {
      const assignments = Array.from(this.assignments.values());
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(assignments));
    } catch (error) {
      console.warn('Failed to save A/B test assignments to storage:', error);
    }
  }

  /**
   * Get variant assignment for a test (with backend sync)
   */
  async getVariant(testId: string, contactId?: number): Promise<'A' | 'B'> {
    // Check if we already have an assignment
    const existing = this.assignments.get(testId);
    if (existing) {
      return existing.variant;
    }

    try {
      // Request assignment from backend
      const response = await apiRequest('POST', `/api/cookaing-marketing/ab/assign`, {
        testId,
        contactId,
        anonId: this.getAnonId()
      });
      
      const data = await response.json();

      if (data.success && data.data) {
        const assignment: ABTestAssignment = {
          id: data.data.assignment.id,
          testId,
          variant: data.data.assignment.variant,
          contactId,
          anonId: this.getAnonId(),
          assignedAt: new Date().toISOString()
        };

        // Store assignment locally
        this.assignments.set(testId, assignment);
        this.saveToStorage();

        console.log(`🧪 A/B Test Assignment: ${testId} → Variant ${assignment.variant}`);
        return assignment.variant;
      }
    } catch (error) {
      console.error('Failed to get A/B test assignment:', error);
    }

    // Fallback to random assignment if backend fails
    const fallbackVariant: 'A' | 'B' = Math.random() < 0.5 ? 'A' : 'B';
    console.warn(`🧪 A/B Test Fallback: ${testId} → Variant ${fallbackVariant}`);
    return fallbackVariant;
  }

  /**
   * Track conversion for an A/B test
   */
  async trackConversion(
    testId: string,
    conversionType: string,
    value?: number,
    metadata?: Record<string, any>
  ): Promise<void> {
    const assignment = this.assignments.get(testId);
    if (!assignment) {
      console.warn(`No A/B test assignment found for test: ${testId}`);
      return;
    }

    try {
      const conversion: ABTestConversion = {
        testId,
        variant: assignment.variant,
        conversionType,
        value,
        metadata: {
          ...metadata,
          anonId: this.getAnonId(),
          assignmentId: assignment.id,
          timestamp: new Date().toISOString()
        }
      };

      // Send conversion to backend
      await apiRequest('POST', `/api/cookaing-marketing/ab/convert`, conversion);

      console.log(`🎯 A/B Test Conversion: ${testId} (${assignment.variant}) → ${conversionType}`, { value, metadata });
    } catch (error) {
      console.error('Failed to track A/B test conversion:', error);
    }
  }

  /**
   * Get test results from backend
   */
  async getTestResults(testId: string): Promise<ABTestResult | null> {
    try {
      const response = await apiRequest('GET', `/api/cookaing-marketing/ab/test/${testId}`);
      const data = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
      console.error('Failed to get A/B test results:', error);
      return null;
    }
  }

  /**
   * Get all active tests
   */
  async getActiveTests(): Promise<ABTestResult[]> {
    try {
      const response = await apiRequest('GET', `/api/cookaing-marketing/ab/tests`);
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('Failed to get active A/B tests:', error);
      return [];
    }
  }

  /**
   * Check if user is in a specific variant for a test
   */
  isInVariant(testId: string, variant: 'A' | 'B'): boolean {
    const assignment = this.assignments.get(testId);
    return assignment?.variant === variant;
  }

  /**
   * Get current assignment for a test (synchronous)
   */
  getCurrentAssignment(testId: string): ABTestAssignment | null {
    return this.assignments.get(testId) || null;
  }

  /**
   * Clear all assignments (for testing/debug)
   */
  clearAssignments(): void {
    this.assignments.clear();
    localStorage.removeItem(this.STORAGE_KEY);
    console.log('🧹 Cleared all A/B test assignments');
  }

  /**
   * Get assignment summary for debugging
   */
  getAssignmentSummary(): Record<string, string> {
    const summary: Record<string, string> = {};
    this.assignments.forEach((assignment, testId) => {
      summary[testId] = assignment.variant;
    });
    return summary;
  }
}

// Export singleton instance
export const abTestingService = new ABTestingService();

// Export React hook for easy component integration
export function useABTest(testId: string, contactId?: number) {
  const [variant, setVariant] = useState<'A' | 'B' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function assignVariant() {
      try {
        const assignedVariant = await abTestingService.getVariant(testId, contactId);
        setVariant(assignedVariant);
      } catch (error) {
        console.error('Failed to assign A/B test variant:', error);
        setVariant('A'); // Default fallback
      } finally {
        setLoading(false);
      }
    }

    // Check for existing assignment first
    const existing = abTestingService.getCurrentAssignment(testId);
    if (existing) {
      setVariant(existing.variant);
      setLoading(false);
    } else {
      assignVariant();
    }
  }, [testId, contactId]);

  const trackConversion = (conversionType: string, value?: number, metadata?: Record<string, any>) => {
    return abTestingService.trackConversion(testId, conversionType, value, metadata);
  };

  return {
    variant,
    loading,
    trackConversion,
    isVariantA: variant === 'A',
    isVariantB: variant === 'B'
  };
}

// Export utility functions
export { ABTestingService };