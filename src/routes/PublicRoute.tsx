import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";

export default function PublicRoute() {
  const { isAuthenticated, isCheckingAuth } = useAuthStore();

  // Mientras Supabase verifica la sesión en storage, no redirigimos todavía
  if (isCheckingAuth) return null;

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
