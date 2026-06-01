import { useState } from "react";
import { Tabs, Tab } from "@heroui/react";
import {
  AlertCircle,
  Layers,
  Wrench,
  SquareDashed,
  Receipt,
  Scissors,
  ListTree,
  Loader2,
} from "lucide-react";
import { useCatalogosStore } from "@/store/catalogosStore";
import { formatMm, formatPesos, formatKg } from "@/lib/calculoDespiece";
import type { ResultadoDespiece, NivelCorte } from "@/lib/motorDespiece";
import clsx from "clsx";
import { useOpciones } from "@/hooks/catalogo/useOpciones";

// Paleta de colores refinada estilo "Badge" industrial
const NIVEL_COLOR: Record<NivelCorte, string> = {
  Marco:
    "bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20",
  Hoja: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20",
  "Contravid. Int.":
    "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20",
  "Contravid. Ext.":
    "bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-500/20",
  Cruces:
    "bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20",
  Interior:
    "bg-zinc-500/10 text-zinc-700 dark:text-zinc-400 border border-zinc-500/20",
};

const INT_TIPO_COLOR: Record<string, string> = {
  Vidrio:
    "bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/20",
  "CV Int.":
    "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20",
  "CV Ext.":
    "bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-500/20",
  VR: "bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-500/20",
};

// Componentes auxiliares de Tabla optimizados
function Th({
  children,
  right,
}: {
  children: React.ReactNode;
  right?: boolean;
}) {
  return (
    <th
      className={clsx(
        "px-3 py-2.5 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest whitespace-nowrap bg-zinc-100/50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-700/80",
        right ? "text-right" : "text-left",
      )}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  right,
  mono,
  bold,
}: {
  children: React.ReactNode;
  right?: boolean;
  mono?: boolean;
  bold?: boolean;
}) {
  return (
    <td
      className={clsx(
        "px-3 py-2 text-xs text-zinc-700 dark:text-zinc-300 border-b border-zinc-100 dark:border-zinc-800/50",
        right && "text-right",
        mono && "font-mono tabular-nums tracking-tight",
        bold && "font-bold text-zinc-900 dark:text-zinc-100",
      )}
    >
      {children}
    </td>
  );
}

function EficienciaChip({ ef }: { ef: number }) {
  const pct = Math.round(ef * 100);
  const color =
    pct >= 85
      ? "text-emerald-600 dark:text-emerald-400"
      : pct >= 70
        ? "text-amber-600 dark:text-amber-400"
        : "text-red-500 dark:text-red-400";
  return (
    <span className={clsx("font-mono font-bold text-xs", color)}>{pct}%</span>
  );
}

function PriceLine({
  label,
  value,
  bold,
  large,
}: {
  label: string;
  value: number;
  bold?: boolean;
  large?: boolean;
}) {
  return (
    <div className={clsx("flex justify-between items-center", large && "mt-2")}>
      <span
        className={clsx(
          "text-xs text-zinc-500 dark:text-zinc-400",
          bold &&
            "font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider",
        )}
      >
        {label}
      </span>
      <span
        className={clsx(
          "tabular-nums font-mono",
          large
            ? "text-lg font-black text-amber-600 dark:text-amber-500"
            : "text-xs",
          bold && !large && "font-bold text-zinc-800 dark:text-zinc-200",
        )}
      >
        {formatPesos(value)}
      </span>
    </div>
  );
}

function CrucesInfo({ ctx }: { ctx: ResultadoDespiece["contexto"] }) {
  const posH = ctx.posH ?? ctx.pos_h;
  const posV = ctx.posV ?? ctx.pos_v;
  const tienePos = (posH?.length ?? 0) > 0 || (posV?.length ?? 0) > 0;

  if (!tienePos) {
    if (ctx.cruces_h === 0 && ctx.cruces_v === 0) return null;
    return (
      <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md">
        {ctx.cruces_h > 0 ? `${ctx.cruces_h}H ` : ""}
        {ctx.cruces_v > 0 ? `${ctx.cruces_v}V ` : ""} cnt.
      </span>
    );
  }

  return (
    <span className="text-xs font-mono text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md">
      {(posV?.length ?? 0) > 0 && `V:[${posV.join(",")}] `}
      {(posH?.length ?? 0) > 0 && `H:[${posH.join(",")}]`}
    </span>
  );
}

interface DespieceViewProps {
  resultado: ResultadoDespiece;
}

export default function DespieceView({ resultado }: DespieceViewProps) {
  const { data: opciones } = useOpciones();
  const [tab, setTab] = useState<string>("resumen");

  if (!opciones) {
    return (
      <div className="flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  const {
    costo_perfiles,
    costo_accesorios,
    costo_interiores,
    resumenes,
    cortes,
    accesorios,
    interiores,
    multiplicador,
    contexto,
  } = resultado;

  console.log(opciones);
  const {
    iva,
    porcentaje_sobre_perfiles: pctPf,
    porcentaje_sobre_accesorios: pctAc,
    porcentaje_sobre_vidrios: pctVi,
  } = opciones;

  const subtotalPf = costo_perfiles * (1 + pctPf / 100);
  const subtotalAc = costo_accesorios * (1 + pctAc / 100);
  const subtotalVi = costo_interiores * (1 + pctVi / 100);
  const subtotal = subtotalPf + subtotalAc + subtotalVi;
  const totalIva = subtotal * (1 + iva / 100);

  const totalTiras = resumenes.reduce((s, r) => s + r.tiras, 0);
  const totalKg = resumenes.reduce((s, r) => s + r.kg, 0);

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* ── Contexto de la Abertura ── */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 bg-zinc-100 dark:bg-zinc-900/60 rounded-xl p-3 flex flex-wrap items-center gap-x-3 gap-y-2 border border-zinc-200 dark:border-zinc-800">
          <span className="bg-amber-500 text-black font-black text-xs px-2 py-1 rounded-md">
            ✕ {multiplicador} UND
          </span>
          <span className="text-sm font-mono font-bold text-zinc-700 dark:text-zinc-200">
            {contexto.ancho} × {contexto.alto} mm
          </span>
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            {contexto.hojas} hoja{contexto.hojas !== 1 ? "s" : ""}
          </span>
          <CrucesInfo ctx={contexto} />
        </div>

        <div className="flex gap-4 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 shrink-0">
          <div className="flex flex-col justify-center">
            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
              Superficie
            </span>
            <span className="font-mono text-sm font-bold text-zinc-800 dark:text-zinc-200">
              {((contexto.ancho * contexto.alto) / 1_000_000).toFixed(2)} m²
            </span>
          </div>
          <div className="w-px bg-zinc-200 dark:bg-zinc-800" />
          <div className="flex flex-col justify-center">
            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
              Perímetro
            </span>
            <span className="font-mono text-sm font-bold text-zinc-800 dark:text-zinc-200">
              {((contexto.ancho * 2 + contexto.alto * 2) / 1000).toFixed(2)} m
            </span>
          </div>
        </div>
      </div>

      {/* ── Tarjetas de Costos (Grid Responsivo) ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            icon: Layers,
            label: "Perfiles",
            value: subtotalPf,
            sub: `${formatKg(totalKg)} · ${totalTiras} tiras`,
          },
          {
            icon: Wrench,
            label: "Accesorios",
            value: subtotalAc,
            sub: `${accesorios.length} ítem${accesorios.length !== 1 ? "s" : ""}`,
          },
          {
            icon: SquareDashed,
            label: "Vidrios / Int.",
            value: subtotalVi,
            sub: `${interiores.length} panel${interiores.length !== 1 ? "es" : ""}`,
          },
        ].map(({ icon: Icon, label, value, sub }) => (
          <div
            key={label}
            className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 flex flex-col justify-between shadow-sm"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                {label}
              </span>
              <Icon className="w-4 h-4 text-zinc-400" />
            </div>
            <div>
              <p className="text-lg font-black text-zinc-800 dark:text-zinc-100 tabular-nums">
                {formatPesos(value)}
              </p>
              <p className="text-[10px] font-mono text-zinc-500 mt-0.5">
                {sub}
              </p>
            </div>
          </div>
        ))}

        {/* Tarjeta de Total Destacada */}
        <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 rounded-xl p-3 flex flex-col justify-between shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 blur-2xl rounded-full pointer-events-none" />
          <div className="flex justify-between items-start mb-2 relative z-10">
            <span className="text-xs font-black text-amber-500 uppercase tracking-widest">
              TOTAL (+IVA)
            </span>
            <Receipt className="w-4 h-4 text-amber-500/50" />
          </div>
          <div className="relative z-10">
            <p className="text-xl font-black text-white tabular-nums">
              {formatPesos(totalIva)}
            </p>
          </div>
        </div>
      </div>

      {/* ── Pestañas de Detalle ── */}
      <Tabs
        selectedKey={tab}
        onSelectionChange={(k: any) => setTab(String(k))}
        size="md"
        variant="underlined"
        classNames={{
          tabList:
            "gap-6 w-full relative rounded-none p-0 border-b border-zinc-200 dark:border-zinc-800",
          cursor: "w-full bg-amber-500",
          tab: "max-w-fit px-0 h-10",
        }}
      >
        <Tab
          key="resumen"
          title={
            <div className="flex items-center gap-2">
              <ListTree className="w-4 h-4" />{" "}
              <span className="font-semibold text-xs uppercase tracking-wider">
                Resumen de Materiales
              </span>
            </div>
          }
        >
          <div className="space-y-6 pt-4 animate-in fade-in duration-300">
            {/* Tabla: Perfiles */}
            {resumenes.length > 0 && (
              <section className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-950">
                <div className="bg-zinc-100/50 dark:bg-zinc-900/50 px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                  <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-widest">
                    Resumen de Perfiles
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        <Th>Perfil</Th>
                        <Th right>Cortes</Th>
                        <Th right>Total mm</Th>
                        <Th right>Tiras</Th>
                        <Th right>Efic.</Th>
                        <Th right>kg</Th>
                        <Th right>Total</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {resumenes.map((r) => (
                        <tr
                          key={r.nro_perfil}
                          className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors"
                        >
                          <Td>
                            <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-500 mr-2">
                              {r.nro_perfil}
                            </span>
                            <span className="text-zinc-600 dark:text-zinc-400">
                              {r.descripcion_perfil}
                            </span>
                          </Td>
                          <Td right mono>
                            {r.total_cortes}
                          </Td>
                          <Td right mono>
                            {r.total_mm.toLocaleString("es-AR")}
                          </Td>
                          <Td right mono bold>
                            {r.tiras}
                          </Td>
                          <Td right>
                            <EficienciaChip ef={r.eficiencia} />
                          </Td>
                          <Td right mono>
                            {formatKg(r.kg)}
                          </Td>
                          <Td right mono bold>
                            {formatPesos(r.precio_total)}
                          </Td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-zinc-50 dark:bg-zinc-900/20">
                      <tr>
                        <td
                          className="px-3 py-2 text-xs font-bold text-zinc-500 uppercase text-right"
                          colSpan={5}
                        >
                          Total Perfiles:
                        </td>
                        <Td right mono bold>
                          {formatKg(totalKg)}
                        </Td>
                        <Td right mono bold>
                          {formatPesos(costo_perfiles)}
                        </Td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </section>
            )}

            {/* Tablas lado a lado en pantallas grandes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Tabla: Accesorios */}
              {accesorios.length > 0 && (
                <section className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-950 flex flex-col">
                  <div className="bg-zinc-100/50 dark:bg-zinc-900/50 px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-800">
                    <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-widest">
                      Accesorios Requeridos
                    </span>
                  </div>
                  <div className="overflow-x-auto flex-1">
                    <table className="w-full text-sm">
                      <thead>
                        <tr>
                          <Th>Ítem / Parte</Th>
                          <Th>Nivel</Th>
                          <Th right>Cant.</Th>
                          <Th right>Total</Th>
                        </tr>
                      </thead>
                      <tbody>
                        {accesorios.map((a) => (
                          <tr
                            key={a.id}
                            className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors"
                          >
                            <Td>
                              <div className="flex flex-col">
                                <span className="font-mono text-[10px] text-amber-600 dark:text-amber-500">
                                  {a.cod_parte}
                                </span>
                                <span
                                  className="text-zinc-600 dark:text-zinc-300 text-xs truncate max-w-[150px]"
                                  title={a.descripcion}
                                >
                                  {a.descripcion}
                                </span>
                              </div>
                            </Td>
                            <Td>
                              <span
                                className={clsx(
                                  "text-[10px] px-1.5 py-0.5 rounded-md font-bold",
                                  NIVEL_COLOR[a.nivel],
                                )}
                              >
                                {a.nivel}
                              </span>
                            </Td>
                            <Td right mono>
                              {a.cantidad} {a.unidad === 1 ? "m" : "u"}
                            </Td>
                            <Td right mono bold>
                              {formatPesos(a.precio_total)}
                            </Td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {/* Tabla: Vidrios */}
              {interiores.length > 0 && (
                <section className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-950 flex flex-col">
                  <div className="bg-zinc-100/50 dark:bg-zinc-900/50 px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-800">
                    <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-widest">
                      Vidrios / Paneles
                    </span>
                  </div>
                  <div className="overflow-x-auto flex-1">
                    <table className="w-full text-sm">
                      <thead>
                        <tr>
                          <Th>Tipo</Th>
                          <Th right>Medidas (mm)</Th>
                          <Th right>Unid.</Th>
                          <Th right>m² Total</Th>
                          <Th right>Total</Th>
                        </tr>
                      </thead>
                      <tbody>
                        {interiores.map((item, i) => (
                          <tr
                            key={i}
                            className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors"
                          >
                            <Td>
                              <span
                                className={clsx(
                                  "text-[10px] px-1.5 py-0.5 rounded-md font-bold",
                                  INT_TIPO_COLOR[item.tipo] ?? "",
                                )}
                              >
                                {item.tipo}
                              </span>
                            </Td>
                            <Td right mono>
                              {formatMm(item.ancho)} × {formatMm(item.alto)}
                            </Td>
                            <Td right mono>
                              {item.cantidad}
                            </Td>
                            <Td right mono>
                              {item.area.toFixed(3)}
                            </Td>
                            <Td right mono bold>
                              {formatPesos(item.precio)}
                            </Td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}
            </div>

            {/* Resumen Final de Presupuesto */}
            <div className="flex justify-end pt-4">
              <div className="w-full md:w-1/2 lg:w-1/3 bg-zinc-50 dark:bg-zinc-900/30 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-2">
                <PriceLine
                  label={`Perfiles (MRG +${pctPf}%)`}
                  value={subtotalPf}
                />
                <PriceLine
                  label={`Accesorios (MRG +${pctAc}%)`}
                  value={subtotalAc}
                />
                <PriceLine
                  label={`Vidrios (MRG +${pctVi}%)`}
                  value={subtotalVi}
                />
                <div className="border-t border-zinc-200 dark:border-zinc-700/60 pt-2 pb-1">
                  <PriceLine label="Subtotal Neto" value={subtotal} bold />
                </div>
                <PriceLine
                  label={`Impuestos (IVA ${iva}%)`}
                  value={subtotal * (iva / 100)}
                />
                <div className="border-t-2 border-zinc-300 dark:border-zinc-700 pt-2">
                  <PriceLine label="Costo Final" value={totalIva} bold large />
                </div>
              </div>
            </div>
          </div>
        </Tab>

        {/* ── Detalle de Cortes ── */}
        <Tab
          key="detalle"
          title={
            <div className="flex items-center gap-2">
              <Scissors className="w-4 h-4" />{" "}
              <span className="font-semibold text-xs uppercase tracking-wider">
                Planilla de Cortes
              </span>
            </div>
          }
        >
          <div className="pt-4 animate-in fade-in duration-300">
            {cortes.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/10">
                <AlertCircle className="w-8 h-8 text-zinc-400" />
                <p className="text-sm font-medium text-zinc-500">
                  No se registraron perfiles para cortar en esta abertura.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <Th>Nivel / Ubicación</Th>
                      <Th>Perfil Base</Th>
                      <Th right>Cant.</Th>
                      <Th right>Corte (mm)</Th>
                      <Th right>Total mm</Th>
                      <Th right>Áng.</Th>
                      <Th right>kg</Th>
                      <Th right>Costo</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {cortes.map((c) => (
                      <tr
                        key={c.id}
                        className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors border-b border-zinc-100 dark:border-zinc-800/50 last:border-0"
                      >
                        <Td>
                          <span
                            className={clsx(
                              "text-[10px] px-1.5 py-0.5 rounded-md font-bold",
                              NIVEL_COLOR[c.nivel],
                            )}
                          >
                            {c.nivel}
                          </span>
                        </Td>
                        <Td>
                          <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-500 mr-2">
                            {c.nro_perfil}
                          </span>
                          <span className="text-zinc-600 dark:text-zinc-400 text-xs">
                            {c.descripcion_perfil}
                          </span>
                        </Td>
                        <Td right mono bold>
                          {c.cantidad}
                        </Td>
                        <Td
                          right
                          mono
                          bold
                          // className="text-amber-600 dark:text-amber-400 text-sm bg-amber-50 dark:bg-amber-500/5"
                        >
                          {formatMm(c.medida_mm)}
                        </Td>
                        <Td right mono>
                          {c.total_mm.toLocaleString("es-AR")}
                        </Td>
                        <Td right mono>
                          {c.angulo || "—"}
                        </Td>
                        <Td right mono>
                          {formatKg(c.kg)}
                        </Td>
                        <Td right mono>
                          {formatPesos(c.precio_total)}
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}
