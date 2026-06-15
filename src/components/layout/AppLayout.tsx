import { Outlet, NavLink } from "react-router-dom";
import { useState } from "react";
import {
  Home,
  FolderOpen,
  Layers,
  BookOpen,
  Settings,
  Bell,
  FolderUp,
  Sun,
  Moon,
  User,
  CreditCard,
  LogOut,
  HelpCircle,
  MessageSquare,
  ShieldCheck,
  PanelLeftOpen,
} from "lucide-react";
import {
  Tooltip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
  Badge,
} from "@heroui/react";
import { useTheme } from "@/hooks/useTheme";
import clsx from "clsx";
import { useAuth } from "@/context/AuthContext";
import { useMisPermisos } from "@/hooks/usuarios/useMiPerfil";
import type { SeccionPermiso } from "@/types/index";

const NAV: {
  to: string;
  icon: typeof Home;
  label: string;
  seccion: SeccionPermiso;
}[] = [
  { to: "/inicio", icon: Home, label: "Dashboard", seccion: "inicio" },
  { to: "/obras", icon: FolderOpen, label: "Obras", seccion: "obras" },
  { to: "/productos", icon: Layers, label: "Productos", seccion: "productos" },
  {
    to: "/catalogos",
    icon: BookOpen,
    label: "Catálogos",
    seccion: "catalogos",
  },
  { to: "/importar", icon: FolderUp, label: "Importar", seccion: "catalogos" },
  {
    to: "/usuarios",
    icon: ShieldCheck,
    label: "Usuarios",
    seccion: "usuarios",
  },
  { to: "/opciones", icon: Settings, label: "Opciones", seccion: "opciones" },
];

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { dark, toggle } = useTheme();
  const [hasNotifications, setHasNotifications] = useState(true);
  const { user: supabaseUser, logout } = useAuth();
  const { perfil, puede } = useMisPermisos();

  const URL_BASE_STORAGE = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/assets`;

  const user = {
    name:
      perfil?.nombre ||
      supabaseUser?.user_metadata?.full_name ||
      supabaseUser?.email?.split("@")[0] ||
      "Usuario",
    email: supabaseUser?.email || "",
    avatar: supabaseUser?.user_metadata?.avatar_url || "",
    rol: perfil?.roles?.nombre ?? "",
  };

  const navVisible = NAV.filter(({ seccion }) => puede(seccion, "ver"));

  return (
    <div className="flex h-screen overflow-hidden bg-steel-100 dark:bg-zinc-950">
      {/* ── Sidebar ── */}
      <aside
        className={clsx(
          "flex flex-col h-full",
          "bg-zinc-100 dark:bg-zinc-950 transition-all duration-200 ease-in-out shrink-0",
          collapsed ? "w-[64px]" : "w-[210px]",
        )}
      >
        {/* Logo + Toggle */}
        <div
          className={clsx(
            "flex items-center h-14 px-3 shrink-0",
            collapsed ? "justify-center" : "justify-between",
          )}
        >
          {/* Logo — cuando está colapsado muestra icono de expand en hover */}
          <button
            onClick={() => collapsed && setCollapsed(false)}
            className={clsx(
              "group relative flex items-center justify-center transition-all",
              collapsed ? "cursor-pointer w-7 h-7" : "cursor-default",
            )}
          >
            <img
              src={
                collapsed
                  ? `${URL_BASE_STORAGE}/logos/logo_recortado.png`
                  : `${URL_BASE_STORAGE}/logos/logo.png`
              }
              alt="Lebaux"
              className={clsx(
                "transition-all duration-200 object-contain select-none pointer-events-none",
                collapsed ? "w-7 h-7 group-hover:opacity-0" : "h-8",
                "mix-blend-multiply dark:mix-blend-normal",
              )}
            />
            {/* Ícono expand — solo visible en hover cuando colapsado */}
            {collapsed && (
              <PanelLeftOpen className="w-5 h-5 absolute inset-0 m-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-steel-500 dark:text-steel-400" />
            )}
          </button>

          {/* Botón collapse — solo visible cuando está expandido */}
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="p-1.5 rounded-lg text-steel-400 hover:text-steel-700 dark:hover:text-steel-200 hover:bg-steel-100 dark:hover:bg-steel-800 transition-colors"
              aria-label="Colapsar sidebar"
            >
              <PanelLeftOpen className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Nav links */}
        <nav className="flex-1 py-3 px-2 flex flex-col gap-0.5 overflow-y-auto">
          {navVisible.map(({ to, icon: Icon, label }) => (
            <Tooltip
              key={to}
              content={label}
              placement="right"
              isDisabled={!collapsed}
              delay={300}
            >
              <NavLink
                to={to}
                className={({ isActive }) =>
                  clsx(
                    "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                    collapsed && "justify-center px-0 h-9",
                    isActive
                      ? "bg-lebaux-amber/10 text-lebaux-amber font-semibold"
                      : "text-steel-500 dark:text-steel-400 hover:bg-steel-100 dark:hover:bg-steel-800 hover:text-steel-800 dark:hover:text-steel-100",
                  )
                }
              >
                {({ isActive }: { isActive: boolean }) => (
                  <>
                    {isActive && !collapsed && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r bg-lebaux-amber" />
                    )}
                    <Icon className="w-4.5 h-4.5 shrink-0" strokeWidth={1.8} />
                    {!collapsed && <span>{label}</span>}
                  </>
                )}
              </NavLink>
            </Tooltip>
          ))}
        </nav>

        {/* Bottom — Notificaciones + Avatar */}
        <div
          className={clsx(
            "px-2 pb-3 pt-2 flex flex-col gap-1",
            "border-steel-100 dark:border-steel-800",
          )}
        >
          {/* Notificaciones */}
          <Tooltip
            content="Notificaciones"
            placement="right"
            isDisabled={!collapsed}
            delay={300}
          >
            <button
              onClick={() => setHasNotifications(false)}
              className={clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all w-full",
                "text-steel-500 dark:text-steel-400 hover:bg-steel-100 dark:hover:bg-steel-800 hover:text-steel-800 dark:hover:text-steel-100",
                collapsed && "justify-center px-0 h-9",
              )}
            >
              <Badge
                content=""
                isInvisible={!hasNotifications}
                color="warning"
                size="sm"
                shape="circle"
                className="border-white dark:border-steel-900"
              >
                <Bell className="w-4.5 h-4.5 shrink-0" strokeWidth={1.8} />
              </Badge>
              {!collapsed && <span>Notificaciones</span>}
            </button>
          </Tooltip>

          {/* Avatar / User dropdown */}
          <Dropdown placement="top-start" closeOnSelect={true}>
            <DropdownTrigger>
              <button
                className={clsx(
                  "w-full flex items-center gap-3 rounded-lg p-1.5 text-sm font-medium transition-all text-left",
                  "text-steel-700 dark:text-steel-200 hover:bg-steel-100 dark:hover:bg-steel-800",
                  collapsed && "justify-center",
                )}
              >
                <Avatar src={user.avatar} size="sm" name={user.name} />
                {!collapsed && (
                  <span className="flex-1 truncate text-sm font-medium">
                    {user.name}
                  </span>
                )}
              </button>
            </DropdownTrigger>

            <DropdownMenu
              aria-label="User actions"
              variant="bordered"
              className="w-56 rounded-xl"
            >
              <DropdownItem
                key="profile-header"
                className="h-14 gap-2 opacity-100 cursor-default pointer-events-none border-b border-steel-100 dark:border-steel-800"
              >
                <div className="flex items-center gap-2">
                  <Avatar src={user.avatar} className="w-5 h-5 text-xs" />
                  <div className="flex flex-col">
                    <p className="font-semibold text-sm text-steel-900 dark:text-steel-100">
                      {user.name}
                    </p>
                    {user.rol && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-lebaux-amber">
                        {user.rol}
                      </span>
                    )}
                  </div>
                </div>
              </DropdownItem>

              <DropdownItem
                key="profile"
                startContent={<User className="w-4 h-4" />}
              >
                Mi Perfil
              </DropdownItem>
              <DropdownItem
                key="billing"
                startContent={<CreditCard className="w-4 h-4" />}
              >
                Facturación
              </DropdownItem>

              <DropdownItem
                key="theme"
                closeOnSelect={false}
                onClick={toggle}
                startContent={
                  dark ? (
                    <Sun className="w-4 h-4 text-lebaux-amber" />
                  ) : (
                    <Moon className="w-4 h-4" />
                  )
                }
              >
                {dark ? "Modo claro" : "Modo oscuro"}
              </DropdownItem>

              <DropdownItem
                key="feedback"
                startContent={<MessageSquare className="w-4 h-4" />}
              >
                Feedback
              </DropdownItem>
              <DropdownItem
                key="support"
                startContent={<HelpCircle className="w-4 h-4" />}
              >
                Ayuda & Soporte
              </DropdownItem>

              <DropdownItem
                key="logout"
                className="text-danger"
                color="danger"
                startContent={<LogOut className="w-4 h-4" />}
                onPress={logout}
              >
                Cerrar sesión
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </aside>

      <main className="flex-1 overflow-hidden pt-3">
        <div className="w-full h-full bg-white dark:bg-steel-900 border-t border-l border-steel-100 dark:border-steel-800 rounded-tl-lg shadow-sm overflow-auto scrollbar-thin">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
