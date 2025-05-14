import { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiUsage as ApiUsageType } from "@/lib/types";

interface ApiUsageProps {
  usage: ApiUsageType;
  isLoading: boolean;
}

const ApiUsage: FC<ApiUsageProps> = ({ usage, isLoading }) => {
  // Calculate percentage for the progress bar
  const usagePercentage = usage ? Math.min(100, Math.round((usage.monthly / usage.limit) * 100)) : 0;
  
  return (
    <Card>
      <CardHeader className="border-b border-neutral-200 py-5">
        <CardTitle className="text-lg font-semibold">API Usage</CardTitle>
        <p className="text-sm text-muted-foreground">OpenAI API consumption</p>
      </CardHeader>
      <CardContent className="p-5">
        {isLoading ? (
          // Loading skeleton
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-2.5 w-full rounded-full" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-20 w-full rounded-lg" />
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-neutral-700">This Month</span>
                <span className="text-sm font-medium text-neutral-800">
                  {usage.monthly} / {usage.limit} requests
                </span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-2.5 mb-4">
                <div 
                  className="bg-secondary-500 h-2.5 rounded-full" 
                  style={{ width: `${usagePercentage}%` }}
                />
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-4 text-center">
              <div className="bg-neutral-50 p-3 rounded-lg">
                <p className="text-xs text-neutral-600">Today</p>
                <p className="text-xl font-semibold text-neutral-800">{usage.today}</p>
                <p className="text-xs text-neutral-500">requests</p>
              </div>
              <div className="bg-neutral-50 p-3 rounded-lg">
                <p className="text-xs text-neutral-600">Last 7 Days</p>
                <p className="text-xl font-semibold text-neutral-800">{usage.weekly}</p>
                <p className="text-xs text-neutral-500">requests</p>
              </div>
            </div>

            {usagePercentage > 90 && (
              <div className="mt-4 p-2 bg-red-50 border border-red-200 rounded-md">
                <p className="text-xs text-red-600 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Approaching monthly limit
                </p>
              </div>
            )}
            
            {usagePercentage >= 50 && usagePercentage <= 90 && (
              <div className="mt-4 p-2 bg-amber-50 border border-amber-200 rounded-md">
                <p className="text-xs text-amber-600 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Moderate usage detected
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ApiUsage;
