import { Tabs, Tab, Button } from "@heroui/react";
import { ShieldCheck, Users, ShieldAlert, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import UsuariosTab from "@/components/usuarios/UsuariosTab";
import RolesPermisosTab from "@/components/usuarios/RolesPermisosTab";
import { usePuede } from "@/hooks/usuarios/useMiPerfil";

export default function ControlAccesoPage() {
  const puedeVerUsuarios = usePuede("usuarios", "ver");
  const navigate = useNavigate();

  // ── Estado Protegido: Sin Acceso (UX Mejorada con Salida) ──────────
  if (!puedeVerUsuarios) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 bg-zinc-50/50 dark:bg-zinc-950/50 animate-in fade-in zoom-in-95 duration-400">
        <div className="flex flex-col items-center text-center max-w-md p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-xl shadow-zinc-200/20 dark:shadow-none">
          <div className="p-4 bg-red-500/10 dark:bg-red-500/5 rounded-2xl mb-5 ring-4 ring-red-500/5">
            <ShieldAlert className="w-8 h-8 text-red-500" strokeWidth={1.5} />
          </div>
          <h3 className="text-base font-black text-zinc-800 dark:text-zinc-100 uppercase tracking-widest">
            Acceso Restringido
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-3 leading-relaxed max-w-[280px]">
            Tu perfil actual no dispone de las credenciales de lectura
            necesarias para auditar el control de accesos.
          </p>
          <Button
            onPress={() => navigate("/")}
            variant="flat"
            className="mt-8 font-bold text-xs bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-xl h-10 px-6 transition-colors"
            startContent={<ArrowLeft size={14} />}
          >
            Volver al inicio
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950/40">
      {/* ── Header Glassmorphism (Más inmersivo) ──────────────────────── */}
      <header className="sticky top-0 z-30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 dark:bg-steel-900/90 backdrop-blur-md px-6 py-5 border-b border-zinc-200/80 dark:border-zinc-800/80 shrink-0 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-zinc-800 dark:text-zinc-100 tracking-tight">
            Control de Acceso
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1 font-medium">
            Administración de credenciales de personal, asignación de roles de
            taller y auditoría de permisos.
          </p>
        </div>
      </header>

      {/* ── Área Principal de Contenido ────────────────────────────────── */}
      <div className="flex-1 overflow-auto p-4 md:px-6 md:pt-0">
        <div className="max-w-7xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <Tabs
            variant="underlined"
            aria-label="Secciones de control de acceso"
            classNames={{
              // Hacemos que la barra de tabs flote al scrollear hacia abajo
              base: "sticky top-0 z-20 bg-zinc-50/90 dark:bg-zinc-950/90 backdrop-blur-md pt-4 pb-1",
              tabList: [
                "border-b border-zinc-200/80 dark:border-zinc-800/80",
                "w-full gap-6 sm:gap-8 px-1",
              ].join(" "),
              cursor:
                "bg-lebaux-amber h-[3px] rounded-full shadow-[0_1px_4px_rgba(245,158,11,0.4)]",
              tab: "max-w-fit px-2 h-12",
              tabContent: [
                "text-zinc-500 dark:text-zinc-400",
                "font-bold text-[11px] uppercase tracking-widest",
                "group-data-[selected=true]:text-lebaux-amber dark:group-data-[selected=true]:text-amber-400",
                "group-hover:text-zinc-800 dark:group-hover:text-zinc-200",
                "transition-all duration-300",
              ].join(" "),
              panel: "pt-6", // Separación entre los tabs pegajosos y el contenido
            }}
          >
            {/* Pestaña 1: Gestión de Operadores */}
            <Tab
              key="usuarios"
              title={
                <div className="flex items-center gap-2">
                  <Users size={14} strokeWidth={2.5} />
                  <span>Operadores</span>
                </div>
              }
            >
              <div className="animate-in fade-in duration-400">
                <UsuariosTab />
              </div>
            </Tab>

            {/* Pestaña 2: Matriz de Roles y Permisos Privados */}
            <Tab
              key="roles"
              title={
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} strokeWidth={2.5} />
                  <span>Roles y Permisos</span>
                </div>
              }
            >
              <div className="animate-in fade-in duration-400">
                <RolesPermisosTab />
              </div>
            </Tab>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
