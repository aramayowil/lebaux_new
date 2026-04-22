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
    <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      {/* ── Sidebar ── */}
      <aside
        className={clsx(
          "flex flex-col h-full border-r border-zinc-200 dark:border-zinc-800",
          "bg-white dark:bg-zinc-900 transition-all duration-200 ease-in-out shrink-0",
          collapsed ? "w-[56px]" : "w-[220px]",
        )}
      >
        {/* Logo */}
        <div
          className={clsx(
            "flex items-center h-14 px-3 border-b border-zinc-100 dark:border-zinc-800",
            collapsed ? "justify-center" : "justify-start gap-3",
          )}
        >
          <img
            src={
              collapsed
                ? "./images/logos/url_logo.png"
                : "./images/logos/LEBAUX-LOGO.png"
            }
            alt="Lebaux Logo"
            className={clsx(
              "transition-all duration-300 object-contain",
              collapsed ? "h-8 w-8 " : "h-9",
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
                    "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all group",
                    collapsed && "justify-center px-0",
                    isActive
                      ? "bg-lebaux-amber/10 text-lebaux-amber-dark dark:text-lebaux-amber"
                      : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100",
                  )
                }
              >
                <Icon className="w-4.5 h-4.5 shrink-0" strokeWidth={1.8} />
                {!collapsed && <span>{label}</span>}
              </NavLink>
            </Tooltip>
          ))}
        </nav>

        {/* Bottom controls */}
        <div className="px-2 pb-3 flex flex-col gap-1 border-t border-zinc-100 dark:border-zinc-800 pt-2">
          <button
            onClick={toggle}
            className={clsx(
              "flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-all",
              "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200",
              "hover:bg-zinc-100 dark:hover:bg-zinc-800",
              collapsed && "justify-center px-2",
            )}
          >
            {dark ? (
              <Sun className="w-4 h-4 text-lebaux-amber" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
            {!collapsed && <span>{dark ? "Modo claro" : "Modo oscuro"}</span>}
          </button>
          <button
            onClick={() => setCollapsed((c) => !c)}
            className={clsx(
              "flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-all",
              "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200",
              "hover:bg-zinc-100 dark:hover:bg-zinc-800",
              collapsed && "justify-center px-2",
            )}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span>Contraer</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-14 flex items-center px-6 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0">
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

function PageTitle({ pathname }: { pathname: string }) {
  const map: Record<string, string> = {
    "/inicio": "Dashboard",
    "/obras": "Obras",
    "/catalogos": "Catálogos",
    "/productos": "Productos",
    "/opciones": "Opciones",
  };
  const base = "/" + pathname.split("/")[1];
  return (
    <h1 className="font-display font-bold  text-zinc-800 dark:text-zinc-100 text-xl ">
      {map[base] ?? "Lebaux"}
    </h1>
  );
}
