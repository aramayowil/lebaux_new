import { useState, useEffect } from "react";
import { Select, SelectItem, Alert } from "@heroui/react";
import { Plus, Trash2, Layers, Loader2, Check } from "lucide-react";
import FormulaInput from "@/components/ui/FormulaInput";
import EmptyState from "@/components/ui/EmptyState";
import type { DespiecePerfil } from "@/types";
import { usePerfiles } from "@/hooks/catalogo/usePerfiles";
import {
  useAddDespiecePerfil,
  useDeleteDespiecePerfil,
  useDespiecePerfiles,
  useUpdateDespiecePerfil,
} from "@/hooks/productos/despieces/useDespiecePerfiles";
import { DespiecePerfilSkeleton } from "./skeletons/DespicePerfilesPanelSkeleton";

type nivel =
  | "marco"
  | "hoja"
  | "contravidrio"
  | "contravidrio_ex"
  | "mosquitero"
  | "vidrio_repartido";

const ANGULOS = ["45", "90", "0", ""];

interface Props {
  nivel: nivel;
  idParent: number;
  label?: string;
}

export default function DespiecePerfilesPanel({
  nivel,
  idParent,
  label = "Perfiles",
}: Props) {
  // --- 1. CONFIGURACIÓN DE QUERIES Y MUTACIONES ---
  const {
    data: perfiles = [],
    isLoading: loadingPerfiles,
    isError: errorPerfiles,
  } = usePerfiles();
  const {
    data: items = [],
    isLoading: loadingItems,
    isError: errorItems,
  } = useDespiecePerfiles(nivel, idParent);

  const { mutateAsync: updateDespiecePerfil } = useUpdateDespiecePerfil();
  const { mutateAsync: deleteDespiecePerfil } = useDeleteDespiecePerfil();
  const { mutateAsync: addDespiecePerfil } = useAddDespiecePerfil();

  const isLoading = loadingPerfiles || loadingItems;
  const isError = errorPerfiles || errorItems;

  // --- 2. ESTADOS LOCALES DE ESCRITURA ---
  const [localCantidades, setLocalCantidades] = useState<
    Record<number, string>
  >({});
  const [localMedidas, setLocalMedidas] = useState<Record<number, string>>({});
  const [syncStatuses, setSyncStatuses] = useState<
    Record<number, "idle" | "saving" | "saved">
  >({});

  useEffect(() => {
    const cantidades: Record<number, string> = {};
    const medidas: Record<number, string> = {};

    items.forEach((item) => {
      cantidades[item.id] = (item as any).formula_cantidad || "";
      medidas[item.id] = (item as any).formula_perfil || "";
    });

    setLocalCantidades(cantidades);
    setLocalMedidas(medidas);
  }, [idParent, items.length]);

  if (isError) {
    return (
      <div className="flex items-center justify-center w-full">
        <Alert
          color="danger"
          title="Error al cargar el despiece de perfiles"
          description="Por favor, recarga la página e intenta nuevamente."
        />
      </div>
    );
  }

  if (!perfiles || perfiles.length === 0) {
    return (
      <div className="flex items-center justify-center w-full">
        <Alert
          color="warning"
          title="Catálogo vacío"
          description="No hay perfiles cargados en el catálogo. Por favor, crea uno primero."
        />
      </div>
    );
  }

  // --- 3. FUNCIÓN CENTRAL DE ACTUALIZACIÓN ---
  async function update(id: number, data: Partial<DespiecePerfil>) {
    try {
      setSyncStatuses((prev) => ({ ...prev, [id]: "saving" }));
      await updateDespiecePerfil({ nivel, id, data });
      setSyncStatuses((prev) => ({ ...prev, [id]: "saved" }));

      setTimeout(() => {
        setSyncStatuses((prev) => ({ ...prev, [id]: "idle" }));
      }, 1500);
    } catch (error) {
      console.error("Error al actualizar el perfil de corte:", error);
      setSyncStatuses((prev) => ({ ...prev, [id]: "idle" }));
    }
  }

  const handleBlurCantidad = (id: number, dbValue: string) => {
    const currentLocal = localCantidades[id];
    if (
      currentLocal === undefined ||
      currentLocal.trim() === (dbValue || "").trim()
    )
      return;
    update(id, { formula_cantidad: currentLocal.trim() });
  };

  const handleBlurMedida = (id: number, dbValue: string) => {
    const currentLocal = localMedidas[id];
    if (
      currentLocal === undefined ||
      currentLocal.trim() === (dbValue || "").trim()
    )
      return;
    update(id, { formula_perfil: currentLocal.trim() });
  };

  async function handleAdd() {
    try {
      await addDespiecePerfil({
        nivel,
        idParent,
        data: {
          id_perfil: perfiles[0].id,
          formula_cantidad: "1",
          formula_perfil: "ancho",
          angulo: "45",
        } as any,
      });
    } catch (error) {
      console.error("Error al intentar agregar el perfil:", error);
    }
  }

  return (
    <div className="space-y-3">
      {isLoading ? (
        <DespiecePerfilSkeleton />
      ) : (
        <>
          {/* Header */}
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-md">
                <Layers className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
              </div>
              <p className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-widest">
                {label}
              </p>
              {items.length > 0 && (
                <span className="text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-200/50 dark:bg-zinc-800/80 px-2 py-0.5 rounded-full">
                  {items.length}
                </span>
              )}
            </div>
            <button
              onClick={handleAdd}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-amber-500 hover:bg-amber-600 text-black transition-all shadow-sm active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={2.5} /> Agregar Fila
            </button>
          </div>

          {items.length === 0 ? (
            <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/20 rounded-xl py-8 transition-colors hover:border-zinc-300 dark:hover:border-zinc-700">
              <EmptyState
                icon={Layers}
                title="Sin perfiles de corte"
                description="Agregá las barras que componen este elemento"
              />
            </div>
          ) : (
            <div className="space-y-2">
              {/* Cabecera de columnas optimizada */}
              <div className="grid grid-cols-[1.5fr_90px_1.5fr_70px_40px] gap-2 px-3 py-1">
                {["Perfil Base", "Cant.", "Fórmula de Corte", "Ángulo", ""].map(
                  (h, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest"
                    >
                      {h}
                    </span>
                  ),
                )}
              </div>

              {/* Listado de filas de despiece */}
              <div className="space-y-1.5">
                {items.map((item) => {
                  const rowStatus = syncStatuses[item.id] || "idle";

                  return (
                    <div
                      key={item.id}
                      className="grid grid-cols-[1.5fr_90px_1.5fr_70px_40px] gap-2 items-center bg-white dark:bg-zinc-900/40 rounded-xl p-2 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm transition-all group"
                    >
                      {/* Selector de Perfil del Catálogo */}
                      <Select
                        size="sm"
                        selectedKeys={
                          (item as any).id_perfil ? [String((item as any).id_perfil)] : []
                        }
                        onSelectionChange={(k: Set<string>) => {
                          const selectedValue = [...k][0];
                          if (selectedValue) {
                            update(item.id, {
                              id_perfil: Number(selectedValue),
                            });
                          }
                        }}
                        aria-label="Perfil"
                        classNames={{
                          // Aseguramos que el botón cerrado no se expanda y corte el texto interno
                          trigger:
                            "bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 h-9 min-h-unit-9 hover:border-amber-500/50 transition-colors shadow-none rounded-lg px-2.5",
                          value: "truncate block w-full text-xs font-medium",
                        }}
                      >
                        {perfiles.map((p) => (
                          <SelectItem
                            key={String(p.id)}
                            textValue={`${p.nro_perfil} - ${p.descri}`}
                            className="data-[hover=true]:bg-zinc-100 dark:data-[hover=true]:bg-zinc-800"
                          >
                            {/* Flex dinámico para que el código no se aplaste y la descripción se trunque fluida */}
                            <div className="flex items-center w-full min-w-0 gap-2">
                              <span className="font-mono text-xs font-black text-amber-500 shrink-0">
                                {p.nro_perfil}
                              </span>
                              <span className="text-zinc-600 dark:text-zinc-400 text-xs truncate flex-1 min-w-0">
                                {p.descri}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </Select>

                      {/* Input de Fórmula Cantidad */}
                      <FormulaInput
                        label=""
                        value={localCantidades[item.id] ?? ""}
                        onChange={(v) =>
                          setLocalCantidades((prev) => ({
                            ...prev,
                            [item.id]: v,
                          }))
                        }
                        onBlur={() =>
                          handleBlurCantidad(item.id, (item as any).formula_cantidad)
                        }
                        size="sm"
                      />

                      {/* Input de Fórmula Medida de Corte */}
                      <FormulaInput
                        label=""
                        value={localMedidas[item.id] ?? ""}
                        onChange={(v) =>
                          setLocalMedidas((prev) => ({ ...prev, [item.id]: v }))
                        }
                        onBlur={() =>
                          handleBlurMedida(item.id, (item as any).formula_perfil)
                        }
                        size="sm"
                      />

                      {/* Selector de Ángulo de Corte */}
                      <Select
                        size="sm"
                        selectedKeys={
                          item.angulo !== undefined ? [item.angulo] : ["45"]
                        }
                        onSelectionChange={(k: Set<string>) => {
                          const selectedValue = [...k][0];
                          if (selectedValue !== undefined) {
                            update(item.id, {
                              angulo: selectedValue as string,
                            });
                          }
                        }}
                        aria-label="Ángulo"
                        classNames={{
                          trigger:
                            "bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 h-9 min-h-unit-9 font-mono text-xs font-bold text-center shadow-none rounded-lg",
                          value: "text-center",
                        }}
                      >
                        {ANGULOS.map((a) => (
                          <SelectItem key={a} textValue={a || "—"}>
                            {a || "—"}
                          </SelectItem>
                        ))}
                      </Select>

                      {/* Columna Dinámica de Estado y Acción de Borrado */}
                      <div className="flex items-center justify-center w-full h-full relative">
                        {rowStatus === "idle" && (
                          <button
                            onClick={() =>
                              deleteDespiecePerfil({
                                id: item.id,
                                nivel,
                                idParent,
                              })
                            }
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all opacity-50 group-hover:opacity-100"
                            title="Eliminar línea de corte"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}

                        {rowStatus === "saving" && (
                          <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                        )}

                        {rowStatus === "saved" && (
                          <Check
                            className="w-4 h-4 text-emerald-500"
                            strokeWidth={3}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
