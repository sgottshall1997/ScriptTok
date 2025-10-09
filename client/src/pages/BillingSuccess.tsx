import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function BillingSuccess() {
  const [, setLocation] = useLocation();
  const [countdown, setCountdown] = useState(5);
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('session_id');
  const isMock = urlParams.get('mock') === 'true';

  useEffect(() => {
    // Countdown timer
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Redirect to dashboard after countdown
      setLocation('/dashboard');
    }
  }, [countdown, setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 p-4">
      <Card className="max-w-md w-full shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl">
            {isMock ? 'Mock Payment Successful!' : 'Payment Successful!'}
          </CardTitle>
          <CardDescription className="text-base mt-2">
            {isMock 
              ? 'This is a test transaction. Your subscription has been activated in mock mode.'
              : 'Thank you for your purchase! Your subscription has been activated.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sessionId && !isMock && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">Session ID:</p>
              <p className="text-xs font-mono text-gray-800 dark:text-gray-200 break-all">{sessionId}</p>
            </div>
          )}
          
          {isMock && (
            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Note:</strong> This is mock mode. To enable real payments, configure your Stripe price IDs in the environment variables.
              </p>
            </div>
          )}

          <div className="text-center pt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Redirecting to dashboard in {countdown} second{countdown !== 1 ? 's' : ''}...
            </p>
            <div className="space-y-2">
              <Button 
                onClick={() => setLocation('/dashboard')}
                className="w-full"
                data-testid="button-go-to-dashboard"
              >
                Go to Dashboard Now
              </Button>
              <Button 
                onClick={() => setLocation('/account')}
                variant="outline"
                className="w-full"
                data-testid="button-view-subscription"
              >
                View Subscription Details
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
