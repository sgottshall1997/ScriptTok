import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

// Types for user authentication
type User = {
  id: number;
  username: string;
  email?: string;
  role: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
  status: string;
  lastLogin?: Date;
  loginCount?: number;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<LoginResponse, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<RegisterResponse, Error, RegisterData>;
  isAuthenticated: boolean;
};

type LoginData = {
  username: string;
  password: string;
};

type RegisterData = {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
};

type LoginResponse = {
  message: string;
  user: User;
  token: string;
};

type RegisterResponse = {
  message: string;
  user: User;
  token: string;
};

// Create the authentication context
export const AuthContext = createContext<AuthContextType | null>(null);

// Authentication provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );

  // Query to get the current user information
  const {
    data: user,
    error,
    isLoading,
    refetch,
  } = useQuery<User | null, Error>({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      if (!token) return null;

      try {
        const res = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });

        if (res.status === 401) {
          // Token is invalid or expired
          localStorage.removeItem("token");
          setToken(null);
          return null;
        }

        if (!res.ok) {
          throw new Error("Failed to get user information");
        }

        return await res.json();
      } catch (error: any) {
        throw new Error(error.message || "Failed to get user information");
      }
    },
    enabled: !!token, // Only run query if token exists
    retry: false,
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(credentials),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Login failed");
      }

      return await res.json();
    },
    onSuccess: (data: LoginResponse) => {
      // Store token in localStorage
      localStorage.setItem("token", data.token);
      setToken(data.token);
      
      // Update the user data in the cache
      queryClient.setQueryData(["/api/auth/me"], data.user);
      
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterData) => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(userData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.message || 
          (errorData.errors && errorData.errors.length > 0 
            ? errorData.errors[0].message 
            : "Registration failed")
        );
      }

      return await res.json();
    },
    onSuccess: (data: RegisterResponse) => {
      // Store token in localStorage
      localStorage.setItem("token", data.token);
      setToken(data.token);
      
      // Update the user data in the cache
      queryClient.setQueryData(["/api/auth/me"], data.user);
      
      toast({
        title: "Registration successful",
        description: "Your account has been created!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      // No API call needed for logout, we just remove the token
      localStorage.removeItem("token");
      setToken(null);
      queryClient.setQueryData(["/api/auth/me"], null);
    },
    onSuccess: () => {
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Effect to refetch user data when token changes
  useEffect(() => {
    if (token) {
      refetch();
    }
  }, [token, refetch]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}