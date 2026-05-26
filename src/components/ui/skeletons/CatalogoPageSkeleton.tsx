import { Skeleton } from "@heroui/react";

export default function CatalogosPageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Barra de pestañas simulada (Tabs) */}
      <div className="border-b border-zinc-200/80 dark:border-zinc-800/60 w-full flex gap-6 px-1 h-11 items-center">
        <Skeleton className="w-16 h-4 rounded-md" />
        <Skeleton className="w-20 h-4 rounded-md" />
        <Skeleton className="w-28 h-4 rounded-md" />
        <Skeleton className="w-24 h-4 rounded-md" />
        <Skeleton className="w-32 h-4 rounded-md" />
        <Skeleton className="w-16 h-4 rounded-md" />
      </div>

      {/* Contenedor del contenido interno simulado */}
      <div className="space-y-4 mt-4">
        {/* Simula controles superiores comunes de catálogo (Buscador + Botón Añadir) */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <Skeleton className="w-full sm:w-72 h-10 rounded-xl" />
          <Skeleton className="w-full sm:w-32 h-10 rounded-xl" />
        </div>

        {/* Estructura de tabla genérica en esqueleto */}
        <div className="border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl p-4 bg-white dark:bg-zinc-900/50 space-y-3">
          <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800/60 pb-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-1/5 rounded-md" />
            ))}
          </div>
          {Array.from({ length: 5 }).map((_, rowIndex) => (
            <div
              key={rowIndex}
              className="flex justify-between items-center py-2"
            >
              <Skeleton className="h-3 w-1/4 rounded-md" />
              <Skeleton className="h-3 w-1/6 rounded-md" />
              <Skeleton className="h-3 w-1/5 rounded-md" />
              <Skeleton className="h-6 w-12 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
