import { Skeleton } from "@heroui/react";
import { AlertCircle, RefreshCcw } from "lucide-react";

export const ProductosSkeleton = () => (
  <div className="flex h-full w-full">
    <aside className="w-72 shrink-0 border-r border-zinc-200 dark:border-zinc-800 p-6 space-y-6 bg-white dark:bg-zinc-900/50">
      <Skeleton className="rounded-lg w-3/4 h-7" />
      <div className="space-y-4">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="w-4 h-4 rounded" />
            <Skeleton className="h-4 flex-1 rounded-md" />
          </div>
        ))}
      </div>
    </aside>
    <main className="flex-1 p-8 bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-3">
          <Skeleton className="h-9 w-64 rounded-lg" />
          <Skeleton className="h-4 w-40 rounded-lg" />
        </div>
        <Skeleton className="rounded-2xl w-full h-80" />
        <div className="grid grid-cols-2 gap-6">
          <Skeleton className="rounded-xl h-40" />
          <Skeleton className="rounded-xl h-40" />
        </div>
      </div>
    </main>
  </div>
);

export const ErrorState = () => (
  <div className="flex-1 flex flex-col items-center justify-center h-full p-8 text-center bg-white dark:bg-zinc-950">
    <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-full mb-4">
      <AlertCircle className="w-12 h-12 text-red-500" />
    </div>
    <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-200 mb-2">
      Error de conexión
    </h3>
    <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mb-6 leading-relaxed">
      No pudimos cargar los datos del catálogo. Por favor, verifica tu conexión
      o intenta de nuevo.
    </p>
    <button
      onClick={() => window.location.reload()}
      className="flex items-center gap-2 px-6 py-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full font-medium hover:opacity-90 transition-opacity shadow-lg shadow-zinc-200 dark:shadow-none"
    >
      <RefreshCcw className="w-4 h-4" />
      Reintentar cargar
    </button>
  </div>
);
