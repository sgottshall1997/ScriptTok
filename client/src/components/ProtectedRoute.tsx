import { FC, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Redirect, Route } from "wouter";
import { Loader2 } from "lucide-react";
import { getAuthToken } from "@/lib/queryClient";

interface ProtectedRouteProps {
  component: React.ComponentType;
  path?: string;
}

const ProtectedRoute: FC<ProtectedRouteProps> = ({ component: Component, path }) => {
  const { user, isLoading } = useAuth();
  const [tokenChecked, setTokenChecked] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  
  // Check for token directly
  useEffect(() => {
    const token = getAuthToken();
    setHasToken(!!token);
    setTokenChecked(true);
    
    // Debug
    console.log("Token check:", !!token, "User:", !!user);
  }, [user]);

  // If initial loading, show loading indicator
  if (isLoading && !tokenChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  return (
    <Route
      path={path}
      component={() => {
        // For debugging
        console.log("Route render - hasToken:", hasToken, "user:", !!user);
        
        // If we have a token, render the component immediately
        // This forces the component to render even if user data isn't fully loaded yet
        if (hasToken) {
          return <Component />;
        }
        
        // If no token, redirect to auth
        if (!hasToken) {
          return <Redirect to="/auth" />;
        }
        
        // Fallback (shouldn't reach here)
        return <Component />;
      }}
    />
  );
};

export default ProtectedRoute;