import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, getCurrentUser, login as authLogin, logout as authLogout, isDevMode } from '@/lib/auth';

/**
 * Auth Context Type Definition
 */
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

/**
 * Auth Context
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider Props
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider Component
 * Provides authentication context to the application with dev/prod mode support
 * 
 * Dev Mode:
 * - Auto-login with mock user on mount
 * - Log authentication events
 * - No Replit Auth integration
 * 
 * Production Mode:
 * - Listen for Replit Auth ready event
 * - Get user from window.ReplitAuth.getUserInfo()
 * - Handle login/logout via auth library
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const devMode = isDevMode();
    
    console.log('[AuthProvider] Initializing authentication...', { devMode });

    if (devMode) {
      // Development Mode: Auto-login with mock user
      console.log('[AuthProvider] Development mode detected - auto-login enabled');
      
      try {
        const mockUser = getCurrentUser();
        
        if (mockUser) {
          setUser(mockUser);
          console.log('[AuthProvider] Mock user auto-logged in:', {
            id: mockUser.id,
            email: mockUser.email,
            name: mockUser.name,
            isAuthenticated: mockUser.isAuthenticated
          });
        } else {
          console.warn('[AuthProvider] No mock user available in development mode');
        }
      } catch (error) {
        console.error('[AuthProvider] Error setting mock user:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Production Mode: Listen for Replit Auth ready event
      console.log('[AuthProvider] Production mode detected - setting up Replit Auth');
      
      const initializeReplitAuth = async () => {
        try {
          if (typeof window !== 'undefined' && window.ReplitAuth) {
            console.log('[AuthProvider] Replit Auth available, fetching user info...');
            
            if (window.ReplitAuth.getUserInfo) {
              const userInfo = await window.ReplitAuth.getUserInfo();
              
              if (userInfo) {
                const replitUser: User = {
                  id: userInfo.id,
                  email: userInfo.email,
                  name: userInfo.name,
                  profileImage: userInfo.profileImage,
                  isAuthenticated: true
                };
                
                setUser(replitUser);
                console.log('[AuthProvider] Replit user authenticated:', {
                  id: replitUser.id,
                  email: replitUser.email,
                  name: replitUser.name
                });
              } else {
                console.log('[AuthProvider] No user info returned from Replit Auth');
                setUser(null);
              }
            } else {
              console.warn('[AuthProvider] Replit Auth getUserInfo method not available');
              setUser(null);
            }
          } else {
            console.warn('[AuthProvider] Replit Auth not available on window object');
            setUser(null);
          }
        } catch (error) {
          console.error('[AuthProvider] Error initializing Replit Auth:', error);
          setUser(null);
        } finally {
          setIsLoading(false);
        }
      };

      // Listen for Replit Auth ready event
      const handleReplitAuthReady = () => {
        console.log('[AuthProvider] Replit Auth ready event received');
        initializeReplitAuth();
      };

      // Check if Replit Auth is already available
      if (typeof window !== 'undefined' && window.ReplitAuth) {
        console.log('[AuthProvider] Replit Auth already available, initializing...');
        initializeReplitAuth();
      } else {
        // Wait for Replit Auth to be ready
        console.log('[AuthProvider] Waiting for Replit Auth ready event...');
        window.addEventListener('replitAuthReady', handleReplitAuthReady);
        
        // Fallback timeout in case event never fires
        const timeout = setTimeout(() => {
          console.warn('[AuthProvider] Replit Auth ready timeout - initializing anyway');
          initializeReplitAuth();
        }, 3000);

        return () => {
          window.removeEventListener('replitAuthReady', handleReplitAuthReady);
          clearTimeout(timeout);
        };
      }
    }
  }, []);

  /**
   * Login handler
   * Delegates to auth library which handles dev/prod mode
   */
  const handleLogin = () => {
    console.log('[AuthProvider] Login requested');
    
    try {
      authLogin();
      
      const devMode = isDevMode();
      if (devMode) {
        // In dev mode, immediately set mock user after login
        const mockUser = getCurrentUser();
        if (mockUser) {
          setUser(mockUser);
          console.log('[AuthProvider] Mock user logged in (dev mode):', mockUser.email);
        }
      } else {
        console.log('[AuthProvider] Replit Auth login initiated (prod mode)');
        // In prod mode, Replit Auth will trigger a re-render when user is authenticated
      }
    } catch (error) {
      console.error('[AuthProvider] Login error:', error);
    }
  };

  /**
   * Logout handler
   * Delegates to auth library which handles dev/prod mode
   */
  const handleLogout = () => {
    console.log('[AuthProvider] Logout requested');
    
    try {
      authLogout();
      
      const devMode = isDevMode();
      if (devMode) {
        console.log('[AuthProvider] Dev mode logout - mock user persists');
        // In dev mode, mock user persists for development
      } else {
        // In prod mode, clear user state
        setUser(null);
        console.log('[AuthProvider] User logged out (prod mode)');
      }
    } catch (error) {
      console.error('[AuthProvider] Logout error:', error);
    }
  };

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
    isAuthenticated: value.isAuthenticated,
    userId: user?.id,
    userEmail: user?.email
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth Hook
 * Custom hook to access auth context
 * 
 * @throws {Error} If used outside AuthProvider
 * 
 * @example
 * const { user, isAuthenticated, login, logout } = useAuth();
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    const error = new Error('useAuth must be used within an AuthProvider');
    console.error('[AuthProvider]', error.message);
    throw error;
  }
  
  return context;
}
