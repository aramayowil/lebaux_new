import { TableRow, TableCell, Skeleton } from "@heroui/react";

interface UsuariosSkeletonProps {
  rowsCount?: number;
}

// Cambiamos a una función normal (lowercase al inicio para marcar que no es un componente)
export function renderUsuariosSkeleton({
  rowsCount = 3,
}: UsuariosSkeletonProps = {}) {
  const skeletonRows = Array.from({ length: rowsCount }, (_, i) => i);

  return skeletonRows.map((index) => (
    <TableRow
      key={`skeleton-row-${index}`}
      className="border-b border-zinc-100 dark:border-zinc-800/50"
    >
      {/* Columna: Operador */}
      <TableCell>
        <div className="max-w-[300px] w-full flex items-center gap-3 py-1">
          <Skeleton className="flex rounded-lg w-8 h-8 shrink-0 bg-zinc-200 dark:bg-zinc-800" />
          <div className="w-full flex flex-col gap-2">
            <Skeleton className="h-3 w-28 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
            <Skeleton className="h-2 w-36 rounded-lg bg-zinc-200/70 dark:bg-zinc-800/70" />
          </div>
        </div>
      </TableCell>

      {/* Columna: Rol */}
      <TableCell>
        <Skeleton className="h-8 w-44 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      </TableCell>

      {/* Columna: Estado */}
      <TableCell>
        <div className="flex items-center gap-3">
          <Skeleton className="h-3.5 w-3.5 rounded-full bg-zinc-200 dark:bg-zinc-800" />
          <Skeleton className="h-4 w-8 rounded-full bg-zinc-200 dark:bg-zinc-800" />
          <Skeleton className="h-3 w-10 rounded-lg bg-zinc-200/70 dark:bg-zinc-800/70" />
        </div>
      </TableCell>

      {/* Columna: Acciones */}
      <TableCell>
        <div className="flex justify-center">
          <Skeleton className="h-7 w-7 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </TableCell>
    </TableRow>
  ));
}
