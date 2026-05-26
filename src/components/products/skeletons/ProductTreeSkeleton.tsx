import { Skeleton } from "@heroui/react";

export function ProductTreeSkeleton() {
  return (
    <div className="p-2 space-y-3 w-full">
      {/* ── SIMULACIÓN PRODUCTO 1 (DESPLEGADO COMPLETO) ─────────────────── */}
      <div className="space-y-2">
        {/* Nodo Raíz: Producto */}
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-zinc-50/40 dark:bg-zinc-900/30">
          <Skeleton className="w-3.5 h-3.5 rounded-md shrink-0" />{" "}
          {/* Flecha */}
          <Skeleton className="w-4 h-4 rounded-md shrink-0" /> {/* Icono */}
          <Skeleton className="w-32 h-3.5 rounded-md" /> {/* Nombre */}
          <Skeleton className="w-7 h-4 rounded-md ml-auto shrink-0" />{" "}
          {/* Acción */}
        </div>

        {/* Sub-nodo Indentado: Marco (Nivel 1) */}
        <div className="pl-5 space-y-2 border-l border-zinc-100 dark:border-zinc-800/60 ml-3.5">
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-zinc-50/20 dark:bg-zinc-900/15">
            <Skeleton className="w-3.5 h-3.5 rounded-md shrink-0" />
            <Skeleton className="w-4 h-4 rounded-md shrink-0" />
            <Skeleton className="w-24 h-3 rounded-md" />
          </div>

          {/* Sub-nodo Indentado: Hoja (Nivel 2) */}
          <div className="pl-5 flex items-center gap-2 px-2 py-1.5 rounded-lg">
            <Skeleton className="w-3.5 h-3.5 rounded-md shrink-0 opacity-60" />
            <Skeleton className="w-4 h-4 rounded-md shrink-0 opacity-60" />
            <Skeleton className="w-28 h-3 rounded-md opacity-75" />
          </div>
        </div>
      </div>

      {/* ── SIMULACIÓN PRODUCTO 2 (MEDIO DESPLEGADO) ────────────────────── */}
      <div className="space-y-2 pt-0.5">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-zinc-50/40 dark:bg-zinc-900/30">
          <Skeleton className="w-3.5 h-3.5 rounded-md shrink-0" />
          <Skeleton className="w-4 h-4 rounded-md shrink-0" />
          <Skeleton className="w-40 h-3.5 rounded-md" />
          <Skeleton className="w-7 h-4 rounded-md ml-auto shrink-0" />
        </div>

        {/* Sub-nodo Indentado: Marco de Producto 2 */}
        <div className="pl-5 border-l border-zinc-100 dark:border-zinc-800/60 ml-3.5">
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-zinc-50/20 dark:bg-zinc-900/15">
            <Skeleton className="w-3.5 h-3.5 rounded-md shrink-0" />
            <Skeleton className="w-4 h-4 rounded-md shrink-0" />
            <Skeleton className="w-20 h-3 rounded-md" />
          </div>
        </div>
      </div>

      {/* ── SIMULACIÓN PRODUCTO 3 (COLAPSADO) ───────────────────────────── */}
      <div className="space-y-2 pt-0.5">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-zinc-50/40 dark:bg-zinc-900/30">
          <Skeleton className="w-3.5 h-3.5 rounded-md shrink-0" />
          <Skeleton className="w-4 h-4 rounded-md shrink-0" />
          <Skeleton className="w-28 h-3.5 rounded-md" />
          <Skeleton className="w-7 h-4 rounded-md ml-auto shrink-0" />
        </div>
      </div>
    </div>
  );
}
