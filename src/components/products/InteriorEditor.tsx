import { useState } from "react";
import { Input, Switch } from "@heroui/react";
import { Plus, Trash2, Check, ChevronDown, ChevronUp, X } from "lucide-react";
import FormulaInput from "@/components/ui/FormulaInput";
// import DespiecePerfilesPanel from "./DespiecePerfilesPanel";
import DespieceAccesoriosPanel from "./DespieceAccesoriosPanel";
import type {
  Interior,
  DespieceInterior,
  Contravidrio,
  ContravidrioExterior,
  Cruces,
  VidRepartido,
  DespieceCruces,
  DespiecePerfilVidrioRepartido,
} from "@/types";
import clsx from "clsx";
import {
  useAddDespiecePerfilContravidrio,
  useDeleteDespiecePerfilContravidrio,
  useDespiecePerfilesContravidrio,
  useUpdateDespiecePerfilContravidrio,
} from "@/hooks/productos/despieces/useDespiecePerfilesContravidrios";
import { usePerfiles } from "@/hooks/catalogo/usePerfiles";
import { useUpdateInterior } from "@/hooks/productos/useInteriores";
import {
  useAddDespieceInterior,
  useDespieceInteriorByInterior,
  useUpdateDespieceInterior,
} from "@/hooks/productos/despieces/useDespieceInteriores";
import {
  useAddContravidrio,
  useContravidriosByInterior,
  useDeleteContravidrio,
  useUpdateContravidrio,
} from "@/hooks/productos/useContravidrios";
import {
  useAddContravidrioExt,
  useContravidriosExtByInterior,
  useDeleteContravidrioExt,
  useUpdateContravidrioExt,
} from "@/hooks/productos/useContravidriosExt";
import {
  useAddDespieceCruce,
  useDespieceCruceByCruces,
  useUpdateDespieceCruce,
} from "@/hooks/productos/despieces/useDespieceCruces";
import {
  useAddVidrioRepartido,
  useDeleteVidrioRepartido,
  useUpdateVidrioRepartido,
  useVidrioRepartidosByInterior,
} from "@/hooks/productos/useVidRepartidos";
import {
  useAddCruce,
  useCrucesByInterior,
  useDeleteCruce,
  useUpdateCruce,
} from "@/hooks/productos/useCruces";
import {
  useAddDespieceVR,
  useDespieceVRByVR,
  useUpdateDespieceVR,
} from "@/hooks/productos/despieces/useDespieceVR";
import {
  ContravidrioFormSkeleton,
  CrucesFormSkeleton,
  InteriorSkeleton,
  VidrioRepartidoFormSkeleton,
} from "./skeletons/InteriorEditorSkeleton";
import { Alert } from "@heroui/react";
import { Button } from "@heroui/react";

interface Props {
  interior: Interior;
}

const IW = {
  inputWrapper:
    "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors shadow-none",
};

// ─────────────────────────────────────────────────────────────────────────────

export default function InteriorEditor({ interior }: Props) {
  // --- HOOKS DE BASE DE DATOS ---
  const { mutateAsync: updateInterior } = useUpdateInterior();

  //--- HOOKS DESPIECE INTERIOR ---
  const {
    data: despInt,
    isLoading: isLoadingDespInt,
    error: errorDespInt,
  } = useDespieceInteriorByInterior(interior.id);
  const { mutateAsync: addDespieceInterior } = useAddDespieceInterior();
  const { mutateAsync: updateDespieceInterior } = useUpdateDespieceInterior();

  //--- HOOKS CONTRAVIDRIO INT ---

  const { mutateAsync: addContravidrio } = useAddContravidrio();
  const { mutateAsync: updateContravidrio } = useUpdateContravidrio();
  const { mutateAsync: deleteContravidrio } = useDeleteContravidrio();
  const {
    data: cvs = [],
    isLoading: isLoadingCvs,
    error: errorCvs,
  } = useContravidriosByInterior(interior.id);

  //--- HOOKS CONTRAVIDRIO EXT ---
  const { mutateAsync: addContravidrioExt } = useAddContravidrioExt();
  const { mutateAsync: updateContravidrioExt } = useUpdateContravidrioExt();
  const { mutateAsync: deleteContravidrioExt } = useDeleteContravidrioExt();
  const {
    data: cves = [],
    isLoading: isLoadingCves,
    error: errorCves,
  } = useContravidriosExtByInterior(interior.id);

  //--- HOOKS CRUCES ---
  const { mutateAsync: addCruces } = useAddCruce();
  const { mutateAsync: updateCruces } = useUpdateCruce();
  const { mutateAsync: deleteCruces } = useDeleteCruce();
  const {
    data: crcs = [],
    isLoading: isLoadingCrcs,
    error: errorCrcs,
  } = useCrucesByInterior(interior.id);

  //--- HOOKS VIDREPARTIDOS ---
  const { mutateAsync: addVidRepartido } = useAddVidrioRepartido();
  const { mutateAsync: updateVidRepartido } = useUpdateVidrioRepartido();
  const { mutateAsync: deleteVidRepartido } = useDeleteVidrioRepartido();
  const {
    data: vrs = [],
    isLoading: isLoadingVrs,
    error: errorVrs,
  } = useVidrioRepartidosByInterior(interior.id);

  const isLoading =
    isLoadingDespInt ||
    isLoadingCvs ||
    isLoadingCves ||
    isLoadingCrcs ||
    isLoadingVrs;
  const isError =
    errorDespInt || errorCvs || errorCves || errorCrcs || errorVrs;

  if (isError) {
    return (
      <div className="flex items-center justify-center w-full">
        <Alert
          color="danger"
          title="Error al editar el interior"
          description="Por favor, recarga la página e intenta nuevamente. Si el error persiste, contactate con soporte técnico."
        />
      </div>
    );
  }

  const [subTab, setSubTab] = useState<"cv-int" | "cv-ext" | "cruces" | "vr">(
    "cv-int",
  );
  const [dimOpen, setDimOpen] = useState(true);

  const upd = (d: Partial<Interior>) =>
    updateInterior({ id: interior.id, data: d });

  async function updDespInt(data: Partial<DespieceInterior>) {
    let di = despInt;

    if (!di)
      di = await addDespieceInterior({
        id_interior: interior.id,
        formula_cantidad_interiores: "1",
        formula_ancho_interior: "ancho - 20",
        formula_alto_interior: "alto - 60",
        descuento_izquierda: 5,
        descuento_derecha: 5,
        descuento_abajo: 5,
        descuento_arriba: 5,
      });

    updateDespieceInterior({ id: di.id, data: data });
  }

  const TABS = [
    { key: "cv-int" as const, label: "CV Int.", count: cvs.length },
    { key: "cv-ext" as const, label: "CV Ext.", count: cves.length },
    { key: "cruces" as const, label: "Cruces", count: crcs.length },
    { key: "vr" as const, label: "Vid. Repartido", count: vrs.length },
  ];

  return (
    <div className="flex flex-col bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
      {isLoading ? (
        <InteriorSkeleton />
      ) : (
        <>
          {/* ── Cabecera ── */}
          <div className="flex items-center gap-3 px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
            <div className="w-1.5 h-5 rounded-full bg-amber-400 shrink-0" />
            <Input
              value={interior.descripcion}
              onValueChange={(v: string) => upd({ descripcion: v })}
              size="sm"
              aria-label="Nombre del interior"
              placeholder="Nombre del interior"
              classNames={{
                inputWrapper:
                  "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 h-8 min-h-unit-8 shadow-none",
                input: "font-medium text-sm",
              }}
              className="max-w-xs"
            />
            <div className="flex items-center gap-2 ml-auto">
              {interior.predeterminado && (
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full">
                  Predeterminado
                </span>
              )}
              <Switch
                isSelected={interior.predeterminado}
                onValueChange={(v: boolean) => upd({ predeterminado: v })}
                size="sm"
              />
            </div>
          </div>
          {/* ── ① DIMENSIONES (acordeón) ── */}
          <div className="border-b border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => setDimOpen((o) => !o)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors text-left"
            >
              <div className="w-1 h-4 rounded-full bg-blue-400 shrink-0" />
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-200 uppercase tracking-wide flex-1">
                Editando interior
              </span>
              {!despInt && (
                <span className="text-[10px] text-amber-500 font-medium mr-1">
                  sin configurar
                </span>
              )}
              {dimOpen ? (
                <ChevronUp className="w-4 h-4 text-zinc-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-zinc-400" />
              )}
            </button>

            {dimOpen && (
              <div className="px-4 pb-5 space-y-5">
                {/* Fórmulas */}
                <div className="grid grid-cols-3 gap-3">
                  <FormulaInput
                    label="Cantidad"
                    value={despInt?.formula_cantidad_interiores ?? "1"}
                    onChange={(v: string) =>
                      updDespInt({ formula_cantidad_interiores: v })
                    }
                    description="ej: 1, hojas"
                  />
                  <FormulaInput
                    label="Ancho"
                    value={despInt?.formula_ancho_interior ?? ""}
                    onChange={(v: string) =>
                      updDespInt({ formula_ancho_interior: v })
                    }
                    description="ej: ancho/hojas - 40"
                  />
                  <FormulaInput
                    label="Alto"
                    value={despInt?.formula_alto_interior ?? ""}
                    onChange={(v: string) =>
                      updDespInt({ formula_alto_interior: v })
                    }
                    description="ej: alto - 80"
                  />
                </div>

                {/* Diagrama de descuentos */}
                <div>
                  <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-4">
                    Descuentos de rebaje
                  </p>
                  <div className="flex justify-center">
                    <DescuentoDiagram despInt={despInt} onUpdate={updDespInt} />
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* ── ② COMPONENTES ── */}
          <div className="flex flex-col border-b border-zinc-200 dark:border-zinc-800">
            {/* Header con tabs pill */}
            <div className="flex items-center gap-2 px-4 py-3 bg-zinc-50/60 dark:bg-zinc-900/40 border-b border-zinc-100 dark:border-zinc-800/60 overflow-x-auto no-scrollbar">
              <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider shrink-0 mr-1">
                Componentes
              </p>
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setSubTab(t.key)}
                  className={clsx(
                    "flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold transition-all whitespace-nowrap shrink-0",
                    subTab === t.key
                      ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700",
                  )}
                >
                  {t.label}
                  {t.count > 0 && (
                    <span
                      className={clsx(
                        "text-[9px] font-bold px-1.5 py-px rounded-full",
                        subTab === t.key
                          ? "bg-white/20 text-white dark:text-zinc-900 dark:bg-black/20"
                          : "bg-zinc-300 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300",
                      )}
                    >
                      {t.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Panel del tab activo */}
            <div className="min-h-[260px]">
              {subTab === "cv-int" && (
                <SubElementPanel
                  items={cvs}
                  emptyLabel="Sin contravidrios interiores"
                  onAdd={() =>
                    addContravidrio({
                      id_interior: interior.id,
                      descripcion: `CV Int. ${cvs.length + 1}`,
                      predeterminado: cvs.length === 0,
                      no_verificado: false,
                    })
                  }
                  renderEditor={(cv: Contravidrio) => (
                    <ContravidrioForm
                      cv={cv}
                      nivel="contravidrio"
                      onUpdate={(d) =>
                        updateContravidrio({ id: cv.id, data: d })
                      }
                      onDelete={() =>
                        deleteContravidrio({
                          id: cv.id,
                          id_interior: interior.id,
                        })
                      }
                    />
                  )}
                  getItemId={(cv) => cv.id}
                />
              )}
              {subTab === "cv-ext" && (
                <SubElementPanel
                  items={cves}
                  emptyLabel="Sin contravidrios exteriores"
                  onAdd={() =>
                    addContravidrioExt({
                      id_interior: interior.id,
                      descripcion: `CV Ext. ${cves.length + 1}`,
                      predeterminado: cves.length === 0,
                      no_verificado: false,
                    })
                  }
                  renderEditor={(cv: ContravidrioExterior) => (
                    <ContravidrioForm
                      cv={cv}
                      nivel="contravidrio_ext"
                      onUpdate={(d) =>
                        updateContravidrioExt({ id: cv.id, data: d })
                      }
                      onDelete={() =>
                        deleteContravidrioExt({
                          id: cv.id,
                          id_interior: interior.id,
                        })
                      }
                    />
                  )}
                  getItemId={(cv) => cv.id}
                />
              )}
              {subTab === "cruces" && (
                <SubElementPanel
                  items={crcs}
                  emptyLabel="Sin cruces definidos"
                  onAdd={() =>
                    addCruces({
                      id_interior: interior.id,
                      descripcion: `Cruces ${crcs.length + 1}`,
                      predeterminado: crcs.length === 0,
                      no_verificado: false,
                    })
                  }
                  renderEditor={(c: Cruces) => (
                    <CrucesForm
                      cruces={c}
                      onUpdate={(d) => updateCruces({ id: c.id, data: d })}
                      onDelete={() => deleteCruces(c.id)}
                    />
                  )}
                  getItemId={(c) => c.id}
                />
              )}
              {subTab === "vr" && (
                <SubElementPanel
                  items={vrs}
                  emptyLabel="Sin vidrios repartidos"
                  onAdd={() =>
                    addVidRepartido({
                      id_interior: interior.id,
                      descripcion: `VR ${vrs.length + 1}`,
                      predeterminado: vrs.length === 0,
                      no_verificado: false,
                    })
                  }
                  renderEditor={(vr: VidRepartido) => (
                    <VidRepartidoForm
                      vr={vr}
                      onUpdate={(d) =>
                        updateVidRepartido({ id: vr.id, data: d })
                      }
                      onDelete={() =>
                        deleteVidRepartido({
                          id: vr.id,
                          id_interior: vr.id_interior ?? 0,
                        })
                      }
                    />
                  )}
                  getItemId={(vr) => vr.id}
                />
              )}
            </div>
          </div>
          {/* ── ③ PERFILES  ④ ACCESORIOS ── */}
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
            <div className="p-4">
              <DespieceAccesoriosPanel
                nivel="interior"
                idParent={interior.id}
                label="Accesorios del interior"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── DescuentoDiagram — inputs en forma de marco ───────────────────────────────

function DescuentoDiagram({
  despInt,
  onUpdate,
}: {
  despInt: DespieceInterior | undefined;
  onUpdate: (d: Partial<DespieceInterior>) => void;
}) {
  return (
    <div className="relative w-64 h-40 mb-5">
      <div className="absolute inset-0 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-600" />
      <div className="absolute inset-7 rounded-lg border-2 border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/10 flex items-center justify-center">
        <span className="text-[10px] text-blue-400 font-medium">vidrio</span>
      </div>
      {/* Arriba */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <DescInput
          value={despInt?.descuento_arriba ?? 0}
          label="Arriba"
          onChange={(v) => onUpdate({ descuento_arriba: v })}
        />
      </div>
      {/* Abajo */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
        <DescInput
          value={despInt?.descuento_abajo ?? 0}
          label="Abajo"
          onChange={(v) => onUpdate({ descuento_abajo: v })}
        />
      </div>
      {/* Izquierda */}
      <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <DescInput
          value={despInt?.descuento_izquierda ?? 0}
          label="Izq."
          onChange={(v) => onUpdate({ descuento_izquierda: v })}
        />
      </div>
      {/* Derecha */}
      <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2">
        <DescInput
          value={despInt?.descuento_derecha ?? 0}
          label="Der."
          onChange={(v) => onUpdate({ descuento_derecha: v })}
        />
      </div>
    </div>
  );
}

function DescInput({
  value,
  label,
  onChange,
}: {
  value: number;
  label: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <input
        type="number"
        aria-label={label}
        value={String(value)}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="w-12 text-center text-xs font-mono bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-600 rounded-lg px-1 py-1 shadow-sm focus:outline-none focus:border-amber-400 transition-colors"
      />
      <span className="text-[8px] text-zinc-400 font-semibold uppercase tracking-wide">
        {label}
      </span>
    </div>
  );
}

// ── SubElementPanel — barra pill + editor ─────────────────────────────────────

function SubElementPanel<
  T extends { id: number; descripcion: string; predeterminado: boolean },
>({
  items,
  emptyLabel,
  onAdd,
  renderEditor,
  getItemId,
}: {
  items: T[];
  emptyLabel: string;
  onAdd: () => void;
  renderEditor: (item: T) => React.ReactNode;
  getItemId: (item: T) => number;
}) {
  const [selectedId, setSelectedId] = useState<number | null>(
    items.length > 0 ? getItemId(items[0]!) : null,
  );
  const sel =
    items.find((i) => getItemId(i) === selectedId) ?? items[0] ?? null;

  return (
    <div className="flex flex-col">
      {/* Barra de ítems */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-zinc-50/80 dark:bg-zinc-900/40 border-b border-zinc-100 dark:border-zinc-800 overflow-x-auto no-scrollbar">
        <button
          onClick={onAdd}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-semibold bg-amber-400 hover:bg-amber-500 text-white transition-colors shrink-0 shadow-sm"
        >
          <Plus className="w-3 h-3" /> Nuevo
        </button>

        {items.length > 0 && (
          <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-700 shrink-0" />
        )}

        {items.map((item) => (
          <button
            key={getItemId(item)}
            onClick={() => setSelectedId(getItemId(item))}
            className={clsx(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all shrink-0 border",
              sel && getItemId(sel) === getItemId(item)
                ? "bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 text-zinc-800 dark:text-zinc-100 shadow-sm"
                : "bg-transparent border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300",
            )}
          >
            {item.predeterminado && (
              <Check className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
            )}
            {item.descripcion}
          </button>
        ))}

        {items.length === 0 && (
          <span className="text-[11px] text-zinc-400 italic">{emptyLabel}</span>
        )}
      </div>

      {/* Editor */}
      <div className="p-4">
        {sel ? (
          renderEditor(sel)
        ) : (
          <div className="py-10 text-center">
            <p className="text-xs text-zinc-400 mb-3">{emptyLabel}</p>
            <button
              onClick={onAdd}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border border-dashed border-zinc-300 dark:border-zinc-600 text-zinc-500 hover:border-amber-400 hover:text-amber-500 transition-colors"
            >
              <Plus className="w-3 h-3" /> Agregar primero
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── FormHeader ────────────────────────────────────────────────────────────────

function FormHeader({
  name,
  pred,
  onName,
  onPred,
  onDelete,
}: {
  name: string;
  pred: boolean;
  onName: (v: string) => void;
  onPred: (v: boolean) => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-2 pb-3 mb-3 border-b border-zinc-100 dark:border-zinc-800">
      <input
        type="text"
        value={name}
        onChange={(e) => onName(e.target.value)}
        aria-label="Nombre"
        className="flex-1 text-sm font-semibold bg-transparent border-0 outline-none text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 min-w-0"
        placeholder="Sin nombre"
      />
      <div className="flex items-center gap-1.5 shrink-0">
        {pred && (
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
            Pred.
          </span>
        )}
        <Switch
          isSelected={pred}
          onValueChange={onPred}
          size="sm"
          aria-label="Predeterminado"
        />
      </div>
      <button
        onClick={onDelete}
        aria-label="Eliminar"
        className="p-1.5 rounded-lg text-zinc-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shrink-0"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ── FieldGroup ────────────────────────────────────────────────────────────────

function FieldGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2.5">
      <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
        {title}
      </p>
      {children}
    </div>
  );
}

// ── ContravidrioForm ──────────────────────────────────────────────────────────

function ContravidrioForm({
  cv,
  nivel,
  onUpdate,
  onDelete,
}: {
  cv: Contravidrio | ContravidrioExterior;
  nivel: "contravidrio" | "contravidrio_ext";
  onUpdate: (d: Partial<Contravidrio>) => void;
  onDelete: () => void;
}) {
  const {
    data: perfiles = [],
    isLoading: isLoadingPerfiles,
    isError: isErrorPerfiles,
  } = usePerfiles();

  const {
    data: items = [],
    isLoading: isLoadingItems,
    isError: isErrorItems,
  } = useDespiecePerfilesContravidrio(nivel, cv.id);
  const { mutateAsync: addDespiecePerfil } = useAddDespiecePerfilContravidrio();
  const { mutateAsync: updateDespiecePerfil } =
    useUpdateDespiecePerfilContravidrio();
  const { mutateAsync: deleteDespiecePerfil } =
    useDeleteDespiecePerfilContravidrio();

  const ANGULOS = ["45", "90", "0", ""];

  const isLoadingData = isLoadingPerfiles || isLoadingItems;
  const isErrorData = isErrorPerfiles || isErrorItems;

  if (!perfiles || perfiles.length === 0) {
    console.log("No hay perfiles cargados");
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

  return (
    <div className="space-y-4">
      {isErrorData && (
        <Alert
          status="error"
          icon={<X className="w-4 h-4" />}
          classNames={{
            base: "mb-3 rounded-lg border border-transparent shadow-sm",
            title: "text-sm font-medium",
          }}
        >
          Error al obtener datos del contravidrio.
        </Alert>
      )}
      {isLoadingData ? (
        <ContravidrioFormSkeleton />
      ) : (
        <>
          <FormHeader
            name={cv.descripcion}
            pred={cv.predeterminado}
            onName={(v) => onUpdate({ descripcion: v })}
            onPred={(v) => onUpdate({ predeterminado: v })}
            onDelete={onDelete}
          />

          <FieldGroup title="Perfiles del contravidrio">
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/40 p-3 space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <select
                      value={item.id_perfil ?? ""}
                      onChange={(e) =>
                        updateDespiecePerfil({
                          nivel: nivel,
                          id: item.id,
                          idParent: cv.id,
                          data: {
                            id_perfil: parseInt(e.target.value),
                          },
                        })
                      }
                      className="flex-1 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-400"
                    >
                      {perfiles.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nro_perfil} — {p.descri}
                        </option>
                      ))}
                    </select>
                    <select
                      value={item.angulo ?? ""}
                      onChange={(e) =>
                        updateDespiecePerfil({
                          nivel: nivel,
                          id: item.id,
                          idParent: cv.id,
                          data: {
                            angulo: e.target.value,
                          },
                        })
                      }
                      className="w-16 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1.5 focus:outline-none focus:border-amber-400"
                    >
                      {ANGULOS.map((a) => (
                        <option key={a} value={a}>
                          {a || "—"}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() =>
                        deleteDespiecePerfil({
                          nivel: nivel,
                          idParent: cv.id,
                          id: item.id,
                        })
                      }
                      className="p-1.5 text-zinc-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <FormulaInput
                      label="Cant. horizontal"
                      value={item.formula_cantidad_contravidrios_ancho ?? ""}
                      onChange={(v) =>
                        updateDespiecePerfil({
                          nivel: nivel,
                          id: item.id,
                          idParent: cv.id,
                          data: {
                            formula_cantidad_contravidrios_ancho: v,
                          },
                        })
                      }
                      description="ej: hojas*2"
                    />
                    <FormulaInput
                      label="Cant. vertical"
                      value={item.formula_cantidad_contravidrios_alto ?? ""}
                      onChange={(v) =>
                        updateDespiecePerfil({
                          nivel: nivel,
                          id: item.id,
                          idParent: cv.id,
                          data: {
                            formula_cantidad_contravidrios_alto: v,
                          },
                        })
                      }
                      description="ej: hojas*2"
                    />
                    <FormulaInput
                      label="Largo horizontal"
                      value={item.formula_contravidrio_ancho ?? ""}
                      onChange={(v) =>
                        updateDespiecePerfil({
                          nivel: nivel,
                          id: item.id,
                          idParent: cv.id,
                          data: {
                            formula_contravidrio_ancho: v,
                          },
                        })
                      }
                      description="ej: ancho - 20"
                    />
                    <FormulaInput
                      label="Largo vertical"
                      value={item.formula_contravidrio_alto ?? ""}
                      onChange={(v) =>
                        updateDespiecePerfil({
                          nivel: nivel,
                          id: item.id,
                          idParent: cv.id,
                          data: {
                            formula_contravidrio_alto: v,
                          },
                        })
                      }
                      description="ej: alto - 10"
                    />
                  </div>
                </div>
              ))}
              <button
                onClick={() => {
                  const perfilSeleccionado = perfiles[0];

                  // Validación preventiva: Si no hay perfil, no dispares la mutación
                  if (!perfilSeleccionado?.id) {
                    console.error(
                      "No se puede guardar: ID de perfil no encontrado.",
                    );
                    return;
                  }
                  addDespiecePerfil({
                    nivel: nivel,
                    idParent: cv.id,
                    data: {
                      id_contravidrio: cv.id,
                      id_perfil: perfilSeleccionado.id,
                      formula_cantidad_contravidrios_ancho: "hojas*2",
                      formula_cantidad_contravidrios_alto: "hojas*2",
                      formula_contravidrio_ancho: "ancho - 20",
                      formula_contravidrio_alto: "alto - 10",
                      angulo: "90",
                    },
                  });
                }}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 text-[11px] font-medium text-zinc-400 hover:border-amber-400 hover:text-amber-500 transition-colors"
              >
                <Plus className="w-3 h-3" /> Agregar perfil
              </button>
            </div>
          </FieldGroup>
        </>
      )}
    </div>
  );
}

// ── CrucesForm ────────────────────────────────────────────────────────────────

function CrucesForm({
  cruces,
  onUpdate,
  onDelete,
}: {
  cruces: Cruces;
  onUpdate: (d: Partial<Cruces>) => void;
  onDelete: () => void;
}) {
  // --- HOOKS DE DESPIECE CRUCES ---
  const { mutateAsync: addDespieceCruces } = useAddDespieceCruce();
  const { mutateAsync: updateDespieceCruces } = useUpdateDespieceCruce();
  // const { mutateAsync: deleteDespieceCruces } = useDeleteDespieceCruces();
  const {
    data: dc,
    isLoading: isLoadingDespieceCruces,
    isError: isErrorDespieceCruces,
  } = useDespieceCruceByCruces(cruces.id);

  // --- HOOKS DE PERFILES ---
  const {
    data: perfiles,
    isLoading: isLoadingPerfiles,
    isError: isErrorPerfiles,
  } = usePerfiles();

  if (!perfiles || perfiles.length === 0) {
    return (
      <Alert
        color="warning"
        title="No hay perfiles cargados"
        description="Por favor agregue perfiles al catalogo."
      />
    );
  }

  const isLoading = isLoadingDespieceCruces || isLoadingPerfiles;
  const isError = isErrorDespieceCruces || isErrorPerfiles;

  if (isError) {
    return (
      <Alert
        color="danger"
        title="Error al cargar"
        description="Error al obtener al cargar los datos de los perfiles. Intente nuevamente mas tarde."
      />
    );
  }

  const ANGULOS = ["45", "90", "0", "-"];

  async function updDC(data: Partial<DespieceCruces>) {
    if (!perfiles || perfiles.length === 0) {
      console.warn("Intentando actualizar sin perfiles cargados");
      return;
    }
    try {
      let d = dc;

      if (!d)
        d = await addDespieceCruces({
          id_cruces: cruces.id,
          id_perfil: perfiles[0]?.id ?? 0,
          formula_cantidad: "1",
          formula_ancho_entero: "ancho - 20",
          formula_alto_entero: "alto - 20",
          descuento_vidrio: 0,
          descuento_de_si_mismo: 0,
          angulo: "90",
        });

      updateDespieceCruces({ id: d.id, data: data });
    } catch (e) {
      console.log("error al actualizar");
    }
  }

  return (
    <div className="space-y-4">
      {isLoading ? (
        <CrucesFormSkeleton />
      ) : (
        <>
          <FormHeader
            name={cruces.descripcion}
            pred={cruces.predeterminado}
            onName={(v) => onUpdate({ descripcion: v })}
            onPred={(v) => onUpdate({ predeterminado: v })}
            onDelete={onDelete}
          />
          <FieldGroup title="Perfil del cruce">
            <div className="flex gap-2">
              <select
                value={dc.id_perfil}
                onChange={(e) => updDC({ id_perfil: Number(e.target.value) })}
                className="flex-1 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-400"
              >
                {perfiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nro_perfil} — {p.descri}
                  </option>
                ))}
              </select>
              <select
                value={dc.angulo}
                onChange={(e) => updDC({ angulo: e.target.value })}
                className="w-16 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1.5 focus:outline-none focus:border-amber-400"
              >
                {ANGULOS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
          </FieldGroup>
          <FieldGroup title="Medidas de corte">
            <div className="grid grid-cols-3 gap-3">
              <FormulaInput
                label="Cantidad"
                value={dc.formula_cantidad}
                onChange={(v) => updDC({ formula_cantidad: v })}
                description="ej: 1"
              />
              <FormulaInput
                label="Largo horizontal"
                value={dc.formula_ancho_entero}
                onChange={(v) => updDC({ formula_ancho_entero: v })}
                description="ej: ancho - 20"
              />
              <FormulaInput
                label="Largo vertical"
                value={dc.formula_alto_entero}
                onChange={(v) => updDC({ formula_alto_entero: v })}
                description="ej: alto - 20"
              />
            </div>
          </FieldGroup>
          <FieldGroup title="Descuentos en intersecciones">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Desc. de sí mismo"
                type="number"
                value={String(dc.descuento_de_si_mismo)}
                onValueChange={(v: string) =>
                  updDC({ descuento_de_si_mismo: parseFloat(v) })
                }
                size="sm"
                endContent={
                  <span className="text-[10px] text-zinc-400">mm</span>
                }
                description="El cruce se corta a sí mismo"
                classNames={IW}
              />
              <Input
                label="Desc. de vidrio"
                type="number"
                value={String(dc.descuento_vidrio)}
                onValueChange={(v: string) =>
                  updDC({ descuento_vidrio: parseFloat(v) })
                }
                size="sm"
                endContent={
                  <span className="text-[10px] text-zinc-400">mm</span>
                }
                description="Rebaje sobre el vidrio"
                classNames={IW}
              />
            </div>
          </FieldGroup>
          <FieldGroup title="Accesorios del cruce">
            <DespieceAccesoriosPanel nivel="cruces" idParent={cruces.id} />
          </FieldGroup>
        </>
      )}
    </div>
  );
}

// ── VidRepartidoForm ──────────────────────────────────────────────────────────

function VidRepartidoForm({
  vr,
  onUpdate,
  onDelete,
}: {
  vr: VidRepartido;
  onUpdate: (d: Partial<VidRepartido>) => void;
  onDelete: () => void;
  // getDespieceVR: (id: number) => DespieceVR | undefined;
  // addDespieceVR: (d: Omit<DespieceVR, "id">) => DespieceVR;
  // updateDespieceVR: (id: number, d: Partial<DespieceVR>) => void;
  // deleteDespieceVR: (id: number) => void;
}) {
  // --- HOOKS PERFILES--
  const {
    data: perfiles,
    isLoading: isLoadingPerfiles,
    isError: isErrorPerfiles,
  } = usePerfiles();

  // --- HOOKS DESPIECEVR --
  const {
    data: dv,
    isLoading: isLoadingDespVR,
    isError: isErrorDespVR,
  } = useDespieceVRByVR(vr.id);

  const { mutateAsync: addDespieceVR } = useAddDespieceVR();
  const { mutateAsync: updateDespieceVR } = useUpdateDespieceVR();
  const ANGULOS = ["45", "90", "0", ""];

  const isLoading = isLoadingPerfiles || isLoadingDespVR;
  const isError = isErrorPerfiles || isErrorDespVR;

  async function updDV(data: Partial<DespiecePerfilVidrioRepartido>) {
    if (!perfiles || perfiles.length === 0) {
      console.warn("Intentando actualizar sin perfiles cargados");
      return;
    }

    if (!dv) {
      try {
        console.log("Creando despiece inicial...");
        await addDespieceVR({
          id_vr: vr.id,
          id_perfil_contorno: perfiles[0].id,
          formula_cantidad_contorno_ancho: "hojas*2",
          formula_cantidad_contorno_alto: "hojas*2",
          formula_contorno_ancho: "ancho - 20",
          formula_contorno_alto: "alto - 20",
          angulo: "45",
          id_perfil_cruce: perfiles[0].id,
          formula_cruce_ancho: "ancho - 20",
          formula_cruce_alto: "alto - 20",
          descuento_de_vidrio: 0,
          descuento_de_si_mismo: 0,
          angulo_cruce: "45",
          formula_cantidad_interiores: "(crucesH+1)*(crucesV+1)",
          formula_ancho_interior: "(ancho-10)/(crucesV+1)",
          formula_alto_interior: "(alto-10)/(crucesH+1)",
          descuento_izquierda: 5,
          descuento_derecha: 5,
          descuento_abajo: 5,
          descuento_arriba: 5,
        });
      } catch (error) {
        console.error("Error al crear:", error);
      }
      return;
    }
    updateDespieceVR({
      id: dv.id,
      data,
    });
  }

  if (isLoading) return <VidrioRepartidoFormSkeleton />;

  if (isError) {
    return (
      <Alert
        color="danger"
        title="Error al cargar el despiece de VR"
        description="Por favor, recargue la página."
      />
    );
  }

  if (!perfiles || perfiles.length === 0) {
    return (
      <Alert
        color="warning"
        title="No hay perfiles cargados"
        description="Por favor agregue perfiles al catalogo."
      />
    );
  }

  // Si no hay despiece (dv es null), mostramos la alerta con un botón para crearlo
  if (!dv) {
    return (
      <div className="p-4 border-2 border-dashed border-zinc-200 rounded-xl space-y-4">
        <Alert
          color="warning"
          title="Sin despiece"
          description="Este vidrio repartido no tiene fórmulas de corte aún."
        />
        <Button
          color="primary"
          className="w-full text-zinc-800 dark:text-zinc-300"
          variant="flat"
          onPress={() => updDV({})} // Crea el despiece por defecto
        >
          Generar despiece inicial
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <FormHeader
        name={vr.descripcion}
        pred={vr.predeterminado}
        onName={(v) => onUpdate({ descripcion: v })}
        onPred={(v) => onUpdate({ predeterminado: v })}
        onDelete={onDelete}
      />
      <FieldGroup title="Perfil de contorno">
        <div className="flex gap-2 mb-2">
          <select
            value={dv.id_perfil_contorno ?? ""}
            onChange={(e) =>
              updDV({ id_perfil_contorno: parseInt(e.target.value) })
            }
            className="flex-1 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-400"
          >
            {perfiles.map((p) => (
              <option key={p.id} value={p.nro_perfil ?? ""}>
                {p.nro_perfil} — {p.descri}
              </option>
            ))}
          </select>
          <select
            value={dv.angulo ?? ""}
            onChange={(e) => updDV({ angulo: e.target.value })}
            className="w-16 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1.5 focus:outline-none focus:border-amber-400"
          >
            {ANGULOS.map((a) => (
              <option key={a} value={a}>
                {a || "—"}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <FormulaInput
            label="Cant. horiz."
            value={dv.formula_cantidad_contorno_ancho ?? ""}
            onChange={(v) => updDV({ formula_cantidad_contorno_ancho: v })}
            description="ej: hojas*2"
          />
          <FormulaInput
            label="Cant. vert."
            value={dv.formula_cantidad_contorno_alto ?? ""}
            onChange={(v) => updDV({ formula_cantidad_contorno_alto: v })}
            description="ej: hojas*2"
          />
          <FormulaInput
            label="Largo horiz."
            value={dv.formula_contorno_ancho ?? ""}
            onChange={(v) => updDV({ formula_contorno_ancho: v })}
            description="ej: ancho - 20"
          />
          <FormulaInput
            label="Largo vert."
            value={dv.formula_contorno_alto ?? ""}
            onChange={(v) => updDV({ formula_contorno_alto: v })}
            description="ej: alto - 20"
          />
        </div>
      </FieldGroup>
      <FieldGroup title="Perfil de cruceta">
        <div className="flex gap-2 mb-2">
          <select
            value={dv.id_perfil_cruce ?? ""}
            onChange={(e) =>
              updDV({ id_perfil_cruce: parseInt(e.target.value) })
            }
            className="flex-1 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-400"
          >
            {perfiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nro_perfil} — {p.descri}
              </option>
            ))}
          </select>
          <select
            value={dv.angulo_cruce ?? ""}
            onChange={(e) => updDV({ angulo_cruce: e.target.value })}
            className="w-16 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1.5 focus:outline-none focus:border-amber-400"
          >
            {ANGULOS.map((a) => (
              <option key={a} value={a}>
                {a || "—"}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <FormulaInput
            label="Largo horiz."
            value={dv.formula_cruce_ancho ?? ""}
            onChange={(v) => updDV({ formula_cruce_ancho: v })}
            description="ej: ancho - 20"
          />
          <FormulaInput
            label="Largo vert."
            value={dv.formula_cruce_alto ?? ""}
            onChange={(v) => updDV({ formula_cruce_alto: v })}
            description="ej: alto - 20"
          />
          <Input
            label="Desc. de vidrio"
            type="number"
            value={String(dv.descuento_de_vidrio)}
            onValueChange={(v: string) =>
              updDV({ descuento_de_vidrio: parseFloat(v) || 0 })
            }
            size="sm"
            endContent={<span className="text-[10px] text-zinc-400">mm</span>}
            classNames={IW}
          />
          <Input
            label="Desc. de sí mismo"
            type="number"
            value={String(dv.descuento_de_si_mismo)}
            onValueChange={(v: string) =>
              updDV({ descuento_de_si_mismo: parseFloat(v) || 0 })
            }
            size="sm"
            endContent={<span className="text-[10px] text-zinc-400">mm</span>}
            classNames={IW}
          />
        </div>
      </FieldGroup>
      <FieldGroup title="Interiores del vidrio repartido">
        <div className="grid grid-cols-3 gap-3 mb-3">
          <FormulaInput
            label="Cantidad"
            value={dv.formula_cantidad_interiores ?? ""}
            onChange={(v) => updDV({ formula_cantidad_interiores: v })}
            description="ej: (crucesH+1)*(crucesV+1)"
          />
          <FormulaInput
            label="Ancho"
            value={dv.formula_ancho_interior ?? ""}
            onChange={(v) => updDV({ formula_ancho_interior: v })}
            description="ej: (ancho-10)/(crucesV+1)"
          />
          <FormulaInput
            label="Alto"
            value={dv.formula_alto_interior ?? ""}
            onChange={(v) => updDV({ formula_alto_interior: v })}
            description="ej: (alto-10)/(crucesH+1)"
          />
        </div>
        {/* Diagrama de descuentos del VR */}
        <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-4">
          Descuentos de borde
        </p>
        <div className="flex justify-center">
          <div className="relative w-56 h-36 mb-5">
            <div className="absolute inset-0 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-600" />
            <div className="absolute inset-7 rounded-lg border-2 border-teal-300 dark:border-teal-600 bg-teal-50 dark:bg-teal-900/10 flex items-center justify-center">
              <span className="text-[10px] text-teal-400 font-medium">
                vidrio
              </span>
            </div>
            {(
              [
                ["descuento_arriba", "top", "Arr."],
                ["descuento_abajo", "bottom", "Abj."],
                ["descuento_izquierda", "left", "Izq."],
                ["descuento_derecha", "right", "Der."],
              ] as [keyof DespiecePerfilVidrioRepartido, string, string][]
            ).map(([field, side, label]) => (
              <div
                key={String(field)}
                className={clsx("absolute", {
                  "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2":
                    side === "top",
                  "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2":
                    side === "bottom",
                  "left-0 top-1/2 -translate-x-1/2 -translate-y-1/2":
                    side === "left",
                  "right-0 top-1/2 translate-x-1/2 -translate-y-1/2":
                    side === "right",
                })}
              >
                <DescInput
                  value={(dv as any)[field] as number}
                  label={label}
                  onChange={(v) =>
                    updDV({
                      [field]: v,
                    } as Partial<DespiecePerfilVidrioRepartido>)
                  }
                />
              </div>
            ))}
          </div>
        </div>
      </FieldGroup>
    </div>
  );
}
