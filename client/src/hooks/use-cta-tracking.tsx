import { useLocation } from 'wouter';
import { useCallback } from 'react';
import { trackCTAClick } from '../lib/analytics';
import { CTAMetadata, CTAType } from '../lib/conversion-events';

export function useCTATracking() {
  const [location] = useLocation();

  const trackCTA = useCallback(
    (ctaName: string, ctaLocation: string, metadata?: CTAMetadata) => {
      const enrichedMetadata: CTAMetadata = {
        ...metadata,
        ctaLocation,
        pageLocation: location,
        timestamp: new Date().toISOString(),
      };

      trackCTAClick(ctaName, ctaLocation, enrichedMetadata);
    },
    [location]
  );

  const trackSignupCTA = useCallback(
    (ctaLocation: string, method?: string) => {
      trackCTA('signup', ctaLocation, {
        ctaType: 'signup' as CTAType,
        method,
      });
    },
    [trackCTA]
  );

  const trackUpgradeCTA = useCallback(
    (ctaLocation: string, plan?: 'pro' | 'creator') => {
      trackCTA('upgrade', ctaLocation, {
        ctaType: 'upgrade' as CTAType,
        plan,
      });
    },
    [trackCTA]
  );

  const trackGenerateCTA = useCallback(
    (ctaLocation: string, type?: 'viral' | 'affiliate', niche?: string) => {
      trackCTA('generate', ctaLocation, {
        ctaType: 'generate' as CTAType,
        generationType: type,
        niche,
      });
    },
    [trackCTA]
  );

  const trackNavigateCTA = useCallback(
    (ctaLocation: string, destination: string) => {
      trackCTA('navigate', ctaLocation, {
        ctaType: 'navigate' as CTAType,
        destination,
      });
    },
    [trackCTA]
  );

  return {
    trackCTA,
    trackSignupCTA,
    trackUpgradeCTA,
    trackGenerateCTA,
    trackNavigateCTA,
  };
}
