import { useState, useEffect } from "react";
import { Input, Switch, Alert, NumberInput } from "@heroui/react";
import {
  Grid2x2,
  Square,
  ChevronRight,
  Settings2,
  Package2,
  Loader2,
} from "lucide-react";
import { useProductosStore } from "@/store/productosStore";
import DespiecePerfilesPanel from "./DespiecePerfilesPanel";
import DespieceAccesoriosPanel from "./DespieceAccesoriosPanel";
import type { Hoja } from "@/types";
import type { TreeSelection } from "./ProductTree";
import clsx from "clsx";
import { useMarcos } from "@/hooks/productos/useMarco";
import { useProductos } from "@/hooks/productos/useProducto";
import { useUpdateHoja } from "@/hooks/productos/useHojas";
import HojaPanelSkeleton from "./skeletons/HojaPanelSkeleton";

interface Props {
  hoja: Hoja;
  id_marco: number;
  id_producto: number;
  onSelect: (sel: TreeSelection) => void;
}

export default function HojaPanel({
  hoja,
  id_marco,
  id_producto,
  onSelect,
}: Props) {
  const { getInterioresByHoja } = useProductosStore();

  // --- 1. HOOKS DE PETICIONES Y MUTACIONES ---
  const {
    data: productos = [],
    isLoading: isLoadingProductos,
    error: errorProductos,
  } = useProductos();
  const {
    data: marcos = [],
    isLoading: isLoadingMarcos,
    error: errorMarcos,
  } = useMarcos();
  const { mutateAsync: updateHoja, isPending: isUpdating } = useUpdateHoja();

  const isLoading = isLoadingProductos || isLoadingMarcos;
  const isError = errorProductos || errorMarcos;

  // --- 2. ESTADOS LOCALES INTERMEDIOS ---
  const [localDescripcion, setLocalDescripcion] = useState(
    hoja.descripcion || "",
  );
  const [localCantidad, setLocalCantidad] = useState(
    String(hoja.cantidad ?? 1),
  );
  const [tab, setTab] = useState<"perfiles" | "accesorios">("perfiles");

  // CORREGIDO: Escuchar únicamente 'hoja.id'.
  // Evita que mutaciones paralelas (como el switch o despieces) borren lo que el usuario está editando en tiempo real.
  useEffect(() => {
    setLocalDescripcion(hoja.descripcion || "");
    setLocalCantidad(String(hoja.cantidad ?? 1));
  }, [hoja.id]);

  if (isError) {
    return (
      <div className="flex items-center justify-center w-full">
        <Alert
          color="danger"
          title="Error al cargar la hoja"
          description="Por favor, recarga la página e intenta nuevamente. Si el error persiste, contactate con soporte técnico."
        />
      </div>
    );
  }

  const producto = productos.find((p) => p.id === id_producto);
  const marco = marcos.find((m) => m.id === id_marco);
  const interiores = getInterioresByHoja(hoja.id);

  // --- 3. MANEJADORES DE PERSISTENCIA BAJO DEMANDA ---
  const persistUpdate = async (data: Partial<Hoja>) => {
    try {
      await updateHoja({ id: hoja.id, payload: data });
    } catch (error) {
      console.error("Error al actualizar la hoja:", error);
    }
  };

  const handleBlurDescripcion = () => {
    const trimmed = localDescripcion.trim();
    if (trimmed === hoja.descripcion) return;
    persistUpdate({ descripcion: trimmed });
  };

  const handleBlurCantidad = () => {
    const parsed = parseInt(localCantidad);
    if (isNaN(parsed)) {
      setLocalCantidad(String(hoja.cantidad ?? 1));
      return;
    }
    if (parsed === hoja.cantidad) return;
    persistUpdate({ cantidad: parsed });
  };

  return (
    <div className="flex flex-col bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm relative">
      {isLoading ? (
        <HojaPanelSkeleton />
      ) : (
        <>
          {/* Cabecera optimizada */}
          <div className="flex items-center justify-between px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 overflow-hidden">
              <div className="w-1.5 h-5 rounded-full bg-emerald-400 shrink-0" />
              <span className="text-zinc-400 dark:text-zinc-600 truncate max-w-[140px]">
                {producto?.descripcion}
              </span>
              <ChevronRight className="w-3 h-3 text-zinc-300 dark:text-zinc-700 shrink-0" />
              <span className="text-zinc-400 dark:text-zinc-600 truncate max-w-[140px]">
                {marco?.descripcion}
              </span>
              <ChevronRight className="w-3 h-3 text-zinc-300 dark:text-zinc-700 shrink-0" />
              <Grid2x2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-emerald-500 shrink-0">Hoja</span>
            </div>

            {isUpdating && (
              <div className="flex items-center gap-1.5 text-zinc-400 dark:text-zinc-500 text-[10px] font-medium font-mono shrink-0">
                <Loader2 className="w-3 h-3 animate-spin text-emerald-500" />
                <span>Sincronizando...</span>
              </div>
            )}
          </div>

          {/* Datos de la hoja */}
          <div className="px-4 py-4 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end w-full">
              {/* Descripción */}
              <div className="flex-1 w-full">
                <Input
                  label="Descripción"
                  labelPlacement="outside"
                  value={localDescripcion}
                  onValueChange={setLocalDescripcion}
                  onBlur={handleBlurDescripcion}
                  placeholder="Descripción de la hoja"
                  size="md"
                  classNames={{
                    label:
                      "text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1",
                    inputWrapper:
                      "bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 focus-within:!border-emerald-400 transition-colors shadow-none h-10",
                    input: "font-medium text-xs",
                  }}
                  className="w-full"
                />
              </div>

              {/* Contenedor de Controles */}
              <div className="flex items-end gap-4 w-full sm:w-auto shrink-0 justify-between sm:justify-end">
                {/* Cantidad */}
                <div>
                  <NumberInput
                    label="Cantidad"
                    labelPlacement="outside"
                    value={localCantidad}
                    onValueChange={setLocalCantidad}
                    onBlur={handleBlurCantidad}
                    size="md"
                    minValue={0}
                    startContent={
                      <span className="text-zinc-400 text-xs font-bold mr-0.5">
                        ×
                      </span>
                    }
                    classNames={{
                      label:
                        "text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 text-center sm:text-left block w-full",
                      inputWrapper:
                        "bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 focus-within:!border-emerald-400 transition-colors shadow-none w-24 h-10",
                      input: "font-bold text-center text-xs",
                    }}
                    className="w-24 shrink-0"
                  />
                </div>

                {/* Predeterminado - Cápsula Simétrica Estabilizada */}
                <div className="flex items-center gap-3 h-10 bg-zinc-50 dark:bg-zinc-900/40 px-3 border border-zinc-200 dark:border-zinc-800 rounded-xl shrink-0 select-none transition-colors">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    {hoja.predeterminado ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                        Pred.
                      </span>
                    ) : (
                      "¿Pred?"
                    )}
                  </span>
                  <Switch
                    isSelected={hoja.predeterminado}
                    onValueChange={(v: boolean) =>
                      persistUpdate({ predeterminado: v })
                    }
                    size="sm"
                    color="emerald"
                    aria-label="Predeterminado"
                    classNames={{
                      // Evita que el componente intente inyectar espacios vacíos por labels internos invisibles
                      label: "hidden",
                      wrapper: "group-data-[selected=true]:bg-emerald-500 mr-0",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Acceso rápido a interiores */}
            {interiores.length > 0 && (
              <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Interiores Asignados
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {interiores.map((i) => (
                    <button
                      key={i.id}
                      onClick={() =>
                        onSelect({
                          level: "interior",
                          id: i.id,
                          id_hoja: hoja.id,
                          id_marco,
                          id_producto,
                        })
                      }
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-500 hover:border-emerald-300 hover:text-emerald-600 dark:hover:border-emerald-700 dark:hover:text-emerald-400 transition-all shadow-sm"
                    >
                      <Square className="w-2.5 h-2.5 text-zinc-400" />
                      {i.descripcion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Navegación por Pestañas */}
          <div className="flex items-center gap-1.5 px-4 py-2.5 bg-zinc-50/60 dark:bg-zinc-900/40 border-b border-zinc-100 dark:border-zinc-800">
            {(
              [
                { key: "perfiles", label: "Perfiles", icon: Settings2 },
                { key: "accesorios", label: "Accesorios", icon: Package2 },
              ] as const
            ).map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={clsx(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all shadow-sm",
                  tab === t.key
                    ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                    : "bg-white dark:bg-zinc-900 text-zinc-500 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/60",
                )}
              >
                <t.icon
                  className={clsx(
                    "w-3 h-3",
                    tab === t.key ? "text-emerald-400" : "text-zinc-400",
                  )}
                />
                {t.label}
              </button>
            ))}
          </div>

          {/* Contenido Dinámico */}
          <div className="p-4 bg-zinc-50/30 dark:bg-zinc-950/20">
            {tab === "perfiles" && (
              <DespiecePerfilesPanel
                nivel="hoja"
                idParent={hoja.id}
                label="Perfiles de la hoja"
              />
            )}
            {tab === "accesorios" && (
              <DespieceAccesoriosPanel
                nivel="hoja"
                idParent={hoja.id}
                label="Accesorios de la hoja"
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
