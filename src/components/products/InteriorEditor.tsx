import { useState } from "react";
import { Button, Input, Switch } from "@heroui/react";
import { Plus, Trash2, Check, ChevronDown, ChevronUp } from "lucide-react";
import { useProductosStore } from "@/store/productosStore";
import { useCatalogosStore } from "@/store/catalogosStore";
import FormulaInput from "@/components/ui/FormulaInput";
import DespiecePerfilesPanel from "./DespiecePerfilesPanel";
import DespieceAccesoriosPanel from "./DespieceAccesoriosPanel";
import type {
  Interior,
  DespieceInterior,
  Contravidrio,
  ContravidrioExterior,
  Cruces,
  VidRepartido,
  DespiecePerfilContravidrio,
  DespieceCruces,
  DespieceVR,
} from "@/types";
import clsx from "clsx";

interface Props {
  interior: Interior;
}

const IW = {
  inputWrapper:
    "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors shadow-none",
};
const IW_F = {
  label: "text-[10px] font-semibold uppercase tracking-wider text-zinc-400",
  inputWrapper:
    "bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-700 font-mono shadow-none",
};

// ─────────────────────────────────────────────────────────────────────────────

export default function InteriorEditor({ interior }: Props) {
  const {
    updateInterior,
    getDespieceInteriorByInterior,
    addDespieceInterior,
    updateDespieceInterior,
    getContravidriosByInterior,
    addContravidrio,
    updateContravidrio,
    deleteContravidrio,
    getContravidriosExtByInterior,
    addContravidrioExt,
    updateContravidrioExt,
    deleteContravidrioExt,
    getCrucesByInterior,
    addCruces,
    updateCruces,
    deleteCruces,
    getVidRepartidosByInterior,
    addVidRepartido,
    updateVidRepartido,
    deleteVidRepartido,
    getDespiecePerfilesContravidrio,
    addDespiecePerfilContravidrio,
    updateDespiecePerfilContravidrio,
    deleteDespiecePerfilContravidrio,
    getDespieceCrucesByCruces,
    addDespieceCruces,
    updateDespieceCruces,
    deleteDespieceCruces,
    getDespieceVRByVR,
    addDespieceVR,
    updateDespieceVR,
    deleteDespieceVR,
  } = useProductosStore();

  const despInt = getDespieceInteriorByInterior(interior.id);
  const cvs = getContravidriosByInterior(interior.id);
  const cves = getContravidriosExtByInterior(interior.id);
  const crcs = getCrucesByInterior(interior.id);
  const vrs = getVidRepartidosByInterior(interior.id);

  const [subTab, setSubTab] = useState<"cv-int" | "cv-ext" | "cruces" | "vr">(
    "cv-int",
  );
  const [dimOpen, setDimOpen] = useState(true);

  const upd = (d: Partial<Interior>) => updateInterior(interior.id, d);

  function updDespInt(data: Partial<DespieceInterior>) {
    const di =
      despInt ||
      addDespieceInterior({
        idInterior: interior.id,
        formulaCantidadInteriores: "1",
        formulaAnchoInterior: "ancho - 20",
        formulaAltoInterior: "alto - 60",
        descuentoIzquierda: 5,
        descuentoDerecha: 5,
        descuentoAbajo: 5,
        descuentoArriba: 5,
      });
    updateDespieceInterior(di.id, data);
  }

  const TABS = [
    { key: "cv-int" as const, label: "CV Int.", count: cvs.length },
    { key: "cv-ext" as const, label: "CV Ext.", count: cves.length },
    { key: "cruces" as const, label: "Cruces", count: crcs.length },
    { key: "vr" as const, label: "Vid. Repartido", count: vrs.length },
  ];

  return (
    <div className="flex flex-col bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
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
            Dimensiones y rebajes
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
                value={despInt?.formulaCantidadInteriores ?? "1"}
                onChange={(v: string) =>
                  updDespInt({ formulaCantidadInteriores: v })
                }
                description="ej: 1, hojas"
                className={IW_F}
              />
              <FormulaInput
                label="Ancho"
                value={despInt?.formulaAnchoInterior ?? ""}
                onChange={(v: string) =>
                  updDespInt({ formulaAnchoInterior: v })
                }
                description="ej: ancho/hojas - 40"
                className={IW_F}
              />
              <FormulaInput
                label="Alto"
                value={despInt?.formulaAltoInterior ?? ""}
                onChange={(v: string) => updDespInt({ formulaAltoInterior: v })}
                description="ej: alto - 80"
                className={IW_F}
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
                  idInterior: interior.id,
                  descripcion: `CV Int. ${cvs.length + 1}`,
                  predeterminado: cvs.length === 0,
                })
              }
              renderEditor={(cv: Contravidrio) => (
                <ContravidrioForm
                  cv={cv}
                  nivel="contravidrio"
                  onUpdate={(d) => updateContravidrio(cv.id, d)}
                  onDelete={() => deleteContravidrio(cv.id)}
                  getDespiecePerfiles={getDespiecePerfilesContravidrio}
                  addDespiecePerfil={addDespiecePerfilContravidrio}
                  updateDespiecePerfil={updateDespiecePerfilContravidrio}
                  deleteDespiecePerfil={deleteDespiecePerfilContravidrio}
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
                  idInterior: interior.id,
                  descripcion: `CV Ext. ${cves.length + 1}`,
                  predeterminado: cves.length === 0,
                })
              }
              renderEditor={(cv: ContravidrioExterior) => (
                <ContravidrioForm
                  cv={cv}
                  nivel="contravidrioExt"
                  onUpdate={(d) => updateContravidrioExt(cv.id, d)}
                  onDelete={() => deleteContravidrioExt(cv.id)}
                  getDespiecePerfiles={getDespiecePerfilesContravidrio}
                  addDespiecePerfil={addDespiecePerfilContravidrio}
                  updateDespiecePerfil={updateDespiecePerfilContravidrio}
                  deleteDespiecePerfil={deleteDespiecePerfilContravidrio}
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
                  idInterior: interior.id,
                  descripcion: `Cruces ${crcs.length + 1}`,
                  predeterminado: crcs.length === 0,
                })
              }
              renderEditor={(c: Cruces) => (
                <CrucesForm
                  cruces={c}
                  onUpdate={(d) => updateCruces(c.id, d)}
                  onDelete={() => deleteCruces(c.id)}
                  getDespieceCruces={getDespieceCrucesByCruces}
                  addDespieceCruces={addDespieceCruces}
                  updateDespieceCruces={updateDespieceCruces}
                  deleteDespieceCruces={deleteDespieceCruces}
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
                  idInterior: interior.id,
                  descripcion: `VR ${vrs.length + 1}`,
                  predeterminado: vrs.length === 0,
                })
              }
              renderEditor={(vr: VidRepartido) => (
                <VidRepartidoForm
                  vr={vr}
                  onUpdate={(d) => updateVidRepartido(vr.id, d)}
                  onDelete={() => deleteVidRepartido(vr.id)}
                  getDespieceVR={getDespieceVRByVR}
                  addDespieceVR={addDespieceVR}
                  updateDespieceVR={updateDespieceVR}
                  deleteDespieceVR={deleteDespieceVR}
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
          <DespiecePerfilesPanel
            nivel="hoja"
            idParent={interior.id}
            label="Perfiles del interior"
          />
        </div>
        <div className="p-4">
          <DespieceAccesoriosPanel
            nivel="interior"
            idParent={interior.id}
            label="Accesorios del interior"
          />
        </div>
      </div>
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
          value={despInt?.descuentoArriba ?? 0}
          label="Arriba"
          onChange={(v) => onUpdate({ descuentoArriba: v })}
        />
      </div>
      {/* Abajo */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
        <DescInput
          value={despInt?.descuentoAbajo ?? 0}
          label="Abajo"
          onChange={(v) => onUpdate({ descuentoAbajo: v })}
        />
      </div>
      {/* Izquierda */}
      <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <DescInput
          value={despInt?.descuentoIzquierda ?? 0}
          label="Izq."
          onChange={(v) => onUpdate({ descuentoIzquierda: v })}
        />
      </div>
      {/* Derecha */}
      <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2">
        <DescInput
          value={despInt?.descuentoDerecha ?? 0}
          label="Der."
          onChange={(v) => onUpdate({ descuentoDerecha: v })}
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
  getDespiecePerfiles,
  addDespiecePerfil,
  updateDespiecePerfil,
  deleteDespiecePerfil,
}: {
  cv: Contravidrio | ContravidrioExterior;
  nivel: "contravidrio" | "contravidrioExt";
  onUpdate: (d: Partial<Contravidrio>) => void;
  onDelete: () => void;
  getDespiecePerfiles: (
    nivel: "contravidrio" | "contravidrioExt",
    idCV: number,
  ) => DespiecePerfilContravidrio[];
  addDespiecePerfil: (
    nivel: "contravidrio" | "contravidrioExt",
    d: Omit<DespiecePerfilContravidrio, "id">,
  ) => void;
  updateDespiecePerfil: (
    nivel: "contravidrio" | "contravidrioExt",
    id: number,
    d: Partial<DespiecePerfilContravidrio>,
  ) => void;
  deleteDespiecePerfil: (
    nivel: "contravidrio" | "contravidrioExt",
    id: number,
  ) => void;
}) {
  const { perfiles } = useCatalogosStore();
  const items = getDespiecePerfiles(nivel, cv.id);
  const ANGULOS = ["45", "90", "0", ""];

  return (
    <div className="space-y-4">
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
                  value={item.perfil}
                  onChange={(e) =>
                    updateDespiecePerfil(nivel, item.id, {
                      perfil: e.target.value,
                    })
                  }
                  className="flex-1 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-400"
                >
                  {perfiles.map((p) => (
                    <option key={p.nroPerfil} value={p.nroPerfil}>
                      {p.nroPerfil} — {p.descri}
                    </option>
                  ))}
                </select>
                <select
                  value={item.angulo}
                  onChange={(e) =>
                    updateDespiecePerfil(nivel, item.id, {
                      angulo: e.target.value,
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
                  onClick={() => deleteDespiecePerfil(nivel, item.id)}
                  className="p-1.5 text-zinc-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <FormulaInput
                  label="Cant. horizontal"
                  value={item.formulaCantidadAncho}
                  onChange={(v) =>
                    updateDespiecePerfil(nivel, item.id, {
                      formulaCantidadAncho: v,
                    })
                  }
                  description="ej: hojas*2"
                  className={IW_F}
                />
                <FormulaInput
                  label="Cant. vertical"
                  value={item.formulaCantidadAlto}
                  onChange={(v) =>
                    updateDespiecePerfil(nivel, item.id, {
                      formulaCantidadAlto: v,
                    })
                  }
                  description="ej: hojas*2"
                  className={IW_F}
                />
                <FormulaInput
                  label="Largo horizontal"
                  value={item.formulaContravidrioAncho}
                  onChange={(v) =>
                    updateDespiecePerfil(nivel, item.id, {
                      formulaContravidrioAncho: v,
                    })
                  }
                  description="ej: ancho - 20"
                  className={IW_F}
                />
                <FormulaInput
                  label="Largo vertical"
                  value={item.formulaContravidrioAlto}
                  onChange={(v) =>
                    updateDespiecePerfil(nivel, item.id, {
                      formulaContravidrioAlto: v,
                    })
                  }
                  description="ej: alto - 10"
                  className={IW_F}
                />
              </div>
            </div>
          ))}
          <button
            onClick={() =>
              addDespiecePerfil(nivel, {
                idContravidrio: cv.id,
                perfil: perfiles[0]?.nroPerfil ?? "",
                formulaCantidadAncho: "hojas*2",
                formulaCantidadAlto: "hojas*2",
                formulaContravidrioAncho: "ancho - 20",
                formulaContravidrioAlto: "alto - 10",
                angulo: "90",
              })
            }
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 text-[11px] font-medium text-zinc-400 hover:border-amber-400 hover:text-amber-500 transition-colors"
          >
            <Plus className="w-3 h-3" /> Agregar perfil
          </button>
        </div>
      </FieldGroup>
    </div>
  );
}

// ── CrucesForm ────────────────────────────────────────────────────────────────

function CrucesForm({
  cruces,
  onUpdate,
  onDelete,
  getDespieceCruces,
  addDespieceCruces,
  updateDespieceCruces,
  deleteDespieceCruces,
}: {
  cruces: Cruces;
  onUpdate: (d: Partial<Cruces>) => void;
  onDelete: () => void;
  getDespieceCruces: (id: number) => DespieceCruces | undefined;
  addDespieceCruces: (d: Omit<DespieceCruces, "id">) => DespieceCruces;
  updateDespieceCruces: (id: number, d: Partial<DespieceCruces>) => void;
  deleteDespieceCruces: (id: number) => void;
}) {
  const { perfiles } = useCatalogosStore();
  const dc = getDespieceCruces(cruces.id);
  const ANGULOS = ["45", "90", "0", ""];

  function updDC(data: Partial<DespieceCruces>) {
    const d =
      dc ||
      addDespieceCruces({
        idCruces: cruces.id,
        perfil: perfiles[0]?.nroPerfil ?? "",
        formulaCantidad: "1",
        formulaAnchoEntero: "ancho - 20",
        formulaAltoEntero: "alto - 20",
        descuentoDeVidrio: 0,
        descuentoDeSiMismo: 0,
        angulo: "90",
      });
    updateDespieceCruces(d.id, data);
  }

  return (
    <div className="space-y-4">
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
            value={dc?.perfil ?? ""}
            onChange={(e) => updDC({ perfil: e.target.value })}
            className="flex-1 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-400"
          >
            {perfiles.map((p) => (
              <option key={p.nroPerfil} value={p.nroPerfil}>
                {p.nroPerfil} — {p.descri}
              </option>
            ))}
          </select>
          <select
            value={dc?.angulo ?? "90"}
            onChange={(e) => updDC({ angulo: e.target.value })}
            className="w-16 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1.5 focus:outline-none focus:border-amber-400"
          >
            {ANGULOS.map((a) => (
              <option key={a} value={a}>
                {a || "—"}
              </option>
            ))}
          </select>
        </div>
      </FieldGroup>

      <FieldGroup title="Medidas de corte">
        <div className="grid grid-cols-3 gap-3">
          <FormulaInput
            label="Cantidad"
            value={dc?.formulaCantidad ?? "1"}
            onChange={(v) => updDC({ formulaCantidad: v })}
            description="ej: 1"
            className={IW_F}
          />
          <FormulaInput
            label="Largo horizontal"
            value={dc?.formulaAnchoEntero ?? ""}
            onChange={(v) => updDC({ formulaAnchoEntero: v })}
            description="ej: ancho - 20"
            className={IW_F}
          />
          <FormulaInput
            label="Largo vertical"
            value={dc?.formulaAltoEntero ?? ""}
            onChange={(v) => updDC({ formulaAltoEntero: v })}
            description="ej: alto - 20"
            className={IW_F}
          />
        </div>
      </FieldGroup>

      <FieldGroup title="Descuentos en intersecciones">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Desc. de sí mismo"
            type="number"
            value={String(dc?.descuentoDeSiMismo ?? 0)}
            onValueChange={(v: string) =>
              updDC({ descuentoDeSiMismo: parseFloat(v) || 0 })
            }
            size="sm"
            endContent={<span className="text-[10px] text-zinc-400">mm</span>}
            description="El cruce se corta a sí mismo"
            classNames={IW}
          />
          <Input
            label="Desc. de vidrio"
            type="number"
            value={String(dc?.descuentoDeVidrio ?? 0)}
            onValueChange={(v: string) =>
              updDC({ descuentoDeVidrio: parseFloat(v) || 0 })
            }
            size="sm"
            endContent={<span className="text-[10px] text-zinc-400">mm</span>}
            description="Rebaje sobre el vidrio"
            classNames={IW}
          />
        </div>
      </FieldGroup>

      <FieldGroup title="Accesorios del cruce">
        <DespieceAccesoriosPanel nivel="cruces" idParent={cruces.id} />
      </FieldGroup>
    </div>
  );
}

// ── VidRepartidoForm ──────────────────────────────────────────────────────────

function VidRepartidoForm({
  vr,
  onUpdate,
  onDelete,
  getDespieceVR,
  addDespieceVR,
  updateDespieceVR,
  deleteDespieceVR,
}: {
  vr: VidRepartido;
  onUpdate: (d: Partial<VidRepartido>) => void;
  onDelete: () => void;
  getDespieceVR: (id: number) => DespieceVR | undefined;
  addDespieceVR: (d: Omit<DespieceVR, "id">) => DespieceVR;
  updateDespieceVR: (id: number, d: Partial<DespieceVR>) => void;
  deleteDespieceVR: (id: number) => void;
}) {
  const { perfiles } = useCatalogosStore();
  const dv = getDespieceVR(vr.id);
  const ANGULOS = ["45", "90", "0", ""];

  function updDV(data: Partial<DespieceVR>) {
    const d =
      dv ||
      addDespieceVR({
        idVR: vr.id,
        perfilDeContorno: perfiles[0]?.nroPerfil ?? "",
        formulaCantidadContornoAncho: "hojas*2",
        formulaCantidadContornoAlto: "hojas*2",
        formulaContornoAncho: "ancho - 20",
        formulaContornoAlto: "alto - 20",
        angulo: "45",
        perfilDeCruce: perfiles[0]?.nroPerfil ?? "",
        formulaCruceAncho: "ancho - 20",
        formulaCruceAlto: "alto - 20",
        descuentoDeVidrio: 0,
        descuentoDeSi: 0,
        anguloCruce: "45",
        formulaCantidadInteriores: "(crucesH+1)*(crucesV+1)",
        formulaAnchoInterior: "(ancho-10)/(crucesV+1)",
        formulaAltoInterior: "(alto-10)/(crucesH+1)",
        descuentoIzquierda: 5,
        descuentoDerecha: 5,
        descuentoAbajo: 5,
        descuentoArriba: 5,
      });
    updateDespieceVR(d.id, data);
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
            value={dv?.perfilDeContorno ?? ""}
            onChange={(e) => updDV({ perfilDeContorno: e.target.value })}
            className="flex-1 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-400"
          >
            {perfiles.map((p) => (
              <option key={p.nroPerfil} value={p.nroPerfil}>
                {p.nroPerfil} — {p.descri}
              </option>
            ))}
          </select>
          <select
            value={dv?.angulo ?? "45"}
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
            value={dv?.formulaCantidadContornoAncho ?? ""}
            onChange={(v) => updDV({ formulaCantidadContornoAncho: v })}
            description="ej: hojas*2"
            className={IW_F}
          />
          <FormulaInput
            label="Cant. vert."
            value={dv?.formulaCantidadContornoAlto ?? ""}
            onChange={(v) => updDV({ formulaCantidadContornoAlto: v })}
            description="ej: hojas*2"
            className={IW_F}
          />
          <FormulaInput
            label="Largo horiz."
            value={dv?.formulaContornoAncho ?? ""}
            onChange={(v) => updDV({ formulaContornoAncho: v })}
            description="ej: ancho - 20"
            className={IW_F}
          />
          <FormulaInput
            label="Largo vert."
            value={dv?.formulaContornoAlto ?? ""}
            onChange={(v) => updDV({ formulaContornoAlto: v })}
            description="ej: alto - 20"
            className={IW_F}
          />
        </div>
      </FieldGroup>

      <FieldGroup title="Perfil de cruceta">
        <div className="flex gap-2 mb-2">
          <select
            value={dv?.perfilDeCruce ?? ""}
            onChange={(e) => updDV({ perfilDeCruce: e.target.value })}
            className="flex-1 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-400"
          >
            {perfiles.map((p) => (
              <option key={p.nroPerfil} value={p.nroPerfil}>
                {p.nroPerfil} — {p.descri}
              </option>
            ))}
          </select>
          <select
            value={dv?.anguloCruce ?? "45"}
            onChange={(e) => updDV({ anguloCruce: e.target.value })}
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
            value={dv?.formulaCruceAncho ?? ""}
            onChange={(v) => updDV({ formulaCruceAncho: v })}
            description="ej: ancho - 20"
            className={IW_F}
          />
          <FormulaInput
            label="Largo vert."
            value={dv?.formulaCruceAlto ?? ""}
            onChange={(v) => updDV({ formulaCruceAlto: v })}
            description="ej: alto - 20"
            className={IW_F}
          />
          <Input
            label="Desc. de vidrio"
            type="number"
            value={String(dv?.descuentoDeVidrio ?? 0)}
            onValueChange={(v: string) =>
              updDV({ descuentoDeVidrio: parseFloat(v) || 0 })
            }
            size="sm"
            endContent={<span className="text-[10px] text-zinc-400">mm</span>}
            classNames={IW}
          />
          <Input
            label="Desc. de sí mismo"
            type="number"
            value={String(dv?.descuentoDeSi ?? 0)}
            onValueChange={(v: string) =>
              updDV({ descuentoDeSi: parseFloat(v) || 0 })
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
            value={dv?.formulaCantidadInteriores ?? ""}
            onChange={(v) => updDV({ formulaCantidadInteriores: v })}
            description="ej: (crucesH+1)*(crucesV+1)"
            className={IW_F}
          />
          <FormulaInput
            label="Ancho"
            value={dv?.formulaAnchoInterior ?? ""}
            onChange={(v) => updDV({ formulaAnchoInterior: v })}
            description="ej: (ancho-10)/(crucesV+1)"
            className={IW_F}
          />
          <FormulaInput
            label="Alto"
            value={dv?.formulaAltoInterior ?? ""}
            onChange={(v) => updDV({ formulaAltoInterior: v })}
            description="ej: (alto-10)/(crucesH+1)"
            className={IW_F}
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
                ["descuentoArriba", "top", "Arr."],
                ["descuentoAbajo", "bottom", "Abj."],
                ["descuentoIzquierda", "left", "Izq."],
                ["descuentoDerecha", "right", "Der."],
              ] as [keyof DespieceVR, string, string][]
            ).map(([field, side, label]) => (
              <div
                key={field}
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
                  value={(dv?.[field] as number) ?? 0}
                  label={label}
                  onChange={(v) => updDV({ [field]: v } as Partial<DespieceVR>)}
                />
              </div>
            ))}
          </div>
        </div>
      </FieldGroup>
    </div>
  );
}
