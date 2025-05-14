import { FC } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingProduct, SOURCE_COLORS } from "@/lib/types";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface TrendingProductsListProps {
  products: TrendingProduct[];
  isLoading: boolean;
}

const TrendingProductsList: FC<TrendingProductsListProps> = ({ products, isLoading }) => {
  const { toast } = useToast();

  const handleRefresh = async () => {
    try {
      await apiRequest('POST', '/api/trending/refresh', {});
      toast({
        title: "Trending products refreshed",
        description: "The latest trending products have been fetched.",
      });
    } catch (error) {
      toast({
        title: "Error refreshing products",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const handleAddProductToForm = (product: string) => {
    // Find the product input field and set its value
    const productInput = document.getElementById('product') as HTMLInputElement;
    if (productInput) {
      productInput.value = product;
      productInput.focus();
    }
  };

  const getSourceColorClass = (source: string) => {
    return SOURCE_COLORS[source as keyof typeof SOURCE_COLORS] || 'bg-gray-100 text-gray-800';
  };

  // Format large numbers with K/M suffix
  const formatNumber = (num: number = 0) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <Card>
      <CardHeader className="border-b border-neutral-200 flex justify-between items-center py-5">
        <div>
          <CardTitle className="text-lg font-semibold">Trending Products</CardTitle>
          <p className="text-sm text-muted-foreground">Live data from social platforms</p>
        </div>
        <div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <span className="mr-1.5 h-2 w-2 rounded-full bg-green-500"></span>
            Live
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-5 space-y-4">
        {isLoading ? (
          // Loading skeletons
          Array(5).fill(0).map((_, i) => (
            <div key={i} className="flex items-center">
              <Skeleton className="h-8 w-8 rounded-full mr-3" />
              <div className="flex-1">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))
        ) : products.length === 0 ? (
          // Empty state
          <div className="text-center py-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-neutral-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-neutral-600 mb-1">No trending products available</p>
            <p className="text-xs text-neutral-500">Click refresh to fetch the latest trends</p>
          </div>
        ) : (
          // Trending products list
          products.slice(0, 5).map((product, index) => (
            <div key={product.id} className="flex items-center">
              <div className="bg-primary-100 text-primary-700 inline-flex items-center justify-center h-8 w-8 rounded-full flex-shrink-0 mr-3">
                <span className="text-xs font-bold">{index + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-800 truncate">{product.title}</p>
                <div className="flex items-center">
                  <span className={`inline-block text-xs px-2 py-0.5 rounded ${getSourceColorClass(product.source)} mr-2`}>
                    {product.source.charAt(0).toUpperCase() + product.source.slice(1)}
                  </span>
                  <div className="text-xs text-neutral-500 truncate">
                    {formatNumber(product.mentions)} mentions this week
                  </div>
                </div>
              </div>
              <button 
                className="ml-2 p-1.5 text-neutral-500 hover:text-primary-500 rounded"
                onClick={() => handleAddProductToForm(product.title)}
                title="Use this product"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          ))
        )}
      </CardContent>
      <CardFooter className="px-5 py-3 bg-neutral-50 border-t border-neutral-200 flex justify-end">
        <button 
          className="text-sm text-secondary-600 hover:text-secondary-800 font-medium flex items-center"
          onClick={handleRefresh}
        >
          Refresh Trends 
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </CardFooter>
    </Card>
  );
};

export default TrendingProductsList;
