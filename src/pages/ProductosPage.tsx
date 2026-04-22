import { useState } from "react";
import { useProductosStore } from "@/store/productosStore";
import ProductTree, {
  type TreeSelection,
} from "@/components/products/ProductTree";
import ProductoPanel from "@/components/products/ProductoPanel";
import MarcoPanel from "@/components/products/MarcoPanel";
import HojaPanel from "@/components/products/HojaPanel";
import InteriorPanel from "@/components/products/InteriorPanel";
import { Layers, MousePointer2 } from "lucide-react";

export default function ProductosPage() {
  const [selection, setSelection] = useState<TreeSelection | null>(null);
  const { productos, marcos, hojas, interiores } = useProductosStore();

  const renderPanel = () => {
    if (!selection) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-6 animate-in fade-in zoom-in-95 duration-500">
          <div className="relative">
            {/* Subimos la opacidad a 30 en light mode y 20 en dark para balancear */}
            <Layers
              className="w-20 h-20 text-zinc-300 dark:text-zinc-700 opacity-40 dark:opacity-20"
              strokeWidth={1}
            />

            {/* El icono de mouse ahora resalta más */}
            <div className="absolute -bottom-2 -right-2 bg-white dark:bg-zinc-900 p-1 rounded-full shadow-sm">
              <MousePointer2 className="w-5 h-5 text-amber-500 animate-bounce" />
            </div>
          </div>

          <div className="text-center space-y-2">
            {/* Cambiamos zinc-500 por zinc-600 en light mode para mejor legibilidad */}
            <h3 className="font-sans text-xl font-bold text-zinc-600 dark:text-zinc-300">
              Configurador de Tipologías
            </h3>

            {/* Texto de descripción con contraste AA (accesible) */}
            <p className="font-sans text-sm max-w-[280px] mx-auto leading-relaxed text-zinc-500 dark:text-zinc-400">
              Seleccioná un elemento del árbol o creá un nuevo producto para
              comenzar el despice.
            </p>
          </div>
        </div>
      );
    }

    // Lógica de renderizado de paneles (se mantiene igual pero envuelta en un contenedor con animación)
    const getContent = () => {
      if (selection.level === "producto") {
        const p = productos.find((x) => x.id === selection.id);
        return p ? <ProductoPanel producto={p} /> : null;
      }
      if (selection.level === "marco") {
        const m = marcos.find((x) => x.id === selection.id);
        return m ? (
          <MarcoPanel marco={m} idProducto={selection.idProducto} />
        ) : null;
      }
      if (selection.level === "hoja") {
        const h = hojas.find((x) => x.id === selection.id);
        return h ? (
          <HojaPanel
            hoja={h}
            idMarco={selection.idMarco}
            idProducto={selection.idProducto}
            onSelect={setSelection}
          />
        ) : null;
      }
      if (selection.level === "interior") {
        const i = interiores.find((x) => x.id === selection.id);
        return i ? (
          <InteriorPanel
            interior={i}
            idHoja={selection.idHoja}
            idMarco={selection.idMarco}
            idProducto={selection.idProducto}
          />
        ) : null;
      }
      return null;
    };

    return (
      <div className="animate-in slide-in-from-right-4 duration-300">
        {getContent()}
      </div>
    );
  };

  return (
    /* Ajuste de altura restando el Navbar (56px) y un posible Footer o padding (48px) */
    <div className="flex h-[calc(100vh-56px)] -m-6 overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      {/* ── Sidebar: Árbol de productos ── */}
      <aside className="w-72 shrink-0 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 flex flex-col shadow-sm z-10">
        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700">
          <ProductTree selection={selection} onSelect={setSelection} />
        </div>
      </aside>

      {/* ── Main Panel: Editor ── */}
      <main className="flex-1 overflow-y-auto scrollbar-auto bg-transparent">
        <div className="p-8 max-w-4xl mx-auto">{renderPanel()}</div>
      </main>
    </div>
  );
}
