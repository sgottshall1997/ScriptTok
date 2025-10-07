/**
 * Frontend Authentication Library
 * Provides environment-aware authentication utilities with dev/prod mode detection
 * and Replit Auth integration
 */

/**
 * User type definition for authentication
 */
export interface User {
  id: string | number;
  email: string;
  name?: string;
  profileImage?: string;
  isAuthenticated: boolean;
}

/**
 * ReplitAuth interface for window object
 */
declare global {
  interface Window {
    ReplitAuth?: {
      login: () => void;
      logout: () => void;
      getUserInfo: () => Promise<{
        id: string | number;
        email: string;
        name?: string;
        profileImage?: string;
      } | null>;
    };
  }
}

/**
 * Checks if the application is running in development mode
 * 
 * @returns {boolean} True if in development environment, false otherwise
 * 
 * @example
 * if (isDevMode()) {
 *   console.log('Running in development mode');
 * }
 */
export function isDevMode(): boolean {
  const isLocalhost = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || 
     window.location.hostname === '127.0.0.1' ||
     window.location.hostname.includes('.local'));
  
  const isDevEnv = import.meta.env.VITE_APP_ENV === 'development';
  
  const isDev = isLocalhost || isDevEnv;
  
  console.log('[Auth] Environment check:', {
    hostname: typeof window !== 'undefined' ? window.location.hostname : 'N/A',
    VITE_APP_ENV: import.meta.env.VITE_APP_ENV,
    isLocalhost,
    isDevEnv,
    isDev
  });
  
  return isDev;
}

/**
 * Alias for isDevMode()
 * Checks if the application is running in development mode
 * 
 * @returns {boolean} True if in development environment, false otherwise
 * 
 * @example
 * if (isDevelopment()) {
 *   console.log('Running in development mode');
 * }
 */
export function isDevelopment(): boolean {
  return isDevMode();
}

/**
 * Gets the current authenticated user
 * 
 * In development mode: Returns a mock user for testing
 * In production mode: Returns null (to be populated by Replit Auth)
 * 
 * @returns {User | null} User object if authenticated, null otherwise
 * 
 * @example
 * const user = getCurrentUser();
 * if (user?.isAuthenticated) {
 *   console.log('User is logged in:', user.email);
 * }
 */
export function getCurrentUser(): User | null {
  const devMode = isDevMode();
  
  if (devMode) {
    const mockUser: User = {
      id: 1,
      email: 'dev@example.com',
      name: 'Dev User',
      isAuthenticated: true
    };
    
    console.log('[Auth] Returning mock user for development:', mockUser);
    return mockUser;
  }
  
  console.log('[Auth] Production mode - returning null (Replit Auth should populate this)');
  return null;
}

/**
 * Initiates the login process
 * 
 * In development mode: Logs a message (auto-login is handled by mock user)
 * In production mode: Triggers Replit Auth login flow
 * 
 * @example
 * login();
 */
export function login(): void {
  const devMode = isDevMode();
  
  if (devMode) {
    console.log('[Auth] Development mode - auto-login enabled. Mock user is automatically authenticated.');
    console.log('[Auth] In production, this would trigger Replit Auth login flow.');
    return;
  }
  
  console.log('[Auth] Production mode - triggering Replit Auth login');
  
  if (typeof window !== 'undefined' && window.ReplitAuth?.login) {
    try {
      window.ReplitAuth.login();
      console.log('[Auth] Replit Auth login initiated');
    } catch (error) {
      console.error('[Auth] Failed to initiate Replit Auth login:', error);
    }
  } else {
    console.warn('[Auth] Replit Auth is not available on window object');
  }
}

/**
 * Initiates the logout process
 * 
 * In development mode: Logs a message (mock user persists for development)
 * In production mode: Triggers Replit Auth logout flow
 * 
 * @example
 * logout();
 */
export function logout(): void {
  const devMode = isDevMode();
  
  if (devMode) {
    console.log('[Auth] Development mode - logout called. Mock user will persist for development.');
    console.log('[Auth] In production, this would trigger Replit Auth logout flow.');
    return;
  }
  
  console.log('[Auth] Production mode - triggering Replit Auth logout');
  
  if (typeof window !== 'undefined' && window.ReplitAuth?.logout) {
    try {
      window.ReplitAuth.logout();
      console.log('[Auth] Replit Auth logout initiated');
    } catch (error) {
      console.error('[Auth] Failed to initiate Replit Auth logout:', error);
    }
  } else {
    console.warn('[Auth] Replit Auth is not available on window object');
  }
}
