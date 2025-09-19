import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChefHat, Lock, Eye, EyeOff } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface CookAIngAuthProps {
  children: React.ReactNode;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
}

const CookAIngAuth: React.FC<CookAIngAuthProps> = ({ children }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: false
  });

  // Check if password protection is enabled
  const isPasswordProtectionEnabled = import.meta.env.VITE_COOKAING_SECTION_PASSWORD !== undefined;

  // If password protection is not enabled, render children directly
  if (!isPasswordProtectionEnabled) {
    return <>{children}</>;
  }

  // Check if user is already authenticated (stored in localStorage)
  React.useEffect(() => {
    const isAuth = localStorage.getItem('cookaing-auth') === 'true';
    setAuthState(prev => ({ ...prev, isAuthenticated: isAuth }));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setAuthState(prev => ({ ...prev, isLoading: true }));

    try {
      const response = await apiRequest('POST', '/api/cookaing-marketing/auth/login', { password });
      const data = await response.json();

      if (data.success) {
        localStorage.setItem('cookaing-auth', 'true');
        setAuthState({ isAuthenticated: true, isLoading: false });
      } else {
        setError('Invalid password. Please try again.');
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      setError('Authentication failed. Please try again.');
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('cookaing-auth');
    setAuthState({ isAuthenticated: false, isLoading: false });
    setPassword('');
  };

  // If authenticated, render children
  if (authState.isAuthenticated) {
    return <>{children}</>;
  }

  // Render login form
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
            <ChefHat className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">CookAIng Access</CardTitle>
          <CardDescription>
            This section is password protected. Please enter the access code to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Access Code</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter access code"
                  disabled={authState.isLoading}
                  className="pr-10"
                  data-testid="input-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  data-testid="button-toggle-password"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <Lock className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={authState.isLoading || !password.trim()}
              data-testid="button-login"
            >
              {authState.isLoading ? 'Verifying...' : 'Access CookAIng'}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Don't have access? Contact your administrator for the access code.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CookAIngAuth;