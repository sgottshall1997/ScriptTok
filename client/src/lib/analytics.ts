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

// Track niche selection events
export const trackNicheSelection = (niche: string) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', 'select_niche', {
    event_category: 'niche_interaction',
    event_label: niche,
  });
};

// Track template selection events
export const trackTemplateSelection = (templateType: string, niche: string) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', 'select_template', {
    event_category: 'content_generation',
    event_label: templateType,
    niche: niche
  });
};

// Track tone selection events
export const trackToneSelection = (tone: string, niche: string) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', 'select_tone', {
    event_category: 'content_generation',
    event_label: tone,
    niche: niche
  });
};

// Track content generation events
export const trackContentGeneration = (
  niche: string,
  templateType: string,
  tone: string,
  productName: string,
  contentLength: number
) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', 'generate_content', {
    event_category: 'content_generation',
    event_label: `${niche}/${templateType}`,
    niche: niche,
    template_type: templateType,
    tone: tone,
    product_name: productName,
    content_length: contentLength
  });
};

// Generic event tracking
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