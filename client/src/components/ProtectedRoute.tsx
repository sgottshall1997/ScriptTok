import React from 'react';
import { Route, Redirect } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  component: React.ComponentType;
  path: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  component: Component,
  path,
  ...rest
}) => {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Route
      path={path}
      {...rest}
      component={() => {
        if (isLoading) {
          return (
            <div className="flex min-h-screen items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          );
        }

        return isAuthenticated ? (
          <Component />
        ) : (
          <Redirect to="/auth" />
        );
      }}
    />
  );
};

export default ProtectedRoute;