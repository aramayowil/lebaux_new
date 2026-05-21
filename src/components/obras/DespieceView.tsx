import { useState } from "react";
import { Tabs, Tab } from "@heroui/react";
import { AlertCircle } from "lucide-react";
import { useCatalogosStore } from "@/store/catalogosStore";
import { formatMm, formatPesos, formatKg } from "@/lib/calculoDespiece";
import type { ResultadoDespiece, NivelCorte } from "@/lib/motorDespiece";
import clsx from "clsx";

const NIVEL_COLOR: Record<NivelCorte, string> = {
  Marco: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  Hoja: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  "Contravid. Int.":
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  "Contravid. Ext.":
    "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  Cruces:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  Interior: "bg-steel-100 text-steel-600 dark:bg-steel-800 dark:text-steel-300",
};

const INT_TIPO_COLOR: Record<string, string> = {
  Vidrio: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  "CV Int.":
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  "CV Ext.":
    "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  VR: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
};

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
        "px-3 py-2 text-xs font-semibold text-steel-500 uppercase tracking-wide whitespace-nowrap",
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
}: {
  children: React.ReactNode;
  right?: boolean;
  mono?: boolean;
}) {
  return (
    <td
      className={clsx(
        "px-3 py-2 text-sm",
        right && "text-right",
        mono && "font-mono tabular-nums",
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
      ? "text-emerald-600"
      : pct >= 70
        ? "text-amber-500"
        : "text-red-500";
  return (
    <span className={clsx("font-mono font-semibold text-xs", color)}>
      {pct}%
    </span>
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
    <div className={clsx("flex justify-between items-center", large && "mt-1")}>
      <span
        className={clsx(
          "text-sm text-steel-600 dark:text-steel-300",
          bold && "font-semibold",
        )}
      >
        {label}
      </span>
      <span
        className={clsx(
          "tabular-nums font-mono",
          large
            ? "text-base font-bold text-steel-900 dark:text-steel-100"
            : "text-sm",
          bold && !large && "font-semibold",
        )}
      >
        {formatPesos(value)}
      </span>
    </div>
  );
}

// function CrucesInfo({ ctx }: { ctx: ResultadoDespiece["contexto"] }) {
//   const tienePos = (ctx.pos_h?.length ?? 0) > 0 || (ctx.pos_v?.length ?? 0) > 0;
//   if (!tienePos) {
//     if (ctx.crucesH === 0 && ctx.crucesV === 0) return null;
//     return (
//       <span className="text-xs text-purple-600 dark:text-purple-400">
//         {ctx.crucesH > 0 ? `${ctx.crucesH}H ` : ""}
//         {ctx.crucesV > 0 ? `${ctx.crucesV}V ` : ""}
//         centrados
//       </span>
//     );
//   }
//   return (
//     <span className="text-xs text-purple-600 dark:text-purple-400">
//       {(ctx.pos_v?.length ?? 0) > 0 &&
//         `V: ${(ctx.pos_v as number[]).join(", ")} mm `}
//       {(ctx.pos_h?.length ?? 0) > 0 &&
//         `H: ${(ctx.pos_h as number[]).join(", ")} mm`}
//     </span>
//   );
// }

function CrucesInfo({ ctx }: { ctx: ResultadoDespiece["contexto"] }) {
  // Consolidamos soporte tanto para camelCase como snake_case usando las propiedades explícitas
  const posH = ctx.posH ?? ctx.pos_h;
  const posV = ctx.posV ?? ctx.pos_v;

  const tienePos = (posH?.length ?? 0) > 0 || (posV?.length ?? 0) > 0;

  if (!tienePos) {
    if (ctx.cruces_h === 0 && ctx.cruces_v === 0) return null;
    return (
      <span className="text-xs text-purple-600 dark:text-purple-400">
        {ctx.cruces_h > 0 ? `${ctx.cruces_h}H ` : ""}
        {ctx.cruces_v > 0 ? `${ctx.cruces_v}V ` : ""}
        centrados
      </span>
    );
  }

  return (
    <span className="text-xs text-purple-600 dark:text-purple-400">
      {(posV?.length ?? 0) > 0 && `V: ${posV.join(", ")} mm `}
      {(posH?.length ?? 0) > 0 && `H: ${posH.join(", ")} mm`}
    </span>
  );
}

interface DespieceViewProps {
  resultado: ResultadoDespiece;
}

export default function DespieceView({ resultado }: DespieceViewProps) {
  const { opciones } = useCatalogosStore();
  const [tab, setTab] = useState<string>("resumen");

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
    <div className="flex flex-col gap-4">
      {/* Contexto */}
      <div className="bg-steel-50 dark:bg-steel-800/50 rounded-lg px-3 py-2 text-xs text-steel-500 flex flex-wrap gap-x-4 gap-y-1">
        <span>✕ {multiplicador}</span>
        <span>
          {contexto.ancho} × {contexto.alto} mm
        </span>
        <span>
          {contexto.hojas} hoja{contexto.hojas !== 1 ? "s" : ""}
        </span>
        <CrucesInfo ctx={contexto} />
      </div>
      <div className="bg-slate-50 dark:bg-steel-800/40 rounded-lg p-3 space-y-1">
        <div className="flex justify-between text-[11px]">
          <span className="text-steel-500">Superficie:</span>
          <span className="font-mono">
            {((contexto.ancho * contexto.alto) / 1_000_000).toFixed(2)} m²
          </span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-steel-500">Perímetro:</span>
          <span className="font-mono">
            {((contexto.ancho * 2 + contexto.alto * 2) / 1000).toFixed(2)} m
          </span>
        </div>
      </div>

      {/* Resumen de costos */}
      <div className="grid grid-cols-2 gap-2">
        {[
          {
            label: "Perfiles",
            value: subtotalPf,
            sub: `${formatKg(totalKg)} · ${totalTiras} tiras`,
          },
          {
            label: "Accesorios",
            value: subtotalAc,
            sub: `${accesorios.length} ítem${accesorios.length !== 1 ? "s" : ""}`,
          },
          {
            label: "Vidrios / Int.",
            value: subtotalVi,
            sub: `${interiores.length} panel${interiores.length !== 1 ? "es" : ""}`,
          },
        ].map(({ label, value, sub }) => (
          <div key={label} className="card-surface p-3 text-center">
            <p className="text-xs text-steel-500 mb-1">{label}</p>
            <p className="text-base font-bold tabular-nums">
              {formatPesos(value)}
            </p>
            <p className="text-xs text-steel-400 mt-0.5">{sub}</p>
          </div>
        ))}
        <div className="card-surface p-3 text-center border border-steel-300 dark:border-steel-600">
          <p className="text-xs text-steel-500 mb-1">TOTAL + IVA ({iva}%)</p>
          <p className="text-base font-bold tabular-nums">
            {formatPesos(totalIva)}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        selectedKey={tab}
        onSelectionChange={(k: any) => setTab(String(k))}
        size="sm"
        variant="underlined"
        classNames={{ tabList: "gap-4" }}
      >
        {/* ── Resumen ── */}
        <Tab key="resumen" title="Resumen" textValue="Resumen">
          <div className="space-y-4 pt-2">
            {/* Perfiles */}
            {resumenes.length > 0 && (
              <section>
                <p className="text-xs font-semibold text-steel-500 uppercase tracking-wide mb-2">
                  Perfiles
                </p>
                <div className="overflow-x-auto rounded-lg border border-steel-200 dark:border-steel-700">
                  <table className="w-full text-sm">
                    <thead className="bg-steel-50 dark:bg-steel-800">
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
                    <tbody className="divide-y divide-steel-100 dark:divide-steel-800">
                      {resumenes.map((r) => (
                        <tr
                          key={r.nro_perfil}
                          className="hover:bg-steel-50 dark:hover:bg-steel-800/50"
                        >
                          <Td>
                            <span className="font-mono text-xs text-steel-400 mr-1">
                              {r.nro_perfil}
                            </span>
                            <span className="text-steel-700 dark:text-steel-200">
                              {r.descripcion_perfil}
                            </span>
                          </Td>
                          <Td right mono>
                            {r.total_cortes}
                          </Td>
                          <Td right mono>
                            {r.total_mm.toLocaleString("es-AR")}
                          </Td>
                          <Td right mono>
                            {r.tiras}
                          </Td>
                          <Td right>
                            <EficienciaChip ef={r.eficiencia} />
                          </Td>
                          <Td right mono>
                            {formatKg(r.kg)}
                          </Td>
                          <Td right mono>
                            {formatPesos(r.precio_total)}
                          </Td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="border-t-2 border-steel-200 dark:border-steel-600 bg-steel-50 dark:bg-steel-800">
                      <tr>
                        <td
                          className="px-3 py-2 text-xs font-semibold text-steel-600"
                          colSpan={5}
                        >
                          Total perfiles
                        </td>
                        <Td right mono>
                          {formatKg(totalKg)}
                        </Td>
                        <Td right mono>
                          {formatPesos(costo_perfiles)}
                        </Td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </section>
            )}

            {/* Accesorios */}
            {accesorios.length > 0 && (
              <section>
                <p className="text-xs font-semibold text-steel-500 uppercase tracking-wide mb-2">
                  Accesorios
                </p>
                <div className="overflow-x-auto rounded-lg border border-steel-200 dark:border-steel-700">
                  <table className="w-full text-sm">
                    <thead className="bg-steel-50 dark:bg-steel-800">
                      <tr>
                        <Th>Parte</Th>
                        <Th>Nivel</Th>
                        <Th right>Cant.</Th>
                        <Th right>$/u</Th>
                        <Th right>Total</Th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-steel-100 dark:divide-steel-800">
                      {accesorios.map((a) => (
                        <tr
                          key={a.id}
                          className="hover:bg-steel-50 dark:hover:bg-steel-800/50"
                        >
                          <Td>
                            <span className="font-mono text-xs text-steel-400 mr-1">
                              {a.cod_parte}
                            </span>
                            {a.descripcion}
                          </Td>
                          <Td>
                            <span
                              className={clsx(
                                "text-xs px-1.5 py-0.5 rounded font-medium",
                                NIVEL_COLOR[a.nivel],
                              )}
                            >
                              {a.nivel}
                            </span>
                          </Td>
                          <Td right mono>
                            {a.cantidad} {a.unidad === 1 ? "m" : "u"}
                          </Td>
                          <Td right mono>
                            {formatPesos(a.precio_unit)}
                          </Td>
                          <Td right mono>
                            {formatPesos(a.precio_total)}
                          </Td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Interiores */}
            {interiores.length > 0 && (
              <section>
                <p className="text-xs font-semibold text-steel-500 uppercase tracking-wide mb-2">
                  Vidrios / Interiores
                </p>
                <div className="overflow-x-auto rounded-lg border border-steel-200 dark:border-steel-700">
                  <table className="w-full text-sm">
                    <thead className="bg-steel-50 dark:bg-steel-800">
                      <tr>
                        <Th>Tipo</Th>
                        <Th right>Cant.</Th>
                        <Th right>Ancho</Th>
                        <Th right>Alto</Th>
                        <Th right>m²</Th>
                        <Th right>Total</Th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-steel-100 dark:divide-steel-800">
                      {interiores.map((item, i) => (
                        <tr
                          key={i}
                          className="hover:bg-steel-50 dark:hover:bg-steel-800/50"
                        >
                          <Td>
                            <span
                              className={clsx(
                                "text-xs px-1.5 py-0.5 rounded font-medium",
                                INT_TIPO_COLOR[item.tipo] ?? "",
                              )}
                            >
                              {item.tipo}
                            </span>
                          </Td>
                          <Td right mono>
                            {item.cantidad}
                          </Td>
                          <Td right mono>
                            {formatMm(item.ancho)}
                          </Td>
                          <Td right mono>
                            {formatMm(item.alto)}
                          </Td>
                          <Td right mono>
                            {item.area.toFixed(3)}
                          </Td>
                          <Td right mono>
                            {formatPesos(item.precio)}
                          </Td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Totales */}
            <div className="rounded-lg border border-steel-200 dark:border-steel-700 p-3 space-y-1.5">
              <PriceLine label={`Perfiles (+${pctPf}%)`} value={subtotalPf} />
              <PriceLine label={`Accesorios (+${pctAc}%)`} value={subtotalAc} />
              <PriceLine label={`Vidrios (+${pctVi}%)`} value={subtotalVi} />
              <div className="border-t border-steel-200 dark:border-steel-700 pt-1.5">
                <PriceLine label="Subtotal" value={subtotal} bold />
              </div>
              <PriceLine label={`IVA ${iva}%`} value={subtotal * (iva / 100)} />
              <div className="border-t-2 border-steel-300 dark:border-steel-600 pt-1.5">
                <PriceLine label="TOTAL" value={totalIva} bold large />
              </div>
            </div>
          </div>
        </Tab>

        {/* ── Detalle ── */}
        <Tab
          key="detalle"
          title="Detalle de cortes"
          textValue="Detalle de cortes"
        >
          <div className="pt-2">
            {cortes.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-steel-400">
                <AlertCircle className="w-6 h-6" />
                <p className="text-sm">Sin cortes calculados</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-steel-200 dark:border-steel-700">
                <table className="w-full text-sm">
                  <thead className="bg-steel-50 dark:bg-steel-800">
                    <tr>
                      <Th>Nivel</Th>
                      <Th>Perfil</Th>
                      <Th right>Cant.</Th>
                      <Th right>Medida</Th>
                      <Th right>Total mm</Th>
                      <Th right>Ang.</Th>
                      <Th right>kg</Th>
                      <Th right>Precio</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-steel-100 dark:divide-steel-800">
                    {cortes.map((c) => (
                      <tr
                        key={c.id}
                        className="hover:bg-steel-50 dark:hover:bg-steel-800/50"
                      >
                        <Td>
                          <span
                            className={clsx(
                              "text-xs px-1.5 py-0.5 rounded font-medium",
                              NIVEL_COLOR[c.nivel],
                            )}
                          >
                            {c.nivel}
                          </span>
                        </Td>
                        <Td>
                          <span className="font-mono text-xs text-steel-400 mr-1">
                            {c.nro_perfil}
                          </span>
                          <span className="text-steel-600 dark:text-steel-300 text-xs">
                            {c.descripcion_perfil}
                          </span>
                        </Td>
                        <Td right mono>
                          {c.cantidad}
                        </Td>
                        <Td right mono>
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
