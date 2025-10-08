import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Link } from "wouter";
import { ArrowLeft, Cookie, Shield, BarChart3, Settings, CheckCircle } from 'lucide-react';

interface CookiePreferences {
  essential: boolean;
  functional: boolean;
  analytics: boolean;
  doNotSell: boolean;
}

const CookiePreferencesPage: React.FC = () => {
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Always true, cannot be disabled
    functional: true,
    analytics: true,
    doNotSell: false,
  });
  
  const [saved, setSaved] = useState(false);

  // Load preferences from localStorage on component mount
  useEffect(() => {
    const storedPreferences = localStorage.getItem('cookiePreferences');
    if (storedPreferences) {
      try {
        const parsed = JSON.parse(storedPreferences);
        setPreferences({
          ...parsed,
          essential: true, // Essential cookies always enabled
        });
      } catch (error) {
        console.error('Error parsing stored cookie preferences:', error);
      }
    }
  }, []);

  const handlePreferenceChange = (key: keyof CookiePreferences, value: boolean) => {
    if (key === 'essential') return; // Cannot change essential cookies
    
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const savePreferences = () => {
    // Save to localStorage
    localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
    
    // Apply preferences to actual cookies
    applyCookiePreferences(preferences);
    
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const acceptAll = () => {
    const allAccepted = {
      essential: true,
      functional: true,
      analytics: true,
      doNotSell: false,
    };
    setPreferences(allAccepted);
    localStorage.setItem('cookiePreferences', JSON.stringify(allAccepted));
    applyCookiePreferences(allAccepted);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const rejectAll = () => {
    const onlyEssential = {
      essential: true,
      functional: false,
      analytics: false,
      doNotSell: true,
    };
    setPreferences(onlyEssential);
    localStorage.setItem('cookiePreferences', JSON.stringify(onlyEssential));
    applyCookiePreferences(onlyEssential);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const applyCookiePreferences = (prefs: CookiePreferences) => {
    // In a real implementation, this would:
    // 1. Enable/disable analytics cookies
    // 2. Enable/disable functional cookies
    // 3. Set CCPA opt-out flags
    // 4. Update any third-party service configurations
    
    console.log('Applying cookie preferences:', prefs);
    
    // Example: Disable analytics if not consented
    if (!prefs.analytics) {
      // Disable Google Analytics, other analytics services
      if (typeof gtag !== 'undefined') {
        gtag('consent', 'update', {
          'analytics_storage': 'denied'
        });
      }
    } else {
      if (typeof gtag !== 'undefined') {
        gtag('consent', 'update', {
          'analytics_storage': 'granted'
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <Link href="/">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900">
              Cookie Preferences
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Manage your cookie preferences and privacy settings for Pheme
            </p>
          </div>
        </div>

        {/* Success Message */}
        {saved && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="py-4">
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-green-800 font-medium">
                  Cookie preferences saved successfully!
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
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
                className="bg-green-600 hover:bg-green-700"
              >
                Accept All Cookies
              </Button>
              <Button 
                onClick={rejectAll}
                variant="outline"
              >
                Reject All (Essential Only)
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Essential Cookies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Essential Cookies
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label htmlFor="essential" className="text-base font-medium">
                  Required for Basic Functionality
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  These cookies are necessary for the website to function properly and cannot be disabled. 
                  They include authentication, security, and basic navigation features.
                </p>
                <div className="mt-2">
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">Authentication</span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded ml-2">Security</span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded ml-2">Session Management</span>
                </div>
              </div>
              <div className="ml-4">
                <Switch
                  id="essential"
                  checked={preferences.essential}
                  disabled={true}
                  className="data-[state=checked]:bg-gray-600"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Functional Cookies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Cookie className="h-5 w-5 mr-2" />
              Functional Cookies
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label htmlFor="functional" className="text-base font-medium">
                  Enhanced User Experience
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  These cookies enhance your experience by remembering your preferences, settings, 
                  and personalizing content recommendations. They are not required but improve usability.
                </p>
                <div className="mt-2">
                  <span className="text-xs bg-blue-100 px-2 py-1 rounded text-blue-800">Preferences</span>
                  <span className="text-xs bg-blue-100 px-2 py-1 rounded text-blue-800 ml-2">Personalization</span>
                  <span className="text-xs bg-blue-100 px-2 py-1 rounded text-blue-800 ml-2">Language Settings</span>
                </div>
              </div>
              <div className="ml-4">
                <Switch
                  id="functional"
                  checked={preferences.functional}
                  onCheckedChange={(checked) => handlePreferenceChange('functional', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analytics Cookies */}
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
                <p className="text-sm text-gray-600 mt-1">
                  These cookies help us understand how you use Pheme so we can improve the service. 
                  They collect anonymous usage data and help us fix bugs and optimize features.
                </p>
                <div className="mt-2">
                  <span className="text-xs bg-purple-100 px-2 py-1 rounded text-purple-800">Page Views</span>
                  <span className="text-xs bg-purple-100 px-2 py-1 rounded text-purple-800 ml-2">Feature Usage</span>
                  <span className="text-xs bg-purple-100 px-2 py-1 rounded text-purple-800 ml-2">Performance</span>
                </div>
              </div>
              <div className="ml-4">
                <Switch
                  id="analytics"
                  checked={preferences.analytics}
                  onCheckedChange={(checked) => handlePreferenceChange('analytics', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CCPA Do Not Sell */}
        <Card>
          <CardHeader>
            <CardTitle>California Consumer Privacy Act (CCPA)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label htmlFor="doNotSell" className="text-base font-medium">
                  Do Not Sell My Personal Information
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  For California residents: Pheme does not sell personal information. 
                  This setting ensures compliance with CCPA requirements and your privacy preferences.
                </p>
                <div className="mt-2">
                  <span className="text-xs bg-red-100 px-2 py-1 rounded text-red-800">CCPA Compliance</span>
                  <span className="text-xs bg-red-100 px-2 py-1 rounded text-red-800 ml-2">No Data Sales</span>
                </div>
              </div>
              <div className="ml-4">
                <Switch
                  id="doNotSell"
                  checked={preferences.doNotSell}
                  onCheckedChange={(checked) => handlePreferenceChange('doNotSell', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cookie Details */}
        <Card>
          <CardHeader>
            <CardTitle>Cookie Details & Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3 font-medium">Cookie Type</th>
                    <th className="text-left p-3 font-medium">Purpose</th>
                    <th className="text-left p-3 font-medium">Duration</th>
                    <th className="text-left p-3 font-medium">Third Party</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="p-3">Session</td>
                    <td className="p-3">User authentication and security</td>
                    <td className="p-3">Session</td>
                    <td className="p-3">No</td>
                  </tr>
                  <tr>
                    <td className="p-3">Preferences</td>
                    <td className="p-3">Remember user settings and choices</td>
                    <td className="p-3">1 year</td>
                    <td className="p-3">No</td>
                  </tr>
                  <tr>
                    <td className="p-3">Analytics</td>
                    <td className="p-3">Usage statistics and performance monitoring</td>
                    <td className="p-3">2 years</td>
                    <td className="p-3">Yes (Google Analytics)</td>
                  </tr>
                  <tr>
                    <td className="p-3">Security</td>
                    <td className="p-3">Fraud prevention and security monitoring</td>
                    <td className="p-3">6 months</td>
                    <td className="p-3">No</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Save Preferences */}
        <Card>
          <CardContent className="py-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <p className="text-gray-700">
                  Your preferences will be saved locally and applied immediately.
                </p>
                <p className="text-sm text-gray-500">
                  You can change these settings anytime by returning to this page.
                </p>
              </div>
              <Button 
                onClick={savePreferences}
                className="w-full sm:w-auto"
                size="lg"
              >
                Save Cookie Preferences
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card className="bg-gray-900 text-white">
          <CardContent className="text-center py-8">
            <h3 className="text-xl font-semibold mb-2">Need More Information?</h3>
            <p className="text-gray-300 mb-4">
              Learn more about our privacy practices and how we handle your data.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/privacy-cookies">
                <Button variant="secondary" size="lg">
                  Privacy Policy
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg" className="text-gray-300 border-gray-600 hover:bg-gray-800">
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