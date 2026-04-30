import { Outlet, NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  Home,
  FolderOpen,
  Layers,
  BookOpen,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
} from "lucide-react";
import { Tooltip } from "@heroui/react";
import { useTheme } from "@/hooks/useTheme";
import clsx from "clsx";

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

  return (
    <div className="flex h-screen overflow-hidden bg-steel-50 dark:bg-steel-950">
      {/* ── Sidebar ── */}
      <aside
        className={clsx(
          "flex flex-col h-full border-r border-steel-100 dark:border-steel-800",
          "bg-white dark:bg-steel-900 transition-all duration-200 ease-in-out shrink-0",
          collapsed ? "w-[56px]" : "w-[220px]",
        )}
      >
        {/* Logo */}
        <div
          className={clsx(
            "flex items-center h-14 px-3 border-b border-steel-100 dark:border-steel-800",
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
              collapsed ? "h-8 w-8" : "h-8",
              "mix-blend-multiply dark:mix-blend-normal",
            )}
          />
        </div>

        {/* Nav links */}
        <nav className="flex-1 py-3 px-2 flex flex-col gap-0.5">
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
                    "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    collapsed && "justify-center px-0",
                    isActive
                      ? "bg-lebaux-amber/10 text-lebaux-amber"
                      : "text-steel-500 dark:text-steel-400 hover:bg-steel-100 dark:hover:bg-steel-800 hover:text-steel-800 dark:hover:text-steel-100",
                  )
                }
              >
                {/* Barra lateral de acento en ítem activo */}
                {({ isActive }: { isActive: boolean }) => (
                  <>
                    {isActive && !collapsed && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r bg-lebaux-amber" />
                    )}
                    <Icon className="w-4 h-4 shrink-0" strokeWidth={1.8} />
                    {!collapsed && <span>{label}</span>}
                  </>
                )}
              </NavLink>
            </Tooltip>
          ))}
        </nav>

        {/* Bottom controls */}
        <div className="px-2 pb-3 flex flex-col gap-1 border-t border-steel-100 dark:border-steel-800 pt-2">
          <button
            onClick={toggle}
            className={clsx(
              "flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-all",
              "text-steel-400 hover:text-steel-700 dark:hover:text-steel-200 hover:bg-steel-100 dark:hover:bg-steel-800",
              collapsed && "justify-center px-2",
            )}
          >
            {dark ? (
              <Sun className="w-4 h-4 text-lebaux-amber" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
            {!collapsed && (
              <span className="text-sm">
                {dark ? "Modo claro" : "Modo oscuro"}
              </span>
            )}
          </button>

          <button
            onClick={() => setCollapsed((c) => !c)}
            className={clsx(
              "flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-all",
              "text-steel-400 hover:text-steel-700 dark:hover:text-steel-200 hover:bg-steel-100 dark:hover:bg-steel-800",
              collapsed && "justify-center px-2",
            )}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span className="text-sm">Contraer</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-14 flex items-center px-6 border-b border-steel-200 dark:border-steel-800 bg-white dark:bg-steel-900 shrink-0">
          <PageTitle pathname={location.pathname} />
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
      {/* Detalle visual: Una barra vertical con el ámbar de Lebaux */}
      <div className="w-1 h-6 bg-lebaux-amber rounded-full" />

      <h1 className="font-sans font-bold text-xl sm:text-2xl tracking-tight flex items-center gap-2">
        <span className="text-steel-900 dark:text-steel-50">{title}</span>
      </h1>
    </div>
  );
}
