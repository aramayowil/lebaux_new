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

  // ✅ CORREGIDO: Escuchamos propiedades primitivas e invariables (idParent y la cantidad de elementos).
  // Esto evita que referencias de arrays inestables relancen el efecto eternamente.
  useEffect(() => {
    const cantidades: Record<number, string> = {};
    const medidas: Record<number, string> = {};

    items.forEach((item) => {
      cantidades[item.id] = item.formula_cantidad || "";
      medidas[item.id] = item.formula_perfil || "";
    });

    setLocalCantidades(cantidades);
    setLocalMedidas(medidas);
  }, [idParent, items.length]); // 👈 Cambiado 'items' por dependencias estables primitivas

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
        },
      });
    } catch (error) {
      console.error("Error al intentar agregar el perfil:", error);
    }
  }

  return (
    <div className="space-y-2.5">
      {isLoading ? (
        <DespiecePerfilSkeleton />
      ) : (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-zinc-400" />
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
                icon={Layers}
                title="Sin perfiles de corte"
                description="Agregá las barras que componen este elemento"
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              {/* Cabecera de columnas */}
              <div className="grid grid-cols-[1.2fr_90px_1.2fr_70px_50px] gap-2 px-2">
                {["Perfil", "Cantidad", "Medida", "Ángulo", "Estado"].map(
                  (h, i) => (
                    <span
                      key={i}
                      className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest"
                    >
                      {h}
                    </span>
                  ),
                )}
              </div>

              {/* Listado de filas de despiece */}
              {items.map((item) => {
                const rowStatus = syncStatuses[item.id] || "idle";

                return (
                  <div
                    key={item.id}
                    className="grid grid-cols-[1.2fr_90px_1.2fr_70px_50px] gap-2 items-center bg-zinc-50 dark:bg-zinc-900/40 rounded-xl p-2 border border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
                  >
                    {/* Selector de Perfil del Catálogo */}
                    <Select
                      size="sm"
                      selectedKeys={
                        item.id_perfil ? [String(item.id_perfil)] : []
                      }
                      onSelectionChange={(k: Set<string>) => {
                        const selectedValue = [...k][0];
                        if (selectedValue) {
                          update(item.id, { id_perfil: Number(selectedValue) });
                        }
                      }}
                      aria-label="Perfil"
                      classNames={{
                        trigger:
                          "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 h-8 min-h-unit-8 font-mono text-xs hover:border-zinc-400 transition-colors shadow-none",
                      }}
                    >
                      {perfiles.map((p) => (
                        <SelectItem
                          key={String(p.id)}
                          textValue={`${p.nro_perfil} - ${p.descri}`}
                        >
                          <span className="font-mono text-xs font-bold text-amber-500">
                            {p.nro_perfil}
                          </span>
                          <span className="text-zinc-500 ml-2 text-xs">
                            {p.descri}
                          </span>
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
                        handleBlurCantidad(item.id, item.formula_cantidad)
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
                        handleBlurMedida(item.id, item.formula_perfil)
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
                          update(item.id, { angulo: selectedValue as string });
                        }
                      }}
                      aria-label="Ángulo"
                      classNames={{
                        trigger:
                          "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 h-8 min-h-unit-8 font-mono text-xs shadow-none",
                      }}
                    >
                      {ANGULOS.map((a) => (
                        <SelectItem key={a} textValue={a || "—"}>
                          {a || "—"}
                        </SelectItem>
                      ))}
                    </Select>

                    {/* Columna Dinámica de Estado y Acción de Borrado */}
                    <div className="flex items-center justify-center min-w-8 h-8 relative">
                      {rowStatus === "idle" && (
                        <button
                          onClick={() =>
                            deleteDespiecePerfil({
                              id: item.id,
                              nivel,
                              idParent,
                            })
                          }
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Eliminar línea de corte"
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
        </>
      )}
    </div>
  );
}
