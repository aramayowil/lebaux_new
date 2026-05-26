import { useState, useEffect } from "react";
import { Input, Switch, Alert } from "@heroui/react";
import { Box, ChevronRight, Settings2, Package2, Loader2 } from "lucide-react";
import DespiecePerfilesPanel from "./DespiecePerfilesPanel";
import DespieceAccesoriosPanel from "./DespieceAccesoriosPanel";
import type { Marco } from "@/types";
import clsx from "clsx";
import { useProductos } from "@/hooks/productos/useProducto";
import { useUpdateMarco } from "@/hooks/productos/useMarco";
import { useHojasByMarco } from "@/hooks/productos/useHojas";
import MarcoPanelSkeleton from "./skeletons/MarcoPanelSkeleton";

interface Props {
  marco: Marco;
  id_producto: number;
}

export default function MarcoPanel({ marco, id_producto }: Props) {
  // --- 1. HOOKS DE PETICIONES Y MUTACIONES ---
  const {
    data: productos = [],
    isLoading: isLoadingProductos,
    isError: isErrorProductos,
  } = useProductos();
  const { mutateAsync: updateMarco, isPending: isUpdating } = useUpdateMarco();
  const {
    data: hojas = [],
    isLoading: isLoadingHojas,
    isError: isErrorHojas,
  } = useHojasByMarco(marco.id);

  const isLoading = isLoadingProductos || isLoadingHojas;
  const isError = isErrorProductos || isErrorHojas;

  // --- 2. ESTADOS LOCALES INTERMEDIOS ---
  const [localDescripcion, setLocalDescripcion] = useState(
    marco.descripcion || "",
  );
  const [tab, setTab] = useState<"perfiles" | "accesorios">("perfiles");

  // ESCUCHA ÚNICAMENTE 'marco.id': Evita saltos tipográficos o que mutaciones concurrentes
  // pisen el texto mientras el usuario escribe antes de disparar el Blur.
  useEffect(() => {
    setLocalDescripcion(marco.descripcion || "");
  }, [marco.id]);

  if (isError) {
    return (
      <div className="flex items-center justify-center w-full">
        <Alert
          color="danger"
          title="Error al cargar el marco"
          description="Por favor, recarga la página e intenta nuevamente. Si el error persiste, contactate con soporte técnico."
        />
      </div>
    );
  }

  const producto = productos.find((p) => p.id === id_producto);

  // --- 3. MANEJADORES DE PERSISTENCIA BAJO DEMANDA ---
  const persistUpdate = async (data: Partial<Marco>) => {
    try {
      await updateMarco({ id: marco.id, payload: data });
    } catch (error) {
      console.error("Error al actualizar el marco:", error);
    }
  };

  const handleBlurDescripcion = () => {
    const trimmed = localDescripcion.trim();
    if (trimmed === marco.descripcion) return;
    persistUpdate({ descripcion: trimmed });
  };

  return (
    <div className="flex flex-col bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm relative">
      {isLoading ? (
        <MarcoPanelSkeleton />
      ) : (
        <>
          {/* Cabecera optimizada con breadcrumb e indicador de sincronización en background */}
          <div className="flex items-center justify-between px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 overflow-hidden">
              <div className="w-1.5 h-5 rounded-full bg-blue-400 shrink-0" />
              <span className="text-zinc-400 dark:text-zinc-600 truncate max-w-[140px]">
                {producto?.descripcion}
              </span>
              <ChevronRight className="w-3 h-3 text-zinc-300 dark:text-zinc-700 shrink-0" />
              <Box className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="text-blue-500 shrink-0">Marco</span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {isUpdating ? (
                <div className="flex items-center gap-1.5 text-zinc-400 dark:text-zinc-500 text-[10px] font-medium font-mono">
                  <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
                  <span>Sincronizando...</span>
                </div>
              ) : (
                <span className="text-[10px] font-mono text-zinc-400 bg-zinc-100 dark:bg-zinc-800/60 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700">
                  {hojas.length} {hojas.length === 1 ? "hoja" : "hojas"}
                </span>
              )}
            </div>
          </div>

          {/* Formulario de Datos Principales (Estructura elástica horizontal) */}
          <div className="px-4 py-4 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end w-full">
              {/* Input de Descripción */}
              <div className="flex-1 w-full">
                <Input
                  label="Descripción"
                  labelPlacement="outside"
                  value={localDescripcion}
                  onValueChange={setLocalDescripcion}
                  onBlur={handleBlurDescripcion}
                  placeholder="Descripción del marco"
                  size="md"
                  classNames={{
                    label:
                      "text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1",
                    inputWrapper:
                      "bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 focus-within:!border-blue-400 transition-colors shadow-none h-10",
                    input: "font-medium text-xs",
                  }}
                  className="w-full"
                />
              </div>

              {/* Cápsula Simétrica Estabilizada para el Switch */}
              <div className="flex items-end gap-4 w-full sm:w-auto shrink-0 justify-between sm:justify-end">
                <div className="flex items-center gap-3 h-10 bg-zinc-50 dark:bg-zinc-900/40 px-3 border border-zinc-200 dark:border-zinc-800 rounded-xl shrink-0 select-none transition-colors">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    {marco.predeterminado ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                        Pred.
                      </span>
                    ) : (
                      "¿Pred?"
                    )}
                  </span>
                  <Switch
                    isSelected={marco.predeterminado}
                    onValueChange={(v: boolean) =>
                      persistUpdate({ predeterminado: v })
                    }
                    size="sm"
                    color="primary"
                    aria-label="Predeterminado"
                    classNames={{
                      label: "hidden", // Remueve los paddings fantasmas inyectados por labels vacíos
                      wrapper: "group-data-[selected=true]:bg-blue-500 mr-0",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Navegación por Pestañas (Estilo Capsular) */}
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
                    tab === t.key ? "text-blue-400" : "text-zinc-400",
                  )}
                />
                {t.label}
              </button>
            ))}
          </div>

          {/* Área de Despieces Prototípicos */}
          <div className="p-4 bg-zinc-50/30 dark:bg-zinc-950/20">
            {tab === "perfiles" && (
              <DespiecePerfilesPanel
                nivel="marco"
                idParent={marco.id}
                label="Perfiles del marco"
              />
            )}
            {tab === "accesorios" && (
              <DespieceAccesoriosPanel
                nivel="marco"
                idParent={marco.id}
                label="Accesorios del marco"
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
