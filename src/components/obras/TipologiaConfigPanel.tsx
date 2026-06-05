import { useState, useEffect } from "react";
import { Select, SelectItem, Input, Chip, Switch, Button } from "@heroui/react";
import {
  ChevronDown,
  CheckCircle2,
  Palette,
  Layers,
  Grid2X2,
  AlignCenter,
  LayoutGrid,
  Minus,
  Plus,
  Waves,
  ArrowUpDown,
  ArrowLeftRight,
} from "lucide-react";
import clsx from "clsx";

import { useTratamientos } from "@/hooks/catalogo/useTratamientos";
import { useVidrios } from "@/hooks/catalogo/useVidrios";
import { usePerfiles } from "@/hooks/catalogo/usePerfiles";
import { useInterioresByHoja } from "@/hooks/productos/useInteriores";
import { useContravidriosByInterior } from "@/hooks/productos/useContravidrios";
import { useContravidriosExtByInterior } from "@/hooks/productos/useContravidriosExt";
import { useVidrioRepartidosByInterior } from "@/hooks/productos/useVidRepartidos";
import { useTiposInteriores } from "@/hooks/catalogo/useTiposInteriores";
import { useMosquiterosByHoja } from "@/hooks/productos/useMosquiteros";
import type { ObraDetalle, Vidrio, Perfil } from "@/types";
import TipologiaConfigPanelSkeleton from "./skeletons/TipologiaConfigPanelSkeleton";

// ── Estilos ───────────────────────────────────────────────────────────────────
const SEL = {
  trigger:
    "h-8 min-h-8 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-700/60 rounded-lg text-xs",
  value: "text-xs text-zinc-700 dark:text-zinc-300 font-medium",
};

const OPCIONES_CAMARA = ["6", "9", "12", "15", "18"];
type ModoRelleno = "simple" | "dvh" | "revestimiento";

interface Props {
  detalle: ObraDetalle | undefined;
  upsertDetalle: (fields: Partial<ObraDetalle>) => void;
}

// ── Subcomponentes ────────────────────────────────────────────────────────────

function SectionHeader({
  icon: Icon,
  label,
  isOpen,
  isComplete,
  badge,
  onClick,
}: {
  icon: any;
  label: string;
  isOpen: boolean;
  isComplete?: boolean;
  badge?: string;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        "px-3 py-2.5 flex items-center justify-between cursor-pointer transition-colors select-none",
        isOpen
          ? "bg-zinc-50/80 dark:bg-zinc-900/40"
          : "bg-white hover:bg-zinc-50/40 dark:bg-zinc-950 dark:hover:bg-zinc-900/20",
      )}
    >
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        <Icon
          className={clsx(
            "w-4 h-4 transition-colors shrink-0",
            isOpen
              ? "text-amber-500"
              : isComplete
                ? "text-emerald-500 dark:text-emerald-400"
                : "text-zinc-400",
          )}
        />
        <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 truncate">
          {label}
        </span>
        {badge && !isOpen && (
          <span className="text-[10px] font-bold font-mono text-zinc-400 dark:text-zinc-500 truncate max-w-[120px] bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded">
            {badge}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1.5 ml-2">
        {isComplete && !isOpen && (
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
        )}
        <ChevronDown
          className={clsx(
            "w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 shrink-0",
            isOpen && "rotate-180",
          )}
        />
      </div>
    </div>
  );
}

function RowSelect({
  label,
  items,
  selectedKey,
  onKeyChange,
  placeholder,
  useCode,
}: {
  label: string;
  items: Array<{
    id: number;
    descri?: string | null;
    codigo?: string | null;
    descripcion?: string | null;
  }>;
  selectedKey: number | undefined | null;
  onKeyChange: (key: number | null) => void;
  placeholder?: string;
  useCode?: boolean;
}) {
  const hasValue = selectedKey !== null && selectedKey !== undefined;
  const existsInCatalog =
    hasValue && items.some((item) => item.id === selectedKey);

  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
        {label}
      </label>
      <Select
        size="sm"
        aria-label={label}
        placeholder={placeholder}
        classNames={SEL}
        selectedKeys={
          existsInCatalog ? new Set([String(selectedKey)]) : new Set()
        }
        onSelectionChange={(keys: React.Key[]) => {
          const key = Array.from(keys)[0];
          onKeyChange(key ? Number(key) : null);
        }}
      >
        {items.map((item) => {
          const text = useCode
            ? item.codigo
            : item.descri || item.descripcion || `ID: ${item.id}`;
          return (
            <SelectItem key={String(item.id)} textValue={text || ""}>
              <span className="text-xs font-medium font-mono">{text}</span>
            </SelectItem>
          );
        })}
      </Select>
    </div>
  );
}

function CruceModeSelector({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const modes = [
    { id: 0, label: "Liso", icon: AlignCenter },
    { id: 1, label: "Centrados", icon: ArrowUpDown },
    { id: 2, label: "Variables", icon: ArrowLeftRight },
  ];

  return (
    <div className="grid grid-cols-3 gap-1 bg-zinc-100/80 dark:bg-zinc-900/60 p-0.5 rounded-lg border border-zinc-200/30 dark:border-zinc-800/30">
      {modes.map((m) => {
        const Icon = m.icon;
        const active = value === m.id;
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => onChange(m.id)}
            className={clsx(
              "flex flex-col items-center gap-1 py-1 rounded-md transition-all outline-none",
              active
                ? "bg-white dark:bg-zinc-800 shadow-sm text-amber-600 dark:text-amber-400 font-bold"
                : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-400 font-medium",
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="text-[10px] tracking-wide">{m.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function CentradosCounter({
  label,
  value,
  max,
  onChange,
}: {
  label: string;
  value: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/20 px-2.5 py-1.5 rounded-xl border border-zinc-100 dark:border-zinc-800/30">
      <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
        {label}
      </span>
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          disabled={value <= 0}
          onClick={() => onChange(value - 1)}
          className="w-5 h-5 rounded-md flex items-center justify-center bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-500 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all"
        >
          <Minus className="w-3 h-3" />
        </button>
        <span className="text-xs font-bold font-mono text-zinc-700 dark:text-zinc-300 w-3 text-center">
          {value}
        </span>
        <button
          type="button"
          disabled={value >= max}
          onClick={() => onChange(value + 1)}
          className="w-5 h-5 rounded-md flex items-center justify-center bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-500 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

function ModoRellenoTabs({
  value,
  onChange,
}: {
  value: ModoRelleno;
  onChange: (v: ModoRelleno) => void;
}) {
  const tabs: { v: ModoRelleno; label: string }[] = [
    { v: "simple", label: "Simple" },
    { v: "dvh", label: "DVH" },
    { v: "revestimiento", label: "Revest." },
  ];
  return (
    <div className="flex p-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg border border-zinc-200/40 dark:border-zinc-700/40">
      {tabs.map(({ v, label }) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={clsx(
            "flex-1 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md transition-all",
            value === v
              ? "bg-white dark:bg-zinc-700 text-amber-600 dark:text-amber-400 shadow-sm"
              : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// ── Editor de interior para un paño individual ────────────────────────────────
function InteriorFilaEditor({
  label,
  modoRelleno,
  onModoChange,
  interiorKey,
  dvh1Key,
  dvh2Key,
  camaraKey,
  revestKey,
  direccKey,
  detalle,
  vidrios,
  perfiles,
  upd,
}: {
  label: string;
  modoRelleno: ModoRelleno;
  onModoChange: (v: ModoRelleno) => void;
  interiorKey: keyof ObraDetalle;
  dvh1Key: keyof ObraDetalle;
  dvh2Key: keyof ObraDetalle;
  camaraKey: keyof ObraDetalle;
  revestKey: keyof ObraDetalle;
  direccKey: keyof ObraDetalle;
  detalle: ObraDetalle | undefined;
  vidrios: Vidrio[];
  perfiles: Perfil[];
  upd: (patch: Partial<ObraDetalle>) => void;
}) {
  const perfilRevest =
    perfiles.find((p) => p.nro_perfil === (detalle?.[revestKey] as string)) ??
    null;

  return (
    <div className="space-y-2 p-2.5 bg-zinc-50 dark:bg-zinc-900/40 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">
          {label}
        </span>
        <ModoRellenoTabs value={modoRelleno} onChange={onModoChange} />
      </div>

      {/* ── SIMPLE ── */}
      {modoRelleno === "simple" && (
        <Select
          size="sm"
          aria-label={`Material ${label}`}
          placeholder="Sin asignar"
          // selectedKeys={
          //   detalle?.[interiorKey] != null ? [String(detalle[interiorKey])] : []
          // }
          selectedKeys={(() => {
            const val = detalle?.[interiorKey];
            if (val == null) return new Set<string>();
            const key = String(val);
            return vidrios.some((v) => String(v.id) === key)
              ? new Set([key])
              : new Set<string>();
          })()}
          onSelectionChange={(k: any) =>
            upd({ [interiorKey]: ([...k][0] as string) || null } as any)
          }
          classNames={SEL}
        >
          {vidrios.map((v) => (
            <SelectItem key={String(v.id)} textValue={v.descri ?? v.codigo}>
              <div className="flex items-center justify-between w-full">
                <span className="text-xs">{v.descri ?? v.codigo}</span>
                <span className="text-[10px] text-zinc-400 font-mono">
                  {v.espesor}mm
                </span>
              </div>
            </SelectItem>
          ))}
        </Select>
      )}

      {/* ── DVH ── */}
      {modoRelleno === "dvh" && (
        <div className="flex flex-col gap-2">
          {(
            [
              { key: dvh1Key, lb: "V. Ext" },
              { key: dvh2Key, lb: "V. Int" },
            ] as const
          ).map(({ key, lb }) => (
            <div key={String(key)} className="flex items-center gap-2">
              <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-wider w-10 shrink-0 text-right">
                {lb}
              </span>
              <Select
                size="sm"
                aria-label={lb}
                placeholder="Vidrio..."
                // selectedKeys={
                //   detalle?.[key] != null ? [String(detalle[key])] : []
                // }
                selectedKeys={(() => {
                  const val = detalle?.[key];
                  if (val == null) return new Set<string>();
                  const k2 = String(val);
                  return vidrios.some((v) => String(v.id) === k2)
                    ? new Set([k2])
                    : new Set<string>();
                })()}
                onSelectionChange={(k: any) =>
                  upd({ [key]: ([...k][0] as string) || null } as any)
                }
                classNames={SEL}
              >
                {vidrios.map((v) => (
                  <SelectItem
                    key={String(v.id)}
                    textValue={v.descri ?? v.codigo}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs">{v.descri ?? v.codigo}</span>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        {v.espesor}mm
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </Select>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-wider w-10 shrink-0 text-right">
              Cámara
            </span>
            <Select
              size="sm"
              aria-label="Espesor cámara"
              placeholder="Espesor..."
              // selectedKeys={
              //   detalle?.[camaraKey] != null ? [String(detalle[camaraKey])] : []
              // }
              selectedKeys={(() => {
                const val = detalle?.[camaraKey];
                if (val == null) return new Set<string>();
                const key = String(val);
                return OPCIONES_CAMARA.includes(key)
                  ? new Set([key])
                  : new Set<string>();
              })()}
              onSelectionChange={(k: any) =>
                upd({ [camaraKey]: ([...k][0] as string) || null } as any)
              }
              classNames={SEL}
            >
              {OPCIONES_CAMARA.map((c) => (
                <SelectItem key={c} textValue={`${c}mm`}>
                  <span className="font-mono text-xs">{c} mm</span>
                </SelectItem>
              ))}
            </Select>
          </div>
          {detalle?.[dvh1Key] && detalle?.[camaraKey] && detalle?.[dvh2Key] && (
            <div className="text-center text-[10px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400/80 rounded-lg py-1.5 border border-amber-500/20">
              Composición:{" "}
              {vidrios.find((v) => String(v.id) === String(detalle[dvh1Key]))
                ?.espesor ?? "?"}{" "}
              / {String(detalle[camaraKey])} /{" "}
              {vidrios.find((v) => String(v.id) === String(detalle[dvh2Key]))
                ?.espesor ?? "?"}
            </div>
          )}
        </div>
      )}

      {/* ── REVESTIMIENTO ── */}
      {modoRelleno === "revestimiento" && (
        <div className="flex flex-col gap-2">
          <Select
            size="sm"
            aria-label="Perfil de revestimiento"
            placeholder="Seleccionar perfil..."
            // selectedKeys={
            //   detalle?.[revestKey] ? [detalle[revestKey] as string] : []
            // }
            selectedKeys={(() => {
              const val = detalle?.[revestKey] as string | null | undefined;
              if (!val) return new Set<string>();
              return perfiles.some((p) => p.nro_perfil === val)
                ? new Set([val])
                : new Set<string>();
            })()}
            onSelectionChange={(k: any) =>
              upd({ [revestKey]: ([...k][0] as string) || null } as any)
            }
            classNames={SEL}
          >
            {perfiles
              .filter((p) => !p.bloqueado)
              .map((p) => (
                <SelectItem
                  key={p.nro_perfil}
                  textValue={`${p.nro_perfil} — ${p.descri}`}
                >
                  <div className="flex items-center justify-between w-full gap-2">
                    <span className="font-mono text-[10px] text-zinc-400 shrink-0">
                      {p.nro_perfil}
                    </span>
                    <span className="flex-1 truncate text-xs">{p.descri}</span>
                    <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 shrink-0 font-mono">
                      {p.cubre}mm
                    </span>
                  </div>
                </SelectItem>
              ))}
          </Select>
          <div className="grid grid-cols-2 gap-1.5">
            {(["vertical", "horizontal"] as const).map((dir) => (
              <button
                key={dir}
                type="button"
                onClick={() => upd({ [direccKey]: dir } as any)}
                className={clsx(
                  "flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all border",
                  (detalle?.[direccKey] as string) === dir
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                    : "bg-white dark:bg-zinc-900/60 text-zinc-400 border-zinc-200/80 dark:border-zinc-700/60 hover:text-zinc-600",
                )}
              >
                {dir === "vertical" ? (
                  <ArrowUpDown className="w-3.5 h-3.5" />
                ) : (
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                )}
                {dir}
              </button>
            ))}
          </div>
          {perfilRevest && (
            <div className="flex items-center gap-2 text-[10px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg px-2.5 py-1.5 border border-amber-500/20">
              <span className="truncate">{perfilRevest.nro_perfil}</span>
              <span className="text-zinc-300 dark:text-zinc-600">·</span>
              <span className="capitalize font-sans">
                {detalle?.[direccKey] as string}
              </span>
              <span className="text-zinc-300 dark:text-zinc-600">·</span>
              <span>{perfilRevest.cubre}mm cubre</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function TipologiaConfigPanel({
  detalle,
  upsertDetalle,
}: Props) {
  const [openSections, setOpenSections] = useState({
    acabado: true,
    estructura: true,
    cruces: true,
  });

  const [inputH, setInputH] = useState("");
  const [inputV, setInputV] = useState("");

  // ── Catálogos ───────────────────────────────────────────────────────────────
  const { data: tratamientos = [], isLoading: loadingTratamientos } =
    useTratamientos();
  const { data: mosquiterosFiltrados = [] } = useMosquiterosByHoja(
    detalle?.hoja ?? undefined,
  );
  const { data: vidrios = [], isLoading: loadingVidrios } = useVidrios();
  const { data: perfiles = [], isLoading: loadingPerfiles } = usePerfiles();
  const { data: tiposInterior = [] } = useTiposInteriores();

  const idHoja = detalle?.hoja;
  const idInterior = detalle?.interior;

  const { data: interiores = [] } = useInterioresByHoja(idHoja ?? undefined);
  const { data: contravidrios = [] } = useContravidriosByInterior(
    idInterior ?? undefined,
  );
  const { data: contravidriosExt = [] } = useContravidriosExtByInterior(
    idInterior ?? undefined,
  );
  const { data: vidriosRepartidos = [] } = useVidrioRepartidosByInterior(
    idInterior ?? undefined,
  );

  // ── Modo relleno ────────────────────────────────────────────────────────────
  function modoDesdeDB(d: ObraDetalle | undefined): ModoRelleno {
    if (!d) return "simple";
    if (d.revest_1) return "revestimiento";
    if (d.dvh_1_1) return "dvh";
    return "simple";
  }

  const [modoRelleno, setModoRelleno] = useState<ModoRelleno>(() =>
    modoDesdeDB(detalle),
  );
  useEffect(() => {
    setModoRelleno(modoDesdeDB(detalle));
  }, [detalle?.id, detalle?.revest_1, detalle?.dvh_1_1]);

  // Para cruces con múltiples paños
  const [interiorIgualParaTodos, setInteriorIgualParaTodos] = useState(true);
  const [modoRellenoByFila, setModoRellenoByFila] = useState<ModoRelleno[]>([
    "simple",
    "simple",
    "simple",
    "simple",
  ]);

  function setModoFilaAt(idx: number, modo: ModoRelleno) {
    setModoRellenoByFila((prev) => {
      const next = [...prev] as ModoRelleno[];
      next[idx] = modo;
      return next;
    });
  }

  // ── upd ─────────────────────────────────────────────────────────────────────
  const upd = (fields: Partial<ObraDetalle>) => {
    upsertDetalle({ ...detalle, ...fields });
  };

  // Limpiar campos del modo anterior al cambiar
  function cambiarModo(nuevo: ModoRelleno) {
    setModoRelleno(nuevo);
    if (nuevo === "simple") {
      upd({
        dvh_1_1: null,
        dvh_1_2: null,
        camara_1: null,
        revest_1: null,
        direcc_1: null,
      });
    } else if (nuevo === "dvh") {
      upd({ revest_1: null, direcc_1: null, interior_1: null });
    } else {
      upd({ dvh_1_1: null, dvh_1_2: null, camara_1: null, interior_1: null });
    }
  }

  const toggleSection = (key: keyof typeof openSections) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  // ── Vidrios filtrados (solo tipo vidrio) ────────────────────────────────────
  const vidrosCrudos = vidrios.filter((v) => {
    const t = tiposInterior.find((x) => x.id === v.tipo_rev);
    return !t || t.descripcion?.toLowerCase().includes("vidrio");
  });

  // ── Cruces ──────────────────────────────────────────────────────────────────
  const tipoCruce = detalle?.tipo_cruce ?? 0;

  const posH = [
    detalle?.horizontal_1,
    detalle?.horizontal_2,
    detalle?.horizontal_3,
  ].filter((v): v is number => typeof v === "number" && v > 0);
  const posV = [
    detalle?.vertical_1,
    detalle?.vertical_2,
    detalle?.vertical_3,
    detalle?.vertical_4,
    detalle?.vertical_5,
  ].filter((v): v is number => typeof v === "number" && v > 0);

  const savePosH = (arr: number[]) => {
    const next = [...arr].sort((a, b) => a - b).slice(0, 3);
    upd({
      horizontal_1: next[0] ?? null,
      horizontal_2: next[1] ?? null,
      horizontal_3: next[2] ?? null,
      cant_centrados_horizontal: next.length,
    });
  };
  const savePosV = (arr: number[]) => {
    const next = [...arr].sort((a, b) => a - b).slice(0, 5);
    upd({
      vertical_1: next[0] ?? null,
      vertical_2: next[1] ?? null,
      vertical_3: next[2] ?? null,
      vertical_4: next[3] ?? null,
      vertical_5: next[4] ?? null,
      cant_centrados_vertical: next.length,
    });
  };
  const addCruceH = (mm?: number) => {
    const val = mm ?? Math.round((detalle?.alto ?? 1000) / 2);
    if (val <= 0 || val >= (detalle?.alto ?? 9999)) return;
    savePosH([...posH, val]);
  };
  const addCruceV = (mm?: number) => {
    const val = mm ?? Math.round((detalle?.ancho ?? 1000) / 2);
    if (val <= 0 || val >= (detalle?.ancho ?? 9999)) return;
    savePosV([...posV, val]);
  };

  const handleCruceMode = (mode: number) => {
    if (mode === 0) {
      upd({
        tipo_cruce: 0,
        cant_centrados_horizontal: 0,
        cant_centrados_vertical: 0,
        horizontal_1: null,
        horizontal_2: null,
        horizontal_3: null,
        vertical_1: null,
        vertical_2: null,
        vertical_3: null,
        vertical_4: null,
        vertical_5: null,
      });
    } else if (mode === 1) {
      upd({
        tipo_cruce: 1,
        cant_centrados_horizontal: Math.max(
          1,
          detalle?.cant_centrados_horizontal ?? 0,
        ),
        cant_centrados_vertical: 0,
        horizontal_1: null,
        horizontal_2: null,
        horizontal_3: null,
        vertical_1: null,
        vertical_2: null,
        vertical_3: null,
        vertical_4: null,
        vertical_5: null,
      });
    } else if (mode === 2) {
      upd({ tipo_cruce: 2 });
    }
  };

  const FILA_FIELDS: Array<{
    interiorKey: keyof ObraDetalle;
    dvh1Key: keyof ObraDetalle;
    dvh2Key: keyof ObraDetalle;
    camaraKey: keyof ObraDetalle;
    revestKey: keyof ObraDetalle;
    direccKey: keyof ObraDetalle;
  }> = [
    {
      interiorKey: "interior_1",
      dvh1Key: "dvh_1_1",
      dvh2Key: "dvh_1_2",
      camaraKey: "camara_1",
      revestKey: "revest_1",
      direccKey: "direcc_1",
    },
    {
      interiorKey: "interior_2",
      dvh1Key: "dvh_2_1",
      dvh2Key: "dvh_2_2",
      camaraKey: "camara_2",
      revestKey: "revest_2",
      direccKey: "direcc_2",
    },
    {
      interiorKey: "interior_3",
      dvh1Key: "dvh_3_1",
      dvh2Key: "dvh_3_2",
      camaraKey: "camara_3",
      revestKey: "revest_3",
      direccKey: "direcc_3",
    },
    {
      interiorKey: "interior_4",
      dvh1Key: "dvh_4_1",
      dvh2Key: "dvh_4_2",
      camaraKey: "camara_4",
      revestKey: "revest_4",
      direccKey: "direcc_4",
    },
  ];

  const cantPanos =
    tipoCruce === 0
      ? 1
      : tipoCruce === 1
        ? Math.max(
            1,
            ((detalle?.cant_centrados_horizontal ?? 0) + 1) *
              ((detalle?.cant_centrados_vertical ?? 0) + 1),
          )
        : Math.max(1, (posH.length + 1) * (posV.length + 1));
  const panosCount = Math.min(cantPanos, 4);

  // ── Badges ──────────────────────────────────────────────────────────────────
  const tSel = tratamientos.find((t) => t.id === detalle?.color);
  const acabadoBadge = tSel?.descripcion ?? undefined;

  let cruceBadge = "Sin cruces";
  if (tipoCruce === 1) cruceBadge = "Centrados";
  if (tipoCruce === 2) {
    cruceBadge = `Variables (${(posV.length + 1) * (posH.length + 1)} paños)`;
  }

  // ── Mosquitero ──────────────────────────────────────────────────────────────
  const mosquiteroAdecuado =
    mosquiterosFiltrados.find((m) => m.id_hoja === detalle?.hoja) ||
    mosquiterosFiltrados.find((m) => m.predeterminado) ||
    mosquiterosFiltrados[0];

  if (!detalle || loadingTratamientos || loadingVidrios || loadingPerfiles) {
    return <TipologiaConfigPanelSkeleton />;
  }

  const ancho = detalle.ancho ?? 0;
  const alto = detalle.alto ?? 0;

  return (
    <div className="h-full flex flex-col bg-white dark:bg-zinc-950  border-zinc-200/80 dark:border-zinc-800/80 select-none">
      {/* Encabezado */}
      <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <LayoutGrid className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
              Componentes
            </h3>
            <p className="text-[10px] text-zinc-400 font-medium font-mono">
              {ancho} × {alto} mm
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
        {/* ══════════ ACABADO ══════════ */}
        <div className="rounded-xl border border-zinc-200/60 dark:border-zinc-700/40 overflow-hidden">
          <SectionHeader
            icon={Palette}
            label="Acabado y Terminación"
            isOpen={openSections.acabado}
            isComplete={!!detalle.color}
            badge={acabadoBadge}
            onClick={() => toggleSection("acabado")}
          />
          {openSections.acabado && (
            <div className="px-3 pb-3 pt-2 space-y-2.5 border-t border-zinc-100 dark:border-zinc-800/60">
              <RowSelect
                label="Tratamiento / Color"
                items={tratamientos}
                selectedKey={detalle.color}
                onKeyChange={(k) => upd({ color: k })}
                placeholder="Seleccione un acabado..."
              />
              <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/40 px-2.5 py-1.5 rounded-lg border border-zinc-100 dark:border-zinc-800/40">
                <div className="flex items-center gap-2">
                  <Waves className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
                    Mosquitero Incorporado
                  </span>
                </div>
                <Switch
                  size="sm"
                  color="warning"
                  isSelected={
                    typeof detalle.mosquitero === "number" &&
                    detalle.mosquitero > 0
                  }
                  onValueChange={(v: boolean) =>
                    upd({
                      mosquitero: v ? (mosquiteroAdecuado?.id ?? null) : null,
                    })
                  }
                />
              </div>
            </div>
          )}
        </div>

        {/* ══════════ ESTRUCTURA E INTERIOR ══════════ */}
        <div className="rounded-xl border border-zinc-200/60 dark:border-zinc-700/40 overflow-hidden">
          <SectionHeader
            icon={Layers}
            label="Especificaciones Estructura"
            isOpen={openSections.estructura}
            isComplete={!!detalle.interior}
            badge={undefined}
            onClick={() => toggleSection("estructura")}
          />
          {openSections.estructura && (
            <div className="px-3 pb-3 pt-2 space-y-2.5 border-t border-zinc-100 dark:border-zinc-800/60">
              {/* Interior / Acoplado */}
              <RowSelect
                label="Componente Interior / Acoplado"
                items={interiores}
                selectedKey={detalle.interior}
                onKeyChange={(k) =>
                  upd({
                    interior: k,
                    contravidrios: null,
                    contravidrios_ext: null,
                  })
                }
                placeholder="Seleccione interior..."
              />

              {/* Contravidrios y VR — solo si hay interior seleccionado */}
              {idInterior && (
                <>
                  {contravidrios.length > 0 && (
                    <RowSelect
                      label="Contravidrio Interior"
                      items={contravidrios}
                      selectedKey={detalle.contravidrios}
                      onKeyChange={(k) => upd({ contravidrios: k })}
                      placeholder="Automático por interior..."
                    />
                  )}
                  {contravidriosExt.length > 0 && (
                    <RowSelect
                      label="Contravidrio Exterior"
                      items={contravidriosExt}
                      selectedKey={detalle.contravidrios_ext}
                      onKeyChange={(k) => upd({ contravidrios_ext: k })}
                      placeholder="Automático por interior..."
                    />
                  )}
                  {vidriosRepartidos.length > 0 && (
                    <RowSelect
                      label="Vidrio Repartido (VR)"
                      items={vidriosRepartidos}
                      selectedKey={detalle.vr_1}
                      onKeyChange={(k) => upd({ vr_1: k })}
                      placeholder="Sin vidrio repartido..."
                    />
                  )}
                </>
              )}

              {/* ── MATERIAL DE RELLENO ── */}
              <div className="pt-1 border-t border-zinc-100 dark:border-zinc-800/60 space-y-2">
                {/* Sin cruces: un solo editor */}
                {tipoCruce === 0 && (
                  <InteriorFilaEditor
                    label="Material de relleno"
                    modoRelleno={modoRelleno}
                    onModoChange={cambiarModo}
                    interiorKey="interior_1"
                    dvh1Key="dvh_1_1"
                    dvh2Key="dvh_1_2"
                    camaraKey="camara_1"
                    revestKey="revest_1"
                    direccKey="direcc_1"
                    detalle={detalle}
                    vidrios={vidrosCrudos}
                    perfiles={perfiles}
                    upd={upd}
                  />
                )}

                {/* Con cruces: toggle igual/por paño */}
                {tipoCruce > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide">
                        Material de relleno
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-zinc-400">
                          {interiorIgualParaTodos
                            ? "Igual para todos"
                            : "Por paño"}
                        </span>
                        <Switch
                          size="sm"
                          isSelected={!interiorIgualParaTodos}
                          onValueChange={(v: boolean) =>
                            setInteriorIgualParaTodos(!v)
                          }
                          classNames={{
                            wrapper:
                              "bg-zinc-200 dark:bg-zinc-700 group-data-[selected=true]:bg-amber-500",
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <LayoutGrid className="w-3 h-3 text-zinc-400" />
                      <span className="text-[10px] text-zinc-400 font-mono">
                        {panosCount} paño{panosCount !== 1 ? "s" : ""}
                        {tipoCruce === 1
                          ? ` · ${(detalle.cant_centrados_vertical ?? 0) + 1} col × ${(detalle.cant_centrados_horizontal ?? 0) + 1} fil`
                          : ` · ${posV.length + 1} col × ${posH.length + 1} fil`}
                      </span>
                    </div>

                    {interiorIgualParaTodos ? (
                      <InteriorFilaEditor
                        label="Todos los paños"
                        modoRelleno={modoRelleno}
                        onModoChange={cambiarModo}
                        interiorKey="interior_1"
                        dvh1Key="dvh_1_1"
                        dvh2Key="dvh_1_2"
                        camaraKey="camara_1"
                        revestKey="revest_1"
                        direccKey="direcc_1"
                        detalle={detalle}
                        vidrios={vidrosCrudos}
                        perfiles={perfiles}
                        upd={(patch) => {
                          // Replica el valor en todos los paños
                          const multi: Partial<ObraDetalle> = {};
                          FILA_FIELDS.slice(0, panosCount).forEach((f) => {
                            if ("interior_1" in patch)
                              (multi as any)[f.interiorKey] = (
                                patch as any
                              ).interior_1;
                            if ("dvh_1_1" in patch)
                              (multi as any)[f.dvh1Key] = (
                                patch as any
                              ).dvh_1_1;
                            if ("dvh_1_2" in patch)
                              (multi as any)[f.dvh2Key] = (
                                patch as any
                              ).dvh_1_2;
                            if ("camara_1" in patch)
                              (multi as any)[f.camaraKey] = (
                                patch as any
                              ).camara_1;
                            if ("revest_1" in patch)
                              (multi as any)[f.revestKey] = (
                                patch as any
                              ).revest_1;
                            if ("direcc_1" in patch)
                              (multi as any)[f.direccKey] = (
                                patch as any
                              ).direcc_1;
                          });
                          upd(multi);
                        }}
                      />
                    ) : (
                      <div className="space-y-2">
                        {Array.from({ length: panosCount }, (_, idx) => {
                          const f = FILA_FIELDS[idx];
                          return (
                            <InteriorFilaEditor
                              key={idx}
                              label={`Paño ${idx + 1}`}
                              modoRelleno={modoRellenoByFila[idx] ?? "simple"}
                              onModoChange={(modo) => setModoFilaAt(idx, modo)}
                              interiorKey={f.interiorKey}
                              dvh1Key={f.dvh1Key}
                              dvh2Key={f.dvh2Key}
                              camaraKey={f.camaraKey}
                              revestKey={f.revestKey}
                              direccKey={f.direccKey}
                              detalle={detalle}
                              vidrios={vidrosCrudos}
                              perfiles={perfiles}
                              upd={upd}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ══════════ CRUCES ══════════ */}
        <div className="rounded-xl border border-zinc-200/60 dark:border-zinc-700/40 overflow-hidden">
          <SectionHeader
            icon={Grid2X2}
            label="Cruces y Divisiones"
            isOpen={openSections.cruces}
            isComplete={tipoCruce > 0}
            badge={cruceBadge}
            onClick={() => toggleSection("cruces")}
          />
          {openSections.cruces && (
            <div className="px-3 pb-3 pt-2 space-y-3 border-t border-zinc-100 dark:border-zinc-800/60">
              <CruceModeSelector value={tipoCruce} onChange={handleCruceMode} />

              {/* CENTRADOS */}
              {tipoCruce === 1 && (
                <div className="space-y-2 pt-1">
                  <CentradosCounter
                    label="Horizontales"
                    value={detalle.cant_centrados_horizontal ?? 0}
                    max={3}
                    onChange={(v) => upd({ cant_centrados_horizontal: v })}
                  />
                  <CentradosCounter
                    label="Verticales"
                    value={detalle.cant_centrados_vertical ?? 0}
                    max={5}
                    onChange={(v) => upd({ cant_centrados_vertical: v })}
                  />
                </div>
              )}

              {/* VARIABLES */}
              {tipoCruce === 2 && (
                <div className="space-y-3 pt-1 animate-fadeIn">
                  {/* Horizontales */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                      Divisiones Horizontales (Máx. 3)
                    </label>
                    <div className="flex gap-1.5">
                      <Input
                        size="sm"
                        type="number"
                        placeholder={`Ej: ${Math.round(alto / 2)} mm`}
                        value={inputH}
                        onValueChange={setInputH}
                        className="flex-1"
                        classNames={{ input: "text-xs font-mono" }}
                      />
                      <Button
                        size="sm"
                        isIconOnly
                        color="warning"
                        variant="flat"
                        isDisabled={posH.length >= 3}
                        onPress={() => {
                          const num = parseInt(inputH);
                          addCruceH(isNaN(num) ? undefined : num);
                          setInputH("");
                        }}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {posH.length === 0 ? (
                        <span className="text-[10px] text-zinc-400 italic">
                          Ningún corte horizontal.
                        </span>
                      ) : (
                        posH.map((pos, idx) => (
                          <Chip
                            key={idx}
                            size="sm"
                            variant="flat"
                            color="warning"
                            className="font-mono text-[10px]"
                            onClose={() =>
                              savePosH(posH.filter((_, i) => i !== idx))
                            }
                          >
                            H: {pos}mm
                          </Chip>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Verticales */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                      Divisiones Verticales (Máx. 5)
                    </label>
                    <div className="flex gap-1.5">
                      <Input
                        size="sm"
                        type="number"
                        placeholder={`Ej: ${Math.round(ancho / 2)} mm`}
                        value={inputV}
                        onValueChange={setInputV}
                        className="flex-1"
                        classNames={{ input: "text-xs font-mono" }}
                      />
                      <Button
                        size="sm"
                        isIconOnly
                        color="warning"
                        variant="flat"
                        isDisabled={posV.length >= 5}
                        onPress={() => {
                          const num = parseInt(inputV);
                          addCruceV(isNaN(num) ? undefined : num);
                          setInputV("");
                        }}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {posV.length === 0 ? (
                        <span className="text-[10px] text-zinc-400 italic">
                          Ningún corte vertical.
                        </span>
                      ) : (
                        posV.map((pos, idx) => (
                          <Chip
                            key={idx}
                            size="sm"
                            variant="flat"
                            color="warning"
                            className="font-mono text-[10px]"
                            onClose={() =>
                              savePosV(posV.filter((_, i) => i !== idx))
                            }
                          >
                            V: {pos}mm
                          </Chip>
                        ))
                      )}
                    </div>
                  </div>

                  {(posH.length > 0 || posV.length > 0) && (
                    <div className="flex items-center gap-2 text-[10px] text-zinc-400 bg-zinc-50 dark:bg-zinc-900/40 rounded-lg px-2 py-1.5 border border-zinc-100 dark:border-zinc-800/40">
                      <LayoutGrid className="w-3 h-3 text-amber-500" />
                      <span className="font-mono">
                        Malla: {posV.length + 1} × {posH.length + 1} ={" "}
                        {(posV.length + 1) * (posH.length + 1)} paños fijos
                      </span>
                    </div>
                  )}
                </div>
              )}

              {tipoCruce === 0 && (
                <p className="text-[10px] text-zinc-400 italic text-center py-1">
                  Un solo paño entero sin divisiones transversales
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
