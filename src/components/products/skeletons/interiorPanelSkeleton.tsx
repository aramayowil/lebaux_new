import { Skeleton } from "@heroui/react";

export default function InteriorPanelSkeleton() {
  return (
    <div className="flex flex-col bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm w-full">
      {/* 1. Cabecera (Breadcrumb Cuádruple) */}
      <div className="flex items-center gap-2 px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <Skeleton className="w-1.5 h-5 rounded-full shrink-0" />
        <Skeleton className="w-12 h-3 rounded-md" /> {/* Producto */}
        <Skeleton className="w-3 h-3 rounded-full" /> {/* Chevron */}
        <Skeleton className="w-12 h-3 rounded-md" /> {/* Marco */}
        <Skeleton className="w-3 h-3 rounded-full" /> {/* Chevron */}
        <Skeleton className="w-12 h-3 rounded-md" /> {/* Hoja */}
        <Skeleton className="w-3 h-3 rounded-full" /> {/* Chevron */}
        <Skeleton className="w-10 h-3 rounded-md" /> {/* Interior */}
      </div>

      {/* 2. Simulación de InteriorEditor (Secciones ① a ④) */}
      <div className="p-4 space-y-6">
        {/* Sección ①: Datos Principales / Medidas */}
        <div className="space-y-3">
          <Skeleton className="w-32 h-3 rounded-md opacity-70" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-10 rounded-xl" />
            <Skeleton className="h-10 rounded-xl" />
          </div>
        </div>

        {/* Sección ②: Selección de Vidrio / Panel */}
        <div className="p-4 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-800 space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton className="w-24 h-4 rounded-md" />
            <Skeleton className="w-16 h-8 rounded-lg" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="w-12 h-12 rounded-lg shrink-0" />
            <div className="flex-1 space-y-2 pt-1">
              <Skeleton className="w-3/4 h-3 rounded-md" />
              <Skeleton className="w-1/2 h-2 rounded-md" />
            </div>
          </div>
        </div>

        {/* Sección ③: Perfiles y Despiece */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="w-24 h-7 rounded-full" />
            <Skeleton className="w-24 h-7 rounded-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="w-full h-12 rounded-xl" />
            <Skeleton className="w-full h-12 rounded-xl" />
          </div>
        </div>

        {/* Sección ④: Acciones / Footer del editor */}
        <div className="flex justify-end gap-3 pt-2">
          <Skeleton className="w-24 h-9 rounded-xl" />
          <Skeleton className="w-32 h-9 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
