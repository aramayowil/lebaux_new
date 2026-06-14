import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { supabase } from "@/lib/supabaseClient";
import { useEffect } from "react";
import { useMisPermisos } from "@/hooks/usuarios/useMiPerfil";
import type { SeccionPermiso } from "@/types/index";

// Mapea el path actual a la sección de permisos que le corresponde
function getSeccion(pathname: string): SeccionPermiso | null {
  if (pathname.startsWith("/inicio")) return "inicio";
  if (pathname.startsWith("/obras")) return "obras";
  if (pathname.startsWith("/productos")) return "productos";
  if (pathname.startsWith("/catalogos") || pathname.startsWith("/importar"))
    return "catalogos";
  if (pathname.startsWith("/opciones")) return "opciones";
  if (pathname.startsWith("/usuarios")) return "usuarios";
  // Rutas sin permiso asociado (ej: /calculadora) -> siempre permitidas
  return null;
}

export default function ProtectedRoute() {
  const { isAuthenticated, setSession, isCheckingAuth } = useAuthStore();
  const location = useLocation();
  const { perfil, puede, isLoading: cargandoPermisos } = useMisPermisos();

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

  // 3. Esperar a que cargue el perfil/permisos antes de decidir acceso
  if (cargandoPermisos) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-black gap-3">
        <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono text-zinc-400 animate-pulse tracking-widest uppercase">
          Verificando permisos...
        </p>
      </div>
    );
  }

  // 4. Cuenta sin rol asignado / desactivada -> pantalla de espera
  if (perfil && !perfil.activo) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-black gap-3 text-center px-6">
        <div className="w-12 h-12 rounded-full border-4 border-amber-500 flex items-center justify-center">
          <span className="text-amber-500 text-xl font-bold">!</span>
        </div>
        <p className="text-zinc-200 font-semibold">
          Tu cuenta está pendiente de aprobación
        </p>
        <p className="text-xs text-zinc-500 max-w-sm">
          Un administrador debe asignarte un rol antes de que puedas acceder al
          sistema. Si creés que esto es un error, contactá al soporte.
        </p>
      </div>
    );
  }

  // 5. Verificación de permisos por sección
  const seccion = getSeccion(location.pathname);
  if (seccion && !puede(seccion, "ver")) {
    return <Navigate to="/inicio" replace />;
  }

  // 6. Al remover el estado "isNavigatingAndChecking", la app renderiza
  // inmediatamente el AppLayout y las páginas sin intermediarios negros.
  return <Outlet />;
}
