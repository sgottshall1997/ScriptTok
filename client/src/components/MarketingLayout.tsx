import { useState } from 'react';
import { Link } from 'wouter';
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
import { Menu, X, LogOut, Shield } from 'lucide-react';

interface MarketingLayoutProps {
  children: React.ReactNode;
}

const MarketingLayout: React.FC<MarketingLayoutProps> = ({ children }) => {
  const { user, isAuthenticated, login, logout } = useAuth();
  const isDev = isDevMode();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center" data-testid="link-home">
              <span className="text-xl font-bold text-gray-900">🎬 ScriptTok</span>
            </Link>

            {/* Desktop Navigation - Center */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/features" className="text-gray-700 hover:text-gray-900 font-medium transition-colors" data-testid="link-features">
                Features
              </Link>
              <Link href="/pricing" className="text-gray-700 hover:text-gray-900 font-medium transition-colors" data-testid="link-pricing">
                Pricing
              </Link>
            </div>

            {/* Desktop Auth UI + CTA - Right */}
            <div className="hidden md:flex items-center space-x-4">
              {isDev && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded-md" data-testid="badge-dev-mode">
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
                <Button 
                  onClick={login}
                  variant="ghost"
                  size="sm"
                  className="text-gray-700 hover:text-gray-900"
                  data-testid="button-login"
                >
                  Login
                </Button>
              )}

              <Button 
                className="bg-gradient-cta text-white rounded-xl hover:opacity-90 transition-opacity"
                size="sm"
                data-testid="button-get-started"
              >
                🚀 Get Started
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-2">
              {isDev && (
                <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 border border-amber-300 rounded-md" data-testid="badge-dev-mode-mobile">
                  <Shield className="h-3 w-3 text-amber-600" />
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                data-testid="button-mobile-menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-3 border-t border-gray-200" data-testid="mobile-menu">
              <Link 
                href="/features" 
                className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md font-medium"
                onClick={() => setMobileMenuOpen(false)}
                data-testid="link-features-mobile"
              >
                Features
              </Link>
              <Link 
                href="/pricing" 
                className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md font-medium"
                onClick={() => setMobileMenuOpen(false)}
                data-testid="link-pricing-mobile"
              >
                Pricing
              </Link>
              
              <div className="border-t border-gray-200 pt-3 space-y-2">
                {isAuthenticated && user ? (
                  <>
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium text-gray-900">{user.name || user.email}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <Button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      variant="ghost"
                      className="w-full justify-start text-gray-700"
                      data-testid="button-logout-mobile"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </Button>
                  </>
                ) : (
                  <Button 
                    onClick={() => {
                      login();
                      setMobileMenuOpen(false);
                    }}
                    variant="ghost"
                    className="w-full justify-start text-gray-700"
                    data-testid="button-login-mobile"
                  >
                    Login
                  </Button>
                )}
                
                <Button 
                  className="w-full bg-gradient-cta text-white rounded-xl hover:opacity-90 transition-opacity"
                  data-testid="button-get-started-mobile"
                >
                  🚀 Get Started
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="text-sm text-gray-600">
              © {new Date().getFullYear()} ScriptTok. All rights reserved.
            </div>
            <div className="flex items-center space-x-6">
              <Link href="/terms-billing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors" data-testid="link-terms">
                Terms
              </Link>
              <span className="text-gray-400">|</span>
              <Link href="/privacy-cookies" className="text-sm text-gray-600 hover:text-gray-900 transition-colors" data-testid="link-privacy">
                Privacy
              </Link>
              <span className="text-gray-400">|</span>
              <Link href="/contact" className="text-sm text-gray-600 hover:text-gray-900 transition-colors" data-testid="link-contact">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MarketingLayout;
