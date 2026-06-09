import { useState } from "react";
import { Tabs, Tab } from "@heroui/react";
import PerfilesTab from "@/components/catalogs/PerfilesTab";
import AccesoriosTab from "@/components/catalogs/AccesoriosTab";
import VidriosTab from "@/components/catalogs/VidriosTab";
import TratamientosTab from "@/components/catalogs/TratamientosTab";
import ExtrusorasTab from "@/components/catalogs/ExtrusorasTab";
import MonedasTab from "@/components/catalogs/MonedasTab";
import CatalogosPageSkeleton from "@/components/ui/skeletons/CatalogoPageSkeleton";

export default function CatalogosPage() {
  // Estado de carga inicial (reemplazar por tu estado real si traés datos globales del catálogo)
  const [isLoading] = useState<boolean>(false);
  const [tab, setTab] = useState("perfiles");

  return (
    <div className="flex flex-col h-full">
      {/* ── Header Unificado y Consistente (Sticky y Full-Bleed) ── */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-2 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-steel-900 shrink-0">
        <div>
          <h2 className="text-2xl font-black text-zinc-800 dark:text-zinc-100 tracking-tight">
            Gestión de Catálogos
          </h2>
          <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-1 font-medium">
            Administrá los materiales de extrusión, accesorios, cristales y
            tipos de cambio para los cómputos.
          </p>
        </div>
      </header>

      {/* ── Área de Contenido Scrollable ── */}
      <div className="flex-1 overflow-auto bg-zinc-50 dark:bg-zinc-950 p-5">
        <div className="max-w-7xl mx-auto space-y-4 pb-10 animate-in fade-in duration-400">
          {isLoading ? (
            <CatalogosPageSkeleton />
          ) : (
            <div className="space-y-4">
              <Tabs
                selectedKey={tab}
                onSelectionChange={(k: string) => setTab(String(k))}
                variant="underlined"
                aria-label="Opciones de catálogo"
                classNames={{
                  tabList:
                    "border-b border-zinc-200/80 dark:border-zinc-800/60 w-full gap-6 px-1",
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
                <Tab key="perfiles" title="Perfiles">
                  <div className="mt-4 animate-in fade-in duration-300">
                    <PerfilesTab />
                  </div>
                </Tab>

                <Tab key="accesorios" title="Accesorios">
                  <div className="mt-4 animate-in fade-in duration-300">
                    <AccesoriosTab />
                  </div>
                </Tab>

                <Tab key="vidrios" title="Vidrios / Interiores">
                  <div className="mt-4 animate-in fade-in duration-300">
                    <VidriosTab />
                  </div>
                </Tab>

                <Tab key="tratamientos" title="Tratamientos">
                  <div className="mt-4 animate-in fade-in duration-300">
                    <TratamientosTab />
                  </div>
                </Tab>

                <Tab key="extrusoras" title="Extrusoras y Líneas">
                  <div className="mt-4 animate-in fade-in duration-300">
                    <ExtrusorasTab />
                  </div>
                </Tab>

                <Tab key="monedas" title="Monedas">
                  <div className="mt-4 animate-in fade-in duration-300">
                    <MonedasTab />
                  </div>
                </Tab>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
