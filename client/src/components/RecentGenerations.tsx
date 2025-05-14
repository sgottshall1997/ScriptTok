import { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ContentGeneration } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

interface RecentGenerationsProps {
  generations: ContentGeneration[];
  isLoading: boolean;
}

const RecentGenerations: FC<RecentGenerationsProps> = ({ generations, isLoading }) => {
  const { toast } = useToast();

  const handleView = (content: string) => {
    // Create a modal or set state to view the content
    const modalContent = document.createElement('div');
    modalContent.innerHTML = content;
    const plainText = modalContent.textContent || modalContent.innerText;
    
    // For now, show in toast (could be enhanced with a modal component)
    toast({
      title: "Content Preview",
      description: plainText.length > 100 ? plainText.substring(0, 100) + "..." : plainText,
    });
  };

  const handleCopy = (content: string) => {
    // Create temporary element to convert HTML to text
    const tempElement = document.createElement('div');
    tempElement.innerHTML = content;
    const textToCopy = tempElement.textContent || tempElement.innerText;
    
    // Copy to clipboard
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        toast({
          title: "Copied to clipboard",
          description: "Content has been copied to your clipboard",
        });
      })
      .catch((err) => {
        toast({
          title: "Copy failed",
          description: "Could not copy content to clipboard",
          variant: "destructive",
        });
        console.error("Copy failed", err);
      });
  };

  // Helper to format relative time
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInSeconds < 3600) {
      const mins = Math.floor(diffInSeconds / 60);
      return `${mins} min${mins > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  // Format template type for display
  const formatTemplateType = (templateType: string) => {
    switch (templateType) {
      case 'original':
        return 'Original Review';
      case 'comparison':
        return 'Product Comparison';
      case 'caption':
        return 'Social Media Caption';
      case 'pros-cons':
        return 'Pros & Cons';
      case 'routine':
        return 'Skincare Routine';
      default:
        return templateType.charAt(0).toUpperCase() + templateType.slice(1);
    }
  };

  return (
    <Card>
      <CardHeader className="border-b border-neutral-200 py-5">
        <CardTitle className="text-lg font-semibold">Recent Generations</CardTitle>
        <p className="text-sm text-muted-foreground">Your last 5 content generations</p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Product</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Template</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {isLoading ? (
                // Loading skeletons
                Array(3).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Skeleton className="h-4 w-32" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Skeleton className="h-4 w-16" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Skeleton className="h-4 w-12" />
                    </td>
                  </tr>
                ))
              ) : generations.length === 0 ? (
                // Empty state
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm text-neutral-500">
                    <div className="flex flex-col items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-neutral-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <p>No recent content generations</p>
                      <p className="text-xs mt-1">Generate content to see your history</p>
                    </div>
                  </td>
                </tr>
              ) : (
                // Generation history
                generations.slice(0, 5).map((generation) => (
                  <tr key={generation.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-800">
                      {generation.product.length > 25 
                        ? generation.product.substring(0, 25) + '...' 
                        : generation.product}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                      {formatTemplateType(generation.templateType)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                      {getRelativeTime(generation.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                      <div className="flex space-x-2">
                        <button 
                          className="text-secondary-500 hover:text-secondary-700"
                          onClick={() => handleView(generation.content)}
                          title="View content"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button 
                          className="text-primary-500 hover:text-primary-700"
                          onClick={() => handleCopy(generation.content)}
                          title="Copy content"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentGenerations;
