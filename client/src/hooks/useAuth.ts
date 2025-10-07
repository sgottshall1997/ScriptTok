import { useAuth as useClerkAuth, useUser } from "@clerk/clerk-react";

export function useAuth() {
  try {
    const { isSignedIn, isLoaded } = useClerkAuth();
    const { user } = useUser();

    return {
      user,
      isLoading: !isLoaded,
      isAuthenticated: !!isSignedIn,
    };
  } catch (error) {
    console.warn("⚠️ Clerk hooks unavailable - auth disabled:", error);
    return {
      user: null,
      isLoading: false,
      isAuthenticated: false,
    };
  }
}
