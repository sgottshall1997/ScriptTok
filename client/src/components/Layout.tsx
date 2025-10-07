import React from 'react';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useAuth } from './AuthProvider';
import { isDevMode } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, LogOut, Shield } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, isAuthenticated, login, logout } = useAuth();
  const isDev = isDevMode();

  const getUserInitials = (name?: string, email?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return 'U';
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar - Desktop: w-64, Mobile: overlay */}
      <Sidebar />
      
      {/* Main content area with header */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header with auth UI */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                Content Generation Platform
              </h1>
            </div>
            
            {/* Auth UI */}
            <div className="flex items-center space-x-4">
              {isDev && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded-md" data-testid="badge-dev-mode">
                  <Shield className="h-4 w-4 text-amber-600 dark:text-amber-500" />
                  <span className="text-xs font-medium text-amber-800 dark:text-amber-400">
                    Dev Mode
                  </span>
                </div>
              )}
              
              {isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-9 w-9 rounded-full"
                      data-testid="dropdown-user-menu"
                    >
                      <Avatar className="h-9 w-9" data-testid="avatar-user">
                        {user.profileImage && (
                          <AvatarImage 
                            src={user.profileImage} 
                            alt={user.name || user.email} 
                          />
                        )}
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getUserInitials(user.name, user.email)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        {user.name && (
                          <p className="text-sm font-medium leading-none" data-testid="user-name">
                            {user.name}
                          </p>
                        )}
                        <p className="text-xs leading-none text-muted-foreground" data-testid="user-email">
                          {user.email}
                        </p>
                        {isDev && (
                          <p className="text-xs leading-none text-amber-600 dark:text-amber-500 pt-1">
                            Development User
                          </p>
                        )}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={logout}
                      className="cursor-pointer"
                      data-testid="button-logout"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                !isDev && (
                  <Button 
                    onClick={login}
                    variant="default"
                    size="sm"
                    className="gap-2"
                    data-testid="button-sign-in"
                  >
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">Sign In</span>
                  </Button>
                )
              )}
            </div>
          </div>
        </header>
        
        {/* Page content */}
        <main className="flex-1 overflow-y-auto w-full">
          <div className="p-6 lg:p-8">
            {children}
            <Footer />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;