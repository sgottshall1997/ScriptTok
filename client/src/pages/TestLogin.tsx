import React from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiRequest, queryClient } from '../lib/queryClient';
import { toast } from '@/hooks/use-toast';

const TestLogin: React.FC = () => {
  const [, navigate] = useLocation();

  const handleTestLogin = async () => {
    try {
      // Create a test user if it doesn't exist and log in as that user
      const response = await apiRequest('POST', '/api/test-login', {});
      const userData = await response.json();
      
      // Set the user data in the query cache
      queryClient.setQueryData(['/api/users/me'], userData);
      
      toast({
        title: 'Test Login Successful',
        description: `Logged in as test user: ${userData.username}`,
      });
      
      // Navigate to preferences page
      navigate('/preferences');
    } catch (error) {
      console.error('Test login failed:', error);
      toast({
        title: 'Test Login Failed',
        description: 'Unable to log in with test credentials',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Test Login</CardTitle>
          <CardDescription>
            Login with a test account to access the User Preferences feature
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            This will create a test user with ID 1 if it doesn't exist and log you in automatically.
          </p>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleTestLogin}>
            Login as Test User
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TestLogin;