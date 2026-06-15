import { Tabs, Tab, Button, Skeleton } from "@heroui/react";
import { ShieldCheck, Users, ShieldAlert, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import UsuariosTab from "@/components/usuarios/UsuariosTab";
import RolesPermisosTab from "@/components/usuarios/RolesPermisosTab";
import { usePuede } from "@/hooks/usuarios/useMiPerfil";

export default function ControlAccesoPage() {
  const puedeVerUsuarios = usePuede("usuarios", "ver");
  const navigate = useNavigate();

  const isPerfilLoading = false;

  // ── SKELETON ESTRUCTURAL ───────────────────────────
  if (isPerfilLoading) {
    return (
      <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950">
        <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-2 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-steel-900 shrink-0">
          <div className="space-y-2 w-full max-w-sm py-1.5">
            <Skeleton className="h-7 w-3/5 rounded-xl" />
            <Skeleton className="h-3 w-5/6 rounded-lg" />
          </div>
        </header>
        <div className="flex-1 p-5">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex gap-6 border-b border-zinc-200 dark:border-zinc-800 pt-4 pb-2">
              <Skeleton className="h-5 w-24 rounded-lg" />
              <Skeleton className="h-5 w-32 rounded-lg" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <CardSkeletonMini key={i} />
              ))}
            </div>
            <Skeleton className="h-14 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // ── ESTADO PROTEGIDO: SIN ACCESO ──────────────────
  if (!puedeVerUsuarios) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 bg-zinc-50 dark:bg-zinc-950 animate-in fade-in zoom-in-95 duration-400">
        <div className="flex flex-col items-center text-center max-w-md p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-none">
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

  // ── RENDER PRINCIPAL DE LA INTERFAZ ─────────────────────────────────
  return (
    <div className="flex flex-col h-full">
      {/* Header Unificado y Consistente (Sticky y Full-Bleed) */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-2 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-steel-900 shrink-0">
        <div>
          <h2 className="text-2xl font-black text-zinc-800 dark:text-zinc-100 tracking-tight">
            Control de Acceso
          </h2>
          <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-1 font-medium">
            Administración de credenciales de personal, asignación de roles de
            taller y auditoría de permisos.
          </p>
        </div>
      </header>

      {/* Área de Contenido Scrollable */}
      <div className="flex-1 overflow-auto bg-zinc-50 dark:bg-zinc-950 p-5">
        <div className="max-w-7xl mx-auto pb-10 animate-in fade-in duration-400">
          <Tabs
            variant="underlined"
            aria-label="Secciones de control de acceso"
            classNames={{
              tabList:
                "border-b border-zinc-200/80 dark:border-zinc-800/60 w-full gap-4 px-1",
              cursor: "bg-amber-500 h-[2px]",
              tab: "max-w-fit px-1 h-11",
              tabContent: [
                "text-zinc-400 dark:text-zinc-500",
                "font-bold text-xs uppercase tracking-wider",
                "group-data-[selected=true]:text-amber-500 dark:group-data-[selected=true]:text-amber-400",
                "transition-colors duration-200",
              ].join(" "),
            }}
          >
            {/* Pestaña 1: Gestión de Operadores */}
            <Tab
              key="usuarios"
              title={
                <div className="flex items-center gap-2">
                  <Users size={14} strokeWidth={2.5} />
                  <span>Usuarios</span>
                </div>
              }
            >
              <div className="mt-4 animate-in fade-in duration-300">
                <UsuariosTab />
              </div>
            </Tab>

            {/* Pestaña 2: Matriz de Roles y Permisos */}
            <Tab
              key="roles"
              title={
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} strokeWidth={2.5} />
                  <span>Roles y Permisos</span>
                </div>
              }
            >
              <div className="mt-4 animate-in fade-in duration-300">
                <RolesPermisosTab />
              </div>
            </Tab>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

// ── COMPONENTE AUXILIAR ─────────────────────
function CardSkeletonMini() {
  return (
    <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl p-4 space-y-2">
      <Skeleton className="h-6 w-1/3 rounded-lg" />
      <Skeleton className="h-3 w-1/2 rounded-md" />
    </div>
  );
}
