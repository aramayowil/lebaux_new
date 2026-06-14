import { useNavigate, useLocation } from "react-router-dom";
import { ShieldOff, Home, ArrowLeft, LogOut } from "lucide-react";
import { Button } from "@heroui/react";
import { useAuthStore } from "@/store/useAuthStore";
import { useMisPermisos } from "@/hooks/usuarios/useMiPerfil";
import type { SeccionPermiso } from "@/types/index";

const SECCIONES: { key: SeccionPermiso; path: string; label: string }[] = [
  { key: "inicio", path: "/inicio", label: "Inicio" },
  { key: "obras", path: "/obras", label: "Obras" },
  { key: "productos", path: "/productos", label: "Productos" },
  { key: "catalogos", path: "/catalogos", label: "Catálogos" },
  { key: "opciones", path: "/opciones", label: "Opciones" },
  { key: "usuarios", path: "/usuarios", label: "Usuarios" },
];

export default function SinPermisosPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuthStore();
  const { puede, perfil } = useMisPermisos();

  // Primera sección a la que SÍ tiene acceso
  const primeraDisponible = SECCIONES.find((s) => puede(s.key, "ver"));

  // La sección que intentó visitar (si viene del state)
  const intentoVisitar = (location.state as { seccion?: string })?.seccion;

  const handleVolver = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else if (primeraDisponible) {
      navigate(primeraDisponible.path, { replace: true });
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="h-full flex items-center justify-center p-6 bg-zinc-50 dark:bg-zinc-950/40">
      <div className="flex flex-col items-center text-center max-w-sm w-full gap-8 animate-in fade-in zoom-in-95 duration-400">
        {/* Ícono */}
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 flex items-center justify-center">
            <ShieldOff
              size={36}
              className="text-red-400 dark:text-red-500"
              strokeWidth={1.5}
            />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
            <span className="text-white text-xs font-black">!</span>
          </div>
        </div>

        {/* Texto */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-red-400">
            Acceso restringido
          </p>
          <h2 className="text-2xl font-black text-zinc-800 dark:text-zinc-100 tracking-tight">
            Sin permiso
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-[280px] mx-auto">
            {intentoVisitar ? (
              <>
                Tu perfil{" "}
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                  {perfil?.roles?.nombre ?? "actual"}
                </span>{" "}
                no tiene acceso a{" "}
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                  {intentoVisitar}
                </span>
                .
              </>
            ) : (
              <>
                Tu perfil{" "}
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                  {perfil?.roles?.nombre ?? "actual"}
                </span>{" "}
                no tiene permiso para ver esta sección.
              </>
            )}
          </p>
        </div>

        {/* Acciones */}
        <div className="flex flex-col gap-3 w-full">
          {/* Volver atrás */}
          <Button
            onPress={handleVolver}
            startContent={<ArrowLeft size={15} />}
            className="w-full h-11 font-bold text-sm bg-zinc-800 text-zinc-100 hover:bg-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-xl transition-colors"
          >
            Volver
          </Button>

          {/* Ir a la primera sección disponible */}
          {primeraDisponible && (
            <Button
              onPress={() =>
                navigate(primeraDisponible.path, { replace: true })
              }
              startContent={<Home size={15} />}
              variant="flat"
              className="w-full h-11 font-bold text-sm rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            >
              Ir a {primeraDisponible.label}
            </Button>
          )}

          {/* Cerrar sesión */}
          <Button
            onPress={handleLogout}
            startContent={<LogOut size={14} />}
            variant="light"
            className="w-full h-9 font-semibold text-xs text-zinc-400 hover:text-red-400 transition-colors"
          >
            Cerrar sesión
          </Button>
        </div>

        {/* Footer */}
        <p className="text-[10px] text-zinc-400 dark:text-zinc-600">
          Contactá a un administrador si creés que esto es un error.
        </p>
      </div>
    </div>
  );
}
