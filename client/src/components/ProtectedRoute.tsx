import { FC } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Redirect, Route, RouteProps } from "wouter";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps extends RouteProps {
  component: React.ComponentType;
}

const ProtectedRoute: FC<ProtectedRouteProps> = ({ component: Component, ...rest }) => {
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
      {...rest}
      component={props =>
        user ? (
          <Component {...props} />
        ) : (
          <Redirect to="/auth" />
        )
      }
    />
  );
};

export default ProtectedRoute;