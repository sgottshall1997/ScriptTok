import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

// Attribution middleware to capture UTM parameters and track user attribution
export interface AttributionData {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  gclid?: string; // Google Ads click ID
  fbclid?: string; // Facebook click ID
  landingPage: string;
  referrer: string;
  userAgent: string;
  ipAddress: string;
}

// Middleware to capture attribution data from requests
export function captureAttribution(req: Request, res: Response, next: NextFunction) {
  try {
    // Extract UTM parameters from query string
    const utmData: AttributionData = {
      utmSource: req.query.utm_source as string,
      utmMedium: req.query.utm_medium as string,
      utmCampaign: req.query.utm_campaign as string,
      utmTerm: req.query.utm_term as string,
      utmContent: req.query.utm_content as string,
      gclid: req.query.gclid as string,
      fbclid: req.query.fbclid as string,
      landingPage: req.get('referer') || req.originalUrl,
      referrer: req.get('referer') || 'direct',
      userAgent: req.get('user-agent') || 'unknown',
      ipAddress: req.ip || req.connection.remoteAddress || 'unknown'
    };

    // Filter out undefined values
    const cleanUtmData = Object.fromEntries(
      Object.entries(utmData).filter(([_, value]) => value !== undefined)
    ) as AttributionData;

    // Store attribution data in request for later use
    (req as any).attribution = cleanUtmData;

    // Log attribution capture if there are UTM parameters
    if (Object.keys(cleanUtmData).some(key => key.startsWith('utm') || key === 'gclid' || key === 'fbclid')) {
      console.log('🎯 Attribution captured:', {
        source: cleanUtmData.utmSource,
        medium: cleanUtmData.utmMedium,
        campaign: cleanUtmData.utmCampaign,
        page: cleanUtmData.landingPage
      });

      // Track attribution event in analytics (orgId will be set properly in route)
      const orgId = (req as any).orgId || 1; // Use orgId from request context if available
      trackAttributionEvent(cleanUtmData, orgId).catch(error => {
        console.warn('Failed to track attribution event:', error);
      });
    }

    next();
  } catch (error) {
    console.warn('Attribution middleware error:', error);
    next(); // Continue processing even if attribution fails
  }
}

// Track attribution event in analytics
async function trackAttributionEvent(attributionData: AttributionData, orgId: number = 1) {
  try {
    await storage.createAnalyticsEvent({
      orgId,
      eventType: 'attribution_captured',
      entityType: 'attribution',
      entityId: 0,
      metaJson: {
        ...attributionData,
        capturedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Failed to store attribution event:', error);
  }
}

// Helper function to update contact attribution after contact is created/found
export async function applyContactAttribution(contactId: number, attributionData: AttributionData, orgId: number) {
  try {
    console.log(`🎯 Applying attribution to contact ${contactId}`);
    
    // Get the contact to check current attribution status
    const contact = await storage.getContact(contactId);
    if (!contact) {
      console.warn(`Contact ${contactId} not found for attribution update`);
      return;
    }

    // Determine if this is first touch or last touch
    const isFirstTouch = !contact.metaJson?.attribution?.firstTouch?.touchAt;
    const touchType = isFirstTouch ? 'first' : 'last';
    
    // Prepare attribution update in metaJson format (safer than dedicated columns)
    const currentAttribution = contact.metaJson?.attribution || {};
    const updatedAttribution = { ...currentAttribution };
    
    if (touchType === 'first') {
      // Set first touch data (only if meaningful attribution data exists)
      const hasAttribution = attributionData.utmSource || attributionData.gclid || attributionData.fbclid;
      if (hasAttribution) {
        updatedAttribution.firstTouch = {
          utmSource: attributionData.utmSource,
          utmMedium: attributionData.utmMedium,
          utmCampaign: attributionData.utmCampaign,
          utmTerm: attributionData.utmTerm,
          utmContent: attributionData.utmContent,
          gclid: attributionData.gclid,
          fbclid: attributionData.fbclid,
          landingPage: attributionData.landingPage,
          referrer: attributionData.referrer,
          touchAt: new Date().toISOString()
        };
      }
    }
    
    // Update last touch data only if meaningful attribution exists
    const hasAttribution = attributionData.utmSource || attributionData.gclid || attributionData.fbclid;
    if (hasAttribution) {
      updatedAttribution.lastTouch = {
        utmSource: attributionData.utmSource,
        utmMedium: attributionData.utmMedium,
        utmCampaign: attributionData.utmCampaign,
        utmTerm: attributionData.utmTerm,
        utmContent: attributionData.utmContent,
        gclid: attributionData.gclid,
        fbclid: attributionData.fbclid,
        landingPage: attributionData.landingPage,
        referrer: attributionData.referrer,
        touchAt: new Date().toISOString()
      };
    }

    // Update contact with attribution in metaJson
    await storage.updateContact(contact.id, {
      metaJson: {
        ...contact.metaJson,
        attribution: updatedAttribution
      }
    });
    
    console.log(`✅ Applied ${touchType} touch attribution to contact ${contact.id}`);

    // Track attribution update event with proper orgId
    await storage.createAnalyticsEvent({
      orgId,
      eventType: 'contact_attribution_updated',
      entityType: 'contact',
      entityId: contact.id,
      contactId: contact.id,
      metaJson: {
        touchType,
        ...attributionData,
        updatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error applying contact attribution:', error);
  }
}

// Simple middleware that just captures attribution data (removed brittle res.send wrapper)
export function trackAttribution(req: Request, res: Response, next: NextFunction) {
  // Just call captureAttribution - no need for separate middleware
  captureAttribution(req, res, next);
}

// Helper function to extract attribution from UTM data for API use
export function extractAttributionFromUtm(utmData: any): AttributionData | null {
  if (!utmData || typeof utmData !== 'object') {
    return null;
  }

  return {
    utmSource: utmData.utm_source,
    utmMedium: utmData.utm_medium,
    utmCampaign: utmData.utm_campaign,
    utmTerm: utmData.utm_term,
    utmContent: utmData.utm_content,
    gclid: utmData.gclid,
    fbclid: utmData.fbclid,
    landingPage: utmData.landing_page || 'unknown',
    referrer: utmData.referrer || 'unknown',
    userAgent: utmData.user_agent || 'unknown',
    ipAddress: utmData.ip_address || 'unknown'
  };
}