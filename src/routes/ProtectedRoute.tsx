import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { supabase } from "@/lib/supabaseClient";
import { useEffect } from "react";

export default function ProtectedRoute() {
  const { isAuthenticated, setSession, isCheckingAuth } = useAuthStore();
  const location = useLocation();

  // 🔥 VERIFICACIÓN EN SEGUNDO PLANO (Sin bloquear el renderizado)
  useEffect(() => {
    const verificarStorageSilencioso = async () => {
      if (isAuthenticated) {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        // Si detecta corrupción o borrado manual, limpia Zustand en silencio
        // y el próximo ciclo de renderizado lo va a mandar al /login automáticamente
        if (!session) {
          setSession(null);
        }
      }
    };

    verificarStorageSilencioso();
  }, [location.pathname, isAuthenticated, setSession]); // Revisa al cambiar de ruta

  // 1. Esto SOLO se muestra una vez al cargar la app de cero (F5)
  if (isCheckingAuth) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-black gap-3">
        <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono text-zinc-400 animate-pulse tracking-widest uppercase">
          Iniciando sistema...
        </p>
      </div>
    );
  }

  // 2. Si no está autenticado, directo al login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Al remover el estado "isNavigatingAndChecking", la app renderiza
  // inmediatamente el AppLayout y las páginas sin intermediarios negros.
  return <Outlet />;
}
