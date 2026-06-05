import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Skeleton,
} from "@heroui/react";

export default function ObrasPageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* ── Esqueleto del Buscador y Controles de Filtro ────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <Skeleton className="w-full max-w-sm h-10 rounded-xl" />
      </div>

      {/* ── Esqueleto de la Tabla de Expedientes (Match 1:1 con Dashboard) ── */}
      <div className="rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 overflow-hidden bg-white dark:bg-zinc-900/50">
        <Table
          aria-label="Cargando expedientes de obras"
          removeWrapper
          classNames={{
            th: [
              "bg-zinc-50 dark:bg-zinc-950/40",
              "text-[10px] font-bold uppercase tracking-widest",
              "text-zinc-400 dark:text-zinc-500",
              "border-b border-zinc-100 dark:border-zinc-800/60",
              "py-3 px-5",
            ].join(" "),
            td: "py-0 px-5 border-b border-zinc-100 dark:border-zinc-800/40",
          }}
        >
          <TableHeader>
            <TableColumn>Cliente</TableColumn>
            <TableColumn>Ubicación</TableColumn>
            <TableColumn>Contacto</TableColumn>
            <TableColumn className="w-32 text-center">Acciones</TableColumn>
          </TableHeader>

          <TableBody>
            {Array.from({ length: 5 }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {/* Columna Cliente: Simula Inicial del Avatar + Nombre/Apellido */}
                <TableCell className="py-3.5">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
                    <div className="space-y-1.5 w-24">
                      <Skeleton className="h-3.5 w-full rounded-md" />
                      <Skeleton className="h-2.5 w-2/3 rounded-md" />
                    </div>
                  </div>
                </TableCell>

                {/* Columna Ubicación: Simula Icono de Pin + Localidad y Dirección */}
                <TableCell className="py-3.5">
                  <div className="flex items-start gap-1.5">
                    <Skeleton className="w-3.5 h-3.5 rounded-full shrink-0 mt-0.5" />
                    <div className="space-y-1.5 w-32">
                      <Skeleton className="h-3 w-1/2 rounded-md" />
                      <Skeleton className="h-2.5 w-full rounded-md" />
                    </div>
                  </div>
                </TableCell>

                {/* Columna Contacto: Simula el Icono de Teléfono + Cadena Numérica */}
                <TableCell className="py-3.5">
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-3.5 h-3.5 rounded-full shrink-0" />
                    <Skeleton className="h-3 w-28 rounded-md" />
                  </div>
                </TableCell>

                {/* Columna Acciones: Simula exactamente los 3 Botones Cuadrados (Folder, Pencil, Trash) */}
                <TableCell className="py-3.5">
                  <div className="flex items-center justify-center gap-1">
                    <Skeleton className="w-7 h-7 rounded-lg" />
                    <Skeleton className="w-7 h-7 rounded-lg" />
                    <Skeleton className="w-7 h-7 rounded-lg" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Footer de Métrica Simulado */}
        <div className="px-5 py-3 border-t border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/40 dark:bg-zinc-950/20">
          <Skeleton className="w-48 h-3 rounded-md" />
        </div>
      </div>
    </div>
  );
}
