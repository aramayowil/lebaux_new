import { Skeleton } from "@heroui/react";

export default function MarcoPanelSkeleton() {
  return (
    <div className="flex flex-col bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm w-full">
      {/* Cabecera Skeleton */}
      <div className="flex items-center gap-3 px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <Skeleton className="w-1.5 h-5 rounded-full shrink-0" />
        <div className="flex items-center gap-1.5">
          <Skeleton className="w-20 h-3 rounded-md" />
          <Skeleton className="w-3 h-3 rounded-full" />
          <Skeleton className="w-16 h-3 rounded-md" />
        </div>
        <div className="ml-auto">
          <Skeleton className="w-12 h-5 rounded-md" />
        </div>
      </div>

      {/* Datos del marco (Input + Switch) */}
      <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
        <Skeleton className="flex-1 max-w-sm h-8 rounded-lg" />
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          <Skeleton className="w-24 h-5 rounded-full" />
          <Skeleton className="w-8 h-4 rounded-full" />
        </div>
      </div>

      {/* Tabs Pill Skeleton */}
      <div className="flex items-center gap-1.5 px-4 py-2.5 bg-zinc-50/60 dark:bg-zinc-900/40 border-b border-zinc-100 dark:border-zinc-800">
        <Skeleton className="w-24 h-7 rounded-full" />
        <Skeleton className="w-24 h-7 rounded-full" />
      </div>

      {/* Contenido (Área de Despiece) */}
      <div className="p-4 space-y-4">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="w-40 h-4 rounded-md" />
          <Skeleton className="w-20 h-8 rounded-lg" />
        </div>

        {/* Simulación de filas de perfiles/accesorios */}
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 items-center">
              <Skeleton className="w-full h-12 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
