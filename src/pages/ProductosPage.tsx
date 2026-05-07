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
import {
  ErrorState,
  ProductosSkeleton,
} from "@/components/products/skeletons/productoPageSkeleton";

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

  const renderPanel = () => {
    if (!selection) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-6 animate-in fade-in zoom-in-95 duration-500">
          <div className="relative">
            <Layers
              className="w-20 h-20 text-zinc-300 dark:text-zinc-700 opacity-90"
              strokeWidth={1}
            />
            <div className="absolute -bottom-2 -right-2 bg-white dark:bg-zinc-900 p-1.5 rounded-full shadow-md border border-zinc-100 dark:border-zinc-800">
              <MousePointer2 className="w-5 h-5 text-amber-500 animate-bounce" />
            </div>
          </div>

          <div className="text-center space-y-2">
            <h3 className="font-sans text-xl font-bold text-zinc-600 dark:text-zinc-300">
              Configurador de Tipologías
            </h3>
            <p className="font-sans text-sm max-w-[280px] mx-auto leading-relaxed text-zinc-500 dark:text-zinc-400">
              Seleccioná un elemento del árbol o creá un nuevo producto para
              comenzar el despice.
            </p>
          </div>
        </div>
      );
    }

    const getContent = () => {
      switch (selection.level) {
        case "producto":
          const p = productos.find((x) => x.id === selection.id);
          return p ? <ProductoPanel producto={p} /> : null;
        case "marco":
          const m = marcos.find((x) => x.id === selection.id);
          return m ? (
            <MarcoPanel marco={m} id_producto={selection.id_producto} />
          ) : null;
        case "hoja":
          const h = hojas.find((x) => x.id === selection.id);
          return h ? (
            <HojaPanel
              hoja={h}
              id_marco={selection.id_marco}
              id_producto={selection.id_producto}
              onSelect={setSelection}
            />
          ) : null;
        case "interior":
          const i = interiores.find((x) => x.id === selection.id);
          return i ? (
            <InteriorPanel
              interior={i}
              idHoja={selection.id_hoja}
              idMarco={selection.id_marco}
              idProducto={selection.id_producto}
            />
          ) : null;
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
    <div className="flex h-[calc(100vh-56px)] -m-6 overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      {isLoading ? (
        <ProductosSkeleton />
      ) : isError ? (
        <ErrorState />
      ) : (
        <>
          {/* Sidebar */}
          <aside className="w-72 shrink-0 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 flex flex-col shadow-sm z-10">
            <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700">
              <ProductTree selection={selection} onSelect={setSelection} />
            </div>
          </aside>

          {/* Editor Principal */}
          <main className="flex-1 overflow-y-auto bg-transparent relative">
            <div className="p-8 max-w-4xl mx-auto">{renderPanel()}</div>
          </main>
        </>
      )}
    </div>
  );
}
