import { ObraDetalle, Perfil, Vidrio } from "@/types";
import ModoRellenoTabs from "../ui/ModoRellenoTabs";
import { Select } from "@heroui/react";
import { SelectItem } from "@heroui/react";
import { ArrowLeftRight, ArrowUpDown } from "lucide-react";
import clsx from "clsx";

const SEL = {
  trigger:
    "h-8 min-h-8 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-700/60 rounded-lg text-xs",
  value: "text-xs text-zinc-700 dark:text-zinc-300 font-medium",
};
type ModoRelleno = "simple" | "dvh" | "revestimiento";

const OPCIONES_CAMARA = ["6", "9", "12", "15", "18"];

// ── Subcomponente de Edición de Filas ────────────────────────────────────────
export default function InteriorFilaEditor({
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

      {modoRelleno === "simple" && (
        <Select
          size="sm"
          aria-label={`Material ${label}`}
          placeholder="Sin asignar"
          selectedKeys={(() => {
            const val = detalle?.[interiorKey];
            if (val == null) return new Set<string>();
            return vidrios.some((v) => String(v.id) === String(val))
              ? new Set([String(val)])
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
                selectedKeys={(() => {
                  const val = detalle?.[key];
                  if (val == null) return new Set<string>();
                  return vidrios.some((v) => String(v.id) === String(val))
                    ? new Set([String(val)])
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
              selectedKeys={(() => {
                const val = detalle?.[camaraKey];
                if (val == null) return new Set<string>();
                return OPCIONES_CAMARA.includes(String(val))
                  ? new Set([String(val)])
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

      {modoRelleno === "revestimiento" && (
        <div className="flex flex-col gap-2">
          <Select
            size="sm"
            aria-label="Perfil de revestimiento"
            placeholder="Seleccionar perfil..."
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
                    ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                    : "bg-white dark:bg-zinc-900/60 text-zinc-400 border-zinc-200/80 hover:text-zinc-600",
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
