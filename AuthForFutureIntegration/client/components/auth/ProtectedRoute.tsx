import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { tokenService } from '../../lib/token-service';
import { useAuthToast } from '../../hooks/use-auth-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallbackPath = '/login' 
}) => {
  const [, setLocation] = useLocation();
  const { showLoginRequired } = useAuthToast() as any;

  useEffect(() => {
    const checkAuthentication = () => {
      console.log("🔍 [PROTECTED ROUTE] Checking authentication...");
      
      if (!tokenService.isAuthenticated()) {
        console.log("❌ [PROTECTED ROUTE] User not authenticated, redirecting to login");
        
        // Show toast notification with login button
        showLoginRequired();
        return false;
      }
      
      console.log("✅ [PROTECTED ROUTE] User is authenticated");
      return true;
    };

    checkAuthentication();
  }, [setLocation, fallbackPath, showLoginRequired]);

  // If not authenticated, don't render children
  if (!tokenService.isAuthenticated()) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
