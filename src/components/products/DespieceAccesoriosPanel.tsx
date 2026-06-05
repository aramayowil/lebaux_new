import { useState, useEffect } from "react";
import { Select, SelectItem, Alert } from "@heroui/react";
import { Plus, Trash2, Wrench, Loader2, Check } from "lucide-react";
import FormulaInput from "@/components/ui/FormulaInput";
import EmptyState from "@/components/ui/EmptyState";
import type { DespieceAccesorio } from "@/types";
import {
  useAddDespieceAccesorio,
  useDeleteDespieceAccesorio,
  useDespieceAccesorios,
  useUpdateDespieceAccesorio,
} from "@/hooks/productos/despieces/useDespieceAccesorios";
import { useAccesorios } from "@/hooks/catalogo/useAccesorios";
import { AccesoriosPanelSkeleton } from "./skeletons/DespieceAccesoriosPanelSkeleton";

type Nivel = "marco" | "hoja" | "interior" | "cruces" | "mosquitero";

interface Props {
  nivel: Nivel;
  idParent: number;
  label?: string;
}

export default function DespieceAccesoriosPanel({
  nivel,
  idParent,
  label = "Accesorios",
}: Props) {
  // Hooks de datos
  const {
    data: accesorios = [],
    isLoading: isLoadingAccesorios,
    isError: isErrorAccesorios,
  } = useAccesorios();
  const {
    data: items = [],
    isLoading: isLoadingDespieceAccesorios,
    isError: isErrorDespieceAccesorios,
  } = useDespieceAccesorios(nivel, idParent);

  const { mutateAsync: addDespieceAccesorio } = useAddDespieceAccesorio();
  const { mutateAsync: updateDespieceAccesorio } = useUpdateDespieceAccesorio();
  const { mutateAsync: deleteDespieceAccesorio } = useDeleteDespieceAccesorio();

  const isLoading = isLoadingAccesorios || isLoadingDespieceAccesorios;
  const isError = isErrorAccesorios || isErrorDespieceAccesorios;

  // Estados locales
  const [localCantidades, setLocalCantidades] = useState<
    Record<number, string>
  >({});
  const [syncStatuses, setSyncStatuses] = useState<
    Record<number, "idle" | "saving" | "saved">
  >({});

  // ✅ CORREGIDO: Cambiamos 'items' por dependencias primitivas estables ([idParent, items.length])
  // Esto rompe definitivamente el bucle infinito de re-renders.
  useEffect(() => {
    const cantidades: Record<number, string> = {};
    items.forEach((item) => {
      cantidades[item.id] = item.formula_cantidad || "";
    });
    setLocalCantidades(cantidades);
  }, [idParent, items.length]);

  if (isError) {
    return (
      <div className="flex items-center justify-center w-full">
        <Alert
          color="danger"
          title="Error al cargar el despiece de accesorios"
          description="Por favor, recarga la página e intenta nuevamente."
        />
      </div>
    );
  }

  if (!accesorios || accesorios.length === 0) {
    return (
      <div className="flex items-center justify-center w-full">
        <Alert
          color="warning"
          title="Catálogo vacío"
          description="No hay accesorios cargados en el catálogo. Por favor, crea uno primero."
        />
      </div>
    );
  }

  // Función de actualización
  async function update(id: number, data: Partial<DespieceAccesorio>) {
    try {
      setSyncStatuses((prev) => ({ ...prev, [id]: "saving" }));
      await updateDespieceAccesorio({ id, nivel, data });
      setSyncStatuses((prev) => ({ ...prev, [id]: "saved" }));

      setTimeout(() => {
        setSyncStatuses((prev) => ({ ...prev, [id]: "idle" }));
      }, 1500);
    } catch (error) {
      console.error("Error al actualizar:", error);
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

  async function handleAdd() {
    if (!accesorios || accesorios.length === 0) return;
    try {
      await addDespieceAccesorio({
        nivel: nivel,
        idParent: idParent,
        data: {
          id_accesorio: accesorios[0]?.id,
          formula_cantidad: "1",
        },
      });
    } catch (error) {
      console.error("Error al añadir accesorio:", error);
    }
  }

  async function handleDelete(item: DespieceAccesorio) {
    const ok = window.confirm(`¿Eliminar este accesorio?`);
    if (!ok) return;

    try {
      await deleteDespieceAccesorio({
        id: item.id,
        nivel: nivel,
        idParent: idParent,
      });
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  }

  return (
    <div className="space-y-2.5">
      {isLoading ? (
        <AccesoriosPanelSkeleton />
      ) : (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wrench className="w-3.5 h-3.5 text-zinc-400" />
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                {label}
              </p>
              {items.length > 0 && (
                <span className="text-[9px] font-mono text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                  {items.length}
                </span>
              )}
            </div>
            <button
              onClick={handleAdd}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-400 hover:bg-amber-500 text-white transition-colors shadow-sm"
            >
              <Plus className="w-3 h-3" /> Agregar
            </button>
          </div>

          {items.length === 0 ? (
            <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl py-6">
              <EmptyState
                icon={Wrench}
                title="Sin accesorios asignados"
                description="Agregá los herrajes y componentes de este nivel"
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              {/* Cabecera */}
              <div className="grid grid-cols-[1fr_150px_50px] gap-3 px-2">
                {["Accesorio", "Cantidad", "Estado"].map((h, i) => (
                  <span
                    key={i}
                    className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest"
                  >
                    {h}
                  </span>
                ))}
              </div>

              {items.map((item) => {
                const rowStatus = syncStatuses[item.id] || "idle";

                return (
                  <div
                    key={item.id}
                    className="grid grid-cols-[1fr_150px_50px] gap-3 items-center bg-zinc-50 dark:bg-zinc-900/40 rounded-xl p-2 border border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
                  >
                    {/* Selector de Accesorio */}
                    <Select
                      size="sm"
                      selectedKeys={
                        item.id_accesorio ? [String(item.id_accesorio)] : []
                      }
                      onSelectionChange={(k: Set<string>) => {
                        const selectedValue = [...k][0];
                        if (selectedValue) {
                          update(item.id, {
                            id_accesorio: Number(selectedValue),
                          });
                        }
                      }}
                      aria-label="Accesorio"
                      classNames={{
                        trigger:
                          "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 h-8 min-h-unit-8 text-xs hover:border-zinc-400 transition-colors shadow-none",
                      }}
                      renderValue={(selectedItems: any) =>
                        selectedItems.map((i: any) => {
                          const targetAccesorio = accesorios.find(
                            (a) => String(a.id) === String(i.key),
                          );
                          return (
                            <div
                              key={i.key}
                              className="flex flex-col alignment-start text-left"
                            >
                              <span className="text-[10px] font-bold font-mono leading-none text-amber-500">
                                {targetAccesorio
                                  ? targetAccesorio.cod_parte
                                  : "—"}
                              </span>
                              <span className="text-[9px] text-zinc-500 truncate leading-tight mt-0.5">
                                {targetAccesorio
                                  ? targetAccesorio.descri
                                  : "Desconocido"}
                              </span>
                            </div>
                          );
                        })
                      }
                    >
                      {accesorios.map((a) => (
                        <SelectItem
                          key={String(a.id)}
                          textValue={a.cod_parte}
                          className="py-1.5"
                        >
                          <div className="flex flex-col">
                            <span className="font-mono text-[11px] font-bold text-amber-500">
                              {a.cod_parte}
                            </span>
                            <span className="text-[10px] text-zinc-500">
                              {a.descri}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </Select>

                    {/* Input de Cantidad / Fórmula */}
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
                        handleBlurCantidad(item.id, item.formula_cantidad ?? "")
                      }
                      size="sm"
                    />

                    {/* Columna de acciones / estado dinámico */}
                    <div className="flex items-center justify-center min-w-8 h-8 relative">
                      {rowStatus === "idle" && (
                        <button
                          onClick={() => handleDelete(item)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Eliminar accesorio"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {rowStatus === "saving" && (
                        <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                      )}

                      {rowStatus === "saved" && (
                        <Check className="w-4 h-4 text-emerald-500" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {items.length > 0 && (
            <p className="text-[9px] text-zinc-400 italic px-1">
              Las cantidades pueden expresarse como fórmulas basadas en las
              medidas del {nivel}.
            </p>
          )}
        </>
      )}
    </div>
  );
}
