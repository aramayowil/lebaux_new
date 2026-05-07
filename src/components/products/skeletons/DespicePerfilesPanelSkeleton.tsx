import { Skeleton } from "@heroui/react";

export const DespiecePerfilSkeleton = () => {
  return (
    <div className="w-full space-y-4">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="flex rounded-full w-4 h-4" />
          <Skeleton className="h-3 w-24 rounded-lg" />
          <Skeleton className="h-4 w-6 rounded-md" />
        </div>
        <Skeleton className="rounded-full w-20 h-7" />
      </div>

      <div className="space-y-2">
        {/* Cabecera Columnas Skeleton */}
        <div className="grid grid-cols-[1fr_80px_1fr_60px_32px] gap-2 px-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-2 w-12 rounded-full" />
          ))}
        </div>

        {/* Filas Dinámicas (Simulamos 3 filas) */}
        {[1, 2, 3].map((row) => (
          <div
            key={row}
            className="grid grid-cols-[1fr_80px_1fr_60px_32px] gap-2 items-end p-2 border border-zinc-100 dark:border-zinc-800 rounded-xl"
          >
            {/* Input Perfil */}
            <Skeleton className="h-8 w-full rounded-xl" />
            {/* Input Cantidad */}
            <Skeleton className="h-8 w-full rounded-xl" />
            {/* Input Medida */}
            <Skeleton className="h-8 w-full rounded-xl" />
            {/* Input Ángulo */}
            <Skeleton className="h-8 w-full rounded-xl" />
            {/* Botón Borrar */}
            <div className="flex justify-center">
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
