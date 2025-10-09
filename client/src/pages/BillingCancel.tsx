import { useLocation } from "wouter";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function BillingCancel() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 p-4">
      <Card className="max-w-md w-full shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-10 h-10 text-orange-600 dark:text-orange-400" />
          </div>
          <CardTitle className="text-2xl">Payment Cancelled</CardTitle>
          <CardDescription className="text-base mt-2">
            Your payment was cancelled. No charges were made to your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              If you experienced any issues during checkout, please contact our support team or try again later.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <Button 
              onClick={() => setLocation('/pricing')}
              className="w-full"
              data-testid="button-back-to-pricing"
            >
              Back to Pricing
            </Button>
            <Button 
              onClick={() => setLocation('/dashboard')}
              variant="outline"
              className="w-full"
              data-testid="button-go-to-dashboard"
            >
              Go to Dashboard
            </Button>
            <Button 
              onClick={() => setLocation('/contact')}
              variant="ghost"
              className="w-full"
              data-testid="button-contact-support"
            >
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
