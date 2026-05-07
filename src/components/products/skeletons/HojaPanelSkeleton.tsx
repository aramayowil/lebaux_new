import { Skeleton } from "@heroui/react";

export default function HojaPanelSkeleton() {
  return (
    <div className="flex flex-col bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm w-full">
      {/* 1. Cabecera (Breadcrumbs) */}
      <div className="flex items-center gap-2 px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <Skeleton className="w-1.5 h-5 rounded-full shrink-0" />{" "}
        {/* Indicador color */}
        <Skeleton className="w-16 h-3 rounded-md" /> {/* Producto */}
        <Skeleton className="w-3 h-3 rounded-full" /> {/* Chevron */}
        <Skeleton className="w-16 h-3 rounded-md" /> {/* Marco */}
        <Skeleton className="w-3 h-3 rounded-full" /> {/* Chevron */}
        <Skeleton className="w-12 h-3 rounded-md" /> {/* Hoja */}
      </div>

      {/* 2. Datos de la hoja (Inputs y Switch) */}
      <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton className="flex-1 h-8 rounded-xl" />{" "}
          {/* Input Descripción */}
          <Skeleton className="w-24 h-8 rounded-xl" /> {/* Input Cantidad */}
          <div className="flex items-center gap-2 shrink-0">
            <Skeleton className="w-10 h-4 rounded-full" />{" "}
            {/* Switch Predeterminado */}
          </div>
        </div>

        {/* 3. Acceso rápido a interiores (Chips/Buttons) */}
        <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <Skeleton className="w-20 h-2 rounded-md mb-3" />{" "}
          {/* Etiqueta "Interiores" */}
          <div className="flex flex-wrap gap-1.5">
            <Skeleton className="w-24 h-6 rounded-full" />
            <Skeleton className="w-20 h-6 rounded-full" />
            <Skeleton className="w-28 h-6 rounded-full" />
          </div>
        </div>
      </div>

      {/* 4. Tabs Pill Skeleton */}
      <div className="flex items-center gap-1.5 px-4 py-2.5 bg-zinc-50/60 dark:bg-zinc-900/40 border-b border-zinc-100 dark:border-zinc-800">
        <Skeleton className="w-24 h-7 rounded-full" /> {/* Tab Perfiles */}
        <Skeleton className="w-24 h-7 rounded-full" /> {/* Tab Accesorios */}
      </div>

      {/* 5. Contenido (Listado de despiece) */}
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-center mb-2">
          <Skeleton className="w-32 h-4 rounded-md" /> {/* Título sección */}
          <Skeleton className="w-20 h-8 rounded-lg" /> {/* Botón Añadir */}
        </div>

        {/* Filas de la lista */}
        <Skeleton className="w-full h-12 rounded-xl" />
        <Skeleton className="w-full h-12 rounded-xl" />
        <Skeleton className="w-full h-12 rounded-xl" />
      </div>
    </div>
  );
}
