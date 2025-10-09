import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useLocation } from 'wouter';

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function isDevMode(): boolean {
  const isLocalhost = window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.includes('.local');
  
  const isDevEnv = import.meta.env.VITE_APP_ENV === 'development';
  
  return isLocalhost || isDevEnv;
}

export function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();

  function handleLogin() {
    const isDev = isDevMode();
    
    if (isDev) {
      console.log('[LoginModal] Development mode detected - user is already auto-authenticated');
      console.log('[LoginModal] Closing modal and redirecting to dashboard');
      
      onOpenChange(false);
      setLocation('/dashboard');
      return;
    }
    
    // Modern Replit Auth: redirect to OpenID Connect login flow
    console.log('[LoginModal] Redirecting to Replit Auth login flow');
    window.location.href = '/api/login';
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="dialog-login">
        <DialogHeader>
          <DialogTitle data-testid="text-login-title">Sign in to Pheme</DialogTitle>
          <DialogDescription data-testid="text-login-description">
            Sign in with your Replit account to access all features
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <Button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full"
            data-testid="button-replit-login"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Authenticating...
              </>
            ) : (
              isDevMode() ? 'Continue to Dashboard' : 'Sign in with Replit'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
