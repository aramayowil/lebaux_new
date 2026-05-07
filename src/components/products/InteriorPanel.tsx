import InteriorEditor from "./InteriorEditor";
import { Square, ChevronRight, AlertCircle } from "lucide-react";
import type { Interior } from "@/types";
import { useProductos } from "@/hooks/productos/useProducto";
import { useMarcos } from "@/hooks/productos/useMarco";
import { useHojas } from "@/hooks/productos/useHojas";
import InteriorPanelSkeleton from "./skeletons/interiorPanelSkeleton";

interface Props {
  interior: Interior;
  idHoja: number;
  idMarco: number;
  idProducto: number;
}

export default function InteriorPanel({
  interior,
  idHoja,
  idMarco,
  idProducto,
}: Props) {
  const {
    data: productos = [],
    isLoading: isLoadingProductos,
    isError: isErrorProductos,
  } = useProductos();
  const {
    data: marcos = [],
    isLoading: isLoadingMarcos,
    isError: isErrorMarcos,
  } = useMarcos();
  const {
    data: hojas = [],
    isLoading: isLoadingHojas,
    isError: isErrorHojas,
  } = useHojas();

  const isLoading = isLoadingProductos || isLoadingMarcos || isLoadingHojas;
  const isError = isErrorProductos || isErrorMarcos || isErrorHojas;

  const producto = productos.find((p) => p.id === idProducto);
  const marco = marcos.find((m) => m.id === idMarco);
  const hoja = hojas.find((h) => h.id === idHoja);

  return (
    <div className="flex flex-col gap-0">
      {isError && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
          <div className="text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Error al cargar los datos
          </div>
        </div>
      )}
      {isLoading ? (
        <InteriorPanelSkeleton />
      ) : (
        <>
          {/* Cabecera breadcrumb */}
          <div className="flex items-center gap-2 px-4 py-3 bg-zinc-50 dark:bg-zinc-900 rounded-t-xl border border-b-0 border-zinc-200 dark:border-zinc-800 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            <div className="w-1.5 h-5 rounded-full bg-purple-400 shrink-0" />
            <span className="text-zinc-300 dark:text-zinc-600">
              {producto?.descripcion}
            </span>
            <ChevronRight className="w-3 h-3 text-zinc-300 dark:text-zinc-700" />
            <span className="text-zinc-300 dark:text-zinc-600">
              {marco?.descripcion}
            </span>
            <ChevronRight className="w-3 h-3 text-zinc-300 dark:text-zinc-700" />
            <span className="text-zinc-300 dark:text-zinc-600">
              {hoja?.descripcion}
            </span>
            <ChevronRight className="w-3 h-3 text-zinc-300 dark:text-zinc-700" />
            <Square className="w-3 h-3 text-purple-400" />
            <span className="text-purple-500">Interior</span>
          </div>

          {/* InteriorEditor (contiene secciones ①②③④ completas) */}
          <InteriorEditor interior={interior} />
        </>
      )}
    </div>
  );
}
