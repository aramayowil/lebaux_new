import { Skeleton } from "@heroui/react";

export default function ProductoPanelSkeleton() {
  return (
    <div className="flex flex-col bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm w-full">
      {/* Cabecera */}
      <div className="flex items-center gap-3 px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <Skeleton className="w-1.5 h-5 rounded-full shrink-0" />
        <Skeleton className="w-20 h-3 rounded-lg" />
        <Skeleton className="w-3 h-3 rounded-full" />

        {/* Breadcrumb Placeholder */}
        <div className="flex items-center gap-1.5 px-2 py-1 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
          <Skeleton className="w-3 h-3 rounded-full" />
          <Skeleton className="w-24 h-3 rounded-md" />
        </div>

        <div className="ml-auto">
          <Skeleton className="w-16 h-6 rounded-full" />
        </div>
      </div>

      {/* Cuerpo */}
      <div className="p-4 space-y-4">
        {/* Skeleton Descripción */}
        <div>
          <Skeleton className="w-24 h-3 rounded-md mb-2" />
          <Skeleton className="w-full h-10 rounded-xl" />
        </div>

        {/* Skeleton Clasificación (Extrusora, Línea, Tipo) */}
        <div>
          <Skeleton className="w-28 h-3 rounded-md mb-2" />
          <div className="grid grid-cols-3 gap-3">
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Footer de ayuda */}
      <div className="flex items-start gap-2.5 px-4 py-3 bg-zinc-50/50 dark:bg-zinc-900/20 border-t border-zinc-100 dark:border-zinc-800">
        <Skeleton className="w-4 h-4 rounded-full mt-0.5 shrink-0" />
        <div className="space-y-2 w-full">
          <Skeleton className="w-full h-2.5 rounded-lg" />
          <Skeleton className="w-3/4 h-2.5 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
