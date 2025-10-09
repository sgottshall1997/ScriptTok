import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LoginModal } from './LoginModal';

export interface User {
  id: string | number;
  email: string;
  name?: string;
  profileImage?: string;
  isAuthenticated: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  async function checkAuthStatus() {
    try {
      console.log('[AuthProvider] Checking auth status via /api/auth/me');
      setIsLoading(true);
      
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        console.warn('[AuthProvider] Auth check failed:', response.status);
        setUser(null);
        setIsLoading(false);
        return;
      }
      
      const data = await response.json();
      
      if (data.authenticated && data.user) {
        const authenticatedUser: User = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          profileImage: data.user.profileImage,
          isAuthenticated: true
        };
        
        setUser(authenticatedUser);
        console.log('[AuthProvider] ✅ User authenticated:', {
          id: authenticatedUser.id,
          email: authenticatedUser.email,
          name: authenticatedUser.name
        });
      } else {
        console.log('[AuthProvider] ⚠️ Not authenticated');
        setUser(null);
      }
    } catch (error) {
      console.error('[AuthProvider] ❌ Error checking auth status:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  function handleLogin() {
    console.log('[AuthProvider] Login requested - opening login modal');
    setShowLoginModal(true);
  }

  async function handleLogout() {
    try {
      console.log('[AuthProvider] Logout requested - redirecting to Replit logout');
      setIsLoading(true);
      
      // Redirect to OpenID Connect logout endpoint
      // This will log out of Replit and redirect back to the app
      window.location.href = '/api/logout';
    } catch (error) {
      console.error('[AuthProvider] ❌ Logout error:', error);
      setIsLoading(false);
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: user?.isAuthenticated ?? false,
    login: handleLogin,
    logout: handleLogout
  };

  console.log('[AuthProvider] Current auth state:', {
    hasUser: !!user,
    isLoading,
    isAuthenticated: value.isAuthenticated
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
      <LoginModal 
        open={showLoginModal} 
        onOpenChange={setShowLoginModal}
      />
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    const error = new Error('useAuth must be used within an AuthProvider');
    console.error('[AuthProvider]', error.message);
    throw error;
  }
  
  return context;
}
