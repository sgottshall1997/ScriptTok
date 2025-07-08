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
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// Track content generation events
export const trackContentGeneration = (data: {
  productName: string;
  niche: string;
  platforms: string[];
  tone: string;
  templateType: string;
}) => {
  trackEvent('content_generated', 'content', `${data.niche}_${data.templateType}`, 1);
  trackEvent('platform_selection', 'content', data.platforms.join(','), data.platforms.length);
};

// Track affiliate link clicks
export const trackAffiliateClick = (productName: string, platform: string) => {
  trackEvent('affiliate_click', 'monetization', `${platform}_${productName}`, 1);
};

// Track trending product interactions
export const trackTrendingProductClick = (productName: string, niche: string) => {
  trackEvent('trending_product_click', 'research', `${niche}_${productName}`, 1);
};

// Track bulk generation
export const trackBulkGeneration = (data: {
  jobType: 'manual' | 'automated';
  productCount: number;
  platforms: string[];
  niches: string[];
}) => {
  trackEvent('bulk_generation', 'automation', data.jobType, data.productCount);
  trackEvent('bulk_platforms', 'automation', data.platforms.join(','), data.platforms.length);
};