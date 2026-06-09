import { useState } from "react";
import { Layers, MousePointer2 } from "lucide-react";

// Components
import ProductTree, {
  type TreeSelection,
} from "@/components/products/ProductTree";
import ProductoPanel from "@/components/products/ProductoPanel";
import MarcoPanel from "@/components/products/MarcoPanel";
import HojaPanel from "@/components/products/HojaPanel";
import InteriorPanel from "@/components/products/InteriorPanel";

// Hooks
import { useProductos } from "@/hooks/productos/useProducto";
import { useMarcos } from "@/hooks/productos/useMarco";
import { useHojas } from "@/hooks/productos/useHojas";
import { useInteriores } from "@/hooks/productos/useInteriores";
import { ErrorState } from "@/components/products/skeletons/productoPageSkeleton";
import { Skeleton } from "@heroui/react";

export default function ProductosPage() {
  const [selection, setSelection] = useState<TreeSelection | null>(null);

  // Queries
  const {
    data: productos = [],
    isLoading: loadP,
    isError: errP,
  } = useProductos();
  const { data: marcos = [], isLoading: loadM, isError: errM } = useMarcos();
  const { data: hojas = [], isLoading: loadH, isError: errH } = useHojas();
  const {
    data: interiores = [],
    isLoading: loadI,
    isError: errI,
  } = useInteriores();

  const isLoading = loadP || loadM || loadH || loadI;
  const isError = errP || errM || errH || errI;

  if (isError) {
    return <ErrorState />;
  }

  const renderPanel = () => {
    if (isLoading) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center gap-5 h-full animate-pulse">
          {/* Icon placeholder */}
          <div className="relative flex items-center justify-center w-16 h-16">
            <Skeleton className="w-16 h-16 rounded-2xl" />
            <div className="absolute -bottom-1.5 -right-1.5 bg-white dark:bg-zinc-900 p-1 rounded-full border border-zinc-100 dark:border-zinc-800 shadow-sm z-10">
              <Skeleton className="w-4 h-4 rounded-full" />
            </div>
          </div>
          {/* Text placeholder */}
          <div className="flex flex-col items-center gap-2 w-full max-w-[240px]">
            <Skeleton className="h-4 w-44 rounded-md" />
            <Skeleton className="h-3 w-full rounded" />
            <Skeleton className="h-3 w-3/4 rounded" />
          </div>
        </div>
      );
    }

    if (!selection) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center gap-5 h-full animate-in fade-in zoom-in-95 duration-400">
          {/* Icon cluster */}
          <div className="relative">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
              <Layers
                className="w-8 h-8 text-zinc-400 dark:text-zinc-500"
                strokeWidth={1.5}
              />
            </div>
            <div className="absolute -bottom-1.5 -right-1.5 bg-white dark:bg-zinc-900 p-1.5 rounded-full shadow-md border border-zinc-100 dark:border-zinc-800">
              <MousePointer2
                className="w-4 h-4 text-lebaux-amber animate-bounce"
                strokeWidth={2}
              />
            </div>
          </div>

          {/* Copy */}
          <div className="text-center space-y-1.5">
            <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-200 tracking-tight">
              Configurador de Tipologías
            </h3>
            <p className="text-xs max-w-[240px] mx-auto leading-relaxed text-zinc-400 dark:text-zinc-500">
              Seleccioná un elemento del árbol o creá un nuevo producto para
              comenzar el despice.
            </p>
          </div>
        </div>
      );
    }

    const getContent = () => {
      switch (selection.level) {
        case "producto": {
          const p = productos.find((x) => x.id === selection.id);
          return p ? <ProductoPanel producto={p} /> : null;
        }
        case "marco": {
          const m = marcos.find((x) => x.id === selection.id);
          return m ? (
            <MarcoPanel marco={m} id_producto={selection.id_producto} />
          ) : null;
        }
        case "hoja": {
          const h = hojas.find((x) => x.id === selection.id);
          return h ? (
            <HojaPanel
              hoja={h}
              id_marco={selection.id_marco}
              id_producto={selection.id_producto}
              onSelect={setSelection}
            />
          ) : null;
        }
        case "interior": {
          const i = interiores.find((x) => x.id === selection.id);
          return i ? (
            <InteriorPanel
              interior={i}
              idHoja={selection.id_hoja}
              idMarco={selection.id_marco}
              idProducto={selection.id_producto}
            />
          ) : null;
        }
        default:
          return null;
      }
    };

    return (
      <div className="animate-in slide-in-from-right-4 duration-300">
        {getContent()}
      </div>
    );
  };

  return (
    // h-full fills the white card container that AppLayout provides via <Outlet>
    <div className="flex h-full overflow-hidden">
      {/* ── Tree sidebar ── */}
      <aside className="w-64 shrink-0 flex flex-col border-r border-zinc-100 dark:border-zinc-800 rounded-tl-lg bg-white dark:bg-zinc-900">
        {/* Sidebar sticky header */}
        <div className="shrink-0 flex items-center gap-2 px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center justify-center w-5 h-5 rounded-md bg-lebaux-amber/10">
            <Layers className="w-3 h-3 text-lebaux-amber" strokeWidth={2} />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Productos
          </span>
        </div>

        {/* Tree scroll area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
          <ProductTree selection={selection} onSelect={setSelection} />
        </div>
      </aside>

      {/* ── Main editor area — same zinc-50 tint as OpcionesPage scroll area ── */}
      <main className="flex-1 overflow-y-auto border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
        <div className="p-6 max-w-4xl mx-auto min-h-full flex flex-col">
          {renderPanel()}
        </div>
      </main>
    </div>
  );
}
