import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Link } from "wouter";
import { 
  ArrowLeft, 
  Cookie, 
  Shield, 
  BarChart3, 
  Settings, 
  CheckCircle, 
  Trash2, 
  AlertTriangle 
} from 'lucide-react';
import { 
  getConsent, 
  setConsent, 
  revokeConsent, 
  clearCookies,
  type CookieConsent 
} from '@/lib/cookieConsent';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const CookiePreferencesPage = () => {
  const [preferences, setPreferences] = useState({
    analytics: false,
    marketing: false,
  });
  
  const [saved, setSaved] = useState(false);
  const [currentConsent, setCurrentConsent] = useState<CookieConsent | null>(null);

  useEffect(() => {
    const consent = getConsent();
    setCurrentConsent(consent);
    if (consent) {
      setPreferences({
        analytics: consent.analytics,
        marketing: consent.marketing,
      });
    }
  }, []);

  const handlePreferenceChange = (key: 'analytics' | 'marketing', value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const savePreferences = () => {
    setConsent(preferences);
    setCurrentConsent({ ...preferences, timestamp: Date.now() });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    window.location.reload();
  };

  const acceptAll = () => {
    const allAccepted = {
      analytics: true,
      marketing: true,
    };
    setPreferences(allAccepted);
    setConsent(allAccepted);
    setCurrentConsent({ ...allAccepted, timestamp: Date.now() });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    window.location.reload();
  };

  const rejectAll = () => {
    const onlyEssential = {
      analytics: false,
      marketing: false,
    };
    setPreferences(onlyEssential);
    setConsent(onlyEssential);
    setCurrentConsent({ ...onlyEssential, timestamp: Date.now() });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    window.location.reload();
  };

  const handleClearAllCookies = () => {
    revokeConsent();
    setPreferences({ analytics: false, marketing: false });
    setCurrentConsent(null);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      window.location.reload();
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        
        <div className="text-center space-y-4">
          <Link href="/">
            <Button variant="outline" className="mb-4" data-testid="button-back">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-gray-100">
              Cookie Preferences
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Manage your cookie preferences and privacy settings for Pheme
            </p>
            {currentConsent && (
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Last updated: {new Date(currentConsent.timestamp).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {saved && (
          <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
            <CardContent className="py-4">
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="text-green-800 dark:text-green-200 font-medium">
                  Cookie preferences saved successfully!
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={acceptAll}
                className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
                data-testid="button-accept-all"
              >
                Accept All Cookies
              </Button>
              <Button 
                onClick={rejectAll}
                variant="outline"
                data-testid="button-reject-all"
              >
                Reject All (Essential Only)
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    className="flex items-center"
                    data-testid="button-clear-all-trigger"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All Cookies
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      Clear All Cookies?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This will remove all cookies and reset your preferences. You may be logged out 
                      and lose your personalized settings. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel data-testid="button-cancel-clear">Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleClearAllCookies}
                      className="bg-red-600 hover:bg-red-700"
                      data-testid="button-confirm-clear"
                    >
                      Clear All Cookies
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Necessary Cookies (Always Active)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label className="text-base font-medium">
                  Required for Basic Functionality
                </Label>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  These cookies are necessary for the website to function properly and cannot be disabled. 
                  They include authentication, security, and basic navigation features.
                </p>
                <div className="mt-3 space-y-2">
                  <div className="border-l-4 border-gray-500 pl-3">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">connect.sid, session_*</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">Authentication and session management</p>
                  </div>
                </div>
              </div>
              <div className="ml-4">
                <Switch
                  checked={true}
                  disabled={true}
                  className="data-[state=checked]:bg-gray-600"
                  data-testid="switch-necessary"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Analytics Cookies
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label htmlFor="analytics" className="text-base font-medium">
                  Usage Analytics & Improvements
                </Label>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  These cookies help us understand how you use Pheme so we can improve the service. 
                  They collect anonymous usage data and help us fix bugs and optimize features.
                </p>
                <div className="mt-3 space-y-2">
                  <div className="border-l-4 border-purple-500 pl-3">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">_ga (Google Analytics)</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">Distinguishes unique users • Duration: 2 years</p>
                  </div>
                  <div className="border-l-4 border-purple-500 pl-3">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">_gid (Google Analytics)</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">Stores page visit data • Duration: 24 hours</p>
                  </div>
                  <div className="border-l-4 border-purple-500 pl-3">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">_gat (Google Analytics)</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">Throttles request rate • Duration: 1 minute</p>
                  </div>
                </div>
              </div>
              <div className="ml-4">
                <Switch
                  id="analytics"
                  checked={preferences.analytics}
                  onCheckedChange={(checked) => handlePreferenceChange('analytics', checked)}
                  data-testid="switch-analytics"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Cookie className="h-5 w-5 mr-2" />
              Marketing Cookies
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label htmlFor="marketing" className="text-base font-medium">
                  Advertising & Personalization
                </Label>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  These cookies are used to deliver personalized advertisements and track campaign performance. 
                  They help us show you relevant content and measure ad effectiveness.
                </p>
                <div className="mt-3 space-y-2">
                  <div className="border-l-4 border-blue-500 pl-3">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">_fbp, _fbc, fr (Meta Pixel)</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">Facebook advertising tracking • Duration: 3 months</p>
                  </div>
                  <div className="border-l-4 border-pink-500 pl-3">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">_ttp (TikTok Pixel)</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">TikTok advertising tracking • Duration: 13 months</p>
                  </div>
                </div>
              </div>
              <div className="ml-4">
                <Switch
                  id="marketing"
                  checked={preferences.marketing}
                  onCheckedChange={(checked) => handlePreferenceChange('marketing', checked)}
                  data-testid="switch-marketing"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <p className="text-gray-700 dark:text-gray-300">
                  Your preferences will be saved and applied immediately. The page will reload to apply changes.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  You can change these settings anytime by returning to this page.
                </p>
              </div>
              <Button 
                onClick={savePreferences}
                className="w-full sm:w-auto"
                size="lg"
                data-testid="button-save-preferences"
              >
                Save Cookie Preferences
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 dark:bg-gray-800 text-white">
          <CardContent className="text-center py-8">
            <h3 className="text-xl font-semibold mb-2">Need More Information?</h3>
            <p className="text-gray-300 mb-4">
              Learn more about our privacy practices and how we handle your data.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/privacy-cookies">
                <Button variant="secondary" size="lg" data-testid="button-privacy-policy">
                  Privacy Policy
                </Button>
              </Link>
              <Link href="/contact">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-gray-300 border-gray-600 hover:bg-gray-800"
                  data-testid="button-contact"
                >
                  Contact Privacy Team
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default CookiePreferencesPage;
