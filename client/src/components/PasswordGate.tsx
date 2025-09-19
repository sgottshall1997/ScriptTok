import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PasswordGateProps {
  onAuthenticated: () => void;
}

export default function PasswordGate({ onAuthenticated }: PasswordGateProps) {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password.trim()) {
      setError('Password is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.success) {
        // Store authentication in sessionStorage
        sessionStorage.setItem('app_authenticated', 'true');
        toast({
          title: 'Access Granted',
          description: 'Welcome to the application!',
        });
        onAuthenticated();
      } else {
        setError(data.error || 'Invalid password');
        toast({
          title: 'Access Denied',
          description: 'Incorrect password. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      setError('Failed to verify password. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to verify password. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            Application Access
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Please enter the password to access the application
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter application password"
                className="mt-1"
                data-testid="input-password"
                disabled={isLoading}
              />
            </div>
            
            {error && (
              <div className="flex items-center space-x-2 text-red-600 dark:text-red-400" role="alert">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              data-testid="button-submit-password"
            >
              {isLoading ? 'Verifying...' : 'Access Application'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}