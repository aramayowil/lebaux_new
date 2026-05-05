import { useState } from "react";
import { Tabs, Tab } from "@heroui/react";
import PerfilesTab from "@/components/catalogs/PerfilesTab";
import AccesoriosTab from "@/components/catalogs/AccesoriosTab";
import VidriosTab from "@/components/catalogs/VidriosTab";
import TratamientosTab from "@/components/catalogs/TratamientosTab";
import ExtrusorasTab from "@/components/catalogs/ExtrusorasTab";
import MonedasTab from "@/components/catalogs/MonedasTab";

export default function CatalogosPage() {
  const [tab, setTab] = useState("perfiles");

  return (
    <div className="max-w-7xl mx-auto fade-in px-2 ">
      <div className="flex flex-col gap-1 mb-4">
        <h2 className="text-2xl font-medium tracking-tight text-steel-900 dark:text-steel-200">
          Gestión de Catálogos
        </h2>
        <p className="text-base text-steel-500 dark:text-steel-400">
          Administra los materiales de extrusión, accesorios y tipos de moneda
          para el sistema.
        </p>
      </div>

      <Tabs
        selectedKey={tab}
        onSelectionChange={(k: string) => setTab(String(k))}
        variant="underlined"
        aria-label="Opciones de catálogo"
        classNames={{
          tabList:
            "border-b border-steel-200 dark:border-steel-800 w-full gap-6 px-0 mx-2",
          cursor: "bg-lebaux-amber",
          tab: "max-w-fit px-0 h-12",
          tabContent:
            "group-data-[selected=true]:text-lebaux-amber font-semibold text-steel-500",
        }}
      >
        <Tab key="perfiles" title="Perfiles">
          <div className="mt-5">
            <PerfilesTab />
          </div>
        </Tab>
        <Tab key="accesorios" title="Accesorios">
          <div className="mt-5">
            <AccesoriosTab />
          </div>
        </Tab>
        <Tab key="vidrios" title="Vidrios / Interiores">
          <div className="mt-5">
            <VidriosTab />
          </div>
        </Tab>
        <Tab key="tratamientos" title="Tratamientos">
          <div className="mt-5">
            <TratamientosTab />
          </div>
        </Tab>
        <Tab key="extrusoras" title="Extrusoras y Líneas">
          <div className="mt-5">
            <ExtrusorasTab />
          </div>
        </Tab>
        <Tab key="monedas" title="Monedas">
          <div className="mt-5">
            <MonedasTab />
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}
