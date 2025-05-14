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
    <Card className="shadow-xl bg-white/80 backdrop-blur-sm border border-gray-200">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-violet-50 rounded-t-lg border-b border-neutral-200 flex justify-between items-center py-5">
        <div>
          <CardTitle className="text-gradient bg-gradient-to-r from-blue-600 to-violet-600 font-bold text-xl">Trending Products</CardTitle>
          <p className="text-sm text-gray-700">Live data from social media platforms</p>
        </div>
        <div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <span className="mr-1.5 h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            Live
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        {isLoading ? (
          // Loading skeletons
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="flex items-center bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                <Skeleton className="h-10 w-10 rounded-full mr-3" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          // Empty state
          <div className="text-center py-10 bg-white rounded-lg border border-dashed border-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-gray-700 text-lg font-medium mb-2">No trending products available</p>
            <p className="text-gray-500">Click the refresh button below to fetch the latest beauty trends</p>
          </div>
        ) : (
          // Trending products grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.slice(0, 6).map((product, index) => (
              <div key={product.id} className="flex flex-col bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                <div className="flex items-center p-3 border-b border-gray-100">
                  <div className="bg-gradient-to-r from-blue-500 to-violet-500 text-white inline-flex items-center justify-center h-10 w-10 rounded-full flex-shrink-0 mr-3 shadow-sm">
                    <span className="text-sm font-bold">{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-800 truncate">{product.title}</p>
                    <div className="flex items-center mt-1">
                      <span className={`inline-block text-xs px-2 py-0.5 rounded ${getSourceColorClass(product.source)} mr-2`}>
                        {product.source.charAt(0).toUpperCase() + product.source.slice(1)}
                      </span>
                      <div className="text-xs text-neutral-500 truncate">
                        {formatNumber(product.mentions)} mentions
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-3 mt-auto flex justify-end bg-gray-50">
                  <button 
                    className="px-3 py-1.5 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 rounded-md font-medium flex items-center transition-colors"
                    onClick={() => handleAddProductToForm(product.title)}
                    title="Use this product"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Use Product
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="px-5 py-4 bg-gradient-to-r from-blue-50 to-violet-50 border-t border-neutral-200 flex justify-center">
        <button 
          className="px-4 py-2 rounded-md bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white font-medium flex items-center transition-all shadow-md hover:shadow-lg"
          onClick={handleRefresh}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 animate-spin-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Trending Products
        </button>
      </CardFooter>
    </Card>
  );
};

export default TrendingProductsList;
