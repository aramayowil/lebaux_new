import { useState } from "react";
import { useProductosStore } from "@/store/productosStore";
import ProductTree, {
  type TreeSelection,
} from "@/components/products/ProductTree";
import ProductoPanel from "@/components/products/ProductoPanel";
import MarcoPanel from "@/components/products/MarcoPanel";
import HojaPanel from "@/components/products/HojaPanel";
import InteriorPanel from "@/components/products/InteriorPanel";
import { Layers } from "lucide-react";

export default function ProductosPage() {
  const [selection, setSelection] = useState<TreeSelection | null>(null);
  const { productos, marcos, hojas, interiores } = useProductosStore();

  // Resolve the selected entity
  const renderPanel = () => {
    if (!selection) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-steel-300 dark:text-steel-700 select-none">
          <Layers className="w-16 h-16" strokeWidth={0.8} />
          <div className="text-center">
            <p className="font-medium text-steel-500 dark:text-steel-400 text-base">
              Seleccioná un elemento
            </p>
            <p className="text-sm mt-1">
              o creá un nuevo producto desde el árbol lateral
            </p>
          </div>
        </div>
      );
    }

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
    <div className="flex h-[calc(100vh-56px-48px)] -m-6 fade-in">
      {/* ── Sidebar tree ── */}
      <aside className="w-64 shrink-0 border-r border-steel-200 dark:border-steel-800 bg-white dark:bg-steel-900 flex flex-col overflow-hidden">
        <ProductTree selection={selection} onSelect={setSelection} />
      </aside>

      {/* ── Main panel ── */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="p-6 max-w-3xl">{renderPanel()}</div>
      </div>
    </div>
  );
}
