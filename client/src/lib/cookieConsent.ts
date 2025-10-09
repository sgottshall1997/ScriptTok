export interface CookieConsent {
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
}

export const COOKIE_CONSENT_KEY = 'pheme-cookie-consent';

export function getConsent(): CookieConsent | null {
  try {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error reading cookie consent:', error);
    return null;
  }
}

export function setConsent(consent: Omit<CookieConsent, 'timestamp'>): void {
  const consentWithTimestamp: CookieConsent = {
    ...consent,
    timestamp: Date.now(),
  };
  
  localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consentWithTimestamp));
  
  // Apply consent immediately
  applyConsent(consentWithTimestamp);
}

export function hasConsent(): boolean {
  return getConsent() !== null;
}

export function applyConsent(consent: CookieConsent): void {
  // Handle Google Analytics
  if (window.gtag) {
    window.gtag('consent', 'update', {
      'analytics_storage': consent.analytics ? 'granted' : 'denied',
      'ad_storage': consent.marketing ? 'granted' : 'denied',
    });
  }

  // Reload tracking scripts if consent is granted
  if (consent.analytics) {
    loadAnalyticsScripts();
  }

  if (consent.marketing) {
    loadMarketingScripts();
  }
}

export function revokeConsent(): void {
  localStorage.removeItem(COOKIE_CONSENT_KEY);
  
  // Clear tracking cookies
  clearCookies();
  
  // Update consent to denied
  if (window.gtag) {
    window.gtag('consent', 'update', {
      'analytics_storage': 'denied',
      'ad_storage': 'denied',
    });
  }
}

export function clearCookies(): void {
  const cookies = document.cookie.split(';');
  
  for (const cookie of cookies) {
    const [name] = cookie.split('=');
    const trimmedName = name.trim();
    
    // Don't clear essential cookies (authentication, session)
    if (isEssentialCookie(trimmedName)) {
      continue;
    }
    
    // Clear the cookie
    document.cookie = `${trimmedName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    document.cookie = `${trimmedName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
  }
}

function isEssentialCookie(name: string): boolean {
  const essentialPrefixes = ['connect.sid', 'session', 'auth', 'csrf'];
  return essentialPrefixes.some(prefix => name.startsWith(prefix));
}

function loadAnalyticsScripts(): void {
  // Check if Google Analytics is already loaded
  if (document.querySelector('script[data-consent="analytics"]')) {
    return;
  }

  const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-5X9BXBQ6G4';
  
  // Load GA script
  const gaScript = document.createElement('script');
  gaScript.async = true;
  gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  gaScript.setAttribute('data-consent', 'analytics');
  document.head.appendChild(gaScript);

  // Initialize GA
  const gaInitScript = document.createElement('script');
  gaInitScript.setAttribute('data-consent', 'analytics');
  gaInitScript.textContent = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${gaId}');
  `;
  document.head.appendChild(gaInitScript);
}

function loadMarketingScripts(): void {
  // Check if marketing scripts are already loaded
  if (document.querySelector('script[data-consent="marketing"]')) {
    return;
  }

  // Load Meta Pixel
  const fbScript = document.createElement('script');
  fbScript.setAttribute('data-consent', 'marketing');
  fbScript.textContent = `
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '2020281348723418');
    fbq('track', 'PageView');
  `;
  document.head.appendChild(fbScript);

  // Load TikTok Pixel
  const ttScript = document.createElement('script');
  ttScript.setAttribute('data-consent', 'marketing');
  ttScript.textContent = `
    !function (w, d, t) {
      w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
      ttq.load('D3JVFLRC77U0EI1CV6H0');
      ttq.page();
    }(window, document, 'ttq');
  `;
  document.head.appendChild(ttScript);
}

// Initialize consent on page load
export function initializeConsent(): void {
  const consent = getConsent();
  if (consent) {
    applyConsent(consent);
  } else {
    // Default to denied until user makes a choice
    if (window.gtag) {
      window.gtag('consent', 'default', {
        'analytics_storage': 'denied',
        'ad_storage': 'denied',
      });
    }
  }
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    gtag?: (
      command: 'consent' | 'config' | 'event' | 'js',
      action: string,
      params?: Record<string, string>
    ) => void;
    dataLayer?: any[];
    fbq?: any;
    ttq?: any;
  }
}
