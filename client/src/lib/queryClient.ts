import { QueryClient, QueryFunction } from "@tanstack/react-query";
import * as React from "react";
import { toast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
      onError: (error: Error) => {
        if (error.message.includes('429')) {
          let title = "";
          let description = "";
          
          if (error.message.toLowerCase().includes('gpt')) {
            title = "⚠️ GPT Generation Limit Reached";
            description = "You've reached your monthly GPT generation limit. Upgrade to Pro for 300 GPT generations/month.";
          } else if (error.message.toLowerCase().includes('claude')) {
            title = "⚠️ Claude Generation Limit Reached";
            description = "You've reached your monthly Claude generation limit. Upgrade to Pro for 150 Claude generations/month.";
          } else if (error.message.toLowerCase().includes('trend')) {
            title = "⚠️ Trend Analysis Limit Reached";
            description = "You've reached your monthly trend analysis limit. Upgrade to Pro for unlimited trend analyses.";
          } else if (error.message.toLowerCase().includes('bulk')) {
            title = "⚠️ Bulk Generation - Pro Only";
            description = "Bulk content generation is available for Pro users only. Upgrade to unlock this feature.";
          } else {
            title = "⚠️ Rate Limit Reached";
            description = "You've reached your usage limit. Upgrade to Pro for higher limits.";
          }
          
          toast({
            title,
            description,
            action: React.createElement(
              ToastAction,
              {
                altText: "Upgrade to Pro",
                onClick: () => window.location.href = '/account'
              },
              "Upgrade to Pro"
            ),
          });
        }
      }
    },
  },
});
