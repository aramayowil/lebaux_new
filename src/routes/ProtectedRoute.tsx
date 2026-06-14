import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { supabase } from "@/lib/supabaseClient";
import { useEffect } from "react";
import { useMisPermisos } from "@/hooks/usuarios/useMiPerfil";
import type { SeccionPermiso } from "@/types/index";

// Mapa path → sección de permiso
const SECCION_MAP: { prefix: string; seccion: SeccionPermiso }[] = [
  { prefix: "/inicio", seccion: "inicio" },
  { prefix: "/obras", seccion: "obras" },
  { prefix: "/productos", seccion: "productos" },
  { prefix: "/catalogos", seccion: "catalogos" },
  { prefix: "/importar", seccion: "catalogos" },
  { prefix: "/opciones", seccion: "opciones" },
  { prefix: "/usuarios", seccion: "usuarios" },
];

// Orden en que se busca el primer destino disponible tras el login
const DESTINOS_PREFERIDOS: { seccion: SeccionPermiso; path: string }[] = [
  { seccion: "inicio", path: "/inicio" },
  { seccion: "obras", path: "/obras" },
  { seccion: "productos", path: "/productos" },
  { seccion: "catalogos", path: "/catalogos" },
  { seccion: "usuarios", path: "/usuarios" },
  { seccion: "opciones", path: "/opciones" },
];

function getSeccion(pathname: string): SeccionPermiso | null {
  const match = SECCION_MAP.find((m) => pathname.startsWith(m.prefix));
  return match?.seccion ?? null;
}

// Spinner reutilizable
function Loader({ mensaje }: { mensaje: string }) {
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-black gap-3">
      <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-xs font-mono text-zinc-400 animate-pulse tracking-widest uppercase">
        {mensaje}
      </p>
    </div>
  );
}

export default function ProtectedRoute() {
  const { isAuthenticated, setSession, isCheckingAuth } = useAuthStore();
  const location = useLocation();
  const { perfil, puede, isLoading: cargandoPermisos } = useMisPermisos();

  // Verifica sesión en storage silenciosamente al cambiar de ruta
  useEffect(() => {
    if (!isAuthenticated) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) setSession(null);
    });
  }, [location.pathname, isAuthenticated, setSession]);

  // 1. Verificando sesión al arrancar
  if (isCheckingAuth) return <Loader mensaje="Iniciando sistema..." />;

  // 2. Sin sesión → login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Cargando perfil y permisos
  if (cargandoPermisos) return <Loader mensaje="Verificando permisos..." />;

  // 4. Cuenta inactiva / pendiente de aprobación
  if (perfil && !perfil.activo) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-black gap-4 text-center px-6">
        <div className="w-14 h-14 rounded-2xl border-2 border-amber-500/40 bg-amber-500/10 flex items-center justify-center">
          <span className="text-amber-400 text-2xl font-black">!</span>
        </div>
        <div className="space-y-2 max-w-sm">
          <p className="text-zinc-100 font-bold text-base">
            Cuenta pendiente de aprobación
          </p>
          <p className="text-zinc-500 text-xs leading-relaxed">
            Un administrador debe asignarte un rol y activar tu cuenta antes de
            que puedas ingresar al sistema.
          </p>
        </div>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            setSession(null);
          }}
          className="mt-2 text-xs text-zinc-600 hover:text-zinc-400 underline underline-offset-4 transition-colors"
        >
          Cerrar sesión
        </button>
      </div>
    );
  }

  // 5. Verificación de permiso para la sección actual
  const seccion = getSeccion(location.pathname);

  if (seccion && !puede(seccion, "ver")) {
    // Redirige a SinPermisosPage en lugar de un loop a /inicio
    return (
      <Navigate
        to="/sin-permisos"
        state={{ seccion, from: location.pathname }}
        replace
      />
    );
  }

  // 6. Si está en la raíz "/" → buscar el primer destino al que tiene acceso
  if (location.pathname === "/") {
    const destino = DESTINOS_PREFERIDOS.find((d) => puede(d.seccion, "ver"));
    if (destino) {
      return <Navigate to={destino.path} replace />;
    }
    // No tiene acceso a nada → sin permisos
    return <Navigate to="/sin-permisos" replace />;
  }

  return <Outlet />;
}
