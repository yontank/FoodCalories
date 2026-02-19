import { accessTokenAtom } from "@/atoms/user";
import { useAtom } from "jotai";
import { Navigate } from "react-router";

type ProtectedRouteProps = {
  user?: string;
  children: React.ReactNode;
};

/**
 * A route that redirects the user back to the home page if they're not logged in.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [user] = useAtom(accessTokenAtom);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
