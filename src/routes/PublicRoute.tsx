import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

/**
 * Rutas públicas (login, register).
 * Si el usuario ya tiene sesión activa lo manda directo a /inicio.
 */
export default function PublicRoute() {
  const { isAuthenticated, isCheckingAuth } = useAuthStore();

  // Mientras Supabase verifica la sesión en storage, no redirigimos todavía
  if (isCheckingAuth) return null;

  if (isAuthenticated) {
    return <Navigate to="/inicio" replace />;
  }

  return <Outlet />;
}
