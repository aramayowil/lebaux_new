import {
  Skeleton,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/react";

export default function ObrasSkeleton() {
  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
      {/* ── Header Skeleton ── */}
      <div className="flex items-end justify-between pb-6 border-b border-steel-100 dark:border-steel-800">
        <div className="space-y-2">
          <Skeleton className="h-3 w-24 rounded-full bg-steel-200 dark:bg-steel-800" />
          <Skeleton className="h-9 w-48 rounded-lg bg-steel-200 dark:bg-steel-800" />
          <Skeleton className="h-4 w-32 rounded-md bg-steel-100 dark:bg-steel-900" />
        </div>
        <Skeleton className="h-10 w-36 rounded-full bg-steel-200 dark:bg-steel-800" />
      </div>

      {/* ── Buscador Skeleton ── */}
      <div className="max-w-sm">
        <Skeleton className="h-10 w-full rounded-xl bg-steel-100 dark:bg-steel-900" />
      </div>

      {/* ── Tabla Skeleton ── */}
      <div>
        <Table
          aria-label="Cargando obras"
          removeWrapper
          classNames={{
            th: "bg-transparent text-steel-400 border-b border-steel-100 dark:border-steel-800 py-3 px-4",
            td: "py-4 px-4 border-b border-steel-50 dark:border-steel-900",
          }}
        >
          <TableHeader>
            <TableColumn>Cliente</TableColumn>
            <TableColumn>Ubicación</TableColumn>
            <TableColumn>Contacto</TableColumn>
            <TableColumn className="w-28">Acciones</TableColumn>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded-lg bg-steel-200 dark:bg-steel-800" />
                    <Skeleton className="h-4 w-32 rounded-md bg-steel-200 dark:bg-steel-800" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-24 rounded-md bg-steel-200 dark:bg-steel-800" />
                    <Skeleton className="h-3 w-36 rounded-md bg-steel-100 dark:bg-steel-900" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-3.5 h-3.5 rounded-full bg-steel-100 dark:bg-steel-900" />
                    <Skeleton className="h-4 w-28 rounded-md bg-steel-200 dark:bg-steel-800" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Skeleton className="w-8 h-8 rounded-lg bg-steel-100 dark:bg-steel-900" />
                    <Skeleton className="w-8 h-8 rounded-lg bg-steel-100 dark:bg-steel-900" />
                    <Skeleton className="w-8 h-8 rounded-lg bg-steel-100 dark:bg-steel-900" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
