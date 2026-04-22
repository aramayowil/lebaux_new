import { Link } from "react-router-dom";
import { Card, CardBody } from "@heroui/react";
import {
  FolderOpen,
  Layers,
  BookOpen,
  Settings,
  Package,
  Wrench,
  Palette,
} from "lucide-react";
import { useObrasStore } from "@/store/obrasStore";
import { useCatalogosStore } from "@/store/catalogosStore";

export default function InicioPage() {
  const obras = useObrasStore((s) => s.obras);
  const perfiles = useCatalogosStore((s) => s.perfiles);
  const accesorios = useCatalogosStore((s) => s.accesorios);
  const tratamientos = useCatalogosStore((s) => s.tratamientos);
  const opciones = useCatalogosStore((s) => s.opciones);

  const stats = [
    {
      label: "Obras activas",
      value: obras.length,
      icon: FolderOpen,
      to: "/obras",
      color: "text-blue-500",
    },
    {
      label: "Perfiles",
      value: perfiles.length,
      icon: Package,
      to: "/catalogos",
      color: "text-zinc-500",
    },
    {
      label: "Accesorios",
      value: accesorios.length,
      icon: Wrench,
      to: "/catalogos",
      color: "text-amber-500",
    },
    {
      label: "Tratamientos",
      value: tratamientos.length,
      icon: Palette,
      to: "/catalogos",
      color: "text-emerald-500",
    },
  ];

  const accesos = [
    {
      to: "/obras",
      icon: FolderOpen,
      label: "Obras",
      desc: "Gestión de proyectos y presupuestos",
      color: "bg-blue-50/50 dark:bg-blue-950/20",
    },
    {
      to: "/productos",
      icon: Layers,
      label: "Productos",
      desc: "Editor de tipologías y perfiles",
      color: "bg-zinc-50 dark:bg-zinc-900/50",
    },
    {
      to: "/catalogos",
      icon: BookOpen,
      label: "Catálogos",
      desc: "Perfiles, vidrios y accesorios",
      color: "bg-amber-50/50 dark:bg-amber-950/20",
    },
    {
      to: "/opciones",
      icon: Settings,
      label: "Opciones",
      desc: "IVA, márgenes y configuración",
      color: "bg-emerald-50/50 dark:bg-emerald-950/10",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Bienvenida */}
      <header>
        <h2 className="font-display text-3xl font-bold text-zinc-800 dark:text-zinc-100 tracking-tight">
          Bienvenido, {opciones.nombre || "Usuario"}
        </h2>
        <p className="font-sans text-zinc-500 dark:text-zinc-400 mt-1 text-base">
          Sistema de presupuestación para carpintería de aluminio
        </p>
      </header>

      {/* Stats - Usando Font Mono para los números */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, to, color }) => (
          <Link
            key={label}
            to={to}
            className="transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Card
              className="border-none bg-white dark:bg-zinc-900 shadow-sm"
              isPressable
            >
              <CardBody className="flex flex-row items-center gap-4 p-4">
                <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800">
                  <Icon className={`w-5 h-5 ${color}`} strokeWidth={2} />
                </div>
                <div>
                  <p className="text-2xl font-mono font-medium text-zinc-900 dark:text-zinc-50 leading-none">
                    {value}
                  </p>
                  <p className="text-[11px] uppercase tracking-wider font-bold text-zinc-400 mt-1.5">
                    {label}
                  </p>
                </div>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>

      {/* Accesos rápidos */}
      <section>
        <h3 className="font-display text-lg font-bold text-zinc-400 mb-4 uppercase tracking-widest text-[11px]">
          Navegación Rápida
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {accesos.map(({ to, icon: Icon, label, desc, color }) => (
            <Link key={to} to={to}>
              <Card
                className={`border border-zinc-200 dark:border-zinc-800 ${color} hover:border-zinc-300 dark:hover:border-zinc-700 transition-all`}
                isPressable
              >
                <CardBody className="flex flex-row items-start gap-4 p-5">
                  <div className="p-3 rounded-lg bg-white dark:bg-zinc-950 shadow-sm">
                    <Icon
                      className="w-6 h-6 text-zinc-700 dark:text-zinc-300"
                      strokeWidth={1.5}
                    />
                  </div>
                  <div>
                    <p className="font-sans font-bold text-zinc-900 dark:text-zinc-100 text-lg">
                      {label}
                    </p>
                    <p className="font-sans text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                      {desc}
                    </p>
                  </div>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
