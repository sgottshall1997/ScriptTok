// Define the gtag function globally
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

// Initialize Google Analytics
export const initGA = () => {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

  if (!measurementId) {
    console.warn('Missing required Google Analytics key: VITE_GA_MEASUREMENT_ID');
    console.info('Add your GA Measurement ID to Replit Secrets with key VITE_GA_MEASUREMENT_ID');
    return;
  }

  // Add Google Analytics script to the head
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script1);

  // Initialize gtag
  const script2 = document.createElement('script');
  script2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${measurementId}');
  `;
  document.head.appendChild(script2);
};

// Track page views - useful for single-page applications
export const trackPageView = (url: string) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (!measurementId) return;
  
  window.gtag('config', measurementId, {
    page_path: url
  });
};

// Track events
export const trackEvent = (
  action: string, 
  category?: string, 
  label?: string, 
  value?: number
) => {
  if (typeof window === 'undefined' || !window.gtag) {
    console.log('Analytics not initialized or window not available');
    return;
  }
  
  try {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  } catch (error) {
    console.warn('Failed to track event:', error);
  }
};

export const trackSignup = (method?: string, location?: string) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  try {
    window.gtag('event', 'sign_up', {
      method: method || 'email',
      event_category: 'engagement',
      event_label: location,
    });
  } catch (error) {
    console.warn('Failed to track signup:', error);
  }
};

export const trackUpgrade = (plan: 'pro' | 'creator', location?: string) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  try {
    window.gtag('event', 'purchase', {
      event_category: 'conversion',
      event_label: location,
      value: plan === 'pro' ? 29 : 59,
      items: [{
        item_id: `plan_${plan}`,
        item_name: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`,
        item_category: 'subscription',
        price: plan === 'pro' ? 29 : 59,
      }],
    });
  } catch (error) {
    console.warn('Failed to track upgrade:', error);
  }
};

export const trackGeneration = (type: 'viral' | 'affiliate', niche?: string) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  try {
    window.gtag('event', 'generate_content', {
      event_category: 'engagement',
      event_label: `${type}_${niche || 'general'}`,
      content_type: type,
      niche: niche,
    });
  } catch (error) {
    console.warn('Failed to track generation:', error);
  }
};

export const trackCTAClick = (
  ctaName: string,
  location: string,
  metadata?: Record<string, any>
) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  try {
    window.gtag('event', 'cta_click', {
      event_category: 'cta',
      event_label: `${ctaName}_${location}`,
      cta_name: ctaName,
      cta_location: location,
      ...metadata,
    });
  } catch (error) {
    console.warn('Failed to track CTA click:', error);
  }
};