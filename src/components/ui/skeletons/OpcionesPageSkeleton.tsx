import { Card, Skeleton } from "@heroui/react";

export default function OpcionesPageSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-pulse">
      {/* Columna Ancha Izquierda (Esqueleto Bloques 1 y 2) */}
      <div className="lg:col-span-2 space-y-6">
        {/* Esqueleto Bloque 1: Identidad */}
        <Card className="border border-zinc-200/60 dark:border-zinc-800/60 shadow-none p-5 space-y-5 bg-white dark:bg-zinc-900/50">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800/60">
            <Skeleton className="w-4 h-4 rounded-full" />
            <Skeleton className="w-48 h-3 rounded-lg" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-10 rounded-xl" />
            <Skeleton className="h-10 rounded-xl" />
            <Skeleton className="h-10 rounded-xl md:col-span-2" />
            <Skeleton className="h-10 rounded-xl md:col-span-2" />
          </div>
        </Card>

        {/* Esqueleto Bloque 2: Márgenes y Reglas */}
        <Card className="border border-zinc-200/60 dark:border-zinc-800/60 shadow-none p-5 space-y-5 bg-white dark:bg-zinc-900/50">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800/60">
            <Skeleton className="w-4 h-4 rounded-full" />
            <Skeleton className="w-56 h-3 rounded-lg" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <Skeleton key={i} className="h-9 rounded-xl" />
            ))}
          </div>
        </Card>
      </div>

      {/* Columna Estrecha Derecha (Esqueleto Bloques 3 y 4) */}
      <div className="space-y-6">
        {/* Esqueleto Bloque 3: Costo Mano de Obra */}
        <Card className="border border-zinc-200/60 dark:border-zinc-800/60 shadow-none p-5 space-y-4 bg-white dark:bg-zinc-900/50">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800/60">
            <Skeleton className="w-4 h-4 rounded-full" />
            <Skeleton className="w-36 h-3 rounded-lg" />
          </div>
          <Skeleton className="h-14 rounded-xl" />
        </Card>

        {/* Esqueleto Bloque 4: Tiempos Taller */}
        <Card className="border border-zinc-200/60 dark:border-zinc-800/60 shadow-none p-5 space-y-4 bg-white dark:bg-zinc-900/50">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800/60">
            <Skeleton className="w-4 h-4 rounded-full" />
            <Skeleton className="w-40 h-3 rounded-lg" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
