import { Select, SelectItem } from "@heroui/react";
import { Plus, Trash2, Wrench } from "lucide-react";
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
import { Alert } from "@heroui/react";

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
  //---HOOOKS DE ACCESORIOS DESDE OPENDATA
  const {
    data: accesorios = [],
    isLoading: isLoadingAccesorios,
    isError: isErrorAccesorios,
  } = useAccesorios();

  //---HOOKS DE DESPIECE ACCESORIOS
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

  if (isError) {
    return (
      <div className="flex items-center justify-center w-full">
        <Alert
          color="danger"
          title="Error al cargar el despiece de accesorios"
          description="Por favor, recarga la página e intenta nuevamente. Si el error persiste, contactate con soporte técnico."
        />
      </div>
    );
  }

  if (!accesorios || accesorios.length === 0) {
    console.log("No hay accesorios cargados");
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

  async function handleAdd() {
    if (!accesorios || accesorios.length === 0) {
      console.error("No hay accesorios disponibles");
      return;
    }
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

  async function update(id: number, data: Partial<DespieceAccesorio>) {
    try {
      await updateDespieceAccesorio({
        id: id,
        nivel: nivel,
        data: data,
      });
      console.log("Actualizado con éxito");
    } catch (error) {
      console.error("Error al actualizar:", error);
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

      console.log("Eliminado con éxito");
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
              <div className="grid grid-cols-[1fr_140px_32px] gap-3 px-2">
                {["Accesorio", "Cantidad", ""].map((h, i) => (
                  <span
                    key={i}
                    className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest"
                  >
                    {h}
                  </span>
                ))}
              </div>

              {items.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-[1fr_140px_32px] gap-3 items-center bg-zinc-50 dark:bg-zinc-900/40 rounded-xl px-2 py-1.5 border border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
                >
                  <Select
                    size="sm"
                    selectedKeys={item.id_accesorio ? [item.id_accesorio] : []}
                    onSelectionChange={(k: any) =>
                      update(item.id, { id_accesorio: [...k][0] as number })
                    }
                    aria-label="Accesorio"
                    classNames={{
                      trigger:
                        "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 h-8 min-h-unit-8 text-xs hover:border-zinc-400 transition-colors",
                    }}
                    renderValue={(items: any) =>
                      items.map((i: any) => (
                        <div key={i.key} className="flex flex-col">
                          <span className="text-[10px] font-bold font-mono leading-none text-amber-500">
                            {i.data?.codParte}
                          </span>
                          <span className="text-[9px] text-zinc-500 truncate leading-tight">
                            {i.data?.descri}
                          </span>
                        </div>
                      ))
                    }
                  >
                    {accesorios.map((a) => (
                      <SelectItem
                        key={a.cod_parte}
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

                  <FormulaInput
                    label=""
                    value={item.formula_cantidad}
                    onChange={(v) => update(item.id, { formula_cantidad: v })}
                    size="sm"
                  />

                  <button
                    onClick={() => handleDelete(item)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
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
