import { useAuth as useClerkAuth, useUser } from "@clerk/clerk-react";

export function useAuth() {
  const { isSignedIn, isLoaded } = useClerkAuth();
  const { user } = useUser();

  return {
    user,
    isLoading: !isLoaded,
    isAuthenticated: !!isSignedIn,
  };
}
