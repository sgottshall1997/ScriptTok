import { Card, CardContent } from "@/components/ui/card";
import AboutThisPage from '@/components/AboutThisPage';
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">404 Page Not Found</h1>
          </div>

          <p className="mt-4 text-sm text-gray-600">
            Did you forget to add the page to the router?
          </p>
        </CardContent>
      </Card>

      <div className="mt-8">
        <AboutThisPage 
          title="404 Page Not Found"
          whatItDoes="Error page displayed when users access non-existent URLs or pages that haven't been properly configured in the application router. Provides clear feedback about navigation issues and helps users return to functional parts of the application."
          setupRequirements={[
            "No setup required - automatically displayed for invalid URLs",
            "Check browser URL for typos or incorrect paths",
            "Verify page exists and is properly configured in the router"
          ]}
          usageInstructions={[
            "Use browser back button to return to previous page",
            "Check URL for spelling errors or incorrect paths",
            "Navigate directly to homepage or main sections",
            "Contact support if you believe this page should exist",
            "Bookmark valid pages to avoid future navigation errors",
            "Report broken links if you arrived here from internal navigation"
          ]}
          relatedLinks={[
            {name: "Homepage", path: "/"},
            {name: "How It Works", path: "/how-it-works"},
            {name: "FAQ", path: "/faq"},
            {name: "Contact Support", path: "/contact"}
          ]}
          notes={[
            "This page appears when accessing URLs that don't exist in the application",
            "Common causes include typos in URLs or outdated bookmarks",
            "All main application pages are accessible through the navigation menu",
            "Contact support if you consistently encounter this page",
            "Clear browser cache if you experience persistent navigation issues"
          ]}
        />
      </div>
    </div>
  );
}
