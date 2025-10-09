import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Cookie, X, Settings } from 'lucide-react';
import { Link } from 'wouter';
import { hasConsent, setConsent } from '@/lib/cookieConsent';

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show banner if user hasn't made a choice
    if (!hasConsent()) {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    setConsent({
      analytics: true,
      marketing: true,
    });
    setIsVisible(false);
  };

  const handleRejectAll = () => {
    setConsent({
      analytics: false,
      marketing: false,
    });
    setIsVisible(false);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 pointer-events-none"
      role="dialog"
      aria-label="Cookie consent banner"
      aria-describedby="cookie-consent-description"
    >
      <Card className="max-w-6xl mx-auto pointer-events-auto shadow-2xl border-2 bg-white dark:bg-gray-950">
        <div className="p-4 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <Cookie className="h-6 w-6 text-purple-600 dark:text-purple-400" aria-hidden="true" />
            </div>
            
            <div className="flex-1 space-y-3">
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  We value your privacy
                </h2>
                <p 
                  id="cookie-consent-description" 
                  className="text-sm text-gray-600 dark:text-gray-400"
                >
                  We use cookies to enhance your experience, analyze site traffic, and personalize content. 
                  By clicking "Accept All", you consent to our use of cookies for analytics and marketing. 
                  You can customize your preferences or reject non-essential cookies.{' '}
                  <Link href="/privacy-cookies">
                    <a className="text-purple-600 dark:text-purple-400 hover:underline font-medium">
                      Learn more
                    </a>
                  </Link>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button
                  onClick={handleAcceptAll}
                  className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-700 text-white"
                  data-testid="button-accept-all-cookies"
                >
                  Accept All
                </Button>
                
                <Button
                  onClick={handleRejectAll}
                  variant="outline"
                  className="border-gray-300 dark:border-gray-700"
                  data-testid="button-reject-all-cookies"
                >
                  Reject All
                </Button>
                
                <Link href="/cookie-preferences">
                  <Button
                    variant="ghost"
                    className="w-full sm:w-auto"
                    data-testid="button-manage-cookies"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Preferences
                  </Button>
                </Link>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              aria-label="Close cookie banner"
              data-testid="button-close-cookie-banner"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
