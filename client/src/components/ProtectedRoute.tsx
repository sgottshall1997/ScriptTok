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
  }, []);

  if (isLoading || !tokenChecked) {
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
        // If we have a token but no user yet, show loading
        if (hasToken && !user) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Authenticating...</span>
            </div>
          );
        }
        
        // If no token and no user, redirect to auth
        if (!hasToken && !user) {
          return <Redirect to="/auth" />;
        }
        
        // If token is present or user is loaded, render the component
        return <Component />;
      }}
    />
  );
};

export default ProtectedRoute;