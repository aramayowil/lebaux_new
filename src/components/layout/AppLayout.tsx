import { Outlet, NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  Home,
  FolderOpen,
  Layers,
  BookOpen,
  Settings,
  Bell,
  Sun,
  Moon,
  ChevronsUpDown,
  User,
  CreditCard,
  LogOut,
  HelpCircle,
  MessageSquare,
  PanelRightClose,
  PanelRightOpen,
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
import { Button } from "@heroui/react";
import { useAuth } from "@/context/AuthContext";

const NAV = [
  { to: "/inicio", icon: Home, label: "Dashboard" },
  { to: "/obras", icon: FolderOpen, label: "Obras" },
  { to: "/productos", icon: Layers, label: "Productos" },
  { to: "/catalogos", icon: BookOpen, label: "Catálogos" },
  { to: "/opciones", icon: Settings, label: "Opciones" },
];

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { dark, toggle } = useTheme();
  const location = useLocation();
  const [hasNotifications, setHasNotifications] = useState(true);

  const { user: supabaseUser, logout } = useAuth();

  const user = {
    name:
      supabaseUser?.user_metadata?.full_name ||
      supabaseUser?.email?.split("@")[0] ||
      "Usuario",
    email: supabaseUser?.email || "",
    avatar: supabaseUser?.user_metadata?.avatar_url || "", // HeroUI usará la inicial si está vacío
  };

  return (
    <div className="flex h-screen overflow-hidden bg-steel-50 dark:bg-steel-950">
      {/* ── Sidebar ── */}
      <aside
        className={clsx(
          "flex flex-col h-full border-r border-steel-100 dark:border-steel-800",
          "bg-white dark:bg-steel-900 transition-all duration-200 ease-in-out shrink-0",
          collapsed ? "w-[64px]" : "w-[240px]",
        )}
      >
        {/* Logo Section */}
        <div
          className={clsx(
            "flex items-center h-14 px-4 border-b border-steel-100 dark:border-steel-800",
            collapsed ? "justify-center" : "justify-start",
          )}
        >
          <img
            src={
              collapsed
                ? "/images/logos/url_logo.png"
                : "/images/logos/LEBAUX-LOGO.png"
            }
            alt="Lebaux"
            className={clsx(
              "transition-all duration-300 object-contain select-none pointer-events-none",
              collapsed ? "h-6 w-6" : "h-8",
              "mix-blend-multiply dark:mix-blend-normal",
            )}
          />
        </div>

        {/* Nav links */}
        <nav className="flex-1 py-3 px-3 flex flex-col gap-0.5 overflow-y-auto">
          {NAV.map(({ to, icon: Icon, label }) => (
            <Tooltip
              key={to}
              content={label}
              placement="right"
              isDisabled={!collapsed}
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

        {/* Bottom User Profile */}
        <div className="px-3 pb-3 flex flex-col gap-1 border-t border-steel-100 dark:border-steel-800 pt-2">
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
                  <>
                    <span className="flex-1 truncate text-sm font-medium">
                      {user.name}
                    </span>
                    <ChevronsUpDown className="w-5 h-5 text-steel-400 shrink-0" />
                  </>
                )}
              </button>
            </DropdownTrigger>

            <DropdownMenu
              aria-label="User actions"
              variant="flat"
              className="w-56 dark:bg-steel-900 border border-steel-100 dark:border-steel-800 rounded-xl"
            >
              <DropdownItem
                key="profile-header"
                className="h-11 gap-2 opacity-100 cursor-default pointer-events-none border-b border-steel-100 dark:border-steel-800"
              >
                <div className="flex items-center gap-2">
                  <Avatar src={user.avatar} className="w-5 h-5 text-xs" />
                  <p className="font-semibold text-sm text-steel-900 dark:text-steel-100">
                    {user.name}
                  </p>
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

              {/* Secciones de Soporte y Feedback movidas aquí adentro */}
              <DropdownItem
                key="feedback"
                className="border-t border-steel-100 dark:border-steel-800/50"
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
                className="text-danger border-t border-steel-100 dark:border-steel-800/50"
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

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-14 flex items-center justify-between px-4 border-b border-steel-200 dark:border-steel-800 bg-white dark:bg-steel-900 shrink-0">
          <div className="flex items-center gap-2">
            {/* Botón para colapsar/expandir al inicio del Topbar */}
            <button
              onClick={() => setCollapsed((c) => !c)}
              className="p-1 rounded-lg text-steel-500 hover:text-steel-700 dark:text-steel-400 dark:hover:text-steel-200 hover:bg-steel-100 dark:hover:bg-steel-800 transition-colors mr-1"
              aria-label="Toggle Sidebar"
            >
              {collapsed ? (
                <PanelRightClose className="w-5 h-5" />
              ) : (
                <PanelRightOpen className="w-5 h-5" />
              )}
            </button>

            <PageTitle pathname={location.pathname} />
          </div>

          {/* Icono de campana para notificaciones al final del Topbar */}
          <div className="flex items-center gap-2">
            <Button
              isIconOnly
              variant="light"
              onPress={() => setHasNotifications(!hasNotifications)}
              className="p-1 rounded-full text-steel-500 hover:text-steel-700 dark:text-steel-400 dark:hover:text-steel-200 hover:bg-steel-100 dark:hover:bg-steel-800 transition-colors relative"
            >
              <Badge
                content=""
                isInvisible={!hasNotifications}
                color="warning"
                size="sm"
                shape="circle"
                className="border-white dark:border-steel-900"
              >
                <Bell className="w-5 h-5" strokeWidth={2} />
              </Badge>
            </Button>
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 overflow-auto scrollbar-thin p-6 fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function PageTitle({ pathname }: { pathname: string }) {
  const map: Record<string, string> = {
    "/inicio": "Dashboard",
    "/obras": "Obras",
    "/catalogos": "Catálogos",
    "/productos": "Productos",
    "/opciones": "Opciones",
  };

  const base = "/" + pathname.split("/")[1];
  const title = map[base] ?? "Lebaux";

  return (
    <div className="flex items-center gap-3">
      <div className="w-0.5 h-5 bg-lebaux-amber rounded-full" />
      <h1 className="font-sans font-bold text-lg sm:text-xl tracking-tight text-steel-900 dark:text-steel-50">
        {title}
      </h1>
    </div>
  );
}
