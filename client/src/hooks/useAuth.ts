import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

export function useAuth() {
  const { user, isLoading, isAuthenticated } = useSupabaseAuth();
  
  return {
    user,
    isLoading,
    isAuthenticated,
  };
}
