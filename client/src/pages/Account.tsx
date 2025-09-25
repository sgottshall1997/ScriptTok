import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { User, Crown, Zap, Settings } from 'lucide-react';

export default function Account() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
          <p className="text-muted-foreground">
            Manage your account preferences and subscription
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Update your personal information and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input 
                  id="firstName" 
                  placeholder="Enter your first name" 
                  defaultValue="John"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input 
                  id="lastName" 
                  placeholder="Enter your last name" 
                  defaultValue="Doe"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="Enter your email" 
                defaultValue="john@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input 
                id="timezone" 
                placeholder="Select timezone" 
                defaultValue="UTC-5 (Eastern Time)"
              />
            </div>
            <Button className="w-full md:w-auto">
              Save Changes
            </Button>
          </CardContent>
        </Card>

        {/* Subscription Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Subscription
            </CardTitle>
            <CardDescription>
              Current plan and usage details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <Badge variant="default" className="text-lg px-3 py-1">
                Pro Plan
              </Badge>
              <p className="text-2xl font-bold">$29/month</p>
              <p className="text-sm text-muted-foreground">
                Renews on Dec 15, 2024
              </p>
            </div>
            
            <div className="space-y-3 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span>AI Generations</span>
                <span>847 / 1,000</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-primary h-2 rounded-full w-[84%]"></div>
              </div>
            </div>

            <div className="space-y-2 pt-4">
              <Button variant="outline" className="w-full">
                <Settings className="h-4 w-4 mr-2" />
                Manage Subscription
              </Button>
              <Button variant="default" className="w-full">
                <Zap className="h-4 w-4 mr-2" />
                Upgrade Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* API Keys Card */}
      <Card>
        <CardHeader>
          <CardTitle>API Configuration</CardTitle>
          <CardDescription>
            Configure your API keys for enhanced functionality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="openaiKey">OpenAI API Key</Label>
              <Input 
                id="openaiKey" 
                type="password" 
                placeholder="sk-..." 
                defaultValue="sk-...configured"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amazonKey">Amazon Associates Key</Label>
              <Input 
                id="amazonKey" 
                type="password" 
                placeholder="Enter your Amazon key" 
              />
            </div>
          </div>
          <Button variant="outline">
            Update API Keys
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}