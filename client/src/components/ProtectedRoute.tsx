import { FC } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Redirect, Route } from "wouter";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  component: React.ComponentType;
  path?: string;
}

const ProtectedRoute: FC<ProtectedRouteProps> = ({ component: Component, path }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  return (
    <Route
      path={path}
      component={() => {
        if (!user) {
          return <Redirect to="/auth" />;
        }
        return <Component />;
      }}
    />
  );
};

export default ProtectedRoute;