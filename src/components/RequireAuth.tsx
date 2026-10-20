import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading, demoAccountType } = useAuth();
  const location = useLocation();

  if (loading) {
    return <p className="py-10 text-center text-sm text-muted-foreground">Checking your account…</p>;
  }
  if (!user && !demoAccountType) return <Navigate to="/auth" replace state={{ from: location }} />;
  return children;
}
