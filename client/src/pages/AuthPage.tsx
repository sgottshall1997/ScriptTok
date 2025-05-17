import React, { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';

const AuthPage = () => {
  const [, setLocation] = useLocation();
  const { isAuthenticated, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState('login');

  // Form states
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: '',
  });
  
  const [registerForm, setRegisterForm] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setLocation('/');
    }
  }, [isAuthenticated, setLocation]);

  // Form submission handlers
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(loginForm);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(registerForm);
  };

  // Form input change handlers
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({ ...prev, [name]: value }));
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterForm(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side - Auth forms */}
      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-md p-6">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Card>
                <CardHeader className="space-y-1">
                  <CardTitle className="text-2xl">Welcome back</CardTitle>
                  <CardDescription>
                    Enter your credentials to access your account
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleLoginSubmit}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        name="username"
                        placeholder="Enter your username"
                        required
                        value={loginForm.username}
                        onChange={handleLoginChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                      </div>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Enter your password"
                        required
                        value={loginForm.password}
                        onChange={handleLoginChange}
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Logging in...
                        </>
                      ) : (
                        'Log in'
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
            
            <TabsContent value="register">
              <Card>
                <CardHeader className="space-y-1">
                  <CardTitle className="text-2xl">Create an account</CardTitle>
                  <CardDescription>
                    Enter your information to create a new account
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleRegisterSubmit}>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          placeholder="John"
                          value={registerForm.firstName}
                          onChange={handleRegisterChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          placeholder="Doe"
                          value={registerForm.lastName}
                          onChange={handleRegisterChange}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-username">Username</Label>
                      <Input
                        id="reg-username"
                        name="username"
                        placeholder="johndoe"
                        required
                        value={registerForm.username}
                        onChange={handleRegisterChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="john.doe@example.com"
                        required
                        value={registerForm.email}
                        onChange={handleRegisterChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-password">Password</Label>
                      <Input
                        id="reg-password"
                        name="password"
                        type="password"
                        placeholder="Create a secure password"
                        required
                        value={registerForm.password}
                        onChange={handleRegisterChange}
                      />
                      <p className="text-xs text-muted-foreground">
                        Password must be at least 8 characters long
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        'Create account'
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Right side - Hero section */}
      <div className="hidden lg:flex flex-1 bg-muted items-center justify-center flex-col p-10">
        <div className="max-w-md text-center">
          <h1 className="text-4xl font-bold mb-6">
            Multi-Niche AI Content Engine
          </h1>
          <p className="text-lg mb-8">
            Generate trend-aware, optimized content for multiple niches including 
            skincare, tech, fashion, fitness, food, and more. Streamline your 
            social media content creation with advanced AI technologies.
          </p>
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-background rounded-lg shadow">
              <div className="mr-4 bg-primary text-primary-foreground p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                  <path d="M12 2v8"></path><path d="m4.93 10.93 1.41 1.41"></path><path d="M2 18h2"></path><path d="M20 18h2"></path><path d="m19.07 10.93-1.41 1.41"></path><path d="M22 22H2"></path><path d="m8 22 4-10 4 10"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Real-time Trend Detection</h3>
                <p className="text-sm text-muted-foreground">Stay ahead with automated trend analysis across platforms</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-background rounded-lg shadow">
              <div className="mr-4 bg-primary text-primary-foreground p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Dynamic Content Templates</h3>
                <p className="text-sm text-muted-foreground">Specialized templates for each industry and platform</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-background rounded-lg shadow">
              <div className="mr-4 bg-primary text-primary-foreground p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Advanced AI Integration</h3>
                <p className="text-sm text-muted-foreground">Powered by leading AI models for optimal content generation</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;