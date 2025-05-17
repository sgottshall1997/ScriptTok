import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Loader2, User, LogOut, Settings } from 'lucide-react';

const UserProfileMenu = () => {
  const { user, isLoading, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();

  // Handle logout
  const handleLogout = () => {
    logoutMutation.mutate();
    setLocation('/auth');
  };

  // Generate initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  // Get display name (first name, full name, or username)
  const getDisplayName = () => {
    if (!user) return '';
    
    if (user.firstName) {
      return user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName;
    }
    
    return user.username;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="text-muted-foreground">Loading...</span>
      </div>
    );
  }

  // Not authenticated state (shouldn't normally be visible due to protected routes)
  if (!user) {
    return (
      <Button 
        variant="ghost" 
        size="sm" 
        className="w-full justify-start px-4" 
        onClick={() => setLocation('/auth')}
      >
        <User className="mr-2 h-4 w-4" />
        <span>Sign In</span>
      </Button>
    );
  }

  // Authenticated user profile menu
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-full justify-start px-2 py-6">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.profileImage || ''} alt={getDisplayName()} />
              <AvatarFallback>{getInitials(getDisplayName())}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start">
              <span className="font-medium">{getDisplayName()}</span>
              <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
            </div>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setLocation('/profile')}>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLocation('/settings')}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="text-destructive focus:text-destructive" 
          onClick={handleLogout} 
          disabled={logoutMutation.isPending}
        >
          {logoutMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Logging out...</span>
            </>
          ) : (
            <>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfileMenu;