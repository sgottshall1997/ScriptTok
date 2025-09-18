/**
 * Attribution Tracking Service
 * Captures UTM parameters and manages first-touch/last-touch attribution
 */

import { useState, useEffect } from 'react';
import { apiRequest } from './queryClient';

export interface UTMParameters {
  utmSource?: string;
  utmMedium?: string; 
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  gclid?: string; // Google Ads click ID
  fbclid?: string; // Facebook click ID
}

export interface AttributionData extends UTMParameters {
  landingPage: string;
  referrer: string;
  timestamp: string;
  sessionId: string;
}

export interface ContactAttribution {
  contactId?: number;
  email?: string;
  firstTouch: AttributionData;
  lastTouch: AttributionData;
  touchCount: number;
  lastUpdated: string;
}

class AttributionTrackingService {
  private readonly STORAGE_KEY = 'attribution_data';
  private readonly SESSION_KEY = 'attribution_session';
  private readonly FIRST_TOUCH_KEY = 'first_touch_attribution';
  private readonly CONTACT_ATTRIBUTION_KEY = 'contact_attribution';

  constructor() {
    this.initializeTracking();
  }

  /**
   * Initialize attribution tracking on page load
   */
  private initializeTracking(): void {
    // Only run in browser environment
    if (typeof window === 'undefined') return;

    // Generate or get session ID
    const sessionId = this.getOrCreateSessionId();

    // Capture current page attribution
    const currentAttribution = this.captureCurrentAttribution(sessionId);

    // Update first-touch if this is the first visit
    this.updateFirstTouchAttribution(currentAttribution);

    // Always update last-touch
    this.updateLastTouchAttribution(currentAttribution);

    console.log('🎯 Attribution captured:', currentAttribution);
  }

  /**
   * Generate or retrieve session ID
   */
  private getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem(this.SESSION_KEY);
    if (!sessionId) {
      sessionId = 'sess_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
      sessionStorage.setItem(this.SESSION_KEY, sessionId);
    }
    return sessionId;
  }

  /**
   * Extract UTM parameters from URL including Google and Facebook click IDs
   */
  private extractUTMParameters(): UTMParameters {
    if (typeof window === 'undefined') return {};

    const urlParams = new URLSearchParams(window.location.search);
    
    return {
      utmSource: urlParams.get('utm_source') || undefined,
      utmMedium: urlParams.get('utm_medium') || undefined,
      utmCampaign: urlParams.get('utm_campaign') || undefined,
      utmTerm: urlParams.get('utm_term') || undefined,
      utmContent: urlParams.get('utm_content') || undefined,
      gclid: urlParams.get('gclid') || undefined, // Google Ads click ID
      fbclid: urlParams.get('fbclid') || undefined, // Facebook click ID
    };
  }

  /**
   * Capture current attribution data
   */
  private captureCurrentAttribution(sessionId: string): AttributionData {
    const utmParams = this.extractUTMParameters();
    
    return {
      ...utmParams,
      landingPage: window.location.href,
      referrer: document.referrer || 'direct',
      timestamp: new Date().toISOString(),
      sessionId
    };
  }

  /**
   * Update first-touch attribution (only if not set)
   */
  private updateFirstTouchAttribution(attribution: AttributionData): void {
    const existing = localStorage.getItem(this.FIRST_TOUCH_KEY);
    if (!existing) {
      localStorage.setItem(this.FIRST_TOUCH_KEY, JSON.stringify(attribution));
      console.log('🎯 First-touch attribution set:', attribution);
    }
  }

  /**
   * Update last-touch attribution (always updated)
   */
  private updateLastTouchAttribution(attribution: AttributionData): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(attribution));
    console.log('🎯 Last-touch attribution updated:', attribution);
  }

  /**
   * Get current attribution data
   */
  getAttribution(): {
    firstTouch: AttributionData | null;
    lastTouch: AttributionData | null;
  } {
    try {
      const firstTouch = localStorage.getItem(this.FIRST_TOUCH_KEY);
      const lastTouch = localStorage.getItem(this.STORAGE_KEY);

      return {
        firstTouch: firstTouch ? JSON.parse(firstTouch) : null,
        lastTouch: lastTouch ? JSON.parse(lastTouch) : null
      };
    } catch (error) {
      console.warn('Failed to get attribution data:', error);
      return { firstTouch: null, lastTouch: null };
    }
  }

  /**
   * Associate attribution with a contact
   */
  async associateWithContact(contactId: number, email?: string): Promise<void> {
    const attribution = this.getAttribution();
    
    if (!attribution.firstTouch || !attribution.lastTouch) {
      console.warn('No attribution data available to associate with contact');
      return;
    }

    try {
      // Update contact with attribution data
      await apiRequest('PUT', `/api/contacts/${contactId}/attribution`, {
        firstTouchUtmSource: attribution.firstTouch.utmSource,
        firstTouchUtmMedium: attribution.firstTouch.utmMedium,
        firstTouchUtmCampaign: attribution.firstTouch.utmCampaign,
        firstTouchUtmTerm: attribution.firstTouch.utmTerm,
        firstTouchUtmContent: attribution.firstTouch.utmContent,
        firstTouchGclid: attribution.firstTouch.gclid,
        firstTouchFbclid: attribution.firstTouch.fbclid,
        lastTouchUtmSource: attribution.lastTouch.utmSource,
        lastTouchUtmMedium: attribution.lastTouch.utmMedium,
        lastTouchUtmCampaign: attribution.lastTouch.utmCampaign,
        lastTouchUtmTerm: attribution.lastTouch.utmTerm,
        lastTouchUtmContent: attribution.lastTouch.utmContent,
        lastTouchGclid: attribution.lastTouch.gclid,
        lastTouchFbclid: attribution.lastTouch.fbclid,
      });

      // Store contact attribution data locally
      const contactAttribution: ContactAttribution = {
        contactId,
        email,
        firstTouch: attribution.firstTouch,
        lastTouch: attribution.lastTouch,
        touchCount: this.getTouchCount() + 1,
        lastUpdated: new Date().toISOString()
      };

      localStorage.setItem(this.CONTACT_ATTRIBUTION_KEY, JSON.stringify(contactAttribution));
      
      console.log('🎯 Attribution associated with contact:', contactId, contactAttribution);
    } catch (error) {
      console.error('Failed to associate attribution with contact:', error);
    }
  }

  /**
   * Track a conversion event with attribution
   */
  async trackConversion(
    conversionType: string, 
    value?: number, 
    metadata?: Record<string, any>
  ): Promise<void> {
    const attribution = this.getAttribution();
    
    try {
      await apiRequest('POST', `/api/cookaing-marketing/conversions`, {
        conversionType,
        value,
        firstTouchAttribution: attribution.firstTouch,
        lastTouchAttribution: attribution.lastTouch,
        metadata: {
          ...metadata,
          sessionId: this.getOrCreateSessionId(),
          timestamp: new Date().toISOString()
        }
      });

      console.log('🎯 Conversion tracked with attribution:', { conversionType, value, attribution });
    } catch (error) {
      console.error('Failed to track conversion:', error);
    }
  }

  /**
   * Get touch count (number of sessions)
   */
  private getTouchCount(): number {
    try {
      const contactAttribution = localStorage.getItem(this.CONTACT_ATTRIBUTION_KEY);
      return contactAttribution ? JSON.parse(contactAttribution).touchCount || 0 : 0;
    } catch {
      return 0;
    }
  }

  /**
   * Get contact attribution data
   */
  getContactAttribution(): ContactAttribution | null {
    try {
      const stored = localStorage.getItem(this.CONTACT_ATTRIBUTION_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn('Failed to get contact attribution:', error);
      return null;
    }
  }

  /**
   * Clear attribution data (for testing)
   */
  clearAttribution(): void {
    localStorage.removeItem(this.FIRST_TOUCH_KEY);
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.CONTACT_ATTRIBUTION_KEY);
    sessionStorage.removeItem(this.SESSION_KEY);
    console.log('🧹 Attribution data cleared');
  }

  /**
   * Get attribution summary for debugging
   */
  getAttributionSummary(): {
    firstTouch: AttributionData | null;
    lastTouch: AttributionData | null;
    contact: ContactAttribution | null;
    hasUTMParams: boolean;
  } {
    const attribution = this.getAttribution();
    const contact = this.getContactAttribution();
    const hasUTMParams = !!(attribution.lastTouch?.utmSource || attribution.lastTouch?.utmMedium);

    return {
      firstTouch: attribution.firstTouch,
      lastTouch: attribution.lastTouch,
      contact,
      hasUTMParams
    };
  }

  /**
   * Check if user came from a specific source
   */
  isFromSource(source: string): boolean {
    const attribution = this.getAttribution();
    return attribution.firstTouch?.utmSource === source || attribution.lastTouch?.utmSource === source;
  }

  /**
   * Check if user came from a specific campaign
   */
  isFromCampaign(campaign: string): boolean {
    const attribution = this.getAttribution();
    return attribution.firstTouch?.utmCampaign === campaign || attribution.lastTouch?.utmCampaign === campaign;
  }
}

// Export singleton instance
export const attributionService = new AttributionTrackingService();

// React hook for attribution data
export function useAttribution() {
  const [attribution, setAttribution] = useState<{
    firstTouch: AttributionData | null;
    lastTouch: AttributionData | null;
  }>({ firstTouch: null, lastTouch: null });

  const [contactAttribution, setContactAttribution] = useState<ContactAttribution | null>(null);

  useEffect(() => {
    const currentAttribution = attributionService.getAttribution();
    const currentContactAttribution = attributionService.getContactAttribution();
    
    setAttribution(currentAttribution);
    setContactAttribution(currentContactAttribution);
  }, []);

  const associateWithContact = async (contactId: number, email?: string) => {
    await attributionService.associateWithContact(contactId, email);
    setContactAttribution(attributionService.getContactAttribution());
  };

  const trackConversion = (conversionType: string, value?: number, metadata?: Record<string, any>) => {
    return attributionService.trackConversion(conversionType, value, metadata);
  };

  return {
    attribution,
    contactAttribution,
    associateWithContact,
    trackConversion,
    isFromSource: attributionService.isFromSource.bind(attributionService),
    isFromCampaign: attributionService.isFromCampaign.bind(attributionService),
    getAttributionSummary: attributionService.getAttributionSummary.bind(attributionService)
  };
}

export { AttributionTrackingService };