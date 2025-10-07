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

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  function handleReplitLogin() {
    setIsLoading(true);
    
    window.addEventListener("message", authComplete);
    const authWindow = window.open(
      "https://replit.com/auth_with_repl_site?domain=" + location.host,
      "_blank",
      "modal=yes, width=350, height=500"
    );
    
    function authComplete(e: MessageEvent) {
      if (e.data !== "auth_complete") return;
      window.removeEventListener("message", authComplete);
      authWindow?.close();
      location.reload(); // Reload to pick up authenticated state
    }

    // Handle if user closes the popup without completing auth
    const checkClosed = setInterval(() => {
      if (authWindow?.closed) {
        clearInterval(checkClosed);
        window.removeEventListener("message", authComplete);
        setIsLoading(false);
      }
    }, 500);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="dialog-login">
        <DialogHeader>
          <DialogTitle data-testid="text-login-title">Sign in to ScriptTok</DialogTitle>
          <DialogDescription data-testid="text-login-description">
            Sign in with your Replit account to access all features
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <Button
            onClick={handleReplitLogin}
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
              'Sign in with Replit'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
