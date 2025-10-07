import { ReactNode } from 'react';
import { useAuth } from './AuthProvider';
import { Skeleton } from '@/components/ui/skeleton';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, login } = useAuth();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4" data-testid="skeleton-loading">
        <Skeleton className="h-12 w-[250px]" data-testid="skeleton-title" />
        <Skeleton className="h-4 w-[300px]" data-testid="skeleton-subtitle" />
        <Skeleton className="h-32 w-full max-w-2xl" data-testid="skeleton-content" />
        <Skeleton className="h-10 w-[150px]" data-testid="skeleton-button" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6" data-testid="container-login-required">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold" data-testid="text-login-required-title">
            Authentication Required
          </h2>
          <p className="text-muted-foreground" data-testid="text-login-required-description">
            Please sign in to access this page
          </p>
        </div>
        <button
          onClick={login}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          data-testid="button-trigger-login"
        >
          Sign In
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
