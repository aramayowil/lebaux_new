import { Skeleton } from "@heroui/react";

export const AccesoriosPanelSkeleton = () => {
  return (
    <div className="space-y-4 animate-pulse">
      {/* ── Header del Panel ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="w-3.5 h-3.5 rounded" /> {/* Icono Wrench */}
          <Skeleton className="h-3 w-24 rounded-lg" /> {/* Label */}
          <Skeleton className="h-4 w-6 rounded" /> {/* Badge Contador */}
        </div>
        <Skeleton className="h-6 w-20 rounded-full" /> {/* Botón Agregar */}
      </div>

      <div className="space-y-1.5">
        {/* ── Cabecera de la Tabla (Labels) ── */}
        <div className="grid grid-cols-[1fr_140px_32px] gap-3 px-2">
          <Skeleton className="h-2 w-16 rounded" />
          <Skeleton className="h-2 w-12 rounded" />
          <div /> {/* Espacio para el botón de borrar */}
        </div>

        {/* ── Lista de Items (Simulamos 3 filas) ── */}
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="grid grid-cols-[1fr_140px_32px] gap-3 items-center bg-zinc-50 dark:bg-zinc-900/40 rounded-xl px-2 py-1.5 border border-zinc-100 dark:border-zinc-800"
          >
            {/* Select de Accesorio */}
            <div className="flex flex-col gap-1">
              <Skeleton className="h-8 w-full rounded-lg" />
            </div>

            {/* Input de Fórmula/Cantidad */}
            <Skeleton className="h-8 w-full rounded-lg" />

            {/* Botón de Trash */}
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        ))}
      </div>

      {/* ── Texto de ayuda inferior ── */}
      <Skeleton className="h-2 w-3/4 rounded mx-1" />
    </div>
  );
};
