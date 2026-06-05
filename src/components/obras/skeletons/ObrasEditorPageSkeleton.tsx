import { Skeleton } from "@heroui/react";

export default function ObraEditorPageSkeleton() {
  return (
    <div className="flex flex-col w-full h-full bg-zinc-50 dark:bg-zinc-950 select-none overflow-hidden">
      {/* HEADER DE CONTROL SKELETON */}
      <header className="flex h-14 items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 shrink-0">
        <div className="flex items-center gap-3">
          {/* Botón de volver */}
          <Skeleton className="h-8 w-8 rounded-lg" />
          {/* Título de la obra */}
          <Skeleton className="h-5 w-40 rounded-md" />
        </div>

        <div className="flex items-center gap-2">
          {/* Botón Despiece Técnico */}
          <Skeleton className="h-8 w-36 rounded-lg" />
          {/* Botón de panel derecho */}
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      </header>

      {/* CUERPO PRINCIPAL */}
      <div className="flex flex-1 w-full overflow-hidden relative">
        {/* PANEL IZQUIERDO: LISTA DE TIPOLOGÍAS */}
        <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col shrink-0 overflow-hidden">
          <div className="p-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between shrink-0">
            <Skeleton className="h-4 w-28 rounded" />
            <Skeleton className="h-7 w-16 rounded-lg" />
          </div>

          {/* Items de tipologías simulados en bucle */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/10 flex flex-col gap-3"
              >
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-32 rounded-md" />
                  <div className="flex gap-1">
                    <Skeleton className="h-5 w-5 rounded" />
                    <Skeleton className="h-5 w-5 rounded" />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-3 w-20 rounded" />
                  <Skeleton className="h-4 w-14 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* CONTENEDOR CENTRAL: ÁREA DEL CANVAS */}
        <main className="flex-1 bg-zinc-50 dark:bg-zinc-950 grid grid-rows-[1fr_auto] overflow-hidden relative">
          {/* Zona de dibujo */}
          <div className="w-full h-full flex items-center justify-center p-8">
            <div className="w-full max-w-xl h-2/3 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <Skeleton className="h-4 w-48 rounded-md" />
              <Skeleton className="h-3 w-32 rounded-md" />
            </div>
          </div>

          {/* Barra de herramientas inferior flotante */}
          <div className="w-full flex justify-center pb-4 pt-2">
            <div className="bg-white dark:bg-zinc-900 shadow-lg border border-zinc-200 dark:border-zinc-800 rounded-2xl p-2 flex items-center gap-2">
              <Skeleton className="h-9 w-9 rounded-xl" />
              <Skeleton className="h-9 w-9 rounded-xl" />
              <div className="h-5 w-[1px] bg-zinc-200 dark:bg-zinc-800" />
              <Skeleton className="h-9 w-9 rounded-xl" />
              <div className="h-5 w-[1px] bg-zinc-200 dark:bg-zinc-800" />
              <Skeleton className="h-9 w-9 rounded-xl" />
              <Skeleton className="h-9 w-9 rounded-xl" />
            </div>
          </div>
        </main>

        {/* PANEL DERECHO: ESPECIFICACIONES TÉCNICAS */}
        <aside className="w-80 border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0 p-4 space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-36 rounded-md" />
            <Skeleton className="h-3 w-full rounded" />
          </div>
          <hr className="border-zinc-100 dark:border-zinc-800" />
          <div className="space-y-3">
            {[1, 2, 3].map((j) => (
              <div key={j} className="space-y-1.5">
                <Skeleton className="h-3 w-16 rounded" />
                <Skeleton className="h-9 w-full rounded-xl" />
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
